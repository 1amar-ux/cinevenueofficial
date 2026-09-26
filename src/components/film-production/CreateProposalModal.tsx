import React, { useState, useEffect } from "react";
import { 
  Proposal, 
  ProposalType, 
  FilmProject,
  FilmCraft,
  ProfessionalProfile
} from "../../types/filmProductionMarketplace";
import { 
  X, FileText, PlusCircle, Trash2, Calendar, 
  Building2, User, AlertCircle, CheckCircle2, ShieldCheck, 
  Sparkles, Layers, Search, Paperclip, Eye, Send, MapPin, Clock, DollarSign
} from "lucide-react";
import { 
  saveProposal, 
  getCrafts, 
  getProfessionals, 
  generateProposalId 
} from "../../services/filmProductionService";

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects?: FilmProject[];
  userEmail?: string | null;
  initialCraft?: FilmCraft | null;
  initialRecipient?: ProfessionalProfile | null;
  onProposalCreated?: (proposal: Proposal) => void;
}

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

const ATTACHMENT_TYPES = [
  "Script",
  "Synopsis",
  "Pitch Deck",
  "Reference Images",
  "Technical Requirements",
  "Other Documents"
];

export default function CreateProposalModal({
  isOpen,
  onClose,
  projects = [],
  userEmail,
  initialCraft,
  initialRecipient,
  onProposalCreated
}: CreateProposalModalProps) {
  if (!isOpen) return null;

  const crafts = getCrafts();
  const allProfessionals = getProfessionals();

  // Basic info
  const [proposalType, setProposalType] = useState<ProposalType>("Talent Proposal");
  const [projectName, setProjectName] = useState(projects[0]?.title || "New Film Project");
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "proj-new");
  const [isCustomProject, setIsCustomProject] = useState(false);

  // Craft & Role
  const [selectedCraftId, setSelectedCraftId] = useState<string>(initialCraft?.id || crafts[7]?.id || "craft-8");
  const currentCraft = crafts.find(c => c.id === selectedCraftId) || crafts[7] || crafts[0];
  const [role, setRole] = useState(initialCraft?.subcategories?.[0] || currentCraft?.subcategories?.[0] || "Director of Photography");
  const [customRole, setCustomRole] = useState("");

  // Recipient search & selection
  const [recipientSearch, setRecipientSearch] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<ProfessionalProfile | null>(initialRecipient || null);
  const [recipientName, setRecipientName] = useState(initialRecipient?.fullName || "");
  const [recipientEmail, setRecipientEmail] = useState(initialRecipient?.userEmail || "");
  const [recipientRole, setRecipientRole] = useState(initialRecipient?.professionalHeadline || "");
  const [recipientCompany, setRecipientCompany] = useState("");

  // Proposal Title
  const [title, setTitle] = useState(`${currentCraft?.name || "Production"} Collaboration Proposal`);

  // Scope & Deliverables
  const [projectDescription, setProjectDescription] = useState("");
  const [scopeOfWork, setScopeOfWork] = useState("");
  const [deliverablesInput, setDeliverablesInput] = useState("");
  const [deliverablesList, setDeliverablesList] = useState<string[]>([
    "Primary departmental deliverables sign-off",
    "Scheduled shoot days on-set execution"
  ]);

  // Project Details
  const [duration, setDuration] = useState("8 Weeks");
  const [startDate, setStartDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 70 * 86400000).toISOString().split("T")[0]);
  const [location, setLocation] = useState("Hyderabad / On-Location");

  // Commercial Information (Purely Informational — No payment processing)
  const [proposedFee, setProposedFee] = useState<string>("1500000");
  const [paymentTerms, setPaymentTerms] = useState<string>("Milestone");
  const [additionalTerms, setAdditionalTerms] = useState("");
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]);

  // Attachments
  const [attachments, setAttachments] = useState<{ name: string; type: string; url?: string }[]>([
    { name: "Project_Pitch_Deck_v1.pdf", type: "Pitch Deck" }
  ]);
  const [newAttachmentName, setNewAttachmentName] = useState("");
  const [newAttachmentType, setNewAttachmentType] = useState("Script");

  // Preview & Error State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Update title & default role whenever craft changes
  useEffect(() => {
    if (currentCraft) {
      setTitle(`${currentCraft.name} Collaboration Proposal`);
      if (currentCraft.subcategories && currentCraft.subcategories.length > 0) {
        setRole(currentCraft.subcategories[0]);
      }
    }
  }, [selectedCraftId]);

  // Filter recipient candidates
  const filteredProfessionals = allProfessionals.filter(p => {
    if (!recipientSearch) return true;
    const q = recipientSearch.toLowerCase();
    return p.fullName.toLowerCase().includes(q) ||
      p.primaryCraftName.toLowerCase().includes(q) ||
      (p.handle && p.handle.toLowerCase().includes(q)) ||
      p.location.toLowerCase().includes(q);
  });

  const handleSelectProfessional = (p: ProfessionalProfile) => {
    setSelectedRecipient(p);
    setRecipientName(p.fullName);
    setRecipientEmail(p.userEmail);
    setRecipientRole(p.primaryCraftName);
    setRecipientSearch("");
  };

  const handleAddDeliverable = () => {
    if (deliverablesInput.trim()) {
      setDeliverablesList([...deliverablesList, deliverablesInput.trim()]);
      setDeliverablesInput("");
    }
  };

  const handleRemoveDeliverable = (idx: number) => {
    setDeliverablesList(deliverablesList.filter((_, i) => i !== idx));
  };

  const handleAddAttachment = () => {
    if (newAttachmentName.trim()) {
      setAttachments([...attachments, { name: newAttachmentName.trim(), type: newAttachmentType }]);
      setNewAttachmentName("");
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const handleSubmit = (statusToSave: "DRAFT" | "SENT") => {
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Please enter a proposal title.");
      return;
    }

    if (!projectName.trim()) {
      setErrorMessage("Please enter or select a project name.");
      return;
    }

    if (statusToSave === "SENT" && (!recipientEmail.trim() || !recipientName.trim())) {
      setErrorMessage("Please select or specify a recipient (name and email) to send the proposal.");
      return;
    }

    const effectiveRole = customRole.trim() || role;
    const proposalId = generateProposalId();

    const proposalData: Partial<Proposal> = {
      id: proposalId,
      proposalNumber: proposalId,
      projectId: selectedProjectId,
      projectName: projectName.trim(),
      projectTitle: projectName.trim(),
      type: proposalType,
      craftId: selectedCraftId,
      craftName: currentCraft.name,
      role: effectiveRole,
      title: title.trim(),
      senderId: userEmail ? `user-${userEmail}` : "filmmaker-01",
      senderName: userEmail ? userEmail.split("@")[0] : "Filmmaker Lead",
      senderEmail: userEmail || "filmmaker@cinevenue.com",
      senderRole: "Producer",
      senderCompany: "CineVenue Studio Production",
      recipientId: selectedRecipient?.id,
      recipientName: recipientName.trim() || "Prospective Partner",
      recipientEmail: recipientEmail.trim() || "partner@cinevenue.com",
      recipientRole: recipientRole || effectiveRole,
      recipientCompany: recipientCompany.trim(),
      projectDescription: projectDescription.trim(),
      scopeOfWork: scopeOfWork.trim(),
      deliverables: deliverablesList,
      duration: duration.trim(),
      startDate,
      endDate,
      proposedStartDate: startDate,
      proposedCompletionDate: endDate,
      location: location.trim(),
      proposedFee: proposedFee ? Number(proposedFee) : 0,
      budgetTotal: proposedFee ? Number(proposedFee) : 0,
      currency: "INR",
      paymentTerms: paymentTerms,
      additionalTerms: additionalTerms.trim(),
      attachments: attachments.map(a => ({ name: a.name, type: a.type })),
      expiryDate,
      status: statusToSave
    };

    try {
      const created = saveProposal(proposalData);
      if (onProposalCreated) onProposalCreated(created);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to save proposal.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0D0E15] border border-white/15 rounded-3xl overflow-hidden shadow-2xl animate-fade-in my-auto max-h-[92vh] flex flex-col text-left font-sans">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#111218] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-gold flex items-center gap-1.5">
                <span>CineVenue Movie Production</span>
                <span>•</span>
                <span>Unified Proposal Engine</span>
              </div>
              <h2 className="text-lg font-black text-white">Create Production Proposal</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-gold" />
              <span>{isPreviewOpen ? "Edit Form" : "Preview"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer border-0"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isPreviewOpen ? (
            /* PREVIEW VIEW */
            <div className="space-y-6 bg-[#111218] p-6 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-gold uppercase tracking-wider">
                    PROPOSAL PREVIEW
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">{title}</h3>
                  <div className="text-xs text-white/60 mt-0.5">
                    Project: <span className="text-white font-bold">{projectName}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/10 text-gold border border-gold/20">
                    {proposalType}
                  </span>
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold">Craft</span>
                  <span className="text-white font-bold">{currentCraft.name}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold">Role</span>
                  <span className="text-white font-bold">{customRole || role}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold">Recipient</span>
                  <span className="text-white font-bold">{recipientName || "Not Selected"}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold">Proposed Fee</span>
                  <span className="text-gold font-bold font-mono">
                    {proposedFee ? `₹${Number(proposedFee).toLocaleString("en-IN")}` : "Negotiable"}
                  </span>
                </div>
              </div>

              {projectDescription && (
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Project Description</span>
                  <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{projectDescription}</p>
                </div>
              )}

              {scopeOfWork && (
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Scope of Work</span>
                  <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{scopeOfWork}</p>
                </div>
              )}

              {deliverablesList.length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Deliverables</span>
                  <ul className="list-disc pl-5 text-white/80 space-y-1">
                    {deliverablesList.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2 border-t border-white/5">
                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Duration & Location</span>
                  <span className="text-white/80">{duration} • {location}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Schedule</span>
                  <span className="text-white/80">{startDate} to {endDate}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Payment Terms (Info Only)</span>
                  <span className="text-white/80">{paymentTerms}</span>
                </div>
              </div>
            </div>
          ) : (
            /* FORM VIEW */
            <div className="space-y-6 text-xs">
              
              {/* SECTION A: BASIC INFORMATION */}
              <div className="space-y-4">
                <div className="text-[11px] uppercase font-bold text-gold tracking-widest border-b border-white/5 pb-2">
                  1. Proposal Type & Project
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Proposal Type */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                      Proposal Type <span className="text-gold">*</span>
                    </label>
                    <select
                      value={proposalType}
                      onChange={(e) => setProposalType(e.target.value as ProposalType)}
                      className="w-full bg-[#111218] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-gold cursor-pointer"
                    >
                      {CANONICAL_PROPOSAL_TYPES.map((t) => (
                        <option key={t} value={t} className="bg-[#0A0A0B]">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Project Selector / Creator */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                        Project Name <span className="text-gold">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomProject(!isCustomProject)}
                        className="text-[10px] text-gold hover:underline font-bold"
                      >
                        {isCustomProject ? "Select Existing Project" : "+ Enter Custom Project"}
                      </button>
                    </div>

                    {isCustomProject || projects.length === 0 ? (
                      <input
                        type="text"
                        placeholder="e.g. Godhavari Ammayi Telangana Abbayi"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full bg-[#111218] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-gold"
                      />
                    ) : (
                      <select
                        value={selectedProjectId}
                        onChange={(e) => {
                          setSelectedProjectId(e.target.value);
                          const p = projects.find(item => item.id === e.target.value);
                          if (p) setProjectName(p.title);
                        }}
                        className="w-full bg-[#111218] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-gold cursor-pointer"
                      >
                        {projects.map((proj) => (
                          <option key={proj.id} value={proj.id} className="bg-[#0A0A0B]">
                            {proj.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Proposal Title */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                    Proposal Title <span className="text-gold">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Cinematography & Visual Direction Proposal"
                    className="w-full bg-[#111218] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-gold font-bold"
                  />
                </div>
              </div>

              {/* SECTION B: CRAFT & ROLE SELECTION */}
              <div className="space-y-4">
                <div className="text-[11px] uppercase font-bold text-gold tracking-widest border-b border-white/5 pb-2">
                  2. Craft & Role Selection (24 Crafts)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 24 Crafts Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                      Select Craft <span className="text-gold">*</span>
                    </label>
                    <select
                      value={selectedCraftId}
                      onChange={(e) => setSelectedCraftId(e.target.value)}
                      className="w-full bg-[#111218] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-gold cursor-pointer"
                    >
                      {crafts.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#0A0A0B]">
                          Craft #{c.order}: {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Role in Craft */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                      Role / Sub-Category <span className="text-gold">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="flex-1 bg-[#111218] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-gold cursor-pointer"
                      >
                        {currentCraft.subcategories.map((sub) => (
                          <option key={sub} value={sub} className="bg-[#0A0A0B]">
                            {sub}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Or custom role"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        className="w-40 bg-[#111218] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION C: RECIPIENT */}
              <div className="space-y-4">
                <div className="text-[11px] uppercase font-bold text-gold tracking-widest border-b border-white/5 pb-2">
                  3. Proposal Recipient
                </div>

                {/* Recipient Searchable Autocomplete */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                    Search CineVenue Professionals / Companies
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search actor, director, writer, DOP, editor, sound designer, company..."
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                      className="w-full bg-[#111218] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-gold"
                    />

                    {/* Results Dropdown */}
                    {recipientSearch.trim() && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-[#111218] border border-white/15 rounded-xl max-h-48 overflow-y-auto shadow-2xl z-30 divide-y divide-white/5">
                        {filteredProfessionals.slice(0, 6).map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectProfessional(p)}
                            className="w-full p-2.5 hover:bg-white/5 flex items-center justify-between text-left transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <img src={p.avatarUrl} alt={p.fullName} className="w-7 h-7 rounded-lg object-cover" />
                              <div>
                                <div className="text-xs font-bold text-white">{p.fullName}</div>
                                <div className="text-[10px] text-gold">{p.primaryCraftName} • {p.location}</div>
                              </div>
                            </div>
                            <span className="text-[10px] text-white/40 font-bold uppercase">Select</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recipient Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                      Recipient Name <span className="text-gold">*</span>
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Kiran R. Varman"
                      className="w-full bg-[#111218] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                      Recipient Email <span className="text-gold">*</span>
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="e.g. kiran.dop@cinevenue.com"
                      className="w-full bg-[#111218] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION D: SCOPE & DELIVERABLES */}
              <div className="space-y-4">
                <div className="text-[11px] uppercase font-bold text-gold tracking-widest border-b border-white/5 pb-2">
                  4. Project Scope & Deliverables
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                    Project Description
                  </label>
                  <textarea
                    rows={3}
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Briefly describe the film narrative, tone, background, and director's artistic vision..."
                    className="w-full bg-[#111218] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gold leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                    Scope of Work
                  </label>
                  <textarea
                    rows={3}
                    value={scopeOfWork}
                    onChange={(e) => setScopeOfWork(e.target.value)}
                    placeholder="Key tasks, scene breakdowns, rehearsals, on-set requirements, and responsibilities..."
                    className="w-full bg-[#111218] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gold leading-relaxed"
                  />
                </div>

                {/* Deliverables List */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                    Deliverables
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a specific deliverable (e.g. 35 shoot call sheets completed)"
                      value={deliverablesInput}
                      onChange={(e) => setDeliverablesInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddDeliverable(); }}}
                      className="flex-1 bg-[#111218] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-gold"
                    />
                    <button
                      type="button"
                      onClick={handleAddDeliverable}
                      className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {deliverablesList.map((deliv, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/90 text-xs flex items-center gap-2"
                      >
                        <span>{deliv}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDeliverable(idx)}
                          className="text-white/40 hover:text-rose-400 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION E: PROJECT DURATION, SCHEDULE & LOCATION */}
              <div className="space-y-4">
                <div className="text-[11px] uppercase font-bold text-gold tracking-widest border-b border-white/5 pb-2">
                  5. Schedule, Duration & Location
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 8 Weeks"
                      className="w-full bg-[#111218] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-[#111218] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-[#111218] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Hyderabad / Warangal"
                      className="w-full bg-[#111218] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION F: COMMERCIAL TERMS (INFORMATIONAL ONLY) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="text-[11px] uppercase font-bold text-gold tracking-widest">
                    6. Proposed Fee & Payment Terms (Informational Only)
                  </div>
                  <span className="text-[10px] text-amber-400/80 font-mono">
                    * No in-platform payment processing
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                      Proposed Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={proposedFee}
                      onChange={(e) => setProposedFee(e.target.value)}
                      placeholder="e.g. 1500000"
                      className="w-full bg-[#111218] border border-white/10 rounded-xl px-3.5 py-2 text-gold font-bold font-mono focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                      Payment Terms
                    </label>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full bg-[#111218] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="Advance">Advance (Partial upfront)</option>
                      <option value="Milestone">Milestone (Schedule-based)</option>
                      <option value="Completion">Completion (Upon delivery)</option>
                      <option value="Custom">Custom Terms</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                      Proposal Expiry Date
                    </label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full bg-[#111218] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                    Additional Terms / Notes
                  </label>
                  <textarea
                    rows={2}
                    value={additionalTerms}
                    onChange={(e) => setAdditionalTerms(e.target.value)}
                    placeholder="Specific travel, accommodation, screen credit, billing, or working conditions..."
                    className="w-full bg-[#111218] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gold leading-relaxed"
                  />
                </div>
              </div>

              {/* SECTION G: ATTACHMENTS */}
              <div className="space-y-4">
                <div className="text-[11px] uppercase font-bold text-gold tracking-widest border-b border-white/5 pb-2">
                  7. Attachments
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={newAttachmentType}
                    onChange={(e) => setNewAttachmentType(e.target.value)}
                    className="bg-[#111218] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold cursor-pointer"
                  >
                    {ATTACHMENT_TYPES.map(t => (
                      <option key={t} value={t} className="bg-[#0A0A0B]">{t}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Document title or filename (e.g. Script_Draft_Scene1_40.pdf)"
                    value={newAttachmentName}
                    onChange={(e) => setNewAttachmentName(e.target.value)}
                    className="flex-1 bg-[#111218] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-gold"
                  />

                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl cursor-pointer"
                  >
                    + Attach File
                  </button>
                </div>

                <div className="space-y-1.5">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-3.5 h-3.5 text-gold" />
                        <span className="text-white font-medium">{att.name}</span>
                        <span className="text-[10px] text-white/40 uppercase font-mono">[{att.type}]</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(i)}
                        className="text-white/40 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#111218] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-white/10"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit("DRAFT")}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-white/15"
            >
              [Save Draft]
            </button>

            <button
              type="button"
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gold text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-gold/30"
            >
              [Preview]
            </button>

            <button
              type="button"
              onClick={() => handleSubmit("SENT")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-gold/20 cursor-pointer flex items-center gap-1.5 border-0"
            >
              <Send className="w-3.5 h-3.5 text-black" />
              <span>[Send Proposal]</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
