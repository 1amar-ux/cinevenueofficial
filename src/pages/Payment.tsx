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

export default function Payment() {
  const navigate = useNavigate();
  const { booking, setBooking } = useContext(BookingContext);
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

    // Check if Razorpay script is loaded
    const Razorpay = (window as any).Razorpay;
    if (!Razorpay) {
      setPaymentError("Razorpay SDK failed to load. Please refresh the page or check your internet connection.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create Payment Order on Backend
      const orderRes = await api.post("/create-order", {
        amount: total * 100, // in paise
        currency: "INR"
      });

      if (!orderRes.data || !orderRes.data.success || !orderRes.data.order_id) {
        throw new Error(orderRes.data?.message || "Failed to create payment order on the server.");
      }

      const { order_id } = orderRes.data;

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID || "rzp_test_TB7njDD8MonAMK",
        amount: total * 100, // in paise
        currency: "INR",
        name: "CineVenue Checkout",
        description: `Movie Ticket: ${movieTitle} (Seats: ${seats})`,
        order_id: order_id,
        handler: async function (response: any) {
          try {
            setLoading(true);
            setPaymentSuccess("Payment authorized! Verifying secure transaction signature...");

            // 3. Send payment signatures to backend for verification
            const verifyRes = await api.post("/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data && verifyRes.data.success) {
              setPaymentSuccess("Payment verified successfully! Generating your ticket...");
              setTimeout(() => {
                completeBooking();
              }, 1500);
            } else {
              throw new Error(verifyRes.data?.message || "Signature verification failed on the server.");
            }
          } catch (verifyErr: any) {
            console.error("Signature verification error:", verifyErr);
            setPaymentError(
              verifyErr.response?.data?.message || 
              verifyErr.message || 
              "Signature verification failed. Secure transaction compromised."
            );
            setLoading(false);
          }
        },
        prefill: {
          name: "Amarnath",
          email: "amarnath@example.com",
          contact: "9876543210"
        },
        theme: {
          color: "#F84464"
        },
        modal: {
          ondismiss: function () {
            setPaymentError("Payment session closed. You can try paying again when ready.");
            setLoading(false);
          }
        }
      };

      const rzp = new Razorpay(options);

      // Handle failed payments explicitly
      rzp.on("payment.failed", function (response: any) {
        console.error("Razorpay Payment Failed:", response.error);
        setPaymentError(`Payment failed: ${response.error.description || "Unknown failure reason"}`);
        setLoading(false);
      });

      rzp.open();
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

  const completeBooking = async () => {
    // Save to local storage bookings list
    const newBooking = {
      movie: movieTitle,
      theatre: theatreName,
      seats: seats,
      amount: total,
      date: "Today",
      bookingId: "BMS" + Math.floor(10000000 + Math.random() * 90000000)
    };

    // Store in localStorage for the booking history page
    const existingHistory = JSON.parse(localStorage.getItem("localBookings") || "[]");
    localStorage.setItem("localBookings", JSON.stringify([newBooking, ...existingHistory]));

    // Also update BookingContext with booking details
    setBooking((prev) => ({
      ...prev,
      show: newBooking.bookingId // Save booking ID under show
    }));

    // Post to backend database if logged in
    try {
      await api.post("/bookings", {
        movieName: movieTitle,
        theatreName: theatreName,
        seats: booking.seats,
        totalAmount: total
      });
    } catch (err) {
      console.log("Backend sync skipped or failed:", err);
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
            Payment Options
          </Typography>
          <Typography sx={{ textAlign: "center", color: "text.secondary", mb: 2 }}>
            Secure checkout powered by Razorpay
          </Typography>
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
