import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import EventsNavbar from "../../components/events/EventsNavbar";
import { CheckCircle2, AlertCircle, Calendar, MapPin, Ticket } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import {
  createEventBookingCashfreeOrder,
  triggerCashfreeCheckout,
  verifyEventBookingCashfreePayment
} from "../../services/cashfreeService";

import LiveEventPassCard from "../../components/events/LiveEventPassCard";
import { sendEventPassToEmail } from "../../utils/eventPassPdf";

export default function EventCheckout() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const passType = searchParams.get("type");
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const userEmail = user?.email || localStorage.getItem("cine_user_email") || "";
  
  const [loading, setLoading] = useState(false);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeMobile, setAttendeeMobile] = useState("");
  const [eventData, setEventData] = useState<any>(null);
  
  const [calculatedBreakdown, setCalculatedBreakdown] = useState<any>(null);
  const [paymentError, setPaymentError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  useEffect(() => {
    if (!eventId) return;
    import("../../services/eventBookingService").then(({ getEvents, getEventById }) => {
      const found = getEventById(eventId) || (getEvents() || []).find((e: any) => e.id === eventId || e._id === eventId);
      if (found) {
        setEventData(found);
        return;
      }
      try {
        const cineRaw = localStorage.getItem("cine_events");
        if (cineRaw) {
          const list = JSON.parse(cineRaw);
          const c = list.find((item: any) => item.id === eventId || item._id === eventId);
          if (c) {
            setEventData(c);
            return;
          }
        }
      } catch {}
    });
  }, [eventId]);

  useEffect(() => {
    if (eventData) {
      const matchedCat = (eventData.categories || []).find((c: any) => c.name?.toLowerCase() === passType?.toLowerCase())
        || (eventData.ticketTypes || []).find((t: any) => t.name?.toLowerCase() === passType?.toLowerCase());
      if (matchedCat) {
        setTicketPrice(Number(matchedCat.price ?? 0));
        return;
      }
      if (eventData.eventType === 'FREE' || eventData.isPaid === false) {
        setTicketPrice(0);
        return;
      }
    }
    // Fallback if event data still loading or custom pass
    if (passType?.includes("VVIP")) setTicketPrice(10000);
    else if (passType?.includes("VIP")) setTicketPrice(5000);
    else if (passType?.toLowerCase().includes("free")) setTicketPrice(0);
    else setTicketPrice(500);
  }, [passType, eventData]);

  const calculatePrice = async () => {
    if (ticketPrice === 0) {
      setCalculatedBreakdown({
        baseAmount: 0,
        convenienceFee: 0,
        taxAmount: 0,
        totalAmount: 0
      });
      return;
    }

    const base = ticketPrice * quantity;
    const fee = Math.round(base * 0.05);
    const tax = Math.round((base + fee) * 0.18);
    const fallbackBreakdown = {
      baseAmount: base,
      convenienceFee: fee,
      taxAmount: tax,
      totalAmount: base + fee + tax
    };

    try {
      const res = await fetch("/api/booking/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketPrice: ticketPrice,
          quantity: quantity,
          isEvent: true
        })
      });
      const data = await res.json();
      if (data.success && data.breakdown) {
        setCalculatedBreakdown(data.breakdown);
      } else {
        setCalculatedBreakdown(fallbackBreakdown);
      }
    } catch (err) {
      setCalculatedBreakdown(fallbackBreakdown);
    }
  };

  useEffect(() => {
    calculatePrice();
  }, [ticketPrice, quantity]);

  const handlePayment = async () => {
    if (!attendeeName || !attendeeMobile) {
      setPaymentError("Please fill in attendee details.");
      return;
    }
    
    setLoading(true);
    setPaymentError("");

    try {
      if (calculatedBreakdown && calculatedBreakdown.totalAmount > 0) {
        const orderData = await createEventBookingCashfreeOrder({
          eventId: eventId || "evt_general",
          amount: calculatedBreakdown.totalAmount,
          customerName: attendeeName.trim(),
          customerPhone: attendeeMobile.trim(),
          customerEmail: userEmail || "guest@cinevenue.in",
          ticketCount: quantity
        });

        await triggerCashfreeCheckout({
          paymentSessionId: orderData.paymentSessionId,
          orderId: orderData.orderId,
          environment: orderData.environment || "TEST",
          onSuccess: async () => {
            try {
              await verifyEventBookingCashfreePayment({
                orderId: orderData.orderId,
                bookingId: orderData.bookingId
              });
              generatePass();
            } catch (vErr: any) {
              setPaymentError(vErr.message || "Payment verification failed");
              setLoading(false);
            }
          },
          onFailure: (err: any) => {
            setPaymentError(err?.message || "Cashfree payment failed or was cancelled");
            setLoading(false);
          }
        });
      } else {
        // Free ticket
        generatePass();
      }
    } catch (err: any) {
      setPaymentError(err.message || "Payment failed");
      setLoading(false);
    }
  };

  const generatePass = () => {
    const rawPassId = "CV-EVT-" + Math.floor(100000 + Math.random() * 900000).toString();
    setTimeout(() => {
      const bookingObj = {
        id: rawPassId,
        passCode: rawPassId,
        orderId: `CV-ORDER-2026-${rawPassId.slice(-5)}`,
        eventId: eventId || "EVT-100",
        eventTitle: eventData?.title || "Special Event",
        eventDate: eventData?.date || "2026-10-18",
        eventTime: eventData?.startTime || eventData?.time || "06:00 PM",
        venueName: eventData?.venueName || (typeof eventData?.venue === 'string' ? eventData?.venue : eventData?.venue?.name) || "Grand Convention Hall",
        city: eventData?.city || eventData?.venue?.city || "Hyderabad",
        bannerUrl: eventData?.bannerUrl || eventData?.posterUrl || eventData?.image || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
        ticketTypeName: passType || "General Admission",
        ticketCount: quantity,
        primaryAttendee: {
          name: attendeeName,
          email: userEmail || "guest@cinevenue.in",
          phone: attendeeMobile,
        },
        pricing: {
          finalAmount: calculatedBreakdown?.totalAmount || 0,
        },
        totalPrice: calculatedBreakdown?.totalAmount || 0,
        qrCodePayload: rawPassId,
      };

      setConfirmedBooking(bookingObj);
      sendEventPassToEmail(bookingObj);
      setLoading(false);
    }, 600);
  };

  if (confirmedBooking) {
    return (
      <div className="min-h-screen bg-[#07070A] flex flex-col items-center justify-center p-4 py-12 text-left">
        <div className="w-full max-w-sm relative">
          <div className="text-center mb-4">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              Registration Confirmed & Verified
            </span>
            <h2 className="text-xl font-bold text-white mt-2 font-display">Your Official Event Pass</h2>
          </div>

          <LiveEventPassCard pass={confirmedBooking} showActions={true} />

          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/events")}
              className="text-text-secondary hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              ← Back to All Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090A]">
      <EventsNavbar />
      <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8 font-display">Secure Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111113] p-6 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold text-white mb-4">Attendee Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                  <input type="text" value={attendeeName} onChange={(e) => setAttendeeName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold/50" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Mobile Number</label>
                  <input type="tel" value={attendeeMobile} onChange={(e) => setAttendeeMobile(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold/50" placeholder="+91 9876543210" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                  <input type="email" value={userEmail || ""} disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-secondary outline-none opacity-70" />
                </div>
              </div>
            </div>
            
            <div className="bg-[#111113] p-6 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold text-white mb-4">Pass Configuration</h3>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <h4 className="font-semibold text-white">{passType}</h4>
                  <p className="text-sm text-text-secondary">₹{ticketPrice} per pass</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">-</button>
                  <span className="text-lg font-bold text-white w-4 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">+</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-[#111113] p-6 rounded-2xl border border-white/5 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-white font-semibold">{eventData?.title || "Special Event"}</h4>
                    <p className="text-sm text-text-secondary">{passType} x {quantity}</p>
                  </div>
                  <span className="text-white font-semibold">₹{ticketPrice * quantity}</span>
                </div>
              </div>

              {calculatedBreakdown ? (
                <div className="space-y-3 pt-4 border-t border-white/10 mb-6">
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>Subtotal</span>
                    <span>₹{calculatedBreakdown.baseAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>Convenience Fee (Platform)</span>
                    <span>₹{calculatedBreakdown.convenienceFee}</span>
                  </div>
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>GST (Taxes)</span>
                    <span>₹{calculatedBreakdown.taxAmount}</span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="font-bold text-white">Total Amount</span>
                    <span className="font-bold text-gold text-xl">₹{calculatedBreakdown.totalAmount}</span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-text-secondary text-sm">Calculating total...</div>
              )}

              {paymentError && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <p className="text-sm text-red-400">{paymentError}</p>
                </div>
              )}

              <button 
                onClick={handlePayment} 
                disabled={loading || !calculatedBreakdown}
                className="w-full bg-gold text-black font-bold py-4 rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : (calculatedBreakdown?.totalAmount === 0 ? "Claim Free Pass" : "Proceed to Payment")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
