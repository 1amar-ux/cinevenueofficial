import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Users,
  BarChart3,
  QrCode,
  Settings,
  Search,
  Download,
  Printer,
  Mail,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Save,
  Trash2,
  DollarSign,
  TrendingUp,
  Activity,
  FileSpreadsheet,
  FileText,
  FileDown,
  Sparkles,
  Shield,
  Ban,
  Check,
  RefreshCw,
  X,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Filter,
  Plus,
  Phone,
  Building,
  User,
  ArrowRight,
  Send,
  MessageSquare,
  Layers,
  HelpCircle,
  Award,
  Clapperboard,
  Music,
  Star
} from "lucide-react";
import { 
  EventProposalRecord, 
  ProposalStatus, 
  EntertainmentCategoryKey, 
  ENTERTAINMENT_CATEGORIES,
  EventQuotation,
  QuotationItem
} from "../../../types/entertainmentEvent";
import {
  getEventProposals,
  updateProposalStatus,
  assignProposalEventManager,
  addProposalFollowUp,
  saveProposalQuotation,
  convertProposalToEvent,
  exportProposalsToCsv
} from "../../../services/entertainmentEventService";
import { generateAndDownloadQuotationPdf } from "../../../utils/quotationPdf";
import EventProposalModal from "../../events/EventProposalModal";

interface EntertainmentEventManagementAdminProps {
  adminEmail?: string;
  isSuperAdmin?: boolean;
  onOpenLiveEvents?: () => void;
}

const PROPOSAL_STATUSES: ProposalStatus[] = [
  "New",
  "Under Review",
  "Need More Details",
  "Meeting or Discussion Scheduled",
  "Venue Inspection",
  "Quotation Preparation",
  "Quotation Sent",
  "Negotiation",
  "Approved",
  "Rejected",
  "Cancelled",
  "Converted to Event"
];

