import fs from "fs";
import path from "path";
import { prisma } from "../config/database";
import { logger } from "../shared/logger";
import { realtimeHub } from "./realtimeHub";

export interface BannerRecord {
  id: string;
  title: string;
  active: boolean;
  clicks: number;
  type: string;
  imageUrl?: string;
  linkUrl?: string;
  targetAudience?: string;
  updatedAt: string;
  version: number;
}

export interface CouponRecord {
  id: string;
  code: string;
  discount: number;
  minAmount: number;
  expires: string;
  active: boolean;
  claims: number;
  updatedAt: string;
  version: number;
}

export interface ReviewRecord {
  id: string;
  user: string;
  movie: string;
  rating: number;
  comment: string;
  status: "Approved" | "Flagged" | "Pending";
  updatedAt: string;
  version: number;
}

export interface SupportTicketRecord {
  id: string;
  customer: string;
  title: string;
  status: "Open" | "In-Progress" | "Resolved";
  priority: "High" | "Medium" | "Low";
  date: string;
  updatedAt: string;
  version: number;
}

export interface SpotlightRecord {
  title: string;
  rating: number;
  votes: string;
  genre: string;
  duration: string;
  language: string;
  description: string;
  image: string;
  badge: string;
  releaseDate: string;
  formats: string[];
  showtimes: string[];
  updatedAt?: string;
  version?: number;
}

export interface FeatureTogglesRecord {
  isMovieBookingSystemActive: boolean;
  isEventBookingSystemActive: boolean;
  isCineCoinsActive: boolean;
  isRentalSystemActive: boolean;
  isFoodOrderingActive: boolean;
  version: number;
  updatedAt: string;
}

export interface BroadcastNotificationRecord {
  id: string;
  title: string;
  message: string;
  type: string;
  target: string;
  date: string;
  createdAt: string;
}

export interface GlobalSyncStore {
  syncVersion: number;
  lastSyncedAt: string;
  banners: BannerRecord[];
  coupons: CouponRecord[];
  reviews: ReviewRecord[];
  supportTickets: SupportTicketRecord[];
  cities: string[];
  spotlight: SpotlightRecord;
  featureToggles: FeatureTogglesRecord;
  recentBroadcasts: BroadcastNotificationRecord[];
  changelog: Array<{
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    version: number;
    timestamp: string;
  }>;
}

const STORE_PATH = path.resolve(process.cwd(), "server/config/global_admin_store.json");

function loadStore(): GlobalSyncStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err: any) {
    logger.warn(`[GlobalSyncService] Error reading store from disk, initializing fallback: ${err.message}`);
  }

  return {
    syncVersion: 1,
    lastSyncedAt: new Date().toISOString(),
    banners: [],
    coupons: [],
    reviews: [],
    supportTickets: [],
    cities: ["Hyderabad", "Bangalore", "Mumbai"],
    spotlight: {
      title: "Kalki 2898 AD",
      rating: 9.2,
      votes: "184.2K",
      genre: "Sci-Fi / Epic",
      duration: "3h 01m",
      language: "Telugu, Hindi",
      description: "Epic action",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1",
      badge: "BLOCKBUSTER",
      releaseDate: "Now Showing",
      formats: ["IMAX 3D", "2D"],
      showtimes: ["10:30 AM", "7:30 PM"]
    },
    featureToggles: {
      isMovieBookingSystemActive: true,
      isEventBookingSystemActive: true,
      isCineCoinsActive: true,
      isRentalSystemActive: true,
      isFoodOrderingActive: true,
      version: 1,
      updatedAt: new Date().toISOString()
    },
    recentBroadcasts: [],
    changelog: []
  };
}

function saveStore(store: GlobalSyncStore) {
  try {
    store.syncVersion += 1;
    store.lastSyncedAt = new Date().toISOString();

    // Cap changelog size
    if (store.changelog && store.changelog.length > 500) {
      store.changelog = store.changelog.slice(0, 500);
    }

    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err: any) {
    logger.error(`[GlobalSyncService] Failed to persist store to disk: ${err.message}`);
  }
}

