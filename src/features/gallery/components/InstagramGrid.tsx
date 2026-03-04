"use client";

import { motion } from "framer-motion";
import { SiInstagram } from "@icons-pack/react-simple-icons";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstagramEmbed } from "./InstagramEmbed";
import { type InstagramPost } from "@/lib/instagramPosts";

interface InstagramGridProps {
    posts: InstagramPost[];
    profileUrl: string;
    username: string;
}

export function InstagramGrid({ posts, profileUrl, username }: InstagramGridProps) {
    if (posts.length === 0) {
        return (
            <div className="text-center py-16">
                {/* Profile CTA even when empty */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md mx-auto"
                >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-[3px] mx-auto mb-6">
                        <div className="w-full h-full rounded-full bg-brand-warm flex items-center justify-center">
                            <SiInstagram className="w-8 h-8 text-brand-dark" />
                        </div>
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-brand-dark mb-3">
                        @{username}
                    </h2>
                    <p className="text-brand-dark/70 mb-6 leading-relaxed">
                        Ikuti kami di Instagram untuk update terbaru kegiatan dan informasi
                        Paroki Brayut Santo Yohanes Paulus II.
                    </p>
                    <a
                        href={profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button
                            className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:from-purple-700 hover:via-pink-600 hover:to-amber-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <SiInstagram className="w-5 h-5 mr-2" />
                            Ikuti di Instagram
                            <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                    </a>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-6 shadow-sm border border-brand-dark/5"
            >
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-[2px] flex-shrink-0">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                            <SiInstagram className="w-6 h-6 text-brand-dark" />
                        </div>
                    </div>
                    <div>
                        <h2 className="font-serif text-xl font-bold text-brand-dark">
                            @{username}
                        </h2>
                        <p className="text-sm text-brand-dark/60">
                            Postingan terbaru dari Instagram kami
                        </p>
                    </div>
                </div>
                <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button
                        variant="outline"
                        className="rounded-full border-brand-dark/20 hover:bg-brand-dark hover:text-white transition-all duration-300 font-medium"
                    >
                        <SiInstagram className="w-4 h-4 mr-2" />
                        Ikuti Kami
                        <ExternalLink className="w-3.5 h-3.5 ml-2" />
                    </Button>
                </a>
            </motion.div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, index) => (
                    <motion.div
                        key={post.url}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.1,
                            ease: "easeOut",
                        }}
                    >
                        <InstagramEmbed url={post.url} index={index} />
                    </motion.div>
                ))}
            </div>

            {/* Bottom CTA */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-center pt-4 pb-2"
            >
                <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button
                        variant="ghost"
                        className="text-brand-dark/70 hover:text-brand-dark font-medium"
                    >
                        Lihat semua postingan di Instagram
                        <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                </a>
            </motion.div>
        </div>
    );
}
