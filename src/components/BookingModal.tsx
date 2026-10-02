import React, { useState, useEffect } from "react";
import { 
  X, Calendar, MapPin, Armchair, CheckCircle, ShieldCheck, CreditCard, 
  AlertCircle, Tag, Percent, Sparkles, Receipt, Coins, ChevronDown, ChevronUp, Check, Info,
  Download, Printer, Share2, Mail, Smartphone, Heart, SlidersHorizontal, ArrowLeft, Clock,
  Film, Star, Compass, ChevronRight, Pencil, Play, Video, Search
} from "lucide-react";
import QRCode from "react-qr-code";
import { MovieSchedule, Booking, Theatre, Movie } from "../types";
import { INITIAL_MOVIES, INITIAL_THEATRES } from "../data";
import { POPULAR_CITIES, ALL_INDIAN_CITIES } from "../lib/location";
import { FeeCalculationService } from "../services/feeCalculationService";
import { FeeCalculationResult, FeeRule, TaxRule, DiscountRule } from "../types/fees";
import { generateAndDownloadTicketPdf, getTicketVerificationUrl } from "../utils/ticketDeliveryService";
import { getEligibleTheatresAndShows, parseTimeToMinutes, getPrimaryMovieTrailer } from "../utils/movieAvailability";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieTitle: string;
  selectedCity: string;
  userEmail: string | null;
  onOpenAuth: () => void;
  globalBookings: { [movieTitle: string]: string[] };
  onConfirmBooking: (
    movieTitle: string,
    selectedSeats: string[],
    totalPrice: number,
    theatreName: string,
    timeSlot: string,
    userName?: string,
    mobileNumber?: string,
    feeDetails?: {
      ticketAmount?: number;
      platformFee?: number;
      convenienceFee?: number;
      bookingFee?: number;
      otherFeeAmount?: number;
      taxAmount?: number;
      discountAmount?: number;
      gatewayFee?: number;
      feeLines?: any[];
      taxLines?: any[];
      paymentMethod?: string;
    }
  ) => Booking;
  selectedTimeSlot?: string;
  schedules?: MovieSchedule[];
  theatres?: Theatre[];
  registeredUsers?: { email: string; passwordHash: string; joinedAt: string; mobile?: string; name?: string }[];
  isMovieBookingSystemActive?: boolean;
}

