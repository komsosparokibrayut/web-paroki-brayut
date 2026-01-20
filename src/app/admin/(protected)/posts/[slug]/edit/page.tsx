import { notFound } from "next/navigation";
import { getPostBySlug } from "@/features/news/actions/posts";
import PostForm from "@/components/admin/PostForm";
import { getMasterCategories } from "@/actions/master-categories";

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const categories = await getMasterCategories();

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-white px-8 rounded-lg shadow">
      <PostForm post={post} mode="edit" categories={categories.post} />
    </div>
  );
}
