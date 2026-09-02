import React, { useState } from "react";
import { Layers, Plus, Edit2, Trash2, Sliders, Play, Sparkles } from "lucide-react";
import AddScreen from "./AddScreen";

export interface ProjectionScreen {
  id: string;
  name: string;
  type: "IMAX" | "Dolby Atmos" | "Standard 2D/3D" | "Luxe Recliner";
  rows: string[];
  seatsPerRow: number;
  totalCapacity: number;
}

interface ScreensProps {
  theatreId: number;
}

export default function Screens({ theatreId }: ScreensProps) {
  const [screens, setScreens] = useState<ProjectionScreen[]>(() => {
    const cached = localStorage.getItem(`cine_screens_${theatreId}`);
    if (cached) return JSON.parse(cached);
    return [
      { id: "scr-1", name: "Screen 1 Atmos", type: "Dolby Atmos", rows: ["A", "B", "C", "D", "E", "F", "G"], seatsPerRow: 12, totalCapacity: 84 },
      { id: "scr-2", name: "Screen 2 Gold Luxe", type: "Luxe Recliner", rows: ["A", "B", "C", "D"], seatsPerRow: 8, totalCapacity: 32 },
      { id: "scr-3", name: "IMAX Elite Laser", type: "IMAX", rows: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], seatsPerRow: 15, totalCapacity: 150 }
    ];
  });

  const [isAdding, setIsAdding] = useState(false);

  const handleSaveScreen = (newScreen: ProjectionScreen) => {
    const updated = [...screens, newScreen];
    setScreens(updated);
    localStorage.setItem(`cine_screens_${theatreId}`, JSON.stringify(updated));
    setIsAdding(false);
  };

  const handleDeleteScreen = (id: string) => {
    if (window.confirm("Are you sure you want to retire this screen? This will de-publish linked shows.")) {
      const updated = screens.filter((s) => s.id !== id);
      setScreens(updated);
      localStorage.setItem(`cine_screens_${theatreId}`, JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6 text-left select-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-text-primary tracking-wide">
            Physical Projection Screens
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Configure layout matrixes, digital audio processors, and screen allocations
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border-0 shadow-lg shadow-gold/10"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Screening Hall</span>
          </button>
        )}
      </div>

      {isAdding ? (
        <AddScreen
          onSave={handleSaveScreen}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {screens.map((scr) => (
            <div
              key={scr.id}
              className="bg-[#121215] border border-white/5 hover:border-gold/20 rounded-2xl p-6 space-y-4 shadow-xl transition-all relative group overflow-hidden"
            >
              {/* Feature highlight */}
              <div className="absolute top-0 right-0 px-3.5 py-1 rounded-bl-xl bg-gold/10 border-l border-b border-gold/10 text-gold text-[9px] font-bold font-mono uppercase tracking-wider">
                {scr.type}
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-text-muted font-mono font-bold uppercase tracking-wider block">
                  Hall ID: #{scr.id}
                </span>
                <h3 className="text-base font-bold text-text-primary group-hover:text-gold transition-colors">
                  {scr.name}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-y border-white/5 text-xs">
                <div>
                  <span className="text-[10px] text-text-secondary uppercase tracking-wider block">Rows Matrix</span>
                  <span className="font-mono text-text-primary font-bold">{scr.rows[0]} to {scr.rows[scr.rows.length - 1]} ({scr.rows.length} rows)</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary uppercase tracking-wider block">Hall Capacity</span>
                  <span className="font-mono text-gold font-bold">{scr.totalCapacity} seats</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-1.5 text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                  <span>Seats per Row:</span>
                  <span className="text-text-primary font-mono">{scr.seatsPerRow}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteScreen(scr.id)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-black text-red-400 border border-red-500/10 cursor-pointer transition-all"
                    title="Retire Screening Hall"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
