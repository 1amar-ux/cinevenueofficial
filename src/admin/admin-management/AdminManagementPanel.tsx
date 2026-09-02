import React, { useState, useEffect } from "react";
import { 
  Users, Plus, ShieldAlert, Clock, Activity, Shield, Key 
} from "lucide-react";
import { Admin, Role, LoginActivity, AuditLog } from "./types";
import { INITIAL_ADMINS, INITIAL_ROLES, INITIAL_LOGIN_ACTIVITIES, INITIAL_AUDIT_LOGS } from "./mockData";
import AdminList from "./AdminList";
import CreateAdmin from "./CreateAdmin";
import EditAdmin from "./EditAdmin";
import AdminDetails from "./AdminDetails";
import RolesPermissions from "./RolesPermissions";
import LoginActivityView from "./LoginActivity";
import AuditLogView from "./AuditLogView";

export default function AdminManagementPanel() {
  const [activeSubTab, setActiveSubTab] = useState<"list" | "create" | "edit" | "roles" | "login" | "audit">("list");
  
  // Data States
  const [admins, setAdmins] = useState<Admin[]>(() => {
    const cached = localStorage.getItem("sa_admin_management_admins");
    return cached ? JSON.parse(cached) : INITIAL_ADMINS;
  });

  const [roles, setRoles] = useState<Role[]>(() => {
    const cached = localStorage.getItem("sa_admin_management_roles");
    return cached ? JSON.parse(cached) : INITIAL_ROLES;
  });

  const [loginActivities, setLoginActivities] = useState<LoginActivity[]>(() => {
    const cached = localStorage.getItem("sa_admin_management_login_activities");
    return cached ? JSON.parse(cached) : INITIAL_LOGIN_ACTIVITIES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const cached = localStorage.getItem("sa_admin_management_audit_logs");
    return cached ? JSON.parse(cached) : INITIAL_AUDIT_LOGS;
  });

  // Navigation / Modal States
  const [selectedAdminForDetails, setSelectedAdminForDetails] = useState<Admin | null>(null);
  const [selectedAdminForEdit, setSelectedAdminForEdit] = useState<Admin | null>(null);

  // Persistence triggers
  useEffect(() => {
    localStorage.setItem("sa_admin_management_admins", JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    localStorage.setItem("sa_admin_management_roles", JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem("sa_admin_management_login_activities", JSON.stringify(loginActivities));
  }, [loginActivities]);

  useEffect(() => {
    localStorage.setItem("sa_admin_management_audit_logs", JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Audit logger helper
  const addAuditLog = (action: string, description: string, oldData?: string, newData?: string) => {
    const newLog: AuditLog = {
      id: "AUD-" + Math.floor(1000 + Math.random() * 9000),
      adminName: "Amarnath Gattem",
      adminEmail: "amarnathgattem@gmail.com",
      action,
      module: "Admin Management",
      description,
      oldData,
      newData,
      ipAddress: "103.22.41.8", // Mock current IP
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: "Success"
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Toast Notification handler
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. CREATE ADMIN
  const handleCreateAdmin = (newAdmin: Admin) => {
    setAdmins(prev => [newAdmin, ...prev]);
    setActiveSubTab("list");
    triggerToast(`Compiled & registered admin: ${newAdmin.fullName}`);
    
    // Auto-log a success Login Activity record
    const newLA: LoginActivity = {
      id: "LA-" + Math.floor(20000 + Math.random() * 9000),
      adminName: newAdmin.fullName,
      adminEmail: newAdmin.email,
      ipAddress: "103.22.41.8",
      browser: "Chrome 124.0.0",
      os: "macOS Sonoma",
      device: "Desktop",
      location: "Hyderabad, India",
      loginTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      logoutTime: "Active Session",
      status: "Success"
    };
    setLoginActivities(prev => [newLA, ...prev]);
  };

  // 2. EDIT ADMIN
  const handleSaveEditAdmin = (updatedAdmin: Admin) => {
    setAdmins(prev => prev.map(a => a.email === updatedAdmin.email ? updatedAdmin : a));
    setActiveSubTab("list");
    setSelectedAdminForEdit(null);
    triggerToast(`Successfully modified credentials for ${updatedAdmin.fullName}`);
  };

  // 3. RESET PASSWORD
  const handleResetPassword = (email: string) => {
    const admin = admins.find(a => a.email === email);
    if (!admin) return;

    if (confirm(`Trigger remote access credential reset for "${admin.fullName}" (${email})? An email code with code-hash access parameters will be compiled immediately.`)) {
      triggerToast(`Dispatched secure reset link to ${email}`);
      addAuditLog(
        "Initiated Access Reset Protocol",
        `Triggered remote password credential reset ticket for administrator profile ${admin.fullName} (${email})`
      );
    }
  };

  // 4. DELETE ADMIN
  const handleDeleteAdmin = (email: string) => {
    const admin = admins.find(a => a.email === email);
    if (!admin) return;

    if (confirm(`WARNING: Are you absolutely sure you want to permanently erase the administrative profile for "${admin.fullName}" (${email})? This action is cryptographically logged and irreversible.`)) {
      setAdmins(prev => prev.filter(a => a.email !== email));
      triggerToast(`Admin account ${email} deleted.`);
      addAuditLog(
        "Account De-registration",
        `Permanently purged administrative account for ${admin.fullName} (${email}) from database ledger`
      );
    }
  };

  // 5. UPDATE INDIVIDUAL STATUS
  const handleUpdateStatus = (email: string, status: 'Active' | 'Inactive' | 'Suspended') => {
    setAdmins(prev => prev.map(a => a.email === email ? { ...a, status } : a));
    triggerToast(`Status set to ${status} for ${email}`);
    addAuditLog(
      "Privilege Level Modified",
      `Adjusted access profile state to "${status}" for ${email}`
    );
  };

  // 6. BULK ACTIONS
  const handleBulkDelete = (emails: string[]) => {
    setAdmins(prev => prev.filter(a => !emails.includes(a.email)));
    triggerToast(`Purged ${emails.length} administrative account ledger entries.`);
    addAuditLog(
      "Bulk Account Purge",
      `Executed batch removal sequence for ${emails.length} profile coordinates: ${emails.join(", ")}`
    );
  };

  const handleBulkUpdateStatus = (emails: string[], status: 'Active' | 'Inactive' | 'Suspended') => {
    setAdmins(prev => prev.map(a => emails.includes(a.email) ? { ...a, status } : a));
    triggerToast(`Batch modified status to ${status} for selected administrators.`);
    addAuditLog(
      "Bulk State Adjustment",
      `Executed bulk privilege switch to status "${status}" for profile cluster: ${emails.join(", ")}`
    );
  };

  // 7. ROLE CONFIGURE
  const handleSaveRole = (updatedRole: Role) => {
    setRoles(prev => {
      const exists = prev.some(r => r.id === updatedRole.id);
      if (exists) {
        return prev.map(r => r.id === updatedRole.id ? updatedRole : r);
      }
      return [...prev, updatedRole];
    });
    triggerToast(`Successfully registered security rules for role "${updatedRole.name}"`);
  };

  const handleDeleteRole = (roleId: string) => {
    setRoles(prev => prev.filter(r => r.id !== roleId));
    triggerToast("Role registration deleted from platform directory.");
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notifier */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#121213] border border-gold/30 p-4 rounded-xl text-xs font-bold text-gold flex items-center gap-2 shadow-2xl animate-bounce">
          <Shield className="w-4 h-4 text-gold shrink-0 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin details profile viewer */}
      {selectedAdminForDetails && (
        <AdminDetails 
          admin={selectedAdminForDetails} 
          onClose={() => setSelectedAdminForDetails(null)} 
        />
      )}

      {/* Top Section Navigation tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto pb-0.5 no-scrollbar scroll-smooth gap-1">
        {[
          { id: "list", label: "Admin Registry", icon: Users },
          { id: "create", label: "Provision Admin", icon: Plus },
          { id: "roles", label: "Privileges & Matrices", icon: Shield },
          { id: "login", label: "Login Access Ledger", icon: Clock },
          { id: "audit", label: "System Audit Logs", icon: Activity }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id || (tab.id === "list" && activeSubTab === "edit");
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "create") {
                  setActiveSubTab("create");
                } else if (tab.id === "list") {
                  setActiveSubTab("list");
                } else {
                  setActiveSubTab(tab.id as any);
                }
              }}
              className={`flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                isActive 
                  ? "border-gold text-gold bg-gold/5" 
                  : "border-transparent text-text-secondary hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area Routing */}
      <div className="mt-4">
        {activeSubTab === "list" && (
          <AdminList
            admins={admins}
            roles={roles}
            onView={(admin) => setSelectedAdminForDetails(admin)}
            onEdit={(admin) => {
              setSelectedAdminForEdit(admin);
              setActiveSubTab("edit");
            }}
            onResetPassword={handleResetPassword}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteAdmin}
            onBulkDelete={handleBulkDelete}
            onBulkUpdateStatus={handleBulkUpdateStatus}
          />
        )}

        {activeSubTab === "create" && (
          <CreateAdmin
            roles={roles}
            onSave={handleCreateAdmin}
            onCancel={() => setActiveSubTab("list")}
            onAddAuditLog={addAuditLog}
          />
        )}

        {activeSubTab === "edit" && selectedAdminForEdit && (
          <EditAdmin
            admin={selectedAdminForEdit}
            roles={roles}
            onSave={handleSaveEditAdmin}
            onCancel={() => {
              setSelectedAdminForEdit(null);
              setActiveSubTab("list");
            }}
            onAddAuditLog={addAuditLog}
          />
        )}

        {activeSubTab === "roles" && (
          <RolesPermissions
            roles={roles}
            onSaveRole={handleSaveRole}
            onDeleteRole={handleDeleteRole}
            onAddAuditLog={addAuditLog}
          />
        )}

        {activeSubTab === "login" && (
          <LoginActivityView
            logs={loginActivities}
          />
        )}

        {activeSubTab === "audit" && (
          <AuditLogView
            logs={auditLogs}
          />
        )}
      </div>
    </div>
  );
}
