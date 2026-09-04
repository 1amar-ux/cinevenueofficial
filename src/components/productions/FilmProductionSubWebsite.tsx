import React, { useState, useEffect } from "react";
import { 
  Film, Sparkles, Play, Ticket, Users, Award, Calendar, ChevronRight, 
  Search, Filter, Heart, Bell, Send, Megaphone, Handshake, ShieldCheck, 
  Star, Clapperboard, Video, CheckCircle2, FileText, ArrowRight, Eye, Info,
  ExternalLink, Layers, Music, Camera, Zap, Tv, MapPin, Globe, HelpCircle
} from "lucide-react";
import { getEventRequests, submitEventRequest, postEventMessage } from "../../services/eventService";

import { 
  ProductionProject, 
  CastingCall, 
  BehindTheScenesItem, 
  NewsArticle, 
  StorySubmission, 
  BrandCampaignRequest, 
  EventManagementRequest, 
  PartnerEnquiry,
  TalentProfileData,
  ProductionCategory,
  ProductionStatus,
  FilmProjectApplication,
  PublicEvent,
  ArtistRequest,
  SponsorshipRequest,
  EventPortfolioItem,
  PromotionCampaign
} from "../../types/productions";

import { 
  INITIAL_PRODUCTION_PROJECTS, 
  INITIAL_CASTING_CALLS, 
  INITIAL_BTS_ITEMS, 
  INITIAL_NEWS_ARTICLES,
  INITIAL_STORY_SUBMISSIONS,
  INITIAL_BRAND_CAMPAIGN_REQUESTS,
  INITIAL_EVENT_MANAGEMENT_REQUESTS,
  INITIAL_FILM_APPLICATIONS,
  INITIAL_PUBLIC_EVENTS,
  INITIAL_ARTIST_REQUESTS,
  INITIAL_SPONSORSHIP_REQUESTS,
  INITIAL_EVENT_PORTFOLIO,
  INITIAL_PROMOTION_CAMPAIGN_DATA
} from "../../data/productionsData";

import ProductionDetailsModal from "./ProductionDetailsModal";
import CastingApplicationModal from "./CastingApplicationModal";
import StorySubmissionModal from "./StorySubmissionModal";
import BrandCampaignModal from "./BrandCampaignModal";
import PartnerEnquiryModal from "./PartnerEnquiryModal";
import FilmProjectApplicationModal from "./FilmProjectApplicationModal";
import ApplicantDashboardModal from "./ApplicantDashboardModal";
import CineVenueProductionsAdminPanel from "./CineVenueProductionsAdminPanel";
import EventManagementSection from "./EventManagementSection";
import MediaPromotionsSection from "./MediaPromotionsSection";
import ApplicationFormsHubModal from "./ApplicationFormsHubModal";
import FilmProductionHub from "../film-production/FilmProductionHub";
import CineVenueFilmAdminTab from "../film-production/CineVenueFilmAdminTab";

interface FilmProductionSubWebsiteProps {
  userEmail?: string | null;
  initialModule?: "film" | "events" | "media";
  onOpenAuth?: () => void;
  onBookTickets?: (movieTitle: string) => void;
  castingApplications?: any[];
  onAddCastingApplication?: (app: any) => void;
}

