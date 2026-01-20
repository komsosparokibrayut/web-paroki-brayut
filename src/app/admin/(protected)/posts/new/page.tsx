import PostForm from "@/components/admin/PostForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth.config";
import { getMasterCategories } from "@/actions/master-categories";

export default async function NewPostPage() {
  const session = await getServerSession(authOptions);
  const categories = await getMasterCategories();

  return (
    <div className="bg-white px-8 rounded-lg shadow">
      <PostForm mode="create" user={session?.user} categories={categories.post} />
    </div>
  );
}
