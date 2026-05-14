import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/firebase/auth";

// In-memory rate limiter for login attempts
// NOTE: In serverless environments (e.g., Vercel), this Map resets per cold start.
// For production, consider using Vercel KV, Upstash Redis, or similar.
const loginAttempts = new Map<string, { count: number; expiresAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Periodic cleanup of expired entries to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of loginAttempts) {
      if (now >= entry.expiresAt) loginAttempts.delete(key);
    }
  }, 5 * 60 * 1000);
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (entry && now < entry.expiresAt) {
    if (entry.count >= MAX_ATTEMPTS) return false;
    entry.count++;
  } else {
    loginAttempts.set(ip, { count: 1, expiresAt: now + WINDOW_MS });
  }
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for") || "unknown";
    if (ip !== "unknown" && !checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit." },
        { status: 429 }
      );
    }

    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
    }

    const result = await createSessionCookie(idToken);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Session API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
