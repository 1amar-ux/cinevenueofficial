import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  ArrowUpDown, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Sparkles, 
  Send, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Users, 
  IndianRupee, 
  Building2, 
  Download, 
  X, 
  Shield, 
  MessageSquare, 
  FileCheck, 
  Check, 
  Layers,
  ChevronRight,
  Printer
} from 'lucide-react';
import { 
  Proposal, 
  ProposalStatus, 
  ProposalServiceType, 
  ProposalQuotation, 
  ProposalLineItem 
} from '../../types';
import { DEFAULT_PROPOSALS } from '../../data';
import { 
  getApplications, 
  getFilmProjectApplications, 
  updateApplicationStatus 
} from '../../services/filmProductionService';

interface ProposalAdminModuleProps {
  adminEmail?: string;
  isSuperAdmin?: boolean;
}

const ALL_STATUSES: ProposalStatus[] = [
  'NEW',
  'UNDER REVIEW',
  'CONTACTED',
  'QUOTE PREPARED',
  'QUOTE SENT',
  'APPROVED',
  'REJECTED',
  'IN PROGRESS',
  'COMPLETED'
];

const TEAM_MEMBERS = [
  "Rajesh Sharma (Senior Event Director)",
  "Kavita Nair (Brand Alliances Lead)",
  "Vikram Roy (Technical Production Head)",
  "Sneha Patel (Client Relations)",
  "Super Admin"
];

