import React, { useState } from "react";
import { 
  X, Send, FileText, Upload, Lock, ShieldCheck, CheckCircle2, Sparkles, 
  ChevronRight, ChevronLeft, Plus, Trash2, HelpCircle, Eye, AlertCircle, Film,
  User, Building, Clapperboard, DollarSign, Calendar, MapPin, Globe, CheckSquare,
  Edit3
} from "lucide-react";
import { 
  FilmProjectApplication, 
  ApplicationProjectType, 
  ApplicantRole, 
  ProjectStage, 
  CastMemberSubmission 
} from "../../types/productions";

interface FilmProjectApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitApplication: (application: FilmProjectApplication) => void;
  userEmail?: string | null;
  onOpenDashboard?: () => void;
}

const PROJECT_TYPES: ApplicationProjectType[] = [
  "Feature Film",
  "Short Film",
  "Web Series",
  "Anthology",
  "Music Film",
  "Other"
];

const GENRE_OPTIONS = [
  "Action", "Drama", "Romance", "Comedy", "Thriller", "Crime", "Horror", 
  "Family", "Social", "Biography", "Historical", "Fantasy", "Sci-Fi", "Other"
];

const STAGE_OPTIONS: ProjectStage[] = [
  "Idea",
  "Story Developed",
  "Screenplay Completed",
  "Pre-Production",
  "Casting",
  "Ready for Production",
  "Already Produced"
];

const ROLE_OPTIONS: ApplicantRole[] = [
  "Writer",
  "Director",
  "Producer",
  "Writer-Director",
  "Production Company",
  "Filmmaker",
  "Other"
];

const COLLABORATION_OPTIONS = [
  "Full Production",
  "Co-Production",
  "Production Services",
  "Casting Support",
  "Post-Production Support",
  "Marketing & Promotion",
  "Brand Promotion / Integration",
  "Event Management",
  "Distribution",
  "Ticketing",
  "Other"
];

const BUDGET_RANGES = [
  "Under ₹1 Crore (Micro-Budget)",
  "₹1 Crore - ₹5 Crores (Indie)",
  "₹5 Crores - ₹15 Crores (Mid-Budget)",
  "₹15 Crores - ₹50 Crores (Large-Budget)",
  "₹50 Crores+ (Pan-India Spectacle)"
];

