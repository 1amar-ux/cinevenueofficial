import React, { useContext } from "react";
import { Card, CardContent, Typography, Box, Divider } from "@mui/material";
import { BookingContext } from "../context/BookingContext";

export default function BookingSummary() {
  const { booking } = useContext(BookingContext);

  const movieTitle = booking.movie ? booking.movie.title : "Pushpa 2";
  const theatreName = booking.theatre ? booking.theatre : "PVR Cinemas";
  const seats = booking.seats.length > 0 ? booking.seats.join(", ") : "A1, A2";
  const total = booking.total > 0 ? booking.total : 500;

  return (
    <Card sx={{ mt: 3, borderRadius: 2, boxShadow: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
          Booking Summary
        </Typography>
        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
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
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>Total Amount:</Typography>
            <Typography variant="h6" sx={{ fontWeight: "bold" }} color="#F84464">₹{total}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
