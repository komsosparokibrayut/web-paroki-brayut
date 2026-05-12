/**
 * Google Drive URL utilities
 *
 * Converts Google Drive shareable URLs to proxied image URLs
 * that bypass Google's hotlinking restrictions.
 */

/**
 * Check if a URL is a Google Drive shareable link.
 */
export function isGoogleDriveUrl(url: string): boolean {
  if (!url) return false;
  return (
    url.includes("drive.google.com") ||
    url.includes("docs.google.com") ||
    url.includes("lh3.googleusercontent.com")
  );
}

/**
 * Extract the Google Drive file ID from a shareable URL.
 * Returns null if not a recognized format.
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url) return null;

  // Already a proxied URL — extract id from path
  const proxyMatch = url.match(/\/api\/gdrive-image\/([a-zA-Z0-9_-]+)/);
  if (proxyMatch) return proxyMatch[1];

  // Already a thumbnail URL — extract id param
  const thumbnailMatch = url.match(
    /drive\.google\.com\/thumbnail\?.*id=([a-zA-Z0-9_-]+)/
  );
  if (thumbnailMatch) return thumbnailMatch[1];

  // lh3.googleusercontent.com/d/FILE_ID, /thumbnail/FILE_ID, /uc/FILE_ID
  const lh3Match = url.match(
    /lh3\.googleusercontent\.com\/(?:d|thumbnail|uc)\/([a-zA-Z0-9_-]+)/
  );
  if (lh3Match) return lh3Match[1];

  // /file/d/FILE_ID/ or ?id=FILE_ID
  const match =
    url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  return match ? match[1] : null;
}

/**
 * Convert a Google Drive shareable URL to a proxied image URL.
 *
 * Supported input formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://lh3.googleusercontent.com/d/FILE_ID
 * - https://drive.google.com/thumbnail?id=FILE_ID&sz=w1920
 *
 * Output: /api/gdrive-image/FILE_ID
 *
 * This routes through our server-side proxy to bypass Google's
 * hotlinking restrictions (CORS/cookies).
 *
 * If the URL is not a recognized Google Drive link, it is returned as-is.
 */
export function toGoogleDriveImageUrl(url: string): string {
  if (!url) return "";

  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    return `/api/gdrive-image/${fileId}`;
  }

  // Not a Drive link — return as-is
  return url;
}
