import React, { useState } from "react";
import { Film, MapPin, User, LogOut, ChevronDown, Sliders, Calendar, Sparkles, Ticket, Menu, X, Coins, PlusCircle, Building2 } from "lucide-react";
import CineVenueLogo from "./CineVenueLogo";

interface NavbarProps {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  onOpenLocation: () => void;
  cities: string[];
  userEmail: string | null;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
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

  // Determine user role
  const isSuperAdmin = userEmail?.toLowerCase() === superAdminEmail.toLowerCase();
  const matchTheatreAdmin = theatreAdmins.find(a => a.email.toLowerCase() === userEmail?.toLowerCase());
  const matchEventOrganizer = eventOrganizers.find(o => o.email.toLowerCase() === userEmail?.toLowerCase());

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const userInitials = userEmail ? userEmail.substring(0, 2).toUpperCase() : "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0A0A0B]/90 backdrop-blur-md border-b border-white/10 w-full">
      {/* Mobile Top Row & Desktop Row */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-3 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        
        {/* Top bar container for mobile */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          {/* Brand Logo */}
          <CineVenueLogo 
            size="md" 
            onClick={() => handleScroll("home")} 
          />

          {/* Mobile Location Selector (Right aligned on mobile) */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenLocation}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer border border-white/10 bg-black/50 text-white shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
              <span className="text-xs font-medium max-w-[100px] truncate">{selectedCity === "All Cities" ? "Select Location" : selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-transform shrink-0" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-white/80 hover:text-gold rounded-lg hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Center: Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-[11px] uppercase tracking-[0.2em] font-medium text-text-secondary">
          <button onClick={() => window.location.href = "/#services"} className="hover:text-gold transition-colors cursor-pointer bg-transparent border-none">
            Booking
          </button>
          <button 
            onClick={() => window.location.href = "/productions"} 
            className="text-amber-400 font-bold hover:text-gold transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1.5"
          >
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span>Film Productions</span>
          </button>
          <button 
            onClick={() => window.location.href = "/events"} 
            className="text-amber-400 font-bold hover:text-gold transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1"
          >
            <span>Events</span>
          </button>
          <button 
            onClick={() => {
              if (onOpenAccount) onOpenAccount();
              else window.location.href = "/account";
            }} 
            className="hover:text-gold transition-colors cursor-pointer bg-transparent border-none"
          >
            My Account
          </button>
          <button onClick={() => handleScroll("contact")} className="hover:text-gold transition-colors cursor-pointer bg-transparent border-none">
            Contact Us
          </button>
          <button onClick={onOpenOrders} className="hover:text-gold transition-colors cursor-pointer bg-transparent border-none text-cyan-400">
            My Pass
          </button>
        </div>

        {/* Right Side: Location Filter and Member Actions */}
        <div className="flex items-center gap-4">
          
          {/* Location Dropdown selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white/[0.03] border border-white/10 text-xs font-semibold uppercase text-text-primary hover:border-gold/40 hover:text-gold transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-gold" />
              <span>{selectedCity === "All Cities" ? "All Cities" : selectedCity}</span>
              <ChevronDown className={`w-3 h-3 text-text-muted transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[#121213] border border-white/10 py-1.5 shadow-2xl z-50 animate-fade-in">
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors hover:bg-white/[0.03] cursor-pointer ${
                        selectedCity === city ? "text-gold bg-gold-glow" : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {city === "All Cities" ? "All Cities (Default)" : city}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* User Member Actions */}
          {userEmail ? (
            <div className="flex items-center gap-3.5">


              {!isSuperAdmin && matchTheatreAdmin && (
                <button
                  onClick={() => onOpenTheatreDashboard(matchTheatreAdmin.theatreId)}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded border border-purple-500/30 bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-wider hover:bg-purple-500 hover:text-white hover:border-transparent transition-all cursor-pointer shadow-lg"
                  title="Theatre Management Workspace"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Manage Theatre</span>
                </button>
              )}

              {!isSuperAdmin && !matchTheatreAdmin && matchEventOrganizer && (
                <button
                  onClick={() => onOpenEventDashboard(matchEventOrganizer.id)}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500 hover:text-white hover:border-transparent transition-all cursor-pointer shadow-lg"
                  title="Event Organizer Workspace"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Manage Events</span>
                </button>
              )}

              <button
                onClick={onOpenOrders}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded border border-gold/30 bg-gold-glow text-gold text-[10px] font-bold uppercase tracking-wider hover:bg-gold hover:text-black hover:border-transparent transition-all cursor-pointer shadow-lg shadow-gold/5"
                title="My Bookings & Event Passes"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>My Bookings</span>
              </button>

              <div 
                className="flex items-center gap-2 bg-white/[0.02] border border-white/10 px-3.5 py-1.5 rounded-full"
                title={`Logged in as: ${userEmail}`}
              >
                <div className="w-5 h-5 rounded-full bg-gold/20 border border-gold/40 text-gold flex items-center justify-center text-[10px] font-bold">
                  {userInitials || <User className="w-3 h-3 text-gold" />}
                </div>
                <span className="hidden md:inline text-[10px] font-semibold text-text-primary max-w-[120px] truncate">
                  {userEmail.split("@")[0]}
                </span>
                <button
                  onClick={onLogout}
                  className="text-text-muted hover:text-red-400 cursor-pointer transition-colors p-0.5 ml-1.5 bg-transparent border-none"
                  title="Secure Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 bg-gold hover:bg-gold-light text-black text-[10px] font-bold uppercase tracking-[0.15em] rounded shadow-lg shadow-gold/15 transition-all cursor-pointer border-none"
              >
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>Sign In / Sign Up</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-2.5 pb-2 animate-fade-in">
          <button 
            onClick={() => { setMobileMenuOpen(false); window.location.href = "/#services"; }} 
            className="text-left px-3 py-2 text-xs uppercase font-semibold text-white/80 hover:text-gold hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-none bg-transparent flex items-center gap-2"
          >
            <Ticket className="w-4 h-4 text-gold" />
            <span>Movie Ticket Booking</span>
          </button>
          <button 
            onClick={() => { setMobileMenuOpen(false); window.location.href = "/productions"; }} 
            className="text-left px-3 py-2 text-xs uppercase font-bold text-amber-400 hover:text-gold hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-none bg-transparent flex items-center gap-2"
          >
            <Film className="w-4 h-4 text-amber-400" />
            <span>Film Productions & 24 Crafts</span>
          </button>
          <button 
            onClick={() => { setMobileMenuOpen(false); window.location.href = "/events"; }} 
            className="text-left px-3 py-2 text-xs uppercase font-bold text-amber-400 hover:text-gold hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-none bg-transparent flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Events & Organization</span>
          </button>
          <button 
            onClick={() => { 
              setMobileMenuOpen(false); 
              if (onOpenAccount) onOpenAccount(); 
              else window.location.href = "/account"; 
            }} 
            className="text-left px-3 py-2 text-xs uppercase font-semibold text-white/80 hover:text-gold hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-none bg-transparent flex items-center gap-2"
          >
            <User className="w-4 h-4 text-gold" />
            <span>My Account & Orders</span>
          </button>
          <button 
            onClick={() => { setMobileMenuOpen(false); handleScroll("contact"); }} 
            className="text-left px-3 py-2 text-xs uppercase font-semibold text-white/80 hover:text-gold hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
          >
            Contact Concierge
          </button>
        </div>
      )}
    </nav>
  );
}
