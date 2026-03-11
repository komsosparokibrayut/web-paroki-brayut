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
  placeId: z.string().min(1, "Place is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  userName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  userContact: z.string().min(5, "Contact must be at least 5 characters").max(100, "Contact too long"),
  purpose: z.string().min(3, "Purpose must be at least 3 characters").max(500, "Purpose too long"),
  isAdminDirectCreate: z.boolean().optional(),
}).refine(data => data.endTime > data.startTime, {
  message: "End time must be after start time",
});

export async function submitBooking(
  booking: Omit<MeetingBooking, "id" | "status" | "createdAt" | "updatedAt"> & { isAdminDirectCreate?: boolean }
): Promise<ActionResult<string>> {
  try {
    // Server-side input validation
    const parsed = bookingSchema.safeParse(booking);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid input" };
    }

    // Validate date is not in the past
    const today = new Date().toISOString().split('T')[0];
    if (parsed.data.date < today) {
      return { success: false, error: "Cannot book a date in the past" };
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

    let targetStatus = "pending";
    if (parsed.data.isAdminDirectCreate) {
      const currentUser = await getCurrentUser();
      if (currentUser && hasPermission(currentUser.role, "manage_data")) {
        targetStatus = "confirmed";
      }
    }

    const { isAdminDirectCreate, ...bookingDataToSave } = parsed.data as any;

    const now = Date.now();
    const docRef = await adminDb.collection(COLLECTION).add({
      ...bookingDataToSave,
      status: targetStatus,
      createdAt: now,
      updatedAt: now,
    });
    
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
 * Update the status of a booking (approve/reject).
 * Requires admin privileges.
 */
export async function updateBookingStatus(id: string, status: "confirmed" | "rejected"): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Unauthorized" };
    }

    await adminDb.collection(COLLECTION).doc(id).update({
      status,
      updatedAt: Date.now()
    });

    revalidatePath("/admin/meeting-rooms");
    revalidatePath("/meeting-room");
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
      return { success: false, error: "Unauthorized" };
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
      return { success: false, error: "Unauthorized" };
    }

    // Server-side input validation
    const parsed = bookingSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Invalid input" };
    }

    const { isAdminDirectCreate, ...bookingDataToSave } = parsed.data as any;

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
