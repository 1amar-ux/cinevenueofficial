import React from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import CineVenueLogo from "../CineVenueLogo";
import { ProposalSubmitForm } from "../proposals/ProposalSubmitForm";

interface EventManagementHubProps {
  userEmail?: string | null;
  onOpenAuth?: () => void;
  onNavigateHome?: () => void;
}

export default function EventManagementHub({
  userEmail,
  onOpenAuth,
  onNavigateHome = () => (window.location.href = "/")
}: EventManagementHubProps) {
  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans selection:bg-[#D4AF37] selection:text-black flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0B0B10]/95 backdrop-blur-md sticky top-0 z-40 shadow-xl shadow-black/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3.5 cursor-pointer" onClick={onNavigateHome}>
              <CineVenueLogo size="sm" />
              <div>
                <div className="text-sm sm:text-base font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                  CINEVENUE <span className="text-[#D4AF37] font-serif font-normal italic">Events</span>
                </div>
                <div className="text-[9px] sm:text-[10px] text-gray-400 tracking-widest uppercase font-mono">
                  Event Management & Production
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onNavigateHome}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-gold/30 transition-all cursor-pointer flex items-center gap-2"
                title="Return to Home"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-gold" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area: ONLY THE PROPOSAL FORM */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
        {/* Hero Header */}
        <div className="text-center space-y-3 pb-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
            <span>Turnkey Event Management</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-white tracking-tight uppercase">
            Event Management Proposal Form
          </h1>
          <p className="text-xs sm:text-sm text-white/60 max-w-2xl mx-auto leading-relaxed">
            Submit your requirements for movie audio launches, pre-release galas, arena concerts, and corporate productions. Our directorate reviews and prepares turnkey execution plans.
          </p>
        </div>

        {/* The Proposal Form */}
        <div className="bg-[#0D0D12] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl">
          <ProposalSubmitForm
            userEmail={userEmail || ""}
            userName={userEmail ? userEmail.split("@")[0] : ""}
            initialCustomerType="Event Organizer"
            initialServiceType="Pre-Release Event"
            onSuccess={() => {
              window.scrollTo({ top: 120, behavior: "smooth" });
            }}
          />
        </div>
      </main>

      {/* Footer Note */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-white/40">
        <p>© 2026 CineVenue Private Capital • Event Management & Production Directorate</p>
      </footer>
    </div>
  );
}
