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
import { BookingContext } from "../context/BookingContext";

const theatres = [
  {
    name: "PVR Cinemas",
    shows: ["10:00 AM", "1:30 PM", "7:00 PM"],
  },
  {
    name: "INOX",
    shows: ["11:00 AM", "4:00 PM", "9:30 PM"],
  },
];

export default function TheatreSelection() {
  const navigate = useNavigate();
  const { booking, setBooking } = useContext(BookingContext);

  const handleSelectShow = (theatre: any, show: string) => {
    setBooking((prev) => ({
      ...prev,
      theatre: theatre.name,
      show: show,
    }));
    navigate("/booking");
  };

  return (
    <Container sx={{ mt: 12, mb: 4 }}>
      <Box sx={{ mb: 2 }}>
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Select Theatre & Showtime
        </Typography>
        {booking.movie && (
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            Movie: {booking.movie.title} ({booking.movie.language})
          </Typography>
        )}
      </Box>

      {theatres.map((theatre) => (
        <Card sx={{ mb: 3, borderRadius: 2 }} key={theatre.name}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
              {theatre.name}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {theatre.shows.map((show) => (
                <Button
                  key={show}
                  variant="outlined"
                  onClick={() => handleSelectShow(theatre, show)}
                  sx={{
                    borderColor: "#F84464",
                    color: "#F84464",
                    "&:hover": {
                      borderColor: "#df3553",
                      backgroundColor: "rgba(248, 68, 100, 0.08)",
                    },
                  }}
                >
                  {show}
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}
