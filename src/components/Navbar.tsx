import React, { useState, useEffect } from "react";
import { 
  Film, MapPin, User, LogOut, ChevronDown, Sliders, Calendar, Sparkles, 
  Ticket, Menu, X, Coins, PlusCircle, Building2, ArrowLeft, Search, Settings, ShieldCheck 
} from "lucide-react";
import CineVenueLogo from "./CineVenueLogo";
import ThemeToggle from "./ThemeToggle";
import { useAppSettings } from "../context/AppSettingsContext";
import { POPULAR_CITIES, ALL_INDIAN_CITIES } from "../lib/location";

export interface NavbarProps {
  selectedCity?: string;
  setSelectedCity?: (city: string) => void;
  onOpenLocation?: () => void;
  cities?: string[];
  userEmail?: string | null;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onLogout?: () => void;
  onOpenAuth?: (mode?: any) => void;
  onOpenAdmin?: () => void;
  onOpenTheatreDashboard?: (theatreId: number) => void;
  onOpenEventDashboard?: (organizerId: string) => void;
  onOpenOrders?: () => void;
  onOpenCineCoins?: () => void;
  onOpenAccount?: () => void;
  onOpenProductions?: () => void;
  onOpenSettings?: () => void;
  theatreAdmins?: any[];
  eventOrganizers?: any[];
  superAdminEmail?: string;
}

