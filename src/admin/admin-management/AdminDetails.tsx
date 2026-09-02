import React from "react";
import { X, Mail, Phone, MapPin, Calendar, Clock, Shield, User, UserCheck } from "lucide-react";
import { Admin, PERMISSION_CATEGORIES } from "./types";

interface AdminDetailsProps {
  admin: Admin;
  onClose: () => void;
}

export default function AdminDetails({ admin, onClose }: AdminDetailsProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        id="admin-details-card"
        className="relative w-full max-w-4xl bg-[#121213] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gold" />
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Admin Registry Profile</h3>
              <p className="text-[10px] font-mono text-gold uppercase">{admin.id} / {admin.employeeId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left side: Profile Image & Main Status */}
            <div className="flex flex-col items-center text-center space-y-4 md:w-56 shrink-0">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gold/30">
                <img 
                  src={admin.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"} 
                  alt={admin.fullName} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{admin.fullName}</h4>
                <p className="text-[10px] font-mono text-gold font-bold mt-0.5">{admin.role}</p>
                <p className="text-[10px] text-text-secondary mt-0.5">{admin.department}</p>
              </div>

              <span className={`px-3 py-1 text-[10px] rounded-full font-bold uppercase tracking-wider border ${
                admin.status === "Active"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : admin.status === "Suspended"
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}>
                ● {admin.status}
              </span>
            </div>

            {/* Right side: Detailed Stats */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase">
                  <Mail className="w-3.5 h-3.5 text-gold" />
                  <span>Email Address</span>
                </div>
                <span className="text-xs text-white block select-all font-semibold">{admin.email}</span>
              </div>

              <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase">
                  <Phone className="w-3.5 h-3.5 text-gold" />
                  <span>Mobile Number</span>
                </div>
                <span className="text-xs text-white block font-mono font-semibold">{admin.mobileNumber}</span>
              </div>

              <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase">
                  <UserCheck className="w-3.5 h-3.5 text-gold" />
                  <span>Gender</span>
                </div>
                <span className="text-xs text-white block font-semibold">{admin.gender}</span>
              </div>

              <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase">
                  <Clock className="w-3.5 h-3.5 text-gold" />
                  <span>Last Login Activity</span>
                </div>
                <span className="text-xs text-white block font-mono font-semibold">{admin.lastLogin}</span>
              </div>

              <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase">
                  <Calendar className="w-3.5 h-3.5 text-gold" />
                  <span>Member Since</span>
                </div>
                <span className="text-xs text-white block font-mono font-semibold">{admin.createdDate}</span>
              </div>

              <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-1.5 sm:col-span-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase">
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                  <span>Address / Corporate Residence</span>
                </div>
                <span className="text-xs text-white block font-semibold">{admin.address}</span>
              </div>
            </div>
          </div>

          {/* Core Privileges Matrix Checklist (Read-Only) */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-gold" />
              <span>Assigned Security Privilege Grid</span>
            </h4>
            
            {admin.permissions ? (
              <div className="border border-white/5 rounded-xl overflow-hidden text-[10px]">
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
                  <tbody className="divide-y divide-white/5 text-text-secondary">
                    {PERMISSION_CATEGORIES.map((category) => {
                      const perms = admin.permissions?.[category] || { create: false, read: false, update: false, delete: false, approve: false, export: false };
                      return (
                        <tr key={category} className="hover:bg-white/[0.01]">
                          <td className="p-2 font-bold text-white/95">{category}</td>
                          <td className="p-2 text-center">
                            <span className={perms.create ? "text-emerald-400 font-bold" : "text-white/20"}>
                              {perms.create ? "✓" : "✗"}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <span className={perms.read ? "text-emerald-400 font-bold" : "text-white/20"}>
                              {perms.read ? "✓" : "✗"}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <span className={perms.update ? "text-emerald-400 font-bold" : "text-white/20"}>
                              {perms.update ? "✓" : "✗"}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <span className={perms.delete ? "text-emerald-400 font-bold" : "text-white/20"}>
                              {perms.delete ? "✓" : "✗"}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <span className={perms.approve ? "text-emerald-400 font-bold" : "text-white/20"}>
                              {perms.approve ? "✓" : "✗"}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <span className={perms.export ? "text-emerald-400 font-bold" : "text-white/20"}>
                              {perms.export ? "✓" : "✗"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[10px] text-text-secondary italic">This user inherits standard role-based directory constraints.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gold hover:bg-gold-light text-black text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all"
          >
            Acknowledge Profile
          </button>
        </div>
      </div>
    </div>
  );
}
