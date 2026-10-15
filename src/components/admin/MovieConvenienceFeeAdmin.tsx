import React, { useState, useEffect, useMemo } from "react";
import {
  IndianRupee,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Shield,
  Percent,
  Calculator,
  Sliders,
  History,
  Info,
  X,
  Check,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Tag,
  ArrowRight
} from "lucide-react";
import {
  movieFeeClient,
  MovieFeeConfig,
  GlobalMovieFeeSettings,
  FALLBACK_MOVIE_FEES
} from "../../services/movieFeeService";

interface MovieConvenienceFeeAdminProps {
  isSuperAdmin?: boolean;
}

export default function MovieConvenienceFeeAdmin({
  isSuperAdmin = true
}: MovieConvenienceFeeAdminProps) {
  // Data state
  const [configs, setConfigs] = useState<MovieFeeConfig[]>(FALLBACK_MOVIE_FEES);
  const [globalSettings, setGlobalSettings] = useState<GlobalMovieFeeSettings>({
    enabled: true,
    defaultGstRate: 18.0,
    defaultFeeApplication: "PER_TICKET"
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ENABLED" | "DISABLED">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"configs" | "simulator" | "audit">("configs");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingConfig, setEditingConfig] = useState<MovieFeeConfig | null>(null);
  const [formTicketPrice, setFormTicketPrice] = useState<string>("150");
  const [formBaseCharge, setFormBaseCharge] = useState<string>("20.00");
  const [formCategory, setFormCategory] = useState<string>("STANDARD");
  const [formGstRate, setFormGstRate] = useState<string>("18.0");
  const [formFeeApp, setFormFeeApp] = useState<"PER_TICKET" | "PER_BOOKING">("PER_TICKET");
  const [formEnabled, setFormEnabled] = useState<boolean>(true);
  const [formDescription, setFormDescription] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Simulator State
  const [simPrice, setSimPrice] = useState<number>(150);
  const [simQty, setSimQty] = useState<number>(2);
  const [simCategory, setSimCategory] = useState<string>("STANDARD");
  const [simCouponCode, setSimCouponCode] = useState<string>("");
  const [simMusicianDonation, setSimMusicianDonation] = useState<boolean>(false);

  // Fetch initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await movieFeeClient.getAdminFees();
      setConfigs(data.configs);
      setGlobalSettings(data.globalSettings);
      setAuditLogs(data.auditLogs);
    } catch (e: any) {
      console.error("Error loading movie fee configs:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showBanner = (type: "success" | "error", text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Global Toggle handler
  const handleToggleGlobal = async () => {
    if (!isSuperAdmin) {
      showBanner("error", "Access Denied: Only Super Admin can toggle global movie convenience fees.");
      return;
    }
    const targetState = !globalSettings.enabled;
    try {
      const updated = await movieFeeClient.updateGlobalSettings({ enabled: targetState });
      setGlobalSettings(updated);
      showBanner("success", `Convenience fee system ${targetState ? "ENABLED" : "DISABLED"} platform-wide.`);
      loadData();
    } catch (e: any) {
      showBanner("error", e.message || "Failed to update global settings.");
    }
  };

  // Global GST rate handler
  const handleUpdateGlobalGst = async (newRate: number) => {
    if (!isSuperAdmin) {
      showBanner("error", "Access Denied: Only Super Admin can modify GST rates.");
      return;
    }
    try {
      const updated = await movieFeeClient.updateGlobalSettings({ defaultGstRate: newRate });
      setGlobalSettings(updated);
      showBanner("success", `Global GST rate updated to ${newRate}%.`);
      loadData();
    } catch (e: any) {
      showBanner("error", e.message || "Failed to update GST rate.");
    }
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingConfig(null);
    setFormTicketPrice("150");
    setFormBaseCharge("20.00");
    setFormCategory("STANDARD");
    setFormGstRate(String(globalSettings.defaultGstRate || 18.0));
    setFormFeeApp("PER_TICKET");
    setFormEnabled(true);
    setFormDescription("");
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (config: MovieFeeConfig) => {
    setEditingConfig(config);
    setFormTicketPrice(String(config.ticketPrice));
    setFormBaseCharge(Number(config.baseCharge).toFixed(2));
    setFormCategory(config.category || "STANDARD");
    setFormGstRate(String(config.gstRate !== undefined ? config.gstRate : globalSettings.defaultGstRate));
    setFormFeeApp(config.feeApplication || "PER_TICKET");
    setFormEnabled(config.enabled);
    setFormDescription(config.description || "");
    setFormError(null);
    setIsModalOpen(true);
  };

  // Submit Modal (Create or Edit)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const price = Number(formTicketPrice);
    const charge = Number(formBaseCharge);
    const gst = Number(formGstRate);

    if (isNaN(price) || price <= 0) {
      setFormError("Ticket price must be a valid positive number.");
      return;
    }
    if (isNaN(charge) || charge < 0) {
      setFormError("Base charge must be a non-negative number.");
      return;
    }
    if (isNaN(gst) || gst < 0 || gst > 100) {
      setFormError("GST rate must be between 0% and 100%.");
      return;
    }

    // Check for duplicate prices with same category
    const cleanCat = (formCategory || "STANDARD").trim().toUpperCase();
    const isDuplicate = configs.some((c) => {
      if (editingConfig && c.id === editingConfig.id) return false;
      return Number(c.ticketPrice) === price && c.category.toUpperCase() === cleanCat;
    });

    if (isDuplicate) {
      setFormError(
        `A configuration for ticket price ₹${price} in category "${cleanCat}" already exists. You can use another category (e.g. SPECIAL, PREMIUM, RECLINER) or edit the existing configuration.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingConfig) {
        await movieFeeClient.updateFee(editingConfig.id, {
          ticketPrice: price,
          baseCharge: charge,
          category: cleanCat,
          gstRate: gst,
          feeApplication: formFeeApp,
          enabled: formEnabled,
          description: formDescription || null
        });
        showBanner("success", `Configuration for ₹${price} updated successfully.`);
      } else {
        await movieFeeClient.createFee({
          ticketPrice: price,
          baseCharge: charge,
          category: cleanCat,
          gstRate: gst,
          feeApplication: formFeeApp,
          enabled: formEnabled,
          description: formDescription || null
        });
        showBanner("success", `New convenience fee tier for ₹${price} added successfully.`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to save configuration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete configuration
  const handleDelete = async (id: string, ticketPrice: number, category: string) => {
    if (!confirm(`Are you sure you want to delete the convenience fee configuration for ₹${ticketPrice} (${category})?`)) {
      return;
    }
    try {
      await movieFeeClient.deleteFee(id);
      showBanner("success", `Configuration for ₹${ticketPrice} deleted successfully.`);
      loadData();
    } catch (err: any) {
      showBanner("error", err.message || "Failed to delete configuration.");
    }
  };

  // Quick inline toggle enabled/disabled
  const handleInlineToggle = async (config: MovieFeeConfig) => {
    try {
      const newState = !config.enabled;
      await movieFeeClient.updateFee(config.id, { enabled: newState });
      showBanner("success", `Fee for ₹${config.ticketPrice} (${config.category}) ${newState ? "enabled" : "disabled"}.`);
      loadData();
    } catch (err: any) {
      showBanner("error", err.message || "Failed to update configuration.");
    }
  };

  // Filtered configs
  const filteredConfigs = useMemo(() => {
    return configs.filter((c) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const priceMatch = String(c.ticketPrice).includes(q);
        const chargeMatch = String(c.baseCharge).includes(q);
        const catMatch = (c.category || "").toLowerCase().includes(q);
        const descMatch = (c.description || "").toLowerCase().includes(q);
        if (!priceMatch && !chargeMatch && !catMatch && !descMatch) return false;
      }
      // Status
      if (statusFilter === "ENABLED" && !c.enabled) return false;
      if (statusFilter === "DISABLED" && c.enabled) return false;

      // Category
      if (categoryFilter !== "ALL" && c.category.toUpperCase() !== categoryFilter.toUpperCase()) {
        return false;
      }

      return true;
    });
  }, [configs, searchQuery, statusFilter, categoryFilter]);

  // Unique categories list
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    configs.forEach((c) => {
      if (c.category) set.add(c.category.toUpperCase());
    });
    return Array.from(set).sort();
  }, [configs]);

  // Live simulation calculation
  const simCalculation = useMemo(() => {
    const isFeeEnabled = globalSettings.enabled;
    const globalGst = globalSettings.defaultGstRate || 18.0;

    // Find best match in active configs
    const active = configs.filter((c) => c.enabled);
    const cleanCat = simCategory.trim().toUpperCase();

    let match = active.find((c) => Number(c.ticketPrice) === simPrice && c.category.toUpperCase() === cleanCat);
    if (!match) match = active.find((c) => Number(c.ticketPrice) === simPrice);
    if (!match && active.length > 0) {
      let closest = active[0];
      let minDiff = Math.abs(Number(closest.ticketPrice) - simPrice);
      for (const c of active) {
        const diff = Math.abs(Number(c.ticketPrice) - simPrice);
        if (diff < minDiff) {
          minDiff = diff;
          closest = c;
        }
      }
      match = closest;
    }

    const ticketSubtotal = simPrice * simQty;
    const basePerTicket = isFeeEnabled ? (match ? Number(match.baseCharge) : 20.00) : 0;
    const effectiveGstRate = match && match.gstRate !== undefined ? Number(match.gstRate) : globalGst;

    const totalBaseCharge = globalSettings.defaultFeeApplication === "PER_BOOKING"
      ? (isFeeEnabled ? basePerTicket : 0)
      : basePerTicket * simQty;

    const totalGst = isFeeEnabled ? Math.round(((totalBaseCharge * effectiveGstRate) / 100) * 100) / 100 : 0;
    const totalConvenienceFee = totalBaseCharge + totalGst;
    const donation = simMusicianDonation ? simQty * 1.00 : 0;

    let discount = 0;
    if (simCouponCode.trim().toUpperCase() === "WELCOME50" && ticketSubtotal >= 200) discount = 50;
    else if (simCouponCode.trim().toUpperCase() === "CINE20") discount = Math.min(100, Math.round(ticketSubtotal * 0.2));

    const finalPayable = Math.max(0, Math.round((ticketSubtotal + totalConvenienceFee + donation - discount) * 100) / 100);

    return {
      match,
      ticketSubtotal,
      basePerTicket,
      totalBaseCharge,
      effectiveGstRate,
      totalGst,
      totalConvenienceFee,
      donation,
      discount,
      finalPayable,
      isFeeEnabled
    };
  }, [simPrice, simQty, simCategory, simCouponCode, simMusicianDonation, configs, globalSettings]);

  return (
    <div className="space-y-6 text-left font-sans" id="movie-convenience-fee-admin">
      {/* Header & Global System Status Controls */}
      <div className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Decorative Gold Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-gold/10 border border-gold/30 text-gold shadow-md">
                <IndianRupee className="w-5 h-5" />
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Movie Convenience Fee Settings
              </h2>
            </div>
            <p className="text-xs text-text-muted mt-1.5 max-w-2xl leading-relaxed">
              Super Admin Control Center for configuring authoritative movie ticket base charges and applicable GST rates.
              All configured fees automatically apply during checkout, pass directly to payment gateways, and are saved in booking records.
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Refresh configurations"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-gold/20 cursor-pointer border-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Ticket Price Tier</span>
            </button>
          </div>
        </div>

        {/* Global Control Switches Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Global Enable / Disable Switch */}
          <div className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
            globalSettings.enabled
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Fee System Status</span>
              </div>
              <p className="text-[11px] text-white/60">
                {globalSettings.enabled
                  ? "Active • Convenience fees applied at checkout"
                  : "Disabled • Customers charged ₹0 convenience fee"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleGlobal}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                globalSettings.enabled
                  ? "bg-emerald-500 text-black border-emerald-400 font-black shadow-md"
                  : "bg-rose-600 text-white border-rose-500 font-black shadow-md"
              }`}
            >
              {globalSettings.enabled ? "ENABLED" : "DISABLED"}
            </button>
          </div>

          {/* 2. Global GST Rate Configurator */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-gold">
                <Percent className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">Applicable GST Rate</span>
              </div>
              <p className="text-[11px] text-white/60">
                Applied on convenience fee base charges (Standard: 18%)
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-black/50 border border-white/10 px-2.5 py-1 rounded-lg">
              <input
                type="number"
                value={globalSettings.defaultGstRate}
                onChange={(e) => handleUpdateGlobalGst(Number(e.target.value))}
                min={0}
                max={100}
                step={0.5}
                className="w-14 bg-transparent text-right font-mono text-sm font-bold text-gold focus:outline-none"
              />
              <span className="text-xs font-bold text-white/50">%</span>
            </div>
          </div>

          {/* 3. System Statistics */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-cyan-400">
                <Sliders className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">Configured Tiers</span>
              </div>
              <p className="text-[11px] text-white/60">
                {configs.filter((c) => c.enabled).length} Active of {configs.length} Total Rules
              </p>
            </div>
            <span className="text-lg font-mono font-bold text-white px-3 py-1 bg-white/5 rounded-lg border border-white/10">
              {configs.length}
            </span>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between animate-fade-in ${
              actionMessage.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                : "bg-rose-500/15 border-rose-500/40 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-white/50 hover:text-white cursor-pointer bg-transparent border-0"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Tabs: Configurations Table | Interactive Simulator | Audit Logs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("configs")}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "configs"
              ? "border-gold text-gold"
              : "border-transparent text-text-muted hover:text-white"
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          <span>Configured Price Tiers ({filteredConfigs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("simulator")}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "simulator"
              ? "border-gold text-gold"
              : "border-transparent text-text-muted hover:text-white"
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Checkout Price Simulator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "audit"
              ? "border-gold text-gold"
              : "border-transparent text-text-muted hover:text-white"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Log History ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: CONFIGURATIONS TABLE */}
      {activeTab === "configs" && (
        <div className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket price, base charge, category..."
                className="w-full pl-9 pr-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-white/50">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent text-xs text-gold font-bold focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-[#121215] text-white">All Categories</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#121215] text-white">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-white/50">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-transparent text-xs text-gold font-bold focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-[#121215] text-white">All Status</option>
                  <option value="ENABLED" className="bg-[#121215] text-white">Active Only</option>
                  <option value="DISABLED" className="bg-[#121215] text-white">Disabled Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Canonical Table */}
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-white/[0.03] text-white/60 font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
                  <th className="py-3.5 px-4 font-bold">Ticket Price (₹)</th>
                  <th className="py-3.5 px-4 font-bold">Base Charge (₹)</th>
                  <th className="py-3.5 px-4 font-bold">Category / Tier</th>
                  <th className="py-3.5 px-4 font-bold">GST Rate (%)</th>
                  <th className="py-3.5 px-4 font-bold">Total Fee/Tkt (₹)</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredConfigs.map((config) => {
                  const base = Number(config.baseCharge);
                  const gstR = Number(config.gstRate !== undefined ? config.gstRate : globalSettings.defaultGstRate);
                  const gstAmt = Math.round(((base * gstR) / 100) * 100) / 100;
                  const totalFeePerTicket = Math.round((base + gstAmt) * 100) / 100;

                  return (
                    <tr
                      key={config.id}
                      className={`hover:bg-white/[0.02] transition-colors ${!config.enabled ? "opacity-50" : ""}`}
                    >
                      {/* Ticket Price */}
                      <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                        ₹{config.ticketPrice}
                      </td>

                      {/* Base Charge */}
                      <td className="py-3 px-4 font-mono font-bold text-gold">
                        ₹{base.toFixed(2)}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider border ${
                          config.category.toUpperCase() === "SPECIAL"
                            ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                            : config.category.toUpperCase() === "PREMIUM"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                            : "bg-white/5 border-white/10 text-white/70"
                        }`}>
                          {config.category}
                        </span>
                        {config.description && (
                          <span className="text-[10px] text-text-muted block mt-0.5">{config.description}</span>
                        )}
                      </td>

                      {/* GST */}
                      <td className="py-3 px-4 font-mono text-white/80">
                        {gstR.toFixed(1)}%
                        <span className="text-[10px] text-text-muted block">(+₹{gstAmt.toFixed(2)})</span>
                      </td>

                      {/* Total Fee Per Ticket */}
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        ₹{totalFeePerTicket.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleInlineToggle(config)}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                            config.enabled
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                          }`}
                          title="Click to toggle status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${config.enabled ? "bg-emerald-400" : "bg-rose-400"}`} />
                          <span>{config.enabled ? "Active" : "Disabled"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(config)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-gold hover:text-black text-white/70 transition-all cursor-pointer border border-white/10"
                            title="Edit this configuration"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(config.id, config.ticketPrice, config.category)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all cursor-pointer border border-rose-500/20"
                            title="Delete configuration"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredConfigs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-text-muted italic text-xs">
                      No convenience fee configurations matching your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE CHECKOUT PRICE SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-5 h-5 text-gold" />
              <span>Real-Time Movie Ticket Convenience Fee Simulator</span>
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Test how convenience fees and GST are computed for any ticket price, category, and quantity combination.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Controls */}
            <div className="space-y-4 bg-white/[0.02] border border-white/10 p-5 rounded-xl text-xs">
              <span className="font-bold uppercase tracking-wider text-gold block text-[11px]">
                Simulation Parameters
              </span>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Ticket Price (₹)</label>
                  <select
                    value={simPrice}
                    onChange={(e) => setSimPrice(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-gold"
                  >
                    {[50, 84, 100, 120, 125, 147, 150, 175, 177, 200, 235, 250, 295, 350, 470, 708].map((p) => (
                      <option key={p} value={p} className="bg-[#121215]">₹{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Quantity</label>
                  <input
                    type="number"
                    value={simQty}
                    onChange={(e) => setSimQty(Math.max(1, Number(e.target.value)))}
                    min={1}
                    max={10}
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Category</label>
                  <select
                    value={simCategory}
                    onChange={(e) => setSimCategory(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                  >
                    <option value="STANDARD" className="bg-[#121215]">STANDARD</option>
                    <option value="SPECIAL" className="bg-[#121215]">SPECIAL (e.g. ₹84 duplicate)</option>
                    <option value="PREMIUM" className="bg-[#121215]">PREMIUM (e.g. ₹147 duplicate)</option>
                    <option value="RECLINER" className="bg-[#121215]">RECLINER</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Promo Coupon Code</label>
                  <input
                    type="text"
                    value={simCouponCode}
                    onChange={(e) => setSimCouponCode(e.target.value)}
                    placeholder="e.g. WELCOME50, CINE20"
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono uppercase text-gold focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-white/80">
                  <input
                    type="checkbox"
                    checked={simMusicianDonation}
                    onChange={(e) => setSimMusicianDonation(e.target.checked)}
                    className="rounded border-white/20 bg-black text-gold cursor-pointer"
                  />
                  <span>Include Optional ₹1 Musician Donation per ticket</span>
                </label>
              </div>

              {simCalculation.match && (
                <div className="p-3 rounded-lg bg-gold/5 border border-gold/20 text-[11px] space-y-1 font-mono">
                  <span className="text-gold font-bold block">Matched Configuration Tier:</span>
                  <div className="text-white/70">
                    Tier ID: <span className="text-white font-bold">{simCalculation.match.id}</span> |
                    Ticket: <span className="text-white font-bold">₹{simCalculation.match.ticketPrice}</span> |
                    Base Charge: <span className="text-gold font-bold">₹{Number(simCalculation.match.baseCharge).toFixed(2)}</span> |
                    Category: <span className="text-purple-300 font-bold">{simCalculation.match.category}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Price Breakdown Preview */}
            <div className="bg-black/60 border border-white/15 rounded-xl p-5 space-y-4 text-xs font-sans">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gold" />
                  <span>Customer Checkout Price Breakdown</span>
                </span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                  simCalculation.isFeeEnabled ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                }`}>
                  {simCalculation.isFeeEnabled ? "Fee Active" : "Fee Disabled"}
                </span>
              </div>

              <div className="space-y-2.5 font-mono">
                <div className="flex justify-between text-white/70">
                  <span>Ticket Price:</span>
                  <span>₹{simPrice} × {simQty}</span>
                </div>

                <div className="flex justify-between font-bold text-white">
                  <span>Ticket Subtotal:</span>
                  <span>₹{simCalculation.ticketSubtotal.toFixed(2)}</span>
                </div>

                <div className="border-t border-white/5 pt-2 space-y-1.5">
                  <div className="flex justify-between text-gold">
                    <span>Convenience Fee Base Charge:</span>
                    <span>₹{simCalculation.totalBaseCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/60 text-[11px]">
                    <span>Applicable GST on Fee ({simCalculation.effectiveGstRate}%):</span>
                    <span>+ ₹{simCalculation.totalGst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-400">
                    <span>Total Convenience Fee:</span>
                    <span>₹{simCalculation.totalConvenienceFee.toFixed(2)}</span>
                  </div>
                </div>

                {simCalculation.donation > 0 && (
                  <div className="flex justify-between text-cyan-300 text-[11px] border-t border-white/5 pt-1.5">
                    <span>Musician Fund Donation:</span>
                    <span>+ ₹{simCalculation.donation.toFixed(2)}</span>
                  </div>
                )}

                {simCalculation.discount > 0 && (
                  <div className="flex justify-between text-emerald-300 text-[11px] border-t border-white/5 pt-1.5">
                    <span>Promotional Discount:</span>
                    <span>- ₹{simCalculation.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t-2 border-gold/40 pt-3 flex justify-between items-center text-sm font-bold text-gold">
                  <span className="uppercase tracking-wider">Final Payable Amount:</span>
                  <span className="text-lg">₹{simCalculation.finalPayable.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOG HISTORY */}
      {activeTab === "audit" && (
        <div className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="border-b border-white/10 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <History className="w-5 h-5 text-gold" />
                <span>Movie Convenience Fee Audit Trail</span>
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Permanent chronological record of fee tier creations, modifications, deletions, and global settings toggles.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-white/[0.03] text-white/60 font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
                  <th className="py-3 px-4 font-bold">Timestamp</th>
                  <th className="py-3 px-4 font-bold">Action</th>
                  <th className="py-3 px-4 font-bold">Admin Actor</th>
                  <th className="py-3 px-4 font-bold">Details / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {auditLogs.map((log: any, idx: number) => (
                  <tr key={log.id || idx} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-mono text-[11px] text-white/60">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString("en-IN") : "Recent"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                        log.action === "CREATED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : log.action === "UPDATED" || log.action === "GLOBAL_SETTINGS_UPDATED"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-white/80">
                      {log.actorEmail || "Super Admin"}
                    </td>
                    <td className="py-3 px-4 text-text-secondary leading-relaxed">
                      {log.reason || "Fee configuration updated"}
                    </td>
                  </tr>
                ))}

                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-text-muted italic text-xs">
                      No administrative audit logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121826] border-2 border-gold/40 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-left animate-fade-in relative">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-gold" />
                <span>{editingConfig ? `Edit Fee Tier (₹${editingConfig.ticketPrice})` : "Add New Ticket Price Tier"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 cursor-pointer border-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/70 uppercase">Ticket Price (₹) *</label>
                  <input
                    type="number"
                    value={formTicketPrice}
                    onChange={(e) => setFormTicketPrice(e.target.value)}
                    min={1}
                    step={1}
                    placeholder="e.g. 150"
                    required
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gold uppercase">Base Charge (₹) *</label>
                  <input
                    type="number"
                    value={formBaseCharge}
                    onChange={(e) => setFormBaseCharge(e.target.value)}
                    min={0}
                    step={0.5}
                    placeholder="e.g. 20.00"
                    required
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono font-bold text-gold focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/70 uppercase">Category / Tier</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value.toUpperCase())}
                    placeholder="STANDARD / SPECIAL / PREMIUM"
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-gold uppercase"
                  />
                  <span className="text-[9px] text-text-muted block">
                    Use unique category to distinguish duplicate prices (e.g. ₹84 or ₹147).
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/70 uppercase">Applicable GST Rate (%)</label>
                  <input
                    type="number"
                    value={formGstRate}
                    onChange={(e) => setFormGstRate(e.target.value)}
                    min={0}
                    max={100}
                    step={0.5}
                    placeholder="18.0"
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/70 uppercase">Application Mode</label>
                  <select
                    value={formFeeApp}
                    onChange={(e) => setFormFeeApp(e.target.value as any)}
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                  >
                    <option value="PER_TICKET" className="bg-[#121215]">Per Ticket</option>
                    <option value="PER_BOOKING" className="bg-[#121215]">Per Booking</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/70 uppercase">Status</label>
                  <select
                    value={formEnabled ? "true" : "false"}
                    onChange={(e) => setFormEnabled(e.target.value === "true")}
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                  >
                    <option value="true" className="bg-[#121215]">Enabled (Active)</option>
                    <option value="false" className="bg-[#121215]">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/70 uppercase">Description / Notes</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Weekend Prime / IMAX Balcony Tier"
                  className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                />
              </div>

              {/* Dynamic Live Preview in Form */}
              {(() => {
                const p = Number(formTicketPrice) || 0;
                const c = Number(formBaseCharge) || 0;
                const g = Number(formGstRate) || 18.0;
                const gstVal = Math.round(((c * g) / 100) * 100) / 100;
                const totFee = Math.round((c + gstVal) * 100) / 100;
                const totCustomer = p + totFee;
                return (
                  <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1 font-mono text-[11px]">
                    <span className="text-gold font-bold block">Preview:</span>
                    <div className="flex justify-between text-white/70">
                      <span>Ticket: ₹{p} + Base: ₹{c.toFixed(2)} + GST: ₹{gstVal.toFixed(2)}</span>
                      <span className="text-emerald-400 font-bold">Total: ₹{totCustomer.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase transition-all cursor-pointer border-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-black font-extrabold uppercase tracking-wider transition-all cursor-pointer border-0 shadow-lg shadow-gold/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Saving..." : editingConfig ? "Save Changes" : "Create Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
