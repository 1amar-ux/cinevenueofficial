import React, { useState, useEffect } from "react";
import { Activity, Search, Filter, RefreshCw, X, Shield, Clock, CheckCircle2, XCircle } from "lucide-react";
import { EmployeeActivityLog, employeeService, SYSTEM_MODULES } from "../../../services/employeeService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmployeeAuditLogsModal({ isOpen, onClose }: Props) {
  const [logs, setLogs] = useState<EmployeeActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    const data = await employeeService.getActivityLogs({
      module: moduleFilter !== "ALL" ? moduleFilter : undefined
    });
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, moduleFilter]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (log.employeeName && log.employeeName.toLowerCase().includes(q)) ||
      (log.employeeCode && log.employeeCode.toLowerCase().includes(q)) ||
      (log.username && log.username.toLowerCase().includes(q)) ||
      log.action.toLowerCase().includes(q) ||
      log.module.toLowerCase().includes(q) ||
      (log.ipAddress && log.ipAddress.includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in text-left">
      <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Employee Activity & Audit Trail
              </h3>
              <p className="text-[11px] text-text-secondary">
                Authoritative compliance log stream tracking employee actions across all CineVenue operational modules
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-2 rounded-lg bg-white/5 text-text-secondary hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Refresh Logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-gold" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex flex-col sm:flex-row gap-3 justify-between items-center shrink-0">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by action, employee, IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-gold"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-gold"
            >
              <option value="ALL">All Modules</option>
              <option value="AUTH">Authentication / Login</option>
              {SYSTEM_MODULES.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
            <span className="text-[10px] text-text-muted font-mono whitespace-nowrap">
              {filteredLogs.length} events
            </span>
          </div>
        </div>

        {/* Logs Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-text-muted space-y-2">
              <Shield className="w-8 h-8 text-white/20 mx-auto" />
              <p className="text-xs">No activity logs recorded matching criteria.</p>
            </div>
          ) : (
            filteredLogs.map(log => {
              const dateObj = new Date(log.createdAt);
              const dateStr = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
              const timeStr = dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
              const isSuccess = log.result === "SUCCESS";

              return (
                <div
                  key={log.id}
                  className="bg-black/40 border border-white/5 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-white/10 transition-all font-mono text-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5">
                      {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white font-sans text-xs">
                          {log.employeeName || "System Actor"}
                        </span>
                        {log.employeeCode && (
                          <span className="px-1.5 py-0.2 bg-gold/10 text-gold text-[9px] rounded border border-gold/20">
                            {log.employeeCode}
                          </span>
                        )}
                        <span className="px-1.5 py-0.2 bg-white/5 text-text-secondary text-[9px] rounded uppercase">
                          {log.module}
                        </span>
                        <span className={`text-[9px] font-bold ${isSuccess ? "text-emerald-400" : "text-red-400"}`}>
                          ● {log.result}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary font-sans leading-relaxed">
                        {log.action}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-2 text-[10px] text-text-muted shrink-0">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gold" />
                      <span>{dateStr}, {timeStr}</span>
                    </div>
                    {log.ipAddress && (
                      <span className="text-[9px] text-text-secondary">
                        IP: {log.ipAddress}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex justify-between items-center shrink-0">
          <p className="text-[10px] text-text-secondary">
            Logs are cryptographically timestamped and retained permanently for audit compliance.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-xs font-semibold text-text-secondary hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Close Stream
          </button>
        </div>
      </div>
    </div>
  );
}
