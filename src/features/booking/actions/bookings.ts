"use server";

import { adminDb } from "@/lib/firebase/server";
import { getCurrentUser } from "@/lib/firebase/auth";
import { hasPermission } from "@/lib/roles";
import { MeetingBooking } from "../types";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

const COLLECTION = "meeting_bookings";

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error?: string };

const bookingSchema = z.object({
  type: z.enum(['room', 'inventory', 'both']),
  placeId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu tidak valid"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu tidak valid"),
  userName: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama terlalu panjang"),
  userContact: z.string().min(5, "Kontak minimal 5 karakter").max(100, "Kontak terlalu panjang"),
  purpose: z.string().min(3, "Keperluan minimal 3 karakter").max(500, "Keperluan terlalu panjang"),
  isAdminDirectCreate: z.boolean().optional(),
  submissionSource: z.enum(['online', 'manual']).optional(),
  
  // New Tracking fields
  borrowedItems: z.array(z.object({ itemId: z.string(), quantity: z.number(), name: z.string() })).optional(),
  location: z.string().optional(),
  inventoryDateTake: z.string().optional(),
  returnDate: z.string().optional(),
}).refine(data => data.endTime > data.startTime, {
  message: "Waktu selesai harus setelah waktu mulai",
});

export async function submitBooking(
  booking: Omit<MeetingBooking, "id" | "status" | "createdAt" | "updatedAt"> & { isAdminDirectCreate?: boolean }
): Promise<ActionResult<string>> {
  try {
    // Server-side input validation
    const parsed = bookingSchema.safeParse(booking);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Input tidak valid" };
    }

    // Validate date is not in the past
    const today = new Date().toISOString().split('T')[0];
    if (parsed.data.date < today && !parsed.data.isAdminDirectCreate) {
      return { success: false, error: "Tidak dapat memesan tanggal di masa lalu" };
    }

    // Rate limiting for public users (not admin direct creation)
    if (!parsed.data.isAdminDirectCreate) {
      const headersList = await headers();
      const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown_ip";
      
      if (ip !== "unknown_ip") {
        const safeIp = ip.split(',')[0].trim().replace(/\//g, '_');
        const rateLimitRef = adminDb.collection("booking_rate_limits").doc(safeIp);
        const rlDoc = await rateLimitRef.get();
        const nowMs = Date.now();
        const WINDOW_MS = 60 * 60 * 1000; // 1 hour
        const MAX_PER_WINDOW = 5; 
        
        if (rlDoc.exists) {
          const data = rlDoc.data()!;
          if (nowMs < data.resetAt) {
            if (data.count >= MAX_PER_WINDOW) {
              return { success: false, error: "Terlalu banyak permohonan (Maks 5 per jam). Silakan coba lagi nanti." };
            }
            await rateLimitRef.update({ count: data.count + 1 });
          } else {
            await rateLimitRef.set({ count: 1, resetAt: nowMs + WINDOW_MS });
          }
        } else {
          await rateLimitRef.set({ count: 1, resetAt: nowMs + WINDOW_MS });
        }
      }
    }

    // Check for overlap ONLY with confirmed bookings
    if (parsed.data.type === 'room' || parsed.data.type === 'both') {
        const overlaps = await adminDb.collection(COLLECTION)
          .where("placeId", "==", parsed.data.placeId)
          .where("status", "==", "confirmed")
          .get();
          
        const hasOverlap = overlaps.docs.some(doc => {
          const b = doc.data() as MeetingBooking;
          if (b.date !== parsed.data.date) return false;
          return parsed.data.startTime < b.endTime && parsed.data.endTime > b.startTime;
        });

        if (hasOverlap) {
          return { success: false, error: "Jadwal sudah disetujui untuk peminjaman lain (waktu sudah terpakai)." };
        }
    }

    let targetStatus = "pending";
    if (parsed.data.isAdminDirectCreate) {
      const currentUser = await getCurrentUser();
      if (currentUser && hasPermission(currentUser.role, "manage_data")) {
        targetStatus = "confirmed";
      }
    }

    const { isAdminDirectCreate, submissionSource, ...bookingDataToSave } = parsed.data as any;
    
    // Assign Submission Source
    bookingDataToSave.submissionSource = submissionSource || (isAdminDirectCreate ? 'manual' : 'online');

    const now = Date.now();
    const docRef = await adminDb.collection(COLLECTION).add({
      ...bookingDataToSave,
      status: targetStatus,
      createdAt: now,
      updatedAt: now,
    });
    
    // If admin bypasses directly to confirmed, trigger auto-reject for other pending ones
    if (targetStatus === "confirmed" && bookingDataToSave.placeId) {
         await autoRejectOverlappingPending(
             bookingDataToSave.placeId, 
             bookingDataToSave.date, 
             bookingDataToSave.startTime, 
             bookingDataToSave.endTime, 
             docRef.id
         );
    }
    
    revalidatePath("/meeting-room");
    revalidatePath("/admin/meeting-rooms");
    return { success: true, data: docRef.id };
  } catch (error: any) {
    console.error("Error submitting booking:", error);
    return { success: false, error: error.message };
  }
}