export default function EntertainmentEventManagementAdmin({
  adminEmail = "admin@cinevenue.com",
  isSuperAdmin = true,
  onOpenLiveEvents
}: EntertainmentEventManagementAdminProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "proposals" | "operations" | "categories">("dashboard");
  const [proposals, setProposals] = useState<EventProposalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Proposal Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [cityFilter, setCityFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Proposal for Details & Operations Modal
  const [selectedProposal, setSelectedProposal] = useState<EventProposalRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  // Quick Action Notes & Follow-up State inside Details Modal
  const [newInternalNote, setNewInternalNote] = useState("");
  const [followUpSummary, setFollowUpSummary] = useState("");
  const [followUpType, setFollowUpType] = useState<"Call" | "Email" | "Meeting" | "Venue Visit">("Call");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [selectedManager, setSelectedManager] = useState("Vikram Reddy (Sr. Production Head)");

  // Rejection / Cancel Dialog State
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectionPromptOpen, setIsRejectionPromptOpen] = useState(false);

  // Load proposals
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getEventProposals();
      setProposals(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    window.addEventListener("cinevenue_proposals_updated", handleSync);
    return () => window.removeEventListener("cinevenue_proposals_updated", handleSync);
  }, []);

  // Filtered & Paginated Proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter(p => {
      if (statusFilter !== "All" && p.status !== statusFilter) return false;
      if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
      if (cityFilter !== "All" && p.preferredCity !== cityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          p.id.toLowerCase().includes(q) ||
          p.eventName.toLowerCase().includes(q) ||
          p.companyName.toLowerCase().includes(q) ||
          p.contactPerson.toLowerCase().includes(q) ||
          p.eventType.toLowerCase().includes(q) ||
          (p.movieTitle && p.movieTitle.toLowerCase().includes(q)) ||
          p.preferredCity.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [proposals, statusFilter, categoryFilter, cityFilter, searchQuery]);

  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage) || 1;
  const paginatedProposals = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProposals.slice(start, start + itemsPerPage);
  }, [filteredProposals, currentPage, itemsPerPage]);

  // Dashboard Aggregates
  const metrics = useMemo(() => {
    const total = proposals.length;
    const newCount = proposals.filter(p => p.status === "New").length;
    const underReview = proposals.filter(p => p.status === "Under Review" || p.status === "Need More Details" || p.status === "Meeting or Discussion Scheduled").length;
    const quoteSent = proposals.filter(p => p.status === "Quotation Sent" || p.status === "Quotation Preparation" || p.status === "Negotiation").length;
    const approved = proposals.filter(p => p.status === "Approved").length;
    const converted = proposals.filter(p => p.status === "Converted to Event").length;
    const rejectedOrCancelled = proposals.filter(p => p.status === "Rejected" || p.status === "Cancelled").length;

    const totalPipelineValue = proposals.reduce((acc, p) => acc + (p.quotation?.grandTotal || p.estimatedBudget || 0), 0);
    const confirmedRevenue = proposals
      .filter(p => p.status === "Approved" || p.status === "Converted to Event")
      .reduce((acc, p) => acc + (p.quotation?.grandTotal || p.estimatedBudget || 0), 0);

    return {
      total,
      newCount,
      underReview,
      quoteSent,
      approved,
      converted,
      rejectedOrCancelled,
      totalPipelineValue,
      confirmedRevenue
    };
  }, [proposals]);

  // Unique cities from proposals for filtering
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    proposals.forEach(p => { if (p.preferredCity) set.add(p.preferredCity); });
    return Array.from(set);
  }, [proposals]);

  // Handlers
  const handleStatusChange = async (newStatus: ProposalStatus) => {
    if (!selectedProposal) return;
    if (newStatus === "Rejected" || newStatus === "Cancelled") {
      setIsRejectionPromptOpen(true);
      return;
    }

    const updated = await updateProposalStatus(selectedProposal.id, newStatus, {
      authorName: adminEmail
    });
    if (updated) {
      setSelectedProposal(updated);
      loadData();
    }
  };

  const confirmRejectionOrCancellation = async (status: "Rejected" | "Cancelled") => {
    if (!selectedProposal) return;
    const updated = await updateProposalStatus(selectedProposal.id, status, {
      reason: rejectionReason,
      note: `Status updated to ${status}. Reason: ${rejectionReason || "No specific reason cited."}`,
      authorName: adminEmail
    });
    if (updated) {
      setSelectedProposal(updated);
      setIsRejectionPromptOpen(false);
      setRejectionReason("");
      loadData();
    }
  };

  const handleAddInternalNote = async () => {
    if (!selectedProposal || !newInternalNote.trim()) return;
    const updated = await updateProposalStatus(selectedProposal.id, selectedProposal.status, {
      note: newInternalNote.trim(),
      authorName: adminEmail
    });
    if (updated) {
      setSelectedProposal(updated);
      setNewInternalNote("");
      loadData();
    }
  };

  const handleAddFollowUp = async () => {
    if (!selectedProposal || !followUpSummary.trim()) return;
    const updated = await addProposalFollowUp(selectedProposal.id, {
      date: new Date().toISOString().split("T")[0],
      type: followUpType,
      summary: followUpSummary.trim(),
      nextFollowUpDate: nextFollowUpDate || undefined,
      authorName: adminEmail
    });
    if (updated) {
      setSelectedProposal(updated);
      setFollowUpSummary("");
      setNextFollowUpDate("");
      loadData();
    }
  };

  const handleAssignManager = async () => {
    if (!selectedProposal) return;
    const managerEmail = selectedManager.includes("Vikram") 
      ? "vikram.reddy@cinevenue.com" 
      : selectedManager.includes("Priya") 
      ? "priya.sharma@cinevenue.com" 
      : "rahul.varma@cinevenue.com";

    const updated = await assignProposalEventManager(
      selectedProposal.id,
      selectedManager,
      managerEmail,
      adminEmail
    );
    if (updated) {
      setSelectedProposal(updated);
      alert(`Assigned event manager ${selectedManager} successfully!`);
      loadData();
    }
  };

  const handleConvertToEvent = async () => {
    if (!selectedProposal) return;
    if (selectedProposal.isConvertedToEvent) {
      alert(`Proposal already converted into event ID: ${selectedProposal.convertedEventId}`);
      return;
    }
    const confirmConvert = window.confirm(
      `Are you sure you want to convert "${selectedProposal.eventName}" into a canonical CineVenue Event?\n\nThis will instantly deploy the event to the live ticketing platform.`
    );
    if (!confirmConvert) return;

    const res = await convertProposalToEvent(selectedProposal.id, adminEmail);
    if (res.success) {
      alert(res.message);
      loadData();
      setIsDetailsOpen(false);
      if (onOpenLiveEvents) {
        onOpenLiveEvents();
      }
    } else {
      alert(res.message);
    }
  };

  // Default quotation builder state
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([
    { id: "Q-1", serviceName: "Concert Stage & Heavy Duty Roof Truss", description: "Engineered box trusses with hydraulic risers", quantity: 1, unit: "Setup", unitPrice: 850000, totalPrice: 850000 },
    { id: "Q-2", serviceName: "d&b audiotechnik GSL Line Array Sound", description: "Concert sound package, subs & wireless mics", quantity: 1, unit: "Package", unitPrice: 750000, totalPrice: 750000 },
    { id: "Q-3", serviceName: "4K HDR P2.9 Curved LED Video Wall (1800 sq.ft)", description: "Novastar processors, dual redundant feeds", quantity: 1, unit: "Wall", unitPrice: 600000, totalPrice: 600000 },
    { id: "Q-4", serviceName: "Intelligent Lighting & Laser Matrix", description: "Moving beam fixtures, washes and lasers", quantity: 1, unit: "Package", unitPrice: 450000, totalPrice: 450000 }
  ]);

  const handleGenerateQuotation = async () => {
    if (!selectedProposal) return;
    const subtotal = quotationItems.reduce((acc, i) => acc + i.totalPrice, 0);
    const taxRate = 18;
    const taxAmount = (subtotal * taxRate) / 100;
    const grandTotal = subtotal + taxAmount;
    const advancePercentage = 50;
    const advanceAmount = grandTotal * 0.5;

    const updated = await saveProposalQuotation(selectedProposal.id, {
      revision: (selectedProposal.quotation?.revision || 0) + 1,
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      status: "Sent",
      items: quotationItems,
      subtotal,
      discountAmount: 0,
      taxRatePercent: taxRate,
      taxAmount,
      grandTotal,
      advancePercentage,
      advanceAmount,
      paymentMilestones: [
        { milestone: "On Quotation Approval & Date Booking", percentage: 50, amount: advanceAmount, dueOn: "Immediate" },
        { milestone: "On Stage Rigging & Sound Check (Day -1)", percentage: 40, amount: grandTotal * 0.4, dueOn: selectedProposal.preferredDate },
        { milestone: "Post Event Settlement", percentage: 10, amount: grandTotal * 0.1, dueOn: "Within 3 days" }
      ],
      inclusions: [
        "Turnkey setup and tear-down operations",
        "Dedicated CineVenue production manager on site",
        "Silent DG backup generator sets"
      ],
      exclusions: [
        "Venue rental fee payable to venue management",
        "Police and government entertainment permits"
      ],
      termsAndConditions: [
        "Quotation valid for 14 calendar days from dispatch.",
        "50% advance required to freeze equipment inventory.",
        "GST applicable at statutory 18% rate."
      ],
      preparedBy: adminEmail
    });

    if (updated && updated.quotation) {
      setSelectedProposal(updated);
      setIsQuotationModalOpen(false);
      loadData();
      generateAndDownloadQuotationPdf(updated, updated.quotation);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white" id="entertainment-event-management-module">
      
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-[#171724] via-[#101018] to-[#171724] border border-gold/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gold/20 border border-gold/50 flex items-center justify-center text-gold shadow-md">
              <Clapperboard className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-gold uppercase px-2 py-0.5 rounded bg-gold/10 border border-gold/30">
                CINEVENUE PVT LTD
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-wide mt-0.5">
                Entertainment Event Management Directorate
              </h2>
            </div>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            End-to-end administration for film promotional launches, live music concerts, celebrity fan meets, and industry galas. Seamless proposal review, branded quotations, and direct event conversion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsProposalModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-black font-extrabold text-xs tracking-wide shadow-lg shadow-gold/25 transition-all flex items-center gap-2 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Submit Event Proposal
          </button>
          <button
            onClick={() => exportProposalsToCsv(proposals)}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-gold" />
            Export CSV
          </button>
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-gold/40 text-zinc-400 hover:text-white transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-gold" : ""}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-800 gap-2">
        {[
          { key: "dashboard", label: "Executive Dashboard", icon: BarChart3 },
          { key: "proposals", label: `Event Proposals (${proposals.length})`, icon: FileText },
          { key: "categories", label: "Entertainment Categories", icon: Sparkles },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-3 text-xs md:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                isActive
                  ? "border-gold text-gold bg-gold/5"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 1. EXECUTIVE DASHBOARD TAB */}
      {/* ========================================================= */}
      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          {/* Key KPI Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              { label: "Total Proposals", value: metrics.total, color: "text-white", border: "border-zinc-800" },
              { label: "New Submissions", value: metrics.newCount, color: "text-amber-400", border: "border-amber-500/40" },
              { label: "Under Review", value: metrics.underReview, color: "text-blue-400", border: "border-blue-500/40" },
              { label: "Quotes Active", value: metrics.quoteSent, color: "text-purple-400", border: "border-purple-500/40" },
              { label: "Approved", value: metrics.approved, color: "text-emerald-400", border: "border-emerald-500/40" },
              { label: "Converted to Event", value: metrics.converted, color: "text-gold", border: "border-gold/50" },
            ].map((kpi, idx) => (
              <div key={idx} className={`p-4 rounded-xl bg-[#12121A] border ${kpi.border} shadow-lg space-y-1`}>
                <div className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">{kpi.label}</div>
                <div className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Revenue & Pipeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-gradient-to-r from-amber-950/20 via-[#13131C] to-[#12121A] border border-gold/40 shadow-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Active Pipeline Value</div>
                <div className="text-2xl md:text-3xl font-black text-gold mt-1">
                  ₹{metrics.totalPipelineValue.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">Across all unclosed entertainment proposals</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/20 via-[#13131C] to-[#12121A] border border-emerald-500/40 shadow-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Confirmed Event Commitments</div>
                <div className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">
                  ₹{metrics.confirmedRevenue.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">Approved & converted event contracts</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Recent Submissions & Activity Preview */}
          <div className="p-6 rounded-2xl bg-[#12121A] border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Entertainment Proposals</h3>
                <p className="text-xs text-zinc-400">Latest event inquiries from production studios and organizers</p>
              </div>
              <button
                onClick={() => setActiveTab("proposals")}
                className="text-xs text-gold hover:underline font-semibold flex items-center gap-1"
              >
                View all proposals
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-zinc-800">
              {proposals.slice(0, 4).map(p => (
                <div key={p.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gold font-bold">{p.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        p.status === "Approved" || p.status === "Converted to Event"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : p.status === "Quotation Sent"
                          ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}>
                        {p.status}
                      </span>
                      <span className="text-xs text-zinc-400">{p.eventType}</span>
                    </div>
                    <div className="text-sm font-bold text-white">{p.eventName}</div>
                    <div className="text-xs text-zinc-400">
                      Organizer: <span className="text-zinc-200">{p.companyName}</span> ({p.contactPerson} · {p.mobile})
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      <div className="text-white font-semibold">{p.preferredCity}</div>
                      <div className="text-zinc-400">{p.preferredDate}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProposal(p);
                        setIsDetailsOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-gold hover:text-black font-bold text-xs transition-all"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. PROPOSALS MANAGEMENT TAB */}
      {/* ========================================================= */}
      {activeTab === "proposals" && (
        <div className="space-y-4 animate-fade-in">
          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-[#12121A] border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search by ID, event name, movie, organizer or city..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-[#161622] border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-[#161622] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
              >
                <option value="All">All Statuses</option>
                {PROPOSAL_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="bg-[#161622] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
              >
                <option value="All">All Categories</option>
                {ENTERTAINMENT_CATEGORIES.map(c => (
                  <option key={c.key} value={c.key}>{c.name}</option>
                ))}
              </select>

              {/* City Filter */}
              <select
                value={cityFilter}
                onChange={e => { setCityFilter(e.target.value); setCurrentPage(1); }}
                className="bg-[#161622] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
              >
                <option value="All">All Cities</option>
                {availableCities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="text-xs text-zinc-400">
              Showing <span className="font-bold text-white">{filteredProposals.length}</span> proposals
            </div>
          </div>

          {/* Proposals Table */}
          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#12121A] shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#161622] border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                  <th className="p-3.5">Proposal ID</th>
                  <th className="p-3.5">Event Name & Type</th>
                  <th className="p-3.5">Organizer / Production</th>
                  <th className="p-3.5">City & Preferred Date</th>
                  <th className="p-3.5">Audience</th>
                  <th className="p-3.5">Budget</th>
                  <th className="p-3.5">Assigned Manager</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {paginatedProposals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-zinc-500">
                      No entertainment proposals found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedProposals.map(p => (
                    <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-gold">
                        {p.id}
                        <div className="text-[10px] text-zinc-500">{p.createdAt.split("T")[0]}</div>
                      </td>
                      <td className="p-3.5 max-w-[200px]">
                        <div className="font-bold text-white truncate" title={p.eventName}>{p.eventName}</div>
                        <div className="text-[10px] text-zinc-400">{p.eventType}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-zinc-200">{p.companyName}</div>
                        <div className="text-[10px] text-zinc-400">{p.contactPerson} · {p.mobile}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-white font-medium">{p.preferredCity}</div>
                        <div className="text-[10px] text-zinc-400">{p.preferredDate}</div>
                      </td>
                      <td className="p-3.5 font-mono text-zinc-200">
                        {p.expectedAudience?.toLocaleString("en-IN") || "—"}
                      </td>
                      <td className="p-3.5 font-mono text-gold font-semibold">
                        {p.isQuotRequestedWithoutBudget ? (
                          <span className="text-[10px] text-amber-400 uppercase font-sans">Awaiting Quote</span>
                        ) : (
                          `₹${(p.quotation?.grandTotal || p.estimatedBudget || 0).toLocaleString("en-IN")}`
                        )}
                      </td>
                      <td className="p-3.5 text-zinc-300">
                        {p.assignedEventManager ? (
                          <span className="text-xs font-medium text-emerald-400">{p.assignedEventManager.split(" ")[0]}</span>
                        ) : (
                          <span className="text-zinc-500 text-[11px] italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          p.status === "Approved" || p.status === "Converted to Event"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : p.status === "Quotation Sent"
                            ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                            : p.status === "Rejected" || p.status === "Cancelled"
                            ? "bg-red-500/15 text-red-400 border border-red-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedProposal(p);
                            setIsDetailsOpen(true);
                          }}
                          className="px-3 py-1 rounded bg-zinc-800 hover:bg-gold hover:text-black font-bold text-xs transition-all shadow"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
              <div>Page {currentPage} of {totalPages}</div>
              <div className="flex gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white font-bold"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ENTERTAINMENT CATEGORIES OVERVIEW TAB */}
      {/* ========================================================= */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {ENTERTAINMENT_CATEGORIES.map(cat => (
            <div key={cat.key} className="p-5 rounded-2xl bg-[#12121A] border border-zinc-800 hover:border-gold/40 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-base">{cat.name}</h4>
                <span className="text-[10px] font-mono text-gold px-2 py-0.5 rounded bg-gold/10 border border-gold/30">
                  {cat.eventTypes.length} types
                </span>
              </div>
              <p className="text-xs text-zinc-400">{cat.description}</p>
              <div className="pt-2 border-t border-zinc-800/80">
                <div className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-2">Supported Formats:</div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.eventTypes.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 border border-zinc-700/60 text-zinc-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* PROPOSAL DETAILS & OPERATIONS DRAWER MODAL */}
      {/* ========================================================= */}
      {isDetailsOpen && selectedProposal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-4xl bg-[#0E0E16] border-2 border-gold/40 rounded-2xl shadow-2xl flex flex-col my-auto max-h-[92vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#141420] border-b border-zinc-800">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-gold">{selectedProposal.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    selectedProposal.status === "Approved" || selectedProposal.status === "Converted to Event"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  }`}>
                    {selectedProposal.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedProposal.eventName}</h3>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Status & Pipeline Action Toolbar */}
              <div className="p-4 rounded-xl bg-[#14141E] border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Change Proposal Status</div>
                  <div className="flex flex-wrap gap-1.5">
                    {PROPOSAL_STATUSES.map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          selectedProposal.status === s
                            ? "bg-gold text-black shadow-md"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Conversion & Quotation Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setIsQuotationModalOpen(true)}
                    className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    {selectedProposal.quotation ? "Update Quotation" : "Generate Quotation"}
                  </button>

                  {selectedProposal.quotation && (
                    <button
                      onClick={() => generateAndDownloadQuotationPdf(selectedProposal, selectedProposal.quotation!)}
                      className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4 text-gold" />
                      PDF Quotation
                    </button>
                  )}

                  <button
                    onClick={handleConvertToEvent}
                    disabled={selectedProposal.isConvertedToEvent}
                    className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                      selectedProposal.isConvertedToEvent
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/20"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {selectedProposal.isConvertedToEvent ? "Converted to Event" : "Convert to Event"}
                  </button>
                </div>
              </div>

              {/* Grid 2-Column: Details vs Admin Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left: Proposal Specifications */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#12121A] border border-zinc-800 space-y-3">
                    <h4 className="text-xs font-bold text-gold uppercase tracking-wider">Event Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-zinc-400">Category:</span> <div className="text-white font-medium">{selectedProposal.category}</div></div>
                      <div><span className="text-zinc-400">Type:</span> <div className="text-white font-medium">{selectedProposal.eventType}</div></div>
                      <div><span className="text-zinc-400">Preferred Date:</span> <div className="text-white font-medium">{selectedProposal.preferredDate}</div></div>
                      <div><span className="text-zinc-400">City & Venue:</span> <div className="text-white font-medium">{selectedProposal.preferredCity} ({selectedProposal.preferredVenue})</div></div>
                      <div><span className="text-zinc-400">Audience:</span> <div className="text-white font-medium">{selectedProposal.expectedAudience?.toLocaleString("en-IN")}</div></div>
                      <div><span className="text-zinc-400">Duration:</span> <div className="text-white font-medium">{selectedProposal.expectedDurationHours} Hours</div></div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#12121A] border border-zinc-800 space-y-3">
                    <h4 className="text-xs font-bold text-gold uppercase tracking-wider">Organizer Contact</h4>
                    <div className="text-xs space-y-1.5">
                      <div className="text-white font-bold">{selectedProposal.companyName}</div>
                      <div className="text-zinc-300">Contact Person: {selectedProposal.contactPerson}</div>
                      <div className="text-zinc-300 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gold" /> {selectedProposal.mobile}</div>
                      <div className="text-zinc-300 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gold" /> {selectedProposal.email}</div>
                      {selectedProposal.officeAddress && <div className="text-zinc-400">Address: {selectedProposal.officeAddress}</div>}
                    </div>
                  </div>

                  {selectedProposal.isFilmRelated && (
                    <div className="p-4 rounded-xl bg-[#12121A] border border-zinc-800 space-y-2 text-xs">
                      <h4 className="font-bold text-gold uppercase tracking-wider">Cinema & Star Details</h4>
                      <div><span className="text-zinc-400">Movie Title:</span> <span className="text-white font-semibold">{selectedProposal.movieTitle}</span></div>
                      <div><span className="text-zinc-400">Cast:</span> <span className="text-zinc-200">{selectedProposal.leadActors || "—"}</span></div>
                      <div><span className="text-zinc-400">Director/Producer:</span> <span className="text-zinc-200">{selectedProposal.directorName || "—"} / {selectedProposal.producerName || "—"}</span></div>
                      <div><span className="text-zinc-400">Star Attendance:</span> <span className="text-amber-400 font-semibold">{selectedProposal.celebrityAttendanceStatus}</span></div>
                    </div>
                  )}

                  {/* Required Services */}
                  <div className="p-4 rounded-xl bg-[#12121A] border border-zinc-800 space-y-2">
                    <h4 className="text-xs font-bold text-gold uppercase tracking-wider">Required Services ({selectedProposal.servicesRequired.length})</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProposal.servicesRequired.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded text-[11px] bg-zinc-900 border border-zinc-700/60 text-zinc-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Assigned Manager, Internal Notes & Follow-ups */}
                <div className="space-y-4">
                  
                  {/* Event Manager Assignment */}
                  <div className="p-4 rounded-xl bg-[#12121A] border border-zinc-800 space-y-2.5">
                    <h4 className="text-xs font-bold text-gold uppercase tracking-wider">Assigned Event Manager</h4>
                    <div className="flex gap-2">
                      <select
                        value={selectedManager}
                        onChange={e => setSelectedManager(e.target.value)}
                        className="flex-1 bg-[#161622] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                      >
                        <option value="Vikram Reddy (Sr. Production Head)">Vikram Reddy (Sr. Production Head)</option>
                        <option value="Priya Sharma (Celebrity & Artist Lead)">Priya Sharma (Celebrity & Artist Lead)</option>
                        <option value="Rahul Varma (Stage & Technical Director)">Rahul Varma (Stage & Technical Director)</option>
                      </select>
                      <button
                        onClick={handleAssignManager}
                        className="px-3.5 py-2 rounded-lg bg-gold hover:bg-gold-light text-black font-bold text-xs"
                      >
                        Assign
                      </button>
                    </div>
                    {selectedProposal.assignedEventManager && (
                      <div className="text-[11px] text-emerald-400 font-semibold">
                        Currently assigned to: {selectedProposal.assignedEventManager}
                      </div>
                    )}
                  </div>

                  {/* Private Internal Notes */}
                  <div className="p-4 rounded-xl bg-[#12121A] border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gold uppercase tracking-wider">Internal Notes (Private)</h4>
                      <span className="text-[10px] text-zinc-500">Visible only to admins</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add private note (e.g. Discussed 10% discount on LED setup)..."
                        value={newInternalNote}
                        onChange={e => setNewInternalNote(e.target.value)}
                        className="flex-1 bg-[#161622] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                      />
                      <button
                        onClick={handleAddInternalNote}
                        className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs"
                      >
                        Add
                      </button>
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto divide-y divide-zinc-800/80 pr-1">
                      {selectedProposal.internalNotes.length === 0 ? (
                        <div className="text-zinc-500 text-xs italic py-1">No internal notes added yet.</div>
                      ) : (
                        selectedProposal.internalNotes.map(n => (
                          <div key={n.id} className="pt-2 text-xs space-y-0.5">
                            <div className="flex justify-between text-[10px] text-zinc-500">
                              <span>{n.authorName}</span>
                              <span>{new Date(n.date).toLocaleString()}</span>
                            </div>
                            <div className="text-zinc-200">{n.note}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Follow-up Tracking */}
                  <div className="p-4 rounded-xl bg-[#12121A] border border-zinc-800 space-y-3">
                    <h4 className="text-xs font-bold text-gold uppercase tracking-wider">Record Follow-up / Client Meeting</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex gap-2">
                        <select
                          value={followUpType}
                          onChange={e => setFollowUpType(e.target.value as any)}
                          className="bg-[#161622] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="Call">Call</option>
                          <option value="Email">Email</option>
                          <option value="Meeting">Meeting</option>
                          <option value="Venue Visit">Venue Visit</option>
                        </select>
                        <input
                          type="date"
                          value={nextFollowUpDate}
                          onChange={e => setNextFollowUpDate(e.target.value)}
                          className="bg-[#161622] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          title="Next follow up date"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Summary of call/meeting..."
                          value={followUpSummary}
                          onChange={e => setFollowUpSummary(e.target.value)}
                          className="flex-1 bg-[#161622] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                        />
                        <button
                          onClick={handleAddFollowUp}
                          className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs"
                        >
                          Log
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-36 overflow-y-auto divide-y divide-zinc-800/80 pr-1">
                      {selectedProposal.followUps.length === 0 ? (
                        <div className="text-zinc-500 text-xs italic py-1">No follow-ups recorded yet.</div>
                      ) : (
                        selectedProposal.followUps.map(f => (
                          <div key={f.id} className="pt-2 text-xs space-y-0.5">
                            <div className="flex justify-between text-[10px] text-zinc-500">
                              <span className="font-bold text-gold">[{f.type}]</span>
                              <span>{f.date}</span>
                            </div>
                            <div className="text-zinc-200">{f.summary}</div>
                            {f.nextFollowUpDate && (
                              <div className="text-[10px] text-purple-400">Next Action: {f.nextFollowUpDate}</div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* QUOTATION BUILDER MODAL */}
      {/* ========================================================= */}
      {isQuotationModalOpen && selectedProposal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-3xl bg-[#101018] border-2 border-gold/40 rounded-2xl shadow-2xl p-6 space-y-5 my-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Generate Official CineVenue Quotation</h3>
                <p className="text-xs text-zinc-400">Quotation for: {selectedProposal.eventName} ({selectedProposal.companyName})</p>
              </div>
              <button onClick={() => setIsQuotationModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Line items table */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-gold uppercase tracking-wider">Itemized Scope & Pricing</div>
              <div className="space-y-2">
                {quotationItems.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 text-xs bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                    <div className="col-span-5 font-semibold text-white">{item.serviceName}</div>
                    <div className="col-span-3 text-zinc-400">{item.quantity} {item.unit}</div>
                    <div className="col-span-4 text-right font-mono font-bold text-gold">
                      ₹{item.totalPrice.toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-zinc-900 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="font-mono text-white font-bold">
                    ₹{quotationItems.reduce((acc, i) => acc + i.totalPrice, 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Statutory GST (18%):</span>
                  <span className="font-mono text-white font-bold">
                    ₹{((quotationItems.reduce((acc, i) => acc + i.totalPrice, 0) * 18) / 100).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-gold text-sm font-black border-t border-zinc-800 pt-1.5">
                  <span>Grand Total:</span>
                  <span className="font-mono">
                    ₹{Math.round(quotationItems.reduce((acc, i) => acc + i.totalPrice, 0) * 1.18).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setIsQuotationModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateQuotation}
                className="px-6 py-2 rounded-lg bg-gold hover:bg-gold-light text-black font-extrabold text-xs shadow-lg flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Generate & Download Branded PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Prompt Dialog */}
      {isRejectionPromptOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#14141E] border border-red-500/40 rounded-xl p-5 max-w-md w-full space-y-4">
            <h4 className="text-sm font-bold text-red-400">Please provide a reason:</h4>
            <textarea
              rows={3}
              placeholder="e.g. Venue unavailable on requested date / Budget expectations misaligned..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-400 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsRejectionPromptOpen(false)}
                className="px-3 py-1.5 rounded bg-zinc-800 text-xs text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmRejectionOrCancellation("Rejected")}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 font-bold text-xs text-white"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Public Proposal Form Modal Triggered by Admin "Submit Event Proposal" Button */}
      <EventProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        onProposalSubmitted={newP => {
          setIsProposalModalOpen(false);
          loadData();
        }}
      />

    </div>
  );
}
