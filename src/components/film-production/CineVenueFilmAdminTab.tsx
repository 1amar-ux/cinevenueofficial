import React, { useState, useEffect } from "react";
import { 
  FilmCraft, 
  FilmProject, 
  ProfessionalProfile, 
  JobApplication, 
  DigitalAgreement, 
  MarketplaceReport 
} from "../../types/filmProductionMarketplace";
import { 
  Layers, Film, Users, ShieldCheck, FileText, 
  AlertTriangle, TrendingUp, Plus, Edit2, Trash2, 
  CheckCircle2, XCircle, Search, RefreshCw, Eye, Star, Lock,
  ExternalLink, Video, Mail, Phone, MapPin, Calendar, DollarSign,
  MessageSquare, UserCheck, Award, FileCheck, Filter, ArrowUpRight
} from "lucide-react";
import { 
  getCrafts, 
  saveCraft, 
  deleteCraft, 
  getProjects, 
  saveProject, 
  deleteProject, 
  getProfessionals, 
  saveProfessionalProfile, 
  getApplications, 
  updateApplicationStatus,
  getAgreements, 
  getReports, 
  updateReportStatus 
} from "../../services/filmProductionService";

interface CineVenueFilmAdminTabProps {
  onOpenSubWebsite?: () => void;
  onOpenProposals?: () => void;
}

