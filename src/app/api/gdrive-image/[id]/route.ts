import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for Google Drive images.
 *
 * Google Drive blocks direct hotlinking in <img> tags due to
 * CORS/cookie restrictions. This route fetches the image server-side
 * and serves it with proper headers so it works in <img> tags,
 * Quill editors, and Next.js <Image> components.
 *
 * Usage: /api/gdrive-image/FILE_ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return new NextResponse("Invalid file ID", { status: 400 });
  }

  try {
    // Use Google's thumbnail API with high resolution
    const googleUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w1920`;

    const response = await fetch(googleUrl, {
      headers: {
        // Mimic a browser request
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      // Fallback to lh3 format
      const fallbackUrl = `https://lh3.googleusercontent.com/d/${id}`;
      const fallbackResponse = await fetch(fallbackUrl);

      if (!fallbackResponse.ok) {
        return new NextResponse("Image not found", { status: 404 });
      }

      const fallbackBuffer = await fallbackResponse.arrayBuffer();
      const fallbackType =
        fallbackResponse.headers.get("content-type") || "image/jpeg";

      return new NextResponse(fallbackBuffer, {
        status: 200,
        headers: {
          "Content-Type": fallbackType,
          "Cache-Control": "public, max-age=86400, s-maxage=604800",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error proxying Google Drive image:", error);
    return new NextResponse("Failed to fetch image", { status: 500 });
  }
}
