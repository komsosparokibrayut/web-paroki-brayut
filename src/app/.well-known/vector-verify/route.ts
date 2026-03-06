import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    token: "df061e1d2b0ae28a06186ae82ab3b219ad111f02de3f71a92f4492e4cded5841",
  });
}
