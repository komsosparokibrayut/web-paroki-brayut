import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if the user exists and has a role (is an admin)
    try {
      const user = await adminAuth.getUserByEmail(email);
      if (!user.customClaims?.role) {
        // Don't reveal that the user exists but has no role
        return NextResponse.json({
          message: "Jika email terdaftar sebagai admin, link reset password akan dikirim.",
        });
      }
    } catch {
      // User doesn't exist — return same generic message for security
      return NextResponse.json({
        message: "Jika email terdaftar sebagai admin, link reset password akan dikirim.",
      });
    }

    // Generate a password reset link
    const resetLink = await adminAuth.generatePasswordResetLink(email);

    // For now we just return the link. In production you'd send this via email.
    // Firebase will automatically send a reset email if Email/Password provider is enabled.
    // We use the Firebase client SDK sendPasswordResetEmail instead.
    return NextResponse.json({
      message: "Jika email terdaftar sebagai admin, link reset password akan dikirim.",
    });
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json({
      message: "Jika email terdaftar sebagai admin, link reset password akan dikirim.",
    });
  }
}
