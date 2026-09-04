import React, { useState } from "react";
import { Container, TextField, Button, Typography, Paper, Alert, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      setError("");
      setSuccess("");
      const res = await api.post("/auth/register", {
        name,
        email,
        password
      });
      console.log(res.data);
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error?.message || err.response?.data?.message || "Registration failed or server error");
    }
  };

  return (
    <Container sx={{ mt: 15, maxWidth: "450px !important" }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-start" }}>
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
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }} align="center" gutterBottom>
          Create Account
        </Typography>
        <Typography color="text.secondary" align="center" sx={{ mb: 3 }}>
          Join CineVenue and start booking
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <TextField
          fullWidth
          margin="normal"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleRegister}
          sx={{ mt: 3, backgroundColor: "#F84464", "&:hover": { backgroundColor: "#df3553" } }}
        >
          Register
        </Button>
      </Paper>
    </Container>
  );
}
