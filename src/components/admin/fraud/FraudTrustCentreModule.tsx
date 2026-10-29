import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  Ban,
  Lock,
  Unlock,
  Ticket,
  CreditCard,
  Film,
  Calendar,
  Sparkles,
  MessageSquare,
  Send,
  X,
  Sliders,
  AlertOctagon,
  HelpCircle,
  FileText
} from "lucide-react";
import {
  fraudTrustClientService,
  FraudAlert,
  FraudMetrics,
  UserReport,
  FraudRuleConfig,
  AlertCategory,
  AlertSeverity,
  InvestigationStatus
} from "../../../services/fraudTrustService";

export default function FraudTrustCentreModule() {
  const [activeTab, setActiveTab] = useState<"alerts" | "reports" | "rules">("alerts");
  const [rangeFilter, setRangeFilter] = useState("ALL");
  const [metrics, setMetrics] = useState<FraudMetrics | null>(null);

  // Alerts State
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAlertsCount, setTotalAlertsCount] = useState(0);

  // User Reports State
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportFilter, setReportFilter] = useState("ALL");

  // Rules Config State
  const [config, setConfig] = useState<FraudRuleConfig | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);

  // Modal / Action states
  const [newNoteText, setNewNoteText] = useState("");
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [resolutionReason, setResolutionReason] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load metrics & alerts
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [metricsData, alertsData] = await Promise.all([
        fraudTrustClientService.getMetrics(rangeFilter),
        fraudTrustClientService.getAlerts({
          category: categoryFilter,
          severity: severityFilter,
          status: statusFilter,
          search: searchTerm,
          page,
          limit: 10
        })
      ]);
      setMetrics(metricsData);
      setAlerts(alertsData.alerts);
      setTotalPages(alertsData.pagination.totalPages);
      setTotalAlertsCount(alertsData.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
      setLoadingAlerts(false);
    }
  };

  // Load reports
  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const data = await fraudTrustClientService.getReports({
        status: reportFilter,
        limit: 20
      });
      setReports(data.reports);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReports(false);
    }
  };

  // Load config
  const loadConfig = async () => {
    try {
      const data = await fraudTrustClientService.getConfig();
      setConfig(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter, severityFilter, statusFilter, rangeFilter, page]);

  useEffect(() => {
    if (activeTab === "reports") loadReports();
    if (activeTab === "rules") loadConfig();
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  // Status update
  const handleUpdateStatus = async (alertId: string, newStatus: InvestigationStatus, reason?: string) => {
    try {
      const updated = await fraudTrustClientService.updateAlertStatus(alertId, newStatus, reason);
      setSelectedAlert(updated);
      showToast(`Alert status updated to ${newStatus}`);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  // Assign investigator
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert || !assigneeEmail.trim()) return;
    try {
      const updated = await fraudTrustClientService.assignInvestigator(selectedAlert.id, assigneeEmail.trim());
      setSelectedAlert(updated);
      setAssigneeEmail("");
      showToast(`Assigned to ${assigneeEmail.trim()}`);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to assign");
    }
  };

  // Add internal note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert || !newNoteText.trim()) return;
    try {
      const updated = await fraudTrustClientService.addInternalNote(selectedAlert.id, newNoteText.trim());
      setSelectedAlert(updated);
      setNewNoteText("");
      showToast("Investigative note added");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to add note");
    }
  };

  // Toggle entity restriction
  const handleToggleRestriction = async (restrict: boolean) => {
    if (!selectedAlert) return;
    const confirmPrompt = window.confirm(
      restrict
        ? `Are you sure you want to temporarily restrict ${selectedAlert.relatedEntityType} (${selectedAlert.relatedEntityId})? This will suppress it from customer visibility.`
        : `Are you sure you want to restore and remove the restriction on ${selectedAlert.relatedEntityType}?`
    );
    if (!confirmPrompt) return;

    try {
      const reason = restrict ? "Administrative fraud restriction" : "Restriction lifted following review";
      const updated = await fraudTrustClientService.restrictEntity(selectedAlert.id, restrict, reason);
      setSelectedAlert(updated);
      showToast(restrict ? "Entity restricted" : "Entity restored");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to toggle restriction");
    }
  };

  // Save config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSavingConfig(true);
    try {
      const updated = await fraudTrustClientService.updateConfig(config);
      setConfig(updated);
      showToast("Fraud detection rules safely updated");
    } catch (err: any) {
      alert(err.message || "Failed to save configuration");
    } finally {
      setSavingConfig(false);
    }
  };

  // Severity color badge helper
  const getSeverityBadge = (sev: AlertSeverity) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "LOW":
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };

  // Status color badge helper
  const getStatusBadge = (status: InvestigationStatus) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      case "UNDER_REVIEW":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "ESCALATED":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "RESOLVED":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "FALSE_POSITIVE":
        return "bg-slate-500/15 text-slate-400 border-slate-500/30";
    }
  };

  // Category Icon helper
  const getCategoryIcon = (cat: AlertCategory) => {
    switch (cat) {
      case "TICKET":
        return <Ticket className="w-4 h-4 text-emerald-400" />;
      case "PAYMENT":
        return <CreditCard className="w-4 h-4 text-rose-400" />;
      case "LISTING":
        return <Film className="w-4 h-4 text-amber-400" />;
      case "BOOKING":
        return <Clock className="w-4 h-4 text-blue-400" />;
      case "ORGANIZER":
        return <UserCheck className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#D4AF37] text-black font-extrabold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121216] border border-white/10 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-lg shadow-[#D4AF37]/10">
            <ShieldAlert className="w-5 h-5 animate-pulse text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide flex items-center gap-2">
              Fraud & Trust Centre
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                CANONICAL SECURITY ENGINE
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Production detection, investigation and resolution for listings, ticket abuse, payment irregularities, and bookings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time range selector */}
          <select
            value={rangeFilter}
            onChange={(e) => setRangeFilter(e.target.value)}
            className="bg-[#18181D] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="ALL">All Time</option>
            <option value="24H">Last 24 Hours</option>
            <option value="7D">Last 7 Days</option>
            <option value="30D">Last 30 Days</option>
            <option value="90D">Last 90 Days</option>
          </select>

          {/* Export CSV */}
          <a
            href={fraudTrustClientService.getExportCsvUrl()}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Export CSV</span>
          </a>

          {/* Refresh */}
          <button
            onClick={() => loadData()}
            disabled={isRefreshing}
            className="p-2 bg-[#D4AF37] hover:bg-[#e6c148] text-black rounded-xl transition flex items-center justify-center cursor-pointer shadow-md shadow-[#D4AF37]/20"
            title="Refresh Real-Time Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 8 PRODUCTION KPI DASHBOARD CARDS (Calculated from real persisted records) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Card 1: Total Open Alerts */}
        <div className="bg-[#121216] border border-white/10 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Open</span>
          <p className="text-2xl font-black text-white mt-1">{metrics?.totalOpenAlerts ?? 0}</p>
          <span className="text-[9px] text-[#D4AF37] font-semibold mt-1">Requires review</span>
        </div>

        {/* Card 2: Critical Alerts */}
        <div className="bg-[#121216] border border-rose-500/30 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Critical Alerts</span>
          <p className="text-2xl font-black text-rose-400 mt-1">{metrics?.criticalAlerts ?? 0}</p>
          <span className="text-[9px] text-rose-300 font-semibold mt-1">Immediate action</span>
        </div>

        {/* Card 3: Suspicious Listings */}
        <div className="bg-[#121216] border border-white/10 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Listings</span>
          <p className="text-2xl font-black text-white mt-1">{metrics?.suspiciousListings ?? 0}</p>
          <span className="text-[9px] text-slate-400 font-semibold mt-1">Duplicate/price risk</span>
        </div>

        {/* Card 4: Suspicious Booking Patterns */}
        <div className="bg-[#121216] border border-white/10 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Booking Risk</span>
          <p className="text-2xl font-black text-white mt-1">{metrics?.suspiciousBookingPatterns ?? 0}</p>
          <span className="text-[9px] text-slate-400 font-semibold mt-1">Rapid fails / holds</span>
        </div>

        {/* Card 5: Payment Irregularities */}
        <div className="bg-[#121216] border border-white/10 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Payments</span>
          <p className="text-2xl font-black text-white mt-1">{metrics?.paymentIrregularities ?? 0}</p>
          <span className="text-[9px] text-slate-400 font-semibold mt-1">Amount mismatch</span>
        </div>

        {/* Card 6: Duplicate Ticket Scans */}
        <div className="bg-[#121216] border border-white/10 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Duplicate Scans</span>
          <p className="text-2xl font-black text-white mt-1">{metrics?.duplicateTicketScans ?? 0}</p>
          <span className="text-[9px] text-slate-400 font-semibold mt-1">QR re-scanned</span>
        </div>

        {/* Card 7: Under Investigation */}
        <div className="bg-[#121216] border border-white/10 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">Investigating</span>
          <p className="text-2xl font-black text-white mt-1">{metrics?.casesUnderInvestigation ?? 0}</p>
          <span className="text-[9px] text-slate-400 font-semibold mt-1">Assigned cases</span>
        </div>

        {/* Card 8: Resolved Cases */}
        <div className="bg-[#121216] border border-white/10 p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Resolved</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{metrics?.resolvedCases ?? 0}</p>
          <span className="text-[9px] text-slate-400 font-semibold mt-1">Closed & verified</span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("alerts")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "alerts"
              ? "bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20"
              : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Alerts Feed ({totalAlertsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "reports"
              ? "bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20"
              : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>User Reports & Complaints</span>
        </button>

        <button
          onClick={() => setActiveTab("rules")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "rules"
              ? "bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20"
              : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Rule Configuration</span>
        </button>
      </div>

      {/* TAB 1: ALERTS FEED */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-[#121216] border border-white/10 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by ID, rule, title, entity, or investigator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#18181D] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-[#18181D] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="ALL">All Categories</option>
                <option value="TICKET">Ticket & QR</option>
                <option value="PAYMENT">Payments</option>
                <option value="LISTING">Listings</option>
                <option value="BOOKING">Booking Patterns</option>
                <option value="ORGANIZER">Organizer Risk</option>
              </select>

              {/* Severity Filter */}
              <select
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-[#18181D] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-[#18181D] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ESCALATED">Escalated</option>
                <option value="RESOLVED">Resolved</option>
                <option value="FALSE_POSITIVE">False Positive</option>
              </select>
            </div>
          </div>

          {/* Alerts Table */}
          <div className="bg-[#121216] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#18181D] text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Alert</th>
                    <th className="py-3 px-4">Category & Rule</th>
                    <th className="py-3 px-4">Affected Entity</th>
                    <th className="py-3 px-4 text-center">Severity</th>
                    <th className="py-3 px-4 text-center">Risk Score</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Assigned To</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loadingAlerts ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#D4AF37] mb-2" />
                        <span>Loading real fraud alerts...</span>
                      </td>
                    </tr>
                  ) : alerts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <span className="font-bold text-sm block text-white">No Fraud Alerts Matching Filter</span>
                        <span className="text-xs text-slate-500">All transactions and listings in this view conform to security rules.</span>
                      </td>
                    </tr>
                  ) : (
                    alerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          <div className="flex items-center gap-1.5">
                            {getCategoryIcon(alert.category)}
                            <span>{alert.id}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-sans block font-normal">
                            {new Date(alert.createdAt).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white line-clamp-1">{alert.title}</p>
                          <span className="text-[10px] text-[#D4AF37] font-mono tracking-wide">{alert.detectionRule}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <span className="font-bold text-white block truncate max-w-[160px]">
                            {alert.relatedEntityTitle || alert.relatedEntityId}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-sans">
                            {alert.relatedEntityType} • {alert.relatedEntityId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getSeverityBadge(
                              alert.severity
                            )}`}
                          >
                            {alert.severity}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1 font-mono font-bold">
                            <span
                              className={
                                alert.riskScore >= 80
                                  ? "text-rose-400"
                                  : alert.riskScore >= 60
                                  ? "text-amber-400"
                                  : "text-emerald-400"
                              }
                            >
                              {alert.riskScore}
                            </span>
                            <span className="text-[10px] text-slate-500">/100</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(
                              alert.investigationStatus
                            )}`}
                          >
                            {alert.investigationStatus.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          {alert.assignedTo ? (
                            <span className="text-white truncate max-w-[120px] block">{alert.assignedTo}</span>
                          ) : (
                            <span className="text-slate-500 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedAlert(alert)}
                            className="px-3 py-1.5 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg font-bold text-xs cursor-pointer inline-flex items-center gap-1 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Investigate</span>
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
              <div className="p-4 bg-[#18181D] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Showing page {page} of {totalPages} ({totalAlertsCount} alerts)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white font-bold cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white font-bold cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USER REPORTS */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#121216] border border-white/10 p-4 rounded-xl">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
                Customer Trust & Safety Reports
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Community submissions regarding misleading listings, fake tickets, or unverified organizers.
              </p>
            </div>
            <select
              value={reportFilter}
              onChange={(e) => setReportFilter(e.target.value)}
              className="bg-[#18181D] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="ALL">All Reports</option>
              <option value="PENDING">Pending</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="ACTIONED">Actioned</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </div>

          <div className="bg-[#121216] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#18181D] text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Report ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Reporter</th>
                    <th className="py-3 px-4">Reported Target</th>
                    <th className="py-3 px-4">Reason & Evidence</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loadingReports ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#D4AF37] mb-2" />
                        <span>Loading user reports...</span>
                      </td>
                    </tr>
                  ) : reports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <span className="font-bold text-sm block text-white">No User Reports Found</span>
                      </td>
                    </tr>
                  ) : (
                    reports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">{rep.id}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#D4AF37]">{rep.category}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white block">{rep.reporterName || "Anonymous Patron"}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{rep.reporterEmail}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white block truncate max-w-[180px]">{rep.targetTitle}</span>
                          <span className="text-[10px] text-slate-400 uppercase">
                            {rep.targetType} • {rep.targetId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-white line-clamp-2">{rep.reason}</p>
                          {rep.evidenceText && (
                            <span className="text-[10px] text-slate-400 italic block mt-0.5 line-clamp-1">
                              Evidence: {rep.evidenceText}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                              rep.status === "ACTIONED"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : rep.status === "INVESTIGATING"
                                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                : rep.status === "DISMISSED"
                                ? "bg-slate-500/15 text-slate-400 border-slate-500/30"
                                : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                            }`}
                          >
                            {rep.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {rep.status !== "ACTIONED" && (
                            <button
                              onClick={async () => {
                                await fraudTrustClientService.updateReportStatus(rep.id, "ACTIONED");
                                showToast(`Report ${rep.id} marked ACTIONED`);
                                loadReports();
                              }}
                              className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Action
                            </button>
                          )}
                          {rep.status !== "DISMISSED" && (
                            <button
                              onClick={async () => {
                                await fraudTrustClientService.updateReportStatus(rep.id, "DISMISSED");
                                showToast(`Report ${rep.id} marked DISMISSED`);
                                loadReports();
                              }}
                              className="px-2.5 py-1 bg-white/5 text-slate-400 hover:bg-white/10 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Dismiss
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RULE CONFIGURATION */}
      {activeTab === "rules" && config && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="bg-[#121216] border border-white/10 p-5 rounded-2xl shadow-xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#D4AF37]" />
                Fraud Detection Thresholds & Risk Weights
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure server-side anomaly thresholds. Changes are audited with administrative attribution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Max Booking Attempts */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Max Booking Attempts (Window)
                </label>
                <input
                  type="number"
                  min={2}
                  max={50}
                  value={config.maxBookingAttemptsPerWindow}
                  onChange={(e) => setConfig({ ...config, maxBookingAttemptsPerWindow: Number(e.target.value) })}
                  className="w-full bg-[#18181D] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <span className="text-[10px] text-slate-500 block">Default: 5 attempts per rate-limiting window</span>
              </div>

              {/* Booking Attempt Window (Minutes) */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Booking Window (Minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={config.bookingAttemptWindowMinutes}
                  onChange={(e) => setConfig({ ...config, bookingAttemptWindowMinutes: Number(e.target.value) })}
                  className="w-full bg-[#18181D] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <span className="text-[10px] text-slate-500 block">Default: 10 minutes sliding calculation window</span>
              </div>

              {/* Failed Booking Threshold */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Failed Booking Threshold
                </label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={config.failedBookingThreshold}
                  onChange={(e) => setConfig({ ...config, failedBookingThreshold: Number(e.target.value) })}
                  className="w-full bg-[#18181D] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <span className="text-[10px] text-slate-500 block">Triggers alert on N failed checkouts in window</span>
              </div>

              {/* Listing Similarity Threshold */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Listing Similarity Threshold (%)
                </label>
                <input
                  type="number"
                  min={50}
                  max={99}
                  value={config.listingSimilarityThreshold}
                  onChange={(e) => setConfig({ ...config, listingSimilarityThreshold: Number(e.target.value) })}
                  className="w-full bg-[#18181D] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <span className="text-[10px] text-slate-500 block">Flags proposals with &gt;= N% lexical match</span>
              </div>

              {/* Price Jump Percent Threshold */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Unusual Price Jump Threshold (%)
                </label>
                <input
                  type="number"
                  min={20}
                  max={200}
                  value={config.priceChangePercentThreshold}
                  onChange={(e) => setConfig({ ...config, priceChangePercentThreshold: Number(e.target.value) })}
                  className="w-full bg-[#18181D] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <span className="text-[10px] text-slate-500 block">Flags abrupt ticket tier price spikes</span>
              </div>

              {/* Duplicate Scan Window (Minutes) */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Duplicate Scan Window (Minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={config.duplicateScanWindowMinutes}
                  onChange={(e) => setConfig({ ...config, duplicateScanWindowMinutes: Number(e.target.value) })}
                  className="w-full bg-[#18181D] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <span className="text-[10px] text-slate-500 block">Time threshold distinguishing re-scans vs fraud</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Last modified by <span className="text-white font-mono">{config.updatedBy || "System"}</span> on{" "}
                {new Date(config.updatedAt).toLocaleDateString()}
              </span>
              <button
                type="submit"
                disabled={savingConfig}
                className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#e6c148] disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md shadow-[#D4AF37]/20"
              >
                {savingConfig ? "Saving Rules..." : "Save Rule Configuration"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ALERT INVESTIGATION MODAL / DRAWER */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121216] border border-white/15 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#18181D]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  {getCategoryIcon(selectedAlert.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{selectedAlert.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getSeverityBadge(selectedAlert.severity)}`}>
                      {selectedAlert.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getStatusBadge(selectedAlert.investigationStatus)}`}>
                      {selectedAlert.investigationStatus.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedAlert.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Evidence & Risk Score Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-[#18181D] border border-white/10 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">Evidence Summary</span>
                  <p className="text-xs text-white leading-relaxed">{selectedAlert.evidenceSummary}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{selectedAlert.description}</p>
                </div>

                <div className="bg-[#18181D] border border-white/10 p-4 rounded-xl flex flex-col justify-between items-center text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Calculated Risk</span>
                  <div className="my-2">
                    <span
                      className={`text-4xl font-black font-mono ${
                        selectedAlert.riskScore >= 80 ? "text-rose-400" : selectedAlert.riskScore >= 60 ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {selectedAlert.riskScore}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">/100</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Rule: {selectedAlert.detectionRule}</span>
                </div>
              </div>

              {/* Entity Context & Restriction Controls */}
              <div className="bg-[#18181D] border border-white/10 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Affected Target</span>
                  <p className="text-sm font-bold text-white mt-0.5">{selectedAlert.relatedEntityTitle || selectedAlert.relatedEntityId}</p>
                  <span className="text-[11px] font-mono text-slate-400">
                    Type: {selectedAlert.relatedEntityType} • ID: {selectedAlert.relatedEntityId}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedAlert.isRestricted ? (
                    <button
                      onClick={() => handleToggleRestriction(false)}
                      className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-emerald-500/30 transition"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Lift Restriction</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleRestriction(true)}
                      className="px-3 py-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-rose-500/30 transition"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Temporarily Restrict</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Investigator Assignment */}
              <div className="bg-[#18181D] border border-white/10 p-4 rounded-xl space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Investigator</span>
                <form onSubmit={handleAssign} className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="Enter investigator staff email..."
                    value={assigneeEmail}
                    onChange={(e) => setAssigneeEmail(e.target.value)}
                    className="flex-1 bg-[#121216] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Assign
                  </button>
                </form>
                {selectedAlert.assignedTo && (
                  <p className="text-xs text-emerald-400 font-mono">Currently assigned to: {selectedAlert.assignedTo}</p>
                )}
              </div>

              {/* Internal Notes & Timeline */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white">Investigative Notes ({selectedAlert.internalNotes.length})</span>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {selectedAlert.internalNotes.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No notes added yet.</p>
                  ) : (
                    selectedAlert.internalNotes.map((n) => (
                      <div key={n.id} className="p-3 bg-[#18181D] border border-white/5 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>{n.author}</span>
                          <span>{new Date(n.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-white">{n.note}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddNote} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add an internal note or verified finding..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-1 bg-[#18181D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#D4AF37] hover:bg-[#e6c148] text-black font-extrabold rounded-xl text-xs cursor-pointer"
                  >
                    Add Note
                  </button>
                </form>
              </div>

              {/* Action History Audit Timeline */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Action History & Security Log</span>
                <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                  {selectedAlert.actionHistory.map((act) => (
                    <div key={act.id} className="flex items-center justify-between p-2 bg-[#18181D] rounded-lg">
                      <span>{act.action} {act.details ? `— ${act.details}` : ""}</span>
                      <span className="text-[10px] text-slate-500">{new Date(act.timestamp).toLocaleTimeString()} ({act.actor})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-5 border-t border-white/10 bg-[#18181D] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedAlert.id, "UNDER_REVIEW")}
                  className="px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Mark Under Review
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAlert.id, "ESCALATED")}
                  className="px-3 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Escalate
                </button>
                <button
                  onClick={() => {
                    const r = prompt("Enter resolution notes / rationale:");
                    if (r) handleUpdateStatus(selectedAlert.id, "RESOLVED", r);
                  }}
                  className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Resolve Alert
                </button>
                <button
                  onClick={() => {
                    const r = prompt("Enter false positive justification:");
                    if (r) handleUpdateStatus(selectedAlert.id, "FALSE_POSITIVE", r);
                  }}
                  className="px-3 py-1.5 bg-white/10 text-slate-300 hover:bg-white/15 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Mark False Positive
                </button>
              </div>

              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
