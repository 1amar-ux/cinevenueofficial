import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import EventsNavbar from "../../components/events/EventsNavbar";
import { CheckCircle2, AlertCircle, Calendar, MapPin, Ticket } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";

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
  
  const [calculatedBreakdown, setCalculatedBreakdown] = useState<any>(null);
  const [paymentError, setPaymentError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  useEffect(() => {
    // Set mock price based on type
    if (passType?.includes("VVIP")) setTicketPrice(10000);
    else if (passType?.includes("VIP")) setTicketPrice(5000);
    else setTicketPrice(500);
  }, [passType]);

  useEffect(() => {
    if (ticketPrice > 0) {
      calculatePrice();
    }
  }, [ticketPrice, quantity]);

  const calculatePrice = async () => {
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
      if (data.success) {
        setCalculatedBreakdown(data.breakdown);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayment = async () => {
    if (!attendeeName || !attendeeMobile) {
      setPaymentError("Please fill in attendee details.");
      return;
    }
    
    setLoading(true);
    setPaymentError("");

    try {
      if (calculatedBreakdown && calculatedBreakdown.totalAmount > 0) {
        // Payment flow
        const orderRes = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: calculatedBreakdown.totalAmount * 100 })
        });
        const orderData = await orderRes.json();
        
        if (!orderData.success) {
          throw new Error("Failed to create payment order");
        }

        // Simulate Razorpay verification via webhook
        const verifyRes = await fetch("/api/payments/webhook/razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: "evt_" + Date.now(),
            event: "payment.captured",
            orderId: orderData.order_id,
            payload: {
               payment: {
                 entity: {
                   order_id: orderData.order_id,
                   id: "pay_" + Date.now()
                 }
               }
            }
          })
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          generatePass();
        } else {
          throw new Error("Payment verification failed");
        }
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
    setTimeout(() => {
      setConfirmedBooking({
        passId: "CV-EVT-" + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
        name: attendeeName,
        type: passType,
        eventName: "Pushpa 2 Pre-Release Event"
      });
      setLoading(false);
    }, 1000);
  };

  if (confirmedBooking) {
    return (
      <div className="min-h-screen bg-[#09090A] flex flex-col items-center justify-center p-4">
        <div className="bg-[#111113] p-8 rounded-2xl border border-white/10 max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Registration Confirmed!</h2>
            <p className="text-text-secondary">Your digital pass has been generated successfully.</p>
          </div>
          
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left">
            <p className="text-sm text-text-secondary mb-1">Pass ID</p>
            <p className="font-mono text-gold font-bold text-lg mb-4">{confirmedBooking.passId}</p>
            
            <p className="text-sm text-text-secondary mb-1">Attendee</p>
            <p className="text-white font-semibold mb-4">{confirmedBooking.name}</p>
            
            <p className="text-sm text-text-secondary mb-1">Pass Type</p>
            <p className="text-white font-semibold">{confirmedBooking.type}</p>
          </div>
          
          <button onClick={() => navigate(`/events/pass/${confirmedBooking.passId}`)} className="w-full bg-gold text-black font-bold py-3 rounded-full hover:bg-gold/90 transition-colors">
            View Digital Pass
          </button>
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
                    <h4 className="text-white font-semibold">Pushpa 2 Pre-Release</h4>
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
