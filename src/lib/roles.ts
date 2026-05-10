import { SessionUser } from "@/lib/firebase/auth";
import { MeetingBooking, InventoryItem, MeetingPlace, BorrowedItemWithDetails } from "@/features/booking/types";

export type UserRole = "super_admin" | "admin_wilayah" | "news_admin" | "news_reporter" | "data_admin";

export const ROLES: Record<string, UserRole> = {
  SUPER_ADMIN: "super_admin",
  ADMIN_WILAYAH: "admin_wilayah",
  NEWS_ADMIN: "news_admin",
  NEWS_REPORTER: "news_reporter",
  DATA_ADMIN: "data_admin",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin_wilayah: "Admin Wilayah",
  news_admin: "News Admin",
  news_reporter: "News Reporter",
  data_admin: "Data Admin",
};

// Define permissions structure
export type Permission =
  | "manage_everything"
  | "manage_news"
  | "manage_news_categories"
  | "create_news_draft"
  | "manage_data" // umkm, jadwal, formulir, pastor & tim, wilayah, categories, statistik
  | "manage_admins";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: ["manage_everything", "manage_news", "manage_news_categories", "create_news_draft", "manage_data", "manage_admins"],
  admin_wilayah: ["manage_data"],
  news_admin: ["manage_news", "manage_news_categories", "create_news_draft"],
  news_reporter: ["create_news_draft"],
  data_admin: ["manage_data", "manage_news_categories"],
};

export function getUserRole(customClaims: Record<string, unknown> | undefined): UserRole | null {
  if (!customClaims) return null;
  return (customClaims.role as UserRole) || null;
}

export function hasPermission(role: UserRole | null, permission: Permission): boolean {
  if (!role) return false;

  // Super admin has all permissions
  if (role === "super_admin") return true;

  const permissions = ROLE_PERMISSIONS[role];
  return permissions?.includes(permission) || false;
}

export function canManagePath(role: UserRole | null, path: string): boolean {
  if (!role) return false;
  if (role === "super_admin") return true;

  // News related paths
  if (path.startsWith("/admin/posts") || path.startsWith("/admin/media") || path.startsWith("/admin/gallery")) {
    return role === "news_admin" || role === "news_reporter";
  }

  // Admin settings - only super_admin can access
  if (path.startsWith("/admin/settings/admins")) {
    return false;
  }

  // Meeting rooms - admin_wilayah can access
  if (path.startsWith("/admin/meeting-rooms")) {
    return role === "admin_wilayah" || role === "data_admin";
  }

  // Data related paths
  if (path.startsWith("/admin/data") || path.startsWith("/admin/master/categories")) {
    // Note: Categories might be shared, but Data Admin explicitly manages them per requirements
    return role === "data_admin" || role === "admin_wilayah";
  }

  // News Admin can also manage categories (implied by "manage news category")
  if (path.startsWith("/admin/master/categories") && role === "news_admin") {
    return true;
  }

  return false;
}

// Check if user can edit a specific wilayah
export function canEditWilayah(user: SessionUser | null, targetWilayahId: string): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (user.role === "admin_wilayah") return user.wilayah_id === targetWilayahId;
  return false;
}

// Check if user can manage (edit/delete) a booking
export function canManageBooking(user: SessionUser | null, booking: MeetingBooking): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (user.role === "admin_wilayah") {
    // Admin Wilayah can manage bookings in their system
    // For inventory items, they can only manage items belonging to their wilayah
    return true;
  }
  return false;
}

// Check if user can manage an inventory item
export function canManageInventoryItem(user: SessionUser | null, item: InventoryItem): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (user.role === "admin_wilayah") return user.wilayah_id === item.wilayah_id;
  return false;
}

// Check if user can manage a meeting place
export function canManagePlace(user: SessionUser | null, place: MeetingPlace): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (user.role === "admin_wilayah") return user.wilayah_id === place.wilayah_id;
  return false;
}

// Check if user can manage wilayah approvals (approve/reject)
export function canManageWilayahApproval(user: SessionUser | null, approvalWilayahId: string): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (user.role === "admin_wilayah") return user.wilayah_id === approvalWilayahId;
  return false;
}

// Check if user can see security settings
export function canSeeSecuritySettings(user: SessionUser | null | undefined): boolean {
  if (!user) return false;
  return user.role === "super_admin";
}