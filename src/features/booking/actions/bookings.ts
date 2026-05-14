"use server";

import { adminDb } from "@/lib/firebase/server";
import { getCurrentUser } from "@/lib/firebase/auth";
import { hasPermission, canManageBooking } from "@/lib/roles";
import { MeetingBooking, DateWithTime } from "../types";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";

const COLLECTION = "meeting_bookings";

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error?: string };

const bookingSchema = z.object({
  type: z.enum(['room', 'inventory', 'both']),
  placeId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu tidak valid").optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu tidak valid").optional(),
  userName: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama terlalu panjang"),
  userContact: z.string().min(5, "Kontak minimal 5 karakter").max(100, "Kontak terlalu panjang"),
  purpose: z.string().min(3, "Keperluan minimal 3 karakter").max(500, "Keperluan terlalu panjang"),
  isAdminDirectCreate: z.boolean().optional(),
  submissionSource: z.enum(['online', 'manual']).optional(),

  // New Tracking fields - Updated to support per-item times
  borrowedItems: z.array(z.object({
    itemId: z.string(),
    quantity: z.number(),
    name: z.string(),
    dateTake: z.string().optional(),
    timeTake: z.string().optional(),
    dateReturn: z.string().optional(),
    timeReturn: z.string().optional(),
  })).optional(),
  location: z.string().optional(),
  inventoryDateTake: z.string().optional(),
  returnDate: z.string().optional(),
  // Multi-date with per-date time ranges
  multiDatesDetails: z.array(z.object({
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  })).optional(),
}).refine(data => {
    // Only validate time for room/both types
    if (data.type === 'inventory') return true;
    // Only validate single date bookings (multiDatesDetails has its own validation per date)
    if (data.multiDatesDetails && data.multiDatesDetails.length > 0) return true;
    // Compare times as minutes from midnight for proper chronological comparison
    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    return toMinutes(data.endTime || "00:00") > toMinutes(data.startTime || "00:00");
  }, {
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

    // Handle multiDatesDetails - create separate bookings for each date
    if (parsed.data.multiDatesDetails && parsed.data.multiDatesDetails.length > 0) {
      const { isAdminDirectCreate, submissionSource, multiDatesDetails, ...baseData } = parsed.data as any;

      // Check for overlaps against confirmed bookings (only for room bookings)
      if (baseData.type === 'room' || baseData.type === 'both') {
        for (const dateDetail of multiDatesDetails) {
          const overlaps = await adminDb.collection(COLLECTION)
            .where("placeId", "==", baseData.placeId)
            .where("status", "==", "confirmed")
            .get();
          
          const hasOverlap = overlaps.docs.some((doc: any) => {
            const b = doc.data() as MeetingBooking;
            if (b.date !== dateDetail.date) return false;
            return dateDetail.startTime < b.endTime && dateDetail.endTime > b.startTime;
          });

          if (hasOverlap) {
            return { success: false, error: `Jadwal sudah disetujui untuk ${dateDetail.date} (waktu sudah terpakai).` };
          }
        }
      }

      const now = Date.now();
      const currentUser = isAdminDirectCreate ? await getCurrentUser() : null;
      const userIdentifier = currentUser ? (currentUser.name || currentUser.email || "Admin") : "Public";
      const bookingPromises = multiDatesDetails.map(async (dateDetail: any) => {
        const bookingData = {
          ...baseData,
          date: dateDetail.date,
          startTime: dateDetail.startTime,
          endTime: dateDetail.endTime,
          multiDatesDetails: multiDatesDetails,
          submissionSource: submissionSource || (isAdminDirectCreate ? 'manual' : 'online'),
          status: "pending",
          created_by: userIdentifier,
          created_at: now,
          modified_by: userIdentifier,
          modified_at: now,
        };
        return adminDb.collection(COLLECTION).add(bookingData);
      });

      const docRefs = await Promise.all(bookingPromises);

      // Create wilayah approvals for each inventory item (Admin Wilayah individual tracking)
      await handlePackageBookingWilayahApproval(docRefs[0].id, baseData as MeetingBooking);

      revalidatePath("/meeting-room");
      revalidatePath("/admin/meeting-rooms");
      return { success: true, data: docRefs[0].id };
    }

    // Single date booking logic (original)
    if (parsed.data.type === 'room' || parsed.data.type === 'both') {
        const overlaps = await adminDb.collection(COLLECTION)
          .where("placeId", "==", parsed.data.placeId)
          .where("status", "==", "confirmed")
          .get();

        const hasOverlap = overlaps.docs.some(doc => {
          const b = doc.data() as MeetingBooking;
          if (b.date !== parsed.data.date) return false;
          const startTime = parsed.data.startTime!;
          const endTime = parsed.data.endTime!;
          return startTime < b.endTime && endTime > b.startTime;
        });

        if (hasOverlap) {
          return { success: false, error: "Jadwal sudah disetujui untuk peminjaman lain (waktu sudah terpakai)." };
        }
    }

    const { isAdminDirectCreate, submissionSource, ...bookingDataToSave } = parsed.data as any;

    // Assign Submission Source
    bookingDataToSave.submissionSource = submissionSource || (isAdminDirectCreate ? 'manual' : 'online');

const now = Date.now();
    const currentUser = isAdminDirectCreate ? await getCurrentUser() : null;

    // RBAC: admin direct create requires manage_data permission
    if (isAdminDirectCreate && currentUser && !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Tidak memiliki otorisasi" };
    }

    const userIdentifier = currentUser ? (currentUser.name || currentUser.email || "Unknown") : "Public";
    const docRef = await adminDb.collection(COLLECTION).add({
      ...bookingDataToSave,
      status: "pending",
      created_by: userIdentifier,
      created_at: now,
      modified_by: userIdentifier,
      modified_at: now,
    });
    
    // Create wilayah approvals for each inventory item (Admin Wilayah individual tracking)
    await handlePackageBookingWilayahApproval(docRef.id, bookingDataToSave as MeetingBooking);

    revalidatePath("/meeting-room");
    revalidatePath("/admin/meeting-rooms");
    return { success: true, data: docRef.id };
  } catch (error: unknown) {
    console.error("Error submitting booking:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function getBookings(): Promise<MeetingBooking[]> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      console.warn("getBookings: unauthorized access attempt");
      return [];
    }

    const snapshot = await adminDb.collection(COLLECTION).get();

    const bookings = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as MeetingBooking));

