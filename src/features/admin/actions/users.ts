"use server";

import { adminAuth } from "@/lib/firebase/server";
import { getCurrentUser } from "@/lib/firebase/auth";
import { revalidatePath } from "next/cache";
import { UserRole, getUserRole } from "@/lib/roles";
import { validatePassword } from "@/lib/password-validation";

export async function getAdminUsers() {
    const listResult = await adminAuth.listUsers(100);

    return listResult.users
        .filter(user => user.customClaims?.role) // Only show users with a role
        .map(user => ({
            id: user.uid,
            email: user.email || "",
            name: user.displayName || user.email || "Unknown",
            imageUrl: user.photoURL || "",
            lastSignInAt: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).getTime() : null,
            role: (user.customClaims?.role as UserRole) || "news_reporter",
            phone: (user.customClaims?.phone as string) || "",
            wilayah_id: (user.customClaims?.wilayah_id as string) || "",
        }));
}

export async function inviteAdmin(email: string, role: UserRole, password?: string, phone?: string, wilayah_id?: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("Unauthorized");
        if (currentUser.role !== "super_admin") throw new Error("Only Super Admins can invite new admins");

        // Validate password complexity if provided
        if (password) {
            const validation = validatePassword(password);
            if (!validation.isValid) {
                return { success: false, error: `Password tidak memenuhi syarat: ${validation.errors.join(", ")}` };
            }
        }

        // Check if user already exists in Firebase Auth
        let uid: string;
        try {
            const existingUser = await adminAuth.getUserByEmail(email);
            uid = existingUser.uid;
            // If password provided, update it for existing user
            if (password) {
                await adminAuth.updateUser(uid, { password });
            }
        } catch {
            // User doesn't exist, create them
            const newUser = await adminAuth.createUser({
                email,
                emailVerified: true,
                ...(password ? { password } : {}),
            });
            uid = newUser.uid;
        }

        // Set role, phone, and wilayah_id via custom claims
        const claims: Record<string, unknown> = { role };
        if (phone) claims.phone = phone;
        if (wilayah_id) claims.wilayah_id = wilayah_id;
        await adminAuth.setCustomUserClaims(uid, claims);

        revalidatePath("/admin/settings/admins");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to invite admin:", error);
        return { success: false, error: error.message || "Failed to invite admin" };
    }
}

export async function updateAdminProfile(targetUserId: string, data: { role?: UserRole; phone?: string; wilayah_id?: string; name?: string }) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("Unauthorized");

const isSelf = currentUser.uid === targetUserId;
        const isSuperAdmin = currentUser.role === "super_admin";

        // Self rules (any role):
        // - Can change phone only
        // - Super Admin self can also change their own wilayah (but not role)
        // - Other roles self cannot change role or wilayah
        if (isSelf) {
            if (data.role !== undefined) {
                throw new Error("You cannot change your own role");
            }
            if (data.wilayah_id !== undefined && !isSuperAdmin) {
                throw new Error("You cannot change your own wilayah");
            }
        } else {
            // Others (non-self): only super_admin can change role or wilayah
            if ((data.role !== undefined || data.wilayah_id !== undefined) && !isSuperAdmin) {
                throw new Error("Only Super Admins can change role or wilayah for other users");
            }
        }

        // Super Admin can manage others (role and wilayah)
        // Self can only change phone (not role or wilayah)
        
        if (isSelf) {
            // Self can only change phone
            if (data.role !== undefined) {
                throw new Error("You cannot change your own role");
            }
            if (data.wilayah_id !== undefined) {
                throw new Error("You cannot change your own wilayah");
            }
        } else {
            // For non-self (others), only super_admin can change role or wilayah
            if ((data.role !== undefined || data.wilayah_id !== undefined) && !isSuperAdmin) {
                throw new Error("Only Super Admins can change role or wilayah for other users");
            }
        }

        const user = await adminAuth.getUser(targetUserId);
        const currentRole = user.customClaims?.role as UserRole;

        const updates: Record<string, unknown> = {};
        if (data.role !== undefined) updates.role = data.role;
        if (data.phone !== undefined) updates.phone = data.phone;
        if (data.wilayah_id !== undefined) updates.wilayah_id = data.wilayah_id;
        if (data.name !== undefined) updates.name = data.name;

        await adminAuth.setCustomUserClaims(targetUserId, {
            role: updates.role ?? currentRole,
            ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
            ...(updates.wilayah_id !== undefined ? { wilayah_id: updates.wilayah_id } : {}),
            ...(updates.name !== undefined ? { name: updates.name } : {}),
        });

        revalidatePath("/admin/settings/admins");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to update admin profile" };
    }
}

export async function removeAdmin(targetUserId: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("Unauthorized");
        if (currentUser.role !== "super_admin") throw new Error("Only Super Admins can remove admins");

        if (currentUser.uid === targetUserId) {
            throw new Error("You cannot remove yourself");
        }

        await adminAuth.deleteUser(targetUserId);

        revalidatePath("/admin/settings/admins");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to remove admin" };
    }
}

export async function resetAdminPassword(targetUserId: string, newPassword: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("Unauthorized");
        if (currentUser.role !== "super_admin") throw new Error("Only Super Admins can reset passwords");

        if (currentUser.uid === targetUserId) {
            throw new Error("You cannot reset your own password from here");
        }

        const validation = validatePassword(newPassword);
        if (!validation.isValid) {
            throw new Error(`Password tidak memenuhi syarat: ${validation.errors.join(", ")}`);
        }

        await adminAuth.updateUser(targetUserId, { password: newPassword });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to reset password" };
    }
}

// Invitations are no longer needed with Firebase Auth.
// Admin users are directly created/authorized.
export async function getInvitations() {
    return { data: [] };
}

export async function revokeInvitation(_invitationId: string) {
    return { success: true };
}
