import React, { useState, useEffect } from "react";
import { 
  FilmCraft, 
  ProfessionalProfile, 
  FilmProject, 
  FilmProjectRequirement, 
  JobApplication, 
  ProjectNegotiation, 
  DigitalAgreement, 
  ProductionCompany,
  IndianCastingCall,
  AuditionSubmission,
  Proposal
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
  getAgreements,
  getIndianCastingCalls,
  getAuditions,
  getProposals,
  getApplications
} from "../../services/filmProductionService";

import FilmProductionSidebar from "./FilmProductionSidebar";
import ProductionHomeView from "./ProductionHomeView";
import ExploreCraftsSection from "./ExploreCraftsSection";
import MyProjectsDashboardView from "./MyProjectsDashboardView";
import ProposalsView from "./ProposalsView";
import MyProfileView from "./MyProfileView";
import DiscoverProfessionalsView from "./DiscoverProfessionalsView";
import PublicProfessionalProfileView from "./PublicProfessionalProfileView";
import CreateProposalModal from "./CreateProposalModal";
import ProposalDetailsModal from "./ProposalDetailsModal";
import MyProfileEditorModal from "./MyProfileEditorModal";
import CineVenueFilmAdminTab from "./CineVenueFilmAdminTab";

import { 
  Film, Sparkles, Users, Briefcase, Award, PlusCircle, 
  CheckCircle2, ArrowRight, ShieldCheck, Play, Clapperboard,
  Search, TrendingUp, Layers, ChevronRight, Building2, MessageSquare,
  FileText, Menu, ExternalLink, Filter, Lock, DollarSign, Calendar
} from "lucide-react";

interface FilmProductionHubProps {
  userEmail?: string | null;
  initialTab?: string;
  onOpenAuth?: () => void;
  onNavigateHome?: () => void;
}

