import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, Film, Eye, Play, Sparkles, Calendar, Clapperboard, ChevronRight, Flame, ArrowLeft, X, CheckCircle2, MessageSquare } from "lucide-react";
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<"ALL" | "NOW_SHOWING" | "COMING_SOON">("ALL");
  const [selectedGenre, setSelectedGenre] = useState<string>("ALL");

  // YouTube player modal state
  const [activeVideoModal, setActiveVideoModal] = useState<{
    video: MovieVideo;
    movieTitle: string;
  } | null>(null);

  // Audience rating modal states
  const [ratingMovie, setRatingMovie] = useState<Movie | null>(null);
  const [audienceRatingScore, setAudienceRatingScore] = useState<number>(10);
  const [audienceReviewText, setAudienceReviewText] = useState<string>("");
  const [audienceName, setAudienceName] = useState<string>("");
  const [audienceTags, setAudienceTags] = useState<string[]>(["#Blockbuster", "#MustWatch"]);
  const [ratingSuccessToast, setRatingSuccessToast] = useState<string | null>(null);

  const handleSubmitAudienceRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingMovie) return;

    const currentVotesNum = parseInt(String(ratingMovie.votes || "2500").replace(/[^0-9]/g, "")) || 2500;
    const currentRatingNum = parseFloat(ratingMovie.rating || "9.0") || 9.0;
    const newRating = ((currentRatingNum * currentVotesNum + audienceRatingScore) / (currentVotesNum + 1)).toFixed(1);
    const newVotes = `${(currentVotesNum + 1).toLocaleString()}+ Votes`;

    const newReview = {
      id: `rev-${Date.now()}`,
      userName: audienceName.trim() || "CineVenue Moviegoer",
      userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
      isVerifiedBooking: true,
      rating: audienceRatingScore,
      tags: audienceTags.length > 0 ? audienceTags : ["#Blockbuster"],
      comment: audienceReviewText.trim() || "Excellent cinematic masterpiece!",
      likes: 1,
      dislikes: 0,
      timeAgo: "Just now",
    };

    const updatedMovie: Movie = {
      ...ratingMovie,
      rating: newRating,
      votes: newVotes,
      reviews: [newReview, ...(ratingMovie.reviews || [])],
    };

    try {
      const raw = localStorage.getItem("cine_movies");
      const list: Movie[] = raw ? JSON.parse(raw) : movies;
      const idx = list.findIndex((m) => m.title.toLowerCase() === ratingMovie.title.toLowerCase());
      if (idx >= 0) {
        list[idx] = updatedMovie;
      } else {
        list.push(updatedMovie);
      }
      localStorage.setItem("cine_movies", JSON.stringify(list));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {}

    setRatingSuccessToast(`Thank you! Your ${audienceRatingScore}/10 rating for '${ratingMovie.title}' has been submitted!`);
    setTimeout(() => setRatingSuccessToast(null), 4000);
    setRatingMovie(null);
    setAudienceReviewText("");
    setAudienceName("");
  };

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
          navigate(`/movie/${encodeURIComponent(movie.id || movie.title)}`);
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

          {/* Rating Badge - Clickable for audience rating */}
          {movie.rating && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setRatingMovie(movie);
                setAudienceRatingScore(10);
              }}
              className="absolute top-2.5 right-2.5 bg-black/85 hover:bg-[#eb4e62] backdrop-blur-md border border-white/10 hover:border-[#eb4e62] text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-lg z-20 transition-all cursor-pointer group/ratebadge"
              title="Click to rate this movie"
            >
              <Star className="w-3 h-3 text-amber-400 fill-amber-400 group-hover/ratebadge:text-white group-hover/ratebadge:fill-white" />
              <span>{movie.rating}</span>
            </button>
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
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isMovieActive) onBookMovie(movie.title);
              }}
              disabled={!isMovieActive}
              className="w-full py-2 rounded-xl bg-gold text-black font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-gold/20 flex items-center justify-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Book Tickets</span>
            </button>
          </div>
        </div>

        {/* Card Body with Title & Subtitle */}
        <div className="p-2.5 sm:p-3.5 flex flex-col justify-between flex-grow bg-white dark:bg-[#161619] gap-2">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-gray-950 dark:text-white tracking-normal group-hover:text-gold transition-colors line-clamp-1 sm:line-clamp-2 leading-snug">
              {movie.title}
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-600 dark:text-white/60 font-medium mt-1 truncate">
              <span className="text-gray-900 dark:text-white/80 font-semibold">{cert}</span>
              <span className="mx-1 text-gray-400 dark:text-white/30">•</span>
              <span>{langDisplay}</span>
            </p>
          </div>

          {/* Action Row: Audience Rate & Book Tickets */}
          <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex items-center gap-1.5 mt-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setRatingMovie(movie);
                setAudienceRatingScore(10);
              }}
              className="flex-1 py-1.5 px-2 rounded-xl bg-amber-500/10 hover:bg-[#eb4e62] text-amber-500 hover:text-white dark:text-amber-400 dark:hover:text-white border border-amber-500/20 hover:border-[#eb4e62] text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
              title="Rate this movie"
            >
              <Star className="w-3 h-3 fill-current" />
              <span>Rate</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isMovieActive) onBookMovie(movie.title);
              }}
              className="flex-1 py-1.5 px-2 rounded-xl bg-gold hover:bg-gold-light text-black text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
            >
              <span>Book</span>
            </button>
          </div>
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

      {/* Audience Rating Success Toast */}
      {ratingSuccessToast && (
        <div className="fixed top-24 right-6 z-50 bg-[#1e1e24] border border-white/20 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{ratingSuccessToast}</span>
        </div>
      )}

      {/* Audience Movie Rating Modal */}
      {ratingMovie && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-white/15 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  Rate & Review {ratingMovie.title}
                </h3>
                <p className="text-xs text-white/60">Share your audience rating with fellow moviegoers</p>
              </div>
              <button
                type="button"
                onClick={() => setRatingMovie(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAudienceRating} className="space-y-4">
              {/* Star Rating Score Picker (1 to 10) */}
              <div>
                <label className="text-xs font-bold text-white/80 block mb-2">Your Rating Score</label>
                <div className="flex items-center justify-between bg-black/50 p-3 rounded-2xl border border-white/10">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setAudienceRatingScore(num)}
                        className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          audienceRatingScore >= num
                            ? "bg-[#eb4e62] text-white shadow-md shadow-[#eb4e62]/30 scale-105"
                            : "bg-white/5 text-white/40 hover:bg-white/10"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className="text-right pl-2 shrink-0">
                    <span className="text-lg font-black text-[#eb4e62]">{audienceRatingScore}</span>
                    <span className="text-xs text-white/40">/10</span>
                  </div>
                </div>
              </div>

              {/* Review Hashtags */}
              <div>
                <label className="text-xs font-bold text-white/80 block mb-2">Audience Hashtags</label>
                <div className="flex flex-wrap gap-2">
                  {["#Blockbuster", "#SuperDirection", "#GreatActing", "#AwesomeStory", "#Wellmade", "#MustWatch"].map(
                    (tag) => {
                      const selected = audienceTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setAudienceTags(audienceTags.filter((t) => t !== tag));
                            } else {
                              setAudienceTags([...audienceTags, tag]);
                            }
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            selected
                              ? "bg-[#eb4e62] text-white border-[#eb4e62]"
                              : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Reddy"
                  value={audienceName}
                  onChange={(e) => setAudienceName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#eb4e62]"
                />
              </div>

              {/* Comments */}
              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">Your Review</label>
                <textarea
                  rows={3}
                  placeholder="What did you love about this movie? The story, music, acting, or direction?"
                  value={audienceReviewText}
                  onChange={(e) => setAudienceReviewText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#eb4e62] resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setRatingMovie(null)}
                  className="px-4 py-2 text-xs font-bold text-white/70 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#eb4e62] hover:bg-[#d63e51] rounded-xl shadow-lg shadow-[#eb4e62]/20 transition-all cursor-pointer"
                >
                  Submit Audience Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

