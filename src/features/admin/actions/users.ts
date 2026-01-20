"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface InvitationsResponse {
  data: Array<{
    id: string;
    emailAddress: string;
    status: string;
    createdAt: number;
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
          createdAt: inv.createdAt
      }))
  };
}

export async function inviteAdmin(email: string) {
  try {
    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/registrasi-khusus",
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
    const client = await clerkClient();
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
        lastSignInAt: user.lastSignInAt
    }));
}
