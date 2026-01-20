import PostForm from "@/components/admin/PostForm";
import { getMasterCategories } from "@/actions/master-categories";

export default async function NewPostPage() {
  const categories = await getMasterCategories();

  return (
    <div className="bg-white px-8 rounded-lg shadow">
      <PostForm mode="create" categories={categories.post} />
    </div>
  );
}
