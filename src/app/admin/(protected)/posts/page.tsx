import { getAllPosts } from "@/actions/posts";
import PostTable from "@/components/admin/PostTable";

export default async function AdminPostsPage() {
  const posts = await getAllPosts();

  return <PostTable posts={posts} showCreateButton />;
}
