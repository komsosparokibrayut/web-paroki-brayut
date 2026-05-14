import { NextRequest, NextResponse } from "next/server";
import { isGitHubConfigured } from "@/services/github/client";
import { getDownloadUrl } from "@/services/github/content";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const imagePath = `images/${path.join("/")}`;

    // Validate configuration
    if (!isGitHubConfigured()) {
      return new NextResponse("GitHub not configured", { status: 503 });
    }

    try {
      const downloadUrl = await getDownloadUrl(imagePath);

      if (!downloadUrl) {
        return new NextResponse("Not found", { status: 404 });
      }

      // Fetch the actual binary data from the download_url
      const imageResponse = await fetch(downloadUrl);
      
      if (!imageResponse.ok) {
        return new NextResponse("Failed to fetch image", { status: imageResponse.status });
      }

      const contentType = imageResponse.headers.get("content-type") || "image/webp";
      const arrayBuffer = await imageResponse.arrayBuffer();

      // Return the image
      return new NextResponse(arrayBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
        },
      });

    } catch (error: unknown) {
      console.error(`Error fetching image ${imagePath}:`, error);
      return new NextResponse("Error fetching image", { status: 500 });
    }
  } catch (error) {
    console.error("Internal server error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
