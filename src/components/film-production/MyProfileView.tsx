import React, { useState } from "react";
import { 
  ProfessionalProfile, 
  PortfolioItem,
  FilmographyCredit,
  ProfilePrivacySettings
} from "../../types/filmProductionMarketplace";
import { 
  User, MapPin, Globe, Film, Award, Video, 
  Edit3, CheckCircle2, Calendar, Star, ExternalLink, 
  Briefcase, Sparkles, BookOpen, Layers, Plus, 
  Play, ShieldCheck, Eye, EyeOff, Lock, Share2, 
  Filter, Clock, Tag, Trash2, Send, MessageSquare,
  Check, ArrowRight, Image as ImageIcon
} from "lucide-react";
import PortfolioDetailModal from "./PortfolioDetailModal";
import AddPortfolioItemModal from "./AddPortfolioItemModal";
import ProfilePrivacyModal from "./ProfilePrivacyModal";

interface MyProfileViewProps {
  profile?: ProfessionalProfile;
  userEmail?: string | null;
  onOpenEditModal: () => void;
  onInviteToProject?: (profile: ProfessionalProfile) => void;
  onConsiderForCasting?: (profile: ProfessionalProfile) => void;
  onSendProposal?: (profile: ProfessionalProfile) => void;
  onDiscoverProfessionals?: () => void;
  isPublicView?: boolean;
}

