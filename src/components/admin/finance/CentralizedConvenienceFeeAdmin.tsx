import React, { useState, useEffect, useMemo } from "react";
import {
  IndianRupee,
  Sliders,
  Percent,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  History,
  Tag,
  Film,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Check,
  X,
  FileSpreadsheet,
  Lock,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  centralizedPricingClient,
  PricingConfig,
  ConvenienceFeeSlab,
  DEFAULT_CLIENT_CONFIG,
  PricingCalculationResult
} from "../../../services/centralizedPricingService";

interface CentralizedConvenienceFeeAdminProps {
  isSuperAdmin?: boolean;
}

export default function CentralizedConvenienceFeeAdmin({
  isSuperAdmin = true
}: CentralizedConvenienceFeeAdminProps) {
  // Loaded active configuration from backend
  const [activeConfig, setActiveConfig] = useState<PricingConfig>(DEFAULT_CLIENT_CONFIG);
  // Working draft form state (editable before saving)
  const [formConfig, setFormConfig] = useState<PricingConfig>(DEFAULT_CLIENT_CONFIG);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Active view tab
  const [viewTab, setViewTab] = useState<"settings" | "slabs" | "preview" | "audit">("settings");

  // Slab Modal State
  const [isSlabModalOpen, setIsSlabModalOpen] = useState<boolean>(false);
  const [editingSlabId, setEditingSlabId] = useState<string | null>(null);
  const [slabMinPrice, setSlabMinPrice] = useState<string>("100");
  const [slabMaxPrice, setSlabMaxPrice] = useState<string>("199");
  const [slabIsAbove, setSlabIsAbove] = useState<boolean>(false);
  const [slabFeeAmount, setSlabFeeAmount] = useState<string>("16");
  const [slabFeeType, setSlabFeeType] = useState<"FIXED" | "PERCENTAGE">("FIXED");
  const [slabApplyTo, setSlabApplyTo] = useState<"BOTH" | "MOVIES" | "EVENTS">("BOTH");
  const [slabDescription, setSlabDescription] = useState<string>("");
  const [slabError, setSlabError] = useState<string | null>(null);

  // Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // Live Preview Simulator State
  const [simItemType, setSimItemType] = useState<"MOVIE" | "EVENT">("MOVIE");
  const [simPrice, setSimPrice] = useState<number>(150);
  const [simQty, setSimQty] = useState<number>(2);
  const [simCoupon, setSimCoupon] = useState<string>("");
  const [simDonation, setSimDonation] = useState<boolean>(false);

  // Load config from backend
  const loadActiveConfig = async (force: boolean = false) => {
    setIsLoading(true);
    try {
      const cfg = await centralizedPricingClient.getConfig(force);
      setActiveConfig(cfg);
      setFormConfig(JSON.parse(JSON.stringify(cfg)));
      const logs = await centralizedPricingClient.getAuditLogs();
      setAuditLogs(logs);
    } catch (err: any) {
      showToast("error", "Failed to fetch pricing configuration: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActiveConfig();
    const unsubscribe = centralizedPricingClient.subscribe((latest) => {
      setActiveConfig(latest);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Has changes compared to active config
  const isDirty = useMemo(() => {
    return JSON.stringify(formConfig) !== JSON.stringify(activeConfig);
  }, [formConfig, activeConfig]);

  // Live Preview Calculation using draft formConfig
  const livePreviewResult = useMemo<PricingCalculationResult>(() => {
    return centralizedPricingClient.calculateLocalFallback(
      {
        itemType: simItemType,
        ticketPrice: simPrice,
        quantity: simQty,
        couponCode: simCoupon,
        musicianDonation: simDonation
      },
      formConfig
    );
  }, [formConfig, simItemType, simPrice, simQty, simCoupon, simDonation]);

  // Validation: Check for invalid or overlapping slabs
  const slabValidation = useMemo(() => {
    const slabs = formConfig.slabs || [];
    for (let i = 0; i < slabs.length; i++) {
      const s = slabs[i];
      if (s.minPrice < 0) return `Slab ${i + 1}: Minimum price must be 0 or higher.`;
      if (s.maxPrice !== null && s.maxPrice <= s.minPrice) {
        return `Slab ${i + 1}: Maximum price (₹${s.maxPrice}) must be greater than Minimum price (₹${s.minPrice}).`;
      }
    }

    const enabledSlabs = slabs.filter((s) => s.enabled);
    for (let i = 0; i < enabledSlabs.length; i++) {
      for (let j = i + 1; j < enabledSlabs.length; j++) {
        const a = enabledSlabs[i];
        const b = enabledSlabs[j];
        const targetOverlaps = a.applyTo === "BOTH" || b.applyTo === "BOTH" || a.applyTo === b.applyTo;
        if (!targetOverlaps) continue;

        const aMin = a.minPrice;
        const aMax = a.maxPrice !== null ? a.maxPrice : Infinity;
        const bMin = b.minPrice;
        const bMax = b.maxPrice !== null ? b.maxPrice : Infinity;

        if (Math.max(aMin, bMin) <= Math.min(aMax, bMax)) {
          return `Overlapping range detected between [₹${aMin} - ${aMax === Infinity ? "Above" : "₹" + aMax}] and [₹${bMin} - ${bMax === Infinity ? "Above" : "₹" + bMax}].`;
        }
      }
    }
    return null;
  }, [formConfig.slabs]);

  // Save changes to backend
  const handlePublish = async () => {
    if (slabValidation) {
      showToast("error", slabValidation);
      return;
    }

    setIsSaving(true);
    try {
      const updated = await centralizedPricingClient.updateConfig(formConfig);
      setActiveConfig(updated);
      setFormConfig(JSON.parse(JSON.stringify(updated)));
      setIsConfirmModalOpen(false);
      showToast("success", `Pricing configuration published successfully (v${updated.version}). Applied to Website, Android app, and Checkout!`);
      const logs = await centralizedPricingClient.getAuditLogs();
      setAuditLogs(logs);
    } catch (err: any) {
      showToast("error", "Publish failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Open modal to add new slab
  const openAddSlabModal = () => {
    setEditingSlabId(null);
    setSlabMinPrice("100");
    setSlabMaxPrice("199");
    setSlabIsAbove(false);
    setSlabFeeAmount("16");
    setSlabFeeType("FIXED");
    setSlabApplyTo("BOTH");
    setSlabDescription("");
    setSlabError(null);
    setIsSlabModalOpen(true);
  };

  // Open modal to edit slab
  const openEditSlabModal = (slab: ConvenienceFeeSlab) => {
    setEditingSlabId(slab.id);
    setSlabMinPrice(String(slab.minPrice));
    setSlabMaxPrice(slab.maxPrice !== null ? String(slab.maxPrice) : "");
    setSlabIsAbove(slab.maxPrice === null);
    setSlabFeeAmount(String(slab.feeAmount));
    setSlabFeeType(slab.feeType);
    setSlabApplyTo(slab.applyTo);
    setSlabDescription(slab.description || "");
    setSlabError(null);
    setIsSlabModalOpen(true);
  };

  // Save slab to draft
  const handleSaveSlab = () => {
    const min = Number(slabMinPrice);
    const max = slabIsAbove || !slabMaxPrice ? null : Number(slabMaxPrice);
    const fee = Number(slabFeeAmount);

    if (isNaN(min) || min < 0) {
      setSlabError("Minimum price must be a valid non-negative number.");
      return;
    }
    if (max !== null && (isNaN(max) || max <= min)) {
      setSlabError("Maximum price must be greater than minimum price.");
      return;
    }
    if (isNaN(fee) || fee < 0) {
      setSlabError("Fee amount must be a valid non-negative number.");
      return;
    }

    const currentSlabs = [...formConfig.slabs];

    if (editingSlabId) {
      const idx = currentSlabs.findIndex((s) => s.id === editingSlabId);
      if (idx !== -1) {
        currentSlabs[idx] = {
          ...currentSlabs[idx],
          minPrice: min,
          maxPrice: max,
          feeAmount: fee,
          feeType: slabFeeType,
          applyTo: slabApplyTo,
          description: slabDescription || (max ? `₹${min}–₹${max}` : `₹${min} and above`)
        };
      }
    } else {
      const newSlab: ConvenienceFeeSlab = {
        id: `SLAB-${Date.now().toString(36).toUpperCase()}`,
        minPrice: min,
        maxPrice: max,
        feeAmount: fee,
        feeType: slabFeeType,
        applyTo: slabApplyTo,
        category: "STANDARD",
        enabled: true,
        orderIndex: currentSlabs.length,
        description: slabDescription || (max ? `₹${min}–₹${max}` : `₹${min} and above`)
      };
      currentSlabs.push(newSlab);
    }

    currentSlabs.sort((a, b) => a.minPrice - b.minPrice);
    setFormConfig({ ...formConfig, slabs: currentSlabs });
    setIsSlabModalOpen(false);
  };

  const handleDeleteSlab = (id: string) => {
    const filtered = formConfig.slabs.filter((s) => s.id !== id);
    setFormConfig({ ...formConfig, slabs: filtered });
  };

  const handleToggleSlab = (id: string) => {
    const updated = formConfig.slabs.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    setFormConfig({ ...formConfig, slabs: updated });
  };

  return (
    <div className="space-y-6 text-white pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold animate-in slide-in-from-top-3 ${
            toastMessage.type === "success"
              ? "bg-[#102B1D] border-emerald-500/40 text-emerald-300"
              : "bg-[#2D1217] border-red-500/40 text-red-300"
          }`}
        >
          {toastMessage.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#121216] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-[#D4AF37]/10 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                Single Source of Truth
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-white/70 border border-white/10">
                Config Version v{activeConfig.version}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${activeConfig.enabled ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                {activeConfig.enabled ? "Fee System Active" : "Fees Disabled"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Sliders className="w-6 h-6 text-[#D4AF37]" />
              Centralized Pricing & Convenience Fee Management
            </h1>
            <p className="text-xs text-white/60 mt-1 max-w-3xl leading-relaxed">
              Global control centre for ticketing surcharges, price-slab algorithms, and tax compliances. Any update instantly synchronizes across the <strong>CineVenue Website</strong>, <strong>Android App</strong>, <strong>Movie Booking</strong>, <strong>Live Events</strong>, <strong>Checkout Page</strong>, and <strong>Payment Gateways</strong>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => loadActiveConfig(true)}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-white/80 hover:text-white"
              title="Refresh from server database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            {isDirty && (
              <button
                onClick={() => setFormConfig(JSON.parse(JSON.stringify(activeConfig)))}
                className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Discard Changes</span>
              </button>
            )}

            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={!isDirty || isSaving || !!slabValidation}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                isDirty && !slabValidation
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#F5C518] text-black hover:opacity-95 shadow-[#D4AF37]/20"
                  : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Publish Changes</span>
            </button>
          </div>
        </div>

        {/* Status Pill Strip */}
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50 font-mono">
          <div className="flex items-center gap-4">
            <span>Last Updated: <strong className="text-white/80">{new Date(activeConfig.updatedAt).toLocaleString("en-IN")}</strong></span>
            <span>•</span>
            <span>Modified By: <strong className="text-[#D4AF37]">{activeConfig.updatedBy}</strong></span>
          </div>
          {isDirty && (
            <span className="text-amber-400 font-semibold flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              Unpublished Changes Pending
            </span>
          )}
        </div>
      </div>

      {/* Validation Banner if slabs overlap */}
      {slabValidation && (
        <div className="bg-[#2B171A] border border-red-500/40 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-red-200">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span><strong>Configuration Conflict:</strong> {slabValidation}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: "settings", label: "General & Tax Settings", icon: Sliders },
          { id: "slabs", label: `Price Slab Configuration (${formConfig.slabs.length})`, icon: Layers },
          { id: "preview", label: "Live Pricing Simulator", icon: Calculator },
          { id: "audit", label: `Audit Trail (${auditLogs.length})`, icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = viewTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setViewTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                isActive
                  ? "bg-[#242015] border-[#D4AF37]/50 text-[#F5C518] shadow-sm"
                  : "bg-white/[0.02] border-transparent text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GENERAL & TAX SETTINGS */}
      {viewTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Convenience Fee Settings Card */}
          <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 space-y-6 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#D4AF37]" />
                  General Fee Settings
                </h2>
                <p className="text-xs text-white/60 mt-0.5">Control global surcharge activation, method, and application scope.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormConfig({ ...formConfig, enabled: !formConfig.enabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  formConfig.enabled ? "bg-emerald-500" : "bg-white/20"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formConfig.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-4">
              {/* Fee Calculation Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 block">Calculation Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "SLAB", label: "Price Slab", desc: "Tiered by ticket price" },
                    { id: "FIXED", label: "Fixed Amount", desc: "Flat ₹ fee per item" },
                    { id: "PERCENTAGE", label: "Percentage", desc: "% of ticket subtotal" }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setFormConfig({ ...formConfig, calculationType: m.id as any })}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        formConfig.calculationType === m.id
                          ? "bg-[#2A2315] border-[#D4AF37] text-white"
                          : "bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20"
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{m.label}</div>
                      <div className="text-[10px] text-white/50 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fixed / Percentage Input Values */}
              {formConfig.calculationType === "FIXED" && (
                <div className="space-y-1.5 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                  <label className="text-xs font-semibold text-white/80 block">Default Fixed Fee Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-white/40 text-xs">₹</span>
                    <input
                      type="number"
                      value={formConfig.fixedAmount}
                      onChange={(e) => setFormConfig({ ...formConfig, fixedAmount: Number(e.target.value) })}
                      min="0"
                      step="1"
                      className="w-full bg-[#1A1A20] border border-white/10 rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              )}

              {formConfig.calculationType === "PERCENTAGE" && (
                <div className="space-y-1.5 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                  <label className="text-xs font-semibold text-white/80 block">Default Convenience Percentage (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formConfig.percentageRate}
                      onChange={(e) => setFormConfig({ ...formConfig, percentageRate: Number(e.target.value) })}
                      min="0"
                      max="100"
                      step="0.5"
                      className="w-full bg-[#1A1A20] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                    <span className="absolute right-3 top-2.5 text-white/40 text-xs">%</span>
                  </div>
                </div>
              )}

              {/* Apply To: Movies / Events / Both */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 block">Apply Surcharges To</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "BOTH", label: "Both Services", icon: Layers },
                    { id: "MOVIES", label: "Movie Bookings", icon: Film },
                    { id: "EVENTS", label: "Event Bookings", icon: Calendar }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormConfig({ ...formConfig, applyTo: item.id as any })}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          formConfig.applyTo === item.id
                            ? "bg-[#2A2315] border-[#D4AF37] text-[#F5C518]"
                            : "bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fee Application: Per Ticket vs Per Booking */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 block">Fee Application Granularity</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "PER_TICKET", label: "Per Ticket", desc: "Charged on each seat/pass" },
                    { id: "PER_BOOKING", label: "Per Booking", desc: "Flat surcharge for entire cart" }
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setFormConfig({ ...formConfig, feeApplication: g.id as any })}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        formConfig.feeApplication === g.id
                          ? "bg-[#2A2315] border-[#D4AF37] text-white"
                          : "bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20"
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{g.label}</div>
                      <div className="text-[10px] text-white/50 mt-0.5">{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tax (GST) Configuration Card */}
          <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 space-y-6 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Percent className="w-4 h-4 text-[#D4AF37]" />
                  Tax Configuration (GST on Convenience)
                </h2>
                <p className="text-xs text-white/60 mt-0.5">Statutory tax compliance, calculation method, and checkout display.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormConfig({ ...formConfig, gstEnabled: !formConfig.gstEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  formConfig.gstEnabled ? "bg-emerald-500" : "bg-white/20"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formConfig.gstEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-4">
              {/* GST Percentage */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 block">Applicable GST Rate (%)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[18, 12, 5, 28].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setFormConfig({ ...formConfig, gstPercentage: rate })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer ${
                        formConfig.gstPercentage === rate
                          ? "bg-[#2A2315] border-[#D4AF37] text-[#F5C518]"
                          : "bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20"
                      }`}
                    >
                      {rate}% (SAC 9985)
                    </button>
                  ))}
                </div>
              </div>

              {/* Tax Calculation Method */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 block">Tax Calculation Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "EXCLUSIVE", label: "Exclusive (Standard)", desc: "Fee + 18% GST added on top" },
                    { id: "INCLUSIVE", label: "Inclusive", desc: "GST embedded inside fee amount" }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setFormConfig({ ...formConfig, taxMethod: m.id as any })}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        formConfig.taxMethod === m.id
                          ? "bg-[#2A2315] border-[#D4AF37] text-white"
                          : "bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20"
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{m.label}</div>
                      <div className="text-[10px] text-white/50 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Tax Separately in Checkout */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white">Itemize Tax in Checkout Summary</div>
                  <div className="text-[11px] text-white/50">Display base convenience fee and GST lines separately for customer transparency.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormConfig({ ...formConfig, displayTaxSeparately: !formConfig.displayTaxSeparately })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    formConfig.displayTaxSeparately ? "bg-emerald-500" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      formConfig.displayTaxSeparately ? "translate-x-4.5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Event Specific Override (Optional) */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    Separate Event Pricing Override
                  </span>
                  <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20 font-semibold">
                    Optional
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-white/60 block mb-1">Event Method</label>
                    <select
                      value={formConfig.eventFeeCalculationType || "SLAB"}
                      onChange={(e) => setFormConfig({ ...formConfig, eventFeeCalculationType: e.target.value as any })}
                      className="w-full bg-[#1A1A20] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="SLAB">Use Price Slabs</option>
                      <option value="FIXED">Custom Fixed Event Fee</option>
                      <option value="PERCENTAGE">Custom Percentage Fee</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-white/60 block mb-1">
                      {formConfig.eventFeeCalculationType === "PERCENTAGE" ? "Event Rate (%)" : "Event Fee (₹)"}
                    </label>
                    <input
                      type="number"
                      value={formConfig.eventFeeCalculationType === "PERCENTAGE" ? (formConfig.eventPercentageRate || 10) : (formConfig.eventFixedAmount || 20)}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (formConfig.eventFeeCalculationType === "PERCENTAGE") {
                          setFormConfig({ ...formConfig, eventPercentageRate: val });
                        } else {
                          setFormConfig({ ...formConfig, eventFixedAmount: val });
                        }
                      }}
                      className="w-full bg-[#1A1A20] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRICE SLAB CONFIGURATION */}
      {viewTab === "slabs" && (
        <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4AF37]" />
                Dynamic Price Slab Configurations
              </h2>
              <p className="text-xs text-white/60 mt-0.5">
                Evaluates the convenience fee based on ticket tier price. Initial standard defaults loaded for ₹1–₹49, ₹50–₹99 (₹12), ₹100–₹199, ₹200–₹499, and ₹500+.
              </p>
            </div>
            <button
              onClick={openAddSlabModal}
              className="px-4 py-2 rounded-xl bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Price Slab</span>
            </button>
          </div>

          {/* Slabs Table */}
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#18181E] border-b border-white/10 text-white/60 text-[11px] uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4">Tier / Range</th>
                  <th className="py-3 px-4">Min Price</th>
                  <th className="py-3 px-4">Max Price</th>
                  <th className="py-3 px-4">Convenience Fee</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Applies To</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {formConfig.slabs.map((slab, idx) => (
                  <tr key={slab.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-sans font-semibold text-white">
                      {slab.description || `Tier ${idx + 1}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-white/90">₹{slab.minPrice}</td>
                    <td className="py-3 px-4 text-white/80">
                      {slab.maxPrice !== null ? `₹${slab.maxPrice}` : <span className="text-gold font-bold">and above</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-gold text-sm">
                        {slab.feeType === "PERCENTAGE" ? `${slab.feeAmount}%` : `₹${slab.feeAmount}`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/70">
                        {slab.feeType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        slab.applyTo === "BOTH" ? "bg-blue-500/10 text-blue-300" : slab.applyTo === "MOVIES" ? "bg-amber-500/10 text-amber-300" : "bg-purple-500/10 text-purple-300"
                      }`}>
                        {slab.applyTo}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleSlab(slab.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          slab.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {slab.enabled ? "Enabled" : "Disabled"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <button
                          onClick={() => openEditSlabModal(slab)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                          title="Edit Slab"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlab(slab.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                          title="Delete Slab"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE PRICING SIMULATOR */}
      {viewTab === "preview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulator Inputs Card */}
          <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 space-y-5 shadow-lg">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Calculator className="w-4 h-4 text-[#D4AF37]" />
              Simulation Inputs
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-white/60 block mb-1">Booking Product Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimItemType("MOVIE")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      simItemType === "MOVIE" ? "bg-[#2A2315] border-[#D4AF37] text-white" : "bg-white/[0.02] border-white/10 text-white/60"
                    }`}
                  >
                    Movie Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimItemType("EVENT")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      simItemType === "EVENT" ? "bg-[#2A2315] border-[#D4AF37] text-white" : "bg-white/[0.02] border-white/10 text-white/60"
                    }`}
                  >
                    Event Ticket
                  </button>
                </div>
              </div>

              <div>
                <label className="text-white/60 block mb-1">Ticket Unit Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-white/40">₹</span>
                  <input
                    type="number"
                    value={simPrice}
                    onChange={(e) => setSimPrice(Number(e.target.value))}
                    min="1"
                    className="w-full bg-[#1A1A20] border border-white/10 rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div className="flex gap-1.5 mt-2 overflow-x-auto">
                  {[10, 50, 99, 150, 250, 500, 750].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setSimPrice(quick)}
                      className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-white/80 shrink-0 cursor-pointer"
                    >
                      ₹{quick}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/60 block mb-1">Number of Tickets</label>
                <div className="flex items-center gap-3">
                  {[1, 2, 4, 6, 10].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSimQty(q)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold font-mono transition-all cursor-pointer ${
                        simQty === q ? "bg-[#2A2315] border-[#D4AF37] text-white" : "bg-white/5 border-white/10 text-white/60"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/60 block mb-1">Coupon Promo Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. WELCOME50, CINE20"
                  value={simCoupon}
                  onChange={(e) => setSimCoupon(e.target.value)}
                  className="w-full bg-[#1A1A20] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono uppercase text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-white/70">Add Musician Donation (₹1/ticket)</span>
                <input
                  type="checkbox"
                  checked={simDonation}
                  onChange={(e) => setSimDonation(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-[#D4AF37] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Live Output Card */}
          <div className="bg-[#121216] border border-[#D4AF37]/30 rounded-2xl p-6 lg:col-span-2 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37] block">Live Output</span>
                <h3 className="text-lg font-black text-white">Authoritative Server Calculation</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-white/50 block font-mono">Algorithm Evaluated</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {livePreviewResult.calculationType} ({livePreviewResult.feeApplication})
                </span>
              </div>
            </div>

            {/* Price Split Ledger */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/70">Base Tickets ({simQty} x ₹{simPrice}):</span>
                <span className="text-white font-bold text-sm">₹{livePreviewResult.baseTicketAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <div>
                  <span className="text-white/70">Convenience Fee:</span>
                  <span className="text-[10px] text-white/40 block">
                    {livePreviewResult.isFeeEnabled ? `${livePreviewResult.calculationType} method` : "Convenience fee disabled"}
                  </span>
                </div>
                <span className="text-[#D4AF37] font-bold text-sm">₹{livePreviewResult.baseConvenienceFee.toFixed(2)}</span>
              </div>

              {livePreviewResult.gstRate > 0 && (
                <div className="flex justify-between items-center py-1 border-b border-white/5 text-white/60">
                  <span>Applicable GST on Convenience ({livePreviewResult.gstRate}% {livePreviewResult.taxMethod}):</span>
                  <span>₹{livePreviewResult.convenienceFeeGstTotal.toFixed(2)}</span>
                </div>
              )}

              {livePreviewResult.discountAmount > 0 && (
                <div className="flex justify-between items-center py-1 border-b border-white/5 text-emerald-400 font-bold">
                  <span>Discount ({simCoupon}):</span>
                  <span>-₹{livePreviewResult.discountAmount.toFixed(2)}</span>
                </div>
              )}

              {livePreviewResult.musicianDonationAmount > 0 && (
                <div className="flex justify-between items-center py-1 border-b border-white/5 text-purple-300">
                  <span>Musician Community Donation:</span>
                  <span>₹{livePreviewResult.musicianDonationAmount.toFixed(2)}</span>
                </div>
              )}

              {/* Total Payable */}
              <div className="flex justify-between items-center pt-3 border-t-2 border-white/20">
                <div>
                  <span className="text-sm font-bold text-white uppercase font-sans">Final Payable Total:</span>
                  <span className="text-[10px] text-white/40 block font-sans">Amount charged to Payment Gateway</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#F5C518]">₹{livePreviewResult.finalPayableAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Fee Lines Breakdown */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 block font-sans">
                Evaluated Ticket Line Items
              </span>
              <div className="space-y-1.5 font-mono text-[11px] text-white/70">
                {livePreviewResult.feeLines.map((line, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-white/5">
                    <span>
                      Ticket #{idx + 1} (₹{line.ticketPrice}) → {line.slabDescription}
                    </span>
                    <span className="text-white font-bold">
                      Base ₹{line.baseCharge.toFixed(2)} + GST ₹{line.gstAmount.toFixed(2)} = ₹{line.totalFee.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {viewTab === "audit" && (
        <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#D4AF37]" />
                Pricing Configuration Audit Trail
              </h2>
              <p className="text-xs text-white/60 mt-0.5">Immutable historical record of every convenience fee update, actor, and timestamp.</p>
            </div>
            <span className="text-xs text-white/50 font-mono font-semibold">{auditLogs.length} Records</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {auditLogs.length === 0 ? (
              <div className="py-12 text-center text-white/40">No audit events recorded yet.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">{log.action}</span>
                    <span className="text-[11px] text-white/50">{new Date(log.createdAt).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="text-[11px] text-white/70">
                    By: <strong className="text-white">{log.actorEmail}</strong>
                    {log.reason && <span> — {log.reason}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SLAB ADD/EDIT MODAL */}
      {isSlabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#18181E] border border-white/20 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4AF37]" />
                {editingSlabId ? "Edit Price Slab" : "Create New Price Slab"}
              </h3>
              <button onClick={() => setIsSlabModalOpen(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {slabError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300">
                {slabError}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1">Minimum Price (₹)</label>
                  <input
                    type="number"
                    value={slabMinPrice}
                    onChange={(e) => setSlabMinPrice(e.target.value)}
                    min="0"
                    className="w-full bg-[#121216] border border-white/10 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-white/70 block mb-1">Maximum Price (₹)</label>
                  <input
                    type="number"
                    value={slabMaxPrice}
                    onChange={(e) => setSlabMaxPrice(e.target.value)}
                    disabled={slabIsAbove}
                    placeholder={slabIsAbove ? "And Above" : "e.g. 199"}
                    className="w-full bg-[#121216] border border-white/10 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-[#D4AF37] disabled:opacity-30"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="aboveCheck"
                  checked={slabIsAbove}
                  onChange={(e) => {
                    setSlabIsAbove(e.target.checked);
                    if (e.target.checked) setSlabMaxPrice("");
                  }}
                  className="rounded border-white/20 bg-white/5 text-[#D4AF37]"
                />
                <label htmlFor="aboveCheck" className="text-white/70 cursor-pointer">
                  No upper limit (e.g. ₹500 and above)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1">Fee Amount</label>
                  <input
                    type="number"
                    value={slabFeeAmount}
                    onChange={(e) => setSlabFeeAmount(e.target.value)}
                    min="0"
                    className="w-full bg-[#121216] border border-white/10 rounded-xl px-3 py-2 font-mono font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-white/70 block mb-1">Fee Type</label>
                  <select
                    value={slabFeeType}
                    onChange={(e) => setSlabFeeType(e.target.value as any)}
                    className="w-full bg-[#121216] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="FIXED">Fixed Amount (₹)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white/70 block mb-1">Apply To</label>
                <select
                  value={slabApplyTo}
                  onChange={(e) => setSlabApplyTo(e.target.value as any)}
                  className="w-full bg-[#121216] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="BOTH">Both Movies & Events</option>
                  <option value="MOVIES">Movies Only</option>
                  <option value="EVENTS">Events Only</option>
                </select>
              </div>

              <div>
                <label className="text-white/70 block mb-1">Description / Label</label>
                <input
                  type="text"
                  placeholder="e.g. Standard Prime (₹100–₹199)"
                  value={slabDescription}
                  onChange={(e) => setSlabDescription(e.target.value)}
                  className="w-full bg-[#121216] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsSlabModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSlab}
                className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                {editingSlabId ? "Update Slab" : "Create Slab"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM PUBLISH MODAL */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#18181E] border border-[#D4AF37]/50 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Publish Centralized Pricing Changes?</h3>
                <span className="text-[11px] text-white/60 block">Version increment to v{(activeConfig.version || 1) + 1}</span>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Publishing will update the single source of truth. All active channels (<strong>Website, Android App, Movie & Event Checkouts, Payment Gateways</strong>) will immediately consume this new pricing configuration for all new bookings. Existing bookings retain their original pricing snapshot.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5C518] text-black text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg hover:opacity-95 flex items-center gap-2"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? "Publishing..." : "Confirm & Publish"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
