import React, { useState, useEffect, useRef } from "react";
import { 
  X, Calendar, MapPin, Armchair, CheckCircle, ShieldCheck, CreditCard, 
  AlertCircle, Tag, Percent, Sparkles, Receipt, Coins, ChevronDown, ChevronUp, Check, Info,
  Download, Printer, Share2, Mail, Smartphone, Heart, SlidersHorizontal, ArrowLeft, ArrowRight, Clock,
  Film, Star, Compass, ChevronRight, Pencil, Play, Video, Search, Users, Navigation, CalendarPlus, Ticket
} from "lucide-react";
import QRCode from "react-qr-code";
import { MovieSchedule, Booking, Theatre, Movie } from "../types";
import { INITIAL_MOVIES, INITIAL_THEATRES } from "../data";
import { POPULAR_CITIES, ALL_INDIAN_CITIES } from "../lib/location";
import { FeeCalculationService } from "../services/feeCalculationService";
import { FeeCalculationResult, FeeRule, TaxRule, DiscountRule } from "../types/fees";
import { movieFeeClient, calculateLocalMovieFeeFallback, MovieFeeBreakdown } from "../services/movieFeeService";
import { centralizedPricingClient, PricingCalculationResult } from "../services/centralizedPricingService";
import { 
  generateAndDownloadTicketPdf, 
  getTicketVerificationUrl, 
  downloadQrCodeImage, 
  generateIndividualSeatTickets 
} from "../utils/ticketDeliveryService";
import { getEligibleTheatresAndShows, parseTimeToMinutes, getPrimaryMovieTrailer } from "../utils/movieAvailability";
import { openVenueDirections, downloadCalendarEvent } from "../services/venueLocationService";
import { bookingReminderScheduler } from "../services/bookingReminderScheduler";
import PostBookingFeedbackModal from "./feedback/PostBookingFeedbackModal";
import { feedbackClient } from "../services/feedbackClient";
import { ticketConfirmationService } from "../services/ticketConfirmationService";

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
  movies?: Movie[];
  onUpdateMovie?: (title: string, updatedMovie: Movie) => void;
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
  movies = [],
  onUpdateMovie,
}: BookingModalProps) {
  // Step state: "theatres_showtimes" (District Showtimes View) -> "seat_selection" -> "confirm_booking" -> "confirmed"
  const [bookingStep, setBookingStep] = useState<"theatres_showtimes" | "seat_selection" | "confirm_booking" | "payment_qr" | "confirmed">("theatres_showtimes");
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [qrImgError, setQrImgError] = useState<boolean>(false);

  // Confirm Booking Review Step States
  const [isMusicianDonationAdded, setIsMusicianDonationAdded] = useState(false);
  const [isConvenienceFeesExpanded, setIsConvenienceFeesExpanded] = useState(true);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [showOffersSection, setShowOffersSection] = useState(false);

  // Confirmed Screen States
  const [activeConfirmedSeatIdx, setActiveConfirmedSeatIdx] = useState<number>(0);
  const [showFullTicketModal, setShowFullTicketModal] = useState<boolean>(false);

  // Trailer Video State
  const [showTrailerVideo, setShowTrailerVideo] = useState(false);
  
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const seatScrollRef = useRef<HTMLDivElement>(null);

  // Automatically scroll seat matrix to start (Seat 1) on mobile when entering seat selection
  useEffect(() => {
    if (bookingStep === "seat_selection") {
      const timer = setTimeout(() => {
        if (seatScrollRef.current) {
          seatScrollRef.current.scrollLeft = 0;
        }
        const overlay = document.getElementById("booking-modal-overlay");
        if (overlay) {
          overlay.scrollTop = 0;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [bookingStep]);

  // Manage body class to hide mobile bottom nav while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open-hide-bottom-nav");
    } else {
      document.body.classList.remove("modal-open-hide-bottom-nav");
    }
    return () => {
      document.body.classList.remove("modal-open-hide-bottom-nav");
    };
  }, [isOpen]);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  const handleExitBookingConfirmed = () => {
    if (generatedBookingId && !feedbackClient.isFeedbackHandled(generatedBookingId)) {
      setShowFeedbackModal(true);
    } else {
      onClose();
    }
  };
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
  const [movieFeeBreakdown, setMovieFeeBreakdown] = useState<MovieFeeBreakdown | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Transaction States
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{ paymentId?: string; orderId?: string; method?: string }>({});

  // Lookup target movie metadata with live local storage and prop fallback
  const getResolvedMovie = (): Movie => {
    const cachedMovies: Movie[] = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("cine_movies") || "[]") : [];
    const fromProps = movies.find((m) => m.title.toLowerCase() === movieTitle.toLowerCase());
    const fromCache = cachedMovies.find((m) => m.title.toLowerCase() === movieTitle.toLowerCase());
    const fromInitial = INITIAL_MOVIES.find((m) => m.title.toLowerCase() === movieTitle.toLowerCase());

    if (fromInitial) {
      return {
        ...fromInitial,
        ...(fromCache || {}),
        ...(fromProps || {}),
        castMembers: fromInitial.castMembers,
        crewMembers: fromInitial.crewMembers,
        cast: fromInitial.cast,
        actors: fromInitial.actors,
        director: fromInitial.director,
        trailerUrl: fromInitial.trailerUrl,
        videoUrl: fromInitial.videoUrl,
        videos: fromInitial.videos,
        description: fromInitial.description,
        genre: fromInitial.genre,
        rating: fromInitial.rating,
        certification: fromInitial.certification,
      };
    }
    return (
      fromProps ||
      fromCache || {
        title: movieTitle,
        genre: "Action / Comedy / Crime-Drama",
        lang: "Tamil",
        certification: "UA",
        duration: "2h 24m",
        rating: "9.3",
        poster: "/baththa-poster.jpg",
        img: "/baththa-poster.jpg",
        releaseYear: 2026,
        trailerUrl: "https://www.youtube.com/watch?v=fLnMzPk_p_M",
        description: "Set in 1986 Madras, feared gangster Baththa gets accidentally locked inside an elementary school restroom by a timid 8-year-old student. The unusual predicament strands the dreaded criminal inside for days, igniting a heartwarming, hilarious, and redemptive journey that transforms both of their lives.",
        cast: ["Vijay Sethupathi", "Master Sai Prithviraj", "Lijomol Jose", "Santhy Balachandran", "Ajay Ghosh", "Arjun Chidambaram"],
        actors: ["Vijay Sethupathi", "Master Sai Prithviraj", "Lijomol Jose", "Santhy Balachandran", "Ajay Ghosh", "Arjun Chidambaram"],
        director: "Balaji Tharaneetharan"
      }
    );
  };

  const [currentMovie, setCurrentMovie] = useState<Movie>(getResolvedMovie);

  useEffect(() => {
    setCurrentMovie(getResolvedMovie());
  }, [movieTitle, movies]);

  const movieObj = currentMovie;

  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState<boolean>(false);

  // Primary trailer resolution
  const primaryTrailer = getPrimaryMovieTrailer(movieObj);
  const trailerEmbedUrl = primaryTrailer?.youtubeVideoId
    ? `https://www.youtube.com/embed/${primaryTrailer.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`
    : (primaryTrailer?.youtubeUrl?.includes("watch?v=") 
        ? `https://www.youtube.com/embed/${primaryTrailer.youtubeUrl.split("watch?v=")[1]?.split("&")[0]}?autoplay=1&rel=0&modestbranding=1`
        : "https://www.youtube.com/embed/fLnMzPk_p_M?autoplay=1&rel=0&modestbranding=1");

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

  // Combine live theatres & INITIAL_THEATRES ensuring Sandbox Multiplex is always top-priority
  const allTheatresCatalog = React.useMemo(() => {
    const base = [...INITIAL_THEATRES];
    const baseNames = new Set(base.map(t => t.name.toLowerCase()));
    const extra = (theatres || []).filter(t => !baseNames.has(t.name.toLowerCase()));
    return [...base, ...extra];
  }, [theatres]);

  const eligibleTheatreGroups = React.useMemo(() => {
    const calculated = getEligibleTheatresAndShows(
      allTheatresCatalog,
      schedules,
      movieTitle,
      selectedCity,
      activeDate?.dateStr || "",
      Boolean(activeDate?.isToday),
      Boolean(activeDate?.isTomorrow)
    );

    if (calculated.length > 0) return calculated;

    // Guaranteed Fallback for testing: Always ensure at least the mock theatre with active showtimes is returned!
    const primaryTheatre = allTheatresCatalog.find(t => t.name.includes("Sandbox")) || allTheatresCatalog[0] || INITIAL_THEATRES[0];
    return [
      {
        theatre: primaryTheatre,
        shows: [
          { id: "SHOW-TEST-1", time: "11:30 AM", status: "Available", pricePerSeat: 150 },
          { id: "SHOW-TEST-2", time: "2:45 PM", status: "Filling fast", pricePerSeat: 150 },
          { id: "SHOW-TEST-3", time: "6:30 PM", status: "Available", pricePerSeat: 10 },
          { id: "SHOW-TEST-4", time: "9:45 PM", status: "Available", pricePerSeat: 150 }
        ]
      }
    ];
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

  const activeSchedule = schedules.find(
    (s) =>
      (s.movieTitle || "").toLowerCase() === movieTitle.toLowerCase() &&
      (!selectedTheatreName || (s.theatreName || "").toLowerCase() === selectedTheatreName.toLowerCase()) &&
      (!selectedShowTime || s.timeSlot === selectedShowTime)
  ) || schedules.find((s) => (s.movieTitle || "").toLowerCase() === movieTitle.toLowerCase());

  const pricePerSeat = Number(activeSchedule?.pricePerSeat ?? (movieObj as any)?.price ?? (currentTheatre as any)?.ticketPrice ?? 150) || 150;

  // Layout settings (140 Seats Multiplex Layout: Rows A-K, 14 seats per row)
  const rows = currentTheatre?.seatRows || ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];
  const seatsPerRow = currentTheatre?.seatsPerRow || 14;
  const premiumRows = currentTheatre?.premiumRows || ["E", "F", "G", "H"];
  const blockedSeats = currentTheatre?.blockedSeats || [];
  const wheelchairSeats = currentTheatre?.wheelchairSeats || [];
  const vipSeats = currentTheatre?.vipSeats || [];
  const reclinerSeats = currentTheatre?.reclinerSeats || [
    "J1", "J2", "J3", "J4", "J5", "J6", "J7", "J8", "J9", "J10", "J11", "J12", "J13", "J14",
    "K1", "K2", "K3", "K4", "K5", "K6", "K7", "K8", "K9", "K10", "K11", "K12", "K13", "K14"
  ];
  const rowCategories = currentTheatre?.rowCategories || {
    A: "Classic", B: "Classic", C: "Classic", D: "Classic",
    E: "Prime", F: "Prime", G: "Prime", H: "Prime",
    J: "Recliner", K: "Recliner"
  };

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

  // Authoritative Centralized Pricing State
  const [pricingBreakdown, setPricingBreakdown] = useState<PricingCalculationResult | null>(null);
  const [isPricingCalculating, setIsPricingCalculating] = useState<boolean>(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

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

  // Dynamic Movie Convenience Fee & Pricing Calculation via Authoritative Backend API
  useEffect(() => {
    if (selectedSeats.length === 0) {
      setPricingBreakdown(null);
      setPricingError(null);
      setIsPricingCalculating(false);
      return;
    }

    const tickets = selectedSeats.map((sId) => ({
      price: getSeatPrice(sId),
      category: seatCategoryLabel,
    }));

    // Synchronous immediate local fallback to prevent any UI flicker or zero convenience fee
    try {
      const immediateCalc = centralizedPricingClient.calculateLocalFallback({
        itemType: "MOVIE",
        tickets,
        couponCode: appliedCoupon || undefined,
        musicianDonation: isMusicianDonationAdded,
      });
      setPricingBreakdown(immediateCalc);
      setMovieFeeBreakdown(immediateCalc as any);
    } catch {
      // Ignore fallback calculation errors
    }

    setIsPricingCalculating(true);
    setPricingError(null);

    centralizedPricingClient
      .calculatePrice({
        itemType: "MOVIE",
        tickets,
        couponCode: appliedCoupon || undefined,
        musicianDonation: isMusicianDonationAdded,
      })
      .then((serverCalc) => {
        if (serverCalc) {
          setPricingBreakdown(serverCalc);
          setMovieFeeBreakdown(serverCalc as any);
        }
      })
      .catch((err) => {
        if (err.name === "CanceledError" || err.message === "STALE_PRICING_RESPONSE") {
          return; // Ignore cancelled or stale in-flight responses
        }
        console.error("Centralized pricing calculation error:", err);
      })
      .finally(() => {
        setIsPricingCalculating(false);
      });
  }, [selectedSeats, seatCategoryLabel, appliedCoupon, isMusicianDonationAdded]);

  const rawBaseTicketPrice = pricingBreakdown
    ? Number(pricingBreakdown.ticketSubtotal)
    : selectedSeats.reduce((sum, sId) => sum + getSeatPrice(sId), 0);

  const averagePricePerSeat = selectedSeats.length > 0 ? (rawBaseTicketPrice / selectedSeats.length) : pricePerSeat;

  const baseConvenienceAmount = pricingBreakdown
    ? Number(pricingBreakdown.baseConvenienceFee)
    : 0;

  const igstTaxAmount = pricingBreakdown
    ? Number(pricingBreakdown.convenienceFeeGstTotal ?? pricingBreakdown.taxAmount)
    : 0;

  const totalConvenienceFee = pricingBreakdown
    ? Number(pricingBreakdown.totalConvenienceFee ?? pricingBreakdown.convenienceFee)
    : 0;

  const musicianDonationAmount = pricingBreakdown
    ? Number(pricingBreakdown.musicianDonationAmount)
    : (isMusicianDonationAdded ? selectedSeats.length * 1.00 : 0);

  const couponDiscountAmount = pricingBreakdown
    ? Number(pricingBreakdown.couponDiscount ?? pricingBreakdown.discountAmount)
    : (appliedCoupon ? (appliedCoupon === "WELCOME50" ? 50 : 20) : 0);

  const finalPayableAmount = pricingBreakdown
    ? Number(pricingBreakdown.finalPayableAmount)
    : Math.max(0, Number((rawBaseTicketPrice + totalConvenienceFee + musicianDonationAmount - couponDiscountAmount).toFixed(2)));

  const orderTotalAmount = finalPayableAmount;

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
        bookingMobile || "",
        {
          ticketAmount: rawBaseTicketPrice,
          ticketSubtotal: rawBaseTicketPrice,
          platformFee: calculatedBreakdown?.platformFee || 0,
          convenienceFee: totalConvenienceFee,
          convenienceFeeTax: igstTaxAmount,
          bookingFee: calculatedBreakdown?.bookingFee || 0,
          otherFeeAmount: musicianDonationAmount,
          taxAmount: igstTaxAmount,
          discountAmount: couponDiscountAmount,
          gatewayFee: calculatedBreakdown?.gatewayCharges || 0,
          paymentMethod: paymentMethod,
          feeLines: movieFeeBreakdown?.feeLines || [],
          feeSnapshot: movieFeeBreakdown?.feeSnapshot || null,
          theatreAddress: currentTheatre?.address || currentTheatre?.location || `${selectedCity}, India`,
          theatreLatitude: currentTheatre?.latitude,
          theatreLongitude: currentTheatre?.longitude,
        } as any
      );

      const finalBookingId = confirmedBooking.id || `BK-${Math.floor(100000 + Math.random() * 900000)}`;
      setGeneratedBookingId(finalBookingId);
      setIsProcessingPayment(false);
      setBookingSuccess(true);
      setBookingStep("confirmed");

      // Automated Multi-Interval Reminder Scheduling (24h, 3h, 1h, 15m)
      bookingReminderScheduler.scheduleBookingReminders({
        bookingId: finalBookingId,
        type: "MOVIE",
        title: movieTitle,
        venueName: displayTheatre,
        venueAddress: currentTheatre?.address || currentTheatre?.location || `${selectedCity}, India`,
        city: currentTheatre?.city || selectedCity,
        date: activeDate?.fullDayName || "Today",
        time: displayTimeSlot,
        status: "CONFIRMED",
        recipientEmail: userEmail || "guest@cinevenue.com",
      });

      // Automated Ticket Confirmation Email Dispatch (Non-blocking background delivery)
      ticketConfirmationService.dispatchMovieConfirmation({
        bookingId: finalBookingId,
        bookingCode: finalBookingId,
        movieTitle,
        theatreName: displayTheatre,
        theatreAddress: currentTheatre?.address || currentTheatre?.location || `${selectedCity}, India`,
        city: currentTheatre?.city || selectedCity,
        screenName: currentTheatre?.screens?.[0]?.name || "Screen 1 (4K Dolby Atmos)",
        date: activeDate.fullDayName || activeDate.dateStr,
        timeSlot: displayTimeSlot,
        seats: selectedSeats,
        seatCategory: seatCategoryLabel,
        basePrice: rawBaseTicketPrice,
        convenienceFee: baseConvenienceAmount,
        gstAmount: igstTaxAmount,
        totalPaid: orderTotalAmount,
        customerEmail: userEmail || bookingName,
        customerName: (bookingName || userEmail || "").split("@")[0] || "Valued Patron",
        paymentMethod: paymentMethod,
        posterUrl: movieObj.posterUrl || movieObj.poster,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=2&data=${encodeURIComponent(finalBookingId)}`
      });
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden animate-fade-in text-left"
      id="booking-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (bookingStep === "confirmed") {
            handleExitBookingConfirmed();
          } else {
            onClose();
          }
        }
      }}
    >
      <div
        className={`${
          bookingStep === "confirmed" || bookingStep === "confirm_booking" || bookingStep === "payment_qr"
            ? "bg-[#F4F6FA] text-gray-900 border border-gray-200 max-w-md w-full shadow-2xl h-[100dvh] sm:h-[88vh] sm:max-h-[92vh]"
            : "bg-[#0D0D10] text-white border border-white/10 max-w-5xl w-full h-[100dvh] sm:h-auto sm:max-h-[92vh]"
        } rounded-none sm:rounded-3xl shadow-2xl overflow-hidden text-left flex flex-col backdrop-blur-lg relative transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
        id="booking-modal-content"
      >
        {/* Top Floating Close Button */}
        <button
          onClick={bookingStep === "confirmed" ? handleExitBookingConfirmed : onClose}
          className={`absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center cursor-pointer transition-colors z-30 ${
            bookingStep === "confirmed" || bookingStep === "confirm_booking" || bookingStep === "payment_qr"
              ? "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700 hover:text-black"
              : "bg-white/10 hover:bg-white/20 border-white/15 text-white/80 hover:text-white"
          }`}
          aria-label="Close"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* ========================================================================= */}
        {/* STEP 1: MOVIE THEATRES & SHOWTIMES SCREEN (Dark Luxury Wide UI)          */}
        {/* ========================================================================= */}
        {bookingStep === "theatres_showtimes" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 text-white" style={{ WebkitOverflowScrolling: "touch" }}>
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
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    {movieTitle} <span className="text-white/40 font-normal">({movieObj.releaseYear || 2026})</span>
                  </h1>

                  <button
                    type="button"
                    onClick={() => setShowTrailerVideo(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105"
                  >
                    <Play className="w-3.5 h-3.5 fill-gold" />
                    <span>Watch Trailer</span>
                  </button>


                </div>
                
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70 font-medium">
                  <span className="border border-white/30 px-1.5 py-0.5 rounded text-[11px] font-bold text-white/90">
                    {movieObj.certification || "U"}
                  </span>
                  <span>|</span>
                  <span>{movieObj.duration || "1h 41m"}</span>
                  {movieObj.rating && (
                    <>
                      <span>|</span>
                      <span className="flex items-center gap-1 text-gold font-bold">
                        <Star className="w-3.5 h-3.5 fill-gold" /> {movieObj.rating}/10
                      </span>
                    </>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-white/60 font-medium">
                  {movieObj.lang || "Telugu"}{movieObj.additionalLanguages ? `, ${movieObj.additionalLanguages.join(", ")}` : ""}
                </p>

                <p className="text-xs sm:text-sm text-white/50">
                  {movieObj.genre || "Drama"}
                </p>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* DEDICATED MOVIE DESCRIPTION & CASTING BLOCK IN TICKET BOOKING              */}
            {/* ========================================================================= */}
            <div className="bg-[#141418] border border-white/10 rounded-2xl p-4 sm:p-5 text-left space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-gold/10 text-gold border border-gold/20">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                      <span>Storyline & Starring Cast</span>
                      {movieObj.director && (
                        <span className="hidden sm:inline-block text-[11px] font-normal text-text-muted">
                          • Directed by <strong className="text-gold font-semibold">{movieObj.director}</strong>
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-text-muted">
                      Movie synopsis and cast ensemble details
                    </p>
                  </div>
                </div>


              </div>

              {/* Movie Description / Storyline */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Film className="w-3 h-3 text-gold" />
                  <span>Movie Synopsis</span>
                </div>
                {movieObj.description ? (
                  <div>
                    <p className={`text-xs text-white/85 leading-relaxed font-sans ${!isSynopsisExpanded && movieObj.description.length > 220 ? 'line-clamp-2' : ''}`}>
                      {movieObj.description}
                    </p>
                    {movieObj.description.length > 220 && (
                      <button
                        type="button"
                        onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                        className="text-[11px] text-gold hover:underline font-semibold mt-1 bg-transparent border-0 cursor-pointer p-0 block"
                      >
                        {isSynopsisExpanded ? "Show Less ▲" : "Read Full Synopsis ▼"}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-dashed border-white/10">
                    <p className="text-xs text-text-muted italic">No storyline description available for this movie.</p>
                  </div>
                )}
              </div>

              {/* Starring Cast Ensemble */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-gold" />
                    <span>Starring Cast & Crew</span>
                  </div>
                  {movieObj.director && (
                    <span className="sm:hidden text-[11px] text-white/70">
                      Dir: <strong className="text-gold">{movieObj.director}</strong>
                    </span>
                  )}
                </div>

                {(movieObj.cast || movieObj.actors) && (movieObj.cast || movieObj.actors)!.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(movieObj.cast || movieObj.actors)!.map((actor, idx) => {
                      const actorName = typeof actor === "string" ? actor : ((actor as any)?.name || "");
                      const initials = actorName
                        .split(" ")
                        .map((n) => n[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();
                      return (
                        <div
                          key={actorName + idx}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-gold/30 hover:bg-white/[0.06] transition-all group"
                        >
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold/30 to-amber-500/20 text-gold flex items-center justify-center text-[10px] font-bold shrink-0 border border-gold/30">
                            {initials || "★"}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-semibold text-white/90 group-hover:text-gold transition-colors">
                              {actorName}
                            </span>
                            <span className="text-[9px] text-text-muted uppercase tracking-wider">
                              Cast
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-dashed border-white/10">
                    <p className="text-xs text-text-muted italic">No casting members listed for this movie.</p>
                  </div>
                )}
              </div>
            </div>



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
          <div className="flex flex-col flex-1 h-full min-h-0 overflow-hidden text-left">
            
            {/* Pinned Top Navigation Bar & Movie Details */}
            <div className="shrink-0 p-3 sm:p-6 pb-2.5 space-y-3 border-b border-white/10 bg-[#0D0D10]/95 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setBookingStep("theatres_showtimes")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white hover:text-gold transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-gold" />
                  <span>Change Theatre / Time</span>
                </button>

                <div className="text-right pr-9 sm:pr-0">
                  <span className="text-xs font-bold text-white block truncate max-w-[150px] sm:max-w-none">{displayTheatre}</span>
                  <span className="text-[11px] text-gold font-mono">{activeDate.fullDayName} · {displayTimeSlot}</span>
                </div>
              </div>

              {/* Movie Title Banner */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gold uppercase tracking-widest block">
                    Select Seats for
                  </span>
                  <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
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
              <div className="space-y-1.5 py-1">
                <div className="w-full flex flex-col items-center">
                  <div className="w-3/4 max-w-xs h-1.5 bg-gradient-to-r from-transparent via-gold to-transparent rounded-full shadow-[0_0_15px_rgba(212,175,55,0.6)]" />
                  <span className="text-[9px] uppercase font-mono tracking-[0.3em] text-white/40 mt-1">
                    All Eyes this Way · 4K Laser Screen
                  </span>
                </div>

                {/* Mobile Horizontal Scroll Indicator & Hint */}
                <div className="sm:hidden flex items-center justify-between text-[10px] text-gold font-mono px-3 py-1 bg-gold/10 border border-gold/20 rounded-lg mx-auto max-w-sm">
                  <span>← Seats 1 - 7</span>
                  <span className="text-[9px] text-white/60 font-sans tracking-wide">Swipe horizontally for seats</span>
                  <span>Seats 8 - {seatsPerRow} →</span>
                </div>
              </div>
            </div>

            {/* Scrollable Center: Seats Matrix & Legend */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-6 space-y-4 text-left" style={{ WebkitOverflowScrolling: "touch" }}>
              {/* Seat Matrix (Expanded 140 Seats Multiplex Layout) */}
              <div 
                ref={seatScrollRef}
                className="w-full overflow-x-auto py-2 seat-matrix-scroll"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <div className="w-max min-w-full flex flex-col items-start sm:items-center gap-2 px-3 sm:px-4">
                  {rows.map((row, rIdx) => {
                    const isReclinerRow = row === "J" || row === "K" || (reclinerSeats && reclinerSeats.some((s: string) => s.startsWith(row)));
                    const isPrimeRow = premiumRows.includes(row) || rowCategories[row] === "Prime";
                    const sectionHeader = 
                      row === "A" ? "CLASSIC SECTION · ₹150.00" :
                      row === "E" ? "PRIME / ELITE SECTION · ₹220.00" :
                      row === "J" ? "LUXURY RECLINERS · ₹350.00" : null;

                    return (
                      <React.Fragment key={row}>
                        {sectionHeader && (
                          <div className={`w-full max-w-[580px] flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/50 pt-3 pb-1 border-b border-white/5 ${rIdx > 0 ? "mt-2" : ""}`}>
                            <span className="text-gold font-mono">{sectionHeader}</span>
                            <span className="text-white/40 text-[9px]">{seatsPerRow} Seats / Row</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="w-6 text-center text-xs font-bold font-mono text-white/50 shrink-0">{row}</span>
                          <div className="flex gap-1.5">
                            {Array.from({ length: seatsPerRow }).map((_, colIdx) => {
                              const seatId = `${row}${colIdx + 1}`;
                              const isSelected = selectedSeats.includes(seatId);
                              const blocked = isSeatBlocked(seatId);
                              const isAisleGap = colIdx === 3 || colIdx === 9; // Aisle spaces after seat 4 and seat 10

                              return (
                                <button
                                  key={seatId}
                                  disabled={blocked}
                                  onClick={() => handleSeatClick(seatId)}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono transition-all cursor-pointer shrink-0 ${isAisleGap ? "mr-2.5 sm:mr-3.5" : ""} ${
                                    blocked
                                      ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                                      : isSelected
                                      ? "bg-gold text-black shadow-lg shadow-gold/30 font-extrabold scale-110 border-0"
                                      : isReclinerRow
                                      ? "bg-[#251F14] hover:bg-[#382C18] text-amber-200 border border-gold/40 hover:border-gold"
                                      : isPrimeRow
                                      ? "bg-[#181822] hover:bg-white/20 text-white/90 border border-indigo-400/20 hover:border-gold/40"
                                      : "bg-[#18181C] hover:bg-white/20 text-white/80 border border-white/10 hover:border-gold/40"
                                  }`}
                                  title={`${seatId} (${isReclinerRow ? "Recliner" : isPrimeRow ? "Prime" : "Classic"}) - ₹${getSeatPrice(seatId)}`}
                                >
                                  {colIdx + 1}
                                </button>
                              );
                            })}
                          </div>
                          <span className="w-6 text-center text-xs font-bold font-mono text-white/50 shrink-0">{row}</span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Seat Legend */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-white/60 py-3 border-t border-white/10">
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#18181C] border border-white/10 inline-block" />
                  <span>Classic (₹150)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#181822] border border-indigo-400/30 inline-block" />
                  <span>Prime (₹220)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#251F14] border border-gold/50 inline-block" />
                  <span>Recliner (₹350)</span>
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

            {/* Pinned Bottom: Price Breakdown & Checkout Action */}
            <div className="shrink-0 bg-[#141418] border-t border-white/15 p-3.5 sm:p-5 flex items-center justify-between gap-3 shadow-[0_-4px_25px_rgba(0,0,0,0.6)] z-20">
              <div>
                <span className="text-[10px] sm:text-xs text-white/60 block">Total Payable ({selectedSeats.length} seats)</span>
                {isPricingCalculating ? (
                  <span className="text-sm font-semibold text-gold/70 animate-pulse block py-1">Calculating...</span>
                ) : pricingError ? (
                  <span className="text-xs font-semibold text-rose-400 block py-1">{pricingError}</span>
                ) : (
                  <span className="text-xl sm:text-2xl font-extrabold text-gold font-mono">
                    ₹{(Number(finalPayableAmount) || 0).toFixed(2)}
                  </span>
                )}
              </div>

              <button
                disabled={selectedSeats.length === 0 || isProcessingPayment || isPricingCalculating || Boolean(pricingError)}
                onClick={() => setBookingStep("confirm_booking")}
                className={`px-5 sm:px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer shrink-0 ${
                  selectedSeats.length > 0 && !isProcessingPayment && !isPricingCalculating && !pricingError
                    ? "bg-gold hover:bg-gold-light text-black shadow-gold/20"
                    : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>Review & Confirm ({selectedSeats.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2.5: CONFIRM BOOKING SCREEN (Matching Uploaded Screenshot)           */}
        {/* ========================================================================= */}
        {bookingStep === "confirm_booking" && (
          <div className="bg-[#F4F6FA] text-gray-900 min-h-0 flex-1 overflow-y-auto flex flex-col justify-between" style={{ WebkitOverflowScrolling: "touch" }}>
            <div>
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
                        {(activeDate?.dayName) || "Showday"}, {(activeDate?.dayNum) || ""}{" "}
                        {activeDate?.monthName
                          ? activeDate.monthName.slice(0, 1) + activeDate.monthName.slice(1).toLowerCase()
                          : "Nov"}{" "}
                        {activeDate?.dateStr ? activeDate.dateStr.slice(0, 4) : "2026"} | {displayTimeSlot}
                      </span>
                      <span className="flex items-center gap-1 text-[#E11D48] font-bold text-xs">
                        <Pencil className="w-3 h-3 stroke-[2.5]" />
                        <span>Box Office</span>
                      </span>
                    </div>

                    {/* Row 3: Format */}
                    <p className="text-xs text-gray-500 font-medium">
                      {(movieObj?.lang) || "Telugu"} (2D)
                    </p>

                    {/* Row 4: Seat Category & Seat IDs */}
                    <p className="text-xs font-semibold text-gray-700">
                      {(seatCategoryLabel || "ELITE")}-{selectedSeats.join(", ")}
                    </p>

                    {/* Row 5: Venue and Screen Name */}
                    <p className="text-xs text-gray-500 truncate">
                      {displayTheatre}: {currentTheatre?.screens?.[0]?.name || "4K Laser Dolby Atmos"}, {selectedCity === "All Cities" ? "Guntur" : (selectedCity || "Guntur")}...
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

                {/* Card 2: Price Breakdown (Itemized Before Payment) */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm space-y-2.5 text-left">
                  {/* Line 1: Ticket Quantity and Subtotal */}
                  <div className="flex items-center justify-between text-sm text-gray-800">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-600 font-medium">Ticket Base Subtotal</span>
                      <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {selectedSeats.length} {selectedSeats.length === 1 ? "ticket" : "tickets"}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 font-mono text-base">
                      ₹{(Number(rawBaseTicketPrice) || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Price per ticket:</span>
                    <span className="font-mono text-gray-700">₹{(Number(averagePricePerSeat) || 0).toFixed(2)} × {selectedSeats.length}</span>
                  </div>

                  {/* Convenience Fee Line */}
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Convenience Fee ({movieFeeBreakdown?.feeApplication === "PER_BOOKING" ? "Per Booking" : `${selectedSeats.length} × ₹${((Number(baseConvenienceAmount) || 0) / (selectedSeats.length || 1)).toFixed(2)}`}):</span>
                    <span className="font-mono text-gray-800 font-semibold">₹{(Number(baseConvenienceAmount) || 0).toFixed(2)}</span>
                  </div>

                  {/* 18% GST Line */}
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Applicable GST on Convenience Fee @ 18%:</span>
                    <span className="font-mono text-gray-800 font-semibold">₹{(Number(igstTaxAmount) || 0).toFixed(2)}</span>
                  </div>

                  {/* Musician Donation */}
                  {musicianDonationAmount > 0 && (
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Musician Donation:</span>
                      <span className="font-mono text-gray-800 font-semibold">₹{(Number(musicianDonationAmount) || 0).toFixed(2)}</span>
                    </div>
                  )}

                  {/* Applied Offer Discount */}
                  {couponDiscountAmount > 0 && (
                    <div className="flex items-center justify-between text-xs text-emerald-600 font-semibold">
                      <span>Offer Discount ({appliedCoupon}):</span>
                      <span className="font-mono">-₹{(Number(couponDiscountAmount) || 0).toFixed(2)}</span>
                    </div>
                  )}

                  {/* Dynamic Taxes Notice */}
                  <div className="bg-amber-50/80 border border-amber-200/70 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                    <span className="text-amber-600 font-bold text-sm leading-none mt-0.5">ℹ</span>
                    <div className="leading-snug">
                      <span className="font-bold block text-amber-950">Dynamic Pricing Engine</span>
                      Verified convenience fee and 18% statutory GST calculated dynamically.
                    </div>
                  </div>

                  {/* Dotted Separator */}
                  <div className="border-t border-dashed border-gray-300 my-2" />

                  {/* Total Final Payable Amount */}
                  <div className="flex items-center justify-between text-sm sm:text-base font-bold text-gray-900">
                    <span className="text-gray-900 font-bold">Final Payable Amount</span>
                    <span className="font-mono text-lg font-extrabold text-[#E11D48]">
                      ₹{(Number(orderTotalAmount) || 0).toFixed(2)}
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
                        placeholder="Mobile Number"
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
                      {bookingMobile ? `${bookingMobile} | ` : ""}{userEmail || "user@example.com"}
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
            </div>

            {/* Sticky Bottom Bar with Final Payable Amount */}
            <div className="bg-white border-t border-gray-200 px-5 py-3.5 flex items-center justify-between sticky bottom-0 z-20 shadow-lg shrink-0">
              <div className="text-left">
                <span className="text-xs text-gray-500 block font-medium">Final Payable</span>
                <span className="text-xl font-extrabold text-gray-900 font-mono">
                  ₹{(Number(orderTotalAmount) || 0).toFixed(2)}
                </span>
              </div>
              <button
                disabled={isProcessingPayment || isPricingCalculating || Boolean(pricingError)}
                onClick={() => setBookingStep("payment_qr")}
                className={`px-6 sm:px-8 py-3 rounded-xl font-bold text-sm tracking-wide shadow-md transition-all flex items-center gap-2 ${
                  !isProcessingPayment && !isPricingCalculating && !pricingError
                    ? "bg-[#E11D48] hover:bg-[#BE123C] text-white cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <span>{isPricingCalculating ? "Calculating..." : `Proceed to Payment (₹${(Number(finalPayableAmount) || 0).toFixed(2)})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2.75: UPI / PAYMENT QR CODE CHECKOUT SCREEN                          */}
        {/* ========================================================================= */}
        {bookingStep === "payment_qr" && (
          <div className="bg-[#F8FAFC] text-gray-900 rounded-3xl p-5 sm:p-7 max-w-lg mx-auto space-y-5 animate-fade-in text-left flex-1 overflow-y-auto w-full" style={{ WebkitOverflowScrolling: "touch" }}>
            {/* Top Navigation */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <button
                onClick={() => setBookingStep("confirm_booking")}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-transparent border-none cursor-pointer p-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Order Summary</span>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 cursor-pointer border-none bg-transparent"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Header */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>UPI Payment Gateway (Live Test Mode)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Scan & Pay ₹{(Number(orderTotalAmount) || 0).toFixed(2)}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {movieTitle} • {selectedSeats.length} Ticket{selectedSeats.length > 1 ? "s" : ""} ({selectedSeats.join(", ")}) • {displayTheatre}
              </p>
            </div>

            {/* Live Payment QR Card */}
            <div className="bg-white rounded-2xl border-2 border-dashed border-[#D4AF37]/50 p-5 sm:p-6 shadow-sm flex flex-col items-center justify-center space-y-3.5">
              
              {/* Clean Extracted QR Code (No background banners or names) */}
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex items-center justify-center max-w-[220px]">
                {!qrImgError ? (
                  <img
                    src="/payment-qr.png"
                    alt="Payment QR Code"
                    onError={() => setQrImgError(true)}
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain select-none"
                  />
                ) : (
                  <QRCode
                    value={`upi://pay?pa=9491336996@ptsbi&pn=CineVenue&am=${(Number(finalPayableAmount) || 0).toFixed(2)}&cu=INR&tr=${encodeURIComponent(`CV-${Date.now().toString().slice(-8)}`)}&tn=${encodeURIComponent(`CineVenue-${movieTitle.replace(/\s+/g, "").slice(0, 15)}-${selectedSeats.join("")}`)}`}
                    size={190}
                    level="M"
                  />
                )}
              </div>

              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-gray-800 block">
                  Scan with GPay, PhonePe, Paytm, or any UPI App
                </span>

                <div className="flex items-center justify-center gap-2 pt-0.5 text-xs text-gray-600 font-mono">
                  <span>UPI ID: <strong className="font-mono text-gray-900 font-bold">9491336996@ptsbi</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText("9491336996@ptsbi");
                      setCopiedUpi(true);
                      setTimeout(() => setCopiedUpi(false), 2000);
                    }}
                    className="text-[#E11D48] hover:underline font-bold bg-transparent border-none cursor-pointer p-0 text-xs"
                  >
                    {copiedUpi ? "Copied!" : "Copy ID"}
                  </button>
                </div>
              </div>

              {/* Itemized calculation breakdown */}
              <div className="w-full bg-gray-50 rounded-xl p-3 text-xs space-y-1.5 text-gray-600 border border-gray-100">
                <div className="flex justify-between">
                  <span>Base Ticket Price ({selectedSeats.length} × ₹{(Number(averagePricePerSeat) || 0).toFixed(2)}):</span>
                  <span className="font-mono font-semibold text-gray-800">₹{(Number(rawBaseTicketPrice) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Convenience Fee ({pricingBreakdown?.feeApplication === "PER_BOOKING" ? "Per Booking" : `${selectedSeats.length} × ₹${((Number(baseConvenienceAmount) || 0) / (selectedSeats.length || 1)).toFixed(2)}`}):</span>
                  <span className="font-mono font-semibold text-gray-800">₹{(Number(baseConvenienceAmount) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST on Convenience Fee @ {pricingBreakdown?.gstRate ?? 18}%:</span>
                  <span className="font-mono font-semibold text-gray-800">₹{(Number(igstTaxAmount) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Total Convenience Fee & Taxes:</span>
                  <span className="font-mono font-semibold">₹{(Number(totalConvenienceFee) || 0).toFixed(2)}</span>
                </div>
                {musicianDonationAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Musician Donation:</span>
                    <span className="font-mono font-semibold text-gray-800">₹{(Number(musicianDonationAmount) || 0).toFixed(2)}</span>
                  </div>
                )}
                {couponDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({appliedCoupon}):</span>
                    <span className="font-mono font-semibold">-₹{(Number(couponDiscountAmount) || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-1 flex justify-between font-bold text-gray-900">
                  <span>Total Payable:</span>
                  <span className="font-mono text-[#E11D48] text-sm font-extrabold">₹{(Number(finalPayableAmount) || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Direct UPI Mobile Deep Link */}
              <a
                href={`upi://pay?pa=9491336996@ptsbi&pn=CineVenue&am=${(Number(finalPayableAmount) || 0).toFixed(2)}&cu=INR&tr=${encodeURIComponent(`CV-${Date.now().toString().slice(-8)}`)}&tn=${encodeURIComponent(`CineVenue-${movieTitle.replace(/\s+/g, "").slice(0, 15)}-${selectedSeats.join("")}`)}`}
                className="w-full py-2.5 px-4 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold text-center no-underline flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open in UPI Mobile App</span>
              </a>
            </div>

            {/* Verification & Completion Actions */}
            <div className="space-y-2 pt-1">
              <button
                disabled={isProcessingPayment}
                onClick={handleCompleteBooking}
                className="w-full py-3.5 px-6 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? (
                  <span>Verifying UPI Payment...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Verify Payment & Generate Ticket</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleCompleteBooking}
                className="w-full py-2 px-4 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all cursor-pointer"
              >
                ⚡ Instant Test Payment (Pass & Complete)
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: BOOKING CONFIRMED SCREEN (With Automatic Multi-Ticket QR System) */}
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

          const activeDateSafe = activeDate || upcomingDates?.[0] || {
            dayName: "Wed",
            dayNum: new Date().getDate(),
            monthName: "NOV",
            dateStr: new Date().toISOString().slice(0, 10),
            fullDayName: "Wednesday"
          };
          const ticketFormattedDate = `${activeDateSafe.fullDayName || "Wednesday"}, ${String(activeDateSafe.dayNum || 1).padStart(2, "0")} ${
            activeDateSafe.monthName ? (activeDateSafe.monthName.charAt(0) + activeDateSafe.monthName.slice(1).toLowerCase()) : "Nov"
          } | ${displayTimeSlot}`;

          // Generate unique individual ticket codes & secure QR tokens for each booked seat
          const individualTickets = generateIndividualSeatTickets(
            generatedBookingId || `BK-${movieTitle}`,
            selectedSeats,
            seatCategoryLabel
          );
          const activeSeatTicket = individualTickets[activeConfirmedSeatIdx] || individualTickets[0];
          const activeQrUrl = activeSeatTicket?.qrUrl || getTicketVerificationUrl(activeSeatTicket?.qrToken || generatedBookingId);

          return (
            <div className="p-5 sm:p-7 bg-white text-gray-900 rounded-3xl max-w-md mx-auto flex-1 overflow-y-auto w-full text-left" style={{ WebkitOverflowScrolling: "touch" }}>
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
                  onClick={handleExitBookingConfirmed}
                  className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-800 transition-colors cursor-pointer border-none bg-transparent"
                  title="Close"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Circular Green Checkmark Badge */}
              <div className="text-center my-3">
                <div className="w-14 h-14 rounded-full bg-[#10B981] flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50">
                  <Check className="w-8 h-8 text-white stroke-[3.5]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-3 tracking-tight">
                  Booking Confirmed!
                </h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Payment Verified & QR Generated</span>
                </div>
              </div>

              {/* Movie Info Section with Rounded Poster */}
              <div className="flex items-center gap-4 my-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <img
                  src={movieObj.poster || movieObj.img}
                  alt={movieTitle}
                  className="w-16 sm:w-20 aspect-[2/3] object-cover rounded-xl shadow-sm border border-gray-200 shrink-0"
                />
                <div className="space-y-1 flex-1 min-w-0">
                  <h3 className="text-base font-extrabold text-gray-900 leading-snug truncate">
                    {movieTitle}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {movieObj.lang || "Telugu"} | 2D | {movieObj.certification || "U"}
                  </p>
                  <div className="text-xs font-bold text-[#E11D48] font-mono">
                    Amount Paid: ₹{(Number(finalPayableAmount) || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* White Ticket Card Container with Seat Selector & QR */}
              <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5 mb-4 text-left">
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>Booking ID: <strong className="text-gray-900 font-mono">{generatedBookingId || numericBookingId}</strong></span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px]">VERIFIED</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 pt-1">
                    {ticketFormattedDate}
                  </div>
                </div>

                {/* Individual Seat Selector Tabs if more than 1 seat */}
                {individualTickets.length > 1 && (
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                      Select Seat to View QR Pass ({individualTickets.length} Tickets)
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {individualTickets.map((t, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveConfirmedSeatIdx(idx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            activeConfirmedSeatIdx === idx
                              ? "bg-[#E11D48] text-white shadow-md shadow-red-500/20"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                        >
                          Seat {t.seat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100" />

                {/* Active Ticket QR Section */}
                <div className="flex items-center gap-4 py-1">
                  {/* High-Resolution Scannable QR Code */}
                  <div className="p-2 border border-gray-200/90 rounded-2xl bg-white shrink-0 shadow-sm flex flex-col items-center">
                    <QRCode
                      value={activeQrUrl}
                      size={96}
                      level="M"
                    />
                    <span className="text-[9px] font-mono text-gray-400 mt-1 tracking-tight">SCAN AT GATE</span>
                  </div>

                  {/* Seat & Admission Status Meta */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>VALID TICKET</span>
                    </div>

                    <div className="text-base font-black text-gray-900 uppercase tracking-tight">
                      {currentTheatre?.screens?.[0]?.name || "AUDI 1"}
                    </div>

                    <div className="text-xs font-extrabold text-gray-800">
                      {seatCategoryLabel} • Seat {activeSeatTicket.seat}
                    </div>

                    <div className="text-[11px] font-mono text-gray-500 truncate">
                      Code: <strong className="text-gray-900">{activeSeatTicket.ticketCode || activeSeatTicket.ticketId}</strong>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Venue Name & Complete Verified Address */}
                <div className="flex items-start gap-2.5 py-0.5">
                  <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-gray-900 leading-snug truncate">
                      {displayTheatre}
                    </div>
                    <div className="text-[11px] text-gray-500 leading-relaxed font-normal">
                      {currentTheatre?.address || currentTheatre?.location || `${selectedCity}, India`}
                    </div>
                  </div>
                </div>
              </div>

              {/* CineVenue Official Verified Branding Banner */}
              <div className="bg-gradient-to-r from-[#0D0E15] via-[#1A1C26] to-[#0D0E15] border border-[#D4AF37]/40 rounded-2xl py-3 px-4 text-center shadow-lg shadow-black/20 mb-4 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10 select-none">
                  <img
                    src="/logo.jpg"
                    alt="CineVenue Logo"
                    className="w-9 h-9 rounded-xl object-cover border border-[#D4AF37]/60 shadow-md shadow-[#D4AF37]/25"
                  />
                  <div className="flex flex-col items-start leading-none text-left">
                    <span
                      className="font-serif text-xl font-bold tracking-tight inline-flex items-center drop-shadow-sm"
                      style={{ fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif" }}
                    >
                      <span className="text-white">Cine</span>
                      <span className="text-[#E2B13C] ml-0.5">Venue</span>
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="h-[1px] w-3 bg-[#D4AF37]/60" />
                      <span className="text-[8.5px] tracking-[0.25em] font-semibold text-[#D4AF37] uppercase">
                        Verified Digital Pass
                      </span>
                      <span className="h-[1px] w-3 bg-[#D4AF37]/60" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete Production-Ready Action Buttons Grid */}
              <div className="space-y-2">
                {/* Row 1: View Ticket & Download PDF */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFullTicketModal(true)}
                    className="py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Ticket className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>View Ticket</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      generateAndDownloadTicketPdf({
                        type: "MOVIE",
                        bookingId: generatedBookingId,
                        ticketCode: activeSeatTicket.ticketCode || generatedBookingId,
                        customerName: userEmail ? userEmail.split("@")[0] : "Valued Patron",
                        customerEmail: userEmail || "guest@cinevenue.com",
                        title: movieTitle,
                        venue: displayTheatre,
                        screen: currentTheatre?.screens?.[0]?.name || "Screen 1",
                        date: activeDate?.fullDayName || "Today",
                        time: displayTimeSlot,
                        seats: selectedSeats,
                        quantity: selectedSeats.length,
                        totalPaid: finalPayableAmount,
                        paymentMethod: paymentMethod,
                        individualTickets
                      });
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5 text-white" />
                    <span>Download PDF</span>
                  </button>
                </div>

                {/* Row 2: Download QR Code & My Bookings */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      downloadQrCodeImage(activeQrUrl, `CineVenue-QR-${generatedBookingId || "TKT"}-${activeSeatTicket.seat}.png`);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-600" />
                    <span>Download QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      window.location.href = "/account";
                    }}
                    className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-[#E11D48]" />
                    <span>My Bookings</span>
                  </button>
                </div>

                {/* Row 3: Venue Directions & Calendar */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      openVenueDirections({
                        name: displayTheatre,
                        address: currentTheatre?.address || currentTheatre?.location,
                        city: currentTheatre?.city || selectedCity,
                        latitude: currentTheatre?.latitude,
                        longitude: currentTheatre?.longitude,
                      });
                    }}
                    className="py-2 px-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer border border-gray-200/60"
                  >
                    <Navigation className="w-3 h-3 text-[#D4AF37]" />
                    <span>Get Directions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      downloadCalendarEvent({
                        title: movieTitle,
                        type: "MOVIE",
                        bookingId: numericBookingId,
                        venueName: displayTheatre,
                        venueAddress: currentTheatre?.address || currentTheatre?.location,
                        city: currentTheatre?.city || selectedCity,
                        dateStr: activeDate?.fullDayName || "Today",
                        timeStr: displayTimeSlot,
                        seats: selectedSeats,
                        screen: currentTheatre?.screens?.[0]?.name || "Screen 1",
                      });
                    }}
                    className="py-2 px-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer border border-gray-200/60"
                  >
                    <CalendarPlus className="w-3 h-3 text-[#D4AF37]" />
                    <span>Add to Calendar</span>
                  </button>
                </div>

                {/* Back to Home Button */}
                <button
                  type="button"
                  onClick={handleExitBookingConfirmed}
                  className="w-full py-2.5 mt-1 rounded-xl text-gray-500 hover:text-gray-900 text-xs font-bold cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100"
                >
                  Back to Home
                </button>
              </div>

              {/* Full Ticket Modal Overlay */}
              {showFullTicketModal && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                  <div className="bg-[#0F0F12] border border-[#D4AF37]/50 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center text-white relative shadow-2xl max-h-[90vh] overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => setShowFullTicketModal(false)}
                      className="absolute top-4 right-4 text-white/60 hover:text-white cursor-pointer bg-transparent border-0"
                    >
                      ✕
                    </button>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-gold uppercase bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                        OFFICIAL CINEVENUE PASS
                      </span>
                      <h3 className="text-lg font-black text-white">{movieTitle}</h3>
                      <p className="text-xs text-white/60">{displayTheatre}</p>
                    </div>

                    <div className="p-3 bg-white rounded-2xl w-44 h-44 mx-auto flex items-center justify-center shadow-lg">
                      <QRCode value={activeQrUrl} size={144} level="M" />
                    </div>

                    <div className="text-xs font-mono font-bold text-emerald-400">
                      ● VALID FOR ENTRY · SEAT {activeSeatTicket.seat}
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono space-y-1 text-left">
                      <div className="flex justify-between"><span className="text-white/50">Ticket Code:</span><span className="text-white font-bold">{activeSeatTicket.ticketCode}</span></div>
                      <div className="flex justify-between"><span className="text-white/50">Show Date:</span><span className="text-white">{activeDate.fullDayName}</span></div>
                      <div className="flex justify-between"><span className="text-white/50">Show Time:</span><span className="text-white">{displayTimeSlot}</span></div>
                      <div className="flex justify-between"><span className="text-white/50">Total Paid:</span><span className="text-emerald-400 font-bold">₹{finalPayableAmount.toFixed(2)}</span></div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowFullTicketModal(false)}
                      className="w-full py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                    >
                      Close Ticket View
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}



      </div>

            {/* Full Viewport Centered Trailer Video Modal (Guarantees video is immediately visible on screen) */}
      {showTrailerVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/95 backdrop-blur-md animate-fade-in">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={() => setShowTrailerVideo(false)} />

          <div className="relative z-10 w-full max-w-4xl bg-[#121216] border border-gold/40 rounded-2xl overflow-hidden shadow-2xl shadow-black/90 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#18181F] border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Film className="w-4 h-4 text-gold" />
                <span className="text-sm sm:text-base font-bold text-white truncate">
                  {movieTitle} — Official Theatrical Trailer
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTrailerVideo(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer border-none transition-colors"
                aria-label="Close Trailer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 16:9 Aspect Ratio Video Frame */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              <iframe
                src={trailerEmbedUrl}
                title={`${movieTitle} Official Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 bg-[#0e0e12] border-t border-white/5 flex items-center justify-between text-xs text-white/50">
              <span className="text-gold font-medium">Streaming via CineVenue Official Media</span>
              <button
                type="button"
                onClick={() => setShowTrailerVideo(false)}
                className="text-xs text-white/70 hover:text-white underline cursor-pointer bg-transparent border-none p-0"
              >
                Close Trailer
              </button>
            </div>
          </div>
        </div>
      )}

      <PostBookingFeedbackModal
        isOpen={showFeedbackModal}
        bookingId={generatedBookingId || "BK-RECENT"}
        bookingType="MOVIE"
        title={movieTitle}
        userEmail={userEmail}
        onClose={() => {
          setShowFeedbackModal(false);
          onClose();
        }}
      />
    </div>
  );
}
