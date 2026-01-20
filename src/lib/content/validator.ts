import { z } from "zod";

export const PostFrontmatterSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().min(0).max(500, "Description too long"),
  publishedAt: z.string().datetime("Invalid date format"),
  updatedAt: z.string().datetime("Invalid date format").optional(),
  author: z.string().min(1, "Author is required").max(100, "Author name too long"),
  categories: z.array(z.string().max(50, "Category too long")).min(1, "At least one category is required").default(["Lainnya"]),
  banner: z.string().max(500, "Banner path too long").optional(),
  published: z.boolean().default(false),
});

export type ValidatedPostFrontmatter = z.infer<typeof PostFrontmatterSchema>;

export function validateFrontmatter(data: unknown): ValidatedPostFrontmatter {
  return PostFrontmatterSchema.parse(data);
}

export function generateSlug(title: string): string {
  // Sanitize and normalize the title
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .substring(0, 100); // Limit length
}
