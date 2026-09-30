import React, { useState } from "react";
import {
  Activity,
  Server,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldAlert,
  Search,
  Check,
  Zap,
  TrendingUp,
  Cpu,
  Radio,
  Filter,
  FileSpreadsheet,
  Layers,
  ArrowUpRight
} from "lucide-react";
import {
  systemMonitoringService,
  TheatreHealthStatus,
  IncidentRecord,
  ReconciliationItem,
  AuditLogEntry
} from "../../../modules/monitoring/systemMonitoringService";

export default function SystemMonitoringModule() {
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "pos_health" | "incidents" | "reconciliation" | "audit_logs">("overview");
  const [metrics, setMetrics] = useState(systemMonitoringService.getOverviewMetrics());
  const [theatreHealth, setTheatreHealth] = useState<TheatreHealthStatus[]>(systemMonitoringService.getTheatreHealthList());
  const [incidents, setIncidents] = useState<IncidentRecord[]>(systemMonitoringService.getIncidents());
  const [reconciliations, setReconciliations] = useState<ReconciliationItem[]>(systemMonitoringService.getReconciliationLedger());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(systemMonitoringService.getAuditLogs());

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setMetrics(systemMonitoringService.getOverviewMetrics());
      setTheatreHealth(systemMonitoringService.getTheatreHealthList());
      setIncidents(systemMonitoringService.getIncidents());
      setReconciliations(systemMonitoringService.getReconciliationLedger());
      setAuditLogs(systemMonitoringService.getAuditLogs());
      setIsRefreshing(false);
    }, 400);
  };

  const handleAcknowledge = (incidentId: string) => {
    systemMonitoringService.acknowledgeIncident(incidentId, "Super Admin");
    setIncidents(systemMonitoringService.getIncidents());
    setAuditLogs(systemMonitoringService.getAuditLogs());
  };

  const handleResolve = (incidentId: string) => {
    systemMonitoringService.resolveIncident(incidentId, "Super Admin");
    setIncidents(systemMonitoringService.getIncidents());
    setAuditLogs(systemMonitoringService.getAuditLogs());
  };

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121216] border border-white/10 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold shadow-lg shadow-gold/10">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide flex items-center gap-2">
              System Operational Monitoring & Health
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                REAL-TIME TELEMETRY
              </span>
            </h1>
            <p className="text-xs text-white/50">
              Live Gateway Latency • Failure Recovery • POS Health Matrix • Booking Reconciliation
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Telemetry
        </button>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {[
          { id: "overview", label: "Overview Metrics", icon: TrendingUp },
          { id: "pos_health", label: "POS Health Matrix", icon: Server },
          { id: "incidents", label: "Incidents & Alerts", icon: ShieldAlert, badge: incidents.filter(i => i.status === "OPEN").length },
          { id: "reconciliation", label: "Booking Reconciliation", icon: Layers },
          { id: "audit_logs", label: "Append-Only Audit Logs", icon: Clock }
        ].map(tab => {
          const isActive = activeSubTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-gold text-black shadow-lg shadow-gold/20"
                  : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
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

      {/* ================= TAB 1: OVERVIEW METRICS ================= */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* POS Status */}
            <div className="bg-[#121216] border border-white/10 p-5 rounded-2xl space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs text-white/50 uppercase font-bold tracking-wider">POS Integrations</span>
                <Server className="w-4 h-4 text-gold" />
              </div>
              <div className="text-2xl font-black text-white font-mono">{metrics.posIntegrations.healthy} / {metrics.posIntegrations.total}</div>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {metrics.posIntegrations.healthy} Healthy • {metrics.posIntegrations.warning} Warning
              </div>
            </div>

            {/* Bookings Today */}
            <div className="bg-[#121216] border border-white/10 p-5 rounded-2xl space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs text-white/50 uppercase font-bold tracking-wider">Bookings Today</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">{metrics.bookings.totalToday}</div>
              <div className="text-[11px] text-emerald-400 font-medium">
                {metrics.bookings.successful} Confirmed ({((metrics.bookings.successful / metrics.bookings.totalToday) * 100).toFixed(1)}%)
              </div>
            </div>

            {/* Gateway Latency */}
            <div className="bg-[#121216] border border-white/10 p-5 rounded-2xl space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs text-white/50 uppercase font-bold tracking-wider">P95 POS Latency</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">{metrics.latency.p95Ms} ms</div>
              <div className="text-[11px] text-white/50">Avg: {metrics.latency.avgMs}ms (Rolling 10m window)</div>
            </div>

            {/* Error Rate */}
            <div className="bg-[#121216] border border-white/10 p-5 rounded-2xl space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs text-white/50 uppercase font-bold tracking-wider">Error Rate</span>
                <ShieldAlert className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">{metrics.errorRate.totalRate}%</div>
              <div className="text-[11px] text-white/50">{metrics.errorRate.failedRequests} failures / {metrics.errorRate.totalRequests} reqs</div>
            </div>
          </div>

          {/* Quick Health Summary Grid */}
          <div className="bg-[#121216] border border-white/10 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-gold" />
              Cinema POS Gateway Health Matrix
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {theatreHealth.map(item => (
                <div key={item.theatreId} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{item.theatreName}</div>
                    <div className="text-[11px] text-white/50 mt-0.5">{item.provider} • Latency: {item.latencyMs}ms</div>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold ${
                      item.health === "HEALTHY"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    }`}
                  >
                    {item.health === "HEALTHY" ? "🟢 HEALTHY" : "🟡 WARNING"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: POS HEALTH MATRIX ================= */}
      {activeSubTab === "pos_health" && (
        <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-gold" />
            Live POS Endpoint Diagnostics & Telemetry
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-white/60 uppercase font-mono text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-3">Theatre / Partner</th>
                  <th className="p-3">POS Provider</th>
                  <th className="p-3">Health Grade</th>
                  <th className="p-3">Ping Latency</th>
                  <th className="p-3">Error Rate</th>
                  <th className="p-3">Last Ping</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {theatreHealth.map(th => (
                  <tr key={th.theatreId} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-sans font-bold text-white">{th.theatreName}</td>
                    <td className="p-3 text-white/70">{th.provider}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        🟢 {th.health}
                      </span>
                    </td>
                    <td className="p-3 text-gold font-bold">{th.latencyMs} ms</td>
                    <td className="p-3 text-white/70">{th.errorRatePercent}%</td>
                    <td className="p-3 text-white/50 text-[11px]">{new Date(th.lastSuccessfulCall).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: INCIDENTS & ALERTS ================= */}
      {activeSubTab === "incidents" && (
        <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-gold" />
              Operational Incident Ledger (Deduplicated Stream)
            </h2>
            <span className="text-xs text-white/50">{incidents.length} total incidents</span>
          </div>

          {incidents.length === 0 ? (
            <div className="p-8 text-center text-white/50 bg-white/5 rounded-xl border border-white/5">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <span>All systems healthy. No active incidents reported.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map(inc => (
                <div key={inc.incidentId} className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">{inc.incidentId}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold">
                        {inc.severity}
                      </span>
                      <span className="text-xs text-white/50">• {inc.theatreName}</span>
                    </div>
                    <p className="text-xs text-white/80 mt-1">{inc.description}</p>
                    <span className="text-[10px] text-white/40 font-mono mt-1 block">
                      Started: {new Date(inc.startedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {inc.status === "OPEN" && (
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(inc.incidentId)}
                        className="px-3 py-1.5 bg-gold/20 hover:bg-gold/30 text-gold text-xs font-bold rounded-lg border border-gold/30 transition-all cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    )}
                    {inc.status !== "RESOLVED" && (
                      <button
                        type="button"
                        onClick={() => handleResolve(inc.incidentId)}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30 transition-all cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {inc.status === "RESOLVED" && (
                      <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: BOOKING RECONCILIATION ================= */}
      {activeSubTab === "reconciliation" && (
        <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-gold" />
              Three-Way Booking Reconciliation Monitor (CineVenue $\leftrightarrow$ POS $\leftrightarrow$ Gateway)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-white/60 uppercase font-mono text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-3">Rec ID</th>
                  <th className="p-3">CineVenue Booking ID</th>
                  <th className="p-3">POS Booking ID</th>
                  <th className="p-3">Payment ID</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Diagnosis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {reconciliations.map(rec => (
                  <tr key={rec.id} className="hover:bg-white/[0.02]">
                    <td className="p-3 text-gold font-bold">{rec.id}</td>
                    <td className="p-3 text-white">{rec.bookingId}</td>
                    <td className="p-3 text-white/70">{rec.posBookingId || "—"}</td>
                    <td className="p-3 text-white/70">{rec.paymentId || "—"}</td>
                    <td className="p-3 text-white font-bold">₹{rec.amount}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-3 font-sans text-white/60">{rec.issue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 5: APPEND-ONLY AUDIT LOGS ================= */}
      {activeSubTab === "audit_logs" && (
        <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold" />
              Append-Only Operational Audit Trail
            </h2>
            <span className="text-xs text-white/50">{auditLogs.length} events logged</span>
          </div>

          <div className="h-96 overflow-y-auto space-y-2 bg-black/60 p-3 rounded-xl border border-white/5 font-mono text-xs">
            {auditLogs.length === 0 ? (
              <div className="text-white/40 italic p-4 text-center">No audit entries logged yet.</div>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="p-2.5 bg-white/[0.02] border border-white/5 rounded-lg flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-gold font-bold">{log.actor}</span>
                    <span className="text-white/80 ml-2">[{log.action}]</span>
                    {log.reason && <span className="text-white/50 ml-2">— {log.reason}</span>}
                  </div>
                  <span className="text-[10px] text-white/40">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
