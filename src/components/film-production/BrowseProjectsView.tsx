import React, { useState } from "react";
import { 
  FilmProject, 
  FilmCraft 
} from "../../types/filmProductionMarketplace";
import { 
  Film, Search, Filter, Calendar, MapPin, DollarSign, 
  Users, Award, ChevronRight, Sparkles, Building2, Eye, PlusCircle
} from "lucide-react";

interface BrowseProjectsViewProps {
  projects: FilmProject[];
  crafts: FilmCraft[];
  onSelectProject: (project: FilmProject) => void;
  onCreateProject: () => void;
}

export default function BrowseProjectsView({
  projects,
  crafts,
  onSelectProject,
  onCreateProject
}: BrowseProjectsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  const STAGES = ["all", "Development", "Pre-production", "Production", "Post-production", "Completed"];
  const TYPES = ["all", "Feature Film", "Web Series", "OTT Film", "Short Film", "Music Video", "Commercial Ad"];
  const LANGUAGES = ["all", "Telugu", "Tamil", "Hindi", "Malayalam", "Kannada", "English"];

  const filtered = projects.filter(p => {
    const matchSearch = searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.directorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStage = selectedStage === "all" || p.productionStage === selectedStage;
    const matchType = selectedType === "all" || p.type === selectedType;
    const matchLang = selectedLanguage === "all" || p.language.toLowerCase() === selectedLanguage.toLowerCase();

    return matchSearch && matchStage && matchType && matchLang;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-1">
            <Film className="w-3.5 h-3.5" />
            <span>Active Film Productions</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Discover Registered Film Projects
          </h1>
          <p className="text-white/60 text-xs md:text-sm mt-1">
            Explore active productions from top studios and independent filmmakers looking for cast and crew.
          </p>
        </div>

        <button
          onClick={onCreateProject}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Your Film Project</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#111218] border border-white/10 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search film title, director, production banner, genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">Production Stage</label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              {STAGES.map(s => (
                <option key={s} value={s} className="bg-[#111218] text-white">
                  {s === "all" ? "All Production Stages" : s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">Project Format</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              {TYPES.map(t => (
                <option key={t} value={t} className="bg-[#111218] text-white">
                  {t === "all" ? "All Formats" : t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">Primary Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              {LANGUAGES.map(l => (
                <option key={l} value={l} className="bg-[#111218] text-white">
                  {l === "all" ? "All Languages" : l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-[#111218] border border-white/10 space-y-3">
          <Film className="w-10 h-10 text-white/30 mx-auto" />
          <h3 className="text-base font-bold text-white">No film projects found</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            Try adjusting your search criteria or register a new film production.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(project => {
            const openReqs = project.requirements?.filter(r => r.status === "Open") || [];
            const castingReqs = openReqs.filter(r => r.isCastingCall);
            const crewReqs = openReqs.filter(r => !r.isCastingCall);

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="group rounded-3xl bg-[#111218]/95 border border-white/10 hover:border-amber-500/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col justify-between"
              >
                {/* Project Banner & Poster */}
                <div className="relative h-48 w-full bg-black/60 overflow-hidden">
                  <img
                    src={project.bannerUrl || project.posterUrl}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111218] via-[#111218]/40 to-transparent" />

                  {/* Stage Badge & Language */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow-md">
                      {project.productionStage}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/15">
                      {project.language}
                    </span>
                  </div>

                  {/* Format Pill */}
                  <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-bold border border-white/15">
                      {project.type}
                    </span>
                  </div>

                  {/* Title & Tagline overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{project.companyName}</span>
                    </div>
                    <h2 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                      {project.title}
                    </h2>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Genre Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.genre.map((g, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-white/5 text-white/70 text-[10px] font-semibold border border-white/5">
                          {g}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                      {project.synopsis || project.description}
                    </p>

                    {/* Meta info row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                      <div>
                        <span className="text-white/40 block text-[10px]">Director</span>
                        <span className="text-white font-bold truncate block">{project.directorName}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[10px]">Location</span>
                        <span className="text-white font-bold truncate block">{project.location}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-white/40 block text-[10px]">Est. Budget</span>
                        <span className="text-amber-400 font-bold truncate block">{project.budgetRange}</span>
                      </div>
                    </div>
                  </div>

                  {/* Open Requirements Highlights */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">
                        {openReqs.length} Open Positions
                      </span>
                      {castingReqs.length > 0 && (
                        <span className="text-[11px] text-white/50 hidden sm:inline">
                          ({castingReqs.length} Casting • {crewReqs.length} Crew)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                      <span>View Project Details</span>
                      <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
