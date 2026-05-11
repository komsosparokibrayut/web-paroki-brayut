"use server";

import { adminDb } from "@/lib/firebase/server";
import { getCurrentUser } from "@/lib/firebase/auth";
import { hasPermission } from "@/lib/roles";
import { revalidatePath } from "next/cache";

const COLLECTION = "admin_settings";
const SETTINGS_DOC = "config";

type ActionResult<T = void> = { success: true; data?: T } | { success: false, error?: string };

export interface AdminSettings {
  whatsapp_number?: string;
  phone_number?: string;
  donation_total?: number;
  donation_target?: number;
  meeting_room_password?: string;
  created_by?: string;
  created_at?: string;
  modified_by?: string;
  modified_at?: string;
}

export async function getAdminSettings(): Promise<AdminSettings> {
  try {
    const doc = await adminDb.collection(COLLECTION).doc(SETTINGS_DOC).get();
    if (!doc.exists) {
      return {};
    }
    return doc.data() as AdminSettings;
  } catch (error) {
    console.error("Error fetching admin settings:", error);
    return {};
  }
}

export async function setupAdminSettings(data: Partial<AdminSettings>): Promise<ActionResult> {
  try {
    const docRef = adminDb.collection(COLLECTION).doc(SETTINGS_DOC);
    const doc = await docRef.get();

    if (doc.exists) {
      return { success: false, error: "Settings already exist" };
    }

    await docRef.set({
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error setting up admin settings:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAdminSettings(data: Partial<AdminSettings>): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Tidak memiliki otorisasi" };
    }

    const userIdentifier = currentUser.name || currentUser.email || "Unknown";
    const timestamp = Date.now();
    const docRef = adminDb.collection(COLLECTION).doc(SETTINGS_DOC);
    const doc = await docRef.get();

    if (doc.exists) {
      const existingData = doc.data() as AdminSettings;
      await docRef.update({
        ...data,
        modified_by: userIdentifier,
        modified_at: timestamp,
        created_by: existingData.created_by || userIdentifier,
        created_at: existingData.created_at || timestamp,
        updatedAt: timestamp,
      });
    } else {
      await docRef.set({
        ...data,
        created_by: userIdentifier,
        created_at: timestamp,
        modified_by: userIdentifier,
        modified_at: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    revalidatePath("/admin/meeting-rooms");
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating admin settings:", error);
    return { success: false, error: error.message };
  }
}
