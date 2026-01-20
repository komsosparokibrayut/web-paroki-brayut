"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, FileText } from "lucide-react";
import { PostMetadata } from "@/types/post";
import PostCard from "@/components/blog/PostCard";

interface PostListProps {
    initialPosts: PostMetadata[];
    defaultCategory?: string;
    categories: string[];
}

export default function PostList({ initialPosts, defaultCategory = "Semua", categories }: PostListProps) {
    const displayCategories = useMemo(() => {
        // Capitalize categories for display and standardizing
        return ["Semua", ...categories.map(c => c.charAt(0).toUpperCase() + c.slice(1))];
    }, [categories]);

    // Find best match for defaultCategory in displayCategories
    const initialCategory = useMemo(() => {
        const match = displayCategories.find(c => c.toLowerCase() === defaultCategory.toLowerCase());
        return match || "Semua";
    }, [defaultCategory, displayCategories]);

    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [searchQuery, setSearchQuery] = useState("");

    // Sync selectedCategory when defaultCategory prop changes (e.g. navigation)
    useEffect(() => {
        const match = displayCategories.find(c => c.toLowerCase() === defaultCategory.toLowerCase());
        if (match) {
            setSelectedCategory(match);
        } else if (defaultCategory === "Semua") {
            setSelectedCategory("Semua");
        }
    }, [defaultCategory, displayCategories]);

    // Calculate counts
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};

        // Initialize
        displayCategories.forEach(cat => counts[cat] = 0);

        // Ensure "Semua" is total
        counts["Semua"] = initialPosts.length;

        initialPosts.forEach(post => {
            const postCats = post.categories && post.categories.length > 0 ? post.categories : ["Lainnya"];

            postCats.forEach(cat => {
                // Find matching display category (case insensitive comparison)
                const match = displayCategories.find(dc => dc.toLowerCase() === cat.toLowerCase());
                if (match) {
                    counts[match] = (counts[match] || 0) + 1;
                }
            });
        });

        return counts;
    }, [initialPosts, displayCategories]);

    const filteredPosts = useMemo(() => {
        return initialPosts.filter((post) => {
            const postCats = post.categories && post.categories.length > 0 ? post.categories : ["Lainnya"];

            // Category Filter
            if (selectedCategory !== "Semua") {
                // Check if any of the post's categories match the selected category
                const matches = postCats.some(cat => cat.toLowerCase() === selectedCategory.toLowerCase());
                if (!matches) {
                    return false;
                }
            }

            // Search Filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    post.title.toLowerCase().includes(query) ||
                    post.description.toLowerCase().includes(query) ||
                    post.author.toLowerCase().includes(query)
                );
            }

            return true;
        });
    }, [initialPosts, selectedCategory, searchQuery]);

    return (
        <div className="space-y-8">
            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                {/* Search Bar */}
                <div className="relative w-full md:w-80 group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari Artikel..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all shadow-sm group-hover:shadow-md"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-brand-blue transition-colors" />
                </div>
            </div>

            {/* Filter Categories */}
            <div className="flex flex-wrap gap-2">
                {displayCategories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full font-medium transition-colors text-sm flex items-center gap-2 ${selectedCategory === category
                            ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-brand-blue hover:border-brand-blue/30"
                            }`}
                    >
                        {category}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === category ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                            {categoryCounts[category] || 0}
                        </span>
                    </button>
                ))}
            </div>

            {/* Post Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                        <PostCard key={post.slug} post={post} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Tidak ada artikel yang ditemukan.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
