"use server";

import { adminDb } from "@/lib/firebase/server";
import { getCurrentUser } from "@/lib/firebase/auth";
import { hasPermission } from "@/lib/roles";
import { MeetingPlace } from "../types";
import { revalidatePath } from "next/cache";

const COLLECTION = "meeting_places";

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error?: string };

export async function getMeetingPlaces(): Promise<MeetingPlace[]> {
  try {
    const snapshot = await adminDb.collection(COLLECTION).orderBy("name").get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MeetingPlace));
  } catch (error) {
    console.error("Error fetching places:", error);
    return [];
  }
}

export async function getActiveMeetingPlaces(): Promise<MeetingPlace[]> {
  try {
    const snapshot = await adminDb.collection(COLLECTION).get();
      
    const places = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MeetingPlace));
    
    return places
      .filter(p => p.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching active places:", error);
    return [];
  }
}

export async function saveMeetingPlace(place: Omit<MeetingPlace, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<ActionResult<string>> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Tidak memiliki otorisasi" };
    }

    const now = Date.now();
    const collectionRef = adminDb.collection(COLLECTION);
    let savedId = place.id;
    if (place.id) {
      // Update
      const { id, ...updateData } = place;
      await collectionRef.doc(id).update({
        ...updateData,
        updatedAt: now,
      });
    } else {
      // Create
      const docRef = await collectionRef.add({
        ...place,
        createdAt: now,
        updatedAt: now,
      });
      savedId = docRef.id;
    }

    revalidatePath("/admin/meeting-rooms/places");
    revalidatePath("/meeting-room");
    return { success: true, data: savedId };
  } catch (error: any) {
    console.error("Error saving meeting place:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMeetingPlace(id: string): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Tidak memiliki otorisasi" };
    }

    await adminDb.collection(COLLECTION).doc(id).delete();
    
    revalidatePath("/admin/meeting-rooms/places");
    revalidatePath("/meeting-room");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting meeting place:", error);
    return { success: false, error: error.message };
  }
}
