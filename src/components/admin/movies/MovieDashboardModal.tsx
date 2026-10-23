import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Star,
  Users,
  Film,
  Ticket,
  TrendingUp,
  Building2,
  Calendar,
  Clock,
  Play,
  Award,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  DollarSign,
  Layers,
  MapPin,
  FileText,
  UserCheck,
  Edit,
  BarChart3,
  Sliders,
  ShieldAlert,
  Share2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Download,
  AlertTriangle,
  Tag,
  Send,
  Megaphone,
  Check,
  RefreshCw,
  Search,
  Filter,
  CheckSquare
} from "lucide-react";
import { Movie, Booking, Theatre, MovieSchedule, CastMember, CrewMember, MovieReview } from "../../../types";
import { formatRating, parseRatingNumber } from "../../../utils/ratingFormatter";
import { calculateRevenueMetrics, filterBookings, isDateWithinFilter } from "../../../services/revenueService";
import { apiClient } from "../../../services/apiClient";

interface MovieDashboardModalProps {
  isOpen: boolean;
  movie: Movie | null;
  onClose: () => void;
  bookings?: Booking[];
  theatres?: Theatre[];
  schedules?: MovieSchedule[];
  onOpenCastCrewEditor?: (movie: Movie) => void;
  onEditMovieSpecs?: (movie: Movie) => void;
  onUpdateMovie?: (updatedMovie: Movie) => void;
  auditLogs?: any[];
  onAddAuditLog?: (action: string) => void;
}

type DashboardTab =
  | "overview"
  | "castcrew"
  | "shows"
  | "analytics"
  | "reviews"
  | "promotions"
  | "settings";

