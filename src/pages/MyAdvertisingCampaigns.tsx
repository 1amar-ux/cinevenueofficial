import React, { useState, useEffect } from "react";
import {
  Sparkles, Layers, Clock, Eye, MousePointer, TrendingUp, CheckCircle,
  AlertCircle, ArrowRight, ExternalLink, Printer, Plus, RefreshCw,
  Calendar, Monitor, Smartphone, Building
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CineVenueLogo from "../components/CineVenueLogo";
import { LiveBannerCampaign } from "../types/advertising";
import { fetchMyLiveCampaigns } from "../services/advertisingService";

export const MyAdvertisingCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<LiveBannerCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<LiveBannerCampaign | null>(null);

  useEffect(() => {
    // Read user email from token or localStorage
    const savedEmail = localStorage.getItem("user_email") || "";
    setUserEmail(savedEmail);
    loadCampaigns(savedEmail);
  }, []);

  const loadCampaigns = async (email: string) => {
    setLoading(true);
    try {
      const list = await fetchMyLiveCampaigns(email);
      setCampaigns(list);
    } catch (err) {
      console.warn("Failed loading my campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LIVE":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">● LIVE NOW</span>;
      case "SCHEDULED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">⏳ Scheduled</span>;
      case "PENDING_APPROVAL":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">Review Pending</span>;
      case "EXPIRED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/50 border border-white/10">Expired (Completed)</span>;
      case "PAUSED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Paused</span>;
      case "REJECTED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/70 border border-white/10">{status}</span>;
    }
  };

  const totalSpent = campaigns
    .filter(c => c.paymentStatus === "PAID")
    .reduce((sum, c) => sum + c.finalAmountINR, 0);

  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-[#070709] text-text-primary flex flex-col justify-between font-sans">
      <div className="border-b border-white/10 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <CineVenueLogo size="md" onClick={() => window.location.href = "/"} />
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = "/advertise-with-cinevenue"}
              className="px-4 py-2 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-gold/20"
            >
              <Plus className="w-4 h-4" />
              <span>Book 24-Hour Banner</span>
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              Home
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 w-full flex-1 space-y-8 text-left">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gold uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Advertiser Portal
            </span>
            <h1 className="text-3xl font-black text-white">My Advertising Campaigns</h1>
            <p className="text-xs text-text-secondary">
              Track live performance, banner approvals, impressions, and tax receipts for your CineVenue direct sponsorships.
            </p>
          </div>

          <button
            onClick={() => loadCampaigns(userEmail)}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl text-xs flex items-center gap-2 border border-white/10 self-start md:self-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gold" />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* KPIs Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#0B0C10] border border-white/10 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Campaigns</span>
            <p className="text-2xl font-black text-white font-mono">{campaigns.length}</p>
          </div>
          <div className="p-4 bg-[#0B0C10] border border-white/10 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Impressions</span>
            <p className="text-2xl font-black text-emerald-400 font-mono">{totalImpressions.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-[#0B0C10] border border-white/10 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Clicks</span>
            <p className="text-2xl font-black text-blue-400 font-mono">{totalClicks.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-[#0B0C10] border border-white/10 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Average CTR</span>
            <p className="text-2xl font-black text-gold font-mono">{avgCtr}%</p>
          </div>
        </div>

        {/* Campaigns List */}
        {loading ? (
          <div className="p-16 text-center text-text-muted space-y-3">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs uppercase tracking-widest font-mono">Retrieving campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center bg-[#0B0C10] border border-white/10 rounded-3xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto">
              <Layers className="w-7 h-7 text-gold" />
            </div>
            <h3 className="text-lg font-bold text-white">No Direct Campaigns Found</h3>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              You have not booked any 24-Hour Live Banners yet. Reserve your guaranteed advertising slot across CineVenue's premier pages.
            </p>
            <button
              onClick={() => window.location.href = "/advertise-with-cinevenue"}
              className="px-6 py-3 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg shadow-gold/20 transition-all inline-flex items-center gap-2"
            >
              <span>Book Your First 24-Hour Banner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="bg-[#0B0C10] border border-white/10 rounded-2xl p-5 hover:border-gold/40 transition-all space-y-4 shadow-xl"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-gold font-bold">{c.campaignNumber}</span>
                      {getStatusBadge(c.status)}
                      <span className="text-[10px] text-text-muted font-mono uppercase bg-white/5 px-2 py-0.5 rounded">
                        {c.placementId}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{c.adTitle}</h3>
                    <p className="text-xs text-text-muted">{c.businessName} • {c.destinationUrl}</p>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      onClick={() => setSelectedReceipt(c)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-white/10 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-gold" />
                      <span>Invoice Receipt</span>
                    </button>
                    {c.destinationUrl && (
                      <a
                        href={c.destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-gold/10 hover:bg-gold/20 text-gold rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-gold/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Link</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Creative Thumbnail & Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-1 rounded-xl overflow-hidden border border-white/10 bg-black max-h-24">
                    <img
                      src={c.creative.desktopImageUrl}
                      alt={c.creative.altText || c.adTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-0.5">
                      <span className="text-[10px] text-text-muted uppercase font-bold">Impressions</span>
                      <p className="text-base font-bold text-emerald-400 font-mono">{c.impressions.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-0.5">
                      <span className="text-[10px] text-text-muted uppercase font-bold">Clicks</span>
                      <p className="text-base font-bold text-blue-400 font-mono">{c.clicks.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-0.5">
                      <span className="text-[10px] text-text-muted uppercase font-bold">CTR</span>
                      <p className="text-base font-bold text-gold font-mono">{c.ctr}%</p>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-0.5">
                      <span className="text-[10px] text-text-muted uppercase font-bold">Amount Paid</span>
                      <p className="text-base font-bold text-white font-mono">₹{c.finalAmountINR.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Schedule details */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-text-muted border-t border-white/5 pt-3">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-gold" />
                    Start: {new Date(c.startAtUtc).toLocaleString()} • End: {new Date(c.endAtUtc).toLocaleString()}
                  </span>
                  {c.rejectionReason && (
                    <span className="text-rose-400 font-semibold">
                      Reason: {c.rejectionReason}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invoice Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0E0F14] border border-white/20 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 text-left relative">
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <CineVenueLogo size="sm" />
                  <p className="text-[10px] text-text-muted mt-1 uppercase font-mono tracking-widest">
                    OFFICIAL TAX INVOICE RECEIPT
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-text-muted">Invoice No:</span>
                  <span className="font-mono text-white">{selectedReceipt.campaignNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-text-muted">Advertiser:</span>
                  <span className="font-semibold text-white">{selectedReceipt.businessName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-text-muted">Ad Title:</span>
                  <span className="text-white">{selectedReceipt.adTitle}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-text-muted">Placement:</span>
                  <span className="font-semibold text-gold">{selectedReceipt.placementId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-text-muted">Duration:</span>
                  <span className="text-white">24 Hours Guaranteed</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-text-muted">Scheduled Slot (UTC):</span>
                  <span className="font-mono text-[11px] text-white">{new Date(selectedReceipt.startAtUtc).toUTCString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-text-muted">Payment Status:</span>
                  <span className="font-bold text-emerald-400 uppercase">{selectedReceipt.paymentStatus}</span>
                </div>
                <div className="flex justify-between py-1 text-sm font-bold pt-2">
                  <span className="text-white">Total Amount (Incl. 18% GST):</span>
                  <span className="text-gold font-mono text-base">₹{selectedReceipt.finalAmountINR.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl cursor-pointer border border-white/10"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyAdvertisingCampaigns;
