import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import EventsNavbar from "../../components/events/EventsNavbar";
import { Calendar, MapPin, Share2, Users, Clock, Info, CheckCircle2, ArrowLeft } from "lucide-react";
import { Event } from "../../types";
import apiClient from "../../services/apiClient";
import EventShareModal from "../../components/events/EventShareModal";

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadEvent() {
      if (!eventId) {
        setLoading(false);
        return;
      }

      // 1. Try local canonical storage first (instant access for newly created events)
      try {
        const { getEvents: getLocalEvents, getEventById } = await import("../../services/eventBookingService");
        const localItem = getEventById(eventId) || (getLocalEvents() || []).find((e: any) => e.id === eventId || e._id === eventId);
        if (localItem) {
          const rawDate = localItem.date ? new Date(localItem.date) : new Date();
          const dateStr = !isNaN(rawDate.getTime()) ? rawDate.toISOString().split("T")[0] : (localItem.date || "2026-10-15");
          const lowestPrice = localItem.ticketTypes && localItem.ticketTypes.length > 0
            ? Math.min(...localItem.ticketTypes.map((t: any) => Number(t.price) || 0))
            : (Number(localItem.price) || 0);

          const mapped: Event = {
            id: localItem.id || localItem._id,
            title: localItem.title,
            description: localItem.description || "",
            venueName: localItem.venueName || (typeof localItem.venue === 'string' ? localItem.venue : localItem.venue?.name) || "Convention Arena",
            venueAddress: localItem.venueAddress || localItem.venue?.address || "",
            city: localItem.city || "All Cities",
            date: dateStr,
            time: localItem.startTime || localItem.time || "18:00",
            image: localItem.bannerUrl || localItem.posterUrl || (localItem as any).image || "https://images.unsplash.com/photo-1540039155732-6762b51333fc?auto=format&fit=crop&q=80&w=1200",
            categories: (localItem.ticketTypes || []).map((t: any) => ({
              name: t.name || "Standard Pass",
              price: Number(t.price ?? 0),
              availableSeats: t.availableQuantity ?? 100,
            })),
            reviews: localItem.reviews || [],
            featured: localItem.featured ?? true,
            isPaid: localItem.eventType === "PAID" || lowestPrice > 0,
            isActive: localItem.isActive !== false && String(localItem.status || '').toUpperCase() !== 'CANCELLED' && String(localItem.status || '').toUpperCase() !== 'DRAFT',
            convenienceFeeEnabled: Boolean(localItem.convenienceFeeEnabled),
            convenienceFeeType: localItem.convenienceFeeType || 'FIXED',
            convenienceFeeAmount: Number(localItem.convenienceFeeAmount ?? 0),
            convenienceFeeApplication: localItem.convenienceFeeApplication || 'PER_TICKET',
            convenienceFeeStatus: localItem.convenienceFeeStatus || 'PENDING',
            convenienceFeeApprovedBy: localItem.convenienceFeeApprovedBy || null,
            convenienceFeeApprovedAt: localItem.convenienceFeeApprovedAt || null,
          };
          if (isMounted) {
            setEvent(mapped);
            setLoading(false);
            return;
          }
        }

        // 2. Try cine_events in localStorage
        const cineRaw = localStorage.getItem("cine_events");
        if (cineRaw) {
          const cineList = JSON.parse(cineRaw);
          const cineItem = cineList.find((c: any) => c.id === eventId || c._id === eventId);
          if (cineItem) {
            if (isMounted) {
              setEvent(cineItem);
              setLoading(false);
              return;
            }
          }
        }
      } catch (e) {}

      // 3. Fallback to API backend
      try {
        const res = await apiClient.get(`/events/${eventId}`);
        const e = res.data?.data?.event || res.data?.event;
        if (e) {
          const mapped: Event = {
            id: e.id || e._id,
            title: e.title,
            description: e.description || "",
            venueName: e.venueName || e.venue?.name || (typeof e.venue === 'string' ? e.venue : "Convention Arena"),
            venueAddress: e.venueAddress || e.venue?.address || "",
            city: e.city || "All Cities",
            date: e.date ? new Date(e.date).toISOString().split("T")[0] : "2026-10-15",
            time: e.time || e.startTime || "18:00",
            image: e.bannerUrl || e.posterUrl || (typeof e.poster === 'object' ? e.poster?.url : e.poster) || "https://images.unsplash.com/photo-1540039155732-6762b51333fc?auto=format&fit=crop&q=80&w=1200",
            categories: (e.ticketTypes || []).map((t: any) => ({
              name: t.name || t.typeId?.name || "Standard Pass",
              price: Number(t.price ?? t.typeId?.price ?? 0),
              availableSeats: t.availableQuantity ?? t.availableSeats ?? 100,
            })),
            reviews: [],
            featured: true,
            isPaid: Number(e.price) > 0 || (e.ticketTypes || []).some((t: any) => Number(t.price) > 0),
            isActive: e.status !== "CANCELLED" && e.status !== "DRAFT",
            convenienceFeeEnabled: Boolean(e.convenienceFeeEnabled),
            convenienceFeeType: e.convenienceFeeType || 'FIXED',
            convenienceFeeAmount: Number(e.convenienceFeeAmount ?? 0),
            convenienceFeeApplication: e.convenienceFeeApplication || 'PER_TICKET',
            convenienceFeeStatus: e.convenienceFeeStatus || 'PENDING',
            convenienceFeeApprovedBy: e.convenienceFeeApprovedBy || null,
            convenienceFeeApprovedAt: e.convenienceFeeApprovedAt || null,
          };
          if (isMounted) {
            setEvent(mapped);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("[EventDetails] Live fetch fallback notice:", err);
      }

      // Default Event Fallback if event is not found
      const defaultEvent: Event = {
        id: eventId || "evt_1",
        title: "Pushpa 2 Pre-Release Event",
        description: "Join the massive pre-release event of Pushpa 2: The Rule. Featuring Allu Arjun, Rashmika Mandanna, and director Sukumar. Live performances, exclusive trailer showcase, and interaction with the cast.",
        venueName: "Hyderabad Convention Centre",
        venueAddress: "HITEC City",
        city: "Hyderabad",
        date: "2026-10-15",
        time: "17:00",
        image: "https://images.unsplash.com/photo-1540039155732-6762b51333fc?auto=format&fit=crop&q=80&w=1200",
        categories: [
          { name: "VVIP Pass", price: 10000, availableSeats: 50 }, 
          { name: "VIP Pass", price: 5000, availableSeats: 200 }, 
          { name: "Fan Pass", price: 500, availableSeats: 1500 }
        ],
        reviews: [],
        featured: true,
        isPaid: true,
        isActive: true
      };

      if (isMounted) {
        setEvent(defaultEvent);
        setLoading(false);
      }
    }

    loadEvent();

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  if (loading) {
    return <div className="min-h-screen bg-[#09090A] flex items-center justify-center text-white"><div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!event) {
    return <div className="min-h-screen bg-[#09090A] flex items-center justify-center text-white">Event not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#09090A]">
      <EventsNavbar />
      
      {/* Banner */}
      <div className="pt-20">
        <div className="w-full h-[40vh] md:h-[60vh] relative">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090A] via-[#09090A]/50 to-transparent" />
          
          {/* Top Quick Actions on Banner */}
          <div className="absolute top-6 left-4 right-4 sm:left-8 sm:right-8 flex items-center justify-between z-20">
            <Link
              to="/events"
              className="px-4 py-2 bg-black/60 hover:bg-black/90 text-white rounded-full text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-all shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 text-gold" />
              <span>All Events</span>
            </Link>

            <button
              onClick={() => setShareModalOpen(true)}
              className="px-4 py-2 bg-black/60 hover:bg-gold hover:text-black text-white rounded-full text-xs font-bold backdrop-blur-md border border-white/20 hover:border-gold flex items-center gap-2 transition-all shadow-lg cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Event Link</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md border border-white/10">Pre-Release Event</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-display text-white mb-4 leading-tight">{event.title}</h1>
              <p className="text-lg text-text-secondary">{event.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#111113] p-5 rounded-2xl border border-white/5 flex items-start gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="text-sm text-text-secondary mb-1">Date & Time</h4>
                  <p className="text-white font-semibold">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  <p className="text-white font-semibold">{event.time} Onwards</p>
                </div>
              </div>
              <div className="bg-[#111113] p-5 rounded-2xl border border-white/5 flex items-start gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="text-sm text-text-secondary mb-1">Venue</h4>
                  <p className="text-white font-semibold">{event.venueName}</p>
                  <p className="text-sm text-text-secondary mt-1">{event.venueAddress}, {event.city}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#111113] p-6 sm:p-8 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold text-white mb-6">About The Event</h3>
              <div className="prose prose-invert max-w-none text-text-secondary space-y-4">
                <p>Experience the grand unveiling of the most anticipated movie of the year. The evening will be packed with live musical performances, exclusive interactions with the director and cast, and the worldwide premiere of the theatrical trailer.</p>
                <p>Gates open at 4:00 PM. Please carry a valid ID along with your digital or printed pass. Prohibited items include outside food, large bags, and professional recording equipment.</p>
              </div>

              <h3 className="text-xl font-bold text-white mt-10 mb-6">Event Schedule</h3>
              <div className="space-y-6">
                {[
                  { time: "4:00 PM", title: "Gates Open & Red Carpet Entry" },
                  { time: "5:30 PM", title: "Musical Performances" },
                  { time: "6:45 PM", title: "Cast & Crew Interaction" },
                  { time: "7:30 PM", title: "Trailer Launch" }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-24 text-right shrink-0">
                      <span className="text-gold font-bold">{item.time}</span>
                    </div>
                    <div className="w-px bg-white/10 relative">
                      <div className="absolute top-1.5 -left-1.5 w-3 h-3 bg-[#111113] border-2 border-gold rounded-full" />
                    </div>
                    <div className="pb-6">
                      <span className="text-white font-medium">{item.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar / Ticketing */}
          <div className="lg:col-span-1">
            <div className="bg-[#111113] p-6 rounded-2xl border border-white/5 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Select Passes</h3>
                {Boolean(event.convenienceFeeEnabled && event.convenienceFeeStatus === 'APPROVED') && (
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Transparent Pricing
                  </span>
                )}
              </div>
              
              <div className="space-y-4 mb-6">
                {event.categories.map((cat, idx) => {
                  const isFree = cat.price === 0;
                  const isFeeApproved = Boolean(
                    event.convenienceFeeEnabled &&
                    event.convenienceFeeStatus === 'APPROVED' &&
                    (event.convenienceFeeAmount || 0) > 0
                  );

                  let feeAmountPerTicket = 0;
                  let feeLabel = '';
                  if (!isFree && isFeeApproved) {
                    if (event.convenienceFeeType === 'PERCENTAGE') {
                      feeAmountPerTicket = Math.round((cat.price * (event.convenienceFeeAmount || 0)) / 100);
                      feeLabel = `₹${feeAmountPerTicket} (${event.convenienceFeeAmount}%)`;
                    } else {
                      if (event.convenienceFeeApplication === 'PER_BOOKING') {
                        feeLabel = `+₹${event.convenienceFeeAmount} per booking`;
                      } else {
                        feeAmountPerTicket = event.convenienceFeeAmount || 0;
                        feeLabel = `₹${feeAmountPerTicket} per ticket`;
                      }
                    }
                  }
                  const totalPricePerTicket = cat.price + feeAmountPerTicket;

                  return (
                    <div
                      key={idx}
                      className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-gold/30 transition-all cursor-pointer group"
                      onClick={() => navigate(`/events/${event.id}/checkout?type=${cat.name}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-base font-bold text-white group-hover:text-gold transition-colors">
                            {cat.name}
                          </h4>
                          <p className="text-xs text-text-secondary mt-0.5">
                            Entry via {cat.name.split(' ')[0]} Gate. Access to {cat.name} zone.
                          </p>
                        </div>
                      </div>

                      {/* Transparent Price Breakdown */}
                      <div className="bg-black/40 p-3 rounded-lg border border-white/5 my-3 space-y-1 text-xs">
                        {isFree ? (
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Pass Price:</span>
                            <span className="text-base font-bold text-emerald-400 font-mono">FREE (₹0)</span>
                          </div>
                        ) : isFeeApproved ? (
                          <>
                            <div className="flex justify-between items-center text-white/70">
                              <span>Ticket Price:</span>
                              <span className="font-mono text-white font-semibold">₹{cat.price}</span>
                            </div>
                            <div className="flex justify-between items-center text-white/70">
                              <span>Convenience Fee:</span>
                              <span className="font-mono text-emerald-400 font-medium">+{feeLabel}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1.5 border-t border-white/10 text-white font-bold">
                              <span>Total Price Per Ticket:</span>
                              <span className="font-mono text-gold font-bold text-sm">₹{totalPricePerTicket}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Ticket Price:</span>
                            <span className="text-base font-bold text-gold font-mono">₹{cat.price}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className={cat.availableSeats > 20 ? 'text-emerald-400 flex items-center gap-1 font-mono text-[11px]' : 'text-amber-400 flex items-center gap-1 font-mono text-[11px]'}>
                          <CheckCircle2 className="w-3 h-3" /> {cat.availableSeats} Passes Left
                        </span>
                        <button className="text-white group-hover:text-black group-hover:bg-gold font-bold px-4 py-1.5 bg-white/10 rounded-full transition-all text-xs cursor-pointer">
                          Select Pass
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/10 pt-6">
                <button
                  type="button"
                  onClick={() => setShareModalOpen(true)}
                  className="w-full py-3 bg-white/5 hover:bg-gold hover:text-black border border-white/10 hover:border-gold text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md mb-4"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Event Link</span>
                </button>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                  <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-500/90 leading-relaxed">
                    Digital passes are mandatory for entry. Passes are non-transferable. Valid Government ID may be requested at the gates.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Share Event Modal */}
      <EventShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        event={{
          id: event.id,
          title: event.title,
          city: event.city,
          venueName: event.venueName,
          date: event.date,
          description: event.description,
        }}
      />
    </div>
  );
}