export async function getBookings(): Promise<MeetingBooking[]> {
  try {
    const snapshot = await adminDb.collection(COLLECTION).get();
      
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MeetingBooking));
    
    // Sort by date DESC, then startTime ASC
    return bookings.sort((a, b) => {
      if (a.date !== b.date) {
         return b.date.localeCompare(a.date);
      }
      return a.startTime.localeCompare(b.startTime);
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

/**
 * Automatically reject any overlapping pending room bookings
 */
async function autoRejectOverlappingPending(placeId: string, date: string, startTime: string, endTime: string, currentBookingId: string) {
    const overlaps = await adminDb.collection(COLLECTION)
      .where("placeId", "==", placeId)
      .where("status", "==", "pending")
      .get();
      
    const batch = adminDb.batch();
    let hasUpdates = false;
    
    overlaps.docs.forEach(doc => {
      if (doc.id === currentBookingId) return;
      const b = doc.data() as MeetingBooking;
      
      if (b.date === date && startTime < b.endTime && endTime > b.startTime) {
        // Only reject if it's a room/both booking, inventory-only don't conflict on room usage
        if (b.type === 'room' || b.type === 'both') {
            batch.update(doc.ref, { 
                status: 'rejected',
                adminNotes: 'Otomatis ditolak karena jadwal ruangan sudah terpakai',
                updatedAt: Date.now()
            });
            hasUpdates = true;
        }
      }
    });

    if (hasUpdates) {
        await batch.commit();
    }
}

/**
 * Update the status of a booking (approve/reject).
 * Requires admin privileges.
 */export async function updateBookingStatus(id: string, status: "confirmed" | "rejected"): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Tidak memiliki otorisasi" };
    }

    await adminDb.collection(COLLECTION).doc(id).update({
      status,
      updatedAt: Date.now()
    });
    
    if (status === "confirmed") {
        const bookingDoc = await adminDb.collection(COLLECTION).doc(id).get();
        if (bookingDoc.exists) {
            const b = bookingDoc.data() as MeetingBooking;
            if (b.placeId && (b.type === 'room' || b.type === 'both')) {
                await autoRejectOverlappingPending(b.placeId, b.date, b.startTime, b.endTime, id);
            }
        }
    }

    revalidatePath("/admin/meeting-rooms");    revalidatePath("/meeting-room");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating booking status:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteBooking(id: string): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Tidak memiliki otorisasi" };
    }

    await adminDb.collection(COLLECTION).doc(id).delete();
    
    revalidatePath("/admin/meeting-rooms");
    revalidatePath("/meeting-room");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting booking:", error);
    return { success: false, error: error.message };
  }
}

export async function updateBooking(
  id: string,
  data: Omit<MeetingBooking, "id" | "status" | "createdAt" | "updatedAt">
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Tidak memiliki otorisasi" };
    }

    // Server-side input validation
    const parsed = bookingSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Input tidak valid" };
    }

    // Check for overlap ONLY with confirmed bookings, excluding this current booking
    if (parsed.data.type === 'room' || parsed.data.type === 'both') {
        const overlaps = await adminDb.collection(COLLECTION)
          .where("placeId", "==", parsed.data.placeId)
          .where("status", "==", "confirmed")
          .get();
          
        const hasOverlap = overlaps.docs.some(doc => {
          if (doc.id === id) return false; // Ignore current booking
          const b = doc.data() as MeetingBooking;
          if (b.date !== parsed.data.date) return false;
          return parsed.data.startTime < b.endTime && parsed.data.endTime > b.startTime;
        });

        if (hasOverlap) {
          return { success: false, error: "Jadwal sudah disetujui untuk peminjaman lain (waktu sudah terpakai)." };
        }
    }

    const { isAdminDirectCreate, submissionSource, ...bookingDataToSave } = parsed.data as any;
    
    // Tag as rescheduled
    bookingDataToSave.isRescheduled = true;
    if (submissionSource) {
      bookingDataToSave.submissionSource = submissionSource;
    }
    await adminDb.collection(COLLECTION).doc(id).update({
      ...bookingDataToSave,
      updatedAt: Date.now()
    });

    revalidatePath("/admin/meeting-rooms");
    revalidatePath("/meeting-room");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return { success: false, error: error.message };
  }
}
