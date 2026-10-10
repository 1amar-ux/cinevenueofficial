import React, { useContext, useState, useEffect, useRef } from "react";
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
  ChevronRight,
  ChevronLeft,
  ThumbsUp,
  ThumbsDown,
  Tag,
  CheckCircle2,
  Gift,
  X,
  Send,
  User,
  Info
} from "lucide-react";
import { BookingContext } from "../context/BookingContext";
import { Movie, MovieVideo, CastMember, CrewMember, MovieReview, MovieOffer } from "../types";
import { INITIAL_MOVIES } from "../data";
import { getActiveMovieVideos, deriveMovieReleaseStatus } from "../utils/movieAvailability";
import YouTubePlayerModal from "../components/video/YouTubePlayerModal";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setBooking } = useContext(BookingContext);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<MovieVideo | null>(null);
  const [showShareNotification, setShowShareNotification] = useState(false);

  // Reviews & Rating states
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("ALL");
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [userRatingScore, setUserRatingScore] = useState<number>(10);
  const [userReviewText, setUserReviewText] = useState("");
  const [userReviewerName, setUserReviewerName] = useState("");
  const [selectedReviewTags, setSelectedReviewTags] = useState<string[]>(["#Blockbuster"]);
  const [reviewLikes, setReviewLikes] = useState<Record<string, number>>({});
  const [userLikedReviews, setUserLikedReviews] = useState<Record<string, boolean>>({});

  // Horizontal scroll refs
  const castScrollRef = useRef<HTMLDivElement>(null);
  const crewScrollRef = useRef<HTMLDivElement>(null);
  const reviewsScrollRef = useRef<HTMLDivElement>(null);
  const offersScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load movies from localStorage or initial fallback
    const saved = localStorage.getItem("cine_movies");
    let movieList: Movie[] = saved ? JSON.parse(saved) : INITIAL_MOVIES;

    // Ensure Comrade Kalyan and initial movies with rich fields are hydrated
    if (saved) {
      let changed = false;
      INITIAL_MOVIES.forEach((initM) => {
        const idx = movieList.findIndex(
          (m) =>
            String(m.id || "").toLowerCase() === String(initM.id || "").toLowerCase() ||
            m.title.toLowerCase() === initM.title.toLowerCase()
        );
        if (idx === -1) {
          movieList.unshift(initM);
          changed = true;
        } else {
          // Merge missing cast, crew, reviews, offers
          movieList[idx] = {
            ...initM,
            ...movieList[idx],
            castMembers: movieList[idx].castMembers || initM.castMembers,
            crewMembers: movieList[idx].crewMembers || initM.crewMembers,
            offers: movieList[idx].offers || initM.offers,
            reviews: movieList[idx].reviews || initM.reviews,
            votes: movieList[idx].votes || initM.votes,
            description: movieList[idx].description || initM.description,
            rating: movieList[idx].rating || initM.rating,
          };
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem("cine_movies", JSON.stringify(movieList));
      }
    }

    const found =
      movieList.find((m) => String(m.id || m._id || m.title) === String(id)) ||
      movieList.find((m) => m.title.toLowerCase() === decodeURIComponent(id || "").toLowerCase()) ||
      movieList[0];

    // Ensure sample trailers exist if not configured
    if (found && (!found.videos || found.videos.length === 0)) {
      const initialMatch = INITIAL_MOVIES.find((m) => m.title.toLowerCase() === found.title?.toLowerCase());
      const validTrailer = found.trailerUrl || initialMatch?.trailerUrl || "https://www.youtube.com/watch?v=bC36d8e3bb0";
      const trailerVidId = validTrailer.includes("watch?v=")
        ? validTrailer.split("watch?v=")[1]?.split("&")[0]
        : "bC36d8e3bb0";

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
        },
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

  // Cast members resolution (supporting castMembers, cast array, and actors)
  const castList: CastMember[] =
    movie.castMembers && movie.castMembers.length > 0
      ? movie.castMembers
      : Array.isArray(movie.cast) && movie.cast.length > 0 && typeof movie.cast[0] === "object"
      ? (movie.cast as CastMember[])
      : Array.isArray(movie.cast) && movie.cast.length > 0
      ? (movie.cast as string[]).map((name) => ({
          name,
          role: "Actor",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
        }))
      : movie.actors && movie.actors.length > 0
      ? movie.actors.map((name) => ({
          name,
          role: "Actor",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
        }))
      : [
          { name: "Sree Vishnu", role: "Actor", character: "Kalyan", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80" },
          { name: "Mahima Nambiar", role: "Actor", character: "Sitara", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80" },
          { name: "Radhika Sarathkumar", role: "Actor", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80" },
          { name: "Shine Tom Chacko", role: "Actor", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80" },
          { name: "Upendra Limaye", role: "Actor", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80" },
          { name: "Sathya", role: "Actor", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80" },
        ];

  // Crew members resolution
  const crewList: CrewMember[] =
    movie.crewMembers && movie.crewMembers.length > 0
      ? movie.crewMembers
      : movie.crew && movie.crew.length > 0
      ? movie.crew
      : [
          { name: movie.director || "Kishore Tirumala", role: "Director", image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&q=80" },
          { name: "TG Vishwa Prasad", role: "Producer", image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&q=80" },
          { name: "Vivek Sagar", role: "Musician", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80" },
          { name: "Venu Udugula", role: "Cinematographer", image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&q=80" },
          { name: "Sreekar Prasad", role: "Editor", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80" },
        ];

  // Offers resolution
  const offersList: MovieOffer[] =
    movie.offers && movie.offers.length > 0
      ? movie.offers
      : [
          {
            id: "off-1",
            title: "Enjoy B1G1 Ticket Free!* with Bandhan Bank Credit Cards",
            subtitle: "Tap to view details & eligible shows",
            bankName: "Bandhan Bank",
            discountBadge: "B1G1 FREE",
          },
          {
            id: "off-2",
            title: "Get up to ₹1000 off per calendar month with Axis Bank Delight",
            subtitle: "Valid on all 2D, 3D & EPIQ format screens",
            bankName: "Axis Bank",
            discountBadge: "FLAT ₹1000",
          },
          {
            id: "off-3",
            title: "Redeem CineCoins for up to 20% instant off on tickets & popcorn",
            subtitle: "Instant redemption at checkout",
            bankName: "CineVenue Vault",
            discountBadge: "CINECOINS",
          },
        ];

  // Reviews resolution
  const reviewsList: MovieReview[] =
    movie.reviews && movie.reviews.length > 0
      ? movie.reviews
      : [
          {
            id: "rev-1",
            userName: "User",
            userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
            isVerifiedBooking: true,
            rating: 10,
            tags: ["#GreatActing", "#AwesomeStory", "#Blockbuster"],
            comment: "'కామ్రేడ్ కళ్యాణ్' అంటే ఎవరు? కామెడీతో అలరించే కళ్యాణ్ 💥 Superb storyline with vintage 90s atmosphere!",
            likes: 67,
            dislikes: 0,
            timeAgo: "19 Hours ago",
          },
          {
            id: "rev-2",
            userName: "User",
            userAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80",
            isVerifiedBooking: true,
            rating: 10,
            tags: ["#SuperDirection", "#GreatActing", "#AwesomeStory"],
            comment: "Entertainer movie tho osthadu, blockbuster kodthadu... 😂🔥 Sree Vishnu nailed every scene with effortless comedy.",
            likes: 42,
            dislikes: 1,
            timeAgo: "19 Hours ago",
          },
          {
            id: "rev-3",
            userName: "Praveen Kumar",
            userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
            isVerifiedBooking: true,
            rating: 9,
            tags: ["#Wellmade", "#Blockbuster", "#SuperDirection"],
            comment: "Music by Vivek Sagar and the cinematography took me back to early 90s Godavari villages. Absolute family entertainer!",
            likes: 31,
            dislikes: 0,
            timeAgo: "1 Day ago",
          },
        ];

  // Review Hashtags summary counts
  const reviewTagsSummary = [
    { tag: "#Blockbuster", count: 634 },
    { tag: "#SuperDirection", count: 582 },
    { tag: "#GreatActing", count: 567 },
    { tag: "#Wellmade", count: 525 },
    { tag: "#AwesomeStory", count: 412 },
    { tag: "#RomanticVibes", count: 320 },
  ];

  const filteredReviews =
    selectedTagFilter === "ALL"
      ? reviewsList
      : reviewsList.filter((r) => r.tags && r.tags.includes(selectedTagFilter));

  const handleBookTickets = () => {
    setBooking((prev) => ({
      ...prev,
      movie: movie,
    }));
    navigate("/theatres");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${movie.title} - CineVenue`,
          text: `Book tickets for ${movie.title} (${movie.rating}/10 rating) on CineVenue!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareNotification(true);
      setTimeout(() => setShowShareNotification(false), 2500);
    }
  };

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const toggleReviewLike = (reviewId: string) => {
    setUserLikedReviews((prev) => {
      const isLiked = !prev[reviewId];
      setReviewLikes((likes) => ({
        ...likes,
        [reviewId]: (likes[reviewId] ?? (reviewsList.find((r) => r.id === reviewId)?.likes || 0)) + (isLiked ? 1 : -1),
      }));
      return { ...prev, [reviewId]: isLiked };
    });
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userReviewText.trim()) return;

    const newRev: MovieReview = {
      id: `rev-${Date.now()}`,
      userName: userReviewerName.trim() || "CineVenue Moviegoer",
      userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
      isVerifiedBooking: true,
      rating: userRatingScore,
      tags: selectedReviewTags.length > 0 ? selectedReviewTags : ["#Blockbuster", "#GreatActing"],
      comment: userReviewText.trim(),
      likes: 1,
      dislikes: 0,
      timeAgo: "Just now",
    };

    const currVotes = parseInt(String(movie.votes || "2600").replace(/[^0-9]/g, "")) || 2600;
    const currRating = parseFloat(movie.rating || "9.4") || 9.4;
    const newRatingScore = ((currRating * currVotes + userRatingScore) / (currVotes + 1)).toFixed(1);
    const newVotesStr = `${(currVotes + 1).toLocaleString()}+ Votes`;

    const updatedReviews = [newRev, ...reviewsList];
    const updatedMovie: Movie = {
      ...movie,
      rating: newRatingScore,
      votes: newVotesStr,
      reviews: updatedReviews,
    };

    setMovie(updatedMovie);

    // Save back to localStorage
    const saved = localStorage.getItem("cine_movies");
    if (saved) {
      const list: Movie[] = JSON.parse(saved);
      const idx = list.findIndex((m) => m.title.toLowerCase() === movie.title.toLowerCase());
      if (idx >= 0) {
        list[idx] = updatedMovie;
        localStorage.setItem("cine_movies", JSON.stringify(list));
      }
    }
    window.dispatchEvent(new Event("storage"));

    setUserReviewText("");
    setUserReviewerName("");
    setIsRateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white pt-20 pb-20 font-sans selection:bg-[#eb4e62] selection:text-white">
      {/* Toast Notification */}
      {showShareNotification && (
        <div className="fixed top-24 right-6 z-50 bg-[#1e1e24] border border-white/20 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">Movie link copied to clipboard!</span>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs font-semibold cursor-pointer border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Movies</span>
        </button>
      </div>

      {/* 1. HERO BANNER SECTION (MATCHING SCREENSHOT 1) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#121214] shadow-2xl">
          {/* Backdrop Image & Ambient Darkness */}
          <div className="absolute inset-0 z-0">
            <img
              src={movie.banner || movie.img || movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover object-top opacity-20 filter blur-md scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-[#121214]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#121214] via-[#121214]/90 to-transparent" />
          </div>

          {/* Hero Content Grid */}
          <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Left: Movie Poster with Trailer Overlay */}
            <div className="w-60 sm:w-64 md:w-72 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/20 relative group bg-black/60">
              <img
                src={movie.poster || movie.img}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* In Cinemas Tag at bottom */}
              <div className="absolute bottom-0 inset-x-0 bg-black/85 backdrop-blur-md py-1.5 text-center border-t border-white/10">
                <span className="text-[11px] font-bold text-white/90 uppercase tracking-wider">In cinemas</span>
              </div>

              {/* Trailer Badge Overlay */}
              {activeVideos.length > 0 && (
                <button
                  onClick={() => setActiveVideoModal(activeVideos[0])}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white text-xs font-bold border border-white/30 backdrop-blur-md flex items-center gap-1.5 shadow-xl transition-all cursor-pointer group-hover:scale-105"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Trailer</span>
                </button>
              )}
            </div>

            {/* Right: Movie Title, Ratings, Specs & Book Tickets */}
            <div className="flex-1 flex flex-col justify-between space-y-5 text-left w-full">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-display leading-tight">
                  {movie.title}
                </h1>

                {/* Share Button (Top Right) */}
                <button
                  onClick={handleShare}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-lg"
                >
                  <Share2 className="w-4 h-4 text-white/80" />
                  <span>Share</span>
                </button>
              </div>

              {/* RATING CARD & RATE NOW BUTTON (EXACTLY AS SCREENSHOT 1) */}
              <div className="bg-[#1f1f23]/90 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl backdrop-blur-md">
                <div
                  onClick={() => {
                    const el = document.getElementById("top-reviews-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 fill-[#eb4e62] text-[#eb4e62]" />
                    <span className="text-xl sm:text-2xl font-black text-white">{movie.rating || "9.4"}/10</span>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white/70 group-hover:text-white transition-colors flex items-center gap-1">
                    ({movie.votes || "2.6K+ Votes"})
                    <ChevronRight className="w-4 h-4 text-white/50 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>

                {/* Rate Now Button */}
                <button
                  onClick={() => setIsRateModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md cursor-pointer hover:border-white/40"
                >
                  Rate now
                </button>
              </div>

              {/* FORMATS & LANGUAGES PILLS */}
              <div className="flex flex-wrap items-center gap-2">
                {(movie.formats && movie.formats.length > 0 ? movie.formats : ["2D", "EPIQ"]).map((fmt, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-white/10 text-white text-xs font-bold border border-white/10 uppercase tracking-wider"
                  >
                    {fmt}
                  </span>
                ))}
                <span className="px-3 py-1 rounded-lg bg-white/10 text-white text-xs font-bold border border-white/10 uppercase tracking-wider">
                  {movie.lang || movie.language || "Telugu"}
                </span>
                {movie.additionalLanguages?.map((lang, lIdx) => (
                  <span
                    key={lIdx}
                    className="px-2.5 py-1 rounded-lg bg-white/5 text-white/70 text-xs font-semibold border border-white/5"
                  >
                    {lang}
                  </span>
                ))}
              </div>

              {/* SPECS LINE: Duration • Genres • Certification • Release date */}
              <div className="text-xs sm:text-sm text-white/70 flex flex-wrap items-center gap-2 font-medium">
                <span>{movie.duration || "2h 25m"}</span>
                <span>•</span>
                <span>{movie.genre || "Comedy, Period, Romantic"}</span>
                <span>•</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold text-[11px] border border-white/10">
                  {movie.certification || "UA16+"}
                </span>
                <span>•</span>
                <span>{movie.releaseDate || "9 Oct, 2026"}</span>
              </div>

              {/* PRIMARY ACTION BUTTON: BOOK TICKETS (BOOKMYSHOW CORAL/RED STYLE) */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={handleBookTickets}
                  className="px-10 py-3.5 bg-[#eb4e62] hover:bg-[#d63e51] text-white text-sm sm:text-base font-extrabold tracking-wide rounded-xl shadow-2xl shadow-[#eb4e62]/30 hover:scale-[1.02] transition-all duration-200 cursor-pointer border-0 flex items-center justify-center gap-2"
                >
                  <Film className="w-5 h-5" />
                  <span>Book tickets</span>
                </button>

                {activeVideos.length > 0 && (
                  <button
                    onClick={() => setActiveVideoModal(activeVideos[0])}
                    className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Play className="w-4 h-4 text-white fill-white" />
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ABOUT THE MOVIE SECTION (MATCHING SCREENSHOT 2) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-12 text-left space-y-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">About the movie</h2>
        <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-4xl font-normal">
          {movie.description ||
            "Set against the backdrop of the early '90s Andhra Pradesh, Kalyan, a sharp-witted theatre operator, falls for Sitara, a young woman from Odisha. What begins as a lighthearted pursuit of love soon spirals into a chaotic series of misunderstandings, comic mishaps, and unexpected danger."}
        </p>
      </div>

      {/* 3. TOP OFFERS FOR YOU SECTION (MATCHING SCREENSHOT 2) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-12 text-left space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" />
            Top offers for you
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScroll(offersScrollRef, "left")}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll(offersScrollRef, "right")}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={offersScrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {offersList.map((offer) => (
            <div
              key={offer.id}
              className="w-80 shrink-0 bg-[#fff9eb]/95 text-black p-4 rounded-2xl border border-amber-300/40 shadow-xl flex items-start gap-3 hover:scale-[1.01] transition-transform cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow">
                🎁
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">{offer.title}</h4>
                <p className="text-[11px] text-gray-600 leading-tight">{offer.subtitle}</p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-black/10 text-gray-800">
                    {offer.discountBadge || "EXCLUSIVE"}
                  </span>
                  <span className="text-[11px] font-bold text-[#eb4e62] hover:underline">Tap to view</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CAST SECTION (MATCHING SCREENSHOT 2) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-14 text-left space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white tracking-tight">Cast</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScroll(castScrollRef, "left")}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll(castScrollRef, "right")}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={castScrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-none scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {castList.map((actor, idx) => (
            <div key={idx} className="w-32 shrink-0 flex flex-col items-center text-center group cursor-pointer">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border border-white/15 bg-white/5 mb-2.5 shadow-lg group-hover:border-[#eb4e62] transition-colors relative">
                <img
                  src={actor.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80"}
                  alt={actor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#eb4e62] transition-colors leading-tight line-clamp-1">
                {actor.name}
              </h4>
              <p className="text-[11px] text-white/50 font-medium line-clamp-1">{actor.character || actor.role || "Actor"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. CREW SECTION (MATCHING SCREENSHOT 3) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-12 text-left space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white tracking-tight">Crew</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScroll(crewScrollRef, "left")}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll(crewScrollRef, "right")}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={crewScrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-none scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {crewList.map((crewItem, idx) => (
            <div key={idx} className="w-32 shrink-0 flex flex-col items-center text-center group cursor-pointer">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border border-white/15 bg-white/5 mb-2.5 shadow-lg group-hover:border-[#eb4e62] transition-colors relative">
                <img
                  src={crewItem.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&q=80"}
                  alt={crewItem.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#eb4e62] transition-colors leading-tight line-clamp-1">
                {crewItem.name}
              </h4>
              <p className="text-[11px] text-white/50 font-medium line-clamp-1">{crewItem.role || "Crew"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. TOP REVIEWS SECTION (MATCHING SCREENSHOT 3) */}
      <div id="top-reviews-section" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-16 text-left space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">Top reviews</h2>
            <span
              onClick={() => setIsRateModalOpen(true)}
              className="text-xs sm:text-sm font-bold text-[#eb4e62] hover:underline cursor-pointer flex items-center gap-1"
            >
              {movie.votes || "1.9K reviews"} <ChevronRight className="w-4 h-4" />
            </span>
          </div>

          <button
            onClick={() => setIsRateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#eb4e62] hover:text-white border border-white/15 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            + Write a Review
          </button>
        </div>

        {/* HASHTAG PILL SUMMARY BAR */}
        <div className="space-y-2">
          <p className="text-xs text-white/50 uppercase font-bold tracking-wider">Summary of reviews</p>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setSelectedTagFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedTagFilter === "ALL"
                  ? "bg-[#eb4e62] text-white border-[#eb4e62] shadow-lg shadow-[#eb4e62]/20"
                  : "bg-white/5 text-white/70 border-white/10 hover:border-white/30"
              }`}
            >
              All Reviews ({reviewsList.length})
            </button>
            {reviewTagsSummary.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTagFilter(selectedTagFilter === item.tag ? "ALL" : item.tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  selectedTagFilter === item.tag
                    ? "bg-[#eb4e62] text-white border-[#eb4e62] shadow-lg shadow-[#eb4e62]/20"
                    : "bg-white/5 text-white/70 border-white/10 hover:border-white/30"
                }`}
              >
                <span className="text-[#eb4e62]">{item.tag}</span>{" "}
                <span className="text-white/50 text-[10px] ml-1">{item.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* REVIEWS CARDS HORIZONTAL SCROLL CAROUSEL */}
        <div className="relative">
          <div
            ref={reviewsScrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-none scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            {filteredReviews.map((rev) => {
              const currentLikes = reviewLikes[rev.id] ?? rev.likes;
              const isLiked = userLikedReviews[rev.id] ?? false;

              return (
                <div
                  key={rev.id}
                  className="w-80 sm:w-96 shrink-0 bg-[#141416] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-white/25 transition-all"
                >
                  <div className="space-y-3">
                    {/* Reviewer Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/15 shrink-0 flex items-center justify-center">
                          {rev.userAvatar ? (
                            <img src={rev.userAvatar} alt={rev.userName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-white/50" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{rev.userName}</h4>
                          <p className="text-[11px] text-white/50 flex items-center gap-1">
                            Booked on <span className="font-bold text-[#eb4e62]">CineVenue</span>
                          </p>
                        </div>
                      </div>

                      {/* Red Star Rating Badge */}
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10">
                        <Star className="w-3.5 h-3.5 fill-[#eb4e62] text-[#eb4e62]" />
                        <span className="text-xs font-black text-white">{rev.rating}/10</span>
                      </div>
                    </div>

                    {/* Hashtags */}
                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {rev.tags.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[11px] font-bold text-white/90 bg-white/5 px-2 py-0.5 rounded-md border border-white/5"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Review Body */}
                    <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">{rev.comment}</p>
                  </div>

                  {/* Review Footer with Likes, Dislikes, TimeAgo, Share */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleReviewLike(rev.id)}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isLiked ? "text-[#eb4e62] font-bold" : "hover:text-white"
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? "fill-[#eb4e62]" : ""}`} />
                        <span>{currentLikes}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span>{rev.timeAgo}</span>
                      <button onClick={handleShare} className="hover:text-white transition-colors cursor-pointer">
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7. OFFICIAL TRAILERS & TEASERS (MEDIA STREAM) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-16 text-left space-y-6">
        <div className="border-b border-white/10 pb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#eb4e62] block mb-1">
            Official Media Stream
          </span>
          <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Clapperboard className="w-6 h-6 text-[#eb4e62]" />
            Trailers & Teasers ({activeVideos.length})
          </h2>
        </div>

        {activeVideos.length === 0 ? (
          <div className="text-center py-10 bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <Film className="w-8 h-8 text-white/30 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">Trailers Coming Soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => setActiveVideoModal(video)}
                className="group bg-[#141416] border border-white/10 rounded-2xl overflow-hidden hover:border-[#eb4e62] transition-all duration-300 shadow-xl cursor-pointer flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden bg-black/60">
                  <img
                    src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                    <div className="w-12 h-12 rounded-full bg-[#eb4e62] text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white translate-x-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#eb4e62] text-white shadow font-extrabold">
                      {video.type}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-grow justify-between space-y-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-[#eb4e62] transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-white/50 pt-2 border-t border-white/5">
                    <span>{video.language || movie.lang}</span>
                    <span className="text-[#eb4e62] font-semibold flex items-center gap-1">
                      <Play className="w-3 h-3 fill-[#eb4e62]" /> Watch
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 8. INTERACTIVE "RATE NOW" REVIEW MODAL */}
      {isRateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-white/15 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Rate & Review {movie.title}</h3>
                <p className="text-xs text-white/60">Share your theatrical experience with other moviegoers</p>
              </div>
              <button
                onClick={() => setIsRateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4 text-left">
              {/* Star Rating Score Picker (1 to 10) */}
              <div>
                <label className="text-xs font-bold text-white/80 block mb-2">How would you rate this movie?</label>
                <div className="flex items-center justify-between bg-black/50 p-3 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setUserRatingScore(num)}
                        className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          userRatingScore >= num
                            ? "bg-[#eb4e62] text-white shadow-md shadow-[#eb4e62]/30 scale-105"
                            : "bg-white/5 text-white/40 hover:bg-white/10"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className="text-right pl-2">
                    <span className="text-base font-black text-[#eb4e62]">{userRatingScore}</span>
                    <span className="text-xs text-white/40">/10</span>
                  </div>
                </div>
              </div>

              {/* Review Hashtags */}
              <div>
                <label className="text-xs font-bold text-white/80 block mb-2">Select Hashtags</label>
                <div className="flex flex-wrap gap-2">
                  {["#Blockbuster", "#SuperDirection", "#GreatActing", "#AwesomeStory", "#Wellmade", "#MustWatch"].map(
                    (tag) => {
                      const selected = selectedReviewTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setSelectedReviewTags(selectedReviewTags.filter((t) => t !== tag));
                            } else {
                              setSelectedReviewTags([...selectedReviewTags, tag]);
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
                  value={userReviewerName}
                  onChange={(e) => setUserReviewerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#eb4e62]"
                />
              </div>

              {/* Review comment */}
              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">Your Review</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tell us what you liked about the acting, direction, or story..."
                  value={userReviewText}
                  onChange={(e) => setUserReviewText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#eb4e62] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#eb4e62] hover:bg-[#d63e51] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#eb4e62]/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YOUTUBE MODAL PLAYER */}
      {activeVideoModal && (
        <YouTubePlayerModal
          isOpen={!!activeVideoModal}
          video={activeVideoModal}
          movieTitle={movie.title}
          onClose={() => setActiveVideoModal(null)}
        />
      )}
    </div>
  );
}
