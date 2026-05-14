/**
 * Unit tests for role / permission functions in src/lib/roles.ts
 *
 * Run: npm test
 * Build-verified: YES
 */

import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  canManagePath,
  canManageBooking,
  canManageInventoryItem,
  canManagePlace,
  canManageWilayahApproval,
  canManageGereja,
  canManageWilayah,
  canManageLingkungan,
  canEditWilayah,
  type UserRole,
} from '@/lib/roles';
import type { SessionUser } from '@/lib/firebase/auth';
import type { MeetingBooking, InventoryItem, MeetingPlace } from '@/features/booking/types';
import type { GerejaUnit } from '@/features/schedule/types';
import type { Wilayah, Lingkungan } from '@/actions/data';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeUser(role: UserRole, wilayah_id?: string): SessionUser {
  return {
    uid: 'uid-1',
    email: `${role}@test.com`,
    name: 'Test User',
    role,
    wilayah_id,
    emailVerified: true,
  } as SessionUser;
}

function makeBooking(overrides: Partial<MeetingBooking> = {}): MeetingBooking {
  return {
    id: 'booking-1',
    type: 'room',
    date: '2026-06-01',
    userName: 'Test User',
    userContact: '08123456789',
    purpose: 'Test meeting',
    status: 'pending',
    createdAt: Date.now(),
    ...overrides,
  } as MeetingBooking;
}

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'item-1',
    name: 'Test Item',
    category: 'Test Category',
    totalQuantity: 10,
    isActive: true,
    ...overrides,
  } as InventoryItem;
}

function makePlace(overrides: Partial<MeetingPlace> = {}): MeetingPlace {
  return {
    id: 'place-1',
    name: 'Test Place',
    isActive: true,
    ...overrides,
  } as MeetingPlace;
}

function makeGereja(overrides: Partial<GerejaUnit> = {}): GerejaUnit {
  return {
    id: 'gereja-1',
    name: 'Test Gereja',
    ...overrides,
  } as GerejaUnit;
}

function makeWilayah(overrides: Partial<Wilayah> = {}): Wilayah {
  return {
    id: 'wilayah-1',
    name: 'Wilayah 1',
    lingkungan: [],
    ...overrides,
  } as unknown as Wilayah;
}

function makeLingkungan(overrides: Partial<Lingkungan> = {}): Lingkungan {
  return {
    id: 'lingkungan-1',
    name: 'Lingkungan 1',
    ...overrides,
  } as unknown as Lingkungan;
}

// ─── hasPermission ────────────────────────────────────────────────────────────

describe('hasPermission', () => {
  it('returns false for null role', () => {
    expect(hasPermission(null, 'manage_data')).toBe(false);
  });

  it('super_admin has all permissions', () => {
    const u = makeUser('super_admin');
    expect(hasPermission(u.role, 'manage_data')).toBe(true);
    expect(hasPermission(u.role, 'manage_news')).toBe(true);
    expect(hasPermission(u.role, 'manage_admins')).toBe(true);
  });

  it('admin_wilayah has only manage_data', () => {
    const u = makeUser('admin_wilayah');
    expect(hasPermission(u.role, 'manage_data')).toBe(true);
    expect(hasPermission(u.role, 'manage_news')).toBe(false);
    expect(hasPermission(u.role, 'manage_admins')).toBe(false);
  });

  it('admin_paroki has only manage_data (same as admin_wilayah)', () => {
    const u = makeUser('admin_paroki');
    expect(hasPermission(u.role, 'manage_data')).toBe(true);
    expect(hasPermission(u.role, 'manage_news')).toBe(false);
  });

  it('news_admin has manage_news and manage_news_categories', () => {
    const u = makeUser('news_admin');
    expect(hasPermission(u.role, 'manage_news')).toBe(true);
    expect(hasPermission(u.role, 'manage_news_categories')).toBe(true);
    expect(hasPermission(u.role, 'manage_data')).toBe(false);
  });

  it('news_reporter has only create_news_draft', () => {
    const u = makeUser('news_reporter');
    expect(hasPermission(u.role, 'create_news_draft')).toBe(true);
    expect(hasPermission(u.role, 'manage_news')).toBe(false);
  });

  it('data_admin has manage_data and manage_news_categories', () => {
    const u = makeUser('data_admin');
    expect(hasPermission(u.role, 'manage_data')).toBe(true);
    expect(hasPermission(u.role, 'manage_news_categories')).toBe(true);
  });
});

