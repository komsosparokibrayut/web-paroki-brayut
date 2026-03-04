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
import { Loader2, Upload, X, Image as ImageIcon, Link2, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toGoogleDriveImageUrl, isGoogleDriveUrl } from "@/lib/googleDrive";

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

  // Google Drive URL state
  const [driveUrl, setDriveUrl] = useState("");
  const [drivePreview, setDrivePreview] = useState("");
  const [driveError, setDriveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("library");

  useEffect(() => {
    if (isOpen) {
      fetchImages();
      // Reset Google Drive state when opening
      setDriveUrl("");
      setDrivePreview("");
      setDriveError(null);
      setActiveTab("library");
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

  // Handle Google Drive URL input
  const handleDriveUrlChange = (url: string) => {
    setDriveUrl(url);
    setDriveError(null);

    if (!url.trim()) {
      setDrivePreview("");
      return;
    }

    // Check if it's a valid Google Drive URL or any image URL
    const converted = toGoogleDriveImageUrl(url.trim());
    if (isGoogleDriveUrl(url.trim())) {
      setDrivePreview(converted);
    } else if (url.trim().startsWith("http")) {
      // Allow any HTTP(S) URL as well
      setDrivePreview(url.trim());
    } else {
      setDriveError("Masukkan URL Google Drive yang valid atau URL gambar lainnya");
      setDrivePreview("");
    }
  };

  const handleDriveSelect = () => {
    if (drivePreview) {
      onSelect(drivePreview);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Media Library</DialogTitle>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-3 border-b">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="library" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                Media Library
              </TabsTrigger>
              <TabsTrigger value="gdrive" className="gap-2">
                <Link2 className="h-4 w-4" />
                Google Drive URL
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Library Tab */}
          <TabsContent value="library" className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden">
            <div className="flex-1 overflow-hidden h-full flex flex-col">
              <div className="px-6 py-3 flex justify-end">
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

              {error && (
                <div className="mx-6 bg-destructive/10 text-destructive p-3 rounded-md text-sm font-medium">
                  {error}
                </div>
              )}

              <ScrollArea className="flex-1 px-6 pb-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-[40vh] text-muted-foreground gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p>Loading media...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-4">
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
          </TabsContent>

          {/* Google Drive URL Tab */}
          <TabsContent value="gdrive" className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden">
            <div className="p-6 space-y-6 h-full flex flex-col">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">Paste Google Drive Shareable URL</h3>
                  <p className="text-xs text-slate-500">
                    Paste link berbagi Google Drive, contoh: https://drive.google.com/file/d/.../view?usp=sharing
                  </p>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="https://drive.google.com/file/d/..."
                    value={driveUrl}
                    onChange={(e) => handleDriveUrlChange(e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    onClick={handleDriveSelect}
                    disabled={!drivePreview}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 shrink-0"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Gunakan
                  </Button>
                </div>

                {driveError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {driveError}
                  </div>
                )}
              </div>

              {/* Preview */}
              {drivePreview ? (
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-slate-700">Preview</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs text-slate-500"
                      onClick={() => { setDriveUrl(""); setDrivePreview(""); setDriveError(null); }}
                    >
                      <X className="h-3 w-3" />
                      Clear
                    </Button>
                  </div>
                  <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={drivePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={() => setDriveError("Gambar tidak dapat dimuat. Pastikan file sudah dibagikan (share) sebagai 'Anyone with the link'.")}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono break-all">{drivePreview}</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <Link2 className="h-10 w-10 mb-3 opacity-30" />
                  <p className="font-medium text-sm">Paste URL di atas untuk preview</p>
                  <p className="text-xs mt-1 opacity-70">Pastikan file sudah dibagikan (share) ke &quot;Anyone with the link&quot;</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
