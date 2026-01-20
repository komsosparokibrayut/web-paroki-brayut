'use client';

import PhotoAlbum from "react-photo-album";
import "react-photo-album/masonry.css";
import Link from "next/link";
import Image from "next/image";
import { Album } from "@/services/github/albums";

interface MasonryGalleryProps {
    albums: (Album & {
        coverSrc: string;
        coverWidth: number;
        coverHeight: number;
    })[];
}

export function MasonryGallery({ albums }: MasonryGalleryProps) {
    const photos = albums.map(album => ({
        src: album.coverSrc,
        width: album.coverWidth,
        height: album.coverHeight,
        key: album.id,
        title: album.title,
        description: album.description,
        count: album.images.length,
        date: new Date(album.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    }));

    return (
        <PhotoAlbum
            layout="masonry"
            photos={photos}
            columns={(containerWidth) => {
                if (containerWidth < 640) return 1;
                if (containerWidth < 1024) return 2;
                return 3;
            }}
            spacing={24}
            render={{
                photo: (_, { photo, width, height }) => (
                    <div key={photo.key} style={{ width, height }} className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                        <Link href={`/galeri/${photo.key}`} className="block w-full h-full">
                            <Image
                                fill
                                src={photo.src}
                                alt={photo.title || "Album cover"}
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                                <h3 className="text-white font-bold text-xl mb-1">{photo.title}</h3>
                                <div className="flex items-center justify-between text-white/80 text-sm">
                                    <span>{photo.date}</span>
                                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs backdrop-blur-sm">
                                        {photo.count} Foto
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                )
            }}
        />
    );
}
