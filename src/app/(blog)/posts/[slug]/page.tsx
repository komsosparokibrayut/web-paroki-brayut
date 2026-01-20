import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/actions/posts";
import PostHeader from "@/components/blog/PostHeader";
import PostContent from "@/components/blog/PostContent";
import { isGitHubConfigured } from "@/lib/github/client";

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  // Skip static generation during build if GitHub credentials not available
  if (!isGitHubConfigured()) {
    console.warn('⚠️  GitHub not configured. Skipping static generation. Pages will be generated on-demand.');
    return [];
  }
  
  try {
    const posts = await getAllPosts();
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return []; // Return empty array to allow build to succeed
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || !post.frontmatter.published) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <PostHeader frontmatter={post.frontmatter} />
      <PostContent content={post.content} />
    </article>
  );
}
