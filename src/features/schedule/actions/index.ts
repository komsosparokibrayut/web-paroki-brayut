"use server";

import { revalidatePath } from "next/cache";
import {
  getScheduleEvents,
  updateScheduleEvents,
  getJadwalMisa as getJadwalMisaService,
  updateJadwalMisa as updateJadwalMisaService,
} from "@/services/github/schedule";
import { JadwalEvent, JadwalMisaData } from "../types";
import { getCurrentUser } from "@/lib/firebase/auth";
import { hasPermission } from "@/lib/roles";

/** Standard result type for schedule actions */
type ActionResult = { success: true } | { success: false; error?: string };

/**
 * Saves jadwal misa (mass schedule) data.
 * @param data - JadwalMisaData to persist
 * @returns Promise resolving to ActionResult
 */
export async function saveJadwalMisa(data: JadwalMisaData): Promise<ActionResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
    return { success: false, error: "Unauthorized" };
  }
  const userIdentifier = currentUser.name || currentUser.email || "Unknown";
  const result = await updateJadwalMisaService(data, userIdentifier);
  if (result.success) {
    revalidatePath("/jadwal-misa");
    revalidatePath("/admin/data/jadwal-misa");
    return { success: true };
  }
  return { success: false, error: result.message };
}

/**
 * Fetches jadwal kegiatan (schedule events).
 * Delegates to schedule service layer.
 * @returns Promise resolving to array of JadwalEvent
 */
export async function getJadwalKegiatan(): Promise<JadwalEvent[]> {
  return getScheduleEvents();
}

/**
 * Saves jadwal kegiatan (schedule events).
 * Delegates to schedule service layer and revalidates paths.
 * @param data - Array of JadwalEvent to persist
 * @returns Promise resolving to ActionResult
 */
export async function saveJadwalKegiatan(data: JadwalEvent[]): Promise<ActionResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
    return { success: false, error: "Unauthorized" };
  }
  const userIdentifier = currentUser.name || currentUser.email || "Unknown";
  const result = await updateScheduleEvents(data, userIdentifier);
  if (result.success) {
    revalidatePath("/event");
    revalidatePath("/admin/data/jadwal-kegiatan");
    return { success: true };
  }
  return { success: false, error: result.message };
}

/**
 * Fetches jadwal misa (mass schedule) data.
 * Delegates to schedule service layer.
 * @returns Promise resolving to JadwalMisaData or null
 */
export async function getJadwalMisa(): Promise<JadwalMisaData | null> {
  return getJadwalMisaService();
}