export default function MyProfileView({
  profile,
  userEmail,
  onOpenEditModal,
  onInviteToProject,
  onConsiderForCasting,
  onSendProposal,
  onDiscoverProfessionals,
  isPublicView = false
}: MyProfileViewProps) {
  // Navigation tabs inside the visual profile dashboard
  const [activeTab, setActiveTab] = useState<
    "portfolio" | "videos" | "about" | "filmography" | "skills" | "experience" | "availability"
  >("portfolio");

  // Portfolio filter
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState<string>("all");

  // Modals state
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddPortfolioModalOpen, setIsAddPortfolioModalOpen] = useState(false);
  const [addPortfolioDefaultType, setAddPortfolioDefaultType] = useState<"Image" | "Video" | "Showreel">("Image");
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [previewAsPublic, setPreviewAsPublic] = useState(isPublicView);
  const [copiedHandle, setCopiedHandle] = useState(false);

  // Local state for portfolio items for immediate updates
  const [localPortfolio, setLocalPortfolio] = useState<PortfolioItem[]>(() => profile?.portfolio || [
    {
      id: "port-demo-1",
      title: "Hero Character Look – Kingdom Period Drama",
      type: "Image",
      category: "Character Look",
      mediaUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop&q=80",
      role: "Lead Warrior (Commander Deva)",
      year: 2025,
      projectType: "Feature Film",
      projectName: "Mahasenani",
      credits: "Director: S.S. Rajamouli • Look Designer: Rama Rajamouli",
      description: "Authentic historical armour look test shot on ARRI Alexa LF with natural sunset lighting."
    },
    {
      id: "port-demo-2",
      title: "2026 Dramatic Monologue & Screenplay Acting Reel",
      type: "Showreel",
      category: "Showreel",
      mediaUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900&auto=format&fit=crop&q=80",
      role: "Lead Actor",
      year: 2026,
      projectType: "Feature Film",
      duration: "03:15",
      credits: "Edited by: Kotagiri Venkateswara Rao",
      description: "Compilation of emotional confrontation scenes, intensity dialogue delivery, and physical action sequences."
    },
    {
      id: "port-demo-3",
      title: "Behind-The-Scenes – High Altitude Action Sequence",
      type: "Image",
      category: "Behind The Scenes",
      mediaUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=900&auto=format&fit=crop&q=80",
      role: "Action Choreographer & Lead Performer",
      year: 2025,
      projectType: "Feature Film",
      projectName: "Vayu 2800",
      credits: "Stunt Master: Peter Hein",
      description: "Practical mountain rope stunts captured on location in Leh Ladakh."
    },
    {
      id: "port-demo-4",
      title: "Costume & Wardrobe Reference – Modern Neo-Noir Detective",
      type: "Image",
      category: "Costume Reference",
      mediaUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&auto=format&fit=crop&q=80",
      role: "Investigator Kabir",
      year: 2024,
      projectType: "Web Series",
      projectName: "Shadows of Deccan",
      credits: "Costume Stylist: Sheetal Sharma",
      description: "Trench coat, weathered leather, and muted tone look approved for 8-episode thriller."
    },
    {
      id: "port-demo-5",
      title: "Physical Action & Stunt Performance Clip",
      type: "Video",
      category: "Acting Clip",
      mediaUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80",
      role: "Special Ops Agent",
      year: 2024,
      projectType: "Feature Film",
      duration: "01:45",
      credits: "Action Director: Sunil Rodrigues",
      description: "Hand-to-hand tactical combat scene recorded during screen rehearsal."
    },
    {
      id: "port-demo-6",
      title: "Studio Headshots – 4 Expressions Portfolio",
      type: "Image",
      category: "Professional Photo",
      mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80",
      role: "Model / Actor",
      year: 2026,
      projectType: "Portfolio",
      description: "Clean theatrical headshots captured by leading Mumbai celebrity portrait photographer."
    }
  ]);

  const name = profile?.fullName || (userEmail ? userEmail.split("@")[0] : "Siddharth Roy");
  const handle = profile?.handle || `@${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  const headline = profile?.professionalHeadline || "Actor • Director • Screenwriter";
  const avatar = profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80";
  const cover = profile?.coverImageUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1400&auto=format&fit=crop&q=80";
  const bio = profile?.bio || "Experienced multi-disciplinary film professional with lead credits across Pan-Indian feature cinema and premium OTT series. Method acting graduate trained in multi-camera direction, action choreography, and classical voice modulation.";
  const languages = profile?.languages || ["Telugu", "Hindi", "English", "Tamil"];
  const location = profile?.location || "Hyderabad, Telangana, India";
  const experienceYears = profile?.experienceYears || 6;
  const skills = profile?.skills || ["Method Acting", "Scene Breakdown", "Multi-Camera Direction", "Dialogue Delivery", "Martial Arts / Stunts", "Voice Modulation", "Screenwriting"];
  const training = profile?.training || [
    "Film and Television Institute of India (FTII Pune) – Screen Acting Intensive (2020)",
    "Barry John Acting Studio – Advanced Theatrical Performance (2018)",
    "Kalaripayattu Martial Arts & Physical Stunt Training, Kerala (2022)"
  ];
  const filmography = profile?.filmography || [
    {
      id: "film-1",
      projectTitle: "Mahasenani (Period Epic)",
      role: "Commander Deva (Lead Actor)",
      craft: "Cast & Performance",
      year: 2025,
      language: "Telugu / Pan-India",
      projectType: "Feature Film",
      directorOrCompany: "Arka Media Works / S.S. Rajamouli"
    },
    {
      id: "film-2",
      projectTitle: "Shadows of Deccan (Crime Thriller)",
      role: "Investigator Kabir (Lead Actor & Co-Writer)",
      craft: "Cast & Writing",
      year: 2024,
      language: "Telugu / Hindi",
      projectType: "Web Series (SonyLIV)",
      directorOrCompany: "Banners Motion Pictures"
    },
    {
      id: "film-3",
      projectTitle: "Echoes of Godavari",
      role: "Associate Director",
      craft: "Direction & Writing",
      year: 2023,
      language: "Telugu",
      projectType: "Feature Film",
      directorOrCompany: "Suresh Productions"
    }
  ];

  // Multi-roles
  const roles = profile?.roles && profile.roles.length > 0 
    ? profile.roles 
    : [
        profile?.primaryCraftName || "Lead Actor",
        ...(profile?.secondaryCraftNames || ["Director", "Screenwriter"])
      ];

  // Video items count
  const videoItems = localPortfolio.filter(item => 
    item.type === "Video" || item.type === "Showreel" || item.category === "Showreel" || item.category === "Acting Clip" || item.category === "Audition Clip"
  );

  // Photo items
  const photoItems = localPortfolio.filter(item => item.type === "Image");

  // Filtered portfolio list
  const filteredPortfolio = localPortfolio.filter(item => {
    if (portfolioCategoryFilter === "all") return true;
    if (portfolioCategoryFilter === "photos") return item.type === "Image";
    if (portfolioCategoryFilter === "videos") return item.type === "Video" || item.type === "Showreel";
    if (portfolioCategoryFilter === "looks") return item.category === "Character Look" || item.category === "Costume Reference";
    if (portfolioCategoryFilter === "bts") return item.category === "Behind The Scenes";
    return true;
  });

  const handleAddItem = (newItem: PortfolioItem) => {
    setLocalPortfolio([newItem, ...localPortfolio]);
  };

  const handleDeleteItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this portfolio item?")) {
      setLocalPortfolio(localPortfolio.filter(item => item.id !== itemId));
    }
  };

  const handleCopyHandle = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedHandle(true);
    setTimeout(() => setCopiedHandle(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-16 font-sans">
      
      {/* PREVIEW MODE TOGGLE BANNER (Owner Only) */}
      {!isPublicView && (
        <div className="p-3.5 rounded-2xl bg-[#11131E] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${previewAsPublic ? "bg-cyan-400 animate-pulse" : "bg-emerald-400"}`} />
            <span className="text-white font-bold">
              {previewAsPublic ? "Public Filmmaker Preview Mode Active" : "Professional Portfolio Owner Dashboard"}
            </span>
            <span className="text-white/40 hidden sm:inline">• Official CineVenue 24 Crafts Identity</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewAsPublic(!previewAsPublic)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              {previewAsPublic ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
              <span>{previewAsPublic ? "Exit Preview" : "Preview Public View"}</span>
            </button>

            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Manage Visibility</span>
            </button>

            {onDiscoverProfessionals && (
              <button
                onClick={onDiscoverProfessionals}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>Discover Other Professionals</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. TOP PROFILE HERO CARD */}
      <div className="rounded-3xl bg-[#0C0D15] border border-white/10 overflow-hidden shadow-2xl">
        
        {/* Cover Image Banner */}
        <div className="relative h-48 sm:h-64 md:h-72 w-full bg-black overflow-hidden">
          <img 
            src={cover} 
            alt="Cover Banner" 
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0D15] via-[#0C0D15]/40 to-transparent" />
          
          {!previewAsPublic && (
            <button
              onClick={onOpenEditModal}
              className="absolute top-4 right-4 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/85 backdrop-blur-md text-white text-xs font-bold border border-white/20 flex items-center gap-2 cursor-pointer transition-all shadow-lg"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit Cover & Profile</span>
            </button>
          )}
        </div>

        {/* Profile Details & Metadata */}
        <div className="px-6 md:px-10 pb-8 relative -mt-16 sm:-mt-20">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            
            {/* Avatar & Identifiers */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden bg-[#181926] border-4 border-[#0C0D15] shadow-2xl shrink-0">
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0C0D15]" title="Available on CineVenue" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-amber-400" />
                    <span>Verified Talent</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400">{handle}</span>
                  <button
                    onClick={handleCopyHandle}
                    className="text-white/40 hover:text-white transition-colors"
                    title="Share Profile Link"
                  >
                    {copiedHandle ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                  </button>
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
                    <span>{experienceYears}+ Years</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{languages.join(", ")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0 w-full sm:w-auto">
              {!previewAsPublic ? (
                <>
                  <button
                    onClick={() => {
                      setAddPortfolioDefaultType("Image");
                      setIsAddPortfolioModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black uppercase text-xs tracking-wider shadow-lg shadow-gold/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-black" />
                    <span>+ Add Portfolio</span>
                  </button>

                  <button
                    onClick={() => {
                      setAddPortfolioDefaultType("Showreel");
                      setIsAddPortfolioModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Video className="w-4 h-4 text-amber-400" />
                    <span>+ Add Video</span>
                  </button>

                  <button
                    onClick={onOpenEditModal}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white cursor-pointer"
                    title="Edit Profile"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  {onInviteToProject && (
                    <button
                      onClick={() => onInviteToProject(profile!)}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-black" />
                      <span>Invite to Project</span>
                    </button>
                  )}

                  {onConsiderForCasting && (
                    <button
                      onClick={() => onConsiderForCasting(profile!)}
                      className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Award className="w-4 h-4 text-purple-400" />
                      <span>Consider for Casting</span>
                    </button>
                  )}

                  {onSendProposal && (
                    <button
                      onClick={() => onSendProposal(profile!)}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold text-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>Send Proposal</span>
                    </button>
                  )}
                </>
              )}
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

          {/* Quick Profile Statistics Bar (Projects | Portfolio | Videos | Roles) */}
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
              <div className="text-xl font-black text-purple-300 font-mono">{localPortfolio.length}</div>
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
          { id: "portfolio", label: `Portfolio (${localPortfolio.length})`, icon: ImageIcon },
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

      {/* 3. TAB CONTENT RENDERING */}
      
      {/* SECTION A: PORTFOLIO GRID (3 COLUMNS) */}
      {activeTab === "portfolio" && (
        <div className="space-y-6">
          
          {/* Filter Bar & Quick Add */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0C0D15] p-3 rounded-2xl border border-white/5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: "all", label: `All Media (${localPortfolio.length})` },
                { id: "photos", label: `Photos (${photoItems.length})` },
                { id: "videos", label: `Videos (${videoItems.length})` },
                { id: "looks", label: "Character Looks" },
                { id: "bts", label: "Behind The Scenes" }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setPortfolioCategoryFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    portfolioCategoryFilter === f.id
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {!previewAsPublic && (
              <button
                onClick={() => {
                  setAddPortfolioDefaultType("Image");
                  setIsAddPortfolioModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Upload Media</span>
              </button>
            )}
          </div>

          {/* Clean 3-Column Visual Grid */}
          {filteredPortfolio.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-[#0C0D15] border border-white/10 space-y-3">
              <ImageIcon className="w-12 h-12 text-white/20 mx-auto" />
              <h3 className="text-base font-bold text-white">No portfolio items in this filter</h3>
              <p className="text-xs text-white/50">Upload high-resolution headshots, character looks, or performance clips.</p>
              {!previewAsPublic && (
                <button
                  onClick={() => setIsAddPortfolioModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold cursor-pointer"
                >
                  + Add First Portfolio Item
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredPortfolio.map((item) => {
                const isVid = item.type === "Video" || item.type === "Showreel";
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedPortfolioItem(item);
                      setIsDetailModalOpen(true);
                    }}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-[#12131F] border border-white/10 hover:border-amber-500/50 transition-all cursor-pointer shadow-lg"
                  >
                    <img
                      src={item.thumbnailUrl || item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                    {/* Media Type Badge (Top Right) */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {isVid ? (
                        <span className="px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                          <Play className="w-2.5 h-2.5 fill-amber-400" />
                          <span>{item.duration || "Video"}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-white/80 text-[10px] font-bold">
                          Photo
                        </span>
                      )}

                      {!previewAsPublic && (
                        <button
                          onClick={(e) => handleDeleteItem(item.id, e)}
                          title="Delete item"
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Title & Metadata (Bottom) */}
                    <div className="absolute bottom-3 left-3 right-3 space-y-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                        {item.category || item.type}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                        {item.title}
                      </h4>
                      {item.projectName && (
                        <p className="text-[11px] text-white/60 truncate">
                          Film: {item.projectName}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* SECTION B: VIDEOS & SHOWREELS */}
      {activeTab === "videos" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-400" />
                <span>Showreels, Acting & Audition Clips</span>
              </h3>
              <p className="text-xs text-white/50">Performance tapes, monologue recordings, and choreography reels</p>
            </div>

            {!previewAsPublic && (
              <button
                onClick={() => {
                  setAddPortfolioDefaultType("Showreel");
                  setIsAddPortfolioModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold cursor-pointer"
              >
                + Add Video
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videoItems.map((vid) => (
              <div
                key={vid.id}
                onClick={() => {
                  setSelectedPortfolioItem(vid);
                  setIsDetailModalOpen(true);
                }}
                className="rounded-2xl bg-[#0C0D15] border border-white/10 overflow-hidden hover:border-amber-500/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-black overflow-hidden group">
                  <img
                    src={vid.thumbnailUrl || vid.mediaUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500/90 text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </div>
                  </div>
                  {vid.duration && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono font-bold">
                      {vid.duration}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    {vid.category || "Showreel"}
                  </span>
                  <h4 className="font-bold text-white text-sm truncate">{vid.title}</h4>
                  {vid.description && (
                    <p className="text-white/60 line-clamp-2 text-[11px]">{vid.description}</p>
                  )}
                  {vid.credits && (
                    <p className="text-[10px] text-white/40 truncate pt-1">Credits: {vid.credits}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION C: ABOUT */}
      {activeTab === "about" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-[#0C0D15] border border-white/10 p-6 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Biography & Creative Background</span>
              </h3>
              <p className="text-xs text-white/80 leading-relaxed whitespace-pre-line">
                {bio}
              </p>
            </div>

            <div className="rounded-2xl bg-[#0C0D15] border border-white/10 p-6 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-white/60">
                Spoken Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-[#0C0D15] border border-white/10 p-6 space-y-3 text-xs">
              <h3 className="font-black uppercase tracking-wider text-white/60 text-[11px]">
                Direct Representation & Verification
              </h3>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] text-white/40 block">Union Status</span>
                  <span className="font-bold text-white">Movie Artists Association (MAA)</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] text-white/40 block">Platform Verification</span>
                  <span className="font-bold text-amber-400">CineVenue Studio Verified Level 2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION D: FILMOGRAPHY */}
      {activeTab === "filmography" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                <span>Filmography & Theatrical Credits</span>
              </h3>
              <p className="text-xs text-white/50">Feature films, short cinema, and OTT productions</p>
            </div>

            {!previewAsPublic && (
              <button
                onClick={onOpenEditModal}
                className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold"
              >
                + Add Project Credit
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filmography.map((film, idx) => (
              <div 
                key={film.id || idx}
                className="p-5 rounded-2xl bg-[#0C0D15] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="text-base font-black text-white">{film.projectTitle}</div>
                  <div className="text-amber-400 font-bold">Role: {film.role} • Craft: {film.craft}</div>
                  {film.directorOrCompany && (
                    <div className="text-[11px] text-white/60">Banner / Director: {film.directorOrCompany}</div>
                  )}
                </div>

                <div className="text-left sm:text-right space-y-1 shrink-0">
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white font-mono font-bold text-xs">
                    {film.year}
                  </span>
                  <div className="text-[11px] text-white/50">{film.language} • {film.projectType}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION E: SKILLS */}
      {activeTab === "skills" && (
        <div className="rounded-2xl bg-[#0C0D15] border border-white/10 p-6 space-y-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Professional Skills & Specializations</span>
            </h3>
            <p className="text-xs text-white/50">Core on-set competencies and craft capabilities</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill, idx) => (
              <span 
                key={idx}
                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 text-white font-semibold text-xs transition-all"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* SECTION F: EXPERIENCE & TRAINING */}
      {activeTab === "experience" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#0C0D15] border border-white/10 p-6 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span>Formal Cinema Training & Certifications</span>
            </h3>

            <div className="space-y-3 text-xs">
              {training.map((t, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                  <Award className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">{t}</span>
                    <span className="text-white/40 block text-[11px] mt-0.5">Verified Institutional Certification</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION G: AVAILABILITY */}
      {activeTab === "availability" && (
        <div className="rounded-2xl bg-[#0C0D15] border border-white/10 p-6 space-y-5 text-xs">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Current Availability & Booking Status</span>
            </h3>
            <p className="text-white/50 text-[11px]">Real-time calendar status for producers and casting managers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">Status</span>
              <span className="text-base font-black text-emerald-400">🟢 Available for Shoot</span>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-white/40 block">Available From</span>
              <span className="text-base font-black text-white">Immediate / Flexible</span>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-white/40 block">Location Flexibility</span>
              <span className="text-base font-black text-white">Pan-India & Overseas</span>
            </div>
          </div>

          {profile?.availability?.notes && (
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 italic text-white/70">
              "{profile.availability.notes}"
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS */}
      {/* ======================================================== */}
      <PortfolioDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        item={selectedPortfolioItem}
        professionalName={name}
        professionalHandle={handle}
      />

      <AddPortfolioItemModal
        isOpen={isAddPortfolioModalOpen}
        onClose={() => setIsAddPortfolioModalOpen(false)}
        defaultType={addPortfolioDefaultType}
        onAddPortfolioItem={handleAddItem}
      />

      <ProfilePrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        settings={profile?.privacySettings}
        onSavePrivacySettings={(newSettings) => {
          // Handled via state and modal
        }}
      />

    </div>
  );
}
