import React, { useState, useEffect } from "react";
import { Clock, Clapperboard, X, ArrowLeft } from "lucide-react";
import CineVenueLogo from "./CineVenueLogo";

interface MaintenancePageProps {
  serviceName: string; // e.g. "Movie Booking", "Event Booking", "Film Production", "Event Management", "Brand Promotion"
  title?: string;
  message?: string;
  expectedTime?: string;
  icon?: string;
  onBackToHome?: () => void;
  isOverlayModal?: boolean;
}

export default function MaintenancePage({
  serviceName,
  title,
  message,
  expectedTime = "30 July 2026 06:00 PM",
  onBackToHome,
  isOverlayModal = false
}: MaintenancePageProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const parseExpectedDate = (str: string) => {
      try {
        let cleanStr = str.replace(/,/g, "");
        const d = new Date(cleanStr);
        if (!isNaN(d.getTime())) return d;
      } catch (e) {
        // fallback
      }
      return new Date("2026-07-30T18:00:00");
    };

    const targetDate = parseExpectedDate(expectedTime);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const totalHours = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours: totalHours, minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expectedTime]);

  const subNameClean = serviceName
    .replace(" Sub-Website", "")
    .replace(" Elite", "")
    .replace(" Sub-site", "")
    .toUpperCase();

  const formattedTitle = title || `${serviceName.replace(" Sub-Website", "")} Temporarily Unavailable`;
  const formattedMessage = message || "We are upgrading our booking system to provide a faster and smoother experience. Please visit again shortly.";

  return (
    <div className={`min-h-screen bg-[#070709] text-white flex items-center justify-center p-4 selection:bg-[#D4AF37] selection:text-black relative overflow-hidden ${isOverlayModal ? "fixed inset-0 z-50 bg-black/90 backdrop-blur-md" : ""}`}>
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Maintenance Card exact replica of Image 2 */}
      <div className="bg-[#0D0E12] border border-white/10 rounded-2xl p-8 md:p-10 max-w-lg w-full text-center space-y-6 shadow-2xl relative z-10 my-auto">
        
        {/* Top-right close button */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer border-none"
            title="Close / Return to Platform"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Film Reel / Theatre Icon Box */}
        <div className="w-16 h-16 bg-[#181613] border border-[#D4AF37]/30 rounded-2xl flex items-center justify-center mx-auto text-[#D4AF37] shadow-lg shadow-[#D4AF37]/5">
          <Clapperboard className="w-8 h-8 text-[#D4AF37]" />
        </div>

        {/* Subwebsite Red Pill Badge */}
        <div>
          <span className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-red-300 bg-[#5C131B] border border-red-500/30 rounded-full font-mono inline-block shadow-md">
            {subNameClean}
          </span>
        </div>

        {/* Big Bold Title & Description */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
            {formattedTitle}
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed max-w-md mx-auto font-light">
            {formattedMessage}
          </p>
        </div>

        {/* Inner Completion Box */}
        <div className="bg-[#090A0C] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-center gap-2 text-[10px] font-mono font-bold text-[#D4AF37] uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>ESTIMATED COMPLETION TIME</span>
          </div>

          <div className="text-xs md:text-sm font-bold font-mono text-white tracking-wide">
            {expectedTime || "30 July 2026 06:00 PM"}
          </div>

          {/* 3 Countdown Boxes: HOURS | MINS | SECS */}
          <div className="grid grid-cols-3 gap-3 pt-1 max-w-xs mx-auto font-mono">
            <div className="bg-[#121318] border border-white/10 rounded-xl py-3 px-2 text-center">
              <span className="text-xl md:text-2xl font-bold text-[#D4AF37] block leading-none">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider block mt-1">
                HOURS
              </span>
            </div>
            <div className="bg-[#121318] border border-white/10 rounded-xl py-3 px-2 text-center">
              <span className="text-xl md:text-2xl font-bold text-[#D4AF37] block leading-none">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider block mt-1">
                MINS
              </span>
            </div>
            <div className="bg-[#121318] border border-white/10 rounded-xl py-3 px-2 text-center">
              <span className="text-xl md:text-2xl font-bold text-[#D4AF37] block leading-none">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider block mt-1">
                SECS
              </span>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        {onBackToHome && (
          <div className="pt-2">
            <button
              onClick={onBackToHome}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
              <span>Return to Platform Home</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
