import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    token: "eca7ccc629e46a54cc3f732008f1ad4c856322a58b5fa9a376e7a70da6156637",
  });
}
