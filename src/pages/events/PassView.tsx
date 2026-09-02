import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { QrCode, Download, Share2, MapPin, Calendar, CheckCircle2 } from "lucide-react";

export default function PassView() {
  const { passId } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090A] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090A] flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-sm relative">
        <Link to="/events/my-passes" className="absolute -top-12 left-0 text-text-secondary hover:text-white transition-colors text-sm font-semibold uppercase tracking-wider">
          ← Back
        </Link>
        
        {/* Ticket Top */}
        <div className="bg-white rounded-t-3xl overflow-hidden relative shadow-2xl">
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white z-10 border border-white/20">
            VIP PASS
          </div>
          <img src="https://images.unsplash.com/photo-1540039155732-6762b51333fc?auto=format&fit=crop&q=80&w=800" alt="Banner" className="w-full h-40 object-cover" />
          <div className="p-6 text-black">
            <h2 className="text-xl font-bold mb-1 leading-tight text-gray-900">Pushpa 2 Pre-Release Event</h2>
            <p className="text-sm text-gray-500 mb-6 uppercase tracking-wider font-semibold">Movie Launch</p>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-900">15 October 2026</p>
                  <p className="text-xs text-gray-500">Entry: 5:00 PM</p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Hyderabad Convention Centre</p>
                  <p className="text-xs text-gray-500">HITEC City</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Divider */}
        <div className="flex w-full items-center">
          <div className="w-6 h-6 bg-[#09090A] rounded-full -ml-3 z-10" />
          <div className="flex-1 border-t-2 border-dashed border-gray-300" />
          <div className="w-6 h-6 bg-[#09090A] rounded-full -mr-3 z-10" />
        </div>

        {/* Ticket Bottom */}
        <div className="bg-white rounded-b-3xl p-6 flex flex-col items-center shadow-2xl relative">
          <p className="text-sm font-semibold text-gray-500 mb-2">{passId}</p>
          <div className="w-48 h-48 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-4">
            {/* Mock QR */}
            <QrCode className="w-40 h-40 text-black" strokeWidth={1} />
          </div>
          <div className="flex items-center gap-1 text-emerald-600 font-semibold text-sm mb-6">
            <CheckCircle2 className="w-4 h-4" /> Valid for Entry
          </div>
          
          <div className="flex w-full gap-2">
            <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> PDF
            </button>
            <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-xs text-text-muted">Powered by CineVenue Events</p>
        </div>
      </div>
    </div>
  );
}
