import React, { useState, useEffect } from "react";
import {
  Sparkles, Layers, Clock, Eye, MousePointer, TrendingUp, CheckCircle,
  XCircle, AlertTriangle, ArrowRight, ExternalLink, RefreshCw, Calendar,
  Monitor, Smartphone, Play, Pause, DollarSign, Download, Filter, Search,
  Edit3, Shield, Check
} from "lucide-react";
import {
  LiveBannerCampaign,
  BannerPlacementConfig,
  BannerPlacementId,
  LiveCampaignStatus,
  CampaignCalendarSlot
} from "../../types/advertising";
import {
  fetchAdminLiveBannerStats,
  fetchAdminLiveCampaigns,
  approveLiveCampaign,
  rejectLiveCampaign,
  pauseLiveCampaign,
  resumeLiveCampaign,
  fetchLiveBannerCalendar,
  updateLivePlacementPricing,
  fetchLiveBannerPlacements
} from "../../services/advertisingService";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const LiveBannersAdminTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"queue" | "calendar" | "pricing" | "reports">("queue");
  const [stats, setStats] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<LiveBannerCampaign[]>([]);
  const [placements, setPlacements] = useState<BannerPlacementConfig[]>([]);
  const [calendarSlots, setCalendarSlots] = useState<CampaignCalendarSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [placementFilter, setPlacementFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Rejection Modal
  const [rejectModalCampaign, setRejectModalCampaign] = useState<LiveBannerCampaign | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Review / Creative Modal
  const [reviewModalCampaign, setReviewModalCampaign] = useState<LiveBannerCampaign | null>(null);

  // Edit Placement Price Modal
  const [editingPlacement, setEditingPlacement] = useState<BannerPlacementConfig | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const [st, camps, plts, cal] = await Promise.all([
        fetchAdminLiveBannerStats(),
        fetchAdminLiveCampaigns(),
        fetchLiveBannerPlacements(),
        fetchLiveBannerCalendar()
      ]);
      setStats(st);
      setCampaigns(camps);
      setPlacements(plts);
      setCalendarSlots(cal);
    } catch (err) {
      console.warn("Failed loading live banner admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveLiveCampaign(id, "Superadmin");
      await loadData();
      if (reviewModalCampaign?.id === id) setReviewModalCampaign(null);
    } catch (err: any) {
      alert(err.message || "Failed approving campaign");
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModalCampaign || !rejectionReason.trim()) return;
    try {
      await rejectLiveCampaign(rejectModalCampaign.id, rejectionReason.trim(), "Superadmin");
      setRejectModalCampaign(null);
      setRejectionReason("");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed rejecting campaign");
    }
  };

  const handlePause = async (id: string) => {
    try {
      await pauseLiveCampaign(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed pausing campaign");
    }
  };

  const handleResume = async (id: string) => {
    try {
      await resumeLiveCampaign(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed resuming campaign");
    }
  };

  const handleSavePrice = async () => {
    if (!editingPlacement) return;
    try {
      await updateLivePlacementPricing(editingPlacement.id, editPrice, editingPlacement.isActive);
      setEditingPlacement(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed updating pricing");
    }
  };

  // Export CSV Report
  const exportCsvReport = () => {
    if (campaigns.length === 0) return;
    const headers = [
      "Campaign Number",
      "Business Name",
      "Ad Title",
      "Placement",
      "Start UTC",
      "End UTC",
      "Amount INR",
      "Payment Status",
      "Status",
      "Impressions",
      "Clicks",
      "CTR",
      "Destination URL",
      "Email"
    ];

    const rows = campaigns.map(c => [
      c.campaignNumber,
      `"${c.businessName.replace(/"/g, '""')}"`,
      `"${c.adTitle.replace(/"/g, '""')}"`,
      c.placementId,
      c.startAtUtc,
      c.endAtUtc,
      c.finalAmountINR,
      c.paymentStatus,
      c.status,
      c.impressions,
      c.clicks,
      `${c.ctr}%`,
      `"${c.destinationUrl}"`,
      c.contactEmail
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CineVenue_24H_Banners_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesPlacement = placementFilter === "ALL" || c.placementId === placementFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.campaignNumber.toLowerCase().includes(q) ||
      c.businessName.toLowerCase().includes(q) ||
      c.adTitle.toLowerCase().includes(q) ||
      c.contactEmail.toLowerCase().includes(q);
    return matchesStatus && matchesPlacement && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LIVE":
        return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">● LIVE</span>;
      case "SCHEDULED":
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">Scheduled</span>;
      case "PENDING_APPROVAL":
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">Pending Approval</span>;
      case "EXPIRED":
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-white/10 text-white/50 border border-white/10">Expired</span>;
      case "PAUSED":
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Paused</span>;
      case "REJECTED":
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-white/5 text-white/70 border border-white/10">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0F0F11] border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Direct Revenue</span>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            {formatINR(stats?.totalRevenueINR || 0)}
          </p>
          <span className="text-[10px] text-text-muted mt-1">Paid 24h Sponsorships</span>
        </div>

        <div className="bg-[#0F0F11] border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Active & Scheduled</span>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono text-gold">{stats?.liveCount || 0} LIVE</span>
            <span className="text-xs font-mono text-blue-400">/ {stats?.scheduledCount || 0} Sched</span>
          </div>
          <span className="text-[10px] text-text-muted mt-1">24-Hour Active Slots</span>
        </div>

        <div className="bg-[#0F0F11] border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Awaiting Approval</span>
          <p className="text-2xl font-bold font-mono text-amber-400">
            {stats?.pendingApprovals || 0}
          </p>
          <span className="text-[10px] text-text-muted mt-1">Action Required</span>
        </div>

        <div className="bg-[#0F0F11] border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Impressions / CTR</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {(stats?.totalImpressions || 0).toLocaleString()}
            </span>
            <span className="text-xs font-mono text-purple-400">({stats?.averageCtr || 0}%)</span>
          </div>
          <span className="text-[10px] text-text-muted mt-1">{(stats?.totalClicks || 0).toLocaleString()} clicks recorded</span>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          {[
            { id: "queue", label: "Campaigns & Approvals", icon: Layers },
            { id: "calendar", label: "Slot Calendar & Timeline", icon: Calendar },
            { id: "pricing", label: "Placements & Pricing", icon: DollarSign },
            { id: "reports", label: "Analytics & Reports", icon: TrendingUp }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSubTab === t.id
                    ? "bg-gold text-black shadow-md shadow-gold/10 font-black"
                    : "bg-white/5 hover:bg-white/10 text-text-secondary border border-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCsvReport}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-white/10 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gold" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={loadData}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-text-muted hover:text-white rounded-lg border border-white/10 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gold" />
          </button>
        </div>
      </div>

      {/* ─── SUB-TAB 1: CAMPAIGNS QUEUE & APPROVALS ─────────── */}
      {activeSubTab === "queue" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0F0F11] border border-white/10 rounded-2xl p-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, business name, headline, email..."
                className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-text-muted/60 font-sans"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="LIVE">Live Now</option>
                <option value="EXPIRED">Expired</option>
                <option value="PAUSED">Paused</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                value={placementFilter}
                onChange={(e) => setPlacementFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
              >
                <option value="ALL">All Placements</option>
                {placements.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Campaigns Table / Cards */}
          {loading ? (
            <div className="p-12 text-center text-text-muted">Loading campaigns...</div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="p-12 text-center bg-[#0F0F11] border border-white/10 rounded-2xl text-text-muted text-xs">
              No matching 24-Hour Live Banner campaigns found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCampaigns.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#0F0F11] border border-white/[0.08] hover:border-gold/30 rounded-2xl p-4.5 transition-all space-y-3 shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-gold">{c.campaignNumber}</span>
                        {getStatusBadge(c.status)}
                        <span className="text-[10px] text-text-muted font-mono bg-white/5 px-2 py-0.5 rounded">
                          {c.placementId}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
                          {c.paymentStatus} (₹{c.finalAmountINR.toLocaleString()})
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{c.adTitle}</h4>
                      <p className="text-xs text-text-secondary">{c.businessName} • {c.contactEmail} • {c.contactPhone}</p>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setReviewModalCampaign(c)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold border border-white/10 cursor-pointer"
                      >
                        Inspect Creative
                      </button>

                      {c.status === "PENDING_APPROVAL" && (
                        <>
                          <button
                            onClick={() => handleApprove(c.id)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-bold uppercase cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectModalCampaign(c);
                              setRejectionReason("");
                            }}
                            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {c.status === "LIVE" && (
                        <button
                          onClick={() => handlePause(c.id)}
                          className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Pause className="w-3 h-3" />
                          <span>Pause</span>
                        </button>
                      )}

                      {c.status === "PAUSED" && (
                        <button
                          onClick={() => handleResume(c.id)}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          <span>Resume</span>
                        </button>
                      )}

                      <a
                        href={c.destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-text-muted hover:text-white rounded-lg border border-white/10"
                        title="Open Destination Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Creative Preview & Analytics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center text-xs">
                    <div className="md:col-span-1 rounded-lg overflow-hidden border border-white/10 bg-black max-h-20">
                      <img src={c.creative.desktopImageUrl} alt={c.adTitle} className="w-full h-full object-cover" />
                    </div>

                    <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                      <div className="p-2 bg-white/[0.02] rounded-lg border border-white/5">
                        <span className="text-[9px] text-text-muted uppercase font-bold">Impressions</span>
                        <p className="text-sm font-bold text-emerald-400 font-mono">{c.impressions.toLocaleString()}</p>
                      </div>
                      <div className="p-2 bg-white/[0.02] rounded-lg border border-white/5">
                        <span className="text-[9px] text-text-muted uppercase font-bold">Clicks</span>
                        <p className="text-sm font-bold text-blue-400 font-mono">{c.clicks.toLocaleString()}</p>
                      </div>
                      <div className="p-2 bg-white/[0.02] rounded-lg border border-white/5">
                        <span className="text-[9px] text-text-muted uppercase font-bold">CTR</span>
                        <p className="text-sm font-bold text-gold font-mono">{c.ctr}%</p>
                      </div>
                      <div className="p-2 bg-white/[0.02] rounded-lg border border-white/5">
                        <span className="text-[9px] text-text-muted uppercase font-bold">Slot Window</span>
                        <p className="text-[10px] font-mono text-white truncate">{new Date(c.startAtUtc).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── SUB-TAB 2: CALENDAR TIMELINE ─────────────────── */}
      {activeSubTab === "calendar" && (
        <div className="space-y-4">
          <div className="p-4 bg-[#0F0F11] border border-white/10 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Calendar className="w-4 h-4 text-gold" />
              <span>24-Hour Slot Schedule Timeline</span>
            </h4>
            <p className="text-xs text-text-secondary">
              Real-time timeline of booked, active, and scheduled 24-hour campaigns across CineVenue placements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {placements.map((p) => {
              const slots = calendarSlots.filter(s => s.placementId === p.id);
              return (
                <div key={p.id} className="p-4 bg-[#0F0F11] border border-white/10 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white">{p.name}</span>
                    <span className="text-[10px] font-mono text-gold">₹{p.basePrice24hINR.toLocaleString()} / 24h</span>
                  </div>

                  {slots.length === 0 ? (
                    <div className="p-4 text-center text-xs text-text-muted/60 bg-white/[0.01] rounded-xl border border-dashed border-white/5">
                      No reserved campaigns for this placement.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {slots.map((s) => (
                        <div key={s.id} className="p-2.5 bg-white/[0.02] border border-white/10 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono text-gold text-[11px] font-bold block">{s.campaignNumber}</span>
                            <span className="text-white font-semibold block">{s.businessName}</span>
                            <span className="text-[10px] text-text-muted font-mono">
                              {new Date(s.startAtUtc).toLocaleString()} → {new Date(s.endAtUtc).toLocaleString()}
                            </span>
                          </div>
                          <div>{getStatusBadge(s.status)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── SUB-TAB 3: PLACEMENTS & PRICING SETTINGS ──────── */}
      {activeSubTab === "pricing" && (
        <div className="space-y-4">
          <div className="p-4 bg-[#0F0F11] border border-white/10 rounded-2xl space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              24-Hour Placement Rates & Inventory Capacity
            </h4>
            <p className="text-xs text-text-secondary">
              Update direct advertiser pricing. Final customer checkout computes 18% GST server-side automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {placements.map((p) => (
              <div key={p.id} className="p-4 bg-[#0F0F11] border border-white/10 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gold uppercase tracking-wider font-mono">{p.page}</span>
                  <h4 className="text-sm font-bold text-white">{p.name}</h4>
                  <p className="text-[10px] text-text-muted font-mono">
                    {p.desktopDimensions} (Desktop) • {p.mobileDimensions} (Mobile)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-base font-black text-gold font-mono block">
                      ₹{p.basePrice24hINR.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-text-muted block">+ 18% GST</span>
                  </div>

                  <button
                    onClick={() => {
                      setEditingPlacement(p);
                      setEditPrice(p.basePrice24hINR);
                    }}
                    className="p-2 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white rounded-lg border border-white/10 cursor-pointer"
                    title="Edit Pricing"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-gold" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── SUB-TAB 4: REPORTS & EXPORT ──────────────────── */}
      {activeSubTab === "reports" && (
        <div className="p-6 bg-[#0F0F11] border border-white/10 rounded-2xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Campaign Performance & Revenue Audit
              </h4>
              <p className="text-xs text-text-secondary">
                Authoritative audit records containing impressions, clicks, CTR, and verified tax payments.
              </p>
            </div>
            <button
              onClick={exportCsvReport}
              className="px-4 py-2 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV Report</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/5 text-[10px] text-text-muted uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Advertiser</th>
                  <th className="p-3">Placement</th>
                  <th className="p-3">Amount (INR)</th>
                  <th className="p-3">Impressions</th>
                  <th className="p-3">Clicks</th>
                  <th className="p-3">CTR</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-mono text-gold font-bold">{c.campaignNumber}</td>
                    <td className="p-3 text-white font-medium">{c.businessName}</td>
                    <td className="p-3 font-mono text-text-muted">{c.placementId}</td>
                    <td className="p-3 font-mono text-white font-semibold">₹{c.finalAmountINR.toLocaleString()}</td>
                    <td className="p-3 font-mono text-emerald-400">{c.impressions.toLocaleString()}</td>
                    <td className="p-3 font-mono text-blue-400">{c.clicks.toLocaleString()}</td>
                    <td className="p-3 font-mono text-gold">{c.ctr}%</td>
                    <td className="p-3">{getStatusBadge(c.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MODAL: INSPECT CREATIVE & APPROVE ────────────── */}
      {reviewModalCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0E0F14] border border-white/20 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold text-gold uppercase font-mono tracking-widest">
                  CREATIVE INSPECTOR & APPROVAL DESK
                </span>
                <h3 className="text-xl font-bold text-white">{reviewModalCampaign.adTitle}</h3>
                <p className="text-xs text-text-muted">{reviewModalCampaign.businessName} • Ref: {reviewModalCampaign.campaignNumber}</p>
              </div>
              <button
                onClick={() => setReviewModalCampaign(null)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Desktop Banner Preview */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1">
                <Monitor className="w-3.5 h-3.5 text-gold" />
                <span>Desktop Creative Preview</span>
              </label>
              <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
                <img
                  src={reviewModalCampaign.creative.desktopImageUrl}
                  alt={reviewModalCampaign.adTitle}
                  className="w-full h-auto object-cover max-h-48"
                />
              </div>
            </div>

            {/* Mobile Banner Preview */}
            {reviewModalCampaign.creative.mobileImageUrl && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-gold" />
                  <span>Mobile Creative Preview</span>
                </label>
                <div className="rounded-xl overflow-hidden border border-white/10 bg-black max-w-xs mx-auto">
                  <img
                    src={reviewModalCampaign.creative.mobileImageUrl}
                    alt={reviewModalCampaign.adTitle}
                    className="w-full h-auto object-cover max-h-36"
                  />
                </div>
              </div>
            )}

            {/* Destination URL */}
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-xs">
              <div className="truncate pr-2">
                <span className="text-text-muted block text-[10px] uppercase font-bold">Destination URL:</span>
                <span className="text-gold font-mono truncate">{reviewModalCampaign.destinationUrl}</span>
              </div>
              <a
                href={reviewModalCampaign.destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-xs font-semibold flex items-center gap-1 shrink-0"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setReviewModalCampaign(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold cursor-pointer border border-white/10"
              >
                Close
              </button>

              {reviewModalCampaign.status === "PENDING_APPROVAL" && (
                <>
                  <button
                    onClick={() => {
                      setRejectModalCampaign(reviewModalCampaign);
                      setReviewModalCampaign(null);
                      setRejectionReason("");
                    }}
                    className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Reject Creative
                  </button>
                  <button
                    onClick={() => handleApprove(reviewModalCampaign.id)}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    Approve & Schedule
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: REJECT CAMPAIGN ───────────────────────── */}
      {rejectModalCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0E0F14] border border-white/20 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left">
            <h3 className="text-base font-bold text-white">Reject Campaign Creative</h3>
            <p className="text-xs text-text-secondary">
              Provide feedback for <strong className="text-white">{rejectModalCampaign.businessName}</strong>. The rejection reason will be visible on the advertiser's dashboard.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Creative dimensions do not adhere to 1200x240 guidelines or contains blurry graphics."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-400 h-24 resize-none"
              required
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setRejectModalCampaign(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold cursor-pointer border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectionReason.trim()}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT PLACEMENT PRICE ──────────────────── */}
      {editingPlacement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0E0F14] border border-white/20 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left">
            <h3 className="text-base font-bold text-white">Update Placement Rate</h3>
            <p className="text-xs text-text-secondary">
              Update 24-hour rate for <strong className="text-gold">{editingPlacement.name}</strong>.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase">Base Price (INR / 24 Hours)</label>
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(Number(e.target.value))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-gold"
                min="500"
                step="100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setEditingPlacement(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold cursor-pointer border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePrice}
                className="px-5 py-2 bg-gold hover:bg-gold-light text-black rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md shadow-gold/20"
              >
                Save Rate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveBannersAdminTab;
