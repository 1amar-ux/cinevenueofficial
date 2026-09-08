import React from "react";
import { 
  ProfessionalProfile, 
  FilmCraft 
} from "../../types/filmProductionMarketplace";
import { 
  User, MapPin, Globe, Film, Award, Video, 
  Edit3, CheckCircle2, Calendar, Star, ExternalLink, 
  Briefcase, Sparkles, BookOpen, Layers
} from "lucide-react";

interface MyProfileViewProps {
  profile?: ProfessionalProfile;
  userEmail?: string | null;
  onOpenEditModal: () => void;
}

export default function MyProfileView({
  profile,
  userEmail,
  onOpenEditModal
}: MyProfileViewProps) {
  const name = profile?.fullName || (userEmail ? userEmail.split("@")[0] : "Film Professional");
  const headline = profile?.professionalHeadline || "Actor, Director & Creative Producer";
  const avatar = profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80";
  const cover = profile?.coverImageUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1400&auto=format&fit=crop&q=80";
  const bio = profile?.bio || "Experienced multi-disciplinary film professional with credits across feature films and digital cinema.";
  const languages = profile?.languages || ["Telugu", "Hindi", "English"];
  const skills = profile?.skills || ["Method Acting", "Scene Breakdown", "Multi-Camera Direction", "Screenplay Writing"];
  const location = profile?.location || "Hyderabad, Telangana, India";
  const experienceYears = profile?.experienceYears || 5;

  // Multiple roles supported on single account
  const roles = [
    profile?.primaryCraftName || "Lead Actor",
    ...(profile?.secondaryCraftNames || ["Director", "Creative Producer"])
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      
      {/* 1. Profile Hero Card */}
      <div className="rounded-3xl bg-[#0D0E15] border border-white/10 overflow-hidden shadow-2xl">
        
        {/* Cover Image Banner */}
        <div className="relative h-56 md:h-72 w-full bg-black/60 overflow-hidden">
          <img 
            src={cover} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E15] via-[#0D0E15]/30 to-transparent" />
          
          <button
            onClick={onOpenEditModal}
            className="absolute top-4 right-4 px-4 py-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold border border-white/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Profile Avatar & Primary Info */}
        <div className="px-6 md:px-10 pb-8 relative -mt-16 md:-mt-20">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl overflow-hidden bg-[#1A1B28] border-4 border-[#0D0E15] shadow-2xl shrink-0">
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-black text-white">{name}</h1>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase">
                    Verified
                  </span>
                </div>
                <p className="text-sm font-semibold text-amber-400/90">{headline}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/60 pt-0.5">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{location}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{experienceYears}+ Years Experience</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{languages.join(", ")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2 md:pt-0">
              <button
                onClick={onOpenEditModal}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black uppercase text-xs tracking-wider shadow-lg shadow-gold/20 cursor-pointer"
              >
                Edit Profile
              </button>
            </div>

          </div>

          {/* Multiple Roles Badges */}
          <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-white/50 mr-1">Active Roles on CineVenue:</span>
            {roles.map((r, idx) => (
              <span 
                key={idx}
                className="px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-purple-400" />
                <span>{r}</span>
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* 2. Grid Sections: Bio, Skills, Availability & Professional Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Biography & Filmography & Showreel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Biography */}
          <div className="rounded-2xl bg-[#0E0F17] border border-white/10 p-6 space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Biography & Background</span>
            </h3>
            <p className="text-xs text-white/80 leading-relaxed whitespace-pre-line">
              {bio}
            </p>
          </div>

          {/* Filmography & Previous Projects */}
          <div className="rounded-2xl bg-[#0E0F17] border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Film className="w-4 h-4" />
                <span>Filmography & Previous Projects</span>
              </h3>
              <button 
                onClick={onOpenEditModal}
                className="text-xs text-white/60 hover:text-white"
              >
                + Add Project
              </button>
            </div>

            {profile?.filmography && profile.filmography.length > 0 ? (
              <div className="space-y-3">
                {profile.filmography.map((f, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-white text-sm">{f.projectTitle}</div>
                      <div className="text-amber-400/90 text-xs mt-0.5">Role: {f.role} ({f.craft})</div>
                    </div>
                    <div className="text-right text-[11px] text-white/50">
                      <div>{f.year}</div>
                      <div>{f.language}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-white/[0.01] border border-dashed border-white/10 text-xs text-white/40">
                No past filmography added yet. Click "Edit Profile" to add your feature film, short film, or OTT credits.
              </div>
            )}
          </div>

          {/* Portfolio & Showreel */}
          <div className="rounded-2xl bg-[#0E0F17] border border-white/10 p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span>Showreel & Portfolio Material</span>
            </h3>

            {profile?.portfolio && profile.portfolio.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.portfolio.map((p, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                    <div className="font-bold text-white line-clamp-1">{p.title}</div>
                    <div className="text-white/60 text-[11px]">{p.type} • {p.role}</div>
                    {p.mediaUrl && (
                      <a
                        href={p.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 font-bold hover:underline flex items-center gap-1 text-[11px] pt-1"
                      >
                        <span>Open Media</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-white/[0.01] border border-dashed border-white/10 text-xs text-white/40">
                No showreel links uploaded. Add your YouTube, Vimeo, or Cloudinary monologue links via "Edit Profile".
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Col: Skills, Training, Availability & Links */}
        <div className="space-y-6">
          
          {/* Skills & Training */}
          <div className="rounded-2xl bg-[#0E0F17] border border-white/10 p-6 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-white/60">
              Skills & Training
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="rounded-2xl bg-[#0E0F17] border border-white/10 p-6 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-white/60">
              Languages
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((l, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Availability Status */}
          <div className="rounded-2xl bg-[#0E0F17] border border-white/10 p-6 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-white/60">
              Availability
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-emerald-300">
                {profile?.availability?.status || "Available for New Projects"}
              </span>
            </div>
            {profile?.availability?.notes && (
              <p className="text-[11px] text-white/60 italic">
                "{profile.availability.notes}"
              </p>
            )}
          </div>

          {/* Professional Links */}
          <div className="rounded-2xl bg-[#0E0F17] border border-white/10 p-6 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-white/60">
              Professional Links
            </h3>
            <div className="space-y-2 text-xs">
              <a 
                href="https://imdb.com" 
                target="_blank" 
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-white transition-all"
              >
                <span>IMDb Filmography</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/50" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-white transition-all"
              >
                <span>YouTube Showreel</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/50" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-white transition-all"
              >
                <span>Verified Social Profile</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/50" />
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
