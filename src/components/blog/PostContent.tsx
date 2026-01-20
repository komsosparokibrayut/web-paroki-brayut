import { renderContent } from "@/lib/content/renderer";

interface PostContentProps {
  content: any;
}

export default async function PostContent({ content }: PostContentProps) {
  const html = await renderContent(content);

  return (
    <div className="quill-viewer-wrapper prose lg:prose-xl mx-auto">
      <div className="ql-editor" dangerouslySetInnerHTML={{ __html: html }} />

      <style dangerouslySetInnerHTML={{
        __html: `
        .quill-viewer-wrapper .ql-editor {
          padding: 0;
          color: inherit;
          font-family: var(--font-rubik), sans-serif;
        }
        
        /* Video Wrapper */
        .quill-viewer-wrapper .ql-video-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          margin: 2rem 0;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .quill-viewer-wrapper .ql-video-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        /* Blockquote - Match Editor */
        .quill-viewer-wrapper blockquote {
          border-left: 4px solid #ccc !important;
          margin-bottom: 5px;
          margin-top: 5px;
          padding-left: 16px;
          font-style: normal;
          color: #666;
        }

        /* Code Block - Match Editor (Dark Mode/Monokai) */
        .quill-viewer-wrapper pre,
        .quill-viewer-wrapper .ql-syntax {
          background-color: #23241f !important;
          color: #f8f8f2 !important;
          padding: 1rem !important;
          border-radius: 0.5rem !important;
          font-family: Monaco, MonacoRegular, Lucida Console, Lucida Sans Typewriter, monospace !important;
          font-size: 0.9rem !important;
          line-height: 1.6 !important;
          margin: 1.5rem 0 !important;
          white-space: pre-wrap !important;
          word-break: break-characters !important;
          overflow-wrap: break-word !important;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
          max-width: 100%;
        }

        /* Image Styling - Always Center Aligned */
        .quill-viewer-wrapper .ql-editor img {
          display: block;
          margin-left: auto;
          margin-right: auto;
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          max-width: 100%;
          height: auto;
        }

        .ql-font-rubik {
          font-family: var(--font-rubik), sans-serif !important;
        }
        .ql-align-center {
          text-align: center;
        }
        .ql-align-right {
          text-align: right;
        }
        .ql-align-justify {
          text-align: justify;
        }
        
        /* General cleanup for viewer */
        .ql-editor p {
            margin-bottom: 1rem;
        }
      `}} />
    </div>
  );
}
