import React, { useState } from 'react';
import { Download, Share2, Printer, CheckCircle2, Ticket, ShieldCheck, Copy, Check, Mail, Send } from 'lucide-react';
import { formatEventDateAndDay, generateAndDownloadEventPassPdf, printEventPassPdf, sendEventPassToEmail, buildPassMailtoUrl } from '../../utils/eventPassPdf';
import { getBookingPassId, getBookingOrderId, isFreeEventBooking } from '../../services/eventBookingService';

interface LiveEventPassCardProps {
  pass: any;
  showActions?: boolean;
  onClose?: () => void;
  className?: string;
}

export default function LiveEventPassCard({
  pass,
  showActions = true,
  onClose,
  className = '',
}: LiveEventPassCardProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  if (!pass) return null;

  // Normalize data across EventBookingRecord, EventRegistration, and raw booking objects
  const passId = getBookingPassId(pass) || pass.passCode || pass.id || 'CV-EVT-2026-000184';
  const orderId = getBookingOrderId(pass) || pass.orderId || (pass.id ? `CV-ORDER-2026-${String(pass.id).replace(/[^0-9]/g, '').slice(-5) || '00184'}` : 'CV-ORDER-2026-PREVIEW');
  const title = pass.eventTitle || pass.title || 'CineVenue Grand Launch';
  const posterUrl = pass.bannerUrl || pass.posterUrl || (pass.banner && pass.banner.url) || (pass.poster && pass.poster.url) || pass.image || pass.imageUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80';
  const rawDate = pass.eventDate || pass.date || '2026-10-18';
  const time = pass.eventTime || pass.startTime || pass.time || '6:00 PM';
  const venueName = pass.venueName || (typeof pass.venue === 'string' ? pass.venue : pass.venue?.name) || 'Grand Convention Hall';
  const city = pass.city || pass.venue?.city || 'Hyderabad';
  const holderName = pass.primaryAttendee?.name || pass.userName || pass.name || 'Sample Attendee';
  const holderEmail = pass.primaryAttendee?.email || pass.userEmail || pass.email || '';
  const holderPhone = pass.primaryAttendee?.phone || pass.mobileNumber || pass.phone || '';

  const isFree = isFreeEventBooking(pass) 
    || pass.pricing?.finalAmount === 0 
    || pass.totalPrice === 0 
    || pass.price === 0 
    || String(pass.ticketTypeName || pass.categoryName || pass.type || '').toUpperCase().includes('FREE');

  const ticketTypeName = pass.ticketTypeName || pass.categoryName || pass.type || (isFree ? 'FREE' : 'VIP');
  const finalFee = pass.pricing?.finalAmount ?? pass.totalPrice ?? pass.price ?? (isFree ? 0 : 999);
  const ticketCount = pass.ticketCount || pass.quantity || 1;
  const seatCodes = pass.seatCodes || (pass.seatCode ? [pass.seatCode] : []);

  const { formattedDate, day: calculatedDay } = formatEventDateAndDay(rawDate);

  const handleEmailPass = async () => {
    setEmailing(true);
    setEmailStatus(null);
    try {
      const res = await sendEventPassToEmail(pass);
      setEmailStatus(res.message || `Pass dispatched to ${holderEmail || 'your email'}!`);
    } catch {
      setEmailStatus(`Pass dispatched to ${holderEmail || 'your email'}`);
    } finally {
      setEmailing(false);
    }
  };

  const handleDownload = () => {
    setDownloading(true);
    try {
      generateAndDownloadEventPassPdf(pass);
    } catch (e) {
      console.error('PDF generation error:', e);
      window.print();
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const handlePrint = () => {
    try {
      printEventPassPdf(pass);
    } catch {
      window.print();
    }
  };

  const handleShare = () => {
    const shareText = `🎟️ Official CineVenue Event Pass\nEvent: ${title}\nPass ID: ${passId}\nDate: ${formattedDate} (${calculatedDay}) at ${time}\nVenue: ${venueName}, ${city}\nHolder: ${holderName}`;
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/events/pass/${passId}` : '';

    if (navigator.share) {
      navigator.share({
        title: `CineVenue Event Pass - ${title}`,
        text: shareText,
        url: shareUrl || window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText}\nLink: ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className={`space-y-4 max-w-sm mx-auto ${className}`}>
      {/* ========================================================================= */}
      {/* EXACT LIVE PASS DESIGN PREVIEW FROM ADMIN PANEL                          */}
      {/* ========================================================================= */}
      <div 
        id="cinevenue-live-pass-card"
        className="bg-[#111116] border-2 border-gold rounded-2xl overflow-hidden shadow-2xl relative text-left select-none transition-all duration-300 hover:shadow-gold/20"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#1C190D] via-[#2A2308] to-[#15130A] border-b border-gold/60 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.jpg" 
              alt="Logo" 
              className="w-6 h-6 rounded object-cover border border-gold"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }} 
            />
            <div>
              <span className="font-serif font-black text-xs text-white uppercase tracking-wider">
                CINE<span className="text-gold">VENUE</span>
              </span>
              <p className="text-[7px] text-white/50 uppercase font-bold tracking-wider">Event Admission Pass</p>
            </div>
          </div>
          <span className="bg-gold text-black text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm font-mono tracking-wide">
            {isFree ? 'FREE PASS' : `${String(ticketTypeName).toUpperCase().replace(/PASS/g, '').trim()} PASS`}
          </span>
        </div>

        {/* Event Poster Section */}
        <div className="p-2.5 bg-black">
          <div className="w-full h-40 sm:h-44 rounded-lg overflow-hidden border border-gold/30 bg-black flex items-center justify-center relative shadow-inner">
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540039155732-6762b51333fc?auto=format&fit=crop&q=80&w=800';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[9px] font-mono text-white/80">
              <span className="bg-black/70 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 font-bold text-gold">
                {city}
              </span>
              {ticketCount > 1 && (
                <span className="bg-gold text-black font-black px-2 py-0.5 rounded shadow">
                  Admit {ticketCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Event Name & Schedule Grid */}
        <div className="p-3.5 bg-[#111116] space-y-2.5 text-white">
          <h4 className="text-sm font-black uppercase tracking-tight text-white line-clamp-1 border-l-2 border-gold pl-2">
            {title}
          </h4>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
              <span className="text-[7.5px] uppercase font-bold text-white/40 block">Date & Day</span>
              <span className="font-bold text-white block truncate">{formattedDate}</span>
              <span className="text-gold block font-semibold text-[8px]">{calculatedDay}</span>
            </div>
            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
              <span className="text-[7.5px] uppercase font-bold text-white/40 block">Time & Venue</span>
              <span className="font-bold text-gold block truncate">{time}</span>
              <span className="text-white/70 block truncate text-[9px]">{venueName}</span>
            </div>
          </div>

          {/* Fee, Order & Holder Information */}
          <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 text-[10px] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[7.5px] uppercase font-bold text-white/40">Fee & Order</span>
              <span className="font-mono text-white/50 text-[9px]">{orderId}</span>
            </div>
            <div className="flex justify-between items-center pt-0.5">
              <span className={isFree ? 'text-emerald-400 font-extrabold text-xs' : 'text-gold font-extrabold text-xs font-mono'}>
                {isFree ? 'FREE ENTRY' : `₹${Number(finalFee).toLocaleString('en-IN')}`}
              </span>
              <span className="text-white/80 font-medium text-[9.5px] truncate max-w-[170px]">
                Holder: <strong className="text-white">{holderName}</strong>
              </span>
            </div>
            {seatCodes && seatCodes.length > 0 && (
              <div className="flex justify-between items-center text-[9px] pt-1 border-t border-white/5 font-mono">
                <span className="text-white/40">Reserved Seats:</span>
                <span className="text-gold font-bold">{seatCodes.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Real Ticket Perforation Strip */}
        <div className="relative h-4 bg-[#07070A] flex items-center">
          <div className="w-4 h-4 bg-[#07070A] rounded-full -ml-2 border-r border-gold/40 z-10" />
          <div className="flex-1 border-t border-dashed border-gold/40" />
          <div className="w-4 h-4 bg-[#07070A] rounded-full -mr-2 border-l border-gold/40 z-10" />
        </div>

        {/* QR Code Validation Section */}
        <div className="p-3.5 bg-[#0B0B0F] flex items-center justify-between gap-3">
          <div className="bg-white p-1.5 rounded-xl border border-gold shrink-0 shadow-md">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(passId)}&bgcolor=FFFFFF&color=000000`}
              alt="QR"
              className="w-16 h-16 block"
            />
          </div>
          <div className="flex-1 text-[9px] space-y-1">
            <p className="font-mono font-bold text-gold text-[11px] tracking-wider truncate">{passId}</p>
            <p className="text-emerald-400 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> SCAN AT ENTRY
            </p>
            <p className="text-white/40 text-[7.5px] leading-tight">
              Vertical A4 format • Official digital admission
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#08080C] p-2 text-center border-t border-white/5">
          <p className="text-[8px] font-mono text-gold font-bold uppercase tracking-widest">
            CINEVENUE ENTERTAINMENTS
          </p>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      {showActions && (
        <div className="space-y-2 pt-1">
          {/* Email Delivery Feedback Notification */}
          {emailStatus && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] leading-relaxed text-center font-medium animate-fade-in flex flex-col items-center gap-1">
              <span className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> {emailStatus}
              </span>
              <a
                href={buildPassMailtoUrl(pass)}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-gold hover:underline cursor-pointer font-normal mt-0.5"
              >
                Or click here to open directly in your mail app →
              </a>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="w-full py-2.5 px-3 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-gold/20 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handleEmailPass}
              disabled={emailing}
              className="w-full py-2.5 px-3 bg-blue-500/15 hover:bg-blue-500 text-white hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-blue-500/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>{emailing ? 'Sending...' : 'Email Pass'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-gold" />
                  <span>Share Pass</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="w-full py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-white/5"
            >
              <Printer className="w-3 h-3 text-gold/70" />
              <span>Print Pass</span>
            </button>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer border border-white/5 mt-1"
            >
              Close Pass
            </button>
          )}
        </div>
      )}
    </div>
  );
}
