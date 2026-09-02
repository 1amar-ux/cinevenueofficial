import React, { useState } from "react";
import { Users, Plus, Shield, ShieldCheck, Mail, Trash2, Key, Info } from "lucide-react";

export interface VenueStaff {
  id: string;
  name: string;
  email: string;
  role: "Manager" | "Cashier" | "Scanner";
  permissions: {
    editSchedules: boolean;
    concessions: boolean;
    scanTickets: boolean;
    financials: boolean;
  };
}

interface StaffProps {
  theatreId: number;
}

export default function Staff({ theatreId }: StaffProps) {
  const [staffList, setStaffList] = useState<VenueStaff[]>(() => {
    const cached = localStorage.getItem(`cine_staff_${theatreId}`);
    if (cached) return JSON.parse(cached);
    return [
      { id: "st-1", name: "Ramesh Kumar", email: "ramesh.k@cinevenue.com", role: "Manager", permissions: { editSchedules: true, concessions: true, scanTickets: true, financials: true } },
      { id: "st-2", name: "Anjali Gupta", email: "anjali.g@cinevenue.com", role: "Cashier", permissions: { editSchedules: false, concessions: true, scanTickets: true, financials: false } },
      { id: "st-3", name: "Vikram Singh", email: "vikram.s@cinevenue.com", role: "Scanner", permissions: { editSchedules: false, concessions: false, scanTickets: true, financials: false } }
    ];
  });

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"Manager" | "Cashier" | "Scanner">("Scanner");
  const [isAdding, setIsAdding] = useState(false);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    // Build permissions based on role presets
    const isMgr = newRole === "Manager";
    const isCashier = newRole === "Cashier";

    const added: VenueStaff = {
      id: "st-" + Math.floor(100 + Math.random() * 900),
      name: newName,
      email: newEmail,
      role: newRole,
      permissions: {
        editSchedules: isMgr,
        concessions: isMgr || isCashier,
        scanTickets: true,
        financials: isMgr
      }
    };

    const updated = [...staffList, added];
    setStaffList(updated);
    localStorage.setItem(`cine_staff_${theatreId}`, JSON.stringify(updated));

    setNewName("");
    setNewEmail("");
    setIsAdding(false);
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm("Revoke all partner credentials and remove staff?")) {
      const updated = staffList.filter((st) => st.id !== id);
      setStaffList(updated);
      localStorage.setItem(`cine_staff_${theatreId}`, JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6 text-left select-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-text-primary tracking-wide">
            Staff & Access Credentials
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Assign partner credentials, select worker roles, and manage system access permissions
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border-0 shadow-lg shadow-gold/10"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Appoint Staff Member</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleCreateStaff} className="bg-[#121215] border border-white/5 rounded-2xl p-6 space-y-4 max-w-xl text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-white/5 pb-2">
            Appoint New Crew Worker
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Worker Full Name</label>
              <input
                type="text"
                required
                className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2 rounded-xl text-text-primary focus:border-gold focus:outline-none"
                placeholder="Enter staff member name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Operational Email</label>
              <input
                type="email"
                required
                className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2 rounded-xl text-text-primary focus:border-gold focus:outline-none"
                placeholder="staff@theatre.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Security Role Preset</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3 py-2 rounded-xl text-text-primary focus:outline-none cursor-pointer"
              >
                <option value="Scanner" className="bg-[#0A0A0B]">Ticket Scanner / Usher</option>
                <option value="Cashier" className="bg-[#0A0A0B]">Concession Counter Cashier</option>
                <option value="Manager" className="bg-[#0A0A0B]">Venue Senior Manager</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-text-secondary rounded-xl font-bold uppercase tracking-wider transition-colors cursor-pointer border-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer border-0"
            >
              Appoint & Activate Crew
            </button>
          </div>
        </form>
      )}

      {/* Staff Roster Table */}
      <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-white/5 pb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-gold" />
          <span>Active Venue Crew & Security Roster ({staffList.length})</span>
        </h3>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="text-text-secondary border-b border-white/5">
                <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Crew ID</th>
                <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Worker Details</th>
                <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Designated Role</th>
                <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Permissions</th>
                <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {staffList.map((st) => (
                <tr key={st.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-4 font-mono font-semibold text-text-muted">{st.id}</td>
                  <td className="py-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-text-primary block">{st.name}</span>
                      <span className="text-[10px] text-text-muted flex items-center gap-1 font-mono">
                        <Mail className="w-3 h-3" /> {st.email}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 border border-gold/20 px-2.5 py-1 rounded-full">
                      <Shield className="w-3 h-3" />
                      <span>{st.role}</span>
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-1.5 flex-wrap text-[9px] font-bold uppercase tracking-wider">
                      {st.permissions.editSchedules && <span className="px-2 py-0.5 rounded bg-[#1C1A1E] text-text-secondary">Shows</span>}
                      {st.permissions.concessions && <span className="px-2 py-0.5 rounded bg-[#1C1A1E] text-text-secondary">Snacks</span>}
                      {st.permissions.scanTickets && <span className="px-2 py-0.5 rounded bg-[#1C1A1E] text-text-secondary">Scanner</span>}
                      {st.permissions.financials && <span className="px-2 py-0.5 rounded bg-[#1C1A1E] text-text-secondary">Finances</span>}
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteStaff(st.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-black border border-red-500/10 text-red-400 cursor-pointer transition-colors"
                      title="De-authorize staff member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
