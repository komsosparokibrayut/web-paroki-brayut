import Link from "next/link";
import Image from "next/image";
import { PostMetadata } from "@/types/post";

interface PostCardProps {
  post: PostMetadata;
}

export default function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Use the first category for the URL, fallback to 'lainnya'
  const primaryCategory = post.categories && post.categories.length > 0 ? post.categories[0] : "Lainnya";
  const categorySlug = primaryCategory.toLowerCase().trim().replace(/\s+/g, '-');

  return (
    <Link href={`/artikel/${categorySlug}/${post.slug}`} className="group block h-full">
      <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 h-full flex flex-col">
        {post.banner && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={post.banner}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        <div className="p-6 flex flex-col flex-grow">
          <div className="flex flex-wrap gap-2 mb-3">
            {post.categories?.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="px-3 py-1 bg-brand-warm text-brand-blue text-xs font-medium rounded-full"
              >
                {cat}
              </span>
            ))}
          </div>

          <h2 className="text-xl font-bold mb-3 text-brand-dark group-hover:text-brand-blue transition-colors line-clamp-2">
            {post.title}
          </h2>

          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
            {post.description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
            <span className="font-medium text-brand-dark">{post.author}</span>
            <div className="flex items-center gap-3">
              <time dateTime={post.publishedAt}>{formattedDate}</time>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>{post.readingTime || 1} menit baca</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
