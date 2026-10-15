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
  EyeOff,
  Copy,
  ExternalLink,
  LayoutDashboard,
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

  // Password Visibility & Copy States
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmployee, setShareEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [viewingPasswordRevealed, setViewingPasswordRevealed] = useState(false);
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

  // Edit Full Profile Form State
  const [editFullName, setEditFullName] = useState("");
  const [editEmployeeId, setEditEmployeeId] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editRoleId, setEditRoleId] = useState("");
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyText = (text: string, key: string, label: string = "Copied to clipboard!") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(label);
    setTimeout(() => {
      setCopiedKey(prev => (prev === key ? null : prev));
    }, 2000);
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

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setEditFullName(emp.fullName || "");
    setEditEmployeeId(emp.employeeId || "");
    setEditUsername(emp.username || "");
    setEditPassword(emp.password || "");
    setEditEmail(emp.email || "");
    setEditMobile(emp.mobile || "");
    setEditDepartment(emp.department || "");
    setEditDesignation(emp.designation || "");
    setEditRoleId(emp.roleId || emp.role?.id || "role_movie_manager");
    setEditStatus(emp.status || "ACTIVE");
    setShowEditPassword(false);
    setEditError(null);
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

  // Edit Full Employee Profile Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setEditError(null);

    if (!editFullName.trim() || !editEmployeeId.trim() || !editUsername.trim() || !editEmail.trim()) {
      setEditError("Full Name, Employee ID, Username, and Official Email are required.");
      return;
    }

    setFormSubmitting(true);
    const res = await employeeService.updateEmployee(editingEmployee.id, {
      fullName: editFullName.trim(),
      employeeId: editEmployeeId.trim().toUpperCase(),
      username: editUsername.trim().toLowerCase(),
      password: editPassword.trim(),
      email: editEmail.trim().toLowerCase(),
      mobile: editMobile.trim() || null,
      department: editDepartment.trim(),
      designation: editDesignation.trim(),
      roleId: editRoleId,
      status: editStatus
    });
    setFormSubmitting(false);

    if (res.success) {
      showToast(`Employee ${editFullName} updated successfully!`);
      const updatedList = await employeeService.getEmployees();
      setEmployees(updatedList);

      // If viewingEmployee was open, update with refreshed data
      if (viewingEmployee && viewingEmployee.id === editingEmployee.id) {
        const refreshed = updatedList.find(e => e.id === editingEmployee.id);
        if (refreshed) setViewingEmployee(refreshed);
      }

      setEditingEmployee(null);
    } else {
      setEditError(res.message);
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
      const updatedList = await employeeService.getEmployees();
      setEmployees(updatedList);
      if (viewingEmployee && viewingEmployee.id === emp.id) {
        const refreshed = updatedList.find(e => e.id === emp.id);
        if (refreshed) setViewingEmployee(refreshed);
      }
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

          {/* Toggle All Passwords Visibility */}
          <button
            type="button"
            onClick={() => setShowAllPasswords(!showAllPasswords)}
            className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showAllPasswords
                ? "bg-gold/20 text-gold border-gold/40 shadow-sm shadow-gold/20"
                : "bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border-white/10"
            }`}
            title={showAllPasswords ? "Hide All Passwords" : "Show All Passwords in Table"}
          >
            {showAllPasswords ? <EyeOff className="w-4 h-4 text-gold" /> : <Eye className="w-4 h-4" />}
            <span>{showAllPasswords ? "Hide Passwords" : "Show Passwords"}</span>
          </button>

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
                <th className="py-4 px-3 min-w-[130px]">Username</th>
                <th className="py-4 px-3 min-w-[140px]">Password</th>
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
                  <td colSpan={11} className="py-12 text-center text-text-muted space-y-2">
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
                  const isPwdVisible = showAllPasswords || !!revealedPasswords[emp.id];
                  const empPassword = emp.password || "Password@123";

                  return (
                    <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Name & Email (Clickable to open Employee Profile Dashboard) */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setViewingEmployee(emp)}
                          className="flex items-center gap-3 cursor-pointer group-hover:translate-x-0.5 transition-transform"
                          title="Click to open Employee Profile Dashboard"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gold/30 to-yellow-600/10 border border-gold/30 flex items-center justify-center font-bold text-[11px] text-gold font-mono shrink-0 shadow-inner group-hover:border-gold">
                            {emp.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate text-xs group-hover:text-gold transition-colors flex items-center gap-1.5">
                              {emp.fullName}
                              <LayoutDashboard className="w-3 h-3 text-gold/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                            <span className="text-[10px] text-text-secondary font-mono block truncate">{emp.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="py-3 px-3">
                        <span
                          onClick={() => copyText(emp.employeeId, `empid_${emp.id}`, "Employee ID copied!")}
                          className="px-2 py-0.5 rounded-lg bg-black/60 border border-gold/20 font-mono text-gold text-[10px] font-bold cursor-pointer hover:border-gold transition-colors inline-block"
                          title="Click to copy Employee ID"
                        >
                          {emp.employeeId}
                        </span>
                      </td>

                      {/* Username with Copy */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono text-text-primary text-[11px] font-semibold bg-white/[0.02] px-2 py-1 rounded-lg border border-white/5 w-fit">
                          <span className="text-white">@{emp.username}</span>
                          <button
                            type="button"
                            onClick={() => copyText(emp.username, `user_${emp.id}`, "Username copied!")}
                            className="p-0.5 text-text-muted hover:text-gold transition-colors"
                            title="Copy Username"
                          >
                            {copiedKey === `user_${emp.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Password Column (Visible with Show/Hide Toggle and Copy) */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] bg-black/50 border border-white/10 px-2.5 py-1 rounded-lg w-fit">
                          <span className="text-amber-300 font-semibold select-all font-mono">
                            {isPwdVisible ? empPassword : "••••••••"}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setRevealedPasswords(prev => ({
                                ...prev,
                                [emp.id]: !prev[emp.id]
                              }))
                            }
                            className="p-0.5 text-text-muted hover:text-white transition-colors"
                            title={isPwdVisible ? "Hide password" : "Show password"}
                          >
                            {isPwdVisible ? (
                              <EyeOff className="w-3 h-3 text-gold" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyText(empPassword, `pwd_${emp.id}`, "Password copied!")}
                            className="p-0.5 text-text-muted hover:text-gold transition-colors"
                            title="Copy Password"
                          >
                            {copiedKey === `pwd_${emp.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
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
                          
                          {/* Open Employee Profile Dashboard */}
                          <button
                            onClick={() => setViewingEmployee(emp)}
                            className="px-2 py-1 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 hover:border-gold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                            title="Open Employee Profile Dashboard"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider hidden lg:inline">Dashboard</span>
                          </button>

                          {/* Edit Full Profile */}
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 transition-all cursor-pointer"
                            title="Edit Full Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

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

                          {/* Permissions */}
                          <button
                            onClick={() => setPermissionEmployee(emp)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-purple-400 hover:bg-purple-500/10 transition-all cursor-pointer"
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
      {/* EDIT FULL EMPLOYEE PROFILE MODAL */}
      {/* ======================================================== */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shadow-inner">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Edit Full Employee Profile</span>
                    <span className="font-mono text-gold text-[10px] px-2 py-0.5 rounded bg-gold/10 border border-gold/20">
                      {editingEmployee.employeeId}
                    </span>
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    Update complete staff personal, credentials, operational role & security access
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingEmployee(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              {editError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
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
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold font-medium"
                    required
                  />
                </div>

                {/* Employee ID */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex justify-between">
                    <span>Employee ID (Unique) *</span>
                    <span className="text-gold font-mono text-[9px]">e.g. EMP-1002</span>
                  </label>
                  <input
                    type="text"
                    value={editEmployeeId}
                    onChange={(e) => setEditEmployeeId(e.target.value.toUpperCase())}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold font-mono uppercase"
                    required
                  />
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex justify-between">
                    <span>Username (Login ID) *</span>
                    <span className="text-text-muted font-mono text-[9px]">Used for staff login</span>
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold font-mono"
                    required
                  />
                </div>

                {/* Password Direct Editing */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex justify-between">
                    <span>Password *</span>
                    <span className="text-amber-300 font-mono text-[9px]">Visible & Editable</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? "text" : "password"}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-3.5 pr-20 py-2.5 text-xs text-white focus:outline-none focus:border-gold font-mono"
                      required
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="p-1 text-text-muted hover:text-white transition-colors"
                        title={showEditPassword ? "Hide password" : "Show password"}
                      >
                        {showEditPassword ? <EyeOff className="w-3.5 h-3.5 text-gold" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const randomPwd = `Emp@${Math.floor(1000 + Math.random() * 9000)}`;
                          setEditPassword(randomPwd);
                          setShowEditPassword(true);
                        }}
                        className="p-1 text-gold/70 hover:text-gold transition-colors text-[9px] font-mono border border-gold/20 rounded px-1"
                        title="Generate random password"
                      >
                        Gen
                      </button>
                    </div>
                  </div>
                </div>

                {/* Official Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold font-mono"
                    required
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
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
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
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
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
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
                    value={editRoleId}
                    onChange={(e) => setEditRoleId(e.target.value)}
                    disabled={editingEmployee.id === "emp_super_admin"}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-gold disabled:opacity-60"
                  >
                    {SYSTEM_ROLES.map(r => (
                      <option key={r.id} value={r.id}>{r.displayName} - {r.description.slice(0, 45)}...</option>
                    ))}
                  </select>
                  {editingEmployee.id === "emp_super_admin" && (
                    <p className="text-[9px] text-gold font-mono">Primary Super Admin role is protected.</p>
                  )}
                </div>

                {/* Account Status */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Account Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                    disabled={editingEmployee.id === "emp_super_admin"}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-gold disabled:opacity-60"
                  >
                    <option value="ACTIVE">🟢 Active</option>
                    <option value="INACTIVE">🔴 Inactive</option>
                  </select>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
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
                  <span>{formSubmitting ? "Saving Full Profile..." : "Save Full Profile"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EMPLOYEE PROFILE DASHBOARD MODAL */}
      {/* ======================================================== */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Header Hero Banner */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-gold/10 via-white/[0.02] to-transparent flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gold/40 via-yellow-600/20 to-black border-2 border-gold/40 flex items-center justify-center font-bold text-xl text-gold font-mono shadow-xl shrink-0">
                  {viewingEmployee.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      {viewingEmployee.fullName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gold/15 text-gold border border-gold/30">
                      {viewingEmployee.role.displayName}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      viewingEmployee.status === "ACTIVE"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/15 text-red-400 border border-red-500/30"
                    }`}>
                      {viewingEmployee.status === "ACTIVE" ? "🟢 Active" : "🔴 Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    Employee ID: <span className="font-mono text-gold font-bold">{viewingEmployee.employeeId}</span> • {viewingEmployee.designation} • {viewingEmployee.department}
                  </p>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => openEditModal(viewingEmployee)}
                  className="px-3.5 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-gold/15"
                  title="Edit Full Profile"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingEmployee(null)}
                  className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title="Close Profile Dashboard"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dashboard Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              
              {/* SECTION 1: STAFF CREDENTIALS & AUTHENTICATION ACCESS */}
              <div className="bg-[#18181b]/70 border border-gold/20 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                      <Key className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Staff Authentication & Credentials
                      </h4>
                      <p className="text-[10px] text-text-secondary">
                        Authorized login credentials for CineVenue administration gateway
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const target = viewingEmployee;
                      setResetPasswordEmployee(target);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Key className="w-3 h-3" />
                    <span>Reset Password</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Username Card */}
                  <div className="bg-black/50 border border-white/5 p-3.5 rounded-xl space-y-1.5">
                    <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block font-sans">
                      Username (Staff Login ID)
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-white text-sm font-bold">
                        @{viewingEmployee.username}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyText(viewingEmployee.username, "dash_username", "Username copied to clipboard!")}
                        className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gold text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Copy Username"
                      >
                        {copiedKey === "dash_username" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === "dash_username" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Password Card */}
                  <div className="bg-black/50 border border-white/5 p-3.5 rounded-xl space-y-1.5">
                    <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block font-sans">
                      Authorized Password
                    </span>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-amber-300 text-sm font-bold select-all">
                          {viewingPasswordRevealed ? (viewingEmployee.password || "Password@123") : "••••••••••••"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setViewingPasswordRevealed(!viewingPasswordRevealed)}
                          className="p-1 rounded text-text-muted hover:text-white transition-colors"
                          title={viewingPasswordRevealed ? "Hide Password" : "Show Password"}
                        >
                          {viewingPasswordRevealed ? <EyeOff className="w-3.5 h-3.5 text-gold" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText(viewingEmployee.password || "Password@123", "dash_password", "Password copied to clipboard!")}
                        className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gold text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Copy Password"
                      >
                        {copiedKey === "dash_password" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === "dash_password" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Direct Staff Login Link Banner */}
                <div className="bg-black/40 border border-white/5 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px]">
                  <div className="flex items-center gap-2 font-mono text-text-secondary truncate">
                    <Link2 className="w-4 h-4 text-gold shrink-0" />
                    <span className="truncate">
                      {typeof window !== "undefined" ? window.location.origin : ""}/admin-login?mode=employee&username={viewingEmployee.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${typeof window !== "undefined" ? window.location.origin : ""}/admin-login?mode=employee&username=${encodeURIComponent(viewingEmployee.username)}`;
                        copyText(url, "dash_login_url", "Direct staff login URL copied!");
                      }}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-semibold text-[10px]"
                    >
                      {copiedKey === "dash_login_url" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Link</span>
                    </button>
                    <a
                      href={`/admin-login?mode=employee&username=${encodeURIComponent(viewingEmployee.username)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 rounded-lg transition-colors flex items-center gap-1 font-semibold text-[10px]"
                    >
                      <span>Open Login Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* SECTION 2: FULL PROFILE DETAILS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-gold" />
                  <span>Personal & Organizational Profile</span>
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-black/40 p-4 rounded-xl border border-white/5 font-mono">
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
                    <a href={`mailto:${viewingEmployee.email}`} className="text-gold hover:underline text-xs truncate block">
                      {viewingEmployee.email}
                    </a>
                  </div>

                  <div>
                    <span className="text-[10px] text-text-muted uppercase block font-sans font-bold">Mobile Number</span>
                    <span className="text-white text-xs">{viewingEmployee.mobile || "Not specified"}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-text-muted uppercase block font-sans font-bold">Account Status</span>
                    <span className={`text-xs font-bold ${viewingEmployee.status === "ACTIVE" ? "text-emerald-400" : "text-red-400"}`}>
                      {viewingEmployee.status === "ACTIVE" ? "Active Account" : "Deactivated"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-text-muted uppercase block font-sans font-bold">Date Onboarded</span>
                    <span className="text-white text-xs">
                      {new Date(viewingEmployee.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-text-muted uppercase block font-sans font-bold">Last Login</span>
                    <span className="text-white text-xs">
                      {viewingEmployee.lastLoginAt ? new Date(viewingEmployee.lastLoginAt).toLocaleString("en-IN") : "Never logged in"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-text-muted uppercase block font-sans font-bold">Assigned Role</span>
                    <span className="text-gold text-xs font-bold">{viewingEmployee.role.displayName}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: ROLE & MODULE ACCESS CLEARANCE */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                    <span>Module Operational Clearance</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const target = viewingEmployee;
                      setPermissionEmployee(target);
                    }}
                    className="text-[11px] text-gold hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Customize Permissions</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 font-sans">
                  {SYSTEM_MODULES.map(m => {
                    const hasAccess = viewingEmployee.role.name === "SUPER_ADMIN" || viewingEmployee.permissions?.[m.id]?.VIEW;
                    return (
                      <div
                        key={m.id}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between transition-colors ${
                          hasAccess
                            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                            : "bg-white/[0.02] border-white/5 text-text-muted opacity-40"
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase truncate block">{m.label}</span>
                        <span className="text-[9px] font-mono mt-1 font-semibold">
                          {hasAccess ? "✓ Authorized" : "✕ Restricted"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dashboard Footer Action Bar */}
            <div className="p-4 border-t border-white/5 bg-white/[0.01] flex flex-wrap justify-between items-center gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(viewingEmployee)}
                  className="px-4 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-gold/15"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Full Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = viewingEmployee;
                    setShareEmployee(target);
                    setIsShareModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5 text-gold" />
                  <span>Share Login Link</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={viewingEmployee.id === "emp_super_admin"}
                  onClick={() => handleToggleStatus(viewingEmployee)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    viewingEmployee.status === "ACTIVE"
                      ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                      : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  } ${viewingEmployee.id === "emp_super_admin" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {viewingEmployee.status === "ACTIVE" ? "Deactivate Account" : "Activate Account"}
                </button>

                <button
                  type="button"
                  onClick={() => setViewingEmployee(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-secondary hover:text-white transition-all cursor-pointer"
                >
                  Close Dashboard
                </button>
              </div>
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
          onSuccess={async (msg) => {
            showToast(msg);
            const updatedList = await employeeService.getEmployees();
            setEmployees(updatedList);
            if (viewingEmployee && viewingEmployee.id === resetPasswordEmployee.id) {
              const refreshed = updatedList.find(e => e.id === resetPasswordEmployee.id);
              if (refreshed) setViewingEmployee(refreshed);
            }
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
