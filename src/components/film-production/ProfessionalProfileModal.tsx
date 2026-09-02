import React, { useState } from "react";
import { 
  ProfessionalProfile, 
  TalentReview 
} from "../../types/filmProductionMarketplace";
import { 
  X, Star, MapPin, Globe, ShieldCheck, Calendar, 
  Send, MessageSquare, Play, Video, Music, FileText, 
  Award, CheckCircle2, ChevronRight, Share2, AlertTriangle,
  Briefcase, Film, Sparkles, User, ExternalLink, ThumbsUp
} from "lucide-react";
import { getReviews, submitReview } from "../../services/filmProductionService";

interface ProfessionalProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfessionalProfile | null;
  onInviteToProject: (profile: ProfessionalProfile) => void;
  onStartNegotiation: (profile: ProfessionalProfile) => void;
  currentUserEmail?: string | null;
}

export default function ProfessionalProfileModal({
  isOpen,
  onClose,
  profile,
  onInviteToProject,
  onStartNegotiation,
  currentUserEmail
}: ProfessionalProfileModalProps) {
  if (!isOpen || !profile) return null;

  const [activeTab, setActiveTab] = useState<"overview" | "filmography" | "portfolio" | "availability" | "reviews">("overview");
  
  // Reviews state
  const [reviewsList, setReviewsList] = useState<TalentReview[]>(() => getReviews(profile.id));
  const [newReviewText, setNewReviewText] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    setIsSubmittingReview(true);

    const rev = submitReview({
      targetUserId: profile.id,
      targetName: profile.fullName,
      reviewerName: currentUserEmail ? currentUserEmail.split("@")[0] : "Filmmaker",
      reviewerRole: "Filmmaker",
      rating: newRating,
      ratingsBreakdown: {
        professionalism: newRating,
        communication: newRating,
        reliability: newRating
      },
      reviewText: newReviewText.trim()
    });

    setReviewsList([rev, ...reviewsList]);
    setNewReviewText("");
    setIsSubmittingReview(false);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 4000);
  };

  const isAvail = profile.availability.status === "Available";
  const isPartial = profile.availability.status === "Partially Available";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0D0E15] border border-white/15 rounded-3xl overflow-hidden shadow-2xl animate-fade-in my-auto max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cover Image & Header Banner */}
        <div className="relative h-44 md:h-56 w-full shrink-0 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-black">
          {profile.coverImageUrl ? (
            <img
              src={profile.coverImageUrl}
              alt="Cover"
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-30">
              <Film className="w-20 h-20 text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E15] via-transparent to-transparent" />
        </div>

        {/* Profile Card Header Info */}
        <div className="px-6 md:px-8 -mt-16 relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            
            {/* Avatar & Basic Info */}
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-3xl object-cover border-4 border-[#0D0E15] shadow-2xl bg-[#181A24]"
                />
                <span 
                  className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-[#0D0E15] flex items-center justify-center ${
                    isAvail ? "bg-emerald-500" : isPartial ? "bg-amber-500" : "bg-red-500"
                  }`}
                  title={profile.availability.status}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-black text-white">
                    {profile.fullName}
                  </h1>
                  {profile.verificationLevel !== "None" && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/40">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{profile.verificationLevel}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                    {profile.primaryCraftName}
                  </span>
                  {profile.secondaryCraftNames?.map((sec, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white/5 text-white/70 border border-white/10 hidden sm:inline-block">
                      {sec}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-white/50 pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-white/40" />
                    {profile.location}, {profile.country}
                  </span>
                  <span>•</span>
                  <span>{profile.experienceYears}+ Years Industry Exp</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {profile.rating.toFixed(1)} ({profile.reviewsCount})
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Remuneration & Availability Pill */}
            <div className="w-full sm:w-auto p-3 rounded-2xl bg-white/5 border border-white/10 text-right shrink-0 space-y-1">
              <div className="text-[10px] uppercase font-bold text-white/40">Expected Remuneration</div>
              <div className="text-sm md:text-base font-black text-white">
                ₹{(profile.remunerationRange.min).toLocaleString("en-IN")} – ₹{(profile.remunerationRange.max).toLocaleString("en-IN")}
                <span className="text-xs font-normal text-white/50 ml-1">{profile.remunerationRange.unit}</span>
              </div>
              <div className="text-xs font-semibold flex items-center justify-end gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isAvail ? "bg-emerald-400 animate-pulse" : isPartial ? "bg-amber-400" : "bg-red-400"}`} />
                <span className={isAvail ? "text-emerald-400" : isPartial ? "text-amber-400" : "text-red-400"}>
                  {profile.availability.status}
                </span>
              </div>
            </div>

          </div>

          {/* Headline */}
          <p className="text-xs md:text-sm text-white/80 italic bg-white/[0.02] border-l-2 border-amber-500 pl-3 py-1.5 rounded-r-xl">
            "{profile.professionalHeadline}"
          </p>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pt-2 overflow-x-auto scrollbar-none text-xs font-bold">
            {[
              { id: "overview", label: "Overview & Bio" },
              { id: "filmography", label: `Filmography (${profile.filmography.length})` },
              { id: "portfolio", label: `Portfolio & Media (${profile.portfolio.length})` },
              { id: "availability", label: "Availability Calendar" },
              { id: "reviews", label: `Reviews & Ratings (${reviewsList.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "border-amber-400 text-amber-400 font-black"
                    : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Tab Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* About / Bio */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">About Professional</h3>
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                  {profile.bio}
                </p>
              </div>

              {/* Skills & Specializations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Core Technical Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 text-xs font-semibold border border-amber-500/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Specializations & Niches</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.specializations.map((spec, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 text-xs font-semibold border border-purple-500/20">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preferences & Languages */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="text-white/40 block">Spoken Languages</span>
                  <span className="text-white font-bold">{profile.languages.join(", ")}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="text-white/40 block">Preferred Film Industries</span>
                  <span className="text-white font-bold">{profile.preferredIndustries?.join(", ") || "Pan-India"}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="text-white/40 block">Preferred Project Types</span>
                  <span className="text-white font-bold">{profile.projectTypes?.join(", ")}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FILMOGRAPHY CREDITS */}
          {activeTab === "filmography" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">Official Filmography & Credits</h3>
                <span className="text-xs text-white/40">Verified by CineVenue Production Network</span>
              </div>

              {profile.filmography.length === 0 ? (
                <p className="text-xs text-white/40 text-center py-8">No film credits added yet.</p>
              ) : (
                <div className="space-y-3">
                  {profile.filmography.map(film => (
                    <div
                      key={film.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-white">{film.projectTitle}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                            {film.year}
                          </span>
                          <span className="text-xs text-white/50">• {film.language} • {film.projectType}</span>
                        </div>
                        <p className="text-xs text-amber-300 font-semibold">
                          Role: {film.role} ({film.craft})
                        </p>
                        {film.directorOrCompany && (
                          <p className="text-[11px] text-white/40">
                            Production / Studio: {film.directorOrCompany}
                          </p>
                        )}
                      </div>

                      {film.notableAwards && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold shrink-0">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>{film.notableAwards}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PORTFOLIO & MEDIA */}
          {activeTab === "portfolio" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">Showreels, Videos & Audio Stems</h3>
                <span className="text-xs text-white/40">{profile.portfolio.length} media items</span>
              </div>

              {profile.portfolio.length === 0 ? (
                <p className="text-xs text-white/40 text-center py-8">No portfolio media uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.portfolio.map(item => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 space-y-3 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {item.thumbnailUrl && (
                          <div className="relative h-32 rounded-xl overflow-hidden bg-black/50 border border-white/10">
                            <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Play className="w-8 h-8 text-amber-400 fill-amber-400/80" />
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-white/80">
                              {item.type}
                            </span>
                            <span className="text-[10px] text-white/40">{item.year}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1">{item.title}</h4>
                          <p className="text-xs text-amber-400 font-medium">{item.role}</p>
                          {item.description && (
                            <p className="text-xs text-white/60 line-clamp-2 mt-1">{item.description}</p>
                          )}
                        </div>
                      </div>

                      <a
                        href={item.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Media Link</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AVAILABILITY CALENDAR */}
          {activeTab === "availability" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">Current Availability Schedule</h3>
              
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${isAvail ? "bg-emerald-400 animate-pulse" : isPartial ? "bg-amber-400" : "bg-red-400"}`} />
                  <div>
                    <h4 className="text-base font-bold text-white">Status: {profile.availability.status}</h4>
                    {profile.availability.availableFrom && (
                      <p className="text-xs text-white/60">
                        Available from {profile.availability.availableFrom} {profile.availability.availableTo ? `to ${profile.availability.availableTo}` : "onwards"}
                      </p>
                    )}
                  </div>
                </div>

                {profile.availability.notes && (
                  <p className="text-xs text-white/80 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <strong>Schedule Note:</strong> {profile.availability.notes}
                  </p>
                )}

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Filmmakers can send direct project invitations for confirmed shooting schedules.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REVIEWS & RATINGS */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">Peer & Producer Reviews</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-black text-white">{profile.rating.toFixed(1)}</span>
                    <span className="text-xs text-white/40">based on {reviewsList.length} verified reviews</span>
                  </div>
                </div>
              </div>

              {/* Review Submission Form */}
              <form onSubmit={handleAddReview} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold uppercase text-amber-400">Leave a Verified Film Production Review</h4>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60">Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star className={`w-4 h-4 ${star <= newRating ? "fill-amber-400 text-amber-400" : "text-white/20"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={2}
                  placeholder="Share your experience regarding professionalism, schedule discipline, and creative execution..."
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50"
                  required
                />

                {reviewSuccess && (
                  <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Review submitted successfully!
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingReview || !newReviewText.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  Post Review
                </button>
              </form>

              {/* Reviews List */}
              {reviewsList.length === 0 ? (
                <p className="text-xs text-white/40 text-center py-4">No reviews posted yet. Be the first to review!</p>
              ) : (
                <div className="space-y-3">
                  {reviewsList.map(rev => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{rev.reviewerName}</span>
                          <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/60 font-semibold">
                            {rev.reviewerRole}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed italic">
                        "{rev.reviewText}"
                      </p>
                      <div className="text-[10px] text-white/40">{rev.createdAt} • Verified Film Production</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 md:px-8 border-t border-white/10 bg-[#090A0F] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-white/60 hidden sm:block">
            Direct & encrypted negotiation room • No public phone exposure
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onStartNegotiation(profile);
              }}
              className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Discuss & Negotiate</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onInviteToProject(profile);
              }}
              className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Invite to Project</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
