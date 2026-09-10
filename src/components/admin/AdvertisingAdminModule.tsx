import React, { useState, useCallback, useMemo } from 'react';
import {
  BarChart2, TrendingUp, DollarSign, Eye, MousePointer, CheckCircle,
  XCircle, Clock, Plus, Trash2, Edit3, ExternalLink, AlertTriangle,
  Settings, Globe, FileText, RefreshCw, ChevronDown, ChevronUp,
  Search, Filter, ToggleLeft, ToggleRight, Mail, Phone, Building,
  Calendar, Layers, Zap, Shield, Info, Copy, Check, Sparkles,
} from 'lucide-react';
import LiveBannersAdminTab from './LiveBannersAdminTab';
import type {
  AdCampaign, AdvertiserInquiry, AdPlacement, AdvertisingConfig,
  CampaignStatus, InquiryStatus, AdPlacementId,
} from '../../types/advertising';
import {
  getCampaigns, saveCampaigns, createCampaign, updateCampaign,
  deleteCampaign, updateCampaignStatus,
  getInquiries, updateInquiryStatus, deleteInquiry,
  getAdvertisingConfig, saveAdvertisingConfig,
  computeRevenueSummary, DEFAULT_PLACEMENTS, generateAdsTxtContent,
} from '../../services/advertisingService';

