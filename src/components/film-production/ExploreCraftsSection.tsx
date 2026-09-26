import React, { useState } from "react";
import { 
  FilmCraft,
  ProfessionalProfile
} from "../../types/filmProductionMarketplace";
import { 
  BookOpen, FileText, MessageSquare, Compass, Briefcase, UserCheck, 
  Users, Camera, Layers, Shirt, Sparkles, Activity, ShieldAlert, 
  Music, Feather, Mic, Volume2, Scissors, Zap, Sun, Radio, 
  Building2, Image, Share2, ChevronRight, Search, User, PlusCircle, ArrowRight
} from "lucide-react";
import { getProfessionals } from "../../services/filmProductionService";

interface ExploreCraftsSectionProps {
  crafts: FilmCraft[];
  onSelectCraft?: (craftId: string) => void;
  onViewProfessionals?: (craftName: string) => void;
  onCreateProposalForCraft?: (craft: FilmCraft) => void;
  selectedCraftId?: string;
}

const ICON_MAP: Record<string, any> = {
  BookOpen,
  FileText,
  MessageSquare,
  Compass,
  Briefcase,
  UserCheck,
  Users,
  Camera,
  Layers,
  Shirt,
  Sparkles,
  Activity,
  ShieldAlert,
  Music,
  Feather,
  Mic,
  Volume2,
  Scissors,
  Zap,
  Sun,
  Radio,
  Building2,
  Image,
  Share2
};

const CATEGORIES = [
  "All Crafts",
  "Direction & Writing",
  "Production & Management",
  "Cast & Performance",
  "Cinematography & Visuals",
  "Sound & Music",
  "Post Production & Tech",
  "Art & Styling",
  "Action & Stunts",
  "Publicity & Media"
];

export default function ExploreCraftsSection({
  crafts,
  onSelectCraft,
  onViewProfessionals,
  onCreateProposalForCraft,
  selectedCraftId
}: ExploreCraftsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState("All Crafts");
  const [searchQuery, setSearchQuery] = useState("");

  const professionals = getProfessionals();

  const getCraftProfessionalsCount = (craft: FilmCraft): number => {
    return professionals.filter(p => 
      p.primaryCraftId === craft.id || 
      p.primaryCraftName?.toLowerCase() === craft.name.toLowerCase() ||
      (p.secondaryCraftIds && p.secondaryCraftIds.includes(craft.id)) ||
      (p.secondaryCraftNames && p.secondaryCraftNames.some(scn => scn.toLowerCase() === craft.name.toLowerCase()))
    ).length;
  };

  const filteredCrafts = crafts.filter(c => {
    if (c.status !== "Active") return false;
    const matchCat = selectedCategory === "All Crafts" || c.category === selectedCategory;
    const matchQuery = searchQuery === "" || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subcategories.some(r => r.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchQuery;
  });

  return (
    <section className="space-y-6">
      {/* Header with Title and Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Layers className="w-3.5 h-3.5 text-gold" />
            <span>Standard CineVenue Crafts</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            24 Production Crafts
          </h2>
          <p className="text-white/60 text-xs md:text-sm mt-1 max-w-2xl">
            Explore all 24 professional filmmaking departments. Connect with verified talent, view departmental roles, and initiate direct project proposals.
          </p>
        </div>

        {/* Quick Search inside crafts */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search craft, role, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111218] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-gold text-black font-bold shadow-md shadow-gold/20"
                : "bg-[#111218] hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 24 Crafts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCrafts.map(craft => {
          const Icon = ICON_MAP[craft.icon] || Sparkles;
          const isSelected = selectedCraftId === craft.id;
          const proCount = getCraftProfessionalsCount(craft);

          return (
            <div
              key={craft.id}
              className={`group p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative overflow-hidden bg-[#111218]/90 hover:bg-[#151720] border-white/10 hover:border-gold/40 hover:shadow-xl ${
                isSelected ? "border-gold shadow-lg shadow-gold/15" : ""
              }`}
            >
              <div className="space-y-4">
                {/* Header: Icon & Craft Number & Pro Count */}
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/20 text-gold flex items-center justify-center group-hover:scale-105 group-hover:bg-gold/20 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/5 text-gold border border-white/10">
                      Craft #{craft.order}
                    </span>
                    <span className="text-[10px] font-mono text-white/50 flex items-center gap-1">
                      <User className="w-3 h-3 text-gold/70" />
                      <span>{proCount > 0 ? `${proCount} Professionals` : "Available"}</span>
                    </span>
                  </div>
                </div>

                {/* Craft Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-gold transition-colors flex items-center gap-1.5 uppercase tracking-wide">
                    <span>{craft.name}</span>
                  </h3>
                  <p className="text-[11px] text-white/40 font-medium mt-0.5">
                    {craft.category}
                  </p>
                  <p className="text-xs text-white/60 line-clamp-2 mt-2 leading-relaxed">
                    {craft.description}
                  </p>
                </div>

                {/* Relevant Professional Roles */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                    Relevant Roles:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {craft.subcategories.slice(0, 4).map((role, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] text-white/80 border border-white/5 font-medium"
                      >
                        {role}
                      </span>
                    ))}
                    {craft.subcategories.length > 4 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-gold font-bold">
                        +{craft.subcategories.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onViewProfessionals) {
                      onViewProfessionals(craft.name);
                    } else if (onSelectCraft) {
                      onSelectCraft(craft.id);
                    }
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-gold hover:text-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
                >
                  <span>View Professionals</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {onCreateProposalForCraft && (
                  <button
                    type="button"
                    onClick={() => onCreateProposalForCraft(craft)}
                    className="p-2 rounded-xl bg-gold/10 hover:bg-gold hover:text-black text-gold border border-gold/20 transition-all cursor-pointer"
                    title={`Create ${craft.name} Proposal`}
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
