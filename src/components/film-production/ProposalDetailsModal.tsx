import React, { useState } from "react";
import { 
  Proposal, 
  ProposalStatus 
} from "../../types/filmProductionMarketplace";
import { 
  X, FileText, CheckCircle2, XCircle, AlertCircle, 
  Calendar, Clock, DollarSign, Building2, User, ExternalLink,
  ShieldCheck, ArrowRight, RotateCcw, Send, MessageSquare
} from "lucide-react";
import { updateProposalStatus, addProposalRevision } from "../../services/filmProductionService";

interface ProposalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal | null;
  userEmail?: string | null;
  onProposalUpdated?: () => void;
}

export default function ProposalDetailsModal({
  isOpen,
  onClose,
  proposal,
  userEmail,
  onProposalUpdated
}: ProposalDetailsModalProps) {
  if (!isOpen || !proposal) return null;

  const [activeSubTab, setActiveSubTab] = useState<"overview" | "milestones" | "revisions">("overview");

  // Accept modal state
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [signatureName, setSignatureName] = useState(userEmail ? userEmail.split("@")[0] : "");
  
  // Request changes modal state
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [changeNotes, setChangeNotes] = useState("");
  const [proposedBudgetAdjustment, setProposedBudgetAdjustment] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleAcceptProposal = () => {
    if (!signatureName.trim()) {
      setErrorMessage("Please type your legal signatory name to accept this proposal.");
      return;
    }
    setIsProcessing(true);
    try {
      updateProposalStatus(proposal.id, "Accepted", {
        signature: signatureName
      });
      setIsProcessing(false);
      setIsAcceptModalOpen(false);
      if (onProposalUpdated) onProposalUpdated();
      onClose();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || "Failed to accept proposal.");
    }
  };

  const handleRequestChanges = () => {
    if (!changeNotes.trim()) {
      setErrorMessage("Please describe the adjustments or terms you are requesting.");
      return;
    }
    setIsProcessing(true);
    try {
      addProposalRevision(proposal.id, {
        revisedBy: userEmail ? userEmail.split("@")[0] : "Producer",
        changeSummary: changeNotes,
        proposedBudget: proposedBudgetAdjustment || undefined,
        notes: changeNotes
      });
      setIsProcessing(false);
      setIsRevisionModalOpen(false);
      if (onProposalUpdated) onProposalUpdated();
      onClose();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || "Failed to submit revision request.");
    }
  };

  const handleRejectProposal = () => {
    if (window.confirm("Are you sure you want to decline this proposal?")) {
      updateProposalStatus(proposal.id, "Rejected", {
        rejectedReason: "Declined by recipient"
      });
      if (onProposalUpdated) onProposalUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-[#0F1017] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#141622]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase border border-amber-500/30">
                {proposal.type}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(proposal.status)}`}>
                {proposal.status}
              </span>
              {proposal.currentRevisionNumber > 1 && (
                <span className="text-[10px] text-white/50">Rev v{proposal.currentRevisionNumber}</span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              {proposal.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-4 px-6 border-b border-white/10 bg-[#0B0C12] text-xs font-bold">
          <button
            onClick={() => setActiveSubTab("overview")}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeSubTab === "overview"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Overview & Scope
          </button>
          <button
            onClick={() => setActiveSubTab("milestones")}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeSubTab === "milestones"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Milestone Escrow ({proposal.paymentMilestones.length})
          </button>
          <button
            onClick={() => setActiveSubTab("revisions")}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeSubTab === "revisions"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Revisions History ({proposal.revisions?.length || 0})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SENDER & RECIPIENT CARD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">From (Proposer)</span>
              <div className="font-black text-white">{proposal.senderName}</div>
              <div className="text-white/60">{proposal.senderRole} • {proposal.senderCompany || "Studio"}</div>
              <div className="text-white/40 text-[11px]">{proposal.senderEmail}</div>
            </div>

            <div className="sm:border-l sm:border-white/10 sm:pl-4">
              <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">To (Recipient)</span>
              <div className="font-black text-white">{proposal.recipientName}</div>
              <div className="text-white/60">{proposal.recipientRole || "Producer"} • {proposal.recipientCompany || "Production Banner"}</div>
              <div className="text-white/40 text-[11px]">{proposal.recipientEmail}</div>
            </div>
          </div>

          {/* SUB-TAB 1: OVERVIEW & SCOPE */}
          {activeSubTab === "overview" && (
            <div className="space-y-6">
              {/* Financial & Timeline Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#141622] border border-amber-500/20">
                <div>
                  <div className="text-[10px] uppercase font-bold text-white/40">Total Budget</div>
                  <div className="text-lg font-black text-amber-400">
                    ₹{proposal.budgetTotal.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-white/40">INR Escrow Guaranteed</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-white/40">Timeline</div>
                  <div className="text-sm font-bold text-white">{proposal.timelineWeeks} Weeks</div>
                  <div className="text-[10px] text-white/40">Starting {proposal.proposedStartDate}</div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <div className="text-[10px] uppercase font-bold text-white/40">Project</div>
                  <div className="text-sm font-bold text-white truncate">{proposal.projectTitle}</div>
                  <div className="text-[10px] text-white/40">Dispatched {proposal.createdAt}</div>
                </div>
              </div>

              {/* Pitch Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-white/60">Executive Pitch Summary</h4>
                <p className="text-xs text-white/80 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                  {proposal.introduction}
                </p>
              </div>

              {/* Scope of Work */}
              {proposal.scopeOfWork && proposal.scopeOfWork.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white/60">Scope of Work</h4>
                  <div className="space-y-1.5">
                    {proposal.scopeOfWork.map((s, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deliverables */}
              {proposal.deliverables && proposal.deliverables.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white/60">Key Deliverables</h4>
                  <div className="space-y-1.5">
                    {proposal.deliverables.map((d, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pitch deck link if present */}
              {proposal.pitchDeckUrl && (
                <div>
                  <a
                    href={proposal.pitchDeckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 transition-all"
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>View Attached Pitch Deck / Lookbook</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white/40" />
                  </a>
                </div>
              )}

              {/* Digital Acceptance Signature Banner if accepted */}
              {proposal.status === "Accepted" && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-emerald-300 font-black">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Digitally Executed & Accepted</span>
                  </div>
                  <div className="text-white/80">
                    Signatory: <strong>{proposal.acceptedBySignature}</strong> • Date: {proposal.acceptedAt}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 2: MILESTONES */}
          {activeSubTab === "milestones" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-white/60">Milestone Escrow Schedule</span>
                <span className="text-xs font-bold text-amber-400">Total: ₹{proposal.budgetTotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="space-y-3">
                {proposal.paymentMilestones.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span>{m.title}</span>
                      </div>
                      <span className="font-black text-amber-400 text-sm">
                        ₹{m.amount.toLocaleString("en-IN")} ({m.percentage}%)
                      </span>
                    </div>
                    <div className="text-white/60 pl-7">
                      Deliverable: <span className="text-white font-medium">{m.deliverable}</span>
                    </div>
                    {m.estimatedDate && (
                      <div className="text-white/40 text-[11px] pl-7">
                        Estimated Handover: {m.estimatedDate}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                <span>All milestone disbursements are governed by CineVenue escrow guarantees upon mutually approved deliverables.</span>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: REVISIONS */}
          {activeSubTab === "revisions" && (
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-white/60">Proposal Revisions Log</span>

              {(!proposal.revisions || proposal.revisions.length === 0) ? (
                <div className="text-center py-10 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/50">
                  No revisions requested yet. This is the original version (v1).
                </div>
              ) : (
                <div className="space-y-3">
                  {proposal.revisions.map((rev, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400">Revision #{rev.revisionNumber}</span>
                        <span className="text-white/40 text-[10px]">{rev.revisedAt} by {rev.revisedBy}</span>
                      </div>
                      <p className="text-white/80">{rev.changeSummary}</p>
                      {rev.proposedBudget && (
                        <div className="text-[11px] text-emerald-400 font-semibold">
                          Proposed Budget Adjustment: {rev.proposedBudget}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#141622] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>

          {proposal.status !== "Accepted" && proposal.status !== "Rejected" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRejectProposal}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/20 transition-all cursor-pointer"
              >
                Decline
              </button>

              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all cursor-pointer"
              >
                Request Changes
              </button>

              <button
                type="button"
                onClick={() => setIsAcceptModalOpen(true)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Accept Proposal</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Accept Digital Signature Modal */}
      {isAcceptModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#11121A] border border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Sign & Execute Proposal</span>
            </h3>
            <p className="text-xs text-white/60">
              By confirming, you execute this proposal as an agreed contract framework with milestone escrow protections.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-white/70 mb-1">Legal Signatory Name *</label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="Type your full legal name"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAcceptModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-white/5 text-white/70 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptProposal}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider"
              >
                Confirm Acceptance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Changes Revision Modal */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#11121A] border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              <span>Request Terms Revision</span>
            </h3>
            <p className="text-xs text-white/60">
              Provide specific feedback on budget, deliverables, or timeline adjustments for the proposer to revise.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-white/70 mb-1">Requested Adjustments *</label>
              <textarea
                rows={3}
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                placeholder="e.g. Please adjust the timeline from 16 to 12 weeks and adjust the advance milestone percentage..."
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white/70 mb-1">Counter Budget Proposal (Optional)</label>
              <input
                type="text"
                value={proposedBudgetAdjustment}
                onChange={(e) => setProposedBudgetAdjustment(e.target.value)}
                placeholder="e.g. ₹42,00,000"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRevisionModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-white/5 text-white/70 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestChanges}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
