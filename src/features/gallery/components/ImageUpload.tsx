'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import imageCompression from "browser-image-compression";
import { uploadImagesAction, addExternalImageAction } from "@/features/gallery/actions";
import { toast } from "sonner";
import { Loader2, Upload, Link2, CheckCircle2, AlertCircle, X } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toGoogleDriveImageUrl, isGoogleDriveUrl } from "@/lib/googleDrive";

export function ImageUpload({ albumId }: { albumId: string }) {
    const [isUploading, setIsUploading] = useState(false);
    const [isAddingUrl, setIsAddingUrl] = useState(false);
    const [driveUrl, setDriveUrl] = useState("");
    const [driveError, setDriveError] = useState<string | null>(null);
    const [popoverOpen, setPopoverOpen] = useState(false);

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

    async function handleAddDriveUrl() {
        if (!driveUrl.trim()) return;

        const converted = toGoogleDriveImageUrl(driveUrl.trim());
        if (!isGoogleDriveUrl(driveUrl.trim()) && !driveUrl.trim().startsWith("http")) {
            setDriveError("Masukkan URL Google Drive yang valid");
            return;
        }

        setIsAddingUrl(true);
        setDriveError(null);

        try {
            const result = await addExternalImageAction(albumId, converted);
            if (result.success) {
                toast.success("Gambar dari URL berhasil ditambahkan");
                setDriveUrl("");
                setPopoverOpen(false);
            } else {
                toast.error(result.error || "Gagal menambahkan gambar");
            }
        } catch (error) {
            console.error("Add URL error", error);
            toast.error("Gagal menambahkan gambar dari URL");
        } finally {
            setIsAddingUrl(false);
        }
    }

    return (
        <div className="flex items-center gap-3">
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

            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Link2 className="h-4 w-4" />
                        Google Drive URL
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-96 p-4">
                    <div className="space-y-3">
                        <div>
                            <h4 className="text-sm font-semibold mb-1">Tambah dari Google Drive</h4>
                            <p className="text-xs text-muted-foreground">
                                Paste link berbagi Google Drive
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="https://drive.google.com/file/d/..."
                                value={driveUrl}
                                onChange={(e) => { setDriveUrl(e.target.value); setDriveError(null); }}
                                className="flex-1 text-sm font-mono"
                                disabled={isAddingUrl}
                            />
                            <Button
                                size="sm"
                                onClick={handleAddDriveUrl}
                                disabled={!driveUrl.trim() || isAddingUrl}
                                className="gap-1 bg-blue-600 hover:bg-blue-700 shrink-0"
                            >
                                {isAddingUrl ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                )}
                                Tambah
                            </Button>
                        </div>
                        {driveError && (
                            <div className="flex items-center gap-2 text-xs text-red-600">
                                <AlertCircle className="h-3 w-3 shrink-0" />
                                {driveError}
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            <p className="text-sm text-muted-foreground">
                Max 200KB per image.
            </p>
        </div>
    );
}
