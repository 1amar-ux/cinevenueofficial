import React, { useState } from "react";
import { 
  ProfessionalProfile, 
  IndianCastingCall 
} from "../../types/filmProductionMarketplace";
import { 
  X, CheckCircle2, Award, Sparkles, Send, Film
} from "lucide-react";
import { considerForCastingCall } from "../../services/filmProductionService";

interface ConsiderForCastingModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: ProfessionalProfile | null;
  castingCalls: IndianCastingCall[];
  userEmail?: string | null;
  onSuccess?: () => void;
}

export default function ConsiderForCastingModal({
  isOpen,
  onClose,
  professional,
  castingCalls,
  userEmail,
  onSuccess
}: ConsiderForCastingModalProps) {
  if (!isOpen || !professional) return null;

  // Filter casting calls owned by user, or fallback to all active calls
  const userCalls = castingCalls.filter(c => 
    !userEmail || (c.ownerEmail && c.ownerEmail.toLowerCase() === userEmail.toLowerCase()) || c.status === "Open"
  );

  const [selectedCallId, setSelectedCallId] = useState<string>(userCalls[0]?.id || "");
  const [targetRole, setTargetRole] = useState(
    userCalls.find(c => c.id === selectedCallId)?.characterName || 
    userCalls.find(c => c.id === selectedCallId)?.roleTitle || 
    professional.roles?.[0] || professional.primaryCraftName || "Lead Actor"
  );
  const [considerationStage, setConsiderationStage] = useState<"Shortlisted" | "Under Review" | "Audition Scheduled">("Shortlisted");
  const [notes, setNotes] = useState(
    `Considering ${professional.fullName} based on verified showreel and screen portfolio.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const activeCall = userCalls.find(c => c.id === selectedCallId) || userCalls[0];

  const handleSelectCall = (callId: string) => {
    setSelectedCallId(callId);
    const call = userCalls.find(c => c.id === callId);
    if (call?.characterName || call?.roleTitle) {
      setTargetRole(call.characterName || call.roleTitle);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCall) return;
    setIsSubmitting(true);

    try {
      await considerForCastingCall({
        castingCallId: activeCall.id,
        projectTitle: activeCall.projectTitle,
        characterName: targetRole,
        characterRole: targetRole,
        candidateUsername: professional.handle || `@${professional.fullName.toLowerCase().replace(/\s+/g, "_")}`,
        candidateName: professional.fullName,
        candidateEmail: professional.userEmail,
        recruiterEmail: userEmail || "casting@cinevenue.com",
        recruiterName: userEmail ? userEmail.split("@")[0] : "Casting Director",
        notes: notes.trim(),
        stage: considerationStage
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1400);
    } catch (err) {
      console.error("Error submitting casting consideration:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0D0E15] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#111218]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Casting Call Consideration</span>
              <h2 className="text-base font-black text-white">Shortlist {professional.fullName}</h2>
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
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-black text-white">Candidate Shortlisted!</h3>
            <p className="text-xs text-white/60 max-w-xs mx-auto">
              {professional.fullName} has been added to the consideration roster for <span className="text-purple-300 font-bold">{activeCall?.projectTitle}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            
            {/* Active Casting Call Selection */}
            <div>
              <label className="block text-white/70 font-bold mb-1.5">Select Casting Call *</label>
              {userCalls.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  No active casting calls found. Please post a casting call first from the Casting Calls desk.
                </div>
              ) : (
                <select
                  value={selectedCallId}
                  onChange={(e) => handleSelectCall(e.target.value)}
                  className="w-full bg-[#161722] border border-white/15 rounded-xl p-3 text-white font-bold cursor-pointer focus:outline-none focus:border-purple-400"
                  required
                >
                  {userCalls.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#111218] text-white">
                      🎭 {c.projectTitle} – {c.characterName || c.roleTitle} ({c.industry || "Pan-India"})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Target Role */}
            <div>
              <label className="block text-white/70 font-bold mb-1.5">Target Character / Role *</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-[#161722] border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400"
                placeholder="e.g. Lead Antagonist, Second Lead, Guest Appearance"
                required
              />
            </div>

            {/* Evaluation Stage */}
            <div>
              <label className="block text-white/70 font-bold mb-1.5">Initial Consideration Status</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Shortlisted", "Under Review", "Audition Scheduled"] as const).map((stage) => (
                  <button
                    type="button"
                    key={stage}
                    onClick={() => setConsiderationStage(stage)}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      considerationStage === stage
                        ? "bg-purple-500/20 border-purple-500 text-purple-300"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Casting Notes */}
            <div>
              <label className="block text-white/70 font-bold mb-1.5">Internal Casting & Audition Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-[#161722] border border-white/15 rounded-xl p-3 text-white resize-none focus:outline-none focus:border-purple-400"
                placeholder="Add director or casting notes about screen presence, suitability, audition tape review..."
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
                disabled={isSubmitting || userCalls.length === 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black flex items-center gap-2 shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm Shortlist</span>
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
