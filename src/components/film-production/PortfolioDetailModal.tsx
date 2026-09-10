import React, { useState } from "react";
import { PortfolioItem } from "../../types/filmProductionMarketplace";
import { 
  X, Play, Film, Calendar, User, Clock, 
  ShieldCheck, ExternalLink, Tag, Share2, Check
} from "lucide-react";

interface PortfolioDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PortfolioItem | null;
  professionalName?: string;
  professionalHandle?: string;
}

export default function PortfolioDetailModal({
  isOpen,
  onClose,
  item,
  professionalName,
  professionalHandle
}: PortfolioDetailModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !item) return null;

  const isVideo = item.type === "Video" || item.type === "Showreel" || item.mediaUrl.includes("youtube") || item.mediaUrl.includes("vimeo") || item.mediaUrl.endsWith(".mp4");

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(item.mediaUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#0C0D14] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-4 sm:px-6 border-b border-white/10 flex items-center justify-between bg-[#10121C] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              {isVideo ? <Play className="w-4 h-4 fill-amber-400" /> : <Film className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white truncate max-w-md sm:max-w-xl">
                {item.title}
              </h2>
              <div className="text-[11px] text-white/50 flex items-center gap-2">
                <span>{item.category || item.type}</span>
                {item.projectName && <span>• Project: {item.projectName}</span>}
                {professionalName && <span>• By {professionalName} {professionalHandle && <span className="text-amber-400/80">({professionalHandle})</span>}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Copy Media Link"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Player / Image Area */}
        <div className="relative bg-black flex items-center justify-center min-h-[300px] max-h-[55vh] overflow-hidden">
          {isVideo ? (
            item.mediaUrl.includes("youtube.com") || item.mediaUrl.includes("youtu.be") ? (
              <iframe
                src={
                  item.mediaUrl.includes("watch?v=") 
                    ? item.mediaUrl.replace("watch?v=", "embed/") 
                    : item.mediaUrl.replace("youtu.be/", "www.youtube.com/embed/")
                }
                title={item.title}
                className="w-full h-80 sm:h-96 md:h-[460px] border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : item.mediaUrl.includes("vimeo.com") ? (
              <iframe
                src={`https://player.vimeo.com/video/${item.mediaUrl.split("/").pop()}`}
                title={item.title}
                className="w-full h-80 sm:h-96 md:h-[460px] border-0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  src={item.mediaUrl}
                  controls
                  className="max-h-[50vh] max-w-full rounded-lg"
                  poster={item.thumbnailUrl}
                />
              </div>
            )
          ) : (
            <img
              src={item.mediaUrl}
              alt={item.title}
              className="max-h-[52vh] max-w-full object-contain p-2"
            />
          )}

          {item.duration && isVideo && (
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono font-bold flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{item.duration}</span>
            </div>
          )}
        </div>

        {/* Details and Metadata Info */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs bg-[#0C0D14]">
          
          {/* Key Attribute Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-amber-400" />
              <span>{item.category || item.type}</span>
            </span>

            {item.role && (
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold flex items-center gap-1.5">
                <User className="w-3 h-3 text-purple-400" />
                <span>Role: {item.role}</span>
              </span>
            )}

            {item.projectName && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold flex items-center gap-1.5">
                <Film className="w-3 h-3 text-blue-400" />
                <span>Film: {item.projectName}</span>
              </span>
            )}

            {item.year && (
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-white/50" />
                <span>{item.year}</span>
              </span>
            )}

            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{item.visibility || "Public"}</span>
            </span>
          </div>

          {/* Description */}
          {item.description && (
            <div className="space-y-1 bg-white/[0.02] p-3.5 rounded-2xl border border-white/5">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">
                Description / Context
              </span>
              <p className="text-white/80 leading-relaxed whitespace-pre-line text-xs">
                {item.description}
              </p>
            </div>
          )}

          {/* Credits */}
          {item.credits && (
            <div className="space-y-1 bg-white/[0.02] p-3.5 rounded-2xl border border-white/5">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">
                Production Credits
              </span>
              <p className="text-amber-300/90 font-mono text-xs">
                {item.credits}
              </p>
            </div>
          )}

          {/* Footer Action */}
          <div className="pt-2 flex items-center justify-between border-t border-white/10">
            <span className="text-[11px] text-white/40">
              Verified CineVenue Media Asset
            </span>

            <a
              href={item.mediaUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold flex items-center gap-2 text-xs transition-all"
            >
              <span>Open Original</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
