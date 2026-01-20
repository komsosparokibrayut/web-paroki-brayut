"use client";

import Link from "next/link";
import Image from "next/image";
import { PostFrontmatter } from "@/types/post";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PostHeaderProps {
  frontmatter: PostFrontmatter;
  readingTime?: number;
}

export default function PostHeader({ frontmatter, readingTime }: PostHeaderProps) {
  const formattedDate = new Date(frontmatter.publishedAt).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Random gradient fallback if no banner
  const gradients = [
    "bg-gradient-to-br from-brand-blue to-blue-600",
    "bg-gradient-to-br from-brand-gold to-yellow-600",
    "bg-gradient-to-br from-green-500 to-brand-dark",
    "bg-gradient-to-br from-purple-500 to-indigo-600"
  ];
  // Simple deterministic selection based on slug length
  const randomGradient = gradients[frontmatter.slug.length % gradients.length];

  return (
    <header className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className={cn("absolute inset-0 z-0", !frontmatter.banner && randomGradient)}>
        {frontmatter.banner && (
          <Image
            src={frontmatter.banner}
            alt={frontmatter.title}
            fill
            className="object-cover"
            priority
          />
        )}
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-[1px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 pt-40 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full mx-auto space-y-8"
        >
          {/* Dynamic Title Sizing */}
          {(() => {
            const length = frontmatter.title.length;
            let sizeClass = "text-4xl md:text-5xl lg:text-7xl"; // Default (Short)
            if (length > 60) sizeClass = "text-2xl md:text-4xl lg:text-5xl"; // Long
            else if (length > 30) sizeClass = "text-3xl md:text-5xl lg:text-6xl"; // Medium

            return (
              <h1 className={cn(
                "font-serif font-bold text-white leading-tight drop-shadow-lg mx-auto min-w-[90%] md:max-w-[70%]",
                sizeClass
              )}>
                {frontmatter.title}
              </h1>
            );
          })()}

          {/* Categories / Tags */}
          <div className="flex flex-wrap justify-center gap-3">
            {frontmatter.categories.map((category) => (
              <span
                key={category}
                className="px-5 py-2 bg-white text-brand-blue text-xs md:text-sm font-bold uppercase tracking-widest rounded-full shadow-md"
              >
                {category}
              </span>
            ))}
          </div>

          {/* Metadata Line */}
          <div className="flex items-center justify-center gap-3 text-sm md:text-base text-gray-200 font-medium pt-4">
            <span className="font-bold">{frontmatter.author}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            <time className="italic" dateTime={frontmatter.publishedAt}>{formattedDate}</time>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            <span>{readingTime || 1} Menit Baca</span>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
