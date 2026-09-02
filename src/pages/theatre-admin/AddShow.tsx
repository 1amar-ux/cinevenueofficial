import React, { useState, useEffect } from "react";
import { Sparkles, Save, X, Info, Layers, Calendar, Clock, AlertTriangle } from "lucide-react";
import { Movie, MovieSchedule } from "../../types";

interface AddShowProps {
  theatreName: string;
  movies: Movie[];
  onSave: (newSchedule: MovieSchedule) => void;
  onCancel: () => void;
}

export default function AddShow({ theatreName, movies, onSave, onCancel }: AddShowProps) {
  const [movieTitle, setMovieTitle] = useState(movies[0]?.title || "");
  const [screen, setScreen] = useState("Screen 1 (IMAX Dual Laser)");
  const [showDate, setShowDate] = useState("Today");
  const [startTime, setStartTime] = useState("07:30 PM");
  
  // Multiple Seat Category Pricing
  const [silverPrice, setSilverPrice] = useState("180");
  const [goldPrice, setGoldPrice] = useState("250");
  const [premiumPrice, setPremiumPrice] = useState("400");
  
  const [bookingWindow, setBookingWindow] = useState("Starts 48h before, Closes 1h before");
  const [blockedSeats, setBlockedSeats] = useState("A1, A8, J10, J11"); // default blocked seat examples
  
  // State for calculated times & validation warnings
  const [endTime, setEndTime] = useState("");
  const [overlapWarning, setOverlapWarning] = useState("");

  const currentMovie = movies.find(m => m.title === movieTitle);
  const movieDuration = currentMovie?.duration || "142 mins";

  // Calculate End Time automatically
  useEffect(() => {
    // Standard parser for startTime (e.g. "07:30 PM")
    try {
      const match = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const ampm = match[3].toUpperCase();
        
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;

        // Parse movie duration integer
        const durationMin = parseInt(movieDuration.replace(/\D/g, "")) || 140;
        
        // Add duration + 20 mins cleaning/intermission
        const totalMinutes = hours * 60 + minutes + durationMin + 20;
        
        const endHours24 = Math.floor(totalMinutes / 60) % 24;
        const endMins = totalMinutes % 60;
        
        const endHours12 = endHours24 % 12 || 12;
        const endAmpm = endHours24 >= 12 ? "PM" : "AM";
        
        setEndTime(`${endHours12.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")} ${endAmpm}`);
      }
    } catch (err) {
      setEndTime("Calculated automatically");
    }
  }, [startTime, movieDuration, movieTitle]);

  // Simulate overlap checks
  useEffect(() => {
    if (startTime === "07:30 PM" && screen === "Screen 1 (IMAX Dual Laser)") {
      setOverlapWarning("Warning: 'Kalki 2898 AD' is already scheduled on Screen 1 at 7:30 PM today. Ensure this does not clash.");
    } else {
      setOverlapWarning("");
    }
  }, [startTime, screen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieTitle) return;

    // Standard single seat price to represent in parent's generic schedule (Gold standard ticket price)
    const primaryPrice = Number(goldPrice);

    const newSchedule: MovieSchedule = {
      id: "SCH-" + Math.floor(1000 + Math.random() * 9000),
      movieTitle,
      theatreName,
      timeSlot: `${startTime} (${screen.split(" (")[0]})`,
      pricePerSeat: primaryPrice,
      date: showDate,
      bookingWindow,
      // Pass downstream pricing models inside custom properties
      ...({
        screen,
        silverPrice: Number(silverPrice),
        goldPrice: Number(goldPrice),
        premiumPrice: Number(premiumPrice),
        blockedSeats: blockedSeats.split(",").map(s => s.trim()).filter(Boolean),
        endTime
      } as any)
    };

    onSave(newSchedule);
  };

  return (
    <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl text-left max-w-2xl text-xs animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-sm font-bold text-text-primary tracking-wide">
            Schedule & Publish New Showing
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Assign movies to a screen timing, configure seat prices, and check screen overlaps
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary cursor-pointer border-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Movie Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-text-secondary uppercase tracking-wider text-[9px]">
            Select Roster Movie Film *
          </label>
          <select
            value={movieTitle}
            onChange={(e) => setMovieTitle(e.target.value)}
            className="bg-[#0A0A0B] border border-white/10 hover:border-white/20 px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none cursor-pointer"
          >
            {movies.map((m) => (
              <option key={m.title} value={m.title} className="bg-[#0A0A0B] text-text-primary">
                {m.title} ({m.genre} - {m.lang})
              </option>
            ))}
          </select>
        </div>

        {/* Row 2: Screen & Date selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-text-secondary uppercase tracking-wider text-[9px]">
              Screen Auditorium Assignment *
            </label>
            <select
              value={screen}
              onChange={(e) => setScreen(e.target.value)}
              className="bg-[#0A0A0B] border border-white/10 hover:border-white/20 px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none cursor-pointer"
            >
              <option value="Screen 1 (IMAX Dual Laser)" className="bg-[#0A0A0B]">Screen 1 (IMAX Dual Laser)</option>
              <option value="Screen 2 (Dolby Atmos Atmos)" className="bg-[#0A0A0B]">Screen 2 (Dolby Atmos Atmos)</option>
              <option value="Screen 3 (4DX Dynamic Motion)" className="bg-[#0A0A0B]">Screen 3 (4DX Dynamic Motion)</option>
              <option value="Screen 4 (Executive Gold Class)" className="bg-[#0A0A0B]">Screen 4 (Executive Gold Class)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-text-secondary uppercase tracking-wider text-[9px]">
              Screening Scheduled Date *
            </label>
            <select
              value={showDate}
              onChange={(e) => setShowDate(e.target.value)}
              className="bg-[#0A0A0B] border border-white/10 hover:border-white/20 px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none cursor-pointer"
            >
              <option value="Today" className="bg-[#0A0A0B]">Today (Immediate Booking)</option>
              <option value="Tomorrow" className="bg-[#0A0A0B]">Tomorrow</option>
              <option value="Day After Tomorrow" className="bg-[#0A0A0B]">Day After Tomorrow</option>
              <option value="This Weekend (Saturday)" className="bg-[#0A0A0B]">This Weekend (Saturday)</option>
            </select>
          </div>
        </div>

        {/* Row 3: Timings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-text-secondary uppercase tracking-wider text-[9px]">
              Show Start Time Slot *
            </label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-[#0A0A0B] border border-white/10 hover:border-white/20 px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none cursor-pointer font-mono"
            >
              <option value="10:30 AM" className="bg-[#0A0A0B]">10:30 AM (Morning)</option>
              <option value="01:45 PM" className="bg-[#0A0A0B]">01:45 PM (Afternoon)</option>
              <option value="04:30 PM" className="bg-[#0A0A0B]">04:30 PM (Matinee)</option>
              <option value="07:30 PM" className="bg-[#0A0A0B]">07:30 PM (Evening)</option>
              <option value="10:15 PM" className="bg-[#0A0A0B]">10:15 PM (Night)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-text-secondary uppercase tracking-wider text-[9px]">
              Movie Film Duration
            </label>
            <div className="bg-white/[0.01] border border-white/5 px-3.5 py-2.5 rounded-xl text-text-muted font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gold" />
              <span>{movieDuration}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-text-secondary uppercase tracking-wider text-[9px]">
              Auto-Calculated End Time
            </label>
            <div className="bg-gold/5 border border-gold/10 px-3.5 py-2.5 rounded-xl text-gold font-mono font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>{endTime}</span>
            </div>
          </div>
        </div>

        {/* Overlapping Prevention Alert */}
        {overlapWarning && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-2.5 items-start text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed font-semibold">
              {overlapWarning}
            </p>
          </div>
        )}

        {/* Category-Wise Pricing */}
        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-gold" />
            <span>Multi-Tier Seat Category Pricing (₹)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-text-secondary font-semibold">Silver Class Pricing</label>
              <input
                type="number"
                required
                min="50"
                max="2000"
                className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary focus:border-gold focus:outline-none font-mono"
                value={silverPrice}
                onChange={(e) => setSilverPrice(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-text-secondary font-semibold">Gold Class Pricing (Standard)</label>
              <input
                type="number"
                required
                min="50"
                max="2000"
                className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary focus:border-gold focus:outline-none font-mono"
                value={goldPrice}
                onChange={(e) => setGoldPrice(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-text-secondary font-semibold">Premium Class Recliner</label>
              <input
                type="number"
                required
                min="50"
                max="2000"
                className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary focus:border-gold focus:outline-none font-mono"
                value={premiumPrice}
                onChange={(e) => setPremiumPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Blocked seat clusters */}
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-text-secondary uppercase tracking-wider text-[9px]">
            Hold & Block Seats (Commas Separated Codes)
          </label>
          <input
            type="text"
            className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2 rounded-xl text-text-primary focus:border-gold focus:outline-none font-mono"
            placeholder="e.g. A1, A2, A7, A8, J10, J11"
            value={blockedSeats}
            onChange={(e) => setBlockedSeats(e.target.value)}
          />
          <p className="text-[9px] text-text-muted leading-relaxed">
            These seats will be flagged as "Blocked / VIP Reserved" in client ticketing portals to avoid double bookings or keep executive rows.
          </p>
        </div>

        {/* Sales window */}
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-text-secondary uppercase tracking-wider text-[9px]">
            Ticket Reservation Active Window Description
          </label>
          <input
            type="text"
            required
            className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none"
            value={bookingWindow}
            onChange={(e) => setBookingWindow(e.target.value)}
          />
        </div>

        {/* Info notice */}
        <div className="p-3.5 bg-gold/5 border border-gold/10 rounded-xl flex gap-2.5 items-start">
          <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <p className="text-[10px] text-text-secondary leading-relaxed">
            By publishing this schedule, it will immediately allocate layout templates on client channels. Ensure overlapping prevention holds are satisfied.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-text-secondary rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer border-0"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border-0 shadow-lg shadow-gold/10"
          >
            <Save className="w-4 h-4" />
            <span>Publish Showing</span>
          </button>
        </div>
      </form>
    </div>
  );
}