// ─── canManagePath ────────────────────────────────────────────────────────────

describe('canManagePath', () => {
  it('returns false for null role', () => {
    expect(canManagePath(null, '/admin/meeting-rooms')).toBe(false);
  });

  it('super_admin can access everything', () => {
    expect(canManagePath('super_admin', '/admin/meeting-rooms')).toBe(true);
    expect(canManagePath('super_admin', '/admin/data/umkm')).toBe(true);
    expect(canManagePath('super_admin', '/admin/settings/admins')).toBe(true);
  });

  describe('meeting-rooms path', () => {
    it('admin_wilayah can access /admin/meeting-rooms', () => {
      expect(canManagePath('admin_wilayah', '/admin/meeting-rooms')).toBe(true);
    });
    it('admin_paroki can access /admin/meeting-rooms', () => {
      expect(canManagePath('admin_paroki', '/admin/meeting-rooms')).toBe(true);
    });
    it('data_admin can access /admin/meeting-rooms', () => {
      expect(canManagePath('data_admin', '/admin/meeting-rooms')).toBe(true);
    });
    it('news_admin cannot access /admin/meeting-rooms', () => {
      expect(canManagePath('news_admin', '/admin/meeting-rooms')).toBe(false);
    });
    it('news_reporter cannot access /admin/meeting-rooms', () => {
      expect(canManagePath('news_reporter', '/admin/meeting-rooms')).toBe(false);
    });
  });

  describe('data management paths', () => {
    it('admin_wilayah can access /admin/data paths', () => {
      expect(canManagePath('admin_wilayah', '/admin/data/umkm')).toBe(true);
      expect(canManagePath('admin_wilayah', '/admin/data/wilayah')).toBe(true);
    });
    it('admin_paroki can access /admin/data paths', () => {
      expect(canManagePath('admin_paroki', '/admin/data/umkm')).toBe(true);
      expect(canManagePath('admin_paroki', '/admin/data/wilayah')).toBe(true);
    });
    it('data_admin can access /admin/data paths', () => {
      expect(canManagePath('data_admin', '/admin/data/umkm')).toBe(true);
    });
    it('news_admin cannot access /admin/data paths', () => {
      expect(canManagePath('news_admin', '/admin/data/umkm')).toBe(false);
    });
  });

  describe('news paths', () => {
    it('news_admin can access /admin/posts', () => {
      expect(canManagePath('news_admin', '/admin/posts')).toBe(true);
    });
    it('news_reporter can access /admin/posts', () => {
      expect(canManagePath('news_reporter', '/admin/posts')).toBe(true);
    });
    it('admin_wilayah cannot access /admin/posts', () => {
      expect(canManagePath('admin_wilayah', '/admin/posts')).toBe(false);
    });
  });

  describe('admin settings paths', () => {
    it('no role except super_admin can access /admin/settings/admins', () => {
      expect(canManagePath('admin_wilayah', '/admin/settings/admins')).toBe(false);
      expect(canManagePath('admin_paroki', '/admin/settings/admins')).toBe(false);
      expect(canManagePath('data_admin', '/admin/settings/admins')).toBe(false);
      expect(canManagePath('news_admin', '/admin/settings/admins')).toBe(false);
    });
  });
});

// ─── canManageBooking ─────────────────────────────────────────────────────────

