import React, { useState } from "react";
import { Film, MapPin, User, LogOut, ChevronDown, Sliders, Calendar, Sparkles, Ticket, Menu, X, Coins, PlusCircle, Building2, ArrowLeft, Search, Settings } from "lucide-react";
import CineVenueLogo from "./CineVenueLogo";
import ThemeToggle from "./ThemeToggle";
import { useAppSettings } from "../context/AppSettingsContext";
import { POPULAR_CITIES, ALL_INDIAN_CITIES } from "../lib/location";

interface NavbarProps {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  onOpenLocation: () => void;
  cities: string[];
  userEmail: string | null;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onLogout: () => void;
  onOpenAuth: (mode?: any) => void;
  onOpenAdmin: () => void;
  onOpenTheatreDashboard: (theatreId: number) => void;
  onOpenEventDashboard: (organizerId: string) => void;
  onOpenOrders: () => void;
  onOpenCineCoins?: () => void;
  onOpenAccount?: () => void;
  onOpenProductions?: () => void;
  theatreAdmins: any[];
  eventOrganizers: any[];
  superAdminEmail: string;
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
  theatreAdmins = [],
  eventOrganizers = [],
  superAdminEmail,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSubwebsiteEnabled, settings } = useAppSettings();

  const isGlobalWebsiteLive = (settings.serviceControls?.website?.status !== false) && (settings.serviceControls?.globalWebsite?.status !== false);
  const isMovieBookingLive = (settings.serviceControls?.movieBooking?.status !== false) && !settings.maintenanceMode && isGlobalWebsiteLive;
  const isFilmProductionLive = (settings.serviceControls?.filmProduction?.status !== false) && isGlobalWebsiteLive && isSubwebsiteEnabled;
  const isEventsLive = (settings.serviceControls?.eventBooking?.status !== false) && (settings.serviceControls?.eventManagement?.status !== false) && isGlobalWebsiteLive && isSubwebsiteEnabled;
  const isCineCoinsLive = (settings.serviceControls?.cinecoins?.status !== false) && (settings.serviceControls?.cineCoinsLoyalty?.status !== false) && isGlobalWebsiteLive;

  // Determine user role
  const isSuperAdmin = userEmail?.toLowerCase() === superAdminEmail.toLowerCase();
  const matchTheatreAdmin = theatreAdmins.find(a => a.email.toLowerCase() === userEmail?.toLowerCase());
  const matchEventOrganizer = eventOrganizers.find(o => o.email.toLowerCase() === userEmail?.toLowerCase());

  // Derive state from selected city
  const matchedCity =
    POPULAR_CITIES.find((c) => c.name.toLowerCase() === selectedCity?.toLowerCase()) ||
    ALL_INDIAN_CITIES.find((c) => c.name.toLowerCase() === selectedCity?.toLowerCase());
  const stateSubtitle = selectedCity === "All Cities" ? "All Locations" : matchedCity?.state || "India";

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const userInitials = userEmail ? userEmail.substring(0, 2).toUpperCase() : "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0A0A0B]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 w-full shadow-xs dark:shadow-2xl">
      {/* Top Navbar Row */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 md:px-8 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand Logo & District Location Selector */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
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
              className="group flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-slate-100 hover:bg-yellow-100/70 dark:bg-gold/15 dark:hover:bg-gold/25 border border-slate-200 dark:border-gold/40 hover:border-yellow-400 dark:hover:border-gold text-slate-800 dark:text-amber-200 hover:text-black dark:hover:text-gold text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              title="Back to previous page"
              aria-label="Back to previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-800 dark:text-gold group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <CineVenueLogo 
            size="md" 
            onClick={() => handleScroll("home")} 
          />

          {/* District Location Selector Pill */}
          <button
            onClick={onOpenLocation}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl bg-slate-100 hover:bg-[#D4AF37]/15 dark:bg-white/[0.05] dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/10 hover:border-[#D4AF37] dark:hover:border-gold/40 transition-all group cursor-pointer text-left shadow-xs dark:shadow-sm"
            title="Choose your City / Location"
          >
            <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#D4AF37] shrink-0 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white max-w-[70px] sm:max-w-[130px] truncate leading-tight">
                  {selectedCity === "All Cities" ? "Select City" : selectedCity}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 dark:text-white/50 group-hover:text-[#D4AF37] transition-colors" />
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-white/50 leading-none truncate max-w-[70px] sm:max-w-[110px]">
                {stateSubtitle}
              </span>
            </div>
          </button>
        </div>

        {/* Center: District Navigation Capsule Bar */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100/90 dark:bg-[#151518] p-1 rounded-full border border-slate-200 dark:border-white/10 shadow-inner">
          <button
            onClick={() => {
              window.location.href = "/#home";
            }}
            className="px-4 py-2 rounded-full text-sm font-extrabold transition-all cursor-pointer border-0 bg-transparent text-slate-950 dark:text-white/70 hover:text-black dark:hover:text-[#D4AF37] hover:bg-[#D4AF37]/15 dark:hover:bg-white/5 whitespace-nowrap"
          >
            For you
          </button>

          <button
            onClick={() => {
              window.location.href = "/#movies";
            }}
            className="px-4.5 py-2 rounded-full text-sm font-extrabold transition-all cursor-pointer border-0 bg-[#D4AF37] hover:bg-[#E5C158] text-black shadow-md shadow-[#D4AF37]/30 whitespace-nowrap flex items-center gap-1.5"
          >
            <span>Movies</span>
            {isMovieBookingLive && (
              <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-black bg-white/70 px-1.5 py-0.2 rounded-full border border-black/20 font-mono">
                <span className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse" />
                LIVE
              </span>
            )}
          </button>


          <button
            onClick={() => {
              window.location.href = "/events";
            }}
            className={`px-4 py-2 rounded-full text-sm font-extrabold transition-all cursor-pointer border-0 bg-transparent flex items-center gap-1.5 whitespace-nowrap ${
              isEventsLive ? "text-slate-950 dark:text-white/70 hover:text-black dark:hover:text-[#D4AF37] hover:bg-[#D4AF37]/15 dark:hover:bg-white/5" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            <span>Event Booking</span>
            {isEventsLive ? (
              <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 px-1.5 py-0.2 rounded-full border border-emerald-200 dark:border-emerald-400/20 font-mono">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            ) : (
              <span className="text-[8px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold">OFF</span>
            )}
          </button>
        </div>

        {/* Right: Search, Member Actions & Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Top Search Input */}
          {setSearchQuery && (
            <div className="hidden xl:flex items-center relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-white/40 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search events, movies, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white dark:bg-white/[0.06] dark:hover:bg-white/[0.08] dark:focus:bg-black/80 border border-slate-200 dark:border-white/10 focus:border-yellow-400 dark:focus:border-gold/50 rounded-full pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none transition-all shadow-xs dark:shadow-none"
              />
            </div>
          )}

          {/* Theme Toggle */}
          <div className="hidden 2xl:flex items-center">
            <ThemeToggle variant="segmented" />
          </div>
          <div className="flex 2xl:hidden items-center">
            <ThemeToggle variant="dropdown" />
          </div>

          {/* Settings Shortcut */}
          <button
            type="button"
            onClick={() => window.location.href = "/settings"}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 dark:border-white/10 bg-gray-100 hover:bg-gray-200/80 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-gray-800 hover:text-black dark:text-white/90 dark:hover:text-gold dark:hover:border-gold/40 transition-all cursor-pointer shadow-xs dark:shadow-none text-xs font-extrabold uppercase tracking-wider"
            title="Application Settings"
            aria-label="Settings"
            id="navbar-btn-settings"
          >
            <Settings className="w-3.5 h-3.5 text-gold" />
            <span className="hidden md:inline">Settings</span>
          </button>

          {/* User Member Actions */}
          {userEmail ? (
            <div className="flex items-center gap-2">
              {!isSuperAdmin && matchTheatreAdmin && (
                <button
                  onClick={() => onOpenTheatreDashboard(matchTheatreAdmin.theatreId)}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider hover:bg-purple-500 hover:text-white transition-all cursor-pointer shadow-md"
                  title="Theatre Management Workspace"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Theatre Hub</span>
                </button>
              )}

              {!isSuperAdmin && !matchTheatreAdmin && matchEventOrganizer && (
                <button
                  onClick={() => onOpenEventDashboard(matchEventOrganizer.id)}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500 hover:text-white transition-all cursor-pointer shadow-md"
                  title="Event Organizer Workspace"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Events Hub</span>
                </button>
              )}

              <button
                onClick={onOpenOrders}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-yellow-400/80 bg-[#FEF08A] hover:bg-[#FDE047] text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                title="My Bookings & Event Passes"
              >
                <Ticket className="w-3 h-3 text-slate-950" />
                <span>My Passes</span>
              </button>

              {/* Profile Avatar Pill */}
              <div 
                className="flex items-center gap-2 bg-slate-100 hover:bg-yellow-100/60 dark:bg-white/[0.05] dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-full cursor-pointer transition-all shadow-xs dark:shadow-none"
                onClick={() => {
                  if (onOpenAccount) onOpenAccount();
                  else window.location.href = "/account";
                }}
                title={userEmail?.toLowerCase().includes("superadmin") ? "Account Profile" : `Account: ${userEmail}`}
              >
                <div className="w-6 h-6 rounded-full bg-[#FDE047] text-black border border-[#FACC15] flex items-center justify-center text-[11px] font-extrabold shadow-xs">
                  {userEmail?.toLowerCase().includes("superadmin") ? <User className="w-3 h-3 text-black" /> : (userInitials || <User className="w-3 h-3 text-black" />)}
                </div>
                <span className="hidden md:inline text-[11px] font-bold text-slate-900 dark:text-white/90 max-w-[90px] truncate">
                  {userEmail?.toLowerCase().includes("superadmin") ? "Admin" : userEmail.split("@")[0]}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                  className="text-slate-400 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 cursor-pointer transition-colors p-0.5 ml-0.5 bg-transparent border-none"
                  title="Secure Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onOpenAuth?.("signin")}
                className="inline-flex rounded-full border border-slate-300 dark:border-white/15 bg-transparent px-3 sm:px-3.5 py-1.5 text-xs font-bold text-slate-800 dark:text-white/80 hover:border-yellow-400 hover:text-black dark:hover:border-gold/40 dark:hover:text-gold transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth?.("signup")}
                className="hidden sm:inline-flex rounded-full bg-[#FDE047] hover:bg-[#FEF08A] px-3 sm:px-3.5 py-1.5 text-xs text-black font-black border border-yellow-400/80 shadow-md shadow-yellow-400/25 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-700 hover:text-black dark:text-white/80 dark:hover:text-gold rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-white/10 flex flex-col gap-2.5 pb-2 animate-fade-in bg-white dark:bg-[#0A0A0B] px-2 rounded-b-2xl shadow-xl dark:shadow-none">
          <button 
            onClick={() => { setMobileMenuOpen(false); window.location.href = "/#services"; }} 
            className={`text-left px-3 py-2 text-xs uppercase font-semibold hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-none bg-transparent flex items-center justify-between gap-2 ${
              isMovieBookingLive ? "text-gray-800 hover:text-gold dark:text-white/80 dark:hover:text-gold" : "text-rose-500 hover:text-rose-400 dark:text-rose-400 dark:hover:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-gold" />
              <span>Movie Ticket Booking</span>
            </div>
            {!isMovieBookingLive && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40 font-bold">OFFLINE</span>
            )}
          </button>
          <button 
            onClick={() => { setMobileMenuOpen(false); window.location.href = "/productions"; }} 
            className={`text-left px-3 py-2 text-xs uppercase font-bold hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-none bg-transparent flex items-center justify-between gap-2 ${
              isFilmProductionLive ? "text-gray-800 hover:text-black dark:text-amber-400 dark:hover:text-gold" : "text-rose-500 hover:text-rose-400 dark:text-rose-400 dark:hover:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4" />
              <span>Film Productions & 24 Crafts</span>
            </div>
            {!isFilmProductionLive && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40 font-bold">OFFLINE</span>
            )}
          </button>
          <button 
            onClick={() => { setMobileMenuOpen(false); window.location.href = "/events"; }} 
            className={`text-left px-3 py-2 text-xs uppercase font-bold hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-none bg-transparent flex items-center justify-between gap-2 ${
              isEventsLive ? "text-gray-800 hover:text-black dark:text-amber-400 dark:hover:text-gold" : "text-rose-500 hover:text-rose-400 dark:text-rose-400 dark:hover:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Events & Organization</span>
            </div>
            {!isEventsLive && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40 font-bold">OFFLINE</span>
            )}
          </button>
          <button 
            onClick={() => { 
              setMobileMenuOpen(false); 
              if (onOpenCineCoins) onOpenCineCoins(); 
              else window.location.href = "/cinecoins"; 
            }} 
            className="text-left px-3 py-2 text-xs uppercase font-bold hover:bg-yellow-50 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-none bg-transparent flex items-center justify-between gap-2 text-slate-900 hover:text-black dark:text-amber-400 dark:hover:text-gold"
          >
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>CineCoins Loyalty & Rewards</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-amber-950 dark:text-amber-300 bg-[#FEF08A] dark:bg-amber-400/15 px-1.5 py-0.5 rounded-full border border-[#FACC15] dark:border-amber-400/30 font-mono shadow-xs">
              <span className="w-1 h-1 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse" />
              SOON
            </span>
          </button>
          <button 
            onClick={() => { 
              setMobileMenuOpen(false); 
              if (onOpenAccount) onOpenAccount(); 
              else window.location.href = "/account"; 
            }} 
            className="text-left px-3 py-2 text-xs uppercase font-semibold text-gray-700 hover:text-gold dark:text-white/80 dark:hover:text-gold hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-none bg-transparent flex items-center gap-2"
          >
            <User className="w-4 h-4 text-gold" />
            <span>My Account & Orders</span>
          </button>
          <button 
            onClick={() => { 
              setMobileMenuOpen(false); 
              window.location.href = "/settings"; 
            }} 
            className="text-left px-3 py-2 text-xs uppercase font-semibold text-gray-700 hover:text-gold dark:text-white/80 dark:hover:text-gold hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-none bg-transparent flex items-center gap-2"
          >
            <Settings className="w-4 h-4 text-gold" />
            <span>Settings & Preferences</span>
          </button>
          <button 
            onClick={() => { setMobileMenuOpen(false); handleScroll("contact"); }} 
            className="text-left px-3 py-2 text-xs uppercase font-semibold text-gray-700 hover:text-gold dark:text-white/80 dark:hover:text-gold hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
          >
            Contact Concierge
          </button>

          {/* Mobile Theme Selection Row */}
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-gray-200 dark:border-white/10 mt-1">
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-600 dark:text-text-secondary">App Theme</span>
            <ThemeToggle variant="segmented" />
          </div>

          {!userEmail && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-white/10 sm:hidden">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth?.("signin"); }}
                className="flex-1 rounded-full border border-gray-300 dark:border-white/15 bg-transparent py-2 text-center text-[10px] uppercase tracking-[0.2em] text-gray-700 dark:text-white/80 hover:border-gold/60 hover:text-gold dark:hover:border-gold/40 dark:hover:text-gold transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth?.("signup"); }}
                className="flex-1 rounded-full bg-gold py-2 text-center text-[10px] uppercase tracking-[0.2em] text-black font-bold hover:bg-gold-light transition-all"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
