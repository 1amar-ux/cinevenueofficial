import React, { useState } from "react";
import { Search, Star, Film, Eye, Play, Sparkles, Calendar, Clapperboard, ChevronRight, Flame, ArrowLeft } from "lucide-react";
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
    const matchesTab =
      activeTab === "all" ||
      movie.langKey === activeTab ||
      (movie.lang || "").toLowerCase() === activeTab.toLowerCase() ||
      movie.additionalLanguages?.some((l) => l.toLowerCase() === activeTab.toLowerCase());

    // Search Text Filter
    const matchesSearch =
      (movie.title || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (movie.genre || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (movie.lang || "").toLowerCase().includes((searchQuery || "").toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Split into "This Week's Releases" and "Only in Theatres"
  const thisWeeksReleases = filteredMovies.filter((m) => {
    const status = deriveMovieReleaseStatus(m);
    return status === "NOW_SHOWING" && (Number(m.rating) || 0) >= 8.5;
  });

  const nowShowingInTheatres = filteredMovies.filter((m) => {
    return !thisWeeksReleases.some((tw) => tw.title === m.title);
  });

  const renderMovieCard = (movie: Movie, idx: number) => {
    const isMovieActive = movie.isActive !== false && isMovieBookingSystemActive;
    const releaseStatus = deriveMovieReleaseStatus(movie);
    const activeVideos = getActiveMovieVideos(movie);
    const primaryTrailer = activeVideos.find((v) => v.type === "TRAILER") || activeVideos[0];

    // Format certification and languages in District format: "UA13+ | Telugu", "U | Telugu"
    const cert = movie.certification || "UA16+";
    const primaryLang = movie.lang || movie.language || "Telugu";
    const extraLangCount = movie.additionalLanguages?.length || 0;
    const langDisplay = extraLangCount > 0 ? `${primaryLang} and ${extraLangCount} more` : primaryLang;

    return (
      <div
        key={movie.title + idx}
        onClick={() => {
          if (isMovieActive) onBookMovie(movie.title);
        }}
        className="group flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 select-none bg-white dark:bg-[#161619] border border-gray-200 dark:border-white/[0.08] hover:border-gold/50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm dark:shadow-lg dark:shadow-black/40"
      >
        {/* District Movie Poster Container */}
        <div className="relative aspect-[3/4] sm:aspect-[2/3] w-full overflow-hidden bg-gray-100 dark:bg-[#101012]">
          <img
            src={movie.poster || movie.img}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Rating Badge */}
          {movie.rating && (
            <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-lg z-10">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{movie.rating}</span>
            </div>
          )}

          {/* Coming Soon Tag */}
          {releaseStatus === "UPCOMING" && (
            <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-lg z-10">
              Coming Soon
            </div>
          )}

          {/* Trailer Button */}
          {primaryTrailer && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveVideoModal({
                  video: primaryTrailer,
                  movieTitle: movie.title,
                });
              }}
              className="absolute bottom-2.5 left-2.5 bg-black/80 hover:bg-gold hover:text-black text-white border border-white/15 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1 transition-all z-20 cursor-pointer shadow-md"
              title="Watch Trailer"
            >
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>Trailer</span>
            </button>
          )}

          {/* Quick Hover Book Overlay (Desktop) */}
          <div className="hidden sm:flex absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-end justify-center pb-3 px-2">
            <button
              disabled={!isMovieActive}
              className="w-full py-2 rounded-xl bg-gold text-black font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-gold/20 flex items-center justify-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200"
            >
              <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Book Tickets</span>
            </button>
          </div>
        </div>

        {/* Card Body with Title & Subtitle (Exact District Formation) */}
        <div className="p-2.5 sm:p-3.5 flex flex-col justify-between flex-grow bg-white dark:bg-[#161619]">
          <h3 className="font-bold text-xs sm:text-sm text-gray-950 dark:text-white tracking-normal group-hover:text-gold transition-colors line-clamp-1 sm:line-clamp-2 leading-snug">
            {movie.title}
          </h3>
          <p className="text-[11px] sm:text-xs text-gray-600 dark:text-white/60 font-medium mt-1 truncate">
            <span className="text-gray-900 dark:text-white/80 font-semibold">{cert}</span>
            <span className="mx-1 text-gray-400 dark:text-white/30">•</span>
            <span>{langDisplay}</span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <section id="movies" className="py-6 sm:py-10 px-3.5 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Mobile Top Header (District Formation: ← Movies in Guntur) */}
      <div className="flex sm:hidden items-center gap-3 pt-1 pb-2">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.location.href = "/";
            }
          }}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-white transition-colors cursor-pointer border-0 bg-transparent"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800 dark:text-white" />
        </button>
        <h1 className="text-lg font-bold text-gray-950 dark:text-white tracking-tight">
          Movies in {selectedCity === "All Cities" ? "India" : selectedCity}
        </h1>
      </div>

      {/* Desktop Search & Filter Bar Container */}
      <div className="w-full bg-white dark:bg-[#121214]/90 border border-gray-200 dark:border-white/10 p-3 sm:p-4 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4 shadow-sm dark:shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-black/60 rounded-xl border border-amber-200 dark:border-gold/30 text-xs font-semibold uppercase text-amber-800 dark:text-gold select-none">
            <Clapperboard className="w-4 h-4 text-gold" />
            <span>{selectedCity} Screenings</span>
          </div>

          {/* Category Switcher */}
          <div className="flex bg-gray-100 dark:bg-black/50 p-1 rounded-xl border border-gray-200 dark:border-white/10 text-xs shadow-xs dark:shadow-none">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer border-0 ${
                activeCategory === "ALL" ? "bg-gold text-black shadow-md" : "text-gray-600 dark:text-text-muted hover:text-gray-950 dark:hover:text-white bg-transparent"
              }`}
            >
              All Films
            </button>
            <button
              onClick={() => setActiveCategory("NOW_SHOWING")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer border-0 ${
                activeCategory === "NOW_SHOWING" ? "bg-gold text-black shadow-md" : "text-gray-600 dark:text-text-muted hover:text-gray-950 dark:hover:text-white bg-transparent"
              }`}
            >
              In Theatres
            </button>
            <button
              onClick={() => setActiveCategory("COMING_SOON")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer border-0 ${
                activeCategory === "COMING_SOON" ? "bg-gold text-black shadow-md" : "text-gray-600 dark:text-text-muted hover:text-gray-950 dark:hover:text-white bg-transparent"
              }`}
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search films, languages, or genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-black/60 border border-gray-200 dark:border-white/10 focus:border-gold/60 rounded-xl pl-11 pr-4 py-2 text-xs text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-muted focus:outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Language Filter Pills */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-white/10 pb-3 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 items-center shrink-0">
          {["all", "telugu", "hindi", "english", "tamil", "kannada", "malayalam"].map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveTab(lang)}
              className={`px-3.5 py-1 text-xs font-semibold tracking-wide rounded-full transition-all cursor-pointer border shrink-0 ${
                activeTab === lang
                  ? "bg-gray-950 text-white border-gray-950 dark:bg-white dark:text-black dark:border-white shadow-md font-bold"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300 hover:text-gray-950 dark:bg-white/[0.04] dark:text-white/70 dark:border-white/10 dark:hover:border-white/30 dark:hover:text-white"
              }`}
            >
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>

        {/* Genre Selector Pills */}
        {availableGenres.length > 0 && (
          <div className="hidden lg:flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {availableGenres.slice(0, 5).map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(selectedGenre === g ? "ALL" : g)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 cursor-pointer border ${
                  selectedGenre.toLowerCase() === g.toLowerCase()
                    ? "bg-gold/20 text-gold border-gold/50"
                    : "bg-transparent text-gray-500 hover:text-gray-950 dark:text-white/50 border-gray-200 dark:border-white/10 dark:hover:text-white"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Movies Content */}
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
        <div className="space-y-8 sm:space-y-12">
          {/* SECTION 1: This Week's Releases */}
          {thisWeeksReleases.length > 0 && (
            <div className="space-y-3.5 sm:space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-xl font-bold text-gray-950 dark:text-white tracking-tight">
                  This Week's Releases
                </h2>
                <span className="text-[11px] sm:text-xs text-gray-500 dark:text-white/50 font-medium">
                  {thisWeeksReleases.length} {thisWeeksReleases.length === 1 ? "movie" : "movies"}
                </span>
              </div>

              {/* 2-Column on Mobile, 3-6 Columns on Tablet/Desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4.5">
                {thisWeeksReleases.map((movie, idx) => renderMovieCard(movie, idx))}
              </div>
            </div>
          )}

          {/* SECTION 2: Only in Theatres / All Scheduled Films */}
          <div className="space-y-3.5 sm:space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-xl font-bold text-gray-950 dark:text-white tracking-tight">
                {thisWeeksReleases.length > 0 ? "Only in Theatres" : "Featured & Now Showing"}
              </h2>
              <span className="text-[11px] sm:text-xs text-gray-500 dark:text-white/50 font-medium">
                {nowShowingInTheatres.length > 0 ? nowShowingInTheatres.length : filteredMovies.length} movies
              </span>
            </div>

            {/* 2-Column on Mobile, 3-6 Columns on Tablet/Desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4.5">
              {(nowShowingInTheatres.length > 0 ? nowShowingInTheatres : filteredMovies).map((movie, idx) =>
                renderMovieCard(movie, idx + 100)
              )}
            </div>
          </div>
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

