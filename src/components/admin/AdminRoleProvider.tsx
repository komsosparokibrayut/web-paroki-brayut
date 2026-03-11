"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserRole } from "@/lib/roles";
import type { SessionUser } from "@/lib/firebase/auth";

interface AdminRoleContextType {
    role: UserRole | null; // The effective role (simulated or actual)
    actualRole: UserRole | null; // The real underlying role
    isSuperAdmin: boolean;
    setSimulatedRole: (role: UserRole | null) => void;
    isLoading: boolean;
    user: SessionUser | null;
}

const AdminRoleContext = createContext<AdminRoleContextType | undefined>(undefined);

interface AdminRoleProviderProps {
    children: React.ReactNode;
    serverUser: SessionUser;
}

export function AdminRoleProvider({ children, serverUser }: AdminRoleProviderProps) {
    const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);

    const actualRole = serverUser.role;
    const isSuperAdmin = actualRole === "super_admin";

    // If not super admin, we can't simulate. Resets if role changes.
    useEffect(() => {
        if (!isSuperAdmin && simulatedRole) {
            setSimulatedRole(null);
        }
    }, [isSuperAdmin, simulatedRole]);

    // The role that the app should perceive
    const effectiveRole = (isSuperAdmin && simulatedRole) ? simulatedRole : actualRole;

    return (
        <AdminRoleContext.Provider
            value={{
                role: effectiveRole,
                actualRole,
                isSuperAdmin,
                setSimulatedRole,
                isLoading: false,
                user: serverUser,
            }}
        >
            {children}
        </AdminRoleContext.Provider>
    );
}

export function useAdminRole() {
    const context = useContext(AdminRoleContext);
    if (context === undefined) {
        throw new Error("useAdminRole must be used within an AdminRoleProvider");
    }
    return context;
}
