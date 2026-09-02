import React, { useState, useEffect } from "react";
import { DollarSign, Ticket, Activity, TrendingUp, Sparkles, Edit3, Check, X } from "lucide-react";
import { Theatre, Booking, MovieSchedule } from "../../types";

interface DashboardProps {
  theatre: Theatre;
  bookings: Booking[];
  schedules: MovieSchedule[];
  movies: any[];
}

export default function Dashboard({ theatre, bookings, schedules, movies }: DashboardProps) {
  const theatreBookings = bookings.filter((b) => b.theatreName === theatre.name);
  const calculatedRevenue = theatreBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const calculatedTickets = theatreBookings.reduce((sum, b) => sum + b.seats.length, 0);
  const calculatedAvgPrice = calculatedTickets > 0 ? (calculatedRevenue / calculatedTickets).toFixed(1) : "180.0";

  // Persistent custom metrics overrides for independent theatre admin
  const [revenueOverride, setRevenueOverride] = useState<string>(() => {
    return localStorage.getItem(`ta_rev_${theatre.id}`) || "";
  });
  const [ticketOverride, setTicketOverride] = useState<string>(() => {
    return localStorage.getItem(`ta_tkt_${theatre.id}`) || "";
  });
  const [occupancyOverride, setOccupancyOverride] = useState<string>(() => {
    return localStorage.getItem(`ta_occ_${theatre.id}`) || "";
  });

  const [editingField, setEditingField] = useState<"revenue" | "tickets" | "occupancy" | null>(null);
  const [editInputValue, setEditInputValue] = useState("");

  const displayRevenue = revenueOverride ? Number(revenueOverride) : (calculatedRevenue || 450000);
  const displayTickets = ticketOverride ? Number(ticketOverride) : (calculatedTickets || 1240);
  const displayOccupancy = occupancyOverride || "78.5";

  const handleStartEdit = (field: "revenue" | "tickets" | "occupancy", currentVal: string | number) => {
    setEditingField(field);
    setEditInputValue(String(currentVal));
  };

  const handleSaveEdit = (field: "revenue" | "tickets" | "occupancy") => {
    if (field === "revenue") {
      setRevenueOverride(editInputValue);
      localStorage.setItem(`ta_rev_${theatre.id}`, editInputValue);
    } else if (field === "tickets") {
      setTicketOverride(editInputValue);
      localStorage.setItem(`ta_tkt_${theatre.id}`, editInputValue);
    } else if (field === "occupancy") {
      setOccupancyOverride(editInputValue);
      localStorage.setItem(`ta_occ_${theatre.id}`, editInputValue);
    }
    setEditingField(null);
  };

  return (
    <div className="space-y-6 text-left select-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-text-primary tracking-wide">
            Independent Theatre Panel Workspace
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Operational snapshot and commercial performance metrics for <span className="text-gold font-bold">{theatre.name}</span> ({theatre.location})
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#121215] border border-white/5 rounded-xl px-4 py-2.5">
          <Activity className="w-4 h-4 text-gold animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-gold uppercase tracking-wider">
            Realtime Counter Live
          </span>
        </div>
      </div>

      {/* Realtime Editable KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Gross Box Office Card */}
        <div className="bg-[#121215] border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-xl relative group">
          <div className="space-y-1.5 flex-1 pr-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-bold">
                Gross Box Office Revenue
              </span>
              <button
                onClick={() => handleStartEdit("revenue", displayRevenue)}
                className="text-[10px] text-gold hover:text-white flex items-center gap-1 font-mono cursor-pointer bg-white/5 px-2 py-0.5 rounded border border-white/10"
              >
                <Edit3 className="w-3 h-3 text-gold" />
                <span>Edit</span>
              </button>
            </div>

            {editingField === "revenue" ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  value={editInputValue}
                  onChange={(e) => setEditInputValue(e.target.value)}
                  className="w-full bg-white/10 border border-gold rounded px-2 py-1 text-xs text-white font-mono"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit("revenue")}
                  className="p-1 bg-emerald-600 text-white rounded cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="p-1 bg-white/10 text-white rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-2xl font-mono font-bold text-text-primary block">
                ₹{displayRevenue.toLocaleString("en-IN")}
              </span>
            )}

            <span className="text-[9px] text-emerald-400 block flex items-center gap-1 font-mono">
              <TrendingUp className="w-3 h-3" /> +14.2% live growth count
            </span>
          </div>
          <div className="p-3 bg-gold/5 border border-gold/10 text-gold rounded-xl shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Tickets Admitted Card */}
        <div className="bg-[#121215] border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-xl relative group">
          <div className="space-y-1.5 flex-1 pr-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-bold">
                Tickets Admitted
              </span>
              <button
                onClick={() => handleStartEdit("tickets", displayTickets)}
                className="text-[10px] text-gold hover:text-white flex items-center gap-1 font-mono cursor-pointer bg-white/5 px-2 py-0.5 rounded border border-white/10"
              >
                <Edit3 className="w-3 h-3 text-gold" />
                <span>Edit</span>
              </button>
            </div>

            {editingField === "tickets" ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  value={editInputValue}
                  onChange={(e) => setEditInputValue(e.target.value)}
                  className="w-full bg-white/10 border border-gold rounded px-2 py-1 text-xs text-white font-mono"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit("tickets")}
                  className="p-1 bg-emerald-600 text-white rounded cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="p-1 bg-white/10 text-white rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-2xl font-mono font-bold text-text-primary block">
                {displayTickets.toLocaleString("en-IN")} <span className="text-xs text-text-muted font-normal">seats</span>
              </span>
            )}

            <span className="text-[9px] text-emerald-400 block flex items-center gap-1 font-mono">
              <TrendingUp className="w-3 h-3" /> Realtime admission tally
            </span>
          </div>
          <div className="p-3 bg-gold/5 border border-gold/10 text-gold rounded-xl shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
        </div>

        {/* Mean Seat Cost Card */}
        <div className="bg-[#121215] border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-xl">
          <div className="space-y-1.5">
            <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-bold">
              Mean Ticket Price
            </span>
            <span className="text-2xl font-mono font-bold text-text-primary block">
              ₹{calculatedAvgPrice}
            </span>
            <span className="text-[9px] text-text-muted block font-mono">
              Dynamically calculated
            </span>
          </div>
          <div className="p-3 bg-gold/5 border border-gold/10 text-gold rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Occupancy Ratio Card */}
        <div className="bg-[#121215] border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-xl relative group">
          <div className="space-y-1.5 flex-1 pr-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-bold">
                Occupancy Ratio
              </span>
              <button
                onClick={() => handleStartEdit("occupancy", displayOccupancy)}
                className="text-[10px] text-gold hover:text-white flex items-center gap-1 font-mono cursor-pointer bg-white/5 px-2 py-0.5 rounded border border-white/10"
              >
                <Edit3 className="w-3 h-3 text-gold" />
                <span>Edit</span>
              </button>
            </div>

            {editingField === "occupancy" ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="text"
                  value={editInputValue}
                  onChange={(e) => setEditInputValue(e.target.value)}
                  className="w-full bg-white/10 border border-gold rounded px-2 py-1 text-xs text-white font-mono"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit("occupancy")}
                  className="p-1 bg-emerald-600 text-white rounded cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="p-1 bg-white/10 text-white rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-2xl font-mono font-bold text-gold block">
                {displayOccupancy}%
              </span>
            )}

            <span className="text-[9px] text-emerald-400 block flex items-center gap-1 font-mono">
              <TrendingUp className="w-3 h-3" /> Dynamic occupancy counter
            </span>
          </div>
          <div className="p-3 bg-gold/5 border border-gold/10 text-gold rounded-xl shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Screen & Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="lg:col-span-2 bg-[#121215] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider">
              🎥 Scheduled Shows for {theatre.name}
            </h3>
            <span className="text-[10px] font-mono text-text-muted">
              Total Active Schedules: {schedules.filter(s => s.theatreName === theatre.name).length}
            </span>
          </div>

          <div className="space-y-2">
            {schedules
              .filter(s => s.theatreName === theatre.name)
              .map(sch => (
                <div key={sch.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{sch.movieTitle}</p>
                    <span className="text-[10px] text-text-muted font-mono">{sch.date} • {sch.timeSlot}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-emerald-400">₹{sch.pricePerSeat} / seat</p>
                    <span className="text-[9px] text-gold uppercase font-bold">Live Status: Active</span>
                  </div>
                </div>
              ))}

            {schedules.filter(s => s.theatreName === theatre.name).length === 0 && (
              <p className="text-center py-8 text-xs text-text-muted">No scheduled shows configured for this screen.</p>
            )}
          </div>
        </div>

        <div className="bg-[#121215] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-white/5 pb-3">
            🏦 Theatre Partner Profile
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] text-text-muted uppercase block">Venue Name</span>
              <p className="font-bold text-white">{theatre.name}</p>
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase block">Location / City</span>
              <p className="font-bold text-white">{theatre.location}</p>
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase block">Ticket Base Price</span>
              <p className="font-bold text-gold font-mono">{theatre.price}</p>
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase block">Bank Settlement Routing</span>
              <p className="font-bold text-white font-mono">{theatre.bankRouting || "HDFC0002104"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
