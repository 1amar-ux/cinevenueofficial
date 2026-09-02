import React, { useState } from "react";
import { 
  ProfessionalProfile, 
  FilmProject 
} from "../../types/filmProductionMarketplace";
import { 
  X, Send, CheckCircle2, DollarSign, Calendar, Film, Building2
} from "lucide-react";
import { sendProjectInvitation } from "../../services/filmProductionService";

interface InviteProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: ProfessionalProfile | null;
  projects: FilmProject[];
  userEmail?: string | null;
  onInviteSent: () => void;
}

export default function InviteProfessionalModal({
  isOpen,
  onClose,
  professional,
  projects,
  userEmail,
  onInviteSent
}: InviteProfessionalModalProps) {
  if (!isOpen || !professional) return null;

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [proposedRemuneration, setProposedRemuneration] = useState(
    `₹${professional.remunerationRange.min.toLocaleString("en-IN")} – ₹${professional.remunerationRange.max.toLocaleString("en-IN")}`
  );
  const [workDates, setWorkDates] = useState("Target Shoot: Next Quarter (45 Days)");
  const [position, setPosition] = useState(professional.primaryCraftName);
  const [customMessage, setCustomMessage] = useState(
    `Hello ${professional.fullName}, we love your portfolio and would like to formally invite you to join our film production as ${professional.primaryCraftName}.`
  );

  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setIsSending(true);

    sendProjectInvitation({
      projectId: selectedProject.id,
      projectTitle: selectedProject.title,
      projectPosterUrl: selectedProject.posterUrl,
      companyName: selectedProject.companyName,
      position: position.trim(),
      senderEmail: userEmail || "filmmaker@cinevenue.com",
      senderName: userEmail ? userEmail.split("@")[0] : "Producer",
      recipientId: professional.id,
      recipientEmail: professional.userEmail,
      recipientName: professional.fullName,
      proposedRemuneration: proposedRemuneration.trim(),
      workDates: workDates.trim(),
      message: customMessage.trim()
    });

    setIsSending(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onInviteSent();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0D0E15] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#111218]">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-400">Direct Talent Invitation</span>
            <h2 className="text-base font-black text-white">Invite {professional.fullName}</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSend} className="p-6 space-y-4 text-xs">
          
          {/* Target Project Dropdown */}
          <div>
            <label className="block text-white/60 font-bold mb-1">Select Film Production *</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-bold cursor-pointer"
              required
            >
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-[#111218]">
                  🎬 {p.title} ({p.companyName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white/60 font-bold mb-1">Position / Craft Role *</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/60 font-bold mb-1">Proposed Remuneration</label>
              <input
                type="text"
                value={proposedRemuneration}
                onChange={(e) => setProposedRemuneration(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-white/60 font-bold mb-1">Schedule & Dates</label>
              <input
                type="text"
                value={workDates}
                onChange={(e) => setWorkDates(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white/60 font-bold mb-1">Custom Message / Project Pitch</label>
            <textarea
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
              required
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            {isSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Invitation Sent!
              </span>
            ) : (
              <span className="text-white/40">Secured via CineVenue Platform</span>
            )}

            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 inline mr-1" />
              <span>{isSending ? "Sending..." : "Send Invitation"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
