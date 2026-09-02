import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Typography,
  Box,
  Paper,
  TableContainer
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const movies = [
  {
    id: 1,
    title: "Pushpa 2",
    language: "Telugu"
  },
  {
    id: 2,
    title: "Salaar",
    language: "Telugu"
  }
];

export default function Movies() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }}>
        Movies Catalog
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Movie Title</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Language</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movies.map((movie) => (
              <TableRow key={movie.id} hover>
                <TableCell>{movie.title}</TableCell>
                <TableCell>{movie.language}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/admin/edit-movie/${movie.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={() => alert("Movie deleted successfully (Simulation)")}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
