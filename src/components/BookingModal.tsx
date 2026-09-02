import React, { useState, useEffect } from "react";
import { 
  X, Calendar, MapPin, Armchair, CheckCircle, ShieldCheck, CreditCard, 
  AlertCircle, Tag, Percent, Sparkles, Receipt, Coins, ChevronDown, ChevronUp, Check, Info
} from "lucide-react";
import { MovieSchedule, Booking, Theatre } from "../types";
import { FeeCalculationService } from "../services/feeCalculationService";
import { FeeCalculationResult, FeeRule, TaxRule, DiscountRule } from "../types/fees";
import api from "../services/api";

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
  selectedTimeSlot = "7:30 PM",
  schedules = [],
  theatres = [],
  registeredUsers = [],
  isMovieBookingSystemActive = true,
}: BookingModalProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [generatedBookingId, setGeneratedBookingId] = useState<string>("");
  
  const [bookingName, setBookingName] = useState("");
  const [bookingMobile, setBookingMobile] = useState("");

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

  // Real-Time Transaction and Booking Flow States
  const [bookingStep, setBookingStep] = useState<"seat_selection" | "confirmed">("seat_selection");
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{ paymentId?: string; orderId?: string; method?: string }>({});

  // Fetch active fee rules, tax rules, and discounts on modal open
  useEffect(() => {
    if (isOpen) {
      fetchPricingRules();
    }
  }, [isOpen]);

  const fetchPricingRules = async () => {
    try {
      const [feesRes, taxesRes, discountsRes] = await Promise.all([
        fetch("/api/admin/fees").then(r => r.json()).catch(() => ({ success: false, fees: [] })),
        fetch("/api/admin/taxes").then(r => r.json()).catch(() => ({ success: false, taxes: [] })),
        fetch("/api/admin/discounts").then(r => r.json()).catch(() => ({ success: false, discounts: [] }))
      ]);

      if (feesRes.success && Array.isArray(feesRes.fees)) setFeeRules(feesRes.fees);
      if (taxesRes.success && Array.isArray(taxesRes.taxes)) setTaxRules(taxesRes.taxes);
      if (discountsRes.success && Array.isArray(discountsRes.discounts)) setDiscountRules(discountsRes.discounts);
    } catch (e) {
      console.warn("Using offline fallback rules for fee engine:", e);
    }
  };

  // Pre-populate attendee details from user profile/email
  useEffect(() => {
    if (userEmail) {
      const match = registeredUsers.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
      if (match) {
        setBookingMobile(match.mobile || "");
        if (match.name) {
          setBookingName(match.name);
        } else {
          const prefix = userEmail.split("@")[0];
          const cleanName = prefix.charAt(0).toUpperCase() + prefix.slice(1).replace(/[^a-zA-Z]/g, " ");
          setBookingName(cleanName);
        }
      } else {
        const prefix = userEmail.split("@")[0];
        const cleanName = prefix.charAt(0).toUpperCase() + prefix.slice(1).replace(/[^a-zA-Z]/g, " ");
        setBookingName(cleanName);
        setBookingMobile("");
      }
    } else {
      setBookingName("");
      setBookingMobile("");
    }
  }, [userEmail, registeredUsers, isOpen]);

  // Filter schedules for this specific movie (only deployed & active ones)
  const movieSchedules = schedules.filter((s) => s.movieTitle === movieTitle && s.isDeployed !== false && s.isActive !== false);

  // Set initial selected schedule
  useEffect(() => {
    if (movieSchedules.length > 0) {
      setSelectedScheduleId(movieSchedules[0].id);
    } else {
      setSelectedScheduleId("");
    }
  }, [movieTitle, schedules]);

  // Find active schedule or fall back to defaults
  const activeSchedule = schedules.find((s) => s.id === selectedScheduleId);
  const pricePerSeat = activeSchedule ? activeSchedule.pricePerSeat : 250;
  const displayTheatre = activeSchedule ? activeSchedule.theatreName : "PVR VIP Theatre";
  const displayTimeSlot = activeSchedule ? activeSchedule.timeSlot : selectedTimeSlot;

  // Find actual theatre metadata
  const currentTheatre = theatres.find((t) => t.name === displayTheatre);

  // Layout settings (from active theatre or fallback defaults)
  const rows = currentTheatre?.seatRows || ["A", "B", "C", "D", "E", "F"];
  const seatsPerRow = currentTheatre?.seatsPerRow || 8;
  const premiumRows = currentTheatre?.premiumRows || ["A", "B"];
  const blockedSeats = currentTheatre?.blockedSeats || [];
  const wheelchairSeats = currentTheatre?.wheelchairSeats || [];
  const vipSeats = currentTheatre?.vipSeats || [];
  const reclinerSeats = currentTheatre?.reclinerSeats || [];
  const emergencyExits = currentTheatre?.emergencyExits || [];
  const rowCategories = currentTheatre?.rowCategories || {};

  // Price calculation per seat
  const getSeatPrice = (seatId: string) => {
    const rowLetter = seatId.charAt(0);
    // Custom row pricing
    if (currentTheatre?.seatPrices && currentTheatre.seatPrices[rowLetter] !== undefined) {
      return currentTheatre.seatPrices[rowLetter];
    }
    const isVip = vipSeats.includes(seatId);
    const isRecliner = reclinerSeats.includes(seatId);
    const isWheelchair = wheelchairSeats.includes(seatId);

    // If VIP or Recliner, apply custom markups
    if (isVip) {
      return Math.round(pricePerSeat * 2.0); // VIP gets 2x markup
    }
    if (isRecliner) {
      return Math.round(pricePerSeat * 1.8); // Recliner gets 1.8x markup
    }
    if (isWheelchair) {
      return Math.round(pricePerSeat * 0.9); // Wheelchair gets a slight discount!
    }

    const rowCat = rowCategories[rowLetter] || (premiumRows.includes(rowLetter) ? 'Premium' : 'Silver');
    const base = pricePerSeat;
    if (rowCat === 'Premium') {
      return Math.round(base * (currentTheatre?.premiumMultiplier || 1.5));
    }
    if (rowCat === 'Gold') {
      return Math.round(base * 1.25);
    }
    return base;
  };

  const isSeatBlocked = (seatId: string) => {
    return blockedSeats.includes(seatId);
  };

  // Initial booked seats fallback list + any custom bookings done during this session
  const initialBookedList = ["A2", "A5", "B3", "B4", "C1", "C6", "D2", "D7", "E4", "E5"];
  const movieBookedSeats = globalBookings[movieTitle] || [];
  const allBookedSeats = [...initialBookedList, ...movieBookedSeats];

  useEffect(() => {
    if (isOpen) {
      setSelectedSeats([]);
      setBookingSuccess(false);
      setBookingStep("seat_selection");
      setIsProcessingPayment(false);
      setPaymentError(null);
      setPaymentInfo({});
      setAppliedCoupon(null);
      setCouponInput("");
      setCouponMessage(null);
    }
  }, [isOpen, movieTitle]);

  const toggleSeat = (seatId: string) => {
    if (!isMovieBookingSystemActive) return; // Booking system is OFF
    if (allBookedSeats.includes(seatId) || isSeatBlocked(seatId)) return; // Can't select booked/blocked seats

    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  };

  // Raw base ticket amount
  const rawBaseTicketPrice = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);

  // Recalculate full dynamic fees whenever seats, schedule, coupon, or payment method changes
  useEffect(() => {
    if (selectedSeats.length === 0) {
      setCalculatedBreakdown(null);
      return;
    }

    setIsCalculating(true);

    const seatCategories = selectedSeats.map(seat => {
      const row = seat.charAt(0);
      if (vipSeats.includes(seat)) return "VIP";
      if (reclinerSeats.includes(seat)) return "Recliner";
      if (wheelchairSeats.includes(seat)) return "Wheelchair";
      return rowCategories[row] || (premiumRows.includes(row) ? 'Premium' : 'Silver');
    });

    const seatPrices: { [sn: string]: number } = {};
    selectedSeats.forEach(sn => {
      seatPrices[sn] = getSeatPrice(sn);
    });

    const context = {
      ticketAmount: rawBaseTicketPrice,
      ticketCount: selectedSeats.length,
      seatPrices,
      theatreName: displayTheatre,
      movieTitle: movieTitle,
      cityName: selectedCity,
      seatCategories,
      paymentMethod,
      couponCode: appliedCoupon,
      customerEmail: userEmail || undefined
    };

    // Client-side instant evaluation with Decimal precision
    // Call server calculate-price endpoint for authoritative sync
    const tickets = selectedSeats.map(seat => ({ seatId: seat, price: getSeatPrice(seat) }));
    fetch("/api/booking/calculate-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        showId: "show_123", // In a real app we'd pass the actual showId
        tickets
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          // Map backend format to frontend format for calculatedBreakdown
          setCalculatedBreakdown({
            totalAmount: data.data.total,
            ticketTotal: data.data.ticketSubtotal,
            taxTotal: data.data.ticketTax + data.data.convenienceFeeTax,
            convenienceFeeTotal: data.data.convenienceFee,
            totalTaxes: data.data.ticketTax + data.data.convenienceFeeTax,
            originalData: data.data
          } as any);
        }
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
    feeRules, 
    taxRules, 
    discountRules
  ]);

  // Handle Coupon Application
  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      setCouponMessage({ type: 'error', text: 'Please enter a coupon code.' });
      return;
    }

    // Look up discount in active rules or defaults
    const match = discountRules.find(d => d.couponCode?.toUpperCase() === code && d.status === 'ACTIVE') ||
      (code === 'CINE50' ? { name: 'CineVenue ₹50 Flat Off', minAmount: 200, value: 50, type: 'FIXED' } : null) ||
      (code === 'FIRST100' ? { name: 'First Booking ₹100 Off', minAmount: 300, value: 100, type: 'FIXED' } : null);

    if (!match) {
      setCouponMessage({ type: 'error', text: `Coupon "${code}" is invalid or expired.` });
      return;
    }

    if (match.minAmount && rawBaseTicketPrice < match.minAmount) {
      setCouponMessage({ 
        type: 'error', 
        text: `Min order value of ₹${match.minAmount} required for coupon "${code}".` 
      });
      return;
    }

    setAppliedCoupon(code);
    setCouponInput(code);
    setCouponMessage({ type: 'success', text: `Coupon "${code}" applied successfully! 🎉` });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponMessage(null);
  };

  const finalPayableAmount = calculatedBreakdown ? calculatedBreakdown.totalAmount : rawBaseTicketPrice;

  // Trigger Official Razorpay Checkout Flow
  const handleRazorpayPayment = async () => {
    if (!userEmail) {
      alert("Sign In Required: Please log in to complete your premium ticket purchase.");
      onOpenAuth();
      return;
    }

    if (!bookingMobile.trim()) {
      alert("Mobile Number Required: Please enter a valid mobile number for ticket updates.");
      return;
    }

    if (selectedSeats.length === 0) {
      alert("No Seats Selected: Please select at least one seat to proceed with booking.");
      return;
    }

    setPaymentError(null);
    setIsProcessingPayment(true);

    try {
      // 1. Create Razorpay Payment Order on the Server
      const tickets = selectedSeats.map(seat => ({ seatId: seat, price: getSeatPrice(seat) }));
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: "show_123", // Mock
          tickets
        })
      });
      const orderData = await orderRes.json();

      if (!orderData || !orderData.success || !orderData.data.orderId) {
        throw new Error(orderData?.message || "Unable to initiate checkout order.");
      }

      const order_id = orderData.data.orderId;
      const key_id = "rzp_test_mock"; // We'll mock the razorpay key
      

      // 2. Ensure Razorpay Checkout SDK is loaded
      const RazorpaySDK = (window as any).Razorpay;
      if (!RazorpaySDK) {
        throw new Error("Razorpay SDK is initializing. Please retry in a moment.");
      }

      // 3. Configure Original Razorpay Checkout Options
      const options = {
        key: key_id || (import.meta as any).env.VITE_RAZORPAY_KEY_ID || "rzp_test_TB7njDD8MonAMK",
        amount: Math.round(finalPayableAmount * 100), // In paise
        currency: "INR",
        name: "CineVenue VIP Cinemas",
        description: `${movieTitle} · ${selectedSeats.length} Ticket(s) (${selectedSeats.join(", ")}) · Net: ₹${finalPayableAmount}`,
        image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=128&auto=format&fit=crop&q=80",
        order_id: order_id,
        prefill: {
          name: bookingName.trim() || (userEmail ? userEmail.split("@")[0] : "Cinema Guest"),
          email: userEmail,
          contact: bookingMobile.trim()
        },
        notes: {
          movie: movieTitle,
          theatre: displayTheatre,
          timeSlot: displayTimeSlot,
          seats: selectedSeats.join(", "),
          city: selectedCity,
          platformFee: calculatedBreakdown?.platformFeeTotal || 18,
          taxes: calculatedBreakdown?.totalTaxes || 3.24,
          discount: calculatedBreakdown?.totalDiscount || 0,
          paymentMethod
        },
        theme: {
          color: "#D4AF37", // CineVenue Luxury Gold
          backdrop_color: "#0A0A0B"
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          }
        },
        handler: async function (response: any) {
          try {
            setIsProcessingPayment(true);

            // 4. Verify Payment Signature on the Server
            const verifyRes = await api.post("/verify-payment", {
              razorpay_order_id: response.razorpay_order_id || order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data && verifyRes.data.success) {
              const finalBookingName = bookingName.trim() || (userEmail ? userEmail.split("@")[0] : "Attendee");
              
              const resBooking = onConfirmBooking(
                movieTitle,
                selectedSeats,
                finalPayableAmount,
                displayTheatre,
                displayTimeSlot,
                finalBookingName,
                bookingMobile.trim(),
                {
                  ticketAmount: rawBaseTicketPrice,
                  platformFee: calculatedBreakdown?.platformFeeTotal || 0,
                  convenienceFee: calculatedBreakdown?.convenienceFeeTotal || 0,
                  bookingFee: calculatedBreakdown?.bookingFeeTotal || 0,
                  otherFeeAmount: calculatedBreakdown?.otherFeesTotal || 0,
                  taxAmount: calculatedBreakdown?.totalTaxes || 0,
                  discountAmount: calculatedBreakdown?.totalDiscount || 0,
                  gatewayFee: calculatedBreakdown?.gatewayCharges || 0,
                  paymentMethod: paymentMethod,
                  feeLines: calculatedBreakdown?.fees || [],
                  taxLines: calculatedBreakdown?.taxes || []
                }
              );

              setPaymentInfo({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id || order_id,
                method: `Razorpay (${paymentMethod})`
              });

              if (resBooking && resBooking.id) {
                setGeneratedBookingId(resBooking.id);
              } else {
                setGeneratedBookingId("BK-" + Math.floor(100000 + Math.random() * 900000));
              }

              setIsProcessingPayment(false);
              setBookingStep("confirmed");
              setBookingSuccess(true);
            } else {
              throw new Error(verifyRes.data?.message || "Razorpay signature verification failed.");
            }
          } catch (verificationError: any) {
            console.error("Signature verification error:", verificationError);
            setPaymentError(
              verificationError.response?.data?.message ||
              verificationError.message ||
              "Payment verification could not be confirmed. If money was debited, contact CineVenue concierge."
            );
            setIsProcessingPayment(false);
          }
        }
      };

      const rzp = new RazorpaySDK(options);

      rzp.on("payment.failed", function (response: any) {
        console.error("Razorpay Payment Failure:", response.error);
        setPaymentError(
          `Payment not completed: ${response.error?.description || response.error?.reason || "Transaction was cancelled or declined."}`
        );
        setIsProcessingPayment(false);
      });

      rzp.open();
    } catch (err: any) {
      console.error("Razorpay Setup Error:", err);
      setPaymentError(
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred while launching Razorpay. Please try again."
      );
      setIsProcessingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in" id="booking-modal-overlay">
      <div 
        className="bg-[#0A0A0B] border border-white/10 w-full max-w-2xl rounded-xl relative shadow-2xl overflow-hidden p-6 md:p-8 text-left my-8 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
        id="booking-modal-content"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-text-secondary hover:text-gold hover:border-gold cursor-pointer transition-colors z-10"
          id="close-booking-modal-btn"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Real-time State Switched Viewports */}
        {bookingStep === "confirmed" ? (
          <div className="py-8 text-center flex flex-col items-center justify-center max-w-lg mx-auto" id="booking-success-view">
            <div className="w-16 h-16 rounded-full bg-gold-glow border border-gold/30 flex items-center justify-center text-gold mb-4 shadow-lg shadow-gold/5 animate-fade-in">
              <CheckCircle className="w-8 h-8 stroke-[2.5]" />
            </div>
            
            <h3 className="font-display text-3xl font-light text-text-primary mb-1 italic">
              Booking Confirmed!
            </h3>
            
            <p className="text-xs text-text-secondary leading-relaxed mb-5">
              Congratulations! Your premium seats <span className="text-gold font-bold">{selectedSeats.join(", ")}</span> have been reserved for <span className="text-text-primary font-bold">{movieTitle}</span>. Your ticket invoice and venue entry barcode have been sent to <span className="text-text-primary font-semibold underline">{userEmail}</span>.
            </p>

            {/* Itemized Dynamic Bill Receipt */}
            <div className="w-full bg-white/[0.02] border border-white/10 p-4 rounded-xl text-left mb-6 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-white/5 font-mono text-[11px]">
                <span className="text-gold font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  Tax Invoice & Settle Receipt
                </span>
                <span className="text-text-secondary">{generatedBookingId || "BK-774291"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-text-secondary">Venue & City</span>
                <span className="text-text-primary font-semibold">{displayTheatre} · {selectedCity}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-text-secondary">Show Time</span>
                <span className="text-text-primary font-semibold">Today · {displayTimeSlot}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-text-secondary">Seats ({selectedSeats.length})</span>
                <span className="text-text-primary font-semibold">{selectedSeats.join(", ")}</span>
              </div>

              <div className="pt-2 border-t border-white/5 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-text-secondary">
                  <span>Base Tickets Subtotal:</span>
                  <span>₹{rawBaseTicketPrice.toFixed(2)}</span>
                </div>

                {calculatedBreakdown && calculatedBreakdown.fees.map((f, i) => (
                  <div key={i} className="flex justify-between text-text-secondary">
                    <span>{f.name}:</span>
                    <span>₹{f.amount.toFixed(2)}</span>
                  </div>
                ))}

                {calculatedBreakdown && calculatedBreakdown.taxes.map((t, i) => (
                  <div key={i} className="flex justify-between text-emerald-400/90">
                    <span>{t.name}:</span>
                    <span>+₹{t.amount.toFixed(2)}</span>
                  </div>
                ))}

                {calculatedBreakdown && calculatedBreakdown.totalDiscount > 0 && (
                  <div className="flex justify-between text-purple-400 font-bold">
                    <span>Coupon / Promo Discount:</span>
                    <span>-₹{calculatedBreakdown.totalDiscount.toFixed(2)}</span>
                  </div>
                )}

                {calculatedBreakdown && calculatedBreakdown.gatewayCharges > 0 && (
                  <div className="flex justify-between text-text-secondary">
                    <span>Payment Processing Surcharge:</span>
                    <span>+₹{calculatedBreakdown.gatewayCharges.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-white/10 font-bold">
                <span className="text-text-primary text-xs uppercase tracking-wider">Total Paid:</span>
                <span className="text-gold font-extrabold text-base font-mono">₹{finalPayableAmount.toFixed(2)}</span>
              </div>

              {paymentInfo.paymentId && (
                <div className="flex justify-between items-center pt-1 font-mono text-[10px] text-text-muted">
                  <span>Razorpay Payment ID:</span>
                  <span className="text-text-secondary">{paymentInfo.paymentId}</span>
                </div>
              )}
            </div>

            {/* Dynamic Interactive Barcode / QR Code */}
            <div className="relative p-4 rounded-xl bg-white/[0.01] border border-white/5 w-full flex flex-col items-center justify-center gap-2 mb-6 shadow-inner select-none">
              <div className="p-3 bg-white rounded-lg relative shadow-lg">
                <svg className="w-20 h-20 text-black" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="0" y="0" width="30" height="30" fill="black" />
                  <rect x="5" y="5" width="20" height="20" fill="white" />
                  <rect x="10" y="10" width="10" height="10" fill="black" />

                  <rect x="70" y="0" width="30" height="30" fill="black" />
                  <rect x="75" y="5" width="20" height="20" fill="white" />
                  <rect x="80" y="10" width="10" height="10" fill="black" />

                  <rect x="0" y="70" width="30" height="30" fill="black" />
                  <rect x="5" y="75" width="20" height="20" fill="white" />
                  <rect x="10" y="80" width="10" height="10" fill="black" />

                  <rect x="75" y="75" width="15" height="15" fill="black" />
                  <rect x="79" y="79" width="7" height="7" fill="white" />
                  <rect x="81" y="81" width="3" height="3" fill="black" />

                  <path d="M35,3 L38,3 L38,6 L35,6 Z M42,3 L48,3 L48,9 L42,9 Z M52,2 L55,2 L55,5 L52,5 Z M60,0 L65,0 L65,8 L60,8 Z M35,12 L40,12 L40,15 L35,15 Z M45,15 L50,15 L50,18 L45,18 Z M55,10 L62,10 L62,13 L55,13 Z M65,12 L68,12 L68,18 L65,18 Z M35,22 L38,22 L38,28 L35,28 Z M45,22 L48,22 L48,25 L45,25 Z M52,20 L58,20 L58,23 L52,23 Z M62,24 L68,24 L68,29 L62,29 Z M5,35 L12,35 L12,38 L5,38 Z M18,35 L24,35 L24,40 L18,40 Z M28,32 L31,32 L31,38 L28,38 Z M5,42 L8,42 L8,48 L5,48 Z M15,45 L20,45 L20,50 L15,50 Z M25,44 L28,44 L28,48 L25,48 Z M3,54 L8,54 L8,60 L3,60 Z M12,52 L18,52 L18,58 L12,58 Z M22,55 L25,55 L25,58 L22,58 Z" />
                  <path d="M35,35 L45,35 L45,45 L35,45 Z M50,32 L58,32 L58,40 L50,40 Z M62,35 L68,35 L68,38 L62,38 Z M32,50 L38,50 L38,55 L32,55 Z M42,52 L48,52 L48,58 L42,58 Z M52,48 L60,48 L60,54 L52,54 Z M64,50 L68,50 L68,56 L64,56 Z M35,62 L40,62 L40,68 L35,68 Z M45,64 L50,64 L50,68 L45,68 Z M55,60 L62,60 L62,65 L55,65 Z M65,62 L68,62 L68,68 L65,68 Z M72,32 L78,32 L78,35 L72,35 Z M82,35 L88,35 L88,38 L82,38 Z M92,32 L98,32 L98,38 L92,38 Z M72,42 L75,42 L75,48 L72,48 Z M80,45 L85,45 L85,50 L80,50 Z M90,42 L95,42 L95,48 L90,48 Z M72,52 L78,52 L78,58 L72,58 Z M82,55 L88,55 L88,58 L82,58 Z M92,52 L96,52 L96,56 L92,56 Z M72,62 L75,62 L75,68 L72,68 Z M80,64 L85,64 L85,68 L80,68 Z M90,60 L98,60 L98,65 L90,65 Z" />
                </svg>
              </div>
              
              <div className="text-center font-mono text-[10px] text-gold font-bold tracking-[0.25em]">
                {generatedBookingId || "TICKET ID: BK-7742"}
              </div>
              <div className="text-[9px] text-text-muted font-mono uppercase">
                Direct Gate Entry Authorized via CineVenue Mobile Pass
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-gold hover:bg-gold-light text-black py-3.5 rounded-sm text-xs font-bold tracking-[0.2em] uppercase cursor-pointer transition-all duration-200"
              id="return-to-lobby-btn"
            >
              Return to Lobby
            </button>
          </div>
        ) : (
          /* Interactive Ticket Reservation Screen */
          <div id="booking-reservation-view">
            {!isMovieBookingSystemActive && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl mb-4 text-center">
                <p className="text-xs font-bold text-rose-300">⚠️ Booking System OFF</p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Movie ticket booking is currently disabled by platform administrators.
                </p>
              </div>
            )}

            {paymentError && (
              <div className="bg-rose-500/15 border border-rose-500/30 p-3.5 rounded-lg mb-4 text-xs text-rose-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-rose-200">Payment Notice</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-rose-300">{paymentError}</p>
                </div>
                <button
                  onClick={() => setPaymentError(null)}
                  className="text-rose-400 hover:text-rose-200 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-gold tracking-[0.3em] uppercase block">
                VIP Ticket Reservation & Pricing Engine
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Dynamic Surge Active
              </span>
            </div>

            <h3 className="font-display text-3xl font-light text-text-primary tracking-wide mb-1 italic">
              {movieTitle}
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Dolby Cinema · Laser Projection · UA Certified · 2h 18m
            </p>

            {/* Show/Schedule Selector */}
            {movieSchedules.length > 0 ? (
              <div className="mb-5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.1em] block mb-2">
                  Select Scheduled Show & Pricing
                </label>
                <select
                  value={selectedScheduleId}
                  onChange={(e) => setSelectedScheduleId(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-md p-3 text-xs text-text-primary focus:outline-none focus:border-gold cursor-pointer"
                  id="select-schedule"
                >
                  {movieSchedules.map((sch) => (
                    <option key={sch.id} value={sch.id} className="bg-[#0A0A0B] text-text-primary">
                      {sch.theatreName} · {sch.timeSlot} (Base ₹{sch.pricePerSeat}/seat)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mb-5 text-[11px] text-text-secondary bg-white/[0.02] border border-white/5 p-3 rounded">
                ℹ️ Running on Default Venue scheduling & Pricing (Base ₹{pricePerSeat}/seat).
              </div>
            )}

            {/* Event Specs info line */}
            <div className="bg-white/[0.02] border border-white/10 p-3 rounded-md flex items-center justify-between text-[11px] font-semibold text-text-secondary mb-5 gap-4">
              <span className="flex items-center gap-1.5 truncate"><MapPin className="w-3.5 h-3.5 text-gold shrink-0" /> {displayTheatre}</span>
              <span className="flex items-center gap-1.5 shrink-0"><Calendar className="w-3.5 h-3.5 text-gold" /> Today · {displayTimeSlot}</span>
              <span className="text-gold uppercase tracking-wider shrink-0 font-mono text-[10px]">Dolby Atmos</span>
            </div>

            {/* Curvaceous Golden Screen Display */}
            <div className="w-full mb-6 text-center">
              <div className="h-[3px] bg-gradient-to-r from-gold/20 via-gold to-gold/20 rounded-full w-4/5 mx-auto relative shadow-[0_4px_16px_rgba(201,168,76,0.3)]" />
              <span className="text-[9px] font-semibold text-text-secondary tracking-[0.2em] block mt-2">
                CINEMATIC SCREEN STAGE
              </span>
            </div>

            {/* Interactive Seat map selection grid */}
            <div className="flex flex-col gap-2.5 items-center justify-center mb-5 bg-black/40 p-4 sm:p-5 rounded-lg border border-white/10 select-none">
              {rows.map((row) => (
                <div key={row} className="flex gap-2 sm:gap-2.5 items-center">
                  {/* Row Letter label */}
                  <span className="text-[10px] font-bold text-text-secondary w-4 text-center">
                    {row}
                  </span>

                  {/* Seat columns */}
                  {Array.from({ length: seatsPerRow }).map((_, i) => {
                    const colNum = i + 1;
                    const seatId = `${row}${colNum}`;
                    const isBooked = allBookedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    const isBlocked = isSeatBlocked(seatId);
                    
                    const isWheelchair = wheelchairSeats.includes(seatId);
                    const isVip = vipSeats.includes(seatId);
                    const isRecliner = reclinerSeats.includes(seatId);
                    const isExit = emergencyExits.includes(seatId);
                    const rowCat = rowCategories[row] || (premiumRows.includes(row) ? 'Premium' : 'Silver');
                    const seatPrice = getSeatPrice(seatId);

                    let seatClass = "";
                    let content: React.ReactNode = colNum;
                    let seatTypeName = `${rowCat} Seat`;

                    if (isBooked) {
                      seatClass = "bg-white/5 border border-white/5 text-text-secondary/25 cursor-not-allowed opacity-20";
                    } else if (isBlocked) {
                      seatClass = "bg-red-950/20 border border-red-900/45 text-red-600/50 cursor-not-allowed opacity-25";
                      content = "×";
                      seatTypeName = "Blocked Seat";
                    } else if (isSelected) {
                      seatClass = "bg-gold border border-gold text-black font-extrabold shadow-lg shadow-gold/10 scale-105";
                    } else if (isExit) {
                      seatClass = "bg-emerald-950/30 border border-emerald-500 text-emerald-400 font-bold cursor-pointer";
                      content = "🚪";
                      seatTypeName = "Emergency Exit Row";
                    } else if (isWheelchair) {
                      seatClass = "bg-blue-950/30 border border-blue-500/40 hover:border-blue-400 text-blue-400 font-bold cursor-pointer";
                      content = "♿";
                      seatTypeName = "Wheelchair Seat";
                    } else if (isVip) {
                      seatClass = "bg-purple-950/30 border border-purple-500/40 hover:border-purple-400 text-purple-400 font-bold cursor-pointer";
                      content = "👑";
                      seatTypeName = "VIP Luxury Seat";
                    } else if (isRecliner) {
                      seatClass = "bg-pink-950/30 border border-pink-500/40 hover:border-pink-400 text-pink-400 font-bold cursor-pointer";
                      content = "🛋️";
                      seatTypeName = "Recliner Lounger";
                    } else if (rowCat === 'Premium') {
                      seatClass = "bg-amber-500/10 border border-amber-500/35 hover:border-gold hover:text-gold text-amber-400 cursor-pointer";
                    } else if (rowCat === 'Gold') {
                      seatClass = "bg-yellow-600/10 border border-yellow-600/35 hover:border-gold hover:text-gold text-yellow-400 cursor-pointer";
                    } else {
                      seatClass = "bg-white/[0.02] border border-white/10 hover:border-gold hover:text-gold text-text-secondary cursor-pointer";
                    }

                    return (
                      <button
                        key={seatId}
                        onClick={() => toggleSeat(seatId)}
                        disabled={isBooked || isBlocked}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded text-[9px] font-bold flex items-center justify-center transition-all ${seatClass}`}
                        title={
                          isBooked
                            ? `Seat ${seatId} (Booked)`
                            : isBlocked
                            ? `Seat ${seatId} (Blocked / Out of service)`
                            : `Seat ${seatId} (${seatTypeName} - ₹${seatPrice})`
                        }
                      >
                        {content}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Seat Map color legends */}
            <div className="flex flex-wrap justify-center gap-3 text-[10px] font-semibold text-text-secondary mb-5 pb-3 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-white/[0.02] border border-white/10" />
                <span>Silver</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-yellow-600/10 border border-yellow-600/35" />
                <span className="text-yellow-400">Gold</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500/10 border border-amber-500/35" />
                <span className="text-amber-400">Premium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-950/30 border border-purple-500/50 flex items-center justify-center text-purple-400 text-[8px]">👑</span>
                <span className="text-purple-400">VIP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-pink-950/30 border border-pink-500/50 flex items-center justify-center text-pink-400 text-[8px]">🛋️</span>
                <span className="text-pink-400">Recliner</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gold" />
                <span className="text-gold font-bold">Selected</span>
              </div>
            </div>

            {/* Contact & Attendee Credentials */}
            <div className="space-y-3 mb-4 bg-white/[0.01] border border-white/5 p-3.5 rounded-xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] font-bold text-gold uppercase tracking-[0.1em]">
                  👤 Contact & Ticket Delivery Info
                </span>
                <span className="text-[10px] text-text-secondary">
                  {userEmail || "Guest User"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-text-secondary uppercase">Attendee Name</label>
                  <input
                    type="text"
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    placeholder="Enter attendee name"
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-text-secondary uppercase">Mobile Number (SMS pass)</label>
                  <input
                    type="tel"
                    value={bookingMobile}
                    onChange={(e) => setBookingMobile(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Coupons & Promo Codes Section */}
            <div className="mb-4 bg-purple-950/10 border border-purple-500/20 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Promo Codes & Discounts
                </span>
                {appliedCoupon && (
                  <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> {appliedCoupon} APPLIED
                  </span>
                )}
              </div>

              {/* Quick Coupon Chips */}
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  onClick={() => handleApplyCoupon("CINE50")}
                  className={`text-[10px] font-mono px-2.5 py-1 rounded border transition flex items-center gap-1 cursor-pointer ${
                    appliedCoupon === "CINE50"
                      ? "bg-purple-500/20 border-purple-400 text-purple-200"
                      : "bg-white/5 border-white/10 text-text-secondary hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>CINE50</span>
                  <span className="text-[9px] opacity-75">(₹50 OFF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyCoupon("FIRST100")}
                  className={`text-[10px] font-mono px-2.5 py-1 rounded border transition flex items-center gap-1 cursor-pointer ${
                    appliedCoupon === "FIRST100"
                      ? "bg-purple-500/20 border-purple-400 text-purple-200"
                      : "bg-white/5 border-white/10 text-text-secondary hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>FIRST100</span>
                  <span className="text-[9px] opacity-75">(₹100 OFF)</span>
                </button>
              </div>

              {/* Coupon input box */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Enter coupon code (e.g. CINE50)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#0A0A0B] border border-white/10 rounded px-3 py-1.5 text-xs text-text-primary uppercase font-mono placeholder:normal-case placeholder:text-text-secondary/50 focus:outline-none focus:border-purple-400"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-3 py-1.5 rounded text-xs font-semibold bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition cursor-pointer"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="px-4 py-1.5 rounded text-xs font-bold bg-purple-500 hover:bg-purple-400 text-black transition cursor-pointer"
                  >
                    Apply
                  </button>
                )}
              </div>

              {couponMessage && (
                <p className={`text-[11px] font-medium ${couponMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="mb-4 bg-white/[0.01] border border-white/5 p-3.5 rounded-xl space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                Select Payment Channel
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                    paymentMethod === "UPI"
                      ? "bg-gold/15 border-gold text-gold"
                      : "bg-white/[0.02] border-white/10 text-text-secondary hover:text-white"
                  }`}
                >
                  <span className="text-xs font-bold">UPI</span>
                  <span className="text-[9px] text-emerald-400 font-mono">0% Surcharge</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                    paymentMethod === "CARD"
                      ? "bg-gold/15 border-gold text-gold"
                      : "bg-white/[0.02] border-white/10 text-text-secondary hover:text-white"
                  }`}
                >
                  <span className="text-xs font-bold">Card</span>
                  <span className="text-[9px] text-text-secondary font-mono">+2% Gateway</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("NETBANKING")}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                    paymentMethod === "NETBANKING"
                      ? "bg-gold/15 border-gold text-gold"
                      : "bg-white/[0.02] border-white/10 text-text-secondary hover:text-white"
                  }`}
                >
                  <span className="text-xs font-bold">NetBanking</span>
                  <span className="text-[9px] text-emerald-400 font-mono">0% Surcharge</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CINECOINS")}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                    paymentMethod === "CINECOINS"
                      ? "bg-gold/15 border-gold text-gold"
                      : "bg-white/[0.02] border-white/10 text-text-secondary hover:text-white"
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-1">
                    <Coins className="w-3 h-3 text-gold" /> CineCoins
                  </span>
                  <span className="text-[9px] text-gold font-mono">VIP Wallet</span>
                </button>
              </div>
            </div>

            {/* Authoritative Dynamic Pricing Breakdown */}
            <div className="bg-white/[0.02] border border-white/10 p-4 rounded-xl space-y-2 text-xs mb-5">
              <div className="flex justify-between items-center text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Armchair className="w-3.5 h-3.5 text-gold" />
                  Selected Seats ({selectedSeats.length}):
                </span>
                <span className="text-text-primary font-bold font-mono">
                  {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
                </span>
              </div>

              <div className="flex justify-between items-center text-text-secondary">
                <span>Base Tickets Subtotal:</span>
                <span className="font-mono text-text-primary">
                  ₹{rawBaseTicketPrice.toFixed(2)}
                </span>
              </div>

              {/* Dynamic Fee Line Items */}
              {calculatedBreakdown && calculatedBreakdown.fees.map((fee, idx) => (
                <div key={idx} className="flex justify-between items-center text-text-secondary">
                  <span>{fee.name}:</span>
                  <span className="font-mono text-text-primary">+₹{fee.amount.toFixed(2)}</span>
                </div>
              ))}

              {/* Dynamic Taxes */}
              {calculatedBreakdown && calculatedBreakdown.taxes.map((tax, idx) => (
                <div key={idx} className="flex justify-between items-center text-emerald-400/90">
                  <span>{tax.name} ({tax.rate}%):</span>
                  <span className="font-mono">+₹{tax.amount.toFixed(2)}</span>
                </div>
              ))}

              {/* Applied Discounts */}
              {calculatedBreakdown && calculatedBreakdown.totalDiscount > 0 && (
                <div className="flex justify-between items-center text-purple-400 font-bold">
                  <span>Coupon Discount ({appliedCoupon}):</span>
                  <span className="font-mono">-₹{calculatedBreakdown.totalDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* Payment Gateway Fee */}
              {calculatedBreakdown && calculatedBreakdown.gatewayCharges > 0 && (
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Card Gateway Surcharge (2%):</span>
                  <span className="font-mono">+₹{calculatedBreakdown.gatewayCharges.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-white/10 text-sm font-bold text-text-primary">
                <div className="space-y-0.5">
                  <span>Total Payable:</span>
                  <span className="block text-[10px] text-text-secondary font-normal">
                    (Inclusive of all platform fees & statutory taxes)
                  </span>
                </div>
                <span className="text-gold font-extrabold text-lg font-mono">
                  {isCalculating ? "Calculating..." : `₹${finalPayableAmount.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Razorpay Authentic Trust Badge */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/15 mb-5 text-[11px] text-text-secondary">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Encrypted Checkout via <strong>Razorpay</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted">
                <span>{paymentMethod}</span> · <span>Instant Webhook Verified</span>
              </div>
            </div>

            {/* Payment CTA button */}
            <button
              disabled={selectedSeats.length === 0 || !isMovieBookingSystemActive || isProcessingPayment || isCalculating}
              onClick={handleRazorpayPayment}
              className={`w-full py-4 rounded-sm text-xs font-bold tracking-[0.2em] uppercase transition-all duration-200 shadow-xl flex items-center justify-center gap-2.5 border-0 cursor-pointer ${
                selectedSeats.length === 0 || !isMovieBookingSystemActive
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-not-allowed opacity-60 pointer-events-none"
                  : isProcessingPayment || isCalculating
                  ? "bg-gold/50 text-black cursor-wait"
                  : "bg-gold hover:bg-gold-light text-black shadow-gold/15"
              }`}
              id="confirm-booking-btn"
            >
              {isProcessingPayment ? (
                <>
                  <span className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin" />
                  <span>Launching Razorpay Checkout...</span>
                </>
              ) : isCalculating ? (
                <>
                  <span className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin" />
                  <span>Evaluating Dynamic Fees...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 stroke-[2.5]" />
                  {!isMovieBookingSystemActive
                    ? "Booking Turned OFF"
                    : selectedSeats.length === 0
                    ? "Select Seats to Proceed"
                    : `Pay ₹${finalPayableAmount.toFixed(2)} with Razorpay (${paymentMethod})`}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

