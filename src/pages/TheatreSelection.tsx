import React, { useContext, useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
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
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editDesc, setEditDesc] = useState<string>("");
  const [editCast, setEditCast] = useState<string>("");
  const [editDirector, setEditDirector] = useState<string>("");
  const [showFullDesc, setShowFullDesc] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleOpenEdit = () => {
    setEditDesc(currentMovie.description || "");
    const castList = currentMovie.cast || currentMovie.actors || [];
    setEditCast(Array.isArray(castList) ? castList.join(", ") : castList);
    setEditDirector(currentMovie.director || "");
    setShowEditModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const castArr = editCast.split(",").map((s) => s.trim()).filter(Boolean);
    const updatedMovie: Movie = {
      ...currentMovie,
      description: editDesc.trim(),
      cast: castArr,
      actors: castArr,
      director: editDirector.trim() || undefined,
    };

    setBooking((prev) => ({
      ...prev,
      movie: updatedMovie,
    }));

    try {
      const existing: Movie[] = JSON.parse(localStorage.getItem("cine_movies") || "[]");
      const idx = existing.findIndex((m) => m.title?.toLowerCase() === currentMovie.title?.toLowerCase());
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], ...updatedMovie };
      } else {
        existing.push(updatedMovie);
      }
      localStorage.setItem("cine_movies", JSON.stringify(existing));
    } catch (err) {
      console.warn("Storage sync error", err);
    }

    setShowEditModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

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
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3, alignItems: { sm: "flex-start" } }}>
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

                  <Button
                    variant="outlined"
                    startIcon={<EditIcon sx={{ fontSize: "1rem !important" }} />}
                    onClick={handleOpenEdit}
                    size="small"
                    sx={{
                      color: "#D4AF37",
                      borderColor: "#D4AF37",
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      "&:hover": {
                        borderColor: "#e5c358",
                        backgroundColor: "rgba(212, 175, 55, 0.1)",
                      },
                    }}
                  >
                    Add / Edit Info
                  </Button>
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
                      No description added yet. Click "Add / Edit Info" to add synopsis.
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
                      No cast members listed. Click "Add / Edit Info" to add actors.
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

      {/* Edit Movie Description & Casting Modal Dialog */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#141820",
            color: "#FFFFFF",
            borderRadius: 3,
            border: "1px solid rgba(255, 255, 255, 0.15)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
          Edit Movie Description & Casting
        </DialogTitle>
        <Box component="form" onSubmit={handleSave}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 3 }}>
            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
              Update description and casting for <strong>{currentMovie.title}</strong> in the ticket booking flow.
            </Typography>

            <TextField
              label="Movie Description / Synopsis"
              multiline
              rows={4}
              fullWidth
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Enter synopsis, plot summary..."
              InputLabelProps={{ sx: { color: "rgba(255, 255, 255, 0.7)" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#FFFFFF",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                  "&:hover fieldset": { borderColor: "#D4AF37" },
                  "&.Mui-focused fieldset": { borderColor: "#D4AF37" },
                },
              }}
            />

            <TextField
              label="Starring Cast (comma-separated)"
              fullWidth
              value={editCast}
              onChange={(e) => setEditCast(e.target.value)}
              placeholder="e.g. Rajinikanth, Nagarjuna, Shruti Haasan"
              helperText="Separate multiple actors with commas"
              InputLabelProps={{ sx: { color: "rgba(255, 255, 255, 0.7)" } }}
              FormHelperTextProps={{ sx: { color: "rgba(255, 255, 255, 0.5)" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#FFFFFF",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                  "&:hover fieldset": { borderColor: "#D4AF37" },
                  "&.Mui-focused fieldset": { borderColor: "#D4AF37" },
                },
              }}
            />

            <TextField
              label="Director"
              fullWidth
              value={editDirector}
              onChange={(e) => setEditDirector(e.target.value)}
              placeholder="e.g. Lokesh Kanagaraj"
              InputLabelProps={{ sx: { color: "rgba(255, 255, 255, 0.7)" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#FFFFFF",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                  "&:hover fieldset": { borderColor: "#D4AF37" },
                  "&.Mui-focused fieldset": { borderColor: "#D4AF37" },
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <Button
              onClick={() => setShowEditModal(false)}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#D4AF37",
                color: "#000",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#e5c358" },
              }}
            >
              Save & Update Booking
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}
