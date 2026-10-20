import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Ticket,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CalendarPlus,
  Sparkles,
  Film
} from "lucide-react";
import {
  openVenueDirections,
  downloadCalendarEvent,
  parseBookingDateTime,
  VenueLocationInfo
} from "../../services/venueLocationService";

export interface UnifiedUpcomingBooking {
  id: string;
  type: "MOVIE" | "EVENT";
  title: string;
  posterUrl?: string;
  venueName: string;
  venueAddress: string;
  city: string;
  latitude?: number;
  longitude?: number;
  dateStr: string; // YYYY-MM-DD or formatted date
  timeStr: string; // e.g., "06:30 PM"
  seats?: string[];
  screen?: string;
  ticketCount: number;
  totalAmount?: number;
  status: string;
  rawBooking?: any;
}

interface UpcomingBookingCardProps {
  bookings?: any[]; // Raw movie bookings
  eventBookings?: any[]; // Raw event bookings
  theatres?: any[]; // To look up coordinates and full addresses
  onViewTicket: (booking: UnifiedUpcomingBooking) => void;
  className?: string;
}

export default function UpcomingBookingCard({
  bookings = [],
  eventBookings = [],
  theatres = [],
  onViewTicket,
  className = ""
}: UpcomingBookingCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [calendarAdded, setCalendarAdded] = useState(false);

  // Tick every second to update countdown dynamically
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Normalize and merge movie and event bookings
  const upcomingList: UnifiedUpcomingBooking[] = React.useMemo(() => {
    const list: UnifiedUpcomingBooking[] = [];

    // 1. Process Movie Bookings
    bookings.forEach((b: any) => {
      const statusUpper = String(b.status || "").toUpperCase();
      // Only include eligible confirmed bookings (not cancelled/refunded)
      if (
        statusUpper === "CONFIRMED" ||
        statusUpper === "SETTLED" ||
        statusUpper === "ACTIVE" ||
        statusUpper === "APPROVED" ||
        !b.status // default to active if confirmed on client
      ) {
        // Look up registered theatre for coordinates and full address
        const matchedTheatre = theatres.find(
          (t) =>
            String(t.id) === String(b.theatreId) ||
            t.name?.toLowerCase() === b.theatreName?.toLowerCase()
        );

        const venueAddress =
          matchedTheatre?.address ||
          b.theatreAddress ||
          matchedTheatre?.location ||
          b.city ||
          "Cinema Multiplex, India";

        list.push({
          id: b.id || `BK-${b.movieTitle}`,
          type: "MOVIE",
          title: b.movieTitle || "Movie Showtime",
          posterUrl: b.moviePoster || b.poster || matchedTheatre?.img,
          venueName: b.theatreName || matchedTheatre?.name || "CineVenue Theatre",
          venueAddress,
          city: b.city || matchedTheatre?.city || "Hyderabad",
          latitude: matchedTheatre?.latitude || b.theatreLatitude,
          longitude: matchedTheatre?.longitude || b.theatreLongitude,
          dateStr: b.date || new Date().toISOString().split("T")[0],
          timeStr: b.timeSlot || b.time || "06:30 PM",
          seats: b.seats || [],
          screen: b.screenName || "Screen 1",
          ticketCount: (b.seats && b.seats.length) || 1,
          totalAmount: b.totalPrice || b.totalAmount || 0,
          status: "Confirmed",
          rawBooking: b
        });
      }
    });

    // 2. Process Event Bookings (from eventRegistrations or localStorage cv_event_bookings)
    let storedEvents: any[] = [];
    try {
      const rawStored = localStorage.getItem("cv_event_bookings");
      if (rawStored) storedEvents = JSON.parse(rawStored);
    } catch {}

    const allEvents = [...eventBookings, ...storedEvents];
    const seenEventIds = new Set<string>();

    allEvents.forEach((eb: any) => {
      const ebId = eb.id || eb.passCode || eb.passId;
      if (!ebId || seenEventIds.has(ebId)) return;
      seenEventIds.add(ebId);

      const statusUpper = String(eb.bookingStatus || eb.status || "").toUpperCase();
      if (
        statusUpper === "CONFIRMED" ||
        statusUpper === "PAID" ||
        statusUpper === "ACTIVE" ||
        !eb.status
      ) {
        list.push({
          id: ebId,
          type: "EVENT",
          title: eb.eventTitle || eb.title || "Live Entertainment Event",
          posterUrl: eb.bannerUrl || eb.posterUrl || eb.image,
          venueName: eb.venueName || eb.venue || "Grand Arena Venue",
          venueAddress: eb.venueAddress || eb.city || "Event Venue Address",
          city: eb.city || "Hyderabad",
          latitude: eb.latitude,
          longitude: eb.longitude,
          dateStr: eb.eventDate || eb.date || new Date().toISOString().split("T")[0],
          timeStr: eb.eventTime || eb.time || eb.startTime || "07:00 PM",
          seats: eb.seatCodes || [],
          screen: eb.ticketTypeName || "VIP Admission",
          ticketCount: eb.ticketCount || 1,
          totalAmount: eb.finalPayableAmount || eb.totalPrice || 0,
          status: "Confirmed",
          rawBooking: eb
        });
      }
    });

    // 3. Filter out past expired bookings:
    // Retain upcoming bookings until show end time (show start + 3 hours)
    const validUpcoming = list.filter((item) => {
      try {
        const start = parseBookingDateTime(item.dateStr, item.timeStr).getTime();
        const expiry = start + 3.5 * 60 * 60 * 1000; // 3.5 hours grace period
        return expiry > currentTime;
      } catch {
        return true;
      }
    });

    // 4. Sort ascending by show start time (closest next booking first)
    validUpcoming.sort((a, b) => {
      const timeA = parseBookingDateTime(a.dateStr, a.timeStr).getTime();
      const timeB = parseBookingDateTime(b.dateStr, b.timeStr).getTime();
      return timeA - timeB;
    });

    return validUpcoming;
  }, [bookings, eventBookings, theatres, currentTime]);

  if (upcomingList.length === 0) {
    return null; // Gracefully collapse if user has no upcoming bookings
  }

  const safeIndex = Math.min(activeIndex, upcomingList.length - 1);
  const activeBooking = upcomingList[safeIndex];

  // Calculate live countdown
  const startEpoch = parseBookingDateTime(activeBooking.dateStr, activeBooking.timeStr).getTime();
  const diffMs = startEpoch - currentTime;

  let countdownText = "";
  let isHappeningNow = false;

  if (diffMs <= 0) {
    isHappeningNow = true;
    countdownText = "Show in Progress";
  } else {
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (days > 0) {
      countdownText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      countdownText = `${hours}h ${minutes}m ${seconds}s`;
    } else {
      countdownText = `${minutes}m ${seconds}s`;
    }
  }

  const handleDirectionsClick = () => {
    const venueInfo: VenueLocationInfo = {
      name: activeBooking.venueName,
      address: activeBooking.venueAddress,
      city: activeBooking.city,
      latitude: activeBooking.latitude,
      longitude: activeBooking.longitude
    };
    openVenueDirections(venueInfo);
  };

  const handleCalendarClick = () => {
    downloadCalendarEvent({
      title: activeBooking.title,
      type: activeBooking.type,
      bookingId: activeBooking.id,
      venueName: activeBooking.venueName,
      venueAddress: activeBooking.venueAddress,
      city: activeBooking.city,
      dateStr: activeBooking.dateStr,
      timeStr: activeBooking.timeStr,
      seats: activeBooking.seats,
      screen: activeBooking.screen
    });
    setCalendarAdded(true);
    setTimeout(() => setCalendarAdded(false), 3000);
  };

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-6 pb-2 z-20 relative ${className}`}>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12131A] via-[#0E0F14] to-[#0A0B0E] border-2 border-[#D4AF37]/50 shadow-2xl p-5 sm:p-7 text-white animate-fade-in group hover:border-[#D4AF37] transition-all duration-300">
        {/* Subtle Ambient Gold Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[90px] pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#D4AF37] font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Your Next Confirmed Booking
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
              Confirmed
            </span>
          </div>

          {/* Multiple Bookings Switcher / Pager */}
          {upcomingList.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 font-mono">
                Booking <span className="text-[#D4AF37] font-bold">{safeIndex + 1}</span> of {upcomingList.length}
              </span>
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : upcomingList.length - 1))}
                  className="p-1 rounded-lg hover:bg-[#D4AF37] hover:text-black text-white/70 transition-colors cursor-pointer"
                  title="Previous Booking"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev < upcomingList.length - 1 ? prev + 1 : 0))}
                  className="p-1 rounded-lg hover:bg-[#D4AF37] hover:text-black text-white/70 transition-colors cursor-pointer"
                  title="Next Booking"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Booking Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-center pt-5 relative z-10">
          {/* Left: Poster / Event Banner */}
          <div className="lg:col-span-3 flex items-center gap-4">
            {activeBooking.posterUrl ? (
              <img
                src={activeBooking.posterUrl}
                alt={activeBooking.title}
                className="w-24 sm:w-28 aspect-[2/3] object-cover rounded-2xl border border-[#D4AF37]/30 shadow-lg shrink-0"
              />
            ) : (
              <div className="w-24 sm:w-28 aspect-[2/3] rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-[#D4AF37] shrink-0">
                <Film className="w-8 h-8 opacity-60" />
                <span className="text-[9px] uppercase tracking-wider font-mono mt-2">CineVenue</span>
              </div>
            )}

            <div className="space-y-1.5 my-auto">
              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-mono">
                {activeBooking.type === "MOVIE" ? "Movie Ticket" : "Live Event Pass"}
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                {activeBooking.title}
              </h3>
              <p className="text-xs text-white/60 font-medium">
                Ref ID: <span className="text-white/90 font-mono">{activeBooking.id}</span>
              </p>
              {activeBooking.seats && activeBooking.seats.length > 0 && (
                <p className="text-xs text-[#D4AF37] font-bold">
                  Seats: {activeBooking.seats.join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Middle: Venue Location & Timing Details */}
          <div className="lg:col-span-5 space-y-3 bg-white/[0.03] p-4 sm:p-5 rounded-2xl border border-white/5">
            {/* Venue & Full Address */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block font-mono">
                  Venue Location & Address
                </span>
                <span className="text-sm font-bold text-white block">
                  {activeBooking.venueName}
                </span>
                <p className="text-xs text-white/70 leading-relaxed">
                  {activeBooking.venueAddress}
                </p>
              </div>
            </div>

            {/* Date and Time Slot */}
            <div className="flex items-center gap-6 pt-2 border-t border-white/5 text-xs text-white/80">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-semibold">{activeBooking.dateStr}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-semibold">{activeBooking.timeStr}</span>
              </div>
            </div>
          </div>

          {/* Right: Live Dynamic Countdown & Action Buttons */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
            {/* Dynamic Countdown Box */}
            <div className="bg-black/50 border border-[#D4AF37]/40 p-3.5 rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 font-mono block">
                {isHappeningNow ? "Show Status" : "Live Countdown"}
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#D4AF37] font-mono tracking-wider drop-shadow-sm">
                {countdownText}
              </div>
              <span className="text-[10px] text-emerald-400 font-mono block">
                ● Real-time Sync Active
              </span>
            </div>

            {/* Interactive Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {/* View Ticket Button */}
              <button
                type="button"
                onClick={() => onViewTicket(activeBooking)}
                className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02]"
              >
                <Ticket className="w-4 h-4 text-[#D4AF37]" />
                <span>View Ticket</span>
              </button>

              {/* Get Directions Button */}
              <button
                type="button"
                onClick={handleDirectionsClick}
                className="w-full py-2.5 px-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/20 hover:scale-[1.02]"
              >
                <Navigation className="w-4 h-4 text-black" />
                <span>Get Directions</span>
              </button>
            </div>

            {/* Add to Calendar Button */}
            <button
              type="button"
              onClick={handleCalendarClick}
              className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/80 hover:text-white font-medium text-[11px] tracking-wide transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{calendarAdded ? "✓ Added to Calendar (.ics downloaded)" : "Add to Calendar (with 24h, 3h, 1h, 15m alerts)"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
