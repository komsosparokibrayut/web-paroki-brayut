"use client";

import { PostMetadata } from "@/types/post";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { cn, slugify } from "@/lib/utils";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

interface CommunityStoriesProps {
    posts: PostMetadata[];
}

export default function CommunityStories({ posts }: CommunityStoriesProps) {
    const recentPosts = posts.slice(0, 5);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Drag Scroll State
    const [isDown, setIsDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftPos, setScrollLeftPos] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const scrollAmount = 400;
        const currentScroll = scrollContainerRef.current.scrollLeft;
        const targetScroll = direction === 'left'
            ? currentScroll - scrollAmount
            : currentScroll + scrollAmount;

        scrollContainerRef.current.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    };

    // Mouse Drag Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        setIsDown(true);
        setIsDragging(false);
        setStartX(e.pageX - container.offsetLeft);
        setScrollLeftPos(container.scrollLeft);

        // Prevent text selection during drag
        container.style.userSelect = 'none';
    };

    const handleMouseLeave = () => {
        setIsDown(false);
        setIsDragging(false);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.style.userSelect = '';
        }
    };

    const handleMouseUp = () => {
        setIsDown(false);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.style.userSelect = '';
        }
        // Small delay to ensure click events can check isDragging before it resets
        setTimeout(() => setIsDragging(false), 50);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDown || !scrollContainerRef.current) return;
        e.preventDefault();

        const container = scrollContainerRef.current;
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5; // Scroll speed multiplier

        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
            if (container) {
                container.scrollLeft = scrollLeftPos - walk;
            }
        });

        // Mark as dragging if moved significantly
        if (Math.abs(x - startX) > 5) {
            setIsDragging(true);
        }
    };

    return (
        <section className="py-16 md:py-24 bg-brand-warm overflow-hidden">
            <div className="container mx-auto px-4 mb-8">
                <div className="flex justify-between items-end">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-gray-500 font-sans tracking-[0.2em] uppercase text-xs font-bold block mb-4">
                            Warta Paroki
                        </span>
                        <h2 className="font-serif text-5xl md:text-7xl text-brand-dark leading-[0.9]">
                            Cerita <span className="italic text-brand-gold">Terbaru</span>
                        </h2>
                    </motion.div>

                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={() => scroll('left')}
                            className="p-4 rounded-full border border-brand-dark/10 hover:bg-brand-dark hover:text-white transition-all hover:scale-110 active:scale-95"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-4 rounded-full border border-brand-dark/10 hover:bg-brand-dark hover:text-white transition-all hover:scale-110 active:scale-95"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Horizontal Slider */}
            <div className="relative w-full">
                <div
                    ref={scrollContainerRef}
                    className={cn(
                        "flex gap-8 overflow-x-auto pb-8 hide-scrollbar px-4 md:pl-[calc((100vw-768px)/2+16px)] lg:pl-[calc((100vw-1024px)/2+16px)] xl:pl-[calc((100vw-1280px)/2+16px)] 2xl:pl-[calc((100vw-1536px)/2+16px)]",
                        !isDown && "snap-x snap-mandatory",
                        "cursor-grab active:cursor-grabbing"
                    )}
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        willChange: isDown ? 'scroll-position' : 'auto',
                        touchAction: 'pan-x'
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                >
                    {recentPosts.map((post, index) => {
                        const category = post.categories?.[0] || "Berita";
                        const categorySlug = slugify(category);

                        return (
                            <motion.div
                                key={post.slug}
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: index * 0.1, duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
                                className="w-[85vw] md:w-[400px] lg:w-[450px] group cursor-pointer flex flex-col h-full shrink-0 snap-center select-none"
                                onClickCapture={(e) => {
                                    if (isDragging) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }
                                }}
                            >
                                <Link
                                    href={`/artikel/${categorySlug}/${post.slug}`}
                                    className="block h-full pointer-events-none md:pointer-events-auto"
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-gray-100 mb-6">
                                        {post.banner ? (
                                            <Image
                                                src={post.banner}
                                                alt={post.title}
                                                fill
                                                draggable={false}
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-brand-warm flex items-center justify-center text-brand-gold/20">
                                                <span className="font-serif text-6xl italic">P</span>
                                            </div>
                                        )}

                                        {/* Floating Badge */}
                                        <div className="absolute top-4 left-4 bg-brand-warm/90 backdrop-blur-sm px-4 py-2 rounded-full border border-brand-dark/5">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark">
                                                {category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex flex-col px-2">
                                        <h3 className="font-serif text-2xl md:text-3xl text-brand-dark leading-tight mb-3 group-hover:text-brand-blue transition-colors text-balance">
                                            {post.title.length > 56 ? post.title.slice(0, 56) + "..." : post.title}
                                        </h3>

                                        <div className="mt-auto flex items-center justify-between border-t border-brand-dark/10 pt-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                                    {new Date(post.publishedAt).toLocaleDateString("id-ID", { month: 'long', year: 'numeric' })}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                                                    {post.readingTime || 3} Menit Baca
                                                </span>
                                            </div>
                                            <ArrowUpRight className="h-5 w-5 text-brand-dark opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}

                    {/* View All Card (End of List) */}
                    <div className="w-[300px] flex items-center justify-center shrink-0">
                        <Link href="/artikel" className="group flex flex-col items-center gap-4 p-8 rounded-full border border-brand-dark/10 aspect-square justify-center hover:bg-brand-dark hover:text-white transition-all select-none">
                            <span className="font-serif text-xl italic">Arsip Berita</span>
                            <ArrowUpRight className="h-10 w-10 group-hover:rotate-45 transition-transform duration-500" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="md:hidden mt-12 text-center px-4">
                <Link
                    href="/artikel"
                    className="inline-flex items-center gap-2 text-brand-dark uppercase tracking-widest text-xs font-bold border-b border-brand-dark pb-1"
                >
                    Lihat Semua Berita
                </Link>
            </div>
        </section>
    );
}
