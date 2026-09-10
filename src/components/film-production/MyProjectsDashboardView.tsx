import React, { useState } from "react";
import { 
  FilmProject, 
  ProductionStage,
  ProjectStatus,
  ProjectType,
  ProfessionalProfile
} from "../../types/filmProductionMarketplace";
import { 
  PlusCircle, Film, Calendar, MapPin, Building2, User, 
  Trash2, Edit3, CheckCircle2, ChevronRight, FileText, 
  Clock, X, Search, Filter, AlertCircle, Sparkles, ExternalLink,
  Users
} from "lucide-react";
import { 
  saveProject, 
  deleteProject,
  getProjects,
  getProfessionalById,
  getProfessionals
} from "../../services/filmProductionService";
import ProfessionalProfileModal from "./ProfessionalProfileModal";

interface MyProjectsDashboardViewProps {
  projects: FilmProject[];
  userEmail: string;
  onRefreshProjects: () => void;
  onSelectProjectForCasting?: (project: FilmProject) => void;
}

const PROJECT_STATUSES: ProjectStatus[] = [
  "Idea",
  "Development",
  "Pre-Production",
  "Production",
  "Post-Production",
  "Completed",
  "Released"
];

const PROJECT_TYPES: ProjectType[] = [
  "Feature Film",
  "Short Film",
  "Web Series",
  "OTT",
  "Documentary",
  "Music Video",
  "Advertisement",
  "Television",
  "Other"
];

