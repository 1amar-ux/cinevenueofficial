import React, { useState } from "react";
import { 
  X, Search, Filter, ShieldCheck, Eye, Edit3, Send, CheckCircle2, 
  Clock, AlertCircle, Sparkles, User, Mail, Phone, Calendar, FileText, 
  Archive, Lock, ChevronDown, Check, Plus, MessageSquare, Download, Film,
  LayoutDashboard, Megaphone, Handshake, DollarSign, Award, ArrowUpRight,
  ChevronRight, RefreshCw, Layers, Star, Clapperboard, Video, Music, Camera,
  MapPin, Settings, Globe, Shield, Bell, Trash2, EyeOff, Play, Users, BarChart3
} from "lucide-react";

import { 
  FilmProjectApplication, 
  FilmApplicationStatus, 
  ApplicationProjectType,
  ProductionProject,
  CastingCall,
  BehindTheScenesItem,
  NewsArticle,
  BrandCampaignRequest,
  EventManagementRequest,
  PartnerEnquiry,
  StorySubmission,
  PublicEvent,
  ArtistRequest,
  SponsorshipRequest,
  EventPortfolioItem,
  PromotionCampaign
} from "../../types/productions";

import EventManagementAdminPanel from "./EventManagementAdminPanel";
import MediaPromotionsAdminPanel from "./MediaPromotionsAdminPanel";

interface CineVenueProductionsAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  applications: FilmProjectApplication[];
  onUpdateApplication: (app: FilmProjectApplication) => void;
  projects: ProductionProject[];
  onUpdateProjects: (projects: ProductionProject[]) => void;
  castingCalls: CastingCall[];
  onUpdateCastingCalls: (calls: CastingCall[]) => void;
  newsArticles: NewsArticle[];
  onUpdateNewsArticles: (articles: NewsArticle[]) => void;
  btsItems: BehindTheScenesItem[];
  onUpdateBtsItems: (items: BehindTheScenesItem[]) => void;
  brandCampaigns: BrandCampaignRequest[];
  onUpdateBrandCampaigns: (campaigns: BrandCampaignRequest[]) => void;
  partnerEnquiries: PartnerEnquiry[];
  onUpdatePartnerEnquiries: (enquiries: PartnerEnquiry[]) => void;
  // Optional Event & Media Admin Props with Defaults
  eventRequests?: EventManagementRequest[];
  onUpdateEventRequests?: (requests: EventManagementRequest[]) => void;
  publicEvents?: PublicEvent[];
  onUpdatePublicEvents?: (events: PublicEvent[]) => void;
  artistRequests?: ArtistRequest[];
  onUpdateArtistRequests?: (requests: ArtistRequest[]) => void;
  sponsorshipRequests?: SponsorshipRequest[];
  onUpdateSponsorshipRequests?: (requests: SponsorshipRequest[]) => void;
  eventPortfolio?: EventPortfolioItem[];
  onUpdateEventPortfolio?: (items: EventPortfolioItem[]) => void;
  promotionCampaigns?: PromotionCampaign[];
  onUpdatePromotionCampaigns?: (campaigns: PromotionCampaign[]) => void;
}

type TabType = 
  | "overview" 
  | "applications" 
  | "projects" 
  | "casting" 
  | "investor_pitch" 
  | "brand_promotions" 
  | "event_production" 
  | "content_news" 
  | "team" 
  | "analytics"
  | "notifications";

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

