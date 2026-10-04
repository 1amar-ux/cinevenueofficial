import React, { useState } from "react";
import { Lock, Eye, EyeOff, Key, Copy, Check, ShieldCheck, AlertCircle, X } from "lucide-react";
import { Employee, employeeService } from "../../../services/employeeService";

interface Props {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function EmployeeResetPasswordModal({ employee, isOpen, onClose, onSuccess }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Password Strength Calculation
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>\-_=+]/.test(newPassword);

  const passedRules = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthLabel = passedRules <= 2 ? "Weak" : passedRules <= 4 ? "Medium" : "Strong";
  const strengthColor = passedRules <= 2 ? "bg-red-500" : passedRules <= 4 ? "bg-yellow-500" : "bg-emerald-500";
  const strengthWidth = `${(passedRules / 5) * 100}%`;

  const generateTempPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure all criteria are met
    pwd += "A1!";
    setTemporaryPassword(pwd);
    setNewPassword(pwd);
    setConfirmPassword(pwd);
    setError(null);
  };

  const copyToClipboard = () => {
    if (temporaryPassword) {
      navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    if (passedRules < 5) {
      setError("Please ensure all security password criteria are fulfilled.");
      return;
    }

    setLoading(true);
    const res = await employeeService.resetEmployeePassword(employee.id, newPassword, confirmPassword);
    setLoading(false);

    if (res.success) {
      onSuccess(`Password reset successfully for ${employee.fullName} (${employee.employeeId}).`);
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-0">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Reset Password
              </h3>
              <p className="text-[11px] text-text-secondary">
                {employee.fullName} • <span className="font-mono text-gold">{employee.employeeId}</span>
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Temporary Password Generator */}
          <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Option: Generate Temporary Password
              </span>
              <button
                type="button"
                onClick={generateTempPassword}
                className="text-[10px] font-bold text-gold hover:text-gold-light flex items-center gap-1 cursor-pointer"
              >
                <Key className="w-3 h-3" />
                <span>Generate Now</span>
              </button>
            </div>

            {temporaryPassword && (
              <div className="bg-black/60 border border-gold/30 p-2.5 rounded-lg flex items-center justify-between">
                <span className="font-mono text-xs text-gold font-bold tracking-wider select-all">
                  {temporaryPassword}
                </span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-2 py-1 bg-gold/15 hover:bg-gold/25 text-gold text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            )}
            <p className="text-[9px] text-text-secondary">
              Shown only once. Share securely with the employee. Passwords are never retrievable after saving.
            </p>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setTemporaryPassword(null);
                }}
                placeholder="Enter secure new password"
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-3.5 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-gold font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              Confirm New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold font-mono"
              required
            />
          </div>

          {/* Password Strength Meter */}
          {newPassword && (
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-text-muted">Password Strength:</span>
                <span className={`font-bold font-mono ${passedRules >= 5 ? "text-emerald-400" : passedRules >= 3 ? "text-yellow-400" : "text-red-400"}`}>
                  {strengthLabel}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strengthColor} transition-all duration-300`}
                  style={{ width: strengthWidth }}
                />
              </div>

              {/* Requirement Checklist */}
              <div className="grid grid-cols-2 gap-1 pt-1 text-[9px] font-mono">
                <span className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-400" : "text-text-muted"}`}>
                  {hasMinLength ? "✓" : "○"} Min 8 characters
                </span>
                <span className={`flex items-center gap-1 ${hasUpper ? "text-emerald-400" : "text-text-muted"}`}>
                  {hasUpper ? "✓" : "○"} Uppercase letter
                </span>
                <span className={`flex items-center gap-1 ${hasLower ? "text-emerald-400" : "text-text-muted"}`}>
                  {hasLower ? "✓" : "○"} Lowercase letter
                </span>
                <span className={`flex items-center gap-1 ${hasNumber ? "text-emerald-400" : "text-text-muted"}`}>
                  {hasNumber ? "✓" : "○"} Number (0-9)
                </span>
                <span className={`flex items-center gap-1 col-span-2 ${hasSpecial ? "text-emerald-400" : "text-text-muted"}`}>
                  {hasSpecial ? "✓" : "○"} Special character (!@#$%^&*)
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-white/10 text-xs font-semibold text-text-secondary hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || passedRules < 5}
              className="px-5 py-2.5 bg-gold hover:bg-gold-light disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-gold/15"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? "Encrypting & Saving..." : "Update Password"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
