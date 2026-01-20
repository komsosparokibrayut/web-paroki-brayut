export interface PostFrontmatter {
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  categories: string[];
  banner?: string;
  published: boolean;
  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
}

export interface Post {
  frontmatter: PostFrontmatter;
  content: any; // Delta object or Markdown string
  rawContent: string;
}

export interface PostMetadata {
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  categories: string[];
  banner?: string;
  published: boolean;
  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  readingTime?: number;
}

export type PostCategory = string;