export default function MyProjectsDashboardView({
  projects,
  userEmail,
  onRefreshProjects,
  onSelectProjectForCasting
}: MyProjectsDashboardViewProps) {
  const normEmail = (userEmail || "").toLowerCase();

  // Filter for projects owned by the user (or seeded test projects if none yet)
  const myProjects = projects.filter(p => 
    !p.ownerEmail || p.ownerEmail.toLowerCase() === normEmail
  );

  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Create / Edit Film Project
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<ProjectType>("Feature Film");
  const [formGenre, setFormGenre] = useState("Action, Drama");
  const [formLanguage, setFormLanguage] = useState("Telugu");
  const [formSynopsis, setFormSynopsis] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStage, setFormStage] = useState<ProductionStage>("Pre-Production");
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [formCompletionDate, setFormCompletionDate] = useState("");
  const [formLocation, setFormLocation] = useState("Hyderabad, Telangana");
  const [formProducer, setFormProducer] = useState(userEmail ? userEmail.split("@")[0] : "Producer");
  const [formDirector, setFormDirector] = useState("Director");
  const [formCompany, setFormCompany] = useState("CineVenue Productions");
  const [formPoster, setFormPoster] = useState("https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80");
  const [formDocUrl, setFormDocUrl] = useState("");
  const [formStatus, setFormStatus] = useState<ProjectStatus>("Development");

  // Selected project details modal
  const [viewingProject, setViewingProject] = useState<FilmProject | null>(null);

  // Professional profile preview for Cast & Crew
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<ProfessionalProfile | null>(null);

  const handleOpenMemberProfile = (member: { professionalId?: string; name?: string; actorName?: string; role?: string }) => {
    const profs = getProfessionals();
    let found: ProfessionalProfile | undefined;
    if (member.professionalId) {
      found = getProfessionalById(member.professionalId);
    }
    const nameToMatch = member.name || member.actorName;
    if (!found && nameToMatch) {
      found = profs.find(p => p.fullName.toLowerCase() === nameToMatch.toLowerCase());
    }
    if (found) {
      setSelectedMemberProfile(found);
    } else if (nameToMatch) {
      setSelectedMemberProfile({
        id: member.professionalId || `member-${Date.now()}`,
        userId: `usr-${Date.now()}`,
        userEmail: "cast@cinevenue.com",
        fullName: nameToMatch,
        handle: `@${nameToMatch.replace(/\s+/g, "_").toLowerCase()}`,
        professionalHeadline: member.role || "Cast & Crew Specialist",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
        location: "Hyderabad",
        country: "India",
        preferredLocations: ["Hyderabad", "Mumbai"],
        languages: ["Telugu", "Hindi"],
        bio: `${nameToMatch} is an attached specialist on this CineVenue film project.`,
        experienceYears: 4,
        primaryCraftId: "craft-1",
        primaryCraftName: member.role || "Acting",
        secondaryCraftIds: [],
        secondaryCraftNames: [],
        roles: [member.role || "Film Specialist"],
        specializations: ["Feature Film", "Cinema"],
        skills: ["Performance", "Production"],
        projectTypes: ["Feature Film"],
        preferredIndustries: ["Tollywood", "Pan-India"],
        remunerationRange: { min: 300000, max: 1500000, currency: "INR", unit: "per project" },
        availability: { status: "Available", notes: "Attached to project" },
        contactPreferences: { allowDirectInvites: true, allowNegotiations: true, preferredContactMode: "Platform Chat" },
        portfolio: [],
        filmography: [],
        verificationLevel: "Profile Verified",
        rating: 5.0,
        reviewsCount: 1,
        completedProjectsCount: 1,
        joinedDate: "2025"
      });
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProjectId(null);
    setFormTitle("");
    setFormType("Feature Film");
    setFormGenre("Action, Thriller");
    setFormLanguage("Telugu");
    setFormSynopsis("");
    setFormDescription("");
    setFormStage("Pre-Production");
    setFormStartDate(new Date().toISOString().split("T")[0]);
    setFormCompletionDate("");
    setFormLocation("Hyderabad, Telangana");
    setFormProducer(userEmail ? userEmail.split("@")[0] : "Lead Producer");
    setFormDirector("Director");
    setFormCompany("CineVenue Productions");
    setFormPoster("https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80");
    setFormDocUrl("");
    setFormStatus("Development");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (proj: FilmProject) => {
    // Ownership check
    const isOwner = !proj.ownerEmail || proj.ownerEmail.toLowerCase() === normEmail;
    if (!isOwner) {
      alert("You can only edit projects you own or are authorized to manage.");
      return;
    }

    setEditingProjectId(proj.id);
    setFormTitle(proj.title);
    setFormType(proj.type);
    setFormGenre(Array.isArray(proj.genre) ? proj.genre.join(", ") : proj.genre || "");
    setFormLanguage(proj.language);
    setFormSynopsis(proj.synopsis || "");
    setFormDescription(proj.description || "");
    setFormStage(proj.productionStage as any);
    setFormStartDate(proj.expectedStartDate || "");
    setFormCompletionDate(proj.expectedCompletionDate || "");
    setFormLocation(proj.location || "");
    setFormProducer(proj.producerName || "");
    setFormDirector(proj.directorName || "");
    setFormCompany(proj.companyName || "");
    setFormPoster(proj.posterUrl || "");
    setFormDocUrl(proj.projectDocuments?.[0] || "");
    setFormStatus((proj.status as ProjectStatus) || "Development");
    setIsModalOpen(true);
  };

  const handleDeleteProject = (proj: FilmProject) => {
    // Ownership check
    const isOwner = !proj.ownerEmail || proj.ownerEmail.toLowerCase() === normEmail;
    if (!isOwner) {
      alert("You can only delete projects you own or are explicitly authorized to manage.");
      return;
    }

    if (confirm(`Are you sure you want to delete film project "${proj.title}"? This cannot be undone.`)) {
      deleteProject(proj.id);
      onRefreshProjects();
      if (viewingProject?.id === proj.id) {
        setViewingProject(null);
      }
    }
  };

  const handleSaveProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const genreArray = formGenre.split(",").map(g => g.trim()).filter(Boolean);

    saveProject({
      ...(editingProjectId ? { id: editingProjectId } : {}),
      ownerEmail: userEmail || "filmmaker@cinevenue.com",
      ownerName: userEmail ? userEmail.split("@")[0] : "Filmmaker",
      title: formTitle.trim(),
      type: formType,
      genre: genreArray,
      language: formLanguage.trim(),
      synopsis: formSynopsis.trim(),
      description: formDescription.trim(),
      productionStage: formStage,
      expectedStartDate: formStartDate,
      expectedCompletionDate: formCompletionDate,
      location: formLocation.trim(),
      producerName: formProducer.trim(),
      directorName: formDirector.trim(),
      companyName: formCompany.trim(),
      posterUrl: formPoster.trim(),
      bannerUrl: formPoster.trim(),
      projectDocuments: formDocUrl ? [formDocUrl.trim()] : [],
      status: formStatus
    });

    setIsModalOpen(false);
    onRefreshProjects();
  };

  const filteredProjects = myProjects.filter(p => {
    const matchesStatus = selectedStatusFilter === "All" || p.status === selectedStatusFilter;
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.directorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.language.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadgeClass = (status: ProjectStatus) => {
    switch (status) {
      case "Idea": return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      case "Development": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Pre-Production": return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "Production": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "Post-Production": return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      case "Completed": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "Released": return "bg-gold/20 text-gold border-gold/40";
      default: return "bg-white/10 text-white border-white/20";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#14121E] via-[#10121C] to-black border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-widest">
              <Film className="w-3.5 h-3.5" />
              <span>Project Studio & ATS</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              My Film Projects
            </h1>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Create and manage your own cinema projects across all stages of production. Add crew requisitions, connect casting calls, and retain complete owner control over your creative intellectual property.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={handleOpenCreateModal}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-gold/20 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-black" />
              <span>+ Create Film Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0D0E15] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-lg">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {["All", ...PROJECT_STATUSES].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedStatusFilter === st
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0D0E15] border border-white/10 space-y-4">
          <Film className="w-12 h-12 text-white/20 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No film projects found</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              You haven't created any projects matching this filter. Start by creating your first film project.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
          >
            + Create Film Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(proj => {
            const isOwner = !proj.ownerEmail || proj.ownerEmail.toLowerCase() === normEmail;

            return (
              <div 
                key={proj.id}
                className="group rounded-2xl bg-[#0E0F17] border border-white/10 overflow-hidden hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Poster Banner */}
                  <div className="relative h-44 w-full bg-black/50 overflow-hidden">
                    <img 
                      src={proj.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800"} 
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E0F17] via-[#0E0F17]/30 to-transparent" />
                    
                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${getStatusBadgeClass(proj.status as ProjectStatus)}`}>
                        {proj.status}
                      </span>
                    </div>

                    {/* Stage indicator */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white/80 border border-white/20 backdrop-blur-md">
                        {proj.productionStage}
                      </span>
                    </div>

                    {/* Language & Type */}
                    <div className="absolute bottom-2 left-3 flex items-center gap-2 text-[11px] text-white/90">
                      <span className="font-bold text-amber-400">{proj.language}</span>
                      <span>•</span>
                      <span>{proj.type}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {proj.title}
                    </h3>

                    <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                      {proj.synopsis || proj.description || "No synopsis provided."}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-white/70 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">Dir: {proj.directorName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">Prod: {proj.producerName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{proj.location || "India"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{proj.expectedStartDate || "TBD"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setViewingProject(proj)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    View Details
                  </button>

                  <div className="flex items-center gap-1.5">
                    {isOwner ? (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(proj)}
                          title="Edit Project"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-amber-400 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj)}
                          title="Delete Project"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-white/40 italic">View Only</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT FILM PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0F1018] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#13141E]">
              <div className="flex items-center gap-2.5">
                <Film className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-black text-white">
                  {editingProjectId ? "Edit Film Project" : "Create New Film Project"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/60 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveProjectSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
              
              {/* Title & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Project Vayu – The Legend"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Project Type *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ProjectType)}
                    className="w-full bg-[#1A1B26] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  >
                    {PROJECT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Genre & Language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Genre(s) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Action, Period Drama, Thriller"
                    value={formGenre}
                    onChange={(e) => setFormGenre(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Primary Language *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Telugu, Pan-India"
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Stage & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Production Stage *</label>
                  <select
                    value={formStage}
                    onChange={(e) => setFormStage(e.target.value as ProductionStage)}
                    className="w-full bg-[#1A1B26] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  >
                    {PROJECT_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Project Status *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ProjectStatus)}
                    className="w-full bg-[#1A1B26] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  >
                    {PROJECT_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates & Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Start / Shoot Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Target Wrap Date</label>
                  <input
                    type="date"
                    value={formCompletionDate}
                    onChange={(e) => setFormCompletionDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Shooting Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabad & RFC"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Producer, Director & Company */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Producer *</label>
                  <input
                    type="text"
                    required
                    value={formProducer}
                    onChange={(e) => setFormProducer(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Director *</label>
                  <input
                    type="text"
                    required
                    value={formDirector}
                    onChange={(e) => setFormDirector(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Production Company</label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Poster URL & Documents Link */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Project Poster / Logo URL</label>
                  <input
                    type="url"
                    value={formPoster}
                    onChange={(e) => setFormPoster(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Project Document / Script URL</label>
                  <input
                    type="url"
                    value={formDocUrl}
                    onChange={(e) => setFormDocUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                    placeholder="https://drive.google.com/... or pitch deck link"
                  />
                </div>
              </div>

              {/* Synopsis */}
              <div>
                <label className="block text-white/70 font-bold mb-1">One-Line Synopsis *</label>
                <input
                  type="text"
                  required
                  placeholder="Short logline or hook for the film"
                  value={formSynopsis}
                  onChange={(e) => setFormSynopsis(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white/70 font-bold mb-1">Full Project Description & Story Outline</label>
                <textarea
                  rows={3}
                  placeholder="Provide comprehensive creative details, visual tone, casting needs, and production timeline..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-white/40">
                  Only you will have authorization to edit or remove this project.
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-gold/20"
                  >
                    {editingProjectId ? "Save Changes" : "Publish Project"}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VIEW PROJECT DETAILS MODAL */}
      {viewingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0F1018] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col">
            
            <div className="relative h-48 bg-black">
              <img 
                src={viewingProject.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800"} 
                alt={viewingProject.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1018] via-transparent to-transparent" />
              <button 
                onClick={() => setViewingProject(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadgeClass(viewingProject.status as ProjectStatus)}`}>
                    {viewingProject.status}
                  </span>
                  <h2 className="text-xl font-black text-white mt-1">{viewingProject.title}</h2>
                </div>

                <span className="text-xs text-amber-400 font-bold">
                  {viewingProject.language} • {viewingProject.type}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Logline / Synopsis</span>
                <p className="text-white/80 leading-relaxed">{viewingProject.synopsis || "No synopsis recorded."}</p>
              </div>

              {viewingProject.description && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Description</span>
                  <p className="text-white/70 leading-relaxed whitespace-pre-line">{viewingProject.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div 
                  onClick={() => handleOpenMemberProfile({ name: viewingProject.producerName, role: "Producer" })}
                  className="cursor-pointer hover:bg-white/5 p-1.5 -m-1.5 rounded-lg transition-all"
                  title="Click to view Producer profile"
                >
                  <span className="text-[10px] text-white/40 block font-bold">Producer (Click to view)</span>
                  <span className="text-amber-400 font-medium hover:underline flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{viewingProject.producerName}</span>
                  </span>
                </div>
                <div 
                  onClick={() => handleOpenMemberProfile({ name: viewingProject.directorName, role: "Director" })}
                  className="cursor-pointer hover:bg-white/5 p-1.5 -m-1.5 rounded-lg transition-all"
                  title="Click to view Director profile"
                >
                  <span className="text-[10px] text-white/40 block font-bold">Director (Click to view)</span>
                  <span className="text-amber-400 font-medium hover:underline flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{viewingProject.directorName}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 block font-bold">Production House</span>
                  <span className="text-white font-medium">{viewingProject.companyName || "Independent"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 block font-bold">Shooting Location</span>
                  <span className="text-white font-medium">{viewingProject.location || "TBD"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 block font-bold">Production Stage</span>
                  <span className="text-white font-medium">{viewingProject.productionStage}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 block font-bold">Start Date</span>
                  <span className="text-white font-medium">{viewingProject.expectedStartDate || "TBD"}</span>
                </div>
              </div>

              {/* Attached Cast Members */}
              {viewingProject.castMembers && viewingProject.castMembers.length > 0 && (
                <div className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Attached Cast ({viewingProject.castMembers.length})</span>
                    </span>
                    <span className="text-[10px] text-white/40">Click any member to inspect visual profile</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {viewingProject.castMembers.map(cast => (
                      <div
                        key={cast.id}
                        onClick={() => handleOpenMemberProfile({ 
                          professionalId: cast.professionalId, 
                          actorName: cast.actorName, 
                          role: `${cast.characterName} (${cast.roleType})` 
                        })}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 flex items-center justify-between gap-2 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={cast.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                            alt={cast.actorName}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{cast.actorName}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-white/40" />
                            </div>
                            <div className="text-[10px] text-white/60">as {cast.characterName} • {cast.roleType}</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300">
                          {cast.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attached Crew Members */}
              {viewingProject.crewMembers && viewingProject.crewMembers.length > 0 && (
                <div className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" />
                      <span>Key Technical Crew ({viewingProject.crewMembers.length})</span>
                    </span>
                    <span className="text-[10px] text-white/40">Click any crew member to view credentials</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {viewingProject.crewMembers.map(crew => (
                      <div
                        key={crew.id}
                        onClick={() => handleOpenMemberProfile({ 
                          professionalId: crew.professionalId, 
                          name: crew.name, 
                          role: `${crew.position} (${crew.craftName})` 
                        })}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 flex items-center justify-between gap-2 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={crew.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"}
                            alt={crew.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{crew.name}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-white/40" />
                            </div>
                            <div className="text-[10px] text-white/60">{crew.position} • {crew.department}</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-400/20 text-purple-300">
                          {crew.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingProject.projectDocuments && viewingProject.projectDocuments.length > 0 && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-300">
                    <FileText className="w-4 h-4" />
                    <span>Project Document / Pitch Deck Available</span>
                  </div>
                  <a
                    href={viewingProject.projectDocuments[0]}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-blue-500 text-black font-bold rounded-lg text-[10px] hover:bg-blue-400"
                  >
                    Open Document
                  </a>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
                <button
                  onClick={() => setViewingProject(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CAST & CREW PROFESSIONAL PROFILE MODAL */}
      <ProfessionalProfileModal
        isOpen={!!selectedMemberProfile}
        onClose={() => setSelectedMemberProfile(null)}
        profile={selectedMemberProfile}
        onInviteToProject={() => {}}
        onStartNegotiation={() => {}}
        currentUserEmail={userEmail}
      />

    </div>
  );
}
