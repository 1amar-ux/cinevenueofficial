import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Key,
  Sliders,
  Trash2,
  Edit2,
  Eye,
  RefreshCw,
  Lock,
  Mail,
  Phone,
  Briefcase,
  Building,
  Calendar,
  Activity,
  AlertTriangle,
  X,
  Check,
  Link2,
  Share2
} from "lucide-react";
import {
  Employee,
  SYSTEM_ROLES,
  SYSTEM_MODULES,
  employeeService
} from "../../../services/employeeService";
import EmployeeResetPasswordModal from "./EmployeeResetPasswordModal";
import EmployeePermissionsModal from "./EmployeePermissionsModal";
import EmployeeAuditLogsModal from "./EmployeeAuditLogsModal";
import EmployeeShareLoginModal from "./EmployeeShareLoginModal";

export default function EmployeeManagementModule() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmployee, setShareEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [permissionEmployee, setPermissionEmployee] = useState<Employee | null>(null);
  const [resetPasswordEmployee, setResetPasswordEmployee] = useState<Employee | null>(null);

  // Add Employee Form State
  const [formFullName, setFormFullName] = useState("");
  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formDepartment, setFormDepartment] = useState("Cinema Operations");
  const [formDesignation, setFormDesignation] = useState("");
  const [formRoleId, setFormRoleId] = useState("role_movie_manager");
  const [formPassword, setFormPassword] = useState("");
  const [formConfirmPassword, setFormConfirmPassword] = useState("");
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchEmployees = async () => {
    setLoading(true);
    const data = await employeeService.getEmployees();
    setEmployees(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openAddModal = () => {
    // Generate suggested unique employee ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormEmployeeId(`EMP-${randomNum}`);
    setFormFullName("");
    setFormUsername("");
    setFormEmail("");
    setFormMobile("");
    setFormDepartment("Cinema Operations");
    setFormDesignation("");
    setFormRoleId("role_movie_manager");
    setFormPassword("");
    setFormConfirmPassword("");
    setFormStatus("ACTIVE");
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Add Employee Submission
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (formPassword !== formConfirmPassword) {
      setFormError("Password and Confirm Password do not match.");
      return;
    }

    setFormSubmitting(true);
    const res = await employeeService.createEmployee({
      fullName: formFullName,
      employeeId: formEmployeeId,
      username: formUsername,
      email: formEmail,
      mobile: formMobile,
      department: formDepartment,
      designation: formDesignation,
      roleId: formRoleId,
      password: formPassword,
      confirmPassword: formConfirmPassword,
      status: formStatus
    });
    setFormSubmitting(false);

    if (res.success) {
      showToast(`Employee ${formFullName} created successfully!`);
      setIsAddModalOpen(false);
      fetchEmployees();
      if (res.employee) {
        setShareEmployee(res.employee);
        setIsShareModalOpen(true);
      }
    } else {
      setFormError(res.message);
    }
  };

  // Edit Employee Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setFormSubmitting(true);
    const res = await employeeService.updateEmployee(editingEmployee.id, {
      fullName: editingEmployee.fullName,
      email: editingEmployee.email,
      mobile: editingEmployee.mobile,
      department: editingEmployee.department,
      designation: editingEmployee.designation,
      roleId: editingEmployee.roleId
    });
    setFormSubmitting(false);

    if (res.success) {
      showToast(`Employee ${editingEmployee.fullName} updated!`);
      setEditingEmployee(null);
      fetchEmployees();
    } else {
      alert(res.message);
    }
  };

  // Status Toggle
  const handleToggleStatus = async (emp: Employee) => {
    if (emp.id === "emp_super_admin" || emp.username === "amarnath_admin") {
      alert("Super Admin account cannot be deactivated.");
      return;
    }

    const actionText = emp.status === "ACTIVE" ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${actionText} employee ${emp.fullName} (${emp.employeeId})?`)) {
      return;
    }

    const res = await employeeService.toggleEmployeeStatus(emp.id, emp.status);
    if (res.success) {
      showToast(res.message);
      fetchEmployees();
    } else {
      alert(res.message);
    }
  };

  // Delete Employee
  const handleDeleteEmployee = async (emp: Employee) => {
    if (emp.id === "emp_super_admin" || emp.username === "amarnath_admin") {
      alert("Super Admin account cannot be deleted.");
      return;
    }

    if (!confirm(`Permanently revoke and delete employee record for ${emp.fullName} (${emp.employeeId})? This action cannot be undone.`)) {
      return;
    }

    const res = await employeeService.deleteEmployee(emp.id);
    if (res.success) {
      showToast(`Employee ${emp.fullName} removed successfully.`);
      fetchEmployees();
    } else {
      alert(res.message);
    }
  };

  // Unique Departments for filter
  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

  // Filtered List
  const filteredEmployees = employees.filter(emp => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        emp.fullName.toLowerCase().includes(q) ||
        emp.username.toLowerCase().includes(q) ||
        emp.employeeId.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Role
    if (roleFilter !== "ALL" && emp.roleId !== roleFilter && emp.role.name !== roleFilter) {
      return false;
    }

    // Department
    if (deptFilter !== "ALL" && emp.department.toLowerCase() !== deptFilter.toLowerCase()) {
      return false;
    }

    // Status
    if (statusFilter !== "ALL" && emp.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // KPI Metrics
  const totalEmployeesCount = employees.length;
  const activeEmployeesCount = employees.filter(e => e.status === "ACTIVE").length;
  const inactiveEmployeesCount = totalEmployeesCount - activeEmployeesCount;
  const totalRolesCount = SYSTEM_ROLES.length;

  return (
    <div className="space-y-6 text-left animate-fade-in">
      
      {/* Toast Notifier */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121214] border border-gold/40 p-4 rounded-xl text-xs font-bold text-gold flex items-center gap-2.5 shadow-2xl animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
              Employee Management
            </h2>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Manage CineVenue employees, roles and access permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShareEmployee(null);
              setIsShareModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-semibold rounded-xl border border-[#D4AF37]/30 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            title="Generate & Share Staff Login Links"
          >
            <Link2 className="w-4 h-4" />
            <span>Staff Login Link</span>
          </button>

          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-gold" />
            <span>Audit Logs</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-gold/15"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Employee</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#121214] border border-white/5 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Total Employees</span>
          <span className="text-xl md:text-2xl font-bold text-white block font-mono">{totalEmployeesCount}</span>
          <span className="text-[10px] text-text-secondary font-mono">Platform Roster</span>
        </div>

        <div className="bg-[#121214] border border-white/5 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Active Accounts</span>
          <span className="text-xl md:text-2xl font-bold text-emerald-400 block font-mono">🟢 {activeEmployeesCount}</span>
          <span className="text-[10px] text-emerald-400/80 font-mono">{inactiveEmployeesCount} currently inactive</span>
        </div>

        <div className="bg-[#121214] border border-white/5 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Departments</span>
          <span className="text-xl md:text-2xl font-bold text-gold block font-mono">{departments.length || 4}</span>
          <span className="text-[10px] text-text-secondary font-mono">Operational units</span>
        </div>

        <div className="bg-[#121214] border border-white/5 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Defined Roles</span>
          <span className="text-xl md:text-2xl font-bold text-white block font-mono">{totalRolesCount} Roles</span>
          <span className="text-[10px] text-text-secondary font-mono">Role-based controls</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#121214] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, username, employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-gold"
          >
            <option value="ALL">All Roles</option>
            {SYSTEM_ROLES.map(r => (
              <option key={r.id} value={r.id}>{r.displayName}</option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-gold"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-gold"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">🟢 Active</option>
            <option value="INACTIVE">🔴 Inactive</option>
          </select>

          <button
            onClick={fetchEmployees}
            disabled={loading}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-text-muted hover:text-white transition-all cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-gold" : ""}`} />
          </button>
        </div>
      </div>

      {/* Employee List Table */}
      <div className="bg-[#121214] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] uppercase font-bold text-text-muted tracking-wider">
                <th className="py-4 px-4 min-w-[200px]">Employee Name</th>
                <th className="py-4 px-3">Employee ID</th>
                <th className="py-4 px-3">Username</th>
                <th className="py-4 px-3">Department</th>
                <th className="py-4 px-3">Designation</th>
                <th className="py-4 px-3">Role</th>
                <th className="py-4 px-3 text-center">Status</th>
                <th className="py-4 px-3">Last Login</th>
                <th className="py-4 px-3">Created Date</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-text-muted space-y-2">
                    <Users className="w-8 h-8 text-white/20 mx-auto" />
                    <p className="text-xs">No employees found matching filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => {
                  const isSuperAdmin = emp.role.name === "SUPER_ADMIN" || emp.roleId === "role_super_admin";
                  const lastLoginFormatted = emp.lastLoginAt
                    ? new Date(emp.lastLoginAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                    : "Never";
                  const createdFormatted = new Date(emp.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

                  return (
                    <tr key={emp.id} className="hover:bg-white/[0.015] transition-colors">
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gold/30 to-yellow-600/10 border border-gold/30 flex items-center justify-center font-bold text-[11px] text-gold font-mono shrink-0">
                            {emp.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate text-xs">{emp.fullName}</span>
                            <span className="text-[10px] text-text-secondary font-mono block truncate">{emp.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-lg bg-black/60 border border-gold/20 font-mono text-gold text-[10px] font-bold">
                          {emp.employeeId}
                        </span>
                      </td>

                      {/* Username */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-text-primary text-[11px] font-semibold">
                          @{emp.username}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-3 text-text-secondary text-xs">
                        {emp.department}
                      </td>

                      {/* Designation */}
                      <td className="py-3 px-3 text-text-primary text-xs font-medium">
                        {emp.designation}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                            isSuperAdmin
                              ? "bg-gold/20 text-gold border border-gold/40"
                              : emp.role.name === "ADMIN"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : emp.role.name === "EVENT_MANAGER"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : emp.role.name === "FINANCE"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-white/10 text-text-secondary border border-white/10"
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3 shrink-0" />
                          <span>{emp.role.displayName}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          disabled={isSuperAdmin}
                          onClick={() => handleToggleStatus(emp)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase cursor-pointer transition-all ${
                            emp.status === "ACTIVE"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                              : "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
                          } ${isSuperAdmin ? "cursor-not-allowed opacity-90" : ""}`}
                          title={isSuperAdmin ? "Super Admin cannot be deactivated" : "Click to toggle Active / Inactive"}
                        >
                          {emp.status === "ACTIVE" ? "🟢 Active" : "🔴 Inactive"}
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-3 text-[11px] font-mono text-text-secondary whitespace-nowrap">
                        {lastLoginFormatted}
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-3 text-[11px] font-mono text-text-secondary whitespace-nowrap">
                        {createdFormatted}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Share Staff Login Link */}
                          <button
                            onClick={() => {
                              setShareEmployee(emp);
                              setIsShareModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-text-muted hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all cursor-pointer"
                            title={`Get Staff Login Link for ${emp.fullName}`}
                          >
                            <Link2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                          </button>

                          {/* View */}
                          <button
                            onClick={() => setViewingEmployee(emp)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                            title="View Profile Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => setEditingEmployee({ ...emp })}
                            className="p-1.5 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 transition-all cursor-pointer"
                            title="Edit Employee"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Permissions */}
                          <button
                            onClick={() => setPermissionEmployee(emp)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 transition-all cursor-pointer"
                            title="Configure Custom Permissions"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => setResetPasswordEmployee(emp)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
                            title="Reset Secure Password"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete (Protected for Super Admin) */}
                          {!isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteEmployee(emp)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                              title="Delete Employee"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ADD EMPLOYEE MODAL */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Add New Employee
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    Register a new CineVenue staff member with role-based operational permissions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    placeholder="e.g. Ramesh Varma"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
                    required
                  />
                </div>

                {/* Employee ID */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex justify-between">
                    <span>Employee ID (Unique) *</span>
                    <span className="text-gold font-mono text-[9px]">e.g. EMP-1042</span>
                  </label>
                  <input
                    type="text"
                    value={formEmployeeId}
                    onChange={(e) => setFormEmployeeId(e.target.value.toUpperCase())}
                    placeholder="EMP-1042"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold font-mono uppercase"
                    required
                  />
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex justify-between">
                    <span>Username (Unique) *</span>
                    <span className="text-text-muted font-mono text-[9px]">Used for login</span>
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="ramesh_varma"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold font-mono"
                    required
                  />
                </div>

                {/* Official Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="ramesh@cinevenue.com"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold font-mono"
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold font-mono"
                  />
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="Cinema Operations / Live Events / Finance"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
                    required
                  />
                </div>

                {/* Designation */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Designation *
                  </label>
                  <input
                    type="text"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    placeholder="e.g. Lead Show Coordinator"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
                    required
                  />
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Assigned Role *
                  </label>
                  <select
                    value={formRoleId}
                    onChange={(e) => setFormRoleId(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-gold"
                  >
                    {SYSTEM_ROLES.map(r => (
                      <option key={r.id} value={r.id}>{r.displayName} - {r.description.slice(0, 45)}...</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Account Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-gold"
                  >
                    <option value="ACTIVE">🟢 Active</option>
                    <option value="INACTIVE">🔴 Inactive</option>
                  </select>
                </div>
              </div>

              {/* Password Section */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                <div className="text-[11px] font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-gold" />
                  <span>Initial Security Password</span>
                </div>
                <p className="text-[10px] text-text-secondary">
                  Passwords are securely hashed before storage and are never retrievable or displayed in plaintext.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-gold font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={formConfirmPassword}
                      onChange={(e) => setFormConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-gold font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Rules note */}
                <div className="text-[9px] font-mono text-text-muted space-x-2">
                  <span>Requirement: Min 8 chars</span> •
                  <span>1 uppercase</span> •
                  <span>1 lowercase</span> •
                  <span>1 number</span> •
                  <span>1 symbol</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-white/10 text-xs font-semibold text-text-secondary hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-gold/15"
                >
                  <Check className="w-4 h-4" />
                  <span>{formSubmitting ? "Creating..." : "Save Employee"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT EMPLOYEE MODAL */}
      {/* ======================================================== */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Edit Employee Profile
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    {editingEmployee.fullName} • <span className="font-mono text-gold">{editingEmployee.employeeId}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={editingEmployee.fullName}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, fullName: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={editingEmployee.email}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Mobile</label>
                  <input
                    type="tel"
                    value={editingEmployee.mobile || ""}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, mobile: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Department</label>
                  <input
                    type="text"
                    value={editingEmployee.department}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Designation</label>
                  <input
                    type="text"
                    value={editingEmployee.designation}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
                    required
                  />
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Assigned Role</label>
                <select
                  value={editingEmployee.roleId}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, roleId: e.target.value })}
                  disabled={editingEmployee.id === "emp_super_admin"}
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-gold disabled:opacity-60"
                >
                  {SYSTEM_ROLES.map(r => (
                    <option key={r.id} value={r.id}>{r.displayName}</option>
                  ))}
                </select>
                {editingEmployee.id === "emp_super_admin" && (
                  <p className="text-[9px] text-gold font-mono">Primary Super Admin role is protected.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-xs font-semibold text-text-secondary hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-gold/15"
                >
                  <Check className="w-4 h-4" />
                  <span>{formSubmitting ? "Saving..." : "Update Profile"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW EMPLOYEE PROFILE MODAL */}
      {/* ======================================================== */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-start bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold/30 to-yellow-600/10 border border-gold/30 flex items-center justify-center font-bold text-lg text-gold font-mono shadow-inner">
                  {viewingEmployee.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {viewingEmployee.fullName}
                  </h3>
                  <p className="text-xs text-gold font-mono">
                    @{viewingEmployee.username}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-gold/10 text-gold border border-gold/20">
                      {viewingEmployee.role.displayName}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      viewingEmployee.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                    }`}>
                      {viewingEmployee.status === "ACTIVE" ? "🟢 Active" : "🔴 Inactive"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingEmployee(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-[10px] text-text-muted uppercase block font-sans font-bold">Employee ID</span>
                  <span className="text-white font-bold text-xs">{viewingEmployee.employeeId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase block font-sans font-bold">Department</span>
                  <span className="text-white text-xs">{viewingEmployee.department}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase block font-sans font-bold">Designation</span>
                  <span className="text-white text-xs">{viewingEmployee.designation}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase block font-sans font-bold">Official Email</span>
                  <span className="text-white text-xs truncate block">{viewingEmployee.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase block font-sans font-bold">Mobile</span>
                  <span className="text-white text-xs">{viewingEmployee.mobile || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase block font-sans font-bold">Last Login</span>
                  <span className="text-white text-xs">
                    {viewingEmployee.lastLoginAt ? new Date(viewingEmployee.lastLoginAt).toLocaleString("en-IN") : "Never"}
                  </span>
                </div>
              </div>

              {/* Module Access Quick Summary */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-text-muted uppercase block font-sans font-bold">Authorized Modules</span>
                <div className="flex flex-wrap gap-1.5">
                  {SYSTEM_MODULES.map(m => {
                    const hasView = viewingEmployee.role.name === "SUPER_ADMIN" || viewingEmployee.permissions?.[m.id]?.VIEW;
                    return (
                      <span
                        key={m.id}
                        className={`px-2 py-0.5 rounded text-[9px] font-sans font-semibold ${
                          hasView ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-text-muted border border-white/5 opacity-40"
                        }`}
                      >
                        {m.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const target = viewingEmployee;
                  setViewingEmployee(null);
                  setResetPasswordEmployee(target);
                }}
                className="px-3 py-1.5 rounded-lg border border-amber-500/20 text-amber-400 hover:bg-amber-500/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Reset Password</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingEmployee(null)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-secondary hover:text-white transition-all cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {permissionEmployee && (
        <EmployeePermissionsModal
          employee={permissionEmployee}
          isOpen={!!permissionEmployee}
          onClose={() => setPermissionEmployee(null)}
          onSuccess={(msg) => {
            showToast(msg);
            fetchEmployees();
          }}
        />
      )}

      {/* Reset Password Modal */}
      {resetPasswordEmployee && (
        <EmployeeResetPasswordModal
          employee={resetPasswordEmployee}
          isOpen={!!resetPasswordEmployee}
          onClose={() => setResetPasswordEmployee(null)}
          onSuccess={(msg) => {
            showToast(msg);
            fetchEmployees();
          }}
        />
      )}

      {/* Audit Logs Stream Modal */}
      <EmployeeAuditLogsModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      {/* Staff Login Link Generator & Share Modal */}
      <EmployeeShareLoginModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setShareEmployee(null);
        }}
        employee={shareEmployee}
        employeesList={employees}
        onSuccessToast={showToast}
      />
    </div>
  );
}
