import React, { useState } from "react";
import { 
  Proposal, 
  ProposalType, 
  ProposalMilestone,
  FilmProject 
} from "../../types/filmProductionMarketplace";
import { 
  X, FileText, PlusCircle, Trash2, DollarSign, Calendar, 
  Building2, User, AlertCircle, CheckCircle2, ShieldCheck, Sparkles
} from "lucide-react";
import { saveProposal } from "../../services/filmProductionService";

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: FilmProject[];
  userEmail?: string | null;
  onProposalCreated?: (proposal: Proposal) => void;
}

const PROPOSAL_TYPES: ProposalType[] = [
  "Film Co-Production",
  "Investor & Financing Pitch",
  "HOD Crew Services",
  "VFX & CGI Services",
  "Music & Sound Design",
  "Camera & Equipment Rental",
  "Post-Production Suite",
  "Theatrical / OTT Distribution",
  "Brand Placement / In-Film"
];

export default function CreateProposalModal({
  isOpen,
  onClose,
  projects,
  userEmail,
  onProposalCreated
}: CreateProposalModalProps) {
  if (!isOpen) return null;

  const defaultProject = projects[0];

  const [selectedProjectId, setSelectedProjectId] = useState(defaultProject?.id || "");
  const [type, setType] = useState<ProposalType>("Film Co-Production");
  const [title, setTitle] = useState("");
  
  // Recipient details
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientRole, setRecipientRole] = useState("Producer");
  const [recipientCompany, setRecipientCompany] = useState("");

  // Body content
  const [introduction, setIntroduction] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  
  // Scope of Work bullets
  const [scopeItems, setScopeItems] = useState<string[]>([
    "Initial creative pre-visualization & pipeline setup",
    "On-schedule production execution & weekly supervisor reports"
  ]);
  const [newScope, setNewScope] = useState("");

  // Deliverables bullets
  const [deliverableItems, setDeliverableItems] = useState<string[]>([
    "Master delivery files in industry standard DCI/4K formats"
  ]);
  const [newDeliverable, setNewDeliverable] = useState("");

  // Timeline & Budget
  const [timelineWeeks, setTimelineWeeks] = useState(16);
  const [proposedStartDate, setProposedStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [proposedCompletionDate, setProposedCompletionDate] = useState("");
  const [budgetTotal, setBudgetTotal] = useState<number>(5000000);

  // Milestones
  const [milestones, setMilestones] = useState<ProposalMilestone[]>([
    { title: "Project Inception & Sign-off", percentage: 30, amount: 1500000, deliverable: "Execution agreement and kick-off assets" },
    { title: "Midway Milestone & Work in Progress", percentage: 40, amount: 2000000, deliverable: "Intermediate production approvals" },
    { title: "Final Master Delivery & Sign-off", percentage: 30, amount: 1500000, deliverable: "Final masters handover and sign-off" }
  ]);

  const [pitchDeckUrl, setPitchDeckUrl] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState(
    "Standard film production collaboration terms. All payments handled via CineVenue Milestone Escrow. Changes exceeding 10% scope require approved revision memos."
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddScope = () => {
    if (newScope.trim()) {
      setScopeItems([...scopeItems, newScope.trim()]);
      setNewScope("");
    }
  };

  const handleRemoveScope = (index: number) => {
    setScopeItems(scopeItems.filter((_, i) => i !== index));
  };

  const handleAddDeliverable = () => {
    if (newDeliverable.trim()) {
      setDeliverableItems([...deliverableItems, newDeliverable.trim()]);
      setNewDeliverable("");
    }
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverableItems(deliverableItems.filter((_, i) => i !== index));
  };

  const handleBudgetChange = (amount: number) => {
    setBudgetTotal(amount);
    // recalculate milestone amounts based on percentages
    setMilestones(prev => prev.map(m => ({
      ...m,
      amount: Math.round((m.percentage / 100) * amount)
    })));
  };

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: `Milestone ${milestones.length + 1}`,
        percentage: 10,
        amount: Math.round(0.1 * budgetTotal),
        deliverable: "Specified deliverable handover"
      }
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Please enter a title for this proposal.");
      return;
    }

    if (!recipientName.trim() || !recipientEmail.trim()) {
      setErrorMessage("Please provide recipient's name and contact email.");
      return;
    }

    if (!introduction.trim()) {
      setErrorMessage("Please write a brief proposal introduction / pitch summary.");
      return;
    }

    const project = projects.find(p => p.id === selectedProjectId) || defaultProject;

    setIsSubmitting(true);

    try {
      const created = saveProposal({
        projectId: project?.id,
        projectTitle: project?.title || "Film Project",
        type,
        title,
        senderId: `user-${Date.now()}`,
        senderName: userEmail ? userEmail.split("@")[0] : "Producer",
        senderEmail: userEmail || "producer@cinevenue.com",
        senderRole: "Producer",
        senderCompany: project?.companyName || "Production Studio",
        recipientName,
        recipientEmail,
        recipientRole,
        recipientCompany: recipientCompany || undefined,
        introduction,
        projectDescription,
        scopeOfWork: scopeItems,
        deliverables: deliverableItems,
        timelineWeeks: Number(timelineWeeks),
        proposedStartDate,
        proposedCompletionDate,
        budgetTotal: Number(budgetTotal),
        currency: "INR",
        paymentMilestones: milestones,
        termsAndConditions,
        pitchDeckUrl: pitchDeckUrl || undefined,
        status: "Sent"
      });

      setIsSubmitting(false);
      if (onProposalCreated) onProposalCreated(created);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || "Failed to save proposal.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-[#0F1017] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#141622]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                Studio & Production Workspace
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Create & Dispatch Proposal
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
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

          <form id="create-proposal-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Proposal Classification & Target Project */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Classification & Project</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Proposal Category *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ProposalType)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {PROPOSAL_TYPES.map(t => (
                      <option key={t} value={t} className="bg-[#141622] text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Related Film Project</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#141622] text-white">
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">Proposal Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Worldwide Digital OTT Co-Financing & Tier-1 Theatrical Release Pitch"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* 2. Recipient Partner Details */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h4 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Recipient Partner / Studio Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Recipient Name / Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Kabir Mehta or Apex Film Studios"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Recipient Email Address *</label>
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="e.g. partner@studio.com"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Recipient Role / Designation</label>
                  <input
                    type="text"
                    value={recipientRole}
                    onChange={(e) => setRecipientRole(e.target.value)}
                    placeholder="e.g. Producer / Studio Head / Investor"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Recipient Studio / Company Banner</label>
                  <input
                    type="text"
                    value={recipientCompany}
                    onChange={(e) => setRecipientCompany(e.target.value)}
                    placeholder="e.g. Apex Motion Pictures LLP"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Executive Introduction & Scope */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h4 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>3. Proposal Pitch & Scope of Collaboration</span>
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">Executive Summary / Introduction *</label>
                <textarea
                  rows={3}
                  required
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                  placeholder="Outline the core objective, creative alignment, and value proposition of this proposal..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Scope Items */}
              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">Scope of Work Items</label>
                <div className="space-y-2 mb-2">
                  {scopeItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white">
                      <span>• {item}</span>
                      <button type="button" onClick={() => handleRemoveScope(idx)} className="text-rose-400 hover:text-rose-300">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    placeholder="Add scope item..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddScope}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Deliverables */}
              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">Key Deliverables</label>
                <div className="space-y-2 mb-2">
                  {deliverableItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white">
                      <span>✓ {item}</span>
                      <button type="button" onClick={() => handleRemoveDeliverable(idx)} className="text-rose-400 hover:text-rose-300">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    placeholder="Add deliverable..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Financial Terms & Milestone Escrow */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h4 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>4. Commercials & Milestone Escrow (INR ₹)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Total Proposed Budget (₹) *</label>
                  <input
                    type="number"
                    min="10000"
                    step="50000"
                    required
                    value={budgetTotal}
                    onChange={(e) => handleBudgetChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Timeline (Weeks)</label>
                  <input
                    type="number"
                    min="1"
                    value={timelineWeeks}
                    onChange={(e) => setTimelineWeeks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Proposed Start Date</label>
                  <input
                    type="date"
                    value={proposedStartDate}
                    onChange={(e) => setProposedStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Milestones Breakdown Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-white/70">Payment Milestones</label>
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>Add Milestone</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {milestones.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={m.title}
                          onChange={(e) => {
                            const updated = [...milestones];
                            updated[idx].title = e.target.value;
                            setMilestones(updated);
                          }}
                          className="font-bold text-white bg-transparent border-b border-white/20 pb-0.5 focus:outline-none flex-1"
                        />
                        <span className="font-extrabold text-amber-400 shrink-0">
                          ₹{m.amount.toLocaleString("en-IN")} ({m.percentage}%)
                        </span>
                        {milestones.length > 1 && (
                          <button type="button" onClick={() => handleRemoveMilestone(idx)} className="text-rose-400 hover:text-rose-300">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={m.deliverable}
                        onChange={(e) => {
                          const updated = [...milestones];
                          updated[idx].deliverable = e.target.value;
                          setMilestones(updated);
                        }}
                        placeholder="Deliverable required for releasing this milestone..."
                        className="w-full text-[11px] text-white/70 bg-transparent border-none p-0 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">Pitch Deck / Lookbook URL (PDF or Drive Link)</label>
                <input
                  type="url"
                  value={pitchDeckUrl}
                  onChange={(e) => setPitchDeckUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or cloud document link"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">Terms & Legal Conditions</label>
                <textarea
                  rows={2}
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none resize-none"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#141622] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="create-proposal-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-gold/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Dispatching Proposal...</span>
            ) : (
              <>
                <FileText className="w-4 h-4 text-black" />
                <span>Send Proposal</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
