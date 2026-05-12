"use server";

import { adminDb } from "@/lib/firebase/server";
import { getCurrentUser } from "@/lib/firebase/auth";
import { hasPermission } from "@/lib/roles";
import { MeetingPlace, MeetingBooking } from "../types";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";

const EVENTS_COLLECTION = "events";
const MASS_SCHEDULE_COLLECTION = "mass_schedule";
const BOOKING_COLLECTION = "meeting_bookings";

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error?: string };

const eventSchema = z.object({
  name: z.string().min(3, "Nama event minimal 3 karakter").max(200, "Nama event terlalu panjang"),
  description: z.string().optional(),
  location: z.string().min(1, "Lokasi harus dipilih"),
  placeId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu tidak valid"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu tidak valid"),
  organizer: z.string().min(2, "Nama penyelenggara minimal 2 karakter"),
  contact: z.string().min(5, "Kontak minimal 5 karakter"),
  wilayah_id: z.string().optional(),
}).refine(data => data.endTime > data.startTime, {
  message: "Waktu selesai harus setelah waktu mulai",
});

/**
 * Fetch active meeting places for event creation
 */
export async function getRoomsForEvent(): Promise<MeetingPlace[]> {
  try {
    const snapshot = await adminDb.collection("meeting_places")
      .where("isActive", "==", true)
      .orderBy("name")
      .get();
    
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as MeetingPlace));
  } catch (error) {
    console.error("Error fetching rooms for event:", error);
    return [];
  }
}

/**
 * Get mass schedule for a specific date or date range
 */
export async function getMassSchedule(date?: string, endDate?: string): Promise<any[]> {
  try {
    let query: any = adminDb.collection(MASS_SCHEDULE_COLLECTION);
    
    if (date) {
      query = query.where("date", ">=", date);
    }
    if (endDate) {
      query = query.where("date", "<=", endDate);
    }
    
    const snapshot = await query.orderBy("date").orderBy("startTime").get();
    
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching mass schedule:", error);
    return [];
  }
}

/**
 * Create an event and automatically block the room slot
 */
