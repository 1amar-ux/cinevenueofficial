import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Play,
  Film,
  Calendar,
  Clock,
  ShieldCheck,
  Clapperboard,
  Sparkles,
  Share2,
  Users,
  Pencil,
  X,
  CheckCircle,
} from "lucide-react";
import { BookingContext } from "../context/BookingContext";
import { Movie, MovieVideo } from "../types";
import { INITIAL_MOVIES } from "../data";
import { getActiveMovieVideos, deriveMovieReleaseStatus } from "../utils/movieAvailability";
import YouTubePlayerModal from "../components/video/YouTubePlayerModal";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setBooking } = useContext(BookingContext);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<MovieVideo | null>(null);

  // Edit Description and Casting State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDesc, setEditDesc] = useState("");
  const [editCast, setEditCast] = useState("");
  const [editDirector, setEditDirector] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenEdit = () => {
    if (!movie) return;
    setEditDesc(movie.description || "");
    const castList = movie.cast || movie.actors || [];
    setEditCast(castList.join(", "));
    setEditDirector(movie.director || "");
    setShowEditModal(true);
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movie) return;
    const castArr = editCast.split(",").map(c => c.trim()).filter(Boolean);
    const updated: Movie = {
      ...movie,
      description: editDesc.trim(),
      cast: castArr,
      actors: castArr,
      director: editDirector.trim() || undefined,
    };
    setMovie(updated);

    try {
      const existing: Movie[] = JSON.parse(localStorage.getItem("cine_movies") || "[]");
      const idx = existing.findIndex(m => m.title.toLowerCase() === movie.title.toLowerCase());
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], ...updated };
      } else {
        existing.push(updated);
      }
      localStorage.setItem("cine_movies", JSON.stringify(existing));
    } catch (e) {}

    setShowEditModal(false);
    setToastMessage("Movie description & casting updated successfully!");
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    // Load movies from localStorage or initial fallback
    const saved = localStorage.getItem("cine_movies");
    const movieList: Movie[] = saved ? JSON.parse(saved) : INITIAL_MOVIES;

    const found =
      movieList.find((m) => String(m.id || m._id || m.title) === String(id)) ||
      movieList.find((m) => m.title.toLowerCase() === decodeURIComponent(id || "").toLowerCase()) ||
      movieList[0];

    // Ensure sample trailers exist if not configured and no trailerUrl provided
    if (found && (!found.videos || found.videos.length === 0)) {
      const initialMatch = INITIAL_MOVIES.find((m) => m.title.toLowerCase() === found.title?.toLowerCase());
      const validTrailer = found.trailerUrl || initialMatch?.trailerUrl || "https://www.youtube.com/watch?v=bC36d8e3bb0";
      const trailerVidId = validTrailer.includes("watch?v=") ? validTrailer.split("watch?v=")[1]?.split("&")[0] : "bC36d8e3bb0";

      found.videos = [
        {
          id: `vid-${found.title}-trailer`,
          movieId: found.id || found.title,
          type: "TRAILER",
          title: `${found.title} — Official Theatrical Trailer`,
          youtubeVideoId: trailerVidId,
          youtubeUrl: validTrailer,
          thumbnailUrl: `https://img.youtube.com/vi/${trailerVidId}/hqdefault.jpg`,
          language: found.lang || found.language || "Telugu",
          displayOrder: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
    }

    setMovie(found);
  }, [id]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold" />
      </div>
    );
  }

  const activeVideos = getActiveMovieVideos(movie);
  const releaseStatus = deriveMovieReleaseStatus(movie);

  const handleBookTickets = () => {
    setBooking((prev) => ({
      ...prev,
      movie: movie,
    }));
    navigate("/theatres");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white pt-24 pb-16">
      {/* Top Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-all text-xs font-semibold cursor-pointer border border-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </button>
      </div>

      {/* Hero Banner Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#121213] shadow-2xl">
          {/* Backdrop Image & Gradient Mask */}
          <div className="absolute inset-0 z-0">
            <img
              src={movie.banner || movie.img || movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover object-top opacity-30 filter blur-sm scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121213] via-[#121213]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#121213] via-[#121213]/90 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 p-6 sm:p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Poster Card */}
            <div className="w-56 sm:w-64 md:w-72 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/20 relative group">
              <img
                src={movie.poster || movie.img}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {activeVideos.length > 0 && (
                <button
                  onClick={() => setActiveVideoModal(activeVideos[0])}
                  className="absolute inset-0 bg-black/50 hover:bg-black/40 flex flex-col items-center justify-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer border-0"
                >
                  <div className="w-14 h-14 rounded-full bg-gold/90 text-black flex items-center justify-center shadow-xl shadow-gold/30">
                    <Play className="w-6 h-6 fill-black translate-x-0.5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Watch Trailer</span>
                </button>
              )}
            </div>

            {/* Details Column */}
            <div className="flex-1 flex flex-col justify-between space-y-6 text-left w-full">
              <div className="space-y-4">
                {/* Meta Badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/30 font-bold uppercase tracking-wider font-mono">
                    {movie.lang || movie.language || "Telugu"}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-white/80 border border-white/10 font-semibold">
                    {movie.certificate || "UA"}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-white/80 border border-white/10 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gold" />
                    {movie.duration || "2h 45m"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      releaseStatus === "NOW_SHOWING"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-indigo-500/10 text-indigo-300 border border-indigo-500/30"
                    }`}
                  >
                    {releaseStatus === "NOW_SHOWING" ? "● In Theatres Now" : "● Coming Soon"}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-display">
                  {movie.title}
                </h1>

                {/* Rating & Genre */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/60 border border-gold/30 text-gold font-bold">
                    <Star className="w-4 h-4 fill-gold stroke-none" />
                    <span className="text-base">{movie.rating || "8.5"}</span>
                    <span className="text-xs text-text-muted">/10</span>
                  </div>
                  <span>•</span>
                  <span className="font-semibold text-white/90">{movie.genre}</span>
                </div>

                {/* Synopsis */}
                <p className="text-sm md:text-base text-text-secondary leading-relaxed max-w-3xl pt-2">
                  {movie.description ||
                    "Experience cinematic excellence on the big screen with pristine 4K projection and immersive multi-channel Dolby Atmos sound. Book your seats today on CineVenue."}
                </p>
              </div>

              {/* Book Tickets Action Bar */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-4">
                <button
                  onClick={handleBookTickets}
                  className="px-8 py-3.5 bg-gold hover:bg-gold-light text-black text-sm font-bold uppercase tracking-wider rounded-2xl shadow-xl shadow-gold/20 hover:scale-[1.02] transition-all duration-200 flex items-center gap-2 cursor-pointer border-0"
                >
                  <Film className="w-4 h-4" />
                  Book Tickets Now
                </button>

                {activeVideos.length > 0 && (
                  <button
                    onClick={() => setActiveVideoModal(activeVideos[0])}
                    className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold rounded-2xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 text-gold fill-gold" />
                    Watch Official Trailer
                  </button>
                )}

                <button
                  onClick={handleOpenEdit}
                  className="px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/40 text-white text-sm font-semibold rounded-2xl transition-all flex items-center gap-2 cursor-pointer"
                  title="Add or edit movie description and casting"
                >
                  <Pencil className="w-4 h-4 text-gold" />
                  Edit Description & Cast
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Starring Cast & Creative Crew Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-14 space-y-6 text-left">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold block mb-1">
              Top Billed Ensemble
            </span>
            <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              <Users className="w-6 h-6 text-gold" />
              Starring Cast & Creative Team
            </h2>
          </div>

          <button
            onClick={handleOpenEdit}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/30 text-xs font-semibold text-white/90 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-gold" />
            <span>Add / Edit Cast & Details</span>
          </button>
        </div>

        {((movie.cast || movie.actors) && (movie.cast || movie.actors)!.length > 0) || movie.director ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movie.director && (
              <div className="bg-[#121213] border border-gold/30 rounded-2xl p-4 flex flex-col items-center text-center space-y-2 shadow-lg">
                <div className="w-16 h-16 rounded-full bg-gold/15 border border-gold/40 text-gold flex items-center justify-center font-bold text-lg">
                  {movie.director.split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{movie.director}</h4>
                  <span className="text-[10px] text-gold font-semibold uppercase tracking-wider">Director</span>
                </div>
              </div>
            )}
            {(movie.cast || movie.actors || []).map((actor, idx) => {
              const initials = actor.split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
              return (
                <div key={actor + idx} className="bg-[#121213] border border-white/10 hover:border-gold/30 rounded-2xl p-4 flex flex-col items-center text-center space-y-2 shadow-lg transition-all group">
                  <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-gold/15 border border-white/10 group-hover:border-gold/40 text-white group-hover:text-gold flex items-center justify-center font-bold text-lg transition-colors">
                    {initials || "★"}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-gold line-clamp-1 transition-colors">{actor}</h4>
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Cast / Actor</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl p-6 space-y-2">
            <Users className="w-8 h-8 text-gold/40 mx-auto" />
            <p className="text-sm font-semibold text-white">No Cast Details Added Yet</p>
            <p className="text-xs text-text-muted">You can add actors, cast members, and director information right now.</p>
            <button
              onClick={handleOpenEdit}
              className="mt-2 px-4 py-2 rounded-xl bg-gold text-black text-xs font-bold uppercase tracking-wider border-0 cursor-pointer"
            >
              + Add Movie Casting
            </button>
          </div>
        )}
      </div>

      {/* Trailers & Teasers Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-16 space-y-6 text-left">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold block mb-1">
              Official Media Stream
            </span>
            <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              <Clapperboard className="w-6 h-6 text-gold" />
              Trailers & Teasers ({activeVideos.length})
            </h2>
          </div>
        </div>

        {activeVideos.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <Film className="w-8 h-8 text-gold/50 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No Videos Available</p>
            <p className="text-xs text-text-muted">Official trailers and teasers will be released soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => setActiveVideoModal(video)}
                className="group bg-[#121213] border border-white/10 rounded-2xl overflow-hidden hover:border-gold/60 transition-all duration-300 shadow-xl cursor-pointer flex flex-col"
              >
                {/* 16:9 Thumbnail Frame */}
                <div className="relative aspect-video overflow-hidden bg-black/60">
                  <img
                    src={
                      video.thumbnailUrl ||
                      `https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`
                    }
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gold/90 text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-black translate-x-0.5" />
                    </div>
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow ${
                        video.type === "TRAILER"
                          ? "bg-gold text-black font-extrabold"
                          : "bg-indigo-600 text-white font-extrabold"
                      }`}
                    >
                      {video.type}
                    </span>
                  </div>
                </div>

                {/* Video Info Block */}
                <div className="p-4 flex flex-col flex-grow justify-between space-y-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-gold transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-white/5">
                    <span>{video.language || movie.lang}</span>
                    <span className="text-gold font-semibold flex items-center gap-1">
                      <Play className="w-3 h-3 fill-gold" /> Watch
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* YouTube Player Modal */}
      {activeVideoModal && (
        <YouTubePlayerModal
          isOpen={!!activeVideoModal}
          video={activeVideoModal}
          movieTitle={movie.title}
          onClose={() => setActiveVideoModal(null)}
        />
      )}

      {/* Edit Movie Description & Casting Modal Dialog */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in text-white">
          <div className="bg-[#141418] border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-left space-y-5">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-0 cursor-pointer transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold block">
                Movie Information Management
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Film className="w-5 h-5 text-gold" />
                <span>Add / Edit Movie Description & Casting</span>
              </h3>
              <p className="text-xs text-text-muted">
                Update "{movie.title}" description, starring cast list, and filmmaker details.
              </p>
            </div>

            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex justify-between">
                  <span>Movie Description / Synopsis</span>
                  <span className="text-[10px] text-gold/80 font-normal">Plot overview</span>
                </label>
                <textarea
                  rows={4}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Enter compelling storyline synopsis or plot highlights..."
                  className="w-full bg-white/[0.03] border border-white/15 focus:border-gold rounded-xl p-3 text-xs text-white focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex justify-between">
                  <span>Starring Cast (comma-separated)</span>
                  <span className="text-[10px] text-text-muted font-normal">Actors</span>
                </label>
                <input
                  type="text"
                  value={editCast}
                  onChange={(e) => setEditCast(e.target.value)}
                  placeholder="e.g. Prabhas, Amitabh Bachchan, Deepika Padukone, Kamal Haasan"
                  className="w-full bg-white/[0.03] border border-white/15 focus:border-gold rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                />
                <p className="text-[10px] text-text-muted">Separate multiple actors with commas.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Director / Filmmaker
                </label>
                <input
                  type="text"
                  value={editDirector}
                  onChange={(e) => setEditDirector(e.target.value)}
                  placeholder="e.g. Christopher Nolan, S. S. Rajamouli"
                  className="w-full bg-white/[0.03] border border-white/15 focus:border-gold rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-text-secondary hover:text-white transition-colors cursor-pointer border-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-gold/20 cursor-pointer border-0"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Alert Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-black" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