export default function CineVenueFilmAdminTab({
  onOpenSubWebsite,
  onOpenProposals
}: CineVenueFilmAdminTabProps) {
  const [adminSubTab, setAdminSubTab] = useState<"crafts" | "projects" | "professionals" | "applications" | "contracts" | "reports" | "analytics">("crafts");

  // State
  const [craftsList, setCraftsList] = useState<FilmCraft[]>(() => getCrafts());
  const [projectsList, setProjectsList] = useState<FilmProject[]>(() => getProjects());
  const [professionalsList, setProfessionalsList] = useState<ProfessionalProfile[]>(() => getProfessionals());
  const [applicationsList, setApplicationsList] = useState<JobApplication[]>(() => getApplications());
  const [agreementsList, setAgreementsList] = useState<DigitalAgreement[]>(() => getAgreements());
  const [reportsList, setReportsList] = useState<MarketplaceReport[]>(() => getReports());

  const [searchQuery, setSearchQuery] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState<string>("ALL");
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState("");

  // Craft Editor Modal
  const [editingCraft, setEditingCraft] = useState<Partial<FilmCraft> | null>(null);
  const [craftName, setCraftName] = useState("");
  const [craftCategory, setCraftCategory] = useState("Direction & Writing");
  const [craftDesc, setCraftDesc] = useState("");
  const [craftSubcats, setCraftSubcats] = useState("");

  const handleRefresh = () => {
    setCraftsList(getCrafts());
    setProjectsList(getProjects());
    setProfessionalsList(getProfessionals());
    setApplicationsList(getApplications());
    setAgreementsList(getAgreements());
    setReportsList(getReports());
  };

  useEffect(() => {
    const handleSync = () => {
      handleRefresh();
    };
    window.addEventListener("cinevenue-film-applications-updated", handleSync);
    return () => window.removeEventListener("cinevenue-film-applications-updated", handleSync);
  }, []);

  // Application Action handlers
  const handleUpdateAppStatus = (appId: string, status: JobApplication["status"], notes?: string) => {
    updateApplicationStatus(appId, status, notes);
    handleRefresh();
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp(prev => prev ? { ...prev, status, adminNotes: notes || prev.adminNotes } : null);
    }
  };

  // Craft actions
  const handleSaveCraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!craftName.trim()) return;

    saveCraft({
      id: editingCraft?.id,
      name: craftName.trim(),
      category: craftCategory as any,
      description: craftDesc.trim(),
      subcategories: craftSubcats.split(",").map(s => s.trim()).filter(Boolean),
      status: "Active"
    });

    setEditingCraft(null);
    handleRefresh();
  };

  const handleDeleteCraft = (id: string) => {
    if (window.confirm("Are you sure you want to delete this craft?")) {
      deleteCraft(id);
      handleRefresh();
    }
  };

  // Verification action
  const handleVerifyProfessional = (prof: ProfessionalProfile, level: ProfessionalProfile["verificationLevel"]) => {
    saveProfessionalProfile({
      ...prof,
      verificationLevel: level
    });
    handleRefresh();
  };

  const filteredApplications = applicationsList.filter(app => {
    const matchesStatus = appStatusFilter === "ALL" || app.status === appStatusFilter;
    const matchesSearch = !searchQuery || 
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.craftName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.requirementPosition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent p-5 rounded-2xl border">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>CineVenue 24 Crafts & Film Production Directorate</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Film Production & Talent Marketplace Console
          </h1>
          <p className="text-xs text-white/60 mt-1 max-w-2xl">
            Directly review casting applications, crew submissions, manage 24 crafts taxonomy, verify industry talent, issue digital deal memos, and resolve disputes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenSubWebsite && (
            <button
              onClick={onOpenSubWebsite}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
            >
              <span>🌐 Open Film Sub-Website</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenProposals && (
            <button
              onClick={onOpenProposals}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-white/10 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Main Proposals Ledger</span>
            </button>
          )}

          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 flex items-center justify-center cursor-pointer transition-all"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div 
          onClick={() => setAdminSubTab("crafts")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${adminSubTab === "crafts" ? "bg-amber-500/20 border-amber-500/50" : "bg-[#0D0E15] border-white/10 hover:border-white/20"}`}
        >
          <span className="text-[10px] uppercase font-bold text-white/50 block">Official Crafts</span>
          <div className="text-xl font-black text-amber-400 font-mono mt-0.5">{craftsList.length}</div>
          <span className="text-[10px] text-white/40 block mt-0.5">24 Guild Taxonomy</span>
        </div>

        <div 
          onClick={() => setAdminSubTab("applications")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${adminSubTab === "applications" ? "bg-amber-500/20 border-amber-500/50" : "bg-[#0D0E15] border-white/10 hover:border-white/20"}`}
        >
          <span className="text-[10px] uppercase font-bold text-white/50 block">Applications & Auditions</span>
          <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">{applicationsList.length}</div>
          <span className="text-[10px] text-white/40 block mt-0.5">Delivered to Admin</span>
        </div>

        <div 
          onClick={() => setAdminSubTab("projects")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${adminSubTab === "projects" ? "bg-amber-500/20 border-amber-500/50" : "bg-[#0D0E15] border-white/10 hover:border-white/20"}`}
        >
          <span className="text-[10px] uppercase font-bold text-white/50 block">Film Projects</span>
          <div className="text-xl font-black text-white font-mono mt-0.5">{projectsList.length}</div>
          <span className="text-[10px] text-white/40 block mt-0.5">Active Slate</span>
        </div>

        <div 
          onClick={() => setAdminSubTab("professionals")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${adminSubTab === "professionals" ? "bg-amber-500/20 border-amber-500/50" : "bg-[#0D0E15] border-white/10 hover:border-white/20"}`}
        >
          <span className="text-[10px] uppercase font-bold text-white/50 block">Talent Roster</span>
          <div className="text-xl font-black text-cyan-400 font-mono mt-0.5">{professionalsList.length}</div>
          <span className="text-[10px] text-white/40 block mt-0.5">Verified Profiles</span>
        </div>

        <div 
          onClick={() => setAdminSubTab("contracts")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${adminSubTab === "contracts" ? "bg-amber-500/20 border-amber-500/50" : "bg-[#0D0E15] border-white/10 hover:border-white/20"}`}
        >
          <span className="text-[10px] uppercase font-bold text-white/50 block">Digital Deal Memos</span>
          <div className="text-xl font-black text-purple-400 font-mono mt-0.5">{agreementsList.length}</div>
          <span className="text-[10px] text-white/40 block mt-0.5">Escrow Contracts</span>
        </div>

        <div 
          onClick={() => setAdminSubTab("reports")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${adminSubTab === "reports" ? "bg-amber-500/20 border-amber-500/50" : "bg-[#0D0E15] border-white/10 hover:border-white/20"}`}
        >
          <span className="text-[10px] uppercase font-bold text-white/50 block">Moderation Queue</span>
          <div className="text-xl font-black text-rose-400 font-mono mt-0.5">{reportsList.length}</div>
          <span className="text-[10px] text-white/40 block mt-0.5">Disputes & Reports</span>
        </div>
      </div>

      {/* Admin Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
        {[
          { id: "applications", label: `Applications & Auditions ATS (${applicationsList.length})`, icon: FileText, badge: "Live" },
          { id: "crafts", label: `24 Crafts System (${craftsList.length})`, icon: Layers },
          { id: "projects", label: `Film Slate Moderation (${projectsList.length})`, icon: Film },
          { id: "professionals", label: `Talent Verification (${professionalsList.length})`, icon: Users },
          { id: "contracts", label: `Digital Agreements Registry (${agreementsList.length})`, icon: ShieldCheck },
          { id: "reports", label: `Trust & Moderation (${reportsList.length})`, icon: AlertTriangle },
          { id: "analytics", label: "Marketplace Analytics", icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = adminSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-amber-500 text-black font-extrabold shadow-md shadow-amber-500/20"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500 text-black ml-1 uppercase">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB: APPLICATIONS & AUDITIONS ATS QUEUE */}
      {adminSubTab === "applications" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0D0E15] p-4 rounded-2xl border border-white/10">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Delivered Film Applications & Audition Submissions</span>
              </h3>
              <p className="text-xs text-white/60 mt-0.5">
                All casting applications and 24 crafts job submissions from the talent hub and sub-website.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search applicant, craft, project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400 w-52 sm:w-64"
                />
              </div>

              <select
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="ALL">All Statuses ({applicationsList.length})</option>
                <option value="Applied">Applied (New)</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Audition Scheduled">Audition Scheduled</option>
                <option value="Offered">Deal Offered</option>
                <option value="Hired">Hired / Signed</option>
                <option value="Rejected">Declined</option>
              </select>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="text-center py-16 bg-[#0D0E15] border border-white/10 rounded-2xl p-6 text-white/40 text-xs">
              <FileText className="w-8 h-8 mx-auto mb-2 text-white/20" />
              <p>No film applications match your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApplications.map(app => {
                return (
                  <div 
                    key={app.id} 
                    className="p-5 rounded-2xl bg-[#0D0E15] border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between space-y-4 shadow-xl text-xs relative group"
                  >
                    <div className="space-y-3">
                      {/* Top Row */}
                      <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={app.applicantAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"} 
                            alt={app.applicantName} 
                            className="w-10 h-10 rounded-xl object-cover border border-white/10" 
                          />
                          <div>
                            <h4 className="font-extrabold text-white text-sm">{app.applicantName}</h4>
                            <span className="text-[10px] text-amber-400 font-bold block">{app.craftName}</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
                          app.status === "Hired" || app.status === "Selected" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                          app.status === "Shortlisted" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" :
                          app.status === "Audition" || app.status === "Interview" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                          app.status === "Rejected" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                          "bg-white/10 text-white/70 border-white/10"
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      {/* Project & Role Info */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-1.5">
                        <div className="flex items-center justify-between text-white/60 text-[11px]">
                          <span>Target Project:</span>
                          <strong className="text-white truncate max-w-[150px]">{app.projectTitle}</strong>
                        </div>
                        <div className="flex items-center justify-between text-white/60 text-[11px]">
                          <span>Applied Role:</span>
                          <strong className="text-amber-300">{app.requirementPosition}</strong>
                        </div>
                        <div className="flex items-center justify-between text-white/60 text-[11px]">
                          <span>Expected Remuneration:</span>
                          <strong className="text-emerald-400 font-mono">{app.expectedPay}</strong>
                        </div>
                      </div>

                      {/* Cover note preview */}
                      {app.coverMessage && (
                        <p className="text-[11px] text-white/70 bg-black/30 p-2.5 rounded-lg border border-white/5 italic line-clamp-2">
                          "{app.coverMessage}"
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-white/40 pt-1 font-mono">
                        <span>{app.applicantEmail}</span>
                        <span>{app.appliedAt}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setAdminNoteInput(app.adminNotes || "");
                        }}
                        className="flex-1 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-amber-500/30 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Dossier</span>
                      </button>

                      <button
                        onClick={() => handleUpdateAppStatus(app.id, app.status === "Shortlisted" ? "Applied" : "Shortlisted")}
                        className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          app.status === "Shortlisted" 
                            ? "bg-cyan-500 text-black font-extrabold" 
                            : "bg-white/5 hover:bg-white/10 text-white/80"
                        }`}
                        title={app.status === "Shortlisted" ? "Remove shortlist" : "Shortlist for auditions"}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 1: 24 CRAFTS SYSTEM */}
      {adminSubTab === "crafts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase text-white/50">Official 24 Crafts Taxonomy</h3>
            <button
              onClick={() => {
                setEditingCraft({});
                setCraftName("");
                setCraftDesc("");
                setCraftSubcats("");
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs flex items-center gap-1 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Craft</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {craftsList.map(craft => (
              <div key={craft.id} className="p-4 rounded-2xl bg-[#111218] border border-white/10 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-white/50">
                      Craft #{craft.order}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${craft.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                      {craft.status}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-white mt-2">{craft.name}</h4>
                  <span className="text-[10px] text-amber-400 block font-bold">{craft.category}</span>
                  <p className="text-xs text-white/60 mt-1 line-clamp-2">{craft.description}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-white/40 font-mono">{craft.subcategories?.length || 0} Specialties</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingCraft(craft);
                        setCraftName(craft.name);
                        setCraftCategory(craft.category);
                        setCraftDesc(craft.description);
                        setCraftSubcats(craft.subcategories?.join(", ") || "");
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCraft(craft.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PROJECTS MODERATION */}
      {adminSubTab === "projects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase text-white/50">Active Film Projects ({projectsList.length})</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectsList.map(proj => (
              <div key={proj.id} className="p-4 rounded-2xl bg-[#111218] border border-white/10 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                      {proj.status}
                    </span>
                    <span className="text-[10px] font-bold text-white/40">{proj.genre.join(", ")}</span>
                  </div>
                  <h4 className="text-base font-extrabold text-white mt-1.5">{proj.title}</h4>
                  <p className="text-xs text-white/60">Banner: {proj.companyName} • Director: {proj.directorName}</p>
                  <p className="text-xs text-emerald-400 font-mono font-bold mt-1">Budget: {proj.budgetRange}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-white/40">{proj.requirements.length} Open Positions</span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete project ${proj.title}?`)) {
                        deleteProject(proj.id);
                        handleRefresh();
                      }
                    }}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PROFESSIONALS VERIFICATION */}
      {adminSubTab === "professionals" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase text-white/50">Industry Talent & Guild Verification ({professionalsList.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {professionalsList.map(prof => (
              <div key={prof.id} className="p-4 rounded-2xl bg-[#111218] border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={prof.avatarUrl} alt={prof.fullName} className="w-12 h-12 rounded-2xl object-cover border border-white/10" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{prof.fullName}</h4>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                        {prof.primaryCraftName}
                      </span>
                    </div>
                    <p className="text-xs text-white/60">{prof.location} • {prof.experienceYears}+ Yrs Exp • {prof.userEmail}</p>
                    <p className="text-[11px] text-amber-300">Status: {prof.verificationLevel}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVerifyProfessional(prof, "Professional Verified")}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs cursor-pointer"
                  >
                    Grant Verified
                  </button>
                  <button
                    onClick={() => handleVerifyProfessional(prof, "None")}
                    className="px-2 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold cursor-pointer"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CONTRACTS REGISTRY */}
      {adminSubTab === "contracts" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase text-white/50">Official Digital Contracts Registry ({agreementsList.length})</h3>
          <div className="space-y-2">
            {agreementsList.map(agr => (
              <div key={agr.id} className="p-4 rounded-2xl bg-[#111218] border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-white">Contract #{agr.id}</strong>
                    <span className="text-amber-400">({agr.projectTitle})</span>
                  </div>
                  <p className="text-white/60 mt-0.5">
                    Studio: {agr.productionCompany} | Talent: {agr.professionalName} ({agr.position})
                  </p>
                  <p className="text-emerald-400 font-bold mt-0.5">Fee: {agr.remuneration}</p>
                </div>
                <span className={`px-3 py-1 rounded-xl font-bold ${agr.status === "Accepted" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                  {agr.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: REPORTS & DISPUTES */}
      {adminSubTab === "reports" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase text-white/50">Trust & Safety Moderation Queue</h3>
          {reportsList.length === 0 ? (
            <p className="text-xs text-white/40 py-8 text-center">No open moderation reports or disputes!</p>
          ) : (
            <div className="space-y-3">
              {reportsList.map(rep => (
                <div key={rep.id} className="p-4 rounded-2xl bg-[#111218] border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-red-400 font-bold">[{rep.reason}]</span> Reported: {rep.targetTitle}
                    <p className="text-white/60 mt-1">{rep.details}</p>
                  </div>
                  <button
                    onClick={() => {
                      updateReportStatus(rep.id, "Action Taken", "Handled by admin");
                      handleRefresh();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-bold cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: ANALYTICS */}
      {adminSubTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#111218] border border-white/10 space-y-1">
              <span className="text-white/40 uppercase font-bold text-[10px]">Registered Crafts</span>
              <div className="text-2xl font-black text-amber-400">{craftsList.length}</div>
            </div>
            <div className="p-5 rounded-3xl bg-[#111218] border border-white/10 space-y-1">
              <span className="text-white/40 uppercase font-bold text-[10px]">Active Film Productions</span>
              <div className="text-2xl font-black text-white">{projectsList.length}</div>
            </div>
            <div className="p-5 rounded-3xl bg-[#111218] border border-white/10 space-y-1">
              <span className="text-white/40 uppercase font-bold text-[10px]">Verified Professionals</span>
              <div className="text-2xl font-black text-cyan-400">{professionalsList.length}</div>
            </div>
            <div className="p-5 rounded-3xl bg-[#111218] border border-white/10 space-y-1">
              <span className="text-white/40 uppercase font-bold text-[10px]">Digital Contracts Executed</span>
              <div className="text-2xl font-black text-emerald-400">{agreementsList.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* APPLICATION DOSSIER DETAIL MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#0D0E15] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-5 my-8 text-xs text-left">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            {/* Top Applicant Banner */}
            <div className="flex items-start gap-4 border-b border-white/10 pb-5">
              <img 
                src={selectedApp.applicantAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"} 
                alt={selectedApp.applicantName} 
                className="w-16 h-16 rounded-2xl object-cover border border-amber-400/40" 
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white">{selectedApp.applicantName}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                    {selectedApp.applicantVerification}
                  </span>
                </div>
                <p className="text-amber-400 font-bold text-xs mt-0.5">{selectedApp.applicantHeadline}</p>
                <div className="flex flex-wrap items-center gap-3 text-white/50 text-[11px] mt-1.5">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-400" /> {selectedApp.applicantLocation}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-amber-400" /> {selectedApp.applicantExperienceYears}+ Years Experience</span>
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-amber-400" /> {selectedApp.applicantEmail}</span>
                </div>
              </div>
            </div>

            {/* Target Role & Compensation Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-0.5">
                <span className="text-[10px] text-white/40 uppercase font-bold">Target Film Project</span>
                <p className="text-white font-extrabold text-sm truncate">{selectedApp.projectTitle}</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-0.5">
                <span className="text-[10px] text-white/40 uppercase font-bold">Position / Craft</span>
                <p className="text-amber-300 font-extrabold text-sm truncate">{selectedApp.requirementPosition} ({selectedApp.craftName})</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-0.5">
                <span className="text-[10px] text-white/40 uppercase font-bold">Expected Remuneration</span>
                <p className="text-emerald-400 font-black text-sm font-mono">{selectedApp.expectedPay}</p>
              </div>
            </div>

            {/* Cover Message & Experience */}
            {selectedApp.coverMessage && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/50 uppercase">Applicant Statement / Cover Letter</label>
                <p className="text-white/80 bg-white/[0.02] border border-white/5 p-3.5 rounded-xl leading-relaxed">
                  {selectedApp.coverMessage}
                </p>
              </div>
            )}

            {selectedApp.relevantExperience && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/50 uppercase">Notable Past Film Credits & Works</label>
                <p className="text-white/80 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                  {selectedApp.relevantExperience}
                </p>
              </div>
            )}

            {/* Admin Internal Evaluation Notes */}
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <label className="text-[10px] font-bold text-amber-400 uppercase">Directorate Evaluation Notes</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter internal evaluation notes for this applicant..."
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateAppStatus(selectedApp.id, selectedApp.status, adminNoteInput);
                    alert("Admin notes saved to applicant ledger.");
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* Status Change Action Toolbar */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-white/50 uppercase block">Application Status Decision</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleUpdateAppStatus(selectedApp.id, "Shortlisted", adminNoteInput)}
                  className={`py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                    selectedApp.status === "Shortlisted" ? "bg-cyan-500 text-black shadow-lg" : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
                  }`}
                >
                  ⭐ Shortlist
                </button>

                <button
                  onClick={() => handleUpdateAppStatus(selectedApp.id, "Audition", adminNoteInput)}
                  className={`py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                    selectedApp.status === "Audition" ? "bg-amber-500 text-black shadow-lg" : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  🎭 Schedule Audition
                </button>

                <button
                  onClick={() => handleUpdateAppStatus(selectedApp.id, "Hired", adminNoteInput)}
                  className={`py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                    selectedApp.status === "Hired" ? "bg-emerald-500 text-black shadow-lg" : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  ✍️ Hire & Sign
                </button>

                <button
                  onClick={() => handleUpdateAppStatus(selectedApp.id, "Rejected", adminNoteInput)}
                  className={`py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                    selectedApp.status === "Rejected" ? "bg-red-500 text-white shadow-lg" : "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                  }`}
                >
                  ❌ Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CRAFT EDIT MODAL */}
      {editingCraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0D0E15] border border-white/15 rounded-3xl p-6 max-w-lg w-full space-y-4 text-xs text-left">
            <h3 className="text-base font-black text-white">
              {editingCraft.id ? "Edit Film Craft" : "Add New Craft to 24 Crafts Taxonomy"}
            </h3>

            <form onSubmit={handleSaveCraft} className="space-y-3">
              <div>
                <label className="block text-white/60 font-bold mb-1">Craft Name *</label>
                <input
                  type="text"
                  value={craftName}
                  onChange={(e) => setCraftName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-white/60 font-bold mb-1">Category</label>
                <select
                  value={craftCategory}
                  onChange={(e) => setCraftCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                >
                  <option value="Direction & Writing">Direction & Writing</option>
                  <option value="Cast & Performance">Cast & Performance</option>
                  <option value="Cinematography & Visuals">Cinematography & Visuals</option>
                  <option value="Sound & Music">Sound & Music</option>
                  <option value="Post Production & Tech">Post Production & Tech</option>
                  <option value="Art & Styling">Art & Styling</option>
                  <option value="Action & Stunts">Action & Stunts</option>
                  <option value="Publicity & Media">Publicity & Media</option>
                </select>
              </div>

              <div>
                <label className="block text-white/60 font-bold mb-1">Subcategories / Sub-skills (comma separated)</label>
                <input
                  type="text"
                  value={craftSubcats}
                  onChange={(e) => setCraftSubcats(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-white/60 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={craftDesc}
                  onChange={(e) => setCraftDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCraft(null)}
                  className="px-4 py-2 bg-white/10 rounded-xl text-white font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-black font-extrabold rounded-xl cursor-pointer"
                >
                  Save Craft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