export default function BookingModal({
  isOpen,
  onClose,
  movieTitle,
  selectedCity,
  userEmail,
  onOpenAuth,
  globalBookings,
  onConfirmBooking,
  selectedTimeSlot = "11:30 AM",
  schedules = [],
  theatres = [],
  registeredUsers = [],
  isMovieBookingSystemActive = true,
}: BookingModalProps) {
  // Step state: "theatres_showtimes" (District Showtimes View) -> "seat_selection" -> "confirm_booking" -> "confirmed"
  const [bookingStep, setBookingStep] = useState<"theatres_showtimes" | "seat_selection" | "confirm_booking" | "confirmed">("theatres_showtimes");

  // Confirm Booking Review Step States
  const [isMusicianDonationAdded, setIsMusicianDonationAdded] = useState(false);
  const [isConvenienceFeesExpanded, setIsConvenienceFeesExpanded] = useState(true);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [showOffersSection, setShowOffersSection] = useState(false);

  // Trailer Video State
  const [showTrailerVideo, setShowTrailerVideo] = useState(false);
  
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [generatedBookingId, setGeneratedBookingId] = useState<string>("");
  
  const [bookingName, setBookingName] = useState("");
  const [bookingMobile, setBookingMobile] = useState("");

  // District Showtimes Selected States
  const [selectedTheatreName, setSelectedTheatreName] = useState<string>("");
  const [selectedShowTime, setSelectedShowTime] = useState<string>(selectedTimeSlot);
  const [selectedDateIdx, setSelectedDateIdx] = useState<number>(0);
  const [timeFilter, setTimeFilter] = useState<string>("ALL");
  const [favorites, setFavorites] = useState<string[]>([]);

  // Payment Method and Coupon Engine States
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CARD" | "NETBANKING" | "CINECOINS">("UPI");
  const [couponInput, setCouponInput] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState<boolean>(false);

  // Dynamic Fee Engine State
  const [feeRules, setFeeRules] = useState<FeeRule[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([]);
  const [calculatedBreakdown, setCalculatedBreakdown] = useState<FeeCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Transaction States
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{ paymentId?: string; orderId?: string; method?: string }>({});

  // Lookup target movie metadata
  const cachedMovies: Movie[] = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("cine_movies") || "[]") : [];
  const movieObj = INITIAL_MOVIES.find((m) => m.title.toLowerCase() === movieTitle.toLowerCase()) ||
    cachedMovies.find((m) => m.title.toLowerCase() === movieTitle.toLowerCase()) || {
      title: movieTitle,
      genre: "Animation, Adventure",
      lang: "Telugu",
      certification: "U",
      duration: "1h 41m",
      rating: "8.8",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=70",
      img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=70",
      releaseYear: 2026,
      trailerUrl: "https://www.youtube.com/watch?v=bC36d8e3bb0"
    };

  // Primary trailer resolution
  const primaryTrailer = getPrimaryMovieTrailer(movieObj);
  const trailerEmbedUrl = primaryTrailer?.youtubeVideoId
    ? `https://www.youtube.com/embed/${primaryTrailer.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`
    : (primaryTrailer?.youtubeUrl?.includes("watch?v=") 
        ? `https://www.youtube.com/embed/${primaryTrailer.youtubeUrl.split("watch?v=")[1]?.split("&")[0]}?autoplay=1&rel=0&modestbranding=1`
        : "https://www.youtube.com/embed/bC36d8e3bb0?autoplay=1&rel=0&modestbranding=1");

  // State lookup for header pill
  const matchedCity =
    POPULAR_CITIES.find((c) => c.name.toLowerCase() === selectedCity.toLowerCase()) ||
    ALL_INDIAN_CITIES.find((c) => c.name.toLowerCase() === selectedCity.toLowerCase());
  const stateName = matchedCity?.state || "Andhra Pradesh";

  // Generate 7-day calendar strip
  const upcomingDates = React.useMemo(() => {
    const dates = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const fullDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      dates.push({
        dateStr: `${year}-${month}-${day}`,
        dayNum: d.getDate(),
        dayName: days[d.getDay()],
        fullDayName: fullDays[d.getDay()],
        monthName: months[d.getMonth()],
        isToday: i === 0,
        isTomorrow: i === 1,
      });
    }
    return dates;
  }, []);

  const activeDate = upcomingDates[selectedDateIdx] || upcomingDates[0];

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setBookingStep("theatres_showtimes");
      setSelectedSeats([]);
      setBookingSuccess(false);
      setPaymentError(null);
      setSelectedShowTime(selectedTimeSlot);
      setSelectedDateIdx(0);
      setShowTrailerVideo(false);
    }
  }, [isOpen, movieTitle]);

  // Pre-populate attendee details
  useEffect(() => {
    if (userEmail) {
      const match = registeredUsers.find((u) => u.email.toLowerCase() === userEmail.toLowerCase());
      if (match) {
        setBookingMobile(match.mobile || "");
        setBookingName(match.name || userEmail.split("@")[0]);
      } else {
        setBookingName(userEmail.split("@")[0]);
      }
    }
  }, [userEmail, registeredUsers, isOpen]);

  // Combine live theatres & INITIAL_THEATRES filtered strictly for selectedCity and active eligible shows
  const allTheatresCatalog = theatres.length > 0 ? theatres : INITIAL_THEATRES;

  const eligibleTheatreGroups = React.useMemo(() => {
    return getEligibleTheatresAndShows(
      allTheatresCatalog,
      schedules,
      movieTitle,
      selectedCity,
      activeDate.dateStr,
      activeDate.isToday,
      activeDate.isTomorrow
    );
  }, [allTheatresCatalog, schedules, movieTitle, selectedCity, activeDate]);

  // Apply time filters
  const filteredTheatreGroups = React.useMemo(() => {
    if (timeFilter === "ALL") return eligibleTheatreGroups;
    return eligibleTheatreGroups
      .map((group) => {
        const filteredShows = group.shows.filter((show) => {
          const minutes = parseTimeToMinutes(show.time);
          if (timeFilter === "Morning") return minutes < 12 * 60;
          if (timeFilter === "After 5 PM") return minutes >= 17 * 60;
          if (timeFilter === "Recliners") {
            const t = group.theatre;
            return (
              (t.reclinerSeats && t.reclinerSeats.length > 0) ||
              (t.features && t.features.some((f) => f.toLowerCase().includes("recliner")))
            );
          }
          return true;
        });
        return {
          ...group,
          shows: filteredShows,
        };
      })
      .filter((group) => group.shows.length > 0);
  }, [eligibleTheatreGroups, timeFilter]);

  // Determine active theatre for seat selection
  const currentTheatre =
    allTheatresCatalog.find((t) => t.name === selectedTheatreName) ||
    filteredTheatreGroups[0]?.theatre ||
    allTheatresCatalog[0];

  const displayTheatre = selectedTheatreName || currentTheatre?.name || "Theatre";
  const displayTimeSlot = selectedShowTime || "11:30 AM";
  const pricePerSeat = 250;

  // Layout settings
  const rows = currentTheatre?.seatRows || ["A", "B", "C", "D", "E", "F"];
  const seatsPerRow = currentTheatre?.seatsPerRow || 8;
  const premiumRows = currentTheatre?.premiumRows || ["A", "B"];
  const blockedSeats = currentTheatre?.blockedSeats || [];
  const wheelchairSeats = currentTheatre?.wheelchairSeats || [];
  const vipSeats = currentTheatre?.vipSeats || [];
  const reclinerSeats = currentTheatre?.reclinerSeats || [];
  const rowCategories = currentTheatre?.rowCategories || {};

  const getSeatPrice = (seatId: string) => {
    const rowLetter = seatId.charAt(0);
    if (currentTheatre?.seatPrices && currentTheatre.seatPrices[rowLetter] !== undefined) {
      return currentTheatre.seatPrices[rowLetter];
    }
    if (vipSeats.includes(seatId)) return Math.round(pricePerSeat * 2.0);
    if (reclinerSeats.includes(seatId)) return Math.round(pricePerSeat * 1.8);
    if (wheelchairSeats.includes(seatId)) return Math.round(pricePerSeat * 0.9);

    const rowCat = rowCategories[rowLetter] || (premiumRows.includes(rowLetter) ? "Premium" : "Silver");
    if (rowCat === "Premium") return Math.round(pricePerSeat * 1.5);
    if (rowCat === "Gold") return Math.round(pricePerSeat * 1.25);
    return pricePerSeat;
  };

  const isSeatBlocked = (seatId: string) => blockedSeats.includes(seatId);

  // Seat toggle handler
  const handleSeatClick = (seatId: string) => {
    if (isSeatBlocked(seatId)) return;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= 10) {
        alert("Maximum 10 seats allowed per booking transaction.");
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  // Base raw price calculation
  const rawBaseTicketPrice = selectedSeats.reduce((sum, sId) => sum + getSeatPrice(sId), 0);

  // Calculate dynamic fees
  useEffect(() => {
    if (selectedSeats.length === 0) {
      setCalculatedBreakdown(null);
      return;
    }

    setIsCalculating(true);
    FeeCalculationService.calculateMovieBookingFees({
      ticketAmount: rawBaseTicketPrice,
      theatreId: displayTheatre,
      timeSlot: displayTimeSlot,
      movieTitle: movieTitle,
      city: selectedCity,
      paymentMethod: paymentMethod,
      couponCode: appliedCoupon || undefined,
      feeRules,
      taxRules,
      discountRules,
    })
      .then((result) => {
        setCalculatedBreakdown(result);
      })
      .catch(console.error)
      .finally(() => {
        setIsCalculating(false);
      });
  }, [
    selectedSeats,
    rawBaseTicketPrice,
    displayTheatre,
    displayTimeSlot,
    movieTitle,
    selectedCity,
    paymentMethod,
    appliedCoupon,
  ]);

  // Promo Code Handlers
  const handleApplyCoupon = () => {
    if (!couponInput.trim()) {
      setCouponMessage({ type: "error", text: "Please enter a promo code." });
      return;
    }
    const code = couponInput.trim().toUpperCase();
    if (code === "WELCOME50" || code === "CINE20" || code === "STUDENT10" || code === "FLAT50") {
      setAppliedCoupon(code);
      setCouponMessage({ type: "success", text: `Coupon ${code} applied successfully!` });
    } else {
      setCouponMessage({ type: "error", text: "Invalid or expired promo code." });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponMessage(null);
  };

  // Seat Category & Price Breakdown Logic
  const firstSeatRow = selectedSeats[0]?.charAt(0);
  const seatCategoryLabel =
    currentTheatre?.reclinerSeats && selectedSeats.some((s) => currentTheatre.reclinerSeats.includes(s))
      ? "RECLINER"
      : currentTheatre?.vipSeats && selectedSeats.some((s) => currentTheatre.vipSeats.includes(s))
      ? "VIP"
      : currentTheatre?.rowCategories?.[firstSeatRow]
      ? currentTheatre.rowCategories[firstSeatRow].toUpperCase()
      : "ELITE";

  const baseConveniencePerTicket = 23.00;
  const baseConvenienceAmount = calculatedBreakdown?.convenienceFee ?? (selectedSeats.length * baseConveniencePerTicket);
  const igstTaxAmount = calculatedBreakdown?.totalTaxes ?? Number((baseConvenienceAmount * 0.18).toFixed(2));
  const totalConvenienceFee = Number((baseConvenienceAmount + igstTaxAmount).toFixed(2));
  const musicianDonationAmount = isMusicianDonationAdded ? (selectedSeats.length * 1.00) : 0;
  const couponDiscountAmount = appliedCoupon ? (appliedCoupon === "WELCOME50" ? 50 : 20) : (calculatedBreakdown?.totalDiscount ?? 0);
  const orderTotalAmount = Math.max(0, Number((rawBaseTicketPrice + totalConvenienceFee + musicianDonationAmount - couponDiscountAmount).toFixed(2)));
  const finalPayableAmount = orderTotalAmount;

  // Handle proceed to seat booking
  const handleSelectShowtime = (theatreName: string, time: string, schedId?: string) => {
    setSelectedTheatreName(theatreName);
    setSelectedShowTime(time);
    if (schedId) setSelectedScheduleId(schedId);
    setBookingStep("seat_selection");
  };

  // Confirm booking
  const handleCompleteBooking = () => {
    if (!userEmail) {
      onOpenAuth();
      return;
    }
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }

    setIsProcessingPayment(true);
    setTimeout(() => {
      const confirmedBooking = onConfirmBooking(
        movieTitle,
        selectedSeats,
        orderTotalAmount,
        displayTheatre,
        displayTimeSlot,
        bookingName || userEmail.split("@")[0],
        bookingMobile || "+91 98765 43210",
        {
          ticketAmount: rawBaseTicketPrice,
          platformFee: calculatedBreakdown?.platformFee || 0,
          convenienceFee: totalConvenienceFee,
          bookingFee: calculatedBreakdown?.bookingFee || 0,
          otherFeeAmount: musicianDonationAmount,
          taxAmount: igstTaxAmount,
          discountAmount: couponDiscountAmount,
          gatewayFee: calculatedBreakdown?.gatewayCharges || 0,
          paymentMethod: paymentMethod,
        }
      );

      setGeneratedBookingId(confirmedBooking.id || `BK-${Math.floor(100000 + Math.random() * 900000)}`);
      setIsProcessingPayment(false);
      setBookingSuccess(true);
      setBookingStep("confirmed");
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in text-left select-none"
      id="booking-modal-overlay"
    >
      <div
        className={`${
          bookingStep === "confirmed" || bookingStep === "confirm_booking"
            ? "bg-[#F4F6FA] text-gray-900 border border-gray-200 max-w-md w-full shadow-2xl"
            : "bg-[#0D0D10] text-white border border-white/10 max-w-5xl w-full"
        } rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden text-left my-auto backdrop-blur-lg relative transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
        id="booking-modal-content"
      >
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/80 hover:text-white cursor-pointer transition-colors z-30"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ========================================================================= */}
        {/* STEP 1: MOVIE THEATRES & SHOWTIMES SCREEN (Dark Luxury Wide UI)          */}
        {/* ========================================================================= */}
        {bookingStep === "theatres_showtimes" && (
          <div className="p-4 sm:p-6 md:p-8 space-y-6 text-white min-h-full">
            {/* Top Movie Header Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pr-12">
              {/* Poster Thumbnail with Play Trailer Trigger */}
              <div
                onClick={() => setShowTrailerVideo(!showTrailerVideo)}
                className="relative w-24 sm:w-28 aspect-[2/3] rounded-xl overflow-hidden bg-black shrink-0 shadow-2xl border border-white/10 group cursor-pointer"
                title="Click to watch trailer"
              >
                <img
                  src={movieObj.poster || movieObj.img}
                  alt={movieTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 flex flex-col items-center justify-center transition-all">
                  <div className="w-9 h-9 rounded-full bg-white/95 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-black translate-x-0.5" />
                  </div>
                </div>
              </div>

              {/* Movie Meta Details */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {movieTitle} <span className="text-white/40 font-normal">({movieObj.releaseYear || 2026})</span>
                </h1>
                
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70 font-medium">
                  <span className="border border-white/30 px-1.5 py-0.5 rounded text-[11px] font-bold text-white/90">
                    {movieObj.certification || "U"}
                  </span>
                  <span>|</span>
                  <span>{movieObj.duration || "1h 41m"}</span>
                </div>

                <p className="text-xs sm:text-sm text-white/60 font-medium">
                  {movieObj.lang || "Telugu"}{movieObj.additionalLanguages ? `, ${movieObj.additionalLanguages.join(", ")}` : ""}
                </p>

                <p className="text-xs sm:text-sm text-white/50">
                  {movieObj.genre || "Drama"}
                </p>
              </div>
            </div>

            {/* Embedded Trailer Video Player (Collapsible) */}
            {showTrailerVideo && (
              <div className="bg-black/90 rounded-2xl border border-white/10 overflow-hidden animate-fade-in text-left">
                <div className="p-3 bg-[#141418] text-white flex items-center justify-between text-xs border-b border-white/10">
                  <span className="font-bold flex items-center gap-2 truncate">
                    <Film className="w-4 h-4 text-gold" />
                    {movieTitle} Official Trailer
                  </span>
                  <button
                    onClick={() => setShowTrailerVideo(false)}
                    className="text-xs text-white/70 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer border-none transition-colors"
                  >
                    Close Trailer ✕
                  </button>
                </div>
                <div className="relative aspect-video w-full">
                  <iframe
                    src={trailerEmbedUrl}
                    title={`${movieTitle} Official Trailer`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Date Selector Ribbon */}
            <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1">
              {/* Vertical / Left Month Tag */}
              <div className="bg-[#18181C] text-white/60 border border-white/10 text-xs font-bold px-3.5 py-3 rounded-2xl flex items-center justify-center shrink-0 uppercase tracking-widest">
                {activeDate.monthName.slice(0, 3)}
              </div>

              {/* Date Buttons */}
              <div className="flex items-center gap-2">
                {upcomingDates.map((item, idx) => {
                  const isSelected = selectedDateIdx === idx;
                  return (
                    <button
                      key={item.dateStr + idx}
                      onClick={() => setSelectedDateIdx(idx)}
                      className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white text-black font-extrabold rounded-2xl px-5 py-2.5 shadow-lg min-w-[70px]"
                          : "bg-[#141418] text-white/70 hover:text-white hover:border-white/30 border border-white/10 rounded-2xl px-4 py-2.5 min-w-[58px]"
                      }`}
                    >
                      <span className="text-base sm:text-lg font-black leading-tight">
                        {item.dayNum}
                      </span>
                      <span className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase mt-0.5 ${
                        isSelected ? "text-black" : "text-white/50"
                      }`}>
                        {item.isToday ? "TODAY" : item.dayName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Blue Advance Booking Ribbon */}
            <div className="bg-[#0B1E3B]/80 border border-[#1E3A8A]/50 rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs sm:text-sm text-[#93C5FD]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] inline-block shadow-[0_0_8px_#38BDF8] shrink-0" />
              <span>
                Advance bookings open for shows on <strong className="text-white font-bold">{activeDate.fullDayName}</strong>
              </span>
            </div>

            {/* Filter Chips & Availability Legend Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              {/* Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-semibold text-white/80 hover:text-white bg-[#141418] hover:bg-white/10 shrink-0 cursor-pointer transition-colors">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-gold" />
                  <span>Filters</span>
                  <ChevronDown className="w-3 h-3 text-white/60" />
                </button>

                <button
                  onClick={() => setTimeFilter("ALL")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all border ${
                    timeFilter === "ALL"
                      ? "bg-[#2B2312] border-[#D4AF37]/60 text-[#F5C518] shadow-xs"
                      : "bg-[#141418] text-white/70 border-white/10 hover:text-white hover:border-white/20"
                  }`}
                >
                  All Shows
                </button>

                {["Morning", "After 5 PM", "Recliners"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setTimeFilter(timeFilter === f ? "ALL" : f)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all border ${
                      timeFilter === f
                        ? "bg-[#2B2312] border-[#D4AF37]/60 text-[#F5C518] shadow-xs"
                        : "bg-[#141418] text-white/70 border-white/10 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Availability Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
                <span className="flex items-center gap-1.5 text-[#10B981]">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block shadow-[0_0_6px_#10B981]" />
                  <span>Available</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#F59E0B]">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] inline-block shadow-[0_0_6px_#F59E0B]" />
                  <span>Filling fast</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#F43F5E]">
                  <span className="w-2 h-2 rounded-full bg-[#F43F5E] inline-block shadow-[0_0_6px_#F43F5E]" />
                  <span>Almost full</span>
                </span>
              </div>
            </div>

            {/* Theatres in City List or Empty State */}
            <div className="space-y-4 pt-2">
              {filteredTheatreGroups.length === 0 ? (
                <div className="bg-[#121216] border border-white/10 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-lg">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gold">
                    <Film className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="text-lg font-bold text-white">
                      No Shows Available in {selectedCity === "All Cities" ? "this city" : selectedCity}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                      There are no scheduled shows for <strong className="text-white">{movieTitle}</strong> on{" "}
                      <strong className="text-white">{activeDate.fullDayName}, {activeDate.dayNum} {activeDate.monthName}</strong>.
                    </p>
                  </div>
                  
                  {/* Quick check buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                    {upcomingDates
                      .map((item, idx) => ({ ...item, idx }))
                      .filter((item) => item.idx !== selectedDateIdx)
                      .slice(0, 3)
                      .map((item) => (
                        <button
                          key={item.dateStr}
                          onClick={() => setSelectedDateIdx(item.idx)}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white/80 hover:text-white transition-colors cursor-pointer"
                        >
                          Check {item.isTomorrow ? "Tomorrow" : `${item.dayName}, ${item.dayNum}`}
                        </button>
                      ))}
                  </div>
                </div>
              ) : (
                filteredTheatreGroups.map(({ theatre, shows }, tIdx) => {
                  const isFav = favorites.includes(theatre.name);
                  const dist = (1.2 + (tIdx * 0.3)).toFixed(1);
                  const monogram = theatre.name
                    .split(" ")
                    .filter((w) => w.length > 0)
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "CV";

                  return (
                    <div
                      key={theatre.name + tIdx}
                      className="bg-[#121216] rounded-2xl border border-white/10 hover:border-gold/30 p-4 sm:p-5 shadow-lg space-y-4 text-left transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Theatre Details */}
                        <div className="flex items-start gap-3.5">
                          {/* Monogram Badge */}
                          <div className="w-12 h-12 rounded-xl bg-[#242015] border border-[#D4AF37]/30 text-[#E5B842] flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                            {theatre.name.includes("Studio 81") ? (
                              <div className="text-[10px] text-center font-black leading-tight text-white">
                                Studio<span className="text-red-500">81</span>
                              </div>
                            ) : theatre.name.includes("Naaz") ? (
                              <div className="text-[11px] text-center font-black text-amber-400">
                                NAAZ
                              </div>
                            ) : (
                              monogram
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                                {theatre.name}
                              </h3>
                              <Info className="w-3.5 h-3.5 text-white/40 hover:text-white/80 cursor-pointer" />
                              <button
                                onClick={() => {
                                  if (isFav) setFavorites(favorites.filter((f) => f !== theatre.name));
                                  else setFavorites([...favorites, theatre.name]);
                                }}
                                className="text-white/40 hover:text-red-500 cursor-pointer p-0.5 bg-transparent border-none transition-colors"
                                title="Add to favorites"
                              >
                                <Heart className={`w-4 h-4 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-white/50 font-medium">
                              <span className="flex items-center gap-1 text-gold/90 font-semibold">
                                <Compass className="w-3.5 h-3.5" />
                                {dist} km away
                              </span>
                              <span>•</span>
                              <span className="px-2 py-0.5 rounded bg-white/5 text-white/70">Non-cancellable</span>
                              <span>•</span>
                              <span className="px-2 py-0.5 rounded bg-white/5 text-white/70">M-Ticket</span>
                              <span>•</span>
                              <span className="px-2 py-0.5 rounded bg-white/5 text-white/70">Food & Beverage</span>
                            </div>
                          </div>
                        </div>

                        {/* Showtimes Pills */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-1 lg:pt-0">
                          {shows.map((show, sIdx) => {
                            const status = show.status || (sIdx === 0 ? "Available" : sIdx % 2 === 1 ? "Filling fast" : "Almost full");
                            const isAlmostFull = status === "Almost full";
                            const isFillingFast = status === "Filling fast";

                            return (
                              <button
                                key={show.id || show.time + sIdx}
                                onClick={() => handleSelectShowtime(theatre.name, show.time, show.id)}
                                className="bg-[#0B0B0E] border border-white/15 hover:border-gold/60 hover:bg-[#18181C] rounded-xl px-4 py-2.5 text-center min-w-[110px] cursor-pointer transition-all flex flex-col items-center justify-center gap-0.5 group shadow-sm"
                                title={status}
                              >
                                <span className="text-sm font-bold text-white group-hover:text-gold transition-colors">
                                  {show.time}
                                </span>
                                <span className={`text-[10px] font-semibold leading-tight ${
                                  isAlmostFull
                                    ? "text-[#F43F5E]"
                                    : isFillingFast
                                    ? "text-[#F59E0B]"
                                    : "text-[#10B981]"
                                }`}>
                                  {status}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Floating Navigation (Back to previous screen / close) */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#18181C] hover:bg-[#222228] text-gold border border-gold/30 hover:border-gold text-xs font-bold transition-all cursor-pointer shadow-lg"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Back</span>
                <Compass className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: VIP SEAT SELECTION & CHECKOUT SCREEN                              */}
        {/* ========================================================================= */}
        {bookingStep === "seat_selection" && (
          <div className="p-4 sm:p-6 md:p-8 space-y-6">
            
            {/* Top Navigation Bar back to Theatres */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <button
                onClick={() => setBookingStep("theatres_showtimes")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white hover:text-gold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-gold" />
                <span>Change Theatre / Time</span>
              </button>

              <div className="text-right">
                <span className="text-xs font-bold text-white block">{displayTheatre}</span>
                <span className="text-[11px] text-gold font-mono">{activeDate.fullDayName} · {displayTimeSlot}</span>
              </div>
            </div>

            {/* Movie Title Banner */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest block">
                  Select Seats for
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {movieTitle}
                </h2>
              </div>

              {selectedSeats.length > 0 && (
                <div className="bg-gold/15 border border-gold/30 px-3 py-1.5 rounded-xl text-right">
                  <span className="text-[10px] text-text-secondary uppercase tracking-wider block">Seats Selected</span>
                  <span className="text-xs font-extrabold text-gold font-mono">{selectedSeats.join(", ")}</span>
                </div>
              )}
            </div>

            {/* Interactive Cinema Screen Arc */}
            <div className="space-y-4 py-2">
              <div className="w-full flex flex-col items-center">
                <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-gold to-transparent rounded-full shadow-[0_0_15px_rgba(212,175,55,0.6)]" />
                <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-white/40 mt-1">
                  All Eyes this Way · 4K Laser Screen
                </span>
              </div>

              {/* Seat Matrix */}
              <div className="flex flex-col items-center gap-2 py-4 overflow-x-auto">
                {rows.map((row) => (
                  <div key={row} className="flex items-center gap-2">
                    <span className="w-6 text-center text-xs font-bold font-mono text-white/50">{row}</span>
                    <div className="flex gap-1.5">
                      {Array.from({ length: seatsPerRow }).map((_, colIdx) => {
                        const seatId = `${row}${colIdx + 1}`;
                        const isSelected = selectedSeats.includes(seatId);
                        const blocked = isSeatBlocked(seatId);

                        return (
                          <button
                            key={seatId}
                            disabled={blocked}
                            onClick={() => handleSeatClick(seatId)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono transition-all cursor-pointer ${
                              blocked
                                ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                                : isSelected
                                ? "bg-gold text-black shadow-lg shadow-gold/30 font-extrabold scale-110 border-0"
                                : "bg-[#18181C] hover:bg-white/20 text-white/80 border border-white/10 hover:border-gold/40"
                            }`}
                            title={`${seatId} - ₹${getSeatPrice(seatId)}`}
                          >
                            {colIdx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Seat Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/60 pt-2 border-t border-white/10">
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#18181C] border border-white/10 inline-block" />
                  <span>Available</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-gold inline-block" />
                  <span className="text-gold font-bold">Selected</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-white/10 inline-block" />
                  <span>Sold / Blocked</span>
                </span>
              </div>
            </div>

            {/* Price Breakdown & Checkout Action */}
            <div className="bg-[#141418] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-white/50 block">Total Payable ({selectedSeats.length} seats)</span>
                <span className="text-2xl font-extrabold text-gold font-mono">
                  ₹{finalPayableAmount.toFixed(2)}
                </span>
              </div>

              <button
                disabled={selectedSeats.length === 0 || isProcessingPayment}
                onClick={() => setBookingStep("confirm_booking")}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  selectedSeats.length > 0 && !isProcessingPayment
                    ? "bg-gold hover:bg-gold-light text-black shadow-gold/20"
                    : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Review & Confirm ({selectedSeats.length} Tickets)</span>
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2.5: CONFIRM BOOKING SCREEN (Matching Uploaded Screenshot)           */}
        {/* ========================================================================= */}
        {bookingStep === "confirm_booking" && (
          <div className="bg-[#F4F6FA] text-gray-900 min-h-full">
            {/* Top Navigation Bar with Back Arrow and Title */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
              <button
                onClick={() => setBookingStep("seat_selection")}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-800 transition-colors cursor-pointer border-none bg-transparent"
                title="Back to Seats"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                Confirm booking
              </h1>
            </div>

            <div className="p-4 space-y-3.5 max-w-md mx-auto">
              {/* Card 1: Movie & Venue Details */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden text-left">
                <div className="p-4 space-y-2">
                  {/* Row 1: Title and Ticket Count */}
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                      {movieTitle}
                    </h2>
                    <span className="text-base font-bold text-gray-900 px-1 shrink-0">
                      {selectedSeats.length}
                    </span>
                  </div>

                  {/* Row 2: Date & Time + Box Office Badge */}
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-800">
                    <span>
                      {activeDate.dayName}, {activeDate.dayNum} {activeDate.monthName.slice(0, 1) + activeDate.monthName.slice(1).toLowerCase()}, {activeDate.dateStr.slice(0, 4)} | {displayTimeSlot}
                    </span>
                    <span className="flex items-center gap-1 text-[#E11D48] font-bold text-xs">
                      <Pencil className="w-3 h-3 stroke-[2.5]" />
                      <span>Box Office</span>
                    </span>
                  </div>

                  {/* Row 3: Format */}
                  <p className="text-xs text-gray-500 font-medium">
                    {movieObj.lang || "Telugu"} (2D)
                  </p>

                  {/* Row 4: Seat Category & Seat IDs */}
                  <p className="text-xs font-semibold text-gray-700">
                    {seatCategoryLabel}-{selectedSeats.join(", ")}
                  </p>

                  {/* Row 5: Venue and Screen Name */}
                  <p className="text-xs text-gray-500 truncate">
                    {displayTheatre}: {currentTheatre?.screens?.[0]?.name || "4K Laser Dolby Atmos"}, {selectedCity === "All Cities" ? "Guntur" : selectedCity}...
                  </p>
                </div>

                {/* Cancellation Unavailable Peach Banner */}
                <div className="bg-[#FFF5ED] border-t border-[#FFE5D3] p-3 text-left">
                  <div className="text-xs font-bold text-gray-900 mb-0.5">
                    Cancellation Unavailable
                  </div>
                  <div className="text-[11px] text-gray-600">
                    This venue does not support booking cancellation.
                  </div>
                </div>
              </div>

              {/* Card 2: Price Breakdown */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm space-y-3 text-left">
                {/* Line 1: Ticket Price */}
                <div className="flex items-center justify-between text-sm text-gray-800">
                  <span className="text-gray-600">Ticket(s) price</span>
                  <span className="font-semibold text-gray-900 font-mono">
                    ₹{rawBaseTicketPrice.toFixed(2)}
                  </span>
                </div>

                {/* Line 2: Convenience Fees (Collapsible) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm text-gray-800">
                    <button
                      onClick={() => setIsConvenienceFeesExpanded(!isConvenienceFeesExpanded)}
                      className="flex items-center gap-1 text-gray-600 hover:text-gray-900 cursor-pointer bg-transparent border-none p-0 text-sm"
                    >
                      <span>Convenience fees</span>
                      {isConvenienceFeesExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </button>
                    <span className="font-semibold text-gray-900 font-mono">
                      ₹{totalConvenienceFee.toFixed(2)}
                    </span>
                  </div>

                  {/* Sub-breakdown: Base Amount + IGST 18% */}
                  {isConvenienceFeesExpanded && (
                    <div className="pl-2 space-y-1 text-xs text-gray-500 border-l-2 border-gray-150 ml-1">
                      <div className="flex items-center justify-between">
                        <span>Base Amount</span>
                        <span className="font-mono">₹{baseConvenienceAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Integrated GST (IGST) @ 18%</span>
                        <span className="font-mono">₹{igstTaxAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Line 3: Give to Underprivileged Musicians */}
                <div className="flex items-center justify-between text-sm text-gray-800 pt-1">
                  <div className="space-y-0.5">
                    <div className="text-gray-800 font-medium text-xs sm:text-sm">
                      Give to Underprivileged Musicians
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <span>(₹1 per ticket)</span>
                      <button 
                        onClick={() => alert("Donations support elderly and underprivileged performing artists across Indian classical & regional cinema music orchestras.")}
                        className="underline uppercase font-bold text-[10px] text-gray-600 hover:text-gray-900 cursor-pointer border-none bg-transparent p-0"
                      >
                        VIEW T&C
                      </button>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className="font-semibold text-gray-900 font-mono text-sm">
                      ₹{musicianDonationAmount.toFixed(2)}
                    </div>
                    <button
                      onClick={() => setIsMusicianDonationAdded(!isMusicianDonationAdded)}
                      className="text-xs font-bold text-[#E11D48] hover:text-[#BE123C] cursor-pointer bg-transparent border-none p-0"
                    >
                      {isMusicianDonationAdded ? "Remove" : `Add ₹${(selectedSeats.length * 1.0).toFixed(2)}`}
                    </button>
                  </div>
                </div>

                {/* Dotted Separator */}
                <div className="border-t border-dashed border-gray-300 my-2" />

                {/* Line 4: Order Total */}
                <div className="flex items-center justify-between text-sm sm:text-base font-bold text-gray-900">
                  <span>Order total</span>
                  <span className="font-mono text-lg font-extrabold text-gray-900">
                    ₹{orderTotalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Card 3: For Sending Booking Details */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">
                    For Sending Booking Details
                  </span>
                  <button
                    onClick={() => setIsEditingContact(!isEditingContact)}
                    className="flex items-center gap-1 text-[#E11D48] font-bold text-xs hover:text-[#BE123C] cursor-pointer bg-transparent border-none p-0"
                  >
                    <Pencil className="w-3 h-3 stroke-[2.5]" />
                    <span>{isEditingContact ? "Done" : "Edit"}</span>
                  </button>
                </div>

                {isEditingContact ? (
                  <div className="space-y-2 pt-1.5">
                    <input
                      type="tel"
                      value={bookingMobile}
                      onChange={(e) => setBookingMobile(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="email"
                      value={userEmail || bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                    />
                  </div>
                ) : (
                  <div className="text-xs text-gray-600 font-medium">
                    {bookingMobile || "+91 98765 43210"} | {userEmail || "user@example.com"}
                  </div>
                )}

                <div className="text-[11px] text-gray-400">
                  {stateName} (for GST purposes)
                </div>
              </div>

              {/* Card 4: Apply Offers */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm text-left">
                <button
                  onClick={() => setShowOffersSection(!showOffersSection)}
                  className="w-full flex items-center justify-between text-left cursor-pointer bg-transparent border-none p-0"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-600">
                      <Percent className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="font-semibold text-xs sm:text-sm text-gray-900">
                      {appliedCoupon ? `Offer Applied: ${appliedCoupon}` : "Apply Offers"}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showOffersSection ? "rotate-90" : ""}`} />
                </button>

                {showOffersSection && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="ENTER COUPON (e.g. WELCOME50)"
                        className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg uppercase tracking-wider focus:outline-none focus:border-red-500"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-3.5 py-1.5 bg-[#E11D48] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#BE123C] transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {couponMessage && (
                      <p className={`text-xs ${couponMessage.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>
                        {couponMessage.text}
                      </p>
                    )}
                    {appliedCoupon && (
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-[11px] text-gray-500 underline cursor-pointer bg-transparent border-none p-0"
                      >
                        Remove Coupon
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Consent Note */}
              <div className="text-center px-2 pt-1 pb-2">
                <p className="text-[11px] text-gray-500 leading-snug">
                  By proceeding, I express my consent to complete this transaction.
                </p>
              </div>
            </div>

            {/* Sticky Bottom Bar */}
            <div className="bg-white border-t border-gray-200 px-5 py-3.5 flex items-center justify-between sticky bottom-0 z-20 shadow-lg">
              <div className="text-left">
                <span className="text-xs text-gray-500 block font-medium">Total</span>
                <span className="text-xl font-extrabold text-gray-900 font-mono">
                  ₹{orderTotalAmount.toFixed(2)}
                </span>
              </div>
              <button
                disabled={isProcessingPayment}
                onClick={handleCompleteBooking}
                className="bg-[#E11D48] hover:bg-[#BE123C] text-white px-8 py-3 rounded-xl font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                {isProcessingPayment ? (
                  <span>Processing...</span>
                ) : (
                  <span>Continue</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: BOOKING CONFIRMED SCREEN (District App Style Matching Screenshot) */}
        {/* ========================================================================= */}
        {bookingStep === "confirmed" && (() => {
          const numericBookingId = generatedBookingId
            ? (generatedBookingId.startsWith("1000")
                ? generatedBookingId
                : `100000${generatedBookingId.replace(/\D/g, "").padEnd(8, "810192").slice(0, 8)}`)
            : "10000081019258";

          const firstSeatRow = selectedSeats[0]?.charAt(0);
          const seatCategoryLabel =
            currentTheatre?.reclinerSeats && selectedSeats.some((s) => currentTheatre.reclinerSeats.includes(s))
              ? "RECLINER"
              : currentTheatre?.vipSeats && selectedSeats.some((s) => currentTheatre.vipSeats.includes(s))
              ? "VIP"
              : currentTheatre?.rowCategories?.[firstSeatRow]
              ? currentTheatre.rowCategories[firstSeatRow].toUpperCase()
              : "ELITE";

          const ticketFormattedDate = `${activeDate.fullDayName}, ${String(activeDate.dayNum).padStart(2, "0")} ${
            activeDate.monthName.charAt(0) + activeDate.monthName.slice(1).toLowerCase()
          } | ${displayTimeSlot}`;

          return (
            <div className="p-5 sm:p-7 bg-white text-gray-900 rounded-3xl max-w-md mx-auto">
              {/* Top Navigation Bar with Back Arrow and Close Button */}
              <div className="flex items-center justify-between pb-2">
                <button
                  onClick={() => setBookingStep("theatres_showtimes")}
                  className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-800 transition-colors cursor-pointer border-none bg-transparent"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-800 transition-colors cursor-pointer border-none bg-transparent"
                  title="Close"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Circular Green Checkmark Badge */}
              <div className="text-center my-3">
                <div className="w-14 h-14 rounded-full bg-[#10B981] flex items-center justify-center mx-auto shadow-sm">
                  <Check className="w-8 h-8 text-white stroke-[3.5]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-3 tracking-tight">
                  Booking confirmed
                </h2>
              </div>

              {/* Movie Info Section with Rounded Poster */}
              <div className="flex items-center gap-4 my-5">
                <img
                  src={movieObj.poster || movieObj.img}
                  alt={movieTitle}
                  className="w-20 sm:w-24 aspect-[2/3] object-cover rounded-2xl shadow-sm border border-gray-100 shrink-0"
                />
                <div className="space-y-1 my-auto">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                    {movieTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">
                    {movieObj.lang || "Telugu"} | 2D | {movieObj.certification || "U"}
                  </p>
                </div>
              </div>

              {/* White Ticket Card Container */}
              <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5 mb-5">
                <div className="space-y-0.5">
                  <div className="text-xs text-gray-500 font-medium leading-tight">
                    Booking ID: {numericBookingId}
                  </div>
                  <div className="text-xs text-gray-500 font-medium leading-tight">
                    Booking code: NA
                  </div>
                  <div className="text-sm sm:text-base font-bold text-gray-900 pt-1.5">
                    {ticketFormattedDate}
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                <div className="flex items-center gap-4 py-0.5">
                  {/* QR Code Container */}
                  <div className="p-2 border border-gray-200/90 rounded-xl bg-white shrink-0 shadow-2xs">
                    <QRCode
                      value={getTicketVerificationUrl(generatedBookingId || `BK-${movieTitle}`)}
                      size={84}
                      level="M"
                    />
                  </div>

                  {/* Screen & Seat Info */}
                  <div className="space-y-0.5">
                    <div className="text-base sm:text-lg font-extrabold text-gray-900 uppercase tracking-tight">
                      {currentTheatre?.screens?.[0]?.name || "SCREEN 1"}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {selectedSeats.length} ticket{selectedSeats.length > 1 ? "s" : ""}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-gray-800 tracking-wide">
                      {seatCategoryLabel}-{selectedSeats.join(", ")}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                <div className="text-xs sm:text-sm font-medium text-gray-800 leading-snug">
                  {displayTheatre}
                </div>
              </div>

              {/* District Branding Banner */}
              <div className="bg-gradient-to-r from-[#9333EA] via-[#8527DE] to-[#7319CE] rounded-2xl p-4 text-center text-white shadow-md mb-5 flex flex-col items-center justify-center">
                <span className="font-extrabold tracking-tight text-3xl font-sans leading-none select-none drop-shadow-xs">
                  district
                </span>
                <span className="text-[10px] tracking-[0.25em] font-bold text-white/90 uppercase mt-0.5 select-none">
                  BY ZOMATO
                </span>
              </div>

              {/* Actions: Download PDF & Dismiss */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    generateAndDownloadTicketPdf({
                      type: "MOVIE",
                      bookingId: generatedBookingId,
                      ticketCode: generatedBookingId,
                      customerName: userEmail ? userEmail.split("@")[0] : "Valued Patron",
                      customerEmail: userEmail || "guest@cinevenue.com",
                      title: movieTitle,
                      venue: displayTheatre,
                      screen: currentTheatre?.screens?.[0]?.name || "Screen 1",
                      date: activeDate.fullDayName,
                      time: displayTimeSlot,
                      seats: selectedSeats,
                      quantity: selectedSeats.length,
                      totalPaid: finalPayableAmount,
                      paymentMethod: paymentMethod,
                    });
                  }}
                  className="w-full bg-gray-900 hover:bg-black text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download Ticket PDF</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-gray-500 hover:text-gray-900 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
