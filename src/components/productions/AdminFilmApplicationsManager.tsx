import React, { useState } from "react";
import { 
  X, Search, Filter, ShieldCheck, Eye, Edit3, Send, CheckCircle2, 
  Clock, AlertCircle, Sparkles, User, Mail, Phone, Calendar, FileText, 
  Archive, Lock, ChevronDown, Check, Plus, MessageSquare, Download, Film
} from "lucide-react";
import { 
  FilmProjectApplication, 
  FilmApplicationStatus, 
  ApplicationProjectType 
} from "../../types/productions";

interface AdminFilmApplicationsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  applications: FilmProjectApplication[];
  onUpdateApplication: (app: FilmProjectApplication) => void;
}

const REVIEWERS = [
  "S.S. Kamesh (Head of Content)",
  "Anil Sharma (EVP Production)",
  "Script Evaluation Panel A",
  "Script Evaluation Panel B",
  "CineVenue Creative Board"
];

const STATUS_LIST: FilmApplicationStatus[] = [
  "Submitted",
  "Under Review",
  "Shortlisted",
  "Discussion",
  "Additional Information Required",
  "Approved",
  "In Development",
  "Declined"
];

export default function AdminFilmApplicationsManager({
  isOpen,
  onClose,
  applications,
  onUpdateApplication
}: AdminFilmApplicationsManagerProps) {
  if (!isOpen) return null;

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [languageFilter, setLanguageFilter] = useState<string>("All");
  const [collabFilter, setCollabFilter] = useState<string>("All");
  const [showArchived, setShowArchived] = useState(false);

  // Active Application Modal
  const [activeApp, setActiveApp] = useState<FilmProjectApplication | null>(null);

  // Editable Form State in Detail View
  const [editingStatus, setEditingStatus] = useState<FilmApplicationStatus>("Submitted");
  const [editingNotes, setEditingNotes] = useState("");
  const [editingReviewer, setEditingReviewer] = useState("");
  const [editingFollowUp, setEditingFollowUp] = useState("");
  const [requestInfoText, setRequestInfoText] = useState("");
  const [isRequestingInfoOpen, setIsRequestingInfoOpen] = useState(false);

  // Filtered Applications
  const filteredApps = applications.filter(app => {
    if (!showArchived && app.isArchived) return false;
    if (showArchived && !app.isArchived) return false;

    const matchesSearch = !searchQuery || 
      app.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    const matchesType = typeFilter === "All" || app.projectType === typeFilter;
    const matchesLang = languageFilter === "All" || app.language.toLowerCase().includes(languageFilter.toLowerCase());
    const matchesCollab = collabFilter === "All" || app.requestedCollaboration.some(c => c.toLowerCase().includes(collabFilter.toLowerCase()));

    return matchesSearch && matchesStatus && matchesType && matchesLang && matchesCollab;
  });

  const openAppDetails = (app: FilmProjectApplication) => {
    setActiveApp(app);
    setEditingStatus(app.status);
    setEditingNotes(app.adminNotes || "");
    setEditingReviewer(app.assignedReviewer || REVIEWERS[0]);
    setEditingFollowUp(app.followUpDate || "");
    setRequestInfoText(app.additionalInfoRequestedPrompt || "");
    setIsRequestingInfoOpen(false);
  };

  const handleSaveAdminChanges = () => {
    if (!activeApp) return;

    let updatedStatus = editingStatus;
    if (isRequestingInfoOpen && requestInfoText.trim()) {
      updatedStatus = "Additional Information Required";
    }

    const updated: FilmProjectApplication = {
      ...activeApp,
      status: updatedStatus,
      adminNotes: editingNotes,
      assignedReviewer: editingReviewer,
      followUpDate: editingFollowUp,
      additionalInfoRequestedPrompt: isRequestingInfoOpen ? requestInfoText : activeApp.additionalInfoRequestedPrompt,
      lastUpdated: new Date().toISOString().split("T")[0]
    };

    onUpdateApplication(updated);
    setActiveApp(updated);
    setIsRequestingInfoOpen(false);
    alert("Application evaluation updated successfully.");
  };

  const handleToggleArchive = (app: FilmProjectApplication) => {
    const updated = { ...app, isArchived: !app.isArchived };
    onUpdateApplication(updated);
    if (activeApp && activeApp.id === app.id) {
      setActiveApp(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-6xl bg-[#0C0D11] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="bg-[#12131A] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-gold to-yellow-400 p-0.5 flex items-center justify-center shadow-lg shadow-gold/20">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-gold" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Admin Evaluation Portal
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white">
                CineVenue Film Applications Management
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* Filter Bar */}
          <div className="bg-[#12131A] p-4 rounded-xl border border-white/10 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, applicant name, project ID..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Format Filter */}
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="All">All Formats</option>
                  <option value="Feature Film">Feature Film</option>
                  <option value="Web Series">Web Series</option>
                  <option value="Short Film">Short Film</option>
                  <option value="Anthology">Anthology</option>
                  <option value="Music Film">Music Film</option>
                </select>
              </div>

              {/* Archived Toggle */}
              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                className={`w-full py-2 rounded-xl font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  showArchived 
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40" 
                    : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{showArchived ? "Showing Archived" : "View Archive"}</span>
              </button>
            </div>
          </div>

          {/* Table / List */}
          <div className="bg-[#12131A] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                Submitted Film Projects ({filteredApps.length})
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Confidential Document Access Restricted
              </span>
            </div>

            {filteredApps.length === 0 ? (
              <div className="py-12 text-center text-white/50 space-y-2">
                <Film className="w-10 h-10 text-white/20 mx-auto" />
                <p>No film applications match the selected criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/50 text-white/50 uppercase text-[10px] font-bold border-b border-white/10">
                    <tr>
                      <th className="p-3.5">Project ID & Title</th>
                      <th className="p-3.5">Applicant</th>
                      <th className="p-3.5">Format & Lang</th>
                      <th className="p-3.5">Budget</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Submitted</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredApps.map(app => (
                      <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5">
                          <span className="font-mono text-[10px] text-amber-400 font-bold block">{app.id}</span>
                          <span className="font-bold text-white text-sm">{app.projectTitle}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-white block">{app.fullName}</span>
                          <span className="text-white/50 text-[10px]">{app.professionalRole}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-white font-medium block">{app.projectType}</span>
                          <span className="text-white/50 text-[10px]">{app.language}</span>
                        </td>
                        <td className="p-3.5 text-white/80 font-mono text-[11px]">
                          {app.estimatedBudgetRange}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-[10px] font-bold">
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-white/60 text-[11px]">
                          {app.submittedAt}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => openAppDetails(app)}
                            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-gold text-black font-extrabold text-[11px] rounded-lg cursor-pointer hover:opacity-90 flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" /> Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Admin Application Detail Modal */}
      {activeApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-4xl bg-[#0C0D11] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-[#12131A] border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                    {activeApp.id}
                  </span>
                  <span className="text-xs text-white/50">• Submitted: {activeApp.submittedAt}</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-white mt-1">
                  {activeApp.projectTitle}
                </h3>
              </div>

              <button
                onClick={() => setActiveApp(null)}
                className="p-2 rounded-full bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              
              {/* Admin Evaluation Panel Header */}
              <div className="bg-[#161722] border border-amber-500/30 p-4 rounded-xl space-y-3">
                <h4 className="font-bold text-amber-400 uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4" /> Admin Review & Action Controls
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-white/70 font-semibold mb-1">Update Status</label>
                    <select
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value as FilmApplicationStatus)}
                      className="w-full bg-black/70 border border-white/20 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {STATUS_LIST.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/70 font-semibold mb-1">Assigned Executive / Board</label>
                    <select
                      value={editingReviewer}
                      onChange={(e) => setEditingReviewer(e.target.value)}
                      className="w-full bg-black/70 border border-white/20 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {REVIEWERS.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/70 font-semibold mb-1">Follow-Up Date</label>
                    <input
                      type="date"
                      value={editingFollowUp}
                      onChange={(e) => setEditingFollowUp(e.target.value)}
                      className="w-full bg-black/70 border border-white/20 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Request Info Toggle */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsRequestingInfoOpen(!isRequestingInfoOpen)}
                      className="text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1 text-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isRequestingInfoOpen ? "Cancel Request Info" : "+ Request Additional Information From Applicant"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleArchive(activeApp)}
                      className="text-white/50 hover:text-white cursor-pointer text-xs"
                    >
                      {activeApp.isArchived ? "Unarchive Application" : "Archive Application"}
                    </button>
                  </div>

                  {isRequestingInfoOpen && (
                    <div className="p-3 bg-black/60 border border-amber-400/40 rounded-xl space-y-2">
                      <label className="block text-amber-400 font-bold">What information is required from applicant?</label>
                      <textarea
                        rows={3}
                        value={requestInfoText}
                        onChange={(e) => setRequestInfoText(e.target.value)}
                        placeholder="e.g. Please provide episode 3 to 8 outlines and updated Budapest line-item budget..."
                        className="w-full bg-black border border-white/15 rounded-xl p-3 text-white outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Internal Review Notes (NEVER visible to applicants)</label>
                  <textarea
                    rows={3}
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Enter confidential board comments, reading scores, commercial assessment..."
                    className="w-full bg-black/70 border border-white/20 rounded-xl p-3 text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveAdminChanges}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-gold text-black font-extrabold text-xs uppercase rounded-xl shadow-lg cursor-pointer hover:opacity-90 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Save Review Changes
                  </button>
                </div>
              </div>

              {/* Applicant Response display if exists */}
              {activeApp.applicantResponseInfo && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl space-y-1">
                  <span className="text-emerald-400 font-bold uppercase text-[10px]">Applicant Response Received:</span>
                  <p className="text-white text-xs">{activeApp.applicantResponseInfo}</p>
                </div>
              )}

              {/* Project & Applicant Information Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Applicant Info */}
                <div className="p-4 bg-[#12131A] border border-white/10 rounded-xl space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                    Applicant Profile
                  </h4>
                  <div className="space-y-1 text-white/80">
                    <p><strong>Name:</strong> {activeApp.fullName}</p>
                    <p><strong>Role:</strong> {activeApp.professionalRole}</p>
                    <p><strong>Email:</strong> {activeApp.email}</p>
                    <p><strong>Phone:</strong> {activeApp.phone}</p>
                    <p><strong>Location:</strong> {activeApp.city}, {activeApp.state}, {activeApp.country}</p>
                    {activeApp.isSubmittingForOthers && (
                      <p className="text-amber-400 font-semibold">
                        <strong>Entity:</strong> {activeApp.representedEntityDetails}
                      </p>
                    )}
                  </div>
                  <div className="pt-2 flex gap-2">
                    <a href={`mailto:${activeApp.email}`} className="px-3 py-1 bg-white/10 text-white rounded font-bold flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </a>
                    <a href={`tel:${activeApp.phone}`} className="px-3 py-1 bg-white/10 text-white rounded font-bold flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  </div>
                </div>

                {/* Project Specs */}
                <div className="p-4 bg-[#12131A] border border-white/10 rounded-xl space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                    Project Specifications
                  </h4>
                  <div className="space-y-1 text-white/80">
                    <p><strong>Format:</strong> {activeApp.projectType} • {activeApp.projectStage}</p>
                    <p><strong>Language:</strong> {activeApp.language}</p>
                    <p><strong>Genres:</strong> {activeApp.genre.join(", ")}</p>
                    <p><strong>Estimated Budget:</strong> {activeApp.estimatedBudgetRange}</p>
                    <p><strong>Shooting Duration:</strong> {activeApp.expectedShootingDuration}</p>
                    <p><strong>Shooting Location:</strong> {activeApp.primaryShootingLocation}</p>
                  </div>
                </div>

              </div>

              {/* Logline & Synopsis */}
              <div className="p-4 bg-[#12131A] border border-white/10 rounded-xl space-y-2">
                <h4 className="font-bold text-gold text-xs uppercase tracking-wider">Logline & Synopsis</h4>
                <p className="text-white font-medium italic">"{activeApp.logline}"</p>
                <div className="pt-2 border-t border-white/10">
                  <span className="text-white/50 block font-bold text-[10px] uppercase">Short Synopsis:</span>
                  <p className="text-white/80 leading-relaxed mt-1">{activeApp.shortSynopsis}</p>
                </div>
                {activeApp.fullSynopsis && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-white/50 block font-bold text-[10px] uppercase">Full Narrative Synopsis:</span>
                    <p className="text-white/80 leading-relaxed mt-1">{activeApp.fullSynopsis}</p>
                  </div>
                )}
              </div>

              {/* Creative Team */}
              <div className="p-4 bg-[#12131A] border border-white/10 rounded-xl space-y-2">
                <h4 className="font-bold text-gold text-xs uppercase tracking-wider">Creative Team</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-white/40 block">Director</span>
                    <span className="text-white font-bold">{activeApp.directorName}</span>
                    {activeApp.directorPreviousWork && <p className="text-[10px] text-white/60">{activeApp.directorPreviousWork}</p>}
                  </div>
                  <div>
                    <span className="text-white/40 block">Writer</span>
                    <span className="text-white font-bold">{activeApp.writerName}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Producer</span>
                    <span className="text-white font-bold">{activeApp.producerName || "Seeking Producer"}</span>
                  </div>
                </div>

                {activeApp.leadCast.length > 0 && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-white/50 block font-bold text-[10px] uppercase mb-1">Lead Cast:</span>
                    <div className="flex flex-wrap gap-2">
                      {activeApp.leadCast.map(c => (
                        <span key={c.id} className="px-2.5 py-1 bg-black/50 border border-white/10 rounded text-white text-[11px]">
                          <strong>{c.name}</strong> as {c.role} ({c.status})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Requested Collaboration */}
              <div className="p-4 bg-[#12131A] border border-white/10 rounded-xl space-y-2">
                <h4 className="font-bold text-gold text-xs uppercase tracking-wider">Requested Collaboration</h4>
                <div className="flex flex-wrap gap-2">
                  {activeApp.requestedCollaboration.map(c => (
                    <span key={c} className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg font-bold">
                      {c}
                    </span>
                  ))}
                </div>
                {activeApp.expectationsFromCineVenue && (
                  <div className="pt-2">
                    <span className="text-white/50 block text-[10px] uppercase">Expectations:</span>
                    <p className="text-white/80 mt-1">{activeApp.expectationsFromCineVenue}</p>
                  </div>
                )}
              </div>

              {/* Submitted Materials */}
              <div className="p-4 bg-[#12131A] border border-white/10 rounded-xl space-y-2">
                <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Confidential Documents
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeApp.materials.scriptFileName && (
                    <div className="p-2.5 bg-black/60 border border-white/10 rounded-lg flex items-center justify-between">
                      <span className="font-mono text-white text-[11px] truncate">{activeApp.materials.scriptFileName}</span>
                      <button className="px-2 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded text-[10px]">
                        Open Script
                      </button>
                    </div>
                  )}
                  {activeApp.materials.pitchDeckFileName && (
                    <div className="p-2.5 bg-black/60 border border-white/10 rounded-lg flex items-center justify-between">
                      <span className="font-mono text-white text-[11px] truncate">{activeApp.materials.pitchDeckFileName}</span>
                      <button className="px-2 py-1 bg-amber-500/20 text-amber-400 font-bold rounded text-[10px]">
                        Open Pitch Deck
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-[#12131A] border-t border-white/10 px-6 py-3 flex items-center justify-between">
              <span className="text-[10px] text-white/40">Last Updated: {activeApp.lastUpdated || activeApp.submittedAt}</span>
              <button
                onClick={() => setActiveApp(null)}
                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl"
              >
                Close Review
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
