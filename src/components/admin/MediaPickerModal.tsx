"use client";

import { useState, useEffect, useRef } from "react";
import { listImages, uploadImages, MediaImage } from "@/actions/media";
import { useLoading } from "./LoadingProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  initialTab?: "all" | "banner" | "inline";
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  initialTab = "all",
}: MediaPickerModalProps) {
  const { startTransition } = useLoading();
  const [images, setImages] = useState<MediaImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const { inline } = await listImages();
      // Filter out gitkeep and other hidden files
      const filtered = inline.filter(img => !img.name.endsWith('.gitkeep'));
      setImages(filtered);
    } catch (err) {
      console.error("Failed to fetch images", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    startTransition(async () => {
      setUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        Array.from(files).forEach(file => formData.append("files", file));

        const result = await uploadImages(formData, "inline");
        if (result.success && result.paths) {
          // Refresh list
          await fetchImages();
        } else {
          setError(result.error || "Upload failed");
        }
      } catch (err) {
        setError("Upload failed");
      } finally {
        setUploading(false);
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Media Library</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
                size="sm"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading..." : "Upload New"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">

          {error && (
            <div className="mx-6 mt-4 bg-destructive/10 text-destructive p-3 rounded-md text-sm font-medium">
              {error}
            </div>
          )}

          <ScrollArea className="h-full p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Loading media...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-20">
                {images.map((img) => (
                  <div
                    key={img.path}
                    className="group relative aspect-square bg-muted/30 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-all shadow-sm hover:shadow-md"
                    onClick={() => onSelect(img.path)}
                  >
                    <Image
                      src={img.path}
                      alt={img.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 33vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium p-2 truncate opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                      {img.name}
                    </div>
                  </div>
                ))}
                {images.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                    <ImageIcon className="h-10 w-10 mb-2 opacity-20" />
                    <p className="font-medium">No images found</p>
                    <p className="text-sm opacity-70">Upload an image to get started</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
