import { Metadata } from "next";
import { getAllPosts } from "@/actions/posts";
import PostList from "@/components/blog/PostList";
import { getMasterCategories } from "@/actions/master-categories";
import PageHeader from "@/components/layout/PageHeader";

export async function generateStaticParams() {
    const categories = await getMasterCategories();
    // Assuming category routes are lowercase/kebab-case of the names
    return categories.post.map((category) => ({ category }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ category: string }>;
}): Promise<Metadata> {
    const { category } = await params;
    // Fallback metadata since we don't have descriptions in the simple JSON list
    return {
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} | Paroki Brayut`,
        description: `Artikel kategori ${category}`,
    };
}

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ category: string }>;
}) {
    const { category } = await params;
    const allPosts = await getAllPosts();
    const publishedPosts = allPosts.filter((post) => {
        return post.published && new Date(post.publishedAt) <= new Date();
    });
    const masterCategories = await getMasterCategories();

    // Capitalize for display
    // Find matching category in master categories (handling kebab-case vs Title Case)
    // 1. Un-slugify: "warta-paroki" -> "warta paroki"
    const normalizedParam = category.replace(/-/g, " ").toLowerCase();

    // 2. Find case-insensitive match in master list
    const matchedCategory = masterCategories.post.find(
        (cat) => cat.toLowerCase() === normalizedParam
    );

    // 3. Use matched category or fallback to Sentence case
    const displayCategory = matchedCategory ||
        category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ");

    return (
        <div className="pb-12">
            <PageHeader
                title={displayCategory}
                subtitle={`Daftar artikel kategori ${displayCategory}`}
                image="https://images.unsplash.com/photo-1579532536935-619928decd08?q=80&w=2070&auto=format&fit=crop"
                align="center"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <PostList
                    initialPosts={publishedPosts}
                    defaultCategory={displayCategory}
                    categories={masterCategories.post}
                />
            </div>
        </div>
    );
}
