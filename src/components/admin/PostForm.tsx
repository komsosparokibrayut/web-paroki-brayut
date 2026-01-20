"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPost, updatePost, deletePost } from "@/actions/posts";
import { toast } from "sonner";
import { getAllCategories, addCategory } from "@/actions/categories";
import QuillEditor from "./QuillEditor";
import MediaPickerModal from "./MediaPickerModal";
import ConfirmModal from "./ConfirmModal";
import StatusPill from "./StatusPill";
import { Post } from "@/types/post";
import { useLoading } from "./LoadingProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Eye, ChevronLeft, ChevronDown, X, Image as ImageIcon, Loader2, Settings, Search, FileImage, CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface PostFormProps {
    post?: Post;
    mode: "create" | "edit";
    user?: { name?: string | null } | null;
    categories: string[];
}

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().optional(), // Optional for create (auto-generated), editable for edit
    description: z.string().optional(),
    author: z.string(),
    categories: z.array(z.string()).min(1, "At least one category is required"),
    content: z.any(),
    banner: z.string().optional(),
    published: z.boolean(),
    publishedAt: z.date().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
    ogImage: z.string().optional(),
});

export default function PostForm({ post, mode, user, categories: masterCategories }: PostFormProps) {
    const router = useRouter();
    const { startTransition } = useLoading();

    // Form definition
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: post?.frontmatter.title || "",
            slug: post?.frontmatter.slug || "",
            description: post?.frontmatter.description || "",
            author: post?.frontmatter.author || user?.name || "Admin Paroki",
            categories: post?.frontmatter.categories || [],
            content: post?.content || { ops: [] },
            banner: post?.frontmatter.banner || "",
            published: post?.frontmatter.published || false,
            publishedAt: post?.frontmatter.publishedAt ? new Date(post.frontmatter.publishedAt) : undefined,
            metaTitle: post?.frontmatter.metaTitle || "",
            metaDescription: post?.frontmatter.metaDescription || "",
            metaKeywords: Array.isArray(post?.frontmatter.metaKeywords)
                ? post?.frontmatter.metaKeywords.join(", ")
                : post?.frontmatter.metaKeywords || "",
            ogImage: post?.frontmatter.ogImage || "",
        },
    });

    const [categoryInput, setCategoryInput] = useState("");
    const [existingCategories, setExistingCategories] = useState<string[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showBannerPicker, setShowBannerPicker] = useState(false);
    const [showOgImagePicker, setShowOgImagePicker] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);

    // Watch values for UI updates
    const watchedCategories = form.watch("categories");
    const watchedBanner = form.watch("banner");
    const watchedOgImage = form.watch("ogImage");
    const watchedPublished = form.watch("published");
    const watchedTitle = form.watch("title");
    const { isDirty } = form.formState;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setShowCategoryDropdown(false);
            }
        };
        if (showCategoryDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showCategoryDropdown]);

    // Fetch categories for suggestions
    useEffect(() => {
        setLoadingCategories(true);
        getAllCategories()
            .then(setExistingCategories)
            .finally(() => setLoadingCategories(false));
    }, []);

    const onSubmit = async (values: z.infer<typeof formSchema>, publishStatus?: boolean) => {
        // Validation check for empty content
        const hasContent = values.content &&
            (typeof values.content === 'string' ? values.content.trim() !== "" :
                values.content.ops && values.content.ops.length > 0);

        if (!hasContent) {
            setError("Content is required.");
            return;
        }

        // Override published status if provided
        const finalPublished = publishStatus !== undefined ? publishStatus : values.published;

        startTransition(async () => {
            setSaving(true);
            setError(null);

            // Logic to auto-save new categories if entered
            for (const cat of values.categories) {
                // Normalize for check
                const normalized = cat.trim();
                const exists = existingCategories.some(existing => existing.toLowerCase() === normalized.toLowerCase());
                if (!exists) {
                    await addCategory(normalized);
                }
            }

            const data = {
                ...values,
                description: values.description || "",
                content: values.content,
                published: finalPublished,
                publishedAt: values.publishedAt ? values.publishedAt.toISOString() : undefined,
                newSlug: values.slug, // Pass new slug for rename
            };

            const result = mode === "create"
                ? await createPost(data)
                : await updatePost(post!.frontmatter.slug, data);

            setSaving(false);

            if (result.success) {
                toast.success(mode === "create" ? "Post created successfully!" : "Post updated successfully!");
                router.push("/admin/posts");
                router.refresh();
            } else {
                setError(result.error || "Failed to save post");
            }
        });
    };

    // Wrapper for Save/Publish buttons to force submit
    const handleSaveAction = (publish: boolean) => {
        form.setValue("published", publish);
        form.handleSubmit((values) => onSubmit(values, publish))();
    };

    const handleDelete = () => {
        if (!post) return;
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!post) return;
        startTransition(async () => {
            setSaving(true);
            const result = await deletePost(post.frontmatter.slug);
            if (result.success) {
                toast.success("Post deleted successfully!");
                router.push("/admin/posts");
                router.refresh();
            } else {
                setError(result.error || "Failed to delete post");
                setSaving(false);
                setShowDeleteModal(false);
            }
        });
    };

    const addCategoryItem = (cat: string) => {
        const trimmed = cat.trim();
        const currentCategories = form.getValues("categories");
        // Case-insensitive duplicate check
        const exists = currentCategories.some(c => c.toLowerCase() === trimmed.toLowerCase());

        if (trimmed && !exists) {
            form.setValue("categories", [...currentCategories, trimmed]);
        }
        setCategoryInput("");
    };

    const removeCategoryItem = (cat: string) => {
        const currentCategories = form.getValues("categories");
        form.setValue("categories", currentCategories.filter((c) => c !== cat));
    };

    return (
        <Form {...form}>
            <form className="min-h-screen relative pb-16">
                {/* Sticky Header with Actions */}
                <div className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 py-3 mb-6 border-b border-slate-200 -mx-4 sm:-mx-6 px-4 sm:px-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="gap-1.5 text-slate-600 hover:text-slate-900"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </Button>
                            <div className="h-5 w-px bg-slate-200" />
                            <div className="flex items-center gap-2">
                                <StatusPill published={watchedPublished} />
                                <h2 className="text-base font-semibold text-slate-900 hidden sm:block">
                                    {mode === "create" ? "Create New Post" : watchedTitle || "Untitled"}
                                </h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {mode === "edit" && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDelete}
                                    disabled={saving}
                                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                >
                                    Delete
                                </Button>
                            )}

                            <div className="flex items-center">
                                <Button
                                    type="button"
                                    onClick={() => handleSaveAction(true)}
                                    disabled={saving || (mode === "edit" && !isDirty)}
                                    size="sm"
                                    className="rounded-r-none bg-blue-600 hover:bg-blue-700"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (watchedPublished ? "Update" : "Publish")}
                                </Button>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="rounded-l-none px-2 bg-blue-600 hover:bg-blue-700 border-l border-blue-500"
                                            disabled={saving || (mode === "edit" && !isDirty)}
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="end" className="w-[180px] p-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-start font-normal"
                                            disabled={mode === "edit" && !isDirty}
                                            onClick={() => handleSaveAction(false)}
                                        >
                                            Save as Draft
                                        </Button>
                                        {mode === "edit" && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="w-full justify-start font-normal"
                                                onClick={() => {
                                                    const cats = form.getValues("categories");
                                                    const category = (cats.length > 0 ? cats[0].trim().toLowerCase().replace(/\s+/g, '-') : 'lainnya');
                                                    const title = form.getValues("title");
                                                    const slug = post?.frontmatter.slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : null);

                                                    if (slug) {
                                                        window.open(`/artikel/${category}/${slug}`, '_blank');
                                                    } else {
                                                        alert("Please enter a title to preview.");
                                                    }
                                                }}
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                Preview
                                            </Button>
                                        )}
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <QuillEditor
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Sidebar Settings */}
                    <div className="relative">
                        <div className="lg:sticky lg:top-[76px] space-y-4">
                            {/* Post Settings Card */}
                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                <h3 className="font-semibold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-slate-400" />
                                    Post Settings
                                </h3>

                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700">Title</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter title..."
                                                        {...field}
                                                        className="border-slate-200 focus-visible:ring-blue-500"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Slug Field */}
                                    <FormField
                                        control={form.control}
                                        name="slug"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700">Slug (URL)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="post-url-slug"
                                                        {...field}
                                                        className="border-slate-200 focus-visible:ring-blue-500 font-mono text-sm"
                                                    />
                                                </FormControl>
                                                <p className="text-[10px] text-slate-500 mt-1">
                                                    {mode === "edit" ? "Warning: Changing the slug will change the post URL." : "Leave empty to auto-generate from title."}
                                                </p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700">Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Short summary..."
                                                        rows={2}
                                                        {...field}
                                                        className="border-slate-200 focus-visible:ring-blue-500 resize-none"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Categories */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-700">Categories</Label>
                                        <p className="text-[10px] text-slate-500">
                                            First category is the primary URL channel.
                                        </p>

                                        {watchedCategories.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-2">
                                                {watchedCategories.map((cat) => (
                                                    <Badge key={cat} variant="secondary" className="gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                        {cat}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCategoryItem(cat)}
                                                            className="rounded-full hover:bg-blue-200 p-0.5 transition-colors"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        <div className="relative" ref={categoryDropdownRef}>
                                            <div className="relative">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                                <Input
                                                    value={categoryInput}
                                                    onFocus={() => setShowCategoryDropdown(true)}
                                                    onChange={(e) => {
                                                        setCategoryInput(e.target.value);
                                                        setShowCategoryDropdown(true);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            addCategoryItem(categoryInput);
                                                            setShowCategoryDropdown(false);
                                                        }
                                                    }}
                                                    placeholder="Add category..."
                                                    className="pl-9 border-slate-200 focus-visible:ring-blue-500"
                                                />
                                            </div>

                                            {showCategoryDropdown && (
                                                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                                    {loadingCategories ? (
                                                        <div className="p-2 text-center text-xs text-slate-500">
                                                            Loading...
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {existingCategories
                                                                .filter(cat =>
                                                                    !watchedCategories.includes(cat) &&
                                                                    cat.toLowerCase().includes(categoryInput.toLowerCase())
                                                                )
                                                                .map(cat => (
                                                                    <button
                                                                        key={cat}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            addCategoryItem(cat);
                                                                            setShowCategoryDropdown(false);
                                                                        }}
                                                                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700"
                                                                    >
                                                                        {cat}
                                                                    </button>
                                                                ))}
                                                            {categoryInput && !existingCategories.some(c => c.toLowerCase() === categoryInput.toLowerCase()) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        addCategoryItem(categoryInput);
                                                                        setShowCategoryDropdown(false);
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium"
                                                                >
                                                                    + Create &quot;{categoryInput}&quot;
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="author"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700">Author</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="border-slate-200 focus-visible:ring-blue-500" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="publishedAt"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col mt-4">
                                            <FormLabel className="text-slate-700">Schedule Publish</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal border-slate-200",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date < new Date(new Date().setHours(0, 0, 0, 0))
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                            <p className="text-[10px] text-slate-500">
                                                If set to a future date, post will be scheduled.
                                            </p>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Featured Image Card */}
                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                <h3 className="font-semibold text-sm text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                                    <FileImage className="w-4 h-4 text-slate-400" />
                                    Featured Image
                                </h3>
                                <div className="space-y-2">
                                    {watchedBanner ? (
                                        <div className="relative group rounded-lg overflow-hidden border border-slate-200 h-28">
                                            <Image
                                                src={watchedBanner}
                                                alt="Banner"
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => form.setValue("banner", "")}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => setShowBannerPicker(true)}
                                            className="h-28 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 text-sm hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-colors bg-slate-50"
                                        >
                                            <ImageIcon className="h-6 w-6 mb-1" />
                                            Select Image
                                        </div>
                                    )}

                                    {watchedBanner && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="w-full h-auto py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            onClick={() => setShowBannerPicker(true)}
                                        >
                                            Replace Image
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* SEO Settings Card */}
                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                <h3 className="font-semibold text-sm text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                                    <Search className="w-4 h-4 text-slate-400" />
                                    SEO Settings
                                </h3>
                                <div className="space-y-3">
                                    <FormField
                                        control={form.control}
                                        name="metaTitle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 text-xs">Meta Title</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Leave empty to use post title"
                                                        {...field}
                                                        className="border-slate-200 focus-visible:ring-blue-500 h-8 text-sm"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="metaDescription"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 text-xs">Meta Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Leave empty to use post description"
                                                        rows={2}
                                                        {...field}
                                                        className="border-slate-200 focus-visible:ring-blue-500 resize-none text-sm"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="metaKeywords"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 text-xs">Meta Keywords</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="keyword1, keyword2"
                                                        {...field}
                                                        className="border-slate-200 focus-visible:ring-blue-500 h-8 text-sm"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-1.5">
                                        <Label className="text-slate-700 text-xs">OG Image</Label>
                                        {watchedOgImage ? (
                                            <div className="relative group rounded-lg overflow-hidden border border-slate-200 h-20">
                                                <Image
                                                    src={watchedOgImage}
                                                    alt="OG Image"
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => form.setValue("ogImage", "")}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => setShowOgImagePicker(true)}
                                                className="h-20 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 text-xs hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-colors bg-slate-50"
                                            >
                                                <ImageIcon className="h-5 w-5 mb-1" />
                                                Select OG Image
                                            </div>
                                        )}
                                        {watchedOgImage && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="w-full h-auto py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                onClick={() => setShowOgImagePicker(true)}
                                            >
                                                Replace
                                            </Button>
                                        )}
                                        <p className="text-[10px] text-slate-400">Leave empty to use banner</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <MediaPickerModal
                    isOpen={showBannerPicker}
                    onClose={() => setShowBannerPicker(false)}
                    onSelect={(path) => {
                        form.setValue("banner", path);
                        setShowBannerPicker(false);
                    }}
                    initialTab="banner"
                />
                <MediaPickerModal
                    isOpen={showOgImagePicker}
                    onClose={() => setShowOgImagePicker(false)}
                    onSelect={(path) => {
                        form.setValue("ogImage", path);
                        setShowOgImagePicker(false);
                    }}
                    initialTab="banner"
                />
                <ConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Post"
                    message={`Are you sure you want to delete "${watchedTitle}"? This action cannot be undone and the post will be permanently removed from the website.`}
                    loading={saving}
                    variant="destructive"
                    confirmText="Delete"
                />
            </form>
        </Form >
    );
}
