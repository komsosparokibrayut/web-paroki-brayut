"use client";

import PhotoAlbum from "react-photo-album";
import "react-photo-album/masonry.css";
import Image from "next/image";

interface SimplePhoto {
    src: string;
    width: number;
    height: number;
    alt?: string;
}

interface GerejaGalleryProps {
    photos: SimplePhoto[];
    churchName: string;
}

export function GerejaGallery({ photos, churchName }: GerejaGalleryProps) {
    if (photos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Foto-foto akan segera ditambahkan</p>
            </div>
        );
    }

    return (
        <PhotoAlbum
            layout="masonry"
            photos={photos}
            columns={(containerWidth) => {
                if (containerWidth < 640) return 1;
                if (containerWidth < 1024) return 2;
                return 3;
            }}
            spacing={16}
            render={{
                photo: (_, { photo, width, height }) => (
                    <div
                        style={{ width, height }}
                        className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
                    >
                        <Image
                            fill
                            src={photo.src}
                            alt={photo.alt || churchName}
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            unoptimized={photo.src.startsWith("http")}
                        />
                    </div>
                ),
            }}
        />
    );
}
