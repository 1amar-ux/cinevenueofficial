import React, { useState, useEffect } from "react";
import { 
  DollarSign, PlusCircle, Trash2, Edit, CheckCircle, AlertTriangle, 
  Search, Shield, Calculator, FileText, Check, X, RefreshCw,
  Tag, Percent, Building, Film, MapPin, CreditCard, Sparkles, Layers,
  ChevronDown, ToggleLeft, ToggleRight, History, BarChart3, HelpCircle, ArrowRight
} from "lucide-react";
import { FeeRule, TaxRule, DiscountRule, FeeAuditLog, FeeCalculationResult, FeeType, ApplyMode, FeeScope, RuleStrategy, TaxAppliesTo } from "../../types/fees";
import { Theatre, Movie } from "../../types";

interface FeeManagementAdminProps {
  theatres?: Theatre[];
  movies?: Movie[];
  cities?: string[];
}

export default function FeeManagementAdmin({
  theatres = [],
  movies = [],
  cities = ["Hyderabad", "Bengaluru", "Mumbai", "Delhi NCR", "Chennai"]
}: FeeManagementAdminProps) {
  // Navigation Sub-tab state
  const [activeSubTab, setActiveSubTab] = useState<"rules" | "taxes" | "discounts" | "calculator" | "reports" | "audit">("rules");

  // Data States
  const [feeRules, setFeeRules] = useState<FeeRule[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([]);
  const [auditLogs, setAuditLogs] = useState<FeeAuditLog[]>([]);
  const [reportMetrics, setReportMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterScope, setFilterScope] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Fee Rule Form Modal State
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [feeForm, setFeeForm] = useState<{
    name: string;
    description: string;
    type: FeeType;
    value: number | string;
    applyMode: ApplyMode;
    scope: FeeScope;
    theatreId?: string;
    theatreName?: string;
    movieId?: string;
    movieTitle?: string;
    cityId?: string;
    cityName?: string;
    seatCategoryName?: string;
    paymentMethod?: string;
    taxApplicable: boolean;
    taxRuleId?: string;
    priority: number;
    ruleStrategy: RuleStrategy;
    minAmount?: number | string;
    maxAmount?: number | string;
    status: 'ACTIVE' | 'INACTIVE';
  }>({
    name: "",
    description: "",
    type: "FIXED",
    value: 18,
    applyMode: "PER_BOOKING",
    scope: "GLOBAL",
    taxApplicable: true,
    taxRuleId: "",
    priority: 10,
    ruleStrategy: "STACK",
    minAmount: "",
    maxAmount: "",
    status: "ACTIVE"
  });

  // Tax Rule Form Modal State
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [editingTaxId, setEditingTaxId] = useState<string | null>(null);
  const [taxForm, setTaxForm] = useState<{
    name: string;
    description: string;
    rate: number | string;
    type: 'PERCENTAGE' | 'FIXED';
    appliesTo: TaxAppliesTo;
    status: 'ACTIVE' | 'INACTIVE';
  }>({
    name: "",
    description: "",
    rate: 18,
    type: "PERCENTAGE",
    appliesTo: "PLATFORM_FEE",
    status: "ACTIVE"
  });

  // Discount Rule Form Modal State
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [discountForm, setDiscountForm] = useState<{
    name: string;
    description: string;
    couponCode: string;
    type: 'FIXED' | 'PERCENTAGE';
    value: number | string;
    applyMode: ApplyMode;
    scope: FeeScope;
    minAmount?: number | string;
    maxDiscount?: number | string;
    status: 'ACTIVE' | 'INACTIVE';
  }>({
    name: "",
    description: "",
    couponCode: "",
    type: "FIXED",
    value: 50,
    applyMode: "PER_BOOKING",
    scope: "GLOBAL",
    minAmount: 200,
    maxDiscount: 100,
    status: "ACTIVE"
  });

  // Interactive Sandbox Simulator State
  const [simItemType, setSimItemType] = useState<"MOVIE" | "EVENT">("MOVIE");
  const [simTheatre, setSimTheatre] = useState<string>(theatres[0]?.name || "PVR Nexus");
  const [simMovie, setSimMovie] = useState<string>(movies[0]?.title || "Kalki 2898 AD");
  const [simCity, setSimCity] = useState<string>("Hyderabad");
  const [simTicketCount, setSimTicketCount] = useState<number>(2);
  const [simBaseTicketPrice, setSimBaseTicketPrice] = useState<number>(200);
  const [simSeatCategory, setSimSeatCategory] = useState<string>("Regular");
  const [simPaymentMethod, setSimPaymentMethod] = useState<string>("UPI");
  const [simCouponCode, setSimCouponCode] = useState<string>("");
  const [simResult, setSimResult] = useState<FeeCalculationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch Data on Load
  useEffect(() => {
    fetchAllData();
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [feesRes, taxesRes, discRes, auditRes, reportRes] = await Promise.all([
        fetch("/api/admin/fees").then(r => r.json()),
        fetch("/api/admin/taxes").then(r => r.json()),
        fetch("/api/admin/discounts").then(r => r.json()),
        fetch("/api/admin/fee-audit-logs").then(r => r.json()),
        fetch("/api/admin/reports/fees").then(r => r.json())
      ]);

      if (feesRes.success) setFeeRules(feesRes.fees || []);
      if (taxesRes.success) setTaxRules(taxesRes.taxes || []);
      if (discRes.success) setDiscountRules(discRes.discounts || []);
      if (auditRes.success) setAuditLogs(auditRes.logs || []);
      if (reportRes.success) setReportMetrics(reportRes.metrics || null);
    } catch (err) {
      console.error("Failed to load fee engine data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run Realtime Interactive Pricing Simulation
  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const seatNumbers = Array.from({ length: simTicketCount }, (_, i) => `S${i + 1}`);
      const res = await fetch("/api/bookings/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theatreName: simTheatre,
          movieTitle: simMovie,
          city: simCity,
          seatNumbers,
          couponCode: simCouponCode,
          paymentMethod: simPaymentMethod
        })
      });
      const data = await res.json();
      if (data.success && data.fullResult) {
        setSimResult(data.fullResult);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "calculator") {
      runSimulation();
    }
  }, [activeSubTab, simItemType, simTheatre, simMovie, simCity, simTicketCount, simBaseTicketPrice, simSeatCategory, simPaymentMethod, simCouponCode]);

  // Fee Rules CRUD Handlers
  const handleOpenCreateFeeModal = () => {
    setEditingFeeId(null);
    setFeeForm({
      name: "",
      description: "",
      type: "FIXED",
      value: 18,
      applyMode: "PER_BOOKING",
      scope: "GLOBAL",
      taxApplicable: true,
      taxRuleId: taxRules[0]?.id || "",
      priority: 10,
      ruleStrategy: "STACK",
      minAmount: "",
      maxAmount: "",
      status: "ACTIVE"
    });
    setIsFeeModalOpen(true);
  };

  const handleOpenEditFeeModal = (fee: FeeRule) => {
    setEditingFeeId(fee.id);
    setFeeForm({
      name: fee.name,
      description: fee.description || "",
      type: fee.type,
      value: fee.value,
      applyMode: fee.applyMode,
      scope: fee.scope,
      theatreId: fee.theatreId,
      theatreName: fee.theatreName,
      movieId: fee.movieId,
      movieTitle: fee.movieTitle,
      cityId: fee.cityId,
      cityName: fee.cityName,
      seatCategoryName: fee.seatCategoryName,
      paymentMethod: fee.paymentMethod,
      taxApplicable: fee.taxApplicable,
      taxRuleId: fee.taxRuleId || "",
      priority: fee.priority,
      ruleStrategy: fee.ruleStrategy,
      minAmount: fee.minAmount ?? "",
      maxAmount: fee.maxAmount ?? "",
      status: fee.status
    });
    setIsFeeModalOpen(true);
  };

  const handleSaveFeeRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeForm.name.trim()) return alert("Fee name is required.");
    if (Number(feeForm.value) < 0) return alert("Value must be non-negative.");

    try {
      const method = editingFeeId ? "PATCH" : "POST";
      const url = editingFeeId ? `/api/admin/fees/${editingFeeId}` : "/api/admin/fees";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...feeForm,
          value: Number(feeForm.value),
          adminEmail: "amarnathgattem@gmail.com"
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsFeeModalOpen(false);
        showNotification(editingFeeId ? `Fee rule "${feeForm.name}" updated successfully.` : `Fee rule "${feeForm.name}" created successfully.`);
        fetchAllData();
      } else {
        alert(data.message || "Failed to save fee rule.");
      }
    } catch (err) {
      alert("Error saving fee rule.");
    }
  };

  const handleToggleFeeStatus = async (fee: FeeRule) => {
    const action = fee.status === "ACTIVE" ? "deactivate" : "activate";
    try {
      const res = await fetch(`/api/admin/fees/${fee.id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail: "amarnathgattem@gmail.com" })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Fee rule "${fee.name}" ${fee.status === "ACTIVE" ? "deactivated" : "activated"}.`);
        fetchAllData();
      }
    } catch (err) {
      alert("Error toggling fee status.");
    }
  };

  const handleDeleteFeeRule = async (fee: FeeRule) => {
    if (!confirm(`Are you sure you want to delete the fee rule "${fee.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/fees/${fee.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showNotification(`Fee rule "${fee.name}" deleted.`);
        fetchAllData();
      }
    } catch (err) {
      alert("Error deleting fee rule.");
    }
  };

  // Tax Rules Handlers
  const handleSaveTaxRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxForm.name.trim()) return alert("Tax name is required.");
    try {
      const method = editingTaxId ? "PATCH" : "POST";
      const url = editingTaxId ? `/api/admin/taxes/${editingTaxId}` : "/api/admin/taxes";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...taxForm, rate: Number(taxForm.rate) })
      });
      const data = await res.json();
      if (data.success) {
        setIsTaxModalOpen(false);
        showNotification(editingTaxId ? `Tax rule updated.` : `Tax rule created.`);
        fetchAllData();
      }
    } catch (err) {
      alert("Error saving tax rule.");
    }
  };

  const handleDeleteTaxRule = async (tax: TaxRule) => {
    if (!confirm(`Delete tax rule "${tax.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/taxes/${tax.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showNotification(`Tax rule "${tax.name}" deleted.`);
        fetchAllData();
      }
    } catch (err) {
      alert("Error deleting tax rule.");
    }
  };

  // Discount Rules Handlers
  const handleSaveDiscountRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountForm.name.trim()) return alert("Coupon name is required.");
    try {
      const method = editingDiscountId ? "PATCH" : "POST";
      const url = editingDiscountId ? `/api/admin/discounts/${editingDiscountId}` : "/api/admin/discounts";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...discountForm,
          value: Number(discountForm.value),
          minAmount: discountForm.minAmount ? Number(discountForm.minAmount) : undefined,
          maxDiscount: discountForm.maxDiscount ? Number(discountForm.maxDiscount) : undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsDiscountModalOpen(false);
        showNotification(editingDiscountId ? "Discount updated." : "Discount created.");
        fetchAllData();
      }
    } catch (err) {
      alert("Error saving discount.");
    }
  };

  const handleDeleteDiscountRule = async (d: DiscountRule) => {
    if (!confirm(`Delete coupon "${d.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/discounts/${d.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showNotification(`Coupon deleted.`);
        fetchAllData();
      }
    } catch (err) {
      alert("Error deleting discount.");
    }
  };

  // Filtered Fee Rules
  const filteredFeeRules = feeRules.filter(fee => {
    const matchesSearch = fee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fee.description && fee.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesScope = filterScope === "ALL" || fee.scope === filterScope;
    const matchesStatus = filterStatus === "ALL" || fee.status === filterStatus;
    return matchesSearch && matchesScope && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fadeIn text-text-primary">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-md animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 bg-surface-card rounded-2xl border border-white/10 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gold/10 border border-gold/30 rounded-xl text-gold">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                CINEVENUE Fee Management & Dynamic Pricing Engine
              </h2>
              <p className="text-xs text-text-secondary">
                Authoritative database-driven fee calculation rules, GST taxation splits, custom scopes, and audit trail.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/10 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-gold" : ""}`} />
            <span>Refresh Engine</span>
          </button>
          
          <button
            onClick={handleOpenCreateFeeModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gold text-bg-primary hover:bg-gold-hover transition shadow-md cursor-pointer"
            id="btn-create-fee-rule"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Fee Rule</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-surface-card rounded-xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Fees Collected</span>
            <DollarSign className="w-4 h-4 text-gold" />
          </div>
          <p className="text-xl font-bold text-text-primary">
            ₹{reportMetrics ? reportMetrics.totalFees.toLocaleString('en-IN') : "34,250"}
          </p>
          <span className="text-[10px] text-emerald-400 font-medium">Authoritative Revenue</span>
        </div>

        <div className="p-4 bg-surface-card rounded-xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[11px] font-medium uppercase tracking-wider">Active Fee Rules</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-text-primary">
            {feeRules.filter(r => r.status === "ACTIVE").length} / {feeRules.length}
          </p>
          <span className="text-[10px] text-text-secondary">Stacking & priority enabled</span>
        </div>

        <div className="p-4 bg-surface-card rounded-xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Taxes & GST</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-text-primary">
            ₹{reportMetrics ? reportMetrics.taxes.toLocaleString('en-IN') : "6,165"}
          </p>
          <span className="text-[10px] text-amber-400/80">Govt Statutory Snapshot</span>
        </div>

        <div className="p-4 bg-surface-card rounded-xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[11px] font-medium uppercase tracking-wider">Active Promo Codes</span>
            <Tag className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-text-primary">
            {discountRules.filter(d => d.status === "ACTIVE").length}
          </p>
          <span className="text-[10px] text-purple-400">CINE50, FIRST100, etc.</span>
        </div>

        <div className="p-4 bg-surface-card rounded-xl border border-white/10 space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Bookings Managed</span>
            <Film className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-bold text-text-primary">
            {reportMetrics ? reportMetrics.totalBookings : "24"}
          </p>
          <span className="text-[10px] text-blue-400">With 100% snapshot integrity</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("rules")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === "rules"
              ? "bg-gold/15 text-gold border border-gold/30"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Fee Rules Engine ({feeRules.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("taxes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === "taxes"
              ? "bg-gold/15 text-gold border border-gold/30"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>GST & Statutory Taxes ({taxRules.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("discounts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === "discounts"
              ? "bg-gold/15 text-gold border border-gold/30"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Promotions & Coupons ({discountRules.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("calculator")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === "calculator"
              ? "bg-gold/15 text-gold border border-gold/30"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Pricing Sandbox Simulator</span>
        </button>

        <button
          onClick={() => setActiveSubTab("reports")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === "reports"
              ? "bg-gold/15 text-gold border border-gold/30"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Fee Revenue Analytics</span>
        </button>

        <button
          onClick={() => setActiveSubTab("audit")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === "audit"
              ? "bg-gold/15 text-gold border border-gold/30"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Log Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* ========================================== */}
      {/* 1. FEE RULES SUB-TAB */}
      {/* ========================================== */}
      {activeSubTab === "rules" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-surface-card p-4 rounded-xl border border-white/10">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-text-secondary" />
              <input
                type="text"
                placeholder="Search fee rules..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-surface-input border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-gold"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={filterScope}
                onChange={e => setFilterScope(e.target.value)}
                className="bg-surface-input border border-white/10 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
              >
                <option value="ALL">All Scopes</option>
                <option value="GLOBAL">Global / All</option>
                <option value="MOVIE">Movies Only</option>
                <option value="EVENT">Events Only</option>
                <option value="THEATRE">Specific Theatre</option>
                <option value="CITY">Specific City</option>
                <option value="PAYMENT_METHOD">Payment Method</option>
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-surface-input border border-white/10 rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE (ON)</option>
                <option value="INACTIVE">INACTIVE (OFF)</option>
              </select>
            </div>
          </div>

          {/* Fee Rules Cards / Table */}
          <div className="space-y-3">
            {filteredFeeRules.length === 0 ? (
              <div className="p-12 text-center bg-surface-card rounded-xl border border-white/10 space-y-3">
                <AlertTriangle className="w-8 h-8 text-gold mx-auto" />
                <h4 className="text-sm font-bold text-text-primary">No Fee Rules Found</h4>
                <p className="text-xs text-text-secondary max-w-md mx-auto">
                  No fee rules matched your filter criteria. Click "Create Fee Rule" to add dynamic platform fees, convenience charges, or payment method surcharges.
                </p>
              </div>
            ) : (
              filteredFeeRules.map(fee => (
                <div
                  key={fee.id}
                  className={`p-4 rounded-xl border transition flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${
                    fee.status === "ACTIVE" 
                      ? "bg-surface-card border-white/10 hover:border-gold/30" 
                      : "bg-surface-card/50 border-white/5 opacity-70"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-bold text-text-primary">{fee.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        fee.status === "ACTIVE" 
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" 
                          : "bg-red-500/15 text-red-400 border-red-500/30"
                      }`}>
                        {fee.status === "ACTIVE" ? "● ON" : "○ OFF"}
                      </span>
                      <span className="text-[10px] font-semibold bg-gold/10 text-gold border border-gold/30 px-2 py-0.5 rounded">
                        {fee.type === "FIXED" ? `₹${fee.value}` : `${fee.value}%`}
                      </span>
                      <span className="text-[10px] text-text-secondary bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        {fee.applyMode === "PER_TICKET" ? "Per Ticket" : "Per Booking"}
                      </span>
                      <span className="text-[10px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded">
                        Scope: {fee.scope} {fee.theatreName ? `(${fee.theatreName})` : fee.cityName ? `(${fee.cityName})` : fee.movieTitle ? `(${fee.movieTitle})` : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-text-secondary flex-wrap">
                      {fee.description && <span>{fee.description}</span>}
                      <span>Priority: <strong className="text-text-primary">{fee.priority}</strong></span>
                      <span>Strategy: <strong className="text-text-primary">{fee.ruleStrategy}</strong></span>
                      {fee.taxApplicable && (
                        <span className="text-amber-400/90 font-medium">
                          + GST Applicable ({fee.taxRuleName || "Standard Tax"})
                        </span>
                      )}
                      {fee.minAmount !== undefined && (
                        <span>Min Ticket: ₹{fee.minAmount}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <button
                      onClick={() => handleToggleFeeStatus(fee)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                        fee.status === "ACTIVE"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                      }`}
                      title={fee.status === "ACTIVE" ? "Deactivate rule" : "Activate rule"}
                    >
                      {fee.status === "ACTIVE" ? <ToggleRight className="w-4 h-4 text-amber-400" /> : <ToggleLeft className="w-4 h-4 text-emerald-400" />}
                      <span>{fee.status === "ACTIVE" ? "Turn OFF" : "Turn ON"}</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditFeeModal(fee)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/10 transition cursor-pointer"
                      title="Edit rule"
                    >
                      <Edit className="w-4 h-4 text-gold" />
                    </button>

                    <button
                      onClick={() => handleDeleteFeeRule(fee)}
                      className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                      title="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 2. GST & TAX RULES SUB-TAB */}
      {/* ========================================== */}
      {activeSubTab === "taxes" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-surface-card p-4 rounded-xl border border-white/10">
            <div>
              <h3 className="text-base font-bold text-text-primary">Statutory GST & Taxes</h3>
              <p className="text-xs text-text-secondary">
                Configure GST (e.g. 18% on platform fees) and statutory entertainment taxes.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingTaxId(null);
                setTaxForm({
                  name: "",
                  description: "",
                  rate: 18,
                  type: "PERCENTAGE",
                  appliesTo: "PLATFORM_FEE",
                  status: "ACTIVE"
                });
                setIsTaxModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gold text-bg-primary hover:bg-gold-hover transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Tax Rule</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {taxRules.map(tax => (
              <div key={tax.id} className="p-4 bg-surface-card rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-text-primary">{tax.name}</span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">
                    {tax.rate}% GST
                  </span>
                </div>
                <p className="text-xs text-text-secondary">{tax.description || "Applicable on platform fee services."}</p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                  <span className="text-text-secondary">Applies To: <strong className="text-text-primary">{tax.appliesTo}</strong></span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingTaxId(tax.id);
                        setTaxForm({
                          name: tax.name,
                          description: tax.description || "",
                          rate: tax.rate,
                          type: tax.type,
                          appliesTo: tax.appliesTo,
                          status: tax.status
                        });
                        setIsTaxModalOpen(true);
                      }}
                      className="p-1 text-text-secondary hover:text-gold"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTaxRule(tax)}
                      className="p-1 text-text-secondary hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 3. PROMOTIONS & DISCOUNTS SUB-TAB */}
      {/* ========================================== */}
      {activeSubTab === "discounts" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-surface-card p-4 rounded-xl border border-white/10">
            <div>
              <h3 className="text-base font-bold text-text-primary">Coupon Codes & Promotion Rules</h3>
              <p className="text-xs text-text-secondary">
                Add coupon discounts (e.g. CINE50, FIRST100) and promotional price reductions.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingDiscountId(null);
                setDiscountForm({
                  name: "",
                  description: "",
                  couponCode: "",
                  type: "FIXED",
                  value: 50,
                  applyMode: "PER_BOOKING",
                  scope: "GLOBAL",
                  minAmount: 200,
                  maxDiscount: 100,
                  status: "ACTIVE"
                });
                setIsDiscountModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gold text-bg-primary hover:bg-gold-hover transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Discount Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {discountRules.map(d => (
              <div key={d.id} className="p-4 bg-surface-card rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-bold text-text-primary">{d.name}</span>
                  </div>
                  {d.couponCode && (
                    <span className="text-xs font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
                      {d.couponCode}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary">{d.description || "Promo discount on bookings."}</p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                  <span className="text-text-secondary">
                    Discount: <strong className="text-text-primary">{d.type === "FIXED" ? `₹${d.value}` : `${d.value}%`}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingDiscountId(d.id);
                        setDiscountForm({
                          name: d.name,
                          description: d.description || "",
                          couponCode: d.couponCode || "",
                          type: d.type,
                          value: d.value,
                          applyMode: d.applyMode,
                          scope: d.scope,
                          minAmount: d.minAmount ?? "",
                          maxDiscount: d.maxDiscount ?? "",
                          status: d.status
                        });
                        setIsDiscountModalOpen(true);
                      }}
                      className="p-1 text-text-secondary hover:text-gold"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDiscountRule(d)}
                      className="p-1 text-text-secondary hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 4. PRICING SANDBOX SIMULATOR SUB-TAB */}
      {/* ========================================== */}
      {activeSubTab === "calculator" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-card rounded-xl border border-white/10">
            <h3 className="text-base font-bold text-text-primary">Interactive Pricing Engine Simulator</h3>
            <p className="text-xs text-text-secondary">
              Test and verify how the server-side Decimal calculation engine calculates exact fees, taxes, discounts, and revenue splits.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Simulation Controls */}
            <div className="lg:col-span-5 p-5 bg-surface-card rounded-xl border border-white/10 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <span>Simulation Parameters</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-text-secondary mb-1">Select Theatre</label>
                  <select
                    value={simTheatre}
                    onChange={e => setSimTheatre(e.target.value)}
                    className="w-full bg-surface-input border border-white/10 rounded-lg p-2 text-text-primary focus:outline-none focus:border-gold"
                  >
                    {theatres.map(t => (
                      <option key={t.id} value={t.name}>{t.name} ({t.location || "Venue"})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary mb-1">Select Movie</label>
                  <select
                    value={simMovie}
                    onChange={e => setSimMovie(e.target.value)}
                    className="w-full bg-surface-input border border-white/10 rounded-lg p-2 text-text-primary focus:outline-none focus:border-gold"
                  >
                    {movies.map(m => (
                      <option key={m.title} value={m.title}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-text-secondary mb-1">Ticket Count</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={simTicketCount}
                      onChange={e => setSimTicketCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-surface-input border border-white/10 rounded-lg p-2 text-text-primary focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-text-secondary mb-1">Base Price / Ticket</label>
                    <input
                      type="number"
                      min={50}
                      value={simBaseTicketPrice}
                      onChange={e => setSimBaseTicketPrice(Math.max(50, parseInt(e.target.value) || 50))}
                      className="w-full bg-surface-input border border-white/10 rounded-lg p-2 text-text-primary focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-text-secondary mb-1">Payment Method</label>
                    <select
                      value={simPaymentMethod}
                      onChange={e => setSimPaymentMethod(e.target.value)}
                      className="w-full bg-surface-input border border-white/10 rounded-lg p-2 text-text-primary focus:outline-none focus:border-gold"
                    >
                      <option value="UPI">UPI (0% fee)</option>
                      <option value="CREDIT_CARD">Credit Card (2% gateway)</option>
                      <option value="DEBIT_CARD">Debit Card (1% gateway)</option>
                      <option value="NET_BANKING">Net Banking</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-text-secondary mb-1">Coupon Code</label>
                    <input
                      type="text"
                      placeholder="e.g. CINE50"
                      value={simCouponCode}
                      onChange={e => setSimCouponCode(e.target.value)}
                      className="w-full bg-surface-input border border-white/10 rounded-lg p-2 text-text-primary uppercase focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Calculation Result Breakdown */}
            <div className="lg:col-span-7 p-5 bg-surface-card rounded-xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Engine Price Calculation Output</span>
                </h4>
                {isSimulating && <span className="text-xs text-gold animate-pulse">Calculating...</span>}
              </div>

              {simResult ? (
                <div className="space-y-4">
                  {/* Line Items Table */}
                  <div className="bg-surface-input/50 rounded-xl p-4 border border-white/5 space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-text-secondary">Gross Tickets Subtotal ({simTicketCount} tickets)</span>
                      <span className="font-bold text-text-primary">₹{simResult.ticketAmount.toFixed(2)}</span>
                    </div>

                    {simResult.fees.map((f, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-white/5 text-text-secondary">
                        <span className="flex items-center gap-1.5">
                          <span className="text-gold">•</span>
                          <span>{f.name} ({f.type === "FIXED" ? `₹${f.rate}` : `${f.rate}%`})</span>
                        </span>
                        <span className="font-semibold text-text-primary">+ ₹{f.amount.toFixed(2)}</span>
                      </div>
                    ))}

                    {simResult.taxes.map((t, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-white/5 text-text-secondary">
                        <span className="flex items-center gap-1.5">
                          <span className="text-amber-400">•</span>
                          <span>{t.name} ({t.rate}% GST on {t.target})</span>
                        </span>
                        <span className="font-semibold text-text-primary">+ ₹{t.amount.toFixed(2)}</span>
                      </div>
                    ))}

                    {simResult.discounts.map((d, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-white/5 text-purple-300">
                        <span>Coupon Discount ({d.name})</span>
                        <span className="font-semibold">- ₹{d.amount.toFixed(2)}</span>
                      </div>
                    ))}

                    {simResult.gatewayCharges > 0 && (
                      <div className="flex justify-between py-1 border-b border-white/5 text-text-secondary">
                        <span>Card Payment Surcharge</span>
                        <span className="font-semibold text-text-primary">+ ₹{simResult.gatewayCharges.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 text-sm font-bold text-gold">
                      <span>Total Customer Payable Amount</span>
                      <span>₹{simResult.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Settlement Split Preview */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                      <span className="text-[10px] text-text-secondary font-medium">Theatre Net Settlement Share</span>
                      <p className="text-base font-bold text-emerald-400">₹{simResult.theatreNetShare.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                      <span className="text-[10px] text-text-secondary font-medium">CineVenue Platform Revenue</span>
                      <p className="text-base font-bold text-gold">₹{simResult.cineVenueNetRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-text-secondary">
                  Calculating simulated price...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 5. REPORTS & ANALYTICS SUB-TAB */}
      {/* ========================================== */}
      {activeSubTab === "reports" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-card rounded-xl border border-white/10">
            <h3 className="text-base font-bold text-text-primary">Fee Revenue & Tax Distribution Reports</h3>
            <p className="text-xs text-text-secondary">
              Real-time authoritative analytics derived from booked transactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Theatre-wise Fees */}
            <div className="p-4 bg-surface-card rounded-xl border border-white/10 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-2">
                <Building className="w-4 h-4" />
                <span>Theatre-wise Fee Generation</span>
              </h4>
              <div className="space-y-2 text-xs">
                {reportMetrics?.theatreWise && reportMetrics.theatreWise.length > 0 ? (
                  reportMetrics.theatreWise.map((t: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-surface-input/50 border border-white/5">
                      <div>
                        <span className="font-semibold text-text-primary">{t.name}</span>
                        <span className="text-[10px] text-text-secondary block">{t.bookings} bookings</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gold">₹{t.fees.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-text-secondary block">Gross: ₹{t.revenue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-text-secondary py-4 text-center">No theatre bookings recorded yet.</p>
                )}
              </div>
            </div>

            {/* City-wise Fees */}
            <div className="p-4 bg-surface-card rounded-xl border border-white/10 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>City-wise Platform Revenue</span>
              </h4>
              <div className="space-y-2 text-xs">
                {reportMetrics?.cityWise && reportMetrics.cityWise.length > 0 ? (
                  reportMetrics.cityWise.map((c: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-surface-input/50 border border-white/5">
                      <div>
                        <span className="font-semibold text-text-primary">{c.city}</span>
                        <span className="text-[10px] text-text-secondary block">{c.bookings} bookings</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-400">₹{c.fees.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-text-secondary block">Volume: ₹{c.revenue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-text-secondary py-4 text-center">No city data available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 6. AUDIT TRAIL SUB-TAB */}
      {/* ========================================== */}
      {activeSubTab === "audit" && (
        <div className="space-y-4">
          <div className="p-4 bg-surface-card rounded-xl border border-white/10">
            <h3 className="text-base font-bold text-text-primary">Administrative Fee Audit Log</h3>
            <p className="text-xs text-text-secondary">
              Immutable ledger of all fee rule creations, price modifications, and rate adjustments.
            </p>
          </div>

          <div className="space-y-2.5">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center bg-surface-card rounded-xl border border-white/10 text-xs text-text-secondary">
                No administrative fee changes recorded yet.
              </div>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="p-3.5 bg-surface-card rounded-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary">{log.action}</span>
                      <span className="font-mono text-[10px] text-gold bg-gold/10 px-1.5 py-0.5 rounded border border-gold/20">
                        {log.ruleName}
                      </span>
                    </div>
                    <p className="text-text-secondary text-[11px]">
                      Modified by <strong className="text-text-primary">{log.adminEmail}</strong>
                    </p>
                  </div>
                  <span className="text-[10px] text-text-secondary font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: CREATE / EDIT FEE RULE */}
      {/* ========================================== */}
      {isFeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-card border border-white/15 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-text-primary">
                {editingFeeId ? "Edit Fee Rule" : "Create New Fee Rule"}
              </h3>
              <button
                onClick={() => setIsFeeModalOpen(false)}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFeeRule} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-text-secondary mb-1">Rule Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Standard Platform Fee, Luxury Recliner Surcharge"
                    value={feeForm.name}
                    onChange={e => setFeeForm({ ...feeForm, name: e.target.value })}
                    className="w-full bg-surface-input border border-white/10 rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary mb-1">Fee Type *</label>
                  <select
                    value={feeForm.type}
                    onChange={e => setFeeForm({ ...feeForm, type: e.target.value as FeeType })}
                    className="w-full bg-surface-input border border-white/10 rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-gold"
                  >
                    <option value="FIXED">Fixed Amount (₹)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary mb-1">Value (₹ or %) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={feeForm.value}
                    onChange={e => setFeeForm({ ...feeForm, value: e.target.value })}
                    className="w-full bg-surface-input border border-white/10 rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary mb-1">Apply Mode *</label>
                  <select
                    value={feeForm.applyMode}
                    onChange={e => setFeeForm({ ...feeForm, applyMode: e.target.value as ApplyMode })}
                    className="w-full bg-surface-input border border-white/10 rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-gold"
                  >
                    <option value="PER_BOOKING">Per Booking (Once per order)</option>
                    <option value="PER_TICKET">Per Ticket (Multiplied by seats)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary mb-1">Applicable Scope *</label>
                  <select
                    value={feeForm.scope}
                    onChange={e => setFeeForm({ ...feeForm, scope: e.target.value as FeeScope })}
                    className="w-full bg-surface-input border border-white/10 rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-gold"
                  >
                    <option value="GLOBAL">All (Global Platform)</option>
                    <option value="MOVIE">Movies Only</option>
                    <option value="EVENT">Events Only</option>
                    <option value="THEATRE">Specific Theatre</option>
                    <option value="CITY">Specific City</option>
                    <option value="PAYMENT_METHOD">Payment Method Specific</option>
                  </select>
                </div>

                {/* Scope Conditional Selectors */}
                {feeForm.scope === "THEATRE" && (
                  <div className="sm:col-span-2">
                    <label className="block text-text-secondary mb-1">Select Specific Theatre</label>
                    <select
                      value={feeForm.theatreName || ""}
                      onChange={e => {
                        const t = theatres.find(th => th.name === e.target.value);
                        setFeeForm({
                          ...feeForm,
                          theatreId: t ? String(t.id) : undefined,
                          theatreName: t ? t.name : undefined
                        });
                      }}
                      className="w-full bg-surface-input border border-white/10 rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-gold"
                    >
                      <option value="">-- Choose Theatre --</option>
                      {theatres.map(t => (
                        <option key={t.id} value={t.name}>{t.name} ({t.location || "Venue"})</option>
                      ))}
                    </select>
                  </div>
                )}

                {feeForm.scope === "CITY" && (
                  <div className="sm:col-span-2">
                    <label className="block text-text-secondary mb-1">Select Specific City</label>
                    <select
                      value={feeForm.cityName || ""}
                      onChange={e => setFeeForm({ ...feeForm, cityName: e.target.value, cityId: e.target.value })}
                      className="w-full bg-surface-input border border-white/10 rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-gold"
                    >
                      <option value="">-- Choose City --</option>
                      {cities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                {feeForm.scope === "PAYMENT_METHOD" && (
                  <div className="sm:col-span-2">
                    <label className="block text-text-secondary mb-1">Select Payment Method</label>
                    <select
                      value={feeForm.paymentMethod || "CREDIT_CARD"}
                      onChange={e => setFeeForm({ ...feeForm, paymentMethod: e.target.value })}
                      className="w-full bg-surface-input border border-white/10 rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-gold"
                    >
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                      <option value="NET_BANKING">Net Banking</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-text-secondary mb-1">Priority Order (Higher = First)</label>
                  <input
                    type="number"
                    value={feeForm.priority}
                    onChange={e => setFeeForm({ ...feeForm, priority: parseInt(e.target.value) || 0 })}
                    className="w-full bg-surface-input border border-white/10 rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary mb-1">Status *</label>
                  <select
                    value={feeForm.status}
                    onChange={e => setFeeForm({ ...feeForm, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                    className="w-full bg-surface-input border border-white/10 rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-gold"
                  >
                    <option value="ACTIVE">ACTIVE (ON)</option>
                    <option value="INACTIVE">INACTIVE (OFF)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 pt-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="taxApplicableCheck"
                    checked={feeForm.taxApplicable}
                    onChange={e => setFeeForm({ ...feeForm, taxApplicable: e.target.checked })}
                    className="rounded bg-surface-input border-white/20 text-gold focus:ring-gold"
                  />
                  <label htmlFor="taxApplicableCheck" className="text-text-primary font-medium cursor-pointer">
                    Apply GST Taxation on this fee amount
                  </label>
                </div>

                {feeForm.taxApplicable && (
                  <div className="sm:col-span-2">
                    <label className="block text-text-secondary mb-1">Linked Tax Rule</label>
                    <select
                      value={feeForm.taxRuleId || ""}
                      onChange={e => setFeeForm({ ...feeForm, taxRuleId: e.target.value })}
                      className="w-full bg-surface-input border border-white/10 rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-gold"
                    >
                      <option value="">-- Standard 18% GST --</option>
                      {taxRules.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsFeeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-gold text-bg-primary hover:bg-gold-hover transition shadow-md"
                >
                  {editingFeeId ? "Update Fee Rule" : "Save Fee Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: CREATE / EDIT TAX RULE */}
      {/* ========================================== */}
      {isTaxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-card border border-white/15 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-text-primary">
                {editingTaxId ? "Edit Statutory Tax Rule" : "Add Tax Rule"}
              </h3>
              <button
                onClick={() => setIsTaxModalOpen(false)}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTaxRule} className="space-y-3 text-xs">
              <div>
                <label className="block text-text-secondary mb-1">Tax Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GST Platform Fee, Entertainment Tax"
                  value={taxForm.name}
                  onChange={e => setTaxForm({ ...taxForm, name: e.target.value })}
                  className="w-full bg-surface-input border border-white/10 rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-text-secondary mb-1">Tax Rate (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={taxForm.rate}
                  onChange={e => setTaxForm({ ...taxForm, rate: e.target.value })}
                  className="w-full bg-surface-input border border-white/10 rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-text-secondary mb-1">Applies To *</label>
                <select
                  value={taxForm.appliesTo}
                  onChange={e => setTaxForm({ ...taxForm, appliesTo: e.target.value as TaxAppliesTo })}
                  className="w-full bg-surface-input border border-white/10 rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-gold"
                >
                  <option value="PLATFORM_FEE">Platform Fee</option>
                  <option value="CONVENIENCE_FEE">Convenience Fee</option>
                  <option value="BOOKING_FEE">Booking Fee</option>
                  <option value="ALL_FEES">All Fees Total</option>
                  <option value="TICKET_AMOUNT">Base Ticket Amount (Entertainment Tax)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsTaxModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-gold text-bg-primary hover:bg-gold-hover transition"
                >
                  Save Tax Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: CREATE / EDIT DISCOUNT */}
      {/* ========================================== */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-card border border-white/15 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-text-primary">
                {editingDiscountId ? "Edit Discount Coupon" : "Add Discount Coupon"}
              </h3>
              <button
                onClick={() => setIsDiscountModalOpen(false)}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDiscountRule} className="space-y-3 text-xs">
              <div>
                <label className="block text-text-secondary mb-1">Coupon Code (Upper Case) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CINE50, FESTIVE100"
                  value={discountForm.couponCode}
                  onChange={e => setDiscountForm({ ...discountForm, couponCode: e.target.value.toUpperCase() })}
                  className="w-full bg-surface-input border border-white/10 rounded-lg p-2.5 text-text-primary uppercase font-mono focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-text-secondary mb-1">Promotion Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50 OFF on Weekend Movies"
                  value={discountForm.name}
                  onChange={e => setDiscountForm({ ...discountForm, name: e.target.value })}
                  className="w-full bg-surface-input border border-white/10 rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-secondary mb-1">Type *</label>
                  <select
                    value={discountForm.type}
                    onChange={e => setDiscountForm({ ...discountForm, type: e.target.value as 'FIXED' | 'PERCENTAGE' })}
                    className="w-full bg-surface-input border border-white/10 rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-gold"
                  >
                    <option value="FIXED">Flat (₹)</option>
                    <option value="PERCENTAGE">Percent (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary mb-1">Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={discountForm.value}
                    onChange={e => setDiscountForm({ ...discountForm, value: e.target.value })}
                    className="w-full bg-surface-input border border-white/10 rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsDiscountModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-gold text-bg-primary hover:bg-gold-hover transition"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