describe('canManageBooking', () => {
  it('returns false for null user', () => {
    expect(canManageBooking(null, makeBooking())).toBe(false);
  });

  it('super_admin can manage any booking', () => {
    const u = makeUser('super_admin');
    expect(canManageBooking(u, makeBooking())).toBe(true);
    expect(canManageBooking(u, makeBooking({ wilayah_id: 'other-wilayah' }))).toBe(true);
  });

  it('admin_paroki can manage any booking (no wilayah restriction)', () => {
    const u = makeUser('admin_paroki');
    expect(canManageBooking(u, makeBooking())).toBe(true);
    expect(canManageBooking(u, makeBooking({ wilayah_id: 'any-wilayah' }))).toBe(true);
  });

  it('data_admin can manage any booking', () => {
    const u = makeUser('data_admin');
    expect(canManageBooking(u, makeBooking())).toBe(true);
  });

  describe('admin_wilayah scoped by booking.wilayah_id', () => {
    it('matches own wilayah → true', () => {
      const u = makeUser('admin_wilayah', 'wilayah-1');
      const b = makeBooking({ wilayah_id: 'wilayah-1' });
      expect(canManageBooking(u, b)).toBe(true);
    });
    it('matches other wilayah → false', () => {
      const u = makeUser('admin_wilayah', 'wilayah-1');
      const b = makeBooking({ wilayah_id: 'other-wilayah' });
      expect(canManageBooking(u, b)).toBe(false);
    });
  });

  describe('admin_wilayah scoped by itemWilayahIds', () => {
    it('all items in own wilayah → true', () => {
      const u = makeUser('admin_wilayah', 'wilayah-1');
      const b = makeBooking({ type: 'inventory', itemWilayahIds: ['wilayah-1'] });
      expect(canManageBooking(u, b, ['wilayah-1'])).toBe(true);
    });
    it('some items in other wilayah → false', () => {
      const u = makeUser('admin_wilayah', 'wilayah-1');
      expect(canManageBooking(u, makeBooking(), ['wilayah-1', 'other'])).toBe(false);
    });
    it('all items global (no wilayah_id) → false', () => {
      const u = makeUser('admin_wilayah', 'wilayah-1');
      expect(canManageBooking(u, makeBooking(), [undefined, undefined])).toBe(false);
    });
  });

  describe('admin_wilayah scoped by placeWilayahId (room-only)', () => {
    it('place in own wilayah → true', () => {
      const u = makeUser('admin_wilayah', 'wilayah-1');
      expect(canManageBooking(u, makeBooking(), [], 'wilayah-1')).toBe(true);
    });
    it('place in other wilayah → false', () => {
      const u = makeUser('admin_wilayah', 'wilayah-1');
      expect(canManageBooking(u, makeBooking(), [], 'other-wilayah')).toBe(false);
    });
  });

  it('admin_wilayah with no scoping info → false', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    expect(canManageBooking(u, makeBooking(), [], undefined)).toBe(false);
  });
});

// ─── canManageInventoryItem ───────────────────────────────────────────────────

describe('canManageInventoryItem', () => {
  it('returns false for null user', () => {
    expect(canManageInventoryItem(null, makeItem())).toBe(false);
  });

  it('super_admin can manage any item', () => {
    expect(canManageInventoryItem(makeUser('super_admin'), makeItem())).toBe(true);
    expect(canManageInventoryItem(makeUser('super_admin'), makeItem({ wilayah_id: 'x' }))).toBe(true);
  });

  it('admin_paroki can manage any item', () => {
    expect(canManageInventoryItem(makeUser('admin_paroki'), makeItem())).toBe(true);
  });

  it('data_admin can manage any item', () => {
    expect(canManageInventoryItem(makeUser('data_admin'), makeItem())).toBe(true);
  });

  it('admin_wilayah: matching wilayah_id → true', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    expect(canManageInventoryItem(u, makeItem({ wilayah_id: 'wilayah-1' }))).toBe(true);
  });

  it('admin_wilayah: no item.wilayah_id → false', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    expect(canManageInventoryItem(u, makeItem({}))).toBe(false);
  });

  it('admin_wilayah: mismatched wilayah → false', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    expect(canManageInventoryItem(u, makeItem({ wilayah_id: 'other' }))).toBe(false);
  });

  it('news_admin cannot manage inventory', () => {
    expect(canManageInventoryItem(makeUser('news_admin'), makeItem())).toBe(false);
  });
});

