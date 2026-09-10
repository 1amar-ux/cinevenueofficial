import React, { useState } from "react";
import { ProfilePrivacySettings, ProfileVisibilityOption } from "../../types/filmProductionMarketplace";
import { X, ShieldCheck, Eye, Lock, Globe, CheckCircle2 } from "lucide-react";

interface ProfilePrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: ProfilePrivacySettings;
  onSavePrivacySettings: (settings: ProfilePrivacySettings) => void;
}

const DEFAULT_PRIVACY: ProfilePrivacySettings = {
  profileVisibility: "Public",
  portfolioVisibility: "Public",
  videosVisibility: "Public",
  filmographyVisibility: "Public",
  contactVisibility: "CineVenue Users",
  availabilityVisibility: "Public"
};

export default function ProfilePrivacyModal({
  isOpen,
  onClose,
  settings,
  onSavePrivacySettings
}: ProfilePrivacyModalProps) {
  const [privacy, setPrivacy] = useState<ProfilePrivacySettings>(settings || DEFAULT_PRIVACY);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (key: keyof ProfilePrivacySettings, value: ProfileVisibilityOption) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    onSavePrivacySettings(privacy);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1000);
  };

  const modules: { key: keyof ProfilePrivacySettings; title: string; desc: string }[] = [
    {
      key: "profileVisibility",
      title: "Overall Profile Visibility",
      desc: "Who can discover and view your main film professional card"
    },
    {
      key: "portfolioVisibility",
      title: "Portfolio Photos & Look Stills",
      desc: "Who can view your professional photos, character looks, and costume stills"
    },
    {
      key: "videosVisibility",
      title: "Showreels & Performance Videos",
      desc: "Who can stream your monologue tapes, showreels, and audition clips"
    },
    {
      key: "filmographyVisibility",
      title: "Filmography & Past Credits",
      desc: "Who can view your past project titles, release years, and director credits"
    },
    {
      key: "availabilityVisibility",
      title: "Availability & Shoot Dates",
      desc: "Who can see your calendar availability status and booking notes"
    },
    {
      key: "contactVisibility",
      title: "Direct Inquiries & Proposal Access",
      desc: "Who can send you direct project invitations and casting callbacks"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0F1018] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#141522] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Profile Visibility & Privacy</h2>
              <p className="text-[11px] text-white/50">Control who can access your portfolio, reels, and credits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice */}
        <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
          <span>CineVenue Privacy Policy: Sensitive phone numbers and personal identity records are strictly concealed from public browsing.</span>
        </div>

        {/* Modules List */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {modules.map((m) => (
            <div key={m.key} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-xs">{m.title}</h4>
                  <p className="text-[11px] text-white/50 mt-0.5">{m.desc}</p>
                </div>

                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 shrink-0">
                  {(["Public", "CineVenue Users", "Private"] as ProfileVisibilityOption[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelect(m.key, opt)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        privacy[m.key] === opt
                          ? opt === "Public"
                            ? "bg-emerald-500 text-black font-black"
                            : opt === "CineVenue Users"
                            ? "bg-blue-500 text-white font-black"
                            : "bg-rose-500 text-white font-black"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {opt === "Public" && <Globe className="w-2.5 h-2.5" />}
                      {opt === "CineVenue Users" && <Eye className="w-2.5 h-2.5" />}
                      {opt === "Private" && <Lock className="w-2.5 h-2.5" />}
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-white/10 flex items-center justify-between bg-[#111218] shrink-0">
          {success ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4" />
              Privacy preferences updated!
            </span>
          ) : (
            <span className="text-white/40 text-[11px]">Changes apply instantly across CineVenue.</span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/15 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-black uppercase text-xs tracking-wider shadow-lg shadow-gold/20 cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
