import React, { useState } from "react";
import { Star, X, CheckCircle, MessageSquareHeart, Film, Ticket, Sparkles } from "lucide-react";
import { feedbackClient } from "../../services/feedbackClient";

export interface PostBookingFeedbackModalProps {
  isOpen: boolean;
  bookingId: string;
  bookingType: "MOVIE" | "EVENT";
  title?: string;
  userEmail?: string | null;
  userName?: string | null;
  userId?: string | null;
  onClose: () => void;
}

const RATING_LABELS: Record<number, { text: string; color: string }> = {
  1: { text: "Poor — Needs Work", color: "text-rose-400" },
  2: { text: "Fair — Could Be Better", color: "text-amber-400" },
  3: { text: "Good — Satisfactory", color: "text-yellow-400" },
  4: { text: "Very Good — Liked It!", color: "text-emerald-400" },
  5: { text: "Excellent — Outstanding!", color: "text-[#D4AF37]" },
};

const QUICK_TAGS = [
  "⚡ Instant Confirmation",
  "💳 Smooth Payment",
  "🪑 Easy Seat Selection",
  "🎟️ Clear Pass Preview",
  "💎 Transparent Pricing",
  "🚀 Fast App Experience",
];

export default function PostBookingFeedbackModal({
  isOpen,
  bookingId,
  bookingType,
  title,
  userEmail,
  userName,
  userId,
  onClose,
}: PostBookingFeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentRating = hoverRating || rating;
  const activeRatingInfo = RATING_LABELS[currentRating] || RATING_LABELS[5];

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSkip = () => {
    feedbackClient.markFeedbackHandled(bookingId);
    onClose();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting || isSuccess) return;

    setIsSubmitting(true);

    // Combine tags and custom comment if tags are selected
    let finalComment = comment.trim();
    if (selectedTags.length > 0) {
      const tagsString = selectedTags.join(", ");
      finalComment = finalComment
        ? `[${tagsString}] ${finalComment}`
        : `[${tagsString}]`;
    }

    try {
      await feedbackClient.submitFeedback({
        bookingId,
        bookingType,
        rating,
        comment: finalComment,
        userEmail: userEmail || null,
        userName: userName || null,
        userId: userId || null,
        title: title || null,
      });

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch {
      feedbackClient.markFeedbackHandled(bookingId);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) handleSkip();
      }}
    >
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#18181B] to-[#0E0E11] text-white rounded-3xl border border-[#D4AF37]/30 shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Subtle Ambient Gold Glow Top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#D4AF37]/15 blur-2xl pointer-events-none rounded-full" />

        {/* Close / Skip button */}
        <button
          type="button"
          onClick={handleSkip}
          disabled={isSubmitting}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/5"
          title="Skip"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-10 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Thank You for Your Feedback!
              </h3>
              <p className="text-xs text-text-secondary max-w-xs mx-auto">
                Your review helps us craft the ultimate cinematic and live entertainment experience on CineVenue.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-medium font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Returning to dashboard...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div className="text-center space-y-1.5 pt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider">
                {bookingType === "MOVIE" ? (
                  <Film className="w-3 h-3 text-[#D4AF37]" />
                ) : (
                  <Ticket className="w-3 h-3 text-[#D4AF37]" />
                )}
                <span>{bookingType} Ticket Confirmed</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                How was your booking experience?
              </h2>

              {title && (
                <p className="text-xs text-text-secondary line-clamp-1 max-w-xs mx-auto">
                  {title}
                </p>
              )}
            </div>

            {/* Interactive 5-Star Rating Selector */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center space-y-2.5">
              <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = starVal <= currentRating;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 rounded-lg hover:scale-125 transition-transform duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
                      aria-label={`${starVal} Star`}
                    >
                      <Star
                        className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors duration-150 ${
                          isFilled
                            ? "fill-[#D4AF37] text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]"
                            : "fill-transparent text-white/20 hover:text-white/40"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className={`text-xs font-semibold tracking-wide transition-colors ${activeRatingInfo.color}`}>
                {activeRatingInfo.text}
              </div>
            </div>

            {/* Quick Experience Tags */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                Quick Highlights
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                        isSelected
                          ? "bg-[#D4AF37]/20 border-[#D4AF37] text-white"
                          : "bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comments / Description box */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center justify-between">
                <span>Tell us more (Optional)</span>
                <span className="text-[10px] text-white/40">{comment.length}/300</span>
              </label>
              <textarea
                value={comment}
                maxLength={300}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you loved or how we can improve..."
                rows={3}
                className="w-full bg-black/50 border border-white/10 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl p-3 text-xs text-white placeholder-white/30 resize-none transition-all outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#DFBF58] to-[#B89628] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <MessageSquareHeart className="w-4 h-4 text-black" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="w-full py-2.5 text-center text-xs font-semibold text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                Skip for now
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

