"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GradientActionCardProps {
    title: string;
    description: string;
    actionLabel: string;
    actionLink: string;
    icon?: React.ReactNode;
    className?: string;
}

export default function GradientActionCard({
    title,
    description,
    actionLabel,
    actionLink,
    icon,
    className
}: GradientActionCardProps) {
    return (
        <div className={cn("relative overflow-hidden rounded-3xl border border-white/20 shadow-xl group/card", className)}>
            {/* Animated Background */}
            <div className="absolute inset-0 bg-brand-warm/50" />

            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                    x: [0, 100, 0],
                    y: [0, -50, 0]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear"
                }}
                className="absolute -top-[50%] -left-[20%] w-[100%] h-[100%] rounded-full bg-brand-blue/20 blur-[80px]"
            />

            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, -60, 0],
                    x: [0, -80, 0],
                    y: [0, 60, 0]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear"
                }}
                className="absolute top-[20%] -right-[20%] w-[80%] h-[80%] rounded-full bg-brand-gold/20 blur-[80px]"
            />

            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, 40, 0],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                }}
                className="absolute -bottom-[40%] left-[20%] w-[80%] h-[80%] rounded-full bg-blue-300/20 blur-[100px]"
            />

            {/* Glass Content Container */}
            <div className="relative z-10 p-8 md:p-12 pb-16 text-center backdrop-blur-sm bg-white/10 h-full flex flex-col items-center justify-center">
                <div className="mb-6 p-4 rounded-full bg-white/40 shadow-sm backdrop-blur-md ">
                    {icon || <CheckCircle2 className="h-8 w-8 text-brand-dark" />}
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-brand-dark mb-4 drop-shadow-sm">{title}</h2>
                <p className="text-gray-700 max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
                    {description}
                </p>

                <Link
                    href={actionLink}
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-brand-dark text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-brand-blue/20 hover:bg-brand-blue group/button"
                >
                    {actionLabel} <ArrowRight className="ml-2 h-4 w-4 transform group-hover/button:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Shine Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />
        </div>
    );
}
