import React, { useState } from "react";
import {
  PillarKey,
  PillarInfo,
  CMSMenuTab,
  CMSPage,
  CMSSection,
  MediaItem,
  PosterItem,
  HeroSlide,
  CMSForm,
  CMSUser,
  ActivityLog
} from "./types";
import {
  PILLARS_LIST,
  INITIAL_PAGES,
  DEFAULT_HOMEPAGE_SECTIONS,
  INITIAL_HERO_SLIDES,
  INITIAL_MEDIA_ITEMS,
  INITIAL_POSTERS,
  INITIAL_FORMS,
  INITIAL_USERS,
  INITIAL_ACTIVITY_LOGS
} from "./mockData";
import {
  LayoutDashboard,
  LayoutTemplate,
  FileText,
  Menu,
  Image as ImageIcon,
  Tv,
  FolderOpen,
  FileImage as Poster,
  Database,
  FormInput,
  Search,
  Settings,
  Users,
  History,
  HardDriveDownload,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Copy,
  CheckCircle2,
  X,
  UploadCloud,
  Save,
  RotateCcw,
  Sparkles,
  ChevronRight,
  BarChart3,
  Globe,
  Film,
  Ticket,
  Video,
  Mic,
  Megaphone,
  Download,
  Upload,
  Lock,
  Layers,
  ExternalLink,
  Tag,
  Calendar,
  DollarSign,
  UserCheck,
  Building,
  Radio,
  Sliders,
  Bell,
  Code,
  Share2,
  ShieldCheck,
  RefreshCw,
  FolderPlus,
  FilePlus,
  Check
} from "lucide-react";

interface SubWebsiteCMSManagerProps {
  initialPillarKey?: PillarKey;
  onClose: () => void;
  serviceControl?: any;
  setServiceControl?: React.Dispatch<React.SetStateAction<any>>;
}

