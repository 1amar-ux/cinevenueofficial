import React, { useState } from "react";
import { CalendarRange, Plus, Trash2, Film, Clock, Landmark, Sparkles, Check } from "lucide-react";
import { Movie, MovieSchedule } from "../../types";
import AddShow from "./AddShow";

interface ShowsProps {
  theatreName: string;
  schedules: MovieSchedule[];
  movies: Movie[];
  onScheduleShow: (newSchedule: MovieSchedule) => void;
  onDeleteSchedule: (id: string) => void;
}

export default function Shows({
  theatreName,
  schedules,
  movies,
  onScheduleShow,
  onDeleteSchedule
}: ShowsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const activeSchedules = schedules.filter((sch) => sch.theatreName === theatreName);

  const handleAddSubmit = (newSch: MovieSchedule) => {
    onScheduleShow(newSch);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 text-left select-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-text-primary tracking-wide">
            Movie Shows & Schedules
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Plan timeslots, screens, and pricing matrixes for current cinema films
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border-0 shadow-lg shadow-gold/10"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Show Schedule</span>
          </button>
        )}
      </div>

      {isAdding ? (
        <AddShow
          theatreName={theatreName}
          movies={movies}
          onSave={handleAddSubmit}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <div className="bg-[#121215] border border-white/5 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-white/5 pb-3 flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-gold" />
            <span>Published Screen Showtimes ({activeSchedules.length})</span>
          </h3>

          {activeSchedules.length === 0 ? (
            <div className="text-center py-16 text-text-muted space-y-3">
              <Film className="w-12 h-12 mx-auto opacity-10" />
              <p className="text-xs">No movie shows are scheduled today for this theatre.</p>
              <p className="text-[10px] text-text-muted">Click "Create Show Schedule" above to publish one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-text-secondary border-b border-white/5">
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Show ID</th>
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Movie Film Title</th>
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Timing Slot</th>
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Standard Ticket Cost</th>
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Booking Window</th>
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px] text-right">Delete Show</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeSchedules.map((sch) => (
                    <tr key={sch.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 font-mono font-semibold text-text-muted">{sch.id}</td>
                      <td className="py-4 font-bold text-text-primary flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                        {sch.movieTitle}
                      </td>
                      <td className="py-4 font-mono text-text-secondary">{sch.timeSlot}</td>
                      <td className="py-4 font-mono text-gold font-bold">₹{sch.pricePerSeat}</td>
                      <td className="py-4 font-sans text-text-secondary">{sch.bookingWindow || "Starts 48h before"}</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Confirm deletion of ${sch.movieTitle} show at ${sch.timeSlot}?`)) {
                              onDeleteSchedule(sch.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-black text-red-400 border border-red-500/10 cursor-pointer transition-colors"
                          title="Delete show schedule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
