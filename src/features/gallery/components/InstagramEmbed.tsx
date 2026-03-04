"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface InstagramEmbedProps {
    /** Full Instagram post URL e.g. https://www.instagram.com/p/XXXXX/ */
    url: string;
    /** Index for staggered animation delay */
    index?: number;
}

/**
 * Renders an Instagram post embed using Instagram's native blockquote + embed.js approach.
 * Loads the Instagram embed script once and processes embeds as they mount.
 */
export function InstagramEmbed({ url, index = 0 }: InstagramEmbedProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load Instagram embed script if not already loaded
        const existingScript = document.querySelector(
            'script[src="//www.instagram.com/embed.js"]'
        );

        if (!existingScript) {
            const script = document.createElement("script");
            script.src = "//www.instagram.com/embed.js";
            script.async = true;
            script.onload = () => {
                if ((window as any).instgrm) {
                    (window as any).instgrm.Embeds.process();
                }
                setIsLoaded(true);
            };
            document.body.appendChild(script);
        } else {
            // Script already exists, just process embeds
            if ((window as any).instgrm) {
                (window as any).instgrm.Embeds.process();
            }
            setIsLoaded(true);
        }

        // Small delay for re-processing when component mounts
        const timer = setTimeout(() => {
            if ((window as any).instgrm) {
                (window as any).instgrm.Embeds.process();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [url]);

    // Ensure URL ends with /
    const normalizedUrl = url.endsWith("/") ? url : `${url}/`;

    return (
        <div
            ref={containerRef}
            className="instagram-embed-container w-full"
            style={{
                animationDelay: `${index * 100}ms`,
            }}
        >
            {!isLoaded && (
                <div className="rounded-lg overflow-hidden border border-border">
                    <Skeleton className="w-full aspect-square" />
                    <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            )}
            <blockquote
                className="instagram-media"
                data-instgrm-captioned
                data-instgrm-permalink={normalizedUrl}
                data-instgrm-version="14"
                style={{
                    background: "#FFF",
                    border: 0,
                    borderRadius: "12px",
                    boxShadow:
                        "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
                    margin: "0",
                    maxWidth: "540px",
                    minWidth: "280px",
                    padding: 0,
                    width: "100%",
                }}
            >
                <a
                    href={normalizedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 text-center text-brand-blue hover:text-brand-gold transition-colors"
                >
                    Lihat postingan ini di Instagram →
                </a>
            </blockquote>
        </div>
    );
}
