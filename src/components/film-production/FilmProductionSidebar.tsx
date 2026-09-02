import React from "react";
import { 
  Film, Sparkles, PlusCircle, Search, MessageSquare, 
  User, Building2, Briefcase, Users, Clapperboard, Award,
  CheckCircle2, ArrowRight, ShieldCheck, ChevronRight,
  LayoutDashboard, FileText, FolderKanban, UserCheck, 
  ArrowLeft, X, Menu, Shield, ExternalLink
} from "lucide-react";
import CineVenueLogo from "../CineVenueLogo";

interface FilmProductionSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail?: string | null;
  onOpenAuth?: () => void;
  onCreateProject: () => void;
  onOpenMyProfile: () => void;
  onOpenAdmin?: () => void;
  negotiationsCount?: number;
  myProjectsCount?: number;
  agreementsCount?: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export default function FilmProductionSidebar({
  activeTab,
  setActiveTab,
  userEmail,
  onOpenAuth,
  onCreateProject,
  onOpenMyProfile,
  onOpenAdmin,
  negotiationsCount = 0,
  myProjectsCount = 0,
  agreementsCount = 0,
  isOpenMobile,
  setIsOpenMobile
}: FilmProductionSidebarProps) {
  
  const handleNavClick = (tabId: string) => {
    if (tabId === "create-project") {
      onCreateProject();
    } else if (tabId === "my-profile") {
      onOpenMyProfile();
    } else if (tabId === "admin" && onOpenAdmin) {
      onOpenAdmin();
    } else {
      setActiveTab(tabId);
    }
    setIsOpenMobile(false);
  };

  const navSections = [
    {
      title: "PRODUCTION & TALENT HUB",
      items: [
        { id: "overview", label: "Overview", icon: LayoutDashboard, desc: "Highlights & 24 Crafts" },
        { id: "professionals", label: "Talent Hub (24 Crafts)", icon: Users, desc: "Actors & Crew Directory", highlight: true },
        { id: "projects", label: "Film Projects & Slate", icon: Film, desc: "Active Feature & Short Films" },
        { id: "casting", label: "Casting Calls", icon: Award, desc: "Lead, Character & Auditions" },
        { id: "jobs", label: "Crew Openings", icon: Briefcase, desc: "Technical & Craft Jobs" },
        { id: "companies", label: "Studios & Banners", icon: Building2, desc: "Production Houses" },
      ]
    },
    {
      title: "STUDIO & ATS WORKSPACE",
      items: [
        { 
          id: "my-projects", 
          label: "My Projects & ATS", 
          icon: FolderKanban, 
          badge: myProjectsCount > 0 ? myProjectsCount : undefined,
          desc: "Applicant Tracking System"
        },
        { 
          id: "create-project", 
          label: "Create Film Project", 
          icon: PlusCircle, 
          desc: "Post Auditions & Crew Needs",
          actionBtn: true
        },
        { 
          id: "agreements", 
          label: "Digital Agreements", 
          icon: FileText, 
          badge: agreementsCount > 0 ? agreementsCount : undefined,
          desc: "Deal Memos & Milestone Escrow"
        },
        { 
          id: "messages", 
          label: "Offers & Negotiations", 
          icon: MessageSquare, 
          badge: negotiationsCount > 0 ? negotiationsCount : undefined,
          desc: "Contract Rooms & Chat"
        },
      ]
    },
    {
      title: "TALENT & ACCESS",
      items: [
        { id: "my-profile", label: "Talent Portfolio", icon: UserCheck, desc: "Manage Crafts, Reels & Rates" },
        { id: "admin", label: "24 Crafts Admin", icon: ShieldCheck, desc: "Studio & Crafts Management" },
      ]
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B0C12] border-r border-white/10 text-white select-none">
      
      {/* Top Header / Brand */}
      <div className="p-4 sm:p-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-gold to-yellow-400 p-0.5 flex items-center justify-center shadow-lg shadow-gold/20">
              <div className="w-full h-full bg-black rounded-[9px] flex items-center justify-center">
                <Clapperboard className="w-4 h-4 text-gold" />
              </div>
            </div>
            <div>
              <div className="text-xs font-black tracking-wider uppercase text-white flex items-center gap-1">
                <span>CINEVENUE</span>
                <span className="text-gold">STUDIO</span>
              </div>
              <div className="text-[9px] font-bold text-amber-400/80 uppercase tracking-widest">
                24 Crafts Marketplace
              </div>
            </div>
          </div>

          {/* Close for mobile */}
          <button
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Return to Main Site */}
        <button
          onClick={() => window.location.href = "/"}
          className="mt-3 w-full py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-[10px] font-bold flex items-center justify-between transition-all cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <ArrowLeft className="w-3 h-3 text-amber-400" />
            <span>Main CineVenue Platform</span>
          </span>
          <span className="text-[9px] text-white/40">Home</span>
        </button>
      </div>

      {/* Main Post Project Call-To-Action in Sidebar */}
      <div className="p-4 pb-2">
        <button
          onClick={() => handleNavClick("create-project")}
          className="w-full py-2.5 px-3.5 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2 cursor-pointer group"
        >
          <PlusCircle className="w-4 h-4 text-black group-hover:rotate-90 transition-transform" />
          <span>Post Film Project</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 scrollbar-thin scrollbar-thumb-white/10">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center justify-between">
              <span>{section.title}</span>
            </div>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-500/10 font-bold"
                        : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg transition-colors ${
                        isActive 
                          ? "bg-amber-500/20 text-amber-400" 
                          : "bg-white/5 text-white/60 group-hover:text-amber-400 group-hover:bg-amber-500/10"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs truncate ${isActive ? "font-black text-amber-400" : "font-bold text-white/90 group-hover:text-white"}`}>
                          {item.label}
                        </div>
                        <div className="text-[10px] text-white/40 truncate hidden sm:block">
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    {item.badge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                        isActive
                          ? "bg-amber-500 text-black"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Profile / User Panel */}
      <div className="p-3 border-t border-white/10 bg-[#08090D]">
        {userEmail ? (
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-black text-xs flex items-center justify-center shrink-0">
                {userEmail.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{userEmail.split("@")[0]}</div>
                <div className="text-[9px] text-amber-400 font-semibold truncate flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Verified Filmmaker</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onOpenMyProfile}
              title="Edit Profile"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500 hover:text-black text-white/70 transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={onOpenAuth}
              className="w-full py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Sign In / Join Hub</span>
            </button>
            <div className="text-center text-[9px] text-white/40">
              Connect with 24 Crafts & post casting
            </div>
          </div>
        )}
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 xl:w-72 shrink-0 h-[calc(100vh)] sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Drawer Sidebar */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsOpenMobile(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