// ─── Helpers ────────────────────────────────────────────────

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const statusColors: Record<CampaignStatus, string> = {
  Draft: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  'Pending Approval': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Approved: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Live: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Paused: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Completed: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Rejected: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

const inquiryStatusColors: Record<InquiryStatus, string> = {
  Pending: 'bg-amber-500/20 text-amber-300',
  'In Review': 'bg-blue-500/20 text-blue-300',
  Contacted: 'bg-cyan-500/20 text-cyan-300',
  Converted: 'bg-emerald-500/20 text-emerald-300',
  Closed: 'bg-slate-500/20 text-slate-300',
};

const SECTION_TABS = [
  { id: 'overview', label: 'Revenue Overview', icon: BarChart2 },
  { id: '24h_banners', label: '24-Hour Live Banners', icon: Sparkles },
  { id: 'campaigns', label: 'Campaigns', icon: Layers },
  { id: 'inquiries', label: 'Ad Inquiries', icon: Mail },
  { id: 'placements', label: 'Ad Placements', icon: Globe },
  { id: 'config', label: 'Config & ads.txt', icon: Settings },
] as const;

type SectionTab = typeof SECTION_TABS[number]['id'];

// ─── Sub-Component: Stat Card ────────────────────────────────
function StatCard({ label, value, sub, color = 'text-gold', icon: Icon }: {
  label: string; value: string; sub?: string; color?: string; icon: React.ElementType;
}) {
  return (
    <div className="bg-[#0F0F11] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
        <Icon className={`w-4 h-4 ${color} opacity-70`} />
      </div>
      <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
      {sub && <div className="text-[10px] text-text-muted">{sub}</div>}
    </div>
  );
}

// ─── Sub-Component: Campaign Row ─────────────────────────────
function CampaignRow({ campaign, onStatusChange, onDelete }: {
  campaign: AdCampaign;
  onStatusChange: (id: string, status: CampaignStatus, note?: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState('');
  const ctr = campaign.impressions > 0
    ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="bg-[#0F0F11] border border-white/[0.06] rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
          {campaign.imageUrl ? (
            <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <Layers className="w-4 h-4 text-text-muted" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-text-primary truncate">{campaign.title}</span>
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${statusColors[campaign.status]}`}>
              {campaign.status}
            </span>
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-gold/10 text-gold border border-gold/20">
              {campaign.type}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-[10px] text-text-muted">
            <span>{campaign.advertiserCompany || campaign.advertiserName}</span>
            <span>·</span>
            <span className="font-mono">{campaign.startDate} → {campaign.endDate}</span>
            <span>·</span>
            <span className="text-emerald-400 font-semibold">{formatINR(campaign.agreedPriceINR)}</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-center shrink-0">
          <div>
            <div className="text-[9px] text-text-muted uppercase">Impressions</div>
            <div className="text-xs font-mono font-bold text-text-primary">{campaign.impressions.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[9px] text-text-muted uppercase">Clicks</div>
            <div className="text-xs font-mono font-bold text-cyan-400">{campaign.clicks.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[9px] text-text-muted uppercase">CTR</div>
            <div className="text-xs font-mono font-bold text-emerald-400">{ctr}%</div>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-text-muted shrink-0" /> : <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />}
      </div>

      {expanded && (
        <div className="border-t border-white/[0.06] p-4 space-y-4 animate-in fade-in duration-200">
          {/* Details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              { label: 'Advertiser Email', val: campaign.advertiserEmail },
              { label: 'Phone', val: campaign.advertiserPhone || '—' },
              { label: 'Placement', val: campaign.placementId.replace(/_/g, ' ') },
              { label: 'Rate Type', val: campaign.rateType.replace(/_/g, ' ') },
              { label: 'Budget', val: formatINR(campaign.budgetINR) },
              { label: 'Agreed Price', val: formatINR(campaign.agreedPriceINR) },
              { label: 'Payment', val: campaign.paymentStatus },
              { label: 'Payment Ref', val: campaign.paymentReference || '—' },
            ].map(({ label, val }) => (
              <div key={label} className="bg-white/[0.02] rounded-lg p-2.5">
                <div className="text-[9px] text-text-muted uppercase font-bold mb-1">{label}</div>
                <div className="text-text-primary font-mono truncate">{val}</div>
              </div>
            ))}
          </div>

          {campaign.targetUrl && (
            <div className="flex items-center gap-2 text-xs">
              <ExternalLink className="w-3 h-3 text-text-muted" />
              <a href={campaign.targetUrl} target="_blank" rel="noopener noreferrer"
                className="text-blue-400 hover:underline font-mono truncate max-w-xs"
              >{campaign.targetUrl}</a>
            </div>
          )}

          {campaign.adminNotes && (
            <div className="text-[11px] bg-gold/5 border border-gold/20 rounded-lg p-3 text-gold">
              📝 Admin Note: {campaign.adminNotes}
            </div>
          )}
          {campaign.rejectionReason && (
            <div className="text-[11px] bg-rose-500/5 border border-rose-500/20 rounded-lg p-3 text-rose-300">
              ❌ Rejection Reason: {campaign.rejectionReason}
            </div>
          )}

          {/* Status actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Admin note / rejection reason (optional)"
              className="flex-1 min-w-48 bg-white/[0.03] border border-white/10 rounded px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-gold placeholder:text-text-muted"
            />
            {(['Approved', 'Live', 'Paused', 'Rejected', 'Completed'] as CampaignStatus[]).map(s => (
              <button
                key={s}
                onClick={() => { onStatusChange(campaign.id, s, note); setNote(''); }}
                className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase cursor-pointer transition-all border ${statusColors[s]} hover:opacity-80`}
              >
                → {s}
              </button>
            ))}
            <button
              onClick={() => { if (window.confirm(`Delete campaign "${campaign.title}"?`)) onDelete(campaign.id); }}
              className="px-3 py-1.5 rounded text-[10px] font-bold uppercase cursor-pointer transition-all bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 ml-auto"
            >
              <Trash2 className="w-3 h-3 inline mr-1" />Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-Component: Inquiry Row ──────────────────────────────
function InquiryRow({ inquiry, onStatusChange, onDelete }: {
  inquiry: AdvertiserInquiry;
  onStatusChange: (id: string, status: InquiryStatus, notes?: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState('');

  return (
    <div className="bg-[#0F0F11] border border-white/[0.06] rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/10 flex items-center justify-center shrink-0">
          <Building className="w-4 h-4 text-purple-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-text-primary truncate">{inquiry.companyName}</span>
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${inquiryStatusColors[inquiry.status]}`}>
              {inquiry.status}
            </span>
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">
            {inquiry.contactName} · {inquiry.contactEmail} · {inquiry.budgetRangeINR}
          </div>
        </div>
        <div className="text-[10px] text-text-muted font-mono shrink-0">
          {new Date(inquiry.submittedAt).toLocaleDateString('en-IN')}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-text-muted shrink-0" /> : <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />}
      </div>

      {expanded && (
        <div className="border-t border-white/[0.06] p-4 space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {[
              { label: 'Contact Name', val: inquiry.contactName },
              { label: 'Email', val: inquiry.contactEmail },
              { label: 'Phone', val: inquiry.contactPhone },
              { label: 'Website', val: inquiry.companyWebsite || '—' },
              { label: 'Budget Range', val: inquiry.budgetRangeINR },
              { label: 'Duration', val: inquiry.preferredDuration || '—' },
              { label: 'Start Date', val: inquiry.preferredStartDate || '—' },
              { label: 'Objective', val: inquiry.campaignObjective },
            ].map(({ label, val }) => (
              <div key={label} className="bg-white/[0.02] rounded-lg p-2.5">
                <div className="text-[9px] text-text-muted uppercase font-bold mb-1">{label}</div>
                <div className="text-text-primary truncate">{val}</div>
              </div>
            ))}
          </div>

          <div className="text-xs bg-white/[0.02] rounded-lg p-3">
            <div className="text-[9px] text-text-muted uppercase font-bold mb-1">Target Audience</div>
            <div className="text-text-secondary">{inquiry.targetAudience}</div>
          </div>

          {inquiry.additionalMessage && (
            <div className="text-xs bg-white/[0.02] rounded-lg p-3">
              <div className="text-[9px] text-text-muted uppercase font-bold mb-1">Additional Message</div>
              <div className="text-text-secondary">{inquiry.additionalMessage}</div>
            </div>
          )}

          <div className="text-[10px] text-text-muted">
            Preferred Placements:{' '}
            <span className="text-text-primary">
              {inquiry.preferredPlacements.map(p => p.replace(/_/g, ' ')).join(', ')}
            </span>
          </div>

          {inquiry.adminNotes && (
            <div className="text-[11px] bg-gold/5 border border-gold/20 rounded-lg p-3 text-gold">
              📝 Admin Note: {inquiry.adminNotes}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Admin note (optional)"
              className="flex-1 min-w-48 bg-white/[0.03] border border-white/10 rounded px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-gold placeholder:text-text-muted"
            />
            {(['In Review', 'Contacted', 'Converted', 'Closed'] as InquiryStatus[]).map(s => (
              <button
                key={s}
                onClick={() => { onStatusChange(inquiry.id, s, note); setNote(''); }}
                className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase cursor-pointer transition-all border ${inquiryStatusColors[s]} border-current/30 hover:opacity-80`}
              >
                → {s}
              </button>
            ))}
            <a
              href={`mailto:${inquiry.contactEmail}?subject=CineVenue Advertising Inquiry - ${inquiry.companyName}`}
              className="px-3 py-1.5 rounded text-[10px] font-bold uppercase cursor-pointer transition-all bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
            >
              <Mail className="w-3 h-3 inline mr-1" />Reply
            </a>
            <button
              onClick={() => { if (window.confirm(`Delete inquiry from "${inquiry.companyName}"?`)) onDelete(inquiry.id); }}
              className="px-3 py-1.5 rounded text-[10px] font-bold uppercase cursor-pointer transition-all bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 ml-auto"
            >
              <Trash2 className="w-3 h-3 inline mr-1" />Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export default function AdvertisingAdminModule() {
  const [section, setSection] = useState<SectionTab>('overview');
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(() => getCampaigns());
  const [inquiries, setInquiries] = useState<AdvertiserInquiry[]>(() => getInquiries());
  const [config, setConfig] = useState<AdvertisingConfig>(() => getAdvertisingConfig());
  const [campaignFilter, setCampaignFilter] = useState<CampaignStatus | 'All'>('All');
  const [campaignSearch, setCampaignSearch] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState<InquiryStatus | 'All'>('All');
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [copiedAdsTxt, setCopiedAdsTxt] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  // New campaign form state
  const [newCamp, setNewCamp] = useState({
    title: '', advertiserName: '', advertiserEmail: '', advertiserPhone: '',
    advertiserCompany: '', imageUrl: '', targetUrl: '', placementId: 'hero_slider' as AdPlacementId,
    startDate: '', endDate: '', budgetINR: 0, agreedPriceINR: 0,
    rateType: 'per_month' as AdCampaign['rateType'], tagline: '',
    paymentStatus: 'Unpaid' as AdCampaign['paymentStatus'],
    paymentReference: '', status: 'Pending Approval' as CampaignStatus,
  });

  const revenue = useMemo(() => computeRevenueSummary(), [campaigns]);

  const filteredCampaigns = useMemo(() => campaigns.filter(c => {
    const matchStatus = campaignFilter === 'All' || c.status === campaignFilter;
    const q = campaignSearch.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.advertiserName.toLowerCase().includes(q) || (c.advertiserCompany || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  }), [campaigns, campaignFilter, campaignSearch]);

  const filteredInquiries = useMemo(() => inquiries.filter(i =>
    inquiryFilter === 'All' || i.status === inquiryFilter
  ), [inquiries, inquiryFilter]);

  const handleStatusChange = useCallback((id: string, status: CampaignStatus, note?: string) => {
    const updated = updateCampaignStatus(id, status, note, note);
    if (updated) setCampaigns(getCampaigns());
  }, []);

  const handleDeleteCampaign = useCallback((id: string) => {
    deleteCampaign(id);
    setCampaigns(getCampaigns());
  }, []);

  const handleInquiryStatus = useCallback((id: string, status: InquiryStatus, notes?: string) => {
    updateInquiryStatus(id, status, notes);
    setInquiries(getInquiries());
  }, []);

  const handleDeleteInquiry = useCallback((id: string) => {
    deleteInquiry(id);
    setInquiries(getInquiries());
  }, []);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCamp.title || !newCamp.advertiserEmail || !newCamp.imageUrl || !newCamp.startDate || !newCamp.endDate) {
      alert('Please fill in all required fields.'); return;
    }
    createCampaign({ ...newCamp, altText: newCamp.title, type: 'Direct' });
    setCampaigns(getCampaigns());
    setShowNewCampaignForm(false);
    setNewCamp({
      title: '', advertiserName: '', advertiserEmail: '', advertiserPhone: '',
      advertiserCompany: '', imageUrl: '', targetUrl: '', placementId: 'hero_slider',
      startDate: '', endDate: '', budgetINR: 0, agreedPriceINR: 0,
      rateType: 'per_month', tagline: '', paymentStatus: 'Unpaid',
      paymentReference: '', status: 'Pending Approval',
    });
  };

  const handleSaveConfig = () => {
    saveAdvertisingConfig(config);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  const adsTxtContent = generateAdsTxtContent(config.adsTxtEntries);

  const handleCopyAdsTxt = () => {
    navigator.clipboard.writeText(adsTxtContent).then(() => {
      setCopiedAdsTxt(true);
      setTimeout(() => setCopiedAdsTxt(false), 2000);
    });
  };

  const pendingCount = inquiries.filter(i => i.status === 'Pending').length
    + campaigns.filter(c => c.status === 'Pending Approval').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" id="tab-advertising-admin">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-gold" />
            Advertising & Monetization
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Manage direct campaigns, ad placements, advertiser inquiries, and third-party network integrations.
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4" />
            {pendingCount} item{pendingCount !== 1 ? 's' : ''} pending review
          </div>
        )}
      </div>

      {/* Section Navigation */}
      <div className="flex items-center gap-1 flex-wrap">
        {SECTION_TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                section === tab.id
                  ? 'bg-gold/15 text-gold border border-gold/30'
                  : 'bg-white/[0.02] text-text-secondary border border-white/[0.05] hover:bg-white/[0.05] hover:text-text-primary'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.id === 'inquiries' && (inquiries.filter(i => i.status === 'Pending').length > 0) && (
                <span className="bg-amber-500 text-black text-[8px] font-black px-1 rounded-full">
                  {inquiries.filter(i => i.status === 'Pending').length}
                </span>
              )}
              {tab.id === 'campaigns' && (campaigns.filter(c => c.status === 'Pending Approval').length > 0) && (
                <span className="bg-amber-500 text-black text-[8px] font-black px-1 rounded-full">
                  {campaigns.filter(c => c.status === 'Pending Approval').length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── SECTION: Revenue Overview ───────────────────────── */}
      {section === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Revenue (Paid)" value={formatINR(revenue.totalRevenuePaidINR)} color="text-emerald-400" icon={DollarSign} />
            <StatCard label="Revenue Pending" value={formatINR(revenue.totalRevenuePendingINR)} color="text-amber-400" icon={Clock} />
            <StatCard label="Live Campaigns" value={String(revenue.liveCampaignsCount)} color="text-gold" icon={Zap} />
            <StatCard label="Pending Approval" value={String(revenue.pendingApprovalCount)} color="text-rose-400" icon={AlertTriangle} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Total Impressions" value={revenue.totalImpressionsAllTime.toLocaleString()} color="text-blue-400" icon={Eye} />
            <StatCard label="Total Clicks" value={revenue.totalClicksAllTime.toLocaleString()} color="text-cyan-400" icon={MousePointer} />
            <StatCard label="Average CTR" value={revenue.averageCTR.toFixed(2) + '%'} color="text-purple-400" icon={TrendingUp} />
          </div>

          {/* All Campaigns Summary Table */}
          <div className="bg-[#0F0F11] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider">All Campaigns</span>
              <span className="text-[10px] text-text-muted">{campaigns.length} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    {['Campaign', 'Status', 'Type', 'Placement', 'Impressions', 'Clicks', 'CTR', 'Revenue', 'Payment'].map(h => (
                      <th key={h} className="text-left px-4 py-2 text-[9px] font-bold text-text-muted uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-8 text-text-muted text-xs">No campaigns yet</td></tr>
                  ) : (
                    campaigns.map(c => {
                      const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) : '0.00';
                      return (
                        <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                          <td className="px-4 py-2 font-medium text-text-primary max-w-[160px] truncate">{c.title}</td>
                          <td className="px-4 py-2">
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${statusColors[c.status]}`}>{c.status}</span>
                          </td>
                          <td className="px-4 py-2 text-text-secondary">{c.type}</td>
                          <td className="px-4 py-2 text-text-muted capitalize">{c.placementId.replace(/_/g, ' ')}</td>
                          <td className="px-4 py-2 font-mono text-text-primary">{c.impressions.toLocaleString()}</td>
                          <td className="px-4 py-2 font-mono text-cyan-400">{c.clicks.toLocaleString()}</td>
                          <td className="px-4 py-2 font-mono text-emerald-400">{ctr}%</td>
                          <td className="px-4 py-2 font-mono text-gold font-semibold">{formatINR(c.agreedPriceINR)}</td>
                          <td className="px-4 py-2">
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              c.paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-300' :
                              c.paymentStatus === 'Partial' ? 'bg-amber-500/20 text-amber-300' :
                              'bg-rose-500/20 text-rose-300'
                            }`}>{c.paymentStatus}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl text-xs text-blue-300">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold mb-1">Advertising Compliance</div>
              CineVenue does not artificially generate impressions or clicks. All analytics displayed reflect actual user interactions.
              Direct ad campaigns require admin approval before going live. Payment must be verified server-side before campaign activation.
              Ad content is subject to CineVenue's Advertising Policy and applicable laws.
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION: 24-Hour Live Banners ──────────────────── */}
      {section === '24h_banners' && (
        <LiveBannersAdminTab />
      )}

      {/* ── SECTION: Campaigns ─────────────────────────────── */}
      {section === 'campaigns' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-40">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                value={campaignSearch}
                onChange={e => setCampaignSearch(e.target.value)}
                placeholder="Search campaigns..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold placeholder:text-text-muted"
              />
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {(['All', 'Pending Approval', 'Live', 'Paused', 'Completed', 'Rejected'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setCampaignFilter(s)}
                  className={`px-2.5 py-1.5 rounded text-[10px] font-bold uppercase cursor-pointer transition-all ${
                    campaignFilter === s ? 'bg-gold text-black' : 'bg-white/[0.04] text-text-secondary hover:bg-white/[0.08]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowNewCampaignForm(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gold hover:bg-amber-400 text-black text-xs font-bold uppercase rounded-lg cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              New Campaign
            </button>
          </div>

          {/* New Campaign Form */}
          {showNewCampaignForm && (
            <form
              onSubmit={handleCreateCampaign}
              className="bg-[#0F0F11] border border-gold/30 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-gold uppercase tracking-wider">Create New Direct Campaign</h3>
                <button type="button" onClick={() => setShowNewCampaignForm(false)} className="text-text-muted hover:text-text-primary cursor-pointer">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {[
                  { label: 'Campaign Title *', key: 'title', placeholder: 'e.g. Diwali Film Festival 2026' },
                  { label: 'Advertiser Name *', key: 'advertiserName', placeholder: 'e.g. Reliance Entertainment' },
                  { label: 'Advertiser Email *', key: 'advertiserEmail', placeholder: 'contact@brand.com', type: 'email' },
                  { label: 'Advertiser Phone', key: 'advertiserPhone', placeholder: '+91 9900000000' },
                  { label: 'Company Name', key: 'advertiserCompany', placeholder: 'Brand / Company' },
                  { label: 'Banner Image URL *', key: 'imageUrl', placeholder: 'https://...' },
                  { label: 'Target URL', key: 'targetUrl', placeholder: 'https://... or #section' },
                  { label: 'Tagline', key: 'tagline', placeholder: 'Short ad copy' },
                  { label: 'Payment Reference', key: 'paymentReference', placeholder: 'UTR / Invoice number' },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[9px] font-bold text-text-muted uppercase">{label}</label>
                    <input
                      type={type || 'text'}
                      value={(newCamp as any)[key]}
                      onChange={e => setNewCamp(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold placeholder:text-text-muted"
                      required={label.endsWith('*')}
                    />
                  </div>
                ))}

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase">Placement *</label>
                  <select value={newCamp.placementId} onChange={e => setNewCamp(prev => ({ ...prev, placementId: e.target.value as AdPlacementId }))}
                    className="w-full bg-[#121215] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold">
                    {DEFAULT_PLACEMENTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase">Rate Type</label>
                  <select value={newCamp.rateType} onChange={e => setNewCamp(prev => ({ ...prev, rateType: e.target.value as any }))}
                    className="w-full bg-[#121215] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold">
                    <option value="per_day">Per Day</option>
                    <option value="per_week">Per Week</option>
                    <option value="per_month">Per Month</option>
                    <option value="flat_campaign">Flat Campaign</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase">Payment Status</label>
                  <select value={newCamp.paymentStatus} onChange={e => setNewCamp(prev => ({ ...prev, paymentStatus: e.target.value as any }))}
                    className="w-full bg-[#121215] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold">
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase">Budget (INR)</label>
                  <input type="number" min={0} value={newCamp.budgetINR} onChange={e => setNewCamp(prev => ({ ...prev, budgetINR: Number(e.target.value) }))}
                    className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase">Agreed Price (INR) *</label>
                  <input type="number" min={0} value={newCamp.agreedPriceINR} onChange={e => setNewCamp(prev => ({ ...prev, agreedPriceINR: Number(e.target.value) }))}
                    className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase">Start Date *</label>
                  <input type="date" value={newCamp.startDate} onChange={e => setNewCamp(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full bg-[#121215] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase">End Date *</label>
                  <input type="date" value={newCamp.endDate} onChange={e => setNewCamp(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full bg-[#121215] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase">Initial Status</label>
                  <select value={newCamp.status} onChange={e => setNewCamp(prev => ({ ...prev, status: e.target.value as CampaignStatus }))}
                    className="w-full bg-[#121215] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold">
                    <option value="Draft">Draft</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Live">Live</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowNewCampaignForm(false)}
                  className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary text-xs font-bold uppercase rounded-lg cursor-pointer transition-all border border-white/10">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2 bg-gold hover:bg-amber-400 text-black text-xs font-bold uppercase rounded-lg cursor-pointer transition-all shadow-lg shadow-gold/20">
                  Create Campaign
                </button>
              </div>
            </form>
          )}

          {/* Campaigns List */}
          <div className="space-y-3">
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-12 text-text-muted text-sm bg-[#0F0F11] border border-white/[0.06] rounded-xl">
                No campaigns found. Create one or adjust your filters.
              </div>
            ) : (
              filteredCampaigns.map(c => (
                <CampaignRow key={c.id} campaign={c} onStatusChange={handleStatusChange} onDelete={handleDeleteCampaign} />
              ))
            )}
          </div>
        </div>
      )}

      {/* ── SECTION: Inquiries ─────────────────────────────── */}
      {section === 'inquiries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-sm font-bold text-text-primary">Advertiser Inquiries</h3>
            <div className="flex items-center gap-1 flex-wrap">
              {(['All', 'Pending', 'In Review', 'Contacted', 'Converted', 'Closed'] as const).map(s => (
                <button key={s} onClick={() => setInquiryFilter(s)}
                  className={`px-2.5 py-1.5 rounded text-[10px] font-bold uppercase cursor-pointer transition-all ${
                    inquiryFilter === s ? 'bg-gold text-black' : 'bg-white/[0.04] text-text-secondary hover:bg-white/[0.08]'
                  }`}>
                  {s}
                  {s !== 'All' && inquiries.filter(i => i.status === s).length > 0 && (
                    <span className="ml-1 text-[8px] bg-white/20 px-1 rounded-full">
                      {inquiries.filter(i => i.status === s).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {filteredInquiries.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm bg-[#0F0F11] border border-white/[0.06] rounded-xl">
              No inquiries found. They'll appear here when advertisers submit the inquiry form at /advertise-with-cinevenue.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInquiries.map(i => (
                <InquiryRow key={i.id} inquiry={i} onStatusChange={handleInquiryStatus} onDelete={handleDeleteInquiry} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SECTION: Ad Placements ─────────────────────────── */}
      {section === 'placements' && (
        <div className="space-y-4">
          <p className="text-xs text-text-secondary">
            Configure available ad placement slots across CineVenue. Disable placements to remove them from the advertising rate card.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.placements.map(placement => (
              <div key={placement.id} className="bg-[#0F0F11] border border-white/[0.06] rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-bold text-text-primary">{placement.name}</span>
                      {placement.supportsThirdParty && (
                        <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded">3rd Party OK</span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted">{placement.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      const updated = config.placements.map(p => p.id === placement.id ? { ...p, isActive: !p.isActive } : p);
                      setConfig({ ...config, placements: updated });
                    }}
                    className="shrink-0 cursor-pointer"
                  >
                    {placement.isActive
                      ? <ToggleRight className="w-7 h-7 text-emerald-400" />
                      : <ToggleLeft className="w-7 h-7 text-text-muted" />
                    }
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  {[
                    { label: 'Per Day', val: formatINR(placement.pricePerDay) },
                    { label: 'Per Week', val: formatINR(placement.pricePerWeek) },
                    { label: 'Per Month', val: formatINR(placement.pricePerMonth) },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-white/[0.03] rounded-lg p-2">
                      <div className="text-text-muted uppercase font-bold text-[8px] mb-0.5">{label}</div>
                      <div className="text-gold font-mono font-bold">{val}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] text-text-muted">
                  <span>{placement.dimensions} · {placement.location}</span>
                  <span>Max {placement.maxConcurrentAds} concurrent</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleSaveConfig}
            className="px-5 py-2.5 bg-gold hover:bg-amber-400 text-black text-xs font-bold uppercase rounded-lg cursor-pointer transition-all shadow-lg shadow-gold/20"
          >
            {configSaved ? <><Check className="w-3 h-3 inline mr-1" />Saved!</> : 'Save Placement Changes'}
          </button>
        </div>
      )}

      {/* ── SECTION: Config & ads.txt ──────────────────────── */}
      {section === 'config' && (
        <div className="space-y-6">
          {/* Global toggle */}
          <div className="bg-[#0F0F11] border border-white/[0.06] rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Global Ad Settings</h3>
            {[
              { label: 'Advertising System', key: 'adsEnabled', desc: 'Master switch — disabling this hides all ads from the site.' },
              { label: 'Direct Campaigns', key: 'directAdsEnabled', desc: 'Enable CineVenue-sold direct advertising campaigns.' },
              { label: 'Third-Party Networks', key: 'thirdPartyAdsEnabled', desc: 'Enable Google AdSense / DFP and other network integrations.' },
              { label: 'Google AdSense', key: 'adSenseEnabled', desc: 'Render AdSense units in eligible placements (publisher ID from VITE_ADSENSE_PUBLISHER_ID env var).' },
            ].map(({ label, key, desc }) => (
              <div key={key} className="flex items-start justify-between gap-4 py-2 border-b border-white/[0.04] last:border-0">
                <div>
                  <div className="text-xs font-semibold text-text-primary">{label}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">{desc}</div>
                </div>
                <button
                  onClick={() => setConfig(c => ({ ...c, [key]: !(c as any)[key] }))}
                  className="shrink-0 cursor-pointer"
                >
                  {(config as any)[key]
                    ? <ToggleRight className="w-7 h-7 text-emerald-400" />
                    : <ToggleLeft className="w-7 h-7 text-text-muted" />
                  }
                </button>
              </div>
            ))}

            {/* Contact email */}
            <div className="space-y-1 pt-1">
              <label className="text-[9px] font-bold text-text-muted uppercase">Advertising Contact Email</label>
              <input
                type="email"
                value={config.contactEmail}
                onChange={e => setConfig(c => ({ ...c, contactEmail: e.target.value }))}
                className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
              />
            </div>

            {/* Min budget */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-text-muted uppercase">Minimum Campaign Budget (INR)</label>
              <input
                type="number"
                min={0}
                value={config.minCampaignBudgetINR}
                onChange={e => setConfig(c => ({ ...c, minCampaignBudgetINR: Number(e.target.value) }))}
                className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
              />
            </div>

            {/* AdSense notice */}
            <div className="flex items-start gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg text-[10px] text-blue-300">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Google AdSense Publisher ID is loaded from the <code className="font-mono bg-white/10 px-1 rounded">VITE_ADSENSE_PUBLISHER_ID</code> environment variable and is never stored in the database or localStorage for security.
            </div>
          </div>

          {/* ads.txt */}
          <div className="bg-[#0F0F11] border border-white/[0.06] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">ads.txt File</h3>
                <p className="text-[10px] text-text-muted mt-0.5">
                  This file is served at <code className="font-mono bg-white/10 px-1 rounded">/ads.txt</code> and authorizes ad networks to sell CineVenue ad inventory.
                </p>
              </div>
              <button
                onClick={handleCopyAdsTxt}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-text-secondary text-xs font-bold uppercase rounded-lg cursor-pointer transition-all border border-white/10"
              >
                {copiedAdsTxt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedAdsTxt ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-black/40 border border-white/[0.04] rounded-lg p-3 text-[10px] text-text-muted font-mono whitespace-pre-wrap overflow-auto max-h-40">
              {adsTxtContent || '# No ads.txt entries configured.'}
            </pre>
            <p className="text-[10px] text-text-muted">
              Add authorized network entries above then deploy the server so that <code className="font-mono bg-white/10 px-1 rounded">GET /ads.txt</code> returns this content.
            </p>
          </div>

          <button
            onClick={handleSaveConfig}
            className="px-5 py-2.5 bg-gold hover:bg-amber-400 text-black text-xs font-bold uppercase rounded-lg cursor-pointer transition-all shadow-lg shadow-gold/20"
          >
            {configSaved ? <><Check className="w-3 h-3 inline mr-1" />Saved!</> : 'Save Configuration'}
          </button>
        </div>
      )}
    </div>
  );
}
