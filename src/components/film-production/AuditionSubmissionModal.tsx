import React, { useState } from "react";
import { 
  IndianCastingCall, 
  AuditionSubmission 
} from "../../types/filmProductionMarketplace";
import { 
  X, Video, Upload, CheckCircle2, AlertCircle, 
  User, Phone, Mail, MapPin, Languages, Sparkles, ShieldCheck
} from "lucide-react";
import { submitAudition, getProfessionalByEmail } from "../../services/filmProductionService";

interface AuditionSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  castingCall: IndianCastingCall | null;
  userEmail?: string | null;
  onAuditionSubmitted?: (audition: AuditionSubmission) => void;
}

export default function AuditionSubmissionModal({
  isOpen,
  onClose,
  castingCall,
  userEmail,
  onAuditionSubmitted
}: AuditionSubmissionModalProps) {
  if (!isOpen || !castingCall) return null;

  const userProfile = userEmail ? getProfessionalByEmail(userEmail) : undefined;

  const [applicantName, setApplicantName] = useState(userProfile?.fullName || "");
  const [applicantPhone, setApplicantPhone] = useState("+91 ");
  const [age, setAge] = useState(castingCall.ageMin || 24);
  const [gender, setGender] = useState<"Male" | "Female" | "Non-Binary" | "Other">(
    castingCall.gender === "Female" ? "Female" : "Male"
  );
  const [height, setHeight] = useState("5'8\"");
  const [city, setCity] = useState(userProfile?.location || "Hyderabad");
  const [state, setState] = useState(userProfile?.state || "Telangana");
  const [spokenLanguages, setSpokenLanguages] = useState<string[]>(
    userProfile?.languages?.length ? userProfile.languages : (castingCall.languages || ["Telugu", "Hindi"])
  );
  const [newLanguage, setNewLanguage] = useState("");
  
  // Find showreel / video audition from profile if available
  const defaultReel = userProfile?.portfolio?.find(p => p.type === "Showreel" || p.category === "Showreel")?.mediaUrl 
    || userProfile?.professionalLinks?.showreel 
    || userProfile?.professionalLinks?.youtube 
    || "";

  const [videoAuditionUrl, setVideoAuditionUrl] = useState(defaultReel);
  const [introVideoUrl, setIntroVideoUrl] = useState(userProfile?.portfolio?.find(p => p.category === "Introduction Video")?.mediaUrl || "");
  const [headshotUrl, setHeadshotUrl] = useState(userProfile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80");
  const [experienceSummary, setExperienceSummary] = useState(
    userProfile 
      ? `${(userProfile.roles || [userProfile.primaryCraftName]).join(" • ")} | ${userProfile.experienceYears} Years Exp: ${userProfile.bio}`
      : ""
  );

  const handleAutoFillFromProfile = () => {
    if (!userProfile) return;
    setApplicantName(userProfile.fullName);
    setCity(userProfile.location);
    if (userProfile.state) setState(userProfile.state);
    if (userProfile.languages?.length) setSpokenLanguages(userProfile.languages);
    if (userProfile.avatarUrl) setHeadshotUrl(userProfile.avatarUrl);
    if (defaultReel) setVideoAuditionUrl(defaultReel);
    const summary = `${(userProfile.roles || [userProfile.primaryCraftName]).join(" • ")} | ${userProfile.experienceYears} Years Exp: ${userProfile.bio}`;
    setExperienceSummary(summary);
  };
  
  // Minor Consent
  const [hasMinorGuardianConsent, setHasMinorGuardianConsent] = useState(false);
  const [guardianName, setGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !spokenLanguages.includes(newLanguage.trim())) {
      setSpokenLanguages([...spokenLanguages, newLanguage.trim()]);
      setNewLanguage("");
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setSpokenLanguages(spokenLanguages.filter(l => l !== lang));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!applicantName.trim()) {
      setErrorMessage("Please provide your full legal name.");
      return;
    }

    if (!applicantPhone.trim()) {
      setErrorMessage("Please provide your contact phone number.");
      return;
    }

    if (castingCall.requiresSelfTape && !videoAuditionUrl.trim()) {
      setErrorMessage("This casting call requires a video self-tape or showreel link.");
      return;
    }

    if (castingCall.requiresMinorConsent && (!hasMinorGuardianConsent || !guardianName.trim() || !guardianContact.trim())) {
      setErrorMessage("Parent / legal guardian consent is required for this minor role submission.");
      return;
    }

    setIsSubmitting(true);

    try {
      const newAudition = submitAudition({
        castingCallId: castingCall.id,
        projectId: castingCall.projectId,
        projectTitle: castingCall.projectTitle,
        characterName: castingCall.characterName,
        roleType: castingCall.roleCategory,
        applicantProfileId: userProfile?.id,
        applicantHandle: userProfile?.handle,
        applicantName,
        applicantEmail: userEmail || "actor@cinevenue.com",
        applicantAvatar: userProfile?.avatarUrl || headshotUrl,
        applicantPhone,
        age: Number(age),
        gender: gender as any,
        height,
        city,
        state,
        spokenLanguages,
        videoAuditionUrl,
        introVideoUrl: introVideoUrl || undefined,
        headshots: [headshotUrl],
        portfolioLinks: userProfile?.portfolio?.map(p => p.mediaUrl) || [],
        experienceSummary,
        hasMinorGuardianConsent,
        guardianName: guardianName || undefined,
        guardianContact: guardianContact || undefined
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      if (onAuditionSubmitted) onAuditionSubmitted(newAudition);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || "Failed to submit audition. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-[#0F1017] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#141622]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400">
                Official Film Audition Submission
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Submit Audition Tape
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Casting Call Summary Box */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase border border-purple-500/30">
                {castingCall.industry} • {castingCall.roleCategory}
              </span>
              <h3 className="text-base font-black text-white mt-1">
                Role: {castingCall.characterName} ({castingCall.roleTitle})
              </h3>
              <p className="text-xs text-white/60">
                Film: <span className="text-amber-400 font-bold">{castingCall.projectTitle}</span> • Dir: {castingCall.directorName}
              </p>
            </div>
            <div className="text-right sm:border-l sm:border-white/10 sm:pl-4">
              <div className="text-xs font-black text-emerald-400">{castingCall.remuneration}</div>
              <div className="text-[10px] text-white/40">Location: {castingCall.shootLocation}</div>
            </div>
          </div>

          {/* Connected CineVenue Professional Profile Auto-Fill Card */}
          {userProfile && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.fullName}
                  className="w-10 h-10 rounded-xl object-cover border border-amber-500/40"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">{userProfile.fullName}</span>
                    {userProfile.handle && (
                      <span className="text-[10px] font-mono text-amber-400">{userProfile.handle}</span>
                    )}
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300">
                      Profile Linked
                    </span>
                  </div>
                  <p className="text-[11px] text-white/60">
                    {(userProfile.roles || [userProfile.primaryCraftName]).join(" • ")} • {userProfile.location}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAutoFillFromProfile}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-end sm:self-center"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Re-sync From Profile</span>
              </button>
            </div>
          )}

          {/* Dialog snippet preview */}
          {castingCall.dialogueScriptSnippet && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Audition Script Snippet</span>
              </div>
              <p className="text-xs italic text-white/90">
                {castingCall.dialogueScriptSnippet}
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Audition Submitted Successfully! Directorial desk notified.</span>
            </div>
          )}

          <form id="audition-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. Performer Particulars */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>1. Artist Particulars</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Arjun Devaiah"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Contact Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="e.g. +91 98450 12345"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    min="4"
                    max="90"
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="Male" className="bg-[#141622]">Male</option>
                    <option value="Female" className="bg-[#141622]">Female</option>
                    <option value="Non-Binary" className="bg-[#141622]">Non-Binary</option>
                    <option value="Other" className="bg-[#141622]">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Height (e.g. 5'10")</label>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Base City & State *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Spoken Languages */}
              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">Fluency Languages</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {spokenLanguages.map((lang, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-semibold flex items-center gap-1 border border-purple-500/30">
                      {lang}
                      <button type="button" onClick={() => handleRemoveLanguage(lang)} className="hover:text-white">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add language (e.g. Tamil, Malayalam, Hindi)..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Self-Tape & Media Links */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h4 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-purple-400" />
                <span>2. Audition Tape & Portfolio Link</span>
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">
                  Self-Tape / Audition Monologue Video URL * {castingCall.requiresSelfTape && <span className="text-amber-400">(Required)</span>}
                </label>
                <input
                  type="url"
                  required={castingCall.requiresSelfTape}
                  value={videoAuditionUrl}
                  onChange={(e) => setVideoAuditionUrl(e.target.value)}
                  placeholder="https://vimeo.com/... or YouTube unlisted / Google Drive link"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-purple-500"
                />
                <span className="text-[10px] text-white/40 block mt-1">
                  Tip: Upload to Vimeo, YouTube (Unlisted), or Drive and ensure permissions are set to Anyone with link.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">
                    Introduction / Slating Video Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={introVideoUrl}
                    onChange={(e) => setIntroVideoUrl(e.target.value)}
                    placeholder="Brief 30-sec profile slating link"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">
                    Headshot / Studio Portrait URL
                  </label>
                  <input
                    type="url"
                    value={headshotUrl}
                    onChange={(e) => setHeadshotUrl(e.target.value)}
                    placeholder="Direct link to your high-res headshot"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">Acting Background & Filmography Highlights</label>
                <textarea
                  rows={3}
                  value={experienceSummary}
                  onChange={(e) => setExperienceSummary(e.target.value)}
                  placeholder="Briefly describe previous theatre, short films, features, or workshops..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>

            {/* 3. Minor Guardian Consent (Mandatory for Child Artist roles) */}
            {castingCall.requiresMinorConsent && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Child Artist Legal Guardian Consent Form</span>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  As this role involves a minor artist under Indian child labor protection and cinema guild safety norms, parent or legal guardian authorization is required.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-white/70 mb-1">Parent / Guardian Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="e.g. Ramesh Varma (Father)"
                      className="w-full px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/70 mb-1">Guardian Phone & Email *</label>
                    <input
                      type="text"
                      required
                      value={guardianContact}
                      onChange={(e) => setGuardianContact(e.target.value)}
                      placeholder="+91 98450 00000 / parent@gmail.com"
                      className="w-full px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={hasMinorGuardianConsent}
                    onChange={(e) => setHasMinorGuardianConsent(e.target.checked)}
                    className="rounded border-amber-400 text-amber-500 focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-amber-300">
                    I confirm I am the parent / legal guardian and consent to this audition submission.
                  </span>
                </label>
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#141622] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="audition-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-purple-400 to-indigo-400 hover:from-purple-400 hover:to-indigo-300 text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Submitting Tape...</span>
            ) : (
              <>
                <Video className="w-4 h-4 text-black" />
                <span>Submit Audition Tape</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
