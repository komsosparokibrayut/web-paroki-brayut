import { NextResponse } from "next/server";
import { getAdminSettings, setupAdminSettings } from "@/features/booking/actions/settings";

export async function GET() {
  try {
    const settings = await getAdminSettings();

    if (settings.whatsapp_number || settings.phone_number) {
      return NextResponse.json({ message: "Already configured", settings });
    }

    const result = await setupAdminSettings({
      whatsapp_number: "628135735199",
      phone_number: "622748609221",
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({
      message: "Settings initialized",
      whatsapp_number: "628135735199",
      phone_number: "622748609221",
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}