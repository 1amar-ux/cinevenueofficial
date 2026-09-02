import React, { useState } from "react";
import { 
  FilmProject, 
  FilmProjectRequirement, 
  ProfessionalProfile, 
  JobApplication 
} from "../../types/filmProductionMarketplace";
import { 
  X, Send, CheckCircle2, FileText, Video, Sparkles, 
  User, ShieldCheck, DollarSign, Calendar
} from "lucide-react";
import { submitApplication } from "../../services/filmProductionService";

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: FilmProject | null;
  requirement: FilmProjectRequirement | null;
  applicantProfile?: ProfessionalProfile;
  userEmail?: string | null;
  onApplicationSubmitted: (app: JobApplication) => void;
}

export default function JobApplicationModal({
  isOpen,
  onClose,
  project,
  requirement,
  applicantProfile,
  userEmail,
  onApplicationSubmitted
}: JobApplicationModalProps) {
  if (!isOpen || !project || !requirement) return null;

  const [applicantName, setApplicantName] = useState(applicantProfile?.fullName || (userEmail ? userEmail.split("@")[0] : ""));
  const [coverMessage, setCoverMessage] = useState("");
  const [relevantExperience, setRelevantExperience] = useState("");
  const [expectedPay, setExpectedPay] = useState(requirement.budgetRange || "Negotiable");
  const [availabilityNotes, setAvailabilityNotes] = useState(applicantProfile?.availability?.notes || "Available for full schedule");
  const [portfolioLink, setPortfolioLink] = useState(applicantProfile?.portfolio?.[0]?.mediaUrl || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim()) return;
    setIsSubmitting(true);

    const newApp = submitApplication({
      projectId: project.id,
      projectTitle: project.title,
      projectPosterUrl: project.posterUrl || project.bannerUrl,
      requirementId: requirement.id,
      requirementPosition: requirement.position,
      craftId: requirement.craftId,
      craftName: requirement.craftName,
      applicantId: applicantProfile?.id || `user-${Date.now()}`,
      applicantName: applicantName.trim(),
      applicantEmail: userEmail || applicantProfile?.userEmail || "talent@cinevenue.com",
      applicantAvatar: applicantProfile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
      applicantHeadline: applicantProfile?.professionalHeadline || `${requirement.craftName} Specialist`,
      applicantLocation: applicantProfile?.location || "Hyderabad",
      applicantExperienceYears: applicantProfile?.experienceYears || 3,
      applicantRating: applicantProfile?.rating || 5.0,
      applicantVerification: applicantProfile?.verificationLevel || "Profile Verified",
      coverMessage: coverMessage.trim(),
      relevantExperience: relevantExperience.trim(),
      expectedPay: expectedPay.trim(),
      availabilityNotes: availabilityNotes.trim()
    });

    onApplicationSubmitted(newApp);
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0D0E15] border border-white/15 rounded-3xl overflow-hidden shadow-2xl animate-fade-in my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#111218] shrink-0">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-[10px] font-black uppercase tracking-widest">
              <span>Application Submission</span>
            </div>
            <h2 className="text-base font-black text-white">
              Apply for {requirement.position}
            </h2>
            <p className="text-xs text-white/60">
              Project: <strong className="text-white">{project.title}</strong> ({project.companyName})
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* Quick Requirement Summary */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-white/90 space-y-1">
            <div className="flex items-center justify-between text-amber-300 font-bold">
              <span>{requirement.craftName}</span>
              <span>Offered Budget: {requirement.budgetRange}</span>
            </div>
            <p className="text-white/70 text-[11px] line-clamp-2">{requirement.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 font-bold mb-1">Your Full Name *</label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60"
                required
              />
            </div>

            <div>
              <label className="block text-white/60 font-bold mb-1">Expected Remuneration / Quotes *</label>
              <input
                type="text"
                value={expectedPay}
                onChange={(e) => setExpectedPay(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60"
                placeholder="e.g. ₹5,00,000 per schedule"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white/60 font-bold mb-1">Showreel / Portfolio / Audition Tape URL</label>
            <input
              type="url"
              value={portfolioLink}
              onChange={(e) => setPortfolioLink(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60"
              placeholder="https://youtube.com/... or Vimeo link"
            />
          </div>

          <div>
            <label className="block text-white/60 font-bold mb-1">Relevant Industry Experience & Past Films</label>
            <textarea
              rows={2}
              value={relevantExperience}
              onChange={(e) => setRelevantExperience(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60"
              placeholder="List notable past projects, directors worked with, and specific equipment / craft experience..."
            />
          </div>

          <div>
            <label className="block text-white/60 font-bold mb-1">Cover Note / Pitch to the Director & Producer</label>
            <textarea
              rows={3}
              value={coverMessage}
              onChange={(e) => setCoverMessage(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60"
              placeholder="Explain why you are the ideal fit for this film and vision..."
              required
            />
          </div>

          <div>
            <label className="block text-white/60 font-bold mb-1">Availability & Shooting Schedule Notes</label>
            <input
              type="text"
              value={availabilityNotes}
              onChange={(e) => setAvailabilityNotes(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60"
              placeholder="e.g. Free immediately for full 45-day continuous schedule"
            />
          </div>

          {/* Footer CTA */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            {isSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Application Submitted Successfully!
              </span>
            ) : (
              <span className="text-white/40">Sent directly to filmmaker's private ATS inbox.</span>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Submitting..." : "Submit Application"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
