import React, { useState } from "react";
import { X, Save, Plus, Trash2, Star, Users, Film, Award, CheckCircle2, Image as ImageIcon, Camera } from "lucide-react";
import { Movie, CastMember, CrewMember } from "../../../types";
import CloudinaryPhotoUploader from "../common/CloudinaryPhotoUploader";
import { formatRating } from "../../../utils/ratingFormatter";

interface MovieCastCrewEditorModalProps {
  isOpen: boolean;
  movie: Movie;
  onClose: () => void;
  onSave: (updatedMovie: Movie) => void;
}

export default function MovieCastCrewEditorModal({
  isOpen,
  movie,
  onClose,
  onSave,
}: MovieCastCrewEditorModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<"details" | "cast" | "crew">("details");

  // Form states
  const [description, setDescription] = useState(
    movie.description ||
      "Set against the backdrop of the early '90s Andhra Pradesh, Kalyan, a sharp-witted theatre operator, falls for Sitara, a young woman from Odisha. What begins as a lighthearted pursuit of love soon spirals into a chaotic series of misunderstandings, comic mishaps, and unexpected danger."
  );
  const [rating, setRating] = useState(formatRating(movie.rating, "9.4/10"));
  const [votes, setVotes] = useState(movie.votes ? String(movie.votes) : "2.6K+ Votes");
  const [duration, setDuration] = useState(movie.duration || "2h 25m");
  const [genre, setGenre] = useState(movie.genre || "Comedy, Period, Romantic");
  const [lang, setLang] = useState(movie.lang || movie.language || "Telugu");
  const [certification, setCertification] = useState(movie.certification || "UA16+");
  const [moviePoster, setMoviePoster] = useState(movie.img || movie.poster || "");
  const [formats, setFormats] = useState<string[]>(
    movie.formats && movie.formats.length > 0 ? movie.formats : ["2D", "EPIQ"]
  );

  // Cast members
  const initialCast: CastMember[] =
    movie.castMembers && movie.castMembers.length > 0
      ? movie.castMembers
      : Array.isArray(movie.cast) && movie.cast.length > 0 && typeof movie.cast[0] === "object"
      ? (movie.cast as CastMember[])
      : Array.isArray(movie.cast) && movie.cast.length > 0
      ? (movie.cast as string[]).map((name) => ({
          name,
          role: "Actor",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
        }))
      : [
          { name: "Sree Vishnu", role: "Actor", character: "Kalyan", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80" },
          { name: "Mahima Nambiar", role: "Actor", character: "Sitara", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80" },
          { name: "Radhika Sarathkumar", role: "Actor", character: "Mother", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80" },
          { name: "Shine Tom Chacko", role: "Actor", character: "Antagonist", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80" },
        ];
  const [castList, setCastList] = useState<CastMember[]>(initialCast);

  // New Cast Member inputs
  const [newActorName, setNewActorName] = useState("");
  const [newActorRole, setNewActorRole] = useState("Actor");
  const [newActorCharacter, setNewActorCharacter] = useState("");
  const [newActorImage, setNewActorImage] = useState("");

  // Crew members
  const initialCrew: CrewMember[] =
    movie.crewMembers && movie.crewMembers.length > 0
      ? movie.crewMembers
      : movie.crew && movie.crew.length > 0
      ? movie.crew
      : [
          { name: movie.director || "Kishore Tirumala", role: "Director", image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&q=80" },
          { name: "TG Vishwa Prasad", role: "Producer", image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&q=80" },
          { name: "Vivek Sagar", role: "Musician", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80" },
          { name: "Venu Udugula", role: "Cinematographer", image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&q=80" },
          { name: "Sreekar Prasad", role: "Editor", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80" },
        ];
  const [crewList, setCrewList] = useState<CrewMember[]>(initialCrew);

  // New Crew Member inputs
  const [newCrewName, setNewCrewName] = useState("");
  const [newCrewRole, setNewCrewRole] = useState("Director");
  const [newCrewImage, setNewCrewImage] = useState("");

  const handleAddCastMember = () => {
    if (!newActorName.trim()) return;
    const added: CastMember = {
      name: newActorName.trim(),
      role: newActorRole.trim() || "Actor",
      character: newActorCharacter.trim() || undefined,
      image:
        newActorImage.trim() ||
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
    };
    setCastList([...castList, added]);
    setNewActorName("");
    setNewActorCharacter("");
    setNewActorImage("");
  };

  const handleUpdateCastMemberImage = (index: number, newImageUrl: string) => {
    const updated = [...castList];
    updated[index] = { ...updated[index], image: newImageUrl };
    setCastList(updated);
  };

  const handleRemoveCastMember = (index: number) => {
    setCastList(castList.filter((_, idx) => idx !== index));
  };

  const handleAddCrewMember = () => {
    if (!newCrewName.trim()) return;
    const added: CrewMember = {
      name: newCrewName.trim(),
      role: newCrewRole.trim() || "Director",
      image:
        newCrewImage.trim() ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&q=80",
    };
    setCrewList([...crewList, added]);
    setNewCrewName("");
    setNewCrewImage("");
  };

  const handleUpdateCrewMemberImage = (index: number, newImageUrl: string) => {
    const updated = [...crewList];
    updated[index] = { ...updated[index], image: newImageUrl };
    setCrewList(updated);
  };

  const handleRemoveCrewMember = (index: number) => {
    setCrewList(crewList.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    const updated: Movie = {
      ...movie,
      description: description.trim(),
      rating: formatRating(rating.trim(), "9.4/10"),
      votes: votes.trim(),
      duration: duration.trim(),
      genre: genre.trim(),
      lang: lang.trim(),
      language: lang.trim(),
      certification: certification.trim(),
      img: moviePoster.trim() || movie.img || movie.poster,
      poster: moviePoster.trim() || movie.poster || movie.img,
      formats: formats.length > 0 ? formats : ["2D", "EPIQ"],
      castMembers: castList,
      cast: castList,
      crewMembers: crewList,
      crew: crewList,
      director: crewList.find((c) => c.role?.toLowerCase() === "director")?.name || movie.director,
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#121214] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eb4e62]/20 border border-[#eb4e62]/30 flex items-center justify-center text-[#eb4e62]">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Edit Movie Master Details: <span className="text-[#eb4e62]">{movie.title}</span>
              </h3>
              <p className="text-xs text-text-secondary">
                Upload photos via Cloudinary, update synopsis, rating scores, cast & crew
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-white/10 flex items-center gap-2 bg-black/20 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === "details"
                ? "border-[#eb4e62] text-[#eb4e62]"
                : "border-transparent text-text-secondary hover:text-white"
            }`}
          >
            Story, Poster & Rating
          </button>
          <button
            onClick={() => setActiveTab("cast")}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === "cast"
                ? "border-[#eb4e62] text-[#eb4e62]"
                : "border-transparent text-text-secondary hover:text-white"
            }`}
          >
            Cast Members ({castList.length})
          </button>
          <button
            onClick={() => setActiveTab("crew")}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === "crew"
                ? "border-[#eb4e62] text-[#eb4e62]"
                : "border-transparent text-text-secondary hover:text-white"
            }`}
          >
            Crew Members ({crewList.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: DETAILS & POSTER */}
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Movie Poster Cloudinary Uploader */}
              <div className="bg-white/[0.02] border border-white/10 p-4 rounded-2xl">
                <CloudinaryPhotoUploader
                  label="Official Movie Poster (Cloudinary)"
                  shape="portrait"
                  value={moviePoster}
                  onChange={(url) => setMoviePoster(url)}
                  folder="cinevenue/movies/posters"
                  placeholder={movie.img || movie.poster}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white block mb-1.5 uppercase tracking-wider">
                  About The Movie (Synopsis)
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter comprehensive plot synopsis or premise..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-white focus:outline-none focus:border-[#eb4e62] leading-relaxed resize-none font-normal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-white block mb-1.5 uppercase tracking-wider">
                    Rating Score (e.g. 9.0/10)
                  </label>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                    <Star className="w-4 h-4 fill-[#eb4e62] text-[#eb4e62]" />
                    <input
                      type="text"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      placeholder="9.0/10"
                      className="w-full bg-transparent text-xs sm:text-sm text-white font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1.5 uppercase tracking-wider">
                    Total Votes Display
                  </label>
                  <input
                    type="text"
                    value={votes}
                    onChange={(e) => setVotes(e.target.value)}
                    placeholder="2.6K+ Votes"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#eb4e62]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1.5 uppercase tracking-wider">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="2h 25m"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#eb4e62]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-white block mb-1.5 uppercase tracking-wider">
                    Genre Tags
                  </label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Comedy, Period, Romantic"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#eb4e62]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1.5 uppercase tracking-wider">
                    Language
                  </label>
                  <input
                    type="text"
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    placeholder="Telugu"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#eb4e62]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1.5 uppercase tracking-wider">
                    Age Certification
                  </label>
                  <select
                    value={certification}
                    onChange={(e) => setCertification(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#eb4e62]"
                  >
                    <option value="U">U (Universal)</option>
                    <option value="UA13+">UA13+</option>
                    <option value="UA16+">UA16+</option>
                    <option value="A">A (Adults Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white block mb-1.5 uppercase tracking-wider">
                  Projection Formats
                </label>
                <div className="flex flex-wrap gap-2">
                  {["2D", "3D", "IMAX", "EPIQ", "4DX", "Dolby Atmos"].map((fmt) => {
                    const isSelected = formats.includes(fmt);
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFormats(formats.filter((f) => f !== fmt));
                          } else {
                            setFormats([...formats, fmt]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#eb4e62] text-white border-[#eb4e62]"
                            : "bg-white/5 text-white/60 border-white/10 hover:border-white/20"
                        }`}
                      >
                        {fmt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CAST MEMBERS */}
          {activeTab === "cast" && (
            <div className="space-y-6">
              {/* Add Cast Form with Cloudinary Photo Upload */}
              <div className="bg-black/40 border border-white/10 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#eb4e62] flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Add Actor / Cast Member (Upload Photo to Cloudinary)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Actor Name (e.g. Sree Vishnu)"
                    value={newActorName}
                    onChange={(e) => setNewActorName(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#eb4e62]"
                  />
                  <input
                    type="text"
                    placeholder="Character / Role (e.g. Kalyan)"
                    value={newActorCharacter}
                    onChange={(e) => setNewActorCharacter(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#eb4e62]"
                  />
                </div>

                {/* Cloudinary photo uploader */}
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                  <CloudinaryPhotoUploader
                    value={newActorImage}
                    onChange={(url) => setNewActorImage(url)}
                    label="Actor Portrait Photo"
                    shape="circle"
                    compact={true}
                    folder="cinevenue/movies/cast"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddCastMember}
                  className="px-4 py-2 bg-[#eb4e62] hover:bg-[#d63e51] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add To Cast</span>
                </button>
              </div>

              {/* Current Cast List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Current Cast Registry ({castList.length}) — Click Photo to Update via Cloudinary
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {castList.map((actor, idx) => (
                    <div
                      key={idx}
                      className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Compact Avatar with Cloudinary replace trigger */}
                        <div className="shrink-0">
                          <CloudinaryPhotoUploader
                            value={actor.image}
                            onChange={(newUrl) => handleUpdateCastMemberImage(idx, newUrl)}
                            shape="circle"
                            compact={true}
                            folder="cinevenue/movies/cast"
                            allowUrlInput={false}
                          />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-white truncate">{actor.name}</h5>
                          <p className="text-[10px] text-text-secondary truncate">
                            {actor.character ? `${actor.character} (Actor)` : actor.role || "Actor"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCastMember(idx)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CREW MEMBERS */}
          {activeTab === "crew" && (
            <div className="space-y-6">
              {/* Add Crew Form with Cloudinary Photo Upload */}
              <div className="bg-black/40 border border-white/10 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#eb4e62] flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Add Filmmaker / Crew Member (Upload Photo to Cloudinary)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Crew Member Name (e.g. Kishore Tirumala)"
                    value={newCrewName}
                    onChange={(e) => setNewCrewName(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#eb4e62]"
                  />
                  <select
                    value={newCrewRole}
                    onChange={(e) => setNewCrewRole(e.target.value)}
                    className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#eb4e62]"
                  >
                    <option value="Director">Director</option>
                    <option value="Producer">Producer</option>
                    <option value="Musician">Musician / Music Director</option>
                    <option value="Cinematographer">Cinematographer</option>
                    <option value="Editor">Editor</option>
                    <option value="Writer">Writer / Screenplay</option>
                    <option value="Action Choreographer">Action Choreographer</option>
                  </select>
                </div>

                {/* Cloudinary photo uploader */}
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                  <CloudinaryPhotoUploader
                    value={newCrewImage}
                    onChange={(url) => setNewCrewImage(url)}
                    label="Crew Member Photo"
                    shape="circle"
                    compact={true}
                    folder="cinevenue/movies/crew"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddCrewMember}
                  className="px-4 py-2 bg-[#eb4e62] hover:bg-[#d63e51] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add To Crew</span>
                </button>
              </div>

              {/* Current Crew List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Current Crew Registry ({crewList.length}) — Click Photo to Update via Cloudinary
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {crewList.map((crewItem, idx) => (
                    <div
                      key={idx}
                      className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Compact Avatar with Cloudinary replace trigger */}
                        <div className="shrink-0">
                          <CloudinaryPhotoUploader
                            value={crewItem.image}
                            onChange={(newUrl) => handleUpdateCrewMemberImage(idx, newUrl)}
                            shape="circle"
                            compact={true}
                            folder="cinevenue/movies/crew"
                            allowUrlInput={false}
                          />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-white truncate">{crewItem.name}</h5>
                          <p className="text-[10px] text-[#eb4e62] font-semibold truncate">{crewItem.role || "Crew"}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCrewMember(idx)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-black/40">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#eb4e62] hover:bg-[#d63e51] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xl shadow-[#eb4e62]/20 cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save & Sync Movie Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
