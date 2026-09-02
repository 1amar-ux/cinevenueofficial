import React, { useState, useEffect } from "react";
import {
  Film,
  Search,
  Star,
  Clock,
  Globe,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  User,
  Calendar,
  Layers,
  ArrowUpDown,
  X,
  Play,
  Heart,
  FileText,
  AlertCircle,
  ThumbsUp,
  Inbox
} from "lucide-react";
import { Movie } from "../../types";

interface MoviesProps {
  movies: Movie[];
}

interface MovieRequest {
  id: string;
  movieName: string;
  language: string;
  releaseDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

export default function Movies({ movies }: MoviesProps) {
  const [activeTab, setActiveTab] = useState<"available" | "requests">("available");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All"); // Running / Upcoming
  const [sortBy, setSortBy] = useState<"popularity" | "releaseDate" | "alphabetical">("popularity");

  // Detailed Modal Movie state
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  // New Movie Request Form states
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    movieName: "",
    language: "Hindi",
    releaseDate: "",
    reason: ""
  });

  // Movie Requests State (stored in localStorage)
  const [movieRequests, setMovieRequests] = useState<MovieRequest[]>(() => {
    const saved = localStorage.getItem("cine_theatre_movie_requests");
    return saved ? JSON.parse(saved) : [
      {
        id: "REQ-9382",
        movieName: "Avatar: The Way of Water (Re-release)",
        language: "English",
        releaseDate: "2026-08-15",
        reason: "Massive demand from high-paying corporate groups for private screening options.",
        status: "Approved",
        createdAt: "2026-07-01"
      },
      {
        id: "REQ-2048",
        movieName: "Puspa 2: The Rule",
        language: "Telugu",
        releaseDate: "2026-08-28",
        reason: "Highest-priority upcoming release of the year. Essential for high initial seating occupancies.",
        status: "Pending",
        createdAt: "2026-07-07"
      }
    ];
  });

  const [toast, setToast] = useState<string | null>(null);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem("cine_theatre_movie_requests", JSON.stringify(movieRequests));
  }, [movieRequests]);

  // Extract distinct languages for filtering
  const languages = ["All", ...Array.from(new Set(movies.map(m => m.lang)))];
  const genres = ["All", "Action", "Drama", "Sci-Fi", "Comedy", "Thriller", "Horror", "Romance"];

  // Filter movies
  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.lang.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGenre =
      selectedGenre === "All" ||
      m.genre.split(", ").includes(selectedGenre) ||
      m.genre.includes(selectedGenre);
    
    const matchesLanguage = selectedLanguage === "All" || m.lang === selectedLanguage;
    
    // Simulate running vs upcoming status based on release dates
    const isUpcoming = m.title.includes("Upcoming") || m.title.includes("Stree") || m.title.includes("Devara");
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Running" && !isUpcoming) ||
      (selectedStatus === "Upcoming" && isUpcoming);

    return matchesSearch && matchesGenre && matchesLanguage && matchesStatus;
  });

  // Sort movies
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (sortBy === "alphabetical") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "releaseDate") {
      // Simulate release dates or use fallback comparison
      return (a.duration || "").localeCompare(b.duration || "");
    } else {
      // Default sort by rating/popularity
      return Number(b.rating) - Number(a.rating);
    }
  });

  // Submit movie request form
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.movieName.trim() || !newRequest.reason.trim() || !newRequest.releaseDate) {
      alert("Please fill in all the required request fields.");
      return;
    }

    const createdReq: MovieRequest = {
      id: "REQ-" + Math.floor(1000 + Math.random() * 9000),
      movieName: newRequest.movieName,
      language: newRequest.language,
      releaseDate: newRequest.releaseDate,
      reason: newRequest.reason,
      status: "Pending",
      createdAt: new Date().toISOString().split("T")[0]
    };

    setMovieRequests([createdReq, ...movieRequests]);
    setNewRequest({ movieName: "", language: "Hindi", releaseDate: "", reason: "" });
    setShowRequestForm(false);
    showToastMsg("New Movie Request dispatched to Super Admin for approval!");
  };

  return (
    <div className="space-y-6 text-left select-none relative pb-12 text-xs">
      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl bg-gold text-[#0A0A0B] font-bold flex items-center gap-2 transition-all">
          <Check className="w-5 h-5 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-text-primary tracking-wide flex items-center gap-2">
            <Film className="w-6 h-6 text-gold" />
            <span>Movie & Film Roster</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Deploy approved titles for screen booking, analyze ratings, and request custom blockbuster licenses
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#121215] border border-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-0 ${
              activeTab === "available"
                ? "bg-gold text-black shadow"
                : "text-text-secondary hover:text-white"
            }`}
          >
            Available Movies ({movies.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-0 ${
              activeTab === "requests"
                ? "bg-gold text-black shadow"
                : "text-text-secondary hover:text-white"
            }`}
          >
            My Requested Licenses ({movieRequests.length})
          </button>
        </div>
      </div>

      {activeTab === "available" ? (
        <>
          {/* Filters & Control Deck */}
          <div className="bg-[#121215] border border-white/5 p-4 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search bar */}
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold pl-10 pr-4 py-2.5 rounded-xl text-text-primary focus:outline-none transition-all placeholder:text-text-muted text-xs"
                  placeholder="Search movie titles, languages, distributors, actors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Advanced select filters */}
              <div className="flex flex-wrap gap-3 items-center w-full md:w-auto text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted uppercase text-[9px] font-bold">Language:</span>
                  <select
                    className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary focus:outline-none cursor-pointer"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang} className="bg-[#0A0A0B]">{lang}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted uppercase text-[9px] font-bold">Status:</span>
                  <select
                    className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary focus:outline-none cursor-pointer"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="All" className="bg-[#0A0A0B]">All Statuses</option>
                    <option value="Running" className="bg-[#0A0A0B]">Running Now</option>
                    <option value="Upcoming" className="bg-[#0A0A0B]">Upcoming Releases</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted uppercase text-[9px] font-bold">Sort By:</span>
                  <select
                    className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary focus:outline-none cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <option value="popularity" className="bg-[#0A0A0B]">Popularity (Rating)</option>
                    <option value="releaseDate" className="bg-[#0A0A0B]">Duration</option>
                    <option value="alphabetical" className="bg-[#0A0A0B]">Alphabetical (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Genre Pills Row */}
            <div className="flex gap-2 overflow-x-auto pb-1 border-t border-white/5 pt-3">
              {genres.map((genre) => (
                <button
                  type="button"
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedGenre === genre
                      ? "bg-gold/15 border-gold/30 text-gold"
                      : "bg-white/5 border-white/5 text-text-secondary hover:border-white/20"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Film Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedMovies.map((m) => {
              const isUpcoming = m.title.includes("Upcoming") || m.title.includes("Stree") || m.title.includes("Devara");
              return (
                <div
                  key={m.title}
                  onClick={() => {
                    setSelectedMovie(m);
                    setShowTrailer(false);
                  }}
                  className="bg-[#121215] border border-white/5 hover:border-gold/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col group transition-all duration-300 cursor-pointer"
                >
                  {/* Poster Image Cover */}
                  <div className="relative h-52 w-full bg-[#1A1A1E] overflow-hidden">
                    <img
                      src={m.img}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent" />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#0A0A0B]/80 text-gold border border-gold/20 text-[9px] font-bold font-mono">
                        {m.certificate || "UA"}
                      </span>
                      {isUpcoming ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[9px] font-bold font-mono">
                          Upcoming
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-bold font-mono">
                          Running
                        </span>
                      )}
                    </div>
                    
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-[#0A0A0B]/90 text-gold text-[9px] font-bold font-mono flex items-center gap-1">
                      <Star className="w-3 h-3 fill-gold text-gold" />
                      <span>{m.rating || "8.5"}</span>
                    </div>

                    {/* Quick view prompt on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="px-4 py-2 bg-gold text-black rounded-xl font-bold uppercase tracking-wider text-[10px]">
                        View Details
                      </span>
                    </div>
                  </div>

                  {/* Movie Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-text-secondary uppercase tracking-widest font-bold">
                        {m.genre}
                      </span>
                      <h3 className="text-xs font-bold text-text-primary group-hover:text-gold transition-colors line-clamp-1">
                        {m.title}
                      </h3>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-text-muted font-mono pt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gold" /> {m.duration || "142 min"}</span>
                        <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-gold" /> {m.lang}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-text-muted">
                      <span>Distributor:</span>
                      <span className="font-bold text-text-secondary font-mono">{m.distributor || "Universal Corp"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {sortedMovies.length === 0 && (
            <div className="bg-[#121215] border border-white/5 rounded-2xl py-16 text-center text-text-secondary space-y-3 shadow-xl">
              <Film className="w-12 h-12 mx-auto text-text-muted opacity-25" />
              <p className="text-xs">No movies found matching your filter criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedGenre("All");
                  setSelectedLanguage("All");
                  setSelectedStatus("All");
                }}
                className="text-gold font-bold uppercase text-[9px] hover:underline cursor-pointer bg-transparent border-0"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </>
      ) : (
        /* REQUESTS TAB VIEW */
        <div className="space-y-6">
          {/* Header block for requests */}
          <div className="bg-[#121215] border border-white/5 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Custom Blocking Licenses</h3>
              <p className="text-[11px] text-text-secondary">
                Need a blockbuster film not currently approved on the roster? Request licensing approval from Super Admin.
              </p>
            </div>
            {!showRequestForm && (
              <button
                onClick={() => setShowRequestForm(true)}
                className="px-4 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border-0 shadow-lg shadow-gold/10"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Request Movie License</span>
              </button>
            )}
          </div>

          {showRequestForm && (
            <form
              onSubmit={handleRequestSubmit}
              className="bg-[#121215] border border-white/5 p-6 md:p-8 rounded-2xl space-y-5 shadow-2xl max-w-xl text-xs animate-[fadeIn_0.3s_ease-out]"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="font-bold text-white uppercase tracking-wider">New License Request Form</span>
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="text-text-muted hover:text-white"
                >
                  Close Form
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-text-secondary uppercase text-[10px]">Movie Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deadpool & Wolverine, Avengers: Doomsday"
                  className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none"
                  value={newRequest.movieName}
                  onChange={(e) => setNewRequest(p => ({ ...p, movieName: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Languages *</label>
                  <select
                    className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none cursor-pointer"
                    value={newRequest.language}
                    onChange={(e) => setNewRequest(p => ({ ...p, language: e.target.value }))}
                  >
                    <option value="Hindi" className="bg-[#0A0A0B]">Hindi</option>
                    <option value="English" className="bg-[#0A0A0B]">English</option>
                    <option value="Telugu" className="bg-[#0A0A0B]">Telugu</option>
                    <option value="Tamil" className="bg-[#0A0A0B]">Tamil</option>
                    <option value="Kannada" className="bg-[#0A0A0B]">Kannada</option>
                    <option value="Malayalam" className="bg-[#0A0A0B]">Malayalam</option>
                    <option value="Multi-Language" className="bg-[#0A0A0B]">Multi-Language</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Requested Release / Screening Date *</label>
                  <input
                    type="date"
                    required
                    className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none font-mono"
                    value={newRequest.releaseDate}
                    onChange={(e) => setNewRequest(p => ({ ...p, releaseDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-text-secondary uppercase text-[10px]">Business Justification / Reason *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why this movie is requested (e.g. high local fan base, special distributor campaign, high corporate request ticket sales volume)..."
                  className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none leading-relaxed"
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest(p => ({ ...p, reason: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-text-secondary rounded-xl font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gold hover:bg-gold-light text-black rounded-xl font-bold uppercase tracking-wider"
                >
                  Dispatch Request
                </button>
              </div>
            </form>
          )}

          {/* Requests Audit table */}
          <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-white/5 pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-gold" />
              <span>License Requests Log ({movieRequests.length})</span>
            </h4>

            <div className="overflow-x-auto pt-4">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-text-secondary border-b border-white/5">
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Request Code</th>
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Movie Title</th>
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Language</th>
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Requested Date</th>
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Justification Reason</th>
                    <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px] text-right">Approval Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {movieRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 font-mono font-semibold text-text-muted">{req.id}</td>
                      <td className="py-4 font-bold text-text-primary">{req.movieName}</td>
                      <td className="py-4 font-mono text-text-secondary">{req.language}</td>
                      <td className="py-4 font-mono text-text-secondary">{req.releaseDate}</td>
                      <td className="py-4 text-text-muted max-w-xs line-clamp-2 mt-3 leading-relaxed">{req.reason}</td>
                      <td className="py-4 text-right">
                        {req.status === "Approved" && (
                          <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                            Approved
                          </span>
                        )}
                        {req.status === "Pending" && (
                          <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                            Pending
                          </span>
                        )}
                        {req.status === "Rejected" && (
                          <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                            Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED MOVIE DIALOG OVERLAY */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-[#0A0A0B]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-white/5 rounded-3xl overflow-hidden max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-[fadeIn_0.2s_ease-out]">
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedMovie(null);
                setShowTrailer(false);
              }}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black text-text-secondary hover:text-white transition-all cursor-pointer border-0"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Banner */}
            <div className="relative h-64 bg-neutral-900">
              <img
                src={selectedMovie.img}
                alt="Banner"
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-[#121215]/40 to-transparent" />
              
              {/* Overlapping movie layout */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row gap-6 items-end">
                <div className="w-28 h-40 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-[#1A1A1E] shadow-2xl hidden sm:block">
                  <img src={selectedMovie.img} alt="Poster" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2 text-left flex-1">
                  <span className="px-2 py-0.5 rounded bg-gold text-black text-[9px] font-bold font-mono">
                    {selectedMovie.certificate || "UA"} Certificate
                  </span>
                  <h3 className="text-xl font-bold text-white font-display tracking-wide">{selectedMovie.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-text-secondary text-[11px] font-mono">
                    <span>Genre: <strong className="text-white">{selectedMovie.genre}</strong></span>
                    <span>Language: <strong className="text-white">{selectedMovie.lang}</strong></span>
                    <span>Duration: <strong className="text-gold">{selectedMovie.duration || "142 mins"}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Layout */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {/* Synopsis & Actions */}
              <div className="md:col-span-2 space-y-5">
                <div className="space-y-2">
                  <h4 className="font-bold text-white uppercase text-[10px] tracking-wider border-b border-white/5 pb-2">Synopsis & Storyline</h4>
                  <p className="text-text-secondary leading-relaxed text-[11px]">
                    {selectedMovie.title} delivers an unparalleled cinematic journey full of magnificent sequences, dynamic plot twist progressions, and superb background orchestration. A must-watch blockbuster!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px]">
                  <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl">
                    <span className="text-text-muted block text-[10px]">DISTRIBUTOR</span>
                    <strong className="text-white font-mono">{selectedMovie.distributor || "Universal Pictures Ltd"}</strong>
                  </div>
                  <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl">
                    <span className="text-text-muted block text-[10px]">POPULARITY / RATING</span>
                    <strong className="text-gold font-mono flex items-center gap-1">
                      ★ {selectedMovie.rating || "8.5"}/10 Audience Score
                    </strong>
                  </div>
                </div>

                {/* Director & Cast */}
                <div className="space-y-2">
                  <h4 className="font-bold text-white uppercase text-[10px] tracking-wider border-b border-white/5 pb-2">Creative Cast & Director</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="text-text-muted block">Director:</span>
                      <strong className="text-text-primary">S. S. Rajamouli / Prashanth Neel</strong>
                    </div>
                    <div>
                      <span className="text-text-muted block">Starring Cast:</span>
                      <strong className="text-text-primary">Prabhas, Amitabh Bachchan, Deepika Padukone</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Action Deck */}
              <div className="space-y-4">
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
                  <h4 className="font-bold text-white uppercase text-[10px] tracking-wider text-center">Theatre Operations</h4>
                  
                  {/* Trailer button */}
                  {!showTrailer ? (
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-text-primary rounded-xl font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 border-0 cursor-pointer"
                    >
                      <Play className="w-4 h-4 text-gold fill-gold" />
                      <span>Watch Trailer</span>
                    </button>
                  ) : (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center border border-white/10 relative">
                      <span className="text-[10px] text-text-muted font-mono p-4 text-center">
                        [Simulated 1080p Trailer Stream Active]
                      </span>
                      <button
                        onClick={() => setShowTrailer(false)}
                        className="absolute top-1 right-1 px-1 bg-red-500 text-white rounded text-[8px]"
                      >
                        Stop
                      </button>
                    </div>
                  )}

                  {/* Screening activation action */}
                  <button
                    onClick={() => {
                      setSelectedMovie(null);
                      showToastMsg(`"${selectedMovie.title}" activated for Screening! Schedule showtimes in the Shows tab.`);
                    }}
                    className="w-full py-3 bg-gold hover:bg-gold-light text-black rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border-0 shadow-lg shadow-gold/10 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Select for Screening</span>
                  </button>

                  <p className="text-[10px] text-text-muted leading-normal text-center">
                    Selecting this movie updates your cinema roster immediately. Ready to book on client-facing channels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
