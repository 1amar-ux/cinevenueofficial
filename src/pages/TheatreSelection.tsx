import React, { useContext, useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Divider,
  Chip
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { BookingContext } from "../context/BookingContext";
import { INITIAL_MOVIES, Movie } from "../data";

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

  const currentMovie: Movie = booking.movie || INITIAL_MOVIES[0];
  const [showFullDesc, setShowFullDesc] = useState<boolean>(false);

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
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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

        {saveSuccess && (
          <Alert severity="success" sx={{ py: 0, px: 2 }}>
            Movie info updated successfully!
          </Alert>
        )}
      </Box>

      {/* Movie Details Header Card with Description and Casting */}
      {currentMovie && (
        <Card
          sx={{
            mb: 4,
            borderRadius: 3,
            backgroundColor: "#11141A",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#FFFFFF",
            boxShadow: 3,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: 2, sm: 3 }, alignItems: { sm: "flex-start" } }}>
              {(currentMovie.poster || currentMovie.img) && (
                <Box
                  component="img"
                  src={currentMovie.poster || currentMovie.img}
                  alt={currentMovie.title}
                  sx={{
                    width: { xs: "100%", sm: 120 },
                    height: { xs: 180, sm: 170 },
                    objectFit: "cover",
                    borderRadius: 2,
                    boxShadow: 2,
                    flexShrink: 0,
                  }}
                />
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#FFFFFF" }}>
                      {currentMovie.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)", mt: 0.5 }}>
                      {currentMovie.lang || currentMovie.language || "Telugu"} • {currentMovie.genre || "Action / Drama"} • {currentMovie.duration || "2h 30m"} • {currentMovie.certification || currentMovie.certificate || "UA"}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5, borderColor: "rgba(255, 255, 255, 0.08)" }} />

                {/* Director */}
                {currentMovie.director && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "bold" }}>
                      Directed by:{" "}
                    </Typography>
                    <Typography variant="body2" component="span" sx={{ color: "#D4AF37", fontWeight: 600 }}>
                      {currentMovie.director}
                    </Typography>
                  </Box>
                )}

                {/* Description / Synopsis */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "bold", display: "block", mb: 0.5 }}>
                    Synopsis
                  </Typography>
                  {currentMovie.description ? (
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(255, 255, 255, 0.8)",
                          lineHeight: 1.6,
                          ...(showFullDesc ? {} : { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }),
                        }}
                      >
                        {currentMovie.description}
                      </Typography>
                      {currentMovie.description.length > 150 && (
                        <Button
                          size="small"
                          onClick={() => setShowFullDesc(!showFullDesc)}
                          sx={{ color: "#D4AF37", p: 0, minWidth: 0, textTransform: "none", fontSize: "0.75rem", mt: 0.5 }}
                        >
                          {showFullDesc ? "Show Less" : "Read More..."}
                        </Button>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.4)", fontStyle: "italic" }}>
                      No description available for this movie.
                    </Typography>
                  )}
                </Box>

                {/* Casting Chips */}
                <Box>
                  <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "bold", display: "block", mb: 0.8 }}>
                    Starring Cast
                  </Typography>
                  {(currentMovie.cast || currentMovie.actors) && (currentMovie.cast || currentMovie.actors)!.length > 0 ? (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {(currentMovie.cast || currentMovie.actors)!.map((actor: string, idx: number) => (
                        <Chip
                          key={actor + idx}
                          label={actor}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                            color: "#FFFFFF",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            fontSize: "0.75rem",
                            "&:hover": {
                              borderColor: "#D4AF37",
                              backgroundColor: "rgba(212, 175, 55, 0.1)",
                            },
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.4)", fontStyle: "italic" }}>
                      No cast members listed for this movie.
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Select Theatre & Showtime
        </Typography>
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
