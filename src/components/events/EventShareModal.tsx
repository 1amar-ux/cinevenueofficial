import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Send,
  ExternalLink,
  MessageCircle,
  Twitter,
  Facebook,
  Mail,
  QrCode,
  Calendar,
  MapPin,
} from 'lucide-react';
import {
  ShareableEvent,
  getEventShareUrl,
  copyEventShareLink,
  getWhatsAppShareUrl,
  getTwitterShareUrl,
  getFacebookShareUrl,
  getEmailShareUrl,
} from '../../utils/eventSharing';

interface EventShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ShareableEvent | null;
}

export default function EventShareModal({ isOpen, onClose, event }: EventShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen || !event) return null;

  const shareUrl = getEventShareUrl(event.id);

  const handleCopy = async () => {
    const success = await copyEventShareLink(event.id);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title} on CineVenue!`,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#0F0F12] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2 text-gold text-xs font-mono font-bold uppercase tracking-wider">
            <Share2 className="w-4 h-4" /> Share Event Link
          </div>
          <h3 className="text-xl font-bold text-white font-display line-clamp-1">{event.title}</h3>
          <div className="flex items-center gap-3 text-xs text-white/50">
            {event.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gold" /> {event.date}
              </span>
            )}
            {event.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gold" /> {event.city}
              </span>
            )}
          </div>
        </div>

        {/* Copy Link Section */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase font-semibold text-white/60">
            Public Direct Link
          </label>
          <div className="flex items-center gap-2 p-2 bg-black/60 border border-white/10 rounded-xl">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent border-none text-xs text-white/90 focus:outline-none w-full font-mono truncate px-2 select-all"
            />
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                copied
                  ? 'bg-emerald-500 text-black'
                  : 'bg-gold hover:bg-gold-light text-black shadow-md'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share Grid */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase font-semibold text-white/60">
            Share Directly Via
          </label>
          <div className="grid grid-cols-4 gap-2">
            {/* WhatsApp */}
            <a
              href={getWhatsAppShareUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-colors group cursor-pointer"
              title="Share on WhatsApp"
            >
              <MessageCircle className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold">WhatsApp</span>
            </a>

            {/* Twitter / X */}
            <a
              href={getTwitterShareUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 hover:text-sky-300 transition-colors group cursor-pointer"
              title="Share on Twitter / X"
            >
              <Twitter className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold">Twitter / X</span>
            </a>

            {/* Facebook */}
            <a
              href={getFacebookShareUrl(event.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 transition-colors group cursor-pointer"
              title="Share on Facebook"
            >
              <Facebook className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold">Facebook</span>
            </a>

            {/* Email */}
            <a
              href={getEmailShareUrl(event)}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 transition-colors group cursor-pointer"
              title="Share via Email"
            >
              <Mail className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold">Email</span>
            </a>
          </div>
        </div>

        {/* More Actions / Native Share & QR Toggle */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={() => setShowQr(!showQr)}
            className="text-xs text-white/70 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-gold" />
            <span>{showQr ? 'Hide QR' : 'Show QR Code'}</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="text-xs text-gold hover:text-gold-light flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 border border-gold/30 font-semibold transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>More Options</span>
          </button>
        </div>

        {/* QR Code Preview */}
        {showQr && (
          <div className="p-4 bg-white rounded-xl text-center space-y-2 animate-in fade-in duration-200">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`}
              alt="QR Code"
              className="mx-auto w-40 h-40"
            />
            <p className="text-[11px] text-gray-800 font-mono font-medium">
              Scan with mobile camera to view event
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
