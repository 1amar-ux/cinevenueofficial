import React, { useState } from "react";
import { Search, Download, Clock, Filter, ArrowUpRight } from "lucide-react";
import { LoginActivity } from "./types";

interface LoginActivityProps {
  logs: LoginActivity[];
}

export default function LoginActivityView({ logs }: LoginActivityProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.adminName.toLowerCase().includes(search.toLowerCase()) || 
      log.adminEmail.toLowerCase().includes(search.toLowerCase()) || 
      log.ipAddress.includes(search) || 
      log.location.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesDevice = deviceFilter === "all" || log.device === deviceFilter;
    const matchesDate = !dateFilter || log.loginTime.includes(dateFilter);

    return matchesSearch && matchesStatus && matchesDevice && matchesDate;
  });

  const exportToCSV = () => {
    const headers = "ID,Admin Name,Email,IP Address,Browser,OS,Device,Location,Login Time,Logout Time,Status\n";
    const rows = filteredLogs.map(l => 
      `"${l.id}","${l.adminName}","${l.adminEmail}","${l.ipAddress}","${l.browser}","${l.os}","${l.device}","${l.location}","${l.loginTime}","${l.logoutTime}","${l.status}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `login_activities_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Login Activity Matrix</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Audit concurrent credentials access, observe geolocation coordinates, and download security access CSV sheets
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="self-start sm:self-auto px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-white/10 flex items-center gap-1.5"
        >
          <Download className="w-4 h-4 text-gold" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search admins, emails, or IPs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 focus:border-gold pl-9 pr-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#121213] border border-white/5 focus:border-gold px-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none"
        >
          <option value="all">All Access States</option>
          <option value="Success">Success Sessions</option>
          <option value="Failed">Failed (Alert Trigger)</option>
        </select>

        <select
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
          className="bg-[#121213] border border-white/5 focus:border-gold px-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none"
        >
          <option value="all">All Hardware Profiles</option>
          <option value="Desktop">Desktop Workspace</option>
          <option value="Mobile">Mobile Handsets</option>
          <option value="Tablet">Tablet Console</option>
        </select>

        <div className="relative">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 focus:border-gold px-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none"
          />
        </div>
      </div>

      {/* Main activities ledger list */}
      <div className="bg-[#121213] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-text-secondary font-bold font-mono text-[10px] uppercase">
                <th className="p-4">Session Ref</th>
                <th className="p-4">Account Profile</th>
                <th className="p-4">Network IP Address</th>
                <th className="p-4">System specs & Browser</th>
                <th className="p-4">Physical Geolocation</th>
                <th className="p-4">Access Timestamp</th>
                <th className="p-4">Session Termination</th>
                <th className="p-4 text-center">Protocol Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 text-white font-bold">{log.id}</td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="text-white block font-bold font-sans">{log.adminName}</span>
                        <span className="text-[10px] text-text-secondary block select-all">{log.adminEmail}</span>
                      </div>
                    </td>
                    <td className="p-4 text-white font-semibold select-all">{log.ipAddress}</td>
                    <td className="p-4">
                      <div className="space-y-0.5 font-sans">
                        <span className="text-white block font-mono text-[10px]">{log.browser}</span>
                        <span className="text-[9px] text-text-secondary block">{log.os} ({log.device})</span>
                      </div>
                    </td>
                    <td className="p-4 text-text-secondary font-sans">{log.location}</td>
                    <td className="p-4 text-text-secondary">{log.loginTime}</td>
                    <td className="p-4">
                      {log.logoutTime === "Active Session" ? (
                        <span className="text-emerald-400 font-bold animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active Now
                        </span>
                      ) : (
                        <span className="text-text-muted">{log.logoutTime}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                        log.status === "Success"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {log.status === "Success" ? "GRANTED" : "REJECTED"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-muted italic">
                    No matching connection logs detected. Customize active search parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
