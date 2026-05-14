/**
 * Integration tests for categories.ts and master-categories.ts server actions.
 * Run: npm test
 *
 * Tests cover:
 * - getAllCategories: public (no auth required)
 * - addCategory (categories.ts): auth required, needs manage_news_categories permission
 * - getMasterCategories: public (no auth required)
 * - addCategory / deleteCategory / updateCategory (master-categories.ts): auth required
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock helpers ────────────────────────────────────────────────────────────

const { mockGetCurrentUser, mockFiles, mockCommitFiles } = vi.hoisted(() => {
  // In-memory file store: filename -> content
  const mockFiles: Record<string, string> = {
    "categories.json": JSON.stringify({ categories: ["Berita", "Event"] }),
    "post-categories.json": JSON.stringify({ categories: ["Berita", "Event", "Gereja"] }),
    "umkm-categories.json": JSON.stringify({ categories: ["Kuliner", "Fashion"] }),
    "jadwal-categories.json": JSON.stringify({ categories: ["Liturgi", "Pastoral"] }),
    "formulir-categories.json": JSON.stringify({ categories: ["Liturgi", "Pelayanan"] }),
  };

  return {
    mockFiles,
    mockGetCurrentUser: vi.fn<() => Promise<null | {
      uid: string;
      email: string;
      name: string;
      picture: string;
      role: string;
      wilayah_id?: string;
    }>>(),
    mockCommitFiles: vi.fn(async (files: { path: string; content: string }[], _msg: string) => {
      for (const f of files) {
        mockFiles[f.path] = f.content;
      }
      return "mock-commit-sha";
    }),
  };
});

// ─── Mock modules ────────────────────────────────────────────────────────────

vi.mock("@/services/github/content", () => ({
  getFile: vi.fn(async (path: string) => mockFiles[path] ?? null),
  commitFiles: mockCommitFiles,
}));

vi.mock("@/lib/firebase/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
}));

vi.mock("@/lib/roles", () => ({
  hasPermission: vi.fn((role: string | null, permission: string) => {
    if (!role) return false;
    if (role === "super_admin") return true;
    if (role === "news_admin") return permission === "manage_news_categories" || permission === "manage_news";
    if (role === "data_admin") return permission === "manage_news_categories" || permission === "manage_data";
    if (role === "admin_wilayah") return permission === "manage_data";
    if (role === "admin_paroki") return permission === "manage_data";
    return false;
  }),
}));

// ─── Import actions after mocks ──────────────────────────────────────────────

// We import the modules under test. Because vi.mock is hoisted, imports below
// will receive the mocked versions. Use `await` for the dynamic imports.

describe("categories.ts — getAllCategories", () => {
  beforeEach(() => {
    mockGetCurrentUser.mockResolvedValue(null);
  });

  it("returns categories sorted alphabetically (public, no auth needed)", async () => {
    const { getAllCategories } = await import("@/actions/categories");
    const result = await getAllCategories();
    expect(Array.isArray(result)).toBe(true);
    // Default fixture has ["Berita", "Event"]
    expect(result).toContain("Berita");
    expect(result).toContain("Event");
    // Sorted check
    const sorted = [...result].sort();
    expect(result).toEqual(sorted);
  });

  it("returns empty array when file does not exist", async () => {
    const { getAllCategories } = await import("@/actions/categories");
    delete mockFiles["categories.json"];
    const result = await getAllCategories();
    expect(result).toEqual([]);
  });
});

describe("categories.ts — addCategory", () => {
  beforeEach(() => {
    mockFiles["categories.json"] = JSON.stringify({ categories: ["Berita", "Event"] });
  });

  it("rejects unauthenticated user", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const { addCategory } = await import("@/actions/categories");
    const result = await addCategory("NewCategory");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("rejects authenticated user without manage_news_categories permission", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "a@b.com", name: "Test", picture: "", role: "admin_wilayah",
    });
    const { addCategory } = await import("@/actions/categories");
    const result = await addCategory("NewCategory");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("accepts authenticated user with manage_news_categories permission (super_admin)", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "admin@test.com", name: "Admin", picture: "", role: "super_admin",
    });
    const { addCategory } = await import("@/actions/categories");
    const result = await addCategory("NewCategory");
    expect(result.success).toBe(true);
    expect(mockCommitFiles).toHaveBeenCalled();
    // Verify file was updated
    const saved = JSON.parse(mockFiles["categories.json"]);
    expect(saved.categories).toContain("NewCategory");
  });

  it("accepts authenticated user with manage_news_categories permission (news_admin)", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid2", email: "news@test.com", name: "News Admin", picture: "", role: "news_admin",
    });
    const { addCategory } = await import("@/actions/categories");
    const result = await addCategory("AnotherCategory");
    expect(result.success).toBe(true);
  });

  it("rejects empty category string", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "admin@test.com", name: "Admin", picture: "", role: "super_admin",
    });
    const { addCategory } = await import("@/actions/categories");
    const result = await addCategory("   ");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Category cannot be empty");
  });

  it("does not add duplicate category", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "admin@test.com", name: "Admin", picture: "", role: "super_admin",
    });
    const { addCategory } = await import("@/actions/categories");
    // "Berita" already exists in fixture
    const result = await addCategory("Berita");
    expect(result.success).toBe(true);
    // Should not have called commitFiles for duplicate
    const saved = JSON.parse(mockFiles["categories.json"]);
    expect(saved.categories.filter((c: string) => c === "Berita")).toHaveLength(1);
  });

  it("trims whitespace before saving", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "admin@test.com", name: "Admin", picture: "", role: "super_admin",
    });
    const { addCategory } = await import("@/actions/categories");
    const result = await addCategory("  NewCategory  ");
    expect(result.success).toBe(true);
    const saved = JSON.parse(mockFiles["categories.json"]);
    expect(saved.categories).toContain("NewCategory");
    expect(saved.categories).not.toContain("  NewCategory  ");
  });
});

describe("master-categories.ts — getMasterCategories", () => {
  it("returns all category types sorted (public, no auth needed)", async () => {
    const { getMasterCategories } = await import("@/actions/master-categories");
    const result = await getMasterCategories();
    expect(result).toHaveProperty("post");
    expect(result).toHaveProperty("umkm");
    expect(result).toHaveProperty("jadwal");
    expect(result).toHaveProperty("formulir");
    expect(Array.isArray(result.post)).toBe(true);
    expect(Array.isArray(result.umkm)).toBe(true);
    expect(Array.isArray(result.jadwal)).toBe(true);
    expect(Array.isArray(result.formulir)).toBe(true);
  });

  it("falls back to defaults when files do not exist", async () => {
    delete mockFiles["post-categories.json"];
    delete mockFiles["umkm-categories.json"];
    const { getMasterCategories } = await import("@/actions/master-categories");
    const result = await getMasterCategories();
    // Default post categories per source
    expect(result.post).toContain("Berita");
  });
});

describe("master-categories.ts — addCategory", () => {
  beforeEach(() => {
    mockFiles["post-categories.json"] = JSON.stringify({ categories: ["Berita", "Event"] });
  });

  it("rejects unauthenticated user", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const { addCategory } = await import("@/actions/master-categories");
    const result = await addCategory("post", "NewCat");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("rejects authenticated user without manage_news_categories permission", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "a@b.com", name: "Test", picture: "", role: "admin_wilayah",
    });
    const { addCategory } = await import("@/actions/master-categories");
    const result = await addCategory("post", "NewCat");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("accepts super_admin with manage_news_categories permission", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "admin@test.com", name: "Admin", picture: "", role: "super_admin",
    });
    const { addCategory } = await import("@/actions/master-categories");
    const result = await addCategory("post", "NewCategory");
    expect(result.success).toBe(true);
    expect(mockCommitFiles).toHaveBeenCalled();
  });

  it("rejects empty category string", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "admin@test.com", name: "Admin", picture: "", role: "super_admin",
    });
    const { addCategory } = await import("@/actions/master-categories");
    const result = await addCategory("post", "   ");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Category cannot be empty");
  });

  it("rejects duplicate category (case-insensitive)", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "admin@test.com", name: "Admin", picture: "", role: "super_admin",
    });
    const { addCategory } = await import("@/actions/master-categories");
    const result = await addCategory("post", "BERITA"); // "Berita" exists (case-insensitive check)
    expect(result.success).toBe(false);
    expect(result.error).toBe("Category already exists");
  });

  it("sorts categories after adding", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "admin@test.com", name: "Admin", picture: "", role: "super_admin",
    });
    const { addCategory } = await import("@/actions/master-categories");
    await addCategory("post", "Alpha");
    const saved = JSON.parse(mockFiles["post-categories.json"]);
    expect(saved.categories).toEqual(saved.categories.sort());
  });
});

describe("master-categories.ts — deleteCategory", () => {
  beforeEach(() => {
    mockFiles["post-categories.json"] = JSON.stringify({ categories: ["Berita", "Event", "Gereja"] });
  });

  it("rejects unauthenticated user", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const { deleteCategory } = await import("@/actions/master-categories");
    const result = await deleteCategory("post", "Berita");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("rejects authenticated user without manage_news_categories permission", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "a@b.com", name: "Test", picture: "", role: "admin_wilayah",
    });
    const { deleteCategory } = await import("@/actions/master-categories");
    const result = await deleteCategory("post", "Berita");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("accepts super_admin with permission", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "admin@test.com", name: "Admin", picture: "", role: "super_admin",
    });
    const { deleteCategory } = await import("@/actions/master-categories");
    const result = await deleteCategory("post", "Event");
    expect(result.success).toBe(true);
    const saved = JSON.parse(mockFiles["post-categories.json"]);
    expect(saved.categories).not.toContain("Event");
  });

  it("removes exact match category", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "admin@test.com", name: "Admin", picture: "", role: "super_admin",
    });
    const { deleteCategory } = await import("@/actions/master-categories");
    await deleteCategory("post", "Gereja");
    const saved = JSON.parse(mockFiles["post-categories.json"]);
    expect(saved.categories).not.toContain("Gereja");
    expect(saved.categories).toContain("Berita");
    expect(saved.categories).toContain("Event");
  });
});

describe("master-categories.ts — updateCategory", () => {
  beforeEach(() => {
    mockFiles["umkm-categories.json"] = JSON.stringify({ categories: ["Kuliner", "Fashion", "Jasa"] });
  });

  it("rejects unauthenticated user", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const { updateCategory } = await import("@/actions/master-categories");
    const result = await updateCategory("umkm", "Kuliner", "Makanan");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("rejects authenticated user without manage_news_categories permission", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "a@b.com", name: "Test", picture: "", role: "admin_wilayah",
    });
    const { updateCategory } = await import("@/actions/master-categories");
    const result = await updateCategory("umkm", "Kuliner", "Makanan");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("accepts super_admin with permission", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "admin@test.com", name: "Admin", picture: "", role: "super_admin",
    });
    const { updateCategory } = await import("@/actions/master-categories");
    const result = await updateCategory("umkm", "Kuliner", "Makanan");
    expect(result.success).toBe(true);
    const saved = JSON.parse(mockFiles["umkm-categories.json"]);
    expect(saved.categories).toContain("Makanan");
    expect(saved.categories).not.toContain("Kuliner");
  });

  it("rejects empty new category string", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "admin@test.com", name: "Admin", picture: "", role: "super_admin",
    });
    const { updateCategory } = await import("@/actions/master-categories");
    const result = await updateCategory("umkm", "Jasa", "   ");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Category cannot be empty");
  });

  it("rejects renaming to an existing category (case-insensitive)", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "admin@test.com", name: "Admin", picture: "", role: "super_admin",
    });
    const { updateCategory } = await import("@/actions/master-categories");
    const result = await updateCategory("umkm", "Jasa", "FASHION");
    expect(result.success).toBe(false);
    expect(result.error).toBe("New category name already exists");
  });

  it("allows renaming to same name (no-op but succeeds)", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "admin@test.com", name: "Admin", picture: "", role: "super_admin",
    });
    const { updateCategory } = await import("@/actions/master-categories");
    const result = await updateCategory("umkm", "Jasa", "Jasa");
    expect(result.success).toBe(true);
  });

  it("sorts categories after update", async () => {
    mockGetCurrentUser.mockResolvedValue({
      uid: "uid1", email: "admin@test.com", name: "Admin", picture: "", role: "super_admin",
    });
    const { updateCategory } = await import("@/actions/master-categories");
    await updateCategory("umkm", "Jasa", "Z新的");
    const saved = JSON.parse(mockFiles["umkm-categories.json"]);
    expect(saved.categories).toEqual(saved.categories.sort());
  });
});