import React, { useState } from "react";
import { 
  FilmProjectRequirement, 
  FilmProject, 
  FilmCraft 
} from "../../types/filmProductionMarketplace";
import { 
  Briefcase, Search, Filter, Calendar, MapPin, Sparkles, 
  Send, CheckCircle2, ChevronRight, Layers
} from "lucide-react";

interface CrewJobsViewProps {
  requirements: FilmProjectRequirement[];
  projects: FilmProject[];
  crafts: FilmCraft[];
  onApply: (project: FilmProject, req: FilmProjectRequirement) => void;
}

export default function CrewJobsView({
  requirements,
  projects,
  crafts,
  onApply
}: CrewJobsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCraft, setSelectedCraft] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const crewOpenings = requirements.filter(r => !r.isCastingCall && r.status === "Open");

  const filtered = crewOpenings.filter(r => {
    const matchSearch = searchQuery === "" ||
      r.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.skillsRequired.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCraft = selectedCraft === "all" || r.craftId === selectedCraft;
    const matchLocation = selectedLocation === "all" || 
      r.preferredLocation.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchSearch && matchCraft && matchLocation;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-1">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Technical Crew Board</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Technical & Creative Crew Openings
          </h1>
          <p className="text-white/60 text-xs md:text-sm mt-1">
            Browse job requirements for Cinematographers, Sound Designers, Editors, VFX Leads, Art Directors, Music Composers, and Technicians.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
          {filtered.length} Active Crew Openings
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#111218] border border-white/10 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search position (e.g. Associate Cinematographer, Lead Sound Designer, Colorist)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">Craft Department</label>
            <select
              value={selectedCraft}
              onChange={(e) => setSelectedCraft(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#111218] text-white">All 24 Crafts</option>
              {crafts.map(c => (
                <option key={c.id} value={c.id} className="bg-[#111218] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#111218] text-white">All Locations</option>
              <option value="Hyderabad" className="bg-[#111218] text-white">Hyderabad</option>
              <option value="Chennai" className="bg-[#111218] text-white">Chennai</option>
              <option value="Bengaluru" className="bg-[#111218] text-white">Bengaluru</option>
              <option value="Mumbai" className="bg-[#111218] text-white">Mumbai</option>
              <option value="Kochi" className="bg-[#111218] text-white">Kochi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Crew Openings */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-[#111218] border border-white/10 space-y-3">
          <Briefcase className="w-10 h-10 text-white/30 mx-auto" />
          <h3 className="text-base font-bold text-white">No crew positions match your filters</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            Try adjusting your search criteria or checking back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(req => {
            const project = projects.find(p => p.id === req.projectId);

            return (
              <div
                key={req.id}
                className="group rounded-2xl bg-[#111218]/95 border border-white/10 hover:border-amber-500/40 p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase border border-amber-500/30">
                        {req.craftName}
                      </span>
                      <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors mt-1">
                        {req.position}
                      </h3>
                      <p className="text-xs font-semibold text-white/60">
                        Film: <strong className="text-white">{req.projectTitle}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-400 block">{req.budgetRange}</span>
                      <span className="text-[10px] text-white/40">{req.duration}</span>
                    </div>
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed line-clamp-3">
                    {req.description}
                  </p>

                  {/* Skills required */}
                  <div className="flex flex-wrap gap-1.5">
                    {req.skillsRequired.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-white/5 text-white/70 text-[10px] font-medium border border-white/5">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Meta Specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px]">
                    <div>
                      <span className="text-white/40 block text-[10px]">Min Experience</span>
                      <span className="text-white font-bold">{req.minExperienceYears}+ Years</span>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[10px]">Location</span>
                      <span className="text-white font-bold">{req.preferredLocation}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-white/40 block text-[10px]">Languages</span>
                      <span className="text-white font-bold">{req.languages?.join(", ")}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-white/40">Posted: {req.postedDate}</span>
                  
                  <button
                    onClick={() => {
                      if (project) onApply(project, req);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Apply for Crew Role</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
