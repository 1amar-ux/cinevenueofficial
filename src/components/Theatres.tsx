import React, { useState } from "react";
import { Star, ShieldAlert, Heart, MapPin, Sparkles, Search, X, Navigation } from "lucide-react";
import { Theatre } from "../types";
import { getCoordinates, calculateDistance } from "../lib/location";

interface TheatresProps {
  theatres: Theatre[];
  selectedCity: string;
  searchQuery: string;
  onSelectTheatre: (theatreName: string) => void;
}

export default function Theatres({ theatres, selectedCity, searchQuery, onSelectTheatre }: TheatresProps) {
  const [localLocationSearch, setLocalLocationSearch] = useState("");

  // Filter venues by selected city and search queries
  const filteredTheatres = theatres.filter((theatre) => {
    const matchesCity = selectedCity === "All Cities" || 
      (theatre.city || "").toLowerCase() === (selectedCity || "").toLowerCase() ||
      (theatre.location || "").toLowerCase().includes((selectedCity || "").toLowerCase());
    
    const matchesGlobalSearch = !searchQuery || 
      (theatre.name || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (theatre.location || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (theatre.features || []).some(f => (f || "").toLowerCase().includes((searchQuery || "").toLowerCase()));
    
    const matchesLocalLocation = !localLocationSearch ||
      (theatre.location || "").toLowerCase().includes(localLocationSearch.toLowerCase()) ||
      (theatre.name || "").toLowerCase().includes(localLocationSearch.toLowerCase());

    return matchesCity && matchesGlobalSearch && matchesLocalLocation;
  });

  return (
    <section id="theatres" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold block mb-3 font-semibold">
            Our Venues
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight text-text-primary italic">
            Premium <span className="text-gold not-italic font-normal">Theatres</span> in {selectedCity}
          </h2>
          <p className="text-xs text-text-secondary mt-2 max-w-lg">
            Experience absolute luxury at our verified state-of-the-art partner screens, customizable layouts, and premium sound systems.
          </p>
        </div>

        {/* Location & Places Search input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/[0.02] p-3 rounded-xl border border-white/10 backdrop-blur-md">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold w-4 h-4" />
            <input
              type="text"
              placeholder="Search by place or location..."
              value={localLocationSearch}
              onChange={(e) => setLocalLocationSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/5 hover:border-white/15 focus:border-gold rounded-lg pl-10 pr-9 py-2 text-xs text-text-primary focus:outline-none transition-all duration-200"
            />
            {localLocationSearch && (
              <button
                onClick={() => setLocalLocationSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-gold cursor-pointer transition-colors"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="text-[10px] text-text-secondary font-semibold tracking-[0.15em] uppercase px-2 py-1 bg-white/5 rounded text-center self-center sm:self-auto">
            {filteredTheatres.length} Found
          </div>
        </div>
      </div>

      {/* Theatres Grid */}
      {filteredTheatres.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] border border-white/10 rounded-2xl max-w-xl mx-auto backdrop-blur-sm">
          <p className="text-text-secondary font-medium mb-2">No screens currently listed for {selectedCity}.</p>
          <p className="text-text-muted text-xs">Choose another city from the selector dropdown at the top.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTheatres.map((theatre) => {
            const cityCoords = getCoordinates(selectedCity);
            const distance = theatre.latitude && theatre.longitude && cityCoords
              ? calculateDistance(cityCoords.lat, cityCoords.lng, theatre.latitude, theatre.longitude).toFixed(1)
              : null;
            return (
            <div
              key={theatre.id}
              onClick={() => onSelectTheatre(theatre.name)}
              className="group bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden hover:border-gold hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm shadow-xl cursor-pointer flex flex-col h-full"
            >
              {/* Image Container */}
              <div className="relative h-44 overflow-hidden bg-dark-card2">
                <img
                  src={theatre.img}
                  alt={theatre.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                {/* Location absolute badge */}
                <div className="absolute top-3 left-3 bg-[#0A0A0B]/85 border border-white/10 text-text-secondary text-xs px-2.5 py-1 rounded backdrop-blur-md flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                  <span>{theatre.location.split("·")[0].trim()}</span>
                </div>
              </div>

              {/* Theatre details body */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-display text-xl font-bold text-text-primary tracking-wide mb-1.5 group-hover:text-gold transition-colors">
                  {theatre.name}
                </h3>
                
                <p className="text-xs text-text-secondary font-medium mb-4 flex items-center gap-1">
                  📍 {theatre.location}
                </p>

                {/* Facilities/Features pill row */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {theatre.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-[9px] font-semibold text-text-secondary border border-white/10 px-2.5 py-1 rounded uppercase tracking-[0.1em]"
                    >
                      {feature}
                    </span>
                  ))}

                </div>

                {/* Footer and Price label */}
                <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-auto">
                  <div>
                    <div className="font-display text-sm font-semibold text-gold leading-none uppercase tracking-wider">
                      Price on Request
                    </div>
                    <div className="text-[10px] text-text-secondary font-semibold tracking-wider uppercase mt-1">
                      Enquire to book
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-gold font-semibold tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                    Available Today
                  </div>
                </div>
              </div>
            </div>
          );
          })}

        </div>
      )}
    </section>
  );
}
