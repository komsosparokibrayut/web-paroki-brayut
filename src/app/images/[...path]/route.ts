import { NextRequest, NextResponse } from "next/server";
import { getOctokit, getRepoConfig, isGitHubConfigured } from "@/lib/github/client";

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

    const { owner, repo } = getRepoConfig();
    const octokit = await getOctokit();

    try {
      // Get metadata to get the download_url
      const metadataResponse = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: imagePath,
      });

      // metadataResponse.data can be array (dir) or object (file)
      // We cast to any because TypeScript definition is complex intersection
      const data = metadataResponse.data as any;

      if (Array.isArray(data) || !data.download_url) {
        return new NextResponse("Not found", { status: 404 });
      }

      // Fetch the actual binary data from the download_url
      const imageResponse = await fetch(data.download_url);
      
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

    } catch (error: any) {
      console.error(`Error fetching image ${imagePath}:`, error);
      if (error.status === 404) {
        return new NextResponse("Image not found", { status: 404 });
      }
      return new NextResponse("Error fetching image", { status: 500 });
    }
  } catch (error) {
    console.error("Internal server error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
