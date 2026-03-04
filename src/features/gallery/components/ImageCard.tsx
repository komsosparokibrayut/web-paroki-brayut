'use client'

import { Button } from "@/components/ui/button";
import { Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { setCoverImageAction, deleteImageAction } from "@/features/gallery/actions";
import { useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AlbumImage } from "@/types/gallery";

interface ImageCardProps {
    image: AlbumImage;
    albumId: string;
    isCover: boolean;
}

export function ImageCard({ image, albumId, isCover }: ImageCardProps) {
    const [isPending, startTransition] = useTransition();

    return (
        <div className={cn("group relative aspect-square border rounded-lg overflow-hidden", isCover && "ring-2 ring-primary")}>
            <Image
                src={image.src}
                alt="Gallery image"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized={image.src.startsWith("http")}
            />
            {isCover && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 text-xs rounded shadow z-10">
                    Cover
                </div>
            )}

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!isCover && (
                    <Button
                        size="icon"
                        variant="secondary"
                        title="Set as Cover"
                        disabled={isPending}
                        onClick={() => {
                            startTransition(async () => {
                                await setCoverImageAction(albumId, image.src);
                                toast.success("Cover image updated");
                            });
                        }}
                    >
                        <Star className="h-4 w-4" />
                    </Button>
                )}

                <Button
                    size="icon"
                    variant="destructive"
                    title="Delete Image"
                    disabled={isPending}
                    onClick={() => {
                        if (confirm("Delete this image?")) {
                            startTransition(async () => {
                                const result = await deleteImageAction(albumId, image.src);
                                if (result.success) toast.success("Image deleted");
                                else toast.error(result.error);
                            });
                        }
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
