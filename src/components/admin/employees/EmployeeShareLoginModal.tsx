import React, { useState } from "react";
import { Link2, Copy, Check, ExternalLink, Mail, MessageSquare, X, Shield, User, Smartphone, Sparkles, Send } from "lucide-react";
import { Employee } from "../../../services/employeeService";

interface Props {
  employee?: Employee | null;
  employeesList?: Employee[];
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export default function EmployeeShareLoginModal({
  employee: initialEmployee,
  employeesList = [],
  isOpen,
  onClose,
  onSuccessToast
}: Props) {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(initialEmployee?.id || "GENERAL");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInstructions, setCopiedInstructions] = useState(false);

  if (!isOpen) return null;

  const currentEmployee = initialEmployee || (selectedEmpId !== "GENERAL" ? employeesList.find(e => e.id === selectedEmpId) : null);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://cinevenue.com";
  
  // Build personalized or general staff login URL
  const loginUrl = currentEmployee
    ? `${origin}/admin-login?mode=employee&username=${encodeURIComponent(currentEmployee.username)}`
    : `${origin}/admin-login?mode=employee`;

  const shortLoginUrl = currentEmployee
    ? `${origin}/staff-login?username=${encodeURIComponent(currentEmployee.username)}`
    : `${origin}/staff-login`;

  const handleCopyLink = (urlToCopy: string) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedLink(true);
    if (onSuccessToast) onSuccessToast("Staff login link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyFullInstructions = () => {
    const text = currentEmployee
      ? `🎬 CineVenue Central Control - Staff Login Access\n` +
        `-----------------------------------------\n` +
        `Staff Member: ${currentEmployee.fullName}\n` +
        `Username: ${currentEmployee.username}\n` +
        `Department: ${currentEmployee.department}\n` +
        `Designation: ${currentEmployee.designation}\n` +
        `Assigned Role: ${currentEmployee.role.displayName}\n\n` +
        `🔗 Direct Staff Login Link:\n${loginUrl}\n\n` +
        `Please open the link, review your username, and sign in with your authorized password.\n` +
        `CineVenue Administration`
      : `🎬 CineVenue Central Control - Staff Login Access Portal\n` +
        `-----------------------------------------\n` +
        `🔗 Staff Access Gateway:\n${loginUrl}\n\n` +
        `Enter your assigned staff username and password to access authorized administrative modules.`;

    navigator.clipboard.writeText(text);
    setCopiedInstructions(true);
    if (onSuccessToast) onSuccessToast("Complete staff access credentials & link copied!");
    setTimeout(() => setCopiedInstructions(false), 2500);
  };

  const handleEmailShare = () => {
    if (!currentEmployee?.email) return;
    const subject = encodeURIComponent(`CineVenue Central Admin - Staff Login Access (${currentEmployee.fullName})`);
    const body = encodeURIComponent(
      `Hello ${currentEmployee.fullName},\n\n` +
      `Here is your official staff access link to the CineVenue Central Control Gateway:\n\n` +
      `🔗 Direct Login Link:\n${loginUrl}\n\n` +
      `Staff Details:\n` +
      `• Username: ${currentEmployee.username}\n` +
      `• Department: ${currentEmployee.department}\n` +
      `• Role: ${currentEmployee.role.displayName}\n\n` +
      `Please sign in using your designated secure password.\n\n` +
      `Best regards,\nCineVenue Super Administration`
    );
    window.open(`mailto:${currentEmployee.email}?subject=${subject}&body=${body}`, "_blank");
  };

