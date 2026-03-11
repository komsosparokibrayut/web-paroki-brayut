"use server";

import { adminDb } from "@/lib/firebase/server";
import { getCurrentUser } from "@/lib/firebase/auth";
import { hasPermission } from "@/lib/roles";
import { MeetingPlace } from "../types";
import { revalidatePath } from "next/cache";

const COLLECTION = "meeting_places";

type ActionResult = { success: true } | { success: false; error?: string };

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
    const snapshot = await adminDb.collection(COLLECTION)
      .where("isActive", "==", true)
      .orderBy("name")
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MeetingPlace));
  } catch (error) {
    console.error("Error fetching active places:", error);
    return [];
  }
}

export async function saveMeetingPlace(place: Omit<MeetingPlace, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Unauthorized" };
    }

    const now = Date.now();
    const collectionRef = adminDb.collection(COLLECTION);
    
    if (place.id) {
      // Update
      const { id, ...updateData } = place;
      await collectionRef.doc(id).update({
        ...updateData,
        updatedAt: now,
      });
    } else {
      // Create
      await collectionRef.add({
        ...place,
        createdAt: now,
        updatedAt: now,
      });
    }

    revalidatePath("/admin/meeting-rooms/places");
    revalidatePath("/meeting-room");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving meeting place:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMeetingPlace(id: string): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Unauthorized" };
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
