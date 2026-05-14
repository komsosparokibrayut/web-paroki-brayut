"use server";

import { revalidatePath } from "next/cache";
import { getFile, commitFiles } from "@/services/github/content";
import { getCurrentUser } from "@/lib/firebase/auth";
import { hasPermission, canManageWilayah, canManageLingkungan } from "@/lib/roles";

const UMKM_FILE = "umkm.json";
const STATISTIK_FILE = "statistik.json";

export interface UMKMData {
  id: string;
  owner: string;
  businessName: string;
  address: string;
  phone: string;
  type: string;
  description: string;
  image?: string;
  mapsLink?: string;
  created_by?: string;
  created_at?: string;
  modified_by?: string;
  modified_at?: string;
}

export interface StatistikData {
  churches: number;
  wilayah: number;
  wards: number;
  families: number;
  parishioners: number;
  lastUpdated?: string;
  created_by?: string;
  created_at?: string;
  modified_by?: string;
  modified_at?: string;
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
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Unauthorized" };
    }
    const timestamp = new Date().toISOString();
    const userIdentifier = currentUser.name || currentUser.email || "Unknown";

    const auditedData = data.map(umkm => {
      if (!umkm.created_by) {
        return {
          ...umkm,
          created_by: userIdentifier,
          created_at: timestamp,
          modified_by: userIdentifier,
          modified_at: timestamp,
        };
      }
      return {
        ...umkm,
        modified_by: userIdentifier,
        modified_at: timestamp,
      };
    });

    await commitFiles(
      [{ path: UMKM_FILE, content: JSON.stringify(auditedData, null, 2) }],
      `Update UMKM data (${data.length} entries)`
    );
    revalidatePath("/data/umkm");
    revalidatePath("/admin/data/umkm");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
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
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Unauthorized" };
    }
    const timestamp = new Date().toISOString();
    const userIdentifier = currentUser.name || currentUser.email || "Unknown";
    const dataWithAudit = {
      ...data,
      lastUpdated: new Date().toISOString(),
      created_by: data.created_by || userIdentifier,
      created_at: data.created_at || timestamp,
      modified_by: userIdentifier,
      modified_at: timestamp,
    };
    await commitFiles(
      [{ path: STATISTIK_FILE, content: JSON.stringify(dataWithAudit, null, 2) }],
      "Update statistik data"
    );
    revalidatePath("/data/statistik");
    revalidatePath("/profil"); // Statistics are shown in profile page
    revalidatePath("/profil/wilayah"); 
    revalidatePath("/admin/data/statistik");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
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
  lastEditedBy?: string;
  lastEditedAt?: string;
  created_by?: string;
  created_at?: string;
  modified_by?: string;
  modified_at?: string;
}

export interface Wilayah {
  id: string;
  name: string;
  coordinator: string; // Koordinator/Ketua Wilayah
  address: string;
  email?: string;
  phone?: string;
  lingkungan: Lingkungan[];
  lastEditedBy?: string;
  lastEditedAt?: string;
  created_by?: string;
  created_at?: string;
  modified_by?: string;
  modified_at?: string;
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
  created_by?: string;
  created_at?: string;
  modified_by?: string;
  modified_at?: string;
}

export interface AnggotaTimKerja {
  id: string;
  name: string;
  role?: string;     // e.g. "Ketua Bidang", "Koordinator"
  phone?: string;
  quote?: string;
  created_by?: string;
  created_at?: string;
  modified_by?: string;
  modified_at?: string;
}

// A group (e.g. "Tim Pelayanan Prodiakon") within a section
export interface TimPelayanan {
  id: string;
  name: string;
  members: AnggotaTimKerja[];
  created_by?: string;
  created_at?: string;
  modified_by?: string;
  modified_at?: string;
}

// A top-level section (e.g. "DEWAN HARIAN", "BIDANG 1. LITURGI", "Adhok")
export interface SeksiOrganisasi {
  id: string;
  name: string;
  groups: TimPelayanan[];
  created_by?: string;
  created_at?: string;
  modified_by?: string;
  modified_at?: string;
}

export interface PastorTimKerjaData {
  pastor: Pastor[];
  seksi: SeksiOrganisasi[];
}