// admin_wilayah: see ALL bookings, but manage only those in their own wilayah
    // (manage permission is enforced client-side via canManageBooking + server-side in each action)
    // Super_admin, admin_paroki, and data_admin get all bookings (hasPermission already passed)
    const role = currentUser.role;
    if (role === "admin_wilayah") {
      // No server-side filter — admin_wilayah sees all bookings
      // Action buttons are controlled by canManageBooking on the client
      return bookings.sort((a, b) => {
        if (a.date !== b.date) return (b.date || "").localeCompare(a.date || "");
        return (a.startTime || "").localeCompare(b.startTime || "");
      });
    }

    // super_admin / data_admin: return all bookings sorted
    return bookings.sort((a, b) => {
      if (a.date !== b.date) return (b.date || "").localeCompare(a.date || "");
      return (a.startTime || "").localeCompare(b.startTime || "");
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

/**
 * Automatically reject any overlapping pending room bookings
 */
async function autoRejectOverlappingPending(placeId: string, date: string, startTime: string, endTime: string, currentBookingId: string, multiDatesDetails?: DateWithTime[]) {
    const overlaps = await adminDb.collection(COLLECTION)
      .where("placeId", "==", placeId)
      .where("status", "==", "pending")
      .get();
      
    const batch = adminDb.batch();
    let hasUpdates = false;
    
    // Get all dates to check (from multiDatesDetails or single date)
    const datesToCheck = multiDatesDetails ? multiDatesDetails.map(d => d.date) : [date];
    
    overlaps.docs.forEach(doc => {
      if (doc.id === currentBookingId) return;
      const b = doc.data() as MeetingBooking;
      
      // Check if any of our dates overlap with this booking
      const hasOverlap = datesToCheck.some(checkDate => {
        if (b.date !== checkDate) return false;
        return startTime < b.endTime && endTime > b.startTime;
      });
      
      if (hasOverlap) {
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
 * Check if a room booking conflicts with Mass Schedule
 */
async function checkMassScheduleConflict(
  placeId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  try {
    // Get the place details to check if it's a church/sanctuary
    const placeDoc = await adminDb.collection("meeting_places").doc(placeId).get();
    if (!placeDoc.exists) return false;
    
    const placeData = placeDoc.data();
    // Check if this place is used for Mass (you may need to adjust this logic based on your data structure)
    // Assuming places with certain names or wilayah_id indicate church areas
    const isChurchArea = placeData?.name?.toLowerCase().includes('gereja') || 
                         placeData?.name?.toLowerCase().includes('sanctuary') ||
                         placeData?.name?.toLowerCase().includes('altar');
    
    if (!isChurchArea) return false;

    // Check mass schedule for the date
    const massSnapshot = await adminDb.collection("mass_schedule")
      .where("date", "==", date)
      .get();

    return massSnapshot.docs.some(doc => {
      const mass = doc.data();
      if (!mass.startTime || !mass.endTime) return false;
      // Check time overlap
      return startTime < mass.endTime && endTime > mass.startTime;
    });
  } catch (error) {
    console.error("Error checking mass schedule conflict:", error);
    return false; // Fail open - don't block on error
  }
}

/**
 * Auto-reject inventory requests when room booking conflict occurs
 */
async function autoRejectInventoryOnRoomConflict(
  placeId: string,
  dates: string[],
  startTime: string,
  endTime: string,
  currentBookingId: string
) {
  try {
    // Find inventory/both bookings that overlap with the room booking time
    const inventoryBookings = await adminDb.collection(COLLECTION)
      .where("status", "==", "pending")
      .where("type", "in", ["inventory", "both"])
      .get();

    const batch = adminDb.batch();
    let hasUpdates = false;

    inventoryBookings.docs.forEach(doc => {
      if (doc.id === currentBookingId) return;
      const b = doc.data() as MeetingBooking;
      
      // Check if inventory booking dates overlap
      const bDates = b.multiDates && b.multiDates.length > 0
        ? b.multiDates
        : (b.multiDatesDetails && b.multiDatesDetails.length > 0
            ? b.multiDatesDetails.map((d: { date: string }) => d.date)
            : [b.date]);
      const datesOverlap = dates.some(d => bDates.includes(d));
      
      if (!datesOverlap) return;
      
      // For 'both' type, also check time overlap with room
      if (b.type === 'both' && b.placeId === placeId) {
        if (startTime < b.endTime && endTime > b.startTime) {
          batch.update(doc.ref, {
            status: 'rejected',
            adminNotes: 'Otomatis ditolak karena jadwal ruangan bertabrakan',
            updatedAt: Date.now()
          });
          hasUpdates = true;
        }
      }
    });

    if (hasUpdates) {
      await batch.commit();
    }
  } catch (error) {
    console.error("Error auto-rejecting inventory on room conflict:", error);
  }
}

/**
 * Handle package booking wilayah approval
 * Creates ONE approval record PER ITEM for individual tracking.
 * Items in a booking need approval from their respective Admin Wilayah.
 */
async function handlePackageBookingWilayahApproval(bookingId: string, booking: MeetingBooking) {
  try {
    if (!booking.borrowedItems || booking.borrowedItems.length === 0) return;

    // Get all inventory items to check their wilayah_id
    const itemsSnapshot = await adminDb.collection("inventory_items").get();
    const itemsMap = new Map<string, any>();
    itemsSnapshot.docs.forEach(doc => {
      itemsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    // Create ONE approval record PER ITEM
    const approvalPromises = [];
    for (const borrowedItem of booking.borrowedItems) {
      const item = itemsMap.get(borrowedItem.itemId);
      if (item && item.wilayah_id) {
        // Create individual approval for each item
        approvalPromises.push(
          adminDb.collection("wilayah_approvals").add({
            bookingId,
            wilayah_id: item.wilayah_id,
            itemId: borrowedItem.itemId,
            itemName: borrowedItem.name || item.name || "Unknown Item",
            quantity: borrowedItem.quantity,
            status: "pending",
            dateTake: (borrowedItem as any).dateTake || null,
            timeTake: (borrowedItem as any).timeTake || null,
            dateReturn: (borrowedItem as any).dateReturn || null,
            timeReturn: (borrowedItem as any).timeReturn || null,
            createdAt: Date.now(),
            updatedAt: Date.now()
          })
        );
      }
    }

    await Promise.all(approvalPromises);
  } catch (error) {
    console.error("Error handling package booking wilayah approval:", error);
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
      return { success: false, error: "Tidak memiliki otorisasi" };
    }

    if (currentUser.role === "admin_wilayah" || currentUser.role === "admin_paroki") {
      // admin_paroki: skip authorization check, can manage all bookings
      if (currentUser.role === "admin_paroki") {
        // pass through
      } else {
        // admin_wilayah: must do wilayah scoping check
        const bookingDoc = await adminDb.collection(COLLECTION).doc(id).get();
        if (!bookingDoc.exists) return { success: false, error: "Booking tidak ditemukan" };
        const bookingData = bookingDoc.data() as MeetingBooking;
        const itemWilayahIds: string[] = [];
        let placeWilayahId: string | undefined;

        if (bookingData.borrowedItems && bookingData.borrowedItems.length > 0) {
          const itemsSnapshot = await adminDb.collection("inventory_items").get();
          const itemsMap = new Map(itemsSnapshot.docs.map(d => [d.id, d.data()]));
          for (const item of bookingData.borrowedItems) {
            const itemData = itemsMap.get(item.itemId);
            if (itemData?.wilayah_id) itemWilayahIds.push(itemData.wilayah_id);
          }
        }

        if (bookingData.placeId) {
          const placeDoc = await adminDb.collection("meeting_places").doc(bookingData.placeId).get();
          if (placeDoc.exists) {
            placeWilayahId = placeDoc.data()?.wilayah_id;
          }
        }

        if (!canManageBooking(currentUser, bookingData, itemWilayahIds, placeWilayahId)) {
          return { success: false, error: "Tidak memiliki otorisasi untuk booking ini" };
        }
      }
    }

    const userIdentifier = currentUser.name || currentUser.email || "Unknown";
    await adminDb.collection(COLLECTION).doc(id).update({
      status,
      modified_by: userIdentifier,
      modified_at: Date.now()
    });

    if (status === "confirmed") {
        const bookingDoc = await adminDb.collection(COLLECTION).doc(id).get();
        if (bookingDoc.exists) {
            const b = bookingDoc.data() as MeetingBooking;
            if (b.placeId && (b.type === 'room' || b.type === 'both')) {
                // Handle multiDatesDetails if present
                const datesToCheck = b.multiDatesDetails || [{ date: b.date, startTime: b.startTime, endTime: b.endTime }];
                for (const dateDetail of datesToCheck) {
                    await autoRejectOverlappingPending(b.placeId, dateDetail.date, dateDetail.startTime, dateDetail.endTime, id);
                }
            }
        }
    }

    revalidatePath("/admin/meeting-rooms");
    revalidatePath("/meeting-room");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating booking status:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Update return status for inventory bookings.
 * Requires admin privileges.
 */
export async function updateReturnStatus(
  id: string,
  returnStatus: "Masih Dipinjam" | "Sudah Dikembalikan" | "Dikembalikan dengan Kekurangan",
  returnNotes?: string
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Tidak memiliki otorisasi" };
    }

    if (currentUser.role === "admin_wilayah" || currentUser.role === "admin_paroki") {
      if (currentUser.role === "admin_paroki") {
        // admin_paroki: skip authorization check
      } else {
        const bookingDoc = await adminDb.collection(COLLECTION).doc(id).get();
        if (!bookingDoc.exists) return { success: false, error: "Booking tidak ditemukan" };
        const bookingData = bookingDoc.data() as MeetingBooking;
        const itemWilayahIds: string[] = [];
        let placeWilayahId: string | undefined;

        if (bookingData.borrowedItems && bookingData.borrowedItems.length > 0) {
          const itemsSnapshot = await adminDb.collection("inventory_items").get();
          const itemsMap = new Map(itemsSnapshot.docs.map(d => [d.id, d.data()]));
          for (const item of bookingData.borrowedItems) {
            const itemData = itemsMap.get(item.itemId);
            if (itemData?.wilayah_id) itemWilayahIds.push(itemData.wilayah_id);
          }
        }

        if (bookingData.placeId) {
          const placeDoc = await adminDb.collection("meeting_places").doc(bookingData.placeId).get();
          if (placeDoc.exists) {
            placeWilayahId = placeDoc.data()?.wilayah_id;
          }
        }

        if (!canManageBooking(currentUser, bookingData, itemWilayahIds, placeWilayahId)) {
          return { success: false, error: "Tidak memiliki otorisasi untuk booking ini" };
        }
      }
    }

    const updateData: any = {
      returnStatus,
      modified_by: currentUser.name || currentUser.email || "Unknown",
      modified_at: Date.now()
    };

    if (returnNotes !== undefined) {
      updateData.returnNotes = returnNotes;
    }

    await adminDb.collection(COLLECTION).doc(id).update(updateData);

    revalidatePath("/admin/meeting-rooms");
    revalidatePath("/meeting-room");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating return status:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Update initial condition notes when confirming inventory bookings.
 */
export async function updateInitialConditionNotes(
  id: string,
  initialConditionNotes: string
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Tidak memiliki otorisasi" };
    }

    if (currentUser.role === "admin_wilayah" || currentUser.role === "admin_paroki") {
      if (currentUser.role === "admin_paroki") {
        // admin_paroki: skip authorization check
      } else {
        const bookingDoc = await adminDb.collection(COLLECTION).doc(id).get();
        if (!bookingDoc.exists) return { success: false, error: "Booking tidak ditemukan" };
        const bookingData = bookingDoc.data() as MeetingBooking;
        const itemWilayahIds: string[] = [];
        let placeWilayahId: string | undefined;

        if (bookingData.borrowedItems && bookingData.borrowedItems.length > 0) {
          const itemsSnapshot = await adminDb.collection("inventory_items").get();
          const itemsMap = new Map(itemsSnapshot.docs.map(d => [d.id, d.data()]));
          for (const item of bookingData.borrowedItems) {
            const itemData = itemsMap.get(item.itemId);
            if (itemData?.wilayah_id) itemWilayahIds.push(itemData.wilayah_id);
          }
        }

        if (bookingData.placeId) {
          const placeDoc = await adminDb.collection("meeting_places").doc(bookingData.placeId).get();
          if (placeDoc.exists) {
            placeWilayahId = placeDoc.data()?.wilayah_id;
          }
        }

        if (!canManageBooking(currentUser, bookingData, itemWilayahIds, placeWilayahId)) {
          return { success: false, error: "Tidak memiliki otorisasi untuk booking ini" };
        }
      }
    }

    await adminDb.collection(COLLECTION).doc(id).update({
      initialConditionNotes,
      modified_by: currentUser.name || currentUser.email || "Unknown",
      modified_at: Date.now()
    });

    revalidatePath("/admin/meeting-rooms");
    revalidatePath("/meeting-room");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating initial condition notes:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function deleteBooking(id: string): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Tidak memiliki otorisasi" };
    }

    if (currentUser.role === "admin_wilayah" || currentUser.role === "admin_paroki") {
      if (currentUser.role === "admin_paroki") {
        // admin_paroki: skip authorization check
      } else {
        const bookingDoc = await adminDb.collection(COLLECTION).doc(id).get();
        if (!bookingDoc.exists) return { success: false, error: "Booking tidak ditemukan" };
        const bookingData = bookingDoc.data() as MeetingBooking;
        const itemWilayahIds: string[] = [];
        let placeWilayahId: string | undefined;

        if (bookingData.borrowedItems && bookingData.borrowedItems.length > 0) {
          const itemsSnapshot = await adminDb.collection("inventory_items").get();
          const itemsMap = new Map(itemsSnapshot.docs.map(d => [d.id, d.data()]));
          for (const item of bookingData.borrowedItems) {
            const itemData = itemsMap.get(item.itemId);
            if (itemData?.wilayah_id) itemWilayahIds.push(itemData.wilayah_id);
          }
        }

        if (bookingData.placeId) {
          const placeDoc = await adminDb.collection("meeting_places").doc(bookingData.placeId).get();
          if (placeDoc.exists) {
            placeWilayahId = placeDoc.data()?.wilayah_id;
          }
        }

        if (!canManageBooking(currentUser, bookingData, itemWilayahIds, placeWilayahId)) {
          return { success: false, error: "Tidak memiliki otorisasi untuk booking ini" };
        }
      }
    }

    await adminDb.collection(COLLECTION).doc(id).delete();
    
    revalidatePath("/admin/meeting-rooms");
    revalidatePath("/meeting-room");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting booking:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
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

    if (currentUser.role === "admin_wilayah" || currentUser.role === "admin_paroki") {
      if (currentUser.role === "admin_paroki") {
        // admin_paroki: skip authorization check
      } else {
        const bookingDoc = await adminDb.collection(COLLECTION).doc(id).get();
        if (!bookingDoc.exists) return { success: false, error: "Booking tidak ditemukan" };
        const bookingData = bookingDoc.data() as MeetingBooking;
        const itemWilayahIds: string[] = [];
        let placeWilayahId: string | undefined;

        if (bookingData.borrowedItems && bookingData.borrowedItems.length > 0) {
          const itemsSnapshot = await adminDb.collection("inventory_items").get();
          const itemsMap = new Map(itemsSnapshot.docs.map(d => [d.id, d.data()]));
          for (const item of bookingData.borrowedItems) {
            const itemData = itemsMap.get(item.itemId);
            if (itemData?.wilayah_id) itemWilayahIds.push(itemData.wilayah_id);
          }
        }

        if (bookingData.placeId) {
          const placeDoc = await adminDb.collection("meeting_places").doc(bookingData.placeId).get();
          if (placeDoc.exists) {
            placeWilayahId = placeDoc.data()?.wilayah_id;
          }
        }

        if (!canManageBooking(currentUser, bookingData, itemWilayahIds, placeWilayahId)) {
          return { success: false, error: "Tidak memiliki otorisasi untuk booking ini" };
        }
      }
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
        
        // Handle multiDatesDetails if present, otherwise use single date
        const datesToCheck = parsed.data.multiDatesDetails 
          ? parsed.data.multiDatesDetails.map(d => d.date)
          : [parsed.data.date];
        
        const hasOverlap = overlaps.docs.some(doc => {
          if (doc.id === id) return false; // Ignore current booking
          const b = doc.data() as MeetingBooking;
          
          // Check if any of our dates overlap with this booking
          return datesToCheck.some(checkDate => {
            if (b.date !== checkDate) return false;
            const startTime = parsed.data.startTime!;
            const endTime = parsed.data.endTime!;
            return startTime < b.endTime && endTime > b.startTime;
          });
        });

        if (hasOverlap) {
          return { success: false, error: "Jadwal sudah disetujui untuk peminjaman lain (waktu sudah terpakai)." };
        }

        // Check Mass Schedule conflict for each date with its specific time
        for (const dateDetail of parsed.data.multiDatesDetails || []) {
          const hasMassConflict = await checkMassScheduleConflict(
            parsed.data.placeId!,
            dateDetail.date,
            dateDetail.startTime,
            dateDetail.endTime
          );

          if (hasMassConflict) {
            return { success: false, error: `Waktu bertabrakan dengan Jadwal Misa pada tanggal ${dateDetail.date}.` };
          }
        }
    }

    // Check inventory availability if items are updated
    if ((parsed.data.type === 'inventory' || parsed.data.type === 'both') && parsed.data.borrowedItems && parsed.data.borrowedItems.length > 0) {
      const { checkInventoryAvailability, checkInventoryTimeOverlap, getActiveInventoryItems } = await import("./inventory");

      // Build itemWilayahIds from borrowedItems to scope inventory checks
      const allItemIds = parsed.data.borrowedItems.map((i: { itemId: string }) => i.itemId);
      const itemsData = await getActiveInventoryItems();
      const itemsMap = new Map(itemsData.map(i => [i.id, i]));
      const itemWilayahIds = allItemIds.map(id => itemsMap.get(id)?.wilayah_id).filter(Boolean) as string[];

      for (const item of parsed.data.borrowedItems) {
        const dateTake = item.dateTake || parsed.data.date;
        const dateReturn = item.dateReturn || parsed.data.date;

        const availabilityResult = await checkInventoryAvailability(
          dateTake,
          dateReturn,
          [{ itemId: item.itemId, quantity: item.quantity }],
          id,
          itemWilayahIds
        );

        if (!availabilityResult.success) {
          return { success: false, error: availabilityResult.error };
        }

        const timeOverlapResult = await checkInventoryTimeOverlap(
          dateTake,
          item.timeTake || "09:00",
          item.timeReturn || "17:00",
          [{ itemId: item.itemId, quantity: item.quantity }],
          id,
          itemWilayahIds
        );

        if (!timeOverlapResult.success) {
          return { success: false, error: timeOverlapResult.error };
        }
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
      modified_by: currentUser.name || currentUser.email || "Unknown",
      modified_at: Date.now()
    });

    revalidatePath("/admin/meeting-rooms");
    revalidatePath("/meeting-room");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating booking:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
