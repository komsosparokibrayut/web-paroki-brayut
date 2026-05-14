/**
 * Unit tests for bookingSchema and eventSchema
 * Run: npm test
 */

import { describe, it, expect } from 'vitest';

// We inline the schemas here so tests are self-contained and don't require
// importing from Next.js server action files (which import firebase-admin).
// The schema definitions are copied verbatim from the source files.

import { z } from 'zod';

// ─── bookingSchema (copied from bookings.ts) ───────────────────────────────────

const borrowedItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().min(1),
  name: z.string().optional(),
  dateTake: z.string().optional(),
  timeTake: z.string().optional(),
  dateReturn: z.string().optional(),
  timeReturn: z.string().optional(),
});

const multiDatesDetailSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const bookingSchema = z.object({
  type: z.enum(['room', 'inventory', 'both']),
  placeId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  userName: z.string().min(2).max(100),
  userContact: z.string().min(5).max(100),
  purpose: z.string().min(3).max(500),
  isAdminDirectCreate: z.boolean().optional(),
  submissionSource: z.enum(['online', 'manual']).optional(),
  borrowedItems: z.array(borrowedItemSchema).optional(),
  location: z.string().optional(),
  inventoryDateTake: z.string().optional(),
  returnDate: z.string().optional(),
  multiDatesDetails: z.array(multiDatesDetailSchema).optional(),
}).refine(
  data => {
    if (data.type === 'room' || data.type === 'both') {
      if (!data.startTime || !data.endTime) return false;
      return data.endTime > data.startTime;
    }
    return true;
  },
  { message: 'Waktu selesai harus setelah waktu mulai', path: ['endTime'] }
);

// ─── eventSchema (copied from events.ts) ──────────────────────────────────────

const eventSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().optional(),
  location: z.string().min(1),
  placeId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  organizer: z.string().min(2),
  contact: z.string().min(5),
  wilayah_id: z.string().optional(),
}).refine(
  data => data.endTime > data.startTime,
  { message: 'Waktu selesai harus setelah waktu mulai', path: ['endTime'] }
);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('bookingSchema', () => {
  const validRoomBooking = {
    type: 'room' as const,
    placeId: 'place-1',
    date: '2026-06-01',
    startTime: '09:00',
    endTime: '10:00',
    userName: 'John Doe',
    userContact: '08123456789',
    purpose: 'Team meeting',
  };

  it('accepts a valid room booking', () => {
    const result = bookingSchema.safeParse(validRoomBooking);
    expect(result.success).toBe(true);
  });

  it('accepts a valid inventory booking (no times required)', () => {
    const result = bookingSchema.safeParse({
      type: 'inventory',
      date: '2026-06-01',
      userName: 'John Doe',
      userContact: '08123456789',
      purpose: 'Borrow equipment',
      borrowedItems: [{ itemId: 'item-1', quantity: 2 }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing userName', () => {
    const result = bookingSchema.safeParse({ ...validRoomBooking, userName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects userName too short', () => {
    const result = bookingSchema.safeParse({ ...validRoomBooking, userName: 'J' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const result = bookingSchema.safeParse({ ...validRoomBooking, date: '01-06-2026' });
    expect(result.success).toBe(false);
  });

  it('rejects endTime <= startTime', () => {
    const result = bookingSchema.safeParse({ ...validRoomBooking, startTime: '10:00', endTime: '09:00' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Waktu selesai harus setelah waktu mulai');
    }
  });

  it('accepts endTime > startTime', () => {
    const result = bookingSchema.safeParse({ ...validRoomBooking, startTime: '09:00', endTime: '10:01' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid type', () => {
    const result = bookingSchema.safeParse({ ...validRoomBooking, type: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('rejects purpose too short', () => {
    const result = bookingSchema.safeParse({ ...validRoomBooking, purpose: 'ab' });
    expect(result.success).toBe(false);
  });

  it('rejects userContact too short', () => {
    const result = bookingSchema.safeParse({ ...validRoomBooking, userContact: '1234' });
    expect(result.success).toBe(false);
  });

  it('accepts multi-dates booking', () => {
    const result = bookingSchema.safeParse({
      ...validRoomBooking,
      multiDatesDetails: [
        { date: '2026-06-01', startTime: '09:00', endTime: '10:00' },
        { date: '2026-06-02', startTime: '14:00', endTime: '15:00' },
      ],
    });
    expect(result.success).toBe(true);
  });

  // NOTE: bookingSchema.placeId is .optional() — the schema does NOT enforce
  // placeId for room types. A refine() would be needed to add that validation.
  // This test documents the current (permissive) behavior.
  it('accepts room booking even without placeId (schema is permissive)', () => {
    const { placeId: _, ...noPlaceId } = validRoomBooking;
    const result = bookingSchema.safeParse(noPlaceId);
    expect(result.success).toBe(true);
  });
});

describe('eventSchema', () => {
  const validEvent = {
    name: 'Sunday Service',
    location: 'Main Hall',
    date: '2026-06-01',
    startTime: '08:00',
    endTime: '10:00',
    organizer: 'Father John',
    contact: '08123456789',
  };

  it('accepts a valid event', () => {
    const result = eventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it('rejects endTime <= startTime', () => {
    const result = eventSchema.safeParse({ ...validEvent, endTime: '07:00' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Waktu selesai harus setelah waktu mulai');
    }
  });

  it('rejects name too short', () => {
    const result = eventSchema.safeParse({ ...validEvent, name: 'AB' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const result = eventSchema.safeParse({ ...validEvent, date: '2026/06/01' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid time format', () => {
    const result = eventSchema.safeParse({ ...validEvent, startTime: '9:00' });
    expect(result.success).toBe(false);
  });

  it('rejects contact too short', () => {
    const result = eventSchema.safeParse({ ...validEvent, contact: '1234' });
    expect(result.success).toBe(false);
  });

  it('accepts optional description', () => {
    const result = eventSchema.safeParse({ ...validEvent, description: 'A lovely service' });
    expect(result.success).toBe(true);
  });

  it('accepts optional placeId', () => {
    const result = eventSchema.safeParse({ ...validEvent, placeId: 'place-1' });
    expect(result.success).toBe(true);
  });

  it('accepts optional wilayah_id', () => {
    const result = eventSchema.safeParse({ ...validEvent, wilayah_id: 'wilayah-1' });
    expect(result.success).toBe(true);
  });
});
