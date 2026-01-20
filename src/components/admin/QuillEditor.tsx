"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Quote, Link as LinkIcon } from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import MediaPickerModal from "./MediaPickerModal";

// Dynamic import for React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false }) as any;

interface QuillEditorProps {
  value: any; // Delta or string
  onChange: (value: any) => void;
}

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const quillRef = useRef<any>(null);

  // Use a ref for the latest onChange to avoid closure issues in the stable modules object
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Image handler that opens the modal
  const imageHandler = useCallback(() => {
    setIsMediaModalOpen(true);
  }, []);

  // Register Font and other formats
  useEffect(() => {
    const registerFormats = async () => {
      if (typeof window === "undefined") return;
      try {
        const { default: RQ } = await import("react-quill-new");
        const Quill = (RQ as any).Quill;
        if (Quill) {
          const Font = Quill.import('formats/font') as any;
          Font.whitelist = ['rubik', 'sans-serif'];
          Quill.register(Font, true);
        }
      } catch (error) {
        console.error("Failed to register Quill formats", error);
      }
    };
    registerFormats();
  }, []);

  // Memoize modules to avoid toolbar disappearing/re-rendering
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'font': ['rubik', 'sans-serif'] }, { 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }, { 'align': [] }],
        ['image', 'video', 'link'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [imageHandler]);

  const handleImageSelect = (path: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      // Focus the editor first to make sure we have a selection or it goes to the end
      quill.focus();
      const range = quill.getSelection();
      const position = range ? range.index : quill.getLength();

      // Insert the image
      quill.insertEmbed(position, "image", path, "user");

      // Move cursor to next position
      quill.setSelection(position + 1, 0, "user");

      // CRITICAL: Manually trigger the parent update because source is 'api' (implicitly) 
      // or even with 'user', we want to be absolutely sure the parent state is updated
      // before the modal closure triggers a re-render.
      const contents = quill.getContents();
      onChangeRef.current(JSON.parse(JSON.stringify(contents)));
    }
    setIsMediaModalOpen(false);
  };

  const handleEditorChange = (content: string, delta: any, source: any, editor: any) => {
    // Notify parent for user changes. 
    // Manual insertions via API in handleImageSelect will call onChange manually.
    if (source === 'user') {
      const contents = editor.getContents();
      const plainDelta = JSON.parse(JSON.stringify(contents));
      onChangeRef.current(plainDelta);
    }
  };

  const [tooltipState, setTooltipState] = useState({
    visible: false,
    top: 0,
    left: 0,
    isLink: false,
    linkValue: ''
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<any>(null); // Persist selection

  // Handle selection change from ReactQuill prop
  const handleSelectionChange = (range: any, source: any, editor: any) => {
    if (range) {
      selectionRef.current = range; // Save valid selection
    }

    if (range && range.length > 0) {
      // bounds are relative to the editor area (.ql-container or .ql-editor)
      const bounds = editor.getBounds(range.index, range.length);

      const quill = quillRef.current?.getEditor();
      if (quill && wrapperRef.current) {
        const container = quill.root.parentNode as HTMLElement; // .ql-container
        const containerRect = container.getBoundingClientRect();
        const wrapperRect = wrapperRef.current.getBoundingClientRect();

        const relativeTop = containerRect.top - wrapperRect.top;
        const relativeLeft = containerRect.left - wrapperRect.left;

        const formats = quill.getFormat(range);

        setTooltipState({
          visible: true,
          top: relativeTop + bounds.top + bounds.height + 10, // 10px below selection
          left: relativeLeft + bounds.left + (bounds.width / 2) - 100, // Center horizontally
          isLink: !!formats.link,
          linkValue: formats.link || ''
        });
      }
    } else {
      setTooltipState(prev => ({ ...prev, visible: false }));
    }
  };

  const formatSelection = (format: string, value: any = true) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    // CRITICAL: Use saved selection, not current selection (which might be null after button click)
    const range = selectionRef.current;
    if (!range || range.length === 0) return;

    // Get current format at the saved range
    const currentFormat = quill.getFormat(range.index, range.length);

    if (format === 'link') {
      if (currentFormat.link) {
        // Remove link
        quill.formatText(range.index, range.length, 'link', false, 'user');
      } else {
        const url = prompt("Enter link URL:", "https://");
        if (url) {
          quill.formatText(range.index, range.length, 'link', url, 'user');
        }
      }
    } else {
      // Block-level formats (header, blockquote, list) need formatLine
      const blockFormats = ['header', 'blockquote', 'list', 'align', 'indent'];
      const isBlockFormat = blockFormats.includes(format);

      // Smart Toggle Logic
      const isActive = currentFormat[format] === value || (value === true && !!currentFormat[format]);

      if (isBlockFormat) {
        // Use formatLine for block formats
        if (isActive) {
          quill.formatLine(range.index, range.length, format, false, 'user');
        } else {
          quill.formatLine(range.index, range.length, format, value, 'user');
        }
      } else {
        // Use formatText for inline formats
        if (isActive) {
          quill.formatText(range.index, range.length, format, false, 'user');
        } else {
          quill.formatText(range.index, range.length, format, value, 'user');
        }
      }
    }

    // Re-select the text to keep tooltip visible and allow further formatting
    quill.setSelection(range.index, range.length, 'silent');

    // Update tooltip state with new formats
    const newFormats = quill.getFormat(range.index, range.length);
    setTooltipState(prev => ({
      ...prev,
      isLink: !!newFormats.link,
      linkValue: newFormats.link || ''
    }));
  };

  // Helper for buttons to prevent focus loss
  const handleFormatClick = (e: React.MouseEvent, format: string, value?: any) => {
    e.preventDefault(); // Critical: Prevent losing focus from editor
    e.stopPropagation();
    formatSelection(format, value);
  };

  return (
    <div ref={wrapperRef} className="quill-editor-wrapper bg-white rounded-lg border border-gray-200 shadow-sm relative">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || { ops: [] }}
        onChange={handleEditorChange}
        onChangeSelection={handleSelectionChange}
        modules={modules}
      />

      {/* Floating Tooltip */}
      {tooltipState.visible && (
        <div
          className="absolute z-50 flex items-center bg-slate-900 text-white rounded-full shadow-xl px-3 py-2"
          style={{
            top: `${tooltipState.top}px`,
            left: `${Math.max(10, tooltipState.left)}px`
          }}
          onMouseDown={(e) => e.preventDefault()} // Prevent focus loss when clicking tooltip background
        >
          {/* Bold - Serif B */}
          <button
            type="button"
            onMouseDown={(e) => handleFormatClick(e, 'bold')}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded-full transition-colors font-serif text-lg font-bold"
            title="Bold"
          >
            B
          </button>

          {/* Italic - Serif I */}
          <button
            type="button"
            onMouseDown={(e) => handleFormatClick(e, 'italic')}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded-full transition-colors font-serif text-lg italic"
            title="Italic"
          >
            I
          </button>

          {/* Link */}
          <button
            type="button"
            onMouseDown={(e) => handleFormatClick(e, 'link')}
            className={`w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded-full transition-colors ${tooltipState.isLink ? 'text-blue-400' : ''}`}
            title="Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {/* H1 */}
          <button
            type="button"
            onMouseDown={(e) => handleFormatClick(e, 'header', 1)}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded-full transition-colors text-sm font-medium"
            title="Heading 1"
          >
            H<sub className="text-[10px]">1</sub>
          </button>

          {/* H2 */}
          <button
            type="button"
            onMouseDown={(e) => handleFormatClick(e, 'header', 2)}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded-full transition-colors text-sm font-medium"
            title="Heading 2"
          >
            H<sub className="text-[10px]">2</sub>
          </button>

          {/* Blockquote */}
          <button
            type="button"
            onMouseDown={(e) => handleFormatClick(e, 'blockquote')}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded-full transition-colors font-serif text-xl"
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>

          {/* Arrow pointing up */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45" />
        </div>
      )}

      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleImageSelect}
      />

      <style jsx global>{`
        .quill-editor-wrapper .ql-toolbar {
          border: none;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          font-family: var(--font-rubik), sans-serif;
          border-radius: 0.5rem 0.5rem 0 0;
          margin-top: -1px;
        }
        /* Extension to prevent content from leaking through rounded corners when sticky */
        .quill-editor-wrapper .ql-toolbar::after {
          content: "";
          position: absolute;
          top: -10px;
          left: 0;
          width: 100%;
          height: 9px;
          background: #ffffff;
          z-index: 1;
          display: block;
          border: 0px 2px solid #ffffff;
        }
        .quill-editor-wrapper .ql-container {
          border: none;
          font-family: var(--font-rubik), sans-serif;
          font-size: 1rem;
          min-height: fit-content;
          border-radius: 0 0 0.5rem 0.5rem;
        }
        .quill-editor-wrapper .ql-editor {
          min-height: 400px;
          padding: 2rem;
          line-height: 1.6;
        }
        .quill-editor-wrapper .ql-editor img {
            border-radius: 0.5rem;
            margin: 1rem 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .ql-font-rubik {
          font-family: var(--font-rubik), sans-serif;
        }
      `}</style>
    </div>
  );
}
