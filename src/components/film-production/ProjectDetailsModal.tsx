import React, { useState } from "react";
import { 
  FilmProject, 
  FilmProjectRequirement, 
  FilmCraft 
} from "../../types/filmProductionMarketplace";
import { 
  X, Film, MapPin, Calendar, DollarSign, Users, 
  Building2, Sparkles, CheckCircle2, ChevronRight, 
  Send, UserCheck, ShieldCheck, Briefcase, Award, Lock
} from "lucide-react";

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: FilmProject | null;
  crafts: FilmCraft[];
  onApplyToRequirement: (project: FilmProject, requirement: FilmProjectRequirement) => void;
}

export default function ProjectDetailsModal({
  isOpen,
  onClose,
  project,
  crafts,
  onApplyToRequirement
}: ProjectDetailsModalProps) {
  if (!isOpen || !project) return null;

  const [activeTab, setActiveTab] = useState<"overview" | "requirements" | "cast-crew">("requirements");

  const openRequirements = project.requirements?.filter(r => r.status === "Open") || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0D0E15] border border-white/15 rounded-3xl overflow-hidden shadow-2xl animate-fade-in my-auto max-h-[92vh] flex flex-col">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Banner with Poster Header */}
        <div className="relative h-48 md:h-64 w-full shrink-0 bg-black">
          <img
            src={project.bannerUrl || project.posterUrl}
            alt={project.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E15] via-[#0D0E15]/50 to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-amber-500 text-black text-xs font-black uppercase tracking-wider shadow-md">
              {project.productionStage}
            </span>
            <span className="px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/15">
              {project.language} • {project.industry}
            </span>
            {project.isConfidential && (
              <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/40 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>NDA Required</span>
              </span>
            )}
          </div>

          {/* Project Title & Studio */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
              <Building2 className="w-4 h-4" />
              <span>{project.companyName}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              {project.title}
            </h1>
            {project.tagline && (
              <p className="text-xs md:text-sm text-white/70 italic mt-0.5">
                "{project.tagline}"
              </p>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-white/10 flex items-center gap-2 bg-[#090A0F] text-xs font-bold shrink-0">
          {[
            { id: "requirements", label: `Open Requirements (${openRequirements.length})` },
            { id: "overview", label: "Synopsis & Production Info" },
            { id: "cast-crew", label: `Cast & Crew Roster (${(project.castMembers?.length || 0) + (project.crewMembers?.length || 0)})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "border-amber-400 text-amber-400 font-black"
                  : "border-transparent text-white/60 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: REQUIREMENTS & CASTING CALLS */}
          {activeTab === "requirements" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">
                  Open Casting Calls & Technical Crew Positions
                </h3>
                <span className="text-xs text-amber-400 font-semibold">
                  {openRequirements.length} available openings
                </span>
              </div>

              {openRequirements.length === 0 ? (
                <div className="text-center py-12 bg-white/[0.02] rounded-2xl border border-white/5 space-y-2">
                  <Briefcase className="w-8 h-8 text-white/30 mx-auto" />
                  <p className="text-xs text-white/50">No open positions at this stage. Check back soon!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {openRequirements.map(req => {
                    const isCasting = req.isCastingCall;

                    return (
                      <div
                        key={req.id}
                        className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 space-y-4 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-black text-white">
                                {req.position}
                              </h4>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                isCasting 
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" 
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              }`}>
                                {isCasting ? "Casting Call" : "Crew Position"}
                              </span>
                              <span className="text-xs text-white/50">
                                • {req.craftName}
                              </span>
                            </div>

                            <span className="text-xs font-bold text-amber-400">
                              Budget: {req.budgetRange}
                            </span>
                          </div>

                          <p className="text-xs text-white/80 leading-relaxed whitespace-pre-line">
                            {req.description}
                          </p>

                          {/* Casting Character details if applicable */}
                          {req.characterDetails && (
                            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
                              <div className="font-bold text-purple-300">Character Breakdown:</div>
                              <div className="text-white/80">
                                Age: {req.characterDetails.ageRange || "Any"} • Gender: {req.characterDetails.gender || "Any"} • Role: {req.characterDetails.roleType || "Featured"}
                              </div>
                              {req.characterDetails.characterBio && (
                                <p className="text-white/60 italic text-[11px]">
                                  "{req.characterDetails.characterBio}"
                                </p>
                              )}
                            </div>
                          )}

                          {/* Requirements Spec Pills */}
                          <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-white/70 border border-white/10">
                              Min Exp: {req.minExperienceYears}+ Years
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-white/70 border border-white/10">
                              Location: {req.preferredLocation}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-white/70 border border-white/10">
                              Duration: {req.duration}
                            </span>
                          </div>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {req.skillsRequired.map((skill, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-white/5 text-white/60 text-[10px]">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Apply CTA */}
                        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[11px] text-white/40">
                            Posted: {req.postedDate}
                          </span>

                          <button
                            onClick={() => onApplyToRequirement(project, req)}
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Apply for this Role</span>
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SYNOPSIS & PRODUCTION INFO */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">Story Synopsis</h3>
                <p className="text-sm text-white/80 leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/5 whitespace-pre-line">
                  {project.synopsis || project.description}
                </p>
              </div>

              {/* Grid info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-white/40 uppercase font-bold text-[10px]">Director</span>
                  <p className="text-sm font-bold text-white">{project.directorName}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-white/40 uppercase font-bold text-[10px]">Producer</span>
                  <p className="text-sm font-bold text-white">{project.producerName || project.ownerName}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-white/40 uppercase font-bold text-[10px]">Production Studio</span>
                  <p className="text-sm font-bold text-white">{project.companyName}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-white/40 uppercase font-bold text-[10px]">Target Shoot Dates</span>
                  <p className="text-sm font-bold text-white">{project.expectedStartDate} to {project.expectedCompletionDate || "TBA"}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-white/40 uppercase font-bold text-[10px]">Estimated Budget</span>
                  <p className="text-sm font-bold text-amber-400">{project.budgetRange}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-white/40 uppercase font-bold text-[10px]">Primary Shoot Location</span>
                  <p className="text-sm font-bold text-white">{project.location}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CAST & CREW ROSTER */}
          {activeTab === "cast-crew" && (
            <div className="space-y-6">
              {/* Confirmed Cast */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">Confirmed Cast</h3>
                {(!project.castMembers || project.castMembers.length === 0) ? (
                  <p className="text-xs text-white/40 italic">No confirmed cast listed yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.castMembers.map(cast => (
                      <div key={cast.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                        <img src={cast.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} alt={cast.actorName} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                        <div>
                          <h4 className="text-xs font-bold text-white">{cast.actorName}</h4>
                          <p className="text-[11px] text-amber-400 font-semibold">as {cast.characterName} ({cast.roleType})</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirmed Technical Crew */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">Technical Crew Leads</h3>
                {(!project.crewMembers || project.crewMembers.length === 0) ? (
                  <p className="text-xs text-white/40 italic">Crew roster is currently in formation.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.crewMembers.map(crew => (
                      <div key={crew.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                        <img src={crew.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} alt={crew.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                        <div>
                          <h4 className="text-xs font-bold text-white">{crew.name}</h4>
                          <p className="text-[11px] text-purple-300 font-semibold">{crew.craftName} ({crew.position})</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-[#090A0F] flex items-center justify-between text-xs text-white/60 shrink-0">
          <span>Official CineVenue Verified Film Project</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
