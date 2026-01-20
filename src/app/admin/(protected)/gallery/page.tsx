import { getAlbums } from "@/services/github/albums";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { DeleteAlbumButton } from "@/features/gallery/components/DeleteAlbumButton";

export default async function GalleryPage() {
    const albums = await getAlbums();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Gallery Albums</h1>
                <Link href="/admin/gallery/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Album
                    </Button>
                </Link>
            </div>

            {albums.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    No albums found. Create one to get started.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {albums.map((album) => (
                        <Card key={album.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {new Date(album.date).toLocaleDateString()}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold mb-2">{album.title}</div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    {album.description}
                                </p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    {album.images.length} photos
                                </p>
                                <div className="flex gap-2">
                                    <Link href={`/admin/gallery/${album.id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">Manage</Button>
                                    </Link>
                                    <DeleteAlbumButton id={album.id} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
