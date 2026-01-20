"use client";

import { useState, useImperativeHandle, forwardRef, useEffect } from "react";
import Image from "next/image";
import { uploadImages } from "@/actions/media";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface ImageUploaderProps {
  type: "banner" | "inline";
  onUploadComplete?: (paths: string[]) => void;
  onFilesChange?: (count: number) => void;
}

const ImageUploader = forwardRef(({ type, onUploadComplete, onFilesChange }: ImageUploaderProps, ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Sync with parent when files change to avoid "setState in render" errors
  useEffect(() => {
    onFilesChange?.(selectedImages.length);
  }, [selectedImages, onFilesChange]);

  useImperativeHandle(ref, () => ({
    async upload() {
      if (selectedImages.length === 0) return;

      setUploading(true);
      setError(null);

      const formData = new FormData();
      selectedImages.forEach((img) => {
        formData.append("files", img.file);
      });

      const result = await uploadImages(formData, type);

      setUploading(false);

      if (result.success && result.paths) {
        onUploadComplete?.(result.paths);
        setSelectedImages([]);
      } else {
        setError(result.error || "Upload failed");
      }
    },
    hasFiles: selectedImages.length > 0
  }));

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const validImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const filesArray = Array.from(files);

    filesArray.forEach((file) => {
      if (!validImageTypes.includes(file.type)) {
        setError("Please upload valid image files (JPEG, PNG, WebP, GIF)");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("Each file must be less than 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            file,
            preview: reader.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    setError(null);
  };

  const removeImage = (id: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging
          ? "border-brand-blue bg-brand-warm/50"
          : "border-gray-300 hover:border-brand-blue/50"
          }`}
      >
        <div className="flex flex-col items-center">
          <svg className={`w-12 h-12 mb-4 transition-colors ${isDragging ? 'text-brand-blue' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 font-medium mb-1">
            {isDragging ? "Drop images here" : "Drag and drop images, or click to select"}
          </p>
          <p className="text-xs text-gray-400 mb-4">Support multiple files • Max 10MB each</p>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id={`file-input-${type}`}
            disabled={uploading}
          />
          <label
            htmlFor={`file-input-${type}`}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors font-bold text-sm shadow-sm"
          >
            Choose Files
          </label>
        </div>
      </div>

      {selectedImages.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-6">
          {selectedImages.map((img) => (
            <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={img.preview}
                alt="Preview"
                fill
                unoptimized
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 bg-white/90 text-red-600 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={uploading}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center gap-3 py-4 text-brand-blue animate-pulse">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-bold text-sm">Processing {selectedImages.length} images...</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
});

ImageUploader.displayName = "ImageUploader";

export default ImageUploader;
