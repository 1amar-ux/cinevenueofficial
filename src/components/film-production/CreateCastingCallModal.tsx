import React, { useState } from "react";
import { 
  IndianCastingCall, 
  IndianFilmIndustry, 
  CastingRoleCategory,
  FilmProject 
} from "../../types/filmProductionMarketplace";
import { 
  X, Award, PlusCircle, Sparkles, AlertCircle, 
  Film, Users, MapPin, Calendar, DollarSign, CheckCircle2
} from "lucide-react";
import { saveIndianCastingCall } from "../../services/filmProductionService";

interface CreateCastingCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: FilmProject[];
  userEmail?: string | null;
  onCastingCallCreated?: (call: IndianCastingCall) => void;
}

const INDUSTRIES: IndianFilmIndustry[] = [
  "Tollywood (Telugu)",
  "Bollywood (Hindi)",
  "Kollywood (Tamil)",
  "Mollywood (Malayalam)",
  "Sandalwood (Kannada)",
  "Punjabi Cinema",
  "Bengali Cinema",
  "Marathi Cinema",
  "Bhojpuri Cinema",
  "Gujarati Cinema",
  "Pan-India",
  "Independent / OTT"
];

const ROLE_CATEGORIES: CastingRoleCategory[] = [
  "Lead Protagonist (Male)",
  "Lead Protagonist (Female)",
  "Antagonist / Negative Role",
  "Parallel Lead",
  "Supporting Character",
  "Character Artist",
  "Child Artist / Minor",
  "Comedian",
  "Cameo / Special Appearance",
  "Voice / Dubbing Talent",
  "Action / Stunt Double",
  "Background / Junior Artist"
];

