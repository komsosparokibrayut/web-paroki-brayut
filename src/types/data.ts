export interface ChurchStatistics {
  churches: number; // Lingkungan/Wilayah changes meaning often, but let's stick to JSON
  wards: number;
  families: number;
  parishioners: number;
  lastUpdated: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  imageUrl?: string;
  linkUrl?: string;
}

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
