/**
 * CINEVENUE GLOBAL SYNCHRONIZATION CLIENT
 * Single Authoritative Sync Engine for Web, Admin Panel, and Android Apps
 */

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

export interface GlobalSyncState {
  syncVersion: number;
  lastSyncedAt: string;
  banners: BannerRecord[];
  coupons: CouponRecord[];
  reviews: ReviewRecord[];
  supportTickets: SupportTicketRecord[];
  cities: string[];
  spotlight: SpotlightRecord;
  featureToggles: FeatureTogglesRecord;
  recentBroadcasts: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    target: string;
    date: string;
  }>;
}

const DEFAULT_STATE: GlobalSyncState = {
  syncVersion: 1,
  lastSyncedAt: new Date().toISOString(),
  banners: [
    { id: "b1", title: "Pushpa 2 Double-Dhamaka Booking Promo", active: true, clicks: 14950, type: "Wide Slider", updatedAt: "2026-10-30T00:00:00.000Z", version: 1 },
    { id: "b2", title: "IMAX Laser 3D Premium Cinema Experience Lounge", active: true, clicks: 9482, type: "Popup Modal", updatedAt: "2026-10-30T00:00:00.000Z", version: 1 },
    { id: "b3", title: "Midweek Magic Flat 15% OFF popcorn combi", active: false, clicks: 2311, type: "Footer Banner", updatedAt: "2026-10-30T00:00:00.000Z", version: 1 }
  ],
  coupons: [
    { id: "c1", code: "CINESUPER50", discount: 50, minAmount: 1000, expires: "2026-12-31", active: true, claims: 245, updatedAt: "2026-10-30T00:00:00.000Z", version: 1 },
    { id: "c2", code: "PLATINUMPAY", discount: 20, minAmount: 500, expires: "2026-08-15", active: true, claims: 1098, updatedAt: "2026-10-30T00:00:00.000Z", version: 1 },
    { id: "c3", code: "FESTIVE80", discount: 80, minAmount: 1500, expires: "2026-07-05", active: false, claims: 341, updatedAt: "2026-10-30T00:00:00.000Z", version: 1 }
  ],
  reviews: [
    { id: "rev-1", user: "sarah@gmail.com", movie: "Kalki 2898 AD", rating: 5, comment: "Breathtaking visual effects! Truly world-class cinema output.", status: "Approved", updatedAt: "2026-10-30T00:00:00.000Z", version: 1 },
    { id: "rev-2", user: "kiran_dev@gmail.com", movie: "Salaar", rating: 4, comment: "Action sequences are majestic. Prabhas delivers an absolute feast.", status: "Approved", updatedAt: "2026-10-30T00:00:00.000Z", version: 1 },
    { id: "rev-3", user: "spammer_99@yahoo.com", movie: "Pushpa 2", rating: 1, comment: "BUY CHEAP TICKETS LINK WWW.SPAMMERSITE.COM FREE OFFER", status: "Flagged", updatedAt: "2026-10-30T00:00:00.000Z", version: 1 }
  ],
  supportTickets: [
    { id: "TKT-4109", customer: "sarah@gmail.com", title: "Double Charge during seat selection", status: "Open", priority: "High", date: "Today", updatedAt: "2026-10-30T00:00:00.000Z", version: 1 },
    { id: "TKT-4102", customer: "amit.s@theatre.com", title: "IMAX Projection screen brightness settings sync fail", status: "In-Progress", priority: "Medium", date: "Yesterday", updatedAt: "2026-10-30T00:00:00.000Z", version: 1 },
    { id: "TKT-3948", customer: "kiran_dev@gmail.com", title: "Refund status for cancelled Devara show", status: "Resolved", priority: "High", date: "3 days ago", updatedAt: "2026-10-30T00:00:00.000Z", version: 1 }
  ],
  cities: ["Hyderabad", "Bangalore", "Mumbai", "Delhi NCR", "Chennai", "Kochi", "Pune", "Vijayawada", "Visakhapatnam"],
  spotlight: {
    title: "Kalki 2898 AD",
    rating: 9.2,
    votes: "184.2K",
    genre: "Sci-Fi / Epic / Mythological",
    duration: "3h 01m",
    language: "Telugu, Hindi, Tamil",
    description: "Set in a post-apocalyptic world in the year 2898 AD, a modern avatar of Vishnu is believed to have descended to the earth to protect the world from evil forces.",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200",
    badge: "BLOCKBUSTER OF THE YEAR",
    releaseDate: "Now Showing Worldwide",
    formats: ["IMAX 3D", "4DX", "Dolby Cinema", "2D"],
    showtimes: ["10:30 AM", "1:45 PM", "4:00 PM", "7:30 PM", "10:15 PM"]
  },
  featureToggles: {
    isMovieBookingSystemActive: true,
    isEventBookingSystemActive: true,
    isCineCoinsActive: true,
    isRentalSystemActive: true,
    isFoodOrderingActive: true,
    version: 1,
    updatedAt: "2026-10-30T00:00:00.000Z"
  },
  recentBroadcasts: []
};