  const handleWhatsAppShare = () => {
    if (!currentEmployee) return;
    const cleanMobile = currentEmployee.mobile ? currentEmployee.mobile.replace(/[^0-9]/g, "") : "";
    const msg = encodeURIComponent(
      `*CineVenue Central Control - Staff Login Access*\n` +
      `Hello ${currentEmployee.fullName},\n\n` +
      `Here is your personalized staff portal link:\n${loginUrl}\n\n` +
      `Username: *${currentEmployee.username}*\n` +
      `Role: *${currentEmployee.role.displayName}*\n` +
      `Log in using your secure password.`
    );
    const waUrl = cleanMobile ? `https://wa.me/${cleanMobile}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-[#121215] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Staff Login Link Generator
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase">
                  Direct Access
                </span>
              </h3>
              <p className="text-xs text-text-secondary">
                Generate and share direct gateway access URLs for CineVenue staff
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Staff Selector (If opened from general top bar) */}
        {employeesList.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">
              Select Staff Member:
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="GENERAL">🌐 General Staff Portal (Universal Link)</option>
              {employeesList.map(e => (
                <option key={e.id} value={e.id}>
                  👤 {e.fullName} (@{e.username}) — {e.role.displayName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Staff Card Preview */}
        {currentEmployee ? (
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37]/30 to-yellow-600/10 border border-[#D4AF37]/30 flex items-center justify-center font-bold text-xs text-[#D4AF37] font-mono shrink-0">
                {currentEmployee.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs truncate">{currentEmployee.fullName}</span>
                  <span className="text-[10px] font-mono text-[#D4AF37] font-semibold">@{currentEmployee.username}</span>
                </div>
                <div className="text-[11px] text-text-secondary truncate">
                  {currentEmployee.designation} &middot; <span className="text-white/60">{currentEmployee.department}</span>
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
              {currentEmployee.role.displayName}
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary shrink-0">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-white">Universal Staff Gateway Link</p>
              <p className="text-[11px] text-text-secondary">Directs staff straight into the Employee Login tab where they type their username</p>
            </div>
          </div>
        )}

        {/* Primary URL Display & Copy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <span>Personalized Staff Access Link:</span>
            </label>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Auto-Prefills Username
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={loginUrl}
              className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-[#D4AF37] select-all focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              onClick={() => handleCopyLink(loginUrl)}
              className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f27] text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-lg shadow-[#D4AF37]/20"
              title="Copy Link"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>

          {/* Short URL Alternative */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-text-secondary font-mono">
            <span>Direct Alias:</span>
            <button
              onClick={() => handleCopyLink(shortLoginUrl)}
              className="text-[#D4AF37]/80 hover:text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{shortLoginUrl}</span>
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {/* Test Link in New Tab */}
          <a
            href={loginUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-xs font-medium text-white transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Test in Tab</span>
          </a>

          {/* Send via Email */}
          <button
            onClick={handleEmailShare}
            disabled={!currentEmployee?.email}
            className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
              currentEmployee?.email
                ? "bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border-blue-500/30 cursor-pointer"
                : "bg-white/[0.02] text-white/30 border-white/5 cursor-not-allowed"
            }`}
            title={currentEmployee?.email ? `Email to ${currentEmployee.email}` : "No email available for this staff"}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Staff</span>
          </button>

          {/* WhatsApp Share */}
          <button
            onClick={handleWhatsAppShare}
            className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-2 text-xs font-medium transition-all cursor-pointer"
            title="Share via WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>

        {/* Copy Complete Formatted Credentials Box */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary font-medium">Ready-to-Send Invitation Message:</span>
            <button
              onClick={handleCopyFullInstructions}
              className="text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              {copiedInstructions ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedInstructions ? "Message Copied!" : "Copy Full Message"}</span>
            </button>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed font-mono bg-black/60 p-2.5 rounded-lg border border-white/5">
            {currentEmployee ? (
              <>
                Staff Access Link: <span className="text-[#D4AF37]">{loginUrl}</span><br />
                Username: <span className="text-white">@{currentEmployee.username}</span> | Role: <span className="text-white">{currentEmployee.role.displayName}</span>
              </>
            ) : (
              <>
                Staff Portal Link: <span className="text-[#D4AF37]">{loginUrl}</span><br />
                Login Mode: <span className="text-white">Employee Mode</span>
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
