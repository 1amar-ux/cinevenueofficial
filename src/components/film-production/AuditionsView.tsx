import React, { useState } from "react";
import { 
  AuditionSubmission,
  IndianCastingCall 
} from "../../types/filmProductionMarketplace";
import { 
  Video, Star, Calendar, Clock, MapPin, ExternalLink, 
  CheckCircle2, XCircle, Search, Filter, Sparkles, User, AlertCircle
} from "lucide-react";
import { updateAuditionStatus } from "../../services/filmProductionService";

interface AuditionsViewProps {
  auditions: AuditionSubmission[];
  castingCalls: IndianCastingCall[];
  userEmail?: string | null;
  onAuditionsUpdated?: () => void;
}

export default function AuditionsView({
  auditions,
  castingCalls,
  userEmail,
  onAuditionsUpdated
}: AuditionsViewProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAudition, setActiveAudition] = useState<AuditionSubmission | null>(null);
  
  // Callback scheduling state
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [targetAudition, setTargetAudition] = useState<AuditionSubmission | null>(null);
  const [callbackDate, setCallbackDate] = useState("");
  const [callbackTime, setCallbackTime] = useState("11:00 AM");
  const [callbackLocation, setCallbackLocation] = useState("Annapurna Studios Floor 3, Hyderabad");
  const [directorNotes, setDirectorNotes] = useState("");

  const filteredAuditions = auditions.filter(aud => {
    const matchesStatus = selectedStatus === "all" || aud.status === selectedStatus;
    const matchesSearch = searchQuery === "" ||
      aud.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aud.characterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aud.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aud.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleQuickStatusChange = (id: string, status: AuditionSubmission["status"], notes?: string) => {
    updateAuditionStatus(id, status, { directorNotes: notes });
    if (onAuditionsUpdated) onAuditionsUpdated();
  };

  const handleOpenScheduleCallback = (aud: AuditionSubmission) => {
    setTargetAudition(aud);
    setCallbackDate(aud.callbackDate || new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0]);
    setCallbackTime(aud.callbackTime || "02:00 PM");
    setCallbackLocation(aud.callbackLocationOrLink || "Studio Casting Room / Video Call");
    setDirectorNotes(aud.directorNotes || "");
    setIsCallbackModalOpen(true);
  };

  const handleSaveCallback = () => {
    if (!targetAudition) return;
    updateAuditionStatus(targetAudition.id, "Callback Scheduled", {
      callbackDate,
      callbackTime,
      callbackLocationOrLink: callbackLocation,
      directorNotes
    });
    setIsCallbackModalOpen(false);
    if (onAuditionsUpdated) onAuditionsUpdated();
  };

  const getStatusColor = (status: AuditionSubmission["status"]) => {
    switch (status) {
      case "Shortlisted": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "Callback Scheduled": return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "Selected": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "Rejected": return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "Screened": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default: return "bg-white/10 text-white/70 border-white/20";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-black uppercase tracking-widest mb-2">
            <Video className="w-3.5 h-3.5" />
            <span>Audition Screening & Review Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Audition Tapes & Callbacks
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Review submitted self-tapes, evaluate monologues, rate screen presence, and schedule in-person or virtual callbacks.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white/80">
          Total Submissions: <strong className="text-purple-400">{auditions.length}</strong>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
        {["all", "Submitted", "Screened", "Shortlisted", "Callback Scheduled", "Selected", "Rejected"].map(st => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              selectedStatus === st
                ? "bg-purple-500 text-black border-purple-400 shadow-md shadow-purple-500/20 font-black"
                : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/10"
            }`}
          >
            {st === "all" ? "All Submissions" : st}
          </button>
        ))}
      </div>

      {/* Search toolbar */}
      <div className="p-4 rounded-2xl bg-[#101118] border border-white/10">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audition by artist name, character role, film, city..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Submissions List */}
      {filteredAuditions.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-[#101118] border border-white/10 space-y-3">
          <Video className="w-12 h-12 text-white/20 mx-auto" />
          <h3 className="text-base font-bold text-white">No audition tapes found</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            No submissions match the current status filter. Check back once actors submit self-tapes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAuditions.map(aud => (
            <div
              key={aud.id}
              className="rounded-3xl bg-[#11121A] border border-white/10 p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-purple-500/30 transition-all hover:shadow-xl"
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={aud.headshots[0] || aud.applicantAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
                      alt={aud.applicantName}
                      className="w-12 h-12 rounded-2xl object-cover border border-white/15 shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-black text-white">{aud.applicantName}</h3>
                      <div className="text-xs text-white/60">
                        {aud.age} Yrs • {aud.gender} • {aud.city}, {aud.state}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(aud.status)}`}>
                    {aud.status}
                  </span>
                </div>

                {/* Role and Film */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1">
                  <div className="text-white font-bold">
                    Auditioning for: <span className="text-amber-400">{aud.characterName}</span>
                  </div>
                  <div className="text-white/60 text-[11px]">
                    Film: <strong className="text-white">{aud.projectTitle}</strong> • {aud.roleType}
                  </div>
                  <div className="text-white/50 text-[11px]">
                    Languages: {aud.spokenLanguages.join(", ")}
                  </div>
                </div>

                {/* Experience snippet */}
                {aud.experienceSummary && (
                  <p className="text-xs text-white/70 line-clamp-2 italic">
                    "{aud.experienceSummary}"
                  </p>
                )}

                {/* Video self-tape links */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {aud.videoAuditionUrl && (
                    <a
                      href={aud.videoAuditionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Watch Self-Tape Video</span>
                      <ExternalLink className="w-3 h-3 text-purple-400" />
                    </a>
                  )}

                  {aud.introVideoUrl && (
                    <a
                      href={aud.introVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <span>Intro Clip</span>
                      <ExternalLink className="w-3 h-3 text-white/40" />
                    </a>
                  )}
                </div>

                {/* Callback detail if scheduled */}
                {aud.callbackDate && (
                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/25 space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-[11px]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Callback: {aud.callbackDate} at {aud.callbackTime || "TBD"}</span>
                    </div>
                    {aud.callbackLocationOrLink && (
                      <div className="text-white/70 text-[11px] flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
                        <span className="truncate">{aud.callbackLocationOrLink}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Director Notes */}
                {aud.directorNotes && (
                  <div className="text-[11px] text-amber-300/80 bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-xl italic">
                    Notes: {aud.directorNotes}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleQuickStatusChange(aud.id, "Shortlisted")}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[11px] font-bold border border-amber-500/30 transition-all cursor-pointer"
                  >
                    Shortlist
                  </button>

                  <button
                    onClick={() => handleOpenScheduleCallback(aud)}
                    className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[11px] font-bold border border-purple-500/30 transition-all cursor-pointer"
                  >
                    Schedule Callback
                  </button>

                  <button
                    onClick={() => handleQuickStatusChange(aud.id, "Selected")}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 transition-all cursor-pointer"
                  >
                    Select
                  </button>
                </div>

                <button
                  onClick={() => handleQuickStatusChange(aud.id, "Rejected")}
                  className="px-2 py-1 rounded-lg text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 text-[11px] font-semibold transition-all cursor-pointer"
                >
                  Reject
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Callback Scheduling Modal */}
      {isCallbackModalOpen && targetAudition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#11121A] border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-black text-white">
              Schedule Callback for {targetAudition.applicantName}
            </h3>
            <p className="text-xs text-white/60">
              Set the audition date, slot time, and physical studio or virtual video meeting link for role: <strong>{targetAudition.characterName}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">Callback Date *</label>
                <input
                  type="date"
                  value={callbackDate}
                  onChange={(e) => setCallbackDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">Slot Time</label>
                <input
                  type="text"
                  value={callbackTime}
                  onChange={(e) => setCallbackTime(e.target.value)}
                  placeholder="e.g. 11:30 AM or 03:00 PM"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">Location or Video Call Link *</label>
                <input
                  type="text"
                  value={callbackLocation}
                  onChange={(e) => setCallbackLocation(e.target.value)}
                  placeholder="Studio room or Google Meet / Zoom link"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">Directorial Notes / Preparation Script</label>
                <textarea
                  rows={2}
                  value={directorNotes}
                  onChange={(e) => setDirectorNotes(e.target.value)}
                  placeholder="Instructions for actor look test or scenes to memorize..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsCallbackModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCallback}
                className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black text-xs font-black uppercase tracking-wider"
              >
                Confirm Callback
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
