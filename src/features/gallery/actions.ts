'use server'

import { createAlbum, deleteAlbum, getAlbum, updateAlbum, AlbumImage } from "@/services/github/albums";
import { commitFiles, deleteFile } from "@/services/github/content";
import { FileToCommit } from "@/types/github";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import sharp from "sharp";

const createAlbumSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
});

export async function createAlbumAction(prevState: any, formData: FormData) {
  try {
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
  await deleteAlbum(id);
  revalidatePath("/admin/gallery");
}

export async function uploadImagesAction(albumId: string, formData: FormData) {
  try {
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
        await updateAlbum(albumId, { coverImage: imagePath });
        revalidatePath(`/admin/gallery/${albumId}`);
        return { success: true };
    } catch (e) {
        return { success: false, error: "Failed to set cover" };
    }
}

export async function deleteImageAction(albumId: string, imagePath: string) {
    try {
        const repoPath = `public${imagePath}`;
        
        const album = await getAlbum(albumId);
        if (!album) return { success: false, error: "Album not found" };
        
        const updatedImages = album.images.filter(img => img.src !== imagePath);
        let coverImage = album.coverImage;
        if (coverImage === imagePath) {
            coverImage = undefined;
        }
        
        await deleteFile(repoPath, `Delete image ${imagePath}`);
        await updateAlbum(albumId, { images: updatedImages, coverImage });
        
        revalidatePath(`/admin/gallery/${albumId}`);
        return { success: true };
    } catch (e) {
        console.error("Delete image error", e);
        return { success: false, error: "Failed to delete image" };
    }
}
