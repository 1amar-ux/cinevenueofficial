import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button
} from "@mui/material";
import { Link } from "react-router-dom";

interface Movie {
  _id: string | number;
  title: string;
  language: string;
  poster: string;
}

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardMedia
        component="img"
        height="350"
        image={movie.poster}
        alt={movie.title}
        sx={{ objectFit: "cover" }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" noWrap>
          {movie.title}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {movie.language}
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to={`/movie/${movie._id}`}
          fullWidth
          sx={{ backgroundColor: "#F84464", "&:hover": { backgroundColor: "#df3553" } }}
        >
          Book Now
        </Button>
      </CardContent>
    </Card>
  );
}
