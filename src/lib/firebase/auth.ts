import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/server";
import type { UserRole } from "@/lib/roles";

const SESSION_COOKIE_NAME = "__session";
const SESSION_EXPIRY = 60 * 60 * 24 * 5 * 1000; // 5 days

// Root super admin email — always granted super_admin
const ROOT_ADMIN_EMAIL = "nikolasnanda@gmail.com";

export interface SessionUser {
  uid: string;
  email: string;
  name: string;
  picture: string;
  role: UserRole;
}

/**
 * Get the current authenticated user from the session cookie.
 * Returns null if not authenticated or session is invalid.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) return null;

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userRecord = await adminAuth.getUser(decoded.uid);
    const role = (userRecord.customClaims?.role as UserRole) || null;

    if (!role) return null; // no role means not authorized

    return {
      uid: decoded.uid,
      email: decoded.email || "",
      name: decoded.name || decoded.email || "Admin",
      picture: decoded.picture || "",
      role,
    };
  } catch {
    return null;
  }
}

/**
 * Create a session cookie from a Firebase ID Token.
 * Also handles authorization: only registered admins can sign in.
 */
export async function createSessionCookie(idToken: string): Promise<{ success: boolean; error?: string }> {
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const email = decoded.email;

    if (!email) {
      return { success: false, error: "No email associated with this account." };
    }

    // Get or create custom claims
    const userRecord = await adminAuth.getUser(decoded.uid);
    let role = userRecord.customClaims?.role as UserRole | undefined;

    // Auto-grant root admin
    if (email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase() && !role) {
      await adminAuth.setCustomUserClaims(decoded.uid, { role: "super_admin" });
      role = "super_admin";
    }

    // If user has no role, they are unauthorized — delete their Firebase account
    if (!role) {
      try {
        await adminAuth.deleteUser(decoded.uid);
      } catch {
        // Ignore deletion errors
      }
      return { success: false, error: "Akun Anda tidak terdaftar sebagai admin. Hubungi Super Admin untuk mendapatkan akses." };
    }

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRY,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_EXPIRY / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return { success: true };
  } catch (error: any) {
    console.error("Session creation failed:", error);
    return { success: false, error: error.message || "Failed to create session." };
  }
}

/**
 * Destroy the session cookie and revoke tokens.
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionCookie) {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie);
      await adminAuth.revokeRefreshTokens(decoded.uid);
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {
    // Best-effort cleanup
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}
