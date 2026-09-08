import React, { useState } from "react";
import { 
  Proposal, 
  ProposalType, 
  ProposalStatus 
} from "../../types/filmProductionMarketplace";
import { 
  FileText, PlusCircle, Search, Filter, Calendar, 
  Clock, DollarSign, Building2, User, CheckCircle2, 
  RotateCcw, ShieldCheck, ArrowRight, Eye, ChevronRight
} from "lucide-react";

interface ProposalsViewProps {
  proposals: Proposal[];
  userEmail?: string | null;
  onOpenCreateProposal: () => void;
  onSelectProposal: (proposal: Proposal) => void;
}

export default function ProposalsView({
  proposals,
  userEmail,
  onOpenCreateProposal,
  onSelectProposal
}: ProposalsViewProps) {
  const [activeFilterTab, setActiveFilterTab] = useState<"all" | "received" | "sent" | "accepted" | "revisions">("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const userNormEmail = (userEmail || "").toLowerCase();

  const filteredProposals = proposals.filter(p => {
    // Tab filter
    if (activeFilterTab === "received" && p.recipientEmail.toLowerCase() !== userNormEmail) return false;
    if (activeFilterTab === "sent" && p.senderEmail.toLowerCase() !== userNormEmail) return false;
    if (activeFilterTab === "accepted" && p.status !== "Accepted") return false;
    if (activeFilterTab === "revisions" && p.status !== "Changes Requested") return false;

    // Type filter
    if (selectedType !== "all" && p.type !== selectedType) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = p.title.toLowerCase().includes(q) ||
        p.projectTitle.toLowerCase().includes(q) ||
        p.senderName.toLowerCase().includes(q) ||
        p.recipientName.toLowerCase().includes(q) ||
        p.introduction.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case "Accepted": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "Changes Requested": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "Under Review": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Rejected": return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "Withdrawn": return "bg-white/10 text-white/50 border-white/20";
      default: return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#121422] via-[#0E1019] to-black border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-widest">
              <FileText className="w-3.5 h-3.5" />
              <span>Studio & Crew Proposal Management</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Production Proposals & Deal Memos
            </h1>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Create, review, negotiate, and execute official cinema proposals across Co-Production, VFX/CGI, Original Score, Equipment Rental, Theatrical Distribution, and HOD Crew services with CineVenue milestone escrow guarantees.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onOpenCreateProposal}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-black" />
              <span>Create New Proposal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Category / Scope Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
        {[
          { id: "all", label: "All Proposals" },
          { id: "received", label: "Received Proposals" },
          { id: "sent", label: "Sent Proposals" },
          { id: "accepted", label: "Accepted Deals" },
          { id: "revisions", label: "Needs Revision" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilterTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activeFilterTab === tab.id
                ? "bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20 font-black"
                : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#101118] border border-white/10 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search proposals by title, film project, recipient studio, or proposer..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <label className="text-[11px] font-bold text-white/40 uppercase shrink-0">Category:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#141622] text-white">All Categories</option>
              <option value="Film Co-Production" className="bg-[#141622] text-white">Film Co-Production</option>
              <option value="Investor & Financing Pitch" className="bg-[#141622] text-white">Investor & Financing Pitch</option>
              <option value="HOD Crew Services" className="bg-[#141622] text-white">HOD Crew Services</option>
              <option value="VFX & CGI Services" className="bg-[#141622] text-white">VFX & CGI Services</option>
              <option value="Music & Sound Design" className="bg-[#141622] text-white">Music & Sound Design</option>
              <option value="Camera & Equipment Rental" className="bg-[#141622] text-white">Camera & Equipment Rental</option>
              <option value="Theatrical / OTT Distribution" className="bg-[#141622] text-white">Theatrical / OTT Distribution</option>
            </select>
          </div>

          <div className="text-xs font-semibold text-white/50">
            Showing <strong className="text-amber-400">{filteredProposals.length}</strong> active proposals
          </div>
        </div>
      </div>

      {/* Proposals Grid */}
      {filteredProposals.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-[#101118] border border-white/10 space-y-3">
          <FileText className="w-12 h-12 text-white/20 mx-auto" />
          <h3 className="text-base font-bold text-white">No proposals match your current selection</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            Try adjusting your search criteria or create a new proposal to collaborate with filmmakers and studios.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProposals.map(proposal => (
            <div
              key={proposal.id}
              onClick={() => onSelectProposal(proposal)}
              className="rounded-3xl bg-[#11121A] border border-white/10 hover:border-amber-500/40 p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="space-y-3">
                {/* Header Pills */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-black uppercase border border-amber-500/25">
                        {proposal.type}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(proposal.status)}`}>
                        {proposal.status}
                      </span>
                      {proposal.currentRevisionNumber > 1 && (
                        <span className="text-[10px] text-white/50">v{proposal.currentRevisionNumber}</span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors pt-1 line-clamp-2">
                      {proposal.title}
                    </h3>

                    <div className="text-xs text-white/60">
                      Film Project: <strong className="text-white">{proposal.projectTitle}</strong>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-amber-400 block">
                      ₹{proposal.budgetTotal.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-white/40">{proposal.timelineWeeks} Weeks</span>
                  </div>
                </div>

                {/* Pitch Summary */}
                <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                  {proposal.introduction}
                </p>

                {/* Sender & Recipient bar */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase font-bold block">From</span>
                    <span className="font-bold text-white truncate block">{proposal.senderName}</span>
                    <span className="text-[10px] text-white/50 truncate block">{proposal.senderCompany || proposal.senderRole}</span>
                  </div>
                  <div className="border-l border-white/10 pl-2">
                    <span className="text-[10px] text-white/40 uppercase font-bold block">To</span>
                    <span className="font-bold text-white truncate block">{proposal.recipientName}</span>
                    <span className="text-[10px] text-white/50 truncate block">{proposal.recipientCompany || "Studio"}</span>
                  </div>
                </div>

                {/* Scope & Milestones preview */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/60">
                  <span className="px-2 py-0.5 rounded-lg bg-white/5">
                    {proposal.paymentMilestones.length} Milestones
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-white/5">
                    {proposal.deliverables?.length || 0} Deliverables
                  </span>
                  {proposal.status === "Accepted" && (
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/25 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Executed Contract
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[10px] text-white/40">Created: {proposal.createdAt}</span>
                <span className="text-amber-400 font-bold text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
