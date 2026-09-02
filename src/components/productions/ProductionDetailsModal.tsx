import React, { useState } from "react";
import { X, Play, Ticket, Sparkles, Film, Calendar, Users, Award, ShieldCheck, Heart, Share2, Check, ExternalLink, Video } from "lucide-react";
import { ProductionProject } from "../../types/productions";

interface ProductionDetailsModalProps {
  project: ProductionProject | null;
  onClose: () => void;
  onBookTickets?: (movieTitle: string) => void;
  onFollowProject?: (projectId: string) => void;
  isFollowing?: boolean;
}

export default function ProductionDetailsModal({
  project,
  onClose,
  onBookTickets,
  onFollowProject,
  isFollowing = false
}: ProductionDetailsModalProps) {
  if (!project) return null;

  const [activeTab, setActiveTab] = useState<"overview" | "cast_crew" | "media" | "updates">("overview");
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-[#0F0F12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 transition-all border border-white/10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Banner Section */}
        <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-gradient-to-t from-[#0F0F12] via-black/40 to-transparent">
          <img
            src={project.bannerImage || project.posterImage}
            alt={project.title}
            className="w-full h-full object-cover object-center opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-[#0F0F12]/60 to-transparent" />

          {/* Banner Overlays */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <img
                src={project.posterImage}
                alt={project.title}
                className="w-24 sm:w-32 h-36 sm:h-48 object-cover rounded-xl border-2 border-gold/40 shadow-2xl hidden sm:block"
              />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-[10px] font-bold uppercase tracking-wider">
                    {project.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    {project.status}
                  </span>
                  <span className="text-xs text-white/60 font-mono">
                    {project.language}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-serif">
                  {project.title}
                </h1>
                <p className="text-sm text-gold/90 italic font-medium">
                  "{project.tagline}"
                </p>
                <div className="flex items-center gap-3 text-xs text-white/70">
                  <span>Dir: <strong className="text-white">{project.director}</strong></span>
                  <span>•</span>
                  <span>Est. Budget: <strong className="text-amber-400">{project.budgetRange || "Confidential"}</strong></span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {project.trailerUrl && (
                <button
                  onClick={() => setPlayingVideoUrl(project.trailerUrl || null)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/20 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current text-amber-400" />
                  <span>Trailer</span>
                </button>
              )}

              {onFollowProject && (
                <button
                  onClick={() => onFollowProject(project.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    isFollowing 
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/40" 
                      : "bg-white/[0.05] text-white hover:bg-white/10 border-white/20"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFollowing ? "fill-current" : ""}`} />
                  <span>{isFollowing ? "Following" : "Follow"}</span>
                </button>
              )}

              {project.status === "Released" || project.ticketMovieTitle ? (
                <button
                  onClick={() => {
                    if (onBookTickets) {
                      onBookTickets(project.ticketMovieTitle || project.title);
                      onClose();
                    } else {
                      window.location.href = "/#services";
                    }
                  }}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 shadow-lg shadow-gold/20 transition-all cursor-pointer"
                >
                  <Ticket className="w-4 h-4 fill-current" />
                  <span>BOOK TICKETS</span>
                </button>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold text-center">
                  In Production ({project.releaseDate || "TBA"})
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#0A0A0C] px-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "overview"
                ? "border-gold text-gold bg-gold/5"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Overview & Story
          </button>
          <button
            onClick={() => setActiveTab("cast_crew")}
            className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "cast_crew"
                ? "border-gold text-gold bg-gold/5"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Cast & Crew ({project.cast.length + project.crew.length})
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "media"
                ? "border-gold text-gold bg-gold/5"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Media & Gallery ({project.media.length})
          </button>
          <button
            onClick={() => setActiveTab("updates")}
            className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "updates"
                ? "border-gold text-gold bg-gold/5"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Updates & Timeline ({project.updates.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Main Synopsis */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-sm font-bold uppercase text-gold tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold" />
                    Spoiler-Free Synopsis
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed font-sans bg-white/[0.02] p-4 rounded-xl border border-white/5">
                    {project.synopsis}
                  </p>

                  <h3 className="text-sm font-bold uppercase text-gold tracking-widest flex items-center gap-2 pt-2">
                    <Film className="w-4 h-4 text-gold" />
                    Production Background
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Quick Info Sidebar */}
                <div className="space-y-4 bg-black/40 p-5 rounded-2xl border border-white/10 text-xs">
                  <h4 className="font-extrabold uppercase text-white border-b border-white/10 pb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Project Metadata
                  </h4>

                  <div className="space-y-2.5">
                    <div>
                      <span className="text-white/50 block">Producer House</span>
                      <span className="font-bold text-white">{project.producer}</span>
                    </div>
                    <div>
                      <span className="text-white/50 block">Primary Genres</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.genre.map((g, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-white font-medium text-[10px]">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-white/50 block">Lead Cast</span>
                      <span className="font-bold text-amber-300">{project.leadCast.join(", ")}</span>
                    </div>
                    <div>
                      <span className="text-white/50 block">Target Release Window</span>
                      <span className="font-bold text-white">{project.releaseDate || "To Be Announced"}</span>
                    </div>
                    <div>
                      <span className="text-white/50 block">Followers Interest</span>
                      <span className="font-bold text-gold">🔥 {(project.followersCount || 0).toLocaleString()} Fans</span>
                    </div>
                  </div>

                  <button
                    onClick={handleShare}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all border border-white/10 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    <span>{copied ? "Link Copied!" : "Share Production"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CAST & CREW */}
          {activeTab === "cast_crew" && (
            <div className="space-y-8">
              {/* Cast List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-gold tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4 text-gold" />
                  Lead Star Cast
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {project.cast.map(actor => (
                    <div key={actor.id} className="bg-black/50 border border-white/10 rounded-xl p-3 text-center space-y-2 hover:border-gold/40 transition-all">
                      <img
                        src={actor.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=70"}
                        alt={actor.name}
                        className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-gold/30 shadow-md"
                      />
                      <div>
                        <p className="font-bold text-white text-xs">{actor.name}</p>
                        <p className="text-[10px] text-gold">{actor.characterName}</p>
                        <p className="text-[9px] text-white/50 mt-1">{actor.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crew List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-gold tracking-widest flex items-center gap-2">
                  <Award className="w-4 h-4 text-gold" />
                  Key Technicians & Crew
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {project.crew.map(crewMember => (
                    <div key={crewMember.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs">
                      <p className="text-white/50 text-[10px] uppercase font-mono">{crewMember.role}</p>
                      <p className="font-bold text-white">{crewMember.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA & GALLERY */}
          {activeTab === "media" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-gold tracking-widest flex items-center gap-2">
                <Video className="w-4 h-4 text-gold" />
                Posters, Teasers & Behind-The-Scenes
              </h3>

              {project.media.length === 0 ? (
                <p className="text-white/50 text-xs italic">No additional media items published yet for this project.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {project.media.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setPlayingVideoUrl(item.url)}
                      className="group relative rounded-xl overflow-hidden border border-white/10 bg-black aspect-video cursor-pointer"
                    >
                      <img
                        src={item.thumbnailUrl || item.url || project.posterImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-3 flex flex-col justify-between">
                        <span className="self-start px-2 py-0.5 rounded bg-amber-500/80 text-black font-extrabold text-[9px] uppercase">
                          {item.type}
                        </span>
                        <div>
                          <p className="font-bold text-white text-xs group-hover:text-gold transition-colors">{item.title}</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <Play className="w-8 h-8 text-gold fill-current" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: UPDATES & TIMELINE */}
          {activeTab === "updates" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-gold tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold" />
                Chronological Production Announcements
              </h3>

              {project.updates.length === 0 ? (
                <p className="text-white/50 text-xs italic">No official updates posted yet.</p>
              ) : (
                <div className="space-y-4 border-l-2 border-gold/30 pl-4 sm:pl-6 ml-2">
                  {project.updates.map(upd => (
                    <div key={upd.id} className="relative space-y-2 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                      <div className="absolute -left-[25px] sm:-left-[33px] top-4 w-3.5 h-3.5 rounded-full bg-gold border-2 border-black" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gold font-bold font-mono">{upd.date}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{upd.title}</h4>
                      <p className="text-white/70 text-xs leading-relaxed">{upd.content}</p>
                      {upd.image && (
                        <img src={upd.image} alt={upd.title} className="w-full h-40 object-cover rounded-lg mt-2 border border-white/10" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Video Player Modal Overlay */}
        {playingVideoUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden border border-gold/40">
              <button
                onClick={() => setPlayingVideoUrl(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/80 text-white hover:text-gold cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
              <iframe
                src={playingVideoUrl.includes("youtube.com") ? playingVideoUrl.replace("watch?v=", "embed/") : playingVideoUrl}
                title="Trailer Player"
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
