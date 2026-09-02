import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import EventsNavbar from "../../components/events/EventsNavbar";
import { Calendar, MapPin, Share2, Users, Clock, Info, CheckCircle2 } from "lucide-react";
import { Event } from "../../types";

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from /api/events/:id
    const mockEvent: Event = {
      id: "evt_1",
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

    setTimeout(() => {
      setEvent(mockEvent);
      setLoading(false);
    }, 500);
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
              <h3 className="text-xl font-bold text-white mb-6">Select Passes</h3>
              
              <div className="space-y-4 mb-6">
                {event.categories.map((cat, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-gold/30 transition-colors cursor-pointer" onClick={() => navigate(`/events/${event.id}/checkout?type=${cat.name}`)}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold text-white">{cat.name}</h4>
                      <span className="text-xl font-bold text-gold">{cat.price === 0 ? 'FREE' : `₹${cat.price}`}</span>
                    </div>
                    <p className="text-sm text-text-secondary mb-3">Entry via {cat.name.split(' ')[0]} Gate. Access to {cat.name} zone.</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className={cat.availableSeats > 20 ? 'text-emerald-400 flex items-center gap-1' : 'text-amber-400 flex items-center gap-1'}>
                        <CheckCircle2 className="w-3 h-3" /> {cat.availableSeats} Passes Left
                      </span>
                      <button className="text-white font-semibold px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors">Select</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6">
                <button className="w-full flex items-center justify-center gap-2 text-text-secondary hover:text-white transition-colors mb-4">
                  <Share2 className="w-4 h-4" /> Share Event
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
    </div>
  );
}
