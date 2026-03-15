export interface MeetingPlace {
  id: string;
  name: string;
  capacity: number;
  description: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  totalQuantity: number;
  description: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface MeetingBooking {
  id: string;
  type: 'room' | 'inventory' | 'both';
  placeId?: string; // Optional for inventory-only
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  userName: string;
  userContact: string; // Phone or Email
  purpose: string;
  status: 'pending' | 'confirmed' | 'rejected';
  
  // New Fields
  submissionSource?: 'online' | 'manual';
  isRescheduled?: boolean;
  adminNotes?: string;
  
  // Inventory Specific
  borrowedItems?: { itemId: string; quantity: number; name: string }[];
  location?: string;
  inventoryDateTake?: string;
  returnDate?: string;

  createdAt: number;
  updatedAt: number;
}
