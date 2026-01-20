import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

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
      
      // Custom renderer for videos
      converter.renderCustomWith((op) => {
        if (op.insert.type === 'video') {
          const url = String(op.insert.value).trim();
          let embedUrl = url;
          if (url.includes('youtube.com/watch?v=')) {
            embedUrl = url.replace('watch?v=', 'embed/');
          } else if (url.includes('youtu.be/')) {
            embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
          }

          return `
            <div class="ql-video-wrapper my-8">
              <iframe 
                class="ql-video" 
                src="${embedUrl}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen
              ></iframe>
            </div>`;
        }
        return '';
      });

      const html = converter.convert();
      
      // Post-process to ensure all videos are wrapped in ql-video-wrapper
      // This catches standard embeds that renderCustomWith might miss
      return html.replace(
        /<iframe[^>]*class="ql-video"[^>]*src="([^"]+)"[^>]*><\/iframe>/g,
        (match, src) => {
          // Ensure it's an embed URL
          let embedUrl = src;
          if (src.includes('youtube.com/watch?v=')) {
            embedUrl = src.replace('watch?v=', 'embed/');
          } else if (src.includes('youtu.be/')) {
            embedUrl = src.replace('youtu.be/', 'youtube.com/embed/');
          }
          
          return `
            <div class="ql-video-wrapper my-8">
              <iframe 
                class="ql-video" 
                src="${embedUrl}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen
              ></iframe>
            </div>`;
        }
      );
    } catch (error) {
      console.error("Delta to HTML conversion failed:", error);
    }
  }

  // Final fallback: return as string if it is one, otherwise empty
  return typeof content === 'string' ? content : "";
}