export default function FilmProductionSubWebsite({
  userEmail,
  initialModule = "film",
  onOpenAuth,
  onBookTickets,
  castingApplications = [],
  onAddCastingApplication
}: FilmProductionSubWebsiteProps) {
  
  // Active Sub-Website Section / Module
  const [activeModule, setActiveModule] = useState<"film" | "events" | "media">(initialModule);
  const [filmViewMode, setFilmViewMode] = useState<"marketplace" | "showcase">("marketplace");
  const [isFilmMarketplaceAdminOpen, setIsFilmMarketplaceAdminOpen] = useState(false);

  // State for Projects, Casting Calls, Submissions, Campaigns, BTS, News
  const [projects, setProjects] = useState<ProductionProject[]>(INITIAL_PRODUCTION_PROJECTS);
  const [castingCalls, setCastingCalls] = useState<CastingCall[]>(INITIAL_CASTING_CALLS);
  const [btsItems, setBtsItems] = useState<BehindTheScenesItem[]>(INITIAL_BTS_ITEMS);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>(INITIAL_NEWS_ARTICLES);
  const [storySubmissions, setStorySubmissions] = useState<StorySubmission[]>(INITIAL_STORY_SUBMISSIONS);
  const [filmApplications, setFilmApplications] = useState<FilmProjectApplication[]>(INITIAL_FILM_APPLICATIONS);
  const [brandCampaigns, setBrandCampaigns] = useState<BrandCampaignRequest[]>(INITIAL_BRAND_CAMPAIGN_REQUESTS);
  const [partnerEnquiries, setPartnerEnquiries] = useState<PartnerEnquiry[]>([]);

  // State for Events & Media Sub-Modules
  const [eventRequests, setEventRequests] = useState<EventManagementRequest[]>(INITIAL_EVENT_MANAGEMENT_REQUESTS);
  const [publicEvents, setPublicEvents] = useState<PublicEvent[]>(INITIAL_PUBLIC_EVENTS);
  const [artistRequests, setArtistRequests] = useState<ArtistRequest[]>(INITIAL_ARTIST_REQUESTS);
  const [sponsorshipRequests, setSponsorshipRequests] = useState<SponsorshipRequest[]>(INITIAL_SPONSORSHIP_REQUESTS);
  const [eventPortfolio, setEventPortfolio] = useState<EventPortfolioItem[]>(INITIAL_EVENT_PORTFOLIO);
  const [promotionCampaigns, setPromotionCampaigns] = useState<PromotionCampaign[]>(INITIAL_PROMOTION_CAMPAIGN_DATA);

  // Sync event requests from backend service / localStorage
  const loadEventRequests = async () => {
    try {
      const data = await getEventRequests(userEmail);
      if (Array.isArray(data) && data.length > 0) {
        setEventRequests(data);
      }
    } catch (err) {
      console.warn("Could not load event requests in subportal:", err);
    }
  };

  useEffect(() => {
    loadEventRequests();

    const handleReqUpdated = () => {
      loadEventRequests();
    };

    const handleMsgAdded = (e: any) => {
      const { requestId, message } = e.detail || {};
      if (requestId && message) {
        setEventRequests(prev => prev.map(r => {
          if (r.id === requestId || (r as any).requestId === requestId) {
            const cur = r.messages || [];
            if (!cur.some(m => m.id === message.id)) {
              return { ...r, messages: [...cur, message] };
            }
          }
          return r;
        }));
      } else {
        loadEventRequests();
      }
    };

    window.addEventListener("cine_event_requests_updated", handleReqUpdated);
    window.addEventListener("cine_event_message_added", handleMsgAdded);

    return () => {
      window.removeEventListener("cine_event_requests_updated", handleReqUpdated);
      window.removeEventListener("cine_event_message_added", handleMsgAdded);
    };
  }, [userEmail]);

  const handleAddEventRequest = async (req: EventManagementRequest) => {
    setEventRequests(prev => [req, ...prev.filter(r => r.id !== req.id)]);
    await submitEventRequest(req);
  };

  const handleSendMessage = async (requestId: string, text: string, senderRole: "client" | "producer" | "admin" = "client") => {
    const senderName = userEmail ? userEmail.split("@")[0] : (senderRole === "client" ? "Client" : "CineVenue Producer");
    await postEventMessage(requestId, {
      text,
      sender: senderRole,
      senderName,
      senderEmail: userEmail || undefined
    });
  };

  const handleUpdateUserRequestResponse = async (id: string, text: string) => {
    setEventRequests(eventRequests.map(r => {
      if (r.id === id) {
        return {
          ...r,
          userResponseInfo: text,
          updates: [
            ...(r.updates || []),
            {
              date: new Date().toISOString().split("T")[0],
              title: "Client Provided Information",
              note: text,
              author: r.fullName
            }
          ]
        };
      }
      return r;
    }));

    await postEventMessage(id, {
      text,
      sender: "client",
      senderName: userEmail ? userEmail.split("@")[0] : "Client",
      senderEmail: userEmail || undefined
    });
  };

  const handleAddArtistRequest = (req: ArtistRequest) => {
    setArtistRequests([req, ...artistRequests]);
  };

  const handleAddSponsorshipRequest = (req: SponsorshipRequest) => {
    setSponsorshipRequests([req, ...sponsorshipRequests]);
  };

  const handleAddPromotionCampaign = (campaign: PromotionCampaign) => {
    setPromotionCampaigns([campaign, ...promotionCampaigns]);
  };

  // Filtering & Search State for Productions
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [activeProjectDetail, setActiveProjectDetail] = useState<ProductionProject | null>(null);
  const [activeCastingCall, setActiveCastingCall] = useState<CastingCall | null>(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isFilmAppModalOpen, setIsFilmAppModalOpen] = useState(false);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerInitialCat, setPartnerInitialCat] = useState<PartnerEnquiry["category"]>("Producer");
  const [activeNewsModal, setActiveNewsModal] = useState<NewsArticle | null>(null);
  const [isAppHubModalOpen, setIsAppHubModalOpen] = useState(false);

  // User Following / Watchlist State
  const [followedProjectIds, setFollowedProjectIds] = useState<string[]>(["PROD-001"]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleFollowProject = (id: string) => {
    if (followedProjectIds.includes(id)) {
      setFollowedProjectIds(followedProjectIds.filter(item => item !== id));
      showToast("Removed from your notification watchlist.");
    } else {
      setFollowedProjectIds([...followedProjectIds, id]);
      showToast("🎉 Added to your notification watchlist! You will get alerts for trailer releases & casting updates.");
    }
  };

  // Filtered Projects
  const filteredProjects = projects.filter(p => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesLanguage = selectedLanguage === "All" || p.language.includes(selectedLanguage);
    const matchesStatus = selectedStatus === "All" || p.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.leadCast.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesLanguage && matchesStatus && matchesSearch;
  });

  const featuredProject = projects.find(p => p.isFeatured) || projects[0];
  const upcomingProjects = projects.filter(p => p.isUpcoming || p.status === "Filming" || p.status === "Pre-Production" || p.status === "Casting");

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans antialiased selection:bg-gold selection:text-black">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-amber-500 to-gold text-black px-5 py-3 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 fill-current" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub-Website Top Bar / Header Branding */}
      <header className="sticky top-0 z-40 bg-[#0B0B0E]/95 backdrop-blur-lg border-b border-white/10 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div 
            onClick={() => window.location.href = "/"}
            className="flex items-center gap-3 cursor-pointer group"
            title="Return to Main Website"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-gold to-yellow-400 p-0.5 flex items-center justify-center shadow-lg shadow-gold/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                <Clapperboard className="w-5 h-5 text-gold" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wider font-serif uppercase text-white flex items-center gap-1.5 group-hover:text-gold transition-colors">
                CINEVENUE <span className="text-gold">PRODUCTIONS</span>
              </h1>
              <p className="text-[9px] text-white/50 tracking-widest uppercase hidden sm:block">
                Creating Stories • Producing Experiences • Building Entertainment
              </p>
            </div>
          </div>

          {/* Sub-Website Section Switcher */}
          <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveModule("film")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeModule === "film"
                  ? "bg-gradient-to-r from-amber-500 to-gold text-black shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Film Production</span>
            </button>

            <button
              onClick={() => setActiveModule("events")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeModule === "events"
                  ? "bg-gradient-to-r from-amber-500 to-gold text-black shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Event Management</span>
            </button>

            <button
              onClick={() => setActiveModule("media")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeModule === "media"
                  ? "bg-gradient-to-r from-amber-500 to-gold text-black shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Media & Promotions</span>
            </button>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAppHubModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-gold/20 hover:bg-gold/30 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider transition-all border border-amber-500/40 cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-gold" />
              <span>APPLICATION FORMS</span>
            </button>

            <button
              onClick={() => setIsDashboardModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider transition-all border border-white/15 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-gold" />
              <span>My Applications</span>
            </button>

            <button
              onClick={() => setIsFilmAppModalOpen(true)}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-gold to-yellow-500 text-black text-[11px] font-extrabold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-md shadow-gold/20 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SUBMIT PROJECT</span>
            </button>
          </div>
        </div>
      </header>

      {/* DYNAMIC MODULE RENDERING */}
      {activeModule === "events" && (
        <EventManagementSection
          requests={eventRequests}
          publicEvents={publicEvents}
          artistRequests={artistRequests}
          sponsorshipRequests={sponsorshipRequests}
          portfolioItems={eventPortfolio}
          onSubmitRequest={handleAddEventRequest}
          onSubmitArtistRequest={handleAddArtistRequest}
          onSubmitSponsorshipRequest={handleAddSponsorshipRequest}
          onUpdateUserRequestResponse={handleUpdateUserRequestResponse}
          onBookTickets={onBookTickets}
          userEmail={userEmail}
        />
      )}

      {activeModule === "media" && (
        <MediaPromotionsSection
          campaigns={promotionCampaigns}
          onSubmitCampaign={handleAddPromotionCampaign}
          userEmail={userEmail}
        />
      )}

      {activeModule === "film" && (
        <>
          {/* Film Section View Switcher Bar */}
          <div className="bg-[#0B0B0F] border-b border-white/10 px-6 py-2.5">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilmViewMode("marketplace")}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                    filmViewMode === "marketplace"
                      ? "bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/20"
                      : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>24 Crafts Film Marketplace</span>
                </button>

                <button
                  onClick={() => setFilmViewMode("showcase")}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                    filmViewMode === "showcase"
                      ? "bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/20"
                      : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10"
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Studio Slate & Showcase</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFilmMarketplaceAdminOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold border border-purple-500/40 cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>24 Crafts Admin</span>
                </button>
              </div>
            </div>
          </div>

          {filmViewMode === "marketplace" ? (
            <FilmProductionHub
              userEmail={userEmail}
              onOpenAuth={onOpenAuth}
            />
          ) : (
            <>
              {/* SECTION 1: FILM PRODUCTION LANDING PAGE HERO */}
              <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-black py-16 px-6">
        
        {/* Background Visual Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={featuredProject.bannerImage || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80"}
            alt="Film Production Hero"
            className="w-full h-full object-cover object-center opacity-35 scale-105 animate-pulse"
            style={{ animationDuration: "12s" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/75 to-black/85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/15 via-transparent to-transparent opacity-70" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/70 border border-gold/40 text-gold text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            <Clapperboard className="w-4 h-4" />
            <span>FILM PRODUCTION</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-serif tracking-tight text-white leading-tight">
            Have a Story Worth Bringing to the Screen?
          </h1>

          <p className="text-sm sm:text-base md:text-lg font-light text-white/90 max-w-3xl mx-auto leading-relaxed font-sans">
            CineVenue Productions welcomes original film projects from writers, directors, producers, and filmmakers. Submit your project and explore opportunities for production, co-production, casting, marketing, events, and distribution.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setIsAppHubModalOpen(true)}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-extrabold text-xs uppercase tracking-widest hover:scale-105 shadow-xl shadow-gold/25 transition-all cursor-pointer flex items-center gap-2"
            >
              <FileText className="w-4.5 h-4.5" />
              <span>APPLICATION FORMS HUB</span>
            </button>

            <button
              onClick={() => setIsFilmAppModalOpen(true)}
              className="px-7 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-widest transition-all border border-white/20 cursor-pointer flex items-center gap-2 backdrop-blur-md"
            >
              <Send className="w-4.5 h-4.5 text-gold" />
              <span>SUBMIT FILM PROJECT</span>
            </button>

            <button
              onClick={() => scrollToSection("how-it-works")}
              className="px-6 py-4 rounded-xl bg-black/60 hover:bg-black/90 text-white/80 font-bold text-xs uppercase tracking-widest transition-all border border-white/15 cursor-pointer flex items-center gap-2"
            >
              <Info className="w-4.5 h-4.5 text-amber-400" />
              <span>HOW IT WORKS</span>
            </button>

            <button
              onClick={() => setIsDashboardModalOpen(true)}
              className="px-6 py-4 rounded-xl bg-black/60 hover:bg-black/90 text-gold font-bold text-xs uppercase tracking-widest transition-all border border-gold/40 cursor-pointer flex items-center gap-2"
            >
              <Eye className="w-4.5 h-4.5" />
              <span>MY APPLICATIONS</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: WHAT CINEVENUE CAN OFFER */}
      <section id="offerings" className="py-20 px-6 bg-[#0E0F14] border-t border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Comprehensive Studio Ecosystem
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              WHAT CINEVENUE CAN OFFER
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              We empower creators across every stage of film development, from pitch decks and script evaluations to nationwide distribution and star-studded promotions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="bg-[#14151D] border border-white/10 hover:border-gold/50 rounded-2xl p-6 space-y-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/5 group">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                <Clapperboard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white">Full Film Production</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                CineVenue can evaluate projects for production opportunities, slate funding, and end-to-end studio backing.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#14151D] border border-white/10 hover:border-gold/50 rounded-2xl p-6 space-y-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/5 group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Handshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white">Co-Production</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Submit a project for possible co-production, joint ventures, and shared risk equity financing.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#14151D] border border-white/10 hover:border-gold/50 rounded-2xl p-6 space-y-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/5 group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white">Production Support</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Production services, line management, camera packages, VFX pipelines, and technical support.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#14151D] border border-white/10 hover:border-gold/50 rounded-2xl p-6 space-y-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/5 group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white">Casting</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                CineVenue casting, star attachments, and pan-Indian talent discovery platform support.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-[#14151D] border border-white/10 hover:border-gold/50 rounded-2xl p-6 space-y-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/5 group">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white">Marketing & Promotions</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Movie marketing, trailer drop campaigns, influencer amplification, and press publicity.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-[#14151D] border border-white/10 hover:border-gold/50 rounded-2xl p-6 space-y-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/5 group">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white">Event Management</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Pre-release events, premieres, audio launches, press meets, and promotional city tours.
              </p>
            </div>

            {/* Card 7 */}
            <div className="bg-[#14151D] border border-white/10 hover:border-gold/50 rounded-2xl p-6 space-y-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/5 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white">Brand Integration</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Opportunities for high-value brand partnerships, product placements, and co-branded promos.
              </p>
            </div>

            {/* Card 8 */}
            <div className="bg-[#14151D] border border-white/10 hover:border-gold/50 rounded-2xl p-6 space-y-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/5 group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white">Distribution & Ticketing</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Potential theatrical distribution and direct CineVenue ticketing platform integration for approved projects.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION: OFFICIAL APPLICATION FORMS HUB */}
      <section id="application-forms" className="py-20 px-6 bg-[#08090D] border-t border-amber-500/30 relative overflow-hidden">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-amber-500/10 via-gold/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
              <FileText className="w-4 h-4 text-gold" /> Official Submission & Application Portal
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-white tracking-tight">
              APPLY TO CINEVENUE PRODUCTIONS
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              Select your required application form below. Whether you are pitching a movie screenplay, applying for actor auditions, requesting event management, or seeking brand integration, fill out your form directly for studio evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Form Card 1 */}
            <div className="bg-[#12141F] border border-amber-500/30 hover:border-gold rounded-2xl p-6 space-y-4 shadow-xl transition-all hover:-translate-y-1 group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                    <Clapperboard className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-gold/15 text-gold text-[10px] font-bold uppercase border border-gold/30">
                    Full Studio Pitch
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold text-white">Film Production & Co-Production Application Form</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Complete 8-step application form for feature films, web series, and short film projects requesting studio funding, co-production, and production support.
                </p>
              </div>
              <button
                onClick={() => setIsFilmAppModalOpen(true)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-extrabold text-xs uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold/20 hover:opacity-95"
              >
                <Send className="w-4 h-4" />
                <span>Fill Film Production Form</span>
              </button>
            </div>

            {/* Form Card 2 */}
            <div className="bg-[#12141F] border border-white/10 hover:border-amber-500/50 rounded-2xl p-6 space-y-4 shadow-xl transition-all hover:-translate-y-1 group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold uppercase border border-amber-500/30">
                    Fast Story Pitch
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold text-white">Script & Story Pitch Submission Form</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Fast 1-minute submission form for original film stories, loglines, pitch decks, and screenplay concepts encrypted under studio NDA.
                </p>
              </div>
              <button
                onClick={() => setIsStoryModalOpen(true)}
                className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs uppercase rounded-xl border border-amber-500/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Fill Story Submission Form</span>
              </button>
            </div>

            {/* Form Card 3 */}
            <div className="bg-[#12141F] border border-white/10 hover:border-purple-500/50 rounded-2xl p-6 space-y-4 shadow-xl transition-all hover:-translate-y-1 group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 text-[10px] font-bold uppercase border border-purple-500/30">
                    Artist Audition
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold text-white">Casting Call & Audition Application Form</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Audition application form for actors, lead stars, supporting roles, and new talent looking to act in upcoming CineVenue productions.
                </p>
              </div>
              <button
                onClick={() => setIsAppHubModalOpen(true)}
                className="w-full py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-xs uppercase rounded-xl border border-purple-500/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Users className="w-4 h-4" />
                <span>Fill Audition Form</span>
              </button>
            </div>

            {/* Form Card 4 */}
            <div className="bg-[#12141F] border border-white/10 hover:border-cyan-500/50 rounded-2xl p-6 space-y-4 shadow-xl transition-all hover:-translate-y-1 group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-bold uppercase border border-cyan-500/30">
                    Event Booking
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold text-white">Event Production & Venue Request Form</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Request CineVenue event management services for pre-release events, audio launches, premieres, press galas, and celebrity tours.
                </p>
              </div>
              <button
                onClick={() => setIsAppHubModalOpen(true)}
                className="w-full py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs uppercase rounded-xl border border-cyan-500/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Fill Event Request Form</span>
              </button>
            </div>

            {/* Form Card 5 */}
            <div className="bg-[#12141F] border border-white/10 hover:border-emerald-500/50 rounded-2xl p-6 space-y-4 shadow-xl transition-all hover:-translate-y-1 group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <Star className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/30">
                    Star Booking
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold text-white">Artist & Celebrity Booking Request Form</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Book Tollywood lead stars, directors, music composers, playback singers, and anchors for live shows, corporate galas, and events.
                </p>
              </div>
              <button
                onClick={() => setIsAppHubModalOpen(true)}
                className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs uppercase rounded-xl border border-emerald-500/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Star className="w-4 h-4" />
                <span>Fill Artist Booking Form</span>
              </button>
            </div>

            {/* Form Card 6 */}
            <div className="bg-[#12141F] border border-white/10 hover:border-rose-500/50 rounded-2xl p-6 space-y-4 shadow-xl transition-all hover:-translate-y-1 group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-bold uppercase border border-rose-500/30">
                    Brand Deals
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold text-white">Brand Campaign & Sponsorship Form</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Submit brand sponsorship requests, product placement proposals, trailer promotions, and co-branded movie campaigns.
                </p>
              </div>
              <button
                onClick={() => setIsBrandModalOpen(true)}
                className="w-full py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs uppercase rounded-xl border border-rose-500/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Megaphone className="w-4 h-4" />
                <span>Fill Brand Campaign Form</span>
              </button>
            </div>

          </div>

          {/* Hub Action Bar */}
          <div className="p-6 bg-gradient-to-r from-amber-500/10 via-gold/10 to-yellow-500/10 border border-gold/30 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="font-serif font-bold text-white text-base">Looking for a Universal Application Form?</h4>
              <p className="text-xs text-white/70">Access our all-in-one submission center to select any application form instantly.</p>
            </div>

            <button
              onClick={() => setIsAppHubModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-extrabold text-xs uppercase rounded-xl shadow-xl shadow-gold/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>OPEN ALL APPLICATION FORMS</span>
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-6 bg-[#070709] border-t border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
              <Info className="w-3.5 h-3.5" /> Project Evaluation Roadmap
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              HOW IT WORKS
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              A transparent, structured 5-step process from submission to potential production backing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            
            {/* Step 1 */}
            <div className="bg-[#12131A] border border-white/10 rounded-2xl p-5 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-gold text-black font-extrabold flex items-center justify-center text-xs">
                01
              </div>
              <h3 className="text-sm font-bold text-white">Submit Your Project</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Complete the application form and upload the required materials (screenplay, pitch deck, character notes).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#12131A] border border-white/10 rounded-2xl p-5 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 font-extrabold flex items-center justify-center text-xs">
                02
              </div>
              <h3 className="text-sm font-bold text-white">CineVenue Review</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Our creative evaluation board reads and reviews the submitted project for commercial and artistic viability.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#12131A] border border-white/10 rounded-2xl p-5 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-extrabold flex items-center justify-center text-xs">
                03
              </div>
              <h3 className="text-sm font-bold text-white">Shortlisting</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Selected high-potential projects move to further internal evaluation and financial feasibility checks.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#12131A] border border-white/10 rounded-2xl p-5 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40 font-extrabold flex items-center justify-center text-xs">
                04
              </div>
              <h3 className="text-sm font-bold text-white">Discussion</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                CineVenue contacts the applicant for additional info, pitch sessions, budget meetings, or development discussions.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-[#12131A] border border-gold/40 bg-gold/5 rounded-2xl p-5 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-gold text-black font-extrabold flex items-center justify-center text-xs">
                05
              </div>
              <h3 className="text-sm font-bold text-white">Production Opportunity</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Approved projects proceed toward production, co-production, casting, marketing, events, or distribution agreements.
              </p>
            </div>

          </div>

          {/* Disclaimer Banner */}
          <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl text-center max-w-2xl mx-auto space-y-1">
            <p className="text-xs text-white/50 italic">
              <strong>Disclaimer:</strong> Submission of a project does not guarantee production, funding, distribution, or approval by CineVenue Productions. All submissions are processed under strict NDA confidentiality.
            </p>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => setIsFilmAppModalOpen(true)}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:scale-105 shadow-xl shadow-gold/20 cursor-pointer"
            >
              SUBMIT YOUR PROJECT NOW
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 4: PUBLIC PROJECT SHOWCASE */}
      <section id="showcase" className="py-16 px-6 bg-[#0B0B0E] border-y border-white/10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-gold text-xs font-bold uppercase tracking-widest block">Spotlight Banner</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-white">FEATURED PRODUCTION</h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold uppercase font-mono">
              Status: {featuredProject.status}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#101014] p-6 sm:p-8 rounded-3xl border border-gold/30 shadow-2xl relative overflow-hidden">
            
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

            {/* Poster */}
            <div className="lg:col-span-4 relative group">
              <img
                src={featuredProject.posterImage}
                alt={featuredProject.title}
                className="w-full h-96 sm:h-[450px] object-cover rounded-2xl border border-white/10 shadow-2xl group-hover:scale-[1.02] transition-transform duration-300"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/80 text-gold text-xs font-bold uppercase tracking-wider border border-gold/40">
                {featuredProject.category}
              </span>
            </div>

            {/* Project Specs & Synopsis */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {featuredProject.genre.map((g, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded bg-white/10 text-white text-[11px] font-bold">
                      {g}
                    </span>
                  ))}
                  <span className="text-xs text-white/50 font-mono">• {featuredProject.language}</span>
                </div>
                <h3 className="text-3xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
                  {featuredProject.title}
                </h3>
                <p className="text-amber-400 font-medium italic text-sm">
                  "{featuredProject.tagline}"
                </p>
              </div>

              <p className="text-white/80 text-sm leading-relaxed font-sans bg-black/40 p-4 rounded-xl border border-white/5">
                {featuredProject.synopsis}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-white/40 block">Director</span>
                  <span className="font-bold text-white">{featuredProject.director}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Lead Star Cast</span>
                  <span className="font-bold text-gold">{(featuredProject.leadCast || []).join(", ")}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Production House</span>
                  <span className="font-bold text-white">{featuredProject.producer}</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setActiveProjectDetail(featuredProject)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 shadow-lg shadow-gold/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>VIEW PROJECT DETAILS</span>
                </button>

                {featuredProject.trailerUrl && (
                  <button
                    onClick={() => setActiveProjectDetail(featuredProject)}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/20 cursor-pointer flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 text-gold fill-current" />
                    <span>TRAILER & MEDIA</span>
                  </button>
                )}

                {(featuredProject.status === "Released" || featuredProject.ticketMovieTitle) && (
                  <button
                    onClick={() => {
                      if (onBookTickets) onBookTickets(featuredProject.ticketMovieTitle || featuredProject.title);
                      else window.location.href = "/#services";
                    }}
                    className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Ticket className="w-4 h-4 fill-current" />
                    <span>BOOK TICKETS</span>
                  </button>
                )}

                <button
                  onClick={() => toggleFollowProject(featuredProject.id)}
                  className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-2 ${
                    followedProjectIds.includes(featuredProject.id)
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                      : "bg-white/5 text-white hover:bg-white/10 border-white/10"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${followedProjectIds.includes(featuredProject.id) ? "fill-current" : ""}`} />
                  <span>{followedProjectIds.includes(featuredProject.id) ? "Following" : "Follow"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: OUR PRODUCTIONS (CATALOG WITH CATEGORIES & FILTERING) */}
      <section id="productions" className="py-16 px-6 max-w-7xl mx-auto space-y-8">
        
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-gold text-xs font-bold uppercase tracking-widest block">Catalog Showcase</span>
              <h2 className="text-2xl sm:text-4xl font-serif font-extrabold text-white">OUR PRODUCTIONS</h2>
            </div>
            <p className="text-xs text-white/60 max-w-md">
              Feature Films, Web Series, Short Films, Music Videos, and Commercial Brand Films created by CineVenue.
            </p>
          </div>

          {/* Filtering Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search title, cast, director..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-gold outline-none"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-gold outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Feature Film">Feature Films</option>
              <option value="Web Series">Web Series</option>
              <option value="Short Film">Short Films</option>
              <option value="Music Video">Music Videos</option>
              <option value="Commercial Film">Commercial Films</option>
            </select>

            {/* Language Filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-gold outline-none cursor-pointer"
            >
              <option value="All">All Languages</option>
              <option value="Telugu">Telugu</option>
              <option value="Hindi">Hindi</option>
              <option value="Tamil">Tamil</option>
              <option value="English">English</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-gold outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Filming">Filming</option>
              <option value="Post-Production">Post-Production</option>
              <option value="Completed">Completed</option>
              <option value="Released">Released</option>
            </select>
          </div>
        </div>

        {/* Grid of Projects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(proj => (
            <div
              key={proj.id}
              className="group bg-[#0E0E12] border border-white/10 rounded-2xl overflow-hidden hover:border-gold/50 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Poster Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-black">
                <img
                  src={proj.posterImage}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] via-transparent to-black/60" />

                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/80 text-gold border border-gold/30 text-[10px] font-bold uppercase">
                  {proj.category}
                </span>

                <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  proj.status === "Released" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                }`}>
                  {proj.status}
                </span>

                <button
                  onClick={() => toggleFollowProject(proj.id)}
                  className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 text-white hover:text-rose-400 transition-colors border border-white/10 cursor-pointer"
                  title="Follow project updates"
                >
                  <Heart className={`w-4 h-4 ${followedProjectIds.includes(proj.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                </button>
              </div>

              {/* Specs */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-white/50 font-mono block">
                    {proj.language} • {(proj.genre || []).join(", ")}
                  </span>
                  <h3 className="font-extrabold text-lg font-serif text-white group-hover:text-gold transition-colors line-clamp-1">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between text-white/70">
                    <span>Director:</span>
                    <strong className="text-white">{proj.director}</strong>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Target Release:</span>
                    <strong className="text-amber-400">{proj.releaseDate || "TBA"}</strong>
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    onClick={() => setActiveProjectDetail(proj)}
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10 cursor-pointer text-center"
                  >
                    View Project
                  </button>

                  {(proj.status === "Released" || proj.ticketMovieTitle) && (
                    <button
                      onClick={() => {
                        if (onBookTickets) onBookTickets(proj.ticketMovieTitle || proj.title);
                        else window.location.href = "/#services";
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-gold transition-all cursor-pointer"
                    >
                      Tickets
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: UPCOMING PROJECTS & NOTIFY ME */}
      <section id="upcoming" className="py-16 px-6 bg-[#0B0B0E] border-y border-white/10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-gold text-xs font-bold uppercase tracking-widest block">Future Slate</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-white">UPCOMING PROJECTS</h2>
            </div>
            <span className="text-xs text-white/50 hidden sm:block">Click 'Notify Me' to follow development</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingProjects.map(up => (
              <div key={up.id} className="bg-[#101014] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-center">
                <img
                  src={up.posterImage}
                  alt={up.title}
                  className="w-full sm:w-36 h-48 object-cover rounded-xl border border-white/10"
                />
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-gold/20 text-gold text-[10px] font-bold uppercase">
                      {up.category}
                    </span>
                    <span className="text-xs text-emerald-400 font-mono font-bold">{up.status}</span>
                  </div>
                  <h3 className="font-bold font-serif text-lg text-white">{up.title}</h3>
                  <p className="text-xs text-white/60 line-clamp-2">{up.description}</p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-amber-400 font-bold">Release: {up.releaseDate || "2027"}</span>
                    <button
                      onClick={() => toggleFollowProject(up.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                        followedProjectIds.includes(up.id)
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-gold text-black hover:bg-amber-400 font-extrabold"
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{followedProjectIds.includes(up.id) ? "Notifying You" : "NOTIFY ME"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: CINEVENUE CASTING & TALENT DISCOVERY */}
      <section id="casting" className="py-16 px-6 max-w-7xl mx-auto space-y-8">
        
        <div className="bg-gradient-to-r from-[#141208] via-[#0E0D12] to-black border border-gold/40 rounded-3xl p-8 sm:p-12 space-y-6 relative overflow-hidden">
          
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-widest">
              Audition & Talent Portal
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-white">
              YOUR JOURNEY TO THE SCREEN STARTS HERE.
            </h2>
            <p className="text-sm text-white/70 max-w-2xl">
              CineVenue Productions is actively searching for new lead actors, supporting cast, dancers, child artists, voice talents, and film crew.
            </p>
          </div>

          {/* Active Casting Calls List */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gold flex items-center gap-2">
              <Clapperboard className="w-4 h-4 text-gold" />
              Open Casting Opportunities
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {castingCalls.map(call => (
                <div key={call.id} className="bg-black/60 border border-white/10 rounded-2xl p-5 space-y-3 hover:border-gold/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase">
                      {call.category}
                    </span>
                    <span className="text-[10px] text-rose-400 font-bold uppercase font-mono">
                      Deadline: {call.deadline}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-base">{call.roleTitle}</h4>
                    <p className="text-xs text-gold">Project: {call.projectTitle}</p>
                  </div>

                  <p className="text-xs text-white/70 line-clamp-2">{call.description}</p>

                  <div className="text-[11px] text-white/50 space-y-1 pt-1 border-t border-white/5">
                    <p><strong>Requirements:</strong> {call.ageRange} ({call.gender}) • {call.language}</p>
                    <p><strong>Location:</strong> {call.location}</p>
                  </div>

                  <button
                    onClick={() => setActiveCastingCall(call)}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-gold to-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>APPLY FOR THIS ROLE</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: SUBMIT YOUR STORY */}
      <section id="story" className="py-16 px-6 bg-[#0B0B0E] border-y border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-bold uppercase tracking-widest">
              For Writers & Directors
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-white">
              HAVE A STORY WORTH TELLING?
            </h2>
            <p className="text-sm text-white/80 leading-relaxed font-sans">
              CineVenue Script Registry evaluates screenplays, story outlines, and film proposals for co-production, financing, and development.
            </p>

            <div className="space-y-3 text-xs text-white/70">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Confidential NDA & Encryption Protection for your Intellectual Property</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Evaluated directly by CineVenue Executive Creative Board</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant Reference ID to track script review status</span>
              </p>
            </div>

            <button
              onClick={() => setIsStoryModalOpen(true)}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-500 text-black font-extrabold text-xs uppercase tracking-widest hover:opacity-90 shadow-xl shadow-gold/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>SUBMIT YOUR SCRIPT / PITCH DECK</span>
            </button>
          </div>

          <div className="lg:col-span-5 bg-[#121217] p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Script Submission Checklist
            </h3>
            <ul className="space-y-2 text-xs text-white/70">
              <li>• Complete Project Title & Logline (1-2 sentences)</li>
              <li>• Detailed Plot Synopsis including climax</li>
              <li>• Writer & Director Biography</li>
              <li>• Estimated Budget Category</li>
              <li>• PDF Script or Pitch Deck Document</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 7: CINEVENUE EVENTS & MANAGEMENT */}
      <section id="events" className="py-16 px-6 max-w-7xl mx-auto space-y-8">
        <div className="space-y-3">
          <span className="text-gold text-xs font-bold uppercase tracking-widest block">Live Experience Arm</span>
          <h2 className="text-2xl sm:text-4xl font-serif font-extrabold text-white">CINEVENUE EVENTS</h2>
          <p className="text-xs text-white/60">
            We don't just sell event tickets — we plan, manage, and produce large-scale concerts, audio launches, and award galas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#0F0F14] border border-white/10 p-6 rounded-2xl space-y-3 hover:border-gold/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              🎤
            </div>
            <h3 className="font-bold text-white text-base">Movie Premieres & Audio Launches</h3>
            <p className="text-xs text-white/60">Full stadium stage setup, LED backdrop wall, celebrity green rooms, and red carpet security.</p>
          </div>

          <div className="bg-[#0F0F14] border border-white/10 p-6 rounded-2xl space-y-3 hover:border-gold/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              🎪
            </div>
            <h3 className="font-bold text-white text-base">Concerts & Music Festivals</h3>
            <p className="text-xs text-white/60">End-to-end ticketing, QR entry scanners, sound systems, artist green rooms, and crowd safety.</p>
          </div>

          <div className="bg-[#0F0F14] border border-white/10 p-6 rounded-2xl space-y-3 hover:border-gold/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              🏆
            </div>
            <h3 className="font-bold text-white text-base">College & Corporate Galas</h3>
            <p className="text-xs text-white/60">Turnkey event planning for college fests, corporate brand product reveals, and award shows.</p>
          </div>
        </div>
      </section>

      {/* SECTION 8: CINEVENUE BRAND STUDIO */}
      <section id="brand" className="py-16 px-6 bg-[#0B0B0E] border-y border-white/10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-gold text-xs font-bold uppercase tracking-widest block">Corporate Marketing</span>
              <h2 className="text-2xl sm:text-4xl font-serif font-extrabold text-white">CINEVENUE BRAND STUDIO</h2>
            </div>
            <button
              onClick={() => setIsBrandModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 cursor-pointer shadow-lg shadow-gold/10"
            >
              START A BRAND CAMPAIGN
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-[#121217] p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-gold font-bold uppercase text-[10px]">01. Movie Placement</span>
              <h4 className="font-bold text-white text-sm">In-Movie Integration</h4>
              <p className="text-white/60">Seamless hero vehicle, gadget, or apparel product placement inside upcoming films.</p>
            </div>

            <div className="bg-[#121217] p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-gold font-bold uppercase text-[10px]">02. Event Sponsorship</span>
              <h4 className="font-bold text-white text-sm">Stage & Arena Branding</h4>
              <p className="text-white/60">Title sponsorship and booth activations at star audio launches and concerts.</p>
            </div>

            <div className="bg-[#121217] p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-gold font-bold uppercase text-[10px]">03. Digital Takeover</span>
              <h4 className="font-bold text-white text-sm">Multiplex & App Ads</h4>
              <p className="text-white/60">Lobby screen buys across 250+ multiplexes and hero slider banners in CineVenue App.</p>
            </div>

            <div className="bg-[#121217] p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-gold font-bold uppercase text-[10px]">04. Commercial Content</span>
              <h4 className="font-bold text-white text-sm">Brand Film Production</h4>
              <p className="text-white/60">High-speed 4K IMAX commercials starring top celebrities produced by CineVenue crew.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: BEHIND THE SCENES GALLERY */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-8">
        <div className="space-y-2 border-b border-white/10 pb-4">
          <span className="text-gold text-xs font-bold uppercase tracking-widest block">Exclusive Access</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-white">BEHIND THE SCENES</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {btsItems.map(bts => (
            <div key={bts.id} className="bg-[#0E0E12] border border-white/10 rounded-2xl overflow-hidden space-y-3">
              <img src={bts.mediaUrl} alt={bts.title} className="w-full h-48 object-cover" />
              <div className="p-4 space-y-1">
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase rounded">
                  {bts.category}
                </span>
                <h4 className="font-bold text-white text-sm pt-1">{bts.title}</h4>
                <p className="text-xs text-white/60">{bts.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 10: NEWS & PRESS ANNOUNCEMENTS */}
      <section id="news" className="py-16 px-6 bg-[#0B0B0E] border-y border-white/10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2 border-b border-white/10 pb-4">
            <span className="text-gold text-xs font-bold uppercase tracking-widest block">Press Desk</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-white">NEWS & ANNOUNCEMENTS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsArticles.map(art => (
              <div key={art.id} className="bg-[#121217] border border-white/10 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <img src={art.image} alt={art.title} className="w-full h-40 object-cover rounded-xl" />
                  <span className="text-[10px] text-amber-400 font-bold uppercase">{art.category} • {art.date}</span>
                  <h3 className="font-bold text-white text-base leading-snug">{art.title}</h3>
                  <p className="text-xs text-white/60 line-clamp-3">{art.summary}</p>
                </div>
                <button
                  onClick={() => setActiveNewsModal(art)}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/10 transition-all cursor-pointer mt-2"
                >
                  Read Full Press Release
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 11: ABOUT CINEVENUE PRODUCTIONS */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-8 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-gold text-xs font-bold uppercase tracking-widest">Company Overview</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-white">ABOUT CINEVENUE PRODUCTIONS</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            CineVenue Productions is an end-to-end entertainment company connecting stories, talent, events, brands, and audiences under one unified ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left pt-4">
          <div className="bg-[#0E0E12] p-6 rounded-2xl border border-white/10 space-y-2">
            <h4 className="font-bold text-gold text-base">🎬 WHAT WE PRODUCE</h4>
            <p className="text-xs text-white/60">Pan-Indian Feature Films, High-Budget Web Series, Short Films, and Music Videos.</p>
          </div>

          <div className="bg-[#0E0E12] p-6 rounded-2xl border border-white/10 space-y-2">
            <h4 className="font-bold text-emerald-400 text-base">🎪 WHAT WE MANAGE</h4>
            <p className="text-xs text-white/60">Audio Launches, Movie Premieres, Concerts, Festivals, and Award Shows.</p>
          </div>

          <div className="bg-[#0E0E12] p-6 rounded-2xl border border-white/10 space-y-2">
            <h4 className="font-bold text-cyan-400 text-base">📢 WHAT WE PROMOTE</h4>
            <p className="text-xs text-white/60">Brands, Movies, Artists, Celebrity Campaigns, and Multiplex Ad Buys.</p>
          </div>

          <div className="bg-[#0E0E12] p-6 rounded-2xl border border-white/10 space-y-2">
            <h4 className="font-bold text-amber-400 text-base">🎭 WHO CAN JOIN</h4>
            <p className="text-xs text-white/60">Actors, Writers, Directors, Technicians, Producers, Brands, and Fans.</p>
          </div>
        </div>
      </section>
            </>
          )}
        </>
      )}

      {/* ALL MODALS */}

      {/* 24 Crafts Film Production Admin Console Modal */}
      {isFilmMarketplaceAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-6xl bg-[#0D0E15] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-auto max-h-[92vh] flex flex-col p-6">
            <div className="flex justify-end pb-2">
              <button
                onClick={() => setIsFilmMarketplaceAdminOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs font-bold cursor-pointer"
              >
                Close Admin Console ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <CineVenueFilmAdminTab />
            </div>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {activeProjectDetail && (
        <ProductionDetailsModal
          project={activeProjectDetail}
          onClose={() => setActiveProjectDetail(null)}
          onBookTickets={onBookTickets}
          onFollowProject={toggleFollowProject}
          isFollowing={followedProjectIds.includes(activeProjectDetail.id)}
        />
      )}

      {/* Casting Application Modal */}
      {activeCastingCall && (
        <CastingApplicationModal
          castingCall={activeCastingCall}
          onClose={() => setActiveCastingCall(null)}
          onSubmitApplication={(appData) => {
            if (onAddCastingApplication) onAddCastingApplication(appData);
            showToast("🎉 Audition application submitted successfully!");
          }}
          userEmail={userEmail}
        />
      )}

      {/* Story Submission Modal */}
      <StorySubmissionModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        onSubmitStory={(sub) => {
          setStorySubmissions([sub, ...storySubmissions]);
          showToast("🎉 Story submission received and encrypted under NDA!");
        }}
        userEmail={userEmail}
      />

      {/* Brand Campaign Modal */}
      <BrandCampaignModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        onSubmitCampaign={(req) => {
          setBrandCampaigns([req, ...brandCampaigns]);
          showToast("🎉 Brand campaign request submitted successfully!");
        }}
      />

      {/* Partner Enquiry Modal */}
      <PartnerEnquiryModal
        isOpen={isPartnerModalOpen}
        initialCategory={partnerInitialCat}
        onClose={() => setIsPartnerModalOpen(false)}
        onSubmitEnquiry={(enq) => {
          setPartnerEnquiries([enq, ...partnerEnquiries]);
          showToast("🎉 Partnership proposal submitted!");
        }}
      />

      {/* News Press Release Article Modal */}
      {activeNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#0F0F12] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-4 my-8">
            <button
              onClick={() => setActiveNewsModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-white/70 hover:text-white"
            >
              Close
            </button>
            <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase">
              {activeNewsModal.category} • {activeNewsModal.date}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">{activeNewsModal.title}</h2>
            <img src={activeNewsModal.image} alt={activeNewsModal.title} className="w-full h-56 object-cover rounded-xl border border-white/10" />
            <p className="text-xs text-white/80 leading-relaxed">{activeNewsModal.content}</p>
            <p className="text-[10px] text-white/40">Published by: {activeNewsModal.author}</p>
          </div>
        </div>
      )}

      {/* Film Project Submission Application Modal */}
      <FilmProjectApplicationModal
        isOpen={isFilmAppModalOpen}
        onClose={() => setIsFilmAppModalOpen(false)}
        onSubmitApplication={(app) => {
          setFilmApplications([app, ...filmApplications]);
          showToast(`🎉 Application ${app.id} submitted securely under NDA!`);
        }}
        userEmail={userEmail}
        onOpenDashboard={() => {
          setIsFilmAppModalOpen(false);
          setIsDashboardModalOpen(true);
        }}
      />

      {/* Applicant Portal Dashboard Modal */}
      <ApplicantDashboardModal
        isOpen={isDashboardModalOpen}
        onClose={() => setIsDashboardModalOpen(false)}
        userEmail={userEmail}
        applications={filmApplications}
        onUpdateApplication={(updated) => {
          setFilmApplications(filmApplications.map(a => a.id === updated.id ? updated : a));
          showToast("🎉 Application response updated!");
        }}
        onNewSubmission={() => setIsFilmAppModalOpen(true)}
      />

      {/* CineVenue Productions Complete Admin Panel Modal */}
      <CineVenueProductionsAdminPanel
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        applications={filmApplications}
        onUpdateApplication={(updated) => {
          setFilmApplications(filmApplications.map(a => a.id === updated.id ? updated : a));
          showToast("🎉 Application status updated!");
        }}
        projects={projects}
        onUpdateProjects={setProjects}
        castingCalls={castingCalls}
        onUpdateCastingCalls={setCastingCalls}
        newsArticles={newsArticles}
        onUpdateNewsArticles={setNewsArticles}
        btsItems={btsItems}
        onUpdateBtsItems={setBtsItems}
        brandCampaigns={brandCampaigns}
        onUpdateBrandCampaigns={setBrandCampaigns}
        partnerEnquiries={partnerEnquiries}
        onUpdatePartnerEnquiries={setPartnerEnquiries}
        eventRequests={eventRequests}
        onUpdateEventRequests={setEventRequests}
        publicEvents={publicEvents}
        onUpdatePublicEvents={setPublicEvents}
        artistRequests={artistRequests}
        onUpdateArtistRequests={setArtistRequests}
        sponsorshipRequests={sponsorshipRequests}
        onUpdateSponsorshipRequests={setSponsorshipRequests}
        eventPortfolio={eventPortfolio}
        onUpdateEventPortfolio={setEventPortfolio}
        promotionCampaigns={promotionCampaigns}
        onUpdatePromotionCampaigns={setPromotionCampaigns}
      />

      {/* Application Forms Hub Modal */}
      <ApplicationFormsHubModal
        isOpen={isAppHubModalOpen}
        onClose={() => setIsAppHubModalOpen(false)}
        onOpenFilmApp={() => setIsFilmAppModalOpen(true)}
        onOpenStoryApp={() => setIsStoryModalOpen(true)}
        onOpenBrandApp={() => setIsBrandModalOpen(true)}
        onOpenPartnerApp={(cat) => {
          if (cat) setPartnerInitialCat(cat);
          setIsPartnerModalOpen(true);
        }}
        onAddEventRequest={(req) => {
          setEventRequests([req, ...eventRequests]);
          showToast("🎉 Event request submitted!");
        }}
        onAddArtistRequest={(req) => {
          setArtistRequests([req, ...artistRequests]);
          showToast("🎉 Artist booking request submitted!");
        }}
        onAddSponsorshipRequest={(req) => {
          setSponsorshipRequests([req, ...sponsorshipRequests]);
          showToast("🎉 Sponsorship proposal submitted!");
        }}
        userEmail={userEmail}
      />

      {/* Floating Application Forms Button */}
      <button
        onClick={() => setIsAppHubModalOpen(true)}
        className="fixed bottom-6 left-6 z-40 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-2xl shadow-gold/30 hover:scale-105 transition-all cursor-pointer flex items-center gap-2 border border-gold/40"
      >
        <FileText className="w-4 h-4 fill-black" />
        <span className="hidden sm:inline">📝 Application Forms</span>
      </button>

    </div>
  );
}
