import React, { useState, useContext, useEffect } from "react";
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
import KeyIcon from "@mui/icons-material/VpnKey";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";

export default function Login() {
  const [viewMode, setViewMode] = useState<"login" | "forgot" | "reset">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password & OTP Reset State
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [otpDestination, setOtpDestination] = useState("");
  const [otpDeliveredCode, setOtpDeliveredCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const { signIn, signInWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

  const handleSendOtp = async () => {
    const target = forgotIdentifier.trim() || identifier.trim();
    if (!target) {
      setError("Please enter your registered mobile number or email address.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await apiClient.post("/auth/forgot-password", { identifier: target });
      const resData = response.data;
      if (resData?.success === false) {
        setError(resData?.message || "No registered account found. Please check or sign up.");
        return;
      }

      const deliveredOtp = resData?.code || resData?.devCode || resData?.devOtpCode || "";
      setOtpDeliveredCode(deliveredOtp);
      setOtpDestination(resData?.destination || target);
      setResetCode(deliveredOtp);
      setResendCooldown(30);
      setSuccess(
        resData?.message ||
        `A 6-digit verification code has been dispatched to ${resData?.destination || target}. Please enter the code below to reset your password.`
      );
      setViewMode("reset");
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message;
      setError(msg || "Failed to dispatch verification code. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetCode.trim()) {
      setError("Please enter the 6-digit verification code (OTP).");
      return;
    }
    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const target = forgotIdentifier.trim() || identifier.trim();
      const response = await apiClient.post("/auth/reset-password", {
        token: resetCode.trim(),
        newPassword,
        confirmPassword: confirmNewPassword,
        identifier: target
      });

      setSuccess(response.data?.message || "Password updated successfully! Please sign in with your new password.");
      setIdentifier(target);
      setPassword("");
      setResetCode("");
      setNewPassword("");
      setConfirmNewPassword("");
      setViewMode("login");
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message;
      setError(msg || "Invalid or expired verification code. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 15, mb: 8, maxWidth: "450px !important" }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-start" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => {
            if (viewMode !== "login") {
              setViewMode("login");
              setError("");
              setSuccess("");
            } else {
              navigate(-1);
            }
          }}
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
          {viewMode !== "login" ? "Back to Sign In" : "Back"}
        </Button>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        {/* ========================================================
            1. SIGN IN MODE
           ======================================================== */}
        {viewMode === "login" && (
          <>
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
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError("");
              }}
              required
            />
            <TextField
              fullWidth
              type="password"
              label="Password"
              margin="normal"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                variant="text"
                onClick={() => {
                  setForgotIdentifier(identifier);
                  setError("");
                  setSuccess("");
                  setViewMode("forgot");
                }}
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
          </>
        )}

        {/* ========================================================
            2. FORGOT PASSWORD MODE (ENTER MOBILE OR EMAIL)
           ======================================================== */}
        {viewMode === "forgot" && (
          <>
            <Typography variant="h5" sx={{ fontWeight: "bold" }} align="center" gutterBottom>
              Forgot Password
            </Typography>
            <Typography color="text.secondary" align="center" sx={{ mb: 3, fontSize: "0.875rem" }}>
              Enter your registered mobile number or email address. A 6-digit OTP will be dispatched for verification.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <TextField
              fullWidth
              label="Registered Mobile Number or Email"
              placeholder="e.g. 9876543210 or user@cinevenue.com"
              margin="normal"
              value={forgotIdentifier}
              onChange={(e) => {
                setForgotIdentifier(e.target.value);
                setError("");
              }}
              required
              helperText="We'll send a 6-digit verification code to this phone number or email."
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              onClick={handleSendOtp}
              sx={{
                mt: 3,
                backgroundColor: "#D4AF37",
                color: "#000",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#c59f2a" }
              }}
            >
              {loading ? "Dispatching OTP..." : "Send Verification OTP"}
            </Button>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Button
                variant="text"
                onClick={() => {
                  setViewMode("login");
                  setError("");
                  setSuccess("");
                }}
                sx={{ color: "#9CA3AF", textTransform: "none", fontSize: "0.85rem" }}
              >
                ← Back to Login
              </Button>
            </Box>
          </>
        )}

        {/* ========================================================
            3. RESET PASSWORD / OTP VERIFICATION MODE
           ======================================================== */}
        {viewMode === "reset" && (
          <>
            <Typography variant="h5" sx={{ fontWeight: "bold" }} align="center" gutterBottom>
              Verify OTP & Reset Password
            </Typography>
            <Typography color="text.secondary" align="center" sx={{ mb: 2, fontSize: "0.875rem" }}>
              Enter the 6-digit OTP sent to <strong style={{ color: "#D4AF37" }}>{otpDestination || forgotIdentifier}</strong>
            </Typography>

            {otpDeliveredCode && (
              <Box
                sx={{
                  mb: 2.5,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid rgba(212, 175, 55, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: "#D4AF37", fontWeight: "bold", textTransform: "uppercase", display: "block" }}>
                    Verification Code (OTP) Sent
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#fff", mt: 0.5 }}>
                    OTP: <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: "1.1rem", letterSpacing: "2px", color: "#D4AF37", backgroundColor: "rgba(0,0,0,0.5)", padding: "2px 8px", borderRadius: "4px" }}>{otpDeliveredCode}</span>
                  </Typography>
                </Box>
                {resetCode !== otpDeliveredCode && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setResetCode(otpDeliveredCode);
                      setError("");
                    }}
                    sx={{ backgroundColor: "#D4AF37", color: "#000", fontWeight: "bold", textTransform: "none" }}
                  >
                    Auto-Fill
                  </Button>
                )}
              </Box>
            )}

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <TextField
              fullWidth
              label="6-Digit Verification Code (OTP)"
              placeholder="e.g. 123456"
              margin="normal"
              value={resetCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                setResetCode(val);
                setError("");
              }}
              inputProps={{ maxLength: 6, style: { letterSpacing: "4px", fontFamily: "monospace", fontWeight: "bold" } }}
              required
            />

            <TextField
              fullWidth
              type="password"
              label="New Password"
              placeholder="Minimum 6 characters"
              margin="normal"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError("");
              }}
              required
            />

            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              placeholder="Re-enter new password"
              margin="normal"
              value={confirmNewPassword}
              onChange={(e) => {
                setConfirmNewPassword(e.target.value);
                setError("");
              }}
              required
            />

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, mb: 1 }}>
              <Button
                variant="text"
                onClick={() => {
                  setViewMode("forgot");
                  setError("");
                  setSuccess("");
                }}
                sx={{ color: "#9CA3AF", textTransform: "none", fontSize: "0.8rem", p: 0 }}
              >
                Change Mobile/Email
              </Button>

              <Button
                variant="text"
                disabled={loading || resendCooldown > 0}
                onClick={handleSendOtp}
                sx={{ color: "#D4AF37", textTransform: "none", fontSize: "0.8rem", p: 0 }}
              >
                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
              </Button>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              onClick={handleResetPassword}
              sx={{
                mt: 2,
                backgroundColor: "#D4AF37",
                color: "#000",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#c59f2a" }
              }}
            >
              {loading ? "Verifying & Updating..." : "Verify OTP & Reset Password"}
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
}
