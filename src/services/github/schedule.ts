/**
 * Schedule Service Layer
 *
 * Provides data access functions for schedule-related content.
 * All schedule data flows through this service layer.
 *
 * @module services/github/schedule
 */

import { getFile, commitFiles } from "./content";
import {
  JadwalEvent,
  JadwalMisaData,
} from "@/features/schedule/types";

// File paths for schedule data
const JADWAL_KEGIATAN_FILE = "jadwal-kegiatan.json";
const JADWAL_MISA_FILE = "jadwal-misa.json";

/**
 * Fetches the list of schedule events (Jadwal Kegiatan).
 * @returns Promise resolving to an array of JadwalEvent objects, or empty array on error.
 */
export async function getScheduleEvents(): Promise<JadwalEvent[]> {
  const content = await getFile(JADWAL_KEGIATAN_FILE);
  if (!content) return [];

  try {
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      // Sort by date/time ascending
      return data.sort(
        (a: JadwalEvent, b: JadwalEvent) =>
          new Date(`${a.date}T${a.time}`).getTime() -
          new Date(`${b.date}T${b.time}`).getTime()
      );
    }
    return [];
  } catch (error) {
    // JSON parse error - log but return empty array for graceful degradation
    console.error('Error parsing jadwal-kegiatan.json:', error);
    return [];
  }
}

/**
 * Updates the list of schedule events (Jadwal Kegiatan).
 * @param data - Array of JadwalEvent objects to persist.
 * @returns Promise resolving to success/error result object.
 */
export async function updateScheduleEvents(
  data: JadwalEvent[]
): Promise<{ success: boolean; message?: string }> {
  try {
    await commitFiles(
      [{ path: JADWAL_KEGIATAN_FILE, content: JSON.stringify(data, null, 2) }],
      `Update jadwal kegiatan (${data.length} events)`
    );
    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, message };
  }
}

/**
 * Fetches the Mass Schedule data (Jadwal Misa).
 * @returns Promise resolving to JadwalMisaData object, or null if not found.
 */
export async function getJadwalMisa(): Promise<JadwalMisaData | null> {
  const content = await getFile(JADWAL_MISA_FILE);
  if (!content) return null;

  try {
    return JSON.parse(content) as JadwalMisaData;
  } catch (error) {
    // JSON parse error - log but return null for graceful degradation
    console.error('Error parsing jadwal-misa.json:', error);
    return null;
  }
}

/**
 * Updates the Mass Schedule data (Jadwal Misa).
 * @param data - JadwalMisaData object to persist.
 * @returns Promise resolving to success/error result object.
 */
export async function updateJadwalMisa(
  data: JadwalMisaData
): Promise<{ success: boolean; message?: string }> {
  try {
    await commitFiles(
      [{ path: JADWAL_MISA_FILE, content: JSON.stringify(data, null, 2) }],
      `Update jadwal misa data`
    );
    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, message };
  }
}