class GlobalSyncService {
  private memoryStore: GlobalSyncStore = loadStore();

  constructor() {
    this.initDatabaseSync();
  }

  /**
   * Attempt to sync with DB on startup if available
   */
  private async initDatabaseSync() {
    try {
      if ((prisma as any).platformSetting) {
        const setting = await (prisma as any).platformSetting.findUnique({
          where: { key: "global_admin_sync_store" }
        });
        if (setting && setting.value) {
          const parsed = JSON.parse(setting.value);
          if (parsed.syncVersion > this.memoryStore.syncVersion) {
            this.memoryStore = parsed;
            logger.info(`[GlobalSyncService] Hydrated store from database setting (v${parsed.syncVersion})`);
          }
        }
      }
    } catch (e) {}
  }

  /**
   * Save store to disk and asynchronously to DB setting
   */
  private async commit(entityType: string, entityId: string, action: "CREATED" | "UPDATED" | "DELETED" | "STATUS_CHANGED", payload: any, actorEmail: string = "system@cinevenue.com", isPrivate: boolean = false) {
    saveStore(this.memoryStore);

    // Record changelog entry
    const changeEntry = {
      id: `chg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      entityType,
      entityId,
      action,
      version: this.memoryStore.syncVersion,
      timestamp: new Date().toISOString()
    };
    this.memoryStore.changelog.unshift(changeEntry);

    // Save to DB setting asynchronously
    try {
      if ((prisma as any).platformSetting) {
        await (prisma as any).platformSetting.upsert({
          where: { key: "global_admin_sync_store" },
          update: {
            value: JSON.stringify(this.memoryStore),
            updatedAt: new Date()
          },
          create: {
            key: "global_admin_sync_store",
            value: JSON.stringify(this.memoryStore),
            description: "Authoritative synchronized admin state"
          }
        });
      }
    } catch (e) {}

    // Dispatch real-time event to all connected devices after successful commit
    realtimeHub.broadcastUpdate({
      entityType,
      action,
      entityId,
      data: payload,
      version: this.memoryStore.syncVersion,
      timestamp: changeEntry.timestamp,
      actorEmail,
      isPrivate
    });

    return {
      success: true,
      syncVersion: this.memoryStore.syncVersion,
      timestamp: changeEntry.timestamp
    };
  }

  // -------------------------------------------------------------
  // GETTERS: PUBLIC & ADMIN PARTITIONING
  // -------------------------------------------------------------

  /**
   * Return full administrative state (Super Admin & Admin sessions)
   */
  public getAdminState() {
    this.memoryStore = loadStore();
    return {
      syncVersion: this.memoryStore.syncVersion,
      lastSyncedAt: this.memoryStore.lastSyncedAt,
      banners: this.memoryStore.banners,
      coupons: this.memoryStore.coupons,
      reviews: this.memoryStore.reviews,
      supportTickets: this.memoryStore.supportTickets,
      cities: this.memoryStore.cities,
      spotlight: this.memoryStore.spotlight,
      featureToggles: this.memoryStore.featureToggles,
      recentBroadcasts: this.memoryStore.recentBroadcasts
    };
  }

  /**
   * Return sanitized public state (Website & Mobile App public view)
   */
  public getPublicState() {
    this.memoryStore = loadStore();
    return {
      syncVersion: this.memoryStore.syncVersion,
      lastSyncedAt: this.memoryStore.lastSyncedAt,
      // Public only sees active promotional banners
      banners: this.memoryStore.banners.filter((b) => b.active),
      // Public only sees approved reviews
      reviews: this.memoryStore.reviews.filter((r) => r.status === "Approved"),
      cities: this.memoryStore.cities,
      spotlight: this.memoryStore.spotlight,
      featureToggles: this.memoryStore.featureToggles,
      // Public only receives public broadcast announcements
      recentBroadcasts: this.memoryStore.recentBroadcasts.slice(0, 5)
    };
  }

  /**
   * Incremental Delta Sync since timestamp or version
   */
  public getDelta(since?: string | number, sinceVersionParam?: number, isAdmin: boolean = false) {
    this.memoryStore = loadStore();
    
    let targetVersion = typeof since === "number" ? since : sinceVersionParam;
    let isStale = false;
    if (targetVersion !== undefined && targetVersion < this.memoryStore.syncVersion) {
      isStale = true;
    }

    const relevantChanges = this.memoryStore.changelog.filter((c) => {
      if (targetVersion !== undefined) {
        return c.version > targetVersion;
      }
      if (typeof since === "string") {
        return c.timestamp > since;
      }
      return true;
    });

    const state = isAdmin ? this.getAdminState() : this.getPublicState();
    return {
      isStale,
      currentVersion: this.memoryStore.syncVersion,
      lastSyncedAt: this.memoryStore.lastSyncedAt,
      changes: relevantChanges,
      state
    };
  }

  // -------------------------------------------------------------
  // BANNERS MANAGEMENT
  // -------------------------------------------------------------

  public async createBanner(bannerData: Omit<BannerRecord, "id"> & { id?: string }, clientVersion?: number, actorEmail?: string) {
    const id = bannerData.id || `ban_${Date.now()}`;
    return this.updateBanner({ ...bannerData, id }, clientVersion, actorEmail);
  }

  public async updateBanner(bannerData: Partial<BannerRecord> & { id: string; clientVersion?: number }, clientVersionParam?: number, actorEmail?: string) {
    this.memoryStore = loadStore();
    const clientVersion = clientVersionParam !== undefined ? clientVersionParam : (bannerData as any).clientVersion;
    const index = this.memoryStore.banners.findIndex((b) => b.id === bannerData.id);

    if (index >= 0) {
      const existing = this.memoryStore.banners[index];
      // Concurrency protection: prevent simultaneous edits from silently overwriting newer data
      if (clientVersion !== undefined && (clientVersion < existing.version || clientVersion < this.memoryStore.syncVersion)) {
        throw new Error(`CONFLICT_DETECTED: Banner was modified by another session (v${existing.version}). Please refresh.`);
      }

      const updated: BannerRecord = {
        ...existing,
        ...bannerData,
        version: existing.version + 1,
        updatedAt: new Date().toISOString()
      };
      this.memoryStore.banners[index] = updated;

      await this.commit("BANNER", updated.id, "UPDATED", updated, actorEmail, false);
      return updated;
    } else {
      const newBanner: BannerRecord = {
        id: bannerData.id,
        title: bannerData.title || "New Promotional Campaign",
        active: bannerData.active !== undefined ? bannerData.active : true,
        clicks: bannerData.clicks || 0,
        type: bannerData.type || "Wide Slider",
        imageUrl: bannerData.imageUrl,
        linkUrl: bannerData.linkUrl,
        targetAudience: bannerData.targetAudience || "All Users",
        updatedAt: new Date().toISOString(),
        version: 1
      };
      this.memoryStore.banners.unshift(newBanner);

      await this.commit("BANNER", newBanner.id, "CREATED", newBanner, actorEmail, false);
      return newBanner;
    }
  }

  public async toggleBanner(bannerId: string, actorEmail?: string) {
    this.memoryStore = loadStore();
    const banner = this.memoryStore.banners.find((b) => b.id === bannerId);
    if (!banner) {
      throw new Error(`Banner with ID "${bannerId}" not found`);
    }

    banner.active = !banner.active;
    banner.version += 1;
    banner.updatedAt = new Date().toISOString();

    await this.commit("BANNER", banner.id, "STATUS_CHANGED", banner, actorEmail, false);
    return banner;
  }

  public async deleteBanner(bannerId: string, actorEmail?: string) {
    this.memoryStore = loadStore();
    const index = this.memoryStore.banners.findIndex((b) => b.id === bannerId);
    if (index === -1) {
      throw new Error(`Banner with ID "${bannerId}" not found`);
    }

    const removed = this.memoryStore.banners.splice(index, 1)[0];
    await this.commit("BANNER", bannerId, "DELETED", { id: bannerId }, actorEmail, false);
    return removed;
  }

  // -------------------------------------------------------------
  // COUPONS MANAGEMENT
  // -------------------------------------------------------------

  public async upsertCoupon(couponData: Partial<CouponRecord> & { code: string }, clientVersion?: number, actorEmail?: string) {
    return this.updateCoupon(couponData, clientVersion, actorEmail);
  }

  public async updateCoupon(couponData: Partial<CouponRecord> & { code: string; clientVersion?: number }, clientVersionParam?: number, actorEmail?: string) {
    this.memoryStore = loadStore();
    const clientVersion = clientVersionParam !== undefined ? clientVersionParam : (couponData as any).clientVersion;
    const upperCode = couponData.code.trim().toUpperCase();
    const index = this.memoryStore.coupons.findIndex((c) => c.code.toUpperCase() === upperCode);

    if (index >= 0) {
      const existing = this.memoryStore.coupons[index];
      if (clientVersion !== undefined && (clientVersion < existing.version || clientVersion < this.memoryStore.syncVersion)) {
        throw new Error(`CONFLICT_DETECTED: Coupon was modified by another session. Please refresh.`);
      }

      const updated: CouponRecord = {
        ...existing,
        ...couponData,
        code: upperCode,
        version: existing.version + 1,
        updatedAt: new Date().toISOString()
      };
      this.memoryStore.coupons[index] = updated;

      await this.commit("COUPON", updated.code, "UPDATED", updated, actorEmail, false);
      return updated;
    } else {
      const newCoupon: CouponRecord = {
        id: `coup_${Date.now()}`,
        code: upperCode,
        discount: Number(couponData.discount) || 20,
        minAmount: Number(couponData.minAmount) || 500,
        expires: couponData.expires || "2026-12-31",
        active: couponData.active !== undefined ? couponData.active : true,
        claims: couponData.claims || 0,
        version: 1,
        updatedAt: new Date().toISOString()
      };
      this.memoryStore.coupons.unshift(newCoupon);

      await this.commit("COUPON", newCoupon.code, "CREATED", newCoupon, actorEmail, false);
      return newCoupon;
    }
  }

  public async toggleCoupon(code: string, actorEmail?: string) {
    this.memoryStore = loadStore();
    const coupon = this.memoryStore.coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) throw new Error(`Coupon with code "${code}" not found`);

    coupon.active = !coupon.active;
    coupon.version += 1;
    coupon.updatedAt = new Date().toISOString();

    await this.commit("COUPON", coupon.code, "STATUS_CHANGED", coupon, actorEmail, false);
    return coupon;
  }

  public async deleteCoupon(code: string, actorEmail?: string) {
    this.memoryStore = loadStore();
    const index = this.memoryStore.coupons.findIndex((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (index === -1) throw new Error(`Coupon with code "${code}" not found`);

    const removed = this.memoryStore.coupons.splice(index, 1)[0];
    await this.commit("COUPON", code, "DELETED", { code }, actorEmail, false);
    return removed;
  }

  // -------------------------------------------------------------
  // REVIEWS MODERATION
  // -------------------------------------------------------------

  public async moderateReview(reviewId: string, status: "Approved" | "Flagged", actorEmail?: string) {
    this.memoryStore = loadStore();
    const review = this.memoryStore.reviews.find((r) => r.id === reviewId);
    if (!review) throw new Error(`Review "${reviewId}" not found`);

    review.status = status;
    review.version += 1;
    review.updatedAt = new Date().toISOString();

    await this.commit("REVIEW", review.id, "STATUS_CHANGED", review, actorEmail, false);
    return review;
  }

  public async deleteReview(reviewId: string, actorEmail?: string) {
    this.memoryStore = loadStore();
    const index = this.memoryStore.reviews.findIndex((r) => r.id === reviewId);
    if (index === -1) throw new Error(`Review "${reviewId}" not found`);

    const removed = this.memoryStore.reviews.splice(index, 1)[0];
    await this.commit("REVIEW", reviewId, "DELETED", { id: reviewId }, actorEmail, false);
    return removed;
  }

  // -------------------------------------------------------------
  // SUPPORT TICKETS
  // -------------------------------------------------------------

  public async updateSupportTicket(ticketId: string, patch: Partial<SupportTicketRecord>, actorEmail?: string) {
    this.memoryStore = loadStore();
    const ticket = this.memoryStore.supportTickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error(`Ticket "${ticketId}" not found`);

    Object.assign(ticket, patch);
    ticket.version += 1;
    ticket.updatedAt = new Date().toISOString();

    // Private administrative update (only broadcast to admins)
    await this.commit("SUPPORT_TICKET", ticket.id, "UPDATED", ticket, actorEmail, true);
    return ticket;
  }

  // -------------------------------------------------------------
  // CITIES CONFIGURATION
  // -------------------------------------------------------------

  public async updateCities(cities: string[], actorEmail?: string) {
    if (!Array.isArray(cities) || cities.length === 0) {
      throw new Error("Cities list cannot be empty");
    }

    this.memoryStore = loadStore();
    const deduplicated = Array.from(new Set(cities.map((c) => c.trim()).filter(Boolean)));
    this.memoryStore.cities = deduplicated;

    await this.commit("CITIES", "global_cities", "UPDATED", deduplicated, actorEmail, false);
    return deduplicated;
  }

  // -------------------------------------------------------------
  // SPOTLIGHT MOVIE
  // -------------------------------------------------------------

  public async updateSpotlight(spotlightData: Partial<SpotlightRecord>, actorEmail?: string) {
    this.memoryStore = loadStore();
    this.memoryStore.spotlight = {
      ...this.memoryStore.spotlight,
      ...spotlightData,
      version: (this.memoryStore.spotlight.version || 1) + 1,
      updatedAt: new Date().toISOString()
    };

    await this.commit("SPOTLIGHT", "global_spotlight", "UPDATED", this.memoryStore.spotlight, actorEmail, false);
    return this.memoryStore.spotlight;
  }

  // -------------------------------------------------------------
  // FEATURE TOGGLES
  // -------------------------------------------------------------

  public async updateFeatureToggles(toggles: Partial<FeatureTogglesRecord>, actorEmail?: string) {
    this.memoryStore = loadStore();
    this.memoryStore.featureToggles = {
      ...this.memoryStore.featureToggles,
      ...toggles,
      version: this.memoryStore.featureToggles.version + 1,
      updatedAt: new Date().toISOString()
    };

    await this.commit("FEATURE_TOGGLES", "global_toggles", "UPDATED", this.memoryStore.featureToggles, actorEmail, false);
    return this.memoryStore.featureToggles;
  }

  // -------------------------------------------------------------
  // BROADCAST ANNOUNCEMENTS
  // -------------------------------------------------------------

  public async dispatchBroadcast(notification: { title: string; message: string; type: string; target: string }, actorEmail?: string) {
    this.memoryStore = loadStore();
    const added: BroadcastNotificationRecord = {
      id: `BC-${Math.floor(100 + Math.random() * 900)}`,
      title: notification.title,
      message: notification.message,
      type: notification.type || "Push",
      target: notification.target || "All Devices",
      date: "Just Now",
      createdAt: new Date().toISOString()
    };

    this.memoryStore.recentBroadcasts.unshift(added);
    if (this.memoryStore.recentBroadcasts.length > 50) {
      this.memoryStore.recentBroadcasts = this.memoryStore.recentBroadcasts.slice(0, 50);
    }

    await this.commit("BROADCAST", added.id, "CREATED", added, actorEmail, false);
    return added;
  }
}

export const globalSyncService = new GlobalSyncService();
