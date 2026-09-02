import React, { useState } from "react";
import { Sliders, CheckCircle, ShieldAlert, Sparkles, HelpCircle, Save } from "lucide-react";
import { Theatre } from "../../types";

interface SeatLayoutProps {
  theatre: Theatre;
  onUpdateTheatre: (t: Theatre) => void;
}

export default function SeatLayout({ theatre, onUpdateTheatre }: SeatLayoutProps) {
  // Preset defaults or existing configs
  const rows = theatre.seatRows || ["A", "B", "C", "D", "E", "F"];
  const seatsPerRow = theatre.seatsPerRow || 10;
  const [premiumRows, setPremiumRows] = useState<string[]>(theatre.premiumRows || ["A", "B"]);
  const [blockedSeats, setBlockedSeats] = useState<string[]>(theatre.blockedSeats || ["A1", "C5"]);
  const [wheelchairSeats, setWheelchairSeats] = useState<string[]>(theatre.wheelchairSeats || ["F1", "F10"]);
  const [premiumMultiplier, setPremiumMultiplier] = useState(theatre.premiumMultiplier || 1.5);
  const [success, setSuccess] = useState(false);

  const handleTogglePremiumRow = (row: string) => {
    if (premiumRows.includes(row)) {
      setPremiumRows(premiumRows.filter((r) => r !== row));
    } else {
      setPremiumRows([...premiumRows, row]);
    }
  };

  const handleSeatClick = (seatCode: string) => {
    // Toggle seat state: Normal -> Blocked -> Wheelchair -> Normal
    if (blockedSeats.includes(seatCode)) {
      setBlockedSeats(blockedSeats.filter((s) => s !== seatCode));
      setWheelchairSeats([...wheelchairSeats, seatCode]);
    } else if (wheelchairSeats.includes(seatCode)) {
      setWheelchairSeats(wheelchairSeats.filter((s) => s !== seatCode));
    } else {
      setBlockedSeats([...blockedSeats, seatCode]);
    }
  };

  const handleSaveLayout = () => {
    onUpdateTheatre({
      ...theatre,
      seatRows: rows,
      seatsPerRow,
      premiumRows,
      blockedSeats,
      wheelchairSeats,
      premiumMultiplier
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 text-left select-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-text-primary tracking-wide">
            Seat Layout & Map Pricing Engine
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Click seats to cycle status, toggle premium VIP rows, and calibrate price multipliers
          </p>
        </div>
        <button
          onClick={handleSaveLayout}
          className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border-0 shadow-lg shadow-gold/10"
        >
          <Save className="w-4 h-4" />
          <span>Save Grid Allocations</span>
        </button>
      </div>

      {success && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Seating configuration compiled and published!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Seating Simulator Grid */}
        <div className="lg:col-span-2 bg-[#121215] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center space-y-6 shadow-xl relative overflow-hidden">
          {/* SCREEN */}
          <div className="w-4/5 mx-auto text-center space-y-1.5">
            <div className="h-1.5 w-full bg-gradient-to-b from-gold to-transparent rounded-full shadow-[0_4px_20px_rgba(212,175,55,0.4)]" />
            <span className="text-[9px] font-bold tracking-[0.25em] text-gold/60 uppercase">PROJECTION SCREEN</span>
          </div>

          {/* CHAIR GRID */}
          <div className="space-y-2.5 pt-4 w-full overflow-x-auto py-2">
            {rows.map((row) => {
              const isPremium = premiumRows.includes(row);
              return (
                <div key={row} className="flex items-center justify-center gap-2 min-w-[360px]">
                  {/* Row Label */}
                  <span className="w-5 text-right font-mono text-xs text-text-secondary font-bold mr-2">
                    {row}
                  </span>

                  {/* Seat Row Loop */}
                  {Array.from({ length: seatsPerRow }, (_, idx) => {
                    const seatNum = idx + 1;
                    const seatCode = `${row}${seatNum}`;
                    const isBlocked = blockedSeats.includes(seatCode);
                    const isWheelchair = wheelchairSeats.includes(seatCode);

                    let bgClass = "bg-white/[0.04] border-white/10 hover:border-gold text-text-secondary";
                    if (isPremium) bgClass = "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:border-amber-400";
                    if (isBlocked) bgClass = "bg-red-500/20 border-red-500/30 text-red-400 cursor-not-allowed";
                    if (isWheelchair) bgClass = "bg-indigo-500/20 border-indigo-500/30 text-indigo-400";

                    return (
                      <button
                        type="button"
                        key={seatCode}
                        onClick={() => handleSeatClick(seatCode)}
                        className={`w-7 h-7 rounded border text-[9px] font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${bgClass}`}
                        title={`Click to cycle: ${seatCode}`}
                      >
                        {isWheelchair ? "♿" : isBlocked ? "✕" : seatNum}
                      </button>
                    );
                  })}

                  <span className="w-5 text-left font-mono text-xs text-text-secondary font-bold ml-2">
                    {row}
                  </span>
                </div>
              );
            })}
          </div>

          {/* LEGEND */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] uppercase font-bold text-text-secondary border-t border-white/5 pt-4 w-full justify-center font-sans">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-white/[0.04] border border-white/10" />
              <span>Standard (Base Price)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-500/10 border border-amber-500/30" />
              <span>Premium Row (VIP Premium)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[8px]">♿</span>
              <span>Wheelchair Access</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-red-500/20 border border-red-500/30 flex items-center justify-center text-[7px]">✕</span>
              <span>Maintenance (Blocked)</span>
            </div>
          </div>
        </div>

        {/* Configurations Side Panel */}
        <div className="space-y-6">
          <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-white/5 pb-3">
              VIP Premium Calibration
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
                  VIP Row Price Multiplier
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1.1"
                    max="2.5"
                    step="0.1"
                    className="flex-1 accent-gold"
                    value={premiumMultiplier}
                    onChange={(e) => setPremiumMultiplier(Number(e.target.value))}
                  />
                  <span className="font-mono text-gold font-bold text-sm shrink-0 w-12 text-right">
                    {premiumMultiplier}x
                  </span>
                </div>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  Applies multiplier pricing automatically on checkout whenever seats inside designated VIP Rows are purchased.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px] block">
                  Select VIP Rows
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {rows.map((row) => {
                    const active = premiumRows.includes(row);
                    return (
                      <button
                        type="button"
                        key={row}
                        onClick={() => handleTogglePremiumRow(row)}
                        className={`w-9 h-9 rounded-xl border font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                          active
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                            : "bg-white/5 border-white/10 text-text-secondary hover:border-white/20"
                        }`}
                      >
                        {row}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 space-y-3 shadow-xl text-xs">
            <h4 className="font-bold uppercase tracking-wider text-text-primary text-[10px] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-gold" />
              <span>Interactive Quick-Cycle Guide</span>
            </h4>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Simply click any chair inside the seating simulator on the left to cycle its block status:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-text-secondary text-[11px]">
              <li><strong className="text-text-primary">First Click:</strong> Blocks the seat for booking (Maintenance/Blocked).</li>
              <li><strong className="text-text-primary">Second Click:</strong> Converts the seat into wheelchair-accessible spot.</li>
              <li><strong className="text-text-primary">Third Click:</strong> Resets back to operational seat.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
