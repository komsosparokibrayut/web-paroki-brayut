"use server";

import { revalidatePath } from "next/cache";
import { getGerejaList, updateGerejaList } from "@/services/github/gereja";
import { GerejaUnit } from "@/features/schedule/types";
import { getCurrentUser } from "@/lib/firebase/auth";
import { hasPermission } from "@/lib/roles";

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
  const result = await updateGerejaList(data);
  if (result.success) {
    revalidatePath("/gereja");
    revalidatePath("/admin/data/gereja");
    return { success: true };
  }
  return { success: false, error: result.message };
}
