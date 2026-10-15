import React, { useState, useContext } from "react";
import { Container, TextField, Button, Typography, Paper, Alert, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { signInWithGoogle } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (pass: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pass);
  };

  const handleRegister = async () => {
    try {
      setError("");
      setSuccess("");

      if (!name.trim()) {
        setError("Full name is required.");
        return;
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError("Please provide a valid email address.");
        return;
      }
      const cleanMobile = mobile.replace(/\s+/g, "");
      if (!/^\+?[1-9]\d{7,14}$/.test(cleanMobile)) {
        setError("Please provide a valid mobile number (e.g. +919876543210 or 9876543210).");
        return;
      }
      if (!validatePassword(password)) {
        setError("Password must be at least 8 characters long and include uppercase, lowercase, a number, and a symbol.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      setLoading(true);
      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        mobile: cleanMobile,
        password,
        confirmPassword
      });

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error?.message || err.response?.data?.message || "Registration failed or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 15, mb: 8, maxWidth: "480px !important" }}>
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
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Mobile Number"
          placeholder="+91 9876543210"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helperText="Min 8 characters with uppercase, lowercase, number & symbol"
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          onClick={handleRegister}
          sx={{ mt: 3, backgroundColor: "#F84464", "&:hover": { backgroundColor: "#df3553" } }}
        >
          {loading ? "Creating Account..." : "Register"}
        </Button>

        <Button
          variant="outlined"
          fullWidth
          size="large"
          onClick={async () => {
            try {
              setError("");
              await signInWithGoogle?.();
            } catch (gErr: any) {
              setError(gErr?.message || "Google Sign-In is unavailable. Please use Email and Password.");
            }
          }}
          sx={{
            mt: 2,
            borderColor: "rgba(255,255,255,0.2)",
            color: "#fff",
            "&:hover": { borderColor: "#D4AF37", backgroundColor: "rgba(212,175,55,0.08)" }
          }}
        >
          Continue with Google
        </Button>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Button
              variant="text"
              onClick={() => navigate("/login")}
              sx={{ color: "#D4AF37", fontWeight: "bold", textTransform: "none", p: 0, minWidth: "auto" }}
            >
              Sign In
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
