import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Mail, ArrowRight, UserCheck, KeyRound, AlertCircle, HelpCircle, X } from "lucide-react";
import CineVenueLogo from "../components/CineVenueLogo";
import ThemeToggle from "../components/ThemeToggle";
import { employeeService } from "../services/employeeService";

export default function AdminLogin() {
  const [loginMode, setLoginMode] = useState<"admin" | "employee">("employee");
  const [identifier, setIdentifier] = useState(""); // Username or Email
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanInput = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    try {
      if (loginMode === "employee") {
        // Employee Login Flow
        const res = await employeeService.loginEmployee(cleanInput, cleanPass);
        if (res.success && res.employee) {
          navigate("/?admin=true");
          return;
        } else {
          setError(res.message || "Invalid employee credentials. Please check your username and password.");
        }
      } else {
        // Master Super Admin / Theatre Admin Flow
        const saEmail = (localStorage.getItem("cine_sa_email") || "superadmin@cinevenue.com").toLowerCase().trim();
        const saPass = localStorage.getItem("cine_sa_pass") || "Amarnath123";

        if (cleanInput === saEmail && cleanPass === saPass) {
          // Clear employee session so Super Admin gets uninhibited universal access
          localStorage.removeItem("cine_current_employee");
          localStorage.setItem("cine_user_email", cleanInput);
          localStorage.setItem("adminToken", "cinevenue-superadmin-session-token");
          navigate("/?admin=true");
          return;
        }

        // Check theatre admin accounts
        const savedTheatreAdmins = JSON.parse(localStorage.getItem("cine_theatre_admins") || "[]");
        const matchedAdm = savedTheatreAdmins.find(
          (a: any) => a.email.toLowerCase() === cleanInput && a.passwordHash === cleanPass
        );

        if (matchedAdm) {
          localStorage.removeItem("cine_current_employee");
          localStorage.setItem("cine_user_email", cleanInput);
          localStorage.setItem("adminToken", `cinevenue-theatre-token-${matchedAdm.id}`);
          navigate(`/theatre-admin?theatreId=${matchedAdm.theatreId}`);
          return;
        }

        // Try employee login as fallback if user typed here
        const empRes = await employeeService.loginEmployee(cleanInput, cleanPass);
        if (empRes.success && empRes.employee) {
          navigate("/?admin=true");
          return;
        }

        setError("Invalid credentials. Please verify your email/username and security password.");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6 text-left select-none relative overflow-hidden">
      {/* Theme Toggle Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle variant="segmented" />
      </div>

      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#121215] border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl relative z-10">
        <div className="text-center space-y-2">
          <CineVenueLogo size="lg" subText="Central Control System" />
          <p className="text-xs text-text-secondary pt-1">
            Central Management Gateway for CineVenue Holding Operations
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-white/[0.03] border border-white/10 rounded-xl text-xs font-bold font-mono">
          <button
            type="button"
            onClick={() => {
              setLoginMode("employee");
              setError("");
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMode === "employee"
                ? "bg-gold text-black shadow-md"
                : "text-text-secondary hover:text-white"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Employee Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode("admin");
              setError("");
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMode === "admin"
                ? "bg-gold text-black shadow-md"
                : "text-text-secondary hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Super Admin</span>
          </button>
        </div>

        {/* Security Info */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-gold" />
            <span>{loginMode === "employee" ? "Employee Access Portal" : "Master Security Gateway"}</span>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            {loginMode === "employee"
              ? "Sign in with your official CineVenue employee username or email. Your access is scoped to authorized operational modules."
              : "Authorized administrators only. Enter root credentials to unlock full platform controls."}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              {loginMode === "employee" ? "Employee Username or Official Email" : "Administrator Email"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={loginMode === "employee" ? "username or user@cinevenue.com" : "admin@cinevenue.com"}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                Security Password
              </label>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-[10px] font-mono text-gold hover:text-gold-light cursor-pointer hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gold hover:bg-gold-light disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold/15 mt-2"
          >
            <span>{loading ? "Authenticating..." : loginMode === "employee" ? "Sign In as Employee" : "Unlock Admin Panel"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => navigate("/")}
            className="text-[11px] text-text-muted hover:text-gold transition-colors font-mono cursor-pointer bg-transparent border-none"
          >
            ← Return to Main Website
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FORGOT PASSWORD MODAL */}
      {/* ======================================================== */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Forgot Password?
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    CineVenue Employee Password Recovery
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-2 text-xs text-text-secondary leading-relaxed font-sans">
              <p className="font-semibold text-white">
                Zero-Trust Password Security Policy:
              </p>
              <p>
                For security reasons, employee passwords are cryptographically hashed and can never be retrieved or emailed in plaintext.
              </p>
              <p>
                To reset your password or obtain a one-time temporary security key, please contact the <strong className="text-gold">CineVenue Super Admin</strong> or your department administrator.
              </p>
            </div>

            <div className="p-3 bg-gold/10 border border-gold/20 rounded-xl text-[11px] text-gold font-mono flex items-center gap-2">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Contact: superadmin@cinevenue.com</span>
            </div>

            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
