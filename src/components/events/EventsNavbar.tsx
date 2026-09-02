import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Search, Ticket, User, Menu, X } from "lucide-react";

export default function EventsNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Explore Events", path: "/events" },
    { name: "Movie Events", path: "/events?category=movies" },
    { name: "My Passes", path: "/events/my-passes" },
  ];

  return (
    <nav className="fixed w-full z-50 bg-[#09090A]/90 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-8">
            <Link to="/events" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                <Calendar className="w-6 h-6 text-black" />
              </div>
              <div>
                <span className="text-xl font-bold font-display tracking-wide text-white group-hover:text-gold transition-colors">
                  CineVenue
                </span>
                <span className="text-sm font-semibold text-gold block -mt-1 tracking-widest">
                  EVENTS
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path || (location.pathname === '/events' && link.path === '/events') && !location.search
                      ? "text-gold"
                      : "text-text-secondary hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 text-text-secondary hover:text-white transition-colors rounded-full hover:bg-white/5">
              <Search className="w-5 h-5" />
            </button>
            <Link
              to="/"
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-white border border-white/10 rounded-full hover:bg-white/5 transition-all"
            >
              Back to Movies
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text-secondary hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-b border-white/10 absolute w-full left-0 top-20 shadow-2xl">
          <div className="px-4 pt-2 pb-6 space-y-1 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block px-3 py-3 text-base font-medium text-text-secondary hover:text-white hover:bg-white/5 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/"
              className="block px-3 py-3 mt-4 text-sm font-medium text-center text-white bg-white/5 border border-white/10 rounded-lg"
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
