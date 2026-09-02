import React, { useState } from "react";
import { 
  Search, Download, Trash2, Shield, Eye, Edit2, Key, UserCheck, UserX, CheckSquare, Square, ChevronUp, ChevronDown 
} from "lucide-react";
import { Admin, Role } from "./types";

interface AdminListProps {
  admins: Admin[];
  roles: Role[];
  onView: (admin: Admin) => void;
  onEdit: (admin: Admin) => void;
  onResetPassword: (adminEmail: string) => void;
  onUpdateStatus: (adminEmail: string, status: 'Active' | 'Inactive' | 'Suspended') => void;
  onDelete: (adminEmail: string) => void;
  onBulkDelete: (emails: string[]) => void;
  onBulkUpdateStatus: (emails: string[], status: 'Active' | 'Inactive' | 'Suspended') => void;
}

export default function AdminList({ 
  admins, roles, onView, onEdit, onResetPassword, onUpdateStatus, onDelete, onBulkDelete, onBulkUpdateStatus 
}: AdminListProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Sorting
  const [sortField, setSortField] = useState<keyof Admin>("fullName");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>("asc");

  // Selection
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Handles sort direction toggles
  const handleSort = (field: keyof Admin) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch = 
      admin.fullName.toLowerCase().includes(search.toLowerCase()) || 
      admin.email.toLowerCase().includes(search.toLowerCase()) || 
      admin.mobileNumber.includes(search) || 
      admin.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      admin.department.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || admin.role === roleFilter;
    const matchesStatus = statusFilter === "all" || admin.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sort
  const sortedAdmins = [...filteredAdmins].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc" 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    }
    return 0;
  });

  // Pagination slice
  const totalPages = Math.ceil(sortedAdmins.length / itemsPerPage);
  const paginatedAdmins = sortedAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Bulk selectors
  const handleSelectAll = () => {
    if (selectedEmails.length === paginatedAdmins.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(paginatedAdmins.map(a => a.email));
    }
  };

  const handleSelectOne = (email: string) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter(e => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  // Bulk actions
  const handleBulkDeleteAction = () => {
    if (confirm(`Are you absolutely sure you want to permanently delete the ${selectedEmails.length} selected administrator account(s)?`)) {
      onBulkDelete(selectedEmails);
      setSelectedEmails([]);
    }
  };

  const handleBulkStatusAction = (status: 'Active' | 'Inactive' | 'Suspended') => {
    onBulkUpdateStatus(selectedEmails, status);
    setSelectedEmails([]);
  };

  // Export functions
  const exportToCSV = () => {
    const headers = "ID,Full Name,Email,Mobile Number,Role,Department,Status,Last Login,Created Date\n";
    const rows = sortedAdmins.map(a => 
      `"${a.employeeId}","${a.fullName}","${a.email}","${a.mobileNumber}","${a.role}","${a.department}","${a.status}","${a.lastLogin}","${a.createdDate}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `admins_registry_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcelDummy = () => {
    // Generate styled XML or spreadsheet compatible format, or direct CSV under xls label
    const headers = "ID\tFull Name\tEmail\tMobile Number\tRole\tDepartment\tStatus\tLast Login\tCreated Date\n";
    const rows = sortedAdmins.map(a => 
      `${a.employeeId}\t${a.fullName}\t${a.email}\t${a.mobileNumber}\t${a.role}\t${a.department}\t${a.status}\t${a.lastLogin}\t${a.createdDate}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `admins_registry_export_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide font-sans">Corporate Admins Registry</h2>
          <p className="text-xs text-text-secondary mt-0.5 font-sans">
            Oversee active administrative profiles, toggle security clearances, and run bulk operations
          </p>
        </div>
        <div className="flex gap-2 text-xs flex-wrap">
          <button
            onClick={exportToCSV}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-gold" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportToExcelDummy}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search name, email, employee ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white/[0.02] border border-white/5 focus:border-gold pl-9 pr-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#121213] border border-white/5 focus:border-gold px-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none"
        >
          <option value="all">All Roles</option>
          {roles.map(r => (
            <option key={r.id} value={r.name}>{r.name}</option>
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
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Bulk actions row */}
      {selectedEmails.length > 0 && (
        <div className="bg-gold/5 border border-gold/20 p-3 rounded-xl flex items-center justify-between text-xs font-mono animate-slideDown">
          <span className="text-gold font-bold">
            ⚡ {selectedEmails.length} account(s) selected for bulk operation
          </span>
          <div className="flex gap-2 text-[10px]">
            <button
              onClick={() => handleBulkStatusAction("Active")}
              className="px-2.5 py-1 bg-emerald-500 text-black rounded font-bold uppercase"
            >
              Bulk Activate
            </button>
            <button
              onClick={() => handleBulkStatusAction("Suspended")}
              className="px-2.5 py-1 bg-amber-500 text-black rounded font-bold uppercase"
            >
              Bulk Suspend
            </button>
            <button
              onClick={handleBulkDeleteAction}
              className="px-2.5 py-1 bg-red-500 text-white rounded font-bold uppercase flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Bulk Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-[#121213] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-text-secondary font-bold font-mono text-[10px] uppercase tracking-wider">
                <th className="p-4 w-12 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="inline-flex items-center justify-center p-1 text-white/40 hover:text-white"
                  >
                    {selectedEmails.length === paginatedAdmins.length && paginatedAdmins.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-gold" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("fullName")}>
                  Full Name {sortField === "fullName" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("email")}>
                  Email Address {sortField === "email" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="p-4">Mobile</th>
                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("role")}>
                  Role {sortField === "role" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("department")}>
                  Department {sortField === "department" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="p-4 text-center cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("status")}>
                  Status {sortField === "status" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px] font-sans">
              {paginatedAdmins.length > 0 ? (
                paginatedAdmins.map((admin) => {
                  const isSelected = selectedEmails.includes(admin.email);
                  return (
                    <tr key={admin.email} className={`hover:bg-white/[0.01] transition-colors ${isSelected ? "bg-gold/[0.02]" : ""}`}>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleSelectOne(admin.email)}
                          className="inline-flex items-center justify-center p-1 text-white/30 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-gold" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-4 font-bold text-white flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 shrink-0 bg-white/5">
                          <img 
                            src={admin.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"} 
                            alt={admin.fullName} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-white block font-semibold">{admin.fullName}</span>
                          <span className="text-[9px] font-mono text-gold block">{admin.employeeId}</span>
                        </div>
                      </td>
                      <td className="p-4 text-text-secondary select-all font-mono font-medium">{admin.email}</td>
                      <td className="p-4 text-text-secondary font-mono">{admin.mobileNumber}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-gold/10 text-gold border border-gold/10 rounded font-bold uppercase text-[9px]">
                          {admin.role}
                        </span>
                      </td>
                      <td className="p-4 text-white font-semibold">{admin.department}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          admin.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : admin.status === "Suspended"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {admin.status}
                        </span>
                      </td>
                      <td className="p-4 text-text-secondary font-mono">{admin.lastLogin}</td>
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => onView(admin)}
                          title="View Admin Profile"
                          className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEdit(admin)}
                          title="Edit Admin Settings"
                          className="p-1.5 bg-gold/5 hover:bg-gold hover:text-black border border-gold/10 text-gold rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onResetPassword(admin.email)}
                          title="Reset Password Credentials"
                          className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-text-secondary hover:text-white rounded transition-colors"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(admin.email)}
                          title="Delete Account permanently"
                          className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-black border border-red-500/10 text-red-400 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-text-muted italic">
                    No matching administrator entries found. Reset filters and retry.
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
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredAdmins.length} entries)
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
