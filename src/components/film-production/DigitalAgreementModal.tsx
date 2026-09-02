import React, { useState } from "react";
import { 
  DigitalAgreement 
} from "../../types/filmProductionMarketplace";
import { 
  X, FileText, CheckCircle2, ShieldCheck, Download, 
  Lock, Award, Check, DollarSign, Calendar
} from "lucide-react";
import { signAgreement } from "../../services/filmProductionService";

interface DigitalAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreement: DigitalAgreement | null;
  currentUserEmail?: string | null;
  onAgreementSigned: (signed: DigitalAgreement) => void;
}

export default function DigitalAgreementModal({
  isOpen,
  onClose,
  agreement,
  currentUserEmail,
  onAgreementSigned
}: DigitalAgreementModalProps) {
  if (!isOpen || !agreement) return null;

  const [signatureName, setSignatureName] = useState(
    agreement.signatureName || (currentUserEmail ? currentUserEmail.split("@")[0] : "")
  );
  const [agreedTerms, setAgreedTerms] = useState(agreement.status === "Accepted");
  const [isSigning, setIsSigning] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName.trim() || !agreedTerms) return;
    setIsSigning(true);

    const signed = signAgreement(agreement.id, signatureName.trim());
    if (signed) {
      onAgreementSigned(signed);
      setIsSigning(false);
      setSignedSuccess(true);
      setTimeout(() => {
        setSignedSuccess(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0D0E15] border border-white/15 rounded-3xl overflow-hidden shadow-2xl animate-fade-in my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#111218] shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-black text-white">CineVenue Digital Production Agreement</h2>
              <p className="text-[11px] text-white/50">Contract Reference: #{agreement.id}</p>
            </div>
          </div>

          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contract Content Document */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 text-xs text-white/90 font-sans leading-relaxed">
          
          {/* Status Header */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400">Formal Legal Engagement</span>
              <h3 className="text-base font-black text-white">{agreement.projectTitle}</h3>
              <p className="text-xs text-white/70">
                Between <strong className="text-white">{agreement.productionCompany}</strong> and <strong className="text-white">{agreement.professionalName}</strong> ({agreement.position})
              </p>
            </div>
            <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase ${agreement.status === "Accepted" ? "bg-emerald-500 text-black" : "bg-amber-500 text-black"}`}>
              {agreement.status}
            </span>
          </div>

          {/* Section 1: Scope */}
          <div className="space-y-2">
            <h4 className="font-bold text-amber-400 uppercase text-[11px]">1. Scope of Work & Professional Engagement</h4>
            <p className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
              {agreement.scopeOfWork}
            </p>
          </div>

          {/* Section 2: Remuneration & Milestones */}
          <div className="space-y-2">
            <h4 className="font-bold text-amber-400 uppercase text-[11px]">2. Remuneration & Payment Milestones</h4>
            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 space-y-2">
              <div className="text-sm font-black text-emerald-400">
                Total Agreed Fee: {agreement.remuneration}
              </div>
              <ul className="list-disc pl-4 space-y-1 text-white/70">
                {agreement.paymentMilestones.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 3: Screen Credits */}
          <div className="space-y-2">
            <h4 className="font-bold text-amber-400 uppercase text-[11px]">3. Title Screen Credits</h4>
            <p className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
              Official Screen Credit: <strong>{agreement.creditsTitle}</strong> in the main opening / end roll matching production guild standards.
            </p>
          </div>

          {/* Section 4: Confidentiality & NDA */}
          <div className="space-y-2">
            <h4 className="font-bold text-amber-400 uppercase text-[11px]">4. Confidentiality, Security & Non-Disclosure (NDA)</h4>
            <p className="bg-white/[0.02] p-3 rounded-xl border border-white/5 text-white/70">
              {agreement.confidentialityTerms} All footage, audio tracks, scripts, plot details, and shoot schedules are strictly proprietary.
            </p>
          </div>

          {/* Section 5: Intellectual Property */}
          <div className="space-y-2">
            <h4 className="font-bold text-amber-400 uppercase text-[11px]">5. Intellectual Property & Master Rights</h4>
            <p className="bg-white/[0.02] p-3 rounded-xl border border-white/5 text-white/70">
              {agreement.ipTerms}
            </p>
          </div>

          {/* Signing Section */}
          {agreement.status !== "Accepted" ? (
            <form onSubmit={handleSign} className="p-5 rounded-2xl bg-[#111218] border border-white/15 space-y-3">
              <h4 className="font-black text-white text-sm">Digital Signature Verification</h4>
              
              <div>
                <label className="block text-white/60 font-bold mb-1">Signatory Full Name *</label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-bold"
                  placeholder="Type your full legal name"
                  required
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                  required
                />
                <span className="text-white/80">
                  I legally accept and ratify all terms of this CineVenue Production Agreement.
                </span>
              </label>

              {signedSuccess && (
                <div className="text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Agreement Signed & Encrypted on Blockchain Registry!
                </div>
              )}

              <button
                type="submit"
                disabled={isSigning || !signatureName.trim() || !agreedTerms}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-black font-black uppercase tracking-wider text-xs transition-all shadow-lg cursor-pointer disabled:opacity-40"
              >
                {isSigning ? "Securing Digital Signature..." : "Sign & Ratify Agreement"}
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Signed & Ratified by: {agreement.signatureName}
              </div>
              <div className="text-[11px] text-white/60">
                Timestamp: {agreement.acceptedAt} • Verified Security Hash
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-[#090A0F] flex items-center justify-between text-xs text-white/50 shrink-0">
          <span>Legally binding electronic signature under IT Act standards.</span>
          <button onClick={onClose} className="px-4 py-2 bg-white/10 rounded-xl text-white font-bold cursor-pointer">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
