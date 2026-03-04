/**
 * Curated Instagram post URLs from @parokibrayut
 * 
 * To update this list:
 * 1. Go to https://www.instagram.com/parokibrayut/
 * 2. Click on a post
 * 3. Copy the URL (e.g. https://www.instagram.com/p/XXXXX/)
 * 4. Add it to this array
 * 
 * Supports both /p/ (posts) and /reel/ (reels) URLs.
 */

export interface InstagramPost {
    /** The full Instagram post URL */
    url: string;
}

export const INSTAGRAM_USERNAME = "parokibrayut";
export const INSTAGRAM_PROFILE_URL = `https://www.instagram.com/${INSTAGRAM_USERNAME}/`;

export const instagramPosts: InstagramPost[] = [
    // Add your Instagram post URLs here
    // Example: { url: "https://www.instagram.com/p/ABC123/" },
];
