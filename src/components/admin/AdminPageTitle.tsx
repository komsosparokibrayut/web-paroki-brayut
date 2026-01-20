"use client";

import { usePathname } from "next/navigation";

const routeTitles: Record<string, string> = {
    "/admin/dashboard": "Dashboard",
    "/admin/settings": "Settings",
    "/admin/posts": "Posts",
    "/admin/media": "Media",
    "/admin/master/categories": "Categories",
    "/admin/data/umkm": "Data UMKM",
    "/admin/data/jadwal": "Data Jadwal",
    "/admin/data/formulir": "Formulir",
    "/admin/data/wilayah": "Data Wilayah",
    "/admin/data/pastor-tim": "Pastor & Tim",
    "/admin/data/statistik": "Statistik",
};

export function AdminPageTitle() {
    const pathname = usePathname();

    // specific match first
    let title = routeTitles[pathname];

    // Fallback logic for sub-pages or unmapped routes
    if (!title) {
        if (pathname.includes("/posts/")) {
            if (pathname.endsWith("/edit")) title = "Edit Post";
            else if (pathname.endsWith("/create")) title = "Create Post";
            else title = "Post Details";
        } else if (pathname.startsWith("/admin/data/")) {
            // Capitalize the last segment as fallback
            const segment = pathname.split("/").pop();
            title = segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "Admin Panel";
        } else {
            title = "Admin Panel";
        }
    }

    return (
        <div className="font-semibold text-sm text-foreground">
            {title}
        </div>
    );
}
