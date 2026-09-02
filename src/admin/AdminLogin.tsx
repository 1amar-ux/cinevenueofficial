import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Mail, ArrowRight } from "lucide-react";
import CineVenueLogo from "../components/CineVenueLogo";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const saEmail = localStorage.getItem("cine_sa_email") || "superadmin@cinevenue.com";
    const saPass = localStorage.getItem("cine_sa_pass") || "Amarnath123";

    if (
      email.toLowerCase().trim() === saEmail.toLowerCase().trim() &&
      password.trim() === saPass.trim()
    ) {
      localStorage.setItem("cine_user_email", email.trim());
      localStorage.setItem("adminToken", "cinevenue-superadmin-session-token");
      navigate("/?admin=true");
    } else {
      // Check theatre admin accounts
      const savedTheatreAdmins = JSON.parse(localStorage.getItem("cine_theatre_admins") || "[]");
      const matchedAdm = savedTheatreAdmins.find(
        (a: any) => a.email.toLowerCase() === email.toLowerCase().trim() && a.passwordHash === password.trim()
      );

      if (matchedAdm) {
        localStorage.setItem("cine_user_email", email.trim());
        localStorage.setItem("adminToken", `cinevenue-theatre-token-${matchedAdm.id}`);
        navigate(`/theatre-admin?theatreId=${matchedAdm.theatreId}`);
      } else {
        setError("Invalid administrator email or password. Please verify credentials.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6 text-left select-none relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#121215] border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl relative z-10">
        <div className="text-center space-y-2">
          <CineVenueLogo size="lg" subText="Central Control System" />
          <p className="text-xs text-text-secondary pt-1">
            Standalone Admin Gateway for CineVenue Holding Operations
          </p>
        </div>

        {/* Security Info */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-gold" /> Secure Authentication Portal
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Authorized personnel only. Enter master administrator credentials to access the system.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cinevenue.com"
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Security Key / Password
            </label>
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
            className="w-full py-3 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold/15 mt-2"
          >
            <span>Unlock Admin Panel</span>
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
    </div>
  );
}
