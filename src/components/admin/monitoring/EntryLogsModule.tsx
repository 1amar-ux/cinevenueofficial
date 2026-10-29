import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Laptop,
  Smartphone,
  Globe,
  FileSpreadsheet,
  Layers,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Copy,
  Check,
  Lock,
  Database,
  Calendar,
  Activity,
  UserCheck,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";
import {
  entryLogsService,
  AuditEntryLog,
  EntryLogsMetrics,
  EntryLogsFilterQuery
} from "../../../services/entryLogsService";

interface EntryLogsModuleProps {
  initialSubTab?: "entry_logs" | "admin_activity" | "security_alerts";
}

export default function EntryLogsModule({ initialSubTab = "entry_logs" }: EntryLogsModuleProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"entry_logs" | "admin_activity" | "security_alerts">(initialSubTab);

  // Data states
  const [logs, setLogs] = useState<AuditEntryLog[]>([]);
  const [metrics, setMetrics] = useState<EntryLogsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<"all" | "today" | "7days" | "30days">("all");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedModule, setSelectedModule] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");

  // Sorting
  const [sortBy, setSortBy] = useState<"timestamp" | "actorName" | "activity" | "status">("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal inspection state
  const [selectedLog, setSelectedLog] = useState<AuditEntryLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Map activeTab to logType filter
  const getLogTypeForTab = (tab: "entry_logs" | "admin_activity" | "security_alerts"): string | undefined => {
    if (tab === "entry_logs") return "AUTH";
    if (tab === "admin_activity") return "ADMIN_ACTIVITY";
    if (tab === "security_alerts") return "SECURITY_ALERT";
    return undefined;
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch metrics
      const metricsData = await entryLogsService.getMetrics(dateRange);
      setMetrics(metricsData);

      // 2. Compute date range cutoffs
      let startDate: string | undefined = undefined;
      const now = Date.now();
      if (dateRange === "today") startDate = new Date(now - 24 * 3600 * 1000).toISOString();
      else if (dateRange === "7days") startDate = new Date(now - 7 * 24 * 3600 * 1000).toISOString();
      else if (dateRange === "30days") startDate = new Date(now - 30 * 24 * 3600 * 1000).toISOString();

      // 3. Fetch paginated logs
      const filterQuery: EntryLogsFilterQuery = {
        search: searchTerm.trim() || undefined,
        startDate,
        logType: getLogTypeForTab(activeTab),
        role: selectedRole !== "ALL" ? selectedRole : undefined,
        module: selectedModule !== "ALL" ? selectedModule : undefined,
        status: selectedStatus !== "ALL" ? selectedStatus : undefined,
        severity: selectedSeverity !== "ALL" ? selectedSeverity : undefined,
        page,
        limit,
        sortBy,
        sortOrder
      };

      const result = await entryLogsService.getLogs(filterQuery);
      setLogs(result.logs);
      setTotalRecords(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load entry logs.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, dateRange, searchTerm, selectedRole, selectedModule, selectedStatus, selectedSeverity, page, limit, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      let startDate: string | undefined = undefined;
      const now = Date.now();
      if (dateRange === "today") startDate = new Date(now - 24 * 3600 * 1000).toISOString();
      else if (dateRange === "7days") startDate = new Date(now - 7 * 24 * 3600 * 1000).toISOString();
      else if (dateRange === "30days") startDate = new Date(now - 30 * 24 * 3600 * 1000).toISOString();

      const filterQuery: EntryLogsFilterQuery = {
        search: searchTerm.trim() || undefined,
        startDate,
        logType: getLogTypeForTab(activeTab),
        role: selectedRole !== "ALL" ? selectedRole : undefined,
        module: selectedModule !== "ALL" ? selectedModule : undefined,
        status: selectedStatus !== "ALL" ? selectedStatus : undefined,
        severity: selectedSeverity !== "ALL" ? selectedSeverity : undefined
      };

      const blob = await entryLogsService.exportLogsCsv(filterQuery);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `cinevenue_${activeTab}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRole("ALL");
    setSelectedModule("ALL");
    setSelectedStatus("ALL");
    setSelectedSeverity("ALL");
    setDateRange("all");
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            SUCCESS
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            FAILED
          </span>
        );
      case "BLOCKED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-3 h-3" />
            BLOCKED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/70">
            {status}
          </span>
        );
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-red-600/20 text-red-400 border border-red-500/30">
            CRITICAL
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            WARNING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono text-white/50 border border-white/5">
            INFO
          </span>
        );
    }
  };

  const getRoleBadgeColor = (role: string) => {
    if (role === "SUPER_ADMIN") return "bg-gold/15 text-gold border-gold/30";
    if (role === "ADMIN" || role.includes("MANAGER")) return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    if (role === "THEATRE_ADMIN") return "bg-purple-500/15 text-purple-400 border-purple-500/30";
    if (role === "EVENT_ORGANIZER") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    return "bg-white/5 text-white/60 border-white/10";
  };

  return (
    <div className="space-y-6 text-white text-left font-sans animate-fade-in">
      {/* 1. Header Bar */}
      <div className="bg-[#121216] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shadow-lg shadow-gold/10">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-wide">
                Entry Logs & Admin Activity Audit Trail
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                AUTHORITATIVE • APPEND-ONLY
              </span>
            </div>
            <p className="text-xs text-white/50">
              Complete forensic telemetry of authentication events, user entries, before-and-after change histories & security flags.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5">
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "24h" },
              { id: "7days", label: "7 Days" },
              { id: "30days", label: "30 Days" }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => {
                  setDateRange(r.id as any);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  dateRange === r.id
                    ? "bg-gold text-black shadow-md font-bold"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            title="Export filtered records to RFC4180 CSV"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? "animate-bounce text-gold" : "text-white/70"}`} />
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs transition-all cursor-pointer"
            title="Refresh logs from database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-gold" : "text-white/70"}`} />
          </button>
        </div>
      </div>

      {/* 2. Primary Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {[
          {
            id: "entry_logs",
            label: "Entry Logs (Login & Access)",
            icon: LogInIcon,
            description: "Who logged in, when, from which device, and outcome"
          },
          {
            id: "admin_activity",
            label: "Admin Activity Logs",
            icon: Activity,
            description: "Who changed data, what changed, before & after values"
          },
          {
            id: "security_alerts",
            label: "Security Alerts & Anomaly Matrix",
            icon: ShieldAlert,
            badge: metrics?.securityAlerts || 0,
            description: "Repeated failed logins, permission escalations, unauthorized access"
          }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setPage(1);
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isActive
                  ? "bg-gold text-black border-gold shadow-lg shadow-gold/20"
                  : "bg-white/5 text-white/70 border-white/5 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? "bg-black text-gold" : "bg-red-500 text-white"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Dashboard KPI Metric Cards (Real Recorded Events) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Login Events */}
        <div className="bg-[#121216] border border-white/10 p-4 rounded-xl space-y-1.5 hover:border-gold/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Total Logins</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-mono font-bold text-white">
            {metrics ? metrics.totalLoginEvents.toLocaleString() : "..."}
          </div>
          <p className="text-[10px] text-white/40 truncate">
            {metrics?.periodLabel || "During selected period"}
          </p>
        </div>

        {/* Successful Logins */}
        <div className="bg-[#121216] border border-white/10 p-4 rounded-xl space-y-1.5 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Success</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-bold text-emerald-400">
            {metrics ? metrics.successfulLogins.toLocaleString() : "..."}
          </div>
          <p className="text-[10px] text-emerald-400/60 truncate">
            {metrics && metrics.totalLoginEvents > 0
              ? `${Math.round((metrics.successfulLogins / metrics.totalLoginEvents) * 100)}% authentication rate`
              : "0% rate"}
          </p>
        </div>

        {/* Failed Logins */}
        <div className="bg-[#121216] border border-white/10 p-4 rounded-xl space-y-1.5 hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Failed</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-mono font-bold text-rose-400">
            {metrics ? metrics.failedLogins.toLocaleString() : "..."}
          </div>
          <p className="text-[10px] text-rose-400/60 truncate">
            Bad password / locked
          </p>
        </div>

        {/* Active Sessions */}
        <div className="bg-[#121216] border border-white/10 p-4 rounded-xl space-y-1.5 hover:border-gold/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Active Sessions</span>
            <Laptop className="w-4 h-4 text-gold" />
          </div>
          <div className="text-xl font-mono font-bold text-gold">
            {metrics ? metrics.activeSessions.toLocaleString() : "..."}
          </div>
          <p className="text-[10px] text-gold/60 truncate">
            Valid unexpired sessions
          </p>
        </div>

        {/* Unique Accounts */}
        <div className="bg-[#121216] border border-white/10 p-4 rounded-xl space-y-1.5 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Unique Users</span>
            <UserCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-mono font-bold text-purple-400">
            {metrics ? metrics.uniqueUsers.toLocaleString() : "..."}
          </div>
          <p className="text-[10px] text-purple-400/60 truncate">
            Distinct active accounts
          </p>
        </div>

        {/* Security Alerts */}
        <div className="bg-[#121216] border border-white/10 p-4 rounded-xl space-y-1.5 hover:border-red-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Security Alerts</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl font-mono font-bold text-red-500">
            {metrics ? metrics.securityAlerts.toLocaleString() : "..."}
          </div>
          <p className="text-[10px] text-red-400/60 truncate">
            Requiring review
          </p>
        </div>
      </div>

      {/* 4. Search & Multi-Factor Filters Bar */}
      <div className="bg-[#121216] border border-white/10 rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search by Event ID, User Name, Email, IP Address, Activity..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white/5 border border-white/10 focus:border-gold pl-10 pr-4 py-2 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="min-w-[140px]">
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#1A1A22] border border-white/10 focus:border-gold px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin Staff</option>
              <option value="THEATRE_ADMIN">Theatre Owner</option>
              <option value="THEATRE_MANAGER">Theatre Manager</option>
              <option value="EVENT_ORGANIZER">Event Organizer</option>
              <option value="CUSTOMER">Customer</option>
              <option value="ANONYMOUS">Anonymous / Guest</option>
            </select>
          </div>

          {/* Module Filter */}
          <div className="min-w-[140px]">
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#1A1A22] border border-white/10 focus:border-gold px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
            >
              <option value="ALL">All Modules</option>
              <option value="AUTH">Authentication</option>
              <option value="USERS">User Management</option>
              <option value="THEATRES">Theatres</option>
              <option value="MOVIES">Movies</option>
              <option value="EVENTS">Events</option>
              <option value="BOOKINGS">Bookings</option>
              <option value="PAYMENTS">Payments & Refunds</option>
              <option value="SETTINGS">Platform Settings</option>
              <option value="EMPLOYEES">Employee Access</option>
              <option value="SECURITY">Security</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="min-w-[120px]">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#1A1A22] border border-white/10 focus:border-gold px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="min-w-[120px]">
            <select
              value={selectedSeverity}
              onChange={(e) => {
                setSelectedSeverity(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#1A1A22] border border-white/10 focus:border-gold px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
            >
              <option value="ALL">All Severity</option>
              <option value="INFO">Info</option>
              <option value="WARNING">Warning</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedRole !== "ALL" || selectedModule !== "ALL" || selectedStatus !== "ALL" || selectedSeverity !== "ALL" || dateRange !== "all") && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 5. Error Notifier */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-xs text-rose-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={loadData} className="underline hover:text-white font-bold cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* 6. Authoritative Entry Logs Table */}
      <div className="bg-[#121216] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-white/50 text-[10px] uppercase font-bold tracking-wider select-none">
                <th className="py-3.5 px-4">Event ID</th>
                <th
                  onClick={() => {
                    if (sortBy === "timestamp") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    else { setSortBy("timestamp"); setSortOrder("desc"); }
                  }}
                  className="py-3.5 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Date & Time (UTC)</span>
                    <ArrowUpDown className="w-3 h-3 text-gold" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortBy === "actorName") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    else { setSortBy("actorName"); setSortOrder("asc"); }
                  }}
                  className="py-3.5 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Actor / User</span>
                    <ArrowUpDown className="w-3 h-3 text-white/30" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Activity</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Device</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={11} className="py-4 px-4">
                      <div className="h-4 bg-white/5 rounded-lg w-full" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-white/40 space-y-2">
                    <ShieldCheck className="w-8 h-8 text-white/20 mx-auto" />
                    <p className="font-semibold text-sm">No audit logs matching your current filter.</p>
                    <p className="text-xs text-white/30">Try clearing your filters or selecting a wider date range.</p>
                    <button
                      onClick={resetFilters}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold border border-white/10 cursor-pointer mt-2"
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const dateObj = new Date(log.timestamp);
                  const formattedDate = dateObj.toLocaleDateString("en-IN", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric"
                  });
                  const formattedTime = dateObj.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true
                  });

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-white/[0.02] transition-colors group text-[11px]"
                    >
                      {/* Event ID */}
                      <td className="py-3 px-4 font-mono text-[10px] text-white/60">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[90px]">{log.id}</span>
                          <button
                            onClick={() => handleCopy(log.id, log.id)}
                            className="text-white/20 hover:text-gold transition-colors cursor-pointer"
                            title="Copy Event ID"
                          >
                            {copiedId === log.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-white">{formattedDate}</div>
                        <div className="text-[10px] font-mono text-white/40">{formattedTime} UTC</div>
                      </td>

                      {/* Actor / User */}
                      <td className="py-3 px-4 max-w-[180px]">
                        <div className="font-bold text-white truncate">
                          {log.actorName || "Anonymous"}
                        </div>
                        <div className="text-[10px] text-white/40 truncate font-mono">
                          {log.actorEmail || log.actorId || "Unauthenticated"}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${getRoleBadgeColor(log.actorRole)}`}>
                          {log.actorRole}
                        </span>
                      </td>

                      {/* Activity */}
                      <td className="py-3 px-4 font-medium text-white max-w-[180px]">
                        <div className="truncate font-semibold" title={log.activity}>
                          {log.activity}
                        </div>
                        <div className="text-[10px] text-white/40 truncate" title={log.details}>
                          {log.details}
                        </div>
                      </td>

                      {/* Module */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/70 font-mono text-[10px] border border-white/5">
                          {log.module}
                        </span>
                      </td>

                      {/* IP Address */}
                      <td className="py-3 px-4 font-mono text-[10px] text-white/60 whitespace-nowrap">
                        {log.ipAddress || "127.0.0.1"}
                      </td>

                      {/* Device */}
                      <td className="py-3 px-4 text-white/60 text-[10px] max-w-[130px] truncate" title={log.device || "Unknown"}>
                        {log.device || "Unknown"}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getStatusBadge(log.status)}
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getSeverityBadge(log.severity)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 bg-white/5 hover:bg-gold hover:text-black text-white/80 rounded-lg text-[10px] font-bold border border-white/10 transition-all cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 7. Pagination Bar */}
        <div className="p-4 border-t border-white/10 bg-white/[0.01] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-white/50">
            <span>Showing</span>
            <span className="font-bold text-white">
              {logs.length > 0 ? (page - 1) * limit + 1 : 0}
            </span>
            <span>to</span>
            <span className="font-bold text-white">
              {Math.min(page * limit, totalRecords)}
            </span>
            <span>of</span>
            <span className="font-bold text-gold">{totalRecords}</span>
            <span>records</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-white/50 text-xs">
              <span>Per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-[#1A1A22] border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1 || isLoading}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-mono font-bold text-xs text-white">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages || isLoading}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Event Detail Modal (With Before-and-After Change Inspector) */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121216] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Event Details & Forensic Metadata
                    {getStatusBadge(selectedLog.status)}
                  </h3>
                  <p className="text-[11px] font-mono text-white/50">
                    ID: {selectedLog.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Core Attributes Grid */}
              <div className="grid grid-cols-2 gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase block">Timestamp (UTC)</span>
                  <span className="font-mono text-white font-medium">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase block">Log Category</span>
                  <span className="font-mono text-gold font-bold">{selectedLog.logType}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase block">Actor Name</span>
                  <span className="text-white font-semibold">{selectedLog.actorName || "Unauthenticated"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase block">Actor Role</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border inline-block ${getRoleBadgeColor(selectedLog.actorRole)}`}>
                    {selectedLog.actorRole}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase block">Actor Email / Identifier</span>
                  <span className="font-mono text-white/70">{selectedLog.actorEmail || selectedLog.actorId || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase block">Source IP Address</span>
                  <span className="font-mono text-white/70">{selectedLog.ipAddress || "127.0.0.1"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase block">Module</span>
                  <span className="text-white font-medium">{selectedLog.module}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase block">Severity Classification</span>
                  {getSeverityBadge(selectedLog.severity)}
                </div>
              </div>

              {/* Action Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                  Action Performed & Safe Description
                </span>
                <div className="p-3 bg-black/40 border border-white/10 rounded-xl text-white/90 font-mono text-[11px] leading-relaxed">
                  {selectedLog.details}
                </div>
              </div>

              {/* Device & Client Metadata */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                  Client & User-Agent Information
                </span>
                <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1 font-mono text-[10px] text-white/60 break-all">
                  <div><strong className="text-white/80">Device:</strong> {selectedLog.device || "Unknown Client"}</div>
                  <div><strong className="text-white/80">User-Agent:</strong> {selectedLog.userAgent || "N/A"}</div>
                </div>
              </div>

              {/* BEFORE AND AFTER VALUE DIFF (For Sensitive Changes) */}
              {(selectedLog.beforeValue !== undefined || selectedLog.afterValue !== undefined) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Before & After State Modification Diff
                    </span>
                    <span className="text-[9px] font-mono text-white/40">AUDIT FORENSIC COMPARISON</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Previous State */}
                    <div className="bg-rose-950/20 border border-rose-500/30 p-3.5 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                        Previous Value (Before)
                      </span>
                      <pre className="text-[10px] font-mono text-rose-200/90 whitespace-pre-wrap bg-black/50 p-2.5 rounded-lg border border-rose-500/20 max-h-48 overflow-y-auto">
                        {selectedLog.beforeValue ? JSON.stringify(selectedLog.beforeValue, null, 2) : "None (New Creation)"}
                      </pre>
                    </div>

                    {/* New State */}
                    <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                        New Value (After)
                      </span>
                      <pre className="text-[10px] font-mono text-emerald-200/90 whitespace-pre-wrap bg-black/50 p-2.5 rounded-lg border border-emerald-500/20 max-h-48 overflow-y-auto">
                        {selectedLog.afterValue ? JSON.stringify(selectedLog.afterValue, null, 2) : "None (Deleted)"}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Resource Identifier */}
              {selectedLog.resourceId && (
                <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-white/50 font-medium">Affected Resource ({selectedLog.resourceType || "Record"}):</span>
                  <span className="font-mono text-gold font-bold">{selectedLog.resourceId}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-white/[0.01] flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icon helper
function LogInIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  );
}
