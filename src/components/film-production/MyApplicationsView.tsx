import React, { useState } from "react";
import { 
  AuditionSubmission, 
  JobApplication,
  IndianCastingCall 
} from "../../types/filmProductionMarketplace";
import { 
  Clapperboard, Video, Briefcase, Calendar, Clock, 
  MapPin, CheckCircle2, AlertCircle, ExternalLink, Star,
  Search, Filter, ChevronRight
} from "lucide-react";

interface MyApplicationsViewProps {
  auditions: AuditionSubmission[];
  jobApplications: JobApplication[];
  userEmail?: string | null;
  onSelectAudition?: (audition: AuditionSubmission) => void;
  onSelectJobApp?: (app: JobApplication) => void;
}

export default function MyApplicationsView({
  auditions,
  jobApplications,
  userEmail,
  onSelectAudition,
  onSelectJobApp
}: MyApplicationsViewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "auditions" | "jobs">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const userNormEmail = (userEmail || "").toLowerCase();

  // Filter for user
  const myAuditions = userEmail
    ? auditions.filter(a => a.applicantEmail.toLowerCase() === userNormEmail)
    : auditions;

  const myJobApps = userEmail
    ? jobApplications.filter(j => j.applicantEmail.toLowerCase() === userNormEmail)
    : jobApplications;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Selected":
      case "Hired":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "Callback Scheduled":
      case "Shortlisted":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "Under Review":
      case "Screened":
      case "Audition":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "Rejected":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      default:
        return "bg-white/10 text-white/70 border-white/20";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-black uppercase tracking-widest mb-2">
            <Clapperboard className="w-3.5 h-3.5" />
            <span>Talent & Crew Application Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            My Applications & Auditions
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Track real-time statuses of your submitted self-tapes, scheduled callbacks, and crew job applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white/80">
            Auditions: <strong className="text-purple-400">{myAuditions.length}</strong>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white/80">
            Crew Jobs: <strong className="text-amber-400">{myJobApps.length}</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            activeTab === "all"
              ? "bg-purple-500 text-black border-purple-400 font-black"
              : "bg-white/5 text-white/70 hover:text-white border-white/10"
          }`}
        >
          All Applications ({myAuditions.length + myJobApps.length})
        </button>

        <button
          onClick={() => setActiveTab("auditions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            activeTab === "auditions"
              ? "bg-purple-500 text-black border-purple-400 font-black"
              : "bg-white/5 text-white/70 hover:text-white border-white/10"
          }`}
        >
          Casting & Auditions ({myAuditions.length})
        </button>

        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            activeTab === "jobs"
              ? "bg-purple-500 text-black border-purple-400 font-black"
              : "bg-white/5 text-white/70 hover:text-white border-white/10"
          }`}
        >
          Crew Openings ({myJobApps.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        
        {/* 1. Audition Submissions Section */}
        {(activeTab === "all" || activeTab === "auditions") && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-400 font-black text-sm uppercase tracking-wider">
              <Video className="w-4 h-4" />
              <span>Actor & Performer Audition Submissions ({myAuditions.length})</span>
            </div>

            {myAuditions.length === 0 ? (
              <div className="p-8 rounded-3xl bg-[#101118] border border-white/10 text-center text-xs text-white/50">
                You haven't submitted any casting audition self-tapes yet. Browse the Indian Casting Calls board to apply.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myAuditions.map(aud => (
                  <div
                    key={aud.id}
                    className="p-5 sm:p-6 rounded-3xl bg-[#11121A] border border-white/10 hover:border-purple-500/40 transition-all space-y-4 shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase border border-purple-500/30">
                          {aud.roleType}
                        </span>
                        <h3 className="text-base font-black text-white mt-1">
                          Role: {aud.characterName}
                        </h3>
                        <p className="text-xs text-white/60">
                          Film: <strong className="text-amber-400">{aud.projectTitle}</strong>
                        </p>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(aud.status)}`}>
                        {aud.status}
                      </span>
                    </div>

                    {/* Scheduled Callback Alert Box */}
                    {aud.status === "Callback Scheduled" && aud.callbackDate && (
                      <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-xs space-y-1.5 animate-pulse">
                        <div className="flex items-center gap-2 text-purple-300 font-black text-[11px]">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <span>CALLBACK CONFIRMED: {aud.callbackDate} at {aud.callbackTime || "11:00 AM"}</span>
                        </div>
                        {aud.callbackLocationOrLink && (
                          <div className="text-white/80 text-[11px] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>{aud.callbackLocationOrLink}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Self-Tape Link */}
                    {aud.videoAuditionUrl && (
                      <div className="text-xs">
                        <a
                          href={aud.videoAuditionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-bold"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>View Submitted Self-Tape</span>
                          <ExternalLink className="w-3 h-3 text-white/40" />
                        </a>
                      </div>
                    )}

                    {/* Directorial Feedback */}
                    {aud.directorNotes && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                        <strong>Director Feedback:</strong> "{aud.directorNotes}"
                      </div>
                    )}

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40">
                      <span>Submitted on {aud.appliedAt}</span>
                      <span>Applicant: {aud.applicantName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. Technical Crew & Craft Job Applications Section */}
        {(activeTab === "all" || activeTab === "jobs") && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase tracking-wider">
              <Briefcase className="w-4 h-4" />
              <span>Technical & 24 Crafts Job Applications ({myJobApps.length})</span>
            </div>

            {myJobApps.length === 0 ? (
              <div className="p-8 rounded-3xl bg-[#101118] border border-white/10 text-center text-xs text-white/50">
                You haven't submitted any crew applications yet. Browse Jobs & Crew Openings to apply.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myJobApps.map(app => (
                  <div
                    key={app.id}
                    className="p-5 sm:p-6 rounded-3xl bg-[#11121A] border border-white/10 hover:border-amber-500/40 transition-all space-y-4 shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase border border-amber-500/30">
                          {app.craftName}
                        </span>
                        <h3 className="text-base font-black text-white mt-1">
                          Position: {app.requirementPosition}
                        </h3>
                        <p className="text-xs text-white/60">
                          Film: <strong className="text-white">{app.projectTitle}</strong>
                        </p>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </div>

                    {app.coverMessage && (
                      <p className="text-xs text-white/70 line-clamp-2 italic">
                        "{app.coverMessage}"
                      </p>
                    )}

                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs flex items-center justify-between">
                      <span className="text-white/60">Expected Remuneration:</span>
                      <strong className="text-amber-400 font-black">{app.expectedPay}</strong>
                    </div>

                    {app.adminNotes && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/80">
                        <strong>Producer Notes:</strong> {app.adminNotes}
                      </div>
                    )}

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40">
                      <span>Applied on {app.appliedAt}</span>
                      <span>Status: {app.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
