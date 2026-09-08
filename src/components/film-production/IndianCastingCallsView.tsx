import React, { useState } from "react";
import { 
  IndianCastingCall, 
  IndianFilmIndustry, 
  CastingRoleCategory,
  FilmProject 
} from "../../types/filmProductionMarketplace";
import { 
  Award, Search, Filter, Calendar, MapPin, Sparkles, 
  Video, PlusCircle, CheckCircle2, ChevronRight, AlertCircle,
  Users, Film, ArrowRight
} from "lucide-react";

interface IndianCastingCallsViewProps {
  castingCalls: IndianCastingCall[];
  projects: FilmProject[];
  onOpenSubmitAudition: (call: IndianCastingCall) => void;
  onOpenCreateCall: () => void;
}

const INDUSTRY_FILTERS: { label: string; value: string }[] = [
  { label: "All Industries", value: "all" },
  { label: "Tollywood (Telugu)", value: "Tollywood" },
  { label: "Bollywood (Hindi)", value: "Bollywood" },
  { label: "Kollywood (Tamil)", value: "Kollywood" },
  { label: "Mollywood (Malayalam)", value: "Mollywood" },
  { label: "Sandalwood (Kannada)", value: "Sandalwood" },
  { label: "Punjabi Cinema", value: "Punjabi" },
  { label: "Bengali Cinema", value: "Bengali" },
  { label: "Pan-India", value: "Pan-India" }
];

export default function IndianCastingCallsView({
  castingCalls,
  projects,
  onOpenSubmitAudition,
  onOpenCreateCall
}: IndianCastingCallsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredCalls = castingCalls.filter(call => {
    const matchesSearch = searchQuery === "" ||
      call.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.characterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.characterBio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.shootLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry = selectedIndustry === "all" ||
      call.industry.toLowerCase().includes(selectedIndustry.toLowerCase());

    const matchesGender = selectedGender === "all" ||
      call.gender === selectedGender ||
      call.gender === "Any";

    const matchesCategory = selectedCategory === "all" ||
      call.roleCategory === selectedCategory;

    return matchesSearch && matchesIndustry && matchesGender && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#14121E] via-[#10121C] to-black border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-black uppercase tracking-widest">
              <Award className="w-3.5 h-3.5" />
              <span>Pan-India Film Casting & Auditions</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Indian Casting Calls & Screen Tests
            </h1>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Discover verified film casting opportunities across Tollywood, Bollywood, Kollywood, Mollywood, and Pan-Indian productions. Submit self-tape showreels directly to directors and casting desks.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onOpenCreateCall}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-black" />
              <span>Post Casting Call</span>
            </button>
          </div>
        </div>
      </div>

      {/* Industry Quick Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
        {INDUSTRY_FILTERS.map(chip => (
          <button
            key={chip.value}
            onClick={() => setSelectedIndustry(chip.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              selectedIndustry === chip.value
                ? "bg-purple-500 text-black border-purple-400 shadow-md shadow-purple-500/20 font-black"
                : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/10"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#101118] border border-white/10 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search casting call by role, character name, film project, dialect, city..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">Role Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#141622] text-white">All Role Categories</option>
              <option value="Lead Protagonist (Male)" className="bg-[#141622] text-white">Lead Protagonist (Male)</option>
              <option value="Lead Protagonist (Female)" className="bg-[#141622] text-white">Lead Protagonist (Female)</option>
              <option value="Antagonist / Negative Role" className="bg-[#141622] text-white">Antagonist / Villain</option>
              <option value="Parallel Lead" className="bg-[#141622] text-white">Parallel Lead</option>
              <option value="Supporting Character" className="bg-[#141622] text-white">Supporting Character</option>
              <option value="Child Artist / Minor" className="bg-[#141622] text-white">Child Artist / Minor</option>
              <option value="Comedian" className="bg-[#141622] text-white">Comedian</option>
              <option value="Voice / Dubbing Talent" className="bg-[#141622] text-white">Voice / Dubbing Artist</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">Gender</label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#141622] text-white">Any Gender</option>
              <option value="Male" className="bg-[#141622] text-white">Male</option>
              <option value="Female" className="bg-[#141622] text-white">Female</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-xs font-semibold text-white/50 pb-2">
              Showing <span className="text-purple-400 font-bold">{filteredCalls.length}</span> active casting calls
            </div>
          </div>
        </div>
      </div>

      {/* Casting Calls Grid */}
      {filteredCalls.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-[#101118] border border-white/10 space-y-3">
          <Award className="w-12 h-12 text-white/20 mx-auto" />
          <h3 className="text-base font-bold text-white">No Indian casting calls match your criteria</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            Try adjusting your search terms or industry filter to browse audition opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCalls.map(call => (
            <div
              key={call.id}
              className="rounded-3xl bg-[#11121A] border border-white/10 hover:border-purple-500/40 p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-2xl space-y-4 group"
            >
              <div className="space-y-3.5">
                
                {/* Header Pills */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase border border-purple-500/30">
                        {call.industry}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold border border-amber-500/25">
                        {call.roleCategory}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-purple-300 transition-colors pt-1">
                      {call.roleTitle}
                    </h3>

                    <div className="text-xs text-white/70">
                      Character: <strong className="text-amber-400">{call.characterName}</strong> in{" "}
                      <span className="text-white font-bold">{call.projectTitle}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-emerald-400 block">{call.remuneration}</span>
                    <span className="text-[10px] text-white/40">Deadline: {call.deadline}</span>
                  </div>
                </div>

                {/* Character Bio */}
                <p className="text-xs text-white/80 leading-relaxed line-clamp-3">
                  {call.characterBio}
                </p>

                {/* Character Specs Box */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-white/60 font-semibold gap-2">
                    <span>Age: <strong className="text-white">{call.ageMin} - {call.ageMax} Years</strong></span>
                    <span>Gender: <strong className="text-white">{call.gender}</strong></span>
                    <span>Location: <strong className="text-white">{call.shootLocation}</strong></span>
                  </div>

                  {call.dialogueScriptSnippet && (
                    <div className="pt-2 border-t border-white/5 text-[11px] text-amber-300/90 italic font-mono line-clamp-2">
                      "{call.dialogueScriptSnippet}"
                    </div>
                  )}
                </div>

                {/* Meta Tags */}
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-lg bg-white/5 text-white/60">
                    🗣️ {call.languages.join(", ")}
                  </span>
                  {call.requiresSelfTape && (
                    <span className="px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-300 font-bold border border-purple-500/25 flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      Self-Tape Tape
                    </span>
                  )}
                  {call.requiresMinorConsent && (
                    <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-300 font-bold border border-rose-500/25">
                      Minor Guardian Consent
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <div className="text-[10px] text-white/40">
                  {call.submissionsCount || 0} Submissions • {call.companyName}
                </div>

                <button
                  onClick={() => onOpenSubmitAudition(call)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-purple-400 to-indigo-400 hover:from-purple-400 hover:to-indigo-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Submit Audition</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
