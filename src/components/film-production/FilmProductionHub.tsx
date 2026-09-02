import React, { useState, useEffect } from "react";
import { 
  FilmCraft, 
  ProfessionalProfile, 
  FilmProject, 
  FilmProjectRequirement, 
  JobApplication, 
  ProjectNegotiation, 
  DigitalAgreement, 
  ProductionCompany 
} from "../../types/filmProductionMarketplace";

import { 
  getCrafts, 
  getProfessionals, 
  getProjects, 
  getRequirements, 
  getCompanies, 
  getNegotiations, 
  getOrCreateNegotiation, 
  getProfessionalById,
  getProfessionalByEmail,
  getAgreements
} from "../../services/filmProductionService";

import FilmProductionSidebar from "./FilmProductionSidebar";
import ExploreCraftsSection from "./ExploreCraftsSection";
import BrowseProfessionalsView from "./BrowseProfessionalsView";
import ProfessionalProfileModal from "./ProfessionalProfileModal";
import MyProfileEditorModal from "./MyProfileEditorModal";
import BrowseProjectsView from "./BrowseProjectsView";
import ProjectDetailsModal from "./ProjectDetailsModal";
import JobApplicationModal from "./JobApplicationModal";
import CastingCallsView from "./CastingCallsView";
import CrewJobsView from "./CrewJobsView";
import MyProjectsDashboardView from "./MyProjectsDashboardView";
import InviteProfessionalModal from "./InviteProfessionalModal";
import ProjectNegotiationChatModal from "./ProjectNegotiationChatModal";
import DigitalAgreementModal from "./DigitalAgreementModal";
import ProductionCompaniesView from "./ProductionCompaniesView";
import CineVenueFilmAdminTab from "./CineVenueFilmAdminTab";

import { 
  Film, Sparkles, Users, Briefcase, Award, PlusCircle, 
  CheckCircle2, ArrowRight, ShieldCheck, Play, Clapperboard,
  Search, TrendingUp, Layers, ChevronRight, Building2, MessageSquare,
  FileText, Menu, ExternalLink, Filter, Lock, DollarSign, Calendar
} from "lucide-react";

interface FilmProductionHubProps {
  userEmail?: string | null;
  onOpenAuth?: () => void;
  onNavigateHome?: () => void;
}

