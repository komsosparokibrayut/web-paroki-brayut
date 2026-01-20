'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import imageCompression from "browser-image-compression";
import { uploadImagesAction } from "@/features/gallery/actions";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

export function ImageUpload({ albumId }: { albumId: string }) {
    const [isUploading, setIsUploading] = useState(false);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.length) return;

        setIsUploading(true);
        const files = Array.from(e.target.files);
        const formData = new FormData();

        try {
            for (const file of files) {
                // Compress image
                const options = {
                    maxSizeMB: 0.2, // 200KB limit
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };

                try {
                    const compressedFile = await imageCompression(file, options);
                    formData.append("images", compressedFile, file.name);
                } catch (error) {
                    console.error("Compression failed for", file.name, error);
                    formData.append("images", file);
                }
            }

            const result = await uploadImagesAction(albumId, formData);
            if (result.success) {
                toast.success("Images uploaded successfully");
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            console.error("Upload error", error);
            toast.error("Failed to upload images");
        } finally {
            setIsUploading(false);
            e.target.value = ""; // Reset input
        }
    }

    return (
        <div className="flex items-center gap-4">
            <Button disabled={isUploading} className="relative cursor-pointer">
                {isUploading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Compressing & Uploading...
                    </>
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Images
                    </>
                )}
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleUpload}
                    disabled={isUploading}
                />
            </Button>
            <p className="text-sm text-muted-foreground">
                Max 200KB per image.
            </p>
        </div>
    );
}
