import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EventsNavbar from "../../components/events/EventsNavbar";
import { Calendar, MapPin, Tag, ChevronRight, Ticket, Filter, Search } from "lucide-react";
import { Event } from "../../types";

export default function EventsHome() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from /api/events
    const mockEvents: Event[] = [
      {
        id: "evt_1",
        title: "Pushpa 2 Pre-Release Event",
        description: "Join the massive pre-release event of Pushpa 2: The Rule.",
        venueName: "Hyderabad Convention Centre",
        venueAddress: "HITEC City",
        city: "Hyderabad",
        date: "2026-10-15",
        time: "17:00",
        image: "https://images.unsplash.com/photo-1540039155732-6762b51333fc?auto=format&fit=crop&q=80&w=1200",
        categories: [{ name: "VIP", price: 5000, availableSeats: 100 }, { name: "General", price: 500, availableSeats: 1000 }],
        reviews: [],
        featured: true,
        isPaid: true,
        isActive: true
      },
      {
        id: "evt_2",
        title: "Symphony Under The Stars",
        description: "A beautiful evening of classical music.",
        venueName: "Open Air Theatre",
        venueAddress: "Central Park",
        city: "Mumbai",
        date: "2026-11-02",
        time: "19:00",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200",
        categories: [{ name: "Standard", price: 1500, availableSeats: 500 }],
        reviews: [],
        featured: false,
        isPaid: true,
        isActive: true
      },
      {
        id: "evt_3",
        title: "Tech Innovators Conference 2026",
        description: "Annual gathering of tech leaders and startups.",
        venueName: "Tech Hub",
        venueAddress: "Silicon Valley",
        city: "Bengaluru",
        date: "2026-09-20",
        time: "09:00",
        image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1200",
        categories: [{ name: "Entry", price: 0, availableSeats: 2000 }],
        reviews: [],
        featured: false,
        isPaid: false,
        isActive: true
      }
    ];

    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090A]">
      <EventsNavbar />
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-[#09090A]/80 to-[#09090A]" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight text-white mb-6">
            Discover Extraordinary <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-amber-500">Experiences</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10">
            Book tickets to exclusive movie pre-release events, concerts, workshops, and more.
          </p>

          <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-2 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center px-4 py-2">
              <Search className="w-5 h-5 text-text-secondary mr-3" />
              <input 
                type="text" 
                placeholder="Search events, movies, artists..." 
                className="bg-transparent border-none outline-none text-white w-full placeholder-text-secondary/70"
              />
            </div>
            <div className="hidden sm:block w-px h-8 bg-white/10 self-center" />
            <div className="flex-1 flex items-center px-4 py-2">
              <MapPin className="w-5 h-5 text-text-secondary mr-3" />
              <input 
                type="text" 
                placeholder="City or Location" 
                className="bg-transparent border-none outline-none text-white w-full placeholder-text-secondary/70"
              />
            </div>
            <button className="bg-gold text-black px-8 py-3 rounded-full font-bold hover:bg-gold/90 transition-colors w-full sm:w-auto">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Featured Events Slider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 font-display">Featured Events</h2>
            <p className="text-text-secondary">Handpicked premium experiences</p>
          </div>
          <button className="hidden md:flex items-center text-gold hover:text-white transition-colors font-semibold text-sm uppercase tracking-wider">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.filter(e => e.featured).map(event => (
              <Link key={event.id} to={`/events/${event.id}`} className="group relative block overflow-hidden rounded-2xl border border-white/10 aspect-[4/3]">
                <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                <div className="absolute top-4 left-4">
                  <span className="bg-gold text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">Featured</span>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{event.title}</h3>
                  <div className="flex items-center text-sm text-text-secondary mb-3 gap-4">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.city}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gold font-semibold">{event.isPaid ? `From ₹${Math.min(...event.categories.map(c => c.price))}` : 'Free Entry'}</span>
                    <button className="opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all text-white bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Categories & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white font-display">Upcoming Events</h2>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {['All', 'Movies', 'Concerts', 'Corporate', 'Free'].map((cat, idx) => (
              <button key={cat} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${idx === 0 ? 'bg-white text-black' : 'bg-white/5 text-text-secondary hover:text-white border border-white/10'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map(event => (
            <Link key={event.id} to={`/events/${event.id}`} className="group bg-[#111113] rounded-2xl border border-white/5 overflow-hidden hover:border-gold/30 transition-colors flex flex-col h-full">
              <div className="relative aspect-video overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-semibold text-white border border-white/10">
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-gold transition-colors">{event.title}</h3>
                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center text-sm text-text-secondary gap-2">
                    <MapPin className="w-4 h-4" /> <span className="line-clamp-1">{event.venueName}, {event.city}</span>
                  </div>
                  <div className="flex items-center text-sm text-text-secondary gap-2">
                    <Calendar className="w-4 h-4" /> <span>{event.time}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center mt-auto">
                  <span className="font-bold text-white text-lg">
                    {event.isPaid ? `₹${Math.min(...event.categories.map(c => c.price))}` : 'FREE'}
                  </span>
                  <button className="text-gold text-sm font-semibold uppercase tracking-wider hover:text-amber-400 transition-colors">
                    Get Tickets
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