// ─── canManagePlace ───────────────────────────────────────────────────────────

describe('canManagePlace', () => {
  it('returns false for null user', () => {
    expect(canManagePlace(null, makePlace())).toBe(false);
  });

  it('super_admin can manage any place', () => {
    expect(canManagePlace(makeUser('super_admin'), makePlace())).toBe(true);
  });

  it('admin_paroki can manage any place', () => {
    expect(canManagePlace(makeUser('admin_paroki'), makePlace())).toBe(true);
  });

  it('data_admin can manage any place', () => {
    expect(canManagePlace(makeUser('data_admin'), makePlace())).toBe(true);
  });

  it('admin_wilayah: matching wilayah_id → true', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    expect(canManagePlace(u, makePlace({ wilayah_id: 'wilayah-1' }))).toBe(true);
  });

  it('admin_wilayah: no place.wilayah_id → false', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    expect(canManagePlace(u, makePlace({}))).toBe(false);
  });

  it('admin_wilayah: mismatched wilayah → false', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    expect(canManagePlace(u, makePlace({ wilayah_id: 'other' }))).toBe(false);
  });
});

// ─── canManageWilayahApproval ─────────────────────────────────────────────────

describe('canManageWilayahApproval', () => {
  it('returns false for null user', () => {
    expect(canManageWilayahApproval(null, 'wilayah-1')).toBe(false);
  });

  it('super_admin can manage any approval', () => {
    expect(canManageWilayahApproval(makeUser('super_admin'), 'any-wilayah')).toBe(true);
  });

  it('admin_paroki can manage any approval', () => {
    expect(canManageWilayahApproval(makeUser('admin_paroki'), 'any-wilayah')).toBe(true);
  });

  it('data_admin can manage any approval', () => {
    expect(canManageWilayahApproval(makeUser('data_admin'), 'any-wilayah')).toBe(true);
  });

  it('admin_wilayah: matching approval wilayah → true', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    expect(canManageWilayahApproval(u, 'wilayah-1')).toBe(true);
  });

  it('admin_wilayah: mismatched approval wilayah → false', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    expect(canManageWilayahApproval(u, 'other-wilayah')).toBe(false);
  });

  it('news_admin cannot manage approvals', () => {
    expect(canManageWilayahApproval(makeUser('news_admin'), 'wilayah-1')).toBe(false);
  });
});

// ─── canManageGereja ─────────────────────────────────────────────────────────

describe('canManageGereja', () => {
  it('returns false for null user', () => {
    expect(canManageGereja(null, makeGereja())).toBe(false);
  });

  it('super_admin can manage any gereja', () => {
    expect(canManageGereja(makeUser('super_admin'), makeGereja())).toBe(true);
  });

  it('admin_paroki can manage any gereja', () => {
    expect(canManageGereja(makeUser('admin_paroki'), makeGereja())).toBe(true);
  });

  it('data_admin can manage any gereja', () => {
    expect(canManageGereja(makeUser('data_admin'), makeGereja())).toBe(true);
  });

  it('admin_wilayah: matching wilayah → true', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    expect(canManageGereja(u, makeGereja({ wilayah_id: 'wilayah-1' }))).toBe(true);
  });

  it('admin_wilayah: no gereja.wilayah_id → false', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    expect(canManageGereja(u, makeGereja({}))).toBe(false);
  });

  it('admin_wilayah: mismatched wilayah → false', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    expect(canManageGereja(u, makeGereja({ wilayah_id: 'other' }))).toBe(false);
  });
});

// ─── canManageWilayah ────────────────────────────────────────────────────────

