"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { canManagePath } from "@/lib/roles";
import { Loader2 } from "lucide-react";
import { useAdminRole } from "@/components/admin/AdminRoleProvider";

export function RoleGuard({ children }: { children: React.ReactNode }) {
    const { role, isLoading } = useAdminRole();
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(true); // Optimistic

    useEffect(() => {
        if (isLoading) return;

        // Dashboard is always allowed if authenticated (handled by Layout)
        if (pathname === "/admin/dashboard" || pathname === "/admin") {
            setIsAuthorized(true);
            return;
        }

        if (!canManagePath(role, pathname)) {
            setIsAuthorized(false);
            router.push("/admin/dashboard");
        } else {
            setIsAuthorized(true);
        }
    }, [isLoading, role, pathname, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}
