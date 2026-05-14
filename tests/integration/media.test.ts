/**
 * Integration tests for media actions — uploadImages, listImages, deleteImage.
 * Run: npm test
 *
 * Tests cover RBAC:
 * - uploadImages: requires manage_news permission (super_admin, news_admin)
 * - listImages: public, no auth required
 * - deleteImage: requires manage_news permission (super_admin, news_admin)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks inside vi.hoisted to avoid TDZ ──────────────────────────────────
const { mockGetCurrentUser, mockHasPermission, mockListFiles, mockCommitFiles, mockDeleteFile } =
  vi.hoisted(() => {
    const filesStore: { name: string; path: string; size: number }[] = [];

    return {
      mockGetCurrentUser: vi.fn<() => Promise<null | { uid: string; email: string; name: string; picture: string; role: string; wilayah_id?: string }>>(),
      mockHasPermission: vi.fn((role: string | null, _permission: string) => {
        if (!role) return false;
        if (role === "super_admin") return true;
        return role === "news_admin";
      }),
      mockListFiles: vi.fn(async (_dir: string) => [...filesStore]),
      mockCommitFiles: vi.fn(async () => "mock_sha_123"),
      mockDeleteFile: vi.fn(async (_path: string, _msg: string) => {}),
      _filesStore: filesStore,
    };
  });

// ─── Module mocks ─────────────────────────────────────────────────────────────
vi.mock("@/services/github/content", () => ({
  listFiles: mockListFiles,
  commitFiles: mockCommitFiles,
  deleteFile: mockDeleteFile,
}));

vi.mock("@/lib/images/processor", () => ({
  processImage: vi.fn(async (buffer: Buffer) => ({
    buffer,
    width: 800,
    height: 600,
    format: "webp",
    size: buffer.length,
  })),
  generateImageFilename: vi.fn((name: string, type: "banner" | "inline") => {
    const ts = Date.now().toString().slice(-6);
    return `${type === "inline" ? "inline-" : ""}test-${ts}.webp`;
  }),
}));

vi.mock("@/lib/firebase/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
}));

vi.mock("@/lib/roles", () => ({
  hasPermission: mockHasPermission,
}));

// ─── Import after mocks ───────────────────────────────────────────────────────
import { uploadImages, listImages, deleteImage } from "@/actions/media";

// ─── User fixtures ───────────────────────────────────────────────────────────
const superAdminUser = {
  uid: "uid_super",
  email: "super@paroki.com",
  name: "Super Admin",
  picture: "",
  role: "super_admin" as const,
  wilayah_id: undefined,
};

const newsAdminUser = {
  uid: "uid_news",
  email: "news@paroki.com",
  name: "News Admin",
  picture: "",
  role: "news_admin" as const,
  wilayah_id: undefined,
};

const regularUser = {
  uid: "uid_regular",
  email: "user@paroki.com",
  name: "Regular User",
  picture: "",
  role: "admin_paroki" as const,
  wilayah_id: "W001",
};

// ─── Test helpers ─────────────────────────────────────────────────────────────
function createMockFile(name: string, size: number = 1024): File {
  const content = new ArrayBuffer(size);
  return new File([content], name, { type: "image/png" });
}

function createMockFormData(files: File[]): FormData {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));
  return formData;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("uploadImages", () => {
  beforeEach(() => {
    mockGetCurrentUser.mockReset();
    mockCommitFiles.mockClear();
  });

  it("super_admin can upload images", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(superAdminUser);

    const file = createMockFile("banner.png", 5000);
    const result = await uploadImages(createMockFormData([file]), "banner");

    expect(result.success).toBe(true);
    expect(result.paths).toBeDefined();
    expect(result.paths!.length).toBeGreaterThan(0);
    expect(mockCommitFiles).toHaveBeenCalled();
  });

  it("news_admin can upload images", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(newsAdminUser);

    const file = createMockFile("inline.png", 5000);
    const result = await uploadImages(createMockFormData([file]), "inline");

    expect(result.success).toBe(true);
    expect(result.paths).toBeDefined();
  });

  it("rejects admin_paroki (no manage_news permission)", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(regularUser);

    const file = createMockFile("test.png", 5000);
    const result = await uploadImages(createMockFormData([file]), "inline");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/unauthorized/i);
  });

  it("rejects unauthenticated user", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);

    const file = createMockFile("test.png", 5000);
    const result = await uploadImages(createMockFormData([file]), "inline");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/unauthorized/i);
  });

  it("returns error when no files provided", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(superAdminUser);

    const emptyFormData = new FormData();
    const result = await uploadImages(emptyFormData, "inline");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/no files/i);
  });

  it("skips non-image files in the list", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(superAdminUser);

    const file = new File(["content"], "doc.pdf", { type: "application/pdf" });
    const result = await uploadImages(createMockFormData([file]), "inline");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/no valid images/i);
  });

  it("skips files larger than 10MB", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(superAdminUser);

    const bigFile = createMockFile("large.png", 11 * 1024 * 1024);
    const smallFile = createMockFile("small.png", 5000);
    const result = await uploadImages(createMockFormData([bigFile, smallFile]), "inline");

    expect(result.success).toBe(true);
    // Only the small file should be committed
    expect(mockCommitFiles).toHaveBeenCalled();
    const calledFiles = mockCommitFiles.mock.calls[0][0];
    expect(calledFiles.length).toBe(1);
  });
});

describe("listImages", () => {
  beforeEach(() => {
    mockGetCurrentUser.mockReset();
    mockListFiles.mockClear();
  });

  it("returns images without authentication (public)", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null); // not authenticated

    const result = await listImages();

    expect(result).toHaveProperty("banners");
    expect(result).toHaveProperty("inline");
    expect(Array.isArray(result.banners)).toBe(true);
    expect(Array.isArray(result.inline)).toBe(true);
  });

  it("listImages calls listFiles with 'images' directory", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);

    await listImages();

    expect(mockListFiles).toHaveBeenCalledWith("images");
  });

  it("maps file data to MediaImage shape (path, name, size)", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);
    mockListFiles.mockResolvedValueOnce([
      { name: "photo1.webp", path: "images/photo1.webp", size: 2048 },
      { name: "photo2.webp", path: "images/photo2.webp", size: 4096 },
    ]);

    const result = await listImages();

    expect(result.inline).toHaveLength(2);
    expect(result.inline[0]).toEqual(
      expect.objectContaining({
        path: "/images/photo1.webp",
        name: "photo1.webp",
        size: 2048,
      })
    );
  });

  it("returns empty arrays when listFiles throws", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);
    mockListFiles.mockRejectedValueOnce(new Error("GitHub API error"));

    const result = await listImages();

    expect(result.banners).toEqual([]);
    expect(result.inline).toEqual([]);
  });
});

describe("deleteImage", () => {
  beforeEach(() => {
    mockGetCurrentUser.mockReset();
    mockDeleteFile.mockClear();
  });

  it("super_admin can delete an image", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(superAdminUser);

    const result = await deleteImage("/images/photo1.webp");

    expect(result.success).toBe(true);
    expect(mockDeleteFile).toHaveBeenCalledWith(
      "images/photo1.webp",
      expect.stringContaining("Delete image")
    );
  });

  it("news_admin can delete an image", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(newsAdminUser);

    const result = await deleteImage("/images/photo2.webp");

    expect(result.success).toBe(true);
    expect(mockDeleteFile).toHaveBeenCalled();
  });

  it("rejects admin_paroki (no manage_news permission)", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(regularUser);

    const result = await deleteImage("/images/photo.webp");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/unauthorized/i);
    expect(mockDeleteFile).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated user", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);

    const result = await deleteImage("/images/photo.webp");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/unauthorized/i);
  });

  it("strips leading slash from path before calling deleteFile", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(superAdminUser);

    await deleteImage("/images/test.webp");

    expect(mockDeleteFile).toHaveBeenCalledWith(
      "images/test.webp",
      expect.any(String)
    );
  });

  it("works with path without leading slash", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(superAdminUser);

    await deleteImage("images/test.webp");

    expect(mockDeleteFile).toHaveBeenCalledWith(
      "images/test.webp",
      expect.any(String)
    );
  });

  it("returns error when deleteFile throws", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(superAdminUser);
    mockDeleteFile.mockRejectedValueOnce(new Error("GitHub API error"));

    const result = await deleteImage("/images/fail.webp");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/github api error/i);
  });
});