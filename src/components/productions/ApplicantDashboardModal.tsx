import React, { useState } from "react";
import { 
  X, Film, Calendar, CheckCircle2, AlertCircle, Clock, Eye, 
  Send, ShieldCheck, FileText, ChevronRight, HelpCircle, User, Sparkles
} from "lucide-react";
import { FilmProjectApplication, FilmApplicationStatus } from "../../types/productions";

interface ApplicantDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
  applications: FilmProjectApplication[];
  onUpdateApplication: (app: FilmProjectApplication) => void;
  onNewSubmission: () => void;
}

export default function ApplicantDashboardModal({
  isOpen,
  onClose,
  userEmail,
  applications,
  onUpdateApplication,
  onNewSubmission
}: ApplicantDashboardModalProps) {
  if (!isOpen) return null;

  // Filter user's applications
  const userApps = applications.filter(
    app => !userEmail || app.userEmail.toLowerCase() === userEmail.toLowerCase()
  );

  const [selectedApp, setSelectedApp] = useState<FilmProjectApplication | null>(null);
  const [responseInfo, setResponseInfo] = useState("");
  const [isResponding, setIsResponding] = useState(false);

  const getStatusBadge = (status: FilmApplicationStatus) => {
    switch (status) {
      case "Submitted":
        return <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> Submitted</span>;
      case "Under Review":
        return <span className="px-2.5 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1"><Eye className="w-3 h-3" /> Under Review</span>;
      case "Shortlisted":
        return <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1"><Sparkles className="w-3 h-3" /> Shortlisted</span>;
      case "Discussion":
        return <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1"><User className="w-3 h-3" /> Discussion</span>;
      case "Additional Information Required":
        return <span className="px-2.5 py-1 bg-amber-400 text-black font-extrabold rounded-lg text-[10px] flex items-center gap-1 animate-pulse"><AlertCircle className="w-3 h-3" /> Info Required</span>;
      case "Approved":
        return <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case "In Development":
        return <span className="px-2.5 py-1 bg-gold/30 text-gold border border-gold/50 rounded-lg text-[10px] font-bold flex items-center gap-1"><Film className="w-3 h-3" /> In Development</span>;
      case "Declined":
        return <span className="px-2.5 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1">Not Selected</span>;
      default:
        return <span className="px-2.5 py-1 bg-white/10 text-white/70 rounded-lg text-[10px]">{status}</span>;
    }
  };

  const handleSendAdditionalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !responseInfo.trim()) return;

    const updated: FilmProjectApplication = {
      ...selectedApp,
      applicantResponseInfo: responseInfo,
      status: "Under Review",
      lastUpdated: new Date().toISOString().split("T")[0]
    };

    onUpdateApplication(updated);
    setSelectedApp(updated);
    setIsResponding(false);
    setResponseInfo("");
    alert("Additional information submitted successfully! CineVenue review team has been notified.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#0C0D11] border border-gold/30 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#12131A] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Applicant Portal</span>
              <h2 className="text-xl font-serif font-bold text-white">MY PRODUCTION APPLICATIONS</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          <div className="flex items-center justify-between bg-[#161722] p-4 rounded-xl border border-white/10">
            <div>
              <p className="text-white/80 font-bold">User Account: <span className="text-gold font-mono">{userEmail || "guest@cinevenue.com"}</span></p>
              <p className="text-white/50 text-[11px]">Track your submitted film projects, scripts, review statuses, and communication.</p>
            </div>
            <button
              onClick={() => {
                onClose();
                onNewSubmission();
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-gold text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:opacity-90 shadow-md shadow-gold/20"
            >
              + Submit New Project
            </button>
          </div>

          {userApps.length === 0 ? (
            <div className="text-center py-12 bg-[#12131A] rounded-2xl border border-white/10 p-8 space-y-4">
              <Film className="w-12 h-12 text-gold/40 mx-auto" />
              <h3 className="text-lg font-serif font-bold text-white">No Submitted Projects Found</h3>
              <p className="text-white/60 max-w-sm mx-auto text-xs">
                You haven't submitted any film scripts or project proposals yet. Submit your project to pitch to CineVenue Productions.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onNewSubmission();
                }}
                className="px-6 py-2.5 bg-gold text-black font-extrabold rounded-xl uppercase text-xs"
              >
                Submit Project Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-white/80">
                Submitted Projects ({userApps.length})
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {userApps.map(app => (
                  <div 
                    key={app.id} 
                    className={`bg-[#12131A] border rounded-2xl p-5 space-y-3 transition-all ${
                      app.status === "Additional Information Required" 
                        ? "border-amber-400 bg-amber-500/5" 
                        : "border-white/10 hover:border-gold/30"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gold font-bold">{app.id}</span>
                          <span className="text-[10px] text-white/40">• {app.submittedAt}</span>
                        </div>
                        <h4 className="text-base font-serif font-bold text-white mt-0.5">{app.projectTitle}</h4>
                      </div>
                      <div>
                        {getStatusBadge(app.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-white/70 text-[11px]">
                      <div>
                        <span className="text-white/40 block">Project Type:</span>
                        <span className="font-bold text-white">{app.projectType}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block">Primary Language:</span>
                        <span className="font-bold text-white">{app.language}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block">Estimated Budget:</span>
                        <span className="font-bold text-white">{app.estimatedBudgetRange}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block">Last Updated:</span>
                        <span className="font-bold text-white">{app.lastUpdated || app.submittedAt}</span>
                      </div>
                    </div>

                    {/* Alert banner if Info Required */}
                    {app.status === "Additional Information Required" && (
                      <div className="p-3 bg-amber-500/10 border border-amber-400/40 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-amber-400 font-bold">
                          <AlertCircle className="w-4 h-4" /> CineVenue Executive Note:
                        </div>
                        <p className="text-white/90 font-medium text-[11px]">
                          "{app.additionalInfoRequestedPrompt || "Additional info needed regarding screenplay structure."}"
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-1">
                      {app.status === "Additional Information Required" && (
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setIsResponding(true);
                          }}
                          className="px-4 py-2 bg-amber-400 text-black font-extrabold text-xs uppercase rounded-xl cursor-pointer hover:bg-amber-300"
                        >
                          Provide Requested Info
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-xl cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Detail & Response Drawer Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#12131A] border border-gold/40 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-gold font-bold">{selectedApp.id}</span>
                <h3 className="text-lg font-serif font-bold text-white">{selectedApp.projectTitle}</h3>
              </div>
              <button onClick={() => { setSelectedApp(null); setIsResponding(false); }} className="p-1 rounded-full bg-white/10 text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-white/80">
              <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                <span>Application Status:</span>
                <div>{getStatusBadge(selectedApp.status)}</div>
              </div>

              {selectedApp.additionalInfoRequestedPrompt && (
                <div className="bg-amber-500/10 border border-amber-400/30 p-3.5 rounded-xl space-y-1">
                  <span className="text-amber-400 font-bold uppercase text-[10px]">CineVenue Request:</span>
                  <p className="text-white text-xs">{selectedApp.additionalInfoRequestedPrompt}</p>
                </div>
              )}

              {selectedApp.applicantResponseInfo && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl space-y-1">
                  <span className="text-emerald-400 font-bold uppercase text-[10px]">Your Response Provided:</span>
                  <p className="text-white text-xs">{selectedApp.applicantResponseInfo}</p>
                </div>
              )}

              {isResponding && (
                <form onSubmit={handleSendAdditionalInfo} className="bg-[#161722] p-4 rounded-xl border border-amber-400/40 space-y-3">
                  <h4 className="font-bold text-amber-400 text-xs">Submit Requested Information</h4>
                  <textarea
                    rows={4}
                    required
                    value={responseInfo}
                    onChange={(e) => setResponseInfo(e.target.value)}
                    placeholder="Enter the requested plot details, budget breakdown, or clarifications here..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-400 text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsResponding(false)}
                      className="px-3 py-1.5 bg-white/10 text-white rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-400 text-black font-extrabold rounded-lg flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Response
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-2 gap-3 bg-black/30 p-3 rounded-xl">
                <div>
                  <span className="text-white/40 block text-[10px]">Logline</span>
                  <span className="text-white">{selectedApp.logline}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Applicant</span>
                  <span className="text-white">{selectedApp.fullName} ({selectedApp.professionalRole})</span>
                </div>
              </div>

              <div>
                <span className="text-white/40 block text-[10px]">Requested Collaborations</span>
                <p className="text-gold font-bold">{selectedApp.requestedCollaboration.join(", ")}</p>
              </div>

              {selectedApp.materials.scriptFileName && (
                <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-mono text-emerald-400">
                    <ShieldCheck className="w-4 h-4" /> {selectedApp.materials.scriptFileName}
                  </span>
                  <span className="text-[10px] text-white/40">Encrypted & Secure</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => { setSelectedApp(null); setIsResponding(false); }}
                className="px-4 py-2 bg-white/10 text-white font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
