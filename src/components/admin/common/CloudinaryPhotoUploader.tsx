import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, RefreshCw, CheckCircle2, AlertCircle, Link, Camera } from "lucide-react";
import { uploadImageToCloudinary } from "../../../services/cloudinaryService";

interface CloudinaryPhotoUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  shape?: "portrait" | "square" | "circle";
  compact?: boolean;
  folder?: string;
  placeholder?: string;
  allowUrlInput?: boolean;
}

export default function CloudinaryPhotoUploader({
  value = "",
  onChange,
  label = "Upload Photo",
  shape = "portrait",
  compact = false,
  folder = "cinevenue/movies",
  placeholder = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=70",
  allowUrlInput = true,
}: CloudinaryPhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [manualUrl, setManualUrl] = useState(value);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = value || "";

  const handleFile = async (file: File) => {
    setError(null);

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB limit.");
      return;
    }

    try {
      setIsUploading(true);
      setProgress(25);

      const result = await uploadImageToCloudinary(file, {
        folder,
        alt: label,
        onProgress: (pct) => setProgress(pct),
      });

      if (result?.url) {
        onChange(result.url);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || "Upload failed. Try again.");
    } finally {
      setIsUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Compact Avatar Mode (for Cast and Crew rows)
  if (compact) {
    const isCircle = shape === "circle";
    return (
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onInputChange}
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer overflow-hidden border border-white/20 bg-black/60 transition-all hover:border-[#eb4e62] ${
            isCircle ? "w-11 h-11 rounded-full" : "w-11 h-14 rounded-xl"
          }`}
          title="Click to upload new photo via Cloudinary"
        >
          {displayUrl ? (
            <img src={displayUrl} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-secondary group-hover:text-[#eb4e62]">
              <Camera className="w-4 h-4" />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            {isUploading ? (
              <RefreshCw className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5 text-white" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-bold text-white hover:text-[#eb4e62] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#eb4e62]" />
              <span>{isUploading ? `Uploading ${progress}%...` : "Upload Photo"}</span>
            </button>

            {allowUrlInput && (
              <>
                <span className="text-white/20 text-xs">|</span>
                <button
                  type="button"
                  onClick={() => setShowUrlModal(!showUrlModal)}
                  className="text-[10px] text-text-secondary hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Link className="w-3 h-3" />
                  <span>URL</span>
                </button>
              </>
            )}

            {displayUrl && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-[10px] text-red-400 hover:text-red-300 ml-auto transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {showUrlModal && (
            <div className="mt-2 flex gap-1.5">
              <input
                type="text"
                placeholder="Paste direct image URL..."
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-[#eb4e62]"
              />
              <button
                type="button"
                onClick={() => {
                  onChange(manualUrl.trim());
                  setShowUrlModal(false);
                }}
                className="px-2.5 py-1 bg-[#eb4e62] text-white text-[10px] font-bold rounded-lg cursor-pointer"
              >
                Set
              </button>
            </div>
          )}

          {error && <p className="text-[10px] text-red-400 mt-0.5">{error}</p>}
        </div>
      </div>
    );
  }

  // Full Poster / Card Upload Mode
  const aspectClass =
    shape === "portrait" ? "aspect-[2/3] max-w-[200px]" : shape === "circle" ? "w-28 h-28 rounded-full" : "aspect-video w-full";

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <UploadCloud className="w-3.5 h-3.5 text-[#eb4e62]" />
            <span>{label}</span>
          </label>
          <span className="text-[9px] font-mono text-text-secondary">Cloudinary & Local Supported</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onInputChange}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Preview Container / Drag & Drop Target */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer overflow-hidden border-2 rounded-2xl transition-all flex flex-col items-center justify-center text-center p-3 ${
            isDragOver
              ? "border-[#eb4e62] bg-[#eb4e62]/10 scale-[1.01]"
              : "border-white/15 bg-white/[0.02] hover:border-[#eb4e62]/60 hover:bg-white/[0.04]"
          } ${aspectClass}`}
        >
          {displayUrl ? (
            <>
              <img src={displayUrl} alt={label} className="w-full h-full object-cover rounded-xl" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 text-white transition-opacity rounded-xl">
                <Camera className="w-5 h-5 text-[#eb4e62]" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Change Photo</span>
              </div>
            </>
          ) : (
            <div className="space-y-2 p-4 text-center">
              <div className="w-10 h-10 rounded-2xl bg-[#eb4e62]/10 border border-[#eb4e62]/20 flex items-center justify-center text-[#eb4e62] mx-auto">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-bold text-white">Click or Drag & Drop</p>
              <p className="text-[9px] text-text-secondary">JPG, PNG, WEBP (Max 10MB)</p>
            </div>
          )}

          {/* Uploading Spinner Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 rounded-xl z-10">
              <RefreshCw className="w-6 h-6 text-[#eb4e62] animate-spin" />
              <span className="text-[10px] font-bold text-white font-mono">{progress}% Uploading...</span>
            </div>
          )}
        </div>

        {/* Action Controls & URL Input */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-[#eb4e62] hover:bg-[#d63e51] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Select File from Device</span>
            </button>

            {displayUrl && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="px-3 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>

          {allowUrlInput && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase">Or Paste Direct Image Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#eb4e62] font-mono"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {displayUrl && (
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Photo ready and attached to movie record</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
