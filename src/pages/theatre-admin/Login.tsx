import React, { useState } from "react";
import { Film, Shield, Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import CineVenueLogo from "../../components/CineVenueLogo";

interface LoginProps {
  onLoginSuccess: (email: string) => void;
  theatreAdmins: any[];
}

export default function Login({ onLoginSuccess, theatreAdmins }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const superAdminEmail = (import.meta as any).env?.VITE_SUPER_ADMIN_EMAIL || "";
      const superAdminPassword = (import.meta as any).env?.VITE_SUPER_ADMIN_PASSWORD || "";

      const admin = theatreAdmins.find(
        (a) => a.email.toLowerCase() === email.toLowerCase()
      );

      const isSuperAdmin = superAdminEmail && email.toLowerCase() === superAdminEmail.toLowerCase() && password === superAdminPassword;
      const isTheatreAdmin = admin && password === admin.passwordHash;

      if (isSuperAdmin || isTheatreAdmin) {
        onLoginSuccess(email);
      } else {
        setError("Invalid credentials. Please check your email and password.");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6 text-left select-none relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#121215] border border-white/5 rounded-2xl p-8 space-y-6 shadow-2xl relative z-10">
        <div className="text-center space-y-2">
          <CineVenueLogo size="lg" subText="Partner Portal" />
          <p className="text-xs text-text-secondary pt-1">
            Authorized Theatre & Venue Operators Log In Below
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] font-bold text-gold uppercase tracking-wider flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Encrypted Admin Gateway:
          </div>
          <div className="text-[11px] text-text-secondary leading-tight">
            Please enter your authorized administrator email address and security password to access the venue management console.
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Partner Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                required
                className="w-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 focus:border-gold rounded-xl py-3 pl-10 pr-4 text-xs text-text-primary focus:outline-none transition-all placeholder:text-text-muted"
                placeholder="operator@theatre.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Portal Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="password"
                required
                className="w-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 focus:border-gold rounded-xl py-3 pl-10 pr-4 text-xs text-text-primary focus:outline-none transition-all placeholder:text-text-muted"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-gold rounded" />
              <span>Remember Device</span>
            </label>
            <a href="#" className="hover:text-gold transition-colors">
              Reset Key?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-light text-black py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest mt-2 cursor-pointer transition-colors shadow-lg shadow-gold/10 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-white/5 pt-4 text-center">
          <p className="text-[10px] text-text-muted flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Secured with standard 256-bit SSL credentials.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
