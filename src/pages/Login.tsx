import React, { useState, useContext } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Paper,
  Box,
  Alert
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { signIn, signInWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError("");
      await signIn(email, password);
      setSuccess("Login successful!");
      setTimeout(() => navigate("/"), 500);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid credentials or server error");
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
            "&:hover: border-color": "#df3553",
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
          Login
        </Typography>
        <Typography color="text.secondary" align="center" sx={{ mb: 3 }}>
          Access your bookings & secure transactions
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <TextField
          fullWidth
          label="Email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          type="password"
          label="Password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleLogin}
          sx={{ mt: 3, backgroundColor: "#F84464", "&:hover": { backgroundColor: "#df3553" } }}
        >
          Login
        </Button>

        <Button
          variant="outlined"
          fullWidth
          size="large"
          onClick={() => signInWithGoogle?.()}
          sx={{
            mt: 2,
            borderColor: "rgba(255,255,255,0.2)",
            color: "#fff",
            "&:hover": { borderColor: "#D4AF37", backgroundColor: "rgba(212,175,55,0.08)" }
          }}
        >
          Continue with Google
        </Button>
      </Paper>
    </Container>
  );
}
