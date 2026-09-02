import React, { useState } from "react";
import { 
  ProfessionalProfile, 
  FilmCraft 
} from "../../types/filmProductionMarketplace";
import { 
  Search, Filter, Star, MapPin, Globe, CheckCircle2, 
  Calendar, ShieldCheck, ArrowUpRight, Send, Briefcase, 
  ChevronDown, Video, Music, Camera, Sparkles, UserCheck, Eye
} from "lucide-react";

interface BrowseProfessionalsViewProps {
  professionals: ProfessionalProfile[];
  crafts: FilmCraft[];
  onSelectProfessional: (profile: ProfessionalProfile) => void;
  onInviteToProject: (profile: ProfessionalProfile) => void;
  selectedCraftId?: string;
  onCraftChange?: (craftId: string) => void;
}

export default function BrowseProfessionalsView({
  professionals,
  crafts,
  onSelectProfessional,
  onInviteToProject,
  selectedCraftId = "all",
  onCraftChange
}: BrowseProfessionalsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCraft, setSelectedCraft] = useState(selectedCraftId);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [selectedVerification, setSelectedVerification] = useState("all");
  const [sortBy, setSortBy] = useState<"rating" | "experience" | "recent">("rating");

  // Keep internal state in sync if parent passed selectedCraftId
  React.useEffect(() => {
    if (selectedCraftId) {
      setSelectedCraft(selectedCraftId);
    }
  }, [selectedCraftId]);

  const LOCATIONS = ["all", "Hyderabad", "Chennai", "Bengaluru", "Mumbai", "Kochi", "Visakhapatnam", "Delhi", "Dubai"];
  const LANGUAGES = ["all", "Telugu", "Tamil", "Hindi", "Malayalam", "Kannada", "English"];

  const filtered = professionals.filter(p => {
    const matchSearch = searchQuery === "" ||
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.professionalHeadline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.primaryCraftName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCraft = selectedCraft === "all" || 
      p.primaryCraftId === selectedCraft || 
      p.secondaryCraftIds.includes(selectedCraft);

    const matchLocation = selectedLocation === "all" || 
      p.location.toLowerCase().includes(selectedLocation.toLowerCase()) ||
      p.preferredLocations.some(l => l.toLowerCase().includes(selectedLocation.toLowerCase()));

    const matchLanguage = selectedLanguage === "all" ||
      p.languages.some(l => l.toLowerCase() === selectedLanguage.toLowerCase());

    const matchAvailability = selectedAvailability === "all" ||
      p.availability.status === selectedAvailability;

    const matchVerification = selectedVerification === "all" ||
      (selectedVerification === "verified" && p.verificationLevel !== "None") ||
      p.verificationLevel === selectedVerification;

    return matchSearch && matchCraft && matchLocation && matchLanguage && matchAvailability && matchVerification;
  }).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "experience") return b.experienceYears - a.experienceYears;
    return b.completedProjectsCount - a.completedProjectsCount;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Talent Directory</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Discover Verified Film Professionals
          </h1>
          <p className="text-white/60 text-xs md:text-sm mt-1">
            Browse Directors, Cinematographers, Music Directors, Actors, Editors, VFX Leads, and crew across all 24 crafts.
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs">
          <span className="text-white/50 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
          >
            <option value="rating" className="bg-[#111218] text-white">Highest Rated</option>
            <option value="experience" className="bg-[#111218] text-white">Most Experienced</option>
            <option value="recent" className="bg-[#111218] text-white">Most Completed Projects</option>
          </select>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#111218] border border-white/10 space-y-4">
        {/* Main Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search artists, directors, DOPs, technicians, crew by name, craft, skills, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">
          {/* Craft Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">Craft</label>
            <select
              value={selectedCraft}
              onChange={(e) => {
                setSelectedCraft(e.target.value);
                if (onCraftChange) onCraftChange(e.target.value);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="all" className="bg-[#111218] text-white">All 24 Crafts</option>
              {crafts.map(c => (
                <option key={c.id} value={c.id} className="bg-[#111218] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              {LOCATIONS.map(l => (
                <option key={l} value={l} className="bg-[#111218] text-white">
                  {l === "all" ? "All Locations" : l}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              {LANGUAGES.map(l => (
                <option key={l} value={l} className="bg-[#111218] text-white">
                  {l === "all" ? "All Languages" : l}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">Availability</label>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="all" className="bg-[#111218] text-white">All Availability</option>
              <option value="Available" className="bg-[#111218] text-emerald-400">🟢 Available Now</option>
              <option value="Partially Available" className="bg-[#111218] text-amber-400">🟡 Partially Available</option>
              <option value="Booked" className="bg-[#111218] text-red-400">🔴 Booked</option>
            </select>
          </div>

          {/* Verification Badge Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">Verification</label>
            <select
              value={selectedVerification}
              onChange={(e) => setSelectedVerification(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="all" className="bg-[#111218] text-white">All Profiles</option>
              <option value="verified" className="bg-[#111218] text-cyan-400">Any Verified</option>
              <option value="Professional Verified" className="bg-[#111218] text-amber-400">Professional Verified</option>
              <option value="Profile Verified" className="bg-[#111218] text-emerald-400">Profile Verified</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicators & Results Count */}
        <div className="flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/5">
          <span>Found <strong className="text-white">{filtered.length}</strong> matching professionals</span>
          {(selectedCraft !== "all" || selectedLocation !== "all" || selectedLanguage !== "all" || selectedAvailability !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCraft("all");
                setSelectedLocation("all");
                setSelectedLanguage("all");
                setSelectedAvailability("all");
                setSelectedVerification("all");
                if (onCraftChange) onCraftChange("all");
              }}
              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Professionals List Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-[#111218] border border-white/10 space-y-3">
          <UserCheck className="w-10 h-10 text-white/30 mx-auto" />
          <h3 className="text-base font-bold text-white">No professionals match your filters</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing craft filters, or expanding location preferences.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(profile => {
            const isAvail = profile.availability.status === "Available";
            const isPartial = profile.availability.status === "Partially Available";

            return (
              <div
                key={profile.id}
                className="group rounded-2xl bg-[#111218]/95 border border-white/10 hover:border-amber-500/40 p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/5 space-y-4"
              >
                {/* Top Profile Header */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    {/* Avatar with Availability Indicator */}
                    <div className="relative shrink-0">
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName}
                        className="w-14 h-14 rounded-2xl object-cover border border-white/15 group-hover:border-amber-500/50 transition-all"
                      />
                      <span 
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#111218] flex items-center justify-center ${
                          isAvail ? "bg-emerald-500" : isPartial ? "bg-amber-500" : "bg-red-500"
                        }`}
                        title={`Availability: ${profile.availability.status}`}
                      />
                    </div>

                    {/* Name, Headline & Verification */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-base font-black text-white truncate group-hover:text-amber-400 transition-colors">
                          {profile.fullName}
                        </h3>
                        {profile.verificationLevel !== "None" && (
                          <span 
                            className="flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[10px] font-extrabold border border-amber-500/30"
                            title={profile.verificationLevel}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-amber-300/90 mt-0.5">
                        {profile.primaryCraftName}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-white/50 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-white/40" />
                          {profile.location}
                        </span>
                        <span>•</span>
                        <span>{profile.experienceYears}+ Yrs Exp</span>
                      </div>
                    </div>
                  </div>

                  {/* Headline */}
                  <p className="text-xs text-white/70 line-clamp-2 leading-relaxed italic">
                    "{profile.professionalHeadline}"
                  </p>

                  {/* Key Stats Bar: Rating, Projects, Languages */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-extrabold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{profile.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-[10px] text-white/40">({profile.reviewsCount} reviews)</span>
                    </div>

                    <div className="border-x border-white/10">
                      <div className="text-white text-xs font-extrabold">
                        {profile.completedProjectsCount}
                      </div>
                      <span className="text-[10px] text-white/40">Projects</span>
                    </div>

                    <div>
                      <div className="text-white text-xs font-bold truncate">
                        {profile.languages.slice(0, 2).join(", ")}
                      </div>
                      <span className="text-[10px] text-white/40">Languages</span>
                    </div>
                  </div>

                  {/* Top Skills Pills */}
                  <div className="flex flex-wrap gap-1">
                    {profile.skills.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white/5 text-white/70 text-[10px] border border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                    {profile.skills.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-amber-400 font-bold">
                        +{profile.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions: View Profile & Invite */}
                <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectProfessional(profile)}
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => onInviteToProject(profile)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Invite</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
