import React from "react";
import { 
  Film, FileText, PlusCircle, ArrowRight, Sparkles, 
  Send, Inbox, Edit3, Clock, MessageSquare, CheckCircle2, 
  XCircle, Layers, Users, Bell, ChevronRight, Calendar, MapPin
} from "lucide-react";
import { 
  Proposal, 
  ProposalStatus,
  ProfessionalProfile,
  FilmProject
} from "../../types/filmProductionMarketplace";
import { getProposalNotifications, markProposalNotificationRead } from "../../services/filmProductionService";

interface ProductionHomeViewProps {
  userEmail?: string | null;
  projects?: FilmProject[];
  proposals: Proposal[];
  myProfile?: ProfessionalProfile;
  onNavigateTab: (tabId: string) => void;
  onCreateProposal: () => void;
  onSelectProposal?: (proposal: Proposal) => void;
  // Optional compatibility props
  castingCalls?: any[];
  auditions?: any[];
  onCreateProject?: () => void;
  onCreateCastingCall?: () => void;
  onOpenProfileEditor?: () => void;
}

export default function ProductionHomeView({
  userEmail,
  proposals,
  myProfile,
  onNavigateTab,
  onCreateProposal,
  onSelectProposal
}: ProductionHomeViewProps) {
  const normEmail = (userEmail || "filmmaker@cinevenue.com").toLowerCase();
  const userName = myProfile?.fullName || (userEmail ? userEmail.split("@")[0] : "Filmmaker");

  // Filtered proposal counts
  const sentCount = proposals.filter(p => 
    p.senderEmail?.toLowerCase() === normEmail && 
    !["DRAFT", "Draft", "Drafts"].includes(p.status)
  ).length;

  const receivedCount = proposals.filter(p => 
    p.recipientEmail?.toLowerCase() === normEmail && 
    !["DRAFT", "Draft", "Drafts"].includes(p.status)
  ).length;

  const draftsCount = proposals.filter(p => 
    ["DRAFT", "Draft", "Drafts"].includes(p.status) &&
    (!p.senderEmail || p.senderEmail?.toLowerCase() === normEmail)
  ).length;

  const pendingCount = proposals.filter(p => {
    const s = String(p.status).toUpperCase();
    return s === "SENT" || s === "RECEIVED" || s === "UNDER_REVIEW" || s === "PENDING";
  }).length;

  const negotiationCount = proposals.filter(p => {
    const s = String(p.status).toUpperCase();
    return s === "NEGOTIATION" || s === "CHANGES REQUESTED" || p.status === "Changes Requested";
  }).length;

  const acceptedCount = proposals.filter(p => 
    String(p.status).toUpperCase() === "ACCEPTED"
  ).length;

  const rejectedCount = proposals.filter(p => 
    String(p.status).toUpperCase() === "REJECTED"
  ).length;

  // Recent proposals for user (sent, received, or all relevant)
  const recentProposals = proposals
    .filter(p => 
      !userEmail || 
      p.senderEmail?.toLowerCase() === normEmail || 
      p.recipientEmail?.toLowerCase() === normEmail ||
      ["DRAFT", "Draft", "Drafts"].includes(p.status)
    )
    .slice(0, 5);

  const notifications = getProposalNotifications(userEmail || undefined);
  const unreadNotifs = notifications.filter(n => !n.read);

  const getStatusBadge = (status: ProposalStatus) => {
    const s = String(status).toUpperCase();
    switch (s) {
      case "ACCEPTED":
        return {
          icon: "🟢",
          label: "Accepted",
          cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        };
      case "NEGOTIATION":
      case "CHANGES REQUESTED":
        return {
          icon: "🟠",
          label: "Negotiation",
          cls: "bg-amber-500/10 text-amber-400 border-amber-500/20"
        };
      case "UNDER_REVIEW":
        return {
          icon: "🔵",
          label: "Under Review",
          cls: "bg-sky-500/10 text-sky-400 border-sky-500/20"
        };
      case "SENT":
      case "RECEIVED":
      case "PENDING":
        return {
          icon: "🟡",
          label: "Pending",
          cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
        };
      case "REJECTED":
        return {
          icon: "🔴",
          label: "Rejected",
          cls: "bg-rose-500/10 text-rose-400 border-rose-500/20"
        };
      case "DRAFT":
      case "DRAFTS":
        return {
          icon: "⚪",
          label: "Draft",
          cls: "bg-white/10 text-white/60 border-white/10"
        };
      case "WITHDRAWN":
        return {
          icon: "⚪",
          label: "Withdrawn",
          cls: "bg-white/10 text-white/50 border-white/10"
        };
      default:
        return {
          icon: "🟡",
          label: String(status),
          cls: "bg-gold/10 text-gold border-gold/20"
        };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12 select-none">
      
      {/* 1. HERO HEADER: CineVenue Movie Production Dashboard */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#12131C] via-[#0E0F17] to-black border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-black uppercase tracking-widest">
              <Film className="w-3.5 h-3.5" />
              <span>CineVenue Movie Production</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Welcome, <span className="text-gold capitalize">{userName}</span>
            </h1>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Manage all departmental film proposals, track response statuses, negotiate project terms privately, and connect across all 24 professional movie crafts.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={onCreateProposal}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-gold/20 flex items-center gap-2 cursor-pointer border-0"
            >
              <PlusCircle className="w-4 h-4 text-black stroke-[2.5]" />
              <span>+ Create Proposal</span>
            </button>

            <button
              onClick={() => onNavigateTab("crafts")}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/10 flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-gold" />
              <span>24 Crafts</span>
            </button>

            <button
              onClick={() => onNavigateTab("professionals")}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/10 flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-gold" />
              <span>Find Talent</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. PROPOSAL NOTIFICATIONS BANNER (if unread) */}
      {unreadNotifs.length > 0 && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{unreadNotifs[0].title}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
              </div>
              <p className="text-[11px] text-white/70 mt-0.5">
                {unreadNotifs[0].message}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              markProposalNotificationRead(unreadNotifs[0].id);
              onNavigateTab("proposals");
            }}
            className="px-3 py-1.5 rounded-lg bg-gold hover:bg-gold-light text-black text-xs font-bold transition-all cursor-pointer border-0 shrink-0"
          >
            View Proposal
          </button>
        </div>
      )}

      {/* 3. MY PROPOSALS SUMMARY CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gold" />
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              My Proposals
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab("proposals")}
            className="text-xs font-bold text-gold hover:text-gold-light flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Sent */}
          <div 
            onClick={() => onNavigateTab("proposals")}
            className="p-4 rounded-2xl bg-[#111218] border border-white/10 hover:border-gold/30 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <Send className="w-3.5 h-3.5 text-blue-400" />
                <span>Sent</span>
              </span>
            </div>
            <div className="text-2xl font-black text-white mt-2 font-mono">
              {sentCount}
            </div>
          </div>

          {/* Received */}
          <div 
            onClick={() => onNavigateTab("proposals")}
            className="p-4 rounded-2xl bg-[#111218] border border-white/10 hover:border-gold/30 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <Inbox className="w-3.5 h-3.5 text-purple-400" />
                <span>Received</span>
              </span>
            </div>
            <div className="text-2xl font-black text-white mt-2 font-mono">
              {receivedCount}
            </div>
          </div>

          {/* Drafts */}
          <div 
            onClick={() => onNavigateTab("proposals")}
            className="p-4 rounded-2xl bg-[#111218] border border-white/10 hover:border-gold/30 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                <span>Drafts</span>
              </span>
            </div>
            <div className="text-2xl font-black text-white mt-2 font-mono">
              {draftsCount}
            </div>
          </div>

          {/* Pending */}
          <div 
            onClick={() => onNavigateTab("proposals")}
            className="p-4 rounded-2xl bg-[#111218] border border-white/10 hover:border-gold/30 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-yellow-400" />
                <span>Pending</span>
              </span>
            </div>
            <div className="text-2xl font-black text-yellow-400 mt-2 font-mono">
              {pendingCount}
            </div>
          </div>

          {/* Negotiation */}
          <div 
            onClick={() => onNavigateTab("proposals")}
            className="p-4 rounded-2xl bg-[#111218] border border-white/10 hover:border-gold/30 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Negotiation</span>
              </span>
            </div>
            <div className="text-2xl font-black text-amber-400 mt-2 font-mono">
              {negotiationCount}
            </div>
          </div>

          {/* Accepted */}
          <div 
            onClick={() => onNavigateTab("proposals")}
            className="p-4 rounded-2xl bg-[#111218] border border-white/10 hover:border-gold/30 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Accepted</span>
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
              {acceptedCount}
            </div>
          </div>

          {/* Rejected */}
          <div 
            onClick={() => onNavigateTab("proposals")}
            className="p-4 rounded-2xl bg-[#111218] border border-white/10 hover:border-gold/30 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Rejected</span>
              </span>
            </div>
            <div className="text-2xl font-black text-rose-400 mt-2 font-mono">
              {rejectedCount}
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECENT PROPOSALS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold" />
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Recent Proposals
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab("proposals")}
            className="text-xs font-bold text-gold hover:text-gold-light flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All Proposals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentProposals.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#111218] border border-white/10 text-center space-y-3">
            <FileText className="w-10 h-10 text-white/20 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Proposals Yet</h3>
            <p className="text-xs text-white/60 max-w-md mx-auto">
              Start a new collaboration proposal for any of the 24 production crafts or select a verified professional.
            </p>
            <button
              onClick={onCreateProposal}
              className="px-4 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              + Create First Proposal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProposals.map((prop) => {
              const badge = getStatusBadge(prop.status);
              return (
                <div
                  key={prop.id}
                  onClick={() => {
                    if (onSelectProposal) {
                      onSelectProposal(prop);
                    } else {
                      onNavigateTab("proposals");
                    }
                  }}
                  className="p-5 rounded-2xl bg-[#111218] border border-white/10 hover:border-gold/40 hover:bg-[#151720] transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-lg group"
                >
                  <div className="space-y-2">
                    {/* Top Row: Proposal ID & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-gold/90">
                        {prop.proposalNumber || prop.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${badge.cls}`}>
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    {/* Craft & Project */}
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-white/40">
                        {prop.craftName || "Production"} {prop.role ? `• ${prop.role}` : ""}
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-gold transition-colors mt-0.5 line-clamp-1">
                        {prop.projectName || prop.projectTitle}
                      </h3>
                    </div>

                    {/* Recipient / Sender Info */}
                    <div className="text-xs text-white/60 space-y-0.5 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-white/40">From:</span>
                        <span className="text-white/80 font-medium truncate max-w-[160px]">{prop.senderName}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-white/40">To:</span>
                        <span className="text-white/80 font-medium truncate max-w-[160px]">{prop.recipientName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
                    <span>{prop.createdAt}</span>
                    <span className="text-gold font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>Open</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2 text-center">
          <button
            onClick={() => onNavigateTab("proposals")}
            className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-gold hover:text-black text-white text-xs font-bold uppercase tracking-wider border border-white/10 transition-all cursor-pointer"
          >
            [View All Proposals]
          </button>
        </div>
      </div>
    </div>
  );
}
