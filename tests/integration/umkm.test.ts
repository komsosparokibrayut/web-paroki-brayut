/**
 * Integration tests for UMKM data actions RBAC.
 * Run: npm test
 *
 * Tests role-based access control for saveUMKM:
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
import type { UMKMData } from '@/actions/data';

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

import { saveUMKM } from '@/actions/data';

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

function makeUMKM(overrides: Partial<UMKMData> = {}): UMKMData {
  return {
    id: 'umkm-1',
    owner: 'John Doe',
    businessName: 'Doe Bakery',
    address: 'Jl.テスト 123',
    phone: '081234567890',
    type: 'Makanan',
    description: 'Fresh bread daily',
    ...overrides,
  };
}

const SAMPLE_UMKM_DATA: UMKMData[] = [makeUMKM()];

beforeEach(() => {
  vi.clearAllMocks();
  mockGetFile.mockResolvedValue(JSON.stringify([]));
  mockCommitFiles.mockResolvedValue({ success: true });
  mockGetCurrentUser.mockResolvedValue(null);
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('saveUMKM RBAC', () => {

  it('admin_paroki can save UMKM', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('admin_paroki'));

    const result = await saveUMKM(SAMPLE_UMKM_DATA);

    expect(result.success).toBe(true);
    expect(mockCommitFiles).toHaveBeenCalledTimes(1);
  });

  it('admin_wilayah can save UMKM', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('admin_wilayah', { wilayah_id: 'W001' }));

    const result = await saveUMKM(SAMPLE_UMKM_DATA);

    expect(result.success).toBe(true);
    expect(mockCommitFiles).toHaveBeenCalledTimes(1);
  });

  it('super_admin can save UMKM', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('super_admin'));

    const result = await saveUMKM(SAMPLE_UMKM_DATA);

    expect(result.success).toBe(true);
    expect(mockCommitFiles).toHaveBeenCalledTimes(1);
  });

  it('data_admin can save UMKM', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('data_admin'));

    const result = await saveUMKM(SAMPLE_UMKM_DATA);

    expect(result.success).toBe(true);
    expect(mockCommitFiles).toHaveBeenCalledTimes(1);
  });

  it('news_admin cannot save UMKM (no manage_data permission)', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('news_admin'));

    const result = await saveUMKM(SAMPLE_UMKM_DATA);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
    expect(mockCommitFiles).not.toHaveBeenCalled();
  });

  it('news_reporter cannot save UMKM (no manage_data permission)', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('news_reporter'));

    const result = await saveUMKM(SAMPLE_UMKM_DATA);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
    expect(mockCommitFiles).not.toHaveBeenCalled();
  });

  it('unauthenticated user cannot save UMKM', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);

    const result = await saveUMKM(SAMPLE_UMKM_DATA);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
    expect(mockCommitFiles).not.toHaveBeenCalled();
  });

  it('saves with audit fields (created_by, created_at, modified_by, modified_at)', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('admin_paroki'));
    mockCommitFiles.mockClear();

    const result = await saveUMKM([makeUMKM()]);

    expect(result.success).toBe(true);
    const savedContent = mockCommitFiles.mock.calls[0][0][0].content;
    const saved = JSON.parse(savedContent);
    expect(saved[0].created_by).toBe('Test admin_paroki');
    expect(saved[0].created_at).toBeDefined();
    expect(saved[0].modified_by).toBe('Test admin_paroki');
    expect(saved[0].modified_at).toBeDefined();
  });

  it('preserves existing audit fields when item already has created_by', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('admin_paroki'));
    mockCommitFiles.mockClear();

    const existingUMKM = makeUMKM({
      created_by: 'Original Creator',
      created_at: '2024-01-01T00:00:00.000Z',
    });

    await saveUMKM([existingUMKM]);

    const savedContent = mockCommitFiles.mock.calls[0][0][0].content;
    const saved = JSON.parse(savedContent);
    expect(saved[0].created_by).toBe('Original Creator');
    expect(saved[0].created_at).toBe('2024-01-01T00:00:00.000Z');
    expect(saved[0].modified_by).toBe('Test admin_paroki');
  });

  it('revalidates /data/umkm and /admin/data/umkm paths on success', async () => {
    const { revalidatePath } = await import('next/cache');
    mockGetCurrentUser.mockResolvedValueOnce(makeUser('admin_paroki'));

    await saveUMKM(SAMPLE_UMKM_DATA);

    expect(revalidatePath).toHaveBeenCalledWith('/data/umkm');
    expect(revalidatePath).toHaveBeenCalledWith('/admin/data/umkm');
  });
});