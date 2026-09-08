import React, { useState } from "react";
import { 
  IndianCastingCall, 
  FilmProject,
  REQUIRED_ACTOR_ROLES,
  REQUIRED_CREW_ROLES
} from "../../types/filmProductionMarketplace";
import { 
  Award, Search, Filter, Calendar, MapPin, Sparkles, 
  Video, PlusCircle, CheckCircle2, ChevronRight, AlertCircle,
  Users, Film, ArrowRight, Pause, Play, Archive, Eye, Edit3, X, Clock
} from "lucide-react";
import { updateCastingCallStatus } from "../../services/filmProductionService";

interface IndianCastingCallsViewProps {
  castingCalls: IndianCastingCall[];
  projects: FilmProject[];
  userEmail?: string | null;
  onOpenSubmitAudition: (call: IndianCastingCall) => void;
  onOpenCreateCall: () => void;
  onManageApplications?: (call: IndianCastingCall) => void;
  customProfessionalRoles?: string[];
}

export default function IndianCastingCallsView({
  castingCalls,
  projects,
  userEmail,
  onOpenSubmitAudition,
  onOpenCreateCall,
  onManageApplications,
  customProfessionalRoles = ["Line Producer", "Drone Operator", "Script Supervisor", "Intimacy Coordinator", "Color Grading Consultant"]
}: IndianCastingCallsViewProps) {
  const normEmail = (userEmail || "").toLowerCase();

  // Top sub-view: "all" (Browse Calls) or "my-calls" (My Casting Calls)
  const [activeView, setActiveView] = useState<"all" | "my-calls">("all");

  // Category selection inside "all" view
  const [activeCategoryTab, setActiveCategoryTab] = useState<"all" | "actors" | "crew" | "other">("all");

  // Sub-filter for specific role inside active category
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");

  // Detail preview modal
  const [previewCall, setPreviewCall] = useState<IndianCastingCall | null>(null);

  // Filter for user's owned casting calls
  const myCastingCalls = castingCalls.filter(c =>
    !c.ownerEmail || c.ownerEmail.toLowerCase() === normEmail
  );

  // Filter for browsing casting calls
  const browseCalls = castingCalls.filter(call => {
    // Search
    const matchesSearch = !searchQuery ||
      call.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.characterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.shootLocation.toLowerCase().includes(searchQuery.toLowerCase());

    // Industry
    const matchesIndustry = selectedIndustry === "all" ||
      call.industry.toLowerCase().includes(selectedIndustry.toLowerCase());

    // Category
    let matchesCategory = true;
    if (activeCategoryTab === "actors") {
      matchesCategory = REQUIRED_ACTOR_ROLES.some(r => r === (call.roleCategory as any)) ||
        call.roleCategory.includes("Protagonist") || call.roleCategory.includes("Actor") || call.roleCategory.includes("Artist");
    } else if (activeCategoryTab === "crew") {
      matchesCategory = REQUIRED_CREW_ROLES.some(r => r === (call.roleCategory as any)) ||
        call.roleCategory.includes("Director") || call.roleCategory.includes("Crew") || call.roleCategory.includes("Designer");
    } else if (activeCategoryTab === "other") {
      matchesCategory = call.roleCategory === "Other Required Professional" || 
        customProfessionalRoles.includes(call.roleCategory as string);
    }

    // Role sub-filter
    const matchesRole = selectedRoleFilter === "all" || call.roleCategory === selectedRoleFilter;

    return matchesSearch && matchesIndustry && matchesCategory && matchesRole;
  });

  const handleToggleCallStatus = (callId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Paused" ? "Open" : "Paused";
    updateCastingCallStatus(callId, nextStatus as any);
  };

  const handleCloseCall = (callId: string) => {
    if (confirm("Are you sure you want to close this casting call to new submissions?")) {
      updateCastingCallStatus(callId, "Closed");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#14121E] via-[#10121C] to-black border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-black uppercase tracking-widest">
              <Award className="w-3.5 h-3.5" />
              <span>Pan-India Film Casting & Personnel</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Casting Calls
            </h1>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Discover and audition for certified cinema roles across Required Actors, Required Crew Members, and Admin-configured industry professionals. Post casting calls connected directly to your Film Projects.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onOpenCreateCall}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-black" />
              <span>+ Create Casting Call</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top-level View Switcher: All Casting Calls vs My Casting Calls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView("all")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeView === "all"
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>All Casting Calls ({castingCalls.length})</span>
          </button>

          <button
            onClick={() => setActiveView("my-calls")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeView === "my-calls"
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            <Film className="w-4 h-4" />
            <span>My Casting Calls ({myCastingCalls.length})</span>
          </button>
        </div>

        {/* Industry Filter (when in All Calls) */}
        {activeView === "all" && (
          <div className="flex items-center gap-2">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="bg-[#141522] border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Cinema Circuits</option>
              <option value="Tollywood">Tollywood (Telugu)</option>
              <option value="Bollywood">Bollywood (Hindi)</option>
              <option value="Kollywood">Kollywood (Tamil)</option>
              <option value="Mollywood">Mollywood (Malayalam)</option>
              <option value="Sandalwood">Sandalwood (Kannada)</option>
              <option value="Punjabi">Punjabi Cinema</option>
              <option value="Bengali">Bengali Cinema</option>
              <option value="Pan-India">Pan-India</option>
            </select>
          </div>
        )}
      </div>

      {/* 3. VIEW A: ALL CASTING CALLS */}
      {activeView === "all" && (
        <div className="space-y-6">
          
          {/* Category Tabs: Required Actors | Required Crew | Other Professionals */}
          <div className="bg-[#0E0F18] border border-white/10 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => { setActiveCategoryTab("all"); setSelectedRoleFilter("all"); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryTab === "all"
                    ? "bg-gradient-to-r from-amber-500 to-amber-400 text-black font-black"
                    : "bg-white/5 text-white/70 hover:text-white"
                }`}
              >
                All Personnel
              </button>

              <button
                onClick={() => { setActiveCategoryTab("actors"); setSelectedRoleFilter("all"); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCategoryTab === "actors"
                    ? "bg-gradient-to-r from-amber-500 to-amber-400 text-black font-black"
                    : "bg-white/5 text-white/70 hover:text-white"
                }`}
              >
                <span>🎭 Required Actors</span>
                <span className="text-[10px] opacity-70">(11 Roles)</span>
              </button>

              <button
                onClick={() => { setActiveCategoryTab("crew"); setSelectedRoleFilter("all"); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCategoryTab === "crew"
                    ? "bg-gradient-to-r from-amber-500 to-amber-400 text-black font-black"
                    : "bg-white/5 text-white/70 hover:text-white"
                }`}
              >
                <span>🎬 Required Crew Members</span>
                <span className="text-[10px] opacity-70">(24 Roles)</span>
              </button>

              <button
                onClick={() => { setActiveCategoryTab("other"); setSelectedRoleFilter("all"); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCategoryTab === "other"
                    ? "bg-gradient-to-r from-amber-500 to-amber-400 text-black font-black"
                    : "bg-white/5 text-white/70 hover:text-white"
                }`}
              >
                <span>⭐ Other Required Professionals</span>
                <span className="text-[10px] opacity-70">(Admin Config)</span>
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                placeholder="Search character or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Sub-Category Pills */}
          {activeCategoryTab === "actors" && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedRoleFilter("all")}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${
                  selectedRoleFilter === "all" ? "bg-purple-500 text-white" : "bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                All Actors
              </button>
              {REQUIRED_ACTOR_ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${
                    selectedRoleFilter === r ? "bg-purple-500 text-white" : "bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {activeCategoryTab === "crew" && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedRoleFilter("all")}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${
                  selectedRoleFilter === "all" ? "bg-purple-500 text-white" : "bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                All Crew
              </button>
              {REQUIRED_CREW_ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${
                    selectedRoleFilter === r ? "bg-purple-500 text-white" : "bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {activeCategoryTab === "other" && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedRoleFilter("all")}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${
                  selectedRoleFilter === "all" ? "bg-purple-500 text-white" : "bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                All Custom
              </button>
              {customProfessionalRoles.map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${
                    selectedRoleFilter === r ? "bg-purple-500 text-white" : "bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {/* Casting Calls List / Cards */}
          {browseCalls.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0E0F18] border border-white/10 space-y-3">
              <Award className="w-12 h-12 text-white/20 mx-auto" />
              <h3 className="text-base font-bold text-white">No casting calls match your criteria</h3>
              <p className="text-xs text-white/50">Try broadening your search or change the role category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {browseCalls.map(call => (
                <div 
                  key={call.id}
                  className="rounded-2xl bg-[#0F1019] border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all flex flex-col justify-between shadow-xl"
                >
                  <div className="p-5 space-y-3.5">
                    {/* Top Meta */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        {call.roleCategory}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold">
                        {call.industry}
                      </span>
                    </div>

                    {/* Role Title & Character */}
                    <div>
                      <h3 className="text-base font-black text-white line-clamp-1">{call.roleTitle}</h3>
                      <p className="text-xs font-bold text-amber-300/90 mt-0.5">Character: {call.characterName}</p>
                    </div>

                    {/* Project & Company */}
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/70 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{call.projectTitle}</span>
                      </div>
                      <div className="flex items-center justify-between text-white/50 text-[10px]">
                        <span>Dir: {call.directorName}</span>
                        <span>{call.companyName}</span>
                      </div>
                    </div>

                    {/* Character Bio Snippet */}
                    <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                      {call.characterBio}
                    </p>

                    {/* Meta Specs */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-white/60 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="truncate">{call.shootLocation}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">Deadline: {call.deadline}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="p-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setPreviewCall(call)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      View Notice
                    </button>

                    <button
                      onClick={() => onOpenSubmitAudition(call)}
                      className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Audition Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. VIEW B: MY CASTING CALLS (OWNER DESK) */}
      {activeView === "my-calls" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white">My Casting Calls Management</h2>
              <p className="text-xs text-white/60">
                Manage applications, schedule auditions, pause, or close the casting calls you own.
              </p>
            </div>
            <button
              onClick={onOpenCreateCall}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              + Create Casting Call
            </button>
          </div>

          {myCastingCalls.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0E0F18] border border-white/10 space-y-3">
              <Award className="w-12 h-12 text-white/20 mx-auto" />
              <h3 className="text-base font-bold text-white">You haven't posted any casting calls yet</h3>
              <p className="text-xs text-white/50 max-w-sm mx-auto">
                Select one of your Film Projects and post an actor or crew casting notice to start receiving auditions.
              </p>
              <button
                onClick={onOpenCreateCall}
                className="px-5 py-2.5 bg-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                + Create Casting Call
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0E0F18] shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141524] text-white/60 uppercase font-black tracking-wider text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-4">Casting Call</th>
                    <th className="p-4">Film Project</th>
                    <th className="p-4">Role / Category</th>
                    <th className="p-4 text-center">Applications</th>
                    <th className="p-4">Deadline</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {myCastingCalls.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-white">
                        <div>{c.roleTitle}</div>
                        <div className="text-[11px] text-amber-400 font-medium">{c.characterName}</div>
                      </td>
                      <td className="p-4 text-white/80 font-medium">{c.projectTitle}</td>
                      <td className="p-4 text-purple-300">{c.roleCategory}</td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                          {c.submissionsCount || 0}
                        </span>
                      </td>
                      <td className="p-4 text-white/70">{c.deadline}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === "Open" || c.status === "Published" 
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : c.status === "Paused"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-white/50">{c.postedDate}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewCall(c)}
                            title="View"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {onManageApplications && (
                            <button
                              onClick={() => onManageApplications(c)}
                              className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[11px] font-bold"
                            >
                              Manage Auditions
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleCallStatus(c.id, c.status)}
                            title={c.status === "Paused" ? "Resume" : "Pause"}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-amber-400"
                          >
                            {c.status === "Paused" ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleCloseCall(c.id)}
                            title="Close Call"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-rose-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. PREVIEW CASTING CALL MODAL */}
      {previewCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#0F1018] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-auto p-6 space-y-4 text-xs">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">
                  {previewCall.roleCategory}
                </span>
                <h2 className="text-lg font-black text-white">{previewCall.roleTitle}</h2>
              </div>
              <button
                onClick={() => setPreviewCall(null)}
                className="text-white/60 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400">Film Project</span>
                <div className="text-white font-bold text-sm">{previewCall.projectTitle}</div>
                <div className="text-white/60 text-[11px]">Director: {previewCall.directorName} • {previewCall.companyName}</div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">Character & Role Description</span>
                <p className="text-white/80 leading-relaxed whitespace-pre-line">{previewCall.characterBio}</p>
              </div>

              {previewCall.dialogueScriptSnippet && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                  <span className="text-[10px] font-bold text-purple-300 uppercase">Test Audition Dialogue / Script</span>
                  <p className="text-white/80 italic font-mono text-[11px] leading-relaxed">
                    "{previewCall.dialogueScriptSnippet}"
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px]">
                <div>
                  <span className="text-white/40 block text-[10px] font-bold">Shooting Location</span>
                  <span className="text-white">{previewCall.shootLocation}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] font-bold">Shooting Dates</span>
                  <span className="text-white">{previewCall.shootingSchedule || "TBD"}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] font-bold">Compensation / Pay</span>
                  <span className="text-amber-400 font-bold">{previewCall.remuneration}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] font-bold">Application Deadline</span>
                  <span className="text-white">{previewCall.deadline}</span>
                </div>
              </div>

              {previewCall.auditionInstructions && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">Audition Instructions</span>
                  <p className="text-white/70 leading-relaxed">{previewCall.auditionInstructions}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setPreviewCall(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const call = previewCall;
                  setPreviewCall(null);
                  onOpenSubmitAudition(call);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black uppercase tracking-wider"
              >
                Audition Now
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
