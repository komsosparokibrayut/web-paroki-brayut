import { renderContent } from "@/lib/content/renderer";

interface PostContentProps {
  content: any;
}

export default async function PostContent({ content }: PostContentProps) {
  const html = await renderContent(content);

  return (
    <div className="tiptap-content-wrapper prose lg:prose-xl mx-auto">
      <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: html }} />

      <style dangerouslySetInnerHTML={{
        __html: `
        .tiptap-content-wrapper .tiptap-content {
          padding: 0;
          color: inherit;
          font-family: var(--font-rubik), sans-serif;
        }

        /* Headings */
        .tiptap-content-wrapper .tiptap-content h1 { font-size: 2rem; font-weight: 700; margin: 1.5rem 0 0.75rem; line-height: 1.2; }
        .tiptap-content-wrapper .tiptap-content h2 { font-size: 1.5rem; font-weight: 700; margin: 1.25rem 0 0.75rem; line-height: 1.3;}
        .tiptap-content-wrapper .tiptap-content h3 { font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem; line-height: 1.4;}

        /* Blockquote */
        .tiptap-content-wrapper blockquote {
          border-left: 4px solid #3b82f6 !important;
          margin: 1.5rem 0;
          padding: 0.75rem 1.25rem;
          background: #eff6ff;
          border-radius: 0 0.5rem 0.5rem 0;
          color: #1e40af;
          font-style: italic;
        }

        /* General cleanup for viewer */
        .tiptap-content p {
            margin-bottom: 1rem;
            line-height: 1.7;
        }

        .tiptap-content ul { list-style: disc; padding-left: 1.5rem; margin: 0.75rem 0; }
        .tiptap-content ol { list-style: decimal; padding-left: 1.5rem; margin: 0.75rem 0; }
        .tiptap-content li { margin: 0.25rem 0; }
        .tiptap-content hr { border: none; border-top: 2px solid #e2e8f0; margin: 1.5rem 0; }
        .tiptap-content a { color: #2563eb; text-decoration: underline; }

        /* Image Styling - Always Center Aligned */
        .tiptap-content-wrapper .tiptap-content img {
          display: block;
          margin-left: auto;
          margin-right: auto;
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          max-width: 100%;
          height: auto;
        }

        /* Iframe wrapper */
        .tiptap-content iframe {
          width: 100%;
          border-radius: 0.75rem;
          margin: 1.5rem 0;
          display: block;
        }

        /* Fallback for legacy Quill */
        .tiptap-content-wrapper .ql-video-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          margin: 2rem 0;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .tiptap-content-wrapper .ql-video-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        
        .ql-align-center { text-align: center; }
        .ql-align-right { text-align: right; }
        .ql-align-justify { text-align: justify; }
      `}} />
    </div>
  );
}
