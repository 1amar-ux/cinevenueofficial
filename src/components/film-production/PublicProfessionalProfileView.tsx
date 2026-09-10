import React, { useState, useEffect } from "react";
import { 
  ProfessionalProfile, 
  PortfolioItem,
  FilmProject,
  IndianCastingCall
} from "../../types/filmProductionMarketplace";
import { 
  fetchProfessionalPublicProfile,
  getProjects,
  getIndianCastingCalls
} from "../../services/filmProductionService";
import { 
  MapPin, Globe, Film, Award, Video, 
  CheckCircle2, Calendar, Star, ExternalLink, 
  Briefcase, BookOpen, Layers, Play, ShieldCheck, 
  Share2, Filter, Clock, Tag, Send, AlertCircle,
  ArrowLeft, Check, Image as ImageIcon, ShieldAlert
} from "lucide-react";
import PortfolioDetailModal from "./PortfolioDetailModal";
import InviteProfessionalModal from "./InviteProfessionalModal";
import ConsiderForCastingModal from "./ConsiderForCastingModal";
import ReportProfileModal from "./ReportProfileModal";

interface PublicProfessionalProfileViewProps {
  username?: string;
  initialProfile?: ProfessionalProfile;
  userEmail?: string | null;
  onBackToDirectory?: () => void;
  onNavigateToProposal?: (profile: ProfessionalProfile) => void;
}

