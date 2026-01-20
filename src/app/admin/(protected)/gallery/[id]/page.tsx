import { getAlbum } from "@/services/github/albums";
import { ImageUpload } from "@/features/gallery/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ImageCard } from "@/features/gallery/components/ImageCard";

export default async function AlbumPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const album = await getAlbum(id);

    if (!album) {
        return <div>Album not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/gallery">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{album.title}</h1>
                    <p className="text-muted-foreground">{new Date(album.date).toLocaleDateString()}</p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-medium mb-2">Description</h3>
                        <p>{album.description}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Images ({album.images.length})</h2>
                    <ImageUpload albumId={album.id} />
                </div>

                {album.images.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground border rounded-lg border-dashed">
                        No images yet. Upload some photos to get started.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {album.images.map((image) => (
                            <ImageCard
                                key={image.src}
                                image={image}
                                albumId={album.id}
                                isCover={album.coverImage === image.src}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
