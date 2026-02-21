"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";

/**
 * Renders the bottom-center Toaster only on non-admin pages.
 * Admin pages have their own bottom-right Toaster in the admin layout.
 */
export default function MainToaster() {
    const pathname = usePathname();
    if (pathname.startsWith("/admin")) return null;
    return <Toaster position="bottom-center" />;
}
