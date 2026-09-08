import React, { useState } from "react";
import { 
  IndianCastingCall, 
  IndianFilmIndustry, 
  CastingRoleCategory,
  FilmProject,
  REQUIRED_ACTOR_ROLES,
  REQUIRED_CREW_ROLES
} from "../../types/filmProductionMarketplace";
import { 
  X, Award, PlusCircle, Sparkles, AlertCircle, 
  Film, Users, MapPin, Calendar, DollarSign, CheckCircle2, Eye
} from "lucide-react";
import { saveIndianCastingCall } from "../../services/filmProductionService";

interface CreateCastingCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: FilmProject[];
  userEmail?: string | null;
  onCastingCallCreated?: (call: IndianCastingCall) => void;
  customProfessionalRoles?: string[];
}

export default function CreateCastingCallModal({
  isOpen,
  onClose,
  projects,
  userEmail,
  onCastingCallCreated,
  customProfessionalRoles = ["Line Producer", "Drone Operator", "Script Supervisor", "Intimacy Coordinator", "Color Grading Consultant"]
}: CreateCastingCallModalProps) {
  if (!isOpen) return null;

  const normEmail = (userEmail || "").toLowerCase();

  // Filter for projects owned by the user (or all projects if demonstration)
  const myProjects = projects.filter(p => 
    !p.ownerEmail || p.ownerEmail.toLowerCase() === normEmail
  );

  const [selectedProjectId, setSelectedProjectId] = useState(myProjects[0]?.id || projects[0]?.id || "");
  const selectedProject = projects.find(p => p.id === selectedProjectId) || myProjects[0] || projects[0];

  const [categoryType, setCategoryType] = useState<"actors" | "crew" | "other">("actors");

  // Form Fields
  const [callTitle, setCallTitle] = useState("");
  const [requiredRole, setRequiredRole] = useState<string>("Lead Actor");
  const [characterPositionName, setCharacterPositionName] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("2+ years professional experience");
  const [language, setLanguage] = useState("Telugu, Hindi");
  const [location, setLocation] = useState("Hyderabad, India");
  const [shootingLocation, setShootingLocation] = useState("Hyderabad, India");
  const [shootingDates, setShootingDates] = useState("30-40 Days Schedule (Starting Nov 2026)");
  const [auditionRequirements, setAuditionRequirements] = useState("Self-tape monologue + 2 recent unedited headshots");
  const [auditionInstructions, setAuditionInstructions] = useState("Please submit a 60-90 second video performing the character scene with clear audio and lighting.");
  const [compensation, setCompensation] = useState("₹10,00,000 – ₹20,00,000");
  const [openingsCount, setOpeningsCount] = useState(1);
  const [deadline, setDeadline] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [dialogueSnippet, setDialogueSnippet] = useState("");

  // Preview Mode Toggle
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCategoryTypeChange = (type: "actors" | "crew" | "other") => {
    setCategoryType(type);
    if (type === "actors") setRequiredRole(REQUIRED_ACTOR_ROLES[0]);
    else if (type === "crew") setRequiredRole(REQUIRED_CREW_ROLES[0]);
    else setRequiredRole(customProfessionalRoles[0] || "Other Required Professional");
  };

  const handleSubmit = (actionType: "draft" | "publish") => {
    setErrorMessage("");

    if (!callTitle.trim()) {
      setErrorMessage("Please enter a casting call title.");
      return;
    }

    if (!selectedProjectId) {
      setErrorMessage("Please select or create a Film Project first.");
      return;
    }

    const newCall: Partial<IndianCastingCall> = {
      projectId: selectedProjectId,
      projectTitle: selectedProject?.title || "Untitled Project",
      projectBannerUrl: selectedProject?.posterUrl,
      companyName: selectedProject?.companyName || "CineVenue Production",
      directorName: selectedProject?.directorName || "Director",
      industry: (selectedProject?.industry as any) || "Tollywood (Telugu)",
      languages: language.split(",").map(l => l.trim()).filter(Boolean),
      roleTitle: callTitle.trim(),
      roleCategory: requiredRole as any,
      characterName: characterPositionName.trim() || requiredRole,
      ageMin: 18,
      ageMax: 45,
      gender: "Any",
      characterBio: `${description}\n\nRequirements: ${requirements}\nSkills: ${skills}\nExperience: ${experience}`,
      dialogueScriptSnippet: dialogueSnippet.trim() || undefined,
      auditionInstructions: `${auditionRequirements}\n\nInstructions: ${auditionInstructions}\nAdditional Info: ${additionalInfo}`,
      shootLocation: shootingLocation.trim() || location.trim(),
      shootingSchedule: shootingDates.trim(),
      remuneration: compensation.trim(),
      openingsCount: Number(openingsCount) || 1,
      hiredCount: 0,
      requiresSelfTape: true,
      requiresMonologue: !!dialogueSnippet.trim(),
      requiresMinorConsent: requiredRole.includes("Child"),
      deadline,
      status: actionType === "draft" ? "Draft" : "Open",
      featured: false,
      postedDate: new Date().toISOString().split("T")[0],
      submissionsCount: 0,
      ownerEmail: userEmail || "filmmaker@cinevenue.com"
    };

    const saved = saveIndianCastingCall(newCall);
    if (onCastingCallCreated) onCastingCallCreated(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0F1018] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#13141E]">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-base font-black text-white">Create Casting Call</h2>
              <p className="text-[11px] text-white/50">Required Actors, Required Crew Members & Professionals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Preview Mode Switcher */}
        <div className="px-6 pt-3 flex items-center justify-between border-b border-white/5 pb-2 text-xs">
          <span className="text-white/60">
            {isPreviewMode ? "Previewing casting notice as seen by candidates" : "Enter details below"}
          </span>
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isPreviewMode ? "Back to Edit" : "Preview Notice"}</span>
          </button>
        </div>

        {/* Modal Body */}
        {isPreviewMode ? (
          <div className="p-6 space-y-4 overflow-y-auto text-xs">
            <div className="p-4 rounded-2xl bg-[#141524] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {requiredRole} ({categoryType.toUpperCase()})
                </span>
                <span className="text-amber-400 font-bold">{compensation}</span>
              </div>
              
              <h2 className="text-xl font-black text-white">{callTitle || "Untitled Casting Call"}</h2>
              <div className="text-xs text-white/70 font-bold">Position / Character: {characterPositionName || requiredRole}</div>

              <div className="text-xs text-white/60">
                Connected Project: <strong className="text-white">{selectedProject?.title || "None selected"}</strong>
              </div>

              <p className="text-white/80 whitespace-pre-line leading-relaxed">{description || "No description."}</p>

              {dialogueSnippet && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 italic font-mono text-[11px]">
                  "{dialogueSnippet}"
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-white/5">
                <div>Language: <span className="text-white font-bold">{language}</span></div>
                <div>Location: <span className="text-white font-bold">{shootingLocation}</span></div>
                <div>Schedule: <span className="text-white font-bold">{shootingDates}</span></div>
                <div>Deadline: <span className="text-white font-bold">{deadline}</span></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4 overflow-y-auto text-xs">
            
            {/* Film Project Selection (Must be connected to a project) */}
            <div>
              <label className="block text-white/70 font-bold mb-1">Connected Film Project *</label>
              {projects.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  You don't have any Film Projects yet. Please create a Film Project first before posting a casting call.
                </div>
              ) : (
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-[#1A1B28] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.language} • {p.productionStage})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Title & Category Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 font-bold mb-1">Casting Call Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Antagonist Audition or DOP Wanted"
                  value={callTitle}
                  onChange={(e) => setCallTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Personnel Category *</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCategoryTypeChange("actors")}
                    className={`py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center ${
                      categoryType === "actors" ? "bg-purple-500 text-white" : "bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    🎭 Actors
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryTypeChange("crew")}
                    className={`py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center ${
                      categoryType === "crew" ? "bg-purple-500 text-white" : "bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    🎬 Crew
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryTypeChange("other")}
                    className={`py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center ${
                      categoryType === "other" ? "bg-purple-500 text-white" : "bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    ⭐ Other
                  </button>
                </div>
              </div>
            </div>

            {/* Required Role & Character / Position Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 font-bold mb-1">Required Role *</label>
                <select
                  value={requiredRole}
                  onChange={(e) => setRequiredRole(e.target.value)}
                  className="w-full bg-[#1A1B28] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                >
                  {categoryType === "actors" && REQUIRED_ACTOR_ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                  {categoryType === "crew" && REQUIRED_CREW_ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                  {categoryType === "other" && customProfessionalRoles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Character / Position Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commander Vikram or 1st Assistant Camera"
                  value={characterPositionName}
                  onChange={(e) => setCharacterPositionName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Description & Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 font-bold mb-1">Role Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe character psychology, visual references, scene context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Requirements & Experience *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Physical fitness, martial arts background, 3+ years experience..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Skills & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 font-bold mb-1">Required Skills</label>
                <input
                  type="text"
                  placeholder="e.g. Voice Modulation, Horse Riding, Arri Alexa, DaVinci Resolve"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Experience Level</label>
                <input
                  type="text"
                  placeholder="e.g. Prior feature film credits or theatre background"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Language & Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/70 font-bold mb-1">Language(s) *</label>
                <input
                  type="text"
                  required
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Shooting Location *</label>
                <input
                  type="text"
                  required
                  value={shootingLocation}
                  onChange={(e) => setShootingLocation(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Shooting Dates</label>
                <input
                  type="text"
                  value={shootingDates}
                  onChange={(e) => setShootingDates(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Compensation, Openings & Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/70 font-bold mb-1">Compensation / Remuneration *</label>
                <input
                  type="text"
                  required
                  value={compensation}
                  onChange={(e) => setCompensation(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Number of Openings</label>
                <input
                  type="number"
                  min={1}
                  value={openingsCount}
                  onChange={(e) => setOpeningsCount(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Application Deadline *</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Test Audition Script Snippet (for actors) */}
            <div>
              <label className="block text-white/70 font-bold mb-1">Test Audition Script Snippet (Optional)</label>
              <textarea
                rows={2}
                placeholder="Include monologue lines or test dialogue script for candidates to self-tape..."
                value={dialogueSnippet}
                onChange={(e) => setDialogueSnippet(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Audition Requirements & Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 font-bold mb-1">Audition Requirements</label>
                <input
                  type="text"
                  value={auditionRequirements}
                  onChange={(e) => setAuditionRequirements(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Audition Instructions</label>
                <input
                  type="text"
                  value={auditionInstructions}
                  onChange={(e) => setAuditionInstructions(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label className="block text-white/70 font-bold mb-1">Additional Information</label>
              <input
                type="text"
                placeholder="Special notes on travel, accommodation, NDA, or producer requirements..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

          </div>
        )}

        {/* Modal Actions */}
        <div className="p-4 bg-[#13141E] border-t border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer transition-all"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("publish")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-gold/20"
            >
              Publish Casting Call
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
