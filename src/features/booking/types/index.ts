export interface MeetingPlace {
  id: string;
  name: string;
  capacity: number;
  description: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface MeetingBooking {
  id: string;
  placeId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  userName: string;
  userContact: string; // Phone or Email
  purpose: string;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: number;
  updatedAt: number;
}
