import React, { useState } from "react";
import { 
  ProfessionalProfile, 
  FilmCraft, 
  PortfolioItem, 
  FilmographyCredit, 
  AvailabilityStatus 
} from "../../types/filmProductionMarketplace";
import { 
  X, Plus, Trash2, CheckCircle2, ShieldCheck, 
  Camera, Film, Video, Music, Calendar, Sparkles, User, Save
} from "lucide-react";
import { saveProfessionalProfile } from "../../services/filmProductionService";

interface MyProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  crafts: FilmCraft[];
  existingProfile?: ProfessionalProfile;
  onProfileUpdated: (profile: ProfessionalProfile) => void;
}

export default function MyProfileEditorModal({
  isOpen,
  onClose,
  userEmail,
  crafts,
  existingProfile,
  onProfileUpdated
}: MyProfileEditorModalProps) {
  if (!isOpen) return null;

  const [activeSection, setActiveSection] = useState<"basic" | "crafts" | "training_links" | "portfolio" | "filmography" | "availability">("basic");

  // Basic Info Form State
  const [fullName, setFullName] = useState(existingProfile?.fullName || userEmail.split("@")[0]);
  const [handle, setHandle] = useState(existingProfile?.handle || `@${userEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase()}`);
  const [headline, setHeadline] = useState(existingProfile?.professionalHeadline || "Director & Filmmaker");
  const [avatarUrl, setAvatarUrl] = useState(existingProfile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80");
  const [coverImageUrl, setCoverImageUrl] = useState(existingProfile?.coverImageUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80");
  const [location, setLocation] = useState(existingProfile?.location || "Hyderabad");
  const [languages, setLanguages] = useState<string>(existingProfile?.languages?.join(", ") || "Telugu, English, Hindi");
  const [bio, setBio] = useState(existingProfile?.bio || "Experienced film professional dedicated to high-quality cinema production.");
  const [experienceYears, setExperienceYears] = useState(existingProfile?.experienceYears || 5);

  // Multi-Roles
  const COMMON_ROLES = [
    "Actor", "Model", "Dancer", "Director", "Writer / Screenwriter",
    "Producer", "Cinematographer (DoP)", "Music Director / Composer", 
    "Playback Singer", "Editor", "Action Choreographer / Stunts",
    "Art Director / Production Designer", "Costume Designer", 
    "Sound Designer", "Colorist / DI", "VFX Artist", "Voice Artist / Dubbing"
  ];
  const [roles, setRoles] = useState<string[]>(
    existingProfile?.roles && existingProfile.roles.length > 0 
      ? existingProfile.roles 
      : ["Director", "Writer"]
  );
  const [customRoleInput, setCustomRoleInput] = useState("");

  const toggleRole = (r: string) => {
    if (roles.includes(r)) {
      setRoles(roles.filter(item => item !== r));
    } else {
      setRoles([...roles, r]);
    }
  };

  const handleAddCustomRole = () => {
    const trimmed = customRoleInput.trim();
    if (trimmed && !roles.includes(trimmed)) {
      setRoles([...roles, trimmed]);
      setCustomRoleInput("");
    }
  };

  // Formal Training & Professional Links
  const [training, setTraining] = useState<string[]>(existingProfile?.training || []);
  const [newTrainingInput, setNewTrainingInput] = useState("");

  const handleAddTraining = () => {
    const trimmed = newTrainingInput.trim();
    if (trimmed && !training.includes(trimmed)) {
      setTraining([...training, trimmed]);
      setNewTrainingInput("");
    }
  };

  const [imdbLink, setImdbLink] = useState(existingProfile?.professionalLinks?.imdb || "");
  const [youtubeLink, setYoutubeLink] = useState(existingProfile?.professionalLinks?.youtube || "");
  const [vimeoLink, setVimeoLink] = useState(existingProfile?.professionalLinks?.vimeo || "");
  const [websiteLink, setWebsiteLink] = useState(existingProfile?.professionalLinks?.website || "");
  const [linkedinLink, setLinkedinLink] = useState(existingProfile?.professionalLinks?.linkedin || "");

  // Crafts Form State
  const [primaryCraftId, setPrimaryCraftId] = useState(existingProfile?.primaryCraftId || (crafts[0]?.id || "craft-1"));
  const [secondaryCraftIds, setSecondaryCraftIds] = useState<string[]>(existingProfile?.secondaryCraftIds || []);
  const [skills, setSkills] = useState<string>(existingProfile?.skills?.join(", ") || "Visual Storytelling, Scene Breakdown, Multi-Camera");
  const [specializations, setSpecializations] = useState<string>(existingProfile?.specializations?.join(", ") || "Action Thrillers, Period Epics");
  const [minPay, setMinPay] = useState(existingProfile?.remunerationRange?.min || 500000);
  const [maxPay, setMaxPay] = useState(existingProfile?.remunerationRange?.max || 1500000);
  const [payUnit, setPayUnit] = useState<any>(existingProfile?.remunerationRange?.unit || "per project");

  // Availability
  const [availStatus, setAvailStatus] = useState<AvailabilityStatus>(existingProfile?.availability?.status || "Available");
  const [availableFrom, setAvailableFrom] = useState(existingProfile?.availability?.availableFrom || new Date().toISOString().split("T")[0]);
  const [availNotes, setAvailNotes] = useState(existingProfile?.availability?.notes || "Open for new projects");

  // Portfolio list
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(existingProfile?.portfolio || []);
  const [newPortTitle, setNewPortTitle] = useState("");
  const [newPortType, setNewPortType] = useState<any>("Showreel");
  const [newPortUrl, setNewPortUrl] = useState("");
  const [newPortRole, setNewPortRole] = useState("");

  // Filmography list
  const [filmography, setFilmography] = useState<FilmographyCredit[]>(existingProfile?.filmography || []);
  const [newFilmTitle, setNewFilmTitle] = useState("");
  const [newFilmRole, setNewFilmRole] = useState("");
  const [newFilmYear, setNewFilmYear] = useState(2025);
  const [newFilmLang, setNewFilmLang] = useState("Telugu");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAddPortfolio = () => {
    if (!newPortTitle.trim() || !newPortUrl.trim()) return;
    const item: PortfolioItem = {
      id: `port-${Date.now()}`,
      title: newPortTitle.trim(),
      type: newPortType,
      mediaUrl: newPortUrl.trim(),
      role: newPortRole.trim() || "Lead Specialist",
      year: new Date().getFullYear(),
      projectType: "Feature Film"
    };
    setPortfolio([...portfolio, item]);
    setNewPortTitle("");
    setNewPortUrl("");
    setNewPortRole("");
  };

  const handleAddFilmCredit = () => {
    if (!newFilmTitle.trim()) return;
    const credit: FilmographyCredit = {
      id: `film-${Date.now()}`,
      projectTitle: newFilmTitle.trim(),
      role: newFilmRole.trim() || "Head",
      craft: crafts.find(c => c.id === primaryCraftId)?.name || "Film Production",
      year: Number(newFilmYear),
      language: newFilmLang,
      projectType: "Feature Film"
    };
    setFilmography([...filmography, credit]);
    setNewFilmTitle("");
    setNewFilmRole("");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const primaryCraftObj = crafts.find(c => c.id === primaryCraftId);
    const secondaryCraftNames = secondaryCraftIds.map(id => crafts.find(c => c.id === id)?.name).filter(Boolean) as string[];

    const formattedHandle = handle.trim() 
      ? (handle.trim().startsWith("@") ? handle.trim() : `@${handle.trim()}`)
      : `@${userEmail.split("@")[0]}`;

    const updated = saveProfessionalProfile({
      id: existingProfile?.id,
      userEmail,
      fullName: fullName.trim(),
      handle: formattedHandle,
      roles: roles.length > 0 ? roles : ["Film Professional"],
      professionalHeadline: headline.trim(),
      avatarUrl: avatarUrl.trim(),
      coverImageUrl: coverImageUrl.trim(),
      location: location.trim(),
      country: "India",
      languages: languages.split(",").map(s => s.trim()).filter(Boolean),
      bio: bio.trim(),
      experienceYears: Number(experienceYears),
      training: training.filter(t => t.trim().length > 0),
      professionalLinks: {
        imdb: imdbLink.trim() || undefined,
        youtube: youtubeLink.trim() || undefined,
        vimeo: vimeoLink.trim() || undefined,
        website: websiteLink.trim() || undefined,
        linkedin: linkedinLink.trim() || undefined,
      },
      primaryCraftId,
      primaryCraftName: primaryCraftObj?.name || "Direction",
      secondaryCraftIds,
      secondaryCraftNames,
      skills: skills.split(",").map(s => s.trim()).filter(Boolean),
      specializations: specializations.split(",").map(s => s.trim()).filter(Boolean),
      remunerationRange: {
        min: Number(minPay),
        max: Number(maxPay),
        currency: "INR",
        unit: payUnit
      },
      availability: {
        status: availStatus,
        availableFrom,
        notes: availNotes
      },
      portfolio,
      filmography,
      verificationLevel: existingProfile?.verificationLevel || "Profile Verified",
      privacySettings: existingProfile?.privacySettings
    });

    onProfileUpdated(updated);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0D0E15] border border-white/15 rounded-3xl overflow-hidden shadow-2xl animate-fade-in my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#111218] shrink-0">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-black text-white">
              {existingProfile ? "Edit Professional Profile & Crafts" : "Create Professional Film Profile"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="px-6 border-b border-white/10 flex items-center gap-2 overflow-x-auto bg-[#090A0F] text-xs font-bold shrink-0">
          {[
            { id: "basic", label: "1. Identity & Roles" },
            { id: "crafts", label: "2. 24 Crafts & Skills" },
            { id: "training_links", label: `3. Training & Links (${training.length})` },
            { id: "portfolio", label: `4. Portfolio (${portfolio.length})` },
            { id: "filmography", label: `5. Filmography (${filmography.length})` },
            { id: "availability", label: "6. Availability & Pay" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeSection === tab.id
                  ? "border-amber-400 text-amber-400 font-black"
                  : "border-transparent text-white/60 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* SECTION 1: IDENTITY & MULTI-ROLES */}
          {activeSection === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 font-bold mb-1">Full Legal / Screen Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/60 font-bold mb-1">Username / Professional Handle *</label>
                  <input
                    type="text"
                    placeholder="e.g. @siddharth_roy"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Multi-Role Selector */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-amber-400 font-black uppercase text-[11px] tracking-wider">
                      Professional Role(s) (Select multiple)
                    </label>
                    <p className="text-[11px] text-white/50">
                      e.g. <span className="text-white font-medium">Actor • Model • Dancer</span> or <span className="text-white font-medium">Director • Writer • Producer</span>
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full">
                    {roles.length} selected
                  </span>
                </div>

                {/* Role Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_ROLES.map(role => {
                    const isSelected = roles.includes(role);
                    return (
                      <button
                        type="button"
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                            : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                        }`}
                      >
                        {role} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Role Input */}
                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <input
                    type="text"
                    placeholder="Add other role (e.g. Dialogue Writer, Steadycam Op)..."
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomRole();
                      }
                    }}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomRole}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white/60 font-bold mb-1">Professional Headline *</label>
                <input
                  type="text"
                  placeholder="e.g. Award-Winning Cinematographer | Period Epics"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 font-bold mb-1">Profile Photo URL</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div>
                  <label className="block text-white/60 font-bold mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/60 font-bold mb-1">Primary Base City *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/60 font-bold mb-1">Years of Industry Experience *</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/60 font-bold mb-1">Languages (comma separated)</label>
                  <input
                    type="text"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 font-bold mb-1">Professional Bio & Industry Background</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60"
                />
              </div>
            </div>
          )}

          {/* SECTION 2: 24 CRAFTS & SKILLS */}
          {activeSection === "crafts" && (
            <div className="space-y-4">
              <div>
                <label className="block text-amber-400 font-bold mb-1">Primary Film Craft *</label>
                <select
                  value={primaryCraftId}
                  onChange={(e) => setPrimaryCraftId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60 cursor-pointer font-semibold"
                >
                  {crafts.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#111218] text-white">
                      Craft #{c.order}: {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/60 font-bold mb-1">Secondary Crafts (Multi-Disciplinary Talent)</label>
                <p className="text-[11px] text-white/40 mb-2">
                  Select additional crafts if you also work as a Writer, Producer, Sound Engineer, etc.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-white/[0.02] border border-white/10">
                  {crafts.map(c => {
                    const isChecked = secondaryCraftIds.includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSecondaryCraftIds(secondaryCraftIds.filter(id => id !== c.id));
                            } else {
                              setSecondaryCraftIds([...secondaryCraftIds, c.id]);
                            }
                          }}
                          className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-white/80 font-medium truncate">{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-white/60 font-bold mb-1">Technical Skills & Equipment (comma separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60"
                  placeholder="e.g. ARRI Alexa LF, Anamorphic Glass, DaVinci Resolve, Logic Pro"
                />
              </div>

              <div>
                <label className="block text-white/60 font-bold mb-1">Specializations & Genre Focus</label>
                <input
                  type="text"
                  value={specializations}
                  onChange={(e) => setSpecializations(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60"
                  placeholder="e.g. Action Spectacles, Period Epics, Non-Linear Thrillers"
                />
              </div>
            </div>
          )}

          {/* SECTION 3: FORMAL TRAINING & PROFESSIONAL LINKS */}
          {activeSection === "training_links" && (
            <div className="space-y-5">
              {/* Formal Training / Institutes */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-amber-400">Formal Training & Film Institutes</h4>
                    <p className="text-[11px] text-white/50">
                      Film schools, acting workshops, choreography diplomas, technical masterclasses.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    {training.length} accredited
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. FTII Pune - Post Graduate Diploma in Direction & Screenwriting"
                    value={newTrainingInput}
                    onChange={(e) => setNewTrainingInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTraining();
                      }
                    }}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddTraining}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {training.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {training.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                        <span className="text-white/90 text-xs font-medium">{item}</span>
                        <button
                          type="button"
                          onClick={() => setTraining(training.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Professional Links */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <h4 className="text-xs font-bold uppercase text-amber-400">Industry Portals & Work Links</h4>
                <p className="text-[11px] text-white/50">
                  Direct links allow casting directors and producers to verify your official credits and high-res reels.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/60 font-semibold mb-1">IMDb Profile URL</label>
                    <input
                      type="url"
                      placeholder="https://www.imdb.com/name/nm..."
                      value={imdbLink}
                      onChange={(e) => setImdbLink(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 font-semibold mb-1">YouTube Channel / Primary Reel</label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/@..."
                      value={youtubeLink}
                      onChange={(e) => setYoutubeLink(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 font-semibold mb-1">Vimeo Showreel</label>
                    <input
                      type="url"
                      placeholder="https://vimeo.com/..."
                      value={vimeoLink}
                      onChange={(e) => setVimeoLink(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 font-semibold mb-1">Personal Portfolio Website</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={websiteLink}
                      onChange={(e) => setWebsiteLink(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-white/60 font-semibold mb-1">LinkedIn Profile</label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      value={linkedinLink}
                      onChange={(e) => setLinkedinLink(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: PORTFOLIO & MEDIA */}
          {activeSection === "portfolio" && (
            <div className="space-y-4">
              {/* Add New Portfolio Item */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold uppercase text-amber-400">Add Portfolio Item (Showreel / Audio / Video)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-white/40 mb-1">Title</label>
                    <input
                      type="text"
                      placeholder="e.g. 2025 Action Showreel"
                      value={newPortTitle}
                      onChange={(e) => setNewPortTitle(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/40 mb-1">Media Type</label>
                    <select
                      value={newPortType}
                      onChange={(e) => setNewPortType(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white cursor-pointer"
                    >
                      <option value="Showreel">Showreel</option>
                      <option value="Video">Video Clip</option>
                      <option value="Audio">Audio Track</option>
                      <option value="Image">Photo / Poster</option>
                      <option value="Document">Script / Pitch Deck</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/40 mb-1">Media / YouTube / Vimeo URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newPortUrl}
                      onChange={(e) => setNewPortUrl(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddPortfolio}
                  className="px-3 py-1.5 bg-amber-500 text-black font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Portfolio</span>
                </button>
              </div>

              {/* Portfolio Items List */}
              <div className="space-y-2">
                {portfolio.map((item, idx) => (
                  <div key={item.id || idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{item.title}</span>
                      <span className="text-amber-400 ml-2">[{item.type}]</span>
                      <p className="text-[11px] text-white/40 truncate max-w-md">{item.mediaUrl}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPortfolio(portfolio.filter((_, i) => i !== idx))}
                      className="p-1.5 text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: FILMOGRAPHY CREDITS */}
          {activeSection === "filmography" && (
            <div className="space-y-4">
              {/* Add Film Credit */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold uppercase text-amber-400">Add Film Credit / Work Experience</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-white/40 mb-1">Film / Project Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Mahasenani"
                      value={newFilmTitle}
                      onChange={(e) => setNewFilmTitle(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/40 mb-1">Role / Position</label>
                    <input
                      type="text"
                      placeholder="e.g. Director of Photography"
                      value={newFilmRole}
                      onChange={(e) => setNewFilmRole(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/40 mb-1">Release Year</label>
                    <input
                      type="number"
                      value={newFilmYear}
                      onChange={(e) => setNewFilmYear(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/40 mb-1">Language</label>
                    <input
                      type="text"
                      value={newFilmLang}
                      onChange={(e) => setNewFilmLang(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddFilmCredit}
                  className="px-3 py-1.5 bg-amber-500 text-black font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Credit</span>
                </button>
              </div>

              {/* Film Credits List */}
              <div className="space-y-2">
                {filmography.map((film, idx) => (
                  <div key={film.id || idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{film.projectTitle}</span>
                      <span className="text-white/60 ml-2">({film.year} • {film.language})</span>
                      <p className="text-amber-300 font-semibold">{film.role}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFilmography(filmography.filter((_, i) => i !== idx))}
                      className="p-1.5 text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: AVAILABILITY & REMUNERATION */}
          {activeSection === "availability" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <h4 className="text-xs font-bold uppercase text-amber-400">Current Availability</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 font-bold mb-1">Status</label>
                    <select
                      value={availStatus}
                      onChange={(e) => setAvailStatus(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white cursor-pointer font-bold"
                    >
                      <option value="Available">🟢 Available for New Projects</option>
                      <option value="Partially Available">🟡 Partially Available (Flexible)</option>
                      <option value="Booked">🔴 Booked (Busy on Current Shoot)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/60 font-bold mb-1">Available From Date</label>
                    <input
                      type="date"
                      value={availableFrom}
                      onChange={(e) => setAvailableFrom(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 font-bold mb-1">Availability Notes</label>
                  <input
                    type="text"
                    value={availNotes}
                    onChange={(e) => setAvailNotes(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                    placeholder="e.g. Free for Pan-India schedules starting mid-September"
                  />
                </div>
              </div>

              {/* Remuneration Range */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <h4 className="text-xs font-bold uppercase text-emerald-400">Remuneration Expectations (INR)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white/60 font-bold mb-1">Minimum (₹)</label>
                    <input
                      type="number"
                      step={50000}
                      value={minPay}
                      onChange={(e) => setMinPay(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 font-bold mb-1">Maximum (₹)</label>
                    <input
                      type="number"
                      step={50000}
                      value={maxPay}
                      onChange={(e) => setMaxPay(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 font-bold mb-1">Pricing Unit</label>
                    <select
                      value={payUnit}
                      onChange={(e) => setPayUnit(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white cursor-pointer"
                    >
                      <option value="per project">per project</option>
                      <option value="per day">per day</option>
                      <option value="per month">per month</option>
                      <option value="per song">per song</option>
                      <option value="negotiable">negotiable</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Profile saved and published successfully!
              </span>
            ) : (
              <span className="text-white/40">All details are verified by CineVenue Security Engine.</span>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save & Publish Profile"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
