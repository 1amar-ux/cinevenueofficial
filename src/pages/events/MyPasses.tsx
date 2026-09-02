import React from "react";
import { Link } from "react-router-dom";
import EventsNavbar from "../../components/events/EventsNavbar";
import { Ticket, Calendar, MapPin, QrCode } from "lucide-react";

export default function MyPasses() {
  const passes = [
    {
      id: "CV-EVT-849201",
      event: "Pushpa 2 Pre-Release Event",
      type: "VIP Pass",
      date: "2026-10-15",
      time: "17:00",
      venue: "Hyderabad Convention Centre",
      status: "VALID"
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090A]">
      <EventsNavbar />
      <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8 font-display">My Digital Passes</h1>
        
        {passes.length === 0 ? (
          <div className="text-center py-20 bg-[#111113] rounded-2xl border border-white/5">
            <Ticket className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Passes Found</h2>
            <p className="text-text-secondary mb-6">You haven't registered for any upcoming events yet.</p>
            <Link to="/events" className="text-gold hover:text-white transition-colors font-semibold">Explore Events</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {passes.map(pass => (
              <div key={pass.id} className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden flex flex-col group hover:border-gold/30 transition-all">
                <div className="bg-white/5 p-6 border-b border-white/5 flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-gold uppercase tracking-wider mb-2 block">{pass.type}</span>
                    <h3 className="text-lg font-bold text-white line-clamp-1">{pass.event}</h3>
                  </div>
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col space-y-4">
                  <div className="flex items-center text-sm text-text-secondary gap-3">
                    <Calendar className="w-4 h-4 text-white/50" />
                    <span>{new Date(pass.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {pass.time}</span>
                  </div>
                  <div className="flex items-start text-sm text-text-secondary gap-3">
                    <MapPin className="w-4 h-4 text-white/50 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{pass.venue}</span>
                  </div>
                  
                  <div className="mt-auto pt-6">
                    <Link to={`/events/pass/${pass.id}`} className="w-full block text-center bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-colors">
                      View Pass
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
