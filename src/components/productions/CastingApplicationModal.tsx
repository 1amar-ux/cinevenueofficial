import React, { useState } from "react";
import { X, Send, Film, User, Phone, Mail, Award, Video, FileText, CheckCircle2, Sparkles } from "lucide-react";
import { CastingCall } from "../../types/productions";

interface CastingApplicationModalProps {
  castingCall: CastingCall | null;
  onClose: () => void;
  onSubmitApplication: (data: {
    castingCallId: string;
    projectTitle: string;
    roleApplied: string;
    userName: string;
    userEmail: string;
    phone: string;
    experienceYears: number;
    portfolioUrl: string;
    photoUrl: string;
    videoUrl?: string;
    introduction: string;
  }) => void;
  userEmail?: string | null;
}

export default function CastingApplicationModal({
  castingCall,
  onClose,
  onSubmitApplication,
  userEmail
}: CastingApplicationModalProps) {
  if (!castingCall) return null;

  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [experienceYears, setExperienceYears] = useState(2);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70");
  const [videoUrl, setVideoUrl] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !phone) {
      alert("Please fill in your name and phone number.");
      return;
    }

    onSubmitApplication({
      castingCallId: castingCall.id,
      projectTitle: castingCall.projectTitle,
      roleApplied: castingCall.roleTitle,
      userName,
      userEmail: userEmail || "actor@cinevenue.com",
      phone,
      experienceYears: Number(experienceYears),
      portfolioUrl: portfolioUrl || "https://instagram.com/cinevenue_actor",
      photoUrl,
      videoUrl,
      introduction
    });

    setSubmittedId("AUD-" + Math.floor(100000 + Math.random() * 900000));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0F0F12] border border-gold/30 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedId ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h2 className="text-2xl font-serif font-bold text-white">Audition Application Submitted!</h2>
            <p className="text-sm text-white/70 max-w-md mx-auto">
              Your application for <strong className="text-gold">{castingCall.roleTitle}</strong> on <strong className="text-white">{castingCall.projectTitle}</strong> has been received by CineVenue Casting Directors.
            </p>
            <div className="bg-black/60 border border-white/10 p-4 rounded-xl inline-block text-xs font-mono">
              Application Ref ID: <span className="text-amber-400 font-bold">{submittedId}</span>
            </div>
            <p className="text-xs text-white/50">You can track your shortlist status in your CineVenue Account Dashboard.</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gold text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:bg-amber-400"
            >
              Close & View Applications
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="space-y-2 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold uppercase">
                  Casting Call
                </span>
                <span className="text-xs text-white/60 font-mono">{castingCall.category}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
                Apply for {castingCall.roleTitle}
              </h2>
              <p className="text-xs text-gold">Project: {castingCall.projectTitle}</p>
            </div>

            {/* Role Requirements Callout */}
            <div className="bg-white/[0.02] border border-white/10 p-4 rounded-xl text-xs space-y-1.5">
              <p className="text-white/80"><strong className="text-white">Age & Gender:</strong> {castingCall.ageRange} ({castingCall.gender})</p>
              <p className="text-white/80"><strong className="text-white">Location:</strong> {castingCall.location}</p>
              <p className="text-white/80"><strong className="text-white">Audition Task:</strong> {castingCall.auditionDetails}</p>
            </div>

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Years of Acting / Skill Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Portfolio / Instagram / IMDb Link</label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Audition Video / Showreel Link (YouTube / Drive / Vimeo)</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Cover Note & Previous Work Summary</label>
                <textarea
                  rows={3}
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                  placeholder="Briefly describe why you are fit for this role..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-gold via-amber-400 to-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 shadow-lg shadow-gold/10 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Audition Application</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
