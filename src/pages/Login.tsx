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
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!identifier.trim()) {
      setError("Please enter your email or mobile number.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await signIn(identifier.trim(), password);
      setSuccess("Login successful!");
      setTimeout(() => navigate("/"), 600);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error?.message || err.response?.data?.message || err.message || "Invalid credentials or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 15, mb: 8, maxWidth: "450px !important" }}>
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
          Login
        </Typography>
        <Typography color="text.secondary" align="center" sx={{ mb: 3 }}>
          Access your bookings & secure transactions
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <TextField
          fullWidth
          label="Email or Mobile Number"
          placeholder="e.g. user@cinevenue.com or 9876543210"
          margin="normal"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <TextField
          fullWidth
          type="password"
          label="Password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <Button
            variant="text"
            onClick={() => navigate("/?auth=forgot")}
            sx={{ color: "#D4AF37", textTransform: "none", fontSize: "0.85rem", p: 0 }}
          >
            Forgot Password?
          </Button>
        </Box>

        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          onClick={handleLogin}
          sx={{ mt: 2.5, backgroundColor: "#F84464", "&:hover": { backgroundColor: "#df3553" } }}
        >
          {loading ? "Signing in..." : "Login"}
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
            borderColor: "var(--cv-border)",
            color: "var(--cv-text-primary)",
            "&:hover": { borderColor: "#D4AF37", backgroundColor: "rgba(212,175,55,0.08)" }
          }}
        >
          Continue with Google
        </Button>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{" "}
            <Button
              variant="text"
              onClick={() => navigate("/register")}
              sx={{ color: "#D4AF37", fontWeight: "bold", textTransform: "none", p: 0, minWidth: "auto" }}
            >
              Sign Up
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