type SyncListener = (state: GlobalSyncState) => void;
type EntityListener = (entityType: string, action: string, data: any) => void;

class GlobalSyncClient {
  private state: GlobalSyncState = DEFAULT_STATE;
  private listeners: Set<SyncListener> = new Set();
  private entityListeners: Set<EntityListener> = new Set();
  private ws: WebSocket | null = null;
  private sse: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private pollInterval: any = null;
  private isConnected: boolean = false;
  private connectionMode: "WS" | "SSE" | "POLL" | "OFFLINE" = "OFFLINE";
  private reconnectAttempts: number = 0;

  constructor() {
    this.hydrateFromCache();
    this.initBroadcastChannel();
    if (typeof window !== "undefined") {
      this.initConnection();
      this.startDeltaPolling();

      // Refresh on window focus and visibility resume (re-opening mobile app or browser tab)
      const handleResume = () => {
        if (typeof document !== "undefined" && document.visibilityState === "visible") {
          this.fetchFullState();
        }
      };
      window.addEventListener("focus", handleResume);
      document.addEventListener("visibilitychange", handleResume);
      window.addEventListener("online", handleResume);
    }
  }

  private getSyncEndpoints() {
    if (typeof window === "undefined") {
      return { wsUrl: "ws://localhost:3000/ws/sync", sseUrl: "/api/v1/sync/events", httpBase: "" };
    }
    const isNative = (typeof (window as any).Capacitor !== "undefined" && (window as any).Capacitor?.isNativePlatform?.()) ||
      window.location.origin.startsWith("capacitor://") ||
      window.location.origin.startsWith("ionic://") ||
      (window.location.hostname === "localhost" && window.location.port === "");

    if (isNative) {
      return {
        wsUrl: "wss://cinevenue.com/ws/sync",
        sseUrl: "https://cinevenue.com/api/v1/sync/events",
        httpBase: "https://cinevenue.com"
      };
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    return {
      wsUrl: `${protocol}//${host}/ws/sync`,
      sseUrl: "/api/v1/sync/events",
      httpBase: ""
    };
  }

  private initConnection() {
    if (typeof window === "undefined") return;

    const { wsUrl } = this.getSyncEndpoints();

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.connectionMode = "WS";
        this.reconnectAttempts = 0;
        console.log("🟢 [GlobalSyncClient] WebSocket connected");

        // Authenticate if passcode exists
        const adminPasscode = localStorage.getItem("cine_admin_passcode") || "999999";
        if (adminPasscode) {
          this.ws?.send(JSON.stringify({ type: "AUTH", passcode: adminPasscode, role: "SUPER_ADMIN" }));
        }

        // Pull full fresh state
        this.fetchFullState();
      };

      this.ws.onmessage = (msgEvent) => {
        try {
          const msg = JSON.parse(msgEvent.data);
          if (msg.type === "SYNC_UPDATE" && msg.event) {
            this.handleRemoteSyncEvent(msg.event);
          }
        } catch (e) {}
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.connectionMode = "OFFLINE";
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch (err) {
      this.initSseFallback();
    }
  }

  private initSseFallback() {
    if (typeof window === "undefined" || !("EventSource" in window)) return;
    try {
      const { sseUrl } = this.getSyncEndpoints();
      this.sse = new EventSource(sseUrl);
      this.sse.onopen = () => {
        this.isConnected = true;
        this.connectionMode = "SSE";
        console.log("🟢 [GlobalSyncClient] SSE connected as fallback");
        this.fetchFullState();
      };

      this.sse.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "SYNC_UPDATE" && msg.event) {
            this.handleRemoteSyncEvent(msg.event);
          }
        } catch (e) {}
      };

