/**
 * Integration tests for Statistik data actions RBAC.
 * Run: npm test
 *
 * Tests role-based access control for saveStatistik:
 *  - admin_paroki: can save (has manage_data)
 *  - admin_wilayah: can save (has manage_data)
 *  - super_admin: can save (has manage_data)
 *  - data_admin: can save (has manage_data)
 *  - news_admin: cannot save (no manage_data)
 *  - news_reporter: cannot save (no manage_data)
 *  - unauthenticated: blocked
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SessionUser } from '@/lib/firebase/auth';
import type { StatistikData } from '@/actions/data';

// ─── vi.hoisted — defined before vi.mock ────────────────────────────────────

const { mockGetCurrentUser, mockGetFile, mockCommitFiles } = vi.hoisted(() => ({
  mockGetCurrentUser: vi.fn<() => Promise<SessionUser | null>>(),
  mockGetFile: vi.fn(),
  mockCommitFiles: vi.fn(),
}));

// ─── Mock dependencies ───────────────────────────────────────────────────────

vi.mock('firebase-admin', () => ({
  default: {
    auth: () => ({
      verifySessionCookie: vi.fn(),
      getUser: vi.fn(),
    }),
  },
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: () => ({ value: '' }),
  })),
}));

vi.mock('@/lib/firebase/auth', () => ({
  getCurrentUser: mockGetCurrentUser,
}));

vi.mock('@/services/github/content', () => ({
  getFile: mockGetFile,
  commitFiles: mockCommitFiles,
}));

// ─── Import action after mocks ───────────────────────────────────────────────

import { saveStatistik } from '@/actions/data';

// ─── Test fixtures ────────────────────────────────────────────────────────────

function makeUser(role: SessionUser['role'], extra?: Partial<SessionUser>): SessionUser {
  return {
    uid: `uid-${role}`,
    email: `${role}@test.com`,
    name: `Test ${role}`,
    picture: '',
    role,
    ...extra,
  };
}

function makeStatistik(overrides: Partial<StatistikData> = {}): StatistikData {
  return {
    churches: 5,
    wilayah: 3,
    wards: 25,
    families: 1500,
    parishioners: 7500,
    ...overrides,
  };
}

const SAMPLE_STATISTIK_DATA = makeStatistik();

beforeEach(() => {
  vi.clearAllMocks();
  mockGetFile.mockResolvedValue(null);
  mockCommitFiles.mockResolvedValue({ success: true });
  mockGetCurrentUser.mockResolvedValue(null);
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('saveStatistik RBAC', () => {

  it('admin_paroki can save statistik', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('admin_paroki'));

    const result = await saveStatistik(SAMPLE_STATISTIK_DATA);

    expect(result.success).toBe(true);
    expect(mockCommitFiles).toHaveBeenCalledTimes(1);
  });

  it('admin_wilayah can save statistik', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('admin_wilayah', { wilayah_id: 'W001' }));

    const result = await saveStatistik(SAMPLE_STATISTIK_DATA);

    expect(result.success).toBe(true);
    expect(mockCommitFiles).toHaveBeenCalledTimes(1);
  });

  it('super_admin can save statistik', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('super_admin'));

    const result = await saveStatistik(SAMPLE_STATISTIK_DATA);

    expect(result.success).toBe(true);
    expect(mockCommitFiles).toHaveBeenCalledTimes(1);
  });

  it('data_admin can save statistik', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('data_admin'));

    const result = await saveStatistik(SAMPLE_STATISTIK_DATA);

    expect(result.success).toBe(true);
    expect(mockCommitFiles).toHaveBeenCalledTimes(1);
  });

  it('news_admin cannot save statistik (no manage_data permission)', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('news_admin'));

    const result = await saveStatistik(SAMPLE_STATISTIK_DATA);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
    expect(mockCommitFiles).not.toHaveBeenCalled();
  });

  it('news_reporter cannot save statistik (no manage_data permission)', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('news_reporter'));

    const result = await saveStatistik(SAMPLE_STATISTIK_DATA);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
    expect(mockCommitFiles).not.toHaveBeenCalled();
  });

  it('unauthenticated user cannot save statistik', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);

    const result = await saveStatistik(SAMPLE_STATISTIK_DATA);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
    expect(mockCommitFiles).not.toHaveBeenCalled();
  });

  it('saves with audit fields (lastUpdated, created_by, created_at, modified_by, modified_at)', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('admin_paroki'));
    mockCommitFiles.mockClear();

    const result = await saveStatistik(SAMPLE_STATISTIK_DATA);

    expect(result.success).toBe(true);
    const savedContent = mockCommitFiles.mock.calls[0][0][0].content;
    const saved = JSON.parse(savedContent);
    expect(saved.lastUpdated).toBeDefined();
    expect(saved.created_by).toBe('Test admin_paroki');
    expect(saved.created_at).toBeDefined();
    expect(saved.modified_by).toBe('Test admin_paroki');
    expect(saved.modified_at).toBeDefined();
  });

  it('preserves existing created_by and created_at when already set', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('admin_paroki'));
    mockCommitFiles.mockClear();

    const existingData = makeStatistik({
      created_by: 'Original Creator',
      created_at: '2024-01-01T00:00:00.000Z',
    });

    await saveStatistik(existingData);

    const savedContent = mockCommitFiles.mock.calls[0][0][0].content;
    const saved = JSON.parse(savedContent);
    expect(saved.created_by).toBe('Original Creator');
    expect(saved.created_at).toBe('2024-01-01T00:00:00.000Z');
    expect(saved.modified_by).toBe('Test admin_paroki');
  });

  it('revalidates statistik and profile paths on success', async () => {
    const { revalidatePath } = await import('next/cache');
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('admin_paroki'));

    await saveStatistik(SAMPLE_STATISTIK_DATA);

    expect(revalidatePath).toHaveBeenCalledWith('/data/statistik');
    expect(revalidatePath).toHaveBeenCalledWith('/profil');
    expect(revalidatePath).toHaveBeenCalledWith('/profil/wilayah');
    expect(revalidatePath).toHaveBeenCalledWith('/admin/data/statistik');
  });

  it('returns error message when commitFiles throws', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('admin_paroki'));
    mockCommitFiles.mockRejectedValueOnce(new Error('GitHub API error'));

    const result = await saveStatistik(SAMPLE_STATISTIK_DATA);

    expect(result.success).toBe(false);
    expect(result.error).toBe('GitHub API error');
  });
});