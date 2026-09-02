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

  const [activeSection, setActiveSection] = useState<"basic" | "crafts" | "portfolio" | "filmography" | "availability">("basic");

  // Basic Info Form State
  const [fullName, setFullName] = useState(existingProfile?.fullName || userEmail.split("@")[0]);
  const [headline, setHeadline] = useState(existingProfile?.professionalHeadline || "Director & Filmmaker");
  const [avatarUrl, setAvatarUrl] = useState(existingProfile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80");
  const [coverImageUrl, setCoverImageUrl] = useState(existingProfile?.coverImageUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80");
  const [location, setLocation] = useState(existingProfile?.location || "Hyderabad");
  const [languages, setLanguages] = useState<string>(existingProfile?.languages?.join(", ") || "Telugu, English, Hindi");
  const [bio, setBio] = useState(existingProfile?.bio || "Experienced film professional dedicated to high-quality cinema production.");
  const [experienceYears, setExperienceYears] = useState(existingProfile?.experienceYears || 5);

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

    const updated = saveProfessionalProfile({
      id: existingProfile?.id,
      userEmail,
      fullName: fullName.trim(),
      professionalHeadline: headline.trim(),
      avatarUrl: avatarUrl.trim(),
      coverImageUrl: coverImageUrl.trim(),
      location: location.trim(),
      country: "India",
      languages: languages.split(",").map(s => s.trim()).filter(Boolean),
      bio: bio.trim(),
      experienceYears: Number(experienceYears),
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
      verificationLevel: existingProfile?.verificationLevel || "Profile Verified"
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
            { id: "basic", label: "1. Basic Info" },
            { id: "crafts", label: "2. 24 Crafts & Skills" },
            { id: "portfolio", label: `3. Portfolio (${portfolio.length})` },
            { id: "filmography", label: `4. Filmography (${filmography.length})` },
            { id: "availability", label: "5. Availability & Pay" }
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
          
          {/* SECTION 1: BASIC INFO */}
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

          {/* SECTION 3: PORTFOLIO & MEDIA */}
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

          {/* SECTION 4: FILMOGRAPHY CREDITS */}
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

          {/* SECTION 5: AVAILABILITY & REMUNERATION */}
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