export default function CineVenueProductionsAdminPanel({
  isOpen,
  onClose,
  applications,
  onUpdateApplication,
  projects,
  onUpdateProjects,
  castingCalls,
  onUpdateCastingCalls,
  newsArticles,
  onUpdateNewsArticles,
  btsItems,
  onUpdateBtsItems,
  brandCampaigns,
  onUpdateBrandCampaigns,
  partnerEnquiries,
  onUpdatePartnerEnquiries,
  eventRequests = [],
  onUpdateEventRequests = () => {},
  publicEvents = [],
  onUpdatePublicEvents = () => {},
  artistRequests = [],
  onUpdateArtistRequests = () => {},
  sponsorshipRequests = [],
  onUpdateSponsorshipRequests = () => {},
  eventPortfolio = [],
  onUpdateEventPortfolio = () => {},
  promotionCampaigns = [],
  onUpdatePromotionCampaigns = () => {}
}: CineVenueProductionsAdminPanelProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [showArchived, setShowArchived] = useState(false);

  // Active modal details
  const [activeApp, setActiveApp] = useState<FilmProjectApplication | null>(null);

  // Editable Form State in Detail View for Applications
  const [editingStatus, setEditingStatus] = useState<FilmApplicationStatus>("Submitted");
  const [editingNotes, setEditingNotes] = useState("");
  const [editingReviewer, setEditingReviewer] = useState("");
  const [editingFollowUp, setEditingFollowUp] = useState("");
  const [requestInfoText, setRequestInfoText] = useState("");
  const [isRequestingInfoOpen, setIsRequestingInfoOpen] = useState(false);

  // New Item Modals State
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState<Partial<ProductionProject>>({
    title: "",
    tagline: "",
    category: "Feature Film",
    genre: ["Action", "Drama"],
    language: "Telugu",
    status: "Pre-Production",
    director: "",
    leadCast: [],
    producer: "CineVenue Productions",
    bannerImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1200",
    posterImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800",
    description: "",
    synopsis: "",
    budgetRange: "₹5 Crore - ₹15 Crore",
    followersCount: 120
  });

  const [isAddCastingOpen, setIsAddCastingOpen] = useState(false);
  const [newCastingForm, setNewCastingForm] = useState<Partial<CastingCall>>({
    projectTitle: "New CineVenue Production",
    roleTitle: "",
    category: "Lead Actor",
    ageRange: "20-30",
    gender: "Any",
    location: "Hyderabad",
    language: "Telugu",
    skillsRequired: ["Dialogue Delivery", "Screen Presence"],
    experienceRequirement: "Freshers & Experienced",
    deadline: "2026-12-31",
    description: "",
    auditionDetails: "Upload 1-min self-tape video monologues via CineVenue Talent Portal.",
    status: "Open"
  });

  const [isAddNewsOpen, setIsAddNewsOpen] = useState(false);
  const [newNewsForm, setNewNewsForm] = useState<Partial<NewsArticle>>({
    title: "",
    category: "Movie Announcement",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800",
    date: new Date().toISOString().split("T")[0],
    author: "CineVenue Editorial Board",
    summary: "",
    content: "",
    tags: ["CineVenue", "Production"]
  });

  // Website Draft / Preview Mode Toggle
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

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

    return matchesSearch && matchesStatus && matchesType;
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

  const handleCreateProject = () => {
    if (!newProjectForm.title) return alert("Please enter project title.");
    const newProj: ProductionProject = {
      id: `PROD-00${projects.length + 1}`,
      title: newProjectForm.title || "Untitled Project",
      tagline: newProjectForm.tagline || "A CineVenue Original",
      category: newProjectForm.category as any || "Feature Film",
      genre: newProjectForm.genre || ["Drama"],
      language: newProjectForm.language || "Telugu",
      status: newProjectForm.status as any || "Pre-Production",
      director: newProjectForm.director || "To be announced",
      leadCast: ["To be casted"],
      producer: newProjectForm.producer || "CineVenue Productions",
      bannerImage: newProjectForm.bannerImage!,
      posterImage: newProjectForm.posterImage!,
      description: newProjectForm.description || "",
      synopsis: newProjectForm.synopsis || "",
      budgetRange: newProjectForm.budgetRange,
      cast: [],
      crew: [],
      media: [],
      updates: [],
      followersCount: 150
    };

    onUpdateProjects([newProj, ...projects]);
    setIsAddProjectOpen(false);
    alert("🎉 New Production Project added to portfolio!");
  };

  const handleCreateCasting = () => {
    if (!newCastingForm.roleTitle) return alert("Please enter role title.");
    const newCall: CastingCall = {
      id: `CAST-00${castingCalls.length + 1}`,
      projectId: "PROD-001",
      projectTitle: newCastingForm.projectTitle || "CineVenue Original",
      roleTitle: newCastingForm.roleTitle || "Lead Actor",
      category: newCastingForm.category as any || "Lead Actor",
      ageRange: newCastingForm.ageRange || "20-30",
      gender: newCastingForm.gender as any || "Any",
      location: newCastingForm.location || "Hyderabad",
      language: newCastingForm.language || "Telugu",
      skillsRequired: newCastingForm.skillsRequired || [],
      experienceRequirement: newCastingForm.experienceRequirement || "Freshers Welcome",
      deadline: newCastingForm.deadline || "2026-12-31",
      description: newCastingForm.description || "",
      auditionDetails: newCastingForm.auditionDetails || "",
      status: "Open",
      postedDate: new Date().toISOString().split("T")[0]
    };

    onUpdateCastingCalls([newCall, ...castingCalls]);
    setIsAddCastingOpen(false);
    alert("🎭 Casting call published!");
  };

  const handleCreateNews = () => {
    if (!newNewsForm.title) return alert("Please enter title.");
    const article: NewsArticle = {
      id: `NEWS-00${newsArticles.length + 1}`,
      title: newNewsForm.title || "Production Update",
      category: newNewsForm.category as any || "Movie Announcement",
      image: newNewsForm.image!,
      date: newNewsForm.date || new Date().toISOString().split("T")[0],
      author: newNewsForm.author || "CineVenue Productions",
      summary: newNewsForm.summary || "",
      content: newNewsForm.content || "",
      tags: newNewsForm.tags || ["CineVenue"]
    };

    onUpdateNewsArticles([article, ...newsArticles]);
    setIsAddNewsOpen(false);
    alert("📰 Production News Article published!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-2xl overflow-hidden font-sans">
      <div className="relative w-full max-w-7xl h-[95vh] bg-[#0A0B0E] border border-gold/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* TOP BAR BRANDING & CMS CONTROLS */}
        <header className="bg-[#101117] border-b border-white/10 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-gold to-yellow-400 p-0.5 flex items-center justify-center shadow-lg shadow-gold/20">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                <Clapperboard className="w-5 h-5 text-gold" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20 font-mono">
                  EXECUTIVE SUITE
                </span>
                <span className="text-xs text-white/40">• CineVenue Productions Central Command</span>
              </div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                Film Production & Studio Management System
              </h2>
            </div>
          </div>

          {/* DRAFT / PREVIEW & ACTION HEADER BUTTONS */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-black/60 border border-white/10 p-1 rounded-xl">
              <button
                onClick={() => {
                  setIsPreviewMode(false);
                  alert("Switched to Production Edit Mode.");
                }}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  !isPreviewMode ? "bg-amber-500 text-black shadow" : "text-white/60 hover:text-white"
                }`}
              >
                Edit Mode
              </button>
              <button
                onClick={() => {
                  setIsPreviewMode(true);
                  alert("Live Preview Mode Active: Viewing updates before publishing.");
                }}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isPreviewMode ? "bg-emerald-500 text-black shadow" : "text-white/60 hover:text-white"
                }`}
              >
                Live Preview
              </button>
            </div>

            <button
              onClick={() => {
                setIsPublished(true);
                alert("🚀 All Production CMS Changes Published Live to CineVenue Website!");
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-gold text-black font-extrabold text-[11px] uppercase tracking-wider rounded-xl hover:opacity-90 transition-all shadow-lg cursor-pointer flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Publish Live</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Close Admin Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* MAIN BODY LAYOUT: SIDEBAR NAVIGATION + CONTENT AREA */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* SIDEBAR NAVIGATION */}
          <aside className="w-64 bg-[#0E0F14] border-r border-white/10 p-4 space-y-1 overflow-y-auto shrink-0 hidden md:block select-none">
            
            <div className="px-3 py-2 text-[10px] font-bold text-gold uppercase tracking-[0.2em]">
              Core Modules
            </div>

            {[
              { id: "overview", label: "Executive Overview", icon: LayoutDashboard, badge: null },
              { id: "applications", label: "Film Applications", icon: FileText, badge: applications.length },
              { id: "projects", label: "Production Portfolio", icon: Film, badge: projects.length },
              { id: "casting", label: "Casting & Auditions", icon: Users, badge: castingCalls.length },
              { id: "investor_pitch", label: "Investor Pitching", icon: DollarSign, badge: partnerEnquiries.length },
              { id: "brand_promotions", label: "Brand Promotions", icon: Megaphone, badge: brandCampaigns.length },
              { id: "event_production", label: "Event Production", icon: Calendar, badge: null },
              { id: "content_news", label: "Content & BTS", icon: Video, badge: newsArticles.length },
              { id: "team", label: "Executive Board & Crew", icon: ShieldCheck, badge: null },
              { id: "analytics", label: "Deal Funnel & Stats", icon: BarChart3, badge: null }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isActive 
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/5" 
                      : "bg-transparent border-transparent text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-white/40"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? "bg-amber-500 text-black" : "bg-white/10 text-white/70"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </aside>

          {/* MAIN CONTENT WORKSPACE */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#08090C] text-xs space-y-6">
            
            {/* MOBILE NAVIGATION TABS SELECTOR */}
            <div className="md:hidden">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as TabType)}
                className="w-full bg-[#12131A] border border-gold/30 rounded-xl px-4 py-2.5 text-white text-xs font-bold outline-none focus:border-gold cursor-pointer"
              >
                <option value="overview">📊 Executive Overview</option>
                <option value="applications">📝 Film Project Applications ({applications.length})</option>
                <option value="projects">🎞️ Production Portfolio ({projects.length})</option>
                <option value="casting">🎭 Casting & Auditions ({castingCalls.length})</option>
                <option value="investor_pitch">💼 Investor Pitching & Funding</option>
                <option value="brand_promotions">📢 Brand Promotions & Ads</option>
                <option value="event_production">🎪 Event Production</option>
                <option value="content_news">📰 Content & News ({newsArticles.length})</option>
                <option value="team">👥 Executive Board & Crew</option>
                <option value="analytics">📈 Analytics & Insights</option>
              </select>
            </div>

            {/* TAB 1: EXECUTIVE OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#11121A] border border-white/10 rounded-2xl p-5 space-y-2">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Project Submissions</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-mono font-bold text-white">{applications.length}</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Active NDA Pipeline
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40">From Writers, Directors & Production Houses</p>
                  </div>

                  <div className="bg-[#11121A] border border-white/10 rounded-2xl p-5 space-y-2">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Active Studio Portfolio</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-mono font-bold text-amber-400">{projects.length}</span>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Pan-Indian Slate
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40">Feature Films, Web Series & Short Films</p>
                  </div>

                  <div className="bg-[#11121A] border border-white/10 rounded-2xl p-5 space-y-2">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Casting Openings</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-mono font-bold text-purple-400">{castingCalls.length}</span>
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        Open Auditions
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40">Lead Roles, Supporting & Technical Crew</p>
                  </div>

                  <div className="bg-[#11121A] border border-white/10 rounded-2xl p-5 space-y-2">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Brand Sponsorships</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-mono font-bold text-emerald-400">{brandCampaigns.length}</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        In-Film Placement
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40">Active Campaigns & Corporate Deals</p>
                  </div>
                </div>

                {/* Quick Action Hub & Pipeline Snapshot */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Recent Applications */}
                  <div className="lg:col-span-2 bg-[#11121A] border border-white/10 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gold" /> Recent Film Submissions
                      </h3>
                      <button
                        onClick={() => setActiveTab("applications")}
                        className="text-xs text-amber-400 hover:underline font-bold"
                      >
                        View All ({applications.length}) →
                      </button>
                    </div>

                    <div className="space-y-2">
                      {applications.slice(0, 4).map(app => (
                        <div key={app.id} className="p-3 bg-black/50 border border-white/5 rounded-xl flex items-center justify-between hover:border-gold/30 transition-all">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-amber-400 font-bold">{app.id}</span>
                              <span className="font-bold text-white">{app.projectTitle}</span>
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[9px]">
                                {app.projectType}
                              </span>
                            </div>
                            <p className="text-[10px] text-white/50 mt-0.5">By {app.fullName} ({app.professionalRole}) • {app.submittedAt}</p>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab("applications");
                              openAppDetails(app);
                            }}
                            className="px-3 py-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-black font-bold rounded-lg transition-all"
                          >
                            Review
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Quick Studio Actions */}
                  <div className="bg-[#11121A] border border-white/10 rounded-2xl p-5 space-y-4">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
                      <Sparkles className="w-4 h-4 text-gold" /> Studio Quick Controls
                    </h3>

                    <div className="space-y-2.5">
                      <button
                        onClick={() => setIsAddProjectOpen(true)}
                        className="w-full p-3 bg-gradient-to-r from-amber-500 to-gold text-black font-extrabold rounded-xl hover:opacity-90 transition-all flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Plus className="w-4 h-4" /> Add Production Project
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setIsAddCastingOpen(true)}
                        className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-400" /> Post Casting Notice
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/40" />
                      </button>

                      <button
                        onClick={() => setIsAddNewsOpen(true)}
                        className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-emerald-400" /> Publish Press Release / News
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/40" />
                      </button>
                    </div>

                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-amber-400 uppercase block">CineVenue Production Guarantee</span>
                      <p className="text-[11px] text-white/70 leading-relaxed">
                        All project pitches and scripts submitted are strictly timestamped and protected under full NDA non-disclosure covenants.
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: FILM PROJECT APPLICATIONS */}
            {activeTab === "applications" && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Search & Filter Bar */}
                <div className="bg-[#11121A] p-4 rounded-xl border border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="relative md:col-span-2">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title, applicant name, ID..."
                      className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <button
                    type="button"
                    onClick={() => setShowArchived(!showArchived)}
                    className={`py-2 rounded-xl font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      showArchived ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>{showArchived ? "Archived Items" : "View Archive"}</span>
                  </button>
                </div>

                {/* Submissions Table */}
                <div className="bg-[#11121A] border border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <span className="font-bold text-white text-xs uppercase tracking-wider">
                      Submitted Film Projects ({filteredApps.length})
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Confidential NDA Restricted
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-black/50 text-white/50 uppercase text-[10px] font-bold border-b border-white/10">
                        <tr>
                          <th className="p-3.5">ID & Project Title</th>
                          <th className="p-3.5">Applicant</th>
                          <th className="p-3.5">Format & Language</th>
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
                </div>

              </div>
            )}

            {/* TAB 3: PRODUCTION PORTFOLIO */}
            {activeTab === "projects" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                    CineVenue Studio Projects ({projects.length})
                  </h3>
                  <button
                    onClick={() => setIsAddProjectOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-gold text-black font-extrabold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add New Project
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map(p => (
                    <div key={p.id} className="bg-[#11121A] border border-white/10 hover:border-gold/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group">
                      <div>
                        <div className="relative h-48 overflow-hidden">
                          <img src={p.bannerImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#11121A] via-transparent to-transparent" />
                          <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/80 backdrop-blur-md text-amber-400 border border-amber-500/30 font-mono font-bold text-[10px] rounded">
                            {p.id}
                          </span>
                          <span className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500 text-black font-extrabold text-[10px] rounded uppercase">
                            {p.status}
                          </span>
                        </div>

                        <div className="p-5 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                              {p.category}
                            </span>
                            <span className="text-[10px] text-white/50">{p.language}</span>
                          </div>
                          <h4 className="font-serif font-bold text-white text-lg">{p.title}</h4>
                          <p className="text-white/60 text-xs italic font-serif">"{p.tagline}"</p>
                          <p className="text-white/50 text-xs line-clamp-2">{p.synopsis}</p>
                          <div className="pt-2 border-t border-white/10 text-[11px] text-white/70 space-y-1">
                            <p><strong>Director:</strong> {p.director}</p>
                            <p><strong>Budget:</strong> {p.budgetRange}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 border-t border-white/10 bg-black/30 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-white/40">{p.followersCount} Watchlist Followers</span>
                        <button
                          onClick={() => alert(`Editing project ${p.title}`)}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg cursor-pointer"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: CASTING & AUDITIONS */}
            {activeTab === "casting" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                    Active Casting Notices ({castingCalls.length})
                  </h3>
                  <button
                    onClick={() => setIsAddCastingOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-gold text-black font-extrabold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Post Casting Notice
                  </button>
                </div>

                <div className="space-y-4">
                  {castingCalls.map(c => (
                    <div key={c.id} className="bg-[#11121A] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-purple-400 font-bold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                            {c.id}
                          </span>
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 font-bold text-[10px] rounded uppercase">
                            {c.category}
                          </span>
                          <span className="text-[10px] text-white/50">Deadline: {c.deadline}</span>
                        </div>
                        <h4 className="font-serif font-bold text-white text-base">{c.roleTitle}</h4>
                        <p className="text-white/70 text-xs">Project: <strong>{c.projectTitle}</strong> • Age: {c.ageRange} • Gender: {c.gender}</p>
                        <p className="text-white/50 text-xs">{c.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => alert(`Reviewing auditions for ${c.roleTitle}`)}
                          className="px-4 py-2 bg-purple-500 text-white font-bold rounded-xl cursor-pointer"
                        >
                          View Applicants
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: INVESTOR PITCHING */}
            {activeTab === "investor_pitch" && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-[#11121A] border border-white/10 rounded-2xl p-5 space-y-4">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" /> Co-Production & Investor Enquiries ({partnerEnquiries.length})
                  </h3>
                  <p className="text-white/60 text-xs">
                    Inquiries received from producers, co-investors, distributors, and corporate funding partners.
                  </p>

                  {partnerEnquiries.length === 0 ? (
                    <div className="py-12 text-center text-white/40">
                      No active investor partner enquiries recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {partnerEnquiries.map(p => (
                        <div key={p.id} className="p-4 bg-black/50 border border-white/5 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{p.fullName} ({p.category})</span>
                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold">
                              {p.status}
                            </span>
                          </div>
                          <p className="text-white/70">{p.message}</p>
                          <div className="flex items-center gap-4 text-white/50 text-[10px]">
                            <span>Email: {p.email}</span>
                            <span>Phone: {p.phone}</span>
                            <span>City: {p.city}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: BRAND PROMOTIONS */}
            {activeTab === "brand_promotions" && (
              <div className="space-y-6 animate-fade-in">
                <MediaPromotionsAdminPanel
                  campaigns={promotionCampaigns}
                  onUpdateCampaigns={onUpdatePromotionCampaigns}
                  brandRequests={brandCampaigns}
                  onUpdateBrandRequests={onUpdateBrandCampaigns}
                />
              </div>
            )}

            {/* TAB 7: EVENT PRODUCTION */}
            {activeTab === "event_production" && (
              <div className="space-y-6 animate-fade-in">
                <EventManagementAdminPanel
                  eventRequests={eventRequests}
                  onUpdateEventRequests={onUpdateEventRequests}
                  publicEvents={publicEvents}
                  onUpdatePublicEvents={onUpdatePublicEvents}
                  artistRequests={artistRequests}
                  onUpdateArtistRequests={onUpdateArtistRequests}
                  sponsorshipRequests={sponsorshipRequests}
                  onUpdateSponsorshipRequests={onUpdateSponsorshipRequests}
                  portfolioItems={eventPortfolio}
                  onUpdatePortfolioItems={onUpdateEventPortfolio}
                />
              </div>
            )}

            {/* TAB 8: CONTENT & NEWS */}
            {activeTab === "content_news" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                    Published News & Press Releases ({newsArticles.length})
                  </h3>
                  <button
                    onClick={() => setIsAddNewsOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-gold text-black font-extrabold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Article
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {newsArticles.map(n => (
                    <div key={n.id} className="bg-[#11121A] border border-white/10 rounded-2xl p-4 flex gap-4">
                      <img src={n.image} alt={n.title} className="w-24 h-24 object-cover rounded-xl shrink-0" />
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-400 uppercase">{n.category}</span>
                        <h4 className="font-serif font-bold text-white text-sm line-clamp-2">{n.title}</h4>
                        <p className="text-white/50 text-[11px]">{n.date} • By {n.author}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 9: TEAM & BOARD */}
            {activeTab === "team" && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gold" /> Executive Board & Script Reading Panel
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {REVIEWERS.map((r, i) => (
                      <div key={i} className="p-4 bg-black/50 border border-white/5 rounded-xl space-y-1">
                        <span className="font-bold text-white text-sm">{r}</span>
                        <p className="text-white/50 text-[10px]">CineVenue Script Evaluation Committee</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 10: ANALYTICS */}
            {activeTab === "analytics" && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gold" /> CineVenue Production Deal Analytics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-5 bg-black/50 border border-white/5 rounded-xl">
                      <span className="text-2xl font-mono font-bold text-amber-400">82%</span>
                      <p className="text-white/50 text-xs mt-1">Telugu Feature Submissions</p>
                    </div>
                    <div className="p-5 bg-black/50 border border-white/5 rounded-xl">
                      <span className="text-2xl font-mono font-bold text-emerald-400">14 Days</span>
                      <p className="text-white/50 text-xs mt-1">Average Review Turnaround</p>
                    </div>
                    <div className="p-5 bg-black/50 border border-white/5 rounded-xl">
                      <span className="text-2xl font-mono font-bold text-purple-400">₹45 Crore</span>
                      <p className="text-white/50 text-xs mt-1">Active Slate Capitalization</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>

      </div>

      {/* APPLICATION DETAIL MODAL */}
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

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              
              {/* Action Bar */}
              <div className="bg-[#161722] border border-amber-500/30 p-4 rounded-xl space-y-3">
                <h4 className="font-bold text-amber-400 uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4" /> Admin Review Controls
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
                    <label className="block text-white/70 font-semibold mb-1">Assigned Board Panel</label>
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

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Internal Review Notes (Confidential)</label>
                  <textarea
                    rows={3}
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Enter confidential board notes..."
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

            </div>

            {/* Modal Footer */}
            <div className="bg-[#12131A] border-t border-white/10 px-6 py-3 flex justify-end">
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

      {/* ADD PROJECT MODAL */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-[#0C0D11] border border-amber-500/40 rounded-2xl p-6 max-w-lg w-full space-y-4">
            <h3 className="font-serif font-bold text-white text-lg">Add New Production Project</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Project Title"
                value={newProjectForm.title}
                onChange={e => setNewProjectForm({ ...newProjectForm, title: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white"
              />
              <input
                type="text"
                placeholder="Tagline"
                value={newProjectForm.tagline}
                onChange={e => setNewProjectForm({ ...newProjectForm, tagline: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white"
              />
              <input
                type="text"
                placeholder="Director"
                value={newProjectForm.director}
                onChange={e => setNewProjectForm({ ...newProjectForm, director: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white"
              />
              <textarea
                placeholder="Synopsis"
                value={newProjectForm.synopsis}
                onChange={e => setNewProjectForm({ ...newProjectForm, synopsis: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsAddProjectOpen(false)} className="px-4 py-2 bg-white/10 text-white rounded-xl">Cancel</button>
              <button onClick={handleCreateProject} className="px-5 py-2 bg-gold text-black font-bold rounded-xl">Create Project</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CASTING MODAL */}
      {isAddCastingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-[#0C0D11] border border-purple-500/40 rounded-2xl p-6 max-w-lg w-full space-y-4">
            <h3 className="font-serif font-bold text-white text-lg">Post New Casting Notice</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Role Title (e.g. Lead Antagonist)"
                value={newCastingForm.roleTitle}
                onChange={e => setNewCastingForm({ ...newCastingForm, roleTitle: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white"
              />
              <input
                type="text"
                placeholder="Age Range (e.g. 24 - 32)"
                value={newCastingForm.ageRange}
                onChange={e => setNewCastingForm({ ...newCastingForm, ageRange: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white"
              />
              <textarea
                placeholder="Role Description"
                value={newCastingForm.description}
                onChange={e => setNewCastingForm({ ...newCastingForm, description: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsAddCastingOpen(false)} className="px-4 py-2 bg-white/10 text-white rounded-xl">Cancel</button>
              <button onClick={handleCreateCasting} className="px-5 py-2 bg-purple-500 text-white font-bold rounded-xl">Publish Notice</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEWS MODAL */}
      {isAddNewsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-[#0C0D11] border border-emerald-500/40 rounded-2xl p-6 max-w-lg w-full space-y-4">
            <h3 className="font-serif font-bold text-white text-lg">Publish News / Press Release</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Headline"
                value={newNewsForm.title}
                onChange={e => setNewNewsForm({ ...newNewsForm, title: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white"
              />
              <textarea
                placeholder="Summary"
                value={newNewsForm.summary}
                onChange={e => setNewNewsForm({ ...newNewsForm, summary: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsAddNewsOpen(false)} className="px-4 py-2 bg-white/10 text-white rounded-xl">Cancel</button>
              <button onClick={handleCreateNews} className="px-5 py-2 bg-emerald-500 text-black font-bold rounded-xl">Publish News</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