export default function SubWebsiteCMSManager({
  initialPillarKey = "movieBooking",
  onClose,
  serviceControl,
  setServiceControl
}: SubWebsiteCMSManagerProps) {
  const [selectedPillarKey, setSelectedPillarKey] = useState<PillarKey>(initialPillarKey);
  const [activeTab, setActiveTab] = useState<CMSMenuTab>("dashboard");

  // Local state for full editability
  const [pagesMap, setPagesMap] = useState<Record<PillarKey, CMSPage[]>>(INITIAL_PAGES);
  const [homepageSectionsMap, setHomepageSectionsMap] = useState<Record<PillarKey, CMSSection[]>>(DEFAULT_HOMEPAGE_SECTIONS);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(INITIAL_HERO_SLIDES);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(INITIAL_MEDIA_ITEMS);
  const [posters, setPosters] = useState<PosterItem[]>(INITIAL_POSTERS);
  const [forms, setForms] = useState<CMSForm[]>(INITIAL_FORMS);
  const [users, setUsers] = useState<CMSUser[]>(INITIAL_USERS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  // Status Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentPillar = PILLARS_LIST.find((p) => p.key === selectedPillarKey) || PILLARS_LIST[0];
  const isPillarLive = serviceControl?.[selectedPillarKey]?.status !== false;

  const togglePillarStatus = () => {
    if (!setServiceControl) return;
    const currentVal = serviceControl?.[selectedPillarKey]?.status !== false;
    setServiceControl((prev: any) => ({
      ...prev,
      [selectedPillarKey]: {
        ...prev[selectedPillarKey],
        status: !currentVal
      }
    }));
    showToast(`${currentPillar.name} is now ${!currentVal ? "🟢 LIVE" : "🔴 OFFLINE"}`);
  };

  // State for Page Editor Modal
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [pageForm, setPageForm] = useState<{ title: string; slug: string; status: "published" | "draft" | "scheduled"; content: string }>({
    title: "",
    slug: "",
    status: "published",
    content: ""
  });

  // State for Media Library Folder Filter
  const [mediaFolderFilter, setMediaFolderFilter] = useState<string>("All");
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [mediaViewMode, setMediaViewMode] = useState<"grid" | "folder">("grid");

  // State for Poster Upload Modal
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [posterForm, setPosterForm] = useState({
    title: "",
    category: "Movie Posters" as PosterItem["category"],
    imageUrl: "",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: "2026-12-31"
  });

  // State for Hero Slide Modal
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [heroSlideForm, setHeroSlideForm] = useState({
    title: "",
    subtitle: "",
    desktopImage: "",
    mobileImage: "",
    buttonText: "Learn More",
    buttonLink: "#"
  });

  // State for SEO Settings
  const [seoForm, setSeoForm] = useState({
    metaTitle: `${currentPillar.name} - Official CineVenue Portal`,
    metaDescription: `Discover and book exclusive ${currentPillar.name.toLowerCase()} services online with 100% instant confirmation.`,
    keywords: "cinevenue, entertainment, movie tickets, events, film production, audio launches, ads",
    ogImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80",
    twitterCard: "summary_large_image",
    canonicalUrl: `https://cinevenue.com/${selectedPillarKey}`,
    robotsTxt: "User-agent: *\nAllow: /\nSitemap: https://cinevenue.com/sitemap.xml"
  });

  // State for General Settings
  const [settingsForm, setSettingsForm] = useState({
    websiteName: currentPillar.name,
    primaryColor: currentPillar.primaryColor,
    secondaryColor: "#111827",
    contactEmail: "admin@cinevenue.com",
    contactPhone: "+91 98765 43210",
    address: "CineVenue Hub, Film Nagar, Jubilee Hills, Hyderabad",
    googleAnalyticsId: "UA-99887766-1",
    whatsappNumber: "+919876543210"
  });

  // State for Custom Forms
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState("");

  // Pillar Specific Database Active Sub-Tab
  const [pillarDbSubTab, setPillarDbSubTab] = useState<string>("movies");

  // Section Order handlers for Homepage Builder
  const moveSection = (index: number, direction: "up" | "down") => {
    const sections = [...homepageSectionsMap[selectedPillarKey]];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const temp = sections[index];
    sections[index] = sections[targetIdx];
    sections[targetIdx] = temp;

    // re-index order
    const updated = sections.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    setHomepageSectionsMap((prev) => ({
      ...prev,
      [selectedPillarKey]: updated
    }));
    showToast("Section layout order updated");
  };

  const toggleSectionEnable = (id: string) => {
    const sections = homepageSectionsMap[selectedPillarKey].map((sec) =>
      sec.id === id ? { ...sec, enabled: !sec.enabled } : sec
    );
    setHomepageSectionsMap((prev) => ({
      ...prev,
      [selectedPillarKey]: sections
    }));
    showToast("Section visibility toggled");
  };

  const duplicateSection = (sec: CMSSection) => {
    const newSec: CMSSection = {
      ...sec,
      id: `sec_${Date.now()}`,
      title: `${sec.title} (Copy)`,
      order: homepageSectionsMap[selectedPillarKey].length + 1
    };
    setHomepageSectionsMap((prev) => ({
      ...prev,
      [selectedPillarKey]: [...prev[selectedPillarKey], newSec]
    }));
    showToast(`Duplicated section: ${sec.title}`);
  };

  const deleteSection = (id: string) => {
    const sections = homepageSectionsMap[selectedPillarKey].filter((s) => s.id !== id);
    setHomepageSectionsMap((prev) => ({
      ...prev,
      [selectedPillarKey]: sections
    }));
    showToast("Section removed");
  };

  // Sidebar Menu Items Definition
  const SIDEBAR_ITEMS: { id: CMSMenuTab; label: string; icon: any; badge?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "homepage_builder", label: "Homepage Builder", icon: LayoutTemplate, badge: "Drag & Drop" },
    { id: "pages", label: "Pages", icon: FileText, badge: `${pagesMap[selectedPillarKey]?.length || 0}` },
    { id: "navigation", label: "Navigation Menu", icon: Menu },
    { id: "hero_slider", label: "Hero Slider", icon: Tv, badge: `${heroSlides.length}` },
    { id: "banners", label: "Banners & Ads", icon: Megaphone },
    { id: "media_library", label: "Media Library", icon: FolderOpen, badge: `${mediaItems.length}` },
    { id: "poster_manager", label: "Poster Manager", icon: Poster, badge: `${posters.length}` },
    { id: "pillar_specific", label: `${currentPillar.name.replace(" CMS", "")} Database`, icon: Database, badge: "CORE" },
    { id: "form_builder", label: "Form Builder", icon: FormInput, badge: `${forms.length}` },
    { id: "seo", label: "SEO Manager", icon: Search },
    { id: "user_management", label: "User Management", icon: Users, badge: `${users.length}` },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "activity_logs", label: "Activity Logs", icon: History },
    { id: "backup_restore", label: "Backup & Restore", icon: HardDriveDownload }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#07080A] text-white flex flex-col font-sans overflow-hidden">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-gradient-to-r from-amber-500 to-yellow-600 text-black px-5 py-3 rounded-xl shadow-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 fill-black" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP CMS CONTROL HEADER */}
      <header className="h-16 bg-[#0B0C10] border-b border-white/10 px-6 flex items-center justify-between shrink-0 shadow-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-xl border border-white/10 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            title="Return to Main Super Admin Console"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Back to Super Admin</span>
          </button>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          {/* PILLAR SELECTOR DROPDOWN */}
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentPillar.icon}</span>
            <select
              value={selectedPillarKey}
              onChange={(e) => {
                setSelectedPillarKey(e.target.value as PillarKey);
                showToast(`Switched to ${PILLARS_LIST.find((p) => p.key === e.target.value)?.name}`);
              }}
              className="bg-black border border-amber-500/30 focus:border-amber-400 text-amber-400 font-extrabold text-xs uppercase tracking-wider rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              {PILLARS_LIST.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.icon} {p.name}
                </option>
              ))}
            </select>
          </div>

          <span
            onClick={togglePillarStatus}
            className={`cursor-pointer px-3 py-1 rounded-full text-[10px] font-extrabold font-mono uppercase tracking-wider border transition-all ${
              isPillarLive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
            }`}
          >
            {isPillarLive ? "🟢 LIVE" : "🔴 OFFLINE"}
          </span>
        </div>

        {/* RIGHT TOP ACTIONS */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Preview Live Sub-Site</span>
          </a>

          <button
            onClick={() => showToast("All CMS draft changes published successfully!")}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Publish All Changes</span>
          </button>
        </div>
      </header>

      {/* MAIN BODY: SIDEBAR + CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-64 bg-[#0B0C10] border-r border-white/10 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-white/5 space-y-1 text-left">
            <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
              ENTERPRISE WEBSITE CMS
            </span>
            <h2 className="text-sm font-bold text-white truncate">{currentPillar.name}</h2>
            <p className="text-[10px] text-white/50 leading-tight truncate">{currentPillar.tagline}</p>
          </div>

          <nav className="p-3 space-y-1 flex-1 text-left">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-400 border border-amber-500/30 shadow-md font-bold"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-400" : "text-white/40"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isActive ? "bg-amber-400 text-black" : "bg-white/10 text-white/60"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* FOOTER USER CARD */}
          <div className="p-3 border-t border-white/5 bg-black/40 flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold">
                SA
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">Super Admin</p>
                <p className="text-[9px] text-emerald-400 font-mono">Full Permissions</p>
              </div>
            </div>
          </div>
        </aside>

        {/* CONTENT PANEL */}
        <main className="flex-1 bg-[#07080A] overflow-y-auto p-6 md:p-8 space-y-8 text-left">
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <span>📊</span>
                    <span>{currentPillar.name} Executive Overview</span>
                  </h2>
                  <p className="text-xs text-white/50 mt-1">Real-time CMS performance, traffic, storage, and engagement metrics.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Database Synced Real-Time
                  </span>
                </div>
              </div>

              {/* KPI CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { label: "Total Visitors", val: currentPillar.visitors, icon: Globe, color: "text-blue-400" },
                  { label: "Today's Visitors", val: "3,840", icon: BarChart3, color: "text-amber-400" },
                  { label: "Bookings / Leads", val: "1,248", icon: Ticket, color: "text-emerald-400" },
                  { label: "Est. Revenue", val: "₹18,45,000", icon: DollarSign, color: "text-yellow-400" },
                  { label: "Pending Proposals", val: `${currentPillar.proposalsCount}`, icon: Bell, color: "text-rose-400" },
                  { label: "Published Pages", val: `${pagesMap[selectedPillarKey]?.filter((p) => p.status === "published").length || 0}`, icon: CheckCircle2, color: "text-emerald-300" },
                  { label: "Draft Pages", val: `${pagesMap[selectedPillarKey]?.filter((p) => p.status === "draft").length || 0}`, icon: FileText, color: "text-orange-400" },
                  { label: "Media Assets", val: `${mediaItems.length}`, icon: FolderOpen, color: "text-cyan-400" },
                  { label: "Storage Used", val: "1.8 GB / 100 GB", icon: HardDriveDownload, color: "text-purple-400" },
                  { label: "Active Posters", val: `${posters.filter((p) => p.status === "Active").length}`, icon: Poster, color: "text-pink-400" }
                ].map((card, idx) => {
                  const CardIcon = card.icon;
                  return (
                    <div key={idx} className="bg-[#0D0E13] border border-white/10 rounded-2xl p-4 space-y-2 hover:border-amber-500/30 transition-all shadow-xl">
                      <div className="flex items-center justify-between text-white/50">
                        <span className="text-[10px] font-bold uppercase tracking-wider">{card.label}</span>
                        <CardIcon className={`w-4 h-4 ${card.color}`} />
                      </div>
                      <p className="text-xl font-extrabold text-white font-mono">{card.val}</p>
                    </div>
                  );
                })}
              </div>

              {/* RECENT ACTIVITY & SYSTEM LOGS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#0D0E13] border border-white/10 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    <span>Recent Admin Activities</span>
                  </h3>
                  <div className="space-y-3">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white">{log.action}</p>
                          <p className="text-[10px] text-white/40">{log.user} &middot; {log.module}</p>
                        </div>
                        <span className="text-[10px] text-amber-400 font-mono">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0D0E13] border border-white/10 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Live CMS Health & Services Status</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    {[
                      { name: "Database Storage Engine", status: "Healthy (0.4ms lat)", ok: true },
                      { name: "Media CDN & Image Resizer", status: "Operational (Edge Cache)", ok: true },
                      { name: "Sitemap & SEO Indexer", status: "24 Pages Indexed", ok: true },
                      { name: "WhatsApp & Email Mailer", status: "SMTP Connected", ok: true }
                    ].map((s, i) => (
                      <div key={i} className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                        <span className="font-semibold text-white/80">{s.name}</span>
                        <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded">
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOMEPAGE BUILDER */}
          {activeTab === "homepage_builder" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <span>🎨</span>
                    <span>Homepage Drag & Drop Layout Builder</span>
                  </h2>
                  <p className="text-xs text-white/50 mt-1">Reorder, enable/disable, duplicate or configure layout sections on the sub-website homepage.</p>
                </div>
                <button
                  onClick={() => {
                    const title = prompt("Enter new section title:");
                    if (!title) return;
                    const newSec: CMSSection = {
                      id: `sec_${Date.now()}`,
                      type: "Custom HTML",
                      title,
                      enabled: true,
                      order: homepageSectionsMap[selectedPillarKey].length + 1,
                      content: {}
                    };
                    setHomepageSectionsMap((prev) => ({
                      ...prev,
                      [selectedPillarKey]: [...prev[selectedPillarKey], newSec]
                    }));
                    showToast(`Added section: ${title}`);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Custom Section</span>
                </button>
              </div>

              {/* SECTIONS LIST */}
              <div className="space-y-4">
                {homepageSectionsMap[selectedPillarKey].map((sec, idx) => (
                  <div
                    key={sec.id}
                    className={`bg-[#0D0E13] border ${
                      sec.enabled ? "border-white/10 hover:border-amber-500/40" : "border-white/5 opacity-50"
                    } rounded-2xl p-5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, "up")}
                          className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          disabled={idx === homepageSectionsMap[selectedPillarKey].length - 1}
                          onClick={() => moveSection(idx, "down")}
                          className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-extrabold text-xs flex items-center justify-center">
                        #{sec.order}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{sec.title}</h4>
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/60 rounded border border-amber-500/30 font-mono">
                            {sec.type}
                          </span>
                        </div>
                        <p className="text-xs text-white/40">Status: {sec.enabled ? "Visible on Live Site" : "Hidden"}</p>
                      </div>
                    </div>

                    {/* CONTROLS */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => toggleSectionEnable(sec.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          sec.enabled ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-white/50 border border-white/10"
                        }`}
                      >
                        {sec.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{sec.enabled ? "Hide" : "Show"}</span>
                      </button>

                      <button
                        onClick={() => {
                          const newTitle = prompt("Edit section title:", sec.title);
                          if (!newTitle) return;
                          const updated = homepageSectionsMap[selectedPillarKey].map((s) =>
                            s.id === sec.id ? { ...s, title: newTitle } : s
                          );
                          setHomepageSectionsMap((prev) => ({ ...prev, [selectedPillarKey]: updated }));
                          showToast("Section updated");
                        }}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5 text-amber-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => duplicateSection(sec)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-blue-400" />
                        <span>Duplicate</span>
                      </button>

                      <button
                        onClick={() => deleteSection(sec.id)}
                        className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PAGES */}
          {activeTab === "pages" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <span>📄</span>
                    <span>Custom Page Manager & Rich Editor</span>
                  </h2>
                  <p className="text-xs text-white/50 mt-1">Create unlimited pages, legal terms, landing pages, and custom rich text content.</p>
                </div>
                <button
                  onClick={() => {
                    setIsCreatingPage(true);
                    setEditingPage(null);
                    setPageForm({ title: "", slug: "/", status: "published", content: "" });
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Page</span>
                </button>
              </div>

              {/* PAGES TABLE */}
              <div className="bg-[#0D0E13] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/60 text-amber-400 font-mono uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-4">Page Title</th>
                      <th className="p-4">URL Slug</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Views</th>
                      <th className="p-4">Last Updated</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pagesMap[selectedPillarKey]?.map((pg) => (
                      <tr key={pg.id} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-bold text-white">{pg.title}</td>
                        <td className="p-4 font-mono text-white/60">{pg.slug}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                              pg.status === "published" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                            }`}
                          >
                            {pg.status}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-white/80">{pg.views.toLocaleString()}</td>
                        <td className="p-4 text-white/50">{pg.updatedAt}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingPage(pg);
                              setIsCreatingPage(false);
                              setPageForm({ title: pg.title, slug: pg.slug, status: pg.status, content: pg.content });
                            }}
                            className="px-3 py-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded border border-amber-500/30 font-bold cursor-pointer"
                          >
                            Edit Page
                          </button>
                          <button
                            onClick={() => {
                              const updated = pagesMap[selectedPillarKey].filter((p) => p.id !== pg.id);
                              setPagesMap((prev) => ({ ...prev, [selectedPillarKey]: updated }));
                              showToast("Page deleted");
                            }}
                            className="px-2.5 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded border border-rose-500/30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGE CREATE/EDIT MODAL */}
              {(editingPage || isCreatingPage) && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="bg-[#0D0E13] border border-white/20 rounded-2xl w-full max-w-3xl p-6 space-y-6 shadow-2xl text-left">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h3 className="text-lg font-bold text-white">
                        {isCreatingPage ? "Create New Custom Page" : `Editing: ${editingPage?.title}`}
                      </h3>
                      <button
                        onClick={() => {
                          setEditingPage(null);
                          setIsCreatingPage(false);
                        }}
                        className="text-white/60 hover:text-white cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-white/80 mb-1">PAGE TITLE</label>
                          <input
                            type="text"
                            value={pageForm.title}
                            onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                            placeholder="e.g. Terms & Conditions"
                            className="w-full bg-black border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-white/80 mb-1">URL SLUG</label>
                          <input
                            type="text"
                            value={pageForm.slug}
                            onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                            placeholder="e.g. /terms"
                            className="w-full bg-black border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-white focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-white/80 mb-1">RICH TEXT & HTML CONTENT</label>
                        <textarea
                          rows={10}
                          value={pageForm.content}
                          onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                          placeholder="Enter page HTML or rich content..."
                          className="w-full bg-black border border-white/15 focus:border-amber-400 rounded-xl p-3 text-white focus:outline-none font-mono text-xs"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <select
                          value={pageForm.status}
                          onChange={(e) => setPageForm({ ...pageForm, status: e.target.value as any })}
                          className="bg-black border border-white/15 text-white rounded-xl px-3 py-2 font-bold focus:outline-none"
                        >
                          <option value="published">Status: Published</option>
                          <option value="draft">Status: Draft</option>
                          <option value="scheduled">Status: Scheduled</option>
                        </select>

                        <button
                          onClick={() => {
                            if (isCreatingPage) {
                              const newPg: CMSPage = {
                                id: `p_${Date.now()}`,
                                title: pageForm.title || "Untitled Page",
                                slug: pageForm.slug || "/new-page",
                                status: pageForm.status,
                                updatedAt: "Just now",
                                author: "Super Admin",
                                views: 0,
                                content: pageForm.content
                              };
                              setPagesMap((prev) => ({
                                ...prev,
                                [selectedPillarKey]: [...(prev[selectedPillarKey] || []), newPg]
                              }));
                              showToast("New page created!");
                            } else if (editingPage) {
                              const updated = pagesMap[selectedPillarKey].map((p) =>
                                p.id === editingPage.id
                                  ? { ...p, title: pageForm.title, slug: pageForm.slug, status: pageForm.status, content: pageForm.content, updatedAt: "Just now" }
                                  : p
                              );
                              setPagesMap((prev) => ({ ...prev, [selectedPillarKey]: updated }));
                              showToast("Page saved!");
                            }
                            setEditingPage(null);
                            setIsCreatingPage(false);
                          }}
                          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                        >
                          Save Page
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NAVIGATION MENU */}
          {activeTab === "navigation" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <span>🧭</span>
                    <span>Header Navigation Menu Builder</span>
                  </h2>
                  <p className="text-xs text-white/50 mt-1">Configure top navbar links, dropdowns, mega-menu, and footer quick links.</p>
                </div>
              </div>

              <div className="bg-[#0D0E13] border border-white/10 rounded-2xl p-6 space-y-4">
                <p className="text-xs text-amber-400 font-mono font-bold">CURRENT NAVIGATION MENU HIERARCHY</p>
                {[
                  { label: "Home", link: "/", type: "Standard Link" },
                  { label: "Catalog / Services", link: "/services", type: "Mega Dropdown" },
                  { label: "Bookings / Tickets", link: "/booking", type: "Standard Link" },
                  { label: "About Us", link: "/about", type: "Standard Link" },
                  { label: "Contact & Inquiries", link: "/contact", type: "Standard Link" }
                ].map((m, idx) => (
                  <div key={idx} className="p-4 bg-black/60 border border-white/10 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center text-[10px]">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-white">{m.label}</p>
                        <p className="text-[10px] text-white/40 font-mono">{m.link}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-white/70 rounded text-[10px] font-mono">
                      {m.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: HERO SLIDER MANAGER */}
          {activeTab === "hero_slider" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <span>📺</span>
                    <span>Hero Billboard Slider Manager</span>
                  </h2>
                  <p className="text-xs text-white/50 mt-1">Upload high-res desktop & mobile banners, video loops, and CTA button links.</p>
                </div>
                <button
                  onClick={() => setIsHeroModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Hero Slide</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {heroSlides.map((slide) => (
                  <div key={slide.id} className="bg-[#0D0E13] border border-white/10 rounded-2xl overflow-hidden shadow-2xl space-y-3">
                    <div className="h-44 w-full relative overflow-hidden">
                      <img src={slide.desktopImage} alt={slide.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/80 backdrop-blur-md text-amber-400 font-mono text-[10px] font-bold rounded-lg border border-amber-500/30">
                        Slide #{slide.order}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="text-base font-bold text-white">{slide.title}</h4>
                      <p className="text-xs text-white/50">{slide.subtitle}</p>

                      <div className="pt-2 flex items-center justify-between border-t border-white/5">
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                          {slide.status.toUpperCase()}
                        </span>
                        <button
                          onClick={() => {
                            setHeroSlides(heroSlides.filter((s) => s.id !== slide.id));
                            showToast("Slide removed");
                          }}
                          className="text-rose-400 hover:text-rose-300 text-xs font-bold cursor-pointer"
                        >
                          Remove Slide
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* HERO MODAL */}
              {isHeroModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="bg-[#0D0E13] border border-white/20 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-left">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h3 className="text-base font-bold text-white">Add Hero Slide</h3>
                      <button onClick={() => setIsHeroModalOpen(false)} className="text-white/60 hover:text-white cursor-pointer">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-white/80 mb-1">BANNER TITLE</label>
                        <input
                          type="text"
                          value={heroSlideForm.title}
                          onChange={(e) => setHeroSlideForm({ ...heroSlideForm, title: e.target.value })}
                          placeholder="e.g. Kalki 2898 AD"
                          className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-white/80 mb-1">SUBTITLE</label>
                        <input
                          type="text"
                          value={heroSlideForm.subtitle}
                          onChange={(e) => setHeroSlideForm({ ...heroSlideForm, subtitle: e.target.value })}
                          placeholder="e.g. In Cinemas Worldwide"
                          className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-white/80 mb-1">DESKTOP IMAGE URL</label>
                        <input
                          type="text"
                          value={heroSlideForm.desktopImage}
                          onChange={(e) => setHeroSlideForm({ ...heroSlideForm, desktopImage: e.target.value })}
                          placeholder="https://..."
                          className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>

                      <button
                        onClick={() => {
                          const newSlide: HeroSlide = {
                            id: `hs_${Date.now()}`,
                            title: heroSlideForm.title || "Hero Banner",
                            subtitle: heroSlideForm.subtitle || "Subtitle",
                            desktopImage: heroSlideForm.desktopImage || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80",
                            mobileImage: heroSlideForm.desktopImage || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
                            buttonText: heroSlideForm.buttonText,
                            buttonLink: heroSlideForm.buttonLink,
                            order: heroSlides.length + 1,
                            status: "active"
                          };
                          setHeroSlides([...heroSlides, newSlide]);
                          setIsHeroModalOpen(false);
                          showToast("Hero slide created!");
                        }}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                      >
                        Add Banner
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: MEDIA LIBRARY */}
          {activeTab === "media_library" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <span>📁</span>
                    <span>Central Media Library</span>
                  </h2>
                  <p className="text-xs text-white/50 mt-1">Upload and organize images, posters, videos, logos, and PDFs across folders.</p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const newItem: MediaItem = {
                            id: `m_${Date.now()}`,
                            name: file.name,
                            folder: "Gallery",
                            type: file.type.startsWith("video") ? "video" : "image",
                            ext: file.name.split(".").pop() || "png",
                            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                            url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
                            uploadedAt: new Date().toISOString().split("T")[0]
                          };
                          setMediaItems([newItem, ...mediaItems]);
                          showToast(`Uploaded: ${file.name}`);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* FOLDER FILTER ROW */}
              <div className="flex flex-wrap items-center gap-2">
                {["All", "Movies", "Events", "Posters", "Celebrities", "Banners", "Gallery", "Documents", "Videos", "Logos", "Icons"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setMediaFolderFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      mediaFolderFilter === f
                        ? "bg-amber-500 text-black font-extrabold shadow"
                        : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                    }`}
                  >
                    📂 {f}
                  </button>
                ))}
              </div>

              {/* MEDIA GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mediaItems
                  .filter((m) => mediaFolderFilter === "All" || m.folder === mediaFolderFilter)
                  .map((item) => (
                    <div key={item.id} className="bg-[#0D0E13] border border-white/10 rounded-xl overflow-hidden p-3 space-y-2 group hover:border-amber-500/40">
                      <div className="h-28 w-full rounded-lg bg-black/60 overflow-hidden relative flex items-center justify-center">
                        {item.type === "image" ? (
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="text-center p-2">
                            <span className="text-2xl">📄</span>
                            <p className="text-[10px] font-mono text-amber-400 mt-1">{item.ext.toUpperCase()}</p>
                          </div>
                        )}
                        <span className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-white/80">
                          {item.size}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-white truncate">{item.name}</p>
                      <div className="flex items-center justify-between text-[10px] text-white/40">
                        <span>{item.folder}</span>
                        <button
                          onClick={() => {
                            setMediaItems(mediaItems.filter((i) => i.id !== item.id));
                            showToast("File deleted");
                          }}
                          className="text-rose-400 hover:text-rose-300 font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 8: POSTER MANAGER */}
          {activeTab === "poster_manager" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <span>🖼️</span>
                    <span>Dedicated Poster Manager</span>
                  </h2>
                  <p className="text-xs text-white/50 mt-1">Manage movie posters, festival art, celebrity promotional visuals, and schedules.</p>
                </div>
                <button
                  onClick={() => setIsPosterModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Poster</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {posters.map((poster) => (
                  <div key={poster.id} className="bg-[#0D0E13] border border-white/10 rounded-2xl overflow-hidden shadow-2xl space-y-3">
                    <div className="h-64 w-full relative overflow-hidden">
                      <img src={poster.imageUrl} alt={poster.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      <span className="absolute top-3 right-3 px-2 py-0.5 bg-black/80 text-amber-300 font-mono text-[10px] font-bold rounded border border-amber-500/30">
                        {poster.category}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="text-sm font-bold text-white">{poster.title}</h4>
                      <div className="flex items-center justify-between text-[11px] text-white/50 font-mono">
                        <span>Impressions: {poster.impressions.toLocaleString()}</span>
                        <span>Clicks: {poster.clicks.toLocaleString()}</span>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-white/5">
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                            poster.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {poster.status}
                        </span>
                        <button
                          onClick={() => {
                            setPosters(posters.filter((p) => p.id !== poster.id));
                            showToast("Poster removed");
                          }}
                          className="text-rose-400 text-xs font-bold hover:text-rose-300 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* POSTER MODAL */}
              {isPosterModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="bg-[#0D0E13] border border-white/20 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-left">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h3 className="text-base font-bold text-white">Upload Poster Visual</h3>
                      <button onClick={() => setIsPosterModalOpen(false)} className="text-white/60 hover:text-white cursor-pointer">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-white/80 mb-1">POSTER TITLE</label>
                        <input
                          type="text"
                          value={posterForm.title}
                          onChange={(e) => setPosterForm({ ...posterForm, title: e.target.value })}
                          placeholder="e.g. IMAX Official Poster"
                          className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-white/80 mb-1">CATEGORY</label>
                        <select
                          value={posterForm.category}
                          onChange={(e) => setPosterForm({ ...posterForm, category: e.target.value as any })}
                          className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white font-bold"
                        >
                          <option value="Movie Posters">Movie Posters</option>
                          <option value="Event Posters">Event Posters</option>
                          <option value="Celebrity Posters">Celebrity Posters</option>
                          <option value="Promotion Posters">Promotion Posters</option>
                          <option value="Festival Posters">Festival Posters</option>
                          <option value="Sponsor Posters">Sponsor Posters</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-white/80 mb-1">IMAGE URL</label>
                        <input
                          type="text"
                          value={posterForm.imageUrl}
                          onChange={(e) => setPosterForm({ ...posterForm, imageUrl: e.target.value })}
                          placeholder="https://..."
                          className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>

                      <button
                        onClick={() => {
                          const newPost: PosterItem = {
                            id: `post_${Date.now()}`,
                            title: posterForm.title || "New Poster",
                            category: posterForm.category,
                            imageUrl: posterForm.imageUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
                            status: "Active",
                            startDate: posterForm.startDate,
                            expiryDate: posterForm.expiryDate,
                            impressions: 120,
                            clicks: 14
                          };
                          setPosters([newPost, ...posters]);
                          setIsPosterModalOpen(false);
                          showToast("Poster published!");
                        }}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                      >
                        Publish Poster
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: PILLAR SPECIFIC MODULES */}
          {activeTab === "pillar_specific" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <span>🏛️</span>
                    <span>{currentPillar.name} Core Database & Operations</span>
                  </h2>
                  <p className="text-xs text-white/50 mt-1">Dedicated backend data tables, booking engine parameters, and line items.</p>
                </div>
              </div>

              {/* PILLAR 1: MOVIE BOOKING */}
              {selectedPillarKey === "movieBooking" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Active Movies", val: "24 Titles" },
                      { label: "Partner Theatres", val: "185 Multiplexes" },
                      { label: "Daily Showtimes", val: "1,420 Shows" },
                      { label: "Bookings Today", val: "3,890 Tickets" }
                    ].map((k, idx) => (
                      <div key={idx} className="bg-[#0D0E13] border border-white/10 p-4 rounded-xl space-y-1">
                        <span className="text-[10px] text-amber-400 font-mono uppercase font-bold">{k.label}</span>
                        <p className="text-lg font-bold text-white">{k.val}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#0D0E13] border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Movies Catalog & Showtimes</h3>
                    <div className="space-y-3 text-xs">
                      {[
                        { title: "Kalki 2898 AD: Part 2", genre: "Sci-Fi Action", rating: "UA", duration: "180 min", screens: "45 Screens" },
                        { title: "Devara Part 1", genre: "Mass Action Drama", rating: "U/A", duration: "165 min", screens: "38 Screens" },
                        { title: "Pushpa 2: The Rule", genre: "Action Thriller", rating: "UA", duration: "175 min", screens: "52 Screens" }
                      ].map((mov, i) => (
                        <div key={i} className="p-4 bg-black/60 border border-white/10 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white text-sm">{mov.title}</p>
                            <p className="text-white/50 text-[10px]">{mov.genre} &middot; {mov.rating} &middot; {mov.duration}</p>
                          </div>
                          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded font-mono font-bold">
                            {mov.screens}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PILLAR 2: EVENT BOOKING */}
              {selectedPillarKey === "eventBooking" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Upcoming Events", val: "18 Concerts & Shows" },
                      { label: "Booked VIP Passes", val: "842 Passes" },
                      { label: "Registered Artists", val: "45 Performers" },
                      { label: "Total Gate Revenue", val: "₹42,10,000" }
                    ].map((k, idx) => (
                      <div key={idx} className="bg-[#0D0E13] border border-white/10 p-4 rounded-xl space-y-1">
                        <span className="text-[10px] text-rose-400 font-mono uppercase font-bold">{k.label}</span>
                        <p className="text-lg font-bold text-white">{k.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PILLAR 3: FILM PRODUCTION */}
              {selectedPillarKey === "filmProduction" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Active Line Projects", val: "8 Movies in Prod" },
                      { label: "Open Casting Calls", val: "14 Audition Hubs" },
                      { label: "Camera Gear Units", val: "22 ARRI / RED Rigs" },
                      { label: "Line Budget Managed", val: "₹125 Crores" }
                    ].map((k, idx) => (
                      <div key={idx} className="bg-[#0D0E13] border border-white/10 p-4 rounded-xl space-y-1">
                        <span className="text-[10px] text-blue-400 font-mono uppercase font-bold">{k.label}</span>
                        <p className="text-lg font-bold text-white">{k.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PILLAR 4: EVENT MANAGEMENT */}
              {selectedPillarKey === "eventManagement" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Turnkey Executions", val: "32 Audio Launches" },
                      { label: "Stage & LED Arena Rigs", val: "18 Setup Rigs" },
                      { label: "VIP Security Detail", val: "120 Personnel" },
                      { label: "Contract Value", val: "₹88 Lakhs" }
                    ].map((k, idx) => (
                      <div key={idx} className="bg-[#0D0E13] border border-white/10 p-4 rounded-xl space-y-1">
                        <span className="text-[10px] text-emerald-400 font-mono uppercase font-bold">{k.label}</span>
                        <p className="text-lg font-bold text-white">{k.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PILLAR 5: BRAND PUBLICITY */}
              {selectedPillarKey === "brandPromotion" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Active Ad Campaigns", val: "14 Brands" },
                      { label: "On-Screen Slide Slots", val: "420 Screen Slots" },
                      { label: "Monthly Eyeballs", val: "2.4 Million Views" },
                      { label: "Media Retainer", val: "₹34 Lakhs / mo" }
                    ].map((k, idx) => (
                      <div key={idx} className="bg-[#0D0E13] border border-white/10 p-4 rounded-xl space-y-1">
                        <span className="text-[10px] text-yellow-400 font-mono uppercase font-bold">{k.label}</span>
                        <p className="text-lg font-bold text-white">{k.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PILLAR 6: CINECOINS LOYALTY */}
              {selectedPillarKey === "cineCoinsLoyalty" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Active Members", val: "45,280 Members" },
                      { label: "Coins in Circulation", val: "1.25M CC" },
                      { label: "Redemptions Today", val: "482 Vouchers" },
                      { label: "Avg. User Balance", val: "850 Coins" }
                    ].map((k, idx) => (
                      <div key={idx} className="bg-[#0D0E13] border border-white/10 p-4 rounded-xl space-y-1">
                        <span className="text-[10px] text-amber-400 font-mono uppercase font-bold">{k.label}</span>
                        <p className="text-lg font-bold text-white">{k.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#0D0E13] border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">CineCoins Loyalty Sub-Website Hub</h3>
                    <p className="text-xs text-white/60">
                      Manage member rewards, spin wheel odds, scratch cards, earning rules, and gamified daily challenges directly for the CineCoins sub-website portal.
                    </p>
                    <a
                      href="/cinecoins"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      <span>🪙 Open Live CineCoins Standalone Sub-Website</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 10: FORM BUILDER */}
          {activeTab === "form_builder" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <span>📑</span>
                    <span>No-Code Dynamic Form Builder</span>
                  </h2>
                  <p className="text-xs text-white/50 mt-1">Design custom registration, contact, and B2B inquiry forms for website visitors.</p>
                </div>
                <button
                  onClick={() => setIsFormModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Form</span>
                </button>
              </div>

              <div className="space-y-4">
                {forms.map((form) => (
                  <div key={form.id} className="bg-[#0D0E13] border border-white/10 rounded-2xl p-6 space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white">{form.name}</h3>
                        <p className="text-xs text-white/40">{form.fields.length} Input Fields &middot; {form.submissionsCount} Submissions Received</p>
                      </div>
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-mono font-bold border border-amber-500/20">
                        Active Form
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      {form.fields.map((f) => (
                        <div key={f.id} className="p-3 bg-black/40 border border-white/5 rounded-xl">
                          <p className="font-bold text-white/90">{f.label}</p>
                          <p className="text-[10px] text-amber-400 font-mono mt-0.5">{f.type.toUpperCase()} &middot; {f.required ? "Required" : "Optional"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* FORM MODAL */}
              {isFormModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="bg-[#0D0E13] border border-white/20 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-left">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h3 className="text-base font-bold text-white">Create Custom Form</h3>
                      <button onClick={() => setIsFormModalOpen(false)} className="text-white/60 hover:text-white cursor-pointer">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-white/80 mb-1">FORM NAME</label>
                        <input
                          type="text"
                          value={newFormTitle}
                          onChange={(e) => setNewFormTitle(e.target.value)}
                          placeholder="e.g. Partner Franchise Registration"
                          className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white"
                        />
                      </div>

                      <button
                        onClick={() => {
                          const newF: CMSForm = {
                            id: `f_${Date.now()}`,
                            name: newFormTitle || "Custom Form",
                            fields: [
                              { id: "f_1", label: "Full Name", type: "text", required: true },
                              { id: "f_2", label: "Email Address", type: "email", required: true },
                              { id: "f_3", label: "Phone", type: "phone", required: true }
                            ],
                            submissionsCount: 0
                          };
                          setForms([...forms, newF]);
                          setIsFormModalOpen(false);
                          setNewFormTitle("");
                          showToast("Form created!");
                        }}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                      >
                        Generate Form
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 11: SEO MANAGER */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <span>🔍</span>
                    <span>Enterprise SEO & Meta Manager</span>
                  </h2>
                  <p className="text-xs text-white/50 mt-1">Configure search meta tags, Open Graph cards, dynamic XML sitemaps, and Robots.txt rules.</p>
                </div>
              </div>

              <div className="bg-[#0D0E13] border border-white/10 rounded-2xl p-6 space-y-4 text-left text-xs">
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-white/80 mb-1">GLOBAL META TITLE</label>
                    <input
                      type="text"
                      value={seoForm.metaTitle}
                      onChange={(e) => setSeoForm({ ...seoForm, metaTitle: e.target.value })}
                      className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-white/80 mb-1">META DESCRIPTION</label>
                    <textarea
                      rows={3}
                      value={seoForm.metaDescription}
                      onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                      className="w-full bg-black border border-white/15 rounded-xl p-3 text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-white/80 mb-1">SEARCH KEYWORDS</label>
                    <input
                      type="text"
                      value={seoForm.keywords}
                      onChange={(e) => setSeoForm({ ...seoForm, keywords: e.target.value })}
                      className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-white/80 mb-1">ROBOTS.TXT CONFIGURATION</label>
                    <textarea
                      rows={4}
                      value={seoForm.robotsTxt}
                      onChange={(e) => setSeoForm({ ...seoForm, robotsTxt: e.target.value })}
                      className="w-full bg-black border border-white/15 rounded-xl p-3 text-white font-mono"
                    />
                  </div>

                  <button
                    onClick={() => showToast("SEO settings updated!")}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Save SEO Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: USER MANAGEMENT */}
          {activeTab === "user_management" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <span>👥</span>
                    <span>Role-Based User Permissions</span>
                  </h2>
                  <p className="text-xs text-white/50 mt-1">Assign access levels: Super Admin, Admin, Editor, Marketing, Finance, Customer Support.</p>
                </div>
              </div>

              <div className="bg-[#0D0E13] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/60 text-amber-400 font-mono uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02]">
                        <td className="p-4">
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-[10px] text-white/40">{u.email}</p>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded font-mono font-bold">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-emerald-400 font-mono font-bold">{u.status}</td>
                        <td className="p-4 text-white/50">{u.lastActive}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 13: SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <span>⚙️</span>
                    <span>Sub-Website Global Settings</span>
                  </h2>
                  <p className="text-xs text-white/50 mt-1">Colors, logo, contact details, payment gateway keys, and Google Analytics.</p>
                </div>
              </div>

              <div className="bg-[#0D0E13] border border-white/10 rounded-2xl p-6 space-y-4 text-left text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-white/80 mb-1">WEBSITE NAME</label>
                    <input
                      type="text"
                      value={settingsForm.websiteName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, websiteName: e.target.value })}
                      className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-white/80 mb-1">SUPPORT EMAIL</label>
                    <input
                      type="email"
                      value={settingsForm.contactEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                      className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-white/80 mb-1">SUPPORT PHONE</label>
                    <input
                      type="text"
                      value={settingsForm.contactPhone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                      className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-white/80 mb-1">GOOGLE ANALYTICS ID</label>
                    <input
                      type="text"
                      value={settingsForm.googleAnalyticsId}
                      onChange={(e) => setSettingsForm({ ...settingsForm, googleAnalyticsId: e.target.value })}
                      className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={() => showToast("Sub-website settings saved!")}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Save Global Settings
                </button>
              </div>
            </div>
          )}

          {/* TAB 14: ACTIVITY LOGS */}
          {activeTab === "activity_logs" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <span>📜</span>
                    <span>Admin Audit Trail & Logs</span>
                  </h2>
                  <p className="text-xs text-white/50 mt-1">Full immutable history of changes made inside this CMS.</p>
                </div>
              </div>

              <div className="bg-[#0D0E13] border border-white/10 rounded-2xl p-6 space-y-3">
                {activityLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-black/60 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{log.action}</p>
                      <p className="text-[10px] text-white/40">By {log.user} &middot; Module: {log.module} &middot; IP: {log.ip}</p>
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 15: BACKUP & RESTORE */}
          {activeTab === "backup_restore" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <span>💾</span>
                    <span>Database Backup & Restore</span>
                  </h2>
                  <p className="text-xs text-white/50 mt-1">Create full JSON database backups of pages, media tags, layouts, and settings.</p>
                </div>
              </div>

              <div className="bg-[#0D0E13] border border-white/10 rounded-2xl p-6 space-y-6 text-left">
                <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
                  <h3 className="text-base font-bold text-amber-400">Download Full Website Snapshot</h3>
                  <p className="text-xs text-white/70">
                    Export all pages, sections, media references, and configuration settings for <strong>{currentPillar.name}</strong> as an encrypted JSON backup file.
                  </p>
                  <button
                    onClick={() => {
                      const backupData = {
                        pillar: selectedPillarKey,
                        timestamp: new Date().toISOString(),
                        pages: pagesMap[selectedPillarKey],
                        homepageSections: homepageSectionsMap[selectedPillarKey],
                        heroSlides,
                        mediaItems,
                        posters,
                        forms,
                        settings: settingsForm
                      };
                      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `cinevenue_${selectedPillarKey}_backup_${Date.now()}.json`;
                      a.click();
                      showToast("Backup downloaded!");
                    }}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Backup</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
