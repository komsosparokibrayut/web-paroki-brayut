"use server";

import { adminAuth } from "@/lib/firebase/server";
import { getCurrentUser } from "@/lib/firebase/auth";
import { revalidatePath } from "next/cache";
import { UserRole, getUserRole } from "@/lib/roles";

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
        }));
}

export async function inviteAdmin(email: string, role: UserRole) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("Unauthorized");
        if (currentUser.role !== "super_admin") throw new Error("Only Super Admins can invite new admins");

        // Check if user already exists in Firebase Auth
        let uid: string;
        try {
            const existingUser = await adminAuth.getUserByEmail(email);
            uid = existingUser.uid;
        } catch {
            // User doesn't exist, create them
            const newUser = await adminAuth.createUser({
                email,
                emailVerified: true,
            });
            uid = newUser.uid;
        }

        // Set role via custom claims
        await adminAuth.setCustomUserClaims(uid, { role });

        revalidatePath("/admin/settings/admins");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to invite admin:", error);
        return { success: false, error: error.message || "Failed to invite admin" };
    }
}

export async function updateUserRole(targetUserId: string, newRole: UserRole) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("Unauthorized");
        if (currentUser.role !== "super_admin") throw new Error("Only Super Admins can change roles");

        if (currentUser.uid === targetUserId) {
            throw new Error("You cannot change your own role");
        }

        await adminAuth.setCustomUserClaims(targetUserId, { role: newRole });

        revalidatePath("/admin/settings/admins");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to update role" };
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

// Invitations are no longer needed with Firebase Auth.
// Admin users are directly created/authorized.
export async function getInvitations() {
    return { data: [] };
}

export async function revokeInvitation(_invitationId: string) {
    return { success: true };
}
