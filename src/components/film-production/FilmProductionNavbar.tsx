import React from "react";
import { 
  Film, Sparkles, PlusCircle, Search, MessageSquare, 
  User, Building2, Briefcase, Users, Clapperboard, Award,
  CheckCircle2, ArrowRight, ShieldCheck, ChevronRight
} from "lucide-react";
import CineVenueLogo from "../CineVenueLogo";

interface FilmProductionNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail?: string | null;
  onOpenAuth?: () => void;
  onCreateProject: () => void;
  onOpenMyProfile: () => void;
  negotiationsCount?: number;
  myProjectsCount?: number;
}

export default function FilmProductionNavbar({
  activeTab,
  setActiveTab,
  userEmail,
  onOpenAuth,
  onCreateProject,
  onOpenMyProfile,
  negotiationsCount = 0,
  myProjectsCount = 0
}: FilmProductionNavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#090A0F]/95 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Badge */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <CineVenueLogo size="md" onClick={() => window.location.href = "/"} />
            <div className="h-5 w-px bg-white/20 hidden sm:block" />
            <div 
              onClick={() => setActiveTab("overview")}
              className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest"
            >
              <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Production & Talent Hub</span>
            </div>
          </div>

          {/* Mobile Profile / Login trigger */}
          <div className="flex md:hidden items-center gap-2">
            {userEmail ? (
              <button
                onClick={onOpenMyProfile}
                className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center justify-center cursor-pointer"
              >
                {userEmail.substring(0, 2).toUpperCase()}
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 bg-amber-500 text-black text-xs font-bold rounded-lg cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none text-xs font-semibold">
          {[
            { id: "overview", label: "Overview", icon: Clapperboard },
            { id: "projects", label: "Film Projects", icon: Film },
            { id: "professionals", label: "24 Crafts Talent", icon: Users },
            { id: "casting", label: "Casting Calls", icon: Award },
            { id: "jobs", label: "Crew Openings", icon: Briefcase },
            { id: "companies", label: "Studios", icon: Building2 },
            { 
              id: "my-projects", 
              label: "Filmmaker Studio", 
              icon: PlusCircle, 
              badge: myProjectsCount > 0 ? myProjectsCount : undefined 
            },
            { 
              id: "messages", 
              label: "Offers & Chat", 
              icon: MessageSquare, 
              badge: negotiationsCount > 0 ? negotiationsCount : undefined 
            }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-500/10 font-bold" 
                    : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-white/50"}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-black text-[9px] font-extrabold rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onCreateProject}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Project</span>
          </button>

          {userEmail ? (
            <button
              onClick={onOpenMyProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
              title="Manage Your Talent Profile & Crafts"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-extrabold flex items-center justify-center">
                {userEmail.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-semibold max-w-[100px] truncate">
                {userEmail.split("@")[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
