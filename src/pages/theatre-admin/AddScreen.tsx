import React, { useState } from "react";
import { Sparkles, Save, X, Info } from "lucide-react";
import { ProjectionScreen } from "./Screens";

interface AddScreenProps {
  onSave: (screen: ProjectionScreen) => void;
  onCancel: () => void;
}

export default function AddScreen({ onSave, onCancel }: AddScreenProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"IMAX" | "Dolby Atmos" | "Standard 2D/3D" | "Luxe Recliner">("Dolby Atmos");
  const [rowCount, setRowCount] = useState(8);
  const [seatsPerRow, setSeatsPerRow] = useState(12);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Generate row letters (A, B, C...)
    const rowLetters = Array.from({ length: rowCount }, (_, i) =>
      String.fromCharCode(65 + i)
    );

    const newScreen: ProjectionScreen = {
      id: "scr-" + Math.floor(100 + Math.random() * 900),
      name,
      type,
      rows: rowLetters,
      seatsPerRow,
      totalCapacity: rowCount * seatsPerRow
    };

    onSave(newScreen);
  };

  return (
    <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl text-left max-w-xl">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-base font-bold text-text-primary tracking-wide">
            Provision New Screening Hall
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Construct the row layout and projection standard for live seating maps
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary cursor-pointer border-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
            Screen Branding Name
          </label>
          <input
            type="text"
            required
            className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none transition-all"
            placeholder="e.g. Screen 4 MaxLuxe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
              Technology Preset
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3 py-2.5 rounded-xl text-text-primary focus:outline-none cursor-pointer"
            >
              <option value="Dolby Atmos" className="bg-[#0A0A0B]">Dolby Atmos</option>
              <option value="IMAX" className="bg-[#0A0A0B]">IMAX Elite</option>
              <option value="Luxe Recliner" className="bg-[#0A0A0B]">Luxe Recliner</option>
              <option value="Standard 2D/3D" className="bg-[#0A0A0B]">Standard 2D/3D</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
              Total Rows Count
            </label>
            <input
              type="number"
              min="2"
              max="15"
              required
              className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2 rounded-xl text-text-primary focus:border-gold focus:outline-none"
              value={rowCount}
              onChange={(e) => setRowCount(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
              Seats Per Row
            </label>
            <input
              type="number"
              min="4"
              max="24"
              required
              className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2 rounded-xl text-text-primary focus:border-gold focus:outline-none"
              value={seatsPerRow}
              onChange={(e) => setSeatsPerRow(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Dynamic Recalculator Info */}
        <div className="p-3.5 bg-gold/5 border border-gold/10 rounded-xl flex gap-2.5 items-start">
          <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-[10px] uppercase text-gold">Matrix Grid Estimate</p>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              This layout configuration creates a grid of <span className="font-mono text-text-primary font-bold">{rowCount} rows</span> (A to {String.fromCharCode(64 + rowCount)}) with <span className="font-mono text-text-primary font-bold">{seatsPerRow} seats</span> each, resulting in a total capacity of <span className="font-mono text-gold font-bold">{rowCount * seatsPerRow} seats</span>.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-text-secondary rounded-xl font-bold uppercase tracking-wider transition-colors cursor-pointer border-0"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border-0 shadow-lg shadow-gold/10"
          >
            <Save className="w-4 h-4" />
            <span>Generate Screen Layout</span>
          </button>
        </div>
      </form>
    </div>
  );
}
