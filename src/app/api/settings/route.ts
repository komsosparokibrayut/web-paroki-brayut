import { NextResponse } from "next/server";
import { getAdminSettings } from "@/features/booking/actions/settings";

export async function GET() {
  try {
    const settings = await getAdminSettings();
    return NextResponse.json({
      whatsapp_number: settings.whatsapp_number || null,
      phone_number: settings.phone_number || null,
    });
  } catch (error) {
    console.error("Settings API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings", whatsapp_number: null, phone_number: null },
      { status: 500 }
    );
  }
}