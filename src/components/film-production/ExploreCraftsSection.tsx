import React, { useState } from "react";
import { 
  FilmCraft 
} from "../../types/filmProductionMarketplace";
import { 
  Compass, Briefcase, BookOpen, FileText, MessageSquare, Users, UserCheck, 
  Camera, Scissors, Music, Feather, Mic, Activity, Layers, Shirt, Sparkles, 
  Volume2, Radio, Zap, Sun, ShieldAlert, Image, CameraOff, ChevronRight,
  Filter, Search, CheckCircle2
} from "lucide-react";

interface ExploreCraftsSectionProps {
  crafts: FilmCraft[];
  onSelectCraft: (craftId: string) => void;
  selectedCraftId?: string;
}

const ICON_MAP: Record<string, any> = {
  Compass, Briefcase, BookOpen, FileText, MessageSquare, Users, UserCheck, 
  Camera, Scissors, Music, Feather, Mic, Activity, Layers, Shirt, Sparkles, 
  Volume2, Radio, Zap, Sun, ShieldAlert, Image, CameraOff
};

const CATEGORIES = [
  "All Crafts",
  "Direction & Writing",
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
  selectedCraftId
}: ExploreCraftsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState("All Crafts");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCrafts = crafts.filter(c => {
    if (c.status !== "Active") return false;
    const matchCat = selectedCategory === "All Crafts" || c.category === selectedCategory;
    const matchQuery = searchQuery === "" || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchQuery;
  });

  return (
    <section className="space-y-6">
      {/* Header with Title and Category Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>The 24 Film Crafts System</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Explore All 24 Film Production Crafts
          </h2>
          <p className="text-white/60 text-xs md:text-sm mt-1 max-w-2xl">
            From Directors and Lead Actors to Sync Sound, VFX, Action Masters, and Colorists — connect with specialized verified talent across every stage of filmmaking.
          </p>
        </div>

        {/* Quick Search inside crafts */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search craft or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
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

          return (
            <div
              key={craft.id}
              onClick={() => onSelectCraft(craft.id)}
              className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? "bg-gradient-to-b from-amber-500/15 to-white/5 border-amber-500/60 shadow-lg shadow-amber-500/10"
                  : "bg-[#111218]/90 hover:bg-[#181A22] border-white/10 hover:border-amber-500/40 hover:shadow-md"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-amber-500/20 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10">
                    Craft #{craft.order}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <span>{craft.name}</span>
                  </h3>
                  <p className="text-[11px] text-amber-300/80 font-medium mt-0.5">
                    {craft.category}
                  </p>
                  <p className="text-xs text-white/60 line-clamp-2 mt-2 leading-relaxed">
                    {craft.description}
                  </p>
                </div>

                {/* Subcategories preview tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {craft.subcategories.slice(0, 3).map((sub, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-white/70 border border-white/5"
                    >
                      {sub}
                    </span>
                  ))}
                  {craft.subcategories.length > 3 && (
                    <span className="px-1.5 py-0.5 text-[10px] text-amber-400 font-bold">
                      +{craft.subcategories.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action bottom link */}
              <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/50 group-hover:text-amber-400 font-semibold transition-colors">
                <span>Discover {craft.name}</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
