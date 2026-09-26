import React, { useState } from "react";
import { 
  Proposal, 
  ProposalType, 
  ProposalStatus,
  FilmProject 
} from "../../types/filmProductionMarketplace";
import { 
  FileText, PlusCircle, Search, Filter, Calendar, 
  Clock, DollarSign, Building2, User, CheckCircle2, 
  RotateCcw, ShieldCheck, ArrowRight, Eye, ChevronRight,
  Send, AlertCircle, X, Check, ArrowDownLeft, ArrowUpRight,
  MessageSquare, Trash2, Ban, Edit, Info
} from "lucide-react";
import { 
  updateProposalStatus, 
  deleteProposalDraft 
} from "../../services/filmProductionService";
import { INITIAL_24_CRAFTS } from "../../data/filmProductionData";

interface ProposalsViewProps {
  proposals: Proposal[];
  projects: FilmProject[];
  userEmail?: string | null;
  onOpenCreateProposal: () => void;
  onSelectProposal: (proposal: Proposal) => void;
  onRefreshProposals?: () => void;
}

export type ProposalNavTab = 
  | "All" 
  | "Sent" 
  | "Received" 
  | "Drafts" 
  | "Pending" 
  | "Negotiation" 
  | "Accepted" 
  | "Rejected";

const PROPOSAL_NAV_TABS: ProposalNavTab[] = [
  "All",
  "Sent",
  "Received",
  "Drafts",
  "Pending",
  "Negotiation",
  "Accepted",
  "Rejected"
];

const CANONICAL_PROPOSAL_TYPES: ProposalType[] = [
  "Project Proposal",
  "Talent Proposal",
  "Crew Proposal",
  "Production Service Proposal",
  "Casting Proposal",
  "Music Proposal",
  "Technical Proposal",
  "Vendor Proposal",
  "Distribution Proposal",
  "Brand/Promotion Proposal"
];

