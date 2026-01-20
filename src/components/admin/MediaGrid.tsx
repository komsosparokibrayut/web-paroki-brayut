"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { deleteImage, MediaImage } from "@/actions/media";
import { useRouter } from "next/navigation";
import { useLoading } from "./LoadingProvider";
import { toast } from "sonner";
import ConfirmModal from "@/components/admin/ConfirmModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import { Copy, Trash2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaGridProps {
  initialImages: MediaImage[];
}

type SortOption = "latest" | "name" | "size";

export default function MediaGrid({ initialImages }: MediaGridProps) {
  const { startTransition } = useLoading();
  const router = useRouter();
  const [images, setImages] = useState<MediaImage[]>(initialImages);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<string>("25");
  const [deleteTarget, setDeleteTarget] = useState<MediaImage | null>(null);

  // Sync state when initialImages changes (from router.refresh)
  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getTimestamp = (name: string) => {
    const parts = name.split('-');
    // Pattern: inline-basename-timestamp-hash.webp or basename-timestamp-hash.webp
    // timestamp is second-to-last
    const tsPart = parts[parts.length - 2];
    return parseInt(tsPart) || 0;
  };

  const sortedImages = useMemo(() => {
    const filtered = images.filter(img => !img.name.endsWith('.gitkeep'));

    return [...filtered].sort((a, b) => {
      if (sortBy === "latest") {
        return getTimestamp(b.name) - getTimestamp(a.name);
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "size") {
        return b.size - a.size;
      }
      return 0;
    });
  }, [images, sortBy]);

  const effectiveItemsPerPage = itemsPerPage === "all" ? sortedImages.length : parseInt(itemsPerPage);
  const totalPages = Math.ceil(sortedImages.length / effectiveItemsPerPage) || 1;

  const paginatedImages = useMemo(() => {
    if (itemsPerPage === "all") return sortedImages;
    const start = (currentPage - 1) * effectiveItemsPerPage;
    return sortedImages.slice(start, start + effectiveItemsPerPage);
  }, [sortedImages, currentPage, effectiveItemsPerPage, itemsPerPage]);

  const handleItemsPerPageChange = (val: string) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  // Reset to page 1 when sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const path = deleteTarget.path;

    startTransition(async () => {
      setDeleting(path);
      const result = await deleteImage(path);

      if (result.success) {
        toast.success("Image deleted successfully!");
        setImages(images.filter((img) => img.path !== path));
        router.refresh();
      } else {
        toast.error("Failed to delete image: " + result.error);
      }
      setDeleting(null);
      setDeleteTarget(null);
    });
  };

  return (
    <div className="flex flex-col p-6 min-h-[600px] gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            Total {sortedImages.length} images
          </div>
          {sortedImages.length > 0 && (
            <div className="text-sm font-medium text-muted-foreground">
              Showing {Math.min((currentPage - 1) * effectiveItemsPerPage + 1, sortedImages.length)} - {Math.min(currentPage * effectiveItemsPerPage, sortedImages.length)}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sort by:</label>
            <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="Latest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest Upload</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="size">Large Size First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Show:</label>
            <Select value={itemsPerPage} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[100px] h-9 text-xs">
                <SelectValue placeholder="25 items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 items</SelectItem>
                <SelectItem value="50">50 items</SelectItem>
                <SelectItem value="all">Show All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {paginatedImages.length === 0 ? (
        <Card className="flex-1 flex flex-col items-center justify-center py-20 bg-muted/20 border-dashed">
          <ImageIcon className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground font-medium">No images found in your library.</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {paginatedImages.map((img) => (
              <div
                key={img.path}
                className="group/card relative bg-card border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50 aspect-square"
              >
                {/* Image Container */}
                <div className="absolute inset-0 bg-muted/30">
                  <Image
                    src={img.path}
                    alt={img.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                </div>

                {/* Action Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(img.path);
                            toast.success("Path copied to clipboard!");
                          }}
                          className="p-2 bg-background text-foreground rounded-md hover:bg-primary hover:text-primary-foreground transition-all transform hover:scale-110 shadow-sm"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Copy Image URL</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setDeleteTarget(img)}
                          disabled={deleting === img.path}
                          className="p-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-all transform hover:scale-110 shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Delete Image</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm p-2 border-t flex flex-col gap-0.5">
                  <div className="text-[10px] font-semibold truncate text-foreground">
                    {img.name}
                  </div>
                  <div className="text-[9px] font-medium text-muted-foreground uppercase">
                    {formatSize(img.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {itemsPerPage !== "all" && totalPages > 1 && (
            <div className="mt-auto pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground font-medium">
                Showing <span className="text-foreground font-bold">{Math.min((currentPage - 1) * effectiveItemsPerPage + 1, sortedImages.length)}</span> to <span className="text-foreground font-bold">{Math.min(currentPage * effectiveItemsPerPage, sortedImages.length)}</span> of <span className="text-foreground font-bold">{sortedImages.length}</span> results
              </p>
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      aria-disabled={currentPage === 1}
                      className={cn("cursor-pointer", currentPage === 1 && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      aria-disabled={currentPage === totalPages}
                      className={cn("cursor-pointer", currentPage === totalPages && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Gambar"
        description={`Apakah Anda yakin ingin menghapus gambar "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="destructive"
      />
    </div>
  );
}
