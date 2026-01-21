/**
 * News Service Layer
 *
 * Provides data access functions for news/warta content.
 * All news data flows through this service layer.
 *
 * @module services/github/news
 */

import { getFile, listFiles, commitFiles, deleteFile } from "./content";

// Directory for posts
const POSTS_DIR = "posts";

/**
 * Fetches all post files from the repository.
 * @returns Promise resolving to array of file info objects.
 */
export async function listPosts(): Promise<
  { name: string; path: string; size: number }[]
> {
  return listFiles(POSTS_DIR);
}

/**
 * Fetches a single post file content by path.
 * @param path - Full path to the post file
 * @returns Promise resolving to file content string, or null if not found.
 */
export async function getPostFile(path: string): Promise<string | null> {
  return getFile(path);
}

/**
 * Creates a new post file.
 * @param filename - Path for the new file (e.g., "posts/2026-01-21-my-post.json")
 * @param content - JSON stringified content to write
 * @param commitMessage - Commit message for the change
 * @returns Promise resolving to commit SHA.
 */
export async function createPostFile(
  filename: string,
  content: string,
  commitMessage: string
): Promise<string> {
  return commitFiles([{ path: filename, content }], commitMessage);
}

/**
 * Updates an existing post file.
 * @param path - Path to the existing file
 * @param content - Updated JSON stringified content
 * @param commitMessage - Commit message for the change
 * @returns Promise resolving to commit SHA.
 */
export async function updatePostFile(
  path: string,
  content: string,
  commitMessage: string
): Promise<string> {
  return commitFiles([{ path, content }], commitMessage);
}

/**
 * Deletes a post file.
 * @param path - Path to the file to delete
 * @param commitMessage - Commit message for the change
 * @returns Promise resolving when complete.
 */
export async function deletePostFile(
  path: string,
  commitMessage: string
): Promise<void> {
  return deleteFile(path, commitMessage);
}

/**
 * Renames a post file (delete old, create new).
 * 
 * ⚠️ WARNING: This operation is non-atomic. If the create operation fails after
 * delete, the original file will be lost. Consider implementing a backup/rollback
 * mechanism for critical data operations.
 * 
 * @param oldPath - Path to the existing file
 * @param newPath - Path for the renamed file
 * @param content - Content to write to the new file
 * @param commitMessage - Commit message for the change
 * @returns Promise resolving to commit SHA.
 * @throws Error if either delete or create operation fails
 */
export async function renamePostFile(
  oldPath: string,
  newPath: string,
  content: string,
  commitMessage: string
): Promise<string> {
  // Note: Non-atomic operation - if commitFiles fails, oldPath is already deleted
  await deleteFile(oldPath, `Delete for rename: ${oldPath}`);
  return commitFiles([{ path: newPath, content }], commitMessage);
}

