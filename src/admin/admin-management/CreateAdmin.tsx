import React, { useState, useEffect } from "react";
import { 
  Plus, Shield, Key, Eye, EyeOff, Upload, User, 
  Mail, Phone, MapPin, CheckSquare, Square, RefreshCw, Sparkles, Check
} from "lucide-react";
import { Admin, Role, PermissionMatrix, PERMISSION_CATEGORIES, DEFAULT_PERMISSION_MATRIX } from "./types";

interface CreateAdminProps {
  roles: Role[];
  onSave: (admin: Admin) => void;
  onCancel: () => void;
  onAddAuditLog: (action: string, description: string, newData?: string) => void;
}

export default function CreateAdmin({ roles, onSave, onCancel, onAddAuditLog }: CreateAdminProps) {
  // Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>("Male");
  const [profileImage, setProfileImage] = useState("");
  const [role, setRole] = useState("Platform Admin");
  const [department, setDepartment] = useState("Operations");
  const [employeeId, setEmployeeId] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Suspended'>("Active");

  // Custom permissions matrix toggle
  const [customPermissions, setCustomPermissions] = useState<PermissionMatrix>({ ...DEFAULT_PERMISSION_MATRIX });
  const [useCustomPermissions, setUseCustomPermissions] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: "Weak", color: "bg-red-500" });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [dragActive, setDragActive] = useState(false);

  // Generate random Employee ID on load
  useEffect(() => {
    const randomId = "EMP-AD-" + Math.floor(100 + Math.random() * 900);
    setEmployeeId(randomId);
  }, []);

  // Update permissions when role changes
  useEffect(() => {
    const selectedRoleObj = roles.find(r => r.name === role);
    if (selectedRoleObj) {
      setCustomPermissions(JSON.parse(JSON.stringify(selectedRoleObj.permissions)));
    }
  }, [role, roles]);

  // Analyze password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, text: "Very Weak", color: "bg-white/10" });
      return;
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let text = "Weak";
    let color = "bg-red-500";
    if (score === 2) {
      text = "Medium";
      color = "bg-amber-500";
    } else if (score === 3) {
      text = "Strong";
      color = "bg-yellow-500";
    } else if (score === 4) {
      text = "Exceptional";
      color = "bg-emerald-500";
    }

    setPasswordStrength({ score, text, color });
  }, [password]);

  // Validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!fullName.trim()) errors.fullName = "Full name is required";
    
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.email = "Invalid email formatting";
    }

    if (!mobileNumber.trim()) {
      errors.mobileNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(mobileNumber.trim())) {
      errors.mobileNumber = "Requires exactly 10 digits";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (passwordStrength.score < 2) {
      errors.password = "Password is too weak (Requires 8+ chars, capital, number, special)";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
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

    // Default image if empty
    const imgUrl = profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200";

    const newAdmin: Admin = {
      id: "ADM-" + Math.floor(1000 + Math.random() * 9000),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      mobileNumber: mobileNumber.trim(),
      gender,
      profileImage: imgUrl,
      role,
      department: department.trim(),
      employeeId: employeeId.trim().toUpperCase(),
      address: address.trim(),
      status,
      lastLogin: "Never Logged In",
      createdDate: new Date().toISOString().split('T')[0],
      permissions: customPermissions
    };

    onSave(newAdmin);
    onAddAuditLog(
      "Created Admin account",
      `Provisioned Admin dashboard account for ${fullName.trim()} with role ${role}`,
      JSON.stringify(newAdmin)
    );
  };

  const generateRandomAvatar = () => {
    const r = Math.floor(Math.random() * 70);
    const url = `https://xsgames.co/randomusers/assets/avatars/${gender === "Female" ? "female" : "male"}/${r}.jpg`;
    setProfileImage(url);
  };

  // Drag and drop simulator
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
      // Simulate file upload URL
      const file = e.dataTransfer.files[0];
      setProfileImage(`https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200`);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-fadeIn pb-12">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Configure New Administrator</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Register corporate credentials, allocate security permissions, and generate initial access keys
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
            <Plus className="w-4.5 h-4.5" />
            <span>Compile Admin</span>
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
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/75 block mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@cinevenue.com"
                  className={`w-full bg-white/[0.02] border focus:border-gold pl-9 pr-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none transition-colors ${
                    formErrors.email ? "border-red-500/50 bg-red-500/[0.01]" : "border-white/10"
                  }`}
                />
              </div>
              {formErrors.email && <p className="text-[9px] text-red-400 mt-1">{formErrors.email}</p>}
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
                onChange={(e) => setRole(e.target.value)}
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
              <div className="relative">
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. EMP-PL-09"
                  className={`w-full bg-white/[0.02] border focus:border-gold px-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none font-mono font-bold ${
                    formErrors.employeeId ? "border-red-500/50 bg-red-500/[0.01]" : "border-white/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setEmployeeId("EMP-AD-" + Math.floor(100 + Math.random() * 900))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gold hover:text-gold-light"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                </button>
              </div>
              {formErrors.employeeId && <p className="text-[9px] text-red-400 mt-1">{formErrors.employeeId}</p>}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/75 block mb-1.5">Initial Status</label>
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
                  placeholder="Corporate street addresses, floor numbers, or digital hub coordinate markers..."
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
            <Key className="w-4 h-4 text-gold" />
            <span>Security & Authentication</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/75 block mb-1.5">Initial Access Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Allocate a strong token..."
                  className={`w-full bg-white/[0.02] border focus:border-gold px-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none font-mono ${
                    formErrors.password ? "border-red-500/50 bg-red-500/[0.01]" : "border-white/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formErrors.password && <p className="text-[9px] text-red-400 mt-1">{formErrors.password}</p>}
              
              {/* Password strength meter */}
              <div className="mt-2.5 space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-mono font-bold">
                  <span className="text-text-secondary">Password Security Rating:</span>
                  <span className="text-white">{passwordStrength.text}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div 
                      key={step} 
                      className={`flex-1 h-full rounded-sm transition-all ${
                        passwordStrength.score >= step ? passwordStrength.color : "bg-white/5"
                      }`} 
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/75 block mb-1.5">Confirm Password *</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Match allocated credential..."
                className={`w-full bg-white/[0.02] border focus:border-gold px-3.5 py-2.5 rounded-xl text-white text-[11px] focus:outline-none font-mono ${
                  formErrors.confirmPassword ? "border-red-500/50 bg-red-500/[0.01]" : "border-white/10"
                }`}
              />
              {formErrors.confirmPassword && <p className="text-[9px] text-red-400 mt-1">{formErrors.confirmPassword}</p>}
            </div>

            {/* Profile Avatar Selection */}
            <div className="pt-4 border-t border-white/5 space-y-3.5">
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
                    placeholder="Direct Image URL (optional)"
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
                <span className="text-[8px] text-text-muted block mt-0.5">Supports PNG, JPG (Auto-cropped)</span>
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
