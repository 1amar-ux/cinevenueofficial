import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Calendar, 
  MapPin, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Sparkles, 
  Download, 
  Eye, 
  FileCheck,
  Building2,
  Phone,
  Mail,
  X,
  Printer,
  ShieldAlert
} from 'lucide-react';
import { Proposal, ProposalStatus } from '../../types';
import { ProposalSubmitForm } from './ProposalSubmitForm';

interface CustomerProposalsViewProps {
  userEmail: string;
  userName?: string;
  userPhone?: string;
}

export const CustomerProposalsView: React.FC<CustomerProposalsViewProps> = ({
  userEmail,
  userName = '',
  userPhone = ''
}) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchMyProposals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/proposals/my?email=${encodeURIComponent(userEmail)}`, {
        headers: { 'x-user-email': userEmail }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.proposals)) {
          setProposals(data.proposals);
        }
      }
    } catch (err) {
      console.error("Failed to fetch my proposals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchMyProposals();
    }
  }, [userEmail]);

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case 'NEW':
        return {
          label: 'New Brief Received',
          bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
          dot: 'bg-blue-400'
        };
      case 'UNDER REVIEW':
        return {
          label: 'Under Technical Review',
          bg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
          dot: 'bg-purple-400'
        };
      case 'CONTACTED':
        return {
          label: 'Consultation in Progress',
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400 animate-pulse'
        };
      case 'QUOTE PREPARED':
        return {
          label: 'Quote in Preparation',
          bg: 'bg-teal-500/15 border-teal-500/30 text-teal-400',
          dot: 'bg-teal-400'
        };
      case 'QUOTE SENT':
        return {
          label: 'Quotation Ready to View',
          bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/20 font-bold',
          dot: 'bg-emerald-400 animate-ping'
        };
      case 'APPROVED':
        return {
          label: 'Proposal Approved',
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400'
        };
      case 'REJECTED':
        return {
          label: 'Declined / Out of Scope',
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400'
        };
      case 'IN PROGRESS':
        return {
          label: 'Production in Progress',
          bg: 'bg-amber-500/20 border-gold/40 text-gold font-bold',
          dot: 'bg-gold'
        };
      case 'COMPLETED':
        return {
          label: 'Successfully Completed',
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400'
        };
      default:
        return {
          label: status,
          bg: 'bg-white/10 border-white/20 text-white',
          dot: 'bg-white'
        };
    }
  };

  const filteredProposals = proposals.filter(p => 
    p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.proposalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="my-proposals-module">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0e0f14] border border-white/10 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-gold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Event & Production Directorate</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
            My Submitted Proposals & Quotations
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Track status, feasibility reviews, and official itemized quotations for your events and campaigns.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-gold/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Submit a Proposal</span>
        </button>
      </div>

      {/* Proposals List */}
      {isLoading ? (
        <div className="p-12 text-center text-text-muted text-xs flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <span>Loading your proposals...</span>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="bg-[#0e0f14] border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 text-gold">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            No Proposals Submitted Yet
          </h3>
          <p className="text-xs text-text-secondary max-w-md mx-auto mb-6">
            Looking to organize a movie pre-release event, audio launch, concert, or brand campaign? Submit a proposal to receive an instant dedicated manager and tailored production quote.
          </p>
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:shadow-gold/20"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Your First Proposal</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => {
            const badge = getStatusBadge(proposal.status);
            const hasQuote = Boolean(proposal.quotation);

            return (
              <div
                key={proposal.proposalId}
                className="bg-[#0e0f14] border border-white/10 hover:border-gold/30 rounded-2xl p-5 sm:p-6 transition-all duration-300 relative group overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-white/5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                        {proposal.proposalId}
                      </span>
                      <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                        {proposal.serviceType}
                      </span>
                      <span className="text-[11px] text-text-muted">•</span>
                      <span className="text-[11px] text-text-muted">
                        Submitted on {new Date(proposal.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-gold transition-colors">
                      {proposal.projectName}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${badge.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </div>
                  </div>
                </div>

                {/* Proposal Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs">
                  <div>
                    <span className="text-text-muted block text-[10px] uppercase tracking-wider">Venue / Location</span>
                    <span className="text-white font-medium flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      {proposal.location || proposal.city}
                    </span>
                  </div>

                  <div>
                    <span className="text-text-muted block text-[10px] uppercase tracking-wider">Estimated Budget</span>
                    <span className="text-white font-medium flex items-center gap-1 mt-0.5">
                      <IndianRupee className="w-3.5 h-3.5 text-gold shrink-0" />
                      {proposal.estimatedBudget ? `₹${proposal.estimatedBudget.toLocaleString('en-IN')}` : 'Custom Estimate'}
                    </span>
                  </div>

                  <div>
                    <span className="text-text-muted block text-[10px] uppercase tracking-wider">Target Event Date</span>
                    <span className="text-white font-medium flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      {proposal.preferredDate ? new Date(proposal.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible'}
                    </span>
                  </div>

                  <div>
                    <span className="text-text-muted block text-[10px] uppercase tracking-wider">Official Quotation</span>
                    <span className={`font-semibold mt-0.5 block ${hasQuote ? 'text-emerald-400' : 'text-text-muted'}`}>
                      {hasQuote ? `₹${proposal.quotation?.finalQuotationAmount.toLocaleString('en-IN')} (Ready)` : 'Awaiting Calculation'}
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-text-muted truncate max-w-md">
                    <span className="font-semibold text-text-secondary">Required Services:</span>
                    <span className="truncate">
                      {proposal.servicesRequired && proposal.servicesRequired.length > 0
                        ? proposal.servicesRequired.join(", ")
                        : "Full Production Setup"}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedProposal(proposal)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-gold/15 text-white hover:text-gold border border-white/10 hover:border-gold/30 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Proposal & Quote</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUBMISSION MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <ProposalSubmitForm
            userEmail={userEmail}
            userName={userName}
            userPhone={userPhone}
            isOpenAsModal={true}
            onCancel={() => setIsSubmitModalOpen(false)}
            onSuccess={(newProp) => {
              setIsSubmitModalOpen(false);
              fetchMyProposals();
            }}
          />
        </div>
      )}

      {/* DETAILED PROPOSAL & QUOTATION DRAWER / MODAL */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0d12] border border-white/15 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                    {selectedProposal.proposalId}
                  </span>
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                    {selectedProposal.serviceType}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-1">
                  {selectedProposal.projectName}
                </h2>
              </div>

              <button
                onClick={() => setSelectedProposal(null)}
                className="p-2 text-text-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Summary Banner */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-wider block">Current Processing Stage</span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  {getStatusBadge(selectedProposal.status).label}
                </span>
              </div>
              <div className="text-left sm:text-right text-xs text-text-muted">
                <span>Submitted on {new Date(selectedProposal.createdAt).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Project Overview */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold">
                Project Scope & Details
              </h4>
              <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                {selectedProposal.description}
              </div>

              {selectedProposal.servicesRequired && selectedProposal.servicesRequired.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-text-muted block mb-2">Requested Infrastructure Components:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProposal.servicesRequired.map(srv => (
                      <span key={srv} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-text-secondary">
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Official Itemized Quotation Section (If Available) */}
            {selectedProposal.quotation ? (
              <div className="bg-gradient-to-b from-[#14151f] to-[#0a0b0f] border border-gold/30 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                      Official Quotation #{selectedProposal.quotation.id}
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Valid Until: {selectedProposal.quotation.validUntil}
                  </span>
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-text-muted uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-2">Item / Service</th>
                        <th className="py-2.5 px-2 text-center">Qty</th>
                        <th className="py-2.5 px-2 text-right">Unit Rate (₹)</th>
                        <th className="py-2.5 px-2 text-right">Subtotal (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedProposal.quotation.lineItems.map((li, idx) => (
                        <tr key={li.id || idx}>
                          <td className="py-2.5 px-2">
                            <span className="font-semibold text-white block">{li.item}</span>
                            {li.description && (
                              <span className="text-[11px] text-text-muted block">{li.description}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center text-text-secondary">{li.quantity}</td>
                          <td className="py-2.5 px-2 text-right text-text-secondary">₹{li.unitPrice.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-2 text-right font-medium text-white">₹{li.subtotal.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Breakdown */}
                <div className="border-t border-white/10 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal:</span>
                    <span>₹{selectedProposal.quotation.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedProposal.quotation.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Promotional Discount:</span>
                      <span>- ₹{selectedProposal.quotation.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-secondary">
                    <span>GST ({selectedProposal.quotation.taxRatePercent}%):</span>
                    <span>₹{selectedProposal.quotation.taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gold border-t border-gold/20 pt-2 mt-2">
                    <span>Final Quotation Value:</span>
                    <span>₹{selectedProposal.quotation.finalQuotationAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Terms and Notes */}
                {selectedProposal.quotation.termsAndConditions && (
                  <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-[11px] text-text-muted space-y-1">
                    <span className="font-bold text-text-secondary uppercase tracking-wider block text-[10px]">
                      Commercial Terms:
                    </span>
                    <p>{selectedProposal.quotation.termsAndConditions}</p>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Quotation</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 text-center">
                <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2 animate-pulse" />
                <h4 className="text-sm font-bold text-white">
                  Quotation Under Preparation
                </h4>
                <p className="text-xs text-text-secondary max-w-md mx-auto mt-1">
                  Our technical directors are verifying arena acoustics, laser permits, and venue clearance for your dates. An official itemized estimate will appear here once ready.
                </p>
              </div>
            )}

            {/* Attachments Section */}
            {selectedProposal.attachments && selectedProposal.attachments.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold mb-2">
                  Uploaded Project Files
                </h4>
                <div className="space-y-2">
                  {selectedProposal.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-all"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-white truncate font-medium">{att.name}</span>
                      </div>
                      <Download className="w-4 h-4 text-text-muted hover:text-gold shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-white/10 pt-4 flex justify-end">
              <button
                onClick={() => setSelectedProposal(null)}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
