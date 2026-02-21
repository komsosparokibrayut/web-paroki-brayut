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
}

/** Standard event categories */
export const EVENT_CATEGORIES = ["liturgi", "kegiatan", "rapat", "lainnya"] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

/**
 * Alias for JadwalEvent for backward compatibility
 * @deprecated Use JadwalEvent from @/features/schedule/types instead
 */
export type ScheduleEvent = JadwalEvent;

export interface MassTimeSlot {
  day: string;
  times: string[];
  notes?: string;
  kategori?: string; // e.g. "Misa Harian", "Misa Minggu", "Misa OMK"
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


