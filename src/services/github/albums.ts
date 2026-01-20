import { getFile, commitFiles, listFiles, deleteFile } from "./content";
import { FileToCommit } from "@/types/github";

import { Album, AlbumImage } from "@/types/gallery";

export type { Album, AlbumImage };

const ALBUMS_PATH = "content/albums";

export async function getAlbums(): Promise<Album[]> {
  const files = await listFiles(ALBUMS_PATH);
  
  const albums = await Promise.all(
    files
      .filter((file) => file.name.endsWith(".json"))
      .map(async (file) => {
        const content = await getFile(file.path);
        if (!content) return null;
        try {
          const data = JSON.parse(content);
          // Ensure id matches filename
          return { ...data, id: file.name.replace(".json", "") } as Album;
        } catch (e) {
          console.error(`Error parsing album ${file.name}`, e);
          return null;
        }
      })
  );

  return albums.filter((album): album is Album => album !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getAlbum(id: string): Promise<Album | null> {
  const content = await getFile(`${ALBUMS_PATH}/${id}.json`);
  if (!content) return null;
  try {
    const data = JSON.parse(content);
    return { ...data, id };
  } catch (e) {
    console.error(`Error parsing album ${id}`, e);
    return null;
  }
}

export async function createAlbum(album: Omit<Album, "id" | "images">): Promise<string> {
  // Generate slug from title
  const slug = album.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
    
  const id = slug || `album-${Date.now()}`;
  const newAlbum: Album = {
    ...album,
    id,
    images: []
  };

  await commitFiles(
    [
      {
        path: `${ALBUMS_PATH}/${id}.json`,
        content: JSON.stringify(newAlbum, null, 2),
      },
    ],
    `Create album: ${album.title}`
  );

  return id;
}

export async function updateAlbum(id: string, updates: Partial<Omit<Album, "id">>): Promise<void> {
  const current = await getAlbum(id);
  if (!current) throw new Error(`Album ${id} not found`);

  const updated = { ...current, ...updates };

  await commitFiles(
    [
      {
        path: `${ALBUMS_PATH}/${id}.json`,
        content: JSON.stringify(updated, null, 2),
      },
    ],
    `Update album: ${updated.title}`
  );
}

export async function deleteAlbum(id: string): Promise<void> {
  // Delete metadata
  await deleteFile(
    `${ALBUMS_PATH}/${id}.json`,
    `Delete album metadata: ${id}`
  );
  
  // TODO: Cleanup images directory if needed, though simpler to leave for now or handle separately
}
