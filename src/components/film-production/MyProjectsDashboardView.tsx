import React, { useState } from "react";
import { 
  FilmProject, 
  FilmProjectRequirement, 
  JobApplication, 
  ProfessionalProfile, 
  FilmCraft, 
  DigitalAgreement, 
  HireRecord, 
  ProjectActivityLog 
} from "../../types/filmProductionMarketplace";
import { 
  PlusCircle, Film, Users, Briefcase, Award, CheckCircle2, 
  X, MessageSquare, Send, Eye, ShieldCheck, DollarSign, Calendar, 
  Clock, Filter, Trash2, Edit3, UserCheck, FileText, ChevronRight,
  TrendingUp, Download, Check, RefreshCw
} from "lucide-react";
import { 
  saveProject, 
  addRequirementToProject, 
  updateApplicationStatus, 
  hireProfessional, 
  getApplications, 
  getAgreements, 
  getActivityLogs 
} from "../../services/filmProductionService";

interface MyProjectsDashboardViewProps {
  projects: FilmProject[];
  userEmail: string;
  crafts: FilmCraft[];
  onRefreshProjects: () => void;
  onOpenNegotiation: (projectId: string, professionalId: string) => void;
  onOpenProfessionalProfile: (profId: string) => void;
}

export default function MyProjectsDashboardView({
  projects,
  userEmail,
  crafts,
  onRefreshProjects,
  onOpenNegotiation,
  onOpenProfessionalProfile
}: MyProjectsDashboardViewProps) {
  // My projects (owned by logged-in user or showing all if testing)
  const myProjects = projects.filter(p => 
    p.ownerEmail?.toLowerCase() === userEmail?.toLowerCase() ||
    !p.ownerEmail // fallback to display seed projects for demonstration
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(myProjects[0]?.id || "");
  const selectedProject = myProjects.find(p => p.id === selectedProjectId) || myProjects[0];

  const [activeTab, setActiveTab] = useState<"ats" | "requirements" | "roster" | "contracts" | "logs">("ats");
  const [atsStatusFilter, setAtsStatusFilter] = useState<string>("all");

  // Create Project Wizard Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const [newCompany, setNewCompany] = useState("CineVenue Studio");
  const [newDirector, setNewDirector] = useState(userEmail?.split("@")[0] || "Director");
  const [newStage, setNewStage] = useState<any>("Pre-production");
  const [newType, setNewType] = useState<any>("Feature Film");
  const [newLang, setNewLang] = useState("Telugu");
  const [newBudget, setNewBudget] = useState("₹10 Cr – ₹20 Cr");
  const [newLocation, setNewLocation] = useState("Hyderabad");
  const [newSynopsis, setNewSynopsis] = useState("");
  const [newPoster, setNewPoster] = useState("https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800");

  // Add Requirement Modal
  const [showAddReqModal, setShowAddReqModal] = useState(false);
  const [reqCraftId, setReqCraftId] = useState(crafts[0]?.id || "craft-1");
  const [reqPosition, setReqPosition] = useState("");
  const [reqIsCasting, setReqIsCasting] = useState(false);
  const [reqBudget, setReqBudget] = useState("₹5,00,000 – ₹10,00,000");
  const [reqDesc, setReqDesc] = useState("");
  const [reqExp, setReqExp] = useState(2);
  const [reqSkills, setReqSkills] = useState("");
  const [reqCharGender, setReqCharGender] = useState("Any");
  const [reqCharAge, setReqCharAge] = useState("22-30");
  const [reqCharBio, setReqCharBio] = useState("");

  // Hire Confirmation Modal
  const [hireTargetApp, setHireTargetApp] = useState<JobApplication | null>(null);
  const [hireRemuneration, setHireRemuneration] = useState("");
  const [hireStartDate, setHireStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [hireEndDate, setHireEndDate] = useState("");

  // Applications list for selected project
  const projectApplications = selectedProject 
    ? getApplications({ projectId: selectedProject.id }) 
    : [];

  const filteredApplications = projectApplications.filter(a => {
    if (atsStatusFilter === "all") return true;
    return a.status === atsStatusFilter;
  });

  const projectAgreements = selectedProject ? getAgreements().filter(a => a.projectId === selectedProject.id) : [];
  const projectLogs = selectedProject ? getActivityLogs(selectedProject.id) : [];

  // Metrics
  const openReqCount = selectedProject?.requirements?.filter(r => r.status === "Open").length || 0;
  const appliedCount = projectApplications.length;
  const shortlistedCount = projectApplications.filter(a => a.status === "Shortlisted").length;
  const inNegotiationCount = projectApplications.filter(a => a.status === "Negotiating").length;
  const hiredCount = projectApplications.filter(a => a.status === "Hired").length;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = saveProject({
      ownerEmail: userEmail || "filmmaker@cinevenue.com",
      ownerName: userEmail ? userEmail.split("@")[0] : "Filmmaker",
      companyName: newCompany.trim(),
      directorName: newDirector.trim(),
      title: newTitle.trim(),
      tagline: newTagline.trim(),
      productionStage: newStage,
      type: newType,
      language: newLang,
      location: newLocation,
      budgetRange: newBudget,
      synopsis: newSynopsis.trim(),
      posterUrl: newPoster.trim(),
      bannerUrl: newPoster.trim()
    });

    onRefreshProjects();
    setSelectedProjectId(created.id);
    setShowCreateModal(false);
    setNewTitle("");
    setNewSynopsis("");
  };

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !reqPosition.trim()) return;

    const craftObj = crafts.find(c => c.id === reqCraftId);

    addRequirementToProject(selectedProject.id, {
      craftId: reqCraftId,
      craftName: craftObj?.name || "Craft",
      position: reqPosition.trim(),
      isCastingCall: reqIsCasting,
      budgetRange: reqBudget.trim(),
      description: reqDesc.trim(),
      minExperienceYears: Number(reqExp),
      skillsRequired: reqSkills.split(",").map(s => s.trim()).filter(Boolean),
      characterDetails: reqIsCasting ? {
        name: reqPosition.trim(),
        roleType: "Lead",
        ageRange: reqCharAge,
        gender: reqCharGender as any,
        characterDescription: reqCharBio.trim(),
        characterBio: reqCharBio.trim()
      } : undefined
    });

    onRefreshProjects();
    setShowAddReqModal(false);
    setReqPosition("");
    setReqDesc("");
  };

  const handleStatusChange = (appId: string, status: JobApplication["status"]) => {
    updateApplicationStatus(appId, status);
    onRefreshProjects();
  };

  const handleConfirmHire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hireTargetApp || !selectedProject) return;

    hireProfessional({
      projectId: selectedProject.id,
      requirementId: hireTargetApp.requirementId,
      professionalId: hireTargetApp.applicantId,
      agreedRemuneration: hireRemuneration || hireTargetApp.expectedPay || "₹10,00,000",
      startDate: hireStartDate,
      endDate: hireEndDate
    });

    updateApplicationStatus(hireTargetApp.id, "Hired");
    setHireTargetApp(null);
    onRefreshProjects();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Project Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-1">
            <Film className="w-3.5 h-3.5" />
            <span>Filmmaker Production Studio</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Project Dashboard & Applicant Tracking (ATS)
          </h1>
          <p className="text-white/60 text-xs md:text-sm mt-1">
            Manage requirements, track auditions, review portfolios, negotiate deals, and execute digital contracts.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Project Switcher */}
          {myProjects.length > 0 && (
            <select
              value={selectedProject?.id || ""}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              {myProjects.map(p => (
                <option key={p.id} value={p.id} className="bg-[#111218] text-white">
                  🎬 {p.title} ({p.productionStage})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Film Project</span>
          </button>
        </div>
      </div>

      {!selectedProject ? (
        <div className="text-center py-20 rounded-3xl bg-[#111218] border border-white/10 space-y-4">
          <Film className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-lg font-black text-white">No film project registered yet</h3>
          <p className="text-xs text-white/50 max-w-md mx-auto">
            Create your first film project to post casting calls, hire crew leads across 24 crafts, and manage contracts.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2.5 bg-amber-500 text-black font-black uppercase text-xs rounded-xl shadow-lg cursor-pointer"
          >
            Register Film Project Now
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Active Project Banner & KPI Metrics */}
          <div className="p-6 rounded-3xl bg-[#111218] border border-white/10 space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedProject.posterUrl}
                  alt={selectedProject.title}
                  className="w-16 h-20 rounded-2xl object-cover border border-white/10 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-black text-white">{selectedProject.title}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                      {selectedProject.productionStage}
                    </span>
                    <span className="text-xs text-white/50">
                      • {selectedProject.type} • {selectedProject.language}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    Studio: <strong className="text-white">{selectedProject.companyName}</strong> | Director: <strong className="text-white">{selectedProject.directorName}</strong>
                  </p>
                  <p className="text-xs text-amber-300/80 mt-0.5">
                    Budget: {selectedProject.budgetRange} | Shoot Base: {selectedProject.location}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddReqModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Add Requirement / Casting Call</span>
              </button>
            </div>

            {/* KPI Metric Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-white/5">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                <div className="text-xl font-black text-amber-400">{openReqCount}</div>
                <div className="text-[10px] uppercase font-bold text-white/40 mt-0.5">Open Positions</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                <div className="text-xl font-black text-white">{appliedCount}</div>
                <div className="text-[10px] uppercase font-bold text-white/40 mt-0.5">Total Applicants</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                <div className="text-xl font-black text-cyan-400">{shortlistedCount}</div>
                <div className="text-[10px] uppercase font-bold text-white/40 mt-0.5">Shortlisted</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                <div className="text-xl font-black text-purple-400">{inNegotiationCount}</div>
                <div className="text-[10px] uppercase font-bold text-white/40 mt-0.5">In Negotiation</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center col-span-2 sm:col-span-1">
                <div className="text-xl font-black text-emerald-400">{hiredCount}</div>
                <div className="text-[10px] uppercase font-bold text-white/40 mt-0.5">Hired Cast & Crew</div>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto scrollbar-none text-xs font-bold">
            {[
              { id: "ats", label: `Applicant Tracking System (${projectApplications.length})` },
              { id: "requirements", label: `Job Requirements & Casting (${selectedProject.requirements?.length || 0})` },
              { id: "roster", label: `Confirmed Cast & Crew (${(selectedProject.castMembers?.length || 0) + (selectedProject.crewMembers?.length || 0)})` },
              { id: "contracts", label: `Digital Agreements (${projectAgreements.length})` },
              { id: "logs", label: `Audit Log (${projectLogs.length})` }
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

          {/* TAB 1: ATS APPLICANT TRACKER */}
          {activeTab === "ats" && (
            <div className="space-y-4">
              {/* ATS Status Filter Pills */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
                  {[
                    "all", "Applied", "Under Review", "Shortlisted", 
                    "Audition / Demo", "Negotiating", "Selected", "Hired", "Rejected"
                  ].map(st => (
                    <button
                      key={st}
                      onClick={() => setAtsStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        atsStatusFilter === st
                          ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                          : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
                      }`}
                    >
                      {st === "all" ? "All Applicants" : st}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-white/50">
                  Showing {filteredApplications.length} applicants
                </span>
              </div>

              {/* Applicants Table / Cards */}
              {filteredApplications.length === 0 ? (
                <div className="text-center py-16 rounded-2xl bg-[#111218] border border-white/10 space-y-2">
                  <UserCheck className="w-8 h-8 text-white/30 mx-auto" />
                  <p className="text-xs text-white/50">No applicants in this stage.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredApplications.map(app => (
                    <div
                      key={app.id}
                      className="p-5 rounded-2xl bg-[#111218] border border-white/10 hover:border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                    >
                      {/* Talent Info */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        <img
                          src={app.applicantAvatar}
                          alt={app.applicantName}
                          className="w-12 h-12 rounded-2xl object-cover border border-white/10 shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-white">{app.applicantName}</h4>
                            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                              {app.requirementPosition} ({app.craftName})
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white/10 text-white/80 text-[10px] font-bold">
                              Status: {app.status}
                            </span>
                          </div>

                          <p className="text-xs text-white/60">
                            {app.applicantHeadline} • {app.applicantLocation} • {app.applicantExperienceYears}+ Yrs Exp
                          </p>

                          <p className="text-xs text-white/80 line-clamp-2 italic pt-0.5">
                            "{app.coverMessage}"
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-amber-400 font-semibold pt-0.5">
                            <span>Quote: {app.expectedPay}</span>
                            <span>•</span>
                            <span>Availability: {app.availabilityNotes}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                        <button
                          onClick={() => onOpenProfessionalProfile(app.applicantId)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Profile</span>
                        </button>

                        <button
                          onClick={() => onOpenNegotiation(app.projectId, app.applicantId)}
                          className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold border border-purple-500/40 cursor-pointer flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Negotiate</span>
                        </button>

                        {/* Status dropdown */}
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value as any)}
                          className="bg-white/10 text-white text-xs font-bold rounded-xl px-2.5 py-1.5 border border-white/15 focus:outline-none cursor-pointer"
                        >
                          <option value="Applied" className="bg-[#111218]">Applied</option>
                          <option value="Under Review" className="bg-[#111218]">Under Review</option>
                          <option value="Shortlisted" className="bg-[#111218]">Shortlisted</option>
                          <option value="Audition / Demo" className="bg-[#111218]">Audition / Demo</option>
                          <option value="Negotiating" className="bg-[#111218]">Negotiating</option>
                          <option value="Selected" className="bg-[#111218]">Selected</option>
                          <option value="Rejected" className="bg-[#111218]">Rejected</option>
                        </select>

                        {app.status !== "Hired" && (
                          <button
                            onClick={() => {
                              setHireTargetApp(app);
                              setHireRemuneration(app.expectedPay);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Hire & Contract</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REQUIREMENTS MANAGER */}
          {activeTab === "requirements" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">
                  Project Craft Openings ({selectedProject.requirements?.length || 0})
                </h3>
                <button
                  onClick={() => setShowAddReqModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs cursor-pointer flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              {selectedProject.requirements?.map(req => (
                <div key={req.id} className="p-4 rounded-2xl bg-[#111218] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{req.position}</h4>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-semibold">
                        {req.craftName}
                      </span>
                      {req.isCastingCall && (
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-semibold">
                          Casting Call
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-amber-400">{req.budgetRange}</span>
                  </div>
                  <p className="text-xs text-white/70">{req.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CONFIRMED CAST & CREW ROSTER */}
          {activeTab === "roster" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">Confirmed Cast Roster</h3>
                {selectedProject.castMembers?.length === 0 ? (
                  <p className="text-xs text-white/40 italic">No confirmed cast yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedProject.castMembers?.map(cast => (
                      <div key={cast.id} className="p-3.5 rounded-2xl bg-[#111218] border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={cast.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} alt={cast.actorName} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <h4 className="text-xs font-bold text-white">{cast.actorName}</h4>
                            <p className="text-[11px] text-amber-400">Role: {cast.characterName} ({cast.roleType})</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          Contract: {cast.contractStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">Confirmed Technical Crew Leads</h3>
                {selectedProject.crewMembers?.length === 0 ? (
                  <p className="text-xs text-white/40 italic">No confirmed crew leads yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedProject.crewMembers?.map(crew => (
                      <div key={crew.id} className="p-3.5 rounded-2xl bg-[#111218] border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={crew.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} alt={crew.name} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <h4 className="text-xs font-bold text-white">{crew.name}</h4>
                            <p className="text-[11px] text-purple-300">{crew.craftName} ({crew.position})</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          Contract: {crew.contractStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DIGITAL CONTRACTS */}
          {activeTab === "contracts" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">Digital Agreements & NDA Registry</h3>
              {projectAgreements.length === 0 ? (
                <p className="text-xs text-white/40 italic">No formal digital contracts generated yet.</p>
              ) : (
                <div className="space-y-3">
                  {projectAgreements.map(agr => (
                    <div key={agr.id} className="p-4 rounded-2xl bg-[#111218] border border-white/10 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{agr.professionalName}</h4>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                            {agr.position}
                          </span>
                          <span className="text-xs text-white/50">Contract #{agr.id}</span>
                        </div>
                        <p className="text-xs text-white/70 mt-1">Remuneration: {agr.remuneration}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${agr.status === "Accepted" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                        {agr.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AUDIT LOG */}
          {activeTab === "logs" && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">Project Audit Trail</h3>
              {projectLogs.length === 0 ? (
                <p className="text-xs text-white/40 italic">No logs recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {projectLogs.map(log => (
                    <div key={log.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs flex items-center justify-between">
                      <div>
                        <strong className="text-white">{log.user}</strong>: <span className="text-amber-400">{log.action}</span> — {log.details}
                      </div>
                      <span className="text-[10px] text-white/40">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0D0E15] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-auto max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#111218]">
              <h2 className="text-base font-black text-white">Create New Film Production</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-white/60 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 font-bold mb-1">Film Title *</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                    placeholder="e.g. Mahasenani"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/60 font-bold mb-1">Tagline</label>
                  <input
                    type="text"
                    value={newTagline}
                    onChange={(e) => setNewTagline(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                    placeholder="e.g. The Untold Sovereign Legend"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/60 font-bold mb-1">Production Studio / Banner</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/60 font-bold mb-1">Director Name</label>
                  <input
                    type="text"
                    value={newDirector}
                    onChange={(e) => setNewDirector(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/60 font-bold mb-1">Stage</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white cursor-pointer"
                  >
                    <option value="Development">Development</option>
                    <option value="Pre-production">Pre-production</option>
                    <option value="Production">Production</option>
                    <option value="Post-production">Post-production</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/60 font-bold mb-1">Project Format</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white cursor-pointer"
                  >
                    <option value="Feature Film">Feature Film</option>
                    <option value="Web Series">Web Series</option>
                    <option value="OTT Film">OTT Film</option>
                    <option value="Short Film">Short Film</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/60 font-bold mb-1">Language</label>
                  <input
                    type="text"
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/60 font-bold mb-1">Budget Range</label>
                  <input
                    type="text"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 font-bold mb-1">Story Synopsis & Vision</label>
                <textarea
                  rows={3}
                  value={newSynopsis}
                  onChange={(e) => setNewSynopsis(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                  placeholder="Outline the core plot, themes, and creative direction..."
                  required
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 text-black font-black uppercase rounded-xl cursor-pointer"
                >
                  Create & Launch Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD REQUIREMENT MODAL */}
      {showAddReqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#0D0E15] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-auto max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#111218]">
              <h2 className="text-base font-black text-white">Add Requirement / Casting Call</h2>
              <button onClick={() => setShowAddReqModal(false)} className="text-white/60 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRequirement} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!reqIsCasting}
                    onChange={() => setReqIsCasting(false)}
                    className="text-amber-500"
                  />
                  <span className="font-bold text-white">Technical Crew Role</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={reqIsCasting}
                    onChange={() => setReqIsCasting(true)}
                    className="text-purple-500"
                  />
                  <span className="font-bold text-purple-300">Actor Audition / Casting Call</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 font-bold mb-1">Film Craft Department *</label>
                  <select
                    value={reqCraftId}
                    onChange={(e) => setReqCraftId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white cursor-pointer font-bold"
                  >
                    {crafts.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#111218]">
                        Craft #{c.order}: {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/60 font-bold mb-1">Role / Position Title *</label>
                  <input
                    type="text"
                    value={reqPosition}
                    onChange={(e) => setReqPosition(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                    placeholder={reqIsCasting ? "e.g. Lead Antagonist (Vikram)" : "e.g. Associate Cinematographer"}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 font-bold mb-1">Budget / Compensation *</label>
                <input
                  type="text"
                  value={reqBudget}
                  onChange={(e) => setReqBudget(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                  placeholder="e.g. ₹10,00,000 per project"
                  required
                />
              </div>

              {reqIsCasting && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-purple-300 font-bold mb-1">Character Gender</label>
                      <select
                        value={reqCharGender}
                        onChange={(e) => setReqCharGender(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Any">Any Gender</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-purple-300 font-bold mb-1">Character Age Range</label>
                      <input
                        type="text"
                        value={reqCharAge}
                        onChange={(e) => setReqCharAge(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-white/60 font-bold mb-1">Detailed Description & Responsibilities</label>
                <textarea
                  rows={3}
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                  placeholder="Detail the shoot schedule, aesthetic references, and technical deliverables..."
                  required
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddReqModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 text-black font-black uppercase rounded-xl cursor-pointer"
                >
                  Post Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HIRE PROFESSIONAL MODAL */}
      {hireTargetApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0D0E15] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#111218]">
              <h2 className="text-base font-black text-white">Formal Hire & Generate Agreement</h2>
              <button onClick={() => setHireTargetApp(null)} className="text-white/60 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmHire} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-white/90 space-y-1">
                <div className="font-bold text-amber-400">{hireTargetApp.applicantName}</div>
                <div className="text-white/60">Position: {hireTargetApp.requirementPosition} ({hireTargetApp.craftName})</div>
              </div>

              <div>
                <label className="block text-white/60 font-bold mb-1">Agreed Remuneration *</label>
                <input
                  type="text"
                  value={hireRemuneration}
                  onChange={(e) => setHireRemuneration(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 font-bold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={hireStartDate}
                    onChange={(e) => setHireStartDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/60 font-bold mb-1">End Date</label>
                  <input
                    type="date"
                    value={hireEndDate}
                    onChange={(e) => setHireEndDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                  />
                </div>
              </div>

              <p className="text-[11px] text-white/50">
                This will automatically add the talent to your live Cast & Crew Roster and generate a CineVenue Digital Production Contract.
              </p>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setHireTargetApp(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-500 text-black font-black uppercase rounded-xl cursor-pointer"
                >
                  Confirm Hire & Agreement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
