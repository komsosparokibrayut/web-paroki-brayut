'use client';

import { useState } from "react";
import PhotoAlbum from "react-photo-album";
import "react-photo-album/masonry.css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Image from "next/image";
import { Album } from "@/services/github/albums";

interface AlbumLightboxProps {
    album: Album;
}

export function AlbumLightbox({ album }: AlbumLightboxProps) {
    const [index, setIndex] = useState(-1);

    const photos = album.images.map(img => ({
        src: img.src,
        width: img.width,
        height: img.height,
    }));

    // Convert photos for PhotoAlbum (masonry grid preview)
    const galleryPhotos = photos.map(photo => ({
        ...photo,
        key: photo.src
    }));

    return (
        <div className="space-y-4">
            <PhotoAlbum
                layout="masonry"
                photos={galleryPhotos}
                onClick={({ index }) => setIndex(index)}
                columns={(containerWidth) => {
                    if (containerWidth < 640) return 2;
                    if (containerWidth < 1024) return 3;
                    return 4;
                }}
                spacing={16}
                render={{
                    photo: ({ onClick }, { photo, width, height }) => (
                        <div
                            key={photo.key}
                            style={{ width, height, position: 'relative', overflow: 'hidden', borderRadius: '0.75rem', cursor: 'pointer' }}
                            className="group"
                            onClick={onClick}
                        >
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
                            <Image
                                fill
                                src={photo.src}
                                alt=""
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            />
                        </div>
                    )
                }}
            />

            <Lightbox
                index={index}
                slides={photos}
                open={index >= 0}
                close={() => setIndex(-1)}
                plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
            />
        </div>
    );
}
