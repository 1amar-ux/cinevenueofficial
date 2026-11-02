import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Search, Ticket, User, Menu, X, Settings } from "lucide-react";
import ThemeToggle from "../ThemeToggle";

export default function EventsNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Explore Events", path: "/events" },
    { name: "Movie Events", path: "/events?category=movies" },
    { name: "My Passes", path: "/events/my-passes" },
  ];

  return (
    <nav className="fixed w-full z-50 bg-white/95 dark:bg-[#09090A]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 transition-all">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 gap-2">
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <Link to="/events" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gold rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold font-display tracking-wide text-slate-950 dark:text-white group-hover:text-gold transition-colors">
                  CineVenue
                </span>
                <span className="text-xs sm:text-sm font-semibold text-gold block -mt-1 tracking-widest">
                  EVENTS
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path || (location.pathname === '/events' && link.path === '/events' && !location.search)
                      ? "text-gold font-bold"
                      : "text-text-secondary hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Quick My Passes Pill */}
            <Link
              to="/events/my-passes"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-yellow-400/80 bg-[#FEF08A] hover:bg-[#FDE047] text-slate-950 text-xs font-black uppercase tracking-wider shadow-xs transition-all"
              title="My Event Passes"
            >
              <Ticket className="w-3.5 h-3.5 text-slate-950" />
              <span>My Passes</span>
            </Link>

            {/* Settings shortcut */}
            <Link
              to="/settings"
              className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 hover:bg-gray-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-white/80 hover:text-gold transition-all"
              title="Application Settings"
              aria-label="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>

            <ThemeToggle variant="dropdown" />
            
            <Link
              to="/"
              className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-slate-950 dark:hover:text-white border border-gray-300 dark:border-white/10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all whitespace-nowrap"
            >
              Back to Movies
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Passes on Mobile */}
            <Link
              to="/events/my-passes"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-yellow-400/80 bg-[#FEF08A] text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-xs"
              title="My Event Passes"
            >
              <Ticket className="w-3 h-3 text-slate-950" />
              <span>Passes</span>
            </Link>

            <Link
              to="/settings"
              className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white/80"
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>

            <ThemeToggle variant="dropdown" />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-700 hover:text-black dark:text-white/80 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 dark:bg-[#0a0a0a]/98 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 absolute w-full left-0 top-16 shadow-2xl animate-fade-in">
          <div className="px-4 pt-3 pb-6 space-y-2 flex flex-col">
            <Link
              to="/events/my-passes"
              className="flex items-center justify-between p-3 rounded-xl bg-yellow-100/80 dark:bg-gold/15 border border-yellow-300 dark:border-gold/30 text-slate-950 dark:text-amber-200 font-bold text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2.5">
                <Ticket className="w-4 h-4 text-black dark:text-gold" />
                <span>My Booked Passes</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/10 dark:bg-gold/20">View</span>
            </Link>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block px-3 py-2.5 text-sm font-medium text-slate-800 dark:text-text-secondary hover:text-gold hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <Link
              to="/settings"
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-slate-800 dark:text-text-secondary hover:text-gold hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="w-4 h-4 text-gold" />
              <span>Settings & Preferences</span>
            </Link>

            <Link
              to="/"
              className="block px-3 py-2.5 mt-2 text-xs font-bold uppercase tracking-wider text-center text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
              onClick={() => setMobileMenuOpen(false)}
            >
              Back to Movies
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
