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

    try {
      // 1. Create Cashfree Order on Backend
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

      // 2. Open Cashfree Drop Checkout Modal
      await triggerCashfreeCheckout({
        paymentSessionId: orderData.paymentSessionId,
        orderId: orderData.orderId,
        environment: orderData.environment || "TEST",
        onSuccess: async () => {
          try {
            setLoading(true);
            setPaymentSuccess("Payment authorized! Verifying secure transaction signature...");

            // 3. Verify payment on server
            await verifyMovieBookingCashfreePayment({
              orderId: orderData.orderId,
              bookingId: orderData.bookingId
            });

            setPaymentSuccess("Payment verified successfully! Generating your ticket...");
            setTimeout(() => {
              completeBooking();
            }, 1500);
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
            Secure checkout powered by Cashfree Payments
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
