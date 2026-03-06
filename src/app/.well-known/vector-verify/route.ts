import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    token: "4c4cc47bd9105205e9ea267eb810dd097a19e5e54f4869c22765ef4f7c24d80f",
  });
}