export default function CreateCastingCallModal({
  isOpen,
  onClose,
  projects,
  userEmail,
  onCastingCallCreated
}: CreateCastingCallModalProps) {
  if (!isOpen) return null;

  const defaultProject = projects[0];

  const [selectedProjectId, setSelectedProjectId] = useState(defaultProject?.id || "");
  const [industry, setIndustry] = useState<IndianFilmIndustry>("Tollywood (Telugu)");
  const [roleTitle, setRoleTitle] = useState("");
  const [roleCategory, setRoleCategory] = useState<CastingRoleCategory>("Lead Protagonist (Male)");
  const [characterName, setCharacterName] = useState("");
  const [ageMin, setAgeMin] = useState(20);
  const [ageMax, setAgeMax] = useState(35);
  const [gender, setGender] = useState<"Male" | "Female" | "Any">("Any");
  
  const [heightReq, setHeightReq] = useState("");
  const [lookAndStyle, setLookAndStyle] = useState("");
  const [characterBio, setCharacterBio] = useState("");
  const [dialogueScriptSnippet, setDialogueScriptSnippet] = useState("");
  const [auditionInstructions, setAuditionInstructions] = useState("Please submit a 60-90 second self-tape video performing the attached audition script.");
  
  const [languages, setLanguages] = useState<string[]>(["Telugu", "Hindi"]);
  const [newLang, setNewLang] = useState("");

  const [shootLocation, setShootLocation] = useState("Hyderabad, India");
  const [shootingSchedule, setShootingSchedule] = useState("30-40 Days Schedule (Starting Nov 2026)");
  const [remuneration, setRemuneration] = useState("₹15,00,000 - ₹25,00,000");
  const [openingsCount, setOpeningsCount] = useState(1);
  const [deadline, setDeadline] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]);

  const [requiresSelfTape, setRequiresSelfTape] = useState(true);
  const [requiresMonologue, setRequiresMonologue] = useState(true);
  const [requiresMinorConsent, setRequiresMinorConsent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddLanguage = () => {
    if (newLang.trim() && !languages.includes(newLang.trim())) {
      setLanguages([...languages, newLang.trim()]);
      setNewLang("");
    }
  };

  const handleRemoveLanguage = (l: string) => {
    setLanguages(languages.filter(item => item !== l));
  };

  const handleRoleCategoryChange = (cat: CastingRoleCategory) => {
    setRoleCategory(cat);
    if (cat === "Child Artist / Minor") {
      setRequiresMinorConsent(true);
      setAgeMin(6);
      setAgeMax(14);
    } else {
      setRequiresMinorConsent(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!roleTitle.trim()) {
      setErrorMessage("Please enter a role title.");
      return;
    }

    if (!characterName.trim()) {
      setErrorMessage("Please enter the character's name.");
      return;
    }

    if (!characterBio.trim()) {
      setErrorMessage("Please provide character details / bio.");
      return;
    }

    const project = projects.find(p => p.id === selectedProjectId) || defaultProject;

    setIsSubmitting(true);

    try {
      const created = saveIndianCastingCall({
        projectId: project?.id || "proj-1",
        projectTitle: project?.title || "Cinema Feature Film",
        projectBannerUrl: project?.bannerUrl || project?.posterUrl,
        companyName: project?.companyName || "Production Studio",
        directorName: project?.directorName || "Director",
        industry,
        languages,
        roleTitle,
        roleCategory,
        characterName,
        ageMin: Number(ageMin),
        ageMax: Number(ageMax),
        gender,
        physicalAttributes: {
          height: heightReq || undefined,
          lookAndStyle: lookAndStyle || undefined
        },
        characterBio,
        dialogueScriptSnippet,
        auditionInstructions,
        shootLocation,
        shootingSchedule,
        remuneration,
        openingsCount: Number(openingsCount),
        requiresSelfTape,
        requiresMonologue,
        requiresMinorConsent,
        deadline,
        status: "Open",
        featured: true
      });

      setIsSubmitting(false);
      if (onCastingCallCreated) onCastingCallCreated(created);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || "Failed to publish casting call.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-[#0F1017] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#141622]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                Filmmaker & Studio Portal
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Post Indian Casting Call
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form id="create-casting-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Film Project & Cinema Industry */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Project Association & Indian Cinema Circuit</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Associated Film Project *</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#141622] text-white">
                        {p.title} ({p.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Indian Film Industry *</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value as IndianFilmIndustry)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind} className="bg-[#141622] text-white">
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">Languages Required *</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {languages.map((lang, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1 border border-amber-500/30">
                      {lang}
                      <button type="button" onClick={() => handleRemoveLanguage(lang)} className="hover:text-white">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                    placeholder="e.g. Tamil, Telugu, Hindi, Malayalam, Kannada..."
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

            {/* Character & Role Specifications */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h4 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Character & Role Specifications</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Role Title *</label>
                  <input
                    type="text"
                    required
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="e.g. Ruthless Provincial Commander"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Role Category *</label>
                  <select
                    value={roleCategory}
                    onChange={(e) => handleRoleCategoryChange(e.target.value as CastingRoleCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {ROLE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-[#141622] text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Character Name in Script *</label>
                  <input
                    type="text"
                    required
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="e.g. Bhairav Varma"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="Male" className="bg-[#141622]">Male</option>
                    <option value="Female" className="bg-[#141622]">Female</option>
                    <option value="Any" className="bg-[#141622]">Any Gender</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Age Range (Min - Max)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={ageMin}
                      onChange={(e) => setAgeMin(Number(e.target.value))}
                      placeholder="Min"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                    />
                    <input
                      type="number"
                      value={ageMax}
                      onChange={(e) => setAgeMax(Number(e.target.value))}
                      placeholder="Max"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Preferred Physical Look / Height</label>
                  <input
                    type="text"
                    value={heightReq}
                    onChange={(e) => setHeightReq(e.target.value)}
                    placeholder="e.g. 5ft 10in - 6ft 2in, warrior athletic look"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">Character Bio & Emotional Arc *</label>
                <textarea
                  rows={3}
                  required
                  value={characterBio}
                  onChange={(e) => setCharacterBio(e.target.value)}
                  placeholder="Describe character motivation, psychological trait, and presence required on screen..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">Audition Dialogue Test Script (Snippet)</label>
                <textarea
                  rows={2}
                  value={dialogueScriptSnippet}
                  onChange={(e) => setDialogueScriptSnippet(e.target.value)}
                  placeholder="Enter sample punchline or dramatic scene dialogue for actors to test..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none resize-none font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Production Logistics & Remuneration */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h4 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>3. Shoot Logistics & Remuneration</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Shoot Location *</label>
                  <input
                    type="text"
                    required
                    value={shootLocation}
                    onChange={(e) => setShootLocation(e.target.value)}
                    placeholder="e.g. Hyderabad & Hampi Outdoors"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Remuneration / Fee *</label>
                  <input
                    type="text"
                    required
                    value={remuneration}
                    onChange={(e) => setRemuneration(e.target.value)}
                    placeholder="e.g. ₹15,00,000 - ₹25,00,000 (Based on experience)"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Shooting Schedule</label>
                  <input
                    type="text"
                    value={shootingSchedule}
                    onChange={(e) => setShootingSchedule(e.target.value)}
                    placeholder="e.g. 45 Days across 3 Schedules"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">Submission Deadline *</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Requirements checkboxes */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresSelfTape}
                    onChange={(e) => setRequiresSelfTape(e.target.checked)}
                    className="rounded border-white/20 text-amber-500 focus:ring-0"
                  />
                  <span className="font-semibold text-white">Require Audition Self-Tape Video Link</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresMonologue}
                    onChange={(e) => setRequiresMonologue(e.target.checked)}
                    className="rounded border-white/20 text-amber-500 focus:ring-0"
                  />
                  <span className="font-semibold text-white">Require Monologue Script Delivery</span>
                </label>

                {roleCategory === "Child Artist / Minor" && (
                  <label className="flex items-center gap-2 cursor-pointer text-amber-400">
                    <input
                      type="checkbox"
                      checked={requiresMinorConsent}
                      disabled
                      className="rounded border-amber-400 text-amber-500 focus:ring-0"
                    />
                    <span className="font-bold">Mandatory Legal Guardian Consent Check (Minor Protection Norm)</span>
                  </label>
                )}
              </div>
            </div>

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
            form="create-casting-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-gold/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Publishing Call...</span>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 text-black" />
                <span>Publish Casting Call</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
