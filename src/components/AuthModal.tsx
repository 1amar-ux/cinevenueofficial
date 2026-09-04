import React, { useState } from "react";
import { X, Mail, Lock, User, Phone, ChevronRight, ArrowRight } from "lucide-react";
import CineVenueLogo from "./CineVenueLogo";
import apiClient from "../services/apiClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (email: string) => void;
  initialMode?: "signin" | "signup";
  registeredUsers?: any;
  onRegisterUser?: any;
  superAdminEmail?: any;
  superAdminPassword?: any;
  theatreAdmins?: any;
  eventOrganizers?: any;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  React.useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode, isOpen]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

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
    } else {
      if (!form.email.trim() && !form.mobile.trim()) {
        setErrorMessage("Email or mobile number is required.");
        return;
      }
      if (!form.password) {
        setErrorMessage("Password is required.");
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === "signup") {
        await apiClient.post("/auth/register", {
          name: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          mobile: form.mobile.trim(),
          password: form.password,
        });
        setSuccessMessage("Your account has been created. Please verify your email address to continue.");
        setMode("signin");
        setForm(prev => ({ ...prev, password: "", confirmPassword: "" }));
      } else {
        const identifier = form.email.trim() || form.mobile.trim();
        const response = await apiClient.post("/auth/login", { identifier, password: form.password });
        const emailAddress = response.data?.data?.user?.email || form.email.trim().toLowerCase() || form.mobile.trim();
        setSuccessMessage("Authentication successful.");
        onAuthSuccess(emailAddress);
        onClose();
      }
    } catch (err: any) {
      let message = err.response?.data?.error?.message || err.response?.data?.message || err.message;
      if (!message || message.includes("500") || message.includes("Network Error")) {
        message = "A temporary server connection issue occurred. Please check your network and try again.";
      }
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = "/api/v1/auth/google";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 md:p-6">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0B0B0D] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <CineVenueLogo size="sm" />
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-gold/50 hover:text-gold"
            aria-label="Close auth modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-6">
          <div className="mb-5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/80">CineVenue</p>
            <h2 className="mt-2 text-2xl font-black text-white">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h2>
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
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-white/40" />
                <input
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold/60"
                  placeholder="Full Name"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-white/40" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold/60"
                placeholder={mode === "signup" ? "Email Address" : "Email or Mobile Number"}
              />
            </div>

            {mode === "signup" && (
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-white/40" />
                <input
                  value={form.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold/60"
                  placeholder="Mobile Number"
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-white/40" />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold/60"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-3.5 text-[10px] uppercase tracking-wide text-white/60 hover:text-gold"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {mode === "signup" && (
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold/60"
                  placeholder="Confirm Password"
                />
              </div>
            )}

            {mode === "signin" && (
              <div className="flex items-center justify-between text-xs text-white/60">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="accent-gold" />
                  Remember me
                </label>
                <button type="button" className="text-gold hover:text-gold-light">Forgot Password?</button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:bg-gold-light disabled:opacity-60"
            >
              {isLoading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/45">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-gold/50 hover:bg-white/10"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-black text-[10px] font-black">G</span>
              Continue with Google
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-white/60">
            {mode === "signin" ? "Need an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-semibold text-gold transition hover:text-gold-light"
            >
              {mode === "signin" ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
