/**
 * CineVenue Client Feedback Service
 * Handles submitting and fetching post-booking user feedback and ratings.
 */

import apiClient from "./apiClient";

export interface FeedbackItem {
  id: string;
  userId?: string | null;
  bookingId: string;
  bookingType: "MOVIE" | "EVENT";
  rating: number;
  comment: string;
  userEmail?: string | null;
  userName?: string | null;
  title?: string | null;
  createdAt: string;
}

export interface CreateFeedbackPayload {
  userId?: string | null;
  bookingId: string;
  bookingType: "MOVIE" | "EVENT" | string;
  rating: number;
  comment?: string;
  userEmail?: string | null;
  userName?: string | null;
  title?: string | null;
}

export interface FeedbackStats {
  total: number;
  averageRating: number;
  movieCount: number;
  movieAverage: number;
  eventCount: number;
  eventAverage: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  satisfactionPercentage: number;
}

const LOCAL_STORAGE_KEY_PREFIX = "cine_feedback_handled_";
const LOCAL_BACKUP_STORAGE = "cine_user_feedbacks_local";

class FeedbackClient {
  /**
   * Check whether feedback for this booking has already been given or skipped
   */
  public isFeedbackHandled(bookingId: string): boolean {
    if (!bookingId) return true;
    try {
      return localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${bookingId}`) === "true";
    } catch {
      return false;
    }
  }

  /**
   * Mark feedback handled for a specific booking
   */
  public markFeedbackHandled(bookingId: string): void {
    if (!bookingId) return;
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${bookingId}`, "true");
    } catch {}
  }

  /**
   * Submit post-booking feedback
   */
  public async submitFeedback(payload: CreateFeedbackPayload): Promise<{ success: boolean; data?: any; error?: string }> {
    this.markFeedbackHandled(payload.bookingId);

    try {
      const response = await apiClient.post("/api/feedback", payload);
      if (response.data && response.data.success) {
        return { success: true, data: response.data.data };
      }
    } catch (err: any) {
      console.warn("Feedback API network call fallback:", err?.message || err);
    }

    // Local resilience backup
    const localItem: FeedbackItem = {
      id: `local-fb-${Date.now()}`,
      userId: payload.userId || null,
      bookingId: payload.bookingId,
      bookingType: payload.bookingType === "EVENT" ? "EVENT" : "MOVIE",
      rating: payload.rating,
      comment: payload.comment || "",
      userEmail: payload.userEmail || null,
      userName: payload.userName || null,
      title: payload.title || null,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_BACKUP_STORAGE) || "[]");
      existing.unshift(localItem);
      localStorage.setItem(LOCAL_BACKUP_STORAGE, JSON.stringify(existing.slice(0, 100)));
    } catch {}

    return { success: true, data: localItem };
  }

  /**
   * Fetch feedback list with filters
   */
  public async getFeedbacks(options: {
    rating?: number | string;
    bookingType?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    items: FeedbackItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (options.rating && options.rating !== "ALL") params.append("rating", String(options.rating));
      if (options.bookingType && options.bookingType !== "ALL") params.append("bookingType", options.bookingType);
      if (options.search) params.append("search", options.search);
      if (options.page) params.append("page", String(options.page));
      if (options.limit) params.append("limit", String(options.limit));

      const res = await apiClient.get(`/api/feedback?${params.toString()}`);
      if (res.data && res.data.success) {
        return {
          items: res.data.items || [],
          total: res.data.total || 0,
          page: res.data.page || 1,
          limit: res.data.limit || 20,
          totalPages: res.data.totalPages || 1,
        };
      }
    } catch (err) {
      console.warn("Failed to fetch feedback from server:", err);
    }

    // Local fallback
    try {
      const local = JSON.parse(localStorage.getItem(LOCAL_BACKUP_STORAGE) || "[]") as FeedbackItem[];
      return {
        items: local,
        total: local.length,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
    } catch {
      return { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
    }
  }

  /**
   * Fetch feedback statistical overview
   */
  public async getFeedbackStats(): Promise<FeedbackStats> {
    try {
      const res = await apiClient.get("/api/feedback/stats");
      if (res.data && res.data.success && res.data.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn("Failed to fetch feedback stats from server:", err);
    }

    return {
      total: 0,
      averageRating: 0,
      movieCount: 0,
      movieAverage: 0,
      eventCount: 0,
      eventAverage: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      satisfactionPercentage: 0,
    };
  }

  /**
   * Delete feedback item
   */
  public async deleteFeedback(id: string): Promise<boolean> {
    try {
      const res = await apiClient.delete(`/api/feedback/${id}`);
      return Boolean(res.data?.success);
    } catch (err) {
      console.warn("Failed to delete feedback:", err);
      return false;
    }
  }
}

export const feedbackClient = new FeedbackClient();

