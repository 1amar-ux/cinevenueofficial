import React, { useState, useContext } from "react";
import { X, Mail, Lock, User, Phone, ArrowRight, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import CineVenueLogo from "./CineVenueLogo";
import apiClient from "../services/apiClient";
import { AuthContext } from "../context/AuthContext";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (email: string) => void;
  initialMode?: "signin" | "signup" | "forgot";
  registeredUsers?: any;
  onRegisterUser?: any;
  superAdminEmail?: any;
  superAdminPassword?: any;
  theatreAdmins?: any;
  eventOrganizers?: any;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = "signin" }: AuthModalProps) {
  const { signInWithGoogle, login, refreshSession } = useContext(AuthContext);
  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "reset">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "", // Used for email or mobile in signin
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  React.useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
    setErrorMessage("");
    setSuccessMessage("");
  }, [initialMode, isOpen]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const authErr = params.get("authError");
      if (authErr) {
        setErrorMessage(decodeURIComponent(authErr));
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const isNumericPhone = (val: string) => /^\+?[0-9\s-]{4,}$/.test(val.trim());
  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validateMobile = (value: string) => /^\+?[1-9]\d{7,14}$/.test(value.replace(/\s+/g, ""));
  const validatePassword = (value: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (mode === "signup") {
      if (!form.fullName.trim()) {
        setErrorMessage("Full name is required.");
        return;
      }
      if (!validateEmail(form.email)) {
        setErrorMessage("Please enter a valid email address.");
        return;
      }
      if (!validateMobile(form.mobile)) {
        setErrorMessage("Please enter a valid mobile number.");
        return;
      }
      if (!validatePassword(form.password)) {
        setErrorMessage("Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }

      setIsLoading(true);
      try {
        const cleanMobile = form.mobile.replace(/\s+/g, "");
        await apiClient.post("/auth/register", {
          name: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          mobile: cleanMobile,
          password: form.password,
        });
        setSuccessMessage("Your account has been created. You can now sign in.");
        setMode("signin");
        setForm(prev => ({ ...prev, email: form.email.trim(), password: "", confirmPassword: "" }));
      } catch (err: any) {
        let message = err.response?.data?.error?.message || err.response?.data?.message || err.message;
        if (message && (message.toLowerCase().includes("internal server error") || message.includes("500"))) {
          message = "An account with this email address or mobile number may already exist. Please try signing in.";
        }
        setErrorMessage(message || "Failed to create account. Please try again.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (mode === "signin") {
      const identifier = form.email.trim() || form.mobile.trim();
      if (!identifier) {
        setErrorMessage("Please enter your email or mobile number.");
        return;
      }
      if (!form.password) {
        setErrorMessage("Please enter your password.");
        return;
      }

      setIsLoading(true);
      try {
        const response = await apiClient.post("/auth/login", { identifier, password: form.password });
        const user = response.data?.data?.user;
        const emailAddress = user?.email || identifier;
        if (login && user) {
          login(user);
        } else if (refreshSession) {
          await refreshSession();
        }
        setSuccessMessage("Authentication successful.");
        onAuthSuccess(emailAddress);
        onClose();
      } catch (err: any) {
        let message = err.response?.data?.error?.message || err.response?.data?.message || err.message;
        if (!message || message.includes("500") || message.includes("Network Error")) {
          message = "A temporary server connection issue occurred. Please check your network and try again.";
        }
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (mode === "forgot") {
      const identifier = forgotIdentifier.trim() || form.email.trim();
      if (!identifier) {
        setErrorMessage("Please enter your registered email address or mobile number.");
        return;
      }

      setIsLoading(true);
      try {
        const response = await apiClient.post("/auth/forgot-password", { identifier });
        const resData = response.data;
        if (resData?.success === false) {
          setErrorMessage(resData?.message || "No registered account found. Please check or sign up.");
          return;
        }

        // Clear OTP code so user enters the OTP code received via email / SMS
        setResetCode("");
        setNewPassword("");
        setConfirmNewPassword("");
        setSuccessMessage(
          resData?.message ||
          "A 6-digit verification code has been dispatched to your registered email / mobile. Please check your inbox and enter the code below."
        );
        setMode("reset");
      } catch (err: any) {
        let message = err.response?.data?.error?.message || err.response?.data?.message || err.message;
        setErrorMessage(message || "Failed to initiate password reset. Please try again.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (mode === "reset") {
      if (!resetCode.trim()) {
        setErrorMessage("Please enter the 6-digit verification code you received.");
        return;
      }
      if (!newPassword) {
        setErrorMessage("Please enter a new password.");
        return;
      }
      if (newPassword.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }

      setIsLoading(true);
      try {
        const response = await apiClient.post("/auth/reset-password", {
          token: resetCode.trim(),
          newPassword,
          identifier: forgotIdentifier.trim() || form.email.trim()
        });
        setSuccessMessage(response.data?.message || "Password updated successfully! Please sign in with your new password.");
        setMode("signin");
        const ident = forgotIdentifier.trim() || form.email.trim();
        if (ident.includes("@")) {
          setForm(prev => ({ ...prev, email: ident, password: "" }));
        } else {
          setForm(prev => ({ ...prev, password: "" }));
        }
        setResetCode("");
        setNewPassword("");
        setConfirmNewPassword("");
      } catch (err: any) {
        let message = err.response?.data?.error?.message || err.response?.data?.message || err.message;
        setErrorMessage(message || "Invalid or expired verification code. Please request a new one.");
      } finally {
        setIsLoading(false);
      }
      return;
    }
  };

  const handleGoogle = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    setErrorMessage("");
    try {
      if (!isSupabaseConfigured) {
        setErrorMessage("Google Sign-In is not configured yet. Please sign in or register using your Email & Password.");
        setIsGoogleLoading(false);
        return;
      }

      if (signInWithGoogle) {
        await signInWithGoogle();
      } else {
        const origin = typeof window !== "undefined" ? window.location.origin.replace("://www.", "://") : "https://cinevenue.com";
        const callbackUrl = `${origin}/auth/callback`;
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: callbackUrl,
            scopes: "openid email profile",
            queryParams: {
              access_type: "offline",
              prompt: "consent"
            }
          }
        });
        if (error) throw error;
        if (data?.url) window.location.href = data.url;
      }
    } catch (err: any) {
      console.error("Google OAuth error:", err);
      setErrorMessage(err?.message || "Failed to initiate Google Sign-In. Please check your connection or use Email.");
      setIsGoogleLoading(false);
    }
  };

  const handleApple = async () => {
    setIsAppleLoading(true);
    setErrorMessage("");
    try {
      if (!isSupabaseConfigured) {
        setErrorMessage("Apple Sign-In requires Supabase Auth configuration. Please sign in or register with Email.");
        setIsAppleLoading(false);
        return;
      }

      const origin = typeof window !== "undefined" ? window.location.origin.replace("://www.", "://") : "https://cinevenue.com";
      const callbackUrl = `${origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: callbackUrl,
          scopes: "email name"
        }
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      console.error("Apple OAuth error:", err);
      setErrorMessage(err?.message || "Apple Sign-In is connecting. Please ensure Apple Sign In is enabled in Supabase.");
      setIsAppleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0B0B0D] shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <CineVenueLogo size="sm" />
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-gold/50 hover:text-gold cursor-pointer"
            aria-label="Close auth modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-6">
          <div className="mb-5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/80">CineVenue</p>
            <h2 className="mt-2 text-2xl font-black text-white">
              {mode === "signin" && "Welcome back"}
              {mode === "signup" && "Create your account"}
              {mode === "forgot" && "Reset your password"}
              {mode === "reset" && "Set new password"}
            </h2>
            {mode === "forgot" && (
              <p className="mt-1 text-xs text-white/60">
                Enter your registered mobile number or email to receive a reset code.
              </p>
            )}
            {mode === "reset" && (
              <p className="mt-1 text-xs text-white/60">
                Enter the verification code and set your new password.
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* SIGN UP FIELDS */}
            {mode === "signup" && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-white/40" />
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold/60"
                    placeholder="Full Name"
                    required
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-white/40" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold/60"
                    placeholder="Email Address"
                    required
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-white/40" />
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold/60"
                    placeholder="Mobile Number"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold/60"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-3.5 text-[10px] uppercase tracking-wide text-white/60 hover:text-gold cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold/60"
                    placeholder="Confirm Password"
                    required
                  />
                </div>
              </>
            )}

            {/* SIGN IN FIELDS */}
            {mode === "signin" && (
              <>
                <div className="relative">
                  {isNumericPhone(form.email) ? (
                    <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gold/70" />
                  ) : (
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-white/40" />
                  )}
                  <input
                    type="text"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold/60"
                    placeholder="Mobile Number or Email Address"
                    autoComplete="username"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold/60"
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-3.5 text-[10px] uppercase tracking-wide text-white/60 hover:text-gold cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-white/60">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-gold" />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotIdentifier(form.email);
                      setMode("forgot");
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className="text-gold hover:text-gold-light transition cursor-pointer font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
              </>
            )}

            {/* FORGOT PASSWORD FIELDS */}
            {mode === "forgot" && (
              <>
                <div className="relative">
                  {isNumericPhone(forgotIdentifier) ? (
                    <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gold/70" />
                  ) : (
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-white/40" />
                  )}
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => {
                      setForgotIdentifier(e.target.value);
                      setErrorMessage("");
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold/60"
                    placeholder="Mobile Number or Email Address"
                    required
                  />
                </div>
              </>
            )}

            {/* RESET PASSWORD FIELDS */}
            {mode === "reset" && (
              <>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-gold/70" />
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => {
                      setResetCode(e.target.value);
                      setErrorMessage("");
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold/60 font-mono tracking-wider"
                    placeholder="Enter 6-digit verification code"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-white/40" />
                  <input
                    type={showResetPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold/60"
                    placeholder="New Password (min 6 chars)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword((prev) => !prev)}
                    className="absolute right-3 top-3.5 text-[10px] uppercase tracking-wide text-white/60 hover:text-gold cursor-pointer"
                  >
                    {showResetPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-white/40" />
                  <input
                    type={showResetPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold/60"
                    placeholder="Confirm New Password"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={async () => {
                      const identifier = forgotIdentifier.trim() || form.email.trim();
                      if (!identifier) {
                        setErrorMessage("Identifier is missing. Please restart forgot password.");
                        return;
                      }
                      setIsLoading(true);
                      setErrorMessage("");
                      try {
                        const response = await apiClient.post("/auth/forgot-password", { identifier });
                        setSuccessMessage(response.data?.message || "A new 6-digit verification code has been dispatched.");
                      } catch (err: any) {
                        setErrorMessage(err.response?.data?.message || "Failed to resend verification code.");
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="text-[11px] text-gold/80 hover:text-gold transition cursor-pointer"
                  >
                    Didn't receive code? Resend OTP
                  </button>
                </div>
              </>
            )}

            {/* ACTION BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:bg-gold-light disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                "Please wait..."
              ) : mode === "signin" ? (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              ) : mode === "signup" ? (
                <>Create Account <ArrowRight className="h-4 w-4" /></>
              ) : mode === "forgot" ? (
                <>Get Reset Code <ArrowRight className="h-4 w-4" /></>
              ) : (
                <>Update Password <CheckCircle2 className="h-4 w-4" /></>
              )}
            </button>

            {/* GOOGLE SIGN IN (Only in signin or signup modes) */}
            {(mode === "signin" || mode === "signup") && (
              <>
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/45">or</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={isGoogleLoading || isAppleLoading || isLoading}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white transition hover:border-gold/50 hover:bg-white/10 disabled:opacity-60 cursor-pointer"
                  >
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-black text-[9px] font-black">G</span>
                    <span>{isGoogleLoading ? "Connecting..." : "Google"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApple}
                    disabled={isAppleLoading || isGoogleLoading || isLoading}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/80 px-3 py-2.5 text-xs font-semibold text-white transition hover:border-white/50 hover:bg-white/10 disabled:opacity-60 cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.71-7.97-12.04-14.67-6.03-9.35-10.74-19.67-14.13-30.98-3.39-11.31-5.09-22.13-5.09-32.48 0-14.66 3.66-26.68 10.98-36.08 7.32-9.4 16.48-14.19 27.48-14.36 5.8 0 12.08 1.48 18.84 4.43 6.76 2.95 10.88 4.49 12.38 4.62 1.83-.26 6.37-1.89 13.62-4.88 7.25-3 13.71-4.35 19.39-4.06 14.07.72 25.04 5.92 32.9 15.61-12.22 7.42-18.17 17.51-17.84 30.27.33 10.05 4.16 18.43 11.51 25.13 7.34 6.7 16.12 10.45 26.33 11.23-2.22 6.53-4.84 13.25-7.86 20.17zM119.22 33.64c0-7.44 2.68-14.48 8.04-21.13 5.37-6.64 12.03-10.98 19.98-13.01.26 1.18.39 2.29.39 3.34 0 7.4-2.73 14.51-8.19 21.32-5.46 6.81-12.18 11.02-20.17 12.63-.05-1.05-.05-2.1-.05-3.15z"/>
                    </svg>
                    <span>{isAppleLoading ? "Connecting..." : "Apple"}</span>
                  </button>
                </div>
              </>
            )}
          </form>

          {/* BOTTOM SWITCHER */}
          <div className="mt-5 text-center text-sm text-white/60">
            {mode === "signin" && (
              <>
                Need an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="font-semibold text-gold transition hover:text-gold-light cursor-pointer"
                >
                  Sign Up
                </button>
              </>
            )}

            {mode === "signup" && (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="font-semibold text-gold transition hover:text-gold-light cursor-pointer"
                >
                  Sign In
                </button>
              </>
            )}

            {(mode === "forgot" || mode === "reset") && (
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="inline-flex items-center gap-1.5 font-semibold text-gold hover:text-gold-light transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
