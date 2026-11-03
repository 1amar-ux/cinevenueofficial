/**
 * CineVenue Post-Booking User Feedback Service
 *
 * Single Source of Truth for collecting, validating, persisting,
 * and analyzing user feedback across Movie and Event Bookings.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { prisma } from "../config/database";
import { logger } from "../shared/logger";
import { ValidationError, NotFoundError } from "../shared/errors";

export interface FeedbackItem {
  id: string;
  userId?: string | null;
  bookingId: string;
  bookingType: "MOVIE" | "EVENT";
  rating: number; // 1 to 5
  comment: string;
  userEmail?: string | null;
  userName?: string | null;
  title?: string | null;
  createdAt: string;
}

export interface CreateFeedbackInput {
  userId?: string | null;
  bookingId: string;
  bookingType: "MOVIE" | "EVENT" | string;
  rating: number;
  comment?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  title?: string | null;
}

export interface FeedbackFilterOptions {
  rating?: number | string;
  bookingType?: string;
  search?: string;
  page?: number | string;
  limit?: number | string;
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

const STORAGE_FILE = path.join(process.cwd(), "server/config/user_feedback.json");
const TMP_STORAGE_FILE = path.join("/tmp", "user_feedback.json");

const SEED_FEEDBACKS: FeedbackItem[] = [
  {
    id: "fb-seed-001",
    userId: null,
    bookingId: "BK-829104",
    bookingType: "MOVIE",
    rating: 5,
    comment: "Seamless seat selection and instant UPI payment! The QR ticket loaded immediately in the Android app.",
    userEmail: "sarah.m@gmail.com",
    userName: "Sarah Mukherjee",
    title: "The Raja Saab (Telugu - IMAX)",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "fb-seed-002",
    userId: null,
    bookingId: "BK-829012",
    bookingType: "MOVIE",
    rating: 5,
    comment: "Super smooth checkout, loved the transparent tax and convenience fee breakdown. Best cinema booking experience.",
    userEmail: "kiran.dev@cinepatron.com",
    userName: "Kiran Dev",
    title: "Varanasi Vibes (Standard 2D)",
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "fb-seed-003",
    userId: null,
    bookingId: "EVT-REG-7712",
    bookingType: "EVENT",
    rating: 4,
    comment: "Got our VIP gala passes smoothly. Looking forward to the music festival. Download pass button was instant.",
    userEmail: "rohit.sharma@outlook.com",
    userName: "Rohit Sharma",
    title: "Arijit Singh Symphony Night 2026",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "fb-seed-004",
    userId: null,
    bookingId: "EVT-REG-6601",
    bookingType: "EVENT",
    rating: 5,
    comment: "The live pass preview with anti-tamper barcode was incredible. Loved the CineCoins redemption feature at checkout!",
    userEmail: "priya.nair@yahoo.com",
    userName: "Priya Nair",
    title: "Standup Comedy Fest - Bangalore",
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    id: "fb-seed-005",
    userId: null,
    bookingId: "BK-828940",
    bookingType: "MOVIE",
    rating: 4,
    comment: "Good experience overall. Clean UI and fast payment gateway redirect.",
    userEmail: "arun.verma@gmail.com",
    userName: "Arun Verma",
    title: "Thunderbolt 4K ATMOS",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export class FeedbackService {
  private static dbConnected: boolean | null = null;
  private static lastDbCheck: number = 0;

  private feedbacks: FeedbackItem[] = [];
  private isLoadedFromStorage = false;

  constructor() {
    this.loadFromStorage();
  }

  private isDbHealthy(): boolean {
    if (FeedbackService.dbConnected === false) {
      if (Date.now() - FeedbackService.lastDbCheck < 30000) {
        return false;
      }
    }
    return true;
  }

  private markDbOffline(err?: any) {
    FeedbackService.dbConnected = false;
    FeedbackService.lastDbCheck = Date.now();
  }

  private markDbOnline() {
    FeedbackService.dbConnected = true;
  }

  private loadFromStorage(): void {
    try {
      // 1. Try reading from /tmp (serverless persistence)
      if (fs.existsSync(TMP_STORAGE_FILE)) {
        const raw = fs.readFileSync(TMP_STORAGE_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.feedbacks = parsed;
          this.isLoadedFromStorage = true;
          return;
        }
      }

      // 2. Try reading from server/config
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.feedbacks = parsed;
          this.isLoadedFromStorage = true;
          return;
        }
      }
    } catch (e: any) {
      logger.warn(`Failed reading stored feedback items: ${e.message}`);
    }

    // Default initialization with seed data
    this.feedbacks = [...SEED_FEEDBACKS];
    this.persistToStorage();
    this.isLoadedFromStorage = true;
  }

  private persistToStorage(): void {
    try {
      const payload = JSON.stringify(this.feedbacks, null, 2);
      try {
        const dir = path.dirname(STORAGE_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(STORAGE_FILE, payload, "utf-8");
      } catch (e) {}

      try {
        fs.writeFileSync(TMP_STORAGE_FILE, payload, "utf-8");
      } catch (e) {}
    } catch (err: any) {
      logger.warn(`Failed persisting feedback items to storage: ${err.message}`);
    }
  }

  // Synchronize from database if reachable
  public async syncFromDatabase(): Promise<void> {
    if (!this.isDbHealthy()) return;
    try {
      if ((prisma as any).userFeedback?.findMany) {
        const dbItems = await (prisma as any).userFeedback.findMany({
          orderBy: { createdAt: "desc" },
          take: 500,
        });

        if (Array.isArray(dbItems) && dbItems.length > 0) {
          this.markDbOnline();
          this.feedbacks = dbItems.map((item: any) => ({
            id: item.id,
            userId: item.userId || null,
            bookingId: item.bookingId,
            bookingType: (item.bookingType || "MOVIE").toUpperCase() as "MOVIE" | "EVENT",
            rating: Number(item.rating),
            comment: item.comment || "",
            userEmail: item.userEmail || null,
            userName: item.userName || null,
            title: item.title || null,
            createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
          }));
          this.persistToStorage();
        }
      }
    } catch (e: any) {
      this.markDbOffline(e);
    }
  }

  /**
   * Create new user feedback
   */
  public async createFeedback(input: CreateFeedbackInput): Promise<FeedbackItem> {
    // 1. Validation
    const rating = Math.round(Number(input.rating));
    if (isNaN(rating) || rating < 1 || rating > 5) {
      throw new ValidationError("Rating must be an integer between 1 and 5 stars");
    }

    if (!input.bookingId || typeof input.bookingId !== "string" || !input.bookingId.trim()) {
      throw new ValidationError("Valid booking ID is required");
    }

    const bookingTypeStr = String(input.bookingType || "MOVIE").toUpperCase();
    const bookingType: "MOVIE" | "EVENT" = bookingTypeStr === "EVENT" ? "EVENT" : "MOVIE";

    const comment = String(input.comment || "").trim();
    const id = `fb-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`;
    const createdAt = new Date().toISOString();

    const newFeedback: FeedbackItem = {
      id,
      userId: input.userId || null,
      bookingId: input.bookingId.trim(),
      bookingType,
      rating,
      comment,
      userEmail: input.userEmail ? input.userEmail.trim() : null,
      userName: input.userName ? input.userName.trim() : null,
      title: input.title ? input.title.trim() : null,
      createdAt,
    };

    // Store in-memory and write to disk
    // If feedback for this exact bookingId already exists from this session, update it; otherwise unshift
    const existingIdx = this.feedbacks.findIndex((f) => f.bookingId === newFeedback.bookingId);
    if (existingIdx !== -1) {
      this.feedbacks[existingIdx] = { ...this.feedbacks[existingIdx], ...newFeedback };
    } else {
      this.feedbacks.unshift(newFeedback);
    }
    this.persistToStorage();

    // 2. Persist to DB if connected
    if (this.isDbHealthy()) {
      try {
        if ((prisma as any).userFeedback?.create) {
          await (prisma as any).userFeedback.create({
            data: {
              id: newFeedback.id,
              userId: newFeedback.userId,
              bookingId: newFeedback.bookingId,
              bookingType: newFeedback.bookingType,
              rating: newFeedback.rating,
              comment: newFeedback.comment,
              userEmail: newFeedback.userEmail,
              userName: newFeedback.userName,
              title: newFeedback.title,
            },
          });
          this.markDbOnline();
        }
      } catch (err: any) {
        this.markDbOffline(err);
        logger.warn(`Database userFeedback create fallback: ${err.message}`);
      }
    }

    return newFeedback;
  }

  /**
   * Get filtered feedbacks with pagination
   */
  public async getFeedbacks(options: FeedbackFilterOptions = {}): Promise<{
    items: FeedbackItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    await this.syncFromDatabase();

    let list = [...this.feedbacks];

    // Filter by Rating
    if (options.rating !== undefined && options.rating !== null && options.rating !== "ALL" && options.rating !== "") {
      const targetRating = Number(options.rating);
      if (!isNaN(targetRating) && targetRating >= 1 && targetRating <= 5) {
        list = list.filter((f) => f.rating === targetRating);
      }
    }

    // Filter by Booking Type
    if (options.bookingType && options.bookingType !== "ALL") {
      const type = options.bookingType.toUpperCase();
      list = list.filter((f) => f.bookingType === type);
    }

    // Filter by Search Query
    if (options.search && typeof options.search === "string" && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      list = list.filter((f) => {
        return (
          f.comment.toLowerCase().includes(q) ||
          f.bookingId.toLowerCase().includes(q) ||
          (f.userEmail && f.userEmail.toLowerCase().includes(q)) ||
          (f.userName && f.userName.toLowerCase().includes(q)) ||
          (f.title && f.title.toLowerCase().includes(q))
        );
      });
    }

    // Sort by latest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const page = Math.max(1, Number(options.page || 1));
    const limit = Math.max(1, Math.min(100, Number(options.limit || 20)));
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get feedback statistical analytics
   */
  public async getFeedbackStats(): Promise<FeedbackStats> {
    await this.syncFromDatabase();

    const list = this.feedbacks;
    const total = list.length;

    if (total === 0) {
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

    const ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;
    let movieCount = 0;
    let movieSum = 0;
    let eventCount = 0;
    let eventSum = 0;
    let satisfiedCount = 0;

    for (const fb of list) {
      const r = Math.max(1, Math.min(5, Math.round(fb.rating))) as 1 | 2 | 3 | 4 | 5;
      ratingDistribution[r] = (ratingDistribution[r] || 0) + 1;
      ratingSum += fb.rating;

      if (fb.rating >= 4) {
        satisfiedCount++;
      }

      if (fb.bookingType === "MOVIE") {
        movieCount++;
        movieSum += fb.rating;
      } else if (fb.bookingType === "EVENT") {
        eventCount++;
        eventSum += fb.rating;
      }
    }

    const averageRating = Math.round((ratingSum / total) * 10) / 10;
    const movieAverage = movieCount > 0 ? Math.round((movieSum / movieCount) * 10) / 10 : 0;
    const eventAverage = eventCount > 0 ? Math.round((eventSum / eventCount) * 10) / 10 : 0;
    const satisfactionPercentage = Math.round((satisfiedCount / total) * 100);

    return {
      total,
      averageRating,
      movieCount,
      movieAverage,
      eventCount,
      eventAverage,
      ratingDistribution,
      satisfactionPercentage,
    };
  }

  /**
   * Delete feedback by ID (Admin)
   */
  public async deleteFeedback(id: string): Promise<boolean> {
    const idx = this.feedbacks.findIndex((f) => f.id === id);
    if (idx !== -1) {
      this.feedbacks.splice(idx, 1);
      this.persistToStorage();
    }

    if (this.isDbHealthy()) {
      try {
        if ((prisma as any).userFeedback?.delete) {
          await (prisma as any).userFeedback.delete({ where: { id } });
          this.markDbOnline();
        }
      } catch (err: any) {
        this.markDbOffline(err);
      }
    }

    return true;
  }
}

export const feedbackService = new FeedbackService();
