"use server";

import { adminDb } from "@/lib/firebase/server";
import { getCurrentUser } from "@/lib/firebase/auth";
import { hasPermission } from "@/lib/roles";
import { InventoryItem, MeetingBooking } from "../types";
import { revalidatePath } from "next/cache";

const COLLECTION = "inventory_items";
const BOOKING_COLLECTION = "meeting_bookings";

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error?: string };

export async function getInventoryItems(): Promise<InventoryItem[]> {
  try {
    const snapshot = await adminDb.collection(COLLECTION).orderBy("name").get();
    return snapshot.docs.map(doc => ({
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
    const snapshot = await adminDb.collection(COLLECTION).get();
      
    const items = snapshot.docs.map(doc => ({
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
      return { success: false, error: "Tidak memiliki otorisasi" };
    }

    const now = Date.now();
    const collectionRef = adminDb.collection(COLLECTION);
    let savedId = item.id;
    if (item.id) {
      // Update
      const { id, ...updateData } = item;
      await collectionRef.doc(id).update({
        ...updateData,
        updatedAt: now,
      });
    } else {
      // Create
      const docRef = await collectionRef.add({
        ...item,
        createdAt: now,
        updatedAt: now,
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
 */
export async function checkInventoryAvailability(
  dateTake: string,
  dateReturn: string,
  requestedItems: { itemId: string; quantity: number }[]
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

    // Get all confirmed or pending bookings that overlap with this date range
    // We treat 'pending' as occupying stock to prevent oversell, auto-reject handles conflicts later.
    // For simplicity, we check if there are any bookings where dateTake is <= their dateReturn and dateReturn >= their dateTake. (Rough overlap check by date)
    
    const snapshot = await adminDb.collection(BOOKING_COLLECTION)
      .where("status", "in", ["confirmed", "pending"])
      .where("type", "in", ["inventory", "both"])
      .get();
      
    // Filter overlaps manually since firestore can't do complex range queries easily
    // This assumes date format YYYY-MM-DD which is sortable
    const overlappingBookings = snapshot.docs.map(doc => {
      const b = doc.data() as MeetingBooking;
      // We consider it an inventory booking. For backward compatibility, if returnDate is missing, use date.
      const bStartDate = b.date;
      const bEndDate = b.returnDate || b.date;
      return { ...b, bStartDate, bEndDate };
    }).filter(b => {
      return dateTake <= b.bEndDate && dateReturn >= b.bStartDate;
    });

    // Calculate maximum usage for each requested item across the overlapping period
    // A more precise check would calculate daily usage, but grouping by overlapping bookings is a safe approximation
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
