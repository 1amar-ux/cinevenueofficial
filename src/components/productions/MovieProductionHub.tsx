import React, { useState, useEffect } from "react";
import { Sparkles, ArrowLeft, Clapperboard, Film, ArrowRight, Clock, CheckCircle2, ChevronRight, Copy, Check, FileText } from "lucide-react";
import CineVenueLogo from "../CineVenueLogo";
import { MovieProductionProposalForm } from "../proposals/MovieProductionProposalForm";
import { Proposal } from "../../types";

interface MovieProductionHubProps {
  userEmail?: string | null;
  onOpenAuth?: () => void;
  onNavigateHome?: () => void;
}

export default function MovieProductionHub({
  userEmail,
  onOpenAuth,
  onNavigateHome = () => (window.location.href = "/")
}: MovieProductionHubProps) {
  const [recentProposals, setRecentProposals] = useState<Proposal[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadRecentProposals = () => {
    try {
      const stored = localStorage.getItem("cinevenue_submitted_proposals");
      if (stored) {
        const list: Proposal[] = JSON.parse(stored);
        setRecentProposals(list);
      }
    } catch (e) {
      console.warn("Could not load recent proposals:", e);
    }
  };

  useEffect(() => {
    loadRecentProposals();
    const handleSync = () => loadRecentProposals();
    window.addEventListener("cinevenue-proposals-updated", handleSync);
    return () => window.removeEventListener("cinevenue-proposals-updated", handleSync);
  }, []);

  const copyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getStatusBadge = (status?: string) => {
    const s = String(status || "NEW").toUpperCase();
    switch (s) {
      case "APPROVED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Approved</span>;
      case "UNDER REVIEW":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">Under Review</span>;
      case "CONTACTED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">Contacted</span>;
      case "REJECTED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Declined</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Pending Review</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans selection:bg-[#D4AF37] selection:text-black flex flex-col justify-between relative overflow-x-hidden" id="movie-production-page">
      {/* Background cinematic aura decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#D4AF37]/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-48 -left-32 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-96 -right-32 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0B0B10]/95 backdrop-blur-md sticky top-0 z-40 shadow-xl shadow-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3.5 cursor-pointer" onClick={onNavigateHome}>
              <CineVenueLogo size="sm" />
              <div>
                <div className="text-sm sm:text-base font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                  CINEVENUE <span className="text-[#D4AF37] font-serif font-normal italic">Productions</span>
                </div>
                <div className="text-[9px] sm:text-[10px] text-gray-400 tracking-widest uppercase font-mono">
                  Film Production & Entertainment Directorate
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => window.location.href = "/settings?section=proposals"}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-amber-300 border border-[#D4AF37]/30 transition-all cursor-pointer"
                title="View your submitted proposal reviews in Settings"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Reviews in Settings</span>
              </button>

              <button
                type="button"
                onClick={onNavigateHome}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-gold/30 transition-all cursor-pointer flex items-center gap-2"
                title="Return to Home"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-gold" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Home</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area: Responsive Grid (Form on Left/Center, Side Status Card on Right) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-12 relative z-10">
        
        {/* Hero Header */}
        <div className="text-center space-y-3 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-widest">
            <Film className="w-3.5 h-3.5 text-gold" />
            <span>Turnkey Film Production & Entertainment</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-white tracking-tight uppercase">
            Movie Production Proposal Form
          </h1>
          <p className="text-xs sm:text-sm text-white/60 max-w-2xl mx-auto leading-relaxed">
            Share your movie production requirements with CineVenue. Our team will review your proposal and contact you to discuss the best collaboration plan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Column: The Movie Proposal Form Card */}
          <div className="lg:col-span-8 bg-[#0D0D12] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl relative">
            <MovieProductionProposalForm
              userEmail={userEmail || ""}
              userName={userEmail ? userEmail.split("@")[0] : ""}
              onSuccess={() => {
                loadRecentProposals();
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
            />
          </div>

          {/* Side Column: Reviews in Settings Notice & Status Tracker */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* 1. Primary Notice Card */}
            <div className="bg-gradient-to-b from-[#14131B] via-[#0E0E14] to-[#0A0A0E] border-2 border-[#D4AF37]/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 text-[#D4AF37] font-extrabold text-xs uppercase tracking-wider mb-3">
                <Sparkles className="w-4 h-4 fill-[#D4AF37]" />
                <span>Proposal Status & Reviews</span>
              </div>

              {/* Exact user-requested notice text */}
              <div className="p-3.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-amber-200 text-xs sm:text-sm font-bold leading-relaxed mb-4 shadow-inner">
                -- your submitted proposal forms reviews status will displayed in settings
              </div>

              <p className="text-xs text-white/70 leading-relaxed mb-4">
                After you submit your film proposal, our executive film committee reviews the concept, budget, and services. You can track real-time evaluation updates, Directorate notes, and approval status directly inside your CineVenue Settings.
              </p>

              <button
                type="button"
                onClick={() => window.location.href = "/settings?section=proposals"}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#F3E5AB] hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#D4AF37]/25 flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                <span>View Reviews in Settings</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* 2. Live Submissions Tracker on this device */}
            {recentProposals.length > 0 && (
              <div className="bg-[#0D0D12] border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gold" />
                    <span>Your Submitted Proposals</span>
                  </span>
                  <span className="text-[10px] font-bold text-gold font-mono bg-gold/10 px-2 py-0.5 rounded-full">
                    {recentProposals.length} Total
                  </span>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {recentProposals.slice(0, 4).map((p) => (
                    <div
                      key={p.proposalId}
                      onClick={() => window.location.href = "/settings?section=proposals"}
                      className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-gold/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[11px] font-bold text-gold flex items-center gap-1">
                          <span>{p.proposalId}</span>
                          <button
                            type="button"
                            onClick={(e) => copyId(p.proposalId, e)}
                            className="p-0.5 hover:text-white"
                            title="Copy ID"
                          >
                            {copiedId === p.proposalId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-white/50 group-hover:text-gold" />}
                          </button>
                        </span>
                        {getStatusBadge(p.status)}
                      </div>

                      <div className="text-xs font-semibold text-white truncate group-hover:text-gold transition-colors">
                        {p.projectName || "Movie Project Proposal"}
                      </div>

                      <div className="text-[10px] text-white/50 flex items-center justify-between mt-1">
                        <span>{new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span className="text-amber-400 group-hover:underline flex items-center gap-0.5 font-bold">
                          <span>Check Review</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. CineVenue Directorate Guarantee Card */}
            <div className="bg-[#0B0B0E] border border-white/5 rounded-2xl p-5 space-y-3 text-xs text-white/70">
              <div className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>CineVenue Evaluation Standard</span>
              </div>
              <ul className="space-y-2 text-white/60 text-[11px] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-gold font-bold">•</span>
                  <span><strong>Review Window:</strong> Every proposal receives initial technical feasibility review within 24–48 hours.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold font-bold">•</span>
                  <span><strong>Protected IP:</strong> Your script concept, characters, and treatment notes remain 100% confidential.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold font-bold">•</span>
                  <span><strong>Direct Liaison:</strong> A dedicated line producer or department lead is assigned upon approval.</span>
                </li>
              </ul>
            </div>

          </aside>

        </div>
      </main>

      {/* Footer Note */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-white/40 relative z-10">
        <p>© 2026 CineVenue Entertainments Pvt Ltd • Film Production & Entertainment Directorate</p>
      </footer>
    </div>
  );
}
