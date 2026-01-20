"use server";

import { revalidatePath } from "next/cache";
import { getFile, commitFiles } from "@/services/github/content";
import { JadwalEvent, JadwalMisaData } from "../types";

const JADWAL_FILE = "jadwal-kegiatan.json";
const JADWAL_MISA_FILE = "jadwal-misa.json";

// Schedule Actions
export async function getJadwalKegiatan(): Promise<JadwalEvent[]> {
  const content = await getFile(JADWAL_FILE);
  if (!content) return [];
  try {
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
}

export async function saveJadwalKegiatan(data: JadwalEvent[]) {
  try {
    await commitFiles(
      [{ path: JADWAL_FILE, content: JSON.stringify(data, null, 2) }],
      `Update jadwal kegiatan (${data.length} events)`
    );
    revalidatePath("/data/jadwal");
    revalidatePath("/admin/data/jadwal");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Jadwal Misa Actions
export async function getJadwalMisa(): Promise<JadwalMisaData | null> {
  const content = await getFile(JADWAL_MISA_FILE);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

export async function saveJadwalMisa(data: JadwalMisaData) {
  try {
    await commitFiles(
      [{ path: JADWAL_MISA_FILE, content: JSON.stringify(data, null, 2) }],
      `Update jadwal misa data`
    );
    revalidatePath("/jadwal-misa");
    revalidatePath("/admin/data/jadwal-misa");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
