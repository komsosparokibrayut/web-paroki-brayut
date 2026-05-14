"use server";

import { commitFiles, listFiles, deleteFile } from "@/services/github/content";
import { processImage, generateImageFilename } from "@/lib/images/processor";
import { getCurrentUser } from "@/lib/firebase/auth";
import { hasPermission } from "@/lib/roles";

export async function uploadImages(
  formData: FormData,
  type: "banner" | "inline"
): Promise<{ success: boolean; paths?: string[]; error?: string }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_news")) {
      return { success: false, error: "Unauthorized" };
    }
    const files = formData.getAll("files") as File[];
    
    if (!files || files.length === 0) {
      return { success: false, error: "No files provided" };
    }

    const filesToCommit = [];
    const uploadedPaths = [];

    for (const file of files) {
      // Validate file
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) continue;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const processed = await processImage(buffer, type);
      const filename = generateImageFilename(file.name, type);
      const path = `images/${filename}`;

      filesToCommit.push({
        path,
        content: processed.buffer,
        encoding: "base64" as const
      });

      uploadedPaths.push(`/${path}`);
    }

    if (filesToCommit.length === 0) {
      return { success: false, error: "No valid images to upload" };
    }

    // Commit all files to GitHub in a single commit
    await commitFiles(
      filesToCommit,
      `Add ${filesToCommit.length} images`
    );

    return { success: true, paths: uploadedPaths };
  } catch (error: unknown) {
    console.error("Error uploading images:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export interface MediaImage {
  path: string;
  name: string;
  size: number;
}

export async function listImages(): Promise<{
  banners: MediaImage[];
  inline: MediaImage[];
}> {
  try {
    // UNIFIED STRUCTURE: List all files in images/
    const allImages = await listFiles("images");
    
    return {
      banners: [], 
      inline: allImages.map(img => ({
        path: `/${img.path}`,
        name: img.name,
        size: img.size
      })), 
    };
  } catch (error) {
    console.error("Error listing images:", error);
    return { banners: [], inline: [] };
  }
}

export async function deleteImage(path: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_news")) {
      return { success: false, error: "Unauthorized" };
    }
    // Remove leading slash
    const filePath = path.startsWith("/") ? path.substring(1) : path;

    await deleteFile(filePath, `Delete image: ${filePath}`);

    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting image:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
