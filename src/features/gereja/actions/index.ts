"use server";

import { revalidatePath } from "next/cache";
import { getGerejaList, updateGerejaList } from "@/services/github/gereja";
import { GerejaUnit } from "@/features/schedule/types";
import { getCurrentUser } from "@/lib/firebase/auth";
import { hasPermission, canManageGereja } from "@/lib/roles";

type ActionResult = { success: true } | { success: false; error?: string };

/**
 * Fetches the list of gereja from GitHub storage.
 */
export async function getGereja(): Promise<GerejaUnit[]> {
  return getGerejaList();
}

/**
 * Saves the full list of gereja and revalidates gereja pages.
 */
export async function saveGereja(data: GerejaUnit[]): Promise<ActionResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
    return { success: false, error: "Unauthorized" };
  }

  if (currentUser.role === "admin_wilayah") {
    for (const gereja of data) {
      if (!canManageGereja(currentUser, gereja)) {
        return { success: false, error: "Tidak memiliki otorisasi untuk mengubah data Gereja ini" };
      }
    }
  }

  const timestamp = new Date().toISOString();
  const userIdentifier = currentUser.name || currentUser.email || "Unknown";

  const auditedData = data.map(gereja => {
    if (!gereja.created_by) {
      return {
        ...gereja,
        created_by: userIdentifier,
        created_at: timestamp,
        modified_by: userIdentifier,
        modified_at: timestamp,
      };
    }
    return {
      ...gereja,
      modified_by: userIdentifier,
      modified_at: timestamp,
    };
  });

  const result = await updateGerejaList(auditedData);
  if (result.success) {
    revalidatePath("/gereja");
    revalidatePath("/admin/data/gereja");
    return { success: true };
  }
  return { success: false, error: result.message };
}
