import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

/**
 * Validates and sanitizes a video embed URL.
 * Only allows YouTube and Vimeo embeds over HTTPS.
 * Returns null for invalid/disallowed URLs.
 */
function sanitizeVideoUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:") return null;
    const hostname = parsed.hostname.toLowerCase();
    const allowed = [
      "youtube.com",
      "www.youtube.com",
      "youtu.be",
      "www.youtu.be",
      "vimeo.com",
      "www.vimeo.com",
      "player.vimeo.com",
    ];
    if (!allowed.some((d) => hostname === d || hostname.endsWith(`.${d}`)))
      return null;

    // Convert watch URLs to embed URLs
    let embedUrl = parsed.href;
    if (hostname.includes("youtube.com") && parsed.searchParams.has("v")) {
      const videoId = parsed.searchParams.get("v");
      if (videoId && /^[a-zA-Z0-9_-]+$/.test(videoId)) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else {
        return null;
      }
    } else if (hostname === "youtu.be" || hostname === "www.youtu.be") {
      const videoId = parsed.pathname.slice(1);
      if (videoId && /^[a-zA-Z0-9_-]+$/.test(videoId)) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else {
        return null;
      }
    }

    return embedUrl;
  } catch {
    return null;
  }
}

/**
 * HTML-escape a string to prevent attribute injection.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function renderContent(content: any): Promise<string> {
  if (!content) return "";

  let deltaOps = null;

  // Case 1: content is already an object
  if (typeof content === 'object' && content !== null) {
    if (Array.isArray(content.ops)) {
      deltaOps = content.ops;
    } else if (Array.isArray(content)) {
      deltaOps = content;
    }
  }

  // Case 2: content is a string (could be stringified JSON or plain text)
  if (!deltaOps && typeof content === 'string') {
    const trimmed = content.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(content);
        if (parsed.ops && Array.isArray(parsed.ops)) {
          deltaOps = parsed.ops;
        } else if (Array.isArray(parsed)) {
          deltaOps = parsed;
        }
      } catch (e) {
        // Not valid JSON, treat as plain string
      }
    }
  }

  // If we found Delta operations, convert them to HTML
  if (deltaOps && Array.isArray(deltaOps)) {
    try {
      const options = {
        inlineStyles: true,
        multiLineBlockquote: true,
        multiLineParagraph: true,
        multiLineHeader: true,
      };
      
      const converter = new QuillDeltaToHtmlConverter(deltaOps, options);
      
      // Custom renderer for videos with URL validation
      converter.renderCustomWith((op) => {
        if (op.insert.type === 'video') {
          const rawUrl = String(op.insert.value).trim();
          const safeUrl = sanitizeVideoUrl(rawUrl);

          if (!safeUrl) {
            // Block invalid/disallowed video URLs
            return `<p><em>[Video blocked: invalid or disallowed URL]</em></p>`;
          }

          return `
            <div class="ql-video-wrapper my-8">
              <iframe 
                class="ql-video" 
                src="${escapeHtml(safeUrl)}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen
              ></iframe>
            </div>`;
        }
        return '';
      });

      let html = converter.convert().replace(/\n/g, '');

      // Sanitize the final HTML to prevent stored XSS
      const DOMPurify = require("isomorphic-dompurify");
      
      return DOMPurify.sanitize(html, {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "class"],
        FORBID_TAGS: ["script", "object", "embed", "form"],
        FORBID_ATTR: [
          "onerror",
          "onclick",
          "onload",
          "onmouseover",
          "onfocus",
          "onblur",
        ],
      });
    } catch (error) {
      console.error("Delta to HTML conversion failed:", error);
    }
  }

  // Final fallback: return sanitized string if it is one, otherwise empty
  if (typeof content === "string") {
    const DOMPurify = require("isomorphic-dompurify");
    return DOMPurify.sanitize(content);
  }
  return "";
}

