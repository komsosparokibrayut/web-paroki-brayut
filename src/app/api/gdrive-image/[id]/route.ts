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
// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();
const RATE_LIMIT_MAX = 60; // Max requests
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// Allowed MIME types
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/ogg",
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return new NextResponse("Invalid file ID", { status: 400 });
  }

  // Very basic IP extraction for rate limiting
  // Note: Vercel specific headers (x-real-ip) or standard forwarded-for
  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for") || "unknown";
  
  if (ip !== "unknown") {
    const now = Date.now();
    const clientData = rateLimitMap.get(ip);
    
    if (clientData && now < clientData.expiresAt) {
      if (clientData.count >= RATE_LIMIT_MAX) {
        return new NextResponse("Too Many Requests", { status: 429 });
      }
      clientData.count++;
    } else {
      rateLimitMap.set(ip, {
        count: 1,
        expiresAt: now + RATE_LIMIT_WINDOW_MS
      });
    }
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

      const fallbackType =
        fallbackResponse.headers.get("content-type")?.split(';')[0].trim() || "image/jpeg";

      if (!ALLOWED_MIME_TYPES.has(fallbackType)) {
        console.warn(`Blocked attempt for MIME type: ${fallbackType}`);
        return new NextResponse("Unsupported file type", { status: 400 });
      }

      const fallbackBuffer = await fallbackResponse.arrayBuffer();

      return new NextResponse(fallbackBuffer, {
        status: 200,
        headers: {
          "Content-Type": fallbackType,
          "Cache-Control": "public, max-age=86400, s-maxage=604800",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const contentType = response.headers.get("content-type")?.split(';')[0].trim() || "image/jpeg";
    
    if (!ALLOWED_MIME_TYPES.has(contentType)) {
      console.warn(`Blocked attempt for MIME type: ${contentType}`);
      return new NextResponse("Unsupported file type", { status: 400 });
    }

    const buffer = await response.arrayBuffer();

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
