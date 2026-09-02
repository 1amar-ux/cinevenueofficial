import React, { useContext } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Divider
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { BookingContext } from "../context/BookingContext";

export default function Ticket() {
  const navigate = useNavigate();
  const { booking } = useContext(BookingContext);

  const movieTitle = booking.movie ? booking.movie.title : "Pushpa 2";
  const theatreName = booking.theatre ? booking.theatre : "PVR Cinemas";
  const seats = booking.seats.length > 0 ? booking.seats.join(" ") : "A1 A2";
  const bookingId = booking.show && String(booking.show).startsWith("BMS") ? booking.show : "BMS12345678";

  return (
    <Container sx={{ mt: 15, maxWidth: "500px !important", mb: 4 }}>
      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
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
          Back to Home
        </Button>
      </Box>
      <Card sx={{ borderRadius: 3, border: "2px dashed #e0e0e0", boxShadow: 4, overflow: "hidden" }}>
        <Box sx={{ backgroundColor: "#F84464", color: "white", py: 2, textAlign: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            E-Ticket Confirmed
          </Typography>
        </Box>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
            {movieTitle}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, my: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Theatre:</Typography>
              <Typography sx={{ fontWeight: "medium" }}>{theatreName}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Date & Time:</Typography>
              <Typography sx={{ fontWeight: "medium" }}>Today • {booking.show && !String(booking.show).startsWith("BMS") ? booking.show : "7:00 PM"}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Seats:</Typography>
              <Typography sx={{ fontWeight: "medium" }} color="#2e7d32">{seats}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Booking ID:</Typography>
              <Typography sx={{ fontWeight: "bold" }} color="primary">{bookingId}</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Scan this QR code at the cinema entrance
            </Typography>
            <Box
              sx={{
                p: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                backgroundColor: "white"
              }}
            >
              <QRCode value={bookingId} size={150} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
