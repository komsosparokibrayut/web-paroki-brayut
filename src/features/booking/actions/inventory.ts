"use server";

import { adminDb } from "@/lib/firebase/server";
import { getCurrentUser } from "@/lib/firebase/auth";
import { hasPermission, canManageInventoryItem } from "@/lib/roles";
import { InventoryItem, MeetingBooking } from "../types";
import { revalidatePath } from "next/cache";
import { QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";

const COLLECTION = "inventory_items";
const BOOKING_COLLECTION = "meeting_bookings";

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error?: string };

export async function getInventoryItems(): Promise<InventoryItem[]> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return [];
    }

    const snapshot = await adminDb.collection(COLLECTION).orderBy("name").get();
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as InventoryItem));
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    return [];
  }
}

export async function getActiveInventoryItems(): Promise<InventoryItem[]> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return [];
    }

    const snapshot = await adminDb.collection(COLLECTION).get();
      
    const items = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as InventoryItem));
    
    return items
      .filter(p => p.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching active inventory items:", error);
    return [];
  }
}

export async function saveInventoryItem(item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<ActionResult<string>> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Tidak memiliki otoritas" };
    }

    if (item.id) {
      const existingItem = await adminDb.collection(COLLECTION).doc(item.id).get();
      if (!existingItem.exists) return { success: false, error: "Item tidak ditemukan" };
      if (!canManageInventoryItem(currentUser, existingItem.data() as InventoryItem)) {
        return { success: false, error: "Tidak memiliki otorisasi untuk mengubah item ini" };
      }
    }

    const now = Date.now();
    const userIdentifier = currentUser.name || currentUser.email || "Unknown";
    const collectionRef = adminDb.collection(COLLECTION);
    let savedId = item.id;
    if (item.id) {
      // Update
      const { id, ...updateData } = item;
      await collectionRef.doc(id).update({
        ...updateData,
        modified_by: userIdentifier,
        modified_at: now,
      });
    } else {
      // Create
      const docRef = await collectionRef.add({
        ...item,
        created_by: userIdentifier,
        created_at: now,
        modified_by: userIdentifier,
        modified_at: now,
      });
      savedId = docRef.id;
    }

    revalidatePath("/admin/meeting-rooms/inventory");
    revalidatePath("/meeting-room");
    return { success: true, data: savedId };
  } catch (error: any) {
    console.error("Error saving inventory item:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteInventoryItem(id: string): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Tidak memiliki otorisasi" };
    }

    const existingItem = await adminDb.collection(COLLECTION).doc(id).get();
    if (!existingItem.exists) return { success: false, error: "Item tidak ditemukan" };
    if (!canManageInventoryItem(currentUser, existingItem.data() as InventoryItem)) {
      return { success: false, error: "Tidak memiliki otorisasi untuk menghapus item ini" };
    }

    await adminDb.collection(COLLECTION).doc(id).delete();
    
    revalidatePath("/admin/meeting-rooms/inventory");
    revalidatePath("/meeting-room");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting inventory item:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Checks if the requested quantities of inventory items are available for the given date and time range.
 * Scoped to check only bookings within the same wilayah as the items being booked.
 */
