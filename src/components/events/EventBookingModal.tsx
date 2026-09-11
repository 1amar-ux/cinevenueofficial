import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Calendar, Clock, MapPin, Ticket, ShieldCheck, Check,
  AlertTriangle, Users, Tag, Coins, CreditCard, Smartphone,
  Building2, ArrowRight, ArrowLeft, ChevronRight, Lock, Sparkles, CheckCircle2
} from 'lucide-react';
import type {
  EventItem,
  EventTicketType,
  EventSeat,
  EventBookingRecord,
  AdditionalAttendee,
} from '../../types/eventBooking';
import type { CineCoinsUserWallet } from '../../types';
import {
  createTemporaryLock,
  releaseTemporaryLock,
  calculateEventFees,
  validateCoupon,
  createEventBooking,
} from '../../services/eventBookingService';
import {
  createEventBookingCashfreeOrder,
  verifyEventBookingCashfreePayment,
  triggerCashfreeCheckout,
} from '../../services/cashfreeService';
import DigitalTicketPassModal from './DigitalTicketPassModal';

interface EventBookingModalProps {
  event: EventItem;
  userEmail?: string | null;
  userWallet?: CineCoinsUserWallet;
  onUpdateWallet?: (updatedWallet: CineCoinsUserWallet) => void;
  onClose: () => void;
  onBookingSuccess?: (booking: EventBookingRecord) => void;
}