export default function Navbar({
  selectedCity,
  setSelectedCity,
  onOpenLocation,
  cities = [],
  userEmail,
  searchQuery = "",
  setSearchQuery,
  onLogout,
  onOpenAuth,
  onOpenAdmin,
  onOpenTheatreDashboard,
  onOpenEventDashboard,
  onOpenOrders,
  onOpenCineCoins,
  onOpenAccount,
  onOpenProductions,
  onOpenSettings,
  theatreAdmins = [],
  eventOrganizers = [],
  superAdminEmail = "",
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSubwebsiteEnabled, settings } = useAppSettings();

  const isGlobalWebsiteLive = (settings?.serviceControls?.website?.status !== false) && (settings?.serviceControls?.globalWebsite?.status !== false);
  const isMovieBookingLive = (settings?.serviceControls?.movieBooking?.status !== false) && !settings?.maintenanceMode && isGlobalWebsiteLive;
  const isFilmProductionLive = (settings?.serviceControls?.filmProduction?.status !== false) && isGlobalWebsiteLive && isSubwebsiteEnabled;
  const isEventsLive = (settings?.serviceControls?.eventBooking?.status !== false) && (settings?.serviceControls?.eventManagement?.status !== false) && isGlobalWebsiteLive && isSubwebsiteEnabled;
  const isCineCoinsLive = (settings?.serviceControls?.cinecoins?.status !== false) && (settings?.serviceControls?.cineCoinsLoyalty?.status !== false) && isGlobalWebsiteLive;

  // Determine user role
  const isSuperAdmin = Boolean(
    (userEmail && superAdminEmail && userEmail.toLowerCase() === superAdminEmail.toLowerCase()) ||
    (userEmail && userEmail.toLowerCase().includes("superadmin"))
  );
  const matchTheatreAdmin = theatreAdmins.find(a => a?.email?.toLowerCase() === userEmail?.toLowerCase());
  const matchEventOrganizer = eventOrganizers.find(o => o?.email?.toLowerCase() === userEmail?.toLowerCase());

  // Derive city and state
  const activeCity = selectedCity || (typeof window !== "undefined" ? localStorage.getItem("cine_selected_city") || "All Cities" : "All Cities");
  const matchedCity =
    POPULAR_CITIES.find((c) => c.name.toLowerCase() === activeCity?.toLowerCase()) ||
    ALL_INDIAN_CITIES.find((c) => c.name.toLowerCase() === activeCity?.toLowerCase());
  const stateSubtitle = activeCity === "All Cities" ? "All Locations" : matchedCity?.state || "India";

  // Close drawer on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOpenPasses = () => {
    if (onOpenOrders) {
      onOpenOrders();
    } else if (onOpenAccount) {
      onOpenAccount();
    } else {
      window.location.href = "/account";
    }
  };

  const handleOpenSettingsAction = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      window.location.href = "/settings";
    }
  };

  const handleLogoutAction = () => {
    if (onLogout) {
      onLogout();
    } else {
      try {
        localStorage.removeItem("cine_user_token");
        localStorage.removeItem("cine_user_email");
        localStorage.removeItem("cine_auth_state");
      } catch (e) {}
      window.location.reload();
    }
  };

  const userInitials = userEmail ? userEmail.substring(0, 2).toUpperCase() : "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0A0A0B]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 w-full shadow-xs dark:shadow-2xl transition-all">
      {/* Top Navbar Row: Responsive fluid container with zero horizontal clipping */}
      <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-3 min-w-0">
        
        {/* Left: Brand Logo, Back Navigation & Location Selector */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
          {typeof window !== "undefined" && window.location.pathname !== "/" && window.location.pathname !== "" && (
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.href = "/";
                }
              }}
              className="group flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 hover:bg-yellow-100/70 dark:bg-gold/15 dark:hover:bg-gold/25 border border-slate-200 dark:border-gold/40 hover:border-yellow-400 dark:hover:border-gold text-slate-800 dark:text-amber-200 hover:text-black dark:hover:text-gold text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              title="Back to previous page"
              aria-label="Back to previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-800 dark:text-gold group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <div className="shrink-0">
            <CineVenueLogo 
              size="md" 
              onClick={() => {
                if (typeof window !== "undefined" && (window.location.pathname === "/" || window.location.pathname === "")) {
                  handleScroll("home");
                } else {
                  window.location.href = "/";
                }
              }} 
            />
          </div>

          {/* District Location Selector Pill */}
          <button
            type="button"
            onClick={() => {
              if (onOpenLocation) onOpenLocation();
              else window.location.href = "/booking";
            }}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-2xl bg-slate-100 hover:bg-[#D4AF37]/15 dark:bg-white/[0.05] dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/10 hover:border-[#D4AF37] dark:hover:border-gold/40 transition-all group cursor-pointer text-left shadow-xs dark:shadow-sm shrink min-w-0"
            title={`Location: ${activeCity} (${stateSubtitle})`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-0.5">
                <span className="text-[11px] sm:text-xs md:text-[13px] font-bold text-slate-900 dark:text-white max-w-[65px] xs:max-w-[85px] sm:max-w-[105px] md:max-w-[125px] truncate leading-tight">
                  {activeCity === "All Cities" ? "Select City" : activeCity}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 dark:text-white/50 group-hover:text-[#D4AF37] transition-colors shrink-0" />
              </div>
              <span className="hidden sm:block text-[9px] sm:text-[10px] text-slate-500 dark:text-white/50 leading-none truncate max-w-[80px] md:max-w-[105px]">
                {stateSubtitle}
              </span>
            </div>
          </button>
        </div>

        {/* Center: District Navigation Capsule Bar (Active on xl to prevent laptop header overflow) */}
        <div className="hidden xl:flex items-center gap-1 bg-slate-100/90 dark:bg-[#151518] p-1 rounded-full border border-slate-200 dark:border-white/10 shadow-inner shrink-0">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/#home";
            }}
            className="px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer border-0 bg-transparent text-slate-950 dark:text-white/70 hover:text-black dark:hover:text-[#D4AF37] hover:bg-[#D4AF37]/15 dark:hover:bg-white/5 whitespace-nowrap"
          >
            For you
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/booking";
            }}
            className="px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer border-0 bg-[#D4AF37] hover:bg-[#E5C158] text-black shadow-xs shadow-[#D4AF37]/30 whitespace-nowrap flex items-center gap-1"
          >
            <span>Movies</span>
            {isMovieBookingLive && (
              <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-black bg-white/75 px-1 py-0.2 rounded-full border border-black/15 font-mono">
                <span className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse" />
                LIVE
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/events";
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer border-0 bg-transparent flex items-center gap-1 whitespace-nowrap ${
              isEventsLive ? "text-slate-950 dark:text-white/70 hover:text-black dark:hover:text-[#D4AF37] hover:bg-[#D4AF37]/15 dark:hover:bg-white/5" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            <span>Event Booking</span>
            {isEventsLive ? (
              <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 px-1 py-0.2 rounded-full border border-emerald-200 dark:border-emerald-400/20 font-mono">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            ) : (
              <span className="text-[8px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold">OFF</span>
            )}
          </button>
        </div>

        {/* Right: Critical Actions Group (Settings, My Passes, Profile, Theme) + Mobile Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 shrink-0">
          
          {/* Top Search Input: Visible on 2xl screens */}
          {setSearchQuery && (
            <div className="hidden 2xl:flex items-center relative w-44 xl:w-52">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-white/40 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search movies, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white dark:bg-white/[0.06] dark:hover:bg-white/[0.08] dark:focus:bg-black/80 border border-slate-200 dark:border-white/10 focus:border-yellow-400 dark:focus:border-gold/50 rounded-full pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none transition-all shadow-xs"
              />
            </div>
          )}

          {/* Theme Toggle: Dropdown for responsive density, Segmented on 2xl */}
          <div className="hidden 2xl:flex items-center shrink-0">
            <ThemeToggle variant="segmented" />
          </div>
          <div className="flex 2xl:hidden items-center shrink-0">
            <ThemeToggle variant="dropdown" />
          </div>

          {/* CRITICAL ACTION 1: Settings Shortcut - ALWAYS VISIBLE & ACCESSIBLE ON ALL DEVICES */}
          <button
            type="button"
            onClick={handleOpenSettingsAction}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 hover:bg-yellow-100/70 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-700 hover:text-black dark:text-white/80 dark:hover:text-gold active:scale-95 transition-all cursor-pointer shadow-xs dark:shadow-none shrink-0"
            title="Application Settings & Preferences"
            aria-label="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* CRITICAL ACTION 2: My Passes Button - ALWAYS VISIBLE & NEVER CLIPPED */}
          <button
            type="button"
            onClick={handleOpenPasses}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-yellow-400/80 bg-[#FEF08A] hover:bg-[#FDE047] active:scale-95 text-slate-950 text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-xs sm:shadow-sm transition-all cursor-pointer shrink-0"
            title="My Bookings & Event Passes"
            aria-label="My Passes"
          >
            <Ticket className="w-3.5 h-3.5 text-slate-950 shrink-0" />
            <span className="hidden xs:inline sm:inline">My Passes</span>
          </button>

          {/* Role Hub Shortcuts (Visible on 2xl or tablet/desktop) */}
          {!isSuperAdmin && matchTheatreAdmin && (
            <button
              type="button"
              onClick={() => onOpenTheatreDashboard?.(matchTheatreAdmin.theatreId)}
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider hover:bg-purple-500 hover:text-white transition-all cursor-pointer shadow-xs shrink-0"
              title="Theatre Management Workspace"
            >
              <Sliders className="w-3 h-3" />
              <span>Theatre Hub</span>
            </button>
          )}

          {!isSuperAdmin && !matchTheatreAdmin && matchEventOrganizer && (
            <button
              type="button"
              onClick={() => onOpenEventDashboard?.(matchEventOrganizer.id)}
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500 hover:text-white transition-all cursor-pointer shadow-xs shrink-0"
              title="Event Organizer Workspace"
            >
              <Calendar className="w-3 h-3" />
              <span>Events Hub</span>
            </button>
          )}

          {/* User Profile / Authentication Section */}
          {userEmail ? (
            <div 
              className="flex items-center gap-1 sm:gap-2 bg-slate-100 hover:bg-yellow-100/60 dark:bg-white/[0.05] dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/10 p-1 sm:px-2 sm:py-1 rounded-full cursor-pointer transition-all shadow-xs dark:shadow-none shrink-0"
              onClick={() => {
                if (onOpenAccount) onOpenAccount();
                else window.location.href = "/account";
              }}
              title={userEmail.toLowerCase().includes("superadmin") ? "Account Profile" : `Account: ${userEmail}`}
            >
              <div className="w-6 h-6 rounded-full bg-[#FDE047] text-black border border-[#FACC15] flex items-center justify-center text-[10px] sm:text-[11px] font-extrabold shadow-xs shrink-0">
                {userEmail.toLowerCase().includes("superadmin") ? <User className="w-3 h-3 text-black" /> : (userInitials || <User className="w-3 h-3 text-black" />)}
              </div>
              <span className="hidden lg:inline text-[11px] font-bold text-slate-900 dark:text-white/90 max-w-[70px] truncate">
                {userEmail.toLowerCase().includes("superadmin") ? "Admin" : userEmail.split("@")[0]}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogoutAction();
                }}
                className="hidden sm:inline-flex text-slate-400 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 cursor-pointer transition-colors p-0.5 ml-0.5 bg-transparent border-none shrink-0"
                title="Secure Logout"
                aria-label="Secure Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (onOpenAuth) onOpenAuth("signin");
                  else window.location.href = "/login";
                }}
                className="inline-flex rounded-full border border-slate-300 dark:border-white/15 bg-transparent px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-slate-800 dark:text-white/80 hover:border-yellow-400 hover:text-black dark:hover:border-gold/40 dark:hover:text-gold transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onOpenAuth) onOpenAuth("signup");
                  else window.location.href = "/register";
                }}
                className="hidden md:inline-flex rounded-full bg-[#FDE047] hover:bg-[#FEF08A] px-3 py-1.5 text-xs text-black font-black border border-yellow-400/80 shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile / Laptop Hamburger Drawer Toggle: Shown below xl */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 text-slate-700 hover:text-black dark:text-white/80 dark:hover:text-gold rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-white/10 shrink-0"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Responsive Collapsible Drawer (Mobile & Small Laptop Viewports) */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-x-0 top-[52px] sm:top-[57px] max-h-[calc(100vh-58px)] overflow-y-auto overscroll-contain bg-white/98 dark:bg-[#0A0A0B]/98 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 shadow-2xl z-50 p-3.5 sm:p-5 space-y-3.5 animate-fade-in">
          
          {/* Quick Action Top Cards: Passes, Settings, CineCoins */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleOpenPasses();
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-yellow-100/80 dark:bg-gold/15 border border-yellow-300 dark:border-gold/30 text-left cursor-pointer hover:bg-yellow-200/80 dark:hover:bg-gold/25 transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-[#FDE047] text-black flex items-center justify-center shrink-0 shadow-xs">
                <Ticket className="w-4 h-4 text-black" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-slate-950 dark:text-amber-200 leading-tight truncate">My Passes</div>
                <div className="text-[10px] text-slate-600 dark:text-amber-300/70 truncate">Tickets & Orders</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleOpenSettingsAction();
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-left cursor-pointer hover:bg-slate-200/70 dark:hover:bg-white/[0.08] transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white flex items-center justify-center shrink-0">
                <Settings className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">Settings</div>
                <div className="text-[10px] text-slate-500 dark:text-white/50 truncate">Preferences</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenCineCoins) onOpenCineCoins();
                else window.location.href = "/cinecoins";
              }}
              className="col-span-2 sm:col-span-1 flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left cursor-pointer hover:bg-amber-500/20 transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-300 leading-tight truncate">CineCoins</div>
                <div className="text-[10px] text-amber-700 dark:text-amber-400/70 truncate">Vault & Rewards</div>
              </div>
            </button>
          </div>

          {/* In-Drawer Mobile Search Bar */}
          {setSearchQuery && (
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search movies, events, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 focus:border-yellow-400 dark:focus:border-gold/50 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none transition-all shadow-inner"
              />
            </div>
          )}

          {/* In-Drawer City / Location Switcher */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-slate-500 dark:text-white/50 uppercase font-bold tracking-wider">Current Location</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{activeCity} ({stateSubtitle})</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenLocation) onOpenLocation();
                else window.location.href = "/booking";
              }}
              className="px-2.5 py-1 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0"
            >
              Change
            </button>
          </div>

          {/* Sub-Website & Service Navigation Section */}
          <div className="space-y-1 pt-1">
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-white/40 px-2 pb-1">
              Explore CineVenue
            </div>

            <button 
              type="button"
              onClick={() => { setMobileMenuOpen(false); window.location.href = "/"; }} 
              className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer border-none bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-white flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Home / For You</span>
              </div>
            </button>

            <button 
              type="button"
              onClick={() => { setMobileMenuOpen(false); window.location.href = "/booking"; }} 
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer border-none bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-between ${
                isMovieBookingLive ? "text-slate-800 dark:text-white" : "text-rose-500 dark:text-rose-400"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Ticket className="w-4 h-4 text-[#D4AF37]" />
                <span>Movie Ticket Booking</span>
              </div>
              {isMovieBookingLive ? (
                <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-400/20 font-mono">
                  LIVE
                </span>
              ) : (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40 font-bold">OFFLINE</span>
              )}
            </button>

            <button 
              type="button"
              onClick={() => { setMobileMenuOpen(false); window.location.href = "/events"; }} 
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer border-none bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-between ${
                isEventsLive ? "text-slate-800 dark:text-white" : "text-rose-500 dark:text-rose-400"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <span>Events & Concert Booking</span>
              </div>
              {isEventsLive ? (
                <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-400/20 font-mono">
                  LIVE
                </span>
              ) : (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40 font-bold">OFFLINE</span>
              )}
            </button>

            <button 
              type="button"
              onClick={() => { setMobileMenuOpen(false); window.location.href = "/productions"; }} 
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer border-none bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-between ${
                isFilmProductionLive ? "text-slate-800 dark:text-white" : "text-rose-500 dark:text-rose-400"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Film className="w-4 h-4 text-[#D4AF37]" />
                <span>Film Productions & 24 Crafts</span>
              </div>
              {!isFilmProductionLive && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40 font-bold">OFFLINE</span>
              )}
            </button>

            <button 
              type="button"
              onClick={() => { setMobileMenuOpen(false); window.location.href = "/event-management"; }} 
              className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer border-none bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-white flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Event Management & Venues</span>
              </div>
            </button>

            <button 
              type="button"
              onClick={() => { setMobileMenuOpen(false); window.location.href = "/proposals"; }} 
              className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer border-none bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-white flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
                <span>Brand Publicity & Proposals</span>
              </div>
            </button>
          </div>

          {/* Admin & Role Hub Shortcuts */}
          {(isSuperAdmin || matchTheatreAdmin || matchEventOrganizer) && (
            <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-white/10">
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-purple-600 dark:text-purple-400 px-2 pb-1">
                Management Workspaces
              </div>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); if (onOpenAdmin) onOpenAdmin(); else window.location.href = "/booking"; }}
                  className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer border-none bg-purple-500/10 text-purple-700 dark:text-purple-300 flex items-center gap-2.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Super Admin Panel</span>
                </button>
              )}
              {matchTheatreAdmin && (
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); onOpenTheatreDashboard?.(matchTheatreAdmin.theatreId); }}
                  className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer border-none bg-purple-500/10 text-purple-700 dark:text-purple-300 flex items-center gap-2.5"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Theatre Hub ({matchTheatreAdmin.theatreName || "Workspace"})</span>
                </button>
              )}
              {matchEventOrganizer && (
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); onOpenEventDashboard?.(matchEventOrganizer.id); }}
                  className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer border-none bg-blue-500/10 text-blue-700 dark:text-blue-300 flex items-center gap-2.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Events Hub ({matchEventOrganizer.name || "Workspace"})</span>
                </button>
              )}
            </div>
          )}

          {/* Mobile Theme Selection Row */}
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-white/70">App Theme</span>
            <ThemeToggle variant="segmented" />
          </div>

          {/* Mobile User Profile & Auth Section */}
          <div className="pt-2 border-t border-slate-200 dark:border-white/10 pb-4">
            {userEmail ? (
              <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10">
                <div 
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAccount) onOpenAccount();
                    else window.location.href = "/account";
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-[#FDE047] text-black border border-[#FACC15] flex items-center justify-center text-xs font-extrabold shrink-0 shadow-xs">
                    {userEmail.toLowerCase().includes("superadmin") ? <User className="w-4 h-4 text-black" /> : (userInitials || <User className="w-4 h-4 text-black" />)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {userEmail.toLowerCase().includes("superadmin") ? "Administrator" : userEmail.split("@")[0]}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-white/50 truncate">{userEmail}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogoutAction();
                  }}
                  className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { 
                    setMobileMenuOpen(false); 
                    if (onOpenAuth) onOpenAuth("signin"); 
                    else window.location.href = "/login"; 
                  }}
                  className="flex-1 rounded-xl border border-slate-300 dark:border-white/20 bg-transparent py-2.5 text-center text-xs font-bold text-slate-800 dark:text-white/90 hover:border-yellow-400 hover:text-black dark:hover:border-gold dark:hover:text-gold transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { 
                    setMobileMenuOpen(false); 
                    if (onOpenAuth) onOpenAuth("signup"); 
                    else window.location.href = "/register"; 
                  }}
                  className="flex-1 rounded-xl bg-[#FDE047] hover:bg-[#FEF08A] py-2.5 text-center text-xs font-black text-black border border-yellow-400/80 shadow-md shadow-yellow-400/25 transition-all cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </nav>
  );
}
