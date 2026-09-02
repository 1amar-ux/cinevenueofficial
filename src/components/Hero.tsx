import React, { useState, useEffect } from "react";
import { Search, Calendar, Clock, MapPin, Film, Sparkles } from "lucide-react";
import { CITIES } from "../data";

import { Advertisement } from "../types";

interface HeroProps {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  onSearch: (city: string, date: string, timeSlot: string) => void;
  cities?: string[];
  advertisements?: Advertisement[];
  onRecordAdImpression?: (adId: string) => void;
  onRecordAdClick?: (adId: string) => void;
}

export default function Hero({ 
  selectedCity, 
  setSelectedCity, 
  onSearch, 
  cities = CITIES,
  advertisements = [],
  onRecordAdImpression,
  onRecordAdClick
}: HeroProps) {
  const [cityVal, setCityVal] = useState(selectedCity);
  const [dateVal, setDateVal] = useState("2026-07-01");
  const [timeSlotVal, setTimeSlotVal] = useState("evening");
  const [particles, setParticles] = useState<{ id: number; left: number; top: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    // Sync external city change to internal select input
    setCityVal(selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    // Generate floating particle variables
    const temp = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 8,
    }));
    setParticles(temp);
  }, []);

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedCity(cityVal);
    onSearch(cityVal, dateVal, timeSlotVal);
    
    // Smooth scroll to movies
    const element = document.getElementById("movies");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-dark-bg text-text-primary pt-24 pb-12">
      {/* Background with custom movie theater image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&q=60"
          alt="Cinema background"
          className="w-full h-full object-cover opacity-15 filter saturate-50 brightness-75 scale-105"
        />
        {/* Cinematic gradient vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-dark-bg via-dark-bg/85 to-dark-card/90" />
      </div>

      {/* Floating Sparkle Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-1">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-start">
        {/* Premium badge */}
        <div className="inline-flex items-center gap-2.5 bg-white/[0.03] border border-white/10 text-gold text-[10px] font-semibold tracking-[0.3em] uppercase px-5 py-2 rounded-full mb-8 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          Live Theatre Connection
        </div>

        {/* Display Typography Header */}
        <h1 className="font-display text-5xl sm:text-7xl md:text-[88px] leading-[0.95] font-light mb-6 select-none italic text-text-primary">
          The Architecture <br />
          <span className="not-italic text-gold font-normal">of Cinema.</span>
        </h1>

        <p className="font-display text-lg sm:text-xl md:text-2xl text-text-secondary font-light italic tracking-wider mb-8">
          Book seats. Rent the screen. Own the night.
        </p>

        <p className="text-sm md:text-base text-text-secondary max-w-lg leading-relaxed mb-12">
          Experience world-class films the way they were meant to be seen. Immersive acoustic screens, custom chef catering, and premium fully-reclining private screens for customized entertainment.
        </p>

        {/* Interactive Filter Booking Bar */}
        <form
          onSubmit={handleSearchClick}
          className="w-full max-w-4xl bg-dark-card/85 backdrop-blur-md border border-dark-border p-5 rounded-2xl flex flex-col md:flex-row gap-6 items-center shadow-2xl shadow-black/80"
        >
          {/* Location field */}
          <div className="flex-1 w-full text-left">
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              Venue Location
            </label>
            <select
              value={cityVal}
              onChange={(e) => setCityVal(e.target.value)}
              className="w-full bg-transparent border-none text-text-primary font-sans text-sm font-semibold focus:outline-none cursor-pointer"
            >
              {cities.map((city) => (
                <option key={city} value={city} className="bg-dark-card">
                  {city === "All Cities" ? "All Cities (Default)" : city}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:block w-[1px] h-10 bg-dark-border" />

          {/* Date Picker */}
          <div className="flex-1 w-full text-left">
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gold" />
              Select Date
            </label>
            <input
              type="date"
              value={dateVal}
              onChange={(e) => setDateVal(e.target.value)}
              className="w-full bg-transparent border-none text-text-primary font-sans text-sm font-semibold focus:outline-none cursor-pointer color-scheme-dark"
              min="2026-07-01"
            />
          </div>

          <div className="hidden md:block w-[1px] h-10 bg-dark-border" />

          {/* Time Slot field */}
          <div className="flex-1 w-full text-left">
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gold" />
              Available Session
            </label>
            <select
              value={timeSlotVal}
              onChange={(e) => setTimeSlotVal(e.target.value)}
              className="w-full bg-transparent border-none text-text-primary font-sans text-sm font-semibold focus:outline-none cursor-pointer"
            >
              <option value="morning" className="bg-dark-card">Morning (10 AM - 1 PM)</option>
              <option value="afternoon" className="bg-dark-card">Afternoon (1 PM - 5 PM)</option>
              <option value="evening" className="bg-dark-card">Evening (5 PM - 9 PM)</option>
              <option value="night" className="bg-dark-card">Night (9 PM Onwards)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto bg-gold hover:bg-gold-light text-dark-bg px-8 py-3.5 rounded-lg text-xs font-bold tracking-widest uppercase cursor-pointer transition-all duration-200 shadow-lg shadow-gold/20 flex items-center justify-center gap-2 whitespace-nowrap self-stretch md:self-auto"
          >
            <Search className="w-4 h-4 text-dark-bg stroke-[2.5]" />
            Search Showtimes
          </button>
        </form>

        {/* Active Hero Banner Advertisements */}
        {(() => {
          const activeHeroAds = advertisements.filter(a => a.type === "hero_slider" && a.status === "Active");
          if (activeHeroAds.length === 0) return null;

          return (
            <div className="w-full max-w-4xl mt-8">
              {activeHeroAds.map((ad) => {
                // Record impression when ad is mounted
                if (onRecordAdImpression) {
                  setTimeout(() => onRecordAdImpression(ad.id), 100);
                }
                return (
                  <div
                    key={ad.id}
                    onClick={() => {
                      if (onRecordAdClick) onRecordAdClick(ad.id);
                      if (ad.targetUrl) {
                        if (ad.targetUrl.startsWith("#")) {
                          const el = document.querySelector(ad.targetUrl);
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        } else {
                          window.open(ad.targetUrl, "_blank");
                        }
                      }
                    }}
                    className="group relative overflow-hidden rounded-2xl border border-gold/30 bg-[#0F0F11] cursor-pointer shadow-xl hover:border-gold transition-all duration-300"
                  >
                    <img 
                      src={ad.imageUrl} 
                      alt={ad.title} 
                      className="w-full h-36 md:h-44 object-cover filter brightness-75 group-hover:scale-105 group-hover:brightness-90 transition-all duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 flex flex-col justify-end">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-gold text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                          SPONSORED SPOTLIGHT
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-gold transition-colors">
                        {ad.title}
                      </h3>
                      <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                        Click to explore campaign details →
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Dynamic Stats Row */}
        <div className="flex flex-wrap gap-12 md:gap-20 mt-16 pt-10 border-t border-white/10 w-full">
          <div>
            <div className="font-display text-4xl font-light text-text-primary leading-none">
              240<span className="text-gold font-light">+</span>
            </div>
            <div className="text-[9px] font-medium text-text-secondary tracking-[0.2em] uppercase mt-2">Movies This Month</div>
          </div>
          <div>
            <div className="font-display text-4xl font-light text-text-primary leading-none">
              18<span className="text-gold font-light">+</span>
            </div>
            <div className="text-[9px] font-medium text-text-secondary tracking-[0.2em] uppercase mt-2">Premium Venues</div>
          </div>
          <div>
            <div className="font-display text-4xl font-light text-text-primary leading-none">
              50k<span className="text-gold font-light">+</span>
            </div>
            <div className="text-[9px] font-medium text-text-secondary tracking-[0.2em] uppercase mt-2">Happy Guests</div>
          </div>
        </div>
      </div>

      {/* Aesthetic Scroll helper indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted text-[10px] font-bold tracking-[0.15em] uppercase pointer-events-none select-none" style={{ animation: "bob 2.5s ease-in-out infinite" }}>
        <div className="w-[1px] h-10 bg-gradient-to-b from-gold via-gold/30 to-transparent" />
        <span>Scroll</span>
      </div>
    </section>
  );
}
