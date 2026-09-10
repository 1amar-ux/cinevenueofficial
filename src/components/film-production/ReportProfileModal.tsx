import React, { useState } from "react";
import { ProfessionalProfile } from "../../types/filmProductionMarketplace";
import { X, AlertTriangle, ShieldAlert, CheckCircle2, Send } from "lucide-react";
import { submitProfileReport } from "../../services/filmProductionService";

interface ReportProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: ProfessionalProfile | null;
  reporterEmail?: string | null;
  onSuccess?: () => void;
}

const REPORT_REASONS = [
  "Fake or Impersonation",
  "Misleading Credentials / Fake Filmography",
  "Inappropriate or Offensive Media",
  "Copyright / Unauthorized Reel Usage",
  "Harassment or Unprofessional Conduct",
  "Spam / Commercial Solicitation",
  "Other"
];

export default function ReportProfileModal({
  isOpen,
  onClose,
  professional,
  reporterEmail,
  onSuccess
}: ReportProfileModalProps) {
  if (!isOpen || !professional) return null;

  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      setError("Please describe the issue or reason for reporting this profile.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitProfileReport({
        reportedProfileId: professional.id,
        reportedUsername: professional.handle || `@${professional.fullName.toLowerCase().replace(/\s+/g, "_")}`,
        reportedName: professional.fullName,
        reporterEmail: reporterEmail || "anonymous@cinevenue.com",
        reason: selectedReason,
        details: details.trim()
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setDetails("");
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0D0E15] border border-red-500/30 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#141014]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-red-400 tracking-wider">CineVenue Safety & Trust</span>
              <h2 className="text-base font-black text-white">Report Professional Profile</h2>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-black text-white">Report Submitted to CineVenue Moderation</h3>
            <p className="text-xs text-white/60 max-w-xs mx-auto">
              Our safety review team will inspect this profile against industry authenticity guidelines within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-white/80 space-y-1">
              <div className="font-bold text-red-300">Reporting: {professional.fullName} ({professional.handle})</div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                CineVenue takes authentic industry representation and creator safety seriously. Submitting false reports may result in account restrictions.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-bold">
                {error}
              </div>
            )}

            {/* Reason selector */}
            <div>
              <label className="block text-white/70 font-bold mb-1.5">Violation Category *</label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full bg-[#161722] border border-white/15 rounded-xl p-3 text-white font-bold cursor-pointer focus:outline-none focus:border-red-400"
              >
                {REPORT_REASONS.map(r => (
                  <option key={r} value={r} className="bg-[#111218] text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Details */}
            <div>
              <label className="block text-white/70 font-bold mb-1.5">Detailed Explanation & Evidence *</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                className="w-full bg-[#161722] border border-white/15 rounded-xl p-3 text-white resize-none focus:outline-none focus:border-red-400"
                placeholder="Provide specific details, filmography discrepancies, external links, or evidence..."
                required
              />
            </div>

            {/* Submit buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black flex items-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
