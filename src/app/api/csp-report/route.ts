import { NextResponse } from "next/server";

/**
 * CSP violation report endpoint.
 * Logs Content-Security-Policy violations for monitoring.
 */
export async function POST(request: Request) {
  try {
    const report = await request.json();
    console.warn("[CSP Violation]", JSON.stringify(report, null, 2));
    return NextResponse.json({ received: true }, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Invalid report" }, { status: 400 });
  }
}
