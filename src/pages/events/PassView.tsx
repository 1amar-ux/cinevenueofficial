import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBookingById } from "../../services/eventBookingService";
import type { EventBookingRecord } from "../../types/eventBooking";
import LiveEventPassCard from "../../components/events/LiveEventPassCard";

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
  const activeBooking = booking || ({
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
  } as EventBookingRecord);

  return (
    <div className="min-h-screen bg-[#07070A] flex flex-col items-center justify-center p-4 py-12 text-left">
      <div className="w-full max-w-sm relative">
        <Link
          to="/events"
          className="absolute -top-10 left-0 text-text-secondary hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider flex items-center gap-1"
        >
          ← Back to Events
        </Link>

        {/* Official Live Pass Design Card */}
        <LiveEventPassCard pass={activeBooking} showActions={true} />

        <div className="text-center mt-6">
          <p className="text-[11px] text-text-muted">
            Present this pass at the gate entry checkpoint. Authorized staff will scan this QR code for instant barcode admission.
          </p>
        </div>
      </div>
    </div>
  );
}
