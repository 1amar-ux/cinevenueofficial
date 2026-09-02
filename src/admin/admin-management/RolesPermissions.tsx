import React, { useState } from "react";
import { Plus, Shield, Trash2, Edit2, CheckSquare, Square, Save, HelpCircle } from "lucide-react";
import { Role, PermissionMatrix, PERMISSION_CATEGORIES, DEFAULT_PERMISSION_MATRIX } from "./types";

interface RolesPermissionsProps {
  roles: Role[];
  onSaveRole: (role: Role) => void;
  onDeleteRole: (roleId: string) => void;
  onAddAuditLog: (action: string, description: string, newData?: string) => void;
}

export default function RolesPermissions({ roles, onSaveRole, onDeleteRole, onAddAuditLog }: RolesPermissionsProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>("r1");
  const [isCreating, setIsCreating] = useState(false);
  
  // Create role states
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState<PermissionMatrix>({ ...DEFAULT_PERMISSION_MATRIX });

  const activeRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  const handleSaveNewRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const addedRole: Role = {
      id: "r-" + Math.floor(100 + Math.random() * 900),
      name: newRoleName.trim(),
      description: newRoleDesc.trim() || "Custom security clearance role.",
      permissions: newRolePermissions,
      isSystem: false
    };

    onSaveRole(addedRole);
    setNewRoleName("");
    setNewRoleDesc("");
    setNewRolePermissions({ ...DEFAULT_PERMISSION_MATRIX });
    setIsCreating(false);
    setSelectedRoleId(addedRole.id);
    onAddAuditLog(
      "Created Custom Security Role",
      `Compiled custom role "${addedRole.name}" with fine-grained access clearances`,
      JSON.stringify(addedRole)
    );
  };

  const handleDeleteClick = (roleId: string, roleName: string) => {
    if (confirm(`Are you absolutely sure you want to delete the custom role "${roleName}"? All assigned admins will revert to standard directory defaults.`)) {
      onDeleteRole(roleId);
      if (selectedRoleId === roleId) {
        setSelectedRoleId(roles[0].id);
      }
      onAddAuditLog(
        "Deleted Security Role",
        `De-registered custom role "${roleName}" from database matrices`
      );
    }
  };

  const togglePermission = (category: string, action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export') => {
    if (activeRole.isSystem) {
      alert("System roles have immutable security protocols and cannot be edited directly. Create a custom role to customize matrix configurations.");
      return;
    }

    const updatedPermissions = JSON.parse(JSON.stringify(activeRole.permissions)) as PermissionMatrix;
    updatedPermissions[category][action] = !updatedPermissions[category][action];

    const updatedRole: Role = {
      ...activeRole,
      permissions: updatedPermissions
    };

    onSaveRole(updatedRole);
    onAddAuditLog(
      "Updated Role Permissions Matrix",
      `Modified permission clearance "${action.toUpperCase()}" for category "${category}" on role "${activeRole.name}"`,
      JSON.stringify(updatedRole)
    );
  };

  const toggleNewRolePermission = (category: string, action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export') => {
    const updated = { ...newRolePermissions };
    updated[category] = {
      ...updated[category],
      [action]: !updated[category][action]
    };
    setNewRolePermissions(updated);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Roles & Permissions Management</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Formulate custom clearance hierarchies, check immutable system roles, and configure matrix permissions across 16 categories
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="self-start sm:self-auto px-4 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Formulate Custom Role</span>
        </button>
      </div>

      {/* Create Role Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#121213] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Formulate Custom Security Role</h3>
              <button onClick={() => setIsCreating(false)} className="text-text-secondary hover:text-white text-xs font-bold">Cancel</button>
            </div>
            
            <form onSubmit={handleSaveNewRole} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/75 block mb-1.5">Role Name *</label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g. Marketing Auditor"
                    required
                    className="w-full bg-white/[0.02] border border-white/10 focus:border-gold px-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/75 block mb-1.5">Operational Description</label>
                  <input
                    type="text"
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    placeholder="Brief description of responsibilities..."
                    className="w-full bg-white/[0.02] border border-white/10 focus:border-gold px-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none"
                  />
                </div>
              </div>

              {/* Editable Matrix for New Role */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/75 block">Clearance matrix assignments</span>
                <div className="overflow-x-auto border border-white/5 rounded-xl text-[10px]">
                  <table className="w-full text-left font-mono">
                    <thead className="bg-white/[0.03] text-white">
                      <tr>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5 text-center">C</th>
                        <th className="p-2.5 text-center">R</th>
                        <th className="p-2.5 text-center">U</th>
                        <th className="p-2.5 text-center">D</th>
                        <th className="p-2.5 text-center">Approve</th>
                        <th className="p-2.5 text-center">Export</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {PERMISSION_CATEGORIES.map((category) => (
                        <tr key={category} className="hover:bg-white/[0.01]">
                          <td className="p-2 text-white font-bold">{category}</td>
                          {(["create", "read", "update", "delete", "approve", "export"] as const).map((action) => {
                            const isChecked = newRolePermissions[category]?.[action] || false;
                            return (
                              <td key={action} className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleNewRolePermission(category, action)}
                                  className="inline-flex p-0.5 hover:bg-white/5 rounded"
                                >
                                  {isChecked ? (
                                    <CheckSquare className="w-4 h-4 text-gold" />
                                  ) : (
                                    <Square className="w-4 h-4 text-white/10" />
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[10px] text-white font-bold rounded-lg uppercase tracking-wider"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gold hover:bg-gold-light text-black text-[10px] font-bold rounded-lg uppercase tracking-wider"
                >
                  Compile & Instantiate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Roles Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: Roles selection */}
        <div className="bg-[#121213] border border-white/5 p-4 rounded-2xl space-y-3 shrink-0 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">Active Roles</h3>
          <div className="space-y-1">
            {roles.map((r) => {
              const isSelected = selectedRoleId === r.id;
              return (
                <div 
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={`w-full p-3 rounded-xl transition-all text-left cursor-pointer flex justify-between items-center group border ${
                    isSelected 
                      ? "bg-gold/10 border-gold/30 text-gold shadow-md" 
                      : "border-transparent hover:bg-white/[0.01] text-text-secondary"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-white group-hover:text-gold transition-colors">{r.name}</span>
                      {r.isSystem && (
                        <span className="text-[7px] px-1 bg-white/5 rounded text-white/40 uppercase font-mono tracking-wider font-semibold">System</span>
                      )}
                    </div>
                    <p className="text-[9px] text-text-muted line-clamp-1">{r.description}</p>
                  </div>

                  {!r.isSystem && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(r.id, r.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 bg-red-500/10 hover:bg-red-500 hover:text-black border border-red-500/10 text-red-400 rounded transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Selected Role permissions matrix */}
        <div className="lg:col-span-3 bg-[#121213] border border-white/5 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-start border-b border-white/5 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">{activeRole?.name} Clearance Map</h3>
              <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">{activeRole?.description}</p>
            </div>
            {activeRole?.isSystem ? (
              <span className="text-[9px] px-2.5 py-1 bg-white/5 text-white/60 border border-white/5 rounded-full font-mono font-bold uppercase tracking-wider">
                🔒 Immutable System Security Scheme
              </span>
            ) : (
              <span className="text-[9px] px-2.5 py-1 bg-gold/10 text-gold border border-gold/20 rounded-full font-mono font-bold uppercase tracking-wider">
                ⚡ Custom Security Scheme
              </span>
            )}
          </div>

          <div className="overflow-x-auto border border-white/5 rounded-xl text-[10px]">
            <table className="w-full text-left border-collapse font-mono">
              <thead className="bg-white/[0.03] text-white">
                <tr>
                  <th className="p-3">Permission Category</th>
                  <th className="p-3 text-center">C (Create)</th>
                  <th className="p-3 text-center">R (Read)</th>
                  <th className="p-3 text-center">U (Update)</th>
                  <th className="p-3 text-center">D (Delete)</th>
                  <th className="p-3 text-center">Approve</th>
                  <th className="p-3 text-center">Export</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-text-secondary">
                {PERMISSION_CATEGORIES.map((category) => {
                  const perms = activeRole?.permissions?.[category] || { create: false, read: false, update: false, delete: false, approve: false, export: false };
                  return (
                    <tr key={category} className="hover:bg-white/[0.01]">
                      <td className="p-2.5 font-bold text-white/90">{category}</td>
                      {(["create", "read", "update", "delete", "approve", "export"] as const).map((action) => {
                        const isChecked = perms[action];
                        return (
                          <td key={action} className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => togglePermission(category, action)}
                              disabled={activeRole?.isSystem}
                              className={`inline-flex p-1 rounded-md transition-colors ${
                                activeRole?.isSystem ? "cursor-not-allowed opacity-60" : "hover:bg-white/5"
                              }`}
                            >
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-gold" />
                              ) : (
                                <Square className="w-4 h-4 text-white/10" />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2 items-center bg-white/[0.01] border border-white/5 p-3.5 rounded-xl text-[10px] text-text-secondary leading-relaxed">
            <HelpCircle className="w-4.5 h-4.5 text-gold shrink-0" />
            <span>
              <strong>Matrix Legend:</strong> <strong>C</strong> allows database inserts. <strong>R</strong> controls dashboard rendering. <strong>U</strong> allows entry edits. <strong>D</strong> controls archive destructions. <strong>Approve</strong> releases pending states. <strong>Export</strong> permits bulk CSV compilation downloads.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
