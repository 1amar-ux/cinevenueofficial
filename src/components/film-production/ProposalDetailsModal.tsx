import React, { useState, useEffect, useRef } from "react";
import { 
  Proposal, 
  ProposalStatus,
  ProposalMessage
} from "../../types/filmProductionMarketplace";
import { 
  X, FileText, CheckCircle2, XCircle, AlertCircle, 
  Calendar, Clock, DollarSign, Building2, User, ExternalLink,
  ShieldCheck, ArrowRight, RotateCcw, Send, MessageSquare,
  MapPin, Paperclip, Briefcase, Film, Ban, Info
} from "lucide-react";
import { 
  updateProposalStatus, 
  getProposalMessages, 
  sendProposalMessage 
} from "../../services/filmProductionService";

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

  const [activeTab, setActiveTab] = useState<"details" | "negotiation">("details");
  const [messages, setMessages] = useState<ProposalMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Rejection modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Accept confirmation modal state
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);

  // Withdraw confirmation modal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine user role in relation to this proposal
  const currentEmail = (userEmail || "user@cinevenue.com").toLowerCase();
  const isSender = Boolean(proposal.senderEmail && proposal.senderEmail.toLowerCase() === currentEmail);
  const isRecipient = Boolean(proposal.recipientEmail && proposal.recipientEmail.toLowerCase() === currentEmail) || (!isSender);

  // Load messages
  const loadMessages = () => {
    const list = getProposalMessages(proposal.id);
    setMessages(list);
  };

  useEffect(() => {
    loadMessages();

    const handleMessagesUpdated = (e: any) => {
      if (e.detail?.proposalId === proposal.id) {
        loadMessages();
      }
    };

    window.addEventListener("cinevenue-proposal-messages-updated", handleMessagesUpdated);
    return () => {
      window.removeEventListener("cinevenue-proposal-messages-updated", handleMessagesUpdated);
    };
  }, [proposal.id]);

  useEffect(() => {
    if (activeTab === "negotiation") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const normStatus = String(proposal.status).toUpperCase();

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
        return { label: proposal.status, class: "bg-white/10 text-white/70 border-white/20", icon: "⚪" };
    }
  };

  const statusBadge = getStatusBadge(proposal.status);

  // Recipient Accepts
  const handleAcceptProposal = () => {
    setIsProcessing(true);
    try {
      updateProposalStatus(proposal.id, "ACCEPTED");
      setIsProcessing(false);
      setIsAcceptModalOpen(false);
      if (onProposalUpdated) onProposalUpdated();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || "Failed to accept proposal.");
    }
  };

  // Recipient Rejects
  const handleRejectProposal = () => {
    setIsProcessing(true);
    try {
      updateProposalStatus(proposal.id, "REJECTED", {
        rejectedReason: rejectionReason.trim() || undefined
      });
      setIsProcessing(false);
      setIsRejectModalOpen(false);
      if (onProposalUpdated) onProposalUpdated();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || "Failed to decline proposal.");
    }
  };

  // Switch to Negotiation
  const handleStartNegotiation = () => {
    setIsProcessing(true);
    try {
      if (normStatus !== "NEGOTIATION" && normStatus !== "ACCEPTED" && normStatus !== "REJECTED") {
        updateProposalStatus(proposal.id, "NEGOTIATION");
      }
      setActiveTab("negotiation");
      setIsProcessing(false);
      if (onProposalUpdated) onProposalUpdated();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || "Failed to update proposal status.");
    }
  };

  // Sender Withdraws
  const handleWithdrawProposal = () => {
    setIsProcessing(true);
    try {
      updateProposalStatus(proposal.id, "WITHDRAWN");
      setIsProcessing(false);
      setIsWithdrawModalOpen(false);
      if (onProposalUpdated) onProposalUpdated();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || "Failed to withdraw proposal.");
    }
  };

  // Send Message in Negotiation
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      const senderName = isSender 
        ? (proposal.senderName || "Filmmaker") 
        : (proposal.recipientName || "Craft Professional");
      const senderRole = isSender 
        ? (proposal.senderRole || "Producer") 
        : (proposal.role || proposal.craftName || "Professional");

      sendProposalMessage(proposal.id, {
        senderId: isSender ? proposal.senderId : (proposal.recipientId || "recipient"),
        senderName,
        senderEmail: currentEmail,
        senderRole,
        message: newMessageText.trim()
      });

      setNewMessageText("");
      setIsSendingMessage(false);
      loadMessages();
      if (onProposalUpdated) onProposalUpdated();
    } catch (err: any) {
      setIsSendingMessage(false);
      setErrorMessage(err?.message || "Failed to send message.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl my-6 bg-[#0B0C12] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between bg-[#12131C]">
          <div className="space-y-1.5 max-w-[80%]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-black text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/20">
                {proposal.proposalNumber || proposal.id}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-white/70 text-[10px] font-bold uppercase border border-white/10">
                {proposal.type}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border flex items-center gap-1 ${statusBadge.class}`}>
                <span>{statusBadge.icon}</span>
                <span>{statusBadge.label}</span>
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
              {proposal.projectName || proposal.projectTitle || "Movie Project"}
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
              <span className="text-amber-400 font-bold">{proposal.craftName || "Craft"}</span>
              <span>•</span>
              <span className="text-white font-medium">{proposal.role || "Role"}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-white/10 bg-[#0E0F17] text-xs font-bold">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "details"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Proposal Details</span>
          </button>

          <button
            onClick={() => setActiveTab("negotiation")}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "negotiation"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Personal Negotiation & Messages ({messages.length})</span>
            {normStatus === "NEGOTIATION" && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
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

          {/* TAB 1: PROPOSAL DETAILS */}
          {activeTab === "details" && (
            <div className="space-y-6">
              
              {/* Sender & Recipient Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400/80 block mb-1">From (Sender)</span>
                  <div className="font-black text-white text-sm">{proposal.senderName}</div>
                  <div className="text-white/70">{proposal.senderRole || "Producer"} • {proposal.senderCompany || "Production Banner"}</div>
                  <div className="text-white/40 text-[11px] mt-0.5">{proposal.senderEmail}</div>
                </div>

                <div className="sm:border-l sm:border-white/10 sm:pl-4">
                  <span className="text-[10px] uppercase font-bold text-amber-400/80 block mb-1">To (Recipient)</span>
                  <div className="font-black text-white text-sm">{proposal.recipientName}</div>
                  <div className="text-white/70">{proposal.role || proposal.recipientRole || "Talent / Specialist"}</div>
                  <div className="text-white/40 text-[11px] mt-0.5">{proposal.recipientEmail}</div>
                </div>
              </div>

              {/* Informational Commercials & Schedule Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#12131C] border border-amber-500/20">
                <div>
                  <div className="text-[10px] uppercase font-bold text-white/40">Proposed Fee</div>
                  <div className="text-base sm:text-lg font-black text-amber-400 mt-0.5">
                    {proposal.proposedFee || proposal.budgetTotal
                      ? `₹${Number(proposal.proposedFee || proposal.budgetTotal).toLocaleString("en-IN")}`
                      : "Negotiable / TBD"}
                  </div>
                  <div className="text-[9px] text-white/40 mt-0.5">Informational Only</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-white/40">Payment Terms</div>
                  <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                    {proposal.paymentTerms || "Milestone"}
                  </div>
                  <div className="text-[9px] text-white/40 mt-0.5">Informational Terms</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-white/40">Duration</div>
                  <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                    {proposal.duration || `${proposal.timelineWeeks || 8} Weeks`}
                  </div>
                  <div className="text-[9px] text-white/40 mt-0.5">
                    {proposal.startDate || proposal.proposedStartDate || "Flexible Start"}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-white/40">Location</div>
                  <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
                    {proposal.location || "Hyderabad / On Location"}
                  </div>
                  <div className="text-[9px] text-white/40 mt-0.5">Production Base</div>
                </div>
              </div>

              {/* Informational Notice */}
              <div className="p-3 rounded-xl bg-amber-400/5 border border-amber-400/15 text-[11px] text-white/70 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Informational Terms:</strong> Fee and payment terms are for communication and negotiation purposes. CineVenue does not process financial transactions, payments, or escrow settlements.
                </span>
              </div>

              {/* Status Outcome Banners */}
              {normStatus === "ACCEPTED" && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-emerald-300 font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Proposal Accepted</span>
                  </div>
                  <div className="text-white/80">
                    This proposal was accepted on {proposal.acceptedAt || proposal.updatedAt}. Both parties can continue their personal discussion in the Negotiation & Messages tab.
                  </div>
                </div>
              )}

              {normStatus === "REJECTED" && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-rose-300 font-black">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Proposal Declined</span>
                  </div>
                  {proposal.rejectedReason && (
                    <div className="text-white/80">
                      Reason: <span className="italic">"{proposal.rejectedReason}"</span>
                    </div>
                  )}
                </div>
              )}

              {normStatus === "WITHDRAWN" && (
                <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-xs text-white/70">
                  This proposal was withdrawn by the sender.
                </div>
              )}

              {/* Project Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5" />
                  <span>Project Description</span>
                </h4>
                <div className="text-xs text-white/80 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10 whitespace-pre-line">
                  {proposal.projectDescription || proposal.introduction || "No description provided for this proposal."}
                </div>
              </div>

              {/* Scope of Work */}
              {proposal.scopeOfWork && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Scope of Work</span>
                  </h4>
                  <div className="space-y-1.5">
                    {(Array.isArray(proposal.scopeOfWork) ? proposal.scopeOfWork : [proposal.scopeOfWork]).map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white flex items-start gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-white/90">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deliverables */}
              {proposal.deliverables && proposal.deliverables.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Deliverables</span>
                  </h4>
                  <div className="space-y-1.5">
                    {proposal.deliverables.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Terms */}
              {proposal.additionalTerms && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white/60">
                    Additional Terms & Notes
                  </h4>
                  <div className="text-xs text-white/70 bg-white/5 p-4 rounded-2xl border border-white/10 leading-relaxed whitespace-pre-line">
                    {proposal.additionalTerms}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {((proposal.attachments && proposal.attachments.length > 0) || proposal.pitchDeckUrl) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Attachments & Documents</span>
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {proposal.pitchDeckUrl && (
                      <a
                        href={proposal.pitchDeckUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pitch Deck / Presentation</span>
                        <ExternalLink className="w-3 h-3 text-white/40" />
                      </a>
                    )}
                    {proposal.attachments?.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>{att.name}</span>
                        <ExternalLink className="w-3 h-3 text-white/40" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates & Expiry */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between text-xs text-white/50 gap-2">
                <span>Created: {proposal.createdAt}</span>
                {proposal.expiryDate && (
                  <span className="text-amber-400/80">Proposal Expiry Date: {proposal.expiryDate}</span>
                )}
                <span>Last Updated: {proposal.updatedAt}</span>
              </div>

            </div>
          )}

          {/* TAB 2: NEGOTIATION & MESSAGING */}
          {activeTab === "negotiation" && (
            <div className="flex flex-col h-[520px]">
              
              {/* Negotiation Header Banner */}
              <div className="p-3.5 rounded-2xl bg-[#12131C] border border-amber-500/20 mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <span>Proposal-Specific Negotiation Room</span>
                  </div>
                  <div className="text-[11px] text-white/50 mt-0.5">
                    Private direct communication between {proposal.senderName} and {proposal.recipientName}
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${statusBadge.class}`}>
                  {statusBadge.label}
                </span>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-[#090A0F] border border-white/10 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40 text-xs space-y-2">
                    <MessageSquare className="w-8 h-8 text-amber-400/40" />
                    <p className="font-bold text-white/60">No negotiation messages yet</p>
                    <p className="max-w-xs text-[11px]">
                      Send a message below to discuss creative vision, shooting dates, roles, deliverables, or terms.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMyMsg = Boolean(userEmail && m.senderEmail && m.senderEmail.toLowerCase() === userEmail.toLowerCase());
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMyMsg ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-[11px] font-bold text-white/80">{m.senderName}</span>
                          {m.senderRole && (
                            <span className="text-[9px] uppercase font-bold text-amber-400/80 px-1.5 py-0.2 rounded bg-amber-400/10">
                              {m.senderRole}
                            </span>
                          )}
                          <span className="text-[10px] text-white/40">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div
                          className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isMyMsg
                              ? "bg-amber-400 text-black font-medium rounded-tr-none shadow-md shadow-amber-400/10"
                              : "bg-[#161824] text-white/90 border border-white/10 rounded-tl-none"
                          }`}
                        >
                          {m.message}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type your negotiation message or terms discussion..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-amber-400 transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessageText.trim() || isSendingMessage}
                  className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-amber-400/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#12131C] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {/* If Draft, allow sending */}
            {normStatus === "DRAFT" && isSender && (
              <button
                type="button"
                onClick={() => {
                  updateProposalStatus(proposal.id, "SENT");
                  if (onProposalUpdated) onProposalUpdated();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Proposal</span>
              </button>
            )}

            {/* Recipient Actions (Pending or In Negotiation) */}
            {normStatus !== "ACCEPTED" && normStatus !== "REJECTED" && normStatus !== "WITHDRAWN" && normStatus !== "DRAFT" && (
              <>
                {normStatus !== "NEGOTIATION" && (
                  <button
                    type="button"
                    onClick={handleStartNegotiation}
                    className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>Negotiate</span>
                  </button>
                )}

                {/* Recipient Can Decline */}
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>

                {/* Recipient Can Accept */}
                <button
                  type="button"
                  onClick={() => setIsAcceptModalOpen(true)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Accept Proposal</span>
                </button>
              </>
            )}

            {/* Sender Can Withdraw if pending or in negotiation */}
            {isSender && normStatus !== "ACCEPTED" && normStatus !== "REJECTED" && normStatus !== "WITHDRAWN" && normStatus !== "DRAFT" && (
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-rose-500/15 text-white/60 hover:text-rose-300 text-xs font-bold border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Withdraw</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Accept Confirmation Modal */}
      {isAcceptModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#11121A] border border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Accept Proposal</span>
            </h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Are you sure you want to accept this proposal for <strong>{proposal.projectName}</strong>?
            </p>
            <p className="text-[11px] text-white/50">
              Acceptance confirms mutual agreement on the proposed scope, craft, and terms. You and the sender can continue your personal discussion at any time.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAcceptModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-white/70 text-xs font-bold hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptProposal}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                {isProcessing ? "Accepting..." : "Confirm Acceptance"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#11121A] border border-rose-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>Decline Proposal</span>
            </h3>
            <p className="text-xs text-white/60">
              You can optionally share why this proposal was declined (e.g., project dates conflict, schedule unavailable).
            </p>

            <div>
              <label className="block text-[11px] font-bold text-white/70 mb-1">Reason (Optional)</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Project dates are not suitable for my shooting schedule."
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-white/70 text-xs font-bold hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectProposal}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                {isProcessing ? "Declining..." : "Decline Proposal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#11121A] border border-white/20 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Ban className="w-5 h-5 text-amber-400" />
              <span>Withdraw Proposal</span>
            </h3>
            <p className="text-xs text-white/70">
              Are you sure you want to withdraw this proposal? The recipient will no longer be able to accept it.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-white/70 text-xs font-bold hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawProposal}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                {isProcessing ? "Withdrawing..." : "Confirm Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
