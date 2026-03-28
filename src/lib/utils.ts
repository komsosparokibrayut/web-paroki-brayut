import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateReadingTime(content: any): number {
  try {
    let text = "";
    
    if (typeof content === 'string') {
      text = content.replace(/<[^>]*>/g, '');
    } else if (content && typeof content === 'object') {
      if (content.type === 'doc' && Array.isArray(content.content)) {
        // Tiptap JSON
        const extract = (node: any): string => {
          if (!node) return '';
          if (node.type === 'text' && node.text) return node.text + ' ';
          if (Array.isArray(node.content)) return node.content.map(extract).join('');
          return '';
        };
        text = extract(content);
      } else if (Array.isArray(content.ops)) {
        // Quill Delta
        text = content.ops.map((op: any) => typeof op.insert === 'string' ? op.insert : '').join(' ');
      } else {
        text = JSON.stringify(content); // Fallback
      }
    }

    const cleanText = text.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();
    if (!cleanText) return 1;
    
    const words = cleanText.split(" ").length;
    return Math.max(1, Math.ceil(words / 200));
  } catch (e) {
    return 1;
  }
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}
