"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Youtube } from "@tiptap/extension-youtube";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Extension } from "@tiptap/core";
import { useEffect, useState, useCallback } from "react";
import MediaPickerModal from "./MediaPickerModal";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Quote, Link as LinkIcon, Image as ImageIcon,
  Youtube as YoutubeIcon, Highlighter, Palette,
  Undo, Redo, Minus, X, Type
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Custom Extensions ───────────────────────────────────────────────────────
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize.replace('px', ''),
        renderHTML: attributes => {
          if (!attributes.fontSize) return {}
          return { style: `font-size: ${attributes.fontSize}px` }
        },
      },
    }
  },
  addCommands() {
    return {
      ...this.parent?.(),
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize }).run()
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
      },
    }
  },
});

interface RichTextEditorProps {
  value: any; // Tiptap JSON object
  onChange: (value: any) => void;
}

// ── Color Palette ─────────────────────────────────────────────────────────────
const COLORS = [
  "#000000", "#374151", "#6b7280", "#9ca3af",
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#6366f1", "#a855f7", "#ec4899",
  "#0ea5e9", "#14b8a6", "#f59e0b", "#ffffff",
];

const FONT_SIZES = ["12", "14", "16", "18", "20", "24", "30", "36"];

// ── Toolbar Button ─────────────────────────────────────────────────────────────
function ToolbarButton({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={cn(
        "w-8 h-8 flex items-center justify-center rounded transition-colors text-sm",
        active
          ? "bg-brand-blue text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────────
function Divider() {
  return <div className="w-px h-5 bg-slate-200 mx-1" />;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showBubbleColorPicker, setShowBubbleColorPicker] = useState(false);
  const [showBubbleHighlightPicker, setShowBubbleHighlightPicker] = useState(false);
  const [showBubbleFontSizePicker, setShowBubbleFontSizePicker] = useState(false);

  const [embedModalType, setEmbedModalType] = useState<"youtube" | "gdrive" | "link" | null>(null);
  const [embedInput, setEmbedInput] = useState("");
  const [embedError, setEmbedError] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable builtins that have separate packages for custom config
        link: false,
        underline: false,
      }),
      Underline,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg my-4 max-w-full mx-auto block shadow-md",
        },
      }),
      Youtube.configure({
        width: 640,
        height: 480,
        HTMLAttributes: { class: "rounded-xl overflow-hidden my-6 w-full aspect-video" },
      }),
      Placeholder.configure({
        placeholder: "Tulis konten artikel di sini...",
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      handleDrop: () => true, // Block all drag-drop (prevents image drops)
      handlePaste: (view, event) => {
        // Block image paste (data:image/...) entirely
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            event.preventDefault();
            return true;
          }
        }
        return false;
      },
      attributes: {
        class: "prose prose-slate max-w-none min-h-[450px] p-8 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  // Sync external value changes (e.g. on form reset / edit mode load)
  useEffect(() => {
    if (!editor) return;
    const currentJson = JSON.stringify(editor.getJSON());
    const incomingJson = JSON.stringify(value || "");
    if (incomingJson !== currentJson) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  // ── Embed Handlers ────────────────────────────────────────────────────────
  const handleYouTubeEmbed = useCallback(() => {
    if (!editor || !embedInput.trim()) return;
    const url = embedInput.trim();
    // Basic YouTube URL check
    if (!/youtube\.com|youtu\.be/.test(url)) {
      setEmbedError("Please enter a valid YouTube URL.");
      return;
    }
    editor.commands.setYoutubeVideo({ src: url });
    setEmbedInput("");
    setEmbedError("");
    setEmbedModalType(null);
  }, [editor, embedInput]);

  const handleGDriveEmbed = useCallback(() => {
    if (!editor || !embedInput.trim()) return;
    const url = embedInput.trim();
    if (!url.includes("drive.google.com") && !url.includes("docs.google.com")) {
      setEmbedError("Please enter a valid Google Drive or Google Docs URL.");
      return;
    }
    // Convert sharing URL to embed URL
    let embedUrl = url
      .replace("/view", "/preview")
      .replace("/edit", "/preview")
      .replace("?usp=sharing", "");
    // For regular drive files: https://drive.google.com/file/d/ID/view -> /preview
    editor
      .chain()
      .focus()
      .insertContent(
        `<iframe src="${embedUrl}" width="100%" height="480" frameborder="0" allow="autoplay" class="w-full rounded-xl my-6 border border-slate-200"></iframe>`
      )
      .run();
    setEmbedInput("");
    setEmbedError("");
    setEmbedModalType(null);
  }, [editor, embedInput]);

  const handleLinkEmbed = useCallback(() => {
    if (!editor || !embedInput.trim()) return;
    const url = embedInput.trim();
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setEmbedInput("");
    setEmbedError("");
    setEmbedModalType(null);
  }, [editor, embedInput]);

  const handleModalConfirm = () => {
    if (embedModalType === "youtube") handleYouTubeEmbed();
    else if (embedModalType === "gdrive") handleGDriveEmbed();
    else if (embedModalType === "link") handleLinkEmbed();
  };

  const handleImageSelect = useCallback((path: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: path, alt: "" }).run();
    setIsMediaModalOpen(false);
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-xl shadow-sm bg-white relative">
      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-slate-200 bg-slate-50 sticky top-[57px] z-20 rounded-t-xl">
        {/* History */}
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        {([1, 2, 3] as const).map((level) => (
          <ToolbarButton
            key={level}
            title={`Heading ${level}`}
            active={editor.isActive("heading", { level })}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          >
            <span className="text-xs font-bold">H{level}</span>
          </ToolbarButton>
        ))}

        <Divider />

        {/* Text Styles */}
        <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Font Size */}
        <div className="relative">
          <ToolbarButton 
            title="Font Size" 
            active={showBubbleFontSizePicker} 
            onClick={() => { setShowBubbleFontSizePicker(p => !p); setShowColorPicker(false); setShowHighlightPicker(false); }}
          >
            <Type className="w-4 h-4" />
          </ToolbarButton>
          {showBubbleFontSizePicker && (
            <div className="absolute top-full left-0 mt-1 p-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 flex flex-col min-w-[60px] max-h-40 overflow-y-auto">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={cn(
                    "px-2 py-1 text-xs text-left hover:bg-slate-100 rounded transition-colors",
                    editor.getAttributes("textStyle").fontSize === size && "bg-blue-50 text-blue-600 font-medium"
                  )}
                  onMouseDown={(e) => { 
                    e.preventDefault(); 
                    (editor.chain().focus() as any).setFontSize(size).run(); 
                    setShowBubbleFontSizePicker(false); 
                  }}
                >
                  {size}px
                </button>
              ))}
              <button
                type="button"
                className="px-2 py-1 text-[10px] text-slate-400 text-left hover:bg-slate-100"
                onMouseDown={(e) => { e.preventDefault(); (editor.chain().focus() as any).unsetFontSize().run(); setShowBubbleFontSizePicker(false); }}
              >
                Reset
              </button>
            </div>
          )}
        </div>

        <Divider />

        {/* Color */}
        <div className="relative">
          <ToolbarButton title="Text Color" active={showColorPicker} onClick={() => { setShowColorPicker(p => !p); setShowHighlightPicker(false); }}>
            <Palette className="w-4 h-4" />
          </ToolbarButton>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 grid grid-cols-4 gap-1 w-[100px]">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  title={color}
                  className="w-5 h-5 rounded-full border border-slate-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(color).run(); setShowColorPicker(false); }}
                />
              ))}
              <button
                type="button"
                title="Remove color"
                className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
              >
                <X className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          )}
        </div>

        {/* Highlight */}
        <div className="relative">
          <ToolbarButton title="Highlight" active={editor.isActive("highlight") || showHighlightPicker} onClick={() => { setShowHighlightPicker(p => !p); setShowColorPicker(false); }}>
            <Highlighter className="w-4 h-4" />
          </ToolbarButton>
          {showHighlightPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 grid grid-cols-4 gap-1 w-[100px]">
              {["#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff", "#fed7aa", "#fff"].map((color) => (
                <button
                  key={color}
                  type="button"
                  title={color}
                  className="w-5 h-5 rounded-full border border-slate-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (color === "#fff") editor.chain().focus().unsetHighlight().run();
                    else editor.chain().focus().setHighlight({ color }).run();
                    setShowHighlightPicker(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* Lists */}
        <ToolbarButton title="Bullet List" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Ordered List" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton title="Align Left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Align Center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Align Right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Blockquote & Rule */}
        <ToolbarButton title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Media */}
        <ToolbarButton title="Link" active={editor.isActive("link")} onClick={() => {
          if (editor.isActive("link")) { editor.chain().focus().unsetLink().run(); }
          else { setEmbedModalType("link"); setEmbedInput(editor.getAttributes("link").href || ""); setEmbedError(""); }
        }}>
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Insert Image (from media library)" onClick={() => setIsMediaModalOpen(true)}>
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Embed YouTube Video" onClick={() => { setEmbedModalType("youtube"); setEmbedInput(""); setEmbedError(""); }}>
          <YoutubeIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Embed Google Drive / Docs" onClick={() => { setEmbedModalType("gdrive"); setEmbedInput(""); setEmbedError(""); }}>
          <span className="text-[10px] font-bold text-slate-600">GDrive</span>
        </ToolbarButton>
      </div>

      {/* ── Bubble Menu ──────────────────────────────────────────────────────── */}
      <BubbleMenu 
        editor={editor} 
        className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg shadow-xl"
      >
        <ToolbarButton 
          title="Bold" 
          active={editor.isActive("bold")} 
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton 
          title="Italic" 
          active={editor.isActive("italic")} 
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton 
          title="Insert Link" 
          active={editor.isActive("link")} 
          onClick={() => { setEmbedModalType("link"); setEmbedInput(editor.getAttributes("link").href || ""); setEmbedError(""); }}
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        {([1, 2, 3] as const).map((level) => (
          <ToolbarButton
            key={level}
            title={`Heading ${level}`}
            active={editor.isActive("heading", { level })}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          >
            <span className="text-[10px] font-bold">H{level}</span>
          </ToolbarButton>
        ))}

        <Divider />

        {/* List */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton 
            title="Bullet List" 
            active={editor.isActive("bulletList")} 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton 
            title="Ordered List" 
            active={editor.isActive("orderedList")} 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </ToolbarButton>
        </div>

        <Divider />

        {/* Bubble Color Picker */}
        <div className="relative">
          <ToolbarButton 
            title="Text Color" 
            active={showBubbleColorPicker} 
            onClick={() => { 
              setShowBubbleColorPicker(p => !p); 
              setShowBubbleHighlightPicker(false);
              setShowBubbleFontSizePicker(false); 
            }}
          >
            <Palette className="w-3.5 h-3.5" />
          </ToolbarButton>
          {showBubbleColorPicker && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 grid grid-cols-4 gap-1 w-[100px]">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  title={color}
                  className="w-5 h-5 rounded-full border border-slate-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onMouseDown={(e) => { 
                    e.preventDefault(); 
                    editor.chain().focus().setColor(color).run(); 
                    setShowBubbleColorPicker(false); 
                  }}
                />
              ))}
              <button
                type="button"
                className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setShowBubbleColorPicker(false); }}
              >
                <X className="w-2 h-2 text-slate-400" />
              </button>
            </div>
          )}
        </div>

        {/* Bubble Highlight Picker */}
        <div className="relative">
          <ToolbarButton 
            title="Highlight Color" 
            active={showBubbleHighlightPicker} 
            onClick={() => { 
              setShowBubbleHighlightPicker(p => !p); 
              setShowBubbleColorPicker(false);
              setShowBubbleFontSizePicker(false); 
            }}
          >
            <Highlighter className="w-3.5 h-3.5" />
          </ToolbarButton>
          {showBubbleHighlightPicker && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 grid grid-cols-4 gap-1 w-[100px]">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  title={color}
                  className="w-5 h-5 rounded-full border border-slate-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onMouseDown={(e) => { 
                    e.preventDefault(); 
                    editor.chain().focus().setHighlight({ color }).run(); 
                    setShowBubbleHighlightPicker(false); 
                  }}
                />
              ))}
              <button
                type="button"
                className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetHighlight().run(); setShowBubbleHighlightPicker(false); }}
              >
                <X className="w-2 h-2 text-slate-400" />
              </button>
            </div>
          )}
        </div>

        <Divider />

        {/* Bubble Font Size Picker */}
        <div className="relative">
          <ToolbarButton 
            title="Font Size" 
            active={showBubbleFontSizePicker} 
            onClick={() => { 
              setShowBubbleFontSizePicker(p => !p); 
              setShowBubbleColorPicker(false); 
              setShowBubbleHighlightPicker(false);
            }}
          >
            <Type className="w-3.5 h-3.5" />
          </ToolbarButton>
          {showBubbleFontSizePicker && (
            <div className="absolute bottom-full left-0 mb-2 p-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 flex flex-col min-w-[60px] max-h-40 overflow-y-auto">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={cn(
                    "px-2 py-1 text-xs text-left hover:bg-slate-100 rounded transition-colors",
                    editor.getAttributes("textStyle").fontSize === size && "bg-blue-50 text-blue-600 font-medium"
                  )}
                  onMouseDown={(e) => { 
                    e.preventDefault(); 
                    (editor.chain().focus() as any).setFontSize(size).run(); 
                    setShowBubbleFontSizePicker(false); 
                  }}
                >
                  {size}px
                </button>
              ))}
              <button
                type="button"
                className="px-2 py-1 text-[10px] text-slate-400 text-left hover:bg-slate-100"
                onMouseDown={(e) => { e.preventDefault(); (editor.chain().focus() as any).unsetFontSize().run(); setShowBubbleFontSizePicker(false); }}
              >
                Reset
              </button>
            </div>
          )}
        </div>

        <Divider />

        {/* Media Buttons */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton 
            title="Add Image" 
            onClick={() => setIsMediaModalOpen(true)}
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton 
            title="Embed YouTube" 
            onClick={() => { setEmbedModalType("youtube"); setEmbedInput(""); setEmbedError(""); }}
          >
            <YoutubeIcon className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton 
            title="Embed GDrive" 
            onClick={() => { setEmbedModalType("gdrive"); setEmbedInput(""); setEmbedError(""); }}
          >
            <span className="text-[10px] font-bold text-slate-800">GD</span>
          </ToolbarButton>
        </div>
      </BubbleMenu>

      {/* ── Editor Area ───────────────────────────────────────────────────── */}
      <EditorContent editor={editor} className="tiptap-editor" />

      {/* ── Embed Modal ───────────────────────────────────────────────────── */}
      {embedModalType && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-slate-900 mb-1">
              {embedModalType === "youtube" && "Embed YouTube Video"}
              {embedModalType === "gdrive" && "Embed Google Drive File"}
              {embedModalType === "link" && "Insert Link"}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {embedModalType === "youtube" && "Paste a YouTube video URL (e.g. https://www.youtube.com/watch?v=...)"}
              {embedModalType === "gdrive" && "Paste a Google Drive or Docs share URL"}
              {embedModalType === "link" && "Paste the URL for the selected text"}
            </p>
            <input
              type="url"
              value={embedInput}
              onChange={(e) => { setEmbedInput(e.target.value); setEmbedError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleModalConfirm(); }}
              placeholder={embedModalType === "youtube" ? "https://www.youtube.com/watch?v=..." : embedModalType === "gdrive" ? "https://drive.google.com/file/d/..." : "https://"}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              autoFocus
            />
            {embedError && <p className="text-xs text-red-500 mt-1">{embedError}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setEmbedModalType(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalConfirm}
                className="px-4 py-2 text-sm bg-brand-blue text-white hover:bg-brand-blue/90 rounded-lg transition-colors"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Media Picker Modal ────────────────────────────────────────────── */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleImageSelect}
      />

      <style>{`
        .tiptap-editor .ProseMirror {
          min-height: 450px;
          padding: 2rem;
          outline: none;
          font-family: var(--font-rubik), sans-serif;
          font-size: 1rem;
          line-height: 1.7;
          color: #1e293b;
        }
        .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          color: #94a3b8;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .tiptap-editor .ProseMirror h1 { font-size: 2rem; font-weight: 700; margin: 1.5rem 0 0.75rem; }
        .tiptap-editor .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin: 1.25rem 0 0.75rem; }
        .tiptap-editor .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem; }
        .tiptap-editor .ProseMirror blockquote {
          border-left: 4px solid #3b82f6;
          margin: 1.5rem 0;
          padding: 0.75rem 1.25rem;
          background: #eff6ff;
          border-radius: 0 0.5rem 0.5rem 0;
          color: #1e40af;
          font-style: italic;
        }
        .tiptap-editor .ProseMirror ul { list-style: disc; padding-left: 1.5rem; margin: 0.75rem 0; }
        .tiptap-editor .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; margin: 0.75rem 0; }
        .tiptap-editor .ProseMirror li { margin: 0.25rem 0; }
        .tiptap-editor .ProseMirror hr { border: none; border-top: 2px solid #e2e8f0; margin: 1.5rem 0; }
        .tiptap-editor .ProseMirror a { color: #2563eb; text-decoration: underline; cursor: pointer; }
        .tiptap-editor .ProseMirror img {
          display: block;
          margin: 1.5rem auto;
          border-radius: 0.75rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          max-width: 100%;
          height: auto;
        }
        .tiptap-editor .ProseMirror iframe {
          width: 100%;
          border-radius: 0.75rem;
          margin: 1.5rem 0;
          display: block;
        }
        .tiptap-editor .ProseMirror p { margin-bottom: 0.75rem; }
      `}</style>
    </div>
  );
}
