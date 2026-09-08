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

export default function CreateProposalModal({
  isOpen,
  onClose,
  projects,
  userEmail,
  onProposalCreated
}: CreateProposalModalProps) {
  if (!isOpen) return null;

  const normEmail = (userEmail || "").toLowerCase();

  // Projects owned by user (or fallback to projects)
  const myProjects = projects.filter(p => 
    !p.ownerEmail || p.ownerEmail.toLowerCase() === normEmail
  );

  const defaultProject = myProjects[0] || projects[0];

  const [selectedProjectId, setSelectedProjectId] = useState(defaultProject?.id || "");
  const selectedProject = projects.find(p => p.id === selectedProjectId) || defaultProject;

  const [type, setType] = useState<ProposalType>("Acting Proposal");
  const [title, setTitle] = useState("");
  const [roleService, setRoleService] = useState("Lead Performance / Key Craft Role");
  
  // Recipient details
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientRole, setRecipientRole] = useState("Producer / Studio");
  const [recipientCompany, setRecipientCompany] = useState("");

  // Body content
  const [introduction, setIntroduction] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  
  // Scope of Work
  const [scopeOfWork, setScopeOfWork] = useState("Complete character execution, script rehearsals, and 30 shooting call-sheets.");
  
  // Deliverables
  const [deliverables, setDeliverables] = useState("All scene shoots, dubbed voice stems, and promotional publicity appearances.");

  // Timeline & Budget
  const [timelineWeeks, setTimelineWeeks] = useState(12);
  const [budgetTotal, setBudgetTotal] = useState<number>(2500000);
  const [paymentTerms, setPaymentTerms] = useState("30% Advance on signing, 40% midway through principal photography, 30% upon final dub wrap.");
  const [attachmentsUrl, setAttachmentsUrl] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]);

  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (statusToSave: "Draft" | "Sent") => {
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Please enter a proposal title.");
      return;
    }

    if (!recipientEmail.trim()) {
      setErrorMessage("Please enter recipient email.");
      return;
    }

    if (!selectedProjectId) {
      setErrorMessage("Please select a related Film Project.");
      return;
    }

    const newProposal: Partial<Proposal> = {
      projectId: selectedProjectId,
      projectTitle: selectedProject?.title || "Untitled Project",
      type,
      title: title.trim(),
      senderId: userEmail ? `user-${userEmail}` : "filmmaker-01",
      senderName: userEmail ? userEmail.split("@")[0] : "Filmmaker Proposer",
      senderEmail: userEmail || "filmmaker@cinevenue.com",
      senderRole: "Producer",
      recipientName: recipientName.trim() || recipientEmail.split("@")[0],
      recipientEmail: recipientEmail.trim(),
      recipientRole,
      recipientCompany,
      introduction: introduction.trim(),
      projectDescription: `${projectDescription}\n\nRole/Service: ${roleService}`,
      scopeOfWork: [scopeOfWork],
      deliverables: [deliverables],
      timelineWeeks: Number(timelineWeeks) || 12,
      proposedStartDate: new Date().toISOString().split("T")[0],
      proposedCompletionDate: expiryDate,
      budgetTotal: Number(budgetTotal) || 0,
      currency: "INR",
      paymentMilestones: [
        { title: "Initial Advance", percentage: 30, amount: Math.round((Number(budgetTotal) || 0) * 0.3), deliverable: "Execution sign-off" },
        { title: "Mid-Schedule Release", percentage: 40, amount: Math.round((Number(budgetTotal) || 0) * 0.4), deliverable: "Shoot progress" },
        { title: "Wrap Delivery", percentage: 30, amount: Math.round((Number(budgetTotal) || 0) * 0.3), deliverable: "Final wrap & handover" }
      ],
      termsAndConditions: `${paymentTerms}\n\nAdditional Notes: ${additionalNotes}\n\n*Notice: Acceptance indicates commercial agreement and does not automatically bind a legal contract.*`,
      attachments: attachmentsUrl ? [{ name: "Proposal Deck / Spec", url: attachmentsUrl }] : [],
      status: statusToSave,
      revisions: [],
      currentRevisionNumber: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiryDate
    };

    const saved = saveProposal(newProposal);
    if (onProposalCreated) onProposalCreated(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0F1018] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#13141E]">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-black text-white">Create Production Proposal</h2>
              <p className="text-[11px] text-white/50">Linked to your Film Project with commercial milestones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          
          {/* Related Film Project & Proposal Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 font-bold mb-1">Related Film Project *</label>
              {projects.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  No projects available. Please create a Film Project first.
                </div>
              ) : (
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-[#1A1B28] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.language} • {p.productionStage})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-white/70 font-bold mb-1">Proposal Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProposalType)}
                className="w-full bg-[#1A1B28] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              >
                {CANONICAL_PROPOSAL_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Proposal Title & Role/Service */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 font-bold mb-1">Proposal Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Co-Production Collaboration or HOD Cinematography Deal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-white/70 font-bold mb-1">Role / Service Specified *</label>
              <input
                type="text"
                required
                placeholder="e.g. Lead Antagonist Actor, Director of Photography, VFX Suite"
                value={roleService}
                onChange={(e) => setRoleService(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Recipient Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/70 font-bold mb-1">Recipient Name</label>
              <input
                type="text"
                placeholder="Recipient professional name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-white/70 font-bold mb-1">Recipient Email *</label>
              <input
                type="email"
                required
                placeholder="recipient@studio.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-white/70 font-bold mb-1">Recipient Role / Company</label>
              <input
                type="text"
                placeholder="e.g. Studio Executive / Producer"
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Introduction & Pitch Summary */}
          <div>
            <label className="block text-white/70 font-bold mb-1">Introduction & Pitch Summary *</label>
            <textarea
              rows={2}
              required
              placeholder="Introduce your intent, commercial background, and value proposition for this proposal..."
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Project Details */}
          <div>
            <label className="block text-white/70 font-bold mb-1">Project Details & Creative Context</label>
            <textarea
              rows={2}
              placeholder="Detail the film project vision, target theatrical release date, and co-production alignment..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Scope of Work & Deliverables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 font-bold mb-1">Scope of Work *</label>
              <textarea
                rows={2}
                required
                placeholder="Responsibilities, shoot days, rehearsal sessions, equipment packages included..."
                value={scopeOfWork}
                onChange={(e) => setScopeOfWork(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-white/70 font-bold mb-1">Deliverables *</label>
              <textarea
                rows={2}
                required
                placeholder="Master deliverables, stems, physical call-sheet appearances, final outputs..."
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Timeline, Budget & Payment Terms */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/70 font-bold mb-1">Timeline (Weeks) *</label>
              <input
                type="number"
                min={1}
                value={timelineWeeks}
                onChange={(e) => setTimelineWeeks(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-white/70 font-bold mb-1">Proposed Budget (INR) *</label>
              <input
                type="number"
                min={0}
                step={10000}
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-white/70 font-bold mb-1">Proposal Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Payment Terms */}
          <div>
            <label className="block text-white/70 font-bold mb-1">Payment Terms & Milestone Structure</label>
            <input
              type="text"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Attachments URL & Additional Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 font-bold mb-1">Attachment / Deck URL</label>
              <input
                type="url"
                placeholder="https://drive.google.com/... or pitch deck link"
                value={attachmentsUrl}
                onChange={(e) => setAttachmentsUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-white/70 font-bold mb-1">Additional Notes</label>
              <input
                type="text"
                placeholder="Special clauses, NDA notice, travel arrangement..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Legal Notice */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-white/60">
            <strong>Legal Protocol:</strong> Accepting this proposal confirms commercial terms between parties. Formal legal execution requires independent digital sign-off and does not automatically bind a contract.
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#13141E] border-t border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit("Draft")}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("Sent")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-gold/20"
            >
              Send Proposal
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