export default function PublicProfessionalProfileView({
  username,
  initialProfile,
  userEmail,
  onBackToDirectory,
  onNavigateToProposal
}: PublicProfessionalProfileViewProps) {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(initialProfile || null);
  const [loading, setLoading] = useState<boolean>(!initialProfile);
  const [error, setError] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<
    "portfolio" | "videos" | "about" | "filmography" | "skills" | "experience" | "availability"
  >("portfolio");

  // Portfolio filter
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState<string>("all");

  // Modals state
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isConsiderModalOpen, setIsConsiderModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [copiedHandle, setCopiedHandle] = useState(false);

  // Production data for modals
  const [projects] = useState<FilmProject[]>(() => getProjects());
  const [castingCalls] = useState<IndianCastingCall[]>(() => getIndianCastingCalls());

  // Load profile by username if not supplied initially
  useEffect(() => {
    if (!profile && username) {
      setLoading(true);
      setError(null);
      fetchProfessionalPublicProfile(username)
        .then(data => {
          if (data) {
            setProfile(data);
          } else {
            setError(`Professional "${username}" not found or profile has been suspended.`);
          }
        })
        .catch(err => {
          console.error("Error fetching public profile:", err);
          setError("Unable to load professional profile. Please try again.");
        })
        .finally(() => setLoading(false));
    }
  }, [username, profile]);

  const handleCopyProfileLink = () => {
    const url = `${window.location.origin}/film-production/professionals/${profile?.handle || username || ""}`;
    navigator.clipboard?.writeText(url);
    setCopiedHandle(true);
    setTimeout(() => setCopiedHandle(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/60 text-sm font-bold">Loading verified professional profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">Profile Unavailable</h2>
          <p className="text-sm text-white/60 leading-relaxed">
            {error || "The requested professional profile does not exist or has been made private."}
          </p>
        </div>
        {onBackToDirectory && (
          <button
            onClick={onBackToDirectory}
            className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 mx-auto cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Discover Professionals</span>
          </button>
        )}
      </div>
    );
  }

  // Sanitized display values
  const name = profile.fullName;
  const handle = profile.handle || `@${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  const headline = profile.professionalHeadline || `${profile.primaryCraftName}`;
  const avatar = profile.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80";
  const cover = profile.coverImageUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1400&auto=format&fit=crop&q=80";
  const bio = profile.bio || "Experienced film professional registered in CineVenue Film Production.";
  const languages = profile.languages || ["Telugu", "Hindi", "English"];
  const location = profile.location || "Hyderabad, India";
  const experienceYears = profile.experienceYears || 5;
  const skills = profile.skills || [];
  const training = profile.training || [];
  const filmography = profile.filmography || [];
  const portfolio = profile.portfolio || [];
  const showreel = profile.showreelUrl;
  const availability = profile.availability || { status: "Available", notes: "Available for upcoming shoots" };

  const roles = profile.roles && profile.roles.length > 0 
    ? profile.roles 
    : [profile.primaryCraftName, ...(profile.secondaryCraftNames || [])].filter(Boolean);

  const videoItems = portfolio.filter(item => 
    item.type === "Video" || item.type === "Showreel" || item.category === "Showreel" || item.category === "Acting Clip" || item.category === "Audition Clip"
  );

  const filteredPortfolio = portfolio.filter(item => {
    if (portfolioCategoryFilter === "all") return true;
    if (portfolioCategoryFilter === "photos") return item.type === "Image";
    if (portfolioCategoryFilter === "videos") return item.type === "Video" || item.type === "Showreel";
    if (portfolioCategoryFilter === "looks") return item.category === "Character Look" || item.category === "Costume Reference";
    if (portfolioCategoryFilter === "bts") return item.category === "Behind The Scenes";
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-16 font-sans">
      
      {/* Top Navigation Bar & Action to return */}
      <div className="flex items-center justify-between gap-4">
        {onBackToDirectory && (
          <button
            onClick={onBackToDirectory}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold flex items-center gap-2 border border-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Back to Discover Professionals</span>
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleCopyProfileLink}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
            title="Share Profile Link"
          >
            {copiedHandle ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Share Profile</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-300 text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
            title="Report Profile"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report</span>
          </button>
        </div>
      </div>

      {/* 1. TOP PROFILE HERO CARD */}
      <div className="rounded-3xl bg-[#0C0D15] border border-white/10 overflow-hidden shadow-2xl">
        
        {/* Cover Image Banner */}
        <div className="relative h-48 sm:h-64 md:h-72 w-full bg-black overflow-hidden">
          <img 
            src={cover} 
            alt="Cover Banner" 
            className="w-full h-full object-cover opacity-65 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0D15] via-[#0C0D15]/40 to-transparent" />
          
          {showreel && (
            <a
              href={showreel}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-4 px-3.5 py-2 rounded-xl bg-black/70 hover:bg-black/90 backdrop-blur-md text-amber-400 hover:text-amber-300 text-xs font-black border border-amber-400/40 flex items-center gap-2 cursor-pointer transition-all shadow-lg"
            >
              <Play className="w-3.5 h-3.5 fill-amber-400" />
              <span>Watch Showreel</span>
            </a>
          )}
        </div>

        {/* Profile Details & Metadata */}
        <div className="px-6 md:px-10 pb-8 relative -mt-16 sm:-mt-20">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            
            {/* Avatar & Identifiers */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden bg-[#181926] border-4 border-[#0C0D15] shadow-2xl shrink-0">
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
                <div 
                  className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-[#0C0D15] ${
                    availability.status === "Available" ? "bg-emerald-500" : "bg-amber-500"
                  }`} 
                  title={`Status: ${availability.status}`} 
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{name}</h1>
                  {profile.verificationLevel !== "None" && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-amber-400" />
                      <span>Verified Film Professional</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400">{handle}</span>
                  <span className="text-white/30">•</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    availability.status === "Available" 
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  }`}>
                    {availability.status}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-white/80">{headline}</p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-white/60 pt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{location}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{experienceYears}+ Years Experience</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{languages.join(", ")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Production Actions (For Filmmakers & Casting Leads) */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0 w-full sm:w-auto">
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
              >
                <Film className="w-4 h-4 text-black" />
                <span>Invite to Project</span>
              </button>

              <button
                onClick={() => setIsConsiderModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
              >
                <Award className="w-4 h-4 text-purple-400" />
                <span>Consider for Casting</span>
              </button>

              <button
                onClick={() => {
                  if (onNavigateToProposal) {
                    onNavigateToProposal(profile);
                  } else {
                    window.location.href = `/film-production/proposals`;
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>Send Proposal</span>
              </button>
            </div>

          </div>

          {/* Professional Roles (Example: Actor • Model • Dancer) */}
          <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-white/40 mr-1">Professional Roles:</span>
            {roles.map((r, idx) => (
              <span 
                key={idx}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-amber-500/15 border border-purple-500/30 text-purple-200 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>{r}</span>
              </span>
            ))}
          </div>

          {/* Industry Metrics Bar (Projects | Portfolio | Videos | Roles) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div 
              onClick={() => setActiveTab("filmography")}
              className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all text-center"
            >
              <div className="text-xl font-black text-amber-400 font-mono">{filmography.length}</div>
              <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Credits & Films</div>
            </div>

            <div 
              onClick={() => setActiveTab("portfolio")}
              className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all text-center"
            >
              <div className="text-xl font-black text-purple-300 font-mono">{portfolio.length}</div>
              <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Portfolio Items</div>
            </div>

            <div 
              onClick={() => setActiveTab("videos")}
              className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all text-center"
            >
              <div className="text-xl font-black text-cyan-400 font-mono">{videoItems.length}</div>
              <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Showreels & Clips</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-xl font-black text-emerald-400 font-mono">{roles.length}</div>
              <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Active Roles</div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. NAVIGATION TABS (Portfolio | Videos | About | Filmography | Skills | Experience | Availability) */}
      <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
        {[
          { id: "portfolio", label: `Portfolio (${portfolio.length})`, icon: ImageIcon },
          { id: "videos", label: `Videos & Reels (${videoItems.length})`, icon: Video },
          { id: "about", label: "About", icon: BookOpen },
          { id: "filmography", label: `Filmography (${filmography.length})`, icon: Film },
          { id: "skills", label: `Skills (${skills.length})`, icon: Award },
          { id: "experience", label: `Experience & Training`, icon: Briefcase },
          { id: "availability", label: "Availability", icon: Calendar }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold shadow-md shadow-amber-500/20"
                  : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. DYNAMIC TAB CONTENT VIEWS */}

      {/* TAB 1: VISUAL PORTFOLIO (3-Column Grid) */}
      {activeTab === "portfolio" && (
        <div className="space-y-6">
          {/* Subcategory Filter Pill Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Items" },
                { id: "photos", label: "Photos & Stills" },
                { id: "looks", label: "Character Looks" },
                { id: "bts", label: "Behind The Scenes" },
                { id: "videos", label: "Videos" }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setPortfolioCategoryFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    portfolioCategoryFilter === f.id
                      ? "bg-amber-400 text-black"
                      : "bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-white/50">
              Showing {filteredPortfolio.length} of {portfolio.length} items
            </span>
          </div>

          {/* 3-Column Grid */}
          {filteredPortfolio.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0E0F18] border border-white/10 space-y-3">
              <ImageIcon className="w-10 h-10 text-white/30 mx-auto" />
              <p className="text-sm font-bold text-white/60">No portfolio items in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPortfolio.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedPortfolioItem(item);
                    setIsDetailModalOpen(true);
                  }}
                  className="group relative rounded-2xl overflow-hidden bg-[#11131E] border border-white/10 hover:border-amber-400/50 cursor-pointer transition-all shadow-md hover:shadow-2xl hover:-translate-y-1 flex flex-col"
                >
                  {/* Media Thumbnail */}
                  <div className="relative aspect-square w-full bg-black overflow-hidden">
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Tag Overlays */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-amber-400 text-[10px] font-black uppercase tracking-wider border border-white/10">
                        {item.category || item.type}
                      </span>
                    </div>

                    {(item.type === "Video" || item.type === "Showreel") && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-amber-500/90 text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-black ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Description Footer */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      {item.projectName && (
                        <div className="text-xs text-amber-400/80 font-medium line-clamp-1 mt-0.5">
                          🎬 {item.projectName} {item.role ? `• ${item.role}` : ""}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-white/50 pt-2 border-t border-white/5">
                      <span>{item.year || "2025"}</span>
                      <span className="text-amber-400 font-bold group-hover:underline flex items-center gap-1">
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VIDEOS & SHOWREELS */}
      {activeTab === "videos" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-amber-400" />
              <span>Showreels & Performance Footage</span>
            </h3>
            <span className="text-xs text-white/50">{videoItems.length} Videos Available</span>
          </div>

          {videoItems.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0E0F18] border border-white/10 space-y-3">
              <Video className="w-10 h-10 text-white/30 mx-auto" />
              <p className="text-sm font-bold text-white/60">No video reels uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videoItems.map((video) => (
                <div
                  key={video.id}
                  onClick={() => {
                    setSelectedPortfolioItem(video);
                    setIsDetailModalOpen(true);
                  }}
                  className="rounded-3xl bg-[#11131E] border border-white/10 overflow-hidden hover:border-amber-400/50 transition-all cursor-pointer group"
                >
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <img 
                      src={video.mediaUrl} 
                      alt={video.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-black ml-1" />
                      </div>
                    </div>
                    {video.duration && (
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 text-white text-xs font-mono font-bold">
                        {video.duration}
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                      {video.category || "Video Clip"}
                    </span>
                    <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                      {video.title}
                    </h4>
                    {video.description && (
                      <p className="text-xs text-white/60 line-clamp-2">{video.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ABOUT */}
      {activeTab === "about" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-[#0E0F18] border border-white/10 space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Professional Biography</span>
              </h3>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">{bio}</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0E0F18] border border-white/10 space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Working Languages & Locations</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-white/40 uppercase tracking-wider font-bold">Languages Fluent:</span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {languages.map((l, i) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-white font-bold">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-white/40 uppercase tracking-wider font-bold">Base Location:</span>
                  <p className="text-white font-bold mt-1 text-sm">{location}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#0E0F18] border border-white/10 space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verification Status</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-white/70">Film Production Identity</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-white/70">Work Availability</span>
                  <span className="text-amber-400 font-bold">{availability.status}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-white/70">Industry Experience</span>
                  <span className="text-white font-bold">{experienceYears} Years</span>
                </div>
              </div>
            </div>

            {/* Direct contact info note */}
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-xs text-white/70 space-y-2">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Private Direct Hiring</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Contact information is managed via official CineVenue Film Production invitations and proposals to protect creator privacy.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FILMOGRAPHY */}
      {activeTab === "filmography" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-400" />
              <span>Feature Films, Series & Credit History</span>
            </h3>
            <span className="text-xs text-white/50">{filmography.length} Verified Credits</span>
          </div>

          {filmography.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0E0F18] border border-white/10 space-y-3">
              <Film className="w-10 h-10 text-white/30 mx-auto" />
              <p className="text-sm font-bold text-white/60">No film credits added yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filmography.map((film) => (
                <div
                  key={film.id}
                  className="p-5 rounded-2xl bg-[#11131E] border border-white/10 hover:border-amber-400/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-black text-white">{film.projectTitle}</h4>
                      {film.year && (
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/60 text-[10px] font-bold">
                          {film.year}
                        </span>
                      )}
                      {film.projectType && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                          {film.projectType}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-amber-400 font-bold">{film.role}</div>
                    {film.directorOrCompany && (
                      <div className="text-xs text-white/60">
                        Production / Director: <span className="text-white/80">{film.directorOrCompany}</span>
                      </div>
                    )}
                  </div>

                  {film.language && (
                    <div className="text-xs text-white/50 font-medium">
                      Language: <span className="text-white font-bold">{film.language}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SKILLS */}
      {activeTab === "skills" && (
        <div className="p-6 rounded-3xl bg-[#0E0F18] border border-white/10 space-y-6">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Craft & Technical Skill Sets</span>
          </h3>

          {skills.length === 0 ? (
            <p className="text-xs text-white/50">No specialized skills listed.</p>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {skills.map((s, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-bold flex items-center gap-2 hover:border-amber-400/40 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: EXPERIENCE & TRAINING */}
      {activeTab === "experience" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0E0F18] border border-white/10 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span>Formal Film School & Craft Training</span>
            </h3>

            {training.length === 0 ? (
              <p className="text-xs text-white/50">No training academies listed.</p>
            ) : (
              <div className="space-y-3">
                {training.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Award className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-xs text-white/90 leading-relaxed font-medium">{t}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: AVAILABILITY */}
      {activeTab === "availability" && (
        <div className="p-6 rounded-3xl bg-[#0E0F18] border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Production Availability & Booking</span>
            </h3>
            <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
              availability.status === "Available"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
            }`}>
              {availability.status}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs">
            <div className="text-white/50 font-bold uppercase tracking-wider">Availability Note:</div>
            <p className="text-white/90 leading-relaxed font-medium">
              {availability.notes || "Open for new feature film productions, web series, and casting auditions."}
            </p>
          </div>

          {/* Call to Action Bar */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-black text-white">Looking to cast or hire {name}?</h4>
              <p className="text-xs text-white/60 mt-0.5">Send a project invitation or casting shortlist directly.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs cursor-pointer"
              >
                Invite to Project
              </button>
              <button
                onClick={() => setIsConsiderModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold text-xs cursor-pointer"
              >
                Consider for Casting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODALS */}

      {/* Media Detail & Lightbox Viewer Modal */}
      <PortfolioDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPortfolioItem(null);
        }}
        item={selectedPortfolioItem}
      />

      {/* Invite to Project Modal */}
      <InviteProfessionalModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        professional={profile}
        projects={projects}
        userEmail={userEmail}
        onInviteSent={() => {
          // Toast or notice handled in modal
        }}
      />

      {/* Consider for Casting Modal */}
      <ConsiderForCastingModal
        isOpen={isConsiderModalOpen}
        onClose={() => setIsConsiderModalOpen(false)}
        professional={profile}
        castingCalls={castingCalls}
        userEmail={userEmail}
      />

      {/* Safety & Report Profile Modal */}
      <ReportProfileModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        professional={profile}
        reporterEmail={userEmail}
      />

    </div>
  );
}
