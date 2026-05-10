export interface MeetingPlace {
  id: string;
  name: string;
  capacity: number;
  description: string;
  isActive: boolean;
  wilayah_id?: string;
  createdAt: number;
  updatedAt: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  totalQuantity: number;
  description: string;
  isActive: boolean;
  wilayah_id?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DateWithTime {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface BorrowedItemWithDetails {
  itemId: string;
  quantity: number;
  name: string;
  dateTake?: string; // YYYY-MM-DD
  timeTake?: string; // HH:mm
  dateReturn?: string; // YYYY-MM-DD
  timeReturn?: string; // HH:mm
}

export interface MeetingBooking {
  id: string;
  type: 'room' | 'inventory' | 'both';
  placeId?: string; // Optional for inventory-only
  date: string; // YYYY-MM-DD (primary date for single-date bookings)
  multiDates?: string[]; // Array of YYYY-MM-DD for backward compatibility
  multiDatesDetails?: DateWithTime[]; // Each date with its own time range
  startTime: string; // HH:mm (used for single-date bookings)
  endTime: string; // HH:mm (used for single-date bookings)
  userName: string;
  userContact: string; // Phone or Email
  purpose: string;
  status: 'pending' | 'confirmed' | 'rejected';
  
  // New Fields
  submissionSource?: 'online' | 'manual';
  isRescheduled?: boolean;
  adminNotes?: string;
  
  // Inventory Specific - Updated to support per-item times
  borrowedItems?: BorrowedItemWithDetails[];
  location?: string;
  inventoryDateTake?: string;
  returnDate?: string;

  // Return Status
  returnStatus?: 'Masih Dipinjam' | 'Sudah Dikembalikan' | 'Dikembalikan dengan Kekurangan';
  returnNotes?: string;
  initialConditionNotes?: string;

  createdAt: number;
  updatedAt: number;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  location: string;
  placeId?: string;
  date: string;
  startTime: string;
  endTime: string;
  organizer: string;
  contact: string;
  wilayah_id?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WilayahApproval {
  id: string;
  bookingId: string;
  wilayah_id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  notes?: string;
  dateTake?: string;
  timeTake?: string;
  dateReturn?: string;
  timeReturn?: string;
  createdAt: number;
  updatedAt: number;
}

export interface MassSchedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  massName?: string;
  location?: string;
  wilayah_id?: string;
  createdAt: number;
  updatedAt: number;
}
