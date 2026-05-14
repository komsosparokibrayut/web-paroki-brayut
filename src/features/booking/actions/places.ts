"use server";

import { adminDb } from "@/lib/firebase/server";
import { getCurrentUser } from "@/lib/firebase/auth";
import { hasPermission, canManagePlace } from "@/lib/roles";
import { MeetingPlace } from "../types";
import { revalidatePath } from "next/cache";
import { QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";

const COLLECTION = "meeting_places";

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error?: string };

export async function getMeetingPlaces(): Promise<MeetingPlace[]> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return [];
    }

    const snapshot = await adminDb.collection(COLLECTION).orderBy("name").get();
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
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
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return [];
    }

    const snapshot = await adminDb.collection(COLLECTION).get();
      
    const places = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
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

    if (place.id) {
      const existingPlace = await adminDb.collection(COLLECTION).doc(place.id).get();
      if (!existingPlace.exists) return { success: false, error: "Tempat tidak ditemukan" };
      if (!canManagePlace(currentUser, existingPlace.data() as MeetingPlace)) {
        return { success: false, error: "Tidak memiliki otorisasi untuk mengubah tempat ini" };
      }
    }

    const now = Date.now();
    const userIdentifier = currentUser.name || currentUser.email || "Unknown";
    const collectionRef = adminDb.collection(COLLECTION);
    let savedId = place.id;
    if (place.id) {
      // Update
      const { id, ...updateData } = place;
      await collectionRef.doc(id).update({
        ...updateData,
        modified_by: userIdentifier,
        modified_at: now,
      });
    } else {
      // Create
      const docRef = await collectionRef.add({
        ...place,
        created_by: userIdentifier,
        created_at: now,
        modified_by: userIdentifier,
        modified_at: now,
      });
      savedId = docRef.id;
    }

    revalidatePath("/admin/meeting-rooms/places");
    revalidatePath("/meeting-room");
    return { success: true, data: savedId };
  } catch (error: unknown) {
    console.error("Error saving meeting place:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function deleteMeetingPlace(id: string): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Tidak memiliki otorisasi" };
    }

    const existingPlace = await adminDb.collection(COLLECTION).doc(id).get();
    if (!existingPlace.exists) return { success: false, error: "Tempat tidak ditemukan" };
    if (!canManagePlace(currentUser, existingPlace.data() as MeetingPlace)) {
      return { success: false, error: "Tidak memiliki otorisasi untuk menghapus tempat ini" };
    }

    await adminDb.collection(COLLECTION).doc(id).delete();
    
    revalidatePath("/admin/meeting-rooms/places");
    revalidatePath("/meeting-room");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting meeting place:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
