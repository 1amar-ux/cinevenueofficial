import React, { useState } from "react";
import { Clock, Star, Film, Award } from "lucide-react";
import { SpotlightMovie } from "../types";

interface FeaturedProps {
  onBookMovie: (movieTitle: string, selectedTimeSlot?: string) => void;
  spotlight: SpotlightMovie;
  isMovieBookingSystemActive?: boolean;
}

export default function Featured({ onBookMovie, spotlight, isMovieBookingSystemActive = true }: FeaturedProps) {
  const showtimes = spotlight.showtimes || ["10:30 AM", "1:45 PM", "4:00 PM", "7:30 PM", "10:15 PM"];
  const [selectedShowtime, setSelectedShowtime] = useState("7:30 PM");

  const handleBookClick = () => {
    onBookMovie(spotlight.title, selectedShowtime);
  };

  return (
    <section id="featured" className="bg-dark-surface py-24 px-6 md:px-12 relative overflow-hidden border-y border-white/10">
      {/* Absolute Big Ambient Text */}
      <div className="absolute top-0 right-0 font-display text-[150px] md:text-[220px] font-bold text-transparent select-none pointer-events-none leading-none opacity-5 tracking-widest translate-x-12 -translate-y-8" style={{ WebkitTextStroke: "1.5px #D4AF37" }}>
        FEATURED
      </div>

      <div className="max-w-7xl mx-auto">
        <span className="text-[10px] uppercase tracking-[0.4em] text-gold block mb-12 font-semibold">
          Editor's Spotlight
        </span>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Poster Section with Shine Animations */}
          <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-2xl shadow-black/80 max-w-lg mx-auto w-full group">
            <img
              src={spotlight.image}
              alt={`Spotlight Movie: ${spotlight.title}`}
              className="w-full h-full object-cover brightness-95 group-hover:scale-101 transition-transform duration-500"
            />
            {/* Ambient gold glow card borders */}
            <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none" />
            
            {/* Diagonal shimmer shine effect */}
            <div className="absolute top-0 -left-full w-3/5 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-[shimmer_5s_infinite_linear]" 
              style={{
                animation: "shine 4s ease-in-out infinite"
              }}
            />
          </div>

          {/* Details Section */}
          <div className="text-left flex flex-col items-start">
            <div className="inline-flex items-center gap-2.5 bg-white/[0.03] border border-white/10 text-gold text-[10px] font-semibold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <Award className="w-3.5 h-3.5 text-gold" />
              Editor's Choice Award
            </div>

            <h2 className="font-display text-4xl sm:text-5xl md:text-6.5xl font-light text-text-primary leading-[1.1] mb-6 italic">
              {spotlight.title}
            </h2>

            {/* Movie Stats Row */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 items-center text-xs text-text-secondary mb-6 border-b border-white/10 pb-6 w-full">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gold" />
                <span>{spotlight.duration}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-gold fill-gold stroke-none" />
                <span className="font-bold text-text-primary">{spotlight.rating}</span>
                <span className="text-text-muted">/ 10 Rating</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
              <div>{spotlight.genre}</div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
              <div className="text-gold font-semibold">UA Certified • English</div>
            </div>

            {/* Stellar Stars review row */}
            <div className="flex gap-1 mb-6 text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-gold stroke-none" />
              ))}
            </div>

            <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-8">
              {spotlight.description}
            </p>

            {/* Showtime selectors */}
            <div className="w-full pt-6 border-t border-white/10">
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-[0.2em] block mb-4">
                Available Showtimes Today
              </span>
              <div className="flex flex-wrap gap-3">
                {showtimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedShowtime(time)}
                    className={`px-4.5 py-2.5 rounded text-xs font-semibold cursor-pointer border transition-all ${
                      selectedShowtime === time
                        ? "bg-white/[0.05] border-gold text-gold"
                        : "bg-white/[0.02] border-white/10 text-text-secondary hover:border-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>

              <button
                disabled={!isMovieBookingSystemActive}
                onClick={isMovieBookingSystemActive ? handleBookClick : undefined}
                className={`mt-8 px-10 py-4 rounded-sm text-xs font-bold tracking-[0.2em] uppercase transition-all duration-200 shadow-xl ${
                  isMovieBookingSystemActive
                    ? "bg-gold hover:bg-gold-light text-black cursor-pointer shadow-gold/10"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-not-allowed opacity-60 pointer-events-none"
                }`}
              >
                {isMovieBookingSystemActive ? `Book Seats for ${selectedShowtime}` : "Booking OFF"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
