import React, { useContext } from "react";
import {
  Container,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  Box
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useNavigate } from "react-router-dom";
import { BookingContext } from "../context/BookingContext";

const movies = [
  {
    _id: 1,
    title: "Pushpa 2",
    language: "Telugu",
    genre: "Action • Drama",
    duration: "2h 50m",
    description: "A gripping action drama with spectacular visuals, continuing the epic rise of Pushpa Raj.",
    poster: "https://picsum.photos/900/450?1"
  },
  {
    _id: 2,
    title: "Salaar",
    language: "Telugu",
    genre: "Action • Thriller",
    duration: "2h 55m",
    description: "An action-packed blockbuster featuring a loyal friend who stands by a prince in a violent world.",
    poster: "https://picsum.photos/900/450?2"
  }
];

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setBooking } = useContext(BookingContext);

  const movie = movies.find((m) => String(m._id) === String(id)) || movies[0];

  const handleBookTickets = () => {
    setBooking((prev) => ({
      ...prev,
      movie: movie
    }));
    navigate("/theatres");
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
      <Card sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 4 }}>
        <CardMedia
          component="img"
          height="450"
          image={movie.poster}
          alt={movie.title}
          sx={{ objectFit: "cover" }}
        />

        <CardContent sx={{ p: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: "bold" }} gutterBottom>
            {movie.title}
          </Typography>

          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            {movie.genre} • {movie.language} • {movie.duration}
          </Typography>

          <Typography variant="body1" color="text.primary" sx={{ mt: 2, mb: 2, fontSize: "1.1rem" }}>
            {movie.description}
          </Typography>

          <Button
            sx={{ mt: 3, px: 4, py: 1.5, fontSize: "1rem", backgroundColor: "#F84464", "&:hover": { backgroundColor: "#df3553" } }}
            variant="contained"
            onClick={handleBookTickets}
          >
            Book Tickets
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
