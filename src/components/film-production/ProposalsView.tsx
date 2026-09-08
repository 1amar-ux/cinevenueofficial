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
  Send, AlertCircle, X, Check, ArrowDownLeft, ArrowUpRight
} from "lucide-react";
import { updateProposalStatus } from "../../services/filmProductionService";

interface ProposalsViewProps {
  proposals: Proposal[];
  projects: FilmProject[];
  userEmail?: string | null;
  onOpenCreateProposal: () => void;
  onSelectProposal: (proposal: Proposal) => void;
  onRefreshProposals?: () => void;
}

const PROPOSAL_STATUS_TABS: (ProposalStatus | "All")[] = [
  "All",
  "Sent",
  "Received",
  "Drafts",
  "Accepted",
  "Rejected",
  "Changes Requested",
  "Expired",
  "Withdrawn"
];

const CANONICAL_PROPOSAL_TYPES: ProposalType[] = [
  "Acting Proposal",
  "Crew Proposal",
  "Production Proposal",
  "Direction Proposal",
  "Cinematography Proposal",
  "Editing Proposal",
  "Music Proposal",
  "VFX Proposal",
  "Service Proposal",
  "Collaboration Proposal",
  "Other"
];

export default function ProposalsView({
  proposals,
  projects,
  userEmail,
  onOpenCreateProposal,
  onSelectProposal,
  onRefreshProposals
}: ProposalsViewProps) {
  const normEmail = (userEmail || "").toLowerCase();

  const [activeTab, setActiveTab] = useState<ProposalStatus | "All">("All");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Counter proposal / changes request state
  const [changeRequestTarget, setChangeRequestTarget] = useState<Proposal | null>(null);
  const [changeNotes, setChangeNotes] = useState("");
  const [counterBudget, setCounterBudget] = useState("");

  const filteredProposals = proposals.filter(p => {
    // Status tab filter
    if (activeTab === "Sent" && p.senderEmail?.toLowerCase() !== normEmail) return false;
    if (activeTab === "Received" && p.recipientEmail?.toLowerCase() !== normEmail) return false;
    if (activeTab === "Drafts" && p.status !== "Draft" && p.status !== "Drafts") return false;
    if (activeTab === "Accepted" && p.status !== "Accepted") return false;
    if (activeTab === "Rejected" && p.status !== "Rejected") return false;
    if (activeTab === "Changes Requested" && p.status !== "Changes Requested") return false;
    if (activeTab === "Expired" && p.status !== "Expired") return false;
    if (activeTab === "Withdrawn" && p.status !== "Withdrawn") return false;

    // Type filter
    if (selectedTypeFilter !== "all" && p.type !== selectedTypeFilter) return false;

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

  const handleAction = (proposalId: string, nextStatus: ProposalStatus, notes?: string) => {
    updateProposalStatus(proposalId, nextStatus, { reviewNotes: notes });
    if (onRefreshProposals) onRefreshProposals();
  };

  const handleSubmitChangesRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeRequestTarget) return;

    handleAction(
      changeRequestTarget.id, 
      "Changes Requested", 
      `Changes Requested / Counter: ${changeNotes} ${counterBudget ? `(Proposed Budget: ${counterBudget})` : ""}`
    );
    setChangeRequestTarget(null);
    setChangeNotes("");
    setCounterBudget("");
  };

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case "Accepted": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "Changes Requested": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "Sent": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Received": return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "Rejected": return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "Expired": return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      case "Withdrawn": return "bg-white/10 text-white/50 border-white/20";
      case "Draft":
      case "Drafts": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      default: return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#121422] via-[#0E1019] to-black border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-widest">
              <FileText className="w-3.5 h-3.5" />
              <span>Production Proposal Management</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Proposal Form & My Proposals
            </h1>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Create and manage professional proposals related to your Film Projects. Support for Acting, Crew, Direction, Cinematography, VFX, and Co-Production pitches. Acceptance indicates mutual agreement and does not auto-bind a legal contract.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onOpenCreateProposal}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-black" />
              <span>+ Proposal Form</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8-STATUS CANONICAL NAVIGATION TABS */}
      <div className="bg-[#0E0F18] border border-white/10 rounded-2xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {PROPOSAL_STATUS_TABS.map(st => {
            const count = st === "All" 
              ? proposals.length
              : st === "Sent" 
              ? proposals.filter(p => p.senderEmail?.toLowerCase() === normEmail).length
              : st === "Received"
              ? proposals.filter(p => p.recipientEmail?.toLowerCase() === normEmail).length
              : st === "Drafts"
              ? proposals.filter(p => p.status === "Draft" || p.status === "Drafts").length
              : proposals.filter(p => p.status === st).length;

            return (
              <button
                key={st}
                onClick={() => setActiveTab(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === st
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                <span>{st}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search & Type filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-[#141524] border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Proposal Types</option>
            {CANONICAL_PROPOSAL_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <div className="relative w-full sm:w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Legal Disclaimer Alert */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>
          <strong>Commercial Terms Notice:</strong> Accepting a proposal indicates commercial alignment between filmmakers and talent/studios. Formal legal contracts require independent digital sign-off.
        </span>
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0E0F18] border border-white/10 space-y-3">
          <FileText className="w-12 h-12 text-white/20 mx-auto" />
          <h3 className="text-base font-bold text-white">No proposals in this category</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            You don't have any proposals matching this filter. Click "+ Proposal Form" to create a proposal linked to your Film Project.
          </p>
          <button
            onClick={onOpenCreateProposal}
            className="px-5 py-2.5 bg-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
          >
            + Proposal Form
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProposals.map(p => {
            const isSender = p.senderEmail?.toLowerCase() === normEmail;
            const isRecipient = p.recipientEmail?.toLowerCase() === normEmail;

            return (
              <div 
                key={p.id}
                className="rounded-2xl bg-[#0F1019] border border-white/10 p-5 hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-xl space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Meta */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      {p.type}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Title & Project */}
                  <div>
                    <h3 className="text-base font-black text-white line-clamp-1">{p.title}</h3>
                    <p className="text-xs text-amber-400 font-bold mt-0.5">Project: {p.projectTitle}</p>
                  </div>

                  {/* Sender & Recipient */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/70">
                    <div className="truncate">
                      <span className="text-[10px] text-white/40 block">From (Proposer)</span>
                      <span className="text-white font-medium truncate block">{p.senderName}</span>
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] text-white/40 block">To (Recipient)</span>
                      <span className="text-white font-medium truncate block">{p.recipientName}</span>
                    </div>
                  </div>

                  {/* Pitch Summary */}
                  <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                    {p.introduction}
                  </p>

                  {/* Commercials: Timeline & Budget */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-white/80">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{p.timelineWeeks ? `${p.timelineWeeks} Weeks Timeline` : "Flexible"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-400 font-black">
                      <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                      <span>{p.currency} {p.budgetTotal?.toLocaleString("en-IN") || "Negotiable"}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectProposal(p)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Proposal</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Draft Actions */}
                    {(p.status === "Draft" || p.status === "Drafts") && isSender && (
                      <>
                        <button
                          onClick={() => onSelectProposal(p)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 text-amber-300 hover:bg-white/15 text-xs font-bold"
                        >
                          Edit Draft
                        </button>
                        <button
                          onClick={() => handleAction(p.id, "Sent")}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-black text-xs uppercase"
                        >
                          Send
                        </button>
                      </>
                    )}

                    {/* Recipient Review Actions */}
                    {(p.status === "Sent" || p.status === "Under Review" || p.status === "Changes Requested") && isRecipient && (
                      <>
                        <button
                          onClick={() => handleAction(p.id, "Accepted")}
                          title="Accept Proposal"
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => setChangeRequestTarget(p)}
                          title="Request Changes"
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold cursor-pointer"
                        >
                          Changes
                        </button>
                        <button
                          onClick={() => handleAction(p.id, "Rejected")}
                          title="Reject"
                          className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {/* Sender Withdraw */}
                    {isSender && (p.status === "Sent" || p.status === "Changes Requested") && (
                      <button
                        onClick={() => handleAction(p.id, "Withdrawn")}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[11px] font-bold"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REQUEST CHANGES / COUNTER PROPOSAL MODAL */}
      {changeRequestTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0F1018] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-auto p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-base font-black text-white">Request Changes / Counter Proposal</h2>
                <p className="text-white/60 text-[11px]">{changeRequestTarget.title}</p>
              </div>
              <button
                onClick={() => setChangeRequestTarget(null)}
                className="text-white/60 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitChangesRequest} className="space-y-4">
              <div>
                <label className="block text-white/70 font-bold mb-1">Requested Adjustments & Scope Notes *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail changes required in deliverables, shooting days, equipment package, or timeline..."
                  value={changeNotes}
                  onChange={(e) => setChangeNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Counter Proposed Budget (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ₹12,50,000 (INR)"
                  value={counterBudget}
                  onChange={(e) => setCounterBudget(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setChangeRequestTarget(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider shadow-lg shadow-amber-500/20"
                >
                  Send Changes Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