export default function FilmProductionHub({
  userEmail,
  onOpenAuth,
  onNavigateHome
}: FilmProductionHubProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Data state
  const [crafts, setCrafts] = useState<FilmCraft[]>(() => getCrafts());
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>(() => getProfessionals());
  const [projects, setProjects] = useState<FilmProject[]>(() => getProjects());
  const [requirements, setRequirements] = useState<FilmProjectRequirement[]>(() => getRequirements());
  const [companies, setCompanies] = useState<ProductionCompany[]>(() => getCompanies());
  const [negotiations, setNegotiations] = useState<ProjectNegotiation[]>(() => getNegotiations(userEmail || undefined));
  const [agreements, setAgreements] = useState<DigitalAgreement[]>(() => getAgreements(userEmail || undefined));

  // Selected filters across views
  const [selectedCraftId, setSelectedCraftId] = useState<string>("all");

  // Modals state
  const [selectedProfile, setSelectedProfile] = useState<ProfessionalProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState<FilmProject | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const [applyTargetProject, setApplyTargetProject] = useState<FilmProject | null>(null);
  const [applyTargetReq, setApplyTargetReq] = useState<FilmProjectRequirement | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const [inviteTargetProf, setInviteTargetProf] = useState<ProfessionalProfile | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [activeNegotiation, setActiveNegotiation] = useState<ProjectNegotiation | null>(null);
  const [isNegotiationModalOpen, setIsNegotiationModalOpen] = useState(false);

  const [activeAgreement, setActiveAgreement] = useState<DigitalAgreement | null>(null);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);

  const [isMyProfileEditorOpen, setIsMyProfileEditorOpen] = useState(false);

  const refreshAllData = () => {
    setCrafts(getCrafts());
    setProfessionals(getProfessionals());
    setProjects(getProjects());
    setRequirements(getRequirements());
    setCompanies(getCompanies());
    setNegotiations(getNegotiations(userEmail || undefined));
    setAgreements(getAgreements(userEmail || undefined));
  };

  // Logged-in user's profile
  const myProfile = userEmail ? getProfessionalByEmail(userEmail) : undefined;

  // Handlers
  const handleCraftSelect = (craftId: string) => {
    setSelectedCraftId(craftId);
    setActiveTab("professionals");
  };

  const handleOpenProfessionalProfile = (profileOrId: ProfessionalProfile | string) => {
    if (typeof profileOrId === "string") {
      const prof = getProfessionalById(profileOrId);
      if (prof) {
        setSelectedProfile(prof);
        setIsProfileModalOpen(true);
      }
    } else {
      setSelectedProfile(profileOrId);
      setIsProfileModalOpen(true);
    }
  };

  const handleStartNegotiation = (prof: ProfessionalProfile) => {
    const defaultProj = projects[0];
    if (!defaultProj) return;

    const neg = getOrCreateNegotiation(defaultProj.id, prof.id, userEmail || "filmmaker@cinevenue.com");
    setActiveNegotiation(neg);
    setIsNegotiationModalOpen(true);
  };

  const handleOpenNegotiationById = (projectId: string, profId: string) => {
    const neg = getOrCreateNegotiation(projectId, profId, userEmail || "filmmaker@cinevenue.com");
    setActiveNegotiation(neg);
    setIsNegotiationModalOpen(true);
  };

  const handleApplyToRequirement = (project: FilmProject, req: FilmProjectRequirement) => {
    setApplyTargetProject(project);
    setApplyTargetReq(req);
    setIsApplyModalOpen(true);
  };

  const handleOpenInvite = (profile: ProfessionalProfile) => {
    setInviteTargetProf(profile);
    setIsInviteModalOpen(true);
  };

  const handleCreateProjectClick = () => {
    setActiveTab("my-projects");
  };

  // Get active tab title helper
  const getTabTitle = () => {
    switch (activeTab) {
      case "overview": return "Overview & Highlights";
      case "professionals": return "Talent Hub (24 Crafts Directory)";
      case "projects": return "Film Projects & Slate";
      case "casting": return "Casting Calls & Auditions";
      case "jobs": return "Crew & Department Openings";
      case "companies": return "Studios & Production Houses";
      case "my-projects": return "Filmmaker Studio & ATS";
      case "agreements": return "Digital Agreements & Milestone Escrow";
      case "messages": return "Negotiations & Offers Inbox";
      case "admin": return "24 Crafts Admin Control Center";
      default: return "Film Production Hub";
    }
  };

  return (
    <div className="min-h-screen bg-[#07080D] text-white selection:bg-amber-500 selection:text-black flex flex-col lg:flex-row">
      
      {/* ======================================================== */}
      {/* MAIN SIDEBAR NAVIGATION (LEFT) */}
      {/* ======================================================== */}
      <FilmProductionSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={userEmail}
        onOpenAuth={onOpenAuth}
        onCreateProject={handleCreateProjectClick}
        onOpenMyProfile={() => setIsMyProfileEditorOpen(true)}
        onOpenAdmin={() => setActiveTab("admin")}
        negotiationsCount={negotiations.length}
        myProjectsCount={projects.length}
        agreementsCount={agreements.length}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
      />

      {/* ======================================================== */}
      {/* MAIN WORKSPACE CONTENT AREA (RIGHT) */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Top Sticky Bar for Workspace */}
        <header className="sticky top-0 z-20 bg-[#090A10]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger to trigger Sidebar */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-amber-400" />
            </button>

            {/* Breadcrumb / Title */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 font-bold">
                <span>Production & Talent Hub</span>
                <span>/</span>
                <span className="text-amber-400 font-extrabold">{getTabTitle()}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white truncate flex items-center gap-2">
                {getTabTitle()}
              </h2>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab("professionals")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold border border-white/10 transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>24 Crafts Talent</span>
            </button>

            <button
              onClick={handleCreateProjectClick}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black text-xs font-black rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-black" />
              <span className="hidden sm:inline">Post Project</span>
              <span className="sm:hidden">Post</span>
            </button>

            {userEmail ? (
              <button
                onClick={() => setIsMyProfileEditorOpen(true)}
                className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-500/30 text-amber-300 text-xs font-black flex items-center justify-center cursor-pointer hover:border-amber-400"
                title="Edit My Talent Profile"
              >
                {userEmail.substring(0, 2).toUpperCase()}
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Content Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
          
          {/* ======================================================== */}
          {/* 1. OVERVIEW & HERO HOME TAB */}
          {/* ======================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-10 animate-fade-in max-w-7xl mx-auto">
              
              {/* High-Impact Hero Banner */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#12141F] via-[#0E1017] to-black border border-white/10 p-6 sm:p-10 md:p-14 shadow-2xl">
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-3xl space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Official 24 Crafts Film Production Marketplace</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                    Find the Right Talent for Your Film. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                      Collaborate Across All 24 Crafts.
                    </span>
                  </h1>

                  <p className="text-xs sm:text-sm md:text-base text-white/70 leading-relaxed max-w-2xl">
                    Connect directly with verified Directors, Actors, Cinematographers, Music Composers, Editors, and Technical Crew. Post requirements, review audition showreels, negotiate fees, and execute digital contracts with studio-grade security.
                  </p>

                  {/* Primary CTAs */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab("professionals")}
                      className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black uppercase tracking-wider text-xs rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      <span>Discover 24 Crafts Talent</span>
                    </button>

                    <button
                      onClick={handleCreateProjectClick}
                      className="px-5 py-2.5 sm:px-6 sm:py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-2xl border border-white/15 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 text-amber-400" />
                      <span>Post Film Project & Auditions</span>
                    </button>

                    <button
                      onClick={() => setIsMyProfileEditorOpen(true)}
                      className="px-4 py-2.5 sm:px-5 sm:py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-xs rounded-2xl border border-purple-500/30 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>Create Talent Profile</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-[#101118] border border-white/10 space-y-1">
                  <div className="text-xl sm:text-2xl font-black text-amber-400">24 / 24</div>
                  <div className="text-xs font-bold text-white">Cinema Crafts Active</div>
                  <div className="text-[10px] text-white/40">Direction to Technical Guilds</div>
                </div>
                <div className="p-4 sm:p-5 rounded-2xl bg-[#101118] border border-white/10 space-y-1">
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">{professionals.length}+</div>
                  <div className="text-xs font-bold text-white">Verified Cast & Crew</div>
                  <div className="text-[10px] text-white/40">Portfolios & Audition Reels</div>
                </div>
                <div className="p-4 sm:p-5 rounded-2xl bg-[#101118] border border-white/10 space-y-1">
                  <div className="text-xl sm:text-2xl font-black text-purple-400">{projects.length}</div>
                  <div className="text-xs font-bold text-white">Active Film Projects</div>
                  <div className="text-[10px] text-white/40">Feature, Web & Shorts</div>
                </div>
                <div className="p-4 sm:p-5 rounded-2xl bg-[#101118] border border-white/10 space-y-1">
                  <div className="text-xl sm:text-2xl font-black text-gold">100%</div>
                  <div className="text-xs font-bold text-white">Escrow & Milestone Deal</div>
                  <div className="text-[10px] text-white/40">Standardized Digital Contracts</div>
                </div>
              </div>

              {/* Visual 24 Crafts System Browser */}
              <ExploreCraftsSection
                crafts={crafts}
                onSelectCraft={handleCraftSelect}
                selectedCraftId={selectedCraftId}
              />

              {/* Featured Active Film Productions */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white">Featured Film Productions</h3>
                    <p className="text-xs text-white/50">Active projects casting and hiring right now</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("projects")}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Projects</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.slice(0, 2).map(project => (
                    <div
                      key={project.id}
                      onClick={() => {
                        setSelectedProject(project);
                        setIsProjectModalOpen(true);
                      }}
                      className="p-5 rounded-3xl bg-[#111218] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer flex gap-4"
                    >
                      <img src={project.posterUrl} alt={project.title} className="w-24 h-32 rounded-2xl object-cover shrink-0" />
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                            {project.productionStage}
                          </span>
                          <span className="text-xs font-bold text-amber-400">{project.budgetRange}</span>
                        </div>
                        <h4 className="text-base font-black text-white truncate">{project.title}</h4>
                        <p className="text-xs text-white/60 line-clamp-2">{project.synopsis}</p>
                        <div className="text-[11px] text-white/40 pt-1">
                          Studio: {project.companyName} • {project.requirements?.length || 0} Openings
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 2. 24 CRAFTS TALENT DIRECTORY (TALENT HUB) */}
          {/* ======================================================== */}
          {activeTab === "professionals" && (
            <div className="max-w-7xl mx-auto">
              <BrowseProfessionalsView
                professionals={professionals}
                crafts={crafts}
                selectedCraftId={selectedCraftId}
                onCraftChange={setSelectedCraftId}
                onSelectProfessional={(prof) => {
                  setSelectedProfile(prof);
                  setIsProfileModalOpen(true);
                }}
                onInviteToProject={handleOpenInvite}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. ACTIVE FILM PROJECTS DIRECTORY */}
          {/* ======================================================== */}
          {activeTab === "projects" && (
            <div className="max-w-7xl mx-auto">
              <BrowseProjectsView
                projects={projects}
                crafts={crafts}
                onSelectProject={(proj) => {
                  setSelectedProject(proj);
                  setIsProjectModalOpen(true);
                }}
                onCreateProject={handleCreateProjectClick}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. CASTING CALLS BOARD */}
          {/* ======================================================== */}
          {activeTab === "casting" && (
            <div className="max-w-7xl mx-auto">
              <CastingCallsView
                requirements={requirements}
                projects={projects}
                onApply={handleApplyToRequirement}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. CREW OPENINGS BOARD */}
          {/* ======================================================== */}
          {activeTab === "jobs" && (
            <div className="max-w-7xl mx-auto">
              <CrewJobsView
                requirements={requirements}
                projects={projects}
                crafts={crafts}
                onApply={handleApplyToRequirement}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. STUDIOS & PRODUCTION COMPANIES */}
          {/* ======================================================== */}
          {activeTab === "companies" && (
            <div className="max-w-7xl mx-auto">
              <ProductionCompaniesView
                companies={companies}
                projects={projects}
                onSelectProject={(proj) => {
                  setSelectedProject(proj);
                  setIsProjectModalOpen(true);
                }}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* 7. FILMMAKER STUDIO & ATS DASHBOARD */}
          {/* ======================================================== */}
          {activeTab === "my-projects" && (
            <div className="max-w-7xl mx-auto">
              <MyProjectsDashboardView
                projects={projects}
                userEmail={userEmail || "filmmaker@cinevenue.com"}
                crafts={crafts}
                onRefreshProjects={refreshAllData}
                onOpenNegotiation={handleOpenNegotiationById}
                onOpenProfessionalProfile={handleOpenProfessionalProfile}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* 8. DIGITAL AGREEMENTS & ESCROW TAB */}
          {/* ======================================================== */}
          {activeTab === "agreements" && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h1 className="text-2xl font-black text-white">Digital Agreements & Milestone Escrow</h1>
                  <p className="text-xs text-white/60">Standardized film contracts, digital signatures, and milestone-linked payment releases</p>
                </div>
              </div>

              {agreements.length === 0 ? (
                <div className="text-center py-16 rounded-3xl bg-[#111218] border border-white/10 space-y-3">
                  <FileText className="w-12 h-12 text-white/30 mx-auto" />
                  <h3 className="text-base font-bold text-white">No active agreements found</h3>
                  <p className="text-xs text-white/50 max-w-md mx-auto">
                    When you finalize an offer in the negotiation room, legally structured digital deal memos and escrow contracts will appear here.
                  </p>
                  <button
                    onClick={() => setActiveTab("professionals")}
                    className="px-4 py-2 bg-amber-500 text-black text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Browse Talent & Start Negotiation
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agreements.map((agr) => (
                    <div 
                      key={agr.id}
                      className="p-5 rounded-2xl bg-[#111218] border border-white/10 hover:border-amber-500/40 transition-all space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase">
                            Official Deal Memo
                          </span>
                          <h3 className="text-base font-black text-white mt-1.5">{agr.projectTitle}</h3>
                          <p className="text-xs text-white/60">Role: <strong className="text-white">{agr.position}</strong> ({agr.craftName})</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                          agr.status === "Accepted" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                          agr.status === "Sent" || agr.status === "Viewed" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                          agr.status === "Draft" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" :
                          "bg-white/10 text-white/70"
                        }`}>
                          {agr.status === "Accepted" ? "Signed & Active" : agr.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-white/5 p-3 rounded-xl">
                        <div>
                          <span className="text-white/40 block text-[10px]">Agreed Remuneration</span>
                          <strong className="text-amber-400 font-black">{agr.remuneration}</strong>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[10px]">Production House</span>
                          <strong className="text-white font-bold truncate block">{agr.productionCompany}</strong>
                        </div>
                      </div>

                      {agr.paymentMilestones && agr.paymentMilestones.length > 0 && (
                        <div className="space-y-1 text-xs">
                          <div className="text-white/40 text-[10px] font-bold uppercase">Payment Milestones ({agr.paymentMilestones.length})</div>
                          <div className="space-y-1">
                            {agr.paymentMilestones.map((m, mIdx) => (
                              <div key={mIdx} className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
                                <span className="text-white/80">{m}</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                                  Milestone {mIdx + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setActiveAgreement(agr);
                            setIsAgreementModalOpen(true);
                          }}
                          className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-black rounded-xl hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Full Contract & Signatures</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 9. NEGOTIATIONS & OFFERS INBOX */}
          {/* ======================================================== */}
          {activeTab === "messages" && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h1 className="text-2xl font-black text-white">Project Negotiations & Offers</h1>
                  <p className="text-xs text-white/60">Private, encrypted contract discussions with filmmakers and talent</p>
                </div>
              </div>

              {negotiations.length === 0 ? (
                <div className="text-center py-16 rounded-3xl bg-[#111218] border border-white/10 space-y-2">
                  <MessageSquare className="w-10 h-10 text-white/30 mx-auto" />
                  <h3 className="text-base font-bold text-white">No active negotiations</h3>
                  <p className="text-xs text-white/50 max-w-sm mx-auto">
                    When you apply to a film or invite a professional, active negotiation rooms will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {negotiations.map(neg => (
                    <div
                      key={neg.id}
                      onClick={() => {
                        setActiveNegotiation(neg);
                        setIsNegotiationModalOpen(true);
                      }}
                      className="p-5 rounded-2xl bg-[#111218] border border-white/10 hover:border-amber-500/40 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <img src={neg.professionalAvatar} alt={neg.professionalName} className="w-12 h-12 rounded-2xl object-cover" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white">{neg.professionalName}</h4>
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                              {neg.position}
                            </span>
                          </div>
                          <p className="text-xs text-white/60">
                            Film: <strong className="text-white">{neg.projectTitle}</strong> • Studio: {neg.filmmakerName}
                          </p>
                          <p className="text-xs text-white/80 line-clamp-1 italic mt-0.5">
                            "{neg.messages[neg.messages.length - 1]?.text}"
                          </p>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${neg.status === "Agreed" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                          {neg.status}
                        </span>
                        <div className="text-[10px] text-white/40">{neg.updatedAt}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 10. 24 CRAFTS ADMIN CONTROL CENTER */}
          {/* ======================================================== */}
          {activeTab === "admin" && (
            <div className="max-w-7xl mx-auto">
              <CineVenueFilmAdminTab />
            </div>
          )}

        </main>

      </div>

      {/* ======================================================== */}
      {/* MODALS */}
      {/* ======================================================== */}

      {/* Professional Profile Deep-Dive Modal */}
      <ProfessionalProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={selectedProfile}
        onInviteToProject={handleOpenInvite}
        onStartNegotiation={handleStartNegotiation}
        currentUserEmail={userEmail}
      />

      {/* Project Details Modal */}
      <ProjectDetailsModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={selectedProject}
        crafts={crafts}
        onApplyToRequirement={handleApplyToRequirement}
      />

      {/* Job Application Modal */}
      <JobApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        project={applyTargetProject}
        requirement={applyTargetReq}
        applicantProfile={myProfile}
        userEmail={userEmail}
        onApplicationSubmitted={() => {
          refreshAllData();
          setIsApplyModalOpen(false);
        }}
      />

      {/* Invite Talent Modal */}
      <InviteProfessionalModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        professional={inviteTargetProf}
        projects={projects}
        userEmail={userEmail}
        onInviteSent={() => {
          refreshAllData();
        }}
      />

      {/* Negotiation Room & Formal Offer Modal */}
      <ProjectNegotiationChatModal
        isOpen={isNegotiationModalOpen}
        onClose={() => setIsNegotiationModalOpen(false)}
        negotiation={activeNegotiation}
        currentUserEmail={userEmail}
        onNegotiationUpdated={refreshAllData}
        onFormalAgreementGenerated={() => {
          refreshAllData();
          const agrs = getAgreements();
          if (agrs.length > 0) {
            setActiveAgreement(agrs[0]);
            setIsAgreementModalOpen(true);
          }
        }}
      />

      {/* Digital Production Agreement Modal */}
      <DigitalAgreementModal
        isOpen={isAgreementModalOpen}
        onClose={() => setIsAgreementModalOpen(false)}
        agreement={activeAgreement}
        currentUserEmail={userEmail}
        onAgreementSigned={() => {
          refreshAllData();
        }}
      />

      {/* My Profile & Multi-Craft Editor Modal */}
      <MyProfileEditorModal
        isOpen={isMyProfileEditorOpen}
        onClose={() => setIsMyProfileEditorOpen(false)}
        userEmail={userEmail || "talent@cinevenue.com"}
        crafts={crafts}
        existingProfile={myProfile}
        onProfileUpdated={() => {
          refreshAllData();
        }}
      />

    </div>
  );
}
