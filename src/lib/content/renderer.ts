import { generateHTML } from "@tiptap/html";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Youtube } from "@tiptap/extension-youtube";

// The same extension list used by the editor (must match for HTML generation)
const TIPTAP_EXTENSIONS = [
  StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
  Underline,
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Link.configure({ openOnClick: false }),
  Image,
  Youtube,
];

/**
 * Validates if content is Tiptap JSON format.
 */
function isTiptapJson(content: any): boolean {
  return (
    typeof content === "object" &&
    content !== null &&
    content.type === "doc" &&
    Array.isArray(content.content)
  );
}

export async function renderContent(content: any): Promise<string> {
  if (!content) return "";

  let html = "";

  // ── Path 1: Modern Tiptap JSON ──────────────────────────────────────────
  if (isTiptapJson(content)) {
    try {
      html = generateHTML(content, TIPTAP_EXTENSIONS);
    } catch (error) {
      console.error("Tiptap generateHTML failed:", error);
    }
  }
  // ── Path 2: Plain string / HTML Fallback ────────────────────────────────
  else if (typeof content === "string") {
    html = content;
  }

  if (!html) return "";

  // Sanitize the final HTML to prevent XSS
  const DOMPurify = require("isomorphic-dompurify");
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "src", "class", "style", "width", "height"],
    FORBID_TAGS: ["script", "object", "embed", "form"],
    FORBID_ATTR: ["onerror", "onclick", "onload", "onmouseover", "onfocus", "onblur"],
  });
}
