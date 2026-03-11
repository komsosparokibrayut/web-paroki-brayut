import { NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/firebase/auth";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
    }

    const result = await createSessionCookie(idToken);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Session API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
