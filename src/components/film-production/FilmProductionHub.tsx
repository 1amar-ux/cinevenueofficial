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
import ProposalsView from "./ProposalsView";
import CreateProposalModal from "./CreateProposalModal";
import ProposalDetailsModal from "./ProposalDetailsModal";

import { 
  PlusCircle, Menu, Layers, FileText, Clapperboard
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
  const [activeTab, setActiveTab] = useState<string>(initialTab || "overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Data state
  const [crafts, setCrafts] = useState<FilmCraft[]>(() => getCrafts());
  const [projects, setProjects] = useState<FilmProject[]>(() => getProjects());
  const [proposals, setProposals] = useState<Proposal[]>(() => getProposals());

  // Proposal modal state
  const [isCreateProposalModalOpen, setIsCreateProposalModalOpen] = useState(false);
  const [selectedCraftForProposal, setSelectedCraftForProposal] = useState<FilmCraft | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isProposalDetailsModalOpen, setIsProposalDetailsModalOpen] = useState(false);

  const refreshAllData = () => {
    setCrafts(getCrafts());
    setProjects(getProjects());
    setProposals(getProposals());
  };

  // Pending proposals count
  const pendingProposalsCount = proposals.filter(p => {
    const s = String(p.status).toUpperCase();
    return s === "SENT" || s === "RECEIVED" || s === "UNDER_REVIEW";
  }).length;

  const getTabTitle = () => {
    switch (activeTab) {
      case "overview": return "Dashboard";
      case "crafts": return "24 Production Crafts";
      case "proposals": return "Proposals";
      default: return "Film Production";
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
              <div
                className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-500/30 text-amber-300 text-xs font-black flex items-center justify-center select-none"
                title={userEmail}
              >
                {userEmail.substring(0, 2).toUpperCase()}
              </div>
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

    </div>
  );
}
