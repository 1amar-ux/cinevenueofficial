import React from 'react';
import {
  X, Calendar, Clock, MapPin, Ticket, ShieldCheck,
  Download, Share2, CheckCircle2, User, QrCode as QrIcon
} from 'lucide-react';
import type { EventBookingRecord } from '../../types/eventBooking';

interface DigitalTicketPassModalProps {
  booking: EventBookingRecord;
  onClose: () => void;
}

export default function DigitalTicketPassModal({
  booking,
  onClose,
}: DigitalTicketPassModalProps) {
  // Generate simple SVG QR Code visual pattern
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    booking.qrCodePayload
  )}&bgcolor=000000&color=D4AF37&margin=1`;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Pass for ${booking.eventTitle}`,
        text: `My digital pass for ${booking.eventTitle} on ${booking.eventDate} at ${booking.venueName}. Pass Code: ${booking.passCode}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`Pass Code: ${booking.passCode} | Event: ${booking.eventTitle}`);
      alert('Pass details copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0E0E12] border border-gold/30 rounded-3xl overflow-hidden shadow-2xl shadow-gold/10 text-left my-8">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-gold/20 via-amber-500/15 to-transparent px-6 py-4 border-b border-gold/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold font-mono">
              OFFICIAL CINEVENUE ADMISSION PASS
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-6">
          {/* Event Header Banner */}
          <div className="flex gap-4 items-start">
            <img
              src={booking.bannerUrl}
              alt={booking.eventTitle}
              className="w-24 h-32 object-cover rounded-xl border border-white/10 shrink-0 shadow-lg"
            />
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="inline-block text-[9px] font-bold uppercase tracking-wider bg-gold/10 text-gold border border-gold/30 px-2 py-0.5 rounded-full">
                {booking.ticketTypeName}
              </span>
              <h3 className="text-lg font-bold text-white leading-snug line-clamp-2">
                {booking.eventTitle}
              </h3>
              <div className="text-xs text-white/60 space-y-1 pt-1 font-light">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span>{booking.eventDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span>{booking.eventTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span className="truncate">{booking.venueName}, {booking.city}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Perforated Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="absolute left-[-24px] w-6 h-6 rounded-full bg-black/90 border-r border-gold/30" />
            <div className="w-full border-t-2 border-dashed border-white/15" />
            <div className="absolute right-[-24px] w-6 h-6 rounded-full bg-black/90 border-l border-gold/30" />
          </div>

          {/* Pass Details & Seat Information */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4 font-mono text-center">
            <div>
              <span className="text-[9px] text-white/40 uppercase tracking-wider block">Booking ID</span>
              <span className="text-xs font-bold text-white mt-0.5 block truncate">{booking.id}</span>
            </div>
            <div>
              <span className="text-[9px] text-white/40 uppercase tracking-wider block">Pass Count</span>
              <span className="text-xs font-bold text-gold mt-0.5 block">{booking.ticketCount} {booking.ticketCount > 1 ? 'Passes' : 'Pass'}</span>
            </div>
            <div>
              <span className="text-[9px] text-white/40 uppercase tracking-wider block">Seating</span>
              <span className="text-xs font-bold text-emerald-400 mt-0.5 block truncate">
                {booking.seatCodes && booking.seatCodes.length > 0
                  ? booking.seatCodes.join(', ')
                  : 'Free Standing'}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-white/40 uppercase tracking-wider block">Total Paid</span>
              <span className="text-xs font-bold text-white mt-0.5 block">₹{booking.pricing.finalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Primary Attendee & Extra Guests */}
          <div className="space-y-2 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40 uppercase font-mono text-[9px] flex items-center gap-1.5">
                <User className="w-3 h-3 text-gold" /> Primary Ticket Holder
              </span>
              <span className="font-bold text-white">{booking.primaryAttendee.name}</span>
            </div>
            <div className="text-[11px] text-white/50 flex justify-between font-mono">
              <span>{booking.primaryAttendee.phone}</span>
              <span className="truncate">{booking.primaryAttendee.email}</span>
            </div>

            {booking.additionalAttendees && booking.additionalAttendees.length > 0 && (
              <div className="pt-2 border-t border-white/5 text-[11px]">
                <span className="text-[9px] font-mono text-white/40 uppercase block mb-1">Additional Attendees:</span>
                <div className="flex flex-wrap gap-1.5">
                  {booking.additionalAttendees.map((att, idx) => (
                    <span key={idx} className="bg-white/5 px-2 py-0.5 rounded text-white/80 font-medium text-[10px]">
                      {att.name} {att.seatCode ? `(${att.seatCode})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* QR Code Validation Center */}
          <div className="bg-gradient-to-b from-black to-[#0A0A0E] border border-gold/30 rounded-2xl p-5 text-center space-y-3">
            <div className="w-48 h-48 mx-auto bg-black p-2.5 rounded-xl border border-gold/40 shadow-inner flex items-center justify-center">
              <img
                src={qrSvgUrl}
                alt="Ticket QR Code"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono block">
                GATE VALIDATION PASS CODE
              </span>
              <span className="text-xl font-mono font-black text-gold tracking-widest block mt-0.5">
                {booking.passCode}
              </span>
            </div>
            <p className="text-[10px] text-white/40 max-w-xs mx-auto leading-relaxed">
              Show this QR code at the event gate for instant barcode entry. Each QR code is uniquely encrypted and admits {booking.ticketCount} guest{booking.ticketCount > 1 ? 's' : ''}.
            </p>
          </div>

          {/* Verification Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified CineVenue Admission Pass</span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/20 px-2 py-0.5 rounded">
              {booking.checkedIn ? 'CHECKED IN' : 'READY FOR ENTRY'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 bg-gold hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold/20"
            >
              <Download className="w-4 h-4" />
              Print / Save Pass
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-gold" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
