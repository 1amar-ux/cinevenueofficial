import React from "react";
import { 
  Film, Award, Video, FileText, User, PlusCircle, 
  ChevronRight, ArrowRight, Sparkles, CheckCircle2, 
  FolderKanban, Clock, Users, ShieldCheck, Eye, Layers
} from "lucide-react";
import { 
  FilmProject, 
  IndianCastingCall, 
  AuditionSubmission, 
  Proposal, 
  ProfessionalProfile,
  AuditionStatus
} from "../../types/filmProductionMarketplace";

interface ProductionHomeViewProps {
  userEmail?: string | null;
  projects: FilmProject[];
  castingCalls: IndianCastingCall[];
  auditions: AuditionSubmission[];
  proposals: Proposal[];
  myProfile?: ProfessionalProfile;
  onNavigateTab: (tabId: string) => void;
  onCreateProject: () => void;
  onCreateCastingCall: () => void;
  onCreateProposal: () => void;
  onOpenProfileEditor: () => void;
}

export default function ProductionHomeView({
  userEmail,
  projects,
  castingCalls,
  auditions,
  proposals,
  myProfile,
  onNavigateTab,
  onCreateProject,
  onCreateCastingCall,
  onCreateProposal,
  onOpenProfileEditor
}: ProductionHomeViewProps) {
  // My owned projects
  const myProjects = projects.filter(p => 
    !userEmail || p.ownerEmail?.toLowerCase() === userEmail.toLowerCase() || !p.ownerEmail
  );

  // My casting calls
  const myCastingCalls = castingCalls.filter(c =>
    !userEmail || c.ownerEmail?.toLowerCase() === userEmail.toLowerCase()
  );

  // My audition submissions (user as applicant)
  const myAuditionSubmissions = auditions.filter(a =>
    !userEmail || a.applicantEmail?.toLowerCase() === userEmail.toLowerCase()
  );

  // Count by audition statuses
  const auditionCounts: Record<AuditionStatus | "All Submissions", number> = {
    "All Submissions": myAuditionSubmissions.length,
    "Submitted": myAuditionSubmissions.filter(a => a.status === "Submitted").length,
    "Screened": myAuditionSubmissions.filter(a => a.status === "Screened").length,
    "Shortlisted": myAuditionSubmissions.filter(a => a.status === "Shortlisted").length,
    "Callback Scheduled": myAuditionSubmissions.filter(a => a.status === "Callback Scheduled").length,
    "Selected": myAuditionSubmissions.filter(a => a.status === "Selected").length,
    "Rejected": myAuditionSubmissions.filter(a => a.status === "Rejected").length,
  };

  // Proposals
  const myProposals = proposals.filter(p =>
    !userEmail || p.senderEmail?.toLowerCase() === userEmail.toLowerCase() || p.recipientEmail?.toLowerCase() === userEmail.toLowerCase()
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* 1. HERO BANNER: Streamlined Production Dashboard */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#12131C] via-[#0E0F17] to-black border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-widest">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>CineVenue Film Production</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Production Home
            </h1>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Welcome to the unified film production dashboard. Manage your film projects, post casting calls, track audition callbacks, exchange co-production proposals, and maintain your professional film profile.
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={onCreateProject}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-gold/20 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-black" />
              <span>+ Create Film Project</span>
            </button>
            <button
              onClick={onCreateCastingCall}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/15 flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>+ Post Casting Call</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. THE 5 CORE PRODUCTION MODULES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* MODULE 1: MY FILM PROJECTS */}
        <div className="rounded-2xl bg-[#0F1017] border border-white/10 p-6 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">My Film Projects</h2>
                  <p className="text-xs text-white/60">Create & oversee your productions</p>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-amber-400 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                {myProjects.length} Projects
              </span>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Track project slates across Idea, Development, Pre-Production, Production, Post-Production, Completed, and Released stages with full ownership control.
            </p>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => onNavigateTab("my-projects")}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white text-center transition-all cursor-pointer"
              >
                View My Projects
              </button>
              <button
                onClick={onCreateProject}
                className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold text-amber-300 text-center transition-all cursor-pointer"
              >
                + Create Project
              </button>
              <button
                onClick={() => onNavigateTab("my-projects")}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white text-center transition-all cursor-pointer"
              >
                Manage Projects
              </button>
            </div>
          </div>

          <div className="pt-5 border-t border-white/5 mt-5 flex items-center justify-between">
            <span className="text-[11px] text-white/50">Restricted owner permissions</span>
            <button
              onClick={() => onNavigateTab("my-projects")}
              className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Go to My Projects</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MODULE 2: CASTING CALLS */}
        <div className="rounded-2xl bg-[#0F1017] border border-white/10 p-6 flex flex-col justify-between hover:border-purple-500/40 transition-all shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Casting Calls</h2>
                  <p className="text-xs text-white/60">Actors, Crew Members & Professionals</p>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-purple-300 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                {castingCalls.length} Open Calls
              </span>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Find and audition actors across 11 lead & character categories, hire technical crew across 24 crafts, or publish casting notices tied to your projects.
            </p>

            {/* Sub-links */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => onNavigateTab("casting-calls")}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-white border border-white/10 cursor-pointer"
              >
                🎭 Required Actors
              </button>
              <button
                onClick={() => onNavigateTab("casting-calls")}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-white border border-white/10 cursor-pointer"
              >
                🎬 Required Crew
              </button>
              <button
                onClick={() => onNavigateTab("casting-calls")}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-white border border-white/10 cursor-pointer"
              >
                ⭐ Other Professionals
              </button>
              <button
                onClick={onCreateCastingCall}
                className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-[11px] font-bold text-purple-300 border border-purple-500/30 cursor-pointer"
              >
                + Create Casting Call
              </button>
              <button
                onClick={() => onNavigateTab("casting-calls")}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-white border border-white/10 cursor-pointer"
              >
                My Casting Calls ({myCastingCalls.length})
              </button>
            </div>
          </div>

          <div className="pt-5 border-t border-white/5 mt-5 flex items-center justify-between">
            <span className="text-[11px] text-white/50">Tollywood, Bollywood, Kollywood & more</span>
            <button
              onClick={() => onNavigateTab("casting-calls")}
              className="text-xs text-purple-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Casting Calls</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MODULE 3: MY AUDITIONS */}
        <div className="rounded-2xl bg-[#0F1017] border border-white/10 p-6 flex flex-col justify-between hover:border-blue-500/40 transition-all shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">My Auditions</h2>
                  <p className="text-xs text-white/60">Application & Callback desk</p>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-blue-400 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                {myAuditionSubmissions.length} Applied
              </span>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Track your audition status across official review gates. Project owners can review tapes, rate monologues, and schedule auditions.
            </p>

            {/* 7 Status Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[
                { label: "Submitted", count: auditionCounts["Submitted"], color: "text-amber-400 bg-amber-500/10" },
                { label: "Screened", count: auditionCounts["Screened"], color: "text-blue-400 bg-blue-500/10" },
                { label: "Shortlisted", count: auditionCounts["Shortlisted"], color: "text-purple-400 bg-purple-500/10" },
                { label: "Callback", count: auditionCounts["Callback Scheduled"], color: "text-cyan-400 bg-cyan-500/10" },
                { label: "Selected", count: auditionCounts["Selected"], color: "text-emerald-400 bg-emerald-500/10" },
                { label: "Rejected", count: auditionCounts["Rejected"], color: "text-rose-400 bg-rose-500/10" },
                { label: "All Total", count: auditionCounts["All Submissions"], color: "text-white bg-white/10" }
              ].map(s => (
                <div 
                  key={s.label}
                  onClick={() => onNavigateTab("my-auditions")}
                  className={`px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center justify-between cursor-pointer hover:border-white/20 transition-all ${s.color}`}
                >
                  <span className="text-[10px] font-bold">{s.label}</span>
                  <span className="text-xs font-black font-mono">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-5 border-t border-white/5 mt-5 flex items-center justify-between">
            <span className="text-[11px] text-white/50">Official callback notifications</span>
            <button
              onClick={() => onNavigateTab("my-auditions")}
              className="text-xs text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Auditions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MODULE 4: PROPOSALS */}
        <div className="rounded-2xl bg-[#0F1017] border border-white/10 p-6 flex flex-col justify-between hover:border-gold/40 transition-all shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <FileText className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Proposals</h2>
                  <p className="text-xs text-white/60">Pitch, Scope & Escrow Milestones</p>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-gold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                {myProposals.length} Proposals
              </span>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Create professional acting, crew, direction, cinematography, music, VFX, and co-production proposals with milestones. Acceptance does not auto-bind a legal contract.
            </p>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={onCreateProposal}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-gold/20 hover:bg-gold/30 border border-amber-500/40 text-xs font-bold text-amber-300 text-center transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-3.5 h-3.5 text-gold" />
                <span>+ Proposal Form</span>
              </button>
              <button
                onClick={() => onNavigateTab("proposals")}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white text-center transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-white/60" />
                <span>My Proposals ({myProposals.length})</span>
              </button>
            </div>
          </div>

          <div className="pt-5 border-t border-white/5 mt-5 flex items-center justify-between">
            <span className="text-[11px] text-white/50">11 Canonical Proposal Types</span>
            <button
              onClick={() => onNavigateTab("proposals")}
              className="text-xs text-gold font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Go to Proposals</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* MODULE 5: MY PROFILE BAR */}
      <div className="rounded-2xl bg-gradient-to-r from-[#12131F] to-[#0A0B10] border border-white/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-amber-500/20 border border-amber-500/40 shrink-0 flex items-center justify-center text-amber-400 font-black text-xl">
            {myProfile?.avatarUrl ? (
              <img src={myProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">
                {myProfile?.fullName || (userEmail ? userEmail.split("@")[0] : "My Professional Profile")}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                Multiple Roles Active
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              {myProfile?.professionalHeadline || "Actor, Director, Cinematographer & Creative Producer"}
            </p>
            <p className="text-[11px] text-white/40 mt-1">
              {myProfile?.languages?.join(", ") || "Telugu, Hindi, English"} • {myProfile?.location || "Hyderabad, India"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={() => onNavigateTab("my-profile")}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer text-center"
          >
            View Profile
          </button>
          <button
            onClick={onOpenProfileEditor}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center shadow-md shadow-amber-500/20"
          >
            Edit Profile
          </button>
        </div>
      </div>

    </div>
  );
}
