import { getAlbums } from "@/services/github/albums";
import PhotoAlbum from "react-photo-album";
import "react-photo-album/masonry.css";
import Link from "next/link";
import Image from "next/image";
import { MasonryGallery } from "@/features/gallery/components/MasonryGallery";
import PageHeader from "@/components/layout/PageHeader";

export default async function GalleryPage() {
    const albums = await getAlbums();

    const albumsWithCovers = albums.map(album => {
        // Find cover image or use first image
        const coverPath = album.coverImage || (album.images.length > 0 ? album.images[0].src : null);

        // Find dimensions of cover image for preserving aspect ratio in masonry
        // If no dimensions, default to 4:3
        let width = 800;
        let height = 600;

        if (coverPath) {
            const img = album.images.find(i => i.src === coverPath) || album.images[0];
            if (img) {
                width = img.width;
                height = img.height;
            }
        }

        return {
            ...album,
            coverSrc: coverPath || "/placeholder.jpg", // Needs placeholder
            coverWidth: width,
            coverHeight: height
        };
    });

    return (
        <>
            <PageHeader
                title="Galeri Paroki"
                subtitle="Kumpulan foto kegiatan di Paroki Brayut Santo Yohanes Paulus II."
                image="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2073&auto=format&fit=crop"
                align="center"
            />

            <div className="max-w-7xl h-screen mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <MasonryGallery albums={albumsWithCovers} />
            </div>
        </>
    );
}
