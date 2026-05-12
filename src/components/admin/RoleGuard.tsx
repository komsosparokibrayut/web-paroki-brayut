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
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4 text-center px-4">
                <div className="rounded-full bg-red-100 p-4">
                    <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Akses Ditolak</h2>
                    <p className="mt-1 text-slate-500 text-sm max-w-xs">
                        Anda tidak memiliki izin untuk mengakses halaman ini.
                    </p>
                </div>
                <button
                    onClick={() => router.push("/admin/dashboard")}
                    className="mt-2 inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
                >
                    Kembali ke Dashboard
                </button>
            </div>
        );
    }

    return <>{children}</>;
}
