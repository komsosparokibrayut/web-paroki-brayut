"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { UserRole, getUserRole } from "@/lib/roles";

interface AdminRoleContextType {
    role: UserRole | null; // The effective role (simulated or actual)
    actualRole: UserRole | null; // The real underlying role
    isSuperAdmin: boolean;
    setSimulatedRole: (role: UserRole | null) => void;
    isLoading: boolean;
}

const AdminRoleContext = createContext<AdminRoleContextType | undefined>(undefined);

export function AdminRoleProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser();
    const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);

    // Derived state
    const actualRole = isLoaded ? getUserRole(user) : null;
    const isSuperAdmin = actualRole === "super_admin";

    // If not super admin, we can't simulate. Resets if user changes or role changes.
    useEffect(() => {
        if (isLoaded && !isSuperAdmin && simulatedRole) {
            setSimulatedRole(null);
        }
    }, [isLoaded, isSuperAdmin, simulatedRole]);

    // The role that the app should perceive
    const effectiveRole = (isSuperAdmin && simulatedRole) ? simulatedRole : actualRole;

    return (
        <AdminRoleContext.Provider
            value={{
                role: effectiveRole,
                actualRole,
                isSuperAdmin,
                setSimulatedRole,
                isLoading: !isLoaded,
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
