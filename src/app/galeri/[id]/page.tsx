import { getAlbum } from "@/services/github/albums";
import { notFound } from "next/navigation";
import { AlbumLightbox } from "@/features/gallery/components/AlbumLightbox";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Calendar, Image as ImageIcon } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Separator } from "@/components/ui/separator";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const { id } = await params;
    const album = await getAlbum(id);

    if (!album) {
        return {
            title: 'Album Not Found',
        };
    }

    const coverImage = album.coverImage || (album.images.length > 0 ? album.images[0].src : '/placeholder.jpg'); // Adjust placeholder paths
    // Ensure full URL for OG tags
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const imageUrl = coverImage.startsWith('http') ? coverImage : `${siteUrl}${coverImage}`;

    return {
        title: `${album.title} | Galeri Paroki`,
        description: album.description,
        openGraph: {
            title: album.title,
            description: album.description,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: album.title,
                },
            ],
            type: 'article',
        },
    };
}

export default async function AlbumDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const album = await getAlbum(id);

    if (!album) {
        notFound();
    }

    const coverImage = album.coverImage || (album.images.length > 0 ? album.images[0].src : undefined);

    return (
        <>
            <PageHeader
                title={album.title}
                subtitle={`${new Date(album.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • ${album.images.length} Foto`}
                image={coverImage}
                align="center"
            />

            <div className="max-w-7xl h-screen mx-auto px-4 sm:px-6 lg:px-8 py-12">

                <Link href="/galeri" className="inline-block mb-4">
                    <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Kembali ke Galeri
                    </Button>
                </Link>

                {album.description && (
                    <p className="max-w-3xl text-lg leading-relaxed">
                        {album.description}
                    </p>
                )}
                <Separator className="my-6" />

                <AlbumLightbox album={album} />
            </div>
        </>
    );
}
