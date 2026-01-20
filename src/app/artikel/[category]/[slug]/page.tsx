import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/actions/posts";
import { calculateReadingTime } from "@/lib/utils";
import PostHeader from "@/components/blog/PostHeader";
import PostContent from "@/components/blog/PostContent";

type Props = {
    params: Promise<{
        category: string;
        slug: string;
    }>;
};

export async function generateStaticParams() {
    const posts = await getAllPosts();

    // Generate a path for each category on each post
    const paths: { category: string; slug: string }[] = [];

    posts.forEach((post) => {
        if (post.categories && Array.isArray(post.categories)) {
            post.categories.forEach((cat: string) => {
                // Normalize category for URL: lowercase, kebab-case
                const normalizedCat = cat.toLowerCase().trim().replace(/\s+/g, '-');
                paths.push({
                    category: normalizedCat,
                    slug: post.slug,
                });
            });
        }
    });

    return paths;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category, slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    const { frontmatter } = post;

    return {
        title: frontmatter.metaTitle || frontmatter.title,
        description: frontmatter.metaDescription || frontmatter.description,
        keywords: frontmatter.metaKeywords,
        openGraph: {
            title: frontmatter.metaTitle || frontmatter.title,
            description: frontmatter.metaDescription || frontmatter.description,
            url: `${process.env.NEXTAUTH_URL}/${category}/${slug}`,
            images: frontmatter.ogImage ? [frontmatter.ogImage] : frontmatter.banner ? [frontmatter.banner] : [],
            type: "article",
            publishedTime: frontmatter.publishedAt,
            modifiedTime: frontmatter.updatedAt,
            authors: [frontmatter.author],
            tags: frontmatter.categories,
        },
        twitter: {
            card: "summary_large_image",
            title: frontmatter.metaTitle || frontmatter.title,
            description: frontmatter.metaDescription || frontmatter.description,
            images: frontmatter.ogImage ? [frontmatter.ogImage] : frontmatter.banner ? [frontmatter.banner] : [],
        },
    };
}

export default async function PostPage({ params }: Props) {
    const { category, slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    // Check if post is published and not scheduled for future
    if (!post.frontmatter.published || new Date(post.frontmatter.publishedAt) > new Date()) {
        notFound();
    }

    // Verify the category matches one of the post's categories
    const postCategories = post.frontmatter.categories?.map((cat: string) =>
        cat.toLowerCase().trim().replace(/\s+/g, '-')
    ) || [];

    // Check if the requested category URL param matches any of the post's normalized categories
    const isValidCategory = postCategories.includes(category.toLowerCase());

    if (!isValidCategory) {
        notFound();
    }

    const readingTime = calculateReadingTime(post.content);

    return (
        <>
            <PostHeader frontmatter={post.frontmatter} readingTime={readingTime} />

            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Description Quote */}
                {post.frontmatter.description && (
                    <div className="mb-12 max-w-3xl mx-auto text-center">
                        <p className="text-xl md:text-2xl font-serif italic text-gray-500 leading-relaxed">
                            {post.frontmatter.description}
                        </p>
                        <div className="h-1 w-20 bg-brand-gold mx-auto mt-8 rounded-full opacity-40" />
                    </div>
                )}

                <PostContent content={post.content} />
            </article>
        </>
    );
}
