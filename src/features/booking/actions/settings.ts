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
  donation_total?: number;
  donation_target?: number;
  meeting_room_password?: string;
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

export async function updateAdminSettings(data: Partial<AdminSettings>): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Tidak memiliki otorisasi" };
    }

    const docRef = adminDb.collection(COLLECTION).doc(SETTINGS_DOC);
    const doc = await docRef.get();

    if (doc.exists) {
      await docRef.update({
        ...data,
        updatedAt: Date.now(),
      });
    } else {
      await docRef.set({
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
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
