import React, { useEffect } from 'react';
import { X, Film, Play } from 'lucide-react';
import { MovieVideo } from '../../types';
import { buildSafeYouTubeEmbedUrl } from '../../utils/youtube';

interface YouTubePlayerModalProps {
  isOpen: boolean;
  video: MovieVideo | null;
  onClose: () => void;
  movieTitle?: string;
}

export default function YouTubePlayerModal({
  isOpen,
  video,
  onClose,
  movieTitle,
}: YouTubePlayerModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !video || !video.youtubeVideoId) {
    return null;
  }

  const embedUrl = buildSafeYouTubeEmbedUrl(video.youtubeVideoId, {
    autoplay: true,
    rel: 0,
    modestbranding: 1,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Player Container */}
      <div className="relative z-10 w-full max-w-4xl bg-[#121213] border border-gold/30 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-black/60 border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden pr-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                video.type === 'TRAILER'
                  ? 'bg-gold/20 text-gold border border-gold/30'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              {video.type}
            </span>
            <div className="truncate">
              <h3 className="text-sm md:text-base font-bold text-white truncate">
                {video.title || `${movieTitle || 'Movie'} Official ${video.type}`}
              </h3>
              {movieTitle && (
                <span className="text-[11px] text-text-muted">
                  {movieTitle} {video.language ? `• ${video.language}` : ''}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer border-0 bg-transparent shrink-0"
            aria-label="Close Video Player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 16:9 Aspect Ratio Video Frame */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          <iframe
            src={embedUrl}
            title={video.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Footer Info */}
        <div className="px-5 py-3 bg-[#0c0c0d] border-t border-white/5 flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <Film className="w-3.5 h-3.5 text-gold" />
            <span>Streaming via YouTube Embedded Player</span>
          </div>
          <span className="font-mono text-[10px] text-white/50">
            ID: {video.youtubeVideoId}
          </span>
        </div>
      </div>
    </div>
  );
}
