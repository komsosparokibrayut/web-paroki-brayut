/**
 * Gereja Service Layer
 * Provides data access for church (gereja) master data.
 * @module services/github/gereja
 */

import { getFile, commitFiles } from "./content";
import { GerejaUnit } from "@/features/schedule/types";

const GEREJA_FILE = "gereja.json";

/**
 * Fetches the list of gereja (churches).
 * @returns Array of GerejaUnit, or empty array if not found.
 */
export async function getGerejaList(): Promise<GerejaUnit[]> {
  const content = await getFile(GEREJA_FILE);
  if (!content) return [];

  try {
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error parsing gereja.json:", error);
    return [];
  }
}

/**
 * Persists the list of gereja (churches).
 * @param data - Array of GerejaUnit to save.
 */
export async function updateGerejaList(
  data: GerejaUnit[]
): Promise<{ success: boolean; message?: string }> {
  try {
    await commitFiles(
      [{ path: GEREJA_FILE, content: JSON.stringify(data, null, 2) }],
      `Update gereja list (${data.length} churches)`
    );
    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, message };
  }
}
