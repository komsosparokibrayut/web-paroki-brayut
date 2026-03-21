"use client";

import { useState } from "react";
import Image from "next/image";
import { User, Phone } from "lucide-react";
import { Pastor } from "@/actions/data";
import { toGoogleDriveImageUrl } from "@/lib/googleDrive";
import { Skeleton } from "@/components/ui/skeleton";

export function PastorCard({ pastor }: { pastor: Pastor }) {
    const [isLoading, setIsLoading] = useState(true);
    const imgSrc = toGoogleDriveImageUrl(pastor.imageUrl || "");

    return (
        <div className="flex-1 max-w-lg bg-white rounded-2xl shadow-lg border border-brand-blue/10 p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col items-center text-center">
                <div className="mb-5 relative">
                    {imgSrc ? (
                        <>
                            {isLoading && (
                                <Skeleton className="w-44 h-44 rounded-full absolute inset-0 z-10 shadow-lg ring-4 ring-brand-blue/10" />
                            )}
                            <Image
                                src={imgSrc}
                                alt={pastor.name}
                                width={176}
                                height={176}
                                className={`w-44 h-44 rounded-full object-cover shadow-lg ring-4 ring-brand-blue/10 transition-opacity duration-500 ${
                                    isLoading ? "opacity-0" : "opacity-100"
                                }`}
                                onLoad={() => setIsLoading(false)}
                                priority
                            />
                        </>
                    ) : (
                        <div className="w-44 h-44 rounded-full bg-gradient-to-br from-brand-blue/10 to-brand-blue/5 border-2 border-dashed border-brand-blue/20 flex items-center justify-center">
                            <User className="h-16 w-16 text-brand-blue/30" />
                        </div>
                    )}
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-1">{pastor.name}</h3>
                <p className="text-brand-blue font-semibold mb-4">{pastor.role}</p>

                {pastor.quote && (
                    <blockquote className="border-l-4 border-brand-blue pl-4 italic text-gray-600 mb-4 bg-brand-blue/5 py-3 pr-4 rounded-r-lg text-left w-full">
                        &quot;{pastor.quote}&quot;
                    </blockquote>
                )}

                {pastor.description && (
                    <p className="text-gray-700 mb-4 whitespace-pre-line leading-relaxed text-left w-full">
                        {pastor.description}
                    </p>
                )}

                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                    {pastor.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                            <span>{pastor.email}</span>
                        </div>
                    )}
                    {pastor.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                            <Phone className="h-3.5 w-3.5 text-brand-blue" />
                            <span>{pastor.phone}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
