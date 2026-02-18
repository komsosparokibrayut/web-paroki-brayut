"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { UserRole, getUserRole, ROLES } from "@/lib/roles";
import { auth } from "@clerk/nextjs/server";

interface InvitationsResponse {
  data: Array<{
    id: string;
    emailAddress: string;
    status: string;
    createdAt: number;
    role?: string;
  }>;
}

export async function getInvitations() {
  const client = await clerkClient();
  const invitations = await client.invitations.getInvitationList({
      status: "pending"
  });
  
  return {
      data: invitations.data.map(inv => ({
          id: inv.id,
          emailAddress: inv.emailAddress,
          status: inv.status,
          createdAt: inv.createdAt,
          role: inv.publicMetadata?.role as string || "news_reporter" // Default to lowest role if not set
      }))
  };
}

export async function inviteAdmin(email: string, role: UserRole) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const client = await clerkClient();
    
    // Check if current user is Super Admin
    const currentUser = await client.users.getUser(userId);
    const currentUserRole = getUserRole(currentUser);
    
    if (currentUserRole !== "super_admin") {
         throw new Error("Only Super Admins can invite new admins");
    }

    await client.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/registrasi-khusus",
      publicMetadata: {
        role: role
      }
    });
    
    revalidatePath("/admin/settings/admins");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to invite admin:", error);
    return { success: false, error: error.message || "Failed to invite admin" };
  }
}

export async function revokeInvitation(invitationId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const client = await clerkClient();
    
     // Check if current user is Super Admin
    const currentUser = await client.users.getUser(userId);
    if (getUserRole(currentUser) !== "super_admin") {
         throw new Error("Only Super Admins can revoke invitations");
    }

    await client.invitations.revokeInvitation(invitationId);
    
    revalidatePath("/admin/settings/admins");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminUsers() {
    const client = await clerkClient();
    const response = await client.users.getUserList({
        limit: 100,
    });
    
    return response.data.map(user => ({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: user.fullName || user.username || "Unknown",
        imageUrl: user.imageUrl,
        lastSignInAt: user.lastSignInAt,
        role: getUserRole(user) || "news_reporter" // Default fallback
    }));
}

export async function updateUserRole(targetUserId: string, newRole: UserRole) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const client = await clerkClient();

        // Check if current user is Super Admin
        const currentUser = await client.users.getUser(userId);
        if (getUserRole(currentUser) !== "super_admin") {
            throw new Error("Only Super Admins can change roles");
        }

        // Prevent changing own role (optional safety check, but usually good)
        if (userId === targetUserId) {
             throw new Error("You cannot change your own role");
        }

        await client.users.updateUser(targetUserId, {
            publicMetadata: {
                role: newRole
            }
        });

        revalidatePath("/admin/settings/admins");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to update role" };
    }
}


export async function removeAdmin(targetUserId: string) {
    try {
        const { userId } = await auth();
         if (!userId) throw new Error("Unauthorized");

        const client = await clerkClient();

        // Check if current user is Super Admin
        const currentUser = await client.users.getUser(userId);
        if (getUserRole(currentUser) !== "super_admin") {
            throw new Error("Only Super Admins can remove admins");
        }
        
        if (userId === targetUserId) {
            throw new Error("You cannot remove yourself");
       }

        await client.users.deleteUser(targetUserId);

        revalidatePath("/admin/settings/admins");
        return { success: true };
    } catch (error: any) {
         return { success: false, error: error.message || "Failed to remove admin" };
    }
}
