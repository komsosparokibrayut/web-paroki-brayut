"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export function LoadingOverlay() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 99) {
                    clearInterval(interval);
                    return 99;
                }
                return prev + 1;
            });
        }, 50); // Adjust speed as needed

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
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
                    {progress}%
                </div>
            </div>
        </div>
    );
}
