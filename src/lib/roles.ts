export type UserRole = "super_admin" | "news_admin" | "news_reporter" | "data_admin";

export const ROLES: Record<string, UserRole> = {
  SUPER_ADMIN: "super_admin",
  NEWS_ADMIN: "news_admin",
  NEWS_REPORTER: "news_reporter",
  DATA_ADMIN: "data_admin",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
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

  // Data related paths
  if (path.startsWith("/admin/data") || path.startsWith("/admin/master/categories")) {
     // Note: Categories might be shared, but Data Admin explicitly manages them per requirements
    return role === "data_admin";
  }
  
  // News Admin can also manage categories (implied by "manage news category")
  if (path.startsWith("/admin/master/categories") && role === "news_admin") {
      return true;
  }

  return false;
}
