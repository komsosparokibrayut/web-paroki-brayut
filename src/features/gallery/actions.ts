'use server'

import { createAlbum, deleteAlbum, getAlbum, updateAlbum, AlbumImage } from "@/services/github/albums";
import { commitFiles, deleteFile } from "@/services/github/content";
import { FileToCommit } from "@/types/github";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import sharp from "sharp";
import { getCurrentUser } from "@/lib/firebase/auth";
import { hasPermission } from "@/lib/roles";

/**
 * Validates that a URL is safe for server-side fetching (SSRF protection).
 */
function isAllowedExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const hostname = parsed.hostname.toLowerCase();
    // Block internal/private IPs and localhost
    const blocked = ['127.0.0.1', 'localhost', '0.0.0.0', '[::1]'];
    const blockedPrefixes = ['169.254.', '10.', '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', '172.21.', '172.22.', '172.23.', '172.24.', '172.25.', '172.26.', '172.27.', '172.28.', '172.29.', '172.30.', '172.31.', '192.168.'];
    if (blocked.includes(hostname)) return false;
    if (blockedPrefixes.some(p => hostname.startsWith(p))) return false;
    return true;
  } catch { return false; }
}

const createAlbumSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
});

export async function createAlbumAction(prevState: any, formData: FormData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, "manage_news")) {
      return { success: false, error: "Unauthorized" };
    }
    const data = {
      title: formData.get("title") as string,
      date: formData.get("date") as string,
      description: formData.get("description") as string,
    };

    const validated = createAlbumSchema.parse(data);

    const id = await createAlbum(validated);
    return { success: true, id };
  } catch (e) {
    console.error("Failed to create album", e);
    return { success: false, error: "Failed to create album" };
  }
}

export async function deleteAlbumAction(id: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !hasPermission(currentUser.role, "manage_news")) {
    throw new Error("Unauthorized");
  }
  await deleteAlbum(id);
  revalidatePath("/admin/gallery");
}

export async function uploadImagesAction(albumId: string, formData: FormData) {
  try {
      const currentUser = await getCurrentUser();
      if (!currentUser || !hasPermission(currentUser.role, "manage_news")) {
        return { success: false, error: "Unauthorized" };
      }
      const files = formData.getAll("images");
      const filesToCommit: FileToCommit[] = [];
      const imagePaths: AlbumImage[] = [];
    
      for (const entry of files) {
        if (!(entry instanceof File)) continue;
        
        const arrayBuffer = await entry.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const filename = `${Date.now()}-${entry.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
        const path = `public/gallery/${albumId}/${filename}`;
        
        filesToCommit.push({
          path,
          content: buffer,
        });
        
        const metadata = await sharp(buffer).metadata();

        imagePaths.push({
            src: `/images/gallery/${albumId}/${filename}`,
            width: metadata.width || 0,
            height: metadata.height || 0
        });
      }
    
      if (filesToCommit.length === 0) return { success: false, error: "No files uploaded" };
    
      const album = await getAlbum(albumId);
      if (!album) return { success: false, error: "Album not found" };
    
      const updatedImages = [...album.images, ...imagePaths];
      
      filesToCommit.push({
        path: `content/albums/${albumId}.json`,
        content: JSON.stringify({ ...album, images: updatedImages }, null, 2)
      });
    
      await commitFiles(filesToCommit, `Upload images to album ${album.title}`);
    
      revalidatePath(`/admin/gallery/${albumId}`);
      return { success: true };
  } catch (error) {
      console.error("Upload error:", error);
      return { success: false, error: "Failed to upload images" };
  }
}

export async function setCoverImageAction(albumId: string, imagePath: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !hasPermission(currentUser.role, "manage_news")) {
          return { success: false, error: "Unauthorized" };
        }
        await updateAlbum(albumId, { coverImage: imagePath });
        revalidatePath(`/admin/gallery/${albumId}`);
        return { success: true };
    } catch (e) {
        return { success: false, error: "Failed to set cover" };
    }
}

export async function deleteImageAction(albumId: string, imagePath: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !hasPermission(currentUser.role, "manage_news")) {
          return { success: false, error: "Unauthorized" };
        }
        const album = await getAlbum(albumId);
        if (!album) return { success: false, error: "Album not found" };
        
        const updatedImages = album.images.filter(img => img.src !== imagePath);
        let coverImage = album.coverImage;
        if (coverImage === imagePath) {
            coverImage = undefined;
        }
        
        // Only try to delete from repo if it's a local file (not an external URL)
        if (!imagePath.startsWith("http")) {
            const repoPath = `public${imagePath}`;
            await deleteFile(repoPath, `Delete image ${imagePath}`);
        }

        await updateAlbum(albumId, { images: updatedImages, coverImage });
        
        revalidatePath(`/admin/gallery/${albumId}`);
        return { success: true };
    } catch (e) {
        console.error("Delete image error", e);
        return { success: false, error: "Failed to delete image" };
    }
}

export async function addExternalImageAction(albumId: string, imageUrl: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !hasPermission(currentUser.role, "manage_news")) {
          return { success: false, error: "Unauthorized" };
        }

        // SSRF protection: validate URL before fetching
        if (!isAllowedExternalUrl(imageUrl)) {
          return { success: false, error: "Invalid or blocked URL" };
        }

        const album = await getAlbum(albumId);
        if (!album) return { success: false, error: "Album not found" };

        // Fetch the image to determine dimensions
        let width = 800;
        let height = 600;
        try {
            const response = await fetch(imageUrl);
            if (response.ok) {
                const buffer = Buffer.from(await response.arrayBuffer());
                const metadata = await sharp(buffer).metadata();
                width = metadata.width || 800;
                height = metadata.height || 600;
            }
        } catch {
            // Use default dimensions if fetch fails
        }

        const newImage: AlbumImage = {
            src: imageUrl,
            width,
            height,
        };

        const updatedImages = [...album.images, newImage];
        await updateAlbum(albumId, { images: updatedImages });

        revalidatePath(`/admin/gallery/${albumId}`);
        return { success: true };
    } catch (e) {
        console.error("Add external image error", e);
        return { success: false, error: "Failed to add external image" };
    }
}

