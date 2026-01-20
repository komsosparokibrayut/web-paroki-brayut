"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function GlobalLoader() {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Check if document is already loaded
        if (document.readyState === "complete") {
            setProgress(100);
            setTimeout(() => setIsVisible(false), 500);
            return;
        }

        // Progress simulation
        const timer = setInterval(() => {
            setProgress((prev) => {
                // Slow down significantly as we approach 90%
                if (prev >= 90) {
                    return 90;
                }
                // Random increment for more "natural" feel
                const increment = Math.random() * 10;
                return Math.min(prev + increment, 90);
            });
        }, 100);

        const handleLoad = () => {
            clearInterval(timer);
            setProgress(100);
            // specific small delay to let users see "100%"
            setTimeout(() => setIsVisible(false), 500);
        };

        window.addEventListener("load", handleLoad);

        return () => {
            clearInterval(timer);
            window.removeEventListener("load", handleLoad);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500",
                progress === 100 ? "opacity-0" : "opacity-100"
            )}
        // Keep it visible until the fade out completes (handled by the component unmounting logic or CSS transition)
        // Actually, since we return null on !isVisible, the fade-out needs to happen BEFORE isVisible becomes false.
        // Modifying logic: isVisible controls rendering. We need a separate state for 'fading'.
        >
            <LoaderContent progress={progress} />
        </div>
    );
}

function LoaderContent({ progress }: { progress: number }) {
    // Using a separate component to ensure clean rendering
    // Render logic moved here for clarity
    return (
        <div className="relative flex flex-col items-center gap-4">
            <div className="animate-pulse">
                <Image
                    src="/images/logo/Logo4x.png"
                    alt="Loading..."
                    width={120}
                    height={120}
                    className="object-contain"
                    priority
                />
            </div>
            <div className="text-xl font-medium text-foreground tabular-nums">
                {Math.round(progress)}%
            </div>
        </div>
    );
}