export async function createEventWithRoomBlock(eventData: {
  name: string;
  description?: string;
  location: string;
  placeId?: string;
  date: string;
  startTime: string;
  endTime: string;
  organizer: string;
  contact: string;
  wilayah_id?: string;
}): Promise<ActionResult<string>> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Tidak memiliki otorisasi" };
    }

    const parsed = eventSchema.safeParse(eventData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Input tidak valid" };
    }

    const data = parsed.data;

    // If a placeId is provided, check for room conflicts first
    if (data.placeId) {
      const hasConflict = await checkRoomConflictForEvent(
        data.placeId,
        data.date,
        data.startTime,
        data.endTime
      );

      if (hasConflict) {
        return { success: false, error: "Ruangan sudah dibooking pada waktu tersebut. Silakan pilih waktu lain." };
      }
    }

    const now = Date.now();

    // Create the event
    const eventDoc = await adminDb.collection(EVENTS_COLLECTION).add({
      name: data.name,
      description: data.description || "",
      location: data.location,
      placeId: data.placeId || null,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      organizer: data.organizer,
      contact: data.contact,
      wilayah_id: data.wilayah_id || null,
      status: "confirmed",
      createdBy: currentUser.uid,
      createdAt: now,
      updatedAt: now,
    });

    // If placeId is provided, create a blocking booking in meeting_bookings
    if (data.placeId) {
      await adminDb.collection(BOOKING_COLLECTION).add({
        type: "room",
        placeId: data.placeId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        userName: data.organizer,
        userContact: data.contact,
        purpose: `Event: ${data.name}${data.description ? ` - ${data.description}` : ""}`,
        status: "confirmed",
        submissionSource: "manual",
        isRescheduled: false,
        wilayah_id: data.wilayah_id || null,
        adminNotes: `Otomatis diblokir oleh event: ${data.name}`,
        createdAt: now,
        updatedAt: now,
      });
    }

    revalidatePath("/admin/events");
    revalidatePath("/meeting-room");
    return { success: true, data: eventDoc.id };
  } catch (error: any) {
    console.error("Error creating event:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if a room has conflict with existing bookings or mass schedule
 */
async function checkRoomConflictForEvent(
  placeId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  // Check against confirmed bookings
  const bookingsSnapshot = await adminDb.collection(BOOKING_COLLECTION)
    .where("placeId", "==", placeId)
    .where("status", "==", "confirmed")
    .get();

  const hasBookingConflict = bookingsSnapshot.docs.some(doc => {
    const b = doc.data() as MeetingBooking;
    const bDates = b.multiDates && b.multiDates.length > 0 ? b.multiDates : [b.date];
    if (!bDates.includes(date)) return false;
    return startTime < b.endTime && endTime > b.startTime;
  });

  if (hasBookingConflict) return true;

  // Check against mass schedule
  const massSnapshot = await adminDb.collection(MASS_SCHEDULE_COLLECTION)
    .where("date", "==", date)
    .get();

  const hasMassConflict = massSnapshot.docs.some(doc => {
    const mass = doc.data();
    if (!mass.startTime || !mass.endTime) return false;
    return startTime < mass.endTime && endTime > mass.startTime;
  });

  return hasMassConflict;
}

/**
 * Get events with optional filters
 */
export async function getEvents(date?: string, wilayah_id?: string): Promise<any[]> {
  try {
    let query: any = adminDb.collection(EVENTS_COLLECTION);

    if (wilayah_id) {
      query = query.where("wilayah_id", "==", wilayah_id);
    }

    if (date) {
      query = query.where("date", "==", date);
    }

    const snapshot = await query.orderBy("date").orderBy("startTime").get();
    
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

/**
 * Create mass schedule and automatically block room bookings
 * This ensures "Jadwal Misa" blocks room availability for church areas
 */
export async function createMassScheduleWithRoomBlock(massData: {
  date: string;
  startTime: string;
  endTime: string;
  massName?: string;
  location?: string;
  wilayah_id?: string;
  placeId?: string; // Specific place to block (e.g., sanctuary)
}): Promise<ActionResult<string>> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Tidak memiliki otorisasi" };
    }

    const now = Date.now();

    // Create the mass schedule
    const massDoc = await adminDb.collection(MASS_SCHEDULE_COLLECTION).add({
      date: massData.date,
      startTime: massData.startTime,
      endTime: massData.endTime,
      massName: massData.massName || "Misa",
      location: massData.location || "",
      wilayah_id: massData.wilayah_id || null,
      createdBy: currentUser.uid,
      createdAt: now,
      updatedAt: now,
    });

    // If placeId is provided, block that room for the mass time
    if (massData.placeId) {
      await adminDb.collection(BOOKING_COLLECTION).add({
        type: "room",
        placeId: massData.placeId,
        date: massData.date,
        startTime: massData.startTime,
        endTime: massData.endTime,
        userName: "Sistem",
        userContact: "-",
        purpose: `Jadwal Misa: ${massData.massName || "Misa"}`,
        status: "confirmed",
        submissionSource: "manual",
        isRescheduled: false,
        wilayah_id: massData.wilayah_id || null,
        adminNotes: "Otomatis diblokir oleh Jadwal Misa",
        createdAt: now,
        updatedAt: now,
      });
    } else {
      // Block all church areas (sanctuary/gereja) for the mass time
      const placesSnapshot = await adminDb.collection("meeting_places")
        .where("isActive", "==", true)
        .get();

      const batch = adminDb.batch();
      placesSnapshot.docs.forEach(doc => {
        const place = doc.data();
        const isChurchArea = place.name?.toLowerCase().includes('gereja') || 
                            place.name?.toLowerCase().includes('sanctuary') ||
                            place.name?.toLowerCase().includes('altar');
        
        if (isChurchArea) {
          const bookingRef = adminDb.collection(BOOKING_COLLECTION).doc();
          batch.set(bookingRef, {
            type: "room",
            placeId: doc.id,
            date: massData.date,
            startTime: massData.startTime,
            endTime: massData.endTime,
            userName: "Sistem",
            userContact: "-",
            purpose: `Jadwal Misa: ${massData.massName || "Misa"}`,
            status: "confirmed",
            submissionSource: "manual",
            isRescheduled: false,
            adminNotes: "Otomatis diblokir oleh Jadwal Misa",
            wilayah_id: massData.wilayah_id || null,
            createdAt: now,
            updatedAt: now,
          });
        }
      });

      await batch.commit();
    }

    revalidatePath("/admin/mass-schedule");
    revalidatePath("/meeting-room");
    return { success: true, data: massDoc.id };
  } catch (error: any) {
    console.error("Error creating mass schedule:", error);
    return { success: false, error: error.message };
  }
}