export default function EventBookingModal({
  event,
  userEmail,
  userWallet,
  onUpdateWallet,
  onClose,
  onBookingSuccess,
}: EventBookingModalProps) {
  const sessionId = useMemo(() => `sess-${Math.random().toString(36).substring(2, 9)}`, []);

  // Step flow: 1 = Tickets/Seats, 2 = Attendees, 3 = Payment & Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Selected ticket / seats
  const [selectedTicketType, setSelectedTicketType] = useState<EventTicketType>(
    event.ticketTypes[0]
  );
  const [generalQuantity, setGeneralQuantity] = useState<number>(1);
  const [selectedSeatCodes, setSelectedSeatCodes] = useState<string[]>([]);

  // 10-min countdown timer
  const [lockTimeRemaining, setLockTimeRemaining] = useState<number>(600); // 10 minutes in seconds
  const [lockActive, setLockActive] = useState<boolean>(false);
  const [lockError, setLockError] = useState<string | null>(null);

  // Attendee Form
  const [primaryName, setPrimaryName] = useState<string>('');
  const [primaryEmail, setPrimaryEmail] = useState<string>(userEmail || '');
  const [primaryPhone, setPrimaryPhone] = useState<string>('');
  const [additionalAttendees, setAdditionalAttendees] = useState<AdditionalAttendee[]>([]);

  // Coupons & CineCoins
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const [useCineCoins, setUseCineCoins] = useState<boolean>(false);
  const [coinsToRedeem, setCoinsToRedeem] = useState<number>(0);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Confirmed booking state
  const [confirmedBooking, setConfirmedBooking] = useState<EventBookingRecord | null>(null);

  // Calculate ticket count
  const totalTicketCount = event.seatingType === 'AssignedSeating'
    ? selectedSeatCodes.length
    : generalQuantity;

  // Selected unit price
  const unitPrice = useMemo(() => {
    if (event.seatingType === 'AssignedSeating' && selectedSeatCodes.length > 0) {
      // average seat price or from section
      return selectedTicketType.price;
    }
    return selectedTicketType?.price || 0;
  }, [event.seatingType, selectedSeatCodes, selectedTicketType]);

  // Fee Breakdown
  const fees = useMemo(() => {
    return calculateEventFees({
      ticketPrice: unitPrice,
      quantity: totalTicketCount || 1,
      couponCode: appliedCouponCode || undefined,
      cineCoinsToRedeem: useCineCoins ? coinsToRedeem : 0,
      platformFeePercent: 5,
    });
  }, [unitPrice, totalTicketCount, appliedCouponCode, useCineCoins, coinsToRedeem]);

  // Max coins allowed (20% of subtotal, limited by user wallet balance)
  const maxAvailableCoins = useMemo(() => {
    const userBalance = userWallet?.balance || 0;
    const maxSubtotalAllowed = Math.floor(fees.ticketSubtotal * 0.2);
    return Math.min(userBalance, maxSubtotalAllowed);
  }, [userWallet, fees.ticketSubtotal]);

  // Handle temporary seat lock on step progression
  const handleProceedToAttendees = () => {
    if (totalTicketCount === 0) {
      setLockError('Please select at least 1 ticket or seat to continue.');
      return;
    }

    setLockError(null);
    const lockResult = createTemporaryLock({
      eventId: event.id,
      ticketTypeId: selectedTicketType?.id,
      seatCodes: selectedSeatCodes.length > 0 ? selectedSeatCodes : undefined,
      quantity: totalTicketCount,
      sessionId,
      userEmail: primaryEmail || 'guest@cinevenue.com',
    });

    if (!lockResult.success) {
      setLockError(lockResult.error || 'Failed to lock tickets. Please try again.');
      return;
    }

    // Initialize additional attendees list for count > 1
    const extraNeeded = totalTicketCount - 1;
    const initialExtras: AdditionalAttendee[] = [];
    for (let i = 0; i < extraNeeded; i++) {
      initialExtras.push({
        name: '',
        seatCode: selectedSeatCodes[i + 1] || undefined,
        ticketTypeName: selectedTicketType?.name,
      });
    }
    setAdditionalAttendees(initialExtras);

    setLockActive(true);
    setLockTimeRemaining(600);
    setCurrentStep(2);
  };

  // Timer countdown
  useEffect(() => {
    if (!lockActive || lockTimeRemaining <= 0) return;

    const interval = setInterval(() => {
      setLockTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          releaseTemporaryLock(sessionId, event.id);
          setLockActive(false);
          setLockError('Your 10-minute hold expired. Inventory has been released.');
          setCurrentStep(1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockActive, lockTimeRemaining, sessionId, event.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      releaseTemporaryLock(sessionId, event.id);
    };
  }, [sessionId, event.id]);

  // Handle Seat Selection for Assigned Seating
  const handleToggleSeat = (seat: EventSeat) => {
    if (seat.status === 'sold' || seat.status === 'reserved') return;

    setSelectedSeatCodes((prev) => {
      if (prev.includes(seat.seatCode)) {
        return prev.filter((s) => s !== seat.seatCode);
      }
      if (prev.length >= selectedTicketType.maxPerUser) {
        alert(`You can select a maximum of ${selectedTicketType.maxPerUser} seats.`);
        return prev;
      }
      return [...prev, seat.seatCode];
    });
  };

  // Coupon Application
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const validation = validateCoupon(couponInput, fees.ticketSubtotal);
    if (!validation.valid) {
      setCouponMessage({ text: validation.message, isError: true });
      return;
    }

    setAppliedCouponCode(couponInput.trim().toUpperCase());
    setCouponMessage({ text: `Coupon ${couponInput.toUpperCase()} applied!`, isError: false });
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponCode(null);
    setCouponInput('');
    setCouponMessage(null);
  };

  // Final Booking Confirmation with Wallet & Gateway integration
  const finalizeBooking = (paymentRefId?: string) => {
    try {
      const booking = createEventBooking({
        eventId: event.id,
        ticketTypeId: selectedTicketType?.id,
        ticketCount: totalTicketCount,
        seatCodes: selectedSeatCodes.length > 0 ? selectedSeatCodes : undefined,
        primaryAttendee: {
          name: primaryName.trim(),
          email: primaryEmail.trim(),
          phone: primaryPhone.trim(),
        },
        additionalAttendees,
        pricing: fees,
        paymentMethod: `${selectedGateway} (${paymentMethod})` as any,
        sessionId,
      });

      // If CineCoins were redeemed, deduct from user wallet & record ledger
      if (useCineCoins && coinsToRedeem > 0 && userWallet && onUpdateWallet) {
        const updatedWallet: CineCoinsUserWallet = {
          ...userWallet,
          balance: Math.max(userWallet.balance - coinsToRedeem, 0),
          totalRedeemed: (userWallet.totalRedeemed || 0) + coinsToRedeem,
          recentTransactions: [
            {
              id: `TX-${Date.now()}`,
              userId: primaryEmail,
              amount: coinsToRedeem,
              type: 'REDEEM',
              source: 'EVENT_BOOKING',
              title: `Redeemed for ${event.title}`,
              description: `CineCoins discount applied on Event Pass #${booking.id}`,
              balanceAfter: Math.max(userWallet.balance - coinsToRedeem, 0),
              createdAt: new Date().toISOString(),
            },
            ...(userWallet.recentTransactions || []),
          ],
        };
        onUpdateWallet(updatedWallet);
      }

      setConfirmedBooking(booking);
      if (onBookingSuccess) onBookingSuccess(booking);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Failed to process booking. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleConfirmAndPay = async () => {
    if (!primaryName.trim() || !primaryEmail.trim() || !primaryPhone.trim()) {
      alert('Please fill in your primary contact information.');
      setCurrentStep(2);
      return;
    }

    setIsProcessingPayment(true);

    try {
      const orderData = await createEventBookingCashfreeOrder({
        eventId: event.id,
        amount: fees.finalAmount,
        customerName: primaryName.trim(),
        customerEmail: primaryEmail.trim(),
        customerPhone: primaryPhone.trim(),
        ticketCount: totalTicketCount,
      });

      await triggerCashfreeCheckout({
        paymentSessionId: orderData.paymentSessionId,
        orderId: orderData.orderId,
        environment: orderData.environment || 'TEST',
        onSuccess: async () => {
          try {
            await verifyEventBookingCashfreePayment({
              orderId: orderData.orderId,
              bookingId: orderData.bookingId,
            });
            finalizeBooking(`CF-${orderData.orderId}`);
          } catch (vErr: any) {
            console.error('Cashfree event verification error:', vErr);
            alert(vErr.message || 'Payment verification could not be confirmed.');
            setIsProcessingPayment(false);
          }
        },
        onFailure: (err: any) => {
          console.error('Cashfree checkout error:', err);
          alert(err?.message || 'Cashfree payment failed or was cancelled.');
          setIsProcessingPayment(false);
        },
      });
    } catch (err: any) {
      console.error('Cashfree Order Error:', err);
      alert(err.message || 'Failed to initialize Cashfree payment.');
      setIsProcessingPayment(false);
    }
  };

  // Format MM:SS for countdown timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // If already confirmed, render Digital Pass Modal
  if (confirmedBooking) {
    return (
      <DigitalTicketPassModal
        booking={confirmedBooking}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0E0E12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl text-left my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-white/[0.04] to-transparent px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold font-mono">
                {event.category}
              </span>
              <span className="text-white/30">•</span>
              <span className="text-[10px] text-white/60 font-mono">
                {event.seatingType === 'AssignedSeating' ? 'Assigned Seating' : 'General Admission'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
              {event.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Temporary Seat Hold Banner (Active during Step 2 & 3) */}
        {lockActive && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2 flex items-center justify-between text-xs text-amber-300 font-mono">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-gold animate-pulse" />
              <span>Tickets temporarily held for you</span>
            </div>
            <span className="font-bold text-gold text-sm tracking-wider">
              {formatTimer(lockTimeRemaining)}
            </span>
          </div>
        )}

        {/* Step Indicator */}
        <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.01] text-xs font-semibold text-center font-mono">
          <div className={`py-3 flex items-center justify-center gap-2 ${currentStep === 1 ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-white/50'}`}>
            <span>1. Select Tickets</span>
          </div>
          <div className={`py-3 flex items-center justify-center gap-2 ${currentStep === 2 ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-white/50'}`}>
            <span>2. Attendees</span>
          </div>
          <div className={`py-3 flex items-center justify-center gap-2 ${currentStep === 3 ? 'text-gold border-b-2 border-gold bg-gold/5' : 'text-white/50'}`}>
            <span>3. Review & Pay</span>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {lockError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{lockError}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 1: SELECT TICKETS OR ASSIGNED SEATS                   */}
          {/* ========================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Event Quick Info */}
              <div className="flex flex-wrap gap-4 text-xs text-white/60 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gold" />
                  <span>{event.startTime} ({event.duration || 'Live'})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                  <span>{event.venueName}, {event.city}</span>
                </div>
              </div>

              {/* Seating Mode A: General Admission Tiers */}
              {event.seatingType === 'GeneralAdmission' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                    Choose Ticket Tier
                  </span>
                  <div className="space-y-2.5">
                    {event.ticketTypes.map((tier) => {
                      const isSelected = selectedTicketType.id === tier.id;
                      const isSoldOut = tier.availableQuantity <= 0;
                      return (
                        <div
                          key={tier.id}
                          onClick={() => {
                            if (!isSoldOut) setSelectedTicketType(tier);
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            isSoldOut
                              ? 'opacity-50 cursor-not-allowed bg-white/[0.01] border-white/5'
                              : isSelected
                              ? 'bg-gold/10 border-gold shadow-lg shadow-gold/10'
                              : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{tier.name}</span>
                              <span className="text-[9px] font-mono uppercase bg-white/10 px-2 py-0.5 rounded text-white/70">
                                {tier.tier}
                              </span>
                              {isSoldOut && (
                                <span className="text-[9px] font-mono uppercase bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">
                                  Sold Out
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/50">{tier.description}</p>
                            <span className="text-[10px] text-white/40 font-mono">
                              Max {tier.maxPerUser} passes per order • {tier.availableQuantity} available
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg font-bold text-gold font-mono">
                              ₹{tier.price.toLocaleString('en-IN')}
                            </div>
                            <span className="text-[10px] text-white/40">per ticket</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quantity Selector */}
                  <div className="pt-3 flex items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                    <div>
                      <span className="text-xs font-bold text-white block">Number of Tickets</span>
                      <span className="text-[10px] text-white/40">Limit {selectedTicketType.maxPerUser} per booking</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setGeneralQuantity((q) => Math.max(q - 1, 1))}
                        disabled={generalQuantity <= 1}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-base text-gold">
                        {generalQuantity}
                      </span>
                      <button
                        onClick={() =>
                          setGeneralQuantity((q) =>
                            Math.min(q + 1, selectedTicketType.maxPerUser, selectedTicketType.availableQuantity)
                          )
                        }
                        disabled={generalQuantity >= selectedTicketType.maxPerUser}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Seating Mode B: Assigned Seating with Interactive Map */}
              {event.seatingType === 'AssignedSeating' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                      Select Your Seats
                    </span>
                    <span className="text-[11px] font-mono text-gold">
                      Selected: {selectedSeatCodes.length > 0 ? selectedSeatCodes.join(', ') : 'None'}
                    </span>
                  </div>

                  {/* Stage Screen Indicator */}
                  <div className="text-center py-2 space-y-1">
                    <div className="w-3/4 mx-auto h-2 rounded-full bg-gradient-to-r from-gold/20 via-gold to-gold/20 shadow-lg shadow-gold/30" />
                    <span className="text-[9px] font-mono uppercase text-white/40 tracking-[0.2em]">
                      STAGE / PERFORMANCE ARENA
                    </span>
                  </div>

                  {/* Seat Map Grid Sections */}
                  <div className="space-y-6 max-h-72 overflow-y-auto p-3 bg-black/40 border border-white/5 rounded-2xl scrollbar-thin">
                    {event.seatSections?.map((section) => (
                      <div key={section.id} className="space-y-2 text-center">
                        <div className="flex items-center justify-between border-b border-white/5 pb-1 text-[11px]">
                          <span className="font-bold text-white/80">{section.name}</span>
                          <span className="font-mono text-gold font-bold">
                            ₹{section.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                        {section.rows.map((row) => (
                          <div key={row} className="flex items-center justify-center gap-1.5 py-0.5">
                            <span className="w-5 text-[10px] font-mono text-white/40">{row}</span>
                            <div className="flex gap-1.5">
                              {section.seats
                                .filter((s) => s.row === row)
                                .map((seat) => {
                                  const isSelected = selectedSeatCodes.includes(seat.seatCode);
                                  const isSold = seat.status === 'sold';
                                  return (
                                    <button
                                      key={seat.id}
                                      onClick={() => handleToggleSeat(seat)}
                                      disabled={isSold}
                                      title={`Seat ${seat.seatCode} - ₹${seat.price}`}
                                      className={`w-6 h-6 rounded text-[9px] font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                                        isSold
                                          ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                          : isSelected
                                          ? 'bg-gold text-black shadow-md shadow-gold/30 scale-105'
                                          : 'bg-white/10 hover:bg-gold/40 text-white/80'
                                      }`}
                                    >
                                      {seat.seatNumber}
                                    </button>
                                  );
                                })}
                            </div>
                            <span className="w-5 text-[10px] font-mono text-white/40">{row}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Seat Legend */}
                  <div className="flex items-center justify-center gap-5 text-[10px] font-mono text-white/60 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-white/10" /> Available
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-gold" /> Selected
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-white/5 border border-white/10" /> Sold
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: ATTENDEE DETAILS                                   */}
          {/* ========================================================= */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block mb-1">
                  Primary Attendee (Ticket Holder)
                </span>
                <p className="text-[11px] text-white/50 mb-3">
                  This person will receive the official digital pass and booking confirmation SMS/email.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-white/50 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={primaryName}
                      onChange={(e) => setPrimaryName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-white/50 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={primaryEmail}
                      onChange={(e) => setPrimaryEmail(e.target.value)}
                      placeholder="rahul@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-white/50 block mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={primaryPhone}
                      onChange={(e) => setPrimaryPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Additional Attendees for Group Passes */}
              {additionalAttendees.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Additional Guest Names
                    </span>
                    <span className="text-[10px] font-mono text-white/40">
                      Required for security badge issuance
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {additionalAttendees.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-center gap-2 bg-white/[0.02] border border-white/5 p-2.5 rounded-xl"
                      >
                        <span className="text-[10px] font-mono text-gold shrink-0 w-20">
                          Guest #{idx + 2} {att.seatCode ? `(${att.seatCode})` : ''}
                        </span>
                        <input
                          type="text"
                          value={att.name}
                          onChange={(e) => {
                            const updated = [...additionalAttendees];
                            updated[idx].name = e.target.value;
                            setAdditionalAttendees(updated);
                          }}
                          placeholder={`Full Name of Guest #${idx + 2}`}
                          className="flex-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: OFFERS, CINECOINS & PAYMENT                        */}
          {/* ========================================================= */}
          {currentStep === 3 && (
            <div className="space-y-5">
              {/* Offers & Coupons Box */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-gold" /> Coupons & Offers
                </span>
                {appliedCouponCode ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                    <div>
                      <span className="font-bold font-mono uppercase">{appliedCouponCode}</span> applied! Saved ₹{fees.discountAmount}.
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs text-rose-400 hover:underline cursor-pointer font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter promo code (e.g. CINEEVENT20)"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono placeholder:normal-case placeholder-white/30 focus:outline-none focus:border-gold"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gold/20 hover:bg-gold text-gold hover:text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-gold/40 cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponMessage && (
                  <p
                    className={`text-[11px] ${
                      couponMessage.isError ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* CineCoins Loyalty Redemption */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">Redeem CineCoins</span>
                      <span className="text-[10px] text-white/40">
                        Available Balance: {userWallet?.balance || 0} Coins (1 Coin = ₹1)
                      </span>
                    </div>
                  </div>
                  {maxAvailableCoins > 0 && (
                    <button
                      onClick={() => {
                        if (!useCineCoins) {
                          setCoinsToRedeem(maxAvailableCoins);
                          setUseCineCoins(true);
                        } else {
                          setUseCineCoins(false);
                          setCoinsToRedeem(0);
                        }
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        useCineCoins
                          ? 'bg-amber-400 text-black border-amber-400'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 border-white/10'
                      }`}
                    >
                      {useCineCoins ? 'Redeeming' : 'Redeem Max'}
                    </button>
                  )}
                </div>

                {useCineCoins && (
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-white/60">Coins Redeemed:</span>
                      <span className="text-amber-400 font-bold">{coinsToRedeem} Coins (-₹{coinsToRedeem})</span>
                    </div>
                    <p className="text-[10px] text-white/40">
                      Maximum allowable CineCoins deduction is 20% of the ticket subtotal.
                    </p>
                  </div>
                )}
              </div>

              {/* Transparent Price Breakdown */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Ticket Price ({totalTicketCount} × ₹{unitPrice.toLocaleString('en-IN')})</span>
                  <span>₹{fees.ticketSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>CineVenue Platform Booking Fee (5%)</span>
                  <span>₹{fees.platformBookingFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Applicable Taxes (18% GST)</span>
                  <span>₹{fees.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                {fees.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{fees.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {fees.cineCoinsDiscount > 0 && (
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>CineCoins Discount</span>
                    <span>-₹{fees.cineCoinsDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-white/10 flex justify-between items-center text-sm font-bold text-white">
                  <span>Final Amount Payable</span>
                  <span className="text-lg text-gold font-black">
                    ₹{fees.finalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Gateway Header */}
              <div className="bg-gold/10 border border-gold/30 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center text-gold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      Cashfree Payments <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold text-black font-extrabold uppercase">Official Gateway</span>
                    </span>
                    <span className="text-[10px] text-white/60 block">Instant Zero-Surcharge Checkout · UPI, Cards, NetBanking</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <Check className="w-3.5 h-3.5" /> Secure SSL
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Select Payment Channel
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI / GPay', icon: Smartphone },
                    { id: 'Card', label: 'Credit/Debit', icon: CreditCard },
                    { id: 'NetBanking', label: 'Net Banking', icon: Building2 },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        paymentMethod === method.id
                          ? 'bg-gold/15 border-gold text-gold font-bold'
                          : 'bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <method.icon className="w-4 h-4" />
                      <span className="text-xs">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Actions */}
        <div className="bg-white/[0.02] border-t border-white/10 p-4 sm:p-6 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] text-white/40 uppercase font-mono block">Order Total</span>
            <span className="text-lg font-black text-gold font-mono">
              ₹{fees.finalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep((s) => (s - 1) as any)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}

            {currentStep === 1 && (
              <button
                onClick={handleProceedToAttendees}
                className="px-6 py-2.5 rounded-xl bg-gold hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-gold/20"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 2 && (
              <button
                onClick={() => {
                  if (!primaryName.trim() || !primaryEmail.trim() || !primaryPhone.trim()) {
                    alert('Please enter your primary attendee details.');
                    return;
                  }
                  setCurrentStep(3);
                }}
                className="px-6 py-2.5 rounded-xl bg-gold hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-gold/20"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                onClick={handleConfirmAndPay}
                disabled={isProcessingPayment}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-gold via-amber-400 to-gold hover:from-amber-400 hover:to-gold text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-xl shadow-gold/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Authorizing Payment...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pay ₹{fees.finalAmount.toLocaleString('en-IN')} & Book</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
