import React, { useState } from "react";
import { X, Send, FileText, Upload, Lock, ShieldCheck, CheckCircle2, Sparkles } from "lucide-react";
import { StorySubmission, ProductionCategory } from "../../types/productions";

interface StorySubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitStory: (submission: StorySubmission) => void;
  userEmail?: string | null;
}

export default function StorySubmissionModal({
  isOpen,
  onClose,
  onSubmitStory,
  userEmail
}: StorySubmissionModalProps) {
  if (!isOpen) return null;

  const [projectTitle, setProjectTitle] = useState("");
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [logline, setLogline] = useState("");
  const [genre, setGenre] = useState("Thriller");
  const [language, setLanguage] = useState("Telugu");
  const [synopsis, setSynopsis] = useState("");
  const [directorName, setDirectorName] = useState("");
  const [writerName, setWriterName] = useState("");
  const [projectType, setProjectType] = useState<ProductionCategory>("Feature Film");
  const [estimatedBudget, setEstimatedBudget] = useState("₹5 Cr - ₹15 Cr");
  const [scriptFileName, setScriptFileName] = useState("");
  const [pitchDeckFileName, setPitchDeckFileName] = useState("");
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle || !userName || !phone || !logline) {
      alert("Please fill in the project title, contact name, phone, and logline.");
      return;
    }

    const newId = "STORY-" + Math.floor(1000 + Math.random() * 9000);
    const submission: StorySubmission = {
      id: newId,
      userEmail: userEmail || "creator@cinevenue.com",
      userName,
      phone,
      projectTitle,
      logline,
      genre,
      language,
      synopsis,
      directorName: directorName || userName,
      writerName: writerName || userName,
      projectType,
      estimatedBudget,
      scriptFileName: scriptFileName || `${projectTitle.replace(/\s+/g, '_')}_Script.pdf`,
      pitchDeckFileName: pitchDeckFileName || `${projectTitle.replace(/\s+/g, '_')}_PitchDeck.pdf`,
      submittedAt: new Date().toLocaleDateString(),
      status: "Submitted"
    };

    onSubmitStory(submission);
    setSubmissionId(newId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#0F0F12] border border-gold/30 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submissionId ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h2 className="text-2xl font-serif font-bold text-white">Story Submission Received!</h2>
            <p className="text-sm text-white/70 max-w-md mx-auto">
              Your story pitch <strong className="text-gold">"{projectTitle}"</strong> has been logged into CineVenue Script Registry under confidential lock.
            </p>
            <div className="bg-black/60 border border-white/10 p-4 rounded-xl inline-block text-xs font-mono">
              Submission Reference ID: <span className="text-amber-400 font-bold">{submissionId}</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl text-xs text-white/60 max-w-md mx-auto text-left space-y-1">
              <p className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" /> Confidentiality Guarantee
              </p>
              <p>Your script and intellectual property are encrypted and protected under NDA. Our Script Evaluation Panel will review your pitch within 7 business days.</p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gold text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:bg-amber-400"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="space-y-2 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/40 text-[10px] font-bold uppercase">
                  CineVenue Script Registry
                </span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Encrypted & Protected
                </span>
              </div>
              <h2 className="text-2xl font-bold font-serif text-white">
                Submit Your Story / Film Pitch
              </h2>
              <p className="text-xs text-white/60">
                Have a script, story concept, or film proposal? Submit your project to CineVenue Productions for co-financing, production, or development.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. Ghosts of Godavari"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Project Format *</label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value as ProductionCategory)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  >
                    <option value="Feature Film">Feature Film</option>
                    <option value="Web Series">Web Series</option>
                    <option value="Short Film">Short Film</option>
                    <option value="Music Video">Music Video</option>
                    <option value="Commercial Film">Commercial Film</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Primary Language</label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="e.g. Telugu / Hindi"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Logline (1-2 sentences pitch summary) *</label>
                <input
                  type="text"
                  required
                  value={logline}
                  onChange={(e) => setLogline(e.target.value)}
                  placeholder="e.g. A detective with hyperacusis investigates supernatural river drownings..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Detailed Synopsis & Story Arc</label>
                <textarea
                  rows={4}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="Provide a spoiler-inclusive plot summary including key characters, conflict, and climax..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Estimated Budget Range</label>
                  <select
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  >
                    <option value="Under ₹1 Cr">Under ₹1 Crore (Micro-Budget)</option>
                    <option value="₹1 Cr - ₹5 Cr">₹1 Crore - ₹5 Crores (Indie)</option>
                    <option value="₹5 Cr - ₹15 Cr">₹5 Crores - ₹15 Crores (Mid-Budget)</option>
                    <option value="₹15 Cr - ₹50 Cr">₹15 Crores - ₹50 Crores (Large)</option>
                    <option value="₹50 Cr+">₹50 Crores+ (Scale Blockbuster)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Upload Script / Screenplay PDF</label>
                  <div className="relative flex items-center bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-white">
                    <Upload className="w-4 h-4 text-gold mr-2" />
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setScriptFileName(e.target.files?.[0]?.name || "")}
                      className="text-xs text-white/70 cursor-pointer w-full"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-gold via-amber-400 to-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 shadow-lg shadow-gold/10 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Confidential Story Pitch</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
