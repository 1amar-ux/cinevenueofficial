import React, { useState } from "react";
import { PortfolioItem, PortfolioMediaCategory, ProfileVisibilityOption } from "../../types/filmProductionMarketplace";
import { 
  X, Plus, Image, Video, Film, Clock, User, 
  Calendar, ShieldCheck, Tag, UploadCloud, CheckCircle2
} from "lucide-react";

interface AddPortfolioItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "Image" | "Video" | "Showreel";
  onAddPortfolioItem: (item: PortfolioItem) => void;
}

const PHOTO_CATEGORIES: PortfolioMediaCategory[] = [
  "Profile Photo",
  "Professional Photo",
  "Character Look",
  "Costume Reference",
  "Behind The Scenes",
  "Previous Project Photo",
  "Other"
];

const VIDEO_CATEGORIES: PortfolioMediaCategory[] = [
  "Showreel",
  "Acting Clip",
  "Audition Clip",
  "Dance/Performance",
  "Previous Work",
  "Introduction Video",
  "Other"
];

export default function AddPortfolioItemModal({
  isOpen,
  onClose,
  defaultType = "Image",
  onAddPortfolioItem
}: AddPortfolioItemModalProps) {
  const [mediaType, setMediaType] = useState<"Image" | "Video" | "Showreel">(defaultType);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<PortfolioMediaCategory>(
    defaultType === "Image" ? "Professional Photo" : "Showreel"
  );
  const [mediaUrl, setMediaUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [role, setRole] = useState("");
  const [projectName, setProjectName] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [duration, setDuration] = useState("");
  const [credits, setCredits] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<ProfileVisibilityOption>("Public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !mediaUrl.trim()) return;

    setIsSubmitting(true);

    const newItem: PortfolioItem = {
      id: `port-${Date.now()}`,
      title: title.trim(),
      type: mediaType,
      category,
      mediaUrl: mediaUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim() || (mediaType === "Image" ? mediaUrl.trim() : undefined),
      role: role.trim() || "Lead Specialist",
      year: Number(year) || new Date().getFullYear(),
      projectType: "Feature Film",
      projectName: projectName.trim() || undefined,
      duration: duration.trim() || undefined,
      credits: credits.trim() || undefined,
      description: description.trim() || undefined,
      visibility
    };

    onAddPortfolioItem(newItem);
    setIsSubmitting(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0F1018] border border-white/15 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#141522] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Add Portfolio Material</h2>
              <p className="text-[11px] text-white/50">Upload photos, character looks, showreels, or performance clips</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Media Type Toggle */}
        <div className="p-4 border-b border-white/10 bg-[#0A0B10] flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMediaType("Image");
              setCategory("Professional Photo");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              mediaType === "Image"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black"
                : "bg-white/5 text-white/70 hover:text-white"
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>Photo / Stills</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMediaType("Video");
              setCategory("Acting Clip");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              mediaType === "Video"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black"
                : "bg-white/5 text-white/70 hover:text-white"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Clip</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMediaType("Showreel");
              setCategory("Showreel");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              mediaType === "Showreel"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black"
                : "bg-white/5 text-white/70 hover:text-white"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Showreel</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 font-bold mb-1">Title *</label>
              <input
                type="text"
                required
                placeholder={mediaType === "Image" ? "e.g. Character Look – Period Action Film" : "e.g. 2026 Dramatic Acting Reel"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-white/70 font-bold mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PortfolioMediaCategory)}
                className="w-full bg-[#181926] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {(mediaType === "Image" ? PHOTO_CATEGORIES : VIDEO_CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Media URL & Thumbnail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 font-bold mb-1">
                {mediaType === "Image" ? "Photo Image URL *" : "Video / YouTube / Vimeo URL *"}
              </label>
              <input
                type="url"
                required
                placeholder={mediaType === "Image" ? "https://images.unsplash.com/... or CDN" : "https://youtube.com/watch?v=... or .mp4"}
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-white/70 font-bold mb-1">
                {mediaType === "Image" ? "Costume / Look Reference Tag" : "Duration (e.g. 02:45)"}
              </label>
              {mediaType === "Image" ? (
                <input
                  type="text"
                  placeholder="e.g. Traditional Royal Look / Action Silhouette"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              ) : (
                <input
                  type="text"
                  placeholder="02:30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              )}
            </div>
          </div>

          {/* Role, Project & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-white/70 font-bold mb-1">Role / Character</label>
              <input
                type="text"
                placeholder="e.g. Lead Antagonist"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-white/70 font-bold mb-1">Project Name</label>
              <input
                type="text"
                placeholder="e.g. Vayu Film"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-white/70 font-bold mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Credits & Production Info */}
          <div>
            <label className="block text-white/70 font-bold mb-1">Credits / Director / Studio</label>
            <input
              type="text"
              placeholder="e.g. Director: S.S. Rajamouli, DOP: K.K. Senthil Kumar"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/70 font-bold mb-1">Description / Context</label>
            <textarea
              rows={2}
              placeholder="Explain the background of this scene, character approach, or technical equipment used..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Visibility Setting */}
          <div>
            <label className="block text-white/70 font-bold mb-1">Visibility Privacy</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as ProfileVisibilityOption)}
              className="w-full bg-[#181926] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="Public">🌐 Public (Visible to all filmmakers & casting teams)</option>
              <option value="CineVenue Users">🔒 CineVenue Users Only (Verified community)</option>
              <option value="Private">👁️ Private (Only visible to you)</option>
            </select>
          </div>

          {/* Footer Submit Button */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            {success ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4" />
                Portfolio item added successfully!
              </span>
            ) : (
              <span className="text-white/40 text-[11px]">
                Stored in CineVenue secure media database.
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold hover:bg-white/15 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black uppercase text-xs tracking-wider shadow-lg shadow-gold/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>{isSubmitting ? "Adding..." : "Add to Portfolio"}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
