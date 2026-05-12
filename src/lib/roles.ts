import { SessionUser } from "@/lib/firebase/auth";
import { MeetingBooking, InventoryItem, MeetingPlace, BorrowedItemWithDetails } from "@/features/booking/types";
import { GerejaUnit } from "@/features/schedule/types";
import { Lingkungan, Wilayah } from "@/actions/data";

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
// Set itemWilayahIds if you have inventory item wilayah_ids.
// Set placeWilayahId for room-only bookings (no items) — checked against user's wilayah_id.
export function canManageBooking(
  user: SessionUser | null,
  booking: MeetingBooking,
  itemWilayahIds?: string[],
  placeWilayahId?: string
): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (user.role === "admin_wilayah") {
    // Check booking's own wilayah_id first (event-blocking path: bookings created
    // via createEventWithRoomBlock have wilayah_id set directly, no items/place)
    if (booking.wilayah_id) {
      return booking.wilayah_id === user.wilayah_id;
    }

    // For bookings with inventory items: ALL items must belong to user's wilayah
    if (itemWilayahIds && itemWilayahIds.length > 0) {
      const allGlobal = itemWilayahIds.every(id => !id);
      if (allGlobal) return false; // Cannot manage global/paroki items

      const allItemsInOwnWilayah = itemWilayahIds.every(id => id === user.wilayah_id);
      return allItemsInOwnWilayah;
    }

    // For room-only bookings (no items, no booking.wilayah_id): check the place's wilayah_id
    if (placeWilayahId) {
      return placeWilayahId === user.wilayah_id;
    }

    // Without item info, place info, AND booking.wilayah_id, deny (conservative)
    return false;
  }
  if (user.role === "data_admin") return true;
  return false;
}

// Check if user can manage an inventory item
export function canManageInventoryItem(user: SessionUser | null, item: InventoryItem): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (user.role === "admin_wilayah") {
    if (!item.wilayah_id) return false;
    return user.wilayah_id === item.wilayah_id;
  }
  return false;
}

// Check if user can manage a meeting place
export function canManagePlace(user: SessionUser | null, place: MeetingPlace): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (user.role === "admin_wilayah") {
    if (!place.wilayah_id) return false;
    return user.wilayah_id === place.wilayah_id;
  }
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

// Check if user can manage a gereja
export function canManageGereja(user: SessionUser | null, gereja: GerejaUnit): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (user.role === "admin_wilayah") {
    if (!gereja.wilayah_id) return false;
    return gereja.wilayah_id === user.wilayah_id;
  }
  if (user.role === "data_admin") return true;
  return false;
}

// Check if user can manage a wilayah
export function canManageWilayah(user: SessionUser | null, wilayah: Wilayah): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (user.role === "admin_wilayah") return wilayah.id === user.wilayah_id;
  if (user.role === "data_admin") return true;
  return false;
}

// Check if user can manage a lingkungan
export function canManageLingkungan(user: SessionUser | null, lingkungan: Lingkungan, allWilayah: Wilayah[]): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (user.role === "admin_wilayah") {
    const parentWilayah = allWilayah.find(w => w.lingkungan.some(l => l.id === lingkungan.id));
    if (!parentWilayah) return false;
    return parentWilayah.id === user.wilayah_id;
  }
  if (user.role === "data_admin") return true;
  return false;
}