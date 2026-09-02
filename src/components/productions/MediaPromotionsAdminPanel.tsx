import React, { useState } from "react";
import { 
  Megaphone, Film, Users, DollarSign, BarChart3, Search, Filter, Plus, 
  Eye, Edit3, Trash2, CheckCircle2, Send, Tag, Sparkles, Globe, Tv, 
  Camera, Play, Video, Share2, Layers, Award, Check, X, ShieldCheck,
  Link as LinkIcon, Calendar, Bell, Lock, FileText, Folder, MessageSquare, Clock,
  ArrowUpRight, TrendingUp, Radio, Smartphone, QrCode, ClipboardList, UserCheck,
  Activity, Sliders, AlertCircle, Download, Copy, ExternalLink, RefreshCw, Star
} from "lucide-react";

import { PromotionCampaign, BrandCampaignRequest } from "../../types/productions";

interface MediaPromotionsAdminPanelProps {
  campaigns: PromotionCampaign[];
  onUpdateCampaigns: (campaigns: PromotionCampaign[]) => void;
  brandRequests: BrandCampaignRequest[];
  onUpdateBrandRequests: (requests: BrandCampaignRequest[]) => void;
}

export default function MediaPromotionsAdminPanel({
  campaigns,
  onUpdateCampaigns,
  brandRequests,
  onUpdateBrandRequests
}: MediaPromotionsAdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    | "dashboard"
    | "campaigns"
    | "film_promotions"
    | "short_film_promotions"
    | "event_promotions"
    | "brand_promotions"
    | "casting_promotions"
    | "artist_promotions"
    | "content_studio"
    | "media_library"
    | "social_media"
    | "press_media"
    | "influencers"
    | "advertising"
    | "promotion_links"
    | "deliverables"
    | "team"
    | "analytics"
    | "notifications"
    | "permissions"
    | "audit_logs"
  >("dashboard");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // New Campaign Modal
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [newCampaignForm, setNewCampaignForm] = useState({
    title: "",
    clientOrMovie: "",
    promotedType: "Film" as PromotionCampaign["promotedType"],
    channels: ["YouTube", "Instagram Reels", "Multiplex Screens"],
    budget: "₹2,500,000",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "2026-12-31",
    status: "Active" as PromotionCampaign["status"]
  });

  // Smart Link Generator state
  const [linkMovie, setLinkMovie] = useState("RAMA: Pre-Release");
  const [linkSource, setLinkSource] = useState("Instagram");
  const [generatedLink, setGeneratedLink] = useState("");

  // Content Studio State
  const [aiHeadline, setAiHeadline] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Initial Mock State for Extended Modules
  const [filmPromos] = useState([
    { id: "FP-101", title: "RAMA: Pre-Release Hype", format: "Theatrical Feature", releaseDate: "2026-09-15", buzzScore: "98/100", trailersCount: 3, cityTours: ["Hyderabad", "Vizag", "Vijayawada", "Tirupati"], status: "Active Blitz" },
    { id: "FP-102", title: "Project K: Global Teaser Launch", format: "Pan-India Sci-Fi", releaseDate: "2026-11-20", buzzScore: "94/100", trailersCount: 2, cityTours: ["Hyderabad", "Mumbai", "Bangalore", "Chennai"], status: "Scheduled" }
  ]);

  const [shortFilmPromos] = useState([
    { id: "SFP-201", title: "The Last Horizon", director: "Anand Varma", platform: "YouTube / CineVenue Shorts", status: "Festival Run", views: "450K+" },
    { id: "SFP-202", title: "Echoes of Silence", director: "Priya Reddy", platform: "OTT Premiere Drive", status: "Trending", views: "1.2M+" }
  ]);

  const [eventPromos] = useState([
    { id: "EP-301", title: "Thaman S. Live Concert & Audio Launch", venue: "Gachibowli Stadium", date: "2026-08-28", ticketsSold: "18,500 / 20,000", status: "Live Campaign" },
    { id: "EP-302", title: "Tollywood Star Night Pre-Release", venue: "LB Stadium, Hyderabad", date: "2026-09-10", ticketsSold: "25,000 / 25,000", status: "Sold Out Blitz" }
  ]);

  const [castingPromos] = useState([
    { id: "CP-401", title: "Lead Heroine Search for CineVenue Original", applicantsCount: "1,420 Submissions", reach: "1.8M Reach", status: "Open Drive" },
    { id: "CP-402", title: "Child Artists Audition Call", applicantsCount: "680 Submissions", reach: "920K Reach", status: "Shortlisting" }
  ]);

  const [artistPromos] = useState([
    { id: "AP-501", artist: "S.S. Thaman", campaign: "20 Years Musical Journey Blitz", coverage: "35 Media Outlets", status: "Active PR" },
    { id: "AP-502", artist: "Shreya Ghoshal", campaign: "Concert Tour Press Drive", coverage: "50 Media Outlets", status: "Completed" }
  ]);

  const [mediaAssets] = useState([
    { id: "MA-01", title: "RAMA Official Teaser 4K Uncompressed Master", type: "Video Master", size: "1.8 GB", format: "ProRes 422", downloads: 142 },
    { id: "MA-02", title: "RAMA First Look High-Res Poster Suite (4K)", type: "Graphic Kit", size: "450 MB", format: "PSD + PNG", downloads: 380 },
    { id: "MA-03", title: "Press Release Kit & Cast Bios (English & Telugu)", type: "Press Doc", size: "12 MB", format: "PDF + DOCX", downloads: 520 },
    { id: "MA-04", title: "Audio Stems - RAMA Title Song Wav", type: "Audio Track", size: "220 MB", format: "WAV 24-bit", downloads: 89 }
  ]);

  const [socialPosts] = useState([
    { id: "SP-101", platform: "Instagram Reels", content: "🔥 Behind-the-scenes action sequence from RAMA!", scheduledFor: "Today, 18:00 IST", status: "Scheduled", engagements: "Estimated 250K+" },
    { id: "SP-102", platform: "YouTube Shorts", content: "Thaman's electric BGM preview for RAMA Audio Launch!", scheduledFor: "Tomorrow, 10:00 IST", status: "Queued", engagements: "Estimated 500K+" },
    { id: "SP-103", platform: "X (Twitter)", content: "Official #RAMATrailer drops in 48 hours! Retweet to register for early pass.", scheduledFor: "Live Now", status: "Published", engagements: "45.2K Retweets" }
  ]);

  const [pressContacts] = useState([
    { id: "PR-01", outlet: "Gulte Cinema", journalist: "Sravan Kumar", designation: "Chief Film Reporter", status: "Verified VIP" },
    { id: "PR-02", outlet: "GreatAndhra", journalist: "Ramesh Babu", designation: "Senior Editor", status: "Verified VIP" },
    { id: "PR-03", outlet: "Times of India Film Bureau", journalist: "Meera Nair", designation: "Entertainment Lead", status: "Active" },
    { id: "PR-04", outlet: "Film Companion South", journalist: "Baradwaj Rangan Team", designation: "Film Critic & Interviewer", status: "Partner" }
  ]);

  const [influencerList] = useState([
    { id: "INF-01", name: "Tollywood Express", platform: "YouTube", handle: "@TollywoodExpress", followers: "2.4M", reachRate: "88%", avgFee: "₹1,50,000", status: "Contracted" },
    { id: "INF-02", name: "Telugu Movie Vibe", platform: "Instagram", handle: "@TeluguVibe", followers: "1.8M", reachRate: "92%", avgFee: "₹1,20,000", status: "Contracted" },
    { id: "INF-03", name: "Hyd Cine Club", platform: "X / Twitter", handle: "@HydCineClub", followers: "950K", reachRate: "85%", avgFee: "₹60,000", status: "Available" }
  ]);

  const [adCampaigns] = useState([
    { id: "AD-01", name: "Meta Video Ad Blitz - Telugu States", budgetSpent: "₹4,50,000", totalBudget: "₹10,000,000", ctr: "3.4%", ticketLeads: "12,400", platform: "Instagram & Facebook" },
    { id: "AD-02", name: "YouTube Pre-Roll 15s Trailer Ad", budgetSpent: "₹8,20,000", totalBudget: "₹15,000,000", ctr: "4.8%", ticketLeads: "28,900", platform: "YouTube TrueView" },
    { id: "AD-03", name: "Multiplex On-Screen Standee Ads", budgetSpent: "₹3,00,000", totalBudget: "₹5,00,000", ctr: "N/A (Footfall)", ticketLeads: "8,500", platform: "PVR & INOX Screens" }
  ]);

  const [deliverableTasks] = useState([
    { id: "DEL-01", title: "4K Master Trailer Render for Multiplexes", campaign: "RAMA: Pre-Release", dueDate: "2026-08-20", assignee: "Praveen V. (Post-Prod)", status: "In Review" },
    { id: "DEL-02", title: "Lyrical Video Cut - Title Track", campaign: "RAMA: Pre-Release", dueDate: "2026-08-25", assignee: "Anu S. (Video Editor)", status: "Approved" },
    { id: "DEL-03", title: "Sponsor Brand In-Film Bug Integration", campaign: "Airtel / RAMA Co-Branding", dueDate: "2026-08-22", assignee: "VFX Team", status: "Pending" }
  ]);

  const [teamMembers] = useState([
    { id: "TM-01", name: "Vikramaditya Raju", role: "Head of Media & Promotions", email: "vikram@cinevenue.com", activeCampaigns: 6, status: "Active" },
    { id: "TM-02", name: "Kavya Sharma", role: "PR & Journalist Relations Lead", email: "kavya.pr@cinevenue.com", activeCampaigns: 4, status: "Active" },
    { TM_03: "TM-03", name: "Rahul Varma", role: "Social Media & Digital Amplification", email: "rahul.social@cinevenue.com", activeCampaigns: 8, status: "Active" },
    { TM_04: "TM-04", name: "Suresh N.", role: "Creative Director & Poster Designer", email: "suresh.design@cinevenue.com", activeCampaigns: 5, status: "Active" }
  ]);

  const [auditLogsList] = useState([
    { id: "LOG-901", action: "Campaign Launched", detail: "Published 'RAMA: Pre-Release Hype' campaign with budget ₹2.5 Cr", user: "Vikramaditya Raju", timestamp: "2026-08-08 22:15 IST" },
    { id: "LOG-902", action: "Asset Uploaded", detail: "Added 'RAMA Official Teaser 4K Uncompressed Master' to Media Library", user: "Suresh N.", timestamp: "2026-08-08 20:40 IST" },
    { id: "LOG-903", action: "Press Release Sent", detail: "Dispatched press invitation to 45 verified film journalists", user: "Kavya Sharma", timestamp: "2026-08-08 18:10 IST" },
    { id: "LOG-904", action: "Ad Spend Approved", detail: "Approved ₹10 Lakhs Meta Ads budget allocation for Vijayawada region", user: "Admin", timestamp: "2026-08-08 15:30 IST" }
  ]);

  // Action Handlers
  const handleCreateCampaign = () => {
    if (!newCampaignForm.title || !newCampaignForm.clientOrMovie) {
      alert("Please fill in campaign title and movie/brand name.");
      return;
    }

    const campaign: PromotionCampaign = {
      id: `CAM-00${campaigns.length + 1}`,
      name: newCampaignForm.title,
      promotedType: newCampaignForm.promotedType,
      relatedTitle: newCampaignForm.clientOrMovie,
      objective: "Awareness",
      startDate: newCampaignForm.startDate || new Date().toISOString().split("T")[0],
      endDate: newCampaignForm.endDate || "2026-12-31",
      targetAudience: "Pan-India Film Audiences",
      targetLocations: "Telangana, AP, Karnataka, Pan-India",
      languages: ["Telugu", "Hindi"],
      budget: newCampaignForm.budget || "₹1,000,000",
      status: newCampaignForm.status,
      manager: "CineVenue Media Team",
      description: "Comprehensive multi-channel digital and theater promotional campaign.",
      deliverables: [
        { title: "Teaser Launch", required: 1, completed: 1, status: "Completed" },
        { title: "Trailer Blitz", required: 1, completed: 0, status: "In Progress" }
      ],
      reachImpressions: 5000000,
      totalViews: 2500000,
      clicks: 180000,
      ticketConversions: 45000
    };

    onUpdateCampaigns([campaign, ...campaigns]);
    setIsNewCampaignOpen(false);
    alert("🚀 Promotion campaign created and published!");
  };

  const handleUpdateBrandStatus = (id: string, newStatus: BrandCampaignRequest["status"]) => {
    const updated = brandRequests.map(b => b.id === id ? { ...b, status: newStatus } : b);
    onUpdateBrandRequests(updated);
  };

  const handleGenerateSmartLink = () => {
    const slug = linkMovie.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const source = linkSource.toLowerCase();
    const link = `https://cinevenue.com/p/${slug}?utm_source=${source}&utm_medium=media_blitz&utm_campaign=official_promo`;
    setGeneratedLink(link);
  };

  const handleGenerateAiHeadline = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      setAiHeadline("🔥 BREAKING: The Ultimate Pre-Release Teaser drops today! Witness the grand spectacle only on CineVenue.");
      setIsGeneratingAi(false);
    }, 600);
  };

  const filteredCampaigns = campaigns.filter(c => {
    const title = c.name || (c as any).title || "";
    const client = c.relatedTitle || (c as any).clientOrMovie || "";
    const matchesSearch = !searchQuery || 
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const allSubTabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "campaigns", label: `Campaigns (${campaigns.length})`, icon: Megaphone },
    { id: "film_promotions", label: "Film Promotions", icon: Film },
    { id: "short_film_promotions", label: "Short Film Promotions", icon: Video },
    { id: "event_promotions", label: "Event Promotions", icon: Calendar },
    { id: "brand_promotions", label: `Brand Deals (${brandRequests.length})`, icon: Tag },
    { id: "casting_promotions", label: "Casting Promotions", icon: UserCheck },
    { id: "artist_promotions", label: "Artist PR", icon: Star },
    { id: "content_studio", label: "Content Studio", icon: Sparkles },
    { id: "media_library", label: "Media Library", icon: Folder },
    { id: "social_media", label: "Social Media", icon: Share2 },
    { id: "press_media", label: "Press & Media", icon: Radio },
    { id: "influencers", label: "Influencers", icon: Users },
    { id: "advertising", label: "Advertising", icon: DollarSign },
    { id: "promotion_links", label: "Smart Links & QR", icon: QrCode },
    { id: "deliverables", label: "Deliverables", icon: ClipboardList },
    { id: "team", label: "Team", icon: Users },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "permissions", label: "Permissions", icon: ShieldCheck },
    { id: "audit_logs", label: "Audit Logs", icon: Clock }
  ];

  return (
    <div className="space-y-6 text-xs text-white">
      
      {/* Sub-Navigation Header with Scrollable Badges */}
      <div className="bg-[#11121A] border border-white/10 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-serif font-bold text-white text-base">Media & Promotions Control Center</h2>
              <p className="text-white/50 text-[11px]">Central engine for film trailers, PR press releases, brand deals, and multi-platform media campaigns.</p>
            </div>
          </div>

          <button
            onClick={() => setIsNewCampaignOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-gold text-black font-extrabold rounded-xl shadow-lg hover:brightness-110 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Launch Campaign
          </button>
        </div>

        {/* Extended 21 Sub-tabs pill bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-white/10 no-scrollbar">
          {allSubTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap border ${
                  isActive 
                    ? "bg-amber-500/20 border-amber-500/60 text-amber-400 shadow-md scale-[1.02]" 
                    : "bg-black/40 border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-white/40"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. DASHBOARD OVERVIEW */}
      {activeSubTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#11121A] border border-white/10 rounded-2xl p-4 space-y-1">
              <span className="text-white/50 text-[10px] uppercase font-bold tracking-wider block">Total Active Runs</span>
              <span className="font-mono text-2xl font-bold text-amber-400">{campaigns.filter(c => c.status === "Active").length + 4} Campaigns</span>
              <p className="text-emerald-400 text-[10px] flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +24% Impressions this week</p>
            </div>
            <div className="bg-[#11121A] border border-white/10 rounded-2xl p-4 space-y-1">
              <span className="text-white/50 text-[10px] uppercase font-bold tracking-wider block">Cross-Platform Reach</span>
              <span className="font-mono text-2xl font-bold text-cyan-400">128.5M+</span>
              <p className="text-white/40 text-[10px]">YouTube, Insta, X & Theater Screens</p>
            </div>
            <div className="bg-[#11121A] border border-white/10 rounded-2xl p-4 space-y-1">
              <span className="text-white/50 text-[10px] uppercase font-bold tracking-wider block">Brand Partnerships</span>
              <span className="font-mono text-2xl font-bold text-gold">{brandRequests.length} Active Deals</span>
              <p className="text-gold text-[10px]">In-Film Sponsorships</p>
            </div>
            <div className="bg-[#11121A] border border-white/10 rounded-2xl p-4 space-y-1">
              <span className="text-white/50 text-[10px] uppercase font-bold tracking-wider block">Ticket Conversion ROI</span>
              <span className="font-mono text-2xl font-bold text-emerald-400">8.4x Return</span>
              <p className="text-emerald-400 text-[10px]">Direct CineVenue Ticket Sales</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#11121A] border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" /> Live Campaign Status Snapshot
              </h3>
              <div className="space-y-3">
                {campaigns.slice(0, 3).map(c => (
                  <div key={c.id} className="p-3 bg-black/50 border border-white/10 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">{c.name}</h4>
                      <p className="text-white/50 text-[11px]">{c.promotedType} • {c.relatedTitle}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#11121A] border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" /> Quick PR & Media Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveSubTab("content_studio")}
                  className="p-3 bg-black/50 border border-white/10 hover:border-amber-500/50 rounded-xl text-left cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 mb-1" />
                  <h4 className="font-bold text-white text-xs">AI Copy Generator</h4>
                  <p className="text-white/40 text-[10px]">Draft promo copy & tags</p>
                </button>
                <button
                  onClick={() => setActiveSubTab("promotion_links")}
                  className="p-3 bg-black/50 border border-white/10 hover:border-amber-500/50 rounded-xl text-left cursor-pointer transition-all"
                >
                  <QrCode className="w-4 h-4 text-cyan-400 mb-1" />
                  <h4 className="font-bold text-white text-xs">Create Smart QR</h4>
                  <p className="text-white/40 text-[10px]">Poster tracking URLs</p>
                </button>
                <button
                  onClick={() => setActiveSubTab("press_media")}
                  className="p-3 bg-black/50 border border-white/10 hover:border-amber-500/50 rounded-xl text-left cursor-pointer transition-all"
                >
                  <Radio className="w-4 h-4 text-emerald-400 mb-1" />
                  <h4 className="font-bold text-white text-xs">Press Wire Dispatch</h4>
                  <p className="text-white/40 text-[10px]">Send news to journalists</p>
                </button>
                <button
                  onClick={() => setActiveSubTab("media_library")}
                  className="p-3 bg-black/50 border border-white/10 hover:border-amber-500/50 rounded-xl text-left cursor-pointer transition-all"
                >
                  <Folder className="w-4 h-4 text-gold mb-1" />
                  <h4 className="font-bold text-white text-xs">Upload 4K Master</h4>
                  <p className="text-white/40 text-[10px]">Store trailers & stills</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CAMPAIGNS */}
      {activeSubTab === "campaigns" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#14151E] p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-black/60 border border-white/10 px-3 py-2 rounded-xl">
              <Search className="w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search campaign or movie title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white w-full text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white/50 text-xs font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-bold outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCampaigns.map(c => {
              const title = c.name || (c as any).title || "Untitled Campaign";
              const client = c.relatedTitle || (c as any).clientOrMovie || "CineVenue Project";
              const channels = (c as any).channels || ["YouTube", "Instagram Reels", "Multiplex Screens"];
              const impressions = c.reachImpressions ? `${(c.reachImpressions / 1000000).toFixed(1)}M+` : "2.5M+";

              return (
                <div key={c.id} className="bg-[#11121A] border border-white/10 rounded-2xl p-5 space-y-4 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                        {c.id}
                      </span>
                      <h4 className="font-serif font-bold text-white text-base mt-1">{title}</h4>
                      <p className="text-white/60 text-xs">Movie/Brand: <span className="text-gold font-bold">{client}</span></p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {c.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {channels.map((ch: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/70">
                        {ch}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-black/50 p-3 rounded-xl text-center border border-white/5">
                    <div>
                      <span className="text-[10px] text-white/40 uppercase block">Impressions</span>
                      <span className="font-mono font-bold text-cyan-400 text-xs">{impressions}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 uppercase block">Objective</span>
                      <span className="font-mono font-bold text-amber-400 text-xs">{c.objective}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 uppercase block">Manager</span>
                      <span className="font-mono font-bold text-emerald-400 text-xs">{c.manager}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 text-white/50">
                    <span>Timeline: {c.startDate} - {c.endDate}</span>
                    <span className="text-gold font-bold">Budget: {c.budget}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. FILM PROMOTIONS */}
      {activeSubTab === "film_promotions" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Film className="w-4 h-4 text-gold" /> Feature Film Promotion & City Tour Schedules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filmPromos.map(fp => (
              <div key={fp.id} className="p-4 bg-black/50 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{fp.title}</h4>
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                    {fp.status}
                  </span>
                </div>
                <p className="text-white/60 text-xs">{fp.format} • Release Date: <span className="text-amber-400 font-bold">{fp.releaseDate}</span></p>
                <div className="bg-white/5 p-2.5 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-white/50">Pre-Release Buzz Score:</span>
                    <span className="text-emerald-400 font-bold">{fp.buzzScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Promotional City Tours:</span>
                    <span className="text-gold font-bold">{fp.cityTours.join(", ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SHORT FILM PROMOTIONS */}
      {activeSubTab === "short_film_promotions" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Video className="w-4 h-4 text-cyan-400" /> Short Film & Independent Cinema Promotions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortFilmPromos.map(sfp => (
              <div key={sfp.id} className="p-4 bg-black/50 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{sfp.title}</h4>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold">
                    {sfp.status}
                  </span>
                </div>
                <p className="text-white/60 text-xs">Director: {sfp.director} • Platform: {sfp.platform}</p>
                <p className="text-gold text-xs font-bold">Organic Views: {sfp.views}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. EVENT PROMOTIONS */}
      {activeSubTab === "event_promotions" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" /> Concerts & Audio Launch Event Media Drives
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventPromos.map(ep => (
              <div key={ep.id} className="p-4 bg-black/50 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{ep.title}</h4>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-bold">
                    {ep.status}
                  </span>
                </div>
                <p className="text-white/60 text-xs">Venue: {ep.venue} • Date: {ep.date}</p>
                <p className="text-emerald-400 text-xs font-bold">Tickets Sold: {ep.ticketsSold}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. BRAND PROMOTIONS */}
      {activeSubTab === "brand_promotions" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-4 h-4 text-gold" /> Brand Sponsorships & In-Film Placement Deals
          </h3>
          <div className="space-y-3">
            {brandRequests.map(b => (
              <div key={b.id} className="bg-black/50 border border-white/10 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{b.brandName}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                      {b.campaignType}
                    </span>
                  </div>
                  <p className="text-white/60 text-xs">Contact: {b.contactPerson} ({b.email} • {b.phone})</p>
                  <p className="text-white/50 text-[11px]">Budget: <span className="text-gold font-bold">{b.budgetRange}</span> • Target: {b.targetAudience}</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={b.status}
                    onChange={(e) => handleUpdateBrandStatus(b.id, e.target.value as any)}
                    className="bg-black border border-white/20 rounded-xl px-3 py-1.5 text-white font-bold outline-none cursor-pointer text-xs"
                  >
                    <option value="Received">Received</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Live">Live</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. CASTING PROMOTIONS */}
      {activeSubTab === "casting_promotions" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400" /> Casting Call Amplification Campaigns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {castingPromos.map(cp => (
              <div key={cp.id} className="p-4 bg-black/50 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{cp.title}</h4>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                    {cp.status}
                  </span>
                </div>
                <p className="text-white/60 text-xs">Total Applicants: <span className="text-gold font-bold">{cp.applicantsCount}</span></p>
                <p className="text-cyan-400 text-xs font-bold">Social Media Reach: {cp.reach}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. ARTIST PROMOTIONS */}
      {activeSubTab === "artist_promotions" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Star className="w-4 h-4 text-purple-400" /> Artist Image Management & PR Publicity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {artistPromos.map(ap => (
              <div key={ap.id} className="p-4 bg-black/50 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{ap.artist}</h4>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-bold">
                    {ap.status}
                  </span>
                </div>
                <p className="text-white/60 text-xs">Campaign: {ap.campaign}</p>
                <p className="text-emerald-400 text-xs font-bold">Media Coverage: {ap.coverage}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. CONTENT STUDIO */}
      {activeSubTab === "content_studio" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-6">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold" /> AI Promo Copywriter & Asset Generator
          </h3>

          <div className="bg-black/50 border border-white/10 p-4 rounded-xl space-y-3">
            <label className="block text-white/70 font-bold">Select Movie / Campaign Focus</label>
            <input
              type="text"
              placeholder="e.g. RAMA Pre-Release Teaser Blitz"
              className="w-full bg-black/80 border border-white/20 rounded-xl p-3 text-white outline-none"
            />

            <button
              onClick={handleGenerateAiHeadline}
              disabled={isGeneratingAi}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-gold text-black font-extrabold rounded-xl cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> {isGeneratingAi ? "Generating AI Promo Copy..." : "Generate Viral Social Caption & Hashtags"}
            </button>

            {aiHeadline && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-xl space-y-2">
                <span className="text-amber-400 font-bold text-[10px] uppercase">AI Suggested Copy:</span>
                <p className="text-white font-medium text-xs">{aiHeadline}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiHeadline);
                    alert("Copied AI copy to clipboard!");
                  }}
                  className="px-3 py-1 bg-amber-500 text-black font-bold rounded-lg text-[10px] cursor-pointer flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy Caption
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 10. MEDIA LIBRARY */}
      {activeSubTab === "media_library" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-400" /> Central Uncompressed Media Bank
            </h3>
            <button className="px-3 py-1.5 bg-white/10 text-white font-bold rounded-xl text-xs hover:bg-white/20 cursor-pointer flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Upload Asset
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mediaAssets.map(ma => (
              <div key={ma.id} className="p-4 bg-black/50 border border-white/10 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">{ma.title}</h4>
                  <p className="text-white/50 text-[11px]">{ma.type} • {ma.format} ({ma.size})</p>
                  <span className="text-gold text-[10px]">Downloads: {ma.downloads}</span>
                </div>
                <button
                  onClick={() => alert(`Downloading master asset: ${ma.title}`)}
                  className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-bold hover:bg-amber-500/30 cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Get Asset
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. SOCIAL MEDIA */}
      {activeSubTab === "social_media" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Share2 className="w-4 h-4 text-cyan-400" /> Automated Social Media Scheduler
          </h3>
          <div className="space-y-3">
            {socialPosts.map(sp => (
              <div key={sp.id} className="p-4 bg-black/50 border border-white/10 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 text-xs">{sp.platform}</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px]">{sp.status}</span>
                  </div>
                  <p className="text-white text-xs mt-1 font-medium">{sp.content}</p>
                  <p className="text-white/40 text-[10px]">Scheduled: {sp.scheduledFor}</p>
                </div>
                <span className="text-emerald-400 font-mono text-xs font-bold">{sp.engagements}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12. PRESS & MEDIA */}
      {activeSubTab === "press_media" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" /> Verified Film Journalists Directory
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pressContacts.map(pr => (
              <div key={pr.id} className="p-4 bg-black/50 border border-white/10 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{pr.journalist}</h4>
                  <p className="text-amber-400 text-xs font-semibold">{pr.outlet}</p>
                  <p className="text-white/50 text-[11px]">{pr.designation}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                  {pr.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 13. INFLUENCERS */}
      {activeSubTab === "influencers" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> CineVenue Partnered Creator Network
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {influencerList.map(inf => (
              <div key={inf.id} className="p-4 bg-black/50 border border-white/10 rounded-xl space-y-2">
                <h4 className="font-bold text-white text-sm">{inf.name}</h4>
                <p className="text-amber-400 text-xs font-mono">{inf.handle} ({inf.platform})</p>
                <div className="flex justify-between text-[11px] text-white/60 pt-2 border-t border-white/10">
                  <span>Reach: <strong className="text-white">{inf.followers}</strong></span>
                  <span className="text-gold font-bold">{inf.avgFee}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 14. ADVERTISING */}
      {activeSubTab === "advertising" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gold" /> Digital Paid Ads Performance
          </h3>
          <div className="space-y-3">
            {adCampaigns.map(ad => (
              <div key={ad.id} className="p-4 bg-black/50 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{ad.name}</h4>
                  <span className="text-gold font-mono font-bold text-xs">{ad.budgetSpent} / {ad.totalBudget}</span>
                </div>
                <div className="flex gap-4 text-xs text-white/60">
                  <span>Platform: <strong className="text-white">{ad.platform}</strong></span>
                  <span>CTR: <strong className="text-amber-400">{ad.ctr}</strong></span>
                  <span>Direct Ticket Leads: <strong className="text-emerald-400">{ad.ticketLeads}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 15. PROMOTION LINKS */}
      {activeSubTab === "promotion_links" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-6">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <QrCode className="w-4 h-4 text-amber-400" /> Smart UTM & Poster QR Code Generator
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/50 p-4 rounded-xl border border-white/10">
            <div className="space-y-3">
              <div>
                <label className="block text-white/70 mb-1 font-bold">Movie / Event Title</label>
                <input
                  type="text"
                  value={linkMovie}
                  onChange={(e) => setLinkMovie(e.target.value)}
                  className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-bold">Campaign Traffic Source</label>
                <select
                  value={linkSource}
                  onChange={(e) => setLinkSource(e.target.value)}
                  className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white font-bold outline-none cursor-pointer"
                >
                  <option value="Instagram">Instagram Reel Bio</option>
                  <option value="YouTube">YouTube Description</option>
                  <option value="MultiplexPoster">Multiplex Standee QR Code</option>
                  <option value="PressRelease">Press Wire Link</option>
                </select>
              </div>

              <button
                onClick={handleGenerateSmartLink}
                className="px-5 py-2 bg-amber-500 text-black font-extrabold rounded-xl cursor-pointer"
              >
                Generate Smart Link
              </button>
            </div>

            {generatedLink && (
              <div className="p-4 bg-black/80 border border-amber-500/40 rounded-xl space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-amber-400 font-bold text-[10px] uppercase block mb-1">Generated Smart URL:</span>
                  <p className="text-white font-mono text-xs break-all bg-white/5 p-2 rounded">{generatedLink}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLink);
                    alert("Copied tracking link!");
                  }}
                  className="px-3 py-2 bg-amber-500 text-black font-bold rounded-lg text-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  <Copy className="w-4 h-4" /> Copy Tracking Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 16. DELIVERABLES */}
      {activeSubTab === "deliverables" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-cyan-400" /> Promotion Deliverables Checklist
          </h3>
          <div className="space-y-3">
            {deliverableTasks.map(del => (
              <div key={del.id} className="p-4 bg-black/50 border border-white/10 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">{del.title}</h4>
                  <p className="text-white/50 text-[11px]">Campaign: {del.campaign} • Due: <span className="text-amber-400">{del.dueDate}</span></p>
                  <p className="text-white/40 text-[10px]">Assignee: {del.assignee}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {del.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 17. TEAM */}
      {activeSubTab === "team" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> Media & Promotions Executive Team
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map(tm => (
              <div key={tm.id} className="p-4 bg-black/50 border border-white/10 rounded-xl space-y-1">
                <h4 className="font-bold text-white text-sm">{tm.name}</h4>
                <p className="text-amber-400 text-xs font-semibold">{tm.role}</p>
                <p className="text-white/50 text-[11px]">{tm.email}</p>
                <span className="text-emerald-400 text-[10px] font-bold block pt-1">Active Runs: {tm.activeCampaigns} Campaigns</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 18. ANALYTICS */}
      {activeSubTab === "analytics" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-6">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold" /> Media Campaign ROI & Conversion Analytics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-5 bg-black/50 border border-white/5 rounded-xl">
              <span className="text-2xl font-mono font-bold text-cyan-400">128.5M</span>
              <p className="text-white/50 text-xs mt-1">Total Impressions</p>
            </div>
            <div className="p-5 bg-black/50 border border-white/5 rounded-xl">
              <span className="text-2xl font-mono font-bold text-amber-400">4.2%</span>
              <p className="text-white/50 text-xs mt-1">Average Click Rate</p>
            </div>
            <div className="p-5 bg-black/50 border border-white/5 rounded-xl">
              <span className="text-2xl font-mono font-bold text-emerald-400">84,500</span>
              <p className="text-white/50 text-xs mt-1">Direct Ticket Conversions</p>
            </div>
            <div className="p-5 bg-black/50 border border-white/5 rounded-xl">
              <span className="text-2xl font-mono font-bold text-purple-400">8.4x</span>
              <p className="text-white/50 text-xs mt-1">Blended Marketing ROI</p>
            </div>
          </div>
        </div>
      )}

      {/* 19. NOTIFICATIONS */}
      {activeSubTab === "notifications" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" /> Media Alerts & Approval Reminders
          </h3>
          <div className="space-y-3">
            {[
              { title: "Trailer Render Approved", desc: "RAMA 4K master passed multiplex audio check", time: "10 mins ago" },
              { title: "Budget Milestone Alert", desc: "Meta Ads reached 80% of regional budget limit", time: "1 hour ago" },
              { title: "Journalist RSVP Confirmed", desc: "Times of India confirmed attendance for Pre-Release Press Meet", time: "3 hours ago" }
            ].map((n, idx) => (
              <div key={idx} className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-xs">{n.title}</h4>
                  <span className="text-white/40 text-[10px]">{n.time}</span>
                </div>
                <p className="text-white/60 text-[11px]">{n.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 20. PERMISSIONS */}
      {activeSubTab === "permissions" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Role-Based Media Access Control
          </h3>
          <div className="space-y-3 text-xs">
            {[
              { role: "Media Admin", access: "Full access to launch campaigns, approve ad spend, edit press wire" },
              { role: "PR Officer", access: "Can send press releases and manage journalist contacts" },
              { role: "Brand Partner", access: "View-only access to sponsor placement analytics" }
            ].map((p, idx) => (
              <div key={idx} className="p-3 bg-black/50 border border-white/10 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">{p.role}</h4>
                  <p className="text-white/50 text-[11px]">{p.access}</p>
                </div>
                <span className="text-emerald-400 font-bold text-[10px]">Configured</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 21. AUDIT LOGS */}
      {activeSubTab === "audit_logs" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold" /> System Activity & Modification Logs
          </h3>
          <div className="space-y-2 font-mono text-[11px]">
            {auditLogsList.map(log => (
              <div key={log.id} className="p-3 bg-black/50 border border-white/10 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-amber-400 font-bold mr-2">[{log.action}]</span>
                  <span className="text-white">{log.detail}</span>
                  <p className="text-white/40 text-[10px] mt-0.5">By {log.user}</p>
                </div>
                <span className="text-white/40">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW CAMPAIGN BUILDER MODAL */}
      {isNewCampaignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#0D0E14] border border-amber-500/40 rounded-2xl shadow-2xl p-6 space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-serif font-bold text-white">Create CineVenue Promotional Campaign</h3>
              <button onClick={() => setIsNewCampaignOpen(false)} className="p-2 rounded-full bg-white/10 text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 mb-1 font-bold">Campaign Title</label>
                <input
                  type="text"
                  value={newCampaignForm.title}
                  onChange={(e) => setNewCampaignForm({ ...newCampaignForm, title: e.target.value })}
                  placeholder="e.g. Worldwide Trailer Release Blitz"
                  className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-bold">Movie or Brand Name</label>
                <input
                  type="text"
                  value={newCampaignForm.clientOrMovie}
                  onChange={(e) => setNewCampaignForm({ ...newCampaignForm, clientOrMovie: e.target.value })}
                  placeholder="e.g. Project K / CineVenue Original"
                  className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 mb-1 font-bold">Promoted Type</label>
                  <select
                    value={newCampaignForm.promotedType}
                    onChange={(e) => setNewCampaignForm({ ...newCampaignForm, promotedType: e.target.value as any })}
                    className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white font-bold outline-none cursor-pointer"
                  >
                    <option value="Film">Film</option>
                    <option value="Short Film">Short Film</option>
                    <option value="Event">Event</option>
                    <option value="Brand">Brand</option>
                    <option value="Casting Call">Casting Call</option>
                    <option value="Artist">Artist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-bold">Budget</label>
                  <input
                    type="text"
                    value={newCampaignForm.budget}
                    onChange={(e) => setNewCampaignForm({ ...newCampaignForm, budget: e.target.value })}
                    placeholder="e.g. ₹2,500,000"
                    className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button onClick={() => setIsNewCampaignOpen(false)} className="px-4 py-2 bg-white/10 text-white rounded-xl cursor-pointer">
                Cancel
              </button>
              <button onClick={handleCreateCampaign} className="px-6 py-2 bg-amber-500 text-black font-extrabold rounded-xl cursor-pointer shadow-lg">
                Launch Campaign
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
