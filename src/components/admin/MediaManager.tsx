"use client";

import { useState, useRef } from "react";
import MediaGrid from "./MediaGrid";
import ImageUploader from "./ImageUploader";
import { useRouter } from "next/navigation";
import { MediaImage } from "@/actions/media";
import { useLoading } from "./LoadingProvider";

interface MediaManagerProps {
  initialImages: MediaImage[];
}

export default function MediaManager({ initialImages }: MediaManagerProps) {
  const { startTransition } = useLoading();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [hasFiles, setHasFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const uploaderRef = useRef<{ upload: () => Promise<void> }>(null);

  const handleUploadComplete = (paths: string[]) => {
    // Refresh to show new images
    router.refresh();
    setIsUploadOpen(false);
    setIsUploading(false);
  };

  const handleStartUpload = async () => {
    if (uploaderRef.current) {
      const uploader = uploaderRef.current;
      startTransition(async () => {
        setIsUploading(true);
        await uploader.upload();
      });
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-darkBlue font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Image
        </button>
      </div>


      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
        <MediaGrid initialImages={initialImages} />
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsUploadOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full animate-slide-up">
              <div className="bg-white px-6 pt-6 pb-4 sm:pb-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                      <h3 className="text-xl font-extrabold text-gray-900 tracking-tight" id="modal-title">
                        Upload New Images
                      </h3>
                      <button onClick={() => setIsUploadOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm text-gray-500">
                        Pilih satu atau beberapa gambar untuk diunggah sekaligus.
                      </p>

                      <ImageUploader
                        ref={uploaderRef}
                        type="inline"
                        onUploadComplete={handleUploadComplete}
                        onFilesChange={(count) => setHasFiles(count > 0)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
                <button
                  type="button"
                  disabled={!hasFiles || isUploading}
                  className="w-full sm:w-auto inline-flex justify-center rounded-lg px-5 py-2.5 bg-brand-blue text-sm font-bold text-white hover:bg-brand-darkBlue shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none active:scale-95"
                  onClick={handleStartUpload}
                >
                  {isUploading ? "Uploading..." : "Upload Now"}
                </button>
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-5 py-2.5 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 focus:outline-none transition-all"
                  onClick={() => setIsUploadOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
