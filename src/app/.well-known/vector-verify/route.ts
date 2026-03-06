import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    token: "aa6d67a69090602e622fd0344f44bd7d56a0429e4f73b427b07bdd8b8c3e86be",
  });
}