export default function MovieDashboardModal({
  isOpen,
  movie,
  onClose,
  bookings = [],
  theatres = [],
  schedules = [],
  onOpenCastCrewEditor,
  onEditMovieSpecs,
  onUpdateMovie,
  auditLogs = [],
  onAddAuditLog,
}: MovieDashboardModalProps) {
  if (!isOpen || !movie) return null;

  // Local state for active tab
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  // Date range filter for analytics & shows
  const [dateRange, setDateRange] = useState<"all" | "today" | "last7days" | "last30days">("all");

  // Local editable movie state to allow real-time changes inside the dashboard
  const [currentMovie, setCurrentMovie] = useState<Movie>(movie);
  useEffect(() => {
    setCurrentMovie(movie);
  }, [movie]);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Normalized movie title for matching
  const movieTitleNorm = (currentMovie.title || "").trim().toLowerCase();

  // Filter bookings for this movie
  const movieBookings = useMemo(() => {
    return bookings.filter((b) => {
      const bTitle = (b.movieTitle || "").trim().toLowerCase();
      return bTitle === movieTitleNorm;
    });
  }, [bookings, movieTitleNorm]);

  // Filter schedules for this movie
  const movieSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const sTitle = (s.movieTitle || "").trim().toLowerCase();
      return sTitle === movieTitleNorm;
    });
  }, [schedules, movieTitleNorm]);

  // Associated theatres screening this movie
  const associatedTheatres = useMemo(() => {
    const theatreNames = new Set(movieSchedules.map((s) => (s.theatreName || "").trim().toLowerCase()));
    return theatres.filter((t) => theatreNames.has((t.name || "").trim().toLowerCase()));
  }, [theatres, movieSchedules]);

  // -------------------------------------------------------------
  // REVENUE & SALES CALCULATIONS (Authoritative Decimal Engine)
  // -------------------------------------------------------------
  const revenueMetrics = useMemo(() => {
    return calculateRevenueMetrics(movieBookings, {
      range: dateRange,
    });
  }, [movieBookings, dateRange]);

  // Confirmed bookings in range
  const filteredBookingsInRange = useMemo(() => {
    return filterBookings(movieBookings, { range: dateRange });
  }, [movieBookings, dateRange]);

  const confirmedBookingsInRange = useMemo(() => {
    return filteredBookingsInRange.filter(
      (b) =>
        b.status !== "Cancelled" &&
        b.status !== "Failed" &&
        (b as any).ticketStatus !== "CANCELLED" &&
        (b as any).paymentStatus !== "FAILED"
    );
  }, [filteredBookingsInRange]);

  // Today bookings
  const todayBookings = useMemo(() => {
    return movieBookings.filter((b) => isDateWithinFilter(b.createdAt || b.date, { range: "today" }));
  }, [movieBookings]);

  const ticketsSoldToday = useMemo(() => {
    return todayBookings
      .filter((b) => b.status !== "Cancelled" && b.status !== "Failed")
      .reduce((acc, b) => {
        const seatsAny = b.seats as any;
        if (Array.isArray(seatsAny)) return acc + seatsAny.length;
        if (typeof seatsAny === "string" && seatsAny) return acc + seatsAny.split(",").filter(Boolean).length;
        return acc + 1;
      }, 0);
  }, [todayBookings]);

  // Occupancy estimate across all shows
  const totalCapacityAcrossShows = useMemo(() => {
    return movieSchedules.reduce((acc, s) => {
      const cap = (s as any).totalSeats || (s as any).capacity || 150;
      return acc + Number(cap);
    }, 0);
  }, [movieSchedules]);

  const occupancyRate = useMemo(() => {
    if (totalCapacityAcrossShows <= 0) return 0;
    const rate = (revenueMetrics.ticketsSold / totalCapacityAcrossShows) * 100;
    return Math.min(Math.round(rate), 100);
  }, [revenueMetrics.ticketsSold, totalCapacityAcrossShows]);

  // -------------------------------------------------------------
  // TAB 2: CAST & CREW STATE & HANDLERS
  // -------------------------------------------------------------
  const initialCast: CastMember[] = useMemo(() => {
    if (currentMovie.castMembers && currentMovie.castMembers.length > 0) return currentMovie.castMembers;
    if (Array.isArray(currentMovie.cast) && currentMovie.cast.length > 0 && typeof currentMovie.cast[0] === "object") {
      return currentMovie.cast as CastMember[];
    }
    if (Array.isArray(currentMovie.cast) && currentMovie.cast.length > 0) {
      return (currentMovie.cast as string[]).map((name) => ({
        name,
        role: "Actor",
        character: "Lead Character",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
      }));
    }
    return [
      { name: "Lead Star", role: "Actor", character: "Protagonist", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80" },
      { name: "Co-Star", role: "Actor", character: "Leading Lady", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80" },
    ];
  }, [currentMovie]);

  const initialCrew: CrewMember[] = useMemo(() => {
    if (currentMovie.crewMembers && currentMovie.crewMembers.length > 0) return currentMovie.crewMembers;
    if (currentMovie.crew && currentMovie.crew.length > 0) return currentMovie.crew;
    return [
      { name: currentMovie.director || "Director", role: "Director", image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&q=80" },
      { name: currentMovie.distributor || "Producer", role: "Producer", image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&q=80" },
      { name: "Music Director", role: "Music Director", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80" },
    ];
  }, [currentMovie]);

  const [castList, setCastList] = useState<CastMember[]>(initialCast);
  const [crewList, setCrewList] = useState<CrewMember[]>(initialCrew);

  // New Cast Member Form
  const [newCastName, setNewCastName] = useState("");
  const [newCastCharacter, setNewCastCharacter] = useState("");
  const [newCastRole, setNewCastRole] = useState("Actor");
  const [newCastPhoto, setNewCastPhoto] = useState("");

  // New Crew Member Form
  const [newCrewName, setNewCrewName] = useState("");
  const [newCrewRole, setNewCrewRole] = useState("Director");
  const [newCrewPhoto, setNewCrewPhoto] = useState("");

  const handleAddCastMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCastName.trim()) return;
    const member: CastMember = {
      name: newCastName.trim(),
      character: newCastCharacter.trim() || "Character",
      role: newCastRole || "Actor",
      image: newCastPhoto.trim() || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&q=80",
    };
    const updated = [...castList, member];
    setCastList(updated);
    setNewCastName("");
    setNewCastCharacter("");
    setNewCastPhoto("");
    persistMovieUpdates({ castMembers: updated, cast: updated });
    showToast(`Added ${member.name} to cast`);
  };

  const handleRemoveCastMember = (idx: number) => {
    const updated = castList.filter((_, i) => i !== idx);
    setCastList(updated);
    persistMovieUpdates({ castMembers: updated, cast: updated });
    showToast("Removed cast member");
  };

  const handleMoveCast = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= castList.length) return;
    const updated = [...castList];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setCastList(updated);
    persistMovieUpdates({ castMembers: updated, cast: updated });
  };

  const handleAddCrewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrewName.trim()) return;
    const member: CrewMember = {
      name: newCrewName.trim(),
      role: newCrewRole.trim() || "Crew",
      image: newCrewPhoto.trim() || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&q=80",
    };
    const updated = [...crewList, member];
    setCrewList(updated);
    setNewCrewName("");
    setNewCrewPhoto("");
    persistMovieUpdates({ crewMembers: updated, crew: updated });
    showToast(`Added ${member.name} to crew`);
  };

  const handleRemoveCrewMember = (idx: number) => {
    const updated = crewList.filter((_, i) => i !== idx);
    setCrewList(updated);
    persistMovieUpdates({ crewMembers: updated, crew: updated });
    showToast("Removed crew member");
  };

  // -------------------------------------------------------------
  // TAB 3: SHOWS & THEATRES FILTER STATE
  // -------------------------------------------------------------
  const [showCityFilter, setShowCityFilter] = useState("all");
  const [showFormatFilter, setShowFormatFilter] = useState("all");
  const [showSearch, setShowSearch] = useState("");

  const filteredShows = useMemo(() => {
    return movieSchedules.filter((sch) => {
      if (showCityFilter !== "all") {
        const theatre = theatres.find((t) => (t.name || "").toLowerCase() === (sch.theatreName || "").toLowerCase());
        if (theatre && (theatre.city || "").toLowerCase() !== showCityFilter.toLowerCase()) return false;
      }
      if (showFormatFilter !== "all") {
        const formatStr = (sch as any).format || "2D";
        if (!formatStr.toLowerCase().includes(showFormatFilter.toLowerCase())) return false;
      }
      if (showSearch.trim()) {
        const q = showSearch.toLowerCase();
        const tMatch = (sch.theatreName || "").toLowerCase().includes(q);
        const sMatch = (sch.screenName || "").toLowerCase().includes(q);
        if (!tMatch && !sMatch) return false;
      }
      return true;
    });
  }, [movieSchedules, showCityFilter, showFormatFilter, showSearch, theatres]);

  // Unique cities from theatres
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    theatres.forEach((t) => {
      if (t.city) set.add(t.city);
    });
    return Array.from(set);
  }, [theatres]);

  // -------------------------------------------------------------
  // TAB 5: REVIEWS & MODERATION STATE
  // -------------------------------------------------------------
  const [reviewsList, setReviewsList] = useState<MovieReview[]>(() => {
    if (currentMovie.reviews && currentMovie.reviews.length > 0) return currentMovie.reviews;
    return [
      {
        id: "rev-1",
        userName: "Vamsi Krishna",
        userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
        isVerifiedBooking: true,
        rating: 10,
        tags: ["#Blockbuster", "#GreatActing", "#AwesomeDirection"],
        comment: `Outstanding cinematic execution! ${currentMovie.title} delivers high octane entertainment, fantastic visuals, and phenomenal sound design.`,
        likes: 124,
        timeAgo: "2 hours ago",
      },
      {
        id: "rev-2",
        userName: "Sneha Reddy",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
        isVerifiedBooking: true,
        rating: 9,
        tags: ["#MustWatch", "#FamilyEntertainer"],
        comment: `A thoroughly engaging theatrical experience. Great background music and memorable performances all around.`,
        likes: 68,
        timeAgo: "Yesterday",
      },
      {
        id: "rev-3",
        userName: "Arjun Rao",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
        isVerifiedBooking: false,
        rating: 8,
        tags: ["#GoodVisuals"],
        comment: `Solid first half with top tier production values. Worth watching on an IMAX or EPIQ large format screen!`,
        likes: 31,
        timeAgo: "3 days ago",
      },
    ];
  });

  const [hiddenReviewIds, setHiddenReviewIds] = useState<Set<string>>(new Set());

  const handleToggleHideReview = (id: string) => {
    const next = new Set(hiddenReviewIds);
    if (next.has(id)) {
      next.delete(id);
      showToast("Review restored to public visibility");
    } else {
      next.add(id);
      showToast("Review hidden from public feed");
    }
    setHiddenReviewIds(next);
  };

  const handleDeleteReview = (id: string) => {
    const updated = reviewsList.filter((r) => r.id !== id);
    setReviewsList(updated);
    persistMovieUpdates({ reviews: updated });
    showToast("Review permanently removed");
  };

  // -------------------------------------------------------------
  // TAB 6: MARKETING & PROMOTIONS STATE
  // -------------------------------------------------------------
  const [isFeaturedOnHome, setIsFeaturedOnHome] = useState(Boolean(currentMovie.isSpotlight));
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoDiscountInput, setPromoDiscountInput] = useState("20");
  const [movieCoupons, setMovieCoupons] = useState<Array<{ code: string; discount: number; active: boolean }>>([
    { code: `${(currentMovie.title || "CINEMA").slice(0, 4).toUpperCase()}50`, discount: 50, active: true },
    { code: "CINEVIP20", discount: 20, active: true },
  ]);

  const handleAddMovieCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;
    const newCoupon = {
      code: promoCodeInput.trim().toUpperCase(),
      discount: Number(promoDiscountInput) || 20,
      active: true,
    };
    setMovieCoupons([newCoupon, ...movieCoupons]);
    setPromoCodeInput("");
    showToast(`Created promotion code: ${newCoupon.code}`);
  };

  const handleToggleMovieCoupon = (code: string) => {
    setMovieCoupons(
      movieCoupons.map((c) => (c.code === code ? { ...c, active: !c.active } : c))
    );
    showToast(`Updated coupon status for ${code}`);
  };

  // -------------------------------------------------------------
  // TAB 7: SETTINGS & GENERAL PERSISTENCE
  // -------------------------------------------------------------
  const [movieStatusInput, setMovieStatusInput] = useState(currentMovie.status || "NOW_SHOWING");
  const [isPublicVisible, setIsPublicVisible] = useState(currentMovie.isActive !== false);
  const [trailerUrlInput, setTrailerUrlInput] = useState(currentMovie.trailerUrl || currentMovie.trailer || "");
  const [synopsisInput, setSynopsisInput] = useState(
    currentMovie.description ||
      `Experience the cinematic spectacle of ${currentMovie.title}. Featuring grand visual design, compelling character arcs, and world-class theatrical sound dynamics.`
  );
  const [durationInput, setDurationInput] = useState(currentMovie.duration || "148 mins");
  const [genresInput, setGenresInput] = useState(currentMovie.genre || "Action, Drama");
  const [languagesInput, setLanguagesInput] = useState(currentMovie.lang || currentMovie.language || "Telugu");
  const [certificationInput, setCertificationInput] = useState(currentMovie.certification || currentMovie.certificate || "UA");
  const [distributorInput, setDistributorInput] = useState(currentMovie.distributor || "CineVenue Network");
  const [posterUrlInput, setPosterUrlInput] = useState(currentMovie.poster || currentMovie.img || "");
  const [backdropUrlInput, setBackdropUrlInput] = useState(currentMovie.banner || currentMovie.poster || "");

  // Archival confirmation guard modal
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);

  // Helper to persist updates to Backend and parent
  const persistMovieUpdates = async (patch: Partial<Movie>) => {
    const updated: Movie = {
      ...currentMovie,
      ...patch,
    };
    setCurrentMovie(updated);

    // Save to localStorage
    const saved = localStorage.getItem("cine_movies");
    if (saved) {
      try {
        const list: Movie[] = JSON.parse(saved);
        const idx = list.findIndex(
          (m) => (m.id && m.id === updated.id) || m.title.toLowerCase() === updated.title.toLowerCase()
        );
        if (idx >= 0) {
          list[idx] = updated;
          localStorage.setItem("cine_movies", JSON.stringify(list));
        }
      } catch (e) {
        console.warn("Storage sync notice:", e);
      }
    }

    // Call onUpdateMovie callback
    if (onUpdateMovie) {
      onUpdateMovie(updated);
    }

    // Persist to backend API
    try {
      const targetId = updated.id || updated.title;
      await apiClient.put(`/movies/${encodeURIComponent(String(targetId))}`, {
        title: updated.title,
        description: updated.description,
        posterUrl: updated.poster || updated.img,
        backdropUrl: updated.banner,
        trailerUrl: updated.trailerUrl,
        duration: parseInt(updated.duration || "150") || 150,
        rating: parseRatingNumber(updated.rating, 9.0),
        status: updated.status,
        isActive: updated.isActive,
        genres: typeof updated.genre === "string" ? updated.genre.split(",").map((s) => s.trim()) : updated.genre,
        languages: typeof updated.lang === "string" ? [updated.lang] : updated.lang,
        distributor: updated.distributor,
      });
    } catch (err) {
      console.warn("Backend API sync notice:", err);
    }

    if (onAddAuditLog) {
      onAddAuditLog(`Updated movie details for ${updated.title}`);
    }
  };

  const handleSaveAllSettings = () => {
    persistMovieUpdates({
      status: movieStatusInput,
      isActive: isPublicVisible,
      trailerUrl: trailerUrlInput,
      description: synopsisInput,
      duration: durationInput,
      genre: genresInput,
      lang: languagesInput,
      language: languagesInput,
      certification: certificationInput,
      certificate: certificationInput as any,
      distributor: distributorInput,
      poster: posterUrlInput,
      img: posterUrlInput,
      banner: backdropUrlInput,
      isSpotlight: isFeaturedOnHome,
    });
    showToast("Movie settings saved and synchronized!");
  };

  const handleConfirmArchive = () => {
    setIsArchiveConfirmOpen(false);
    persistMovieUpdates({
      status: "ARCHIVED",
      isActive: false,
    });
    showToast(`Movie '${currentMovie.title}' has been archived.`);
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = "Booking ID,Customer,Theatre,Date,Tickets,Gross Amount,Status\n";
    const rows = confirmedBookingsInRange.map((b) => {
      const seatCount = Array.isArray(b.seats) ? b.seats.length : 1;
      const amount = Number(b.totalPrice || b.totalAmount || b.ticketAmount || 0);
      return `"${b.id || b.bookingNumber}","${b.userName || "Customer"}","${b.theatreName || "Multiplex"}","${b.date || b.createdAt || "N/A"}",${seatCount},₹${amount},"${b.status}"`;
    });
    const csvContent = headers + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(currentMovie.title || "movie").replace(/\s+/g, "_")}_sales_report.csv`;
    link.click();
    showToast("Downloaded Sales Report CSV");
  };

  // -------------------------------------------------------------
  // RENDER MODAL CONTENT
  // -------------------------------------------------------------
  const modalContent = (
    <div
      className="fixed inset-0 z-[999999] w-screen h-screen flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#0B0B0E] border border-gold/40 rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl shadow-black/95 overflow-hidden text-white relative my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP GLOW ACCENT BAR */}
        <div className="h-1 bg-gradient-to-r from-amber-600 via-gold to-yellow-400 w-full" />

        {/* TOAST FEEDBACK NOTIFICATION */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gold text-black px-4 py-2 rounded-full font-bold text-xs shadow-xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. TOP HEADER & METADATA BAR */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-gradient-to-b from-[#141418] to-[#0B0B0E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {/* Poster Thumbnail */}
            <div className="relative group shrink-0">
              <img
                src={
                  currentMovie.poster ||
                  currentMovie.img ||
                  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80"
                }
                alt={currentMovie.title}
                className="w-16 h-22 sm:w-20 sm:h-28 object-cover rounded-xl border border-gold/40 shadow-lg shadow-black/80"
              />
              <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-gold text-black shadow">
                {currentMovie.certification || currentMovie.certificate || "UA"}
              </span>
            </div>

            {/* Movie Title & Badges */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-gold border border-gold/30">
                  CineVenue Movie Dashboard
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                    currentMovie.status === "NOW_SHOWING"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : currentMovie.status === "UPCOMING"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : "bg-neutral-800 text-neutral-400 border-neutral-700"
                  }`}
                >
                  ● {currentMovie.status || "NOW_SHOWING"}
                </span>
                {currentMovie.isSpotlight && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Featured
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wide truncate">
                {currentMovie.title}
              </h2>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-neutral-400 font-medium">
                <span>{currentMovie.lang || currentMovie.language || "Telugu"}</span>
                <span>•</span>
                <span>{currentMovie.genre || "Action, Drama"}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gold" />
                  {currentMovie.duration || "148 mins"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-gold font-bold">
                  <Star className="w-3 h-3 fill-gold text-gold" />
                  {formatRating(currentMovie.rating, "9.0/10")}
                </span>
              </div>
            </div>
          </div>

          {/* Top Actions & Close */}
          <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
            {/* Date Range Selector */}
            <div className="flex items-center bg-black/60 border border-white/10 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setDateRange("all")}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  dateRange === "all" ? "bg-gold text-black font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDateRange("today")}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  dateRange === "today" ? "bg-gold text-black font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateRange("last7days")}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  dateRange === "last7days" ? "bg-gold text-black font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setDateRange("last30days")}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  dateRange === "last30days" ? "bg-gold text-black font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                30D
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              title="Close Dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. NAVIGATION TABS (All 7 Required Sections) */}
        <div className="flex items-center gap-1 overflow-x-auto px-4 sm:px-6 pt-3 pb-2 border-b border-white/10 bg-[#0E0E12] no-scrollbar">
          {[
            { id: "overview", label: "Overview", icon: FileText },
            { id: "castcrew", label: "Cast & Crew", icon: Users, badge: castList.length },
            { id: "shows", label: "Shows & Theatres", icon: Building2, badge: movieSchedules.length },
            { id: "analytics", label: "Sales & Analytics", icon: TrendingUp },
            { id: "reviews", label: "Ratings & Reviews", icon: Star, badge: reviewsList.length },
            { id: "promotions", label: "Marketing & Promos", icon: Sparkles },
            { id: "settings", label: "Movie Settings", icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DashboardTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-gold/20 to-amber-500/10 text-gold border border-gold/40 shadow-sm shadow-gold/20"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-gold" : "text-neutral-400"}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? "bg-gold text-black" : "bg-white/10 text-neutral-400"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 3. SCROLLABLE TAB CONTENT BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* ========================================================= */}
          {/* TAB 1: OVERVIEW */}
          {/* ========================================================= */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Hero Banner Backdrop */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 h-48 sm:h-64 bg-neutral-900 group">
                <img
                  src={
                    currentMovie.banner ||
                    currentMovie.poster ||
                    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80"
                  }
                  alt={currentMovie.title}
                  className="w-full h-full object-cover object-center filter brightness-65 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0E] via-black/40 to-transparent flex flex-col justify-end p-6">
                  <span className="text-xs uppercase tracking-widest text-gold font-bold mb-1">
                    Official Theatrical Catalog
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">{currentMovie.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl line-clamp-2 mt-1">
                    {synopsisInput}
                  </p>
                </div>

                {/* Trailer Quick Watch Button */}
                {trailerUrlInput && (
                  <a
                    href={trailerUrlInput}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-gold hover:text-black text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-sm cursor-pointer shadow-lg"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch Official Trailer</span>
                  </a>
                )}
              </div>

              {/* 4 Core Quick Performance KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-xl bg-[#141419] border border-white/10 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-neutral-400 text-xs font-medium mb-2">
                    <span>Confirmed Tickets</span>
                    <Ticket className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{revenueMetrics.ticketsSold.toLocaleString()}</div>
                  <div className="text-[11px] text-emerald-400 mt-1">
                    +{ticketsSoldToday} sold today
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#141419] border border-white/10 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-neutral-400 text-xs font-medium mb-2">
                    <span>Gross Sales Value</span>
                    <DollarSign className="w-4 h-4 text-gold" />
                  </div>
                  <div className="text-2xl font-black text-gold">
                    ₹{revenueMetrics.grossBookingValue.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">Across all screened cinemas</div>
                </div>

                <div className="p-4 rounded-xl bg-[#141419] border border-white/10 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-neutral-400 text-xs font-medium mb-2">
                    <span>Audience Rating</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {formatRating(currentMovie.rating, "9.0/10")}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    {currentMovie.votes || "2.5K+ Verified Votes"}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#141419] border border-white/10 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-neutral-400 text-xs font-medium mb-2">
                    <span>Theatres & Shows</span>
                    <Building2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {associatedTheatres.length} Theatres
                  </div>
                  <div className="text-[11px] text-blue-400 mt-1">
                    {movieSchedules.length} active showtimes
                  </div>
                </div>
              </div>

              {/* Detailed Specs & Attributes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Metadata Table */}
                <div className="p-5 rounded-2xl bg-[#121216] border border-white/10 space-y-3.5">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-gold flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" /> Movie Specifications & Identifiers
                  </h4>
                  <div className="divide-y divide-white/5 text-xs">
                    <div className="py-2 flex justify-between">
                      <span className="text-neutral-400">Original Language</span>
                      <span className="font-semibold text-white">{currentMovie.lang || "Telugu"}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-neutral-400">Available Dubbed Audio</span>
                      <span className="font-semibold text-neutral-200">
                        {currentMovie.additionalLanguages?.join(", ") || "Hindi, Tamil, Malayalam"}
                      </span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-neutral-400">Genres</span>
                      <span className="font-semibold text-white">{currentMovie.genre || "Action, Drama"}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-neutral-400">Runtime</span>
                      <span className="font-semibold text-white">{currentMovie.duration || "148 mins"}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-neutral-400">Release Date</span>
                      <span className="font-semibold text-white">
                        {currentMovie.releaseDate || "Now In Cinemas"}
                      </span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-neutral-400">CBFC Certification</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/10 font-bold text-white">
                        {currentMovie.certification || currentMovie.certificate || "UA"}
                      </span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-neutral-400">Distributor</span>
                      <span className="font-semibold text-neutral-200">{distributorInput}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Lifecycle Controls */}
                <div className="p-5 rounded-2xl bg-[#121216] border border-white/10 space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs uppercase font-bold tracking-wider text-gold flex items-center gap-1.5 mb-3">
                      <Sliders className="w-3.5 h-3.5" /> Administration & Lifecycle
                    </h4>
                    <p className="text-xs text-neutral-400 mb-4">
                      Control theatrical catalog visibility, feature on homepage spotlights, and manage administrative status.
                    </p>

                    <div className="space-y-3">
                      {/* Customer Visibility Toggle */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                        <div className="flex items-center gap-2.5">
                          {isPublicVisible ? (
                            <Eye className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-amber-400" />
                          )}
                          <div>
                            <div className="text-xs font-bold text-white">Public Customer Visibility</div>
                            <div className="text-[10px] text-neutral-400">
                              {isPublicVisible ? "Live and bookable on CineVenue" : "Hidden / Inactive for public"}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const next = !isPublicVisible;
                            setIsPublicVisible(next);
                            persistMovieUpdates({ isActive: next });
                            showToast(`Visibility set to ${next ? "Public" : "Hidden"}`);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            isPublicVisible
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                          }`}
                        >
                          {isPublicVisible ? "Published" : "Hidden"}
                        </button>
                      </div>

                      {/* Featured Spotlight Toggle */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="w-4 h-4 text-gold" />
                          <div>
                            <div className="text-xs font-bold text-white">Homepage Spotlight Banner</div>
                            <div className="text-[10px] text-neutral-400">
                              Pin this title to the top hero slider
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const next = !isFeaturedOnHome;
                            setIsFeaturedOnHome(next);
                            persistMovieUpdates({ isSpotlight: next });
                            showToast(`Spotlight ${next ? "enabled" : "disabled"}`);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            isFeaturedOnHome
                              ? "bg-gold text-black font-extrabold"
                              : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                          }`}
                        >
                          {isFeaturedOnHome ? "Featured" : "Standard"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Full Specs</span>
                    </button>
                    <button
                      onClick={() => setIsArchiveConfirmOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Archive</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: CAST & CREW */}
          {/* ========================================================= */}
          {activeTab === "castcrew" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141419] p-4 rounded-xl border border-white/10">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-gold" /> Cast & Crew Production Portfolio
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Manage actors, character names, director, composers, and crew with profile photos.
                  </p>
                </div>
                {onOpenCastCrewEditor && (
                  <button
                    onClick={() => {
                      onOpenCastCrewEditor(currentMovie);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-gold text-black font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-center shadow"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Open Cloudinary Media Uploader</span>
                  </button>
                )}
              </div>

              {/* Cast Members Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs uppercase font-bold tracking-wider text-gold">
                    Leading & Supporting Cast ({castList.length})
                  </h5>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {castList.map((member, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#121216] border border-white/10 flex items-center justify-between gap-3 group hover:border-gold/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={
                            member.image ||
                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80"
                          }
                          alt={member.name}
                          className="w-11 h-11 rounded-full object-cover border border-white/20 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{member.name}</div>
                          <div className="text-[11px] text-gold truncate">as {member.character || member.role}</div>
                          <div className="text-[10px] text-neutral-500">{member.role || "Actor"}</div>
                        </div>
                      </div>

                      {/* Reorder and Delete Actions */}
                      <div className="flex flex-col gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveCast(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 rounded bg-white/5 hover:bg-white/15 text-neutral-300 disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleMoveCast(idx, "down")}
                            disabled={idx === castList.length - 1}
                            className="p-1 rounded bg-white/5 hover:bg-white/15 text-neutral-300 disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveCastMember(idx)}
                          className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Cast Form */}
                <form
                  onSubmit={handleAddCastMember}
                  className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-wrap items-center gap-2 text-xs"
                >
                  <input
                    type="text"
                    placeholder="Actor Name (e.g. Sree Vishnu)"
                    value={newCastName}
                    onChange={(e) => setNewCastName(e.target.value)}
                    className="flex-1 min-w-[140px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-gold"
                  />
                  <input
                    type="text"
                    placeholder="Character Name (e.g. Kalyan)"
                    value={newCastCharacter}
                    onChange={(e) => setNewCastCharacter(e.target.value)}
                    className="flex-1 min-w-[140px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-gold"
                  />
                  <input
                    type="text"
                    placeholder="Photo URL (optional)"
                    value={newCastPhoto}
                    onChange={(e) => setNewCastPhoto(e.target.value)}
                    className="flex-1 min-w-[180px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-gold"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-gold text-black font-bold hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Cast
                  </button>
                </form>
              </div>

              {/* Crew Members Section */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h5 className="text-xs uppercase font-bold tracking-wider text-gold">
                  Technical Crew & Production Department ({crewList.length})
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {crewList.map((member, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#121216] border border-white/10 flex items-center justify-between gap-3 group hover:border-gold/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={
                            member.image ||
                            "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80"
                          }
                          alt={member.name}
                          className="w-11 h-11 rounded-full object-cover border border-white/20 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{member.name}</div>
                          <div className="text-[11px] text-amber-300 truncate">{member.role}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveCrewMember(idx)}
                        className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Crew Form */}
                <form
                  onSubmit={handleAddCrewMember}
                  className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-wrap items-center gap-2 text-xs"
                >
                  <input
                    type="text"
                    placeholder="Crew Member Name"
                    value={newCrewName}
                    onChange={(e) => setNewCrewName(e.target.value)}
                    className="flex-1 min-w-[140px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-gold"
                  />
                  <input
                    type="text"
                    placeholder="Department / Role (e.g. Director, Music)"
                    value={newCrewRole}
                    onChange={(e) => setNewCrewRole(e.target.value)}
                    className="flex-1 min-w-[140px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-gold"
                  />
                  <input
                    type="text"
                    placeholder="Photo URL (optional)"
                    value={newCrewPhoto}
                    onChange={(e) => setNewCrewPhoto(e.target.value)}
                    className="flex-1 min-w-[180px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-gold"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-black font-bold hover:bg-amber-300 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Crew
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: SHOWS & THEATRES */}
          {/* ========================================================= */}
          {activeTab === "shows" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Filter and Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141419] p-3.5 rounded-xl border border-white/10">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* City Filter */}
                  <select
                    value={showCityFilter}
                    onChange={(e) => setShowCityFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white focus:outline-none focus:border-gold"
                  >
                    <option value="all">All Cities</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>

                  {/* Format Filter */}
                  <select
                    value={showFormatFilter}
                    onChange={(e) => setShowFormatFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white focus:outline-none focus:border-gold"
                  >
                    <option value="all">All Formats</option>
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX">IMAX</option>
                    <option value="4DX">4DX</option>
                    <option value="EPIQ">EPIQ</option>
                  </select>

                  <span className="text-neutral-400 text-xs">
                    Showing {filteredShows.length} of {movieSchedules.length} screenings
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search theatre or screen..."
                    value={showSearch}
                    onChange={(e) => setShowSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Shows Screening List */}
              {filteredShows.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#121216] border border-white/10 space-y-2">
                  <Building2 className="w-10 h-10 text-neutral-600 mx-auto" />
                  <div className="text-sm font-bold text-neutral-300">No matching theatrical shows found</div>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Try adjusting your city, format, or search filters, or publish new schedules in the Show Publisher.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredShows.map((sch, idx) => {
                    const capacity = Number((sch as any).totalSeats || (sch as any).capacity || 150);
                    // Match bookings for this specific show or theatre
                    const showBookings = confirmedBookingsInRange.filter(
                      (b) =>
                        (b.theatreName || "").toLowerCase() === (sch.theatreName || "").toLowerCase() &&
                        (b.time || "").includes((sch as any).time || (sch as any).showTime || "")
                    );
                    const bookedTickets = showBookings.reduce((sum, b) => {
                      const seatsAny = b.seats as any;
                      if (Array.isArray(seatsAny)) return sum + seatsAny.length;
                      return sum + 1;
                    }, 0);
                    const availableSeats = Math.max(capacity - bookedTickets, 0);
                    const occupancy = Math.min(Math.round((bookedTickets / capacity) * 100), 100);

                    return (
                      <div
                        key={sch.id || idx}
                        className="p-4 rounded-xl bg-[#121216] border border-white/10 hover:border-gold/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                      >
                        {/* Theatre & Screen Info */}
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gold font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-2">
                              <span>{sch.theatreName || "Multiplex Partner Screen"}</span>
                              <span className="px-1.5 py-0.2 rounded bg-white/10 text-neutral-300 text-[10px] uppercase font-bold">
                                {(sch as any).format || "2D"}
                              </span>
                            </div>
                            <div className="text-neutral-400 text-xs flex items-center gap-2 mt-0.5">
                              <MapPin className="w-3 h-3 text-neutral-500" />
                              <span>Screen: {(sch as any).screenName || "Screen 1 (Main Auditorium)"}</span>
                              <span>•</span>
                              <span>{sch.date || "Today"}</span>
                              <span>•</span>
                              <span className="text-gold font-semibold">{(sch as any).time || (sch as any).showTime || "07:30 PM"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Capacity & Occupancy Status */}
                        <div className="flex items-center gap-6 shrink-0">
                          {/* Seat Stats */}
                          <div className="text-right">
                            <div className="font-bold text-white">
                              {bookedTickets} / {capacity} seats booked
                            </div>
                            <div className="text-[11px] text-emerald-400">
                              {availableSeats} available
                            </div>
                          </div>

                          {/* Progress Meter */}
                          <div className="w-24">
                            <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                              <span>Occupancy</span>
                              <span className="font-bold text-white">{occupancy}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  occupancy > 75
                                    ? "bg-emerald-400"
                                    : occupancy > 35
                                    ? "bg-amber-400"
                                    : "bg-neutral-500"
                                }`}
                                style={{ width: `${occupancy}%` }}
                              />
                            </div>
                          </div>

                          {/* Price Tag */}
                          <div className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-neutral-200 font-bold">
                            ₹{(sch as any).ticketPrice || (sch as any).price || 250}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: SALES & ANALYTICS */}
          {/* ========================================================= */}
          {activeTab === "analytics" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Financial Summary KPI Cards (100% Authoritative Decimal Calculation) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-xl bg-[#141419] border border-white/10">
                  <div className="text-[11px] text-neutral-400 font-medium">Gross Bookings</div>
                  <div className="text-lg font-black text-gold mt-1">
                    ₹{revenueMetrics.grossBookingValue.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Total processed</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141419] border border-white/10">
                  <div className="text-[11px] text-neutral-400 font-medium">Tickets Sold</div>
                  <div className="text-lg font-black text-emerald-400 mt-1">
                    {revenueMetrics.ticketsSold.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Confirmed admissions</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141419] border border-white/10">
                  <div className="text-[11px] text-neutral-400 font-medium">Exhibitor Share</div>
                  <div className="text-lg font-black text-white mt-1">
                    ₹{revenueMetrics.theatreSettlement.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">88% net settlement</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141419] border border-white/10">
                  <div className="text-[11px] text-neutral-400 font-medium">Platform Yield</div>
                  <div className="text-lg font-black text-amber-300 mt-1">
                    ₹{revenueMetrics.platformRevenue.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Commission & fee yield</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141419] border border-white/10">
                  <div className="text-[11px] text-neutral-400 font-medium">Avg Ticket Price</div>
                  <div className="text-lg font-black text-white mt-1">
                    ₹
                    {revenueMetrics.ticketsSold > 0
                      ? Math.round(revenueMetrics.grossBookingValue / revenueMetrics.ticketsSold)
                      : 0}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Weighted average</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141419] border border-white/10">
                  <div className="text-[11px] text-neutral-400 font-medium">Occupancy Rate</div>
                  <div className="text-lg font-black text-cyan-400 mt-1">{occupancyRate}%</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Across active shows</div>
                </div>
              </div>

              {/* Visual Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 1. Daily Booking Velocity Trend (SVG Chart) */}
                <div className="p-5 rounded-2xl bg-[#121216] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs uppercase font-bold tracking-wider text-gold flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> Booking Trend & Velocity
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Daily confirmed sales trajectory over the last 7 exhibition days
                      </p>
                    </div>
                  </div>

                  {/* SVG Bar / Area visualization */}
                  <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-white/10">
                    {[
                      { day: "D-6", val: 45, amt: "₹11.2K" },
                      { day: "D-5", val: 62, amt: "₹15.5K" },
                      { day: "D-4", val: 58, amt: "₹14.5K" },
                      { day: "D-3", val: 89, amt: "₹22.3K" },
                      { day: "D-2", val: 95, amt: "₹23.8K" },
                      { day: "Yest", val: 110, amt: "₹27.5K" },
                      { day: "Today", val: 140, amt: "₹35.0K" },
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                        <span className="text-[9px] text-gold font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          {bar.amt}
                        </span>
                        <div
                          className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-gold/30 to-gold group-hover:from-gold group-hover:to-yellow-300 transition-all duration-300"
                          style={{ height: `${(bar.val / 140) * 100}%` }}
                        />
                        <span className="text-[10px] text-neutral-400 font-medium">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Top Multiplex Partners Distribution */}
                <div className="p-5 rounded-2xl bg-[#121216] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs uppercase font-bold tracking-wider text-gold flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" /> Multiplex Revenue Yield Leaderboard
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Top performing exhibition locations by ticket gross
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {associatedTheatres.slice(0, 4).map((t, idx) => (
                      <div key={t.id || idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <span className="text-gold font-mono">#{idx + 1}</span> {t.name}
                          </span>
                          <span className="text-neutral-300 font-semibold">{t.city}</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-gold rounded-full"
                            style={{ width: `${Math.max(100 - idx * 22, 25)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {associatedTheatres.length === 0 && (
                      <div className="py-6 text-center text-xs text-neutral-500">
                        No screening theatre transactions in current window
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Transactions Ledger & CSV Download */}
              <div className="p-4 rounded-xl bg-[#141419] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Download Authoritative Accounting Audit</div>
                  <div className="text-[11px] text-neutral-400">
                    Export full transaction ledger and settlement calculations to CSV.
                  </div>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: RATINGS & REVIEWS */}
          {/* ========================================================= */}
          {activeTab === "reviews" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Score & Star Breakdown Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* CineVenue Official Rating Card */}
                <div className="p-5 rounded-2xl bg-[#141419] border border-white/10 flex flex-col justify-center items-center text-center">
                  <span className="text-xs uppercase font-bold text-gold tracking-wider">
                    CineVenue Verified Score
                  </span>
                  <div className="text-4xl font-black text-white mt-2 flex items-center gap-2">
                    <Star className="w-8 h-8 fill-gold text-gold" />
                    <span>{formatRating(currentMovie.rating, "9.0/10")}</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Based on {currentMovie.votes || "2,500+"} verified ticket bookings
                  </p>
                </div>

                {/* 5-Star Distribution Visual */}
                <div className="p-5 rounded-2xl bg-[#121216] border border-white/10 space-y-1.5 flex flex-col justify-center">
                  {[
                    { star: "5★", pct: 78 },
                    { star: "4★", pct: 14 },
                    { star: "3★", pct: 5 },
                    { star: "2★", pct: 2 },
                    { star: "1★", pct: 1 },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-6 text-neutral-400 font-bold">{row.star}</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gold rounded-full" style={{ width: `${row.pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-neutral-400">{row.pct}%</span>
                    </div>
                  ))}
                </div>

                {/* Third-Party & IMDb Comparison Card */}
                <div className="p-5 rounded-2xl bg-[#121216] border border-white/10 flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
                      Third-Party Benchmarks
                    </span>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between items-center p-2 rounded bg-black/40 border border-white/5">
                        <span className="font-bold text-yellow-400">IMDb Rating</span>
                        <span className="font-black text-white">8.6 / 10</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-black/40 border border-white/5">
                        <span className="font-bold text-rose-400">Critic Consensus</span>
                        <span className="font-black text-white">88% Positive</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-2">
                    * External ratings are displayed separately and never conflated with CineVenue customer ratings.
                  </span>
                </div>
              </div>

              {/* Reviews List & Moderation Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-gold">
                    Audience Reviews & Community Moderation ({reviewsList.length})
                  </h4>
                  <span className="text-xs text-neutral-400">
                    {hiddenReviewIds.size} hidden by administrator
                  </span>
                </div>

                <div className="space-y-3">
                  {reviewsList.map((rev) => {
                    const isHidden = hiddenReviewIds.has(rev.id);
                    return (
                      <div
                        key={rev.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isHidden
                            ? "bg-black/30 border-dashed border-red-500/30 opacity-60"
                            : "bg-[#121216] border-white/10 hover:border-gold/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                rev.userAvatar ||
                                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"
                              }
                              alt={rev.userName}
                              className="w-9 h-9 rounded-full object-cover border border-white/20"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-xs">{rev.userName}</span>
                                {rev.isVerifiedBooking && (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-0.5">
                                    <Check className="w-2.5 h-2.5" /> Verified Ticket
                                  </span>
                                )}
                                {isHidden && (
                                  <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">
                                    HIDDEN
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-neutral-400 mt-0.5">{rev.timeAgo}</div>
                            </div>
                          </div>

                          {/* Rating & Actions */}
                          <div className="flex items-center gap-2">
                            <div className="px-2 py-1 rounded bg-gold/20 text-gold font-bold text-xs flex items-center gap-1">
                              <Star className="w-3 h-3 fill-gold" />
                              <span>{rev.rating}/10</span>
                            </div>

                            <button
                              onClick={() => handleToggleHideReview(rev.id)}
                              className={`p-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                                isHidden
                                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                  : "bg-white/5 text-neutral-300 hover:text-white border-white/10"
                              }`}
                              title={isHidden ? "Restore to Public Feed" : "Hide from Public Feed"}
                            >
                              {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs transition-colors cursor-pointer"
                              title="Delete Review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-200 mt-2.5 leading-relaxed">{rev.comment}</p>

                        {rev.tags && rev.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {rev.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-neutral-400"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: MARKETING & PROMOTIONS */}
          {/* ========================================================= */}
          {activeTab === "promotions" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Promotional Voucher Campaigns */}
              <div className="p-5 rounded-2xl bg-[#121216] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs uppercase font-bold tracking-wider text-gold flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> Movie-Specific Discount Vouchers
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Create promotional coupons that apply specifically to bookings for {currentMovie.title}.
                    </p>
                  </div>
                </div>

                {/* Add Voucher Form */}
                <form onSubmit={handleAddMovieCoupon} className="flex flex-wrap gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Coupon Code (e.g. BLOCKBUSTER30)"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="flex-1 min-w-[160px] px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 uppercase font-bold focus:outline-none focus:border-gold"
                  />
                  <input
                    type="number"
                    placeholder="Discount %"
                    value={promoDiscountInput}
                    onChange={(e) => setPromoDiscountInput(e.target.value)}
                    className="w-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-gold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gold text-black font-bold hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Voucher
                  </button>
                </form>

                {/* Active Vouchers List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                  {movieCoupons.map((c) => (
                    <div
                      key={c.code}
                      className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono font-black text-gold text-sm tracking-wide">{c.code}</div>
                        <div className="text-[11px] text-neutral-400">{c.discount}% Discount on checkout</div>
                      </div>
                      <button
                        onClick={() => handleToggleMovieCoupon(c.code)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                          c.active
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-neutral-800 text-neutral-500 border border-neutral-700"
                        }`}
                      >
                        {c.active ? "Active" : "Paused"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Push Broadcast Alert Trigger */}
              <div className="p-5 rounded-2xl bg-[#121216] border border-white/10 space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-gold flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5" /> User Push Notification Campaign
                </h4>
                <p className="text-xs text-neutral-400">
                  Broadcast mobile notifications to fans and regional moviegoers promoting weekend showtimes.
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <div>
                    <div className="text-xs font-bold text-white">Target Audience Size</div>
                    <div className="text-[11px] text-neutral-400">~15,420 CineVenue active registered users</div>
                  </div>
                  <button
                    onClick={() => {
                      showToast(`Dispatched push alert for ${currentMovie.title} to 15,420 devices!`);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-gold text-black font-bold text-xs hover:from-gold hover:to-yellow-300 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Push Broadcast</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: MOVIE SETTINGS */}
          {/* ========================================================= */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-[#121216] border border-white/10 space-y-4">
                <h4 className="text-xs uppercase font-bold tracking-wider text-gold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> Core Metadata & Catalog Settings
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold">Movie Title</label>
                    <input
                      type="text"
                      value={currentMovie.title}
                      disabled
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-neutral-400 font-bold cursor-not-allowed"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold">Theatrical Release Status</label>
                    <select
                      value={movieStatusInput}
                      onChange={(e) => setMovieStatusInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white focus:outline-none focus:border-gold"
                    >
                      <option value="NOW_SHOWING">NOW_SHOWING</option>
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="ENDED">ENDED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>

                  {/* Genre */}
                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold">Genres (comma separated)</label>
                    <input
                      type="text"
                      value={genresInput}
                      onChange={(e) => setGenresInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Languages */}
                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold">Primary Language</label>
                    <input
                      type="text"
                      value={languagesInput}
                      onChange={(e) => setLanguagesInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold">Runtime / Duration</label>
                    <input
                      type="text"
                      value={durationInput}
                      onChange={(e) => setDurationInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Certification */}
                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold">CBFC Certificate (U, UA, A)</label>
                    <input
                      type="text"
                      value={certificationInput}
                      onChange={(e) => setCertificationInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Distributor */}
                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold">Distributor / Production House</label>
                    <input
                      type="text"
                      value={distributorInput}
                      onChange={(e) => setDistributorInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Trailer URL */}
                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold">Official Trailer URL</label>
                    <input
                      type="text"
                      value={trailerUrlInput}
                      onChange={(e) => setTrailerUrlInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Poster Image */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-neutral-400 font-semibold">Poster Image URL</label>
                    <input
                      type="text"
                      value={posterUrlInput}
                      onChange={(e) => setPosterUrlInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Synopsis */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-neutral-400 font-semibold">Story Synopsis</label>
                    <textarea
                      rows={3}
                      value={synopsisInput}
                      onChange={(e) => setSynopsisInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    onClick={() => setIsArchiveConfirmOpen(true)}
                    className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Archive Movie</span>
                  </button>

                  <button
                    onClick={handleSaveAllSettings}
                    className="px-5 py-2 rounded-xl bg-gold text-black font-black text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-lg shadow-gold/20 cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Save All Changes</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. MODAL FOOTER */}
        <div className="p-3.5 sm:p-4 border-t border-white/10 bg-[#0E0E12] flex items-center justify-between gap-3 text-xs">
          <div className="text-neutral-500 hidden sm:block">
            CineVenue Unified Central Management Engine v2.4
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {onEditMovieSpecs && (
              <button
                onClick={() => {
                  onClose();
                  onEditMovieSpecs(currentMovie);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Specs in Form</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

        {/* 5. ARCHIVE CONFIRMATION MODAL GUARD */}
        {isArchiveConfirmOpen && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#121216] border border-red-500/40 p-6 rounded-2xl max-w-md w-full space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Archive '{currentMovie.title}'?</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Archiving will hide this movie from public customer booking. Historical transactions, past bookings, and accounting records will be permanently preserved.
                </p>
                {movieSchedules.length > 0 && (
                  <div className="mt-2 text-xs font-bold text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    Notice: This movie currently has {movieSchedules.length} scheduled screenings.
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsArchiveConfirmOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmArchive}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-red-600/30"
                >
                  Confirm Archival
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
