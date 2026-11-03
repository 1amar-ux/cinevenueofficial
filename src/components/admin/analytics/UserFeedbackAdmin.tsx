import React, { useState, useEffect, useMemo } from "react";
import {
  Star,
  Search,
  Filter,
  RefreshCw,
  Download,
  Trash2,
  Film,
  Ticket,
  CheckCircle,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Sparkles,
  User,
  Calendar,
} from "lucide-react";
import { feedbackClient, FeedbackItem, FeedbackStats } from "../../../services/feedbackClient";

export default function UserFeedbackAdmin() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedRating, setSelectedRating] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async (silent: boolean = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [feedbacksRes, statsRes] = await Promise.all([
        feedbackClient.getFeedbacks({ limit: 100 }),
        feedbackClient.getFeedbackStats(),
      ]);

      setFeedbacks(feedbacksRes.items || []);
      setStats(statsRes);
    } catch (err) {
      console.error("Failed loading feedback admin data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((fb) => {
      // Type filter
      if (selectedType !== "ALL" && fb.bookingType !== selectedType) {
        return false;
      }

      // Rating filter
      if (selectedRating !== "ALL" && fb.rating !== Number(selectedRating)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesComment = fb.comment.toLowerCase().includes(q);
        const matchesBooking = fb.bookingId.toLowerCase().includes(q);
        const matchesUser =
          (fb.userName && fb.userName.toLowerCase().includes(q)) ||
          (fb.userEmail && fb.userEmail.toLowerCase().includes(q));
        const matchesTitle = fb.title && fb.title.toLowerCase().includes(q);

        if (!matchesComment && !matchesBooking && !matchesUser && !matchesTitle) {
          return false;
        }
      }

      return true;
    });
  }, [feedbacks, selectedType, selectedRating, searchQuery]);

  // Paginated items
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage) || 1;
  const paginatedFeedbacks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFeedbacks.slice(start, start + itemsPerPage);
  }, [filteredFeedbacks, currentPage]);

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm("Are you sure you want to permanently remove this feedback record?")) return;
    const ok = await feedbackClient.deleteFeedback(id);
    if (ok) {
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      showToast("Feedback record deleted successfully.");
      loadData(true);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (feedbacks.length === 0) {
      alert("No feedback records available to export.");
      return;
    }

    const headers = ["ID", "Booking ID", "Type", "Title", "Rating", "Comment", "User Name", "User Email", "Created At"];
    const rows = filteredFeedbacks.map((fb) => [
      `"${fb.id}"`,
      `"${fb.bookingId}"`,
      `"${fb.bookingType}"`,
      `"${fb.title || ""}"`,
      fb.rating,
      `"${fb.comment.replace(/"/g, '""')}"`,
      `"${fb.userName || ""}"`,
      `"${fb.userEmail || ""}"`,
      `"${fb.createdAt}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CineVenue_User_Feedback_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV report generated and downloaded.");
  };

  return (
    <div className="space-y-6 text-white text-left">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#D4AF37] text-black px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-slide-up">
          <CheckCircle className="w-4 h-4 text-black" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              <span>User Feedback & Reviews</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                LIVE ANALYTICS
              </span>
            </h2>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Real-time customer satisfaction scores and reviews collected post-booking for Movies and Events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#D4AF37]" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:brightness-110 text-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/15"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Average */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl p-4.5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/10 blur-xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between text-text-muted text-xs font-semibold uppercase tracking-wider">
            <span>Overall Rating</span>
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {stats ? stats.averageRating.toFixed(1) : "5.0"}
            </span>
            <span className="text-xs text-text-muted font-medium">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= Math.round(stats?.averageRating || 5)
                    ? "fill-[#D4AF37] text-[#D4AF37]"
                    : "fill-transparent text-white/20"
                }`}
              />
            ))}
            <span className="text-[11px] text-[#D4AF37] font-semibold ml-1.5">
              {stats ? `${stats.satisfactionPercentage}% positive` : "100% positive"}
            </span>
          </div>
        </div>

        {/* Card 2: Total Reviews */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl p-4.5 space-y-3">
          <div className="flex items-center justify-between text-text-muted text-xs font-semibold uppercase tracking-wider">
            <span>Total Feedbacks</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">
            {stats ? stats.total : feedbacks.length}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Captured post-booking checkout</span>
          </div>
        </div>

        {/* Card 3: Movie Bookings */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl p-4.5 space-y-3">
          <div className="flex items-center justify-between text-text-muted text-xs font-semibold uppercase tracking-wider">
            <span>Movie Feedbacks</span>
            <Film className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white tracking-tight">
              {stats ? stats.movieCount : 0}
            </span>
            <span className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-lg border border-[#D4AF37]/20">
              {stats ? stats.movieAverage.toFixed(1) : "5.0"} ★
            </span>
          </div>
          <div className="text-[11px] text-text-secondary">
            Cinemas & Multiplexes
          </div>
        </div>

        {/* Card 4: Event Bookings */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl p-4.5 space-y-3">
          <div className="flex items-center justify-between text-text-muted text-xs font-semibold uppercase tracking-wider">
            <span>Event Feedbacks</span>
            <Ticket className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white tracking-tight">
              {stats ? stats.eventCount : 0}
            </span>
            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
              {stats ? stats.eventAverage.toFixed(1) : "5.0"} ★
            </span>
          </div>
          <div className="text-[11px] text-text-secondary">
            Concerts, Galas & Shows
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121214] border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by customer name, email, booking ID, movie or review text..."
              className="w-full bg-black/40 border border-white/10 focus:border-[#D4AF37] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 outline-none transition-colors"
            />
          </div>

          {/* Booking Type Filter */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            {[
              { id: "ALL", label: "All Types" },
              { id: "MOVIE", label: "Movies" },
              { id: "EVENT", label: "Events" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelectedType(t.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedType === t.id
                    ? "bg-[#D4AF37] text-black shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            {[
              { id: "ALL", label: "All Stars" },
              { id: "5", label: "5 ★" },
              { id: "4", label: "4 ★" },
              { id: "3", label: "3 ★" },
              { id: "2", label: "2 ★" },
              { id: "1", label: "1 ★" },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setSelectedRating(r.id);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedRating === r.id
                    ? "bg-[#D4AF37] text-black shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Table View */}
      <div className="bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <span>Feedback Entries</span>
            <span className="text-[11px] font-mono text-text-muted">
              ({filteredFeedbacks.length} found)
            </span>
          </div>

          {filteredFeedbacks.length > 0 && (
            <div className="text-xs text-text-muted">
              Showing {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, filteredFeedbacks.length)} of {filteredFeedbacks.length}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-text-muted">Loading user feedbacks...</p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/40">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white">No feedbacks match your filters</h4>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Try adjusting your search criteria, selecting "All Types", or resetting the star rating filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedType("ALL");
                setSelectedRating("ALL");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="text-xs text-[#D4AF37] hover:underline font-semibold cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-text-muted font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Booking</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Review Opinion</th>
                  <th className="py-3.5 px-4">Submitted At</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedFeedbacks.map((fb) => {
                  const isMovie = fb.bookingType === "MOVIE";
                  const dateFormatted = new Date(fb.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={fb.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Customer Info */}
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {fb.userName ? fb.userName.charAt(0).toUpperCase() : <User className="w-4 h-4 text-white/60" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate max-w-[140px]">
                              {fb.userName || "Valued Patron"}
                            </div>
                            <div className="text-[11px] text-text-muted font-mono truncate max-w-[140px]">
                              {fb.userEmail || "guest@checkout"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Booking Info */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isMovie
                                  ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                                  : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {isMovie ? <Film className="w-2.5 h-2.5" /> : <Ticket className="w-2.5 h-2.5" />}
                              <span>{fb.bookingType}</span>
                            </span>
                            <span className="font-mono text-[11px] font-bold text-white/90">
                              #{fb.bookingId}
                            </span>
                          </div>
                          {fb.title && (
                            <div className="text-[11px] text-text-secondary truncate max-w-[180px]">
                              {fb.title}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Rating Stars */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= fb.rating
                                    ? "fill-[#D4AF37] text-[#D4AF37]"
                                    : "fill-transparent text-white/20"
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-[10px] font-mono font-bold text-[#D4AF37]">
                            {fb.rating}.0 / 5.0
                          </div>
                        </div>
                      </td>

                      {/* Comments */}
                      <td className="py-4 px-4 align-top max-w-xs">
                        <div className="text-xs text-white/90 leading-relaxed break-words">
                          {fb.comment ? (
                            <span>{fb.comment}</span>
                          ) : (
                            <span className="italic text-white/30">Star rating only (no written comment)</span>
                          )}
                        </div>
                      </td>

                      {/* Submitted At */}
                      <td className="py-4 px-4 align-top whitespace-nowrap text-text-muted text-[11px] font-mono">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-white/40" />
                          <span>{dateFormatted}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-top text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteFeedback(fb.id)}
                          className="w-7 h-7 rounded-lg hover:bg-rose-500/20 text-white/40 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer ml-auto border border-transparent hover:border-rose-500/30"
                          title="Delete Feedback Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold cursor-pointer transition-colors"
            >
              Previous
            </button>

            <span className="text-text-muted font-mono">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold cursor-pointer transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
