"use server";

import { revalidatePath } from "next/cache";
import { getFile, commitFiles } from "@/lib/github/operations";

const UMKM_FILE = "umkm.json";
const STATISTIK_FILE = "statistik.json";
const JADWAL_FILE = "jadwal-kegiatan.json";

export interface UMKMData {
  id: string;
  owner: string;
  businessName: string;
  address: string;
  phone: string;
  type: string;
  description: string;
}

export interface StatistikData {
  churches: number;
  wards: number;
  families: number;
  parishioners: number;
  lastUpdated?: string;
}

export interface JadwalEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  description: string;
  category: "liturgi" | "kegiatan" | "rapat" | "lainnya";
  imageUrl?: string; // Poster/Flyer
  linkUrl?: string; // Registration or details link
}

// UMKM Actions
export async function getUMKM(): Promise<UMKMData[]> {
  const content = await getFile(UMKM_FILE);
  if (!content) return [];
  try {
    return JSON.parse(content);
  } catch (e) {
    // Return empty array for invalid JSON - error handling without console noise
    return [];
  }
}

export async function saveUMKM(data: UMKMData[]) {
  try {
    await commitFiles(
      [{ path: UMKM_FILE, content: JSON.stringify(data, null, 2) }],
      `Update UMKM data (${data.length} entries)`
    );
    revalidatePath("/data/umkm");
    revalidatePath("/admin/data/umkm");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Statistik Actions
export async function getStatistik(): Promise<StatistikData | null> {
  const content = await getFile(STATISTIK_FILE);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch (e) {
    // Return null for invalid JSON - error handling without console noise
    return null;
  }
}

export async function saveStatistik(data: StatistikData) {
  try {
    const dataWithDate = {
        ...data,
        lastUpdated: new Date().toISOString()
    };
    await commitFiles(
      [{ path: STATISTIK_FILE, content: JSON.stringify(dataWithDate, null, 2) }],
      "Update statistik data"
    );
    revalidatePath("/data/statistik");
    revalidatePath("/profil"); // Statistics are shown in profile page too
    revalidatePath("/admin/data/statistik");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Schedule Actions
export async function getJadwalKegiatan(): Promise<JadwalEvent[]> {
    const content = await getFile(JADWAL_FILE);
    if (!content) return [];
    try {
        return JSON.parse(content);
    } catch (e) {
        // Return empty array for invalid JSON - error handling without console noise
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

// --- New CMS Features ---

const WILAYAH_FILE = "wilayah-lingkungan.json";
const PASTOR_FILE = "pastor-tim-kerja.json";
const FORMULIR_FILE = "formulir.json";

export interface Lingkungan {
  id: string;
  name: string;
  chief: string; // Ketua Lingkungan
  address: string;
  email?: string;
  phone?: string;
}

export interface Wilayah {
  id: string;
  name: string;
  coordinator: string; // Koordinator/Ketua Wilayah
  address: string;
  email?: string;
  phone?: string;
  lingkungan: Lingkungan[];
}

export interface Pastor {
  id: string;
  name: string;
  role: string; // e.g. "Pastor Kepala", "Pastor Rekan"
  imageUrl?: string;
  description?: string;
  quote?: string;
  email?: string;
  phone?: string;
}

export interface TimKerja {
  id: string;
  name: string;
  role: string;
  division: string; // e.g. "Sekretariat", "Keuangan"
  quote?: string;
  email?: string;
  phone?: string;
}

export interface PastorTimKerjaData {
  pastor: Pastor[];
  timKerja: TimKerja[];
}

export interface Formulir {
  id: string;
  title: string;
  url: string; // Link to PDF or Google Form
  description?: string;
  category: "liturgi" | "pelayanan" | "lainnya";
}

// Wilayah & Lingkungan Actions
export async function getWilayahLingkungan(): Promise<Wilayah[]> {
  const content = await getFile(WILAYAH_FILE);
  if (!content) return [];
  try {
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
}

export async function saveWilayahLingkungan(data: Wilayah[]) {
  try {
    await commitFiles(
      [{ path: WILAYAH_FILE, content: JSON.stringify(data, null, 2) }],
      `Update wilayah & lingkungan data`
    );
    revalidatePath("/profil/lingkungan");
    revalidatePath("/admin/data/wilayah");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Pastor & Tim Kerja Actions
export async function getPastorTimKerja(): Promise<PastorTimKerjaData> {
  const content = await getFile(PASTOR_FILE);
  if (!content) return { pastor: [], timKerja: [] };
  try {
    return JSON.parse(content);
  } catch (e) {
    return { pastor: [], timKerja: [] };
  }
}

export async function savePastorTimKerja(data: PastorTimKerjaData) {
  try {
    await commitFiles(
      [{ path: PASTOR_FILE, content: JSON.stringify(data, null, 2) }],
      `Update pastor & tim kerja data`
    );
    revalidatePath("/profil/pastor"); // Assumption, will verify
    revalidatePath("/admin/data/pastor-tim");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Formulir Actions
export async function getFormulir(): Promise<Formulir[]> {
  const content = await getFile(FORMULIR_FILE);
  if (!content) return [];
  try {
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
}

export async function saveFormulir(data: Formulir[]) {
  try {
    await commitFiles(
      [{ path: FORMULIR_FILE, content: JSON.stringify(data, null, 2) }],
      `Update formulir data`
    );
    revalidatePath("/layanan/formulir"); // Assumption, will verify
    revalidatePath("/admin/data/formulir");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Jadwal Misa Actions
const JADWAL_MISA_FILE = "jadwal-misa.json";

export interface MassTimeSlot {
  day: string;
  times: string[];
  notes?: string;
}

export interface ChurchUnit {
  id: string;
  name: string;
  location: string;
  schedules: MassTimeSlot[];
}

export interface SpecialMassEvent {
  id: string;
  name: string;
  time: string;
  location: string;
  description: string;
}

export interface JadwalMisaData {
  churches: ChurchUnit[];
  specialMasses: SpecialMassEvent[];
}

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
