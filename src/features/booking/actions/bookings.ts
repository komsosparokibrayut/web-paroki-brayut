"use server";

import { adminDb } from "@/lib/firebase/server";
import { getCurrentUser } from "@/lib/firebase/auth";
import { hasPermission } from "@/lib/roles";
import { MeetingBooking } from "../types";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const COLLECTION = "meeting_bookings";

type ActionResult = { success: true } | { success: false; error?: string };

const bookingSchema = z.object({
  placeId: z.string().min(1, "Place is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  userName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  userContact: z.string().min(5, "Contact must be at least 5 characters").max(100, "Contact too long"),
  purpose: z.string().min(3, "Purpose must be at least 3 characters").max(500, "Purpose too long"),
}).refine(data => data.endTime > data.startTime, {
  message: "End time must be after start time",
});

export async function submitBooking(booking: Omit<MeetingBooking, "id" | "status" | "createdAt" | "updatedAt">): Promise<ActionResult> {
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

    const now = Date.now();
    await adminDb.collection(COLLECTION).add({
      ...parsed.data,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
    
    revalidatePath("/meeting-room");
    revalidatePath("/admin/meeting-rooms");
    return { success: true };
  } catch (error: any) {
    console.error("Error submitting booking:", error);
    return { success: false, error: error.message };
  }
}

export async function getBookings(): Promise<MeetingBooking[]> {
  try {
    const snapshot = await adminDb.collection(COLLECTION)
      .orderBy("date", "desc")
      .orderBy("startTime", "asc")
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MeetingBooking));
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
