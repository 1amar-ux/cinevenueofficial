import React, { useState } from "react";
import { Search, Download, FileCode, Clock, Filter, Eye } from "lucide-react";
import { AuditLog } from "./types";

interface AuditLogViewProps {
  logs: AuditLog[];
}

export default function AuditLogView({ logs }: AuditLogViewProps) {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Expandable details for review old / new JSON payloads
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Derive modules dynamically
  const activeModules = Array.from(new Set(logs.map(l => l.module)));

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.adminName.toLowerCase().includes(search.toLowerCase()) || 
      log.adminEmail.toLowerCase().includes(search.toLowerCase()) || 
      log.action.toLowerCase().includes(search.toLowerCase()) || 
      log.description.toLowerCase().includes(search.toLowerCase());

    const matchesModule = moduleFilter === "all" || log.module === moduleFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;

    return matchesSearch && matchesModule && matchesStatus;
  });

  // Calculate paginated slice
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportLedgerToCSV = () => {
    const headers = "ID,Admin,Email,Action,Module,Description,Old Data,New Data,IP,Timestamp,Status\n";
    const rows = filteredLogs.map(l => {
      const oldClean = l.oldData ? l.oldData.replace(/"/g, '""') : "";
      const newClean = l.newData ? l.newData.replace(/"/g, '""') : "";
      return `"${l.id}","${l.adminName}","${l.adminEmail}","${l.action}","${l.module}","${l.description}","${oldClean}","${newClean}","${l.ipAddress}","${l.timestamp}","${l.status}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `security_audit_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">System Security Audit Ledger</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Cryptographically logged transaction trails, dynamic cluster modifications, and old vs new configuration states
          </p>
        </div>
        <button
          onClick={exportLedgerToCSV}
          className="self-start sm:self-auto px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-white/10 flex items-center gap-1.5"
        >
          <Download className="w-4 h-4 text-gold" />
          <span>Export Audit Ledger</span>
        </button>
      </div>

      {/* Filters row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search records, actions, payloads..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white/[0.02] border border-white/5 focus:border-gold pl-9 pr-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none"
          />
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => {
            setModuleFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#121213] border border-white/5 focus:border-gold px-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none"
        >
          <option value="all">All Subsystem Modules</option>
          {activeModules.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#121213] border border-white/5 focus:border-gold px-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none"
        >
          <option value="all">All Execution States</option>
          <option value="Success">Success (CODE_200)</option>
          <option value="Failed">Failed (ALERT_403)</option>
        </select>
      </div>

      {/* Main Audit table */}
      <div className="bg-[#121213] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-text-secondary font-bold font-mono text-[10px] uppercase">
                <th className="p-4 w-12"></th>
                <th className="p-4">Ref ID</th>
                <th className="p-4">Executor Account</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Target Module</th>
                <th className="p-4">Detailed Description</th>
                <th className="p-4">Source IP</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 text-center">
                          {(log.oldData || log.newData) && (
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="p-1 hover:bg-white/5 rounded text-gold transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                        <td className="p-4 text-white font-bold">{log.id}</td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="text-white block font-bold font-sans">{log.adminName}</span>
                            <span className="text-[10px] text-text-secondary block select-all">{log.adminEmail}</span>
                          </div>
                        </td>
                        <td className="p-4 text-white font-semibold">{log.action}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-white/5 text-text-secondary rounded">
                            {log.module}
                          </span>
                        </td>
                        <td className="p-4 text-text-secondary font-sans leading-relaxed">{log.description}</td>
                        <td className="p-4 text-white select-all">{log.ipAddress}</td>
                        <td className="p-4 text-text-secondary">{log.timestamp}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                            log.status === "Success"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}>
                            {log.status === "Success" ? "SUCCESS" : "REJECTED"}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Old/New Data Visualizer */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} className="p-4 bg-black/40 border-t border-white/5 space-y-3 animate-slideDown">
                            <div className="flex gap-2 items-center text-[10px] text-gold font-bold uppercase tracking-wider mb-2">
                              <FileCode className="w-4 h-4" />
                              <span>Audit Payload Diff State</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {log.oldData && (
                                <div className="space-y-1.5">
                                  <span className="text-[9px] text-text-secondary font-bold uppercase">Pre-mutation State (Old Data):</span>
                                  <pre className="bg-[#0c0c0d] border border-white/5 p-3 rounded-xl overflow-x-auto text-[9px] text-red-400 select-all font-mono leading-normal max-h-56">
                                    {log.oldData.startsWith("{") ? JSON.stringify(JSON.parse(log.oldData), null, 2) : log.oldData}
                                  </pre>
                                </div>
                              )}
                              {log.newData && (
                                <div className="space-y-1.5">
                                  <span className="text-[9px] text-text-secondary font-bold uppercase">Post-mutation State (New Data):</span>
                                  <pre className="bg-[#0c0c0d] border border-white/5 p-3 rounded-xl overflow-x-auto text-[9px] text-emerald-400 select-all font-mono leading-normal max-h-56">
                                    {log.newData.startsWith("{") ? JSON.stringify(JSON.parse(log.newData), null, 2) : log.newData}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-text-muted italic">
                    No matching audit trails detected in database. Customize active search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="bg-white/[0.01] border-t border-white/5 p-4 flex items-center justify-between gap-4">
            <span className="text-[10px] text-text-secondary font-mono">
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredLogs.length} entries)
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 text-[10px] bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white rounded font-bold uppercase transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 text-[10px] bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white rounded font-bold uppercase transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
