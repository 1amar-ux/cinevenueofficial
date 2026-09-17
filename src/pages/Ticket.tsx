import React, { useContext } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Divider,
  Stack
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { BookingContext } from "../context/BookingContext";
import { generateAndDownloadTicketPdf, getTicketVerificationUrl } from "../utils/ticketDeliveryService";

export default function Ticket() {
  const navigate = useNavigate();
  const { booking } = useContext(BookingContext);

  const movieTitle = booking.movie ? booking.movie.title : "Pushpa 2";
  const theatreName = booking.theatre ? booking.theatre : "PVR Cinemas";
  const seats = booking.seats.length > 0 ? booking.seats : ["A1", "A2"];
  const bookingId = booking.show && String(booking.show).startsWith("BMS") ? booking.show : "BMS12345678";
  const qrUrl = getTicketVerificationUrl(bookingId);

  const handleDownloadPdf = () => {
    generateAndDownloadTicketPdf({
      type: "MOVIE",
      bookingId: bookingId,
      ticketCode: (booking as any).posBookingId || bookingId,
      customerName: "Valued Patron",
      customerEmail: "patron@cinevenue.com",
      title: movieTitle,
      venue: theatreName,
      screen: "Cinema Hall 1",
      date: "Today",
      time: booking.show && !String(booking.show).startsWith("BMS") ? booking.show : "7:00 PM",
      seats: seats,
      categoryName: "VIP Tier",
      quantity: seats.length,
      totalPaid: (booking as any).totalPrice || (seats.length * 250),
      paymentMethod: "Online / UPI",
      posterUrl: booking.movie?.poster
    });
  };

  return (
    <Container sx={{ mt: 15, maxWidth: "500px !important", mb: 4 }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{
            color: "#D4AF37",
            borderColor: "#D4AF37",
            "&:hover": {
              borderColor: "#e5c358",
              backgroundColor: "rgba(212, 175, 55, 0.08)",
            },
          }}
          variant="outlined"
        >
          Back to Home
        </Button>

        <Button
          startIcon={<DownloadIcon />}
          onClick={handleDownloadPdf}
          sx={{
            backgroundColor: "#D4AF37",
            color: "#000",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#e5c358",
            },
          }}
          variant="contained"
        >
          Download PDF
        </Button>
      </Box>
      <Card sx={{ borderRadius: 3, border: "2px dashed #D4AF37", boxShadow: 4, overflow: "hidden", backgroundColor: "#0D111A", color: "#F5F5F7" }}>
        <Box sx={{ backgroundColor: "#D4AF37", color: "#000", py: 2, textAlign: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            E-Ticket Confirmed
          </Typography>
        </Box>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#F5F5F7" }} gutterBottom>
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
              <Typography sx={{ fontWeight: "medium" }} color="#D4AF37">{seats.join(" ")}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">CineVenue ID:</Typography>
              <Typography sx={{ fontWeight: "bold", color: "#D4AF37" }}>{bookingId}</Typography>
            </Box>
            {(booking as any).posBookingId && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">POS Reference:</Typography>
                <Typography sx={{ fontWeight: "bold", fontFamily: "monospace" }} color="#3b82f6">{(booking as any).posBookingId}</Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.1)" }} />

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Scan this QR code at the cinema entrance
            </Typography>
            <Box
              sx={{
                p: 2,
                border: "1px solid #D4AF37",
                borderRadius: 2,
                backgroundColor: "white"
              }}
            >
              <QRCode value={qrUrl} size={150} />
            </Box>
            <Typography variant="caption" sx={{ mt: 1, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
              {bookingId}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
