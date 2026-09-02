import React, { useState } from "react";
import { Search, Star, Film, Eye } from "lucide-react";
import { Movie, Advertisement } from "../types";

interface NowShowingProps {
  movies: Movie[];
  selectedCity?: string;
  onBookMovie: (movieTitle: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isMovieBookingSystemActive?: boolean;
  onToggleMovieBookingSystemActive?: (active: boolean) => void;
  onToggleMovieActive?: (movieTitle: string) => void;
  advertisements?: Advertisement[];
  onRecordAdImpression?: (adId: string) => void;
  onRecordAdClick?: (adId: string) => void;
}

export default function NowShowing({ 
  movies,
  selectedCity = "All Cities", 
  onBookMovie, 
  searchQuery, 
  setSearchQuery,
  isMovieBookingSystemActive = true,
  onToggleMovieBookingSystemActive,
  onToggleMovieActive,
  advertisements = [],
  onRecordAdImpression,
  onRecordAdClick,
}: NowShowingProps) {
  const [activeTab, setActiveTab] = useState<string>("all");

  // Filter movies logic: If movie is inactive or system is inactive, hide it from customer list
  const filteredMovies = movies.filter((movie) => {
    const isMovieActive = movie.isActive !== false && isMovieBookingSystemActive;
    if (!isMovieActive) {
      return false; // Disabled posters are not visible to customers
    }

    // Language Tab Filter
    const matchesTab = activeTab === "all" || movie.langKey === activeTab;
    // Search Text Filter
    const matchesSearch =
      (movie.title || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (movie.genre || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (movie.lang || "").toLowerCase().includes((searchQuery || "").toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <section id="movies" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Search Bar Container */}
      <div className="mb-10 w-full bg-dark-surface/80 border border-dark-border p-4 rounded-xl flex flex-col lg:flex-row items-center justify-between gap-4 shadow-lg shadow-black/35">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 px-3 py-1 bg-dark-card/55 rounded-md border border-dark-border/60 text-xs font-semibold uppercase text-text-muted select-none">
            <Film className="w-4 h-4 text-gold" />
            Filter & Browse
          </div>
        </div>

        <div className="relative flex-1 w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search movies, genres, languages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-card border border-dark-border/80 focus:border-gold/50 rounded-lg pl-11 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Main Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold block mb-3 font-semibold">
            Now Showing
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight text-text-primary italic">
            In <span className="text-gold not-italic font-normal">Theatres</span> Now
          </h2>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1 border-b border-white/10">
          {["all", "hindi", "english", "telugu"].map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveTab(lang)}
              className={`px-5 py-3 text-xs font-semibold tracking-[0.15em] uppercase transition-all relative cursor-pointer ${
                activeTab === lang
                  ? "text-gold border-b-2 border-gold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white/[0.02] border border-white/10 rounded-2xl max-w-2xl mx-auto backdrop-blur-sm">
          <p className="text-text-primary font-bold mb-2 text-base">No movies available.</p>
          <p className="text-text-secondary text-xs max-w-md mx-auto leading-relaxed">
            Try selecting a different language tab or clearing your search filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie, idx) => {
            const isMovieActive = movie.isActive !== false && isMovieBookingSystemActive;

            return (
              <div
                key={movie.title + idx}
                className="group bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden hover:border-gold hover:-translate-y-1.5 transition-all duration-300 backdrop-blur-sm shadow-xl flex flex-col h-full relative"
              >
                {/* Poster Container */}
                <div className="relative aspect-[2/3] overflow-hidden bg-dark-card2">
                  <img
                    src={movie.img}
                    alt={movie.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-dark-bg/85 border border-gold/40 text-gold text-xs font-bold px-2 py-0.5 rounded backdrop-blur-md flex items-center gap-1 shadow z-10">
                    <Star className="w-3.5 h-3.5 fill-gold stroke-none" />
                    {movie.rating}
                  </div>

                  {/* Cover Overlay & Book Button on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/95 via-dark-bg/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <button
                      disabled={!isMovieActive}
                      onClick={isMovieActive ? () => onBookMovie(movie.title) : undefined}
                      className={`text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-lg shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 ${
                        isMovieActive
                          ? "bg-gold hover:bg-gold-light text-dark-bg shadow-gold/20 cursor-pointer"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-not-allowed opacity-60 pointer-events-none"
                      }`}
                    >
                      <Eye className="w-4 h-4 stroke-[2.5]" />
                      <span>{isMovieActive ? "Book Seats" : "Booking OFF"}</span>
                    </button>
                  </div>
                </div>

                {/* Info Block */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-display text-xl font-bold text-text-primary tracking-wide mb-1.5 group-hover:text-gold transition-colors line-clamp-1">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-text-muted mb-4">
                    <span>2h 10m</span>
                    <span>•</span>
                    <span>{movie.genre}</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gold tracking-widest uppercase border border-gold-dim/40 px-2.5 py-1 rounded bg-gold-glow">
                      {movie.lang}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider font-mono ${isMovieActive ? "text-emerald-400" : "text-rose-400"}`}>
                      {isMovieActive ? "● BOOKING ON" : "● BOOKING OFF"}
                    </span>
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

