import React, { useContext } from "react";
import { Container, Typography, Button, Box, Paper } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SeatLayout from "../components/SeatLayout";
import { useNavigate } from "react-router-dom";
import { BookingContext } from "../context/BookingContext";

export default function SeatBooking() {
  const navigate = useNavigate();
  const { booking } = useContext(BookingContext);

  const handleContinue = () => {
    if (booking.seats.length === 0) {
      alert("Please select at least one seat to continue.");
      return;
    }
    navigate("/payment");
  };

  return (
    <Container sx={{ mt: 12, mb: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 600, mb: 2, display: "flex", justifyContent: "flex-start" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
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
      <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
        Select Seats
      </Typography>

      {booking.movie && (
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          {booking.movie.title} • {booking.theatre} • {booking.show}
        </Typography>
      )}

      <Paper sx={{ width: "100%", maxWidth: 600, p: 4, display: "flex", flexDirection: "column", alignItems: "center", borderRadius: 2 }}>
        <Box sx={{ width: "80%", height: 30, backgroundColor: "#E4E6EB", borderBottomLeftRadius: "50%", borderBottomRightRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", mb: 6, boxShadow: "0px 8px 16px rgba(0,0,0,0.1)" }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>
            All eyes this way (Screen)
          </Typography>
        </Box>

        <SeatLayout />

        <Box sx={{ display: "flex", gap: 3, mt: 4, flexWrap: "wrap", justifyContent: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 18, height: 18, border: "1px solid #4caf50", borderRadius: 1 }} />
            <Typography variant="caption">Available</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 18, height: 18, backgroundColor: "#2e7d32", borderRadius: 1 }} />
            <Typography variant="caption">Selected</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 18, height: 18, backgroundColor: "#d32f2f", borderRadius: 1 }} />
            <Typography variant="caption">Booked</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 4, width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Seats: {booking.seats.join(", ") || "None"}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Total: ₹{booking.total}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleContinue}
            sx={{ px: 4, py: 1.2, backgroundColor: "#F84464", "&:hover": { backgroundColor: "#df3553" } }}
          >
            Continue
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
