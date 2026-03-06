import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    token: "6e80470500c9bfd094decdb98a3853f2d064faa5cb4aa8494d99b0eae6952b09",
  });
}
