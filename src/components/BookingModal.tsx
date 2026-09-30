import React, { useState, useEffect } from "react";
import { 
  X, Calendar, MapPin, Armchair, CheckCircle, ShieldCheck, CreditCard, 
  AlertCircle, Tag, Percent, Sparkles, Receipt, Coins, ChevronDown, ChevronUp, Check, Info,
  Download, Printer, Share2, Mail, Smartphone, Heart, SlidersHorizontal, ArrowLeft, Clock,
  Film, Star, Compass
} from "lucide-react";
import QRCode from "react-qr-code";
import { MovieSchedule, Booking, Theatre, Movie } from "../types";
import { INITIAL_MOVIES, INITIAL_THEATRES } from "../data";
import { POPULAR_CITIES, ALL_INDIAN_CITIES } from "../lib/location";
import { FeeCalculationService } from "../services/feeCalculationService";
import { FeeCalculationResult, FeeRule, TaxRule, DiscountRule } from "../types/fees";
import { generateAndDownloadTicketPdf, getTicketVerificationUrl } from "../utils/ticketDeliveryService";

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
  // Step state: "theatres_showtimes" (District Showtimes View) -> "seat_selection" -> "confirmed"
  const [bookingStep, setBookingStep] = useState<"theatres_showtimes" | "seat_selection" | "confirmed">("theatres_showtimes");
  
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
      releaseYear: 2026
    };

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
      dates.push({
        dateStr: d.toISOString().split("T")[0],
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

  // Combine live theatres & INITIAL_THEATRES filtered strictly for selectedCity
  const allTheatresCatalog = theatres.length > 0 ? theatres : INITIAL_THEATRES;
  const filteredTheatresInCity = allTheatresCatalog.filter((t) => {
    if (selectedCity === "All Cities") return true;
    return (
      t.city.toLowerCase() === selectedCity.toLowerCase() ||
      t.location.toLowerCase().includes(selectedCity.toLowerCase())
    );
  });

  const cityTheatresList =
    filteredTheatresInCity.length > 0
      ? filteredTheatresInCity
      : INITIAL_THEATRES.filter((t) => t.city.toLowerCase() === "guntur" || t.city.toLowerCase() === "hyderabad");

  // Determine active theatre
  const currentTheatre =
    allTheatresCatalog.find((t) => t.name === (selectedTheatreName || cityTheatresList[0]?.name)) ||
    cityTheatresList[0];

  const displayTheatre = selectedTheatreName || currentTheatre?.name || "Naaz Cinemas, Kothapet Main Road, Guntur";
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

  const finalPayableAmount = calculatedBreakdown ? calculatedBreakdown.totalAmount : rawBaseTicketPrice;

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
        finalPayableAmount,
        displayTheatre,
        displayTimeSlot,
        bookingName || userEmail.split("@")[0],
        bookingMobile || "+91 98765 43210",
        {
          ticketAmount: rawBaseTicketPrice,
          platformFee: calculatedBreakdown?.platformFee || 0,
          convenienceFee: calculatedBreakdown?.convenienceFee || 0,
          bookingFee: calculatedBreakdown?.bookingFee || 0,
          otherFeeAmount: calculatedBreakdown?.otherFeesTotal || 0,
          taxAmount: calculatedBreakdown?.totalTaxes || 0,
          discountAmount: calculatedBreakdown?.totalDiscount || 0,
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

  // Get showtimes for each theatre in list
  const getTheatreShowtimes = (theatreName: string) => {
    const matching = schedules.filter(
      (s) =>
        s.movieTitle.toLowerCase() === movieTitle.toLowerCase() &&
        s.theatreName.toLowerCase() === theatreName.toLowerCase() &&
        s.isActive !== false &&
        s.isDeployed !== false
    );

    if (matching.length > 0) {
      return matching.map((s) => ({
        id: s.id,
        time: s.timeSlot,
        status: s.pricePerSeat > 300 ? "Filling fast" : "Available",
      }));
    }

    // Standard showtimes
    return [
      { id: `sch-${theatreName}-1`, time: "11:30 AM", status: "Available" },
      { id: `sch-${theatreName}-2`, time: "02:30 PM", status: "Filling fast" },
      { id: `sch-${theatreName}-3`, time: "06:30 PM", status: "Almost full" },
      { id: `sch-${theatreName}-4`, time: "09:30 PM", status: "Available" },
    ];
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in text-left select-none"
      id="booking-modal-overlay"
    >
      <div
        className="bg-[#0D0D10] border border-white/10 w-full max-w-5xl rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden text-left my-auto backdrop-blur-lg relative"
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
        {/* STEP 1: DISTRICT MOVIE THEATRES & SHOWTIMES SCREEN (Matching Screenshot) */}
        {/* ========================================================================= */}
        {bookingStep === "theatres_showtimes" && (
          <div className="p-4 sm:p-6 md:p-8 space-y-6">
            
            {/* Top Location Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-white/60 pb-1">
              <MapPin className="w-4 h-4 text-gold shrink-0" />
              <span className="font-bold text-white text-sm">
                {selectedCity === "All Cities" ? "Guntur" : selectedCity}
              </span>
              <span>·</span>
              <span>{stateName}</span>
            </div>

            {/* Movie Header Card */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-[#141418] border border-white/10 rounded-2xl p-4 sm:p-5">
              {/* Poster */}
              <div className="w-24 sm:w-32 aspect-[2/3] rounded-xl overflow-hidden bg-black/60 shrink-0 shadow-lg border border-white/10">
                <img
                  src={movieObj.poster || movieObj.img}
                  alt={movieTitle}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Movie Meta Information */}
              <div className="flex flex-col justify-center space-y-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
                  {movieTitle}{" "}
                  <span className="text-white/40 font-normal">({movieObj.releaseYear || 2026})</span>
                </h1>

                <div className="space-y-1 text-xs sm:text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-white/10 border border-white/15 text-xs">
                      {movieObj.certification || "U"}
                    </span>
                    <span>{movieObj.duration || "1h 41m"}</span>
                  </div>

                  <p className="font-medium text-white/90">
                    {movieObj.lang || "Telugu"}
                  </p>

                  <p className="text-white/50 text-xs">
                    {movieObj.genre || "Animation, Adventure"}
                  </p>
                </div>
              </div>
            </div>

            {/* Date Selector Ribbon */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {/* Month Label Pill */}
                <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] font-bold uppercase tracking-wider text-white/60 flex items-center justify-center shrink-0">
                  {activeDate.monthName}
                </div>

                {/* 7-Day Date Buttons */}
                {upcomingDates.map((item, idx) => {
                  const isSelected = selectedDateIdx === idx;
                  return (
                    <button
                      key={item.dateStr + idx}
                      onClick={() => setSelectedDateIdx(idx)}
                      className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 border ${
                        isSelected
                          ? "bg-white text-black border-white shadow-lg font-bold scale-105"
                          : "bg-[#141418] text-white/70 border-white/10 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      <span className="text-base sm:text-lg font-extrabold leading-tight">
                        {item.dayNum}
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold uppercase leading-none">
                        {item.isToday ? "Today" : item.dayName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Informative Blue Advance Booking Banner with Callout Tip */}
              <div className="relative bg-[#0047AB]/20 border border-[#0047AB]/40 rounded-xl px-4 py-2.5 text-xs text-blue-200 flex items-center gap-2 shadow-md">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
                <span>
                  Advance bookings open for shows on{" "}
                  <strong className="text-white font-bold">{activeDate.fullDayName}</strong>
                </span>
              </div>
            </div>

            {/* Filters Row & Availability Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/10">
              {/* Filter Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/15 text-xs font-medium text-white hover:bg-white/10 transition-colors cursor-pointer">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-gold" />
                  <span>Filters</span>
                  <ChevronDown className="w-3 h-3 text-white/60" />
                </button>

                {["ALL", "Morning", "After 5 PM", "Recliners"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setTimeFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                      timeFilter === f
                        ? "bg-gold/20 text-gold border-gold/40 font-semibold"
                        : "bg-transparent text-white/60 border-white/10 hover:text-white hover:border-white/30"
                    }`}
                  >
                    {f === "ALL" ? "All Shows" : f}
                  </button>
                ))}
              </div>

              {/* Availability Legend */}
              <div className="flex items-center gap-3 text-[11px] text-white/60 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  <span>Available</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  <span>Filling fast</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                  <span>Almost full</span>
                </span>
              </div>
            </div>

            {/* Theatres in City List */}
            <div className="space-y-4 pt-2">
              {cityTheatresList.map((theatre, tIdx) => {
                const theatreShows = getTheatreShowtimes(theatre.name);
                const isFav = favorites.includes(theatre.name);

                return (
                  <div
                    key={theatre.name + tIdx}
                    className="bg-[#141418] border border-white/10 hover:border-gold/40 rounded-2xl p-4 sm:p-5 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Theatre Identity & Location */}
                    <div className="flex items-start gap-3.5">
                      {/* Cinema Emblem Icon */}
                      <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-bold font-serif text-sm shrink-0 shadow-sm">
                        SP
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                            {theatre.name}
                          </h3>
                          <Info className="w-3.5 h-3.5 text-white/40 hover:text-white cursor-pointer" />
                          <button
                            onClick={() => {
                              if (isFav) setFavorites(favorites.filter((f) => f !== theatre.name));
                              else setFavorites([...favorites, theatre.name]);
                            }}
                            className="text-white/40 hover:text-red-400 cursor-pointer p-0.5 bg-transparent border-none"
                            title="Add to favorites"
                          >
                            <Heart className={`w-4 h-4 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
                          </button>
                        </div>

                        {/* Location Details & Badges */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
                          <span className="flex items-center gap-1 text-white/70">
                            <Compass className="w-3.5 h-3.5 text-gold" />
                            1.3 km away
                          </span>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[10px]">
                            Non-cancellable
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[10px]">
                            M-Ticket
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[10px]">
                            Food & Beverage
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Showtimes Pill Grid */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {theatreShows.map((show, sIdx) => {
                        return (
                          <button
                            key={show.time + sIdx}
                            onClick={() => handleSelectShowtime(theatre.name, show.time, show.id)}
                            className="group relative flex flex-col items-center justify-center px-4 py-2 rounded-xl bg-black/60 hover:bg-gold hover:text-black border border-white/15 hover:border-gold transition-all duration-200 cursor-pointer shadow-sm text-center min-w-[95px]"
                          >
                            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-black">
                              {show.time}
                            </span>
                            <span
                              className={`text-[9px] font-semibold mt-0.5 ${
                                show.status === "Almost full"
                                  ? "text-rose-400 group-hover:text-rose-950"
                                  : show.status === "Filling fast"
                                  ? "text-amber-400 group-hover:text-amber-950"
                                  : "text-emerald-400 group-hover:text-emerald-950"
                              }`}
                            >
                              {show.status}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
                onClick={handleCompleteBooking}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  selectedSeats.length > 0 && !isProcessingPayment
                    ? "bg-gold hover:bg-gold-light text-black shadow-gold/20"
                    : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
                }`}
              >
                {isProcessingPayment ? (
                  <span>Securing Seats...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Proceed to Book ({selectedSeats.length} Tickets)</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: BOOKING CONFIRMED SCREEN (Invoice, Barcode, PDF)                 */}
        {/* ========================================================================= */}
        {bookingStep === "confirmed" && (
          <div className="p-6 sm:p-10 text-center flex flex-col items-center justify-center max-w-lg mx-auto space-y-5">
            <div className="w-16 h-16 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shadow-lg shadow-gold/10">
              <CheckCircle className="w-8 h-8 stroke-[2.5]" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Booking Confirmed!
            </h3>

            <p className="text-xs text-white/70 leading-relaxed">
              Your seats <strong className="text-gold">{selectedSeats.join(", ")}</strong> for{" "}
              <strong className="text-white">{movieTitle}</strong> at{" "}
              <strong className="text-white">{displayTheatre}</strong> are confirmed.
            </p>

            {/* QR Barcode */}
            <div className="p-4 bg-white rounded-2xl shadow-xl">
              <QRCode
                value={getTicketVerificationUrl(generatedBookingId || `BK-${movieTitle}`)}
                size={140}
                level="H"
              />
            </div>
            <span className="font-mono text-xs text-gold font-bold tracking-widest block">
              {generatedBookingId}
            </span>

            {/* PDF Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
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
                    screen: "Audi 1 - 4K Dolby Atmos",
                    date: activeDate.fullDayName,
                    time: displayTimeSlot,
                    seats: selectedSeats,
                    quantity: selectedSeats.length,
                    totalPaid: finalPayableAmount,
                    paymentMethod: paymentMethod,
                  });
                }}
                className="w-full bg-gold hover:bg-gold-light text-black py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Ticket PDF</span>
              </button>

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
                    screen: "Audi 1 - 4K Dolby Atmos",
                    date: activeDate.fullDayName,
                    time: displayTimeSlot,
                    seats: selectedSeats,
                    quantity: selectedSeats.length,
                    totalPaid: finalPayableAmount,
                    paymentMethod: paymentMethod,
                  });
                }}
                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-gold" />
                <span>Print Ticket</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-widest cursor-pointer transition-all"
            >
              Return to Movie Catalog
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
