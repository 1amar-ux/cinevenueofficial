import React, { useState } from "react";
import { 
  FilmProjectRequirement, 
  FilmProject 
} from "../../types/filmProductionMarketplace";
import { 
  Award, Search, Filter, Calendar, MapPin, Sparkles, 
  UserCheck, Send, CheckCircle2, ChevronRight, Video
} from "lucide-react";

interface CastingCallsViewProps {
  requirements: FilmProjectRequirement[];
  projects: FilmProject[];
  onApply: (project: FilmProject, req: FilmProjectRequirement) => void;
}

export default function CastingCallsView({
  requirements,
  projects,
  onApply
}: CastingCallsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedRoleType, setSelectedRoleType] = useState("all");

  const castingCalls = requirements.filter(r => r.isCastingCall && r.status === "Open");

  const filtered = castingCalls.filter(r => {
    const matchSearch = searchQuery === "" ||
      r.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.characterDetails?.characterBio && r.characterDetails.characterBio.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchGender = selectedGender === "all" ||
      r.characterDetails?.gender?.toLowerCase() === selectedGender.toLowerCase();

    const matchRole = selectedRoleType === "all" ||
      r.characterDetails?.roleType === selectedRoleType;

    return matchSearch && matchGender && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>Auditions & Casting Calls</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Actor & Performer Casting Board
          </h1>
          <p className="text-white/60 text-xs md:text-sm mt-1">
            Browse verified casting calls for Lead Actors, Antagonists, Character Artists, Supporting Roles & Voice Talents.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
          {filtered.length} Active Audition Calls
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#111218] border border-white/10 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search casting character role, film title, age range, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-purple-500/60"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">Character Gender</label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#111218] text-white">All Genders</option>
              <option value="Male" className="bg-[#111218] text-white">Male</option>
              <option value="Female" className="bg-[#111218] text-white">Female</option>
              <option value="Any" className="bg-[#111218] text-white">Any Gender / Neutral</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">Role Type</label>
            <select
              value={selectedRoleType}
              onChange={(e) => setSelectedRoleType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#111218] text-white">All Role Types</option>
              <option value="Lead" className="bg-[#111218] text-white">Lead / Protagonist</option>
              <option value="Antagonist" className="bg-[#111218] text-white">Antagonist / Villain</option>
              <option value="Supporting" className="bg-[#111218] text-white">Supporting / Character</option>
              <option value="Cameo" className="bg-[#111218] text-white">Cameo / Special Appearance</option>
              <option value="Voice" className="bg-[#111218] text-white">Voice Artist / Dubbing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Casting Calls */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-[#111218] border border-white/10 space-y-3">
          <Award className="w-10 h-10 text-white/30 mx-auto" />
          <h3 className="text-base font-bold text-white">No casting calls found</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            Try adjusting your search criteria or check back soon for newly posted film auditions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(req => {
            const project = projects.find(p => p.id === req.projectId);

            return (
              <div
                key={req.id}
                className="group rounded-2xl bg-[#111218]/95 border border-white/10 hover:border-purple-500/40 p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase border border-purple-500/30">
                        {req.characterDetails?.roleType || "Casting Call"}
                      </span>
                      <h3 className="text-lg font-black text-white group-hover:text-purple-300 transition-colors mt-1">
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

                  {/* Character specs */}
                  {req.characterDetails && (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
                      <div className="flex items-center justify-between text-purple-300 font-bold text-[11px]">
                        <span>Age: {req.characterDetails.ageRange || "Any"}</span>
                        <span>Gender: {req.characterDetails.gender || "Any"}</span>
                        <span>Look: {req.characterDetails.physicalLook || "Natural"}</span>
                      </div>
                      {req.characterDetails.characterBio && (
                        <p className="text-[11px] text-white/60 italic">
                          "{req.characterDetails.characterBio}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Meta Pills */}
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-white/60">
                      📍 {req.preferredLocation}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-white/60">
                      🗣️ {req.languages?.join(", ")}
                    </span>
                    {req.auditionRequired && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                        Audition Video Required
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-white/40">Posted: {req.postedDate}</span>
                  
                  <button
                    onClick={() => {
                      if (project) onApply(project, req);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-400 hover:to-purple-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Audition</span>
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
