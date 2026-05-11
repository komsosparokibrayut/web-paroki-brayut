/**
 * Gereja (Church) Unit master data
 */
export interface GerejaUnit {
  id: string;
  name: string;
  description: string;
  alamat: string;
  kategori: 'Gereja Paroki' | 'Gereja Wilayah';
  koordinat: string; // Google Maps share link
  gallery?: string[]; // image URLs
  wilayah_id?: string; // Link to Wilayah for wilayah-based access control
  created_by?: string;
  created_at?: string; // ISO date string for GitHub JSON
  modified_by?: string;
  modified_at?: string;
}

export const GEREJA_KATEGORI = ['Gereja Paroki', 'Gereja Wilayah'] as const;

/**
 * Schedule Event (Jadwal Kegiatan)
 * Used for parish events and activities.
 */
export interface JadwalEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  description: string;
  /** Event category - validated at runtime, stored as string for flexibility */
  category: string;
  imageUrl?: string; // Poster/Flyer
  linkUrl?: string; // Registration or details link
  fileUrl?: string; // Downloadable file
  created_by?: string;
  created_at?: string;
  modified_by?: string;
  modified_at?: string;
}

/** Standard event categories */
export const EVENT_CATEGORIES = ["liturgi", "kegiatan", "rapat", "lainnya"] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

/**
 * Alias for JadwalEvent for backward compatibility
 * @deprecated Use JadwalEvent from @/features/schedule/types instead
 */
export type ScheduleEvent = JadwalEvent;

/**
 * @deprecated Use WeeklySchedule instead
 */
export interface MassTimeSlot {
  day: string;
  times: string[];
  notes?: string;
  kategori?: string; // e.g. "Misa Harian", "Misa Minggu", "Misa OMK"
}

export type WeekNumber = 1 | 2 | 3 | 4 | 5;

export interface WeeklySchedule {
  week: WeekNumber;
  day: string;       // e.g. "Sabtu", "Minggu"
  time: string;      // e.g. "16.00"
  bahasa: string;    // e.g. "Indonesia", "Jawa"
  notes?: string;    // Keterangan tambahan
  date?: string;     // Optional exact date (YYYY-MM-DD) for advance scheduling
}

export interface ChurchUnit {
  id: string;
  name: string;
  location: string;
  isSuspended?: boolean;
  suspendedReason?: string;
  weeklySchedules: WeeklySchedule[];
  created_by?: string;
  created_at?: string;
  modified_by?: string;
  modified_at?: string;
}

export interface SpecialMassEvent {
  id: string;
  name: string;
  time: string;
  location: string;
  description: string;
  date?: string; // YYYY-MM-DD format for date-based filtering
  created_by?: string;
  created_at?: string;
  modified_by?: string;
  modified_at?: string;
}

export interface JadwalMisaData {
  churches: ChurchUnit[];
  specialMasses: SpecialMassEvent[];
}


