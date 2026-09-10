import React, { useState, useEffect, useMemo } from "react";
import { 
  ProfessionalProfile, 
  DiscoverProfessionalsFilterState,
  FilmProject,
  IndianCastingCall
} from "../../types/filmProductionMarketplace";
import { 
  discoverProfessionals, 
  getProjects, 
  getIndianCastingCalls 
} from "../../services/filmProductionService";
import { 
  Search, Filter, MapPin, Globe, CheckCircle2, 
  Calendar, ShieldCheck, ArrowRight, Send, Briefcase, 
  ChevronDown, Video, Music, Camera, Sparkles, UserCheck, 
  Eye, RefreshCw, X, Award, Film, SlidersHorizontal, ArrowUpRight
} from "lucide-react";
import InviteProfessionalModal from "./InviteProfessionalModal";
import ConsiderForCastingModal from "./ConsiderForCastingModal";

interface DiscoverProfessionalsViewProps {
  userEmail?: string | null;
  onSelectProfessional: (username: string) => void;
  onNavigateTab?: (tab: string) => void;
}

const ROLES_LIST = [
  "Actor",
  "Director",
  "Cinematographer",
  "Music Director",
  "Screenwriter",
  "Editor",
  "Art Director",
  "Sound Designer",
  "Producer",
  "Stunt Coordinator",
  "VFX Supervisor",
  "Costume Designer",
  "Choreographer",
  "Dialogue Writer"
];

const LANGUAGES_LIST = [
  "Telugu",
  "Tamil",
  "Hindi",
  "Malayalam",
  "Kannada",
  "English",
  "Bengali",
  "Marathi"
];

const LOCATIONS_LIST = [
  "Hyderabad",
  "Chennai",
  "Bengaluru",
  "Mumbai",
  "Kochi",
  "Visakhapatnam",
  "Delhi",
  "Kolkata"
];