describe('canManageWilayah', () => {
  it('returns false for null user', () => {
    expect(canManageWilayah(null, makeWilayah())).toBe(false);
  });

  it('super_admin can manage any wilayah', () => {
    expect(canManageWilayah(makeUser('super_admin'), makeWilayah())).toBe(true);
  });

  it('admin_paroki can manage any wilayah', () => {
    expect(canManageWilayah(makeUser('admin_paroki'), makeWilayah())).toBe(true);
  });

  it('data_admin can manage any wilayah', () => {
    expect(canManageWilayah(makeUser('data_admin'), makeWilayah())).toBe(true);
  });

  it('admin_wilayah: matching id → true', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    expect(canManageWilayah(u, makeWilayah({ id: 'wilayah-1' }))).toBe(true);
  });

  it('admin_wilayah: mismatched id → false', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    expect(canManageWilayah(u, makeWilayah({ id: 'other' }))).toBe(false);
  });

  it('news roles cannot manage wilayah', () => {
    expect(canManageWilayah(makeUser('news_admin'), makeWilayah())).toBe(false);
    expect(canManageWilayah(makeUser('news_reporter'), makeWilayah())).toBe(false);
  });
});

// ─── canManageLingkungan ─────────────────────────────────────────────────────

describe('canManageLingkungan', () => {
  const allWilayah = [makeWilayah({ id: 'wilayah-1', lingkungan: [makeLingkungan({ id: 'lingkungan-1' })] })];

  it('returns false for null user', () => {
    expect(canManageLingkungan(null, makeLingkungan(), allWilayah)).toBe(false);
  });

  it('super_admin can manage any lingkungan', () => {
    expect(canManageLingkungan(makeUser('super_admin'), makeLingkungan(), allWilayah)).toBe(true);
  });

  it('admin_paroki can manage any lingkungan', () => {
    expect(canManageLingkungan(makeUser('admin_paroki'), makeLingkungan(), allWilayah)).toBe(true);
  });

  it('data_admin can manage any lingkungan', () => {
    expect(canManageLingkungan(makeUser('data_admin'), makeLingkungan(), allWilayah)).toBe(true);
  });

  it('admin_wilayah: lingkungan in own wilayah → true', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    expect(canManageLingkungan(u, makeLingkungan({ id: 'lingkungan-1' }), allWilayah)).toBe(true);
  });

  it('admin_wilayah: lingkungan in other wilayah → false', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    const otherWilayah = [makeWilayah({ id: 'other', lingkungan: [makeLingkungan({ id: 'lingkungan-2' })] })];
    expect(canManageLingkungan(u, makeLingkungan({ id: 'lingkungan-2' }), otherWilayah)).toBe(false);
  });

  it('admin_wilayah: lingkungan not found in any wilayah → false', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    expect(canManageLingkungan(u, makeLingkungan({ id: 'unknown' }), allWilayah)).toBe(false);
  });
});

// ─── canEditWilayah ──────────────────────────────────────────────────────────

describe('canEditWilayah', () => {
  it('returns false for null user', () => {
    expect(canEditWilayah(null, 'wilayah-1')).toBe(false);
  });

  it('super_admin can edit any wilayah', () => {
    expect(canEditWilayah(makeUser('super_admin'), 'any-wilayah')).toBe(true);
  });

  it('admin_paroki can edit any wilayah', () => {
    expect(canEditWilayah(makeUser('admin_paroki'), 'any-wilayah')).toBe(true);
  });

  it('admin_wilayah: matching id → true', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    expect(canEditWilayah(u, 'wilayah-1')).toBe(true);
  });

  it('admin_wilayah: mismatched id → false', () => {
    const u = makeUser('admin_wilayah', 'wilayah-1');
    expect(canEditWilayah(u, 'other')).toBe(false);
  });

  it('data_admin cannot edit wilayah', () => {
    expect(canEditWilayah(makeUser('data_admin'), 'any')).toBe(false);
  });
});