export const ProposalAdminModule: React.FC<ProposalAdminModuleProps> = ({
  adminEmail = 'superadmin@cinevenue.com',
  isSuperAdmin = true
}) => {
  const [proposals, setProposals] = useState<Proposal[]>(DEFAULT_PROPOSALS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Filter & Search State
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'estimatedBudget' | 'projectName'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selected Proposal for Details / Drawer
  const [activeProposal, setActiveProposal] = useState<Proposal | null>(null);

  // Internal Notes State for active proposal
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);

  // Quotation Builder State
  const [isEditingQuotation, setIsEditingQuotation] = useState<boolean>(false);
  const [quoteLineItems, setQuoteLineItems] = useState<ProposalLineItem[]>([
    { id: 'LI-1', item: 'Arena Stage & Trussing', description: 'Heavy duty German aluminum rig', quantity: 1, unitPrice: 500000, subtotal: 500000 },
    { id: 'LI-2', item: 'd&b Arena Sound Array', description: 'Dual 18-inch subs with FOH console', quantity: 1, unitPrice: 400000, subtotal: 400000 }
  ]);
  const [quoteTaxRate, setQuoteTaxRate] = useState<number>(18);
  const [quoteDiscount, setQuoteDiscount] = useState<number>(0);
  const [quoteValidUntil, setQuoteValidUntil] = useState<string>(
    new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]
  );
  const [quoteTerms, setQuoteTerms] = useState<string>(
    '50% advance upon contract signing, 40% on production setup day, 10% post-event signoff.'
  );
  const [quoteNotes, setQuoteNotes] = useState<string>(
    'Official production estimate from CineVenue Directorate. Includes 24/7 dedicated site lead.'
  );

  // Rejection Reason Modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Convert 24 Crafts & Film Applications to Proposal shape
  const getMappedFilmProposals = (): Proposal[] => {
    const rawApps = getApplications();
    const rawProjectPitches = getFilmProjectApplications();

    const filmAppProposals: Proposal[] = rawApps.map(app => ({
      proposalId: `FILM-APP-${app.id}`,
      customerId: app.applicantEmail || app.applicantId,
      customerType: 'Individual',
      fullName: app.applicantName,
      companyName: `${app.craftName} (Talent ID: ${app.applicantId})`,
      phone: '+91 98765 43210',
      email: app.applicantEmail,
      city: app.applicantLocation || 'Hyderabad',
      contactMethod: 'Email',
      serviceType: 'Film Production',
      projectName: `${app.projectTitle} • ${app.requirementPosition}`,
      location: app.applicantLocation || 'Hyderabad',
      preferredDate: app.appliedAt,
      estimatedBudget: 150000,
      servicesRequired: [
        `Craft: ${app.craftName}`,
        `Role: ${app.requirementPosition}`,
        `Experience: ${app.applicantExperienceYears || 0} Years`,
        `Expected Pay: ${app.expectedPay}`
      ],
      description: app.coverMessage 
        ? `${app.coverMessage}\n\nPast Experience: ${app.relevantExperience || 'N/A'}\nRemuneration: ${app.expectedPay}\nAvailability: ${app.availabilityNotes || 'Immediate'}`
        : `Application for ${app.requirementPosition} in ${app.projectTitle}.`,
      status: (app.status === 'Hired' || app.status === 'Selected') ? 'APPROVED' :
              app.status === 'Shortlisted' ? 'UNDER REVIEW' :
              (app.status === 'Audition' || app.status === 'Interview') ? 'CONTACTED' :
              app.status === 'Rejected' ? 'REJECTED' : 'NEW',
      internalNotes: app.adminNotes ? [
        {
          id: `NOTE-${Date.now()}`,
          author: 'Film Directorate',
          authorRole: 'Admin',
          note: app.adminNotes,
          createdAt: app.updatedAt || app.appliedAt
        }
      ] : [],
      createdAt: app.appliedAt ? new Date(app.appliedAt).toISOString() : new Date().toISOString(),
      updatedAt: app.updatedAt ? new Date(app.updatedAt).toISOString() : new Date().toISOString()
    }));

    const projectPitchProposals: Proposal[] = rawProjectPitches.map(pitch => ({
      proposalId: `FILM-PITCH-${pitch.id}`,
      customerId: pitch.email,
      customerType: 'Film Production',
      fullName: pitch.fullName,
      companyName: `${pitch.professionalRole} • ${pitch.representedEntityDetails || 'Independent Filmmaker'}`,
      phone: pitch.phone,
      email: pitch.email,
      city: `${pitch.city}, ${pitch.state}`,
      contactMethod: 'Phone',
      serviceType: 'Film Production',
      projectName: `[Feature Film Pitch] ${pitch.projectTitle}`,
      location: `${pitch.city}, ${pitch.state}`,
      preferredDate: pitch.submittedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
      estimatedBudget: 7500000,
      servicesRequired: [
        `Type: ${pitch.projectType}`,
        `Language: ${pitch.language}`,
        `Stage: ${pitch.projectStage}`,
        `Director: ${pitch.directorName}`,
        `Writer: ${pitch.writerName}`,
        `Budget Range: ${pitch.estimatedBudgetRange}`
      ],
      description: pitch.logline ? `${pitch.logline}\n\nSynopsis: ${pitch.shortSynopsis || ''}` : pitch.fullSynopsis || '',
      status: pitch.status === 'Approved' ? 'APPROVED' :
              pitch.status === 'Under Review' ? 'UNDER REVIEW' :
              pitch.status === 'Declined' ? 'REJECTED' : 'NEW',
      createdAt: pitch.submittedAt || new Date().toISOString(),
      updatedAt: pitch.lastUpdated || new Date().toISOString()
    }));

    return [...filmAppProposals, ...projectPitchProposals];
  };

  // Fetch Proposals from API and Merge with Film Applications
  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const filmProposals = getMappedFilmProposals();
      let baseList: Proposal[] = DEFAULT_PROPOSALS;

      try {
        const res = await fetch('/api/admin/proposals');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.proposals)) {
            baseList = data.proposals;
          }
        }
      } catch (err) {
        console.warn("Using local proposals fallback:", err);
      }

      // Merge base proposals and film applications (avoid duplicates)
      const existingIds = new Set(baseList.map(p => p.proposalId));
      const combined = [...baseList];
      filmProposals.forEach(fp => {
        if (!existingIds.has(fp.proposalId)) {
          combined.unshift(fp);
        }
      });

      setProposals(combined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();

    const handleSync = () => {
      fetchProposals();
    };
    window.addEventListener('cinevenue-film-applications-updated', handleSync);
    window.addEventListener('cinevenue-film-project-applications-updated', handleSync);
    return () => {
      window.removeEventListener('cinevenue-film-applications-updated', handleSync);
      window.removeEventListener('cinevenue-film-project-applications-updated', handleSync);
    };
  }, []);

  // Update Quotation form fields when active proposal changes
  useEffect(() => {
    if (activeProposal) {
      if (activeProposal.quotation) {
        setQuoteLineItems(activeProposal.quotation.lineItems || []);
        setQuoteTaxRate(activeProposal.quotation.taxRatePercent ?? 18);
        setQuoteDiscount(activeProposal.quotation.discountAmount ?? 0);
        setQuoteValidUntil(activeProposal.quotation.validUntil || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]);
        setQuoteTerms(activeProposal.quotation.termsAndConditions || '');
        setQuoteNotes(activeProposal.quotation.notes || '');
      } else {
        // Pre-fill default line items based on proposal budget/service
        const defaultBudget = activeProposal.estimatedBudget || 200000;
        setQuoteLineItems([
          {
            id: 'LI-1',
            item: `${activeProposal.serviceType} Execution`,
            description: activeProposal.projectName,
            quantity: 1,
            unitPrice: defaultBudget,
            subtotal: defaultBudget
          }
        ]);
        setQuoteDiscount(0);
        setQuoteTaxRate(18);
      }
    }
  }, [activeProposal]);

  // Handle Status Update
  const handleUpdateStatus = async (proposalId: string, newStatus: ProposalStatus, details = '') => {
    // If it's a Film 24 Crafts Application, synchronize back to filmProductionService
    if (proposalId.startsWith('FILM-APP-')) {
      const origAppId = proposalId.replace('FILM-APP-', '');
      const mappedAppStatus = 
        newStatus === 'APPROVED' ? 'Hired' :
        newStatus === 'UNDER REVIEW' ? 'Shortlisted' :
        newStatus === 'CONTACTED' ? 'Audition Scheduled' :
        newStatus === 'REJECTED' ? 'Rejected' : 'Applied';
      updateApplicationStatus(origAppId, mappedAppStatus as any, details);
    }

    try {
      const res = await fetch(`/api/admin/proposals/${proposalId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminName: isSuperAdmin ? 'Super Admin' : adminEmail, details })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.proposal) {
          setProposals(prev => prev.map(p => p.proposalId === proposalId ? data.proposal : p));
          if (activeProposal?.proposalId === proposalId) {
            setActiveProposal(data.proposal);
          }
        }
      } else {
        // Local Fallback
        setProposals(prev => prev.map(p => {
          if (p.proposalId === proposalId) {
            const updated = {
              ...p,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              auditLogs: [
                {
                  id: `LOG-${Date.now().toString().slice(-4)}`,
                  action: `Status changed to ${newStatus}`,
                  performedBy: 'Super Admin',
                  timestamp: new Date().toISOString(),
                  previousStatus: p.status,
                  newStatus: newStatus,
                  details
                },
                ...(p.auditLogs || [])
              ]
            };
            if (activeProposal?.proposalId === proposalId) setActiveProposal(updated);
            return updated;
          }
          return p;
        }));
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // Handle Assign Team Member
  const handleAssignTeamMember = async (proposalId: string, assignedTo: string) => {
    try {
      const res = await fetch(`/api/admin/proposals/${proposalId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo, adminName: 'Super Admin' })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.proposal) {
          setProposals(prev => prev.map(p => p.proposalId === proposalId ? data.proposal : p));
          if (activeProposal?.proposalId === proposalId) {
            setActiveProposal(data.proposal);
          }
        }
      } else {
        setProposals(prev => prev.map(p => {
          if (p.proposalId === proposalId) {
            const updated = { ...p, assignedTo, updatedAt: new Date().toISOString() };
            if (activeProposal?.proposalId === proposalId) setActiveProposal(updated);
            return updated;
          }
          return p;
        }));
      }
    } catch (err) {
      console.error("Assign error:", err);
    }
  };

  // Add Internal Note
  const handleAddInternalNote = async () => {
    if (!activeProposal || !newNoteText.trim()) return;
    setIsAddingNote(true);

    try {
      const res = await fetch(`/api/admin/proposals/${activeProposal.proposalId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: newNoteText.trim(),
          author: isSuperAdmin ? 'Super Admin' : adminEmail,
          authorRole: isSuperAdmin ? 'Executive Lead' : 'Production Manager'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.proposal) {
          setProposals(prev => prev.map(p => p.proposalId === activeProposal.proposalId ? data.proposal : p));
          setActiveProposal(data.proposal);
          setNewNoteText('');
        }
      } else {
        const newNoteObj = {
          id: `NOTE-${Date.now()}`,
          author: 'Super Admin',
          authorRole: 'Executive Lead',
          note: newNoteText.trim(),
          createdAt: new Date().toISOString()
        };
        const updated = {
          ...activeProposal,
          internalNotes: [newNoteObj, ...(activeProposal.internalNotes || [])]
        };
        setProposals(prev => prev.map(p => p.proposalId === activeProposal.proposalId ? updated : p));
        setActiveProposal(updated);
        setNewNoteText('');
      }
    } catch (err) {
      console.error("Add note error:", err);
    } finally {
      setIsAddingNote(false);
    }
  };

  // Save / Dispatch Quotation
  const handleSaveQuotation = async (status: 'Draft' | 'Sent') => {
    if (!activeProposal) return;

    try {
      const subtotal = quoteLineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
      const taxable = Math.max(0, subtotal - quoteDiscount);
      const taxAmount = (taxable * quoteTaxRate) / 100;
      const finalQuotationAmount = taxable + taxAmount;

      const payload = {
        lineItems: quoteLineItems,
        subtotal,
        taxRatePercent: quoteTaxRate,
        taxAmount,
        discountAmount: quoteDiscount,
        finalQuotationAmount,
        validUntil: quoteValidUntil,
        termsAndConditions: quoteTerms,
        notes: quoteNotes,
        status,
        preparedBy: 'Super Admin'
      };

      const res = await fetch(`/api/admin/proposals/${activeProposal.proposalId}/quotation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.proposal) {
          setProposals(prev => prev.map(p => p.proposalId === activeProposal.proposalId ? data.proposal : p));
          setActiveProposal(data.proposal);
          setIsEditingQuotation(false);
          alert(status === 'Sent' ? "Quotation successfully dispatched to customer!" : "Quotation draft saved.");
        }
      }
    } catch (err) {
      console.error("Save quotation error:", err);
    }
  };

  // Line Item actions in quotation
  const addLineItem = () => {
    setQuoteLineItems(prev => [
      ...prev,
      { id: `LI-${Date.now().toString().slice(-4)}`, item: '', description: '', quantity: 1, unitPrice: 0, subtotal: 0 }
    ]);
  };

  const removeLineItem = (idx: number) => {
    setQuoteLineItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateLineItem = (idx: number, field: keyof ProposalLineItem, value: any) => {
    setQuoteLineItems(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const q = field === 'quantity' ? Number(value) : copy[idx].quantity;
        const p = field === 'unitPrice' ? Number(value) : copy[idx].unitPrice;
        copy[idx].subtotal = q * p;
      }
      return copy;
    });
  };

  // Status Badge Helper
  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case 'NEW':
        return { label: 'NEW', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'UNDER REVIEW':
        return { label: 'UNDER REVIEW', bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      case 'CONTACTED':
        return { label: 'CONTACTED', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'QUOTE PREPARED':
        return { label: 'QUOTE PREPARED', bg: 'bg-teal-500/20 text-teal-400 border-teal-500/30' };
      case 'QUOTE SENT':
        return { label: 'QUOTE SENT', bg: 'bg-emerald-500/25 text-emerald-400 border-emerald-500/40 font-bold' };
      case 'APPROVED':
        return { label: 'APPROVED', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'REJECTED':
        return { label: 'REJECTED', bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
      case 'IN PROGRESS':
        return { label: 'IN PROGRESS', bg: 'bg-gold/20 text-gold border-gold/40 font-bold' };
      case 'COMPLETED':
        return { label: 'COMPLETED', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      default:
        return { label: status, bg: 'bg-white/10 text-white border-white/20' };
    }
  };

  // Filter & Search Logic
  const filteredProposals = proposals.filter((p) => {
    if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;
    if (selectedService !== 'ALL' && p.serviceType !== selectedService) return false;
    if (selectedCity !== 'ALL' && p.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = p.proposalId.toLowerCase().includes(q);
      const matchName = p.fullName.toLowerCase().includes(q);
      const matchProject = p.projectName.toLowerCase().includes(q);
      const matchCompany = (p.companyName || '').toLowerCase().includes(q);
      const matchCity = p.city.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchProject && !matchCompany && !matchCity) return false;
    }
    return true;
  }).sort((a, b) => {
    let valA: any = a[sortBy];
    let valB: any = b[sortBy];
    if (sortBy === 'estimatedBudget') {
      valA = a.estimatedBudget || 0;
      valB = b.estimatedBudget || 0;
    }
    if (sortOrder === 'asc') return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  // Calculate Metrics
  const totalProposals = proposals.length;
  const newProposals = proposals.filter(p => p.status === 'NEW').length;
  const underReviewProposals = proposals.filter(p => p.status === 'UNDER REVIEW' || p.status === 'CONTACTED').length;
  const quotesSentProposals = proposals.filter(p => p.status === 'QUOTE SENT' || p.status === 'QUOTE PREPARED').length;
  const approvedProposals = proposals.filter(p => p.status === 'APPROVED' || p.status === 'IN PROGRESS').length;
  const totalPipelineBudget = proposals.reduce((acc, p) => acc + (p.estimatedBudget || 0), 0);

  // Status counts object
  const statusCounts: { [key: string]: number } = {
    ALL: proposals.length,
    NEW: proposals.filter(p => p.status === 'NEW').length,
    'UNDER REVIEW': proposals.filter(p => p.status === 'UNDER REVIEW').length,
    CONTACTED: proposals.filter(p => p.status === 'CONTACTED').length,
    'QUOTE PREPARED': proposals.filter(p => p.status === 'QUOTE PREPARED').length,
    'QUOTE SENT': proposals.filter(p => p.status === 'QUOTE SENT').length,
    APPROVED: proposals.filter(p => p.status === 'APPROVED').length,
    REJECTED: proposals.filter(p => p.status === 'REJECTED').length,
    'IN PROGRESS': proposals.filter(p => p.status === 'IN PROGRESS').length,
    COMPLETED: proposals.filter(p => p.status === 'COMPLETED').length
  };

  // Quotation calculations
  const quoteSubtotal = quoteLineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const quoteTaxable = Math.max(0, quoteSubtotal - quoteDiscount);
  const quoteTaxAmount = (quoteTaxable * quoteTaxRate) / 100;
  const quoteFinalTotal = quoteTaxable + quoteTaxAmount;

  return (
    <div className="space-y-6" id="proposals-admin-module">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0e0f14] border border-white/10 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-gold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-gold" />
            <span>Super Admin & Venue Directorate</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Proposal Management & Quotation System
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Manage movie pre-releases, audio launches, brand partnerships, arena setups, and client quotations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProposals}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0e0f14] border border-white/10 rounded-xl p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Total Proposals</span>
          <span className="text-xl font-bold font-mono text-white mt-1 block">{totalProposals}</span>
          <span className="text-[10px] text-text-secondary mt-1 block">All registered briefs</span>
        </div>

        <div className="bg-[#0e0f14] border border-blue-500/20 rounded-xl p-4">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">New Submissions</span>
          <span className="text-xl font-bold font-mono text-blue-400 mt-1 block">{newProposals}</span>
          <span className="text-[10px] text-text-secondary mt-1 block">Awaiting review</span>
        </div>

        <div className="bg-[#0e0f14] border border-purple-500/20 rounded-xl p-4">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">In Review</span>
          <span className="text-xl font-bold font-mono text-purple-400 mt-1 block">{underReviewProposals}</span>
          <span className="text-[10px] text-text-secondary mt-1 block">Feasibility & contact</span>
        </div>

        <div className="bg-[#0e0f14] border border-emerald-500/20 rounded-xl p-4">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Quotes Dispatched</span>
          <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">{quotesSentProposals}</span>
          <span className="text-[10px] text-text-secondary mt-1 block">Quotes with clients</span>
        </div>

        <div className="bg-[#0e0f14] border border-gold/20 rounded-xl p-4">
          <span className="text-[10px] font-bold text-gold uppercase tracking-wider block">Approved & Active</span>
          <span className="text-xl font-bold font-mono text-gold mt-1 block">{approvedProposals}</span>
          <span className="text-[10px] text-text-secondary mt-1 block">In production stage</span>
        </div>

        <div className="bg-[#0e0f14] border border-white/10 rounded-xl p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Pipeline Budget</span>
          <span className="text-base font-bold font-mono text-gold mt-1 block">
            ₹{(totalPipelineBudget / 100000).toFixed(1)}L
          </span>
          <span className="text-[10px] text-text-secondary mt-1 block">Estimated total</span>
        </div>
      </div>

      {/* STATUS CHIPS CARDS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedStatus('ALL')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
            selectedStatus === 'ALL'
              ? 'bg-gold/20 border-gold text-gold font-bold shadow-sm shadow-gold/20'
              : 'bg-[#0e0f14] border-white/10 text-text-secondary hover:text-white'
          }`}
        >
          <span>All Proposals</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 font-mono">
            {statusCounts.ALL}
          </span>
        </button>

        {ALL_STATUSES.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
              selectedStatus === st
                ? 'bg-gold/20 border-gold text-gold font-bold shadow-sm shadow-gold/20'
                : 'bg-[#0e0f14] border-white/10 text-text-secondary hover:text-white'
            }`}
          >
            <span>{st}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 font-mono">
              {statusCounts[st] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-[#0e0f14] border border-white/10 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ID, customer, project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-gold"
          />
        </div>

        {/* Service Type Filter */}
        <div>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full bg-[#12131a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
          >
            <option value="ALL">All Service Categories</option>
            <option value="Pre-Release Event">Pre-Release Event</option>
            <option value="Audio Launch">Audio Launch</option>
            <option value="Live Concert">Live Concert</option>
            <option value="Brand Promotion">Brand Promotion</option>
            <option value="Celebrity Event">Celebrity Event</option>
            <option value="Corporate Event">Corporate Event</option>
            <option value="Movie / Event Ticketing">Movie / Event Ticketing</option>
            <option value="Film Production">Film Production</option>
          </select>
        </div>

        {/* City Filter */}
        <div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full bg-[#12131a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
          >
            <option value="ALL">All Cities</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Vijayawada">Vijayawada</option>
            <option value="Visakhapatnam">Visakhapatnam</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Chennai">Chennai</option>
            <option value="Mumbai">Mumbai</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="flex-1 bg-[#12131a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
          >
            <option value="createdAt">Sort: Submission Date</option>
            <option value="estimatedBudget">Sort: Estimated Budget</option>
            <option value="projectName">Sort: Project Name</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs transition-all cursor-pointer"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PROPOSALS TABLE / LIST */}
      <div className="bg-[#0e0f14] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-text-muted uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Proposal ID & Date</th>
                <th className="py-3 px-4">Customer & Organization</th>
                <th className="py-3 px-4">Service & Project Brief</th>
                <th className="py-3 px-4">City / Venue</th>
                <th className="py-3 px-4">Budget / Quote</th>
                <th className="py-3 px-4">Assigned Specialist</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    No proposals match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredProposals.map((proposal) => {
                  const badge = getStatusBadge(proposal.status);
                  const hasQuote = Boolean(proposal.quotation);

                  return (
                    <tr 
                      key={proposal.proposalId} 
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* ID & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-gold block">
                          {proposal.proposalId}
                        </span>
                        <span className="text-[10px] text-text-muted block mt-0.5">
                          {new Date(proposal.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white block truncate max-w-[150px]">
                          {proposal.fullName}
                        </span>
                        {proposal.companyName && (
                          <span className="text-[11px] text-text-secondary block truncate max-w-[150px]">
                            {proposal.companyName}
                          </span>
                        )}
                        <span className="text-[10px] text-text-muted block">
                          {proposal.phone}
                        </span>
                      </td>

                      {/* Service & Project */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-gold inline-block mb-1">
                          {proposal.serviceType}
                        </span>
                        <span className="font-semibold text-white block truncate">
                          {proposal.projectName}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <span className="text-text-secondary font-medium block">
                          {proposal.city}
                        </span>
                        <span className="text-[10px] text-text-muted block truncate max-w-[120px]">
                          {proposal.location}
                        </span>
                      </td>

                      {/* Budget */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-white block">
                          ₹{proposal.estimatedBudget ? proposal.estimatedBudget.toLocaleString('en-IN') : 'N/A'}
                        </span>
                        {hasQuote && (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                            Q: ₹{proposal.quotation?.finalQuotationAmount.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>

                      {/* Assigned Specialist */}
                      <td className="py-3.5 px-4">
                        {proposal.assignedTo ? (
                          <span className="text-[11px] text-text-secondary block truncate max-w-[130px]">
                            {proposal.assignedTo.split('(')[0]}
                          </span>
                        ) : (
                          <span className="text-[10px] text-text-muted italic">Unassigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setActiveProposal(proposal)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-gold/20 text-white hover:text-gold border border-white/10 hover:border-gold/30 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED PROPOSAL INSPECTION & MANAGEMENT MODAL / DRAWER */}
      {activeProposal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0c10] border border-white/15 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 relative">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                    {activeProposal.proposalId}
                  </span>
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
                    {activeProposal.serviceType}
                  </span>
                  <span className="text-xs text-text-muted">•</span>
                  <span className="text-xs text-text-muted">
                    {activeProposal.customerType}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-1">
                  {activeProposal.projectName}
                </h2>
              </div>

              <button
                onClick={() => { setActiveProposal(null); setIsEditingQuotation(false); }}
                className="p-2 text-text-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions & Status Workflow Bar */}
            <div className="bg-[#12131b] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                  Workflow Lifecycle Status
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <select
                    value={activeProposal.status}
                    onChange={(e) => handleUpdateStatus(activeProposal.proposalId, e.target.value as ProposalStatus)}
                    className="bg-black/60 border border-gold/40 text-gold font-bold rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  >
                    {ALL_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assign Team Member */}
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                  Assigned Team Specialist
                </span>
                <select
                  value={activeProposal.assignedTo || ''}
                  onChange={(e) => handleAssignTeamMember(activeProposal.proposalId, e.target.value)}
                  className="bg-black/60 border border-white/20 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none mt-1"
                >
                  <option value="">Unassigned</option>
                  {TEAM_MEMBERS.map(tm => (
                    <option key={tm} value={tm}>{tm}</option>
                  ))}
                </select>
              </div>

              {/* Quick Decision Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(activeProposal.proposalId, 'APPROVED', 'Approved by Super Admin')}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Approve Brief
                </button>
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Reject Brief
                </button>
              </div>
            </div>

            {/* Grid 2-col: Customer Details & Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info Card */}
              <div className="bg-[#101118] border border-white/10 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Customer Contact Profile</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Full Name:</span>
                    <span className="font-semibold text-white">{activeProposal.fullName}</span>
                  </div>
                  {activeProposal.companyName && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Company / Banner:</span>
                      <span className="text-white">{activeProposal.companyName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-text-muted">Phone:</span>
                    <span className="text-white font-mono">{activeProposal.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Email:</span>
                    <span className="text-white">{activeProposal.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">City / Region:</span>
                    <span className="text-white">{activeProposal.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Contact Channel:</span>
                    <span className="text-gold font-semibold">{activeProposal.contactMethod}</span>
                  </div>
                </div>

                {/* Direct Contact Triggers */}
                <div className="pt-2 border-t border-white/5 flex gap-2">
                  <a
                    href={`https://wa.me/${activeProposal.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${activeProposal.phone}`}
                    className="flex-1 text-center py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold"
                  >
                    Call
                  </a>
                  <a
                    href={`mailto:${activeProposal.email}?subject=CineVenue Proposal - ${activeProposal.proposalId}`}
                    className="flex-1 text-center py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold"
                  >
                    Email
                  </a>
                </div>
              </div>

              {/* Project Logistics Card */}
              <div className="bg-[#101118] border border-white/10 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Logistical Specifications</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Venue / Location:</span>
                    <span className="font-semibold text-white">{activeProposal.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Target Event Date:</span>
                    <span className="text-white font-mono">
                      {activeProposal.preferredDate || 'Flexible / TBD'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Expected Footfall:</span>
                    <span className="text-white font-mono">
                      {activeProposal.expectedAttendees ? `${activeProposal.expectedAttendees.toLocaleString()} Attendees` : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Customer Budget:</span>
                    <span className="text-gold font-mono font-bold">
                      ₹{activeProposal.estimatedBudget ? activeProposal.estimatedBudget.toLocaleString('en-IN') : 'Custom on quote'}
                    </span>
                  </div>
                </div>

                {activeProposal.servicesRequired && activeProposal.servicesRequired.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[10px] text-text-muted block mb-1.5 uppercase font-bold">Requested Setup:</span>
                    <div className="flex flex-wrap gap-1">
                      {activeProposal.servicesRequired.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-text-secondary">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-[#101118] border border-white/10 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold">
                Detailed Brief & Client Objectives
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                {activeProposal.description}
              </p>
            </div>

            {/* Attachments */}
            {activeProposal.attachments && activeProposal.attachments.length > 0 && (
              <div className="bg-[#101118] border border-white/10 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold">
                  Supporting Documents & Decks
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeProposal.attachments.map(att => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 hover:bg-white/5 border border-white/10 text-xs text-white"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="truncate">{att.name}</span>
                      </div>
                      <Download className="w-4 h-4 text-text-muted hover:text-gold shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* QUOTATION BUILDER & SENDER */}
            <div className="bg-[#101118] border border-gold/30 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Itemized Quotation Engine
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  {activeProposal.quotation && !isEditingQuotation && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Status: {activeProposal.quotation.status}
                    </span>
                  )}
                  <button
                    onClick={() => setIsEditingQuotation(!isEditingQuotation)}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                  >
                    {isEditingQuotation ? 'Cancel Editing' : activeProposal.quotation ? 'Edit Quotation' : 'Create Quotation'}
                  </button>
                </div>
              </div>

              {isEditingQuotation ? (
                <div className="space-y-4 text-xs">
                  {/* Line Items Builder */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-text-secondary uppercase">Production Line Items</span>
                      <button
                        onClick={addLineItem}
                        className="flex items-center gap-1 text-[11px] font-bold text-gold hover:underline cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Item</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {quoteLineItems.map((li, idx) => (
                        <div key={li.id || idx} className="grid grid-cols-12 gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                          <div className="col-span-5">
                            <input
                              type="text"
                              placeholder="Item Name (e.g. 4K LED Mega Wall)"
                              value={li.item}
                              onChange={(e) => updateLineItem(idx, 'item', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                            <input
                              type="text"
                              placeholder="Description / Specs"
                              value={li.description || ''}
                              onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                              className="w-full bg-transparent border-0 text-[10px] text-text-muted mt-1 px-1 focus:outline-none"
                            />
                          </div>

                          <div className="col-span-2">
                            <input
                              type="number"
                              placeholder="Qty"
                              value={li.quantity}
                              onChange={(e) => updateLineItem(idx, 'quantity', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white text-center"
                            />
                          </div>

                          <div className="col-span-3">
                            <input
                              type="number"
                              placeholder="Unit Rate (₹)"
                              value={li.unitPrice}
                              onChange={(e) => updateLineItem(idx, 'unitPrice', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white text-right font-mono"
                            />
                          </div>

                          <div className="col-span-2 flex items-center justify-between">
                            <span className="font-mono text-white text-right block truncate">
                              ₹{(li.quantity * li.unitPrice).toLocaleString('en-IN')}
                            </span>
                            <button
                              onClick={() => removeLineItem(idx)}
                              className="text-text-muted hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black/30 p-3 rounded-xl border border-white/5">
                    <div>
                      <label className="text-[10px] text-text-muted uppercase block mb-1">GST Rate (%)</label>
                      <input
                        type="number"
                        value={quoteTaxRate}
                        onChange={(e) => setQuoteTaxRate(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-text-muted uppercase block mb-1">Discount (₹)</label>
                      <input
                        type="number"
                        value={quoteDiscount}
                        onChange={(e) => setQuoteDiscount(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-text-muted uppercase block mb-1">Valid Until Date</label>
                      <input
                        type="date"
                        value={quoteValidUntil}
                        onChange={(e) => setQuoteValidUntil(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Terms & Notes */}
                  <div>
                    <label className="text-[10px] text-text-muted uppercase block mb-1">Payment & Commercial Terms</label>
                    <textarea
                      rows={2}
                      value={quoteTerms}
                      onChange={(e) => setQuoteTerms(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  {/* Summary bar */}
                  <div className="bg-black/50 p-4 rounded-xl border border-gold/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-text-muted uppercase block">Calculated Total</span>
                      <span className="text-lg font-bold font-mono text-gold">
                        ₹{quoteFinalTotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveQuotation('Draft')}
                        className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      >
                        Save Draft
                      </button>
                      <button
                        onClick={() => handleSaveQuotation('Sent')}
                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch to Customer</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : activeProposal.quotation ? (
                <div className="space-y-3 text-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-text-muted text-[10px] uppercase">
                          <th className="py-2">Item</th>
                          <th className="py-2 text-center">Qty</th>
                          <th className="py-2 text-right">Unit Rate</th>
                          <th className="py-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {activeProposal.quotation.lineItems.map((li, idx) => (
                          <tr key={idx}>
                            <td className="py-2 text-white font-medium">{li.item}</td>
                            <td className="py-2 text-center text-text-secondary">{li.quantity}</td>
                            <td className="py-2 text-right text-text-secondary">₹{li.unitPrice.toLocaleString('en-IN')}</td>
                            <td className="py-2 text-right text-white font-mono">₹{li.subtotal.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                    <span className="text-text-muted text-[11px]">Valid Until: {activeProposal.quotation.validUntil}</span>
                    <span className="text-base font-bold font-mono text-gold">
                      Total: ₹{activeProposal.quotation.finalQuotationAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-text-muted text-xs">
                  No quotation has been prepared yet for this brief.
                </div>
              )}
            </div>

            {/* INTERNAL ADMIN NOTES */}
            <div className="bg-[#101118] border border-white/10 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Internal Admin Notes (Strictly Confidential)</span>
              </h4>

              {/* Add Note Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add private note (e.g. Police NOC received, sound vendor VND-101 allocated)..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddInternalNote(); }}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-gold"
                />
                <button
                  onClick={handleAddInternalNote}
                  disabled={isAddingNote || !newNoteText.trim()}
                  className="px-4 py-2 bg-white/10 hover:bg-gold/20 text-white hover:text-gold border border-white/10 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                >
                  Add Note
                </button>
              </div>

              {/* Notes Timeline */}
              {activeProposal.internalNotes && activeProposal.internalNotes.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {activeProposal.internalNotes.map((nt) => (
                    <div key={nt.id} className="p-3 rounded-lg bg-black/30 border border-white/5 text-xs space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-text-muted">
                        <span className="font-bold text-text-secondary">{nt.author} ({nt.authorRole})</span>
                        <span>{new Date(nt.createdAt).toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-text-secondary">{nt.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-text-muted italic">No internal notes logged yet.</p>
              )}
            </div>

            {/* AUDIT LOG TIMELINE */}
            {activeProposal.auditLogs && activeProposal.auditLogs.length > 0 && (
              <div className="bg-[#101118] border border-white/10 rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Audit & Activity History
                </h4>
                <div className="space-y-2 text-xs">
                  {activeProposal.auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start justify-between p-2 rounded bg-black/20 text-[11px] border border-white/5">
                      <div>
                        <span className="font-semibold text-white">{log.action}</span>
                        {log.details && (
                          <span className="text-text-muted block mt-0.5">{log.details}</span>
                        )}
                      </div>
                      <div className="text-right text-text-muted shrink-0 ml-4">
                        <span>{log.performedBy}</span>
                        <span className="block text-[10px]">
                          {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-white/10 pt-4 flex justify-end">
              <button
                onClick={() => { setActiveProposal(null); setIsEditingQuotation(false); }}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT REASON MODAL */}
      {isRejectModalOpen && activeProposal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0f14] border border-rose-500/30 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>Reject Proposal Brief</span>
            </h3>
            <p className="text-xs text-text-secondary">
              Provide a clear reason for declining this project request (e.g. Schedule clash, technical impossibility, budget mismatch):
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setIsRejectModalOpen(false); setRejectReason(''); }}
                className="px-4 py-2 bg-white/5 text-white rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdateStatus(activeProposal.proposalId, 'REJECTED', rejectReason || 'Declined by Admin');
                  setIsRejectModalOpen(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