export default function FilmProductionHub({
  userEmail,
  initialTab = "overview",
  onOpenAuth,
  onNavigateHome
}: FilmProductionHubProps) {
  const getInitialUsernameFromUrl = () => {
    if (typeof window === "undefined") return null;
    const match = window.location.pathname.match(/\/film-production\/professionals\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  const getInitialActiveTab = () => {
    if (typeof window !== "undefined") {
      if (window.location.pathname.startsWith("/film-production/professionals")) {
        return "professionals";
      }
    }
    return initialTab;
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialActiveTab);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(getInitialUsernameFromUrl);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Data state
  const [crafts, setCrafts] = useState<FilmCraft[]>(() => getCrafts());
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>(() => getProfessionals());
  const [projects, setProjects] = useState<FilmProject[]>(() => getProjects());
  const [requirements, setRequirements] = useState<FilmProjectRequirement[]>(() => getRequirements());
  const [companies, setCompanies] = useState<ProductionCompany[]>(() => getCompanies());
  const [negotiations, setNegotiations] = useState<ProjectNegotiation[]>(() => getNegotiations(userEmail || undefined));
  const [agreements, setAgreements] = useState<DigitalAgreement[]>(() => getAgreements(userEmail || undefined));
  const [indianCastingCalls, setIndianCastingCalls] = useState<IndianCastingCall[]>(() => getIndianCastingCalls());
  const [auditions, setAuditions] = useState<AuditionSubmission[]>(() => getAuditions());
  const [proposals, setProposals] = useState<Proposal[]>(() => getProposals());
  const [jobApplications, setJobApplications] = useState<JobApplication[]>(() => getApplications());

  const [isMyProfileEditorOpen, setIsMyProfileEditorOpen] = useState(false);

  // Proposal modal state
  const [isCreateProposalModalOpen, setIsCreateProposalModalOpen] = useState(false);
  const [selectedCraftForProposal, setSelectedCraftForProposal] = useState<FilmCraft | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isProposalDetailsModalOpen, setIsProposalDetailsModalOpen] = useState(false);

  const refreshAllData = () => {
    setCrafts(getCrafts());
    setProfessionals(getProfessionals());
    setProjects(getProjects());
    setRequirements(getRequirements());
    setCompanies(getCompanies());
    setNegotiations(getNegotiations(userEmail || undefined));
    setAgreements(getAgreements(userEmail || undefined));
    setIndianCastingCalls(getIndianCastingCalls());
    setAuditions(getAuditions());
    setProposals(getProposals());
    setJobApplications(getApplications());
  };

  // Logged-in user's profile
  const myProfile = userEmail ? getProfessionalByEmail(userEmail) : undefined;

  // Pending proposals count
  const pendingProposalsCount = proposals.filter(p => {
    const s = String(p.status).toUpperCase();
    return s === "SENT" || s === "RECEIVED" || s === "UNDER_REVIEW";
  }).length;

  useEffect(() => {
    const handlePopState = () => {
      const user = getInitialUsernameFromUrl();
      setSelectedUsername(user);
      if (window.location.pathname.startsWith("/film-production/professionals")) {
        setActiveTab("professionals");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSelectProfessional = (username: string) => {
    setSelectedUsername(username);
    setActiveTab("professionals");
    window.history.pushState(null, "", `/film-production/professionals/${username}`);
  };

  const handleBackToDirectory = () => {
    setSelectedUsername(null);
    setActiveTab("professionals");
    window.history.pushState(null, "", "/film-production/professionals");
  };

  const handleCreateProjectClick = () => {
    setActiveTab("my-projects");
  };

  // Get active tab title helper
  const getTabTitle = () => {
    switch (activeTab) {
      case "overview": return "Production Home";
      case "crafts": return "24 Production Crafts";
      case "my-projects": return "My Film Projects";
      case "proposals": return "Proposals";
      case "my-profile": return "My Profile";
      case "professionals": 
        return selectedUsername ? `${selectedUsername} | Film Profile` : "Discover Film Professionals";
      case "admin": return "Film Production Admin Console";
      default: return "Movie Production";
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
        proposalsCount={proposals.length}
        pendingProposalsCount={pendingProposalsCount}
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
                <span>CineVenue Movie Production</span>
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
              onClick={() => {
                setSelectedCraftForProposal(null);
                setIsCreateProposalModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black text-xs font-black transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-black" />
              <span>+ Create Proposal</span>
            </button>

            {userEmail ? (
              <button
                onClick={() => setIsMyProfileEditorOpen(true)}
                className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-500/30 text-amber-300 text-xs font-black flex items-center justify-center cursor-pointer hover:border-amber-400"
                title="Edit My Film Profile"
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
          {/* 1. PRODUCTION HOME (DASHBOARD) */}
          {/* ======================================================== */}
          {activeTab === "overview" && (
            <ProductionHomeView
              userEmail={userEmail}
              projects={projects}
              proposals={proposals}
              myProfile={myProfile}
              onNavigateTab={setActiveTab}
              onCreateProposal={() => {
                setSelectedCraftForProposal(null);
                setIsCreateProposalModalOpen(true);
              }}
              onSelectProposal={(prop) => {
                setSelectedProposal(prop);
                setIsProposalDetailsModalOpen(true);
              }}
            />
          )}

          {/* ======================================================== */}
          {/* 2. 24 PRODUCTION CRAFTS */}
          {/* ======================================================== */}
          {activeTab === "crafts" && (
            <div className="max-w-7xl mx-auto">
              <ExploreCraftsSection
                crafts={crafts}
                onViewProfessionals={(craftName) => {
                  setActiveTab("professionals");
                }}
                onCreateProposalForCraft={(craft) => {
                  setSelectedCraftForProposal(craft);
                  setIsCreateProposalModalOpen(true);
                }}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. PROPOSALS SECTION */}
          {/* ======================================================== */}
          {activeTab === "proposals" && (
            <div className="max-w-7xl mx-auto">
              <ProposalsView
                proposals={proposals}
                projects={projects}
                userEmail={userEmail}
                onOpenCreateProposal={() => {
                  setSelectedCraftForProposal(null);
                  setIsCreateProposalModalOpen(true);
                }}
                onSelectProposal={(prop) => {
                  setSelectedProposal(prop);
                  setIsProposalDetailsModalOpen(true);
                }}
                onRefreshProposals={refreshAllData}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. DISCOVER PROFESSIONALS / PUBLIC TALENT PROFILE */}
          {/* ======================================================== */}
          {activeTab === "professionals" && (
            <div className="max-w-7xl mx-auto">
              {selectedUsername ? (
                <PublicProfessionalProfileView
                  username={selectedUsername}
                  userEmail={userEmail}
                  onBackToDirectory={handleBackToDirectory}
                  onNavigateToProposal={() => {
                    setActiveTab("proposals");
                  }}
                />
              ) : (
                <DiscoverProfessionalsView
                  userEmail={userEmail}
                  onSelectProfessional={handleSelectProfessional}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                  }}
                />
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. MY FILM PROJECTS */}
          {/* ======================================================== */}
          {activeTab === "my-projects" && (
            <div className="max-w-7xl mx-auto">
              <MyProjectsDashboardView
                projects={projects}
                userEmail={userEmail || "filmmaker@cinevenue.com"}
                onRefreshProjects={refreshAllData}
                onSelectProjectForCasting={() => {
                  setActiveTab("proposals");
                  setIsCreateProposalModalOpen(true);
                }}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. MY PROFILE */}
          {/* ======================================================== */}
          {activeTab === "my-profile" && (
            <div className="max-w-7xl mx-auto">
              <MyProfileView
                profile={myProfile}
                userEmail={userEmail}
                onOpenEditModal={() => setIsMyProfileEditorOpen(true)}
                onDiscoverProfessionals={() => {
                  setSelectedUsername(null);
                  setActiveTab("professionals");
                  window.history.pushState(null, "", "/film-production/professionals");
                }}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* 7. ADMIN MANAGEMENT (Restricted) */}
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

      {/* Create Production Proposal Modal */}
      <CreateProposalModal
        isOpen={isCreateProposalModalOpen}
        onClose={() => {
          setIsCreateProposalModalOpen(false);
          setSelectedCraftForProposal(null);
        }}
        projects={projects}
        userEmail={userEmail}
        initialCraft={selectedCraftForProposal}
        onProposalCreated={() => {
          refreshAllData();
          setIsCreateProposalModalOpen(false);
          setSelectedCraftForProposal(null);
          setActiveTab("proposals");
        }}
      />

      {/* Proposal Details & Negotiation Modal */}
      <ProposalDetailsModal
        isOpen={isProposalDetailsModalOpen}
        onClose={() => setIsProposalDetailsModalOpen(false)}
        proposal={selectedProposal}
        userEmail={userEmail}
        onProposalUpdated={() => {
          refreshAllData();
          if (selectedProposal) {
            const updated = getProposals().find(p => p.id === selectedProposal.id || p.proposalNumber === selectedProposal.proposalNumber);
            if (updated) setSelectedProposal(updated);
          }
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
