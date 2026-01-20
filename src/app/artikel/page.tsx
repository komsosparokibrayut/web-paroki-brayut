import { Metadata } from "next";
import { getAllPosts } from "@/actions/posts";
import PostList from "@/components/blog/PostList";
import { getMasterCategories } from "@/actions/master-categories";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
    title: "Artikel | Paroki Brayut",
    description: "Artikel, berita, dan informasi dari Paroki Brayut Santo Yohanes Paulus II",
};

export default async function ArtikelPage() {
    const allPosts = await getAllPosts();
    const publishedPosts = allPosts.filter((post) => {
        return post.published && new Date(post.publishedAt) <= new Date();
    });
    const categories = await getMasterCategories();

    return (
        <div className="pb-12">
            <PageHeader
                title="Artikel & Berita"
                subtitle="Bacaan, renungan, warta, dan informasi paroki"
                image="https://images.unsplash.com/photo-1579532536935-619928decd08?q=80&w=2070&auto=format&fit=crop"
                align="center"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <PostList initialPosts={publishedPosts} categories={categories.post} />
            </div>
        </div>
    );
}