export async function checkInventoryAvailability(
  dateTake: string,
  dateReturn: string,
  requestedItems: { itemId: string; quantity: number }[],
  excludeBookingId?: string,
  itemWilayahIds?: string[]
): Promise<ActionResult> {
  try {
    if (!requestedItems.length) return { success: true };

    const items = await getActiveInventoryItems();
    const itemsMap = new Map<string, InventoryItem>(items.map(i => [i.id, i]));

    for (const req of requestedItems) {
        if (!itemsMap.has(req.itemId)) {
            return { success: false, error: `Item inventory tidak ditemukan.` };
        }
    }

    // Build query scoped to item's wilayah (prevents cross-wilayah double-booking)
    let query: FirebaseFirestore.Query = adminDb.collection(BOOKING_COLLECTION)
      .where("status", "in", ["confirmed", "pending"])
      .where("type", "in", ["inventory", "both"]);

    // Scope to the items' wilayahs if they have one assigned; skip if all items are system-wide (no wilayah)
    const definedWilayahs = itemWilayahIds?.filter(Boolean) as string[] | undefined;
    if (definedWilayahs && definedWilayahs.length > 0) {
      query = query.where("wilayah_id", "in", definedWilayahs);
    }

    const snapshot = await query.get();

    // Filter overlaps manually and calculate used quantities
    const overlappingBookings = snapshot.docs
      .filter((doc: QueryDocumentSnapshot<DocumentData>) => {
        if (doc.id === excludeBookingId) return false;
        const b = doc.data() as MeetingBooking;
        const bStartDate = b.inventoryDateTake || b.date;
        const bEndDate = b.returnDate || b.date;
        return dateTake <= bEndDate && dateReturn >= bStartDate;
      })
      .map((doc: QueryDocumentSnapshot<DocumentData>) => doc.data() as MeetingBooking);

    // Calculate maximum usage for each requested item across the overlapping period
    for (const req of requestedItems) {
        let totalUsed = 0;
        for (const booking of overlappingBookings) {
            if (booking.borrowedItems) {
                 const used = booking.borrowedItems.find(i => i.itemId === req.itemId);
                 if (used) {
                     totalUsed += used.quantity;
                 }
            }
        }
        const itemInfo = itemsMap.get(req.itemId)!;
        if (req.quantity + totalUsed > itemInfo.totalQuantity) {
             return { success: false, error: `Stok ${itemInfo.name} tidak cukup (Tersisa: ${Math.max(0, itemInfo.totalQuantity - totalUsed)}).` };
        }
    }

    return { success: true };
  } catch(error: any) {
    console.error("Error checking inventory:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Calculate total duration borrowed for each inventory item
 * Returns a map of itemId -> total duration in hours
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export async function getInventoryBorrowingStats(): Promise<Map<string, { totalHours: number; totalMinutes: number; bookingCount: number }>> {
  try {
    const snapshot = await adminDb.collection(BOOKING_COLLECTION)
      .where("status", "==", "confirmed")
      .where("type", "in", ["inventory", "both"])
      .get();

    const statsMap = new Map<string, { totalHours: number; totalMinutes: number; bookingCount: number }>();

    snapshot.docs.forEach(doc => {
      const booking = doc.data() as MeetingBooking;
      if (!booking.borrowedItems || booking.borrowedItems.length === 0) return;
      if (!booking.startTime || !booking.endTime) return;

      // Calculate duration in minutes
      const startMinutes = timeToMinutes(booking.startTime);
      const endMinutes = timeToMinutes(booking.endTime);
      let durationMinutes = endMinutes - startMinutes;
      
      // Handle cases where end time is on the next day (unlikely but safe)
      if (durationMinutes < 0) {
        durationMinutes += 24 * 60;
      }

      // Add to each borrowed item
      booking.borrowedItems.forEach(item => {
        const current = statsMap.get(item.itemId) || { totalHours: 0, totalMinutes: 0, bookingCount: 0 };
        current.totalMinutes += durationMinutes;
        current.totalHours = Math.floor(current.totalMinutes / 60);
        current.bookingCount += 1;
        statsMap.set(item.itemId, current);
      });
    });

    return statsMap;
  } catch (error) {
    console.error("Error calculating borrowing stats:", error);
    return new Map();
  }
}

/**
 * Get inventory items with real-time availability for given dates/times
 */
export async function getInventoryItemsWithAvailability(
  dates: string[],
  startTimes?: string[],
  endTimes?: string[]
): Promise<(InventoryItem & { availableQuantity: number })[]> {
  try {
    const items = await getActiveInventoryItems();
    
    if (!dates.length) return items.map(item => ({ ...item, availableQuantity: item.totalQuantity }));

    // Get all confirmed or pending bookings that overlap with the given dates
    const snapshot = await adminDb.collection(BOOKING_COLLECTION)
      .where("status", "in", ["confirmed", "pending"])
      .where("type", "in", ["inventory", "both"])
      .get();

    const minDate = dates.reduce((min, d) => d < min ? d : min, dates[0]);
    const maxDate = dates.reduce((max, d) => d > max ? d : max, dates[0]);

    const overlappingBookings = snapshot.docs.map(doc => {
      const b = doc.data() as MeetingBooking;
      const bStartDate = b.date;
      const bEndDate = b.returnDate || b.date;
      return { ...b, bStartDate, bEndDate };
    }).filter(b => {
      return minDate <= b.bEndDate && maxDate >= b.bStartDate;
    });

    // Calculate available quantity for each item
    return items.map(item => {
      let totalUsed = 0;
      for (const booking of overlappingBookings) {
        if (booking.borrowedItems) {
          const used = booking.borrowedItems.find(i => i.itemId === item.id);
          if (used) {
            totalUsed += used.quantity;
          }
        }
      }
      return {
        ...item,
        availableQuantity: Math.max(0, item.totalQuantity - totalUsed)
      };
    });
  } catch(error: any) {
    console.error("Error getting inventory with availability:", error);
    return [];
  }
}

/**
 * Check for overlapping inventory bookings at the same time slot.
 * Scoped to check only bookings within the same wilayah as the items being booked.
 */
export async function checkInventoryTimeOverlap(
  date: string,
  startTime: string,
  endTime: string,
  requestedItems: { itemId: string; quantity: number }[],
  excludeBookingId?: string,
  itemWilayahIds?: string[]
): Promise<ActionResult> {
  try {
    if (!requestedItems.length) return { success: true };

    // Build query scoped to item's wilayah
    let query: FirebaseFirestore.Query = adminDb.collection(BOOKING_COLLECTION)
      .where("status", "==", "confirmed")
      .where("type", "in", ["inventory", "both"]);

    const definedWilayahs = itemWilayahIds?.filter(Boolean) as string[] | undefined;
    if (definedWilayahs && definedWilayahs.length > 0) {
      query = query.where("wilayah_id", "in", definedWilayahs);
    }

    const bookingsSnapshot = await query.get();

    const items = await getActiveInventoryItems();
    const itemsMap = new Map<string, InventoryItem>(items.map(i => [i.id, i]));

    for (const req of requestedItems) {
      let totalUsed = 0;
      
      bookingsSnapshot.docs.forEach(doc => {
        if (doc.id === excludeBookingId) return;
        const b = doc.data() as MeetingBooking;
        
        // Check if dates overlap
        const bDates = b.multiDates && b.multiDates.length > 0 ? b.multiDates : [b.date];
        if (!bDates.includes(date)) return;
        
        // Check if times overlap for same-day bookings
        if (b.startTime && b.endTime) {
          if (startTime < b.endTime && endTime > b.startTime) {
            // Time overlaps, count the items
            if (b.borrowedItems) {
              const used = b.borrowedItems.find(i => i.itemId === req.itemId);
              if (used) totalUsed += used.quantity;
            }
          }
        }
      });

      const itemInfo = itemsMap.get(req.itemId);
      if (itemInfo && totalUsed + req.quantity > itemInfo.totalQuantity) {
        return { 
          success: false, 
          error: `Stok ${itemInfo.name} tidak mencukupi untuk waktu tersebut (Sudah terpakai: ${totalUsed}).` 
        };
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error checking inventory time overlap:", error);
    return { success: false, error: error.message };
  }
}
