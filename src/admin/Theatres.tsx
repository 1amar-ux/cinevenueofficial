import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack
} from "@mui/material";
import { Add, Delete, Store } from "@mui/icons-material";
import api from "../services/api";
import { Theatre } from "../types";

export default function TheatresAdmin() {
  const [theatres, setTheatres] = useState<Theatre[]>([
    {
      id: 1,
      name: "IMAX Prasads",
      location: "Hyderabad",
      features: ["4K Laser", "Dolby Atmos", "Recliners"],
      price: "₹150 - ₹450",
      img: "https://picsum.photos/300/200?10"
    },
    {
      id: 2,
      name: "PVR GVK One",
      location: "Hyderabad",
      features: ["RealD 3D", "IMAX Lounge"],
      price: "₹120 - ₹350",
      img: "https://picsum.photos/300/200?11"
    }
  ]);

  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newTheatre, setNewTheatre] = useState({
    name: "",
    location: "",
    price: "₹150 - ₹350",
    features: "Dolby Atmos, 4K Projection",
    img: "https://picsum.photos/300/200?12"
  });

  useEffect(() => {
    fetchTheatres();
  }, []);

  const fetchTheatres = async () => {
    try {
      const res = await api.get("/theatres");
      if (res.data && res.data.length > 0) {
        setTheatres(res.data);
      }
    } catch (err) {
      console.log("Using local theatres state", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewTheatre({
      name: "",
      location: "",
      price: "₹150 - ₹350",
      features: "Dolby Atmos, 4K Projection",
      img: "https://picsum.photos/300/200?12"
    });
  };

  const handleAdd = async () => {
    if (!newTheatre.name || !newTheatre.location) {
      alert("Name and Location are required!");
      return;
    }

    const featureArr = newTheatre.features.split(",").map((f) => f.trim()).filter(Boolean);
    const added: Theatre = {
      id: Math.floor(Math.random() * 100000),
      name: newTheatre.name,
      location: newTheatre.location,
      price: newTheatre.price,
      img: newTheatre.img,
      features: featureArr
    };

    try {
      try {
        await api.post("/theatres", added);
      } catch {
        await api.post("/admin/theatres", added);
      }
      fetchTheatres();
    } catch (err) {
      console.log("Mocked adding theatre locally", err);
      setTheatres((prev) => [...prev, added]);
    }

    handleClose();
    alert("Theatre Added Successfully!");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this theatre?")) return;

    try {
      try {
        await api.delete(`/theatres/${id}`);
      } catch {
        await api.delete(`/admin/theatres/${id}`);
      }
      fetchTheatres();
    } catch (err) {
      console.log("Mocked deleting theatre locally", err);
      setTheatres((prev) => prev.filter((t) => t.id !== id));
      alert("Theatre Deleted Successfully!");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Theatres & Venues Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpen}
          sx={{ backgroundColor: "#222539", "&:hover": { backgroundColor: "#151724" } }}
        >
          Add Theatre
        </Button>
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Theatre Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Location</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Price Range</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Features</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {theatres.map((theatre) => (
              <TableRow key={theatre.id} hover>
                <TableCell sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Store color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    {theatre.name}
                  </Typography>
                </TableCell>
                <TableCell>{theatre.location}</TableCell>
                <TableCell>{theatre.price}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {theatre.features.map((feat, i) => (
                      <Chip key={i} label={feat} size="small" variant="outlined" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDelete(theatre.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Theatre Modal Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>Add New Theatre / Venue</DialogTitle>
        <DialogContent dividers>
          {/* Replaced Material UI Grid with Standard Tailwind Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="col-span-1 sm:col-span-2">
              <TextField
                fullWidth
                label="Theatre Name"
                placeholder="e.g. Cinevenue Galleria"
                value={newTheatre.name}
                onChange={(e) => setNewTheatre({ ...newTheatre, name: e.target.value })}
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <TextField
                fullWidth
                label="Location (City)"
                placeholder="e.g. Hyderabad"
                value={newTheatre.location}
                onChange={(e) => setNewTheatre({ ...newTheatre, location: e.target.value })}
              />
            </div>
            <div className="col-span-1">
              <TextField
                fullWidth
                label="Pricing Range String"
                placeholder="e.g. ₹150 - ₹350"
                value={newTheatre.price}
                onChange={(e) => setNewTheatre({ ...newTheatre, price: e.target.value })}
              />
            </div>
            <div className="col-span-1">
              <TextField
                fullWidth
                label="Poster Image URL"
                value={newTheatre.img}
                onChange={(e) => setNewTheatre({ ...newTheatre, img: e.target.value })}
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Features (comma separated)"
                placeholder="e.g. Dolby Atmos, 4K Laser, Recliners, Food Court"
                value={newTheatre.features}
                onChange={(e) => setNewTheatre({ ...newTheatre, features: e.target.value })}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button
            onClick={handleAdd}
            variant="contained"
            sx={{ backgroundColor: "#222539", "&:hover": { backgroundColor: "#151724" } }}
          >
            Create Venue
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
