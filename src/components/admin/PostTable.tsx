"use client";

import Link from "next/link";
import { useState } from "react";
import { deletePost } from "@/actions/posts";
import { PostMetadata } from "@/types/post";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLoading } from "./LoadingProvider";
import ConfirmModal from "./ConfirmModal";
import { Input } from "@/components/ui/input";
import { Eye, Pencil, Trash2, Search, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PostTableProps {
  posts: PostMetadata[];
  hidePagination?: boolean;
  showCreateButton?: boolean;
}

// Helper to truncate title
function truncateTitle(title: string, maxLength: number = 60): string {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength).trim() + "...";
}

export default function PostTable({ posts, hidePagination = false, showCreateButton = false }: PostTableProps) {
  const { startTransition } = useLoading();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<{ slug: string; title: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<string>("10");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(posts.flatMap(p => p.categories || []))).filter(Boolean).sort();

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || (post.categories?.includes(categoryFilter));

    if (statusFilter === "all") return matchesSearch && matchesCategory;
    if (statusFilter === "published") return matchesSearch && matchesCategory && post.published;
    if (statusFilter === "draft") return matchesSearch && matchesCategory && !post.published;

    return matchesSearch && matchesCategory;
  });

  const effectiveItemsPerPage = itemsPerPage === "all" ? filteredPosts.length : parseInt(itemsPerPage);
  const totalPages = Math.ceil(filteredPosts.length / effectiveItemsPerPage);

  const paginatedPosts = itemsPerPage === "all"
    ? filteredPosts
    : filteredPosts.slice((currentPage - 1) * effectiveItemsPerPage, currentPage * effectiveItemsPerPage);

  const handleItemsPerPageChange = (val: string) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (val: string) => {
    setCategoryFilter(val);
    setCurrentPage(1);
  };

  const openDeleteModal = (slug: string, title: string) => {
    setPostToDelete({ slug, title });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;

    startTransition(async () => {
      setIsDeleting(postToDelete.slug);
      const result = await deletePost(postToDelete.slug);

      if (result.success) {
        toast.success("Post deleted successfully!");
        setDeleteModalOpen(false);
        setPostToDelete(null);
        router.refresh();
      } else {
        toast.error("Failed to delete post: " + result.error);
      }
      setIsDeleting(null);
    });
  };

  return (
    <div className="space-y-4">
      {/* Table Header with Filters and Create Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-white border-slate-200 text-sm"
            />
          </div>
          {!hidePagination && (
            <>
              <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
                <SelectTrigger className="w-[140px] h-9 py-2 border-slate-200 text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[110px] h-9 border-slate-200 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
        {showCreateButton && (
          <Button asChild className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Link href="/admin/posts/new">
              <Plus className="h-4 w-4" />
              Create Post
            </Link>
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="py-3 px-4 font-semibold text-slate-700">Post</TableHead>
              <TableHead className="py-3 px-4 font-semibold text-slate-700">Category</TableHead>
              <TableHead className="py-3 px-4 font-semibold text-slate-700">Status</TableHead>
              <TableHead className="py-3 px-4 font-semibold text-slate-700">Date</TableHead>
              <TableHead className="py-3 px-4 text-right font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  No posts found.
                </TableCell>
              </TableRow>
            ) : paginatedPosts.map((post) => {
              const displayCategories = post.categories || [];
              const firstCategory = displayCategories[0] || "Uncategorized";
              const hasMoreCategories = displayCategories.length > 1;
              const truncatedTitle = truncateTitle(post.title, 60);
              const isTruncated = post.title.length > 60;

              return (
                <TableRow key={post.slug} className="hover:bg-slate-50/50">
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-md shrink-0">
                        <AvatarFallback className="rounded-md bg-blue-50 text-blue-600">
                          <FileText className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        {isTruncated ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/admin/posts/${post.slug}/edit`} className="font-medium text-slate-900 hover:text-blue-600 hover:underline">
                                  {truncatedTitle}
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p>{post.title}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Link href={`/admin/posts/${post.slug}/edit`} className="font-medium text-slate-900 hover:text-blue-600 hover:underline">
                            {post.title}
                          </Link>
                        )}
                        <span className="text-xs text-slate-500">{post.author}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    {hasMoreCategories ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="inline-flex items-center gap-1 cursor-pointer group">
                            <Badge variant="outline" className="capitalize font-normal text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 transition-colors">
                              {firstCategory.replace("-", " ")}
                            </Badge>
                            <span className="text-xs text-slate-400 group-hover:text-blue-500">+{displayCategories.length - 1}</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" align="start">
                          <div className="flex flex-col gap-1">
                            <p className="text-xs font-medium text-slate-500 mb-1">All Categories</p>
                            {displayCategories.map(cat => (
                              <Badge key={cat} variant="secondary" className="capitalize font-normal justify-start">
                                {cat.replace("-", " ")}
                              </Badge>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <Badge variant="outline" className="capitalize font-normal text-slate-600 border-slate-200">
                        {firstCategory.replace("-", " ")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Badge
                      variant={post.published ? "default" : "secondary"}
                      className={post.published
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }
                    >
                      {post.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-slate-500 text-sm">
                    {new Date(post.publishedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    {/* Inline action buttons instead of dropdown */}
                    <div className="flex items-center justify-end gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                              asChild
                            >
                              <Link href={`/admin/posts/${post.slug}/edit`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-green-600 hover:bg-green-50"
                              asChild
                            >
                              <Link
                                href={`/artikel/${firstCategory.toLowerCase().replace(/\s+/g, '-')}/${post.slug}`}
                                target="_blank"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Live</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => openDeleteModal(post.slug, post.title)}
                              disabled={isDeleting === post.slug}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {posts.length > 0 && !hidePagination && (
        <div className="flex items-center justify-between px-2 py-2">
          <p className="text-sm text-slate-500">
            Showing {((currentPage - 1) * effectiveItemsPerPage) + 1} to {Math.min(currentPage * effectiveItemsPerPage, filteredPosts.length)} of {filteredPosts.length} entries
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Rows:</span>
              <Select
                value={itemsPerPage}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="h-8 w-[70px] border-slate-200">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-slate-200"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-slate-200"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-600 px-2">
                {currentPage} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-slate-200"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-slate-200"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPostToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Post"
        description={`Apakah Anda yakin ingin menghapus "${postToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        loading={!!isDeleting}
        confirmText="Hapus"
        variant="destructive"
      />
    </div>
  );
}