export default function FilmProjectApplicationModal({
  isOpen,
  onClose,
  onSubmitApplication,
  userEmail,
  onOpenDashboard
}: FilmProjectApplicationModalProps) {
  if (!isOpen) return null;

  // Step indicator (1 to 8)
  const [currentStep, setCurrentStep] = useState(1);

  // Success state
  const [submittedApp, setSubmittedApp] = useState<FilmProjectApplication | null>(null);

  // Step 1: Project Details
  const [projectTitle, setProjectTitle] = useState("");
  const [projectType, setProjectType] = useState<ApplicationProjectType>("Feature Film");
  const [language, setLanguage] = useState("Telugu");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["Drama", "Thriller"]);
  const [logline, setLogline] = useState("");
  const [shortSynopsis, setShortSynopsis] = useState("");
  const [fullSynopsis, setFullSynopsis] = useState("");
  const [projectStage, setProjectStage] = useState<ProjectStage>("Screenplay Completed");

  // Step 2: Applicant Details
  const [fullName, setFullName] = useState("");
  const [professionalRole, setProfessionalRole] = useState<ApplicantRole>("Writer-Director");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(userEmail || "");
  const [city, setCity] = useState("Hyderabad");
  const [state, setState] = useState("Telangana");
  const [country, setCountry] = useState("India");
  const [isSubmittingForOthers, setIsSubmittingForOthers] = useState(false);
  const [representedEntityDetails, setRepresentedEntityDetails] = useState("");

  // Step 3: Creative Team
  const [directorName, setDirectorName] = useState("");
  const [directorPreviousWork, setDirectorPreviousWork] = useState("");
  const [directorPortfolioUrl, setDirectorPortfolioUrl] = useState("");
  const [writerName, setWriterName] = useState("");
  const [writerPreviousWork, setWriterPreviousWork] = useState("");
  const [producerName, setProducerName] = useState("");
  const [producerCompany, setProducerCompany] = useState("");
  const [leadCast, setLeadCast] = useState<CastMemberSubmission[]>([
    { id: "1", name: "", role: "Lead Character", status: "Not Yet Cast" }
  ]);
  const [cinematographer, setCinematographer] = useState("");
  const [musicDirector, setMusicDirector] = useState("");
  const [editor, setEditor] = useState("");
  const [productionDesigner, setProductionDesigner] = useState("");
  const [otherCrew, setOtherCrew] = useState("");

  // Step 4: Project Information
  const [estimatedBudgetRange, setEstimatedBudgetRange] = useState("₹5 Crores - ₹15 Crores (Mid-Budget)");
  const [expectedShootingDuration, setExpectedShootingDuration] = useState("45 Days");
  const [primaryShootingLocation, setPrimaryShootingLocation] = useState("");
  const [targetAudience, setTargetAudience] = useState("General Youth & Family (18-40)");
  const [targetReleasePeriod, setTargetReleasePeriod] = useState("Dussehra / Festive 2027");
  const [estimatedRuntime, setEstimatedRuntime] = useState("135 Minutes");
  const [numberOfSongs, setNumberOfSongs] = useState("3");
  const [numberOfActionSequences, setNumberOfActionSequences] = useState("2");
  const [alreadyProduced, setAlreadyProduced] = useState(false);
  const [producedStatus, setProducedStatus] = useState("");
  const [previousReleaseDetails, setPreviousReleaseDetails] = useState("");
  const [existingDistributionStatus, setExistingDistributionStatus] = useState("");
  const [availableMasterFormat, setAvailableMasterFormat] = useState("");

  // Step 5: Collaboration
  const [requestedCollaboration, setRequestedCollaboration] = useState<string[]>([
    "Co-Production", "Marketing & Promotion", "Distribution"
  ]);
  const [expectationsFromCineVenue, setExpectationsFromCineVenue] = useState("");

  // Step 6: Materials File Names / References
  const [synopsisFileName, setSynopsisFileName] = useState("");
  const [scriptFileName, setScriptFileName] = useState("");
  const [pitchDeckFileName, setPitchDeckFileName] = useState("");
  const [characterDetailsFileName, setCharacterDetailsFileName] = useState("");
  const [directorsNoteFileName, setDirectorsNoteFileName] = useState("");
  const [posterFileName, setPosterFileName] = useState("");
  const [teaserFileName, setTeaserFileName] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [previousWorkUrl, setPreviousWorkUrl] = useState("");
  const [showreelUrl, setShowreelUrl] = useState("");
  const [referenceImagesFileName, setReferenceImagesFileName] = useState("");
  const [additionalDocFileName, setAdditionalDocFileName] = useState("");

  // Step 7: Declarations
  const [rightToSubmitConfirmed, setRightToSubmitConfirmed] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [nonGuaranteeUnderstood, setNonGuaranteeUnderstood] = useState(false);

  // Policy Modals state
  const [policyModalType, setPolicyModalType] = useState<string | null>(null);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const toggleCollaboration = (collab: string) => {
    if (requestedCollaboration.includes(collab)) {
      setRequestedCollaboration(requestedCollaboration.filter(c => c !== collab));
    } else {
      setRequestedCollaboration([...requestedCollaboration, collab]);
    }
  };

  const handleAddCast = () => {
    setLeadCast([
      ...leadCast,
      { id: Date.now().toString(), name: "", role: "", status: "Not Yet Cast" }
    ]);
  };

  const handleRemoveCast = (id: string) => {
    if (leadCast.length > 1) {
      setLeadCast(leadCast.filter(c => c.id !== id));
    }
  };

  const handleUpdateCast = (id: string, field: keyof CastMemberSubmission, val: string) => {
    setLeadCast(leadCast.map(c => c.id === id ? { ...c, [field]: val } : c));
  };

  const handleNextStep = () => {
    // Validation per step
    if (currentStep === 1) {
      if (!projectTitle.trim() || !logline.trim()) {
        alert("Please enter the Project Title and Logline.");
        return;
      }
      if (selectedGenres.length === 0) {
        alert("Please select at least one genre.");
        return;
      }
    } else if (currentStep === 2) {
      if (!fullName.trim() || !phone.trim() || !email.trim()) {
        alert("Please fill in your Full Name, Phone Number, and Email Address.");
        return;
      }
    } else if (currentStep === 5) {
      if (requestedCollaboration.length === 0) {
        alert("Please select at least one collaboration type you need from CineVenue.");
        return;
      }
    } else if (currentStep === 7) {
      if (!rightToSubmitConfirmed || !termsAgreed || !nonGuaranteeUnderstood) {
        alert("Please confirm all declarations and agree to submission terms before proceeding.");
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleFinalSubmit = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newId = `CVP-2026-00${randomNum}`;

    const application: FilmProjectApplication = {
      id: newId,
      userEmail: email,
      submittedAt: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
      status: "Submitted",

      projectTitle,
      projectType,
      language,
      genre: selectedGenres,
      logline,
      shortSynopsis,
      fullSynopsis,
      projectStage,

      fullName,
      professionalRole,
      phone,
      email,
      city,
      state,
      country,
      isSubmittingForOthers,
      representedEntityDetails: isSubmittingForOthers ? representedEntityDetails : undefined,

      directorName: directorName || fullName,
      directorPreviousWork,
      directorPortfolioUrl,
      writerName: writerName || fullName,
      writerPreviousWork,
      producerName,
      producerCompany,
      leadCast: leadCast.filter(c => c.name.trim().length > 0 || c.role.trim().length > 0),
      keyCrew: {
        cinematographer,
        musicDirector,
        editor,
        productionDesigner,
        otherCrew
      },

      estimatedBudgetRange,
      expectedShootingDuration,
      primaryShootingLocation,
      targetAudience,
      targetReleasePeriod,
      estimatedRuntime,
      numberOfSongs,
      numberOfActionSequences,
      alreadyProduced,
      producedDetails: alreadyProduced ? {
        currentStatus: producedStatus,
        previousReleaseDetails,
        existingDistributionStatus,
        availableMasterFormat
      } : undefined,

      requestedCollaboration,
      expectationsFromCineVenue,

      materials: {
        synopsisFileName: synopsisFileName || `${projectTitle.replace(/\s+/g, "_")}_Synopsis.pdf`,
        scriptFileName: scriptFileName || `${projectTitle.replace(/\s+/g, "_")}_Script.pdf`,
        pitchDeckFileName: pitchDeckFileName || `${projectTitle.replace(/\s+/g, "_")}_PitchDeck.pdf`,
        characterDetailsFileName,
        directorsNoteFileName,
        posterFileName,
        teaserFileName,
        trailerUrl,
        previousWorkUrl,
        showreelUrl,
        referenceImagesFileName,
        additionalDocFileName
      },

      rightToSubmitConfirmed,
      termsAgreed,
      nonGuaranteeUnderstood
    };

    onSubmitApplication(application);
    setSubmittedApp(application);
  };

  const stepTitles = [
    "Project Details",
    "Applicant Details",
    "Creative Team",
    "Project Information",
    "Collaboration Needs",
    "Project Materials",
    "Declarations",
    "Review & Submit"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#0C0D11] border border-gold/30 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-[#12131A] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-gold to-yellow-400 p-0.5 flex items-center justify-center shadow-lg shadow-gold/20">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                <Clapperboard className="w-5 h-5 text-gold" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30">
                  CineVenue Productions
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Confidential Submission
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white">
                Film Project Application Form
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {submittedApp ? (
            /* SUCCESS PAGE */
            <div className="py-8 text-center space-y-6 max-w-xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gold">
                  Submission Received
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                  PROJECT SUBMITTED SUCCESSFULLY 🎬
                </h3>
              </div>

              <p className="text-sm text-white/70 leading-relaxed">
                Thank you for submitting your project to <strong className="text-white">CineVenue Productions</strong>. Our evaluation committee will review your script, pitch materials, and financial structure. If shortlisted, our team will contact you directly for a development session.
              </p>

              <div className="bg-[#161722] border border-gold/30 rounded-2xl p-5 space-y-3 text-left">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs text-white/60">Unique Project ID:</span>
                  <span className="text-sm font-mono font-bold text-gold px-2.5 py-1 bg-gold/10 border border-gold/30 rounded-lg">
                    {submittedApp.id}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-white/50 block">Project Title:</span>
                    <span className="font-bold text-white">{submittedApp.projectTitle}</span>
                  </div>
                  <div>
                    <span className="text-white/50 block">Submission Date:</span>
                    <span className="font-bold text-white">{submittedApp.submittedAt}</span>
                  </div>
                  <div>
                    <span className="text-white/50 block">Current Status:</span>
                    <span className="font-bold text-amber-400 px-2 py-0.5 bg-amber-400/10 rounded border border-amber-400/30">
                      {submittedApp.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/50 block">Primary Format:</span>
                    <span className="font-bold text-white">{submittedApp.projectType}</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-left text-xs space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" /> Confidentiality Guarantee
                </div>
                <p className="text-white/70">
                  Your submitted materials, scripts, and personal details are encrypted and protected under CineVenue Non-Disclosure Terms. They are accessible exclusively by authorized CineVenue Productions executives.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {onOpenDashboard && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDashboard();
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:opacity-90 shadow-lg shadow-gold/20 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>VIEW APPLICATION STATUS</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                >
                  Close & Return
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Progress Bar & Steps Indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white/70">
                  <span className="text-gold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-gold/20 text-gold border border-gold/40 flex items-center justify-center text-[10px]">
                      0{currentStep}
                    </span>
                    {stepTitles[currentStep - 1]}
                  </span>
                  <span className="text-white/40">Step {currentStep} of 8</span>
                </div>

                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 via-gold to-yellow-400 h-full transition-all duration-300"
                    style={{ width: `${(currentStep / 8) * 100}%` }}
                  />
                </div>

                {/* Horizontal Step Pills */}
                <div className="hidden md:flex items-center justify-between pt-1 gap-1 overflow-x-auto text-[10px]">
                  {stepTitles.map((title, idx) => {
                    const stepNum = idx + 1;
                    const isActive = currentStep === stepNum;
                    const isDone = currentStep > stepNum;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (isDone) setCurrentStep(stepNum);
                        }}
                        disabled={!isDone}
                        className={`px-2 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                          isActive 
                            ? "bg-gold/20 text-gold border border-gold/40 font-bold" 
                            : isDone 
                              ? "text-emerald-400 hover:text-white" 
                              : "text-white/30 cursor-not-allowed"
                        }`}
                      >
                        {isDone ? "✓ " : `${stepNum}. `}{title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 1: PROJECT DETAILS */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in text-xs">
                  <div className="border-b border-white/10 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Film className="w-4 h-4 text-gold" /> Step 1: Project Details
                    </h3>
                    <p className="text-white/50 text-[11px]">Specify core film metadata, genres, and narrative overview.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 font-bold mb-1">Project Title *</label>
                      <input
                        type="text"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        placeholder="e.g. Ghosts of Godavari"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 font-bold mb-1">Project Type *</label>
                      <select
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value as ApplicationProjectType)}
                        className="w-full bg-[#161722] border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none cursor-pointer"
                      >
                        {PROJECT_TYPES.map(pt => (
                          <option key={pt} value={pt}>{pt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 font-bold mb-1">Primary Language *</label>
                      <input
                        type="text"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        placeholder="e.g. Telugu / Hindi / Tamil / Pan-India"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 font-bold mb-1">Current Project Stage *</label>
                      <select
                        value={projectStage}
                        onChange={(e) => setProjectStage(e.target.value as ProjectStage)}
                        className="w-full bg-[#161722] border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none cursor-pointer"
                      >
                        {STAGE_OPTIONS.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 font-bold mb-1.5">Select Genre(s) *</label>
                    <div className="flex flex-wrap gap-2">
                      {GENRE_OPTIONS.map(g => {
                        const isSelected = selectedGenres.includes(g);
                        return (
                          <button
                            type="button"
                            key={g}
                            onClick={() => toggleGenre(g)}
                            className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-gold text-black border-gold font-bold shadow-md shadow-gold/20"
                                : "bg-white/5 border-white/10 text-white/70 hover:border-white/30"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}{g}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 font-bold mb-1">Logline (1-2 sentences pitch summary) *</label>
                    <input
                      type="text"
                      value={logline}
                      onChange={(e) => setLogline(e.target.value)}
                      placeholder="e.g. An exiled detective with hyperacusis investigates supernatural river drownings..."
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 font-bold mb-1">Short Synopsis (150-250 words)</label>
                    <textarea
                      rows={3}
                      value={shortSynopsis}
                      onChange={(e) => setShortSynopsis(e.target.value)}
                      placeholder="Provide a high-level summary of the premise, main protagonist, conflict, and stakes..."
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 font-bold mb-1">Full Plot Synopsis (Optional / Spoiler-inclusive)</label>
                    <textarea
                      rows={4}
                      value={fullSynopsis}
                      onChange={(e) => setFullSynopsis(e.target.value)}
                      placeholder="Detailed outline including act structure, twists, and climax for evaluation panel..."
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: APPLICANT DETAILS */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in text-xs">
                  <div className="border-b border-white/10 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-gold" /> Step 2: Applicant Details
                    </h3>
                    <p className="text-white/50 text-[11px]">Primary contact person and authorization info.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 font-bold mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 font-bold mb-1">Your Professional Role *</label>
                      <select
                        value={professionalRole}
                        onChange={(e) => setProfessionalRole(e.target.value as ApplicantRole)}
                        className="w-full bg-[#161722] border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none cursor-pointer"
                      >
                        {ROLE_OPTIONS.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 font-bold mb-1">Phone / WhatsApp Number *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 font-bold mb-1">Email Address *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white/80 font-bold mb-1">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Hyderabad"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 font-bold mb-1">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Telangana"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 font-bold mb-1">Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="India"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer text-white text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={isSubmittingForOthers}
                        onChange={(e) => setIsSubmittingForOthers(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <span>Are you submitting this project on behalf of another person, production house, or company?</span>
                    </label>

                    {isSubmittingForOthers && (
                      <div className="p-3 bg-[#161722] border border-amber-500/30 rounded-xl space-y-2">
                        <label className="block text-amber-400 font-bold mb-1">Represented Person / Company Details</label>
                        <input
                          type="text"
                          value={representedEntityDetails}
                          onChange={(e) => setRepresentedEntityDetails(e.target.value)}
                          placeholder="e.g. Submitting on behalf of Red Earth Motion Pictures Pvt Ltd (Authorization letter attached)"
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: CREATIVE TEAM */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fade-in text-xs">
                  <div className="border-b border-white/10 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Clapperboard className="w-4 h-4 text-gold" /> Step 3: Creative Team
                    </h3>
                    <p className="text-white/50 text-[11px]">List key creative personnel and lead cast attached or envisioned.</p>
                  </div>

                  {/* Director */}
                  <div className="p-3.5 bg-[#161722] border border-white/10 rounded-xl space-y-2">
                    <h4 className="font-bold text-gold text-xs uppercase tracking-wider">Director</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-white/70 mb-1 font-semibold">Name</label>
                        <input
                          type="text"
                          value={directorName}
                          onChange={(e) => setDirectorName(e.target.value)}
                          placeholder="Director's Name"
                          className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 mb-1 font-semibold">Previous Work</label>
                        <input
                          type="text"
                          value={directorPreviousWork}
                          onChange={(e) => setDirectorPreviousWork(e.target.value)}
                          placeholder="Filmography / Shorts"
                          className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 mb-1 font-semibold">Portfolio / Reel Link</label>
                        <input
                          type="url"
                          value={directorPortfolioUrl}
                          onChange={(e) => setDirectorPortfolioUrl(e.target.value)}
                          placeholder="https://vimeo.com/..."
                          className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-gold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Writer & Producer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-[#161722] border border-white/10 rounded-xl space-y-2">
                      <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">Screenplay Writer</h4>
                      <div>
                        <input
                          type="text"
                          value={writerName}
                          onChange={(e) => setWriterName(e.target.value)}
                          placeholder="Writer Name"
                          className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-gold mb-2"
                        />
                        <input
                          type="text"
                          value={writerPreviousWork}
                          onChange={(e) => setWriterPreviousWork(e.target.value)}
                          placeholder="Writer's previous credits"
                          className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-gold"
                        />
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#161722] border border-white/10 rounded-xl space-y-2">
                      <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">Producer / Banner</h4>
                      <div>
                        <input
                          type="text"
                          value={producerName}
                          onChange={(e) => setProducerName(e.target.value)}
                          placeholder="Producer Name"
                          className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-gold mb-2"
                        />
                        <input
                          type="text"
                          value={producerCompany}
                          onChange={(e) => setProducerCompany(e.target.value)}
                          placeholder="Production Banner / Company"
                          className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-gold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lead Cast */}
                  <div className="p-3.5 bg-[#161722] border border-white/10 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-4 h-4 text-gold" /> Lead Cast Envisioned / Confirmed
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddCast}
                        className="px-2.5 py-1 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/30 rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Cast Member
                      </button>
                    </div>

                    {leadCast.map((cast, idx) => (
                      <div key={cast.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-black/40 p-2.5 rounded-lg border border-white/5">
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            value={cast.name}
                            onChange={(e) => handleUpdateCast(cast.id, "name", e.target.value)}
                            placeholder="Actor Name"
                            className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-white text-xs outline-none focus:border-gold"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            value={cast.role}
                            onChange={(e) => handleUpdateCast(cast.id, "role", e.target.value)}
                            placeholder="Character / Role Name"
                            className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-white text-xs outline-none focus:border-gold"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <select
                            value={cast.status}
                            onChange={(e) => handleUpdateCast(cast.id, "status", e.target.value as any)}
                            className="w-full bg-[#1A1C27] border border-white/10 rounded px-2 py-1.5 text-white text-xs outline-none cursor-pointer"
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="In Discussion">In Discussion</option>
                            <option value="Not Yet Cast">Not Yet Cast</option>
                          </select>
                        </div>
                        <div className="sm:col-span-1 flex justify-end">
                          {leadCast.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCast(cast.id)}
                              className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Key Crew */}
                  <div className="p-3.5 bg-[#161722] border border-white/10 rounded-xl space-y-2">
                    <h4 className="font-bold text-white/80 text-xs uppercase tracking-wider">Key Technical Crew (Optional)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-white/60 mb-0.5">Cinematographer (DOP)</label>
                        <input
                          type="text"
                          value={cinematographer}
                          onChange={(e) => setCinematographer(e.target.value)}
                          placeholder="e.g. PG Vinda"
                          className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-white text-xs outline-none focus:border-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-white/60 mb-0.5">Music Director</label>
                        <input
                          type="text"
                          value={musicDirector}
                          onChange={(e) => setMusicDirector(e.target.value)}
                          placeholder="e.g. Kaala Bhairava"
                          className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-white text-xs outline-none focus:border-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-white/60 mb-0.5">Editor</label>
                        <input
                          type="text"
                          value={editor}
                          onChange={(e) => setEditor(e.target.value)}
                          placeholder="e.g. Naveen Nooli"
                          className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-white text-xs outline-none focus:border-gold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: PROJECT INFORMATION */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-fade-in text-xs">
                  <div className="border-b border-white/10 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gold" /> Step 4: Project Financial & Scale Info
                    </h3>
                    <p className="text-white/50 text-[11px]">Budgeting, shooting timelines, audience demographics, and format scale.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 font-bold mb-1">Estimated Budget Range *</label>
                      <select
                        value={estimatedBudgetRange}
                        onChange={(e) => setEstimatedBudgetRange(e.target.value)}
                        className="w-full bg-[#161722] border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none cursor-pointer"
                      >
                        {BUDGET_RANGES.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-white/80 font-bold mb-1">Expected Shooting Duration</label>
                      <input
                        type="text"
                        value={expectedShootingDuration}
                        onChange={(e) => setExpectedShootingDuration(e.target.value)}
                        placeholder="e.g. 45 Days / 12 Weeks"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 font-bold mb-1">Primary Shooting Location(s)</label>
                      <input
                        type="text"
                        value={primaryShootingLocation}
                        onChange={(e) => setPrimaryShootingLocation(e.target.value)}
                        placeholder="e.g. Rajahmundry, Hyderabad & London"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 font-bold mb-1">Target Audience Demographics</label>
                      <input
                        type="text"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="e.g. Youth, Thriller fans, Pan-South multiplex"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white/80 font-bold mb-1">Target Release Period</label>
                      <input
                        type="text"
                        value={targetReleasePeriod}
                        onChange={(e) => setTargetReleasePeriod(e.target.value)}
                        placeholder="e.g. Summer 2027"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 font-bold mb-1">Estimated Runtime</label>
                      <input
                        type="text"
                        value={estimatedRuntime}
                        onChange={(e) => setEstimatedRuntime(e.target.value)}
                        placeholder="e.g. 135 Mins / 8 Episodes"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 font-bold mb-1">Number of Songs / Action</label>
                      <div className="grid grid-cols-2 gap-1">
                        <input
                          type="text"
                          value={numberOfSongs}
                          onChange={(e) => setNumberOfSongs(e.target.value)}
                          placeholder="Songs"
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-2.5 py-2.5 text-white focus:border-gold outline-none text-center"
                        />
                        <input
                          type="text"
                          value={numberOfActionSequences}
                          onChange={(e) => setNumberOfActionSequences(e.target.value)}
                          placeholder="Action"
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-2.5 py-2.5 text-white focus:border-gold outline-none text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer text-white text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={alreadyProduced}
                        onChange={(e) => setAlreadyProduced(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <span>Is this project already produced / filmed in whole or in part?</span>
                    </label>

                    {alreadyProduced && (
                      <div className="p-4 bg-[#161722] border border-amber-500/30 rounded-xl space-y-3">
                        <h4 className="font-bold text-amber-400 text-xs uppercase">Produced Film Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-white/70 mb-1">Current Status</label>
                            <input
                              type="text"
                              value={producedStatus}
                              onChange={(e) => setProducedStatus(e.target.value)}
                              placeholder="e.g. Rough Cut Complete / Post-Production"
                              className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-white/70 mb-1">Available Master Format</label>
                            <input
                              type="text"
                              value={availableMasterFormat}
                              onChange={(e) => setAvailableMasterFormat(e.target.value)}
                              placeholder="e.g. 4K Apple ProRes / DCP 2K"
                              className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-white/70 mb-1">Previous Festival / Screening Details</label>
                            <input
                              type="text"
                              value={previousReleaseDetails}
                              onChange={(e) => setPreviousReleaseDetails(e.target.value)}
                              placeholder="e.g. Screened at IFFI 2025"
                              className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-white/70 mb-1">Existing Distribution Rights Status</label>
                            <input
                              type="text"
                              value={existingDistributionStatus}
                              onChange={(e) => setExistingDistributionStatus(e.target.value)}
                              placeholder="e.g. All theatrical & digital rights available"
                              className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-gold"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: COLLABORATION NEEDED */}
              {currentStep === 5 && (
                <div className="space-y-4 animate-fade-in text-xs">
                  <div className="border-b border-white/10 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gold" /> Step 5: What Do You Need From CineVenue?
                    </h3>
                    <p className="text-white/50 text-[11px]">Select all production, marketing, casting, event, or distribution services required.</p>
                  </div>

                  <div>
                    <label className="block text-white/90 font-bold mb-2">Select Requested Collaboration Type(s) *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {COLLABORATION_OPTIONS.map(collab => {
                        const isSelected = requestedCollaboration.includes(collab);
                        return (
                          <div
                            key={collab}
                            onClick={() => toggleCollaboration(collab)}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected 
                                ? "bg-gradient-to-r from-amber-500/20 to-gold/10 border-gold text-gold font-bold shadow-md shadow-gold/10" 
                                : "bg-[#161722] border-white/10 text-white/70 hover:border-white/30"
                            }`}
                          >
                            <span>{collab}</span>
                            <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                              isSelected ? "bg-gold text-black font-extrabold" : "border border-white/30"
                            }`}>
                              {isSelected && "✓"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 font-bold mb-1">Tell us what you expect from CineVenue Productions</label>
                    <textarea
                      rows={4}
                      value={expectationsFromCineVenue}
                      onChange={(e) => setExpectationsFromCineVenue(e.target.value)}
                      placeholder="e.g. We are seeking 50% co-financing, assistance in attaching a A-list lead actor through CineVenue casting board, and nationwide theatrical distribution + ticket booking integration..."
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 6: PROJECT MATERIALS */}
              {currentStep === 6 && (
                <div className="space-y-4 animate-fade-in text-xs">
                  <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Upload className="w-4 h-4 text-gold" /> Step 6: Confidential Project Materials
                      </h3>
                      <p className="text-white/50 text-[11px]">Attach scripts, pitch decks, showreels, and concept materials.</p>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-bold">
                      <Lock className="w-3 h-3" /> NDA Protected
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-[11px] text-white/80 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Privacy Assurance:</strong> Submitted scripts and sensitive IP documents are never indexed or publicly available. Access is restricted exclusively to authenticated CineVenue evaluation executives.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Script */}
                    <div className="p-3 bg-[#161722] border border-white/10 rounded-xl space-y-1">
                      <label className="block text-white font-bold">Script / Screenplay (PDF) *</label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setScriptFileName(e.target.files?.[0]?.name || "")}
                        className="text-[11px] text-white/70 w-full cursor-pointer file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-gold file:text-black"
                      />
                      {scriptFileName && <p className="text-[10px] text-gold font-mono truncate">Attached: {scriptFileName}</p>}
                    </div>

                    {/* Pitch Deck */}
                    <div className="p-3 bg-[#161722] border border-white/10 rounded-xl space-y-1">
                      <label className="block text-white font-bold">Pitch Deck / Lookbook (PDF)</label>
                      <input
                        type="file"
                        accept=".pdf,.ppt,.pptx"
                        onChange={(e) => setPitchDeckFileName(e.target.files?.[0]?.name || "")}
                        className="text-[11px] text-white/70 w-full cursor-pointer file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-gold file:text-black"
                      />
                      {pitchDeckFileName && <p className="text-[10px] text-gold font-mono truncate">Attached: {pitchDeckFileName}</p>}
                    </div>

                    {/* Synopsis Document */}
                    <div className="p-3 bg-[#161722] border border-white/10 rounded-xl space-y-1">
                      <label className="block text-white font-bold">Project Synopsis / Treatment (PDF)</label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setSynopsisFileName(e.target.files?.[0]?.name || "")}
                        className="text-[11px] text-white/70 w-full cursor-pointer file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-gold file:text-black"
                      />
                      {synopsisFileName && <p className="text-[10px] text-gold font-mono truncate">Attached: {synopsisFileName}</p>}
                    </div>

                    {/* Director's Note */}
                    <div className="p-3 bg-[#161722] border border-white/10 rounded-xl space-y-1">
                      <label className="block text-white font-bold">Director's Note / Vision Note</label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setDirectorsNoteFileName(e.target.files?.[0]?.name || "")}
                        className="text-[11px] text-white/70 w-full cursor-pointer file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-gold file:text-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white/80 font-bold mb-1">Showreel / Director Previous Work URL</label>
                      <input
                        type="url"
                        value={showreelUrl}
                        onChange={(e) => setShowreelUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-white focus:border-gold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 font-bold mb-1">Teaser / Concept Video URL</label>
                      <input
                        type="url"
                        value={trailerUrl}
                        onChange={(e) => setTrailerUrl(e.target.value)}
                        placeholder="https://vimeo.com/..."
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-white focus:border-gold outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: DECLARATIONS & CONSENT */}
              {currentStep === 7 && (
                <div className="space-y-4 animate-fade-in text-xs">
                  <div className="border-b border-white/10 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-gold" /> Step 7: Declarations & Legal Consent
                    </h3>
                    <p className="text-white/50 text-[11px]">Confirm ownership, submission terms, and evaluation disclaimers.</p>
                  </div>

                  <div className="bg-[#161722] border border-white/10 p-4 rounded-xl space-y-4 text-white/80">
                    <h4 className="font-bold text-gold text-xs uppercase tracking-wider">Applicant Declaration</h4>
                    <p className="leading-relaxed text-[11px]">
                      By submitting this application to CineVenue Productions, you solemnly affirm that all submitted screenplays, storylines, character bibles, and intellectual properties are original works or legally authorized by the copyright owners.
                    </p>

                    <div className="space-y-3 pt-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rightToSubmitConfirmed}
                          onChange={(e) => setRightToSubmitConfirmed(e.target.checked)}
                          className="w-4 h-4 mt-0.5 accent-amber-500 rounded cursor-pointer"
                        />
                        <span className="text-white font-semibold">
                          I confirm that I possess full legal ownership or express written authorization to submit this project for evaluation. *
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={termsAgreed}
                          onChange={(e) => setTermsAgreed(e.target.checked)}
                          className="w-4 h-4 mt-0.5 accent-amber-500 rounded cursor-pointer"
                        />
                        <span className="text-white font-semibold">
                          I agree to CineVenue Productions' Project Submission Terms and Privacy Policy. *
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={nonGuaranteeUnderstood}
                          onChange={(e) => setNonGuaranteeUnderstood(e.target.checked)}
                          className="w-4 h-4 mt-0.5 accent-amber-500 rounded cursor-pointer"
                        />
                        <span className="text-white font-semibold">
                          I understand that submission does NOT guarantee production funding, casting approval, distribution, or automatic publication. *
                        </span>
                      </label>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-gold font-bold pt-2 border-t border-white/10">
                      <button type="button" onClick={() => setPolicyModalType("privacy")} className="hover:underline cursor-pointer bg-transparent border-none">
                        Privacy Policy
                      </button>
                      <span>•</span>
                      <button type="button" onClick={() => setPolicyModalType("terms")} className="hover:underline cursor-pointer bg-transparent border-none">
                        Terms & Conditions
                      </button>
                      <span>•</span>
                      <button type="button" onClick={() => setPolicyModalType("submission")} className="hover:underline cursor-pointer bg-transparent border-none">
                        Project Submission Policy
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 8: SUMMARY REVIEW & SUBMIT */}
              {currentStep === 8 && (
                <div className="space-y-4 animate-fade-in text-xs">
                  <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gold" /> Step 8: Review Application Summary
                      </h3>
                      <p className="text-white/50 text-[11px]">Verify all application details prior to final transmission.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gold text-[11px] font-bold rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Details
                    </button>
                  </div>

                  <div className="bg-[#161722] border border-white/10 rounded-xl p-4 space-y-4 text-white/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-white/10 pb-3">
                      <div>
                        <span className="text-white/40 block text-[10px] uppercase">Project Title</span>
                        <span className="font-bold text-gold text-sm">{projectTitle}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[10px] uppercase">Project Format & Stage</span>
                        <span className="font-bold text-white">{projectType} • {projectStage}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[10px] uppercase">Primary Language</span>
                        <span className="font-bold text-white">{language}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[10px] uppercase">Selected Genres</span>
                        <span className="font-bold text-white">{selectedGenres.join(", ")}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-white/10 pb-3">
                      <div>
                        <span className="text-white/40 block text-[10px] uppercase">Applicant Name & Role</span>
                        <span className="font-bold text-white">{fullName} ({professionalRole})</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[10px] uppercase">Contact Details</span>
                        <span className="font-bold text-white">{phone} • {email}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-white/40 block text-[10px] uppercase">Requested Collaboration</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {requestedCollaboration.map(c => (
                          <span key={c} className="px-2 py-0.5 bg-gold/20 text-gold border border-gold/30 rounded text-[10px] font-bold">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {scriptFileName && (
                      <div className="bg-black/50 p-3 rounded-lg flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
                        <ShieldCheck className="w-4 h-4" /> Attached Confidential Script: {scriptFileName}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer Navigation Controls */}
        {!submittedApp && (
          <div className="sticky bottom-0 z-20 bg-[#12131A] border-t border-white/10 px-6 py-4 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < 8 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:opacity-90 shadow-lg shadow-gold/10 transition-all flex items-center gap-1.5"
              >
                <span>Save & Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:opacity-90 shadow-xl shadow-gold/20 transition-all flex items-center gap-2 animate-pulse"
              >
                <Send className="w-4 h-4" />
                <span>SUBMIT FINAL APPLICATION</span>
              </button>
            )}
          </div>
        )}

      </div>

      {/* Legal Policy Modal */}
      {policyModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12131A] border border-white/20 rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-serif font-bold text-white text-sm uppercase">
                {policyModalType === "privacy" && "Privacy Policy"}
                {policyModalType === "terms" && "Terms & Conditions"}
                {policyModalType === "submission" && "Project Submission Policy"}
              </h3>
              <button onClick={() => setPolicyModalType(null)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-white/70 space-y-2 max-h-60 overflow-y-auto leading-relaxed">
              <p>
                <strong>1. Intellectual Property Protection:</strong> CineVenue Productions guarantees that all project materials, screenplays, and pitch decks submitted stay under strict confidentiality.
              </p>
              <p>
                <strong>2. Non-Guarantee Disclaimer:</strong> Submission of any script or pitch does not constitute a binding agreement to produce, finance, or distribute the project.
              </p>
              <p>
                <strong>3. Review Process:</strong> Evaluation times vary based on genre board schedules. Selected applicants will be formally contacted.
              </p>
            </div>

            <button
              onClick={() => setPolicyModalType(null)}
              className="w-full py-2 bg-gold text-black font-extrabold rounded-xl"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