export default function DiscoverProfessionalsView({
  userEmail,
  onSelectProfessional,
  onNavigateTab
}: DiscoverProfessionalsViewProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Data state
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state for card quick-actions
  const [selectedProfileForInvite, setSelectedProfileForInvite] = useState<ProfessionalProfile | null>(null);
  const [selectedProfileForCasting, setSelectedProfileForCasting] = useState<ProfessionalProfile | null>(null);

  // Projects & Casting calls for modals
  const [projects] = useState<FilmProject[]>(() => getProjects());
  const [castingCalls] = useState<IndianCastingCall[]>(() => getIndianCastingCalls());

  // Fetch from API/localStorage
  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const filters: DiscoverProfessionalsFilterState = {
        searchQuery: searchQuery.trim(),
        role: selectedRole !== "all" ? selectedRole : undefined,
        language: selectedLanguage !== "all" ? selectedLanguage : undefined,
        location: selectedLocation !== "all" ? selectedLocation : undefined,
        availability: selectedAvailability !== "all" ? selectedAvailability : undefined,
        verifiedOnly: verifiedOnly ? true : undefined
      };

      if (selectedExperience !== "all") {
        if (selectedExperience === "0-2") {
          filters.experienceYears = 2;
        } else if (selectedExperience === "3-5") {
          filters.experienceYears = 5;
        } else if (selectedExperience === "6-10") {
          filters.experienceYears = 10;
        } else if (selectedExperience === "10+") {
          filters.experienceYears = 15;
        }
      }

      const res = await discoverProfessionals(filters, currentPage, itemsPerPage);
      setProfessionals(res.professionals);
      setTotalCount(res.total);
    } catch (err) {
      console.error("Error discovering professionals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, [searchQuery, selectedRole, selectedLanguage, selectedLocation, selectedExperience, selectedAvailability, verifiedOnly, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedRole("all");
    setSelectedLanguage("all");
    setSelectedLocation("all");
    setSelectedExperience("all");
    setSelectedAvailability("all");
    setVerifiedOnly(false);
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    searchQuery !== "" || 
    selectedRole !== "all" || 
    selectedLanguage !== "all" || 
    selectedLocation !== "all" || 
    selectedExperience !== "all" || 
    selectedAvailability !== "all" || 
    verifiedOnly;

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-16 animate-fade-in">
      
      {/* 1. DISCOVERY HEADER */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 bg-gradient-to-br from-[#121422] via-[#0E0F18] to-[#0A0B12] border border-white/10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Film Professionals</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Discover Verified Creators, Crew & Cast
          </h1>

          <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-2xl">
            Explore authentic talent across all 24 crafts in Indian Cinema. Search by craft, language, past film credits, and verified showreels without intermediaries.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. SEARCH & FILTER CONTROLS BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0E0F18] border border-white/10 space-y-4 shadow-lg">
        
        {/* Main Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search professionals by name, craft, skills, location, or past credits..."
              className="w-full pl-11 pr-4 py-3 bg-[#151724] border border-white/10 rounded-xl text-white text-xs sm:text-sm placeholder-white/40 focus:outline-none focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Drawer Toggle (Mobile & Desktop quick toggle) */}
          <button
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className={`px-4 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              hasActiveFilters
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                : "bg-white/5 border-white/10 text-white/80 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-bold transition-all cursor-pointer"
              title="Reset all filters"
            >
              Reset
            </button>
          )}
        </div>

        {/* Quick Role Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => {
              setSelectedRole("all");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedRole === "all"
                ? "bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black"
                : "bg-white/5 text-white/70 hover:text-white border border-white/5"
            }`}
          >
            All Crafts
          </button>

          {ROLES_LIST.map((role) => (
            <button
              key={role}
              onClick={() => {
                setSelectedRole(selectedRole === role ? "all" : role);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedRole === role
                  ? "bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black"
                  : "bg-white/5 text-white/70 hover:text-white border border-white/5"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Expanded Filters Drawer */}
        {isFilterDrawerOpen && (
          <div className="pt-4 mt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs animate-fade-in">
            {/* Language */}
            <div>
              <label className="block text-white/50 font-bold mb-1">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#151724] border border-white/10 rounded-xl p-2.5 text-white font-semibold cursor-pointer"
              >
                <option value="all">All Languages</option>
                {LANGUAGES_LIST.map(l => (
                  <option key={l} value={l} className="bg-[#111218]">{l}</option>
                ))}
              </select>
            </div>

            {/* City / State */}
            <div>
              <label className="block text-white/50 font-bold mb-1">Base Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#151724] border border-white/10 rounded-xl p-2.5 text-white font-semibold cursor-pointer"
              >
                <option value="all">All Locations</option>
                {LOCATIONS_LIST.map(loc => (
                  <option key={loc} value={loc} className="bg-[#111218]">{loc}</option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-white/50 font-bold mb-1">Industry Experience</label>
              <select
                value={selectedExperience}
                onChange={(e) => {
                  setSelectedExperience(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#151724] border border-white/10 rounded-xl p-2.5 text-white font-semibold cursor-pointer"
              >
                <option value="all">Any Experience</option>
                <option value="0-2" className="bg-[#111218]">0 - 2 Years</option>
                <option value="3-5" className="bg-[#111218]">3 - 5 Years</option>
                <option value="6-10" className="bg-[#111218]">6 - 10 Years</option>
                <option value="10+" className="bg-[#111218]">10+ Years (Veterans)</option>
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-white/50 font-bold mb-1">Shoot Availability</label>
              <select
                value={selectedAvailability}
                onChange={(e) => {
                  setSelectedAvailability(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#151724] border border-white/10 rounded-xl p-2.5 text-white font-semibold cursor-pointer"
              >
                <option value="all">Any Availability</option>
                <option value="Available" className="bg-[#111218]">🟢 Available Now</option>
                <option value="Busy on Shoot" className="bg-[#111218]">🟡 Busy on Shoot</option>
              </select>
            </div>

            {/* Verification status toggle */}
            <div className="flex flex-col justify-end">
              <label className="block text-white/50 font-bold mb-1">Admin Verification</label>
              <button
                type="button"
                onClick={() => {
                  setVerifiedOnly(!verifiedOnly);
                  setCurrentPage(1);
                }}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  verifiedOnly
                    ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
                    : "bg-[#151724] border-white/10 text-white/70 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>{verifiedOnly ? "Verified Only ✓" : "All Profiles"}</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 3. RESULTS STATUS & METRIC */}
      <div className="flex items-center justify-between px-1 text-xs text-white/60">
        <div>
          Showing <span className="text-white font-bold">{professionals.length}</span> of{" "}
          <span className="text-amber-400 font-bold">{totalCount}</span> registered film professionals
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="text-amber-400 hover:underline font-bold"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* 4. PROFESSIONAL PROFILE CARDS GRID */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-white/60 font-bold">Searching verified film professionals...</p>
        </div>
      ) : professionals.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#0E0F18] border border-white/10 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6 text-white/40" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white">No Professionals Found</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              No film professionals match your current filter criteria. Try broadening your search or resetting filters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs cursor-pointer shadow-md shadow-amber-500/20"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((prof) => {
            const handle = prof.handle || `@${prof.fullName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
            const roles = prof.roles && prof.roles.length > 0 
              ? prof.roles 
              : [prof.primaryCraftName, ...(prof.secondaryCraftNames || [])].filter(Boolean);

            const topPortfolio = prof.portfolio?.[0];

            return (
              <div
                key={prof.id}
                className="group rounded-3xl bg-[#0E0F18] border border-white/10 hover:border-amber-400/40 transition-all duration-300 overflow-hidden shadow-xl hover:shadow-2xl flex flex-col justify-between"
              >
                <div>
                  {/* Top Banner Accent */}
                  <div className="relative h-28 bg-[#151724] overflow-hidden">
                    <img
                      src={prof.coverImageUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80"}
                      alt="Cover"
                      className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E0F18] via-transparent to-transparent" />
                    
                    {/* Availability Pill */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${
                        prof.availability.status === "Available"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}>
                        {prof.availability.status}
                      </span>
                    </div>
                  </div>

                  {/* Profile Header Block */}
                  <div className="px-6 pb-4 relative -mt-10 space-y-3">
                    
                    <div className="flex items-end justify-between gap-3">
                      {/* Avatar */}
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#181926] border-2 border-[#0E0F18] shadow-lg shrink-0">
                        <img
                          src={prof.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                          alt={prof.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Admin Verification Badge */}
                      {prof.verificationLevel !== "None" && (
                        <div className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-amber-400" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Name & Handle */}
                    <div>
                      <h3 
                        onClick={() => onSelectProfessional(handle)}
                        className="text-base font-black text-white hover:text-amber-400 cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <span>{prof.fullName}</span>
                      </h3>
                      <div className="text-xs font-mono font-bold text-amber-400/80">{handle}</div>
                    </div>

                    {/* Multi-Role Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {roles.slice(0, 3).map((r, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/25 text-purple-300 text-[10px] font-bold"
                        >
                          {r}
                        </span>
                      ))}
                      {roles.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/50 text-[10px] font-bold">
                          +{roles.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Bio Excerpt */}
                    <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                      {prof.bio || prof.professionalHeadline || "Professional creator on CineVenue Film Production."}
                    </p>

                    {/* Meta: Location, Languages, Experience */}
                    <div className="pt-2 border-t border-white/5 space-y-1.5 text-[11px] text-white/50">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{prof.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{prof.languages.join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{prof.experienceYears}+ Years Experience</span>
                      </div>
                    </div>

                    {/* Selected Top Portfolio Item Thumbnail */}
                    {topPortfolio && (
                      <div className="pt-2">
                        <div 
                          onClick={() => onSelectProfessional(handle)}
                          className="relative h-24 rounded-xl overflow-hidden bg-black border border-white/10 group-hover:border-amber-400/30 cursor-pointer"
                        >
                          <img
                            src={topPortfolio.mediaUrl}
                            alt={topPortfolio.title}
                            className="w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white font-bold truncate">
                            <span className="truncate">🎨 {topPortfolio.title}</span>
                            <span className="text-amber-400 font-mono text-[9px] shrink-0">{topPortfolio.type}</span>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-[#121422] border-t border-white/5 flex items-center gap-2">
                  <button
                    onClick={() => onSelectProfessional(handle)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5 text-black" />
                  </button>

                  <button
                    onClick={() => setSelectedProfileForInvite(prof)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
                    title="Invite to Film Project"
                  >
                    <Film className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    onClick={() => setSelectedProfileForCasting(prof)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-purple-500/20 border border-white/10 text-white/70 hover:text-purple-300 cursor-pointer transition-colors"
                    title="Consider for Casting Call"
                  >
                    <Award className="w-4 h-4 text-purple-400" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 5. PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-xs text-white/60 font-bold px-3">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Quick Action Modals */}
      <InviteProfessionalModal
        isOpen={!!selectedProfileForInvite}
        onClose={() => setSelectedProfileForInvite(null)}
        professional={selectedProfileForInvite}
        projects={projects}
        userEmail={userEmail}
        onInviteSent={() => {
          // Handled in modal
        }}
      />

      <ConsiderForCastingModal
        isOpen={!!selectedProfileForCasting}
        onClose={() => setSelectedProfileForCasting(null)}
        professional={selectedProfileForCasting}
        castingCalls={castingCalls}
        userEmail={userEmail}
      />

    </div>
  );
}
