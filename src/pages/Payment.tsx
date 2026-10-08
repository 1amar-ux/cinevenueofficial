import React, { useContext, useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Divider,
  Alert,
  CircularProgress
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { BookingContext } from "../context/BookingContext";
import api from "../services/api";

import { triggerCashfreeCheckout, createMovieBookingCashfreeOrder, verifyMovieBookingCashfreePayment } from "../services/cashfreeService";
import { triggerRazorpayCheckout, createRazorpayOrder, verifyRazorpayPayment } from "../services/razorpayService";
import { dispatchTicketEmail, dispatchTicketSms, generateSecureTicketToken } from "../utils/ticketDeliveryService";

export default function Payment() {
  const navigate = useNavigate();
  const { booking, setBooking } = useContext(BookingContext);
  const [selectedGateway, setSelectedGateway] = useState<"razorpay" | "cashfree">("razorpay");
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  const movieTitle = booking.movie ? booking.movie.title : "Pushpa 2";
  const theatreName = booking.theatre ? booking.theatre : "PVR Cinemas";
  const seats = booking.seats.length > 0 ? booking.seats.join(" ") : "A1 A2";
  const total = booking.total > 0 ? booking.total : 500;

  const handlePayment = async () => {
    setPaymentError(null);
    setPaymentSuccess(null);
    setLoading(true);

    try {
      if (selectedGateway === "razorpay") {
        // ==========================================
        // 1. RAZORPAY TEST MODE CHECKOUT
        // ==========================================
        const amountInPaise = Math.round(total * 100);
        const orderData = await createRazorpayOrder({
          amount: amountInPaise,
          customerName: "CineVenue Guest",
          customerEmail: "guest@cinevenue.in",
          customerPhone: "9876543210",
          tickets: booking.seats.map((s: string) => ({ seatId: s, price: total / (booking.seats.length || 1) }))
        });

        await triggerRazorpayCheckout({
          orderData,
          preferredMethod: "upi",
          prefill: {
            name: "CineVenue Guest",
            email: "guest@cinevenue.in",
            contact: "9876543210"
          },
          onSuccess: async (paymentResult) => {
            try {
              setLoading(true);
              setPaymentSuccess("Payment authorized! Verifying Razorpay test signature...");

              await verifyRazorpayPayment({
                razorpay_order_id: paymentResult.razorpay_order_id,
                razorpay_payment_id: paymentResult.razorpay_payment_id,
                razorpay_signature: paymentResult.razorpay_signature,
                bookingId: orderData.bookingId
              });

              setPaymentSuccess("Payment verified successfully via Razorpay! Generating ticket...");
              setTimeout(() => {
                completeBooking("Razorpay (Test Mode)");
              }, 1200);
            } catch (vErr: any) {
              console.error("Razorpay verification error:", vErr);
              setPaymentError(vErr.message || "Razorpay signature verification failed.");
              setLoading(false);
            }
          },
          onFailure: (err: any) => {
            console.error("Razorpay checkout failed:", err);
            setPaymentError(err?.message || "Razorpay payment cancelled or declined.");
            setLoading(false);
          },
          onDismiss: () => {
            setLoading(false);
          }
        });
        return;
      }

      // ==========================================
      // 2. CASHFREE GATEWAY FALLBACK
      // ==========================================
      const orderData = await createMovieBookingCashfreeOrder({
        amount: total,
        customerName: "CineVenue Guest",
        customerEmail: "guest@cinevenue.in",
        customerPhone: "9876543210",
        tickets: booking.seats.map((s: string) => ({ seatId: s, price: total / (booking.seats.length || 1) }))
      });

      if (!orderData || !orderData.paymentSessionId) {
        throw new Error(orderData?.message || "Failed to initialize Cashfree payment order on the server.");
      }

      await triggerCashfreeCheckout({
        paymentSessionId: orderData.paymentSessionId,
        orderId: orderData.orderId,
        environment: orderData.environment || "TEST",
        onSuccess: async () => {
          try {
            setLoading(true);
            setPaymentSuccess("Payment authorized! Verifying secure transaction signature...");

            await verifyMovieBookingCashfreePayment({
              orderId: orderData.orderId,
              bookingId: orderData.bookingId
            });

            setPaymentSuccess("Payment verified successfully! Generating your ticket...");
            setTimeout(() => {
              completeBooking("Cashfree");
            }, 1200);
          } catch (verifyErr: any) {
            console.error("Cashfree verification error:", verifyErr);
            setPaymentError(verifyErr.message || "Signature verification failed.");
            setLoading(false);
          }
        },
        onFailure: (err: any) => {
          console.error("Cashfree payment failed:", err);
          setPaymentError(err?.message || "Cashfree payment was cancelled or declined.");
          setLoading(false);
        }
      });
    } catch (err: any) {
      console.error("Payment setup error:", err);
      setPaymentError(
        err.response?.data?.message || 
        err.message || 
        "An unexpected error occurred during checkout setup."
      );
      setLoading(false);
    }
  };

  const completeBooking = async (methodUsed: string = "Razorpay (Test Mode)") => {
    const bookingId = "BMS" + Math.floor(10000000 + Math.random() * 90000000);
    const qrToken = generateSecureTicketToken(bookingId);

    // Save to local storage bookings list
    const newBooking = {
      movie: movieTitle,
      theatre: theatreName,
      seats: seats,
      amount: total,
      date: "Today",
      bookingId: bookingId,
      qrToken: qrToken,
      status: "Confirmed"
    };

    // Store in localStorage for the booking history page
    const existingHistory = JSON.parse(localStorage.getItem("localBookings") || "[]");
    localStorage.setItem("localBookings", JSON.stringify([newBooking, ...existingHistory]));

    // Also update BookingContext with booking details
    setBooking((prev) => ({
      ...prev,
      show: newBooking.bookingId
    }));

    // Multi-Channel Automated Ticket Delivery Dispatch
    const customerEmail = (booking as any).customerEmail || "guest@cinevenue.in";
    const customerPhone = (booking as any).customerPhone || "9876543210";

    dispatchTicketEmail({
      type: "MOVIE",
      bookingId: bookingId,
      ticketCode: bookingId,
      qrToken: qrToken,
      customerName: "Valued Patron",
      customerEmail: customerEmail,
      customerMobile: customerPhone,
      title: movieTitle,
      venue: theatreName,
      screen: "Cinema Hall 1",
      date: "Today",
      time: "7:00 PM",
      seats: booking.seats.length > 0 ? booking.seats : ["A1", "A2"],
      categoryName: "VIP Tier",
      quantity: booking.seats.length || 2,
      totalPaid: total,
      paymentMethod: "Cashfree UPI / Cards",
      posterUrl: booking.movie?.poster
    }).catch(err => console.warn("Email delivery note:", err));

    if (customerPhone) {
      dispatchTicketSms({
        type: "MOVIE",
        bookingId: bookingId,
        ticketCode: bookingId,
        qrToken: qrToken,
        customerName: "Valued Patron",
        customerEmail: customerEmail,
        customerMobile: customerPhone,
        title: movieTitle,
        venue: theatreName,
        date: "Today",
        time: "7:00 PM",
        seats: booking.seats.length > 0 ? booking.seats : ["A1", "A2"],
        quantity: booking.seats.length || 2,
        totalPaid: total
      }).catch(err => console.warn("SMS delivery note:", err));
    }

    // Post to backend database
    try {
      await api.post("/bookings", {
        movieName: movieTitle,
        theatreName: theatreName,
        seats: booking.seats,
        totalAmount: total,
        bookingNumber: bookingId,
        qrToken: qrToken
      });
    } catch (err) {
      console.log("Backend sync note:", err);
    }

    navigate("/ticket");
  };

  return (
    <Container sx={{ mt: 15, maxWidth: "500px !important" }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-start" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          disabled={loading}
          sx={{
            color: "#F84464",
            borderColor: "#F84464",
            "&:hover": {
              borderColor: "#df3553",
              backgroundColor: "rgba(248, 68, 100, 0.08)",
            },
          }}
          variant="outlined"
        >
          Back
        </Button>
      </Box>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom align="center">
            Payment Gateway
          </Typography>
          <Typography sx={{ textAlign: "center", color: "text.secondary", mb: 2 }}>
            Instant digital ticket checkout with verified encryption
          </Typography>

          {/* Gateway Selector Tabs */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, my: 2 }}>
            <Box
              onClick={() => setSelectedGateway("razorpay")}
              sx={{
                p: 2,
                borderRadius: 2,
                cursor: "pointer",
                border: selectedGateway === "razorpay" ? "2px solid #D4AF37" : "1px solid #e0e0e0",
                backgroundColor: selectedGateway === "razorpay" ? "rgba(212, 175, 55, 0.08)" : "transparent",
                textAlign: "center",
                transition: "all 0.2s"
              }}
            >
              <Typography sx={{ fontWeight: "bold", fontSize: "14px", color: selectedGateway === "razorpay" ? "#D4AF37" : "text.primary" }}>
                ⚡ Razorpay
              </Typography>
              <Typography sx={{ fontSize: "10px", color: "#10B981", fontWeight: "bold", mt: 0.5 }}>
                ● TEST MODE ACTIVE
              </Typography>
            </Box>

            <Box
              onClick={() => setSelectedGateway("cashfree")}
              sx={{
                p: 2,
                borderRadius: 2,
                cursor: "pointer",
                border: selectedGateway === "cashfree" ? "2px solid #F84464" : "1px solid #e0e0e0",
                backgroundColor: selectedGateway === "cashfree" ? "rgba(248, 68, 100, 0.08)" : "transparent",
                textAlign: "center",
                transition: "all 0.2s"
              }}
            >
              <Typography sx={{ fontWeight: "bold", fontSize: "14px", color: selectedGateway === "cashfree" ? "#F84464" : "text.primary" }}>
                🛡️ Cashfree
              </Typography>
              <Typography sx={{ fontSize: "10px", color: "text.secondary", mt: 0.5 }}>
                Sandbox Gateway
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />

          {/* Real-time Alerts */}
          {paymentError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {paymentError}
            </Alert>
          )}

          {paymentSuccess && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              {paymentSuccess}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, my: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Movie:</Typography>
              <Typography sx={{ fontWeight: "medium" }}>{movieTitle}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Theatre:</Typography>
              <Typography sx={{ fontWeight: "medium" }}>{theatreName}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Seats:</Typography>
              <Typography sx={{ fontWeight: "medium" }}>{seats}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>Total Amount:</Typography>
              <Typography variant="h5" sx={{ fontWeight: "bold" }} color="#F84464">₹{total}</Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handlePayment}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ 
              mt: 2, 
              py: 1.5, 
              backgroundColor: "#F84464", 
              "&:hover": { backgroundColor: "#df3553" } 
            }}
          >
            {loading ? "Processing..." : "Pay Now"}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
