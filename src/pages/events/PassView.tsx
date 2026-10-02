import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { QrCode, Download, Share2, MapPin, Calendar, CheckCircle2, Ticket } from "lucide-react";
import { generateAndDownloadEventPassPdf, formatEventDateAndDay } from "../../utils/eventPassPdf";
import { getBookingById, getBookingPassId, getBookingOrderId, isFreeEventBooking } from "../../services/eventBookingService";
import type { EventBookingRecord } from "../../types/eventBooking";

export default function PassView() {
  const { passId } = useParams();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<EventBookingRecord | null>(null);

  useEffect(() => {
    if (passId) {
      const found = getBookingById(passId);
      if (found) {
        setBooking(found);
      }
    }
    setTimeout(() => {
      setLoading(false);
    }, 400);
  }, [passId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090A] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Fallback if booking record not found in storage
  const activeBooking = booking || {
    id: passId || "CV-EVT-2026-000184",
    passCode: passId || "CV-EVT-2026-000184",
    orderId: "CV-ORDER-2026-00184",
    eventId: "EVT-100",
    eventTitle: "CineVenue Grand Launch",
    eventDate: "2026-10-18",
    eventTime: "06:00 PM",
    venueName: "Grand Convention Hall",
    venueAddress: "HITEC City Main Boulevard, Madhapur, Hyderabad, Telangana 500081",
    city: "Hyderabad",
    bannerUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
    ticketTypeName: "VIP Pass",
    ticketCount: 1,
    primaryAttendee: {
      name: "Amarnath",
      email: "amarnath@cinevenue.in",
      phone: "+91 98765 43210",
    },
    pricing: {
      ticketSubtotal: 999,
      platformBookingFee: 0,
      taxAmount: 0,
      discountAmount: 0,
      cineCoinsRedeemed: 0,
      cineCoinsDiscount: 0,
      finalAmount: 999,
    },
    paymentMethod: "Online Gateway",
    paymentStatus: "PAID",
    bookingStatus: "Confirmed",
    qrCodePayload: passId || "CV-EVT-2026-000184",
    bookedAt: new Date().toISOString(),
    checkedIn: false,
  } as EventBookingRecord;

  const isFree = isFreeEventBooking(activeBooking);
  const canonicalPassId = getBookingPassId(activeBooking);
  const canonicalOrderId = getBookingOrderId(activeBooking);
  const { formattedDate, day: eventDay } = formatEventDateAndDay(activeBooking.eventDate);
  const feeAmount = activeBooking.pricing?.finalAmount ?? 999;

  return (
    <div className="min-h-screen bg-[#07070A] flex flex-col items-center justify-center p-4 py-12 text-left">
      <div className="w-full max-w-sm relative">
        <Link
          to="/events"
          className="absolute -top-10 left-0 text-text-secondary hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider flex items-center gap-1"
        >
          ← Back to Events
        </Link>

        {/* Vertical Portrait Pass Preview Card */}
        <div className="bg-[#111116] border-2 border-gold rounded-3xl overflow-hidden shadow-2xl relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1C190D] via-[#2A2308] to-[#15130A] border-b border-gold/60 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/logo.jpg" alt="CineVenue Logo" className="w-7 h-7 rounded-md object-cover border border-gold" />
              <div>
                <span className="font-serif font-black text-sm tracking-wide text-white uppercase">
                  CINE<span className="text-gold">VENUE</span>
                </span>
                <p className="text-[7.5px] uppercase font-bold text-text-muted tracking-wider">Vertical Event Pass</p>
              </div>
            </div>
            <span className="bg-gold text-black text-[9.5px] font-black uppercase px-2.5 py-1 rounded-full">
              {isFree ? "FREE PASS" : `${activeBooking.ticketTypeName || "VIP"}`}
            </span>
          </div>

          {/* Event Poster */}
          <div className="p-3 bg-black">
            <div className="w-full h-44 rounded-xl overflow-hidden border border-gold/30 bg-black">
              <img
                src={activeBooking.bannerUrl || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80"}
                alt={activeBooking.eventTitle}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Event Details */}
          <div className="p-4 space-y-3.5 bg-[#111116] text-white">
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-white leading-tight border-l-2 border-gold pl-2">
                {activeBooking.eventTitle}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <p className="text-[8px] uppercase font-bold text-text-muted">Date & Day</p>
                <p className="font-bold text-white text-[11px] mt-0.5">{formattedDate}</p>
                <p className="text-gold text-[9px] font-semibold">{eventDay}</p>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <p className="text-[8px] uppercase font-bold text-text-muted">Time & Venue</p>
                <p className="font-bold text-gold text-[11px] mt-0.5">{activeBooking.eventTime || "6:00 PM"}</p>
                <p className="text-white/80 text-[10px] truncate">{activeBooking.venueName}</p>
              </div>
            </div>

            <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-xs">
              <p className="text-[8px] uppercase font-bold text-text-muted">Pass Holder</p>
              <p className="font-bold text-white">{activeBooking.primaryAttendee?.name}</p>
              <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/5 text-[10px]">
                <span className="text-text-muted">Fee: <strong className={isFree ? "text-emerald-400" : "text-gold"}>{isFree ? "FREE ENTRY" : `₹${Number(feeAmount).toLocaleString("en-IN")}`}</strong></span>
                <span className="text-text-muted font-mono">{canonicalOrderId}</span>
              </div>
            </div>
          </div>

          {/* Ticket Perforation */}
          <div className="relative h-5 bg-[#07070A] flex items-center">
            <div className="w-5 h-5 bg-[#07070A] rounded-full -ml-2.5 border-r border-gold/40 z-10" />
            <div className="flex-1 border-t border-dashed border-gold/40" />
            <div className="w-5 h-5 bg-[#07070A] rounded-full -mr-2.5 border-l border-gold/40 z-10" />
          </div>

          {/* QR Section */}
          <div className="p-4 bg-[#0B0B0F] flex flex-col items-center text-center">
            <p className="text-[11px] font-mono font-bold text-gold mb-2">{canonicalPassId}</p>
            <div className="bg-white p-2 rounded-xl border border-gold/50 shadow-md mb-2">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(canonicalPassId)}`}
                alt="Pass QR"
                className="w-32 h-32 block"
              />
            </div>
            <p className="text-[9px] font-mono uppercase text-emerald-400 font-bold tracking-wider mb-4">
              SCAN AT ENTRY
            </p>

            <div className="flex w-full gap-2">
              <button
                onClick={() => generateAndDownloadEventPassPdf(activeBooking)}
                className="flex-1 bg-gold hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg border-0"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: "CineVenue Event Pass",
                      text: `CineVenue Event Pass: ${canonicalPassId} for ${activeBooking.eventTitle}`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Pass link copied to clipboard!");
                  }
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
            CINEVENUE ENTERTAINMENTS
          </p>
        </div>
      </div>
    </div>
  );
}
