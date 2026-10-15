import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Coins, Sparkles, ArrowLeft, ShieldCheck, Trophy, 
  Flame, Gift, RotateCw, CheckCircle2, Bell, Clock, 
  Star, ChevronRight, Zap
} from "lucide-react";
import CineVenueLogo from "../CineVenueLogo";

export default function CineCoinsComingSoon() {
  const navigate = useNavigate();
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [userEmailInput, setUserEmailInput] = useState("");

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (userEmailInput.trim()) {
      setEmailSubscribed(true);
      setTimeout(() => setEmailSubscribed(false), 5000);
      setUserEmailInput("");
    }
  };

  const previewPerks = [
    {
      icon: Gift,
      title: "Universal Cinema Cashback",
      desc: "Earn 1 CineCoin for every ₹1 spent across movie tickets, snack combos, and event passes.",
      badge: "1 CC = ₹1",
    },
    {
      icon: RotateCw,
      title: "Daily Check-Ins & Spin Wheel",
      desc: "Spin daily for free ticket upgrades, merchandise vouchers, and surprise bonus coin drops.",
      badge: "Daily Rewards",
    },
    {
      icon: Trophy,
      title: "VIP Tiers & Exclusive Redemptions",
      desc: "Unlock Gold & Platinum privileges with reserved premier lounge access and priority entry.",
      badge: "Loyalty Tiers",
    },
    {
      icon: Zap,
      title: "Instant Checkout Discounts",
      desc: "Seamlessly pay for up to 20% of your movie and concert tickets directly using your CineCoins balance.",
      badge: "Instant Save",
    },
  ];

  return (
    <div className="min-h-screen bg-[#08080A] text-white flex flex-col relative overflow-hidden font-sans selection:bg-gold/30 selection:text-gold">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-amber-500/15 via-gold/5 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-10 -left-20 w-96 h-96 bg-amber-600/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-yellow-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Header */}
      <header className="relative z-20 w-full border-b border-white/10 bg-[#0A0A0C]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-gold/40 text-xs font-semibold text-white/80 hover:text-gold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <CineVenueLogo size="md" onClick={() => navigate("/")} />
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase font-mono bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              DECEMBER 2026 LAUNCH
            </span>
          </div>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 md:py-20 relative z-10 max-w-5xl mx-auto text-center">
        {/* Glowing Coin Emblem */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/30 via-gold/40 to-yellow-300/30 blur-2xl animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-b from-[#1E1A12] to-[#12110D] border-2 border-gold/40 shadow-2xl shadow-gold/20 flex items-center justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-gold/30 border border-gold/50 flex items-center justify-center">
              <Coins className="w-10 h-10 sm:w-12 sm:h-12 text-gold animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            {/* Sparkle highlights */}
            <Sparkles className="w-5 h-5 text-amber-300 absolute -top-2 -right-2 animate-pulse" />
            <Star className="w-4 h-4 text-amber-400 absolute -bottom-1 -left-1 opacity-80" />
          </div>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-gold/30 shadow-inner mb-5">
          <Clock className="w-3.5 h-3.5 text-gold" />
          <span className="text-xs font-bold uppercase tracking-widest text-gold font-mono">
            Upcoming Loyalty Ecosystem
          </span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight text-white max-w-4xl leading-[1.15] mb-5">
          CineCoins Rewards & Wallet —{" "}
          <span className="bg-gradient-to-r from-amber-300 via-gold to-yellow-500 bg-clip-text text-transparent">
            Launching Soon
          </span>
        </h1>

        {/* Subtitle / Description */}
        <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-2xl leading-relaxed mb-9">
          Our gamified loyalty rewards, daily check-ins, spin-to-win, and exclusive entertainment perks are currently being finalized for our upcoming launch. Stay tuned!
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-14">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-gold via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-gold text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-gold/25 hover:shadow-gold/40 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer border-none"
          >
            <span>Return to Home</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => navigate("/#movies")}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-gold/40 text-white font-bold text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Browse Now Showing</span>
          </button>
        </div>

        {/* Teaser Feature Cards Grid */}
        <div className="w-full text-left">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase tracking-widest font-bold text-white/50 font-mono">
              Coming in Phase 1 (December 2026)
            </h2>
            <span className="text-[11px] text-gold/80 font-mono">4 Exclusive Features</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {previewPerks.map((perk, idx) => {
              const Icon = perk.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#111115]/90 border border-white/10 hover:border-gold/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-gold/5 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-white/70">
                        {perk.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-gold transition-colors">
                      {perk.title}
                    </h3>

                    <p className="text-xs text-white/55 leading-relaxed">
                      {perk.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-amber-400 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Launching December</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Early Access Notification Form */}
        <div className="mt-12 w-full max-w-md bg-[#111115]/80 border border-white/10 rounded-2xl p-5 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-2 text-xs font-bold text-gold uppercase tracking-wider font-mono">
            <Bell className="w-3.5 h-3.5" />
            <span>Launch Notification</span>
          </div>
          <p className="text-xs text-white/60 mb-3">
            Enter your email to receive first-access invites and a 100 CineCoins welcome bonus when we go live.
          </p>

          {emailSubscribed ? (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>You're on the priority notification list!</span>
            </div>
          ) : (
            <form onSubmit={handleNotifyMe} className="flex gap-2">
              <input
                type="email"
                required
                value={userEmailInput}
                onChange={(e) => setUserEmailInput(e.target.value)}
                placeholder="your.email@example.com"
                className="flex-1 bg-white/[0.04] border border-white/15 focus:border-gold rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
              >
                Notify Me
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer Note */}
      <footer className="relative z-10 w-full border-t border-white/5 py-4 text-center text-xs text-white/40">
        <p>© 2026 CineVenue Holdings Ltd. • CineCoins Loyalty Program (December Edition)</p>
      </footer>
    </div>
  );
}
