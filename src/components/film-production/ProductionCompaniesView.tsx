import React, { useState } from "react";
import { 
  ProductionCompany, 
  FilmProject 
} from "../../types/filmProductionMarketplace";
import { 
  Building2, Search, Award, Users, CheckCircle2, 
  Film, MapPin, ChevronRight, Sparkles, PlusCircle
} from "lucide-react";

interface ProductionCompaniesViewProps {
  companies: ProductionCompany[];
  projects: FilmProject[];
  onSelectProject: (project: FilmProject) => void;
}

export default function ProductionCompaniesView({
  companies,
  projects,
  onSelectProject
}: ProductionCompaniesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = companies.filter(c => {
    return searchQuery === "" ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.about.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Studio Network</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Registered Film Studios & Production Houses
          </h1>
          <p className="text-white/60 text-xs md:text-sm mt-1">
            Discover leading film production banners, line producers, and OTT production studios.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-bold">
          {filtered.length} Production Studios
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111218] border border-white/10">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search studios by banner name, services, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-500/60"
          />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(company => {
          const companyProjects = projects.filter(p => 
            p.companyName.toLowerCase().includes(company.name.toLowerCase())
          );

          return (
            <div
              key={company.id}
              className="p-6 rounded-3xl bg-[#111218] border border-white/10 hover:border-amber-500/40 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-white/10 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-white">{company.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                        {company.verificationStatus}
                      </span>
                    </div>
                    <p className="text-xs text-amber-400 font-semibold">{company.tagline}</p>
                    <div className="flex items-center gap-3 text-[11px] text-white/50 mt-1">
                      <span>📍 {company.location}</span>
                      <span>•</span>
                      <span>👥 {company.teamSize}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-white/70 leading-relaxed">
                  {company.about}
                </p>

                {/* Services */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-white/40">Studio Services</span>
                  <div className="flex flex-wrap gap-1.5">
                    {company.services.map((serv, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/5 text-white/80 text-xs border border-white/5">
                        {serv}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notable blockbusters */}
                {company.notableCredits && company.notableCredits.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-white/40">Notable Blockbuster Credits</span>
                    <div className="flex flex-wrap gap-1.5">
                      {company.notableCredits.map((credit, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/20 flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-400" />
                          <span>{credit}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Projects under Studio */}
              {companyProjects.length > 0 && (
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-amber-400">Active Film Projects</span>
                  <div className="space-y-1.5">
                    {companyProjects.map(p => (
                      <div
                        key={p.id}
                        onClick={() => onSelectProject(p)}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Film className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-white">{p.title}</span>
                          <span className="text-[10px] text-white/50">({p.productionStage})</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/40" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
