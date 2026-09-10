import React, { useState } from "react";
import { 
  AuditionSubmission, 
  IndianCastingCall, 
  FilmProject,
  AuditionStatus,
  ProfessionalProfile
} from "../../types/filmProductionMarketplace";
import { 
  Video, Calendar, Clock, MapPin, ExternalLink, 
  CheckCircle2, XCircle, Search, Filter, Sparkles, User, 
  AlertCircle, ChevronRight, Star, ShieldCheck, Mail, Phone,
  X, Check, Send, Award, Film
} from "lucide-react";
import { 
  updateAuditionStatus, 
  getProfessionalById, 
  getProfessionalByEmail, 
  getProfessionals 
} from "../../services/filmProductionService";
import ProfessionalProfileModal from "./ProfessionalProfileModal";

interface MyAuditionsViewProps {
  auditions: AuditionSubmission[];
  castingCalls: IndianCastingCall[];
  projects: FilmProject[];
  userEmail?: string | null;
  onAuditionsUpdated?: () => void;
}

const AUDITION_STATUS_TABS: (AuditionStatus | "All Submissions")[] = [
  "All Submissions",
  "Submitted",
  "Screened",
  "Shortlisted",
  "Callback Scheduled",
  "Selected",
  "Rejected"
];

export default function MyAuditionsView({
  auditions,
  castingCalls,
  projects,
  userEmail,
  onAuditionsUpdated
}: MyAuditionsViewProps) {
  const normEmail = (userEmail || "").toLowerCase();

  // Mode: "applicant" (My Auditions) vs "reviewer" (Project Owner Desk)
  const [activeMode, setActiveMode] = useState<"applicant" | "reviewer">("applicant");
  const [selectedStatusTab, setSelectedStatusTab] = useState<AuditionStatus | "All Submissions">("All Submissions");
  const [searchQuery, setSearchQuery] = useState("");

  // Callback Scheduling Modal
  const [scheduleModalTarget, setScheduleModalTarget] = useState<AuditionSubmission | null>(null);
  const [cbDate, setCbDate] = useState(new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0]);
  const [cbTime, setCbTime] = useState("11:00 AM");
  const [cbType, setCbType] = useState<"In-Person Studio" | "Online Video Call" | "Floor Screen Test">("In-Person Studio");
  const [cbLocation, setCbLocation] = useState("Annapurna Studios Floor 4, Hyderabad");
  const [cbInstructions, setCbInstructions] = useState("Please bring physical portfolio and be prepared with the scene dialogue.");
  const [cbAdditionalNotes, setCbAdditionalNotes] = useState("Travel allowance will be reimbursed on arrival.");
  const [starRating, setStarRating] = useState<number>(5);

  // Selected Submission Detail Modal
  const [viewingAudition, setViewingAudition] = useState<AuditionSubmission | null>(null);

  // Professional Profile Modal Target
  const [profileModalTarget, setProfileModalTarget] = useState<ProfessionalProfile | null>(null);

  const handleOpenApplicantProfile = (aud: AuditionSubmission) => {
    let prof: ProfessionalProfile | undefined;
    if (aud.applicantProfileId) {
      prof = getProfessionalById(aud.applicantProfileId);
    }
    if (!prof && aud.applicantEmail) {
      prof = getProfessionalByEmail(aud.applicantEmail);
    }
    if (!prof) {
      const all = getProfessionals();
      prof = all.find(p => 
        (aud.applicantHandle && p.handle === aud.applicantHandle) ||
        p.fullName.toLowerCase() === aud.applicantName.toLowerCase()
      );
    }

    if (prof) {
      setProfileModalTarget(prof);
    } else {
      // Synthesize clean preview profile from submission data
      setProfileModalTarget({
        id: aud.applicantProfileId || `cand-${aud.id}`,
        userId: aud.applicantId,
        userEmail: aud.applicantEmail,
        fullName: aud.applicantName,
        handle: aud.applicantHandle || `@${aud.applicantName.replace(/\s+/g, "_").toLowerCase()}`,
        professionalHeadline: `${aud.roleType} Performer • ${aud.characterName} Applicant`,
        avatarUrl: aud.applicantAvatar || (aud.headshots && aud.headshots[0]) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
        location: aud.city,
        country: "India",
        preferredLocations: [aud.city],
        languages: aud.spokenLanguages,
        bio: aud.experienceSummary,
        experienceYears: 2,
        primaryCraftId: "craft-acting",
        primaryCraftName: "Actor / Performer",
        secondaryCraftIds: [],
        secondaryCraftNames: [],
        roles: ["Actor", "Audition Candidate"],
        specializations: [aud.roleType],
        skills: ["Screen Presence", "Dialogue Delivery", ...aud.spokenLanguages],
        projectTypes: ["Feature Film", "Digital Series"],
        preferredIndustries: ["Tollywood", "Bollywood", "Pan-India"],
        remunerationRange: { min: 200000, max: 1000000, currency: "INR", unit: "per project" },
        availability: { status: "Available", notes: "Applied for casting call" },
        contactPreferences: { allowDirectInvites: true, allowNegotiations: true, preferredContactMode: "Platform Chat" },
        portfolio: [
          ...(aud.videoAuditionUrl ? [{
            id: `port-reel-${aud.id}`,
            title: `Audition Self-Tape / Reel (${aud.characterName})`,
            type: "Showreel" as any,
            mediaUrl: aud.videoAuditionUrl,
            role: aud.characterName,
            year: new Date().getFullYear(),
            projectType: "Feature Film"
          }] : []),
          ...(aud.headshots?.map((h, i) => ({
            id: `port-photo-${aud.id}-${i}`,
            title: `Candidate Headshot #${i+1}`,
            type: "Image" as any,
            mediaUrl: h,
            role: aud.characterName,
            year: new Date().getFullYear(),
            projectType: "Feature Film"
          })) || [])
        ],
        filmography: [],
        verificationLevel: "Profile Verified",
        rating: 5.0,
        reviewsCount: 1,
        completedProjectsCount: 1,
        joinedDate: "2025"
      });
    }
  };

  // 1. My submitted auditions as candidate
  const mySubmissions = auditions.filter(a =>
    !a.applicantEmail || a.applicantEmail.toLowerCase() === normEmail
  );

  // 2. Auditions for casting calls owned by the user (as project owner)
  const myOwnedCastingCallIds = castingCalls
    .filter(c => !c.ownerEmail || c.ownerEmail.toLowerCase() === normEmail)
    .map(c => c.id);

  const myOwnedProjectIds = projects
    .filter(p => !p.ownerEmail || p.ownerEmail.toLowerCase() === normEmail)
    .map(p => p.id);

  const ownerReviewSubmissions = auditions.filter(a =>
    myOwnedCastingCallIds.includes(a.castingCallId) || myOwnedProjectIds.includes(a.projectId)
  );

  const currentDataset = activeMode === "applicant" ? mySubmissions : (ownerReviewSubmissions.length > 0 ? ownerReviewSubmissions : auditions);

  const filteredAuditions = currentDataset.filter(a => {
    const matchesTab = selectedStatusTab === "All Submissions" || a.status === selectedStatusTab;
    const matchesSearch = !searchQuery ||
      a.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.characterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleStatusTransition = (id: string, nextStatus: AuditionStatus, extraData?: any) => {
    updateAuditionStatus(id, nextStatus, extraData);
    if (onAuditionsUpdated) onAuditionsUpdated();

    // Trigger CineVenue notification event
    window.dispatchEvent(new CustomEvent("cinevenue-notification", {
      detail: {
        title: `Audition Status: ${nextStatus}`,
        message: `Your audition for character role has been updated to "${nextStatus}".`
      }
    }));
  };

  const handleSaveCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleModalTarget) return;

    handleStatusTransition(scheduleModalTarget.id, "Callback Scheduled", {
      callbackDate: cbDate,
      callbackTime: cbTime,
      callbackLocationOrLink: `${cbType}: ${cbLocation}`,
      directorNotes: `${cbInstructions} • ${cbAdditionalNotes}`,
      rating: starRating
    });

    setScheduleModalTarget(null);
  };

  const getStatusBadge = (status: AuditionStatus) => {
    switch (status) {
      case "Submitted": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "Screened": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Shortlisted": return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "Callback Scheduled": return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      case "Selected": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "Rejected": return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      default: return "bg-white/10 text-white border-white/20";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#121320] via-[#0E1018] to-black border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-black uppercase tracking-widest">
              <Video className="w-3.5 h-3.5" />
              <span>Screen Test & Audition Review</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              My Auditions
            </h1>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Monitor your audition tape submissions through official review stages. Applicants cannot manually alter their status; project owners evaluate tapes, shortlist talent, and schedule callbacks.
            </p>
          </div>

          {/* Mode Switcher: Candidate Submissions vs Project Owner Review Desk */}
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setActiveMode("applicant")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === "applicant"
                  ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              My Submissions ({mySubmissions.length})
            </button>
            <button
              onClick={() => setActiveMode("reviewer")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === "reviewer"
                  ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Owner Review Desk ({ownerReviewSubmissions.length > 0 ? ownerReviewSubmissions.length : auditions.length})
            </button>
          </div>
        </div>
      </div>

      {/* 7-STATUS CANONICAL NAVIGATION BAR */}
      <div className="bg-[#0E0F18] border border-white/10 rounded-2xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        {/* The Exact 7 Status Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {AUDITION_STATUS_TABS.map(tab => {
            const count = tab === "All Submissions" 
              ? currentDataset.length 
              : currentDataset.filter(a => a.status === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setSelectedStatusTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedStatusTab === tab
                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                <span>{tab}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <input
            type="text"
            placeholder="Search candidate or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Notice on Permissions */}
      <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>
            {activeMode === "applicant"
              ? "Official CineVenue Protocol: Applicants cannot change their application status. Review updates and callbacks are scheduled by verified casting directors."
              : "Project Owner Review Mode: You have authorization to Screen, Shortlist, Schedule Callbacks, and Select/Reject candidates."}
          </span>
        </div>
      </div>

      {/* Audition Cards / List */}
      {filteredAuditions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0E0F18] border border-white/10 space-y-3">
          <Video className="w-12 h-12 text-white/20 mx-auto" />
          <h3 className="text-base font-bold text-white">No audition submissions found</h3>
          <p className="text-xs text-white/50">
            {activeMode === "applicant"
              ? "You haven't submitted auditions in this status category. Explore open Casting Calls to apply."
              : "No candidate submissions in this category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuditions.map(aud => (
            <div 
              key={aud.id}
              className="rounded-2xl bg-[#0F1019] border border-white/10 overflow-hidden hover:border-blue-500/50 transition-all flex flex-col justify-between shadow-xl"
            >
              <div className="p-5 space-y-3">
                {/* Status Badge & Character */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(aud.status)}`}>
                    {aud.status}
                  </span>
                  <span className="text-[11px] text-white/50">{aud.appliedAt}</span>
                </div>

                {/* Candidate & Character */}
                <div>
                  <h3 className="text-base font-black text-white">{aud.applicantName}</h3>
                  <p className="text-xs font-bold text-amber-400 mt-0.5">Role: {aud.characterName}</p>
                </div>

                {/* Project Info */}
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/70 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    <span>{aud.projectTitle}</span>
                  </div>
                  <div className="text-white/50 text-[10px]">
                    Spoken Languages: {aud.spokenLanguages?.join(", ") || "Telugu, English"}
                  </div>
                </div>

                {/* Callback Alert Card (If Callback Scheduled) */}
                {aud.status === "Callback Scheduled" && (
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-cyan-300">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Callback Appointment</span>
                    </div>
                    <div className="text-[11px]">Date & Time: {aud.callbackDate} at {aud.callbackTime}</div>
                    <div className="text-[11px]">Location / Link: {aud.callbackLocationOrLink}</div>
                    {aud.directorNotes && (
                      <div className="text-[10px] text-cyan-300/80 italic mt-1">
                        Notes: "{aud.directorNotes}"
                      </div>
                    )}
                  </div>
                )}

                {/* Self Tape link */}
                {aud.videoAuditionUrl && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-[11px]">
                    <span className="text-white/60">Self-Tape Video:</span>
                    <a
                      href={aud.videoAuditionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Watch Tape</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="p-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewingAudition(aud)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleOpenApplicantProfile(aud)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-amber-500/25"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>
                </div>

                {/* Owner Review Controls */}
                {activeMode === "reviewer" && (
                  <div className="flex items-center gap-1.5">
                    {aud.status === "Submitted" && (
                      <button
                        onClick={() => handleStatusTransition(aud.id, "Screened")}
                        title="Mark Screened"
                        className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 text-[11px] font-bold hover:bg-blue-500/30"
                      >
                        Screen
                      </button>
                    )}

                    {(aud.status === "Submitted" || aud.status === "Screened") && (
                      <button
                        onClick={() => handleStatusTransition(aud.id, "Shortlisted")}
                        title="Shortlist Candidate"
                        className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 text-[11px] font-bold hover:bg-purple-500/30"
                      >
                        Shortlist
                      </button>
                    )}

                    <button
                      onClick={() => setScheduleModalTarget(aud)}
                      title="Schedule Callback"
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-[11px] font-bold hover:bg-cyan-500/30"
                    >
                      Callback
                    </button>

                    <button
                      onClick={() => handleStatusTransition(aud.id, "Selected")}
                      title="Select Candidate"
                      className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleStatusTransition(aud.id, "Rejected")}
                      title="Reject"
                      className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SCHEDULE CALLBACK MODAL */}
      {scheduleModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0F1018] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-auto p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-base font-black text-white">Schedule Callback Audition</h2>
                <p className="text-white/60 text-[11px]">Candidate: {scheduleModalTarget.applicantName} • {scheduleModalTarget.characterName}</p>
              </div>
              <button
                onClick={() => setScheduleModalTarget(null)}
                className="text-white/60 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCallback} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Audition Date *</label>
                  <input
                    type="date"
                    required
                    value={cbDate}
                    onChange={(e) => setCbDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Time Slot *</label>
                  <input
                    type="text"
                    required
                    value={cbTime}
                    onChange={(e) => setCbTime(e.target.value)}
                    placeholder="e.g. 11:30 AM"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Audition Type *</label>
                <select
                  value={cbType}
                  onChange={(e) => setCbType(e.target.value as any)}
                  className="w-full bg-[#1A1B28] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="In-Person Studio">In-Person Studio Screen Test</option>
                  <option value="Online Video Call">Online Live Video Audition (Zoom/Google Meet)</option>
                  <option value="Floor Screen Test">Floor Screen Test with Co-Actors</option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Location / Approved Online Method *</label>
                <input
                  type="text"
                  required
                  value={cbLocation}
                  onChange={(e) => setCbLocation(e.target.value)}
                  placeholder="e.g. Studio address or Google Meet / Zoom link"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Audition Instructions</label>
                <textarea
                  rows={2}
                  value={cbInstructions}
                  onChange={(e) => setCbInstructions(e.target.value)}
                  placeholder="Detail scene preparation, wardrobe, or memorization requirements..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Additional Information</label>
                <input
                  type="text"
                  value={cbAdditionalNotes}
                  onChange={(e) => setCbAdditionalNotes(e.target.value)}
                  placeholder="Travel, reimbursement, escort, or guardian policies..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setScheduleModalTarget(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-wider shadow-lg shadow-cyan-500/20"
                >
                  Confirm & Notify Applicant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SUBMISSION DETAILS MODAL */}
      {viewingAudition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0F1018] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-auto p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(viewingAudition.status)}`}>
                  {viewingAudition.status}
                </span>
                <h2 className="text-base font-black text-white mt-1">{viewingAudition.applicantName}</h2>
                <p className="text-white/60">Character: {viewingAudition.characterName} • {viewingAudition.projectTitle}</p>
              </div>
              <button
                onClick={() => setViewingAudition(null)}
                className="text-white/60 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                <div>Email: <span className="text-white font-medium">{viewingAudition.applicantEmail}</span></div>
                <div>City: <span className="text-white font-medium">{viewingAudition.city}</span></div>
                <div>Age: <span className="text-white font-medium">{viewingAudition.age}</span></div>
                <div>Gender: <span className="text-white font-medium">{viewingAudition.gender}</span></div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-white/40 block mb-1">Experience Summary</span>
                <p className="text-white/80 whitespace-pre-line leading-relaxed">{viewingAudition.experienceSummary}</p>
              </div>

              {viewingAudition.videoAuditionUrl && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                  <span className="text-blue-300 font-bold">Self-Tape Showreel / Monologue Link</span>
                  <a
                    href={viewingAudition.videoAuditionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-blue-500 text-black font-bold rounded-lg text-[10px]"
                  >
                    Watch Video
                  </a>
                </div>
              )}

              {viewingAudition.status === "Callback Scheduled" && (
                <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 space-y-1">
                  <div className="text-cyan-300 font-black uppercase text-[10px]">Callback Details</div>
                  <div>Date & Time: <strong className="text-white">{viewingAudition.callbackDate} at {viewingAudition.callbackTime}</strong></div>
                  <div>Location / Method: <strong className="text-white">{viewingAudition.callbackLocationOrLink}</strong></div>
                  {viewingAudition.directorNotes && (
                    <div className="text-white/70 italic text-[11px] mt-1">Instructions: {viewingAudition.directorNotes}</div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const target = viewingAudition;
                  setViewingAudition(null);
                  handleOpenApplicantProfile(target);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>View Full Profile & Showreels</span>
              </button>
              <button
                onClick={() => setViewingAudition(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANDIDATE FULL PROFESSIONAL PROFILE MODAL */}
      <ProfessionalProfileModal
        isOpen={!!profileModalTarget}
        onClose={() => setProfileModalTarget(null)}
        profile={profileModalTarget}
        onInviteToProject={() => {}}
        onStartNegotiation={() => {}}
        currentUserEmail={userEmail}
      />

    </div>
  );
}
