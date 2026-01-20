"use server";

import { revalidatePath } from "next/cache";
import { getFile, listFiles, commitFiles, deleteFile } from "@/lib/github/operations";
import { parseContent, stringifyContent } from "@/lib/content/parser";
import { validateFrontmatter, generateSlug } from "@/lib/content/validator";
import { PostMetadata, PostFrontmatter } from "@/types/post";
import { calculateReadingTime } from "@/lib/utils";

export async function getAllPosts(): Promise<PostMetadata[]> {
  const files = await listFiles("posts");
  const posts: PostMetadata[] = [];

  for (const item of files) {
    if (!item.path.endsWith(".json")) continue;

    const content = await getFile(item.path);
    if (!content) continue;

    try {
      const { frontmatter, content: postContent } = parseContent(content, item.path);
      const readingTime = calculateReadingTime(postContent);
      posts.push({ ...frontmatter, readingTime });
    } catch (error) {
      console.error(`Error parsing ${item.path}:`, error);
    }
  }

  // Sort by published date, newest first
  return posts.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}



export async function getPostBySlug(slug: string) {
  const files = await listFiles("posts");
  const item = files.find((file) => file.path.includes(slug) && file.path.endsWith(".json"));

  if (!item) {
    return null;
  }

  const content = await getFile(item.path);
  if (!content) {
    return null;
  }

  return parseContent(content, item.path);
}

export async function createPost(formData: {
  title: string;
  slug?: string; // Optional custom slug
  description: string;
  author: string;
  categories: string[];
  content: any;
  banner?: string;
  published?: boolean;
  publishedAt?: string;
}) {
  try {
    // Use custom slug if provided and not empty, otherwise generate from title
    const slug = formData.slug?.trim() 
      ? formData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : generateSlug(formData.title);
    const now = new Date().toISOString();

    const frontmatter: PostFrontmatter = {
      title: formData.title,
      slug,
      description: formData.description || "",
      publishedAt: formData.publishedAt || now, // Use provided date or now
      author: formData.author,
      categories: formData.categories,
      banner: formData.banner,
      published: formData.published || false,
    };

    // Validate frontmatter
    validateFrontmatter(frontmatter);

    // Create content file (JSON by default now)
    const fileContent = stringifyContent(frontmatter, formData.content);
    const date = now.split("T")[0];
    const filename = `posts/${date}-${slug}.json`;

    // Commit to GitHub
    await commitFiles(
      [{ path: filename, content: fileContent }],
      `Add post: ${formData.title}`
    );

    // Revalidate paths
    revalidatePath("/blog");
    revalidatePath(`/posts/${slug}`);

    return { success: true, slug };
  } catch (error: any) {
    console.error("Error creating post:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePost(
  slug: string,
  formData: {
    title: string;
    description: string;
    author: string;
    categories: string[];
    content: any;
    banner?: string;
    published?: boolean;
    publishedAt?: string;
    newSlug?: string; // New slug for renaming
  }
) {
  try {
    // Find existing post
    const posts = await listFiles("posts");
    const item = posts.find((file) => file.path.includes(slug) && file.path.endsWith(".json"));

    if (!item) {
      return { success: false, error: "Post not found" };
    }

    const existingContent = await getFile(item.path);
    if (!existingContent) {
      return { success: false, error: "Post content not found" };
    }

    const { frontmatter: existingFrontmatter } = parseContent(existingContent, item.path);

    // Determine the new slug (normalized)
    const finalSlug = formData.newSlug 
      ? formData.newSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : existingFrontmatter.slug;

    const updatedFrontmatter: PostFrontmatter = {
      ...existingFrontmatter,
      title: formData.title,
      slug: finalSlug, // Update slug in frontmatter
      description: formData.description,
      author: formData.author,
      categories: formData.categories,
      banner: formData.banner,
      published: formData.published || false,
      publishedAt: formData.publishedAt || existingFrontmatter.publishedAt,
      updatedAt: new Date().toISOString(),
    };

    // Validate frontmatter
    validateFrontmatter(updatedFrontmatter);

    // Create updated content
    const fileContent = stringifyContent(updatedFrontmatter, formData.content);

    // Check if slug changed (need to rename file)
    const slugChanged = finalSlug !== existingFrontmatter.slug;
    
    if (slugChanged) {
      // Get the date prefix from the old filename
      const oldFilename = item.path.split('/').pop() || '';
      const dateMatch = oldFilename.match(/^(\d{4}-\d{2}-\d{2})/);
      const datePrefix = dateMatch ? dateMatch[1] : new Date().toISOString().split("T")[0];
      
      const newFilename = `posts/${datePrefix}-${finalSlug}.json`;
      
      // Delete old file and create new one
      await deleteFile(item.path, `Rename post: ${existingFrontmatter.slug} -> ${finalSlug}`);
      await commitFiles(
        [{ path: newFilename, content: fileContent }],
        `Update post: ${formData.title} (renamed)`
      );
    } else {
      // Just update in place
      await commitFiles(
        [{ path: item.path, content: fileContent }],
        `Update post: ${formData.title}`
      );
    }

    // Revalidate paths
    revalidatePath("/blog");
    revalidatePath(`/posts/${slug}`);
    if (slugChanged) {
      revalidatePath(`/posts/${finalSlug}`);
    }

    return { success: true, slug: finalSlug };
  } catch (error: any) {
    console.error("Error updating post:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePost(slug: string) {
  try {
    const files = await listFiles("posts");
    const item = files.find((file) => file.path.includes(slug) && file.path.endsWith(".json"));

    if (!item) {
      return { success: false, error: "Post not found" };
    }

    await deleteFile(item.path, `Delete post: ${slug}`);

    // Revalidate paths
    revalidatePath("/blog");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting post:", error);
    return { success: false, error: error.message };
  }
}

export async function publishPost(slug: string) {
  try {
    const files = await listFiles("posts");
    const item = files.find((file) => file.path.includes(slug) && file.path.endsWith(".json"));

    if (!item) {
      return { success: false, error: "Post not found" };
    }

    const content = await getFile(item.path);
    if (!content) {
      return { success: false, error: "Post content not found" };
    }

    const { frontmatter, content: postContent } = parseContent(content, item.path);
    frontmatter.published = true;
    frontmatter.updatedAt = new Date().toISOString();

    const fileContent = stringifyContent(frontmatter, postContent);

    await commitFiles(
      [{ path: item.path, content: fileContent }],
      `Publish post: ${frontmatter.title}`
    );

    // Revalidate paths
    revalidatePath("/blog");
    revalidatePath(`/posts/${slug}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error publishing post:", error);
    return { success: false, error: error.message };
  }
}
