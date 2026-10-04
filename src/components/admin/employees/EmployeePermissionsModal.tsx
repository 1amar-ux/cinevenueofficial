import React, { useState } from "react";
import { ShieldCheck, Check, X, Sliders, RotateCcw, AlertCircle, Save } from "lucide-react";
import {
  Employee,
  SYSTEM_MODULES,
  PERMISSION_ACTIONS,
  SYSTEM_ROLES,
  employeeService
} from "../../../services/employeeService";

interface Props {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function EmployeePermissionsModal({ employee, isOpen, onClose, onSuccess }: Props) {
  const [permissions, setPermissions] = useState<{ [module: string]: { [action: string]: boolean } }>(() => {
    return JSON.parse(JSON.stringify(employee.permissions || {}));
  });
  const [loading, setLoading] = useState(false);
  const [filterModule, setFilterModule] = useState<string>("ALL");

  if (!isOpen) return null;

  const isSuperAdmin = employee.role.name === "SUPER_ADMIN" || employee.roleId === "role_super_admin";

  const togglePermission = (moduleId: string, actionId: string) => {
    if (isSuperAdmin) return; // Super admin permissions cannot be altered
    setPermissions(prev => {
      const next = { ...prev };
      if (!next[moduleId]) next[moduleId] = {};
      next[moduleId] = {
        ...next[moduleId],
        [actionId]: !next[moduleId][actionId]
      };
      return next;
    });
  };

  const toggleAllForModule = (moduleId: string, value: boolean) => {
    if (isSuperAdmin) return;
    setPermissions(prev => {
      const next = { ...prev };
      next[moduleId] = {};
      PERMISSION_ACTIONS.forEach(act => {
        next[moduleId][act.id] = value;
      });
      return next;
    });
  };

  const resetToRoleDefaults = () => {
    if (isSuperAdmin) return;
    const roleDef = SYSTEM_ROLES.find(r => r.id === employee.roleId || r.name === employee.roleId) || SYSTEM_ROLES[1];
    setPermissions(JSON.parse(JSON.stringify(roleDef.defaultPermissions)));
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await employeeService.updateEmployeePermissions(employee.id, permissions);
    setLoading(false);

    if (res.success) {
      onSuccess(`Access permissions successfully configured for ${employee.fullName}.`);
      onClose();
    } else {
      alert(res.message);
    }
  };

  const displayedModules = filterModule === "ALL"
    ? SYSTEM_MODULES
    : SYSTEM_MODULES.filter(m => m.id === filterModule);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in text-left">
      <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Custom Permissions Matrix
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-gold/10 text-gold border border-gold/20">
                  {employee.role.displayName}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary">
                {employee.fullName} • <span className="font-mono text-gold">{employee.employeeId}</span> • {employee.department}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subheader / Quick Actions */}
        <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Filter Module:</span>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-gold"
            >
              <option value="ALL">All Modules ({SYSTEM_MODULES.length})</option>
              {SYSTEM_MODULES.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {!isSuperAdmin && (
              <button
                type="button"
                onClick={resetToRoleDefaults}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Role Defaults</span>
              </button>
            )}
          </div>
        </div>

        {isSuperAdmin && (
          <div className="m-5 mb-0 p-3 bg-gold/10 border border-gold/20 rounded-xl flex items-center gap-2 text-gold text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Super Admin has universal, unrestricted access across all system modules and actions.</span>
          </div>
        )}

        {/* Matrix Table */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="border border-white/5 rounded-xl overflow-hidden bg-black/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-[10px] uppercase font-bold text-text-muted">
                  <th className="py-3 px-4 min-w-[200px]">System Module</th>
                  {PERMISSION_ACTIONS.map(act => (
                    <th key={act.id} className="py-3 px-2 text-center">
                      {act.label}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center">Quick Set</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-mono">
                {displayedModules.map(mod => {
                  const modPerms = permissions[mod.id] || {};
                  const allActive = PERMISSION_ACTIONS.every(act => !!modPerms[act.id]);

                  return (
                    <tr key={mod.id} className="hover:bg-white/[0.01] transition-colors">
                      {/* Module Title */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white font-sans text-xs">{mod.label}</div>
                        <div className="text-[10px] text-text-secondary font-mono">{mod.description}</div>
                      </td>

                      {/* Permission Action Toggles */}
                      {PERMISSION_ACTIONS.map(act => {
                        const isGranted = isSuperAdmin ? true : !!modPerms[act.id];

                        return (
                          <td key={act.id} className="py-3 px-2 text-center">
                            <button
                              type="button"
                              disabled={isSuperAdmin}
                              onClick={() => togglePermission(mod.id, act.id)}
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                                isGranted
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                                  : "bg-white/[0.02] text-text-muted border border-white/5 hover:border-white/20"
                              } ${isSuperAdmin ? "opacity-60 cursor-not-allowed" : ""}`}
                              title={`${mod.label} - ${act.label}: ${isGranted ? "ON" : "OFF"}`}
                            >
                              {isGranted ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 opacity-30" />}
                            </button>
                          </td>
                        );
                      })}

                      {/* Quick Set for entire row */}
                      <td className="py-3 px-3 text-center">
                        {!isSuperAdmin && (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => toggleAllForModule(mod.id, true)}
                              className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded bg-white/5 hover:bg-white/10 text-emerald-400 hover:text-emerald-300"
                            >
                              All
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleAllForModule(mod.id, false)}
                              className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded bg-white/5 hover:bg-white/10 text-red-400 hover:text-red-300"
                            >
                              Clear
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex justify-between items-center shrink-0">
          <p className="text-[10px] text-text-secondary">
            Permissions take effect instantly across active sessions and frontend modules.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/10 text-xs font-semibold text-text-secondary hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            {!isSuperAdmin && (
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-5 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-gold/15"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? "Saving..." : "Save Permissions"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
