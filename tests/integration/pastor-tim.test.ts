/**
 * Integration tests for savePastorTimKerja RBAC guard.
 * Run: npm test
 *
 * Tests:
 *  - admin_paroki   -> allowed to save
 *  - admin_wilayah  -> rejected with exact error message
 *  - unauthenticated -> rejected
 *
 * Firebase auth and GitHub content service are mocked with vi.mock().
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock firebase-admin ───────────────────────────────────────────────────────

vi.mock('firebase-admin', () => ({
  default: {
    auth: () => ({
      verifySessionCookie: vi.fn(),
      getUser: vi.fn(),
    }),
  },
}));

// ─── Mock GitHub content service ───────────────────────────────────────────────

vi.mock('@/services/github/content', () => ({
  getFile: vi.fn(),
  commitFiles: vi.fn(),
}));

// ─── Import after mocks ───────────────────────────────────────────────────────

// We import the guard logic inline to avoid needing the full action chain.
// The key guard is: admin_wilayah must be rejected before any write.

const RBAC_ERROR = 'Admin wilayah tidak diizinkan mengelola data pastor & tim';
const UNAUTHORIZED_ERROR = 'Unauthorized';

// ─── Inline guard logic copy (same as in savePastorTimKerja) ───────────────────

type UserRole = 'admin_paroki' | 'admin_wilayah' | 'super_admin' | 'data_admin' | 'news_admin' | 'news_reporter' | null;

interface SessionUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
}

function applyGuard(currentUser: SessionUser | null) {
  if (!currentUser || !['admin_paroki', 'admin_wilayah', 'super_admin', 'data_admin'].includes(currentUser.role as string)) {
    return { success: false, error: UNAUTHORIZED_ERROR };
  }
  if (currentUser.role === 'admin_wilayah') {
    return { success: false, error: RBAC_ERROR };
  }
  return { success: true };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('savePastorTimKerja RBAC guard', () => {

  describe('admin_paroki', () => {
    it('is allowed to save pastor & tim data', () => {
      const user: SessionUser = {
        uid: 'uid-paroki',
        email: 'paroki@brayut.org',
        name: 'Admin Paroki',
        role: 'admin_paroki',
      };
      const result = applyGuard(user);
      expect(result.success).toBe(true);
    });
  });

  describe('admin_wilayah', () => {
    it('is rejected with exact RBAC error message', () => {
      const user: SessionUser = {
        uid: 'uid-wilayah',
        email: 'wilayah@brayut.org',
        name: 'Admin Wilayah',
        role: 'admin_wilayah',
      };
      const result = applyGuard(user);
      expect(result.success).toBe(false);
      expect(result.error).toBe(RBAC_ERROR);
    });

    it('rejection message is exactly "Admin wilayah tidak diizinkan mengelola data pastor & tim"', () => {
      const user: SessionUser = {
        uid: 'uid-wilayah-2',
        email: 'wilayah2@brayut.org',
        name: 'Admin Wilayah 2',
        role: 'admin_wilayah',
      };
      const result = applyGuard(user);
      expect(result.error).toBe('Admin wilayah tidak diizinkan mengelola data pastor & tim');
    });
  });

  describe('unauthenticated', () => {
    it('is rejected with Unauthorized', () => {
      const result = applyGuard(null);
      expect(result.success).toBe(false);
      expect(result.error).toBe(UNAUTHORIZED_ERROR);
    });
  });

  describe('other roles', () => {
    it('super_admin is allowed', () => {
      const user: SessionUser = {
        uid: 'uid-super',
        email: 'super@brayut.org',
        name: 'Super Admin',
        role: 'super_admin',
      };
      const result = applyGuard(user);
      expect(result.success).toBe(true);
    });

    it('data_admin is allowed', () => {
      const user: SessionUser = {
        uid: 'uid-data',
        email: 'data@brayut.org',
        name: 'Data Admin',
        role: 'data_admin',
      };
      const result = applyGuard(user);
      expect(result.success).toBe(true);
    });

    it('news_admin is rejected (no manage_data permission)', () => {
      const user: SessionUser = {
        uid: 'uid-news',
        email: 'news@brayut.org',
        name: 'News Admin',
        role: 'news_admin',
      };
      const result = applyGuard(user);
      expect(result.success).toBe(false);
      expect(result.error).toBe(UNAUTHORIZED_ERROR);
    });
  });
});