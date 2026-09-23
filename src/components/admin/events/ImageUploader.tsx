import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import apiClient from '../../../services/apiClient';

export interface UploadedMedia {
  url: string;
  publicId: string;
  alt: string;
}

interface ImageUploaderProps {
  label: string;
  description?: string;
  uploadType: 'poster' | 'banner';
  value?: UploadedMedia | string;
  onChange: (media: UploadedMedia) => void;
  aspectRatio?: 'portrait' | 'landscape';
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export default function ImageUploader({
  label,
  description,
  uploadType,
  value,
  onChange,
  aspectRatio = 'portrait',
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive preview URL
  const currentUrl = typeof value === 'object' && value ? value.url : typeof value === 'string' ? value : '';
  const currentAlt = typeof value === 'object' && value ? value.alt : `${label} image`;

  const handleFile = async (file: File) => {
    setErrorMessage(null);

    // Validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage('Invalid file format. Please select a JPG, PNG, or WEBP image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 5MB.`);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(15);

      const formData = new FormData();
      const fieldName = uploadType === 'poster' ? 'poster' : 'banner';
      formData.append(fieldName, file);
      formData.append('alt', `${label}: ${file.name}`);

      const endpoint = uploadType === 'poster' ? '/admin/uploads/event-poster' : '/admin/uploads/event-banner';

      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 90) / progressEvent.total);
            setUploadProgress(Math.max(15, percentCompleted));
          }
        },
      });

      setUploadProgress(100);

      const uploaded: UploadedMedia = {
        url: response.data?.file?.url || response.data?.url || '',
        publicId: response.data?.file?.publicId || response.data?.publicId || '',
        alt: response.data?.file?.alt || response.data?.alt || file.name,
      };

      onChange(uploaded);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ url: '', publicId: '', alt: '' });
    setErrorMessage(null);
  };

  return (
    <div className="space-y-1.5 text-left">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-semibold text-text-secondary uppercase">
          {label} <span className="text-gold">*</span>
        </label>
        {currentUrl && (
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" /> Ready
          </span>
        )}
      </div>

      {description && <p className="text-[11px] text-white/40">{description}</p>}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Upload / Preview Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative group rounded-xl border border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center ${
          aspectRatio === 'landscape' ? 'aspect-[16/9] min-h-[140px]' : 'aspect-[3/4] min-h-[180px]'
        } ${
          isDragOver
            ? 'border-gold bg-gold/10'
            : currentUrl
            ? 'border-white/20 bg-black/60 hover:border-gold/50'
            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/30'
        }`}
      >
        {currentUrl ? (
          <>
            <img
              src={currentUrl}
              alt={currentAlt}
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                // Handle broken link fallback
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1540039155732-6762b51333fc?auto=format&fit=crop&q=80&w=800';
              }}
            />
            {/* Hover overlay with actions */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-gold" /> Click or drag to replace
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" /> Remove image
              </button>
            </div>
          </>
        ) : (
          <div className="p-4 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gold group-hover:scale-110 transition-transform">
              {isUploading ? (
                <RefreshCw className="w-5 h-5 animate-spin text-gold" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-white">
                {isUploading ? 'Uploading file to storage...' : 'Click to upload or drag & drop'}
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">JPG, PNG, or WEBP (Max 5MB)</p>
            </div>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4">
            <RefreshCw className="w-6 h-6 animate-spin text-gold mb-2" />
            <p className="text-xs font-medium text-white">Uploading {uploadType}...</p>
            <div className="w-32 h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-white/50 mt-1">{uploadProgress}%</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
