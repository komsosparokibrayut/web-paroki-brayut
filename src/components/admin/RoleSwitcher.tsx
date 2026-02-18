"use client";

import { useAdminRole } from "@/components/admin/AdminRoleProvider";
import { ROLE_LABELS, UserRole, ROLES } from "@/lib/roles";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function RoleSwitcher() {
    const { isSuperAdmin, role, setSimulatedRole, actualRole } = useAdminRole();

    if (!isSuperAdmin) return null;

    // Check if we are currently simulating
    const isSimulating = role !== actualRole;

    return (
        <div className="flex items-center gap-2">
            {isSimulating && (
                <Badge variant="destructive" className="animate-pulse bg-amber-600 hover:bg-amber-600">
                    Viewing as {ROLE_LABELS[role as UserRole]}
                </Badge>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-8 border-dashed">
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">View As</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Simulate Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                        value={role || ""}
                        onValueChange={(val) => {
                            if (val === actualRole) {
                                setSimulatedRole(null);
                            } else {
                                setSimulatedRole(val as UserRole);
                            }
                        }}
                    >
                        {Object.entries(ROLE_LABELS).map(([key, label]) => (
                            <DropdownMenuRadioItem key={key} value={key} className="cursor-pointer">
                                {label} {key === actualRole && "(You)"}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                    {isSimulating && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 cursor-pointer"
                                onClick={() => setSimulatedRole(null)}
                            >
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Reset to Super Admin
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