export interface Formulir {
  id: string;
  title: string;
  url: string; // Link to PDF or Google Form
  description?: string;
  category: "liturgi" | "pelayanan" | "lainnya";
  created_by?: string;
  created_at?: string;
  modified_by?: string;
  modified_at?: string;
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

export async function saveWilayahLingkungan(data: Wilayah[], editingName?: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Unauthorized" };
    }

for (const wilayah of data) {
      // admin_wilayah: can only manage their own wilayah (by id), and cannot change its name
      if (currentUser.role === "admin_wilayah") {
        if (wilayah.id !== currentUser.wilayah_id) continue; // skip other wilayah entirely
        // admin_wilayah cannot rename their own wilayah
        if (editingName && editingName !== wilayah.name) {
          return { success: false, error: "Admin Wilayah tidak dapat mengubah nama Wilayah" };
        }
      } else if (!canManageWilayah(currentUser, wilayah)) {
        return { success: false, error: "Tidak memiliki otorisasi untuk mengubah data Wilayah/Lingkungan ini" };
      }
      for (const lingkungan of wilayah.lingkungan) {
        if (!canManageLingkungan(currentUser, lingkungan, data)) {
          return { success: false, error: "Tidak memiliki otorisasi untuk mengubah data Wilayah/Lingkungan ini" };
        }
      }
    }

    const timestamp = new Date().toISOString();
    const userIdentifier = currentUser.name || currentUser.email || "Unknown";

    const auditedData = data.map(wilayah => ({
      ...wilayah,
      lastEditedBy: userIdentifier,
      lastEditedAt: timestamp,
      created_by: wilayah.created_by || userIdentifier,
      created_at: wilayah.created_at || timestamp,
      modified_by: userIdentifier,
      modified_at: timestamp,
      lingkungan: wilayah.lingkungan.map(lingkungan => ({
        ...lingkungan,
        lastEditedBy: userIdentifier,
        lastEditedAt: timestamp,
        created_by: lingkungan.created_by || userIdentifier,
        created_at: lingkungan.created_at || timestamp,
        modified_by: userIdentifier,
        modified_at: timestamp,
      }))
    }));

    await commitFiles(
      [{ path: WILAYAH_FILE, content: JSON.stringify(auditedData, null, 2) }],
      `Update wilayah & lingkungan data`
    );
    revalidatePath("/profil/wilayah");
    revalidatePath("/admin/data/wilayah");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Pastor & Tim Kerja Actions
export async function getPastorTimKerja(): Promise<PastorTimKerjaData> {
  const content = await getFile(PASTOR_FILE);
  if (!content) return { pastor: [], seksi: [] };
  try {
    return JSON.parse(content);
  } catch (e) {
    return { pastor: [], seksi: [] };
  }
}

export async function savePastorTimKerja(data: PastorTimKerjaData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Unauthorized" };
    }
    if (currentUser.role === "admin_wilayah") {
      return { success: false, error: "Admin wilayah tidak diizinkan mengelola data pastor & tim" };
    }
    const timestamp = new Date().toISOString();
    const userIdentifier = currentUser.name || currentUser.email || "Unknown";
    const auditedData = {
      pastor: data.pastor.map(item => ({
        ...item,
        created_by: item.created_by || userIdentifier,
        created_at: item.created_at || timestamp,
        modified_by: userIdentifier,
        modified_at: timestamp,
      })),
      seksi: data.seksi.map(seksi => ({
        ...seksi,
        created_by: seksi.created_by || userIdentifier,
        created_at: seksi.created_at || timestamp,
        modified_by: userIdentifier,
        modified_at: timestamp,
        groups: seksi.groups.map(group => ({
          ...group,
          created_by: group.created_by || userIdentifier,
          created_at: group.created_at || timestamp,
          modified_by: userIdentifier,
          modified_at: timestamp,
          members: group.members.map(member => ({
            ...member,
            created_by: member.created_by || userIdentifier,
            created_at: member.created_at || timestamp,
            modified_by: userIdentifier,
            modified_at: timestamp,
          })),
        })),
      })),
    };
    await commitFiles(
      [{ path: PASTOR_FILE, content: JSON.stringify(auditedData, null, 2) }],
      `Update pastor & tim kerja data`
    );
    revalidatePath("/profil/pastor-tim"); 
    revalidatePath("/admin/data/pastor-tim");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
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
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_data")) {
      return { success: false, error: "Unauthorized" };
    }
    const timestamp = new Date().toISOString();
    const userIdentifier = currentUser.name || currentUser.email || "Unknown";
    const auditedData = data.map(item => ({
      ...item,
      created_by: item.created_by || userIdentifier,
      created_at: item.created_at || timestamp,
      modified_by: userIdentifier,
      modified_at: timestamp,
    }));
    await commitFiles(
      [{ path: FORMULIR_FILE, content: JSON.stringify(auditedData, null, 2) }],
      `Update formulir data`
    );
    revalidatePath("/data/formulir"); 
    revalidatePath("/admin/data/formulir");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

