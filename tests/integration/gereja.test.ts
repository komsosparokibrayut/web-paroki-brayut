/**
 * Integration tests for saveGereja RBAC.
 * Run: npm test
 *
 * Tests role-based access control for the saveGereja server action:
 *  - admin_paroki can save any gereja (full access)
 *  - admin_wilayah can save gereja within their wilayah
 *  - admin_wilayah cannot save gereja outside their wilayah (rejected)
 *  - unauthenticated requests are rejected
 *
 * Mocks:
 *  - @/lib/firebase/auth        → getCurrentUser (session cookie → SessionUser)
 *  - @/services/github/gereja   → updateGerejaList (GitHub commit)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { SessionUser } from '@/lib/firebase/auth';
import type { GerejaUnit } from '@/features/schedule/types';

// ─── Mock firebase-admin (needed by getCurrentUser mock) ──────────────────────

vi.mock('firebase-admin', () => ({
  default: {
    auth: () => ({
      verifySessionCookie: vi.fn(),
      getUser: vi.fn(),
    }),
    firestore: () => ({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(),
          set: vi.fn(),
          update: vi.fn(),
        })),
      })),
    }),
  },
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

// ─── vi.hoisted — defined before vi.mock, accessible inside mock factory ───────
// See: https://vitest.dev/api/vi.html#vi-hoisted

const { mockGetCurrentUser, mockUpdateGerejaList } = vi.hoisted(() => ({
  mockGetCurrentUser: vi.fn<() => Promise<SessionUser | null>>(),
  mockUpdateGerejaList: vi.fn(),
}));

vi.mock('@/lib/firebase/auth', () => ({
  getCurrentUser: mockGetCurrentUser,
}));

vi.mock('@/services/github/gereja', () => ({
  updateGerejaList: mockUpdateGerejaList,
}));

// ─── Import the action after mocks are set up ─────────────────────────────────

import { saveGereja } from '@/features/gereja/actions/index';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeGereja = (overrides: Partial<GerejaUnit> = {}): GerejaUnit => ({
  id: 'gereja-1',
  name: 'Gereja St. Yakobus',
  description: 'Par间bulan',
  alamat: 'Jl. Test No. 1',
  kategori: 'Gereja Wilayah',
  koordinat: 'https://maps.google.com/maps?q=-7.1234,110.5678',
  wilayah_id: 'W1',
  gallery: [],
  ...overrides,
});

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('saveGereja RBAC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Unauthenticated ──────────────────────────────────────────────────────────

  describe('unauthenticated', () => {
    it('rejects when no session cookie is present', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const result = await saveGereja([makeGereja()]);

      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockUpdateGerejaList).not.toHaveBeenCalled();
    });

    it('rejects when user has no role (malformed session)', async () => {
      mockGetCurrentUser.mockResolvedValue({
        uid: 'uid-1',
        email: 'user@example.com',
        name: 'Test User',
        picture: '',
        role: null as unknown as SessionUser['role'],
      });

      const result = await saveGereja([makeGereja()]);

      expect(result).toEqual({ success: false, error: 'Unauthorized' });
    });
  });

  // ── admin_paroki ─────────────────────────────────────────────────────────────

  describe('admin_paroki', () => {
    it('saves any gereja successfully', async () => {
      mockGetCurrentUser.mockResolvedValue({
        uid: 'uid-paroki',
        email: 'paroki@brayut.or.id',
        name: 'Admin Paroki',
        picture: '',
        role: 'admin_paroki',
      });
      mockUpdateGerejaList.mockResolvedValue({ success: true });

      const gereja = makeGereja({ id: 'any-id', wilayah_id: 'W99' });
      const result = await saveGereja([gereja]);

      expect(result).toEqual({ success: true });
      expect(mockUpdateGerejaList).toHaveBeenCalledTimes(1);

      const savedData = mockUpdateGerejaList.mock.calls[0][0] as GerejaUnit[];
      expect(savedData).toHaveLength(1);
      expect(savedData[0].modified_by).toBe('Admin Paroki');
      expect(savedData[0].modified_at).toBeDefined();
    });

    it('audits created_by / created_at on new gereja', async () => {
      mockGetCurrentUser.mockResolvedValue({
        uid: 'uid-paroki',
        email: 'paroki@brayut.or.id',
        name: 'Admin Paroki',
        picture: '',
        role: 'admin_paroki',
      });
      mockUpdateGerejaList.mockResolvedValue({ success: true });

      const newGereja = makeGereja({ id: 'new-gereja', created_by: undefined });
      await saveGereja([newGereja]);

      const savedData = mockUpdateGerejaList.mock.calls[0][0] as GerejaUnit[];
      expect(savedData[0].created_by).toBe('Admin Paroki');
      expect(savedData[0].created_at).toBeDefined();
    });

    it('propagates GitHub error from updateGerejaList', async () => {
      mockGetCurrentUser.mockResolvedValue({
        uid: 'uid-paroki',
        email: 'paroki@brayut.or.id',
        name: 'Admin Paroki',
        picture: '',
        role: 'admin_paroki',
      });
      mockUpdateGerejaList.mockResolvedValue({ success: false, message: 'GitHub rate limit' });

      const result = await saveGereja([makeGereja()]);

      expect(result).toEqual({ success: false, error: 'GitHub rate limit' });
    });
  });

  // ── admin_wilayah ────────────────────────────────────────────────────────────

  describe('admin_wilayah', () => {
    it('saves gereja within their wilayah successfully', async () => {
      mockGetCurrentUser.mockResolvedValue({
        uid: 'uid-wilayah',
        email: 'wilayah@brayut.or.id',
        name: 'Admin Wilayah 1',
        picture: '',
        role: 'admin_wilayah',
        wilayah_id: 'W1',
      });
      mockUpdateGerejaList.mockResolvedValue({ success: true });

      const gereja = makeGereja({ id: 'gereja-w1', wilayah_id: 'W1' });
      const result = await saveGereja([gereja]);

      expect(result).toEqual({ success: true });
      expect(mockUpdateGerejaList).toHaveBeenCalledTimes(1);
    });

    it('saves multiple gereja all within their wilayah', async () => {
      mockGetCurrentUser.mockResolvedValue({
        uid: 'uid-wilayah',
        email: 'wilayah@brayut.or.id',
        name: 'Admin Wilayah 1',
        picture: '',
        role: 'admin_wilayah',
        wilayah_id: 'W1',
      });
      mockUpdateGerejaList.mockResolvedValue({ success: true });

      const data = [
        makeGereja({ id: 'gereja-w1-a', wilayah_id: 'W1' }),
        makeGereja({ id: 'gereja-w1-b', wilayah_id: 'W1' }),
      ];
      const result = await saveGereja(data);

      expect(result).toEqual({ success: true });
      expect(mockUpdateGerejaList).toHaveBeenCalledTimes(1);

      const savedData = mockUpdateGerejaList.mock.calls[0][0] as GerejaUnit[];
      expect(savedData).toHaveLength(2);
    });

    it('rejects saving gereja outside their wilayah (different wilayah_id)', async () => {
      mockGetCurrentUser.mockResolvedValue({
        uid: 'uid-wilayah',
        email: 'wilayah@brayut.or.id',
        name: 'Admin Wilayah 1',
        picture: '',
        role: 'admin_wilayah',
        wilayah_id: 'W1',
      });

      const outsideGereja = makeGereja({
        id: 'gereja-w2',
        wilayah_id: 'W2', // not W1
      });
      const result = await saveGereja([outsideGereja]);

      expect(result).toEqual({
        success: false,
        error: 'Tidak memiliki otorisasi untuk mengubah data Gereja ini',
      });
      expect(mockUpdateGerejaList).not.toHaveBeenCalled();
    });

    it('rejects when at least one gereja in the batch is outside their wilayah', async () => {
      mockGetCurrentUser.mockResolvedValue({
        uid: 'uid-wilayah',
        email: 'wilayah@brayut.or.id',
        name: 'Admin Wilayah 1',
        picture: '',
        role: 'admin_wilayah',
        wilayah_id: 'W1',
      });

      const data = [
        makeGereja({ id: 'gereja-w1-ok', wilayah_id: 'W1' }),
        makeGereja({ id: 'gereja-w2-out', wilayah_id: 'W2' }),
      ];
      const result = await saveGereja(data);

      expect(result).toEqual({
        success: false,
        error: 'Tidak memiliki otorisasi untuk mengubah data Gereja ini',
      });
      expect(mockUpdateGerejaList).not.toHaveBeenCalled();
    });

    it('rejects Gereja Paroki (no wilayah_id) for admin_wilayah — canManageGereja denies it', async () => {
      mockGetCurrentUser.mockResolvedValue({
        uid: 'uid-wilayah',
        email: 'wilayah@brayut.or.id',
        name: 'Admin Wilayah 1',
        picture: '',
        role: 'admin_wilayah',
        wilayah_id: 'W1',
      });

      // Gereja Paroki has no wilayah_id — canManageGereja returns false for admin_wilayah.
      // The skip condition `gereja.wilayah_id !== currentUser.wilayah_id` is false (undefined !== 'W1'),
      // so it does NOT skip — validation proceeds and fails.
      const parokiGereja = makeGereja({ id: 'paroki-gereja', wilayah_id: undefined });
      const result = await saveGereja([parokiGereja]);

      expect(result).toEqual({
        success: false,
        error: 'Tidak memiliki otorisasi untuk mengubah data Gereja ini',
      });
      expect(mockUpdateGerejaList).not.toHaveBeenCalled();
    });

    it('rejects user without manage_data permission', async () => {
      // news_admin has manage_news but not manage_data
      mockGetCurrentUser.mockResolvedValue({
        uid: 'uid-news',
        email: 'news@brayut.or.id',
        name: 'News Admin',
        picture: '',
        role: 'news_admin',
      });

      const result = await saveGereja([makeGereja()]);

      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockUpdateGerejaList).not.toHaveBeenCalled();
    });
  });

  // ── super_admin ─────────────────────────────────────────────────────────────

  describe('super_admin', () => {
    it('saves any gereja (full access)', async () => {
      mockGetCurrentUser.mockResolvedValue({
        uid: 'uid-root',
        email: 'root@brayut.or.id',
        name: 'Root Admin',
        picture: '',
        role: 'super_admin',
      });
      mockUpdateGerejaList.mockResolvedValue({ success: true });

      const result = await saveGereja([makeGereja({ wilayah_id: 'W999' })]);

      expect(result).toEqual({ success: true });
      expect(mockUpdateGerejaList).toHaveBeenCalledTimes(1);
    });
  });

  // ── data_admin ───────────────────────────────────────────────────────────────

  describe('data_admin', () => {
    it('saves any gereja (manage_data permission)', async () => {
      mockGetCurrentUser.mockResolvedValue({
        uid: 'uid-data',
        email: 'data@brayut.or.id',
        name: 'Data Admin',
        picture: '',
        role: 'data_admin',
      });
      mockUpdateGerejaList.mockResolvedValue({ success: true });

      const result = await saveGereja([makeGereja()]);

      expect(result).toEqual({ success: true });
      expect(mockUpdateGerejaList).toHaveBeenCalledTimes(1);
    });
  });
});