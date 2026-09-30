import React, { useState } from "react";
import { Search, Star, Film, Eye, Play, Sparkles, Calendar, Clapperboard } from "lucide-react";
import { Movie, MovieVideo, Advertisement } from "../types";
import { getActiveMovieVideos, deriveMovieReleaseStatus } from "../utils/movieAvailability";
import EmptyState from "./common/EmptyState";
import YouTubePlayerModal from "./video/YouTubePlayerModal";

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
  const [activeCategory, setActiveCategory] = useState<"ALL" | "NOW_SHOWING" | "COMING_SOON">("ALL");
  const [selectedGenre, setSelectedGenre] = useState<string>("ALL");

  // YouTube player modal state
  const [activeVideoModal, setActiveVideoModal] = useState<{
    video: MovieVideo;
    movieTitle: string;
  } | null>(null);

  // Extract unique genres
  const availableGenres = Array.from(
    new Set(
      movies
        .map((m) => m.genre)
        .filter(Boolean)
        .flatMap((g) => g.split(/[•,\/]/).map((s) => s.trim()))
    )
  );

  // Filter movies logic
  const filteredMovies = movies.filter((movie) => {
    const isMovieActive = movie.isActive !== false && isMovieBookingSystemActive;
    if (!isMovieActive) {
      return false;
    }

    const releaseStatus = deriveMovieReleaseStatus(movie);

    // Category filter
    if (activeCategory === "NOW_SHOWING" && releaseStatus !== "NOW_SHOWING") {
      return false;
    }
    if (activeCategory === "COMING_SOON" && releaseStatus !== "UPCOMING" && releaseStatus !== "COMING_SOON") {
      return false;
    }

    // Genre filter
    if (selectedGenre !== "ALL" && !movie.genre?.toLowerCase().includes(selectedGenre.toLowerCase())) {
      return false;
    }

    // Language Tab Filter
    const matchesTab = activeTab === "all" || movie.langKey === activeTab || (movie.lang || "").toLowerCase() === activeTab.toLowerCase();

    // Search Text Filter
    const matchesSearch =
      (movie.title || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (movie.genre || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (movie.lang || "").toLowerCase().includes((searchQuery || "").toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <section id="movies" className="py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-10">
      {/* Search & Filter Bar Container */}
      <div className="w-full bg-[#121213]/90 border border-white/10 p-4 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4 shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 rounded-xl border border-gold/20 text-xs font-semibold uppercase text-gold select-none">
            <Clapperboard className="w-4 h-4 text-gold" />
            <span>{selectedCity} Cinematic Hub</span>
          </div>

          {/* Category Switcher */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer border-0 ${
                activeCategory === "ALL" ? "bg-gold text-black shadow-md" : "text-text-muted hover:text-white bg-transparent"
              }`}
            >
              All Films
            </button>
            <button
              onClick={() => setActiveCategory("NOW_SHOWING")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer border-0 ${
                activeCategory === "NOW_SHOWING" ? "bg-gold text-black shadow-md" : "text-text-muted hover:text-white bg-transparent"
              }`}
            >
              In Theatres
            </button>
            <button
              onClick={() => setActiveCategory("COMING_SOON")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer border-0 ${
                activeCategory === "COMING_SOON" ? "bg-gold text-black shadow-md" : "text-text-muted hover:text-white bg-transparent"
              }`}
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search films, languages, or genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-white/10 focus:border-gold/60 rounded-xl pl-11 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Main Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold block mb-2 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Screenings in {selectedCity}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-light tracking-tight text-white italic">
            Now <span className="text-gold not-italic font-normal">Showing</span> & Pre-Releases
          </h2>
        </div>

        {/* Language Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
          {["all", "telugu", "hindi", "english", "tamil"].map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveTab(lang)}
              className={`px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer border-0 ${
                activeTab === lang
                  ? "bg-gold text-black shadow-lg shadow-gold/10"
                  : "text-text-muted hover:text-white bg-transparent"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Genre Chips */}
      {availableGenres.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedGenre("ALL")}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer border ${
              selectedGenre === "ALL"
                ? "bg-white/10 text-gold border-gold/40"
                : "bg-transparent text-text-muted border-white/10 hover:text-white"
            }`}
          >
            All Genres
          </button>
          {availableGenres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer border ${
                selectedGenre.toLowerCase() === g.toLowerCase()
                  ? "bg-white/10 text-gold border-gold/40"
                  : "bg-transparent text-text-muted border-white/10 hover:text-white"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Movies Grid / Empty State */}
      {filteredMovies.length === 0 ? (
        <EmptyState
          icon="film"
          title={`No Movies Found for ${selectedCity}`}
          subtitle="There are currently no scheduled screenings matching your filter criteria. Try adjusting your language tab or switching to All Cities."
          actionText="Clear Filters"
          onAction={() => {
            setActiveTab("all");
            setActiveCategory("ALL");
            setSelectedGenre("ALL");
            setSearchQuery("");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie, idx) => {
            const isMovieActive = movie.isActive !== false && isMovieBookingSystemActive;
            const releaseStatus = deriveMovieReleaseStatus(movie);
            const activeVideos = getActiveMovieVideos(movie);
            const primaryTrailer = activeVideos.find((v) => v.type === "TRAILER") || activeVideos[0];

            return (
              <div
                key={movie.title + idx}
                className="group bg-[#121213]/80 border border-white/10 rounded-2xl overflow-hidden hover:border-gold/60 hover:-translate-y-1.5 transition-all duration-300 backdrop-blur-md shadow-2xl flex flex-col h-full relative"
              >
                {/* Poster Container with 2:3 Aspect Ratio */}
                <div className="relative aspect-[2/3] overflow-hidden bg-black/60">
                  <img
                    src={movie.poster || movie.img}
                    alt={movie.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Rating Badge */}
                  {movie.rating && (
                    <div className="absolute top-3 right-3 bg-black/80 border border-gold/40 text-gold text-xs font-bold px-2 py-0.5 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-lg z-10">
                      <Star className="w-3.5 h-3.5 fill-gold stroke-none" />
                      {movie.rating}
                    </div>
                  )}

                  {/* Release Status / Advance Booking Tag */}
                  {releaseStatus === "UPCOMING" && (
                    <div className="absolute top-3 left-3 bg-indigo-500/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg shadow-lg z-10 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Coming Soon
                    </div>
                  )}

                  {/* Small Trailer Badge if movie has active videos */}
                  {primaryTrailer && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveVideoModal({
                          video: primaryTrailer,
                          movieTitle: movie.title,
                        });
                      }}
                      className="absolute bottom-3 left-3 bg-black/85 hover:bg-gold hover:text-black text-white border border-white/20 hover:border-gold px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 transition-all duration-200 z-20 cursor-pointer shadow-lg"
                      title="Watch Official YouTube Trailer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Trailer</span>
                    </button>
                  )}

                  {/* Cover Overlay & Book Button on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <button
                      disabled={!isMovieActive}
                      onClick={isMovieActive ? () => onBookMovie(movie.title) : undefined}
                      className={`text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-xl shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 ${
                        isMovieActive
                          ? "bg-gold hover:bg-gold-light text-black shadow-gold/20 cursor-pointer border-0"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-not-allowed opacity-60 pointer-events-none"
                      }`}
                    >
                      <Eye className="w-4 h-4 stroke-[2.5]" />
                      <span>{isMovieActive ? "Book Tickets" : "Booking OFF"}</span>
                    </button>
                  </div>
                </div>

                {/* Info Block */}
                <div className="p-5 flex flex-col flex-grow space-y-2">
                  <h3 className="font-display text-lg font-bold text-white tracking-wide group-hover:text-gold transition-colors line-clamp-1">
                    {movie.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>{movie.duration || "2h 30m"}</span>
                    <span>•</span>
                    <span className="truncate">{movie.genre}</span>
                  </div>

                  <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gold tracking-widest uppercase border border-gold/30 px-2 py-0.5 rounded bg-gold/5 font-mono">
                      {movie.lang || movie.language}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider font-mono ${
                        isMovieActive ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isMovieActive ? "● Bookings Open" : "● Offline"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* YouTube Video Player Modal */}
      {activeVideoModal && (
        <YouTubePlayerModal
          isOpen={!!activeVideoModal}
          video={activeVideoModal.video}
          movieTitle={activeVideoModal.movieTitle}
          onClose={() => setActiveVideoModal(null)}
        />
      )}
    </section>
  );
}