export default function ProposalsView({
  proposals,
  projects,
  userEmail,
  onOpenCreateProposal,
  onSelectProposal,
  onRefreshProposals
}: ProposalsViewProps) {
  const normEmail = (userEmail || "user@cinevenue.com").toLowerCase();

  const [activeTab, setActiveTab] = useState<ProposalNavTab>("All");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [selectedCraftFilter, setSelectedCraftFilter] = useState<string>("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Rejection modal state for inline rejection
  const [rejectingProposal, setRejectingProposal] = useState<Proposal | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const getStatusBadge = (status: ProposalStatus | string) => {
    const s = String(status).toUpperCase();
    switch (s) {
      case "ACCEPTED":
        return { label: "Accepted", class: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: "🟢" };
      case "NEGOTIATION":
        return { label: "Negotiation", class: "bg-amber-500/20 text-amber-300 border-amber-500/30", icon: "🟠" };
      case "UNDER_REVIEW":
        return { label: "Under Review", class: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: "🔵" };
      case "SENT":
      case "RECEIVED":
        return { label: "Pending", class: "bg-amber-400/15 text-amber-300 border-amber-400/30", icon: "🟡" };
      case "REJECTED":
        return { label: "Rejected", class: "bg-rose-500/20 text-rose-300 border-rose-500/30", icon: "🔴" };
      case "WITHDRAWN":
        return { label: "Withdrawn", class: "bg-white/10 text-white/50 border-white/20", icon: "⚪" };
      case "DRAFT":
        return { label: "Draft", class: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30", icon: "⚪" };
      default:
        return { label: status, class: "bg-white/10 text-white/70 border-white/20", icon: "⚪" };
    }
  };

  const isProposalSentByUser = (p: Proposal) => {
    return Boolean(p.senderEmail && p.senderEmail.toLowerCase() === normEmail);
  };

  const isProposalReceivedByUser = (p: Proposal) => {
    return Boolean(p.recipientEmail && p.recipientEmail.toLowerCase() === normEmail);
  };

  // Filter proposals
  const filteredProposals = proposals.filter(p => {
    const normStatus = String(p.status).toUpperCase();

    // 8 Canonical Tabs Filtering
    if (activeTab === "Sent") {
      if (!isProposalSentByUser(p) || normStatus === "DRAFT") return false;
    } else if (activeTab === "Received") {
      if (!isProposalReceivedByUser(p) || normStatus === "DRAFT") return false;
    } else if (activeTab === "Drafts") {
      if (normStatus !== "DRAFT") return false;
    } else if (activeTab === "Pending") {
      if (normStatus !== "SENT" && normStatus !== "RECEIVED" && normStatus !== "UNDER_REVIEW") return false;
    } else if (activeTab === "Negotiation") {
      if (normStatus !== "NEGOTIATION") return false;
    } else if (activeTab === "Accepted") {
      if (normStatus !== "ACCEPTED") return false;
    } else if (activeTab === "Rejected") {
      if (normStatus !== "REJECTED") return false;
    }

    // Type filter
    if (selectedTypeFilter !== "all" && p.type !== selectedTypeFilter) return false;

    // Craft filter
    if (selectedCraftFilter !== "all" && p.craftId !== selectedCraftFilter && p.craftName !== selectedCraftFilter) return false;

    // Date filter
    if (selectedDateFilter !== "all" && p.createdAt) {
      const now = Date.now();
      const createdTime = new Date(p.createdAt).getTime();
      const diffDays = (now - createdTime) / (1000 * 60 * 60 * 24);
      if (selectedDateFilter === "7d" && diffDays > 7) return false;
      if (selectedDateFilter === "30d" && diffDays > 30) return false;
      if (selectedDateFilter === "90d" && diffDays > 90) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        (p.proposalNumber && p.proposalNumber.toLowerCase().includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q)) ||
        (p.projectName && p.projectName.toLowerCase().includes(q)) ||
        (p.projectTitle && p.projectTitle.toLowerCase().includes(q)) ||
        (p.craftName && p.craftName.toLowerCase().includes(q)) ||
        (p.role && p.role.toLowerCase().includes(q)) ||
        (p.senderName && p.senderName.toLowerCase().includes(q)) ||
        (p.recipientName && p.recipientName.toLowerCase().includes(q)) ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.introduction && p.introduction.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  // Proposal Counts for Tabs
  const getTabCount = (tab: ProposalNavTab) => {
    switch (tab) {
      case "All":
        return proposals.length;
      case "Sent":
        return proposals.filter(p => isProposalSentByUser(p) && String(p.status).toUpperCase() !== "DRAFT").length;
      case "Received":
        return proposals.filter(p => isProposalReceivedByUser(p) && String(p.status).toUpperCase() !== "DRAFT").length;
      case "Drafts":
        return proposals.filter(p => String(p.status).toUpperCase() === "DRAFT").length;
      case "Pending":
        return proposals.filter(p => {
          const s = String(p.status).toUpperCase();
          return s === "SENT" || s === "RECEIVED" || s === "UNDER_REVIEW";
        }).length;
      case "Negotiation":
        return proposals.filter(p => String(p.status).toUpperCase() === "NEGOTIATION").length;
      case "Accepted":
        return proposals.filter(p => String(p.status).toUpperCase() === "ACCEPTED").length;
      case "Rejected":
        return proposals.filter(p => String(p.status).toUpperCase() === "REJECTED").length;
    }
  };

  const handleStatusChange = (proposalId: string, nextStatus: ProposalStatus, extra?: any) => {
    updateProposalStatus(proposalId, nextStatus, extra);
    if (onRefreshProposals) onRefreshProposals();
  };

  const handleDeleteDraft = (e: React.MouseEvent, proposalId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this unsent proposal draft?")) {
      deleteProposalDraft(proposalId);
      if (onRefreshProposals) onRefreshProposals();
    }
  };

  const handleConfirmReject = () => {
    if (!rejectingProposal) return;
    handleStatusChange(rejectingProposal.id, "REJECTED", {
      rejectedReason: rejectionReason.trim() || undefined
    });
    setRejectingProposal(null);
    setRejectionReason("");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#121422] via-[#0E1019] to-black border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-widest">
              <FileText className="w-3.5 h-3.5" />
              <span>CineVenue Movie Production</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Proposals
            </h1>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Manage professional movie production proposals across all 24 crafts. Track proposal statuses, review deliverables, negotiate terms directly with creative partners, and align on film collaborations.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={onOpenCreateProposal}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 hover:from-amber-400 hover:to-yellow-200 text-black font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-black" />
              <span>+ Create Proposal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 CANONICAL PROPOSALS TABS (Section 5) */}
      <div className="bg-[#0E0F18] border border-white/10 rounded-2xl p-2.5 shadow-lg">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {PROPOSAL_NAV_TABS.map(tab => {
            const count = getTabCount(tab);
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? "bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${isActive ? "bg-black/20 text-black font-bold" : "bg-white/10 text-white/60"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTERS & SEARCH BAR (Section 22) */}
      <div className="bg-[#0E0F18] border border-white/10 rounded-2xl p-3 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-lg">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search proposal ID, project, craft, person..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400 transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Craft Filter */}
          <select
            value={selectedCraftFilter}
            onChange={(e) => setSelectedCraftFilter(e.target.value)}
            className="bg-[#141524] border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All 24 Crafts</option>
            {INITIAL_24_CRAFTS.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Proposal Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-[#141524] border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Proposal Types</option>
            {CANONICAL_PROPOSAL_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="bg-[#141524] border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Dates</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Proposals Grid */}
      {filteredProposals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0E0F18] border border-white/10 space-y-3">
          <FileText className="w-12 h-12 text-white/20 mx-auto" />
          <h3 className="text-base font-bold text-white">No proposals found in "{activeTab}"</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            {activeTab === "Drafts" 
              ? "You have no unsent proposal drafts at this time." 
              : `There are currently no proposals matching your selected filters.`}
          </p>
          <button
            onClick={onOpenCreateProposal}
            className="px-5 py-2.5 bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:bg-amber-300 transition-all"
          >
            + Create Proposal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProposals.map(p => {
            const isSender = isProposalSentByUser(p);
            const isRecipient = isProposalReceivedByUser(p);
            const normStatus = String(p.status).toUpperCase();
            const badge = getStatusBadge(p.status);

            return (
              <div 
                key={p.id}
                onClick={() => onSelectProposal(p)}
                className="group rounded-3xl bg-[#0B0C12] border border-white/10 hover:border-amber-400/50 p-5 sm:p-6 transition-all flex flex-col justify-between shadow-xl space-y-4 cursor-pointer relative"
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Proposal ID, Type, Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/20">
                        {p.proposalNumber || p.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/5 text-white/70 border border-white/10">
                        {p.type}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border flex items-center gap-1 ${badge.class}`}>
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  {/* Project Title & Craft/Role */}
                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {p.projectName || p.projectTitle || "Movie Project"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                      <span className="text-amber-400 font-bold">{p.craftName || "Craft"}</span>
                      <span>•</span>
                      <span className="text-white font-medium">{p.role || "Role"}</span>
                    </div>
                  </div>

                  {/* Sender & Recipient Box */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-[11px]">
                    <div className="truncate">
                      <span className="text-[10px] text-white/40 block mb-0.5">From</span>
                      <span className="text-white font-medium truncate block">{p.senderName}</span>
                      <span className="text-white/40 text-[10px] block">{p.senderRole || "Producer"}</span>
                    </div>
                    <div className="truncate border-l border-white/5 pl-2">
                      <span className="text-[10px] text-white/40 block mb-0.5">Sent To</span>
                      <span className="text-white font-medium truncate block">{p.recipientName}</span>
                      <span className="text-white/40 text-[10px] block">{p.role || "Professional"}</span>
                    </div>
                  </div>

                  {/* Commercials Summary (Informational) */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-white/40 block">Proposed Fee (Info)</span>
                      <span className="font-black text-amber-400 text-sm">
                        {p.proposedFee || p.budgetTotal 
                          ? `₹${Number(p.proposedFee || p.budgetTotal).toLocaleString("en-IN")}`
                          : "Negotiable"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 block">Timeline</span>
                      <span className="text-white font-semibold">
                        {p.duration || `${p.timelineWeeks || 8} Weeks`}
                      </span>
                    </div>
                  </div>

                  {/* Date & Location */}
                  <div className="flex items-center justify-between text-[11px] text-white/40 pt-1">
                    <span>Date: {p.createdAt}</span>
                    <span className="truncate max-w-[150px]">{p.location || "Hyderabad"}</span>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div 
                  className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onSelectProposal(p)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>View</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Draft Actions (Section 13) */}
                    {normStatus === "DRAFT" && (
                      <>
                        <button
                          type="button"
                          onClick={() => onSelectProposal(p)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-bold cursor-pointer flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3 text-amber-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(p.id, "SENT")}
                          className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteDraft(e, p.id)}
                          title="Delete Draft"
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-300 cursor-pointer transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {/* Sent Proposal Actions (Section 11) */}
                    {isSender && normStatus !== "DRAFT" && normStatus !== "ACCEPTED" && normStatus !== "REJECTED" && normStatus !== "WITHDRAWN" && (
                      <>
                        <button
                          type="button"
                          onClick={() => onSelectProposal(p)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold cursor-pointer flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Message</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(p.id, "WITHDRAWN")}
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/15 text-white/50 hover:text-rose-300 text-xs font-medium cursor-pointer"
                        >
                          Withdraw
                        </button>
                      </>
                    )}

                    {/* Received Proposal Actions (Section 12) */}
                    {isRecipient && normStatus !== "DRAFT" && normStatus !== "ACCEPTED" && normStatus !== "REJECTED" && normStatus !== "WITHDRAWN" && (
                      <>
                        <button
                          type="button"
                          onClick={() => onSelectProposal(p)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold cursor-pointer flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Negotiate</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectingProposal(p)}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(p.id, "ACCEPTED")}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Accept</span>
                        </button>
                      </>
                    )}

                    {/* Accepted Proposal Actions (Section 17) */}
                    {normStatus === "ACCEPTED" && (
                      <button
                        type="button"
                        onClick={() => onSelectProposal(p)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-400" />
                        <span>Continue Discussion</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Proposal Modal */}
      {rejectingProposal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#11121A] border border-rose-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <X className="w-5 h-5 text-rose-400" />
              <span>Decline Proposal</span>
            </h3>
            <p className="text-xs text-white/60">
              Decline proposal <strong>{rejectingProposal.proposalNumber || rejectingProposal.id}</strong> for {rejectingProposal.projectName}.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-white/70 mb-1">Reason (Optional)</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Schedule conflicts, dates not suitable..."
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRejectingProposal(null);
                  setRejectionReason("");
                }}
                className="px-4 py-2 rounded-xl bg-white/5 text-white/70 text-xs font-bold hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Decline Proposal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
