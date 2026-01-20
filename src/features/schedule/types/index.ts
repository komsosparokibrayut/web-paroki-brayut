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