      this.sse.onerror = () => {
        this.sse?.close();
        this.connectionMode = "POLL";
      };
    } catch (e) {
      this.connectionMode = "POLL";
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = Math.min(30000, 2000 * Math.pow(1.5, this.reconnectAttempts));
    setTimeout(() => {
      this.initConnection();
    }, delay);
  }

  private startDeltaPolling() {
    this.pollInterval = setInterval(async () => {
      try {
        const { httpBase } = this.getSyncEndpoints();
        const res = await fetch(`${httpBase}/api/v1/sync/delta?version=${this.state.syncVersion}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data?.isStale && json.data?.state) {
            this.applyState(json.data.state, true);
          }
        }
      } catch (e) {}
    }, 15000);
  }

  public async fetchFullState(): Promise<GlobalSyncState> {
    try {
      const { httpBase } = this.getSyncEndpoints();
      const adminPasscode = typeof window !== "undefined" ? (localStorage.getItem("cine_admin_passcode") || "999999") : "";
      const res = await fetch(`${httpBase}/api/v1/sync/state`, {
        headers: adminPasscode ? { "x-admin-passcode": adminPasscode } : {}
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          this.applyState(json.data, true);
        }
      }
    } catch (e) {}
    return this.state;
  }

  private handleRemoteSyncEvent(event: any) {
    const { entityType, action, data } = event;

    // Apply incremental mutation to local state
    if (entityType === "BANNER") {
      if (action === "DELETED") {
        this.state.banners = this.state.banners.filter((b) => b.id !== data.id);
      } else {
        const idx = this.state.banners.findIndex((b) => b.id === data.id);
        if (idx >= 0) {
          this.state.banners[idx] = data;
        } else {
          this.state.banners.unshift(data);
        }
      }
    } else if (entityType === "COUPON") {
      if (action === "DELETED") {
        this.state.coupons = this.state.coupons.filter((c) => c.code !== data.code);
      } else {
        const idx = this.state.coupons.findIndex((c) => c.code === data.code);
        if (idx >= 0) {
          this.state.coupons[idx] = data;
        } else {
          this.state.coupons.unshift(data);
        }
      }
    } else if (entityType === "REVIEW") {
      if (action === "DELETED") {
        this.state.reviews = this.state.reviews.filter((r) => r.id !== data.id);
      } else {
        const idx = this.state.reviews.findIndex((r) => r.id === data.id);
        if (idx >= 0) {
          this.state.reviews[idx] = data;
        } else {
          this.state.reviews.unshift(data);
        }
      }
    } else if (entityType === "CITIES") {
      this.state.cities = Array.isArray(data) ? data : this.state.cities;
    } else if (entityType === "SPOTLIGHT") {
      this.state.spotlight = data;
    } else if (entityType === "FEATURE_TOGGLES") {
      this.state.featureToggles = data;
    } else if (entityType === "BROADCAST") {
      this.state.recentBroadcasts.unshift(data);
    }

    if (event.version) {
      this.state.syncVersion = Math.max(this.state.syncVersion, event.version);
    }
    this.state.lastSyncedAt = event.timestamp || new Date().toISOString();

    this.saveToCache();
    this.notifyListeners();

    // Notify entity listeners
    this.entityListeners.forEach((fn) => {
      try {
        fn(entityType, action, data);
      } catch (e) {}
    });
  }

  private applyState(incoming: Partial<GlobalSyncState>, broadcastToTabs: boolean = true) {
    this.state = {
      ...this.state,
      ...incoming,
      featureToggles: { ...this.state.featureToggles, ...(incoming.featureToggles || {}) }
    };

    this.saveToCache();
    this.notifyListeners();

    if (broadcastToTabs && this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: "SYNC_LOCAL_BROADCAST",
          payload: this.state
        });
      } catch (e) {}
    }
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.state);
      } catch (e) {}
    });
  }

  // -------------------------------------------------------------
  // PUBLIC API: GETTERS & SUBSCRIPTIONS
  // -------------------------------------------------------------

  public getState(): GlobalSyncState {
    return this.state;
  }

  public getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      mode: this.connectionMode,
      syncVersion: this.state.syncVersion,
      lastSyncedAt: this.state.lastSyncedAt
    };
  }

  public subscribe(fn: SyncListener): () => void {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  public onEntityChange(fn: EntityListener): () => void {
    this.entityListeners.add(fn);
    return () => this.entityListeners.delete(fn);
  }

  // -------------------------------------------------------------
  // MUTATION METHODS: BANNERS
  // -------------------------------------------------------------

  public async toggleBanner(bannerId: string): Promise<BannerRecord> {
    const adminPasscode = localStorage.getItem("cine_admin_passcode") || "999999";
    const res = await fetch(`/api/v1/admin/sync/banners/${bannerId}/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-passcode": adminPasscode
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to toggle banner");
    }

    const json = await res.json();
    const updated = json.data.banner;

    // Local optimistic update
    const idx = this.state.banners.findIndex((b) => b.id === bannerId);
    if (idx >= 0) {
      this.state.banners[idx] = updated;
      this.saveToCache();
      this.notifyListeners();
    }

    return updated;
  }

  public async updateBanner(bannerData: Partial<BannerRecord> & { id: string }): Promise<BannerRecord> {
    const adminPasscode = localStorage.getItem("cine_admin_passcode") || "999999";
    const existing = this.state.banners.find((b) => b.id === bannerData.id);

    const res = await fetch("/api/v1/admin/sync/banners", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-passcode": adminPasscode
      },
      body: JSON.stringify({
        ...bannerData,
        clientVersion: existing?.version
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update banner");
    }

    const json = await res.json();
    const banner = json.data.banner;

    const idx = this.state.banners.findIndex((b) => b.id === banner.id);
    if (idx >= 0) {
      this.state.banners[idx] = banner;
    } else {
      this.state.banners.unshift(banner);
    }
    this.saveToCache();
    this.notifyListeners();

    return banner;
  }

  public async deleteBanner(bannerId: string): Promise<void> {
    const adminPasscode = localStorage.getItem("cine_admin_passcode") || "999999";
    const res = await fetch(`/api/v1/admin/sync/banners/${bannerId}`, {
      method: "DELETE",
      headers: {
        "x-admin-passcode": adminPasscode
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to delete banner");
    }

    this.state.banners = this.state.banners.filter((b) => b.id !== bannerId);
    this.saveToCache();
    this.notifyListeners();
  }

  // -------------------------------------------------------------
  // MUTATION METHODS: COUPONS
  // -------------------------------------------------------------

  public async toggleCoupon(code: string): Promise<CouponRecord> {
    const adminPasscode = localStorage.getItem("cine_admin_passcode") || "999999";
    const res = await fetch(`/api/v1/admin/sync/coupons/${code}/toggle`, {
      method: "POST",
      headers: { "x-admin-passcode": adminPasscode }
    });

    if (!res.ok) throw new Error("Failed to toggle coupon");
    const json = await res.json();
    const coupon = json.data.coupon;

    const idx = this.state.coupons.findIndex((c) => c.code === coupon.code);
    if (idx >= 0) {
      this.state.coupons[idx] = coupon;
      this.saveToCache();
      this.notifyListeners();
    }
    return coupon;
  }

  public async updateCoupon(couponData: Partial<CouponRecord> & { code: string }): Promise<CouponRecord> {
    const adminPasscode = localStorage.getItem("cine_admin_passcode") || "999999";
    const existing = this.state.coupons.find((c) => c.code === couponData.code);

    const res = await fetch("/api/v1/admin/sync/coupons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-passcode": adminPasscode
      },
      body: JSON.stringify({
        ...couponData,
        clientVersion: existing?.version
      })
    });

    if (!res.ok) throw new Error("Failed to save coupon");
    const json = await res.json();
    const coupon = json.data.coupon;

    const idx = this.state.coupons.findIndex((c) => c.code === coupon.code);
    if (idx >= 0) this.state.coupons[idx] = coupon;
    else this.state.coupons.unshift(coupon);

    this.saveToCache();
    this.notifyListeners();
    return coupon;
  }

  // -------------------------------------------------------------
  // MUTATION METHODS: REVIEWS
  // -------------------------------------------------------------

  public async moderateReview(reviewId: string, status: "Approved" | "Flagged"): Promise<ReviewRecord> {
    const adminPasscode = localStorage.getItem("cine_admin_passcode") || "999999";
    const res = await fetch(`/api/v1/admin/sync/reviews/${reviewId}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-passcode": adminPasscode
      },
      body: JSON.stringify({ status })
    });

    if (!res.ok) throw new Error("Failed to update review status");
    const json = await res.json();
    const review = json.data.review;

    const idx = this.state.reviews.findIndex((r) => r.id === review.id);
    if (idx >= 0) {
      this.state.reviews[idx] = review;
      this.saveToCache();
      this.notifyListeners();
    }
    return review;
  }

  public async deleteReview(reviewId: string): Promise<void> {
    const adminPasscode = localStorage.getItem("cine_admin_passcode") || "999999";
    const res = await fetch(`/api/v1/admin/sync/reviews/${reviewId}`, {
      method: "DELETE",
      headers: { "x-admin-passcode": adminPasscode }
    });

    if (!res.ok) throw new Error("Failed to delete review");

    this.state.reviews = this.state.reviews.filter((r) => r.id !== reviewId);
    this.saveToCache();
    this.notifyListeners();
  }

  // -------------------------------------------------------------
  // MUTATION METHODS: CITIES & SPOTLIGHT & TOGGLES
  // -------------------------------------------------------------

  public async updateCities(cities: string[]): Promise<string[]> {
    const adminPasscode = localStorage.getItem("cine_admin_passcode") || "999999";
    const res = await fetch("/api/v1/admin/sync/cities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-passcode": adminPasscode
      },
      body: JSON.stringify({ cities })
    });

    if (!res.ok) throw new Error("Failed to update cities");
    const json = await res.json();
    this.state.cities = json.data.cities;
    this.saveToCache();
    this.notifyListeners();
    return this.state.cities;
  }

  public async updateSpotlight(spotlight: Partial<SpotlightRecord>): Promise<SpotlightRecord> {
    const adminPasscode = localStorage.getItem("cine_admin_passcode") || "999999";
    const res = await fetch("/api/v1/admin/sync/spotlight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-passcode": adminPasscode
      },
      body: JSON.stringify(spotlight)
    });

    if (!res.ok) throw new Error("Failed to update spotlight");
    const json = await res.json();
    this.state.spotlight = json.data.spotlight;
    this.saveToCache();
    this.notifyListeners();
    return this.state.spotlight;
  }

  public async updateFeatureToggles(toggles: Partial<FeatureTogglesRecord>): Promise<FeatureTogglesRecord> {
    const adminPasscode = localStorage.getItem("cine_admin_passcode") || "999999";
    const res = await fetch("/api/v1/admin/sync/feature-toggles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-passcode": adminPasscode
      },
      body: JSON.stringify(toggles)
    });

    if (!res.ok) throw new Error("Failed to update feature toggles");
    const json = await res.json();
    this.state.featureToggles = json.data.featureToggles;
    this.saveToCache();
    this.notifyListeners();
    return this.state.featureToggles;
  }

  public async dispatchBroadcast(broadcastData: { title: string; message: string; type: string; target: string }) {
    const adminPasscode = localStorage.getItem("cine_admin_passcode") || "999999";
    const res = await fetch("/api/v1/admin/sync/broadcast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-passcode": adminPasscode
      },
      body: JSON.stringify(broadcastData)
    });

    if (!res.ok) throw new Error("Failed to dispatch broadcast");
    const json = await res.json();
    this.state.recentBroadcasts.unshift(json.data.broadcast);
    this.saveToCache();
    this.notifyListeners();
    return json.data.broadcast;
  }
}

export const globalSyncClient = new GlobalSyncClient();
