"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    image?: string;
    className?: string;
    align?: "center" | "left";
}

export default function PageHeader({
    title,
    subtitle,
    image,
    className,
    align = "center",
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                "relative w-full overflow-hidden bg-brand-warm min-h-[50vh] flex items-center",
                image && "text-white",
                className
            )}
        >
            {image && (
                <div className="absolute inset-0 z-0 select-none">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-brand-dark/50" />
                </div>
            )}

            <div className={cn("w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10", align === "center" ? "text-center" : "text-left")}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <h1 className={cn(
                        "font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4",
                        image ? "text-white" : "text-brand-dark"
                    )}>
                        {title}
                    </h1>
                    {subtitle && (
                        <p className={cn(
                            "text-lg md:text-xl max-w-2xl mx-auto",
                            align === "left" && "mx-0",
                            image ? "text-white/90" : "text-brand-dark/70"
                        )}>
                            {subtitle}
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
