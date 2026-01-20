import { Post, PostFrontmatter } from "@/types/post";

export function parseContent(content: string, filename?: string): Post {
  try {
    const parsed = JSON.parse(content);
    return {
      frontmatter: parsed.frontmatter as PostFrontmatter,
      content: parsed.content,
      rawContent: content,
    };
  } catch (e) {
    console.error(`Failed to parse content from ${filename}:`, e);
    throw new Error("Invalid content format");
  }
}

export function stringifyContent(frontmatter: PostFrontmatter, content: any): string {
  return JSON.stringify({
    frontmatter,
    content
  }, null, 2);
}
