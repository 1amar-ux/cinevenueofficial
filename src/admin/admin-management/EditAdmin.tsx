import React, { useState, useEffect } from "react";
import { 
  Save, Shield, Key, Eye, EyeOff, Upload, User, 
  Mail, Phone, MapPin, CheckSquare, Square, RefreshCw, Sparkles, Check
} from "lucide-react";
import { Admin, Role, PermissionMatrix, PERMISSION_CATEGORIES, DEFAULT_PERMISSION_MATRIX } from "./types";

interface EditAdminProps {
  admin: Admin;
  roles: Role[];
  onSave: (updatedAdmin: Admin) => void;
  onCancel: () => void;
  onAddAuditLog: (action: string, description: string, oldData?: string, newData?: string) => void;
}

export default function EditAdmin({ admin, roles, onSave, onCancel, onAddAuditLog }: EditAdminProps) {
  // Fields (Email is read-only)
  const [fullName, setFullName] = useState(admin.fullName);
  const [mobileNumber, setMobileNumber] = useState(admin.mobileNumber);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(admin.gender);
  const [profileImage, setProfileImage] = useState(admin.profileImage);
  const [role, setRole] = useState(admin.role);
  const [department, setDepartment] = useState(admin.department);
  const [employeeId, setEmployeeId] = useState(admin.employeeId);
  const [address, setAddress] = useState(admin.address);
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Suspended'>(admin.status);

  // Custom permissions matrix toggle
  const [customPermissions, setCustomPermissions] = useState<PermissionMatrix>(
    admin.permissions ? JSON.parse(JSON.stringify(admin.permissions)) : { ...DEFAULT_PERMISSION_MATRIX }
  );
  const [useCustomPermissions, setUseCustomPermissions] = useState(!!admin.permissions);

  // UI state
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [dragActive, setDragActive] = useState(false);

  // Update permissions if role changes, BUT only if useCustomPermissions was off or toggled
  const handleRoleChange = (selectedRole: string) => {
    setRole(selectedRole);
    if (!useCustomPermissions) {
      const selectedRoleObj = roles.find(r => r.name === selectedRole);
      if (selectedRoleObj) {
        setCustomPermissions(JSON.parse(JSON.stringify(selectedRoleObj.permissions)));
      }
    }
  };

  // Validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!fullName.trim()) errors.fullName = "Full name is required";
    
    if (!mobileNumber.trim()) {
      errors.mobileNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(mobileNumber.trim())) {
      errors.mobileNumber = "Requires exactly 10 digits";
    }

    if (!department.trim()) errors.department = "Department name is required";
    if (!employeeId.trim()) errors.employeeId = "Employee identifier is required";
    if (!address.trim()) errors.address = "Residence address is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const imgUrl = profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200";

    const updatedAdmin: Admin = {
      ...admin,
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      gender,
      profileImage: imgUrl,
      role,
      department: department.trim(),
      employeeId: employeeId.trim().toUpperCase(),
      address: address.trim(),
      status,
      permissions: useCustomPermissions ? customPermissions : undefined
    };

    onSave(updatedAdmin);
    onAddAuditLog(
      "Updated Admin account details",
      `Modified dashboard profile details for ${fullName.trim()} (${admin.email})`,
      JSON.stringify(admin),
      JSON.stringify(updatedAdmin)
    );
  };

  const generateRandomAvatar = () => {
    const r = Math.floor(Math.random() * 70);
    const url = `https://xsgames.co/randomusers/assets/avatars/${gender === "Female" ? "female" : "male"}/${r}.jpg`;
    setProfileImage(url);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setProfileImage(`https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200`);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-fadeIn pb-12">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Edit Administrator Profile</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Modify profile listings, shift roles, update initial status, and deploy custom credentials
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-gold hover:bg-gold-light text-black text-xs font-bold rounded-xl uppercase tracking-wider transition-all shadow-lg flex items-center gap-1.5"
          >
            <Save className="w-4.5 h-4.5" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Profile Credentials */}
        <div className="lg:col-span-2 bg-[#121213] border border-white/5 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-gold" />
            <span>Profile Identity Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/75 block mb-1.5">Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className={`w-full bg-white/[0.02] border focus:border-gold px-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none transition-colors ${
                  formErrors.fullName ? "border-red-500/50 bg-red-500/[0.01]" : "border-white/10"
                }`}
              />
              {formErrors.fullName && <p className="text-[9px] text-red-400 mt-1">{formErrors.fullName}</p>}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-1.5 flex items-center gap-1">
                <span>Email Address</span>
                <span className="text-[8px] bg-white/5 px-1 py-0.5 rounded text-white/40">Locked</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                <input
                  type="email"
                  value={admin.email}
                  disabled
                  className="w-full bg-white/[0.01] border border-white/5 pl-9 pr-3.5 py-2.5 rounded-xl text-white/40 text-[11px] focus:outline-none cursor-not-allowed select-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/75 block mb-1.5">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className={`w-full bg-white/[0.02] border focus:border-gold pl-9 pr-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none transition-colors ${
                    formErrors.mobileNumber ? "border-red-500/50 bg-red-500/[0.01]" : "border-white/10"
                  }`}
                />
              </div>
              {formErrors.mobileNumber && <p className="text-[9px] text-red-400 mt-1">{formErrors.mobileNumber}</p>}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/75 block mb-1.5">Gender Selection</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-[#1c1c1e] border border-white/10 focus:border-gold px-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/75 block mb-1.5">Primary Role Division</label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full bg-[#1c1c1e] border border-white/10 focus:border-gold px-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none font-bold"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/75 block mb-1.5">Department Subdivision *</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Accounts & Audit"
                className={`w-full bg-white/[0.02] border focus:border-gold px-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none transition-colors ${
                  formErrors.department ? "border-red-500/50 bg-red-500/[0.01]" : "border-white/10"
                }`}
              />
              {formErrors.department && <p className="text-[9px] text-red-400 mt-1">{formErrors.department}</p>}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/75 block mb-1.5">Employee ID (Corporate identifier) *</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP-PL-09"
                className={`w-full bg-white/[0.02] border focus:border-gold px-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none font-mono font-bold ${
                  formErrors.employeeId ? "border-red-500/50 bg-red-500/[0.01]" : "border-white/10"
                }`}
              />
              {formErrors.employeeId && <p className="text-[9px] text-red-400 mt-1">{formErrors.employeeId}</p>}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/75 block mb-1.5">Status Security Mode</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#1c1c1e] border border-white/10 focus:border-gold px-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/75 block mb-1.5">Physical / Residence Address *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Corporate street addresses..."
                  rows={2}
                  className={`w-full bg-white/[0.02] border focus:border-gold pl-9 pr-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none transition-colors resize-none ${
                    formErrors.address ? "border-red-500/50 bg-red-500/[0.01]" : "border-white/10"
                  }`}
                />
              </div>
              {formErrors.address && <p className="text-[9px] text-red-400 mt-1">{formErrors.address}</p>}
            </div>
          </div>
        </div>

        {/* Credentials & Password Security */}
        <div className="bg-[#121213] border border-white/5 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gold" />
            <span>Profile Identity Visual</span>
          </h3>

          <div className="space-y-4">
            {/* Profile Avatar Selection */}
            <div className="space-y-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/75 block">Profile Visual Avatar</span>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
                  {profileImage ? (
                    <img src={profileImage} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-white/30" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    placeholder="Direct Image URL"
                    className="w-full bg-white/[0.02] border border-white/10 focus:border-gold px-3 py-1.5 rounded-lg text-white text-[10px] focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={generateRandomAvatar}
                      className="px-2.5 py-1 bg-gold/10 hover:bg-gold/20 text-gold text-[9px] font-bold uppercase tracking-wider rounded-lg border border-gold/10 transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Synthesize Face</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Drag and Drop Box */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border border-dashed p-4 rounded-xl text-center cursor-pointer transition-colors ${
                  dragActive ? "border-gold bg-gold/5" : "border-white/10 hover:border-white/20 bg-white/[0.01]"
                }`}
              >
                <Upload className="w-4 h-4 mx-auto text-white/30 mb-1" />
                <span className="text-[9px] text-text-secondary block font-semibold">Drag profile image directly here</span>
                <span className="text-[8px] text-text-muted block mt-0.5">Supports PNG, JPG</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Matrix allocation accordion */}
      <div className="bg-[#121213] border border-white/5 p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-gold" />
            <span>Customize Fine-Grained Security Matrix</span>
          </h3>
          <button
            type="button"
            onClick={() => setUseCustomPermissions(!useCustomPermissions)}
            className="text-[10px] font-mono font-bold text-gold hover:text-gold-light uppercase flex items-center gap-1"
          >
            {useCustomPermissions ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Custom Override Active</span>
              </>
            ) : (
              <span>Deploy Custom Overrides</span>
            )}
          </button>
        </div>

        {useCustomPermissions ? (
          <div className="overflow-x-auto border border-white/5 rounded-xl">
            <table className="w-full text-left border-collapse text-[10px] font-mono">
              <thead className="bg-white/[0.03] text-white">
                <tr>
                  <th className="p-3">Permission Category</th>
                  <th className="p-3 text-center">Create</th>
                  <th className="p-3 text-center">Read</th>
                  <th className="p-3 text-center">Update</th>
                  <th className="p-3 text-center">Delete</th>
                  <th className="p-3 text-center">Approve</th>
                  <th className="p-3 text-center">Export</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-text-secondary">
                {PERMISSION_CATEGORIES.map((category) => (
                  <tr key={category} className="hover:bg-white/[0.01]">
                    <td className="p-2.5 font-bold text-white">{category}</td>
                    {(["create", "read", "update", "delete", "approve", "export"] as const).map((action) => {
                      const isChecked = customPermissions[category]?.[action] || false;
                      return (
                        <td key={action} className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...customPermissions };
                              updated[category] = {
                                ...updated[category],
                                [action]: !isChecked
                              };
                              setCustomPermissions(updated);
                            }}
                            className="inline-flex items-center justify-center p-1 hover:bg-white/5 rounded-md transition-colors"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-gold" />
                            ) : (
                              <Square className="w-4 h-4 text-white/10 hover:text-white/20" />
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
        ) : (
          <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl">
            <p className="text-[10px] text-text-secondary leading-relaxed">
              This newly configured administrator will automatically inherit security clearances standard to the <strong className="text-white">"{role}"</strong> directory cluster. Click the <span className="text-gold font-bold">Deploy Custom Overrides</span> controller to customized matrix settings independently.
            </p>
          </div>
        )}
      </div>
    </form>
  );
}
