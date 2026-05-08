export interface ChurchStatistics {
  churches: number; // Lingkungan/Wilayah changes meaning often, but let's stick to JSON
  wards: number;
  families: number;
  parishioners: number;
  lastUpdated: string;
}

// Re-export types from feature types for backward compatibility
export type { ScheduleEvent } from "@/features/schedule/types";
export type { SpecialMassEvent } from "@/features/schedule/types";

export interface UMKM {
  id: string;
  businessName: string;
  owner: string;
  address: string;
  phone: string;
  type: string;
  description: string;
  image?: string; // Optional if not in JSON yet, but good for UI
}

