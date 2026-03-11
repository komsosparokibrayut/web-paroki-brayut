"use server";

import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/server";
import { getCurrentUser } from "@/lib/firebase/auth";
import crypto from "crypto";

const AUTH_COOKIE_NAME = "meeting_room_auth";

/**
 * Hash a password with SHA-256 for storage.
 */
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * Generate an HMAC-signed cookie token to prevent forgery.
 */
function generateAuthToken(): string {
  const secret = process.env.NEXTAUTH_SECRET || "fallback-secret";
  const payload = `meeting_room_auth:${Date.now()}`;
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}:${hmac}`;
}

/**
 * Verify an HMAC-signed cookie token.
 */
function verifyAuthToken(token: string): boolean {
  const secret = process.env.NEXTAUTH_SECRET || "fallback-secret";
  const parts = token.split(":");
  if (parts.length < 3) return false;

  const hmac = parts.pop()!;
  const payload = parts.join(":");
  const expectedHmac = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // Timing-safe comparison
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac));
  } catch {
    return false;
  }
}

export async function getMeetingRoomPassword(): Promise<string | null> {
  try {
    const doc = await adminDb.collection('settings').doc('meeting_room').get();
    if (doc.exists) {
      return doc.data()?.passwordHash as string || null;
    }
    // Fallback: hash the env password
    const envPw = process.env.MEETING_ROOM_PASSWORD;
    return envPw ? hashPassword(envPw) : null;
  } catch (error) {
    console.error("Error fetching password:", error);
    const envPw = process.env.MEETING_ROOM_PASSWORD;
    return envPw ? hashPassword(envPw) : null;
  }
}

export async function setMeetingRoomPassword(password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "super_admin") {
      return { success: false, error: "Unauthorized" };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    const passwordHash = hashPassword(password);
    await adminDb.collection('settings').doc('meeting_room').set({ passwordHash }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error("Error setting password:", error);
    return { success: false, error: error.message };
  }
}

export async function verifyMeetingRoomPassword(password: string): Promise<boolean> {
  const storedHash = await getMeetingRoomPassword();

  if (!storedHash) {
    console.warn("Meeting room password is not set!");
    return false;
  }

  const inputHash = hashPassword(password);
  if (inputHash === storedHash) {
    const token = generateAuthToken();
    (await cookies()).set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return true;
  }

  return false;
}

export async function isMeetingRoomAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  if (!authCookie?.value) return false;
  return verifyAuthToken(authCookie.value);
}

