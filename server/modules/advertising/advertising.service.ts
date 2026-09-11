import fs from "fs";
import path from "path";
import crypto from "crypto";
import { env } from "../../config/env";
import { logger } from "../../shared/logger";
import { ValidationError, NotFoundError } from "../../shared/errors";
import { cashfreeService } from "../payments/cashfree.service";
import {
  LiveBannerCampaign,
  BannerPlacementConfig,
  BannerPlacementId,
  BannerPricingQuote,
  PlacementSlotAvailability,
  CampaignCalendarSlot,
  LiveCampaignStatus
} from "./advertising.types";

const DATA_FILE_PATH = path.resolve(process.cwd(), "server/config/live_banner_campaigns.json");
const PLACEMENTS_FILE_PATH = path.resolve(process.cwd(), "server/config/live_banner_placements.json");

export const DEFAULT_PLACEMENTS: BannerPlacementConfig[] = [
  {
    id: "homepage_top",
    name: "Homepage Top Spotlight",
    page: "Home",
    locationDescription: "Prime billboard positioned directly above featured movies and hero carousel.",
    desktopDimensions: "1280x280",
    mobileDimensions: "640x320",
    aspectRatio: "4.5:1",
    maxConcurrentCampaigns: 1,
    basePrice24hINR: 4999,
    isActive: true,
    supportsGoogleAdSenseFallback: true
  },
  {
    id: "homepage_middle",
    name: "Homepage Mid-Feed Showcase",
    page: "Home",
    locationDescription: "Full-width marquee banner positioned between Now Showing and Trending Showcases.",
    desktopDimensions: "1200x240",
    mobileDimensions: "600x300",
    aspectRatio: "5:1",
    maxConcurrentCampaigns: 1,
    basePrice24hINR: 3499,
    isActive: true,
    supportsGoogleAdSenseFallback: true
  },
  {
    id: "homepage_bottom",
    name: "Homepage Footer Billboard",
    page: "Home",
    locationDescription: "High-visibility closing display banner located right above CineVenue footer.",
    desktopDimensions: "1200x200",
    mobileDimensions: "600x250",
    aspectRatio: "6:1",
    maxConcurrentCampaigns: 1,
    basePrice24hINR: 1999,
    isActive: true,
    supportsGoogleAdSenseFallback: true
  },
  {
    id: "movies_top",
    name: "Movies & Showtimes Header Banner",
    page: "Movies",
    locationDescription: "Header position across movie discovery and theatre schedule views.",
    desktopDimensions: "1200x250",
    mobileDimensions: "600x300",
    aspectRatio: "4.8:1",
    maxConcurrentCampaigns: 1,
    basePrice24hINR: 3999,
    isActive: true,
    supportsGoogleAdSenseFallback: true
  },
  {
    id: "movie_details",
    name: "Movie Synopsis & Booking Interstitial",
    page: "Movie Details",
    locationDescription: "Featured banner between trailer embed and theatre showtime grid.",
    desktopDimensions: "960x220",
    mobileDimensions: "600x280",
    aspectRatio: "4.3:1",
    maxConcurrentCampaigns: 1,
    basePrice24hINR: 2799,
    isActive: true,
    supportsGoogleAdSenseFallback: true
  },
  {
    id: "events_top",
    name: "Live Events & Concerts Leaderboard",
    page: "Events",
    locationDescription: "Top banner across live comedy, music concerts, and gala booking lobbies.",
    desktopDimensions: "1200x250",
    mobileDimensions: "600x300",
    aspectRatio: "4.8:1",
    maxConcurrentCampaigns: 1,
    basePrice24hINR: 2999,
    isActive: true,
    supportsGoogleAdSenseFallback: true
  },
  {
    id: "event_details",
    name: "Event Pass Confirmation Banner",
    page: "Events",
    locationDescription: "Targeted card banner visible before and after attendee pass selection.",
    desktopDimensions: "800x250",
    mobileDimensions: "500x250",
    aspectRatio: "3.2:1",
    maxConcurrentCampaigns: 1,
    basePrice24hINR: 2199,
    isActive: true,
    supportsGoogleAdSenseFallback: true
  },
  {
    id: "film_production_top",
    name: "Film Industry Hub Top Banner",
    page: "Film Production",
    locationDescription: "Premier header banner across 24 Crafts, casting notices, and talent directories.",
    desktopDimensions: "1200x260",
    mobileDimensions: "600x300",
    aspectRatio: "4.6:1",
    maxConcurrentCampaigns: 1,
    basePrice24hINR: 2499,
    isActive: true,
    supportsGoogleAdSenseFallback: true
  },
  {
    id: "film_production_middle",
    name: "Film Production Directory Spotlight",
    page: "Film Production",
    locationDescription: "Engaging showcase ad between verified professionals and project pitches.",
    desktopDimensions: "1100x220",
    mobileDimensions: "550x260",
    aspectRatio: "5:1",
    maxConcurrentCampaigns: 1,
    basePrice24hINR: 1799,
    isActive: true,
    supportsGoogleAdSenseFallback: true
  },
  {
    id: "content_top",
    name: "Editorial & News Header",
    page: "All Content",
    locationDescription: "Universal header banner on informative and promotional platform pages.",
    desktopDimensions: "1200x200",
    mobileDimensions: "600x250",
    aspectRatio: "6:1",
    maxConcurrentCampaigns: 2,
    basePrice24hINR: 1899,
    isActive: true,
    supportsGoogleAdSenseFallback: true
  },
  {
    id: "content_sidebar",
    name: "High-Impact Sticky Sidebar",
    page: "All Content",
    locationDescription: "Vertical companion ad unit on desktop layouts.",
    desktopDimensions: "300x600",
    mobileDimensions: "300x300",
    aspectRatio: "1:2",
    maxConcurrentCampaigns: 1,
    basePrice24hINR: 2299,
    isActive: true,
    supportsGoogleAdSenseFallback: true
  }
];

class AdvertisingService {
  private campaigns: LiveBannerCampaign[] = [];
  private placements: BannerPlacementConfig[] = DEFAULT_PLACEMENTS;
  private isLoaded = false;
  private schedulerTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.loadData();
    this.startLifecycleScheduler();
  }

  // -------------------------------------------------------------
  // DATA PERSISTENCE (Fail-safe File & Resilient Storage)
  // -------------------------------------------------------------
  private loadData(): void {
    if (this.isLoaded) return;
    try {
      if (fs.existsSync(PLACEMENTS_FILE_PATH)) {
        const raw = fs.readFileSync(PLACEMENTS_FILE_PATH, "utf8");
        this.placements = JSON.parse(raw);
      } else {
        this.savePlacements();
      }

      if (fs.existsSync(DATA_FILE_PATH)) {
        const raw = fs.readFileSync(DATA_FILE_PATH, "utf8");
        this.campaigns = JSON.parse(raw);
      } else {
        this.saveCampaigns();
      }

      this.isLoaded = true;
      this.evaluateLifecycleTransitions();
    } catch (err: any) {
      logger.warn(`Failed reading advertising persistence file: ${err.message}. Using default in-memory storage.`);
      this.placements = DEFAULT_PLACEMENTS;
      this.campaigns = [];
      this.isLoaded = true;
    }
  }

  private saveCampaigns(): void {
    try {
      const dir = path.dirname(DATA_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(this.campaigns, null, 2), "utf8");
    } catch (err: any) {
      logger.error(`Failed saving live banner campaigns: ${err.message}`);
    }
  }

  private savePlacements(): void {
    try {
      const dir = path.dirname(PLACEMENTS_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(PLACEMENTS_FILE_PATH, JSON.stringify(this.placements, null, 2), "utf8");
    } catch (err: any) {
      logger.error(`Failed saving live banner placements: ${err.message}`);
    }
  }

  // -------------------------------------------------------------
  // 24-HOUR SERVER-SIDE UTC LIFECYCLE ENGINE
  // -------------------------------------------------------------
  private startLifecycleScheduler(): void {
    if (this.schedulerTimer) clearInterval(this.schedulerTimer);
    // Run state transitions every 30 seconds
    this.schedulerTimer = setInterval(() => {
      this.evaluateLifecycleTransitions();
    }, 30000);
  }

  public evaluateLifecycleTransitions(): void {
    const nowUtcMs = Date.now();
    let stateChanged = false;

    for (const c of this.campaigns) {
      const startMs = new Date(c.startAtUtc).getTime();
      const endMs = new Date(c.endAtUtc).getTime();

      // Condition 1: SCHEDULED or APPROVED -> LIVE
      if (
        (c.status === "SCHEDULED" || c.status === "APPROVED") &&
        c.paymentStatus === "PAID" &&
        nowUtcMs >= startMs &&
        nowUtcMs < endMs
      ) {
        c.status = "LIVE";
        c.updatedAtUtc = new Date().toISOString();
        stateChanged = true;
        logger.info(`[24H BANNER] Campaign ${c.campaignNumber} ("${c.adTitle}") is now LIVE!`);
      }

      // Condition 2: LIVE -> EXPIRED
      if (c.status === "LIVE" && nowUtcMs >= endMs) {
        c.status = "EXPIRED";
        c.updatedAtUtc = new Date().toISOString();
        stateChanged = true;
        logger.info(`[24H BANNER] Campaign ${c.campaignNumber} has EXPIRED after 24 hours.`);
      }
    }

    if (stateChanged) {
      this.saveCampaigns();
    }
  }

  // -------------------------------------------------------------
  // PLACEMENT MANAGEMENT
  // -------------------------------------------------------------
  public getPlacements(): BannerPlacementConfig[] {
    this.loadData();
    return this.placements;
  }

  public getPlacementById(id: BannerPlacementId): BannerPlacementConfig | undefined {
    this.loadData();
    return this.placements.find(p => p.id === id);
  }

  public updatePlacementPricing(id: BannerPlacementId, basePrice24hINR: number, isActive?: boolean): BannerPlacementConfig {
    this.loadData();
    const placement = this.placements.find(p => p.id === id);
    if (!placement) throw new NotFoundError("BannerPlacement", id);

    placement.basePrice24hINR = Number(basePrice24hINR);
    if (typeof isActive === "boolean") placement.isActive = isActive;
    this.savePlacements();
    return placement;
  }

  // -------------------------------------------------------------
  // QUOTE & PRICING ENGINE
  // -------------------------------------------------------------
  public calculateQuote(placementId: BannerPlacementId, durationHours: number = 24, discountCode?: string): BannerPricingQuote {
    const placement = this.getPlacementById(placementId);
    if (!placement) throw new NotFoundError("BannerPlacement", placementId);

    const baseUnit = placement.basePrice24hINR;
    // Scale base price proportionally if duration differs from 24h
    const basePriceINR = Math.round((baseUnit / 24) * durationHours);
    
    // Check promotional discount
    let discountINR = 0;
    if (discountCode?.toUpperCase() === "LAUNCH500") {
      discountINR = Math.min(500, Math.round(basePriceINR * 0.1));
    }

    const taxable = Math.max(0, basePriceINR - discountINR);
    const gstRatePercent = 18; // Standard 18% GST for digital advertising in India
    const gstAmountINR = Math.round(taxable * (gstRatePercent / 100));
    const finalAmountINR = taxable + gstAmountINR;

    return {
      placementId,
      durationHours,
      basePriceINR,
      gstRatePercent,
      gstAmountINR,
      discountINR,
      finalAmountINR,
      currency: "INR"
    };
  }

  // -------------------------------------------------------------
  // SLOT AVAILABILITY ENGINE
  // -------------------------------------------------------------
  public checkAvailability(placementId: BannerPlacementId, startAtUtc: string, durationHours: number = 24): PlacementSlotAvailability {
    this.loadData();
    this.evaluateLifecycleTransitions();

    const placement = this.getPlacementById(placementId);
    if (!placement) throw new NotFoundError("BannerPlacement", placementId);

    const startDate = new Date(startAtUtc);
    if (isNaN(startDate.getTime())) {
      throw new ValidationError("Invalid startAtUtc timestamp");
    }

    const startMs = startDate.getTime();
    const endMs = startMs + durationHours * 3600 * 1000;
    const endAtUtc = new Date(endMs).toISOString();

    // Find conflicting campaigns for this placement
    const activeStatuses: LiveCampaignStatus[] = ["PAID", "PENDING_APPROVAL", "APPROVED", "SCHEDULED", "LIVE"];
    const conflicting = this.campaigns.filter(c => {
      if (c.placementId !== placementId) return false;
      if (!activeStatuses.includes(c.status)) return false;

      const cStartMs = new Date(c.startAtUtc).getTime();
      const cEndMs = new Date(c.endAtUtc).getTime();

      // Check overlap: (StartA < EndB) and (EndA > StartB)
      return startMs < cEndMs && endMs > cStartMs;
    });

    const isAvailable = conflicting.length < placement.maxConcurrentCampaigns;

    return {
      placementId,
      isAvailable,
      startAtUtc: startDate.toISOString(),
      endAtUtc,
      conflictingCampaignCount: conflicting.length,
      maxAllowed: placement.maxConcurrentCampaigns,
      reason: isAvailable ? undefined : `This placement is already reserved by ${conflicting.length} confirmed campaign(s) during this 24-hour window.`
    };
  }

  // -------------------------------------------------------------
  // CAMPAIGN CREATION
  // -------------------------------------------------------------
  public createCampaign(data: {
    userId?: string;
    businessName: string;
    campaignName: string;
    adTitle: string;
    shortDescription?: string;
    destinationUrl: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    placementId: BannerPlacementId;
    creative: {
      desktopImageUrl: string;
      mobileImageUrl?: string;
      altText?: string;
    };
    startAtUtc: string;
    durationHours?: number;
    discountCode?: string;
  }): LiveBannerCampaign {
    this.loadData();

    // 1. Validate fields
    if (!data.businessName?.trim()) throw new ValidationError("Business Name is required");
    if (!data.adTitle?.trim()) throw new ValidationError("Advertisement Title is required");
    if (!data.destinationUrl?.trim() || !data.destinationUrl.startsWith("http")) {
      throw new ValidationError("A valid http/https Destination URL is required");
    }
    if (!data.contactEmail?.trim() || !data.contactEmail.includes("@")) {
      throw new ValidationError("Valid contact email is required");
    }
    if (!data.creative?.desktopImageUrl) {
      throw new ValidationError("Desktop banner creative image is required");
    }

    const duration = data.durationHours || 24;
    const availability = this.checkAvailability(data.placementId, data.startAtUtc, duration);
    if (!availability.isAvailable) {
      throw new ValidationError(availability.reason || "Selected placement slot is unavailable");
    }

    const quote = this.calculateQuote(data.placementId, duration, data.discountCode);

    const now = new Date();
    const id = `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const campaignNumber = `CV-AD-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCampaign: LiveBannerCampaign = {
      id,
      campaignNumber,
      userId: data.userId,
      businessName: data.businessName.trim(),
      campaignName: data.campaignName?.trim() || data.adTitle.trim(),
      adTitle: data.adTitle.trim(),
      shortDescription: data.shortDescription?.trim(),
      destinationUrl: data.destinationUrl.trim(),
      contactName: data.contactName?.trim() || data.businessName.trim(),
      contactEmail: data.contactEmail.trim().toLowerCase(),
      contactPhone: data.contactPhone?.trim() || "",
      placementId: data.placementId,
      creative: {
        desktopImageUrl: data.creative.desktopImageUrl,
        mobileImageUrl: data.creative.mobileImageUrl || data.creative.desktopImageUrl,
        altText: data.creative.altText || data.adTitle
      },
      durationHours: duration,
      startAtUtc: availability.startAtUtc,
      endAtUtc: availability.endAtUtc,
      basePriceINR: quote.basePriceINR,
      gstRatePercent: quote.gstRatePercent,
      gstAmountINR: quote.gstAmountINR,
      discountINR: quote.discountINR,
      finalAmountINR: quote.finalAmountINR,
      currency: "INR",
      paymentStatus: "UNPAID",
      paymentGateway: "CASHFREE",
      status: "PENDING_PAYMENT",
      impressions: 0,
      clicks: 0,
      ctr: 0,
      createdAtUtc: now.toISOString(),
      updatedAtUtc: now.toISOString()
    };

    this.campaigns.unshift(newCampaign);
    this.saveCampaigns();
    return newCampaign;
  }

  // -------------------------------------------------------------
  // PAYMENT ORDER & VERIFICATION (CASHFREE)
  // -------------------------------------------------------------
  public async createPaymentOrder(campaignId: string): Promise<any> {
    return this.createCashfreePaymentOrder(campaignId);
  }

  public async verifyPayment(data: { campaignId: string; orderId: string }): Promise<LiveBannerCampaign> {
    return this.verifyCashfreePayment(data.campaignId, data.orderId);
  }

  public async createCashfreePaymentOrder(campaignId: string): Promise<any> {
    this.loadData();
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new NotFoundError("LiveBannerCampaign", campaignId);

    const orderId = `CF_AD_${campaign.campaignNumber}_${Date.now()}`.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 45);
    const amountInINR = (campaign as any).pricing?.totalPayableINR || campaign.finalAmountINR || campaign.basePriceINR || 1999;
    const resolvedEmail = (campaign as any).advertiserEmail || campaign.contactEmail || "ads@cinevenue.in";
    const resolvedName = (campaign as any).advertiserName || campaign.contactName || campaign.businessName || "Advertiser";
    const resolvedPhone = (campaign as any).advertiserPhone || campaign.contactPhone || "9876543210";

    const cashfreeOrder = await cashfreeService.createOrder({
      orderId,
      orderAmount: amountInINR,
      orderCurrency: "INR",
      customerDetails: {
        customerId: resolvedEmail.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50),
        customerName: resolvedName,
        customerEmail: resolvedEmail,
        customerPhone: resolvedPhone
      },
      orderMeta: {
        returnUrl: `${env.FRONTEND_URL}/advertising/my-campaigns?cf_order_id={order_id}&campaign_id=${campaign.id}`
      },
      notes: {
        campaignId: campaign.id,
        placementId: campaign.placementId,
        businessName: campaign.businessName
      }
    });

    campaign.paymentOrderId = cashfreeOrder.orderId;
    campaign.status = "PAYMENT_PROCESSING";
    this.saveCampaigns();

    return {
      orderId: cashfreeOrder.orderId,
      paymentSessionId: cashfreeOrder.paymentSessionId,
      cfOrderId: cashfreeOrder.cfOrderId,
      amount: cashfreeOrder.orderAmount,
      currency: cashfreeOrder.orderCurrency,
      campaignId: campaign.id,
      environment: cashfreeOrder.environment,
      isSandbox: cashfreeOrder.isSandbox
    };
  }

  public async verifyCashfreePayment(campaignId: string, orderId: string): Promise<LiveBannerCampaign> {
    this.loadData();
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new NotFoundError("LiveBannerCampaign", campaignId);

    const verification = await cashfreeService.verifyOrderPayment(orderId);
    if (!verification.isPaid) {
      throw new ValidationError(`Payment status is ${verification.orderStatus}. Payment could not be verified.`);
    }

    campaign.paymentStatus = "PAID";
    campaign.paymentTxnId = verification.paymentDetails?.cfOrderId || orderId;
    campaign.paidAtUtc = new Date().toISOString();
    campaign.status = "REVIEW_PENDING";
    campaign.updatedAtUtc = new Date().toISOString();

    this.saveCampaigns();
    logger.info(`[24H BANNER] Campaign ${campaign.campaignNumber} verified PAID via Cashfree.`);
    return campaign;
  }

  // -------------------------------------------------------------
  // ADMIN MODERATION & WORKFLOW
  // -------------------------------------------------------------
  public approveCampaign(campaignId: string, reviewedBy: string = "Superadmin"): LiveBannerCampaign {
    this.loadData();
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new NotFoundError("LiveBannerCampaign", campaignId);

    if (campaign.paymentStatus !== "PAID") {
      throw new ValidationError("Cannot approve an unpaid campaign");
    }

    campaign.reviewedBy = reviewedBy;
    campaign.reviewedAtUtc = new Date().toISOString();
    campaign.rejectionReason = undefined;

    const nowUtcMs = Date.now();
    const startMs = new Date(campaign.startAtUtc).getTime();
    const endMs = new Date(campaign.endAtUtc).getTime();

    if (nowUtcMs >= startMs && nowUtcMs < endMs) {
      campaign.status = "LIVE";
      logger.info(`[24H BANNER] Approved and launched LIVE immediately: ${campaign.campaignNumber}`);
    } else if (nowUtcMs < startMs) {
      campaign.status = "SCHEDULED";
      logger.info(`[24H BANNER] Approved and SCHEDULED for start at ${campaign.startAtUtc}: ${campaign.campaignNumber}`);
    } else {
      campaign.status = "EXPIRED";
    }

    campaign.updatedAtUtc = new Date().toISOString();
    this.saveCampaigns();
    return campaign;
  }

  public rejectCampaign(campaignId: string, reason: string, reviewedBy: string = "Superadmin"): LiveBannerCampaign {
    this.loadData();
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new NotFoundError("LiveBannerCampaign", campaignId);

    campaign.status = "REJECTED";
    campaign.rejectionReason = reason;
    campaign.reviewedBy = reviewedBy;
    campaign.reviewedAtUtc = new Date().toISOString();
    campaign.updatedAtUtc = new Date().toISOString();

    this.saveCampaigns();
    return campaign;
  }

  public pauseCampaign(campaignId: string): LiveBannerCampaign {
    this.loadData();
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new NotFoundError("LiveBannerCampaign", campaignId);

    if (campaign.status !== "LIVE") {
      throw new ValidationError("Only LIVE campaigns can be paused");
    }

    campaign.status = "PAUSED";
    campaign.pausedAtUtc = new Date().toISOString();
    campaign.updatedAtUtc = new Date().toISOString();
    this.saveCampaigns();
    return campaign;
  }

  public resumeCampaign(campaignId: string): LiveBannerCampaign {
    this.loadData();
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new NotFoundError("LiveBannerCampaign", campaignId);

    if (campaign.status !== "PAUSED") {
      throw new ValidationError("Only PAUSED campaigns can be resumed");
    }

    const nowUtcMs = Date.now();
    const endMs = new Date(campaign.endAtUtc).getTime();

    campaign.status = nowUtcMs < endMs ? "LIVE" : "EXPIRED";
    campaign.pausedAtUtc = undefined;
    campaign.updatedAtUtc = new Date().toISOString();
    this.saveCampaigns();
    return campaign;
  }

  // -------------------------------------------------------------
  // PUBLIC LIVE BANNER RETRIEVAL FOR FRONTEND
  // -------------------------------------------------------------
  public getLiveBannerForPlacement(placementId: BannerPlacementId): {
    hasDirectAd: boolean;
    banner?: {
      id: string;
      campaignNumber: string;
      businessName: string;
      adTitle: string;
      shortDescription?: string;
      destinationUrl: string;
      desktopImageUrl: string;
      mobileImageUrl: string;
      altText: string;
      startAtUtc: string;
      endAtUtc: string;
      remainingSeconds: number;
    };
    supportsGoogleAdSenseFallback: boolean;
  } {
    this.loadData();
    this.evaluateLifecycleTransitions();

    const placement = this.getPlacementById(placementId);
    const nowUtcMs = Date.now();

    // Priority 1: Check for active LIVE direct campaign
    const liveCampaign = this.campaigns.find(c => {
      if (c.placementId !== placementId) return false;
      if (c.status !== "LIVE") return false;
      const endMs = new Date(c.endAtUtc).getTime();
      return nowUtcMs < endMs;
    });

    if (liveCampaign) {
      const remainingSeconds = Math.max(0, Math.floor((new Date(liveCampaign.endAtUtc).getTime() - nowUtcMs) / 1000));
      return {
        hasDirectAd: true,
        banner: {
          id: liveCampaign.id,
          campaignNumber: liveCampaign.campaignNumber,
          businessName: liveCampaign.businessName,
          adTitle: liveCampaign.adTitle,
          shortDescription: liveCampaign.shortDescription,
          destinationUrl: liveCampaign.destinationUrl,
          desktopImageUrl: liveCampaign.creative.desktopImageUrl,
          mobileImageUrl: liveCampaign.creative.mobileImageUrl || liveCampaign.creative.desktopImageUrl,
          altText: liveCampaign.creative.altText,
          startAtUtc: liveCampaign.startAtUtc,
          endAtUtc: liveCampaign.endAtUtc,
          remainingSeconds
        },
        supportsGoogleAdSenseFallback: placement?.supportsGoogleAdSenseFallback ?? true
      };
    }

    return {
      hasDirectAd: false,
      supportsGoogleAdSenseFallback: placement?.supportsGoogleAdSenseFallback ?? true
    };
  }

  // -------------------------------------------------------------
  // PRIVACY-CONSCIOUS TRACKING
  // -------------------------------------------------------------
  public trackEvent(campaignId: string, type: "impression" | "click"): void {
    this.loadData();
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    if (type === "impression") {
      campaign.impressions += 1;
    } else if (type === "click") {
      campaign.clicks += 1;
    }

    if (campaign.impressions > 0) {
      campaign.ctr = Number(((campaign.clicks / campaign.impressions) * 100).toFixed(2));
    }

    // Debounced write
    this.saveCampaigns();
  }

  // -------------------------------------------------------------
  // QUERIES & CALENDAR
  // -------------------------------------------------------------
  public getAllCampaigns(filters?: {
    status?: LiveCampaignStatus;
    placementId?: BannerPlacementId;
    email?: string;
    search?: string;
  }): LiveBannerCampaign[] {
    this.loadData();
    this.evaluateLifecycleTransitions();

    let list = [...this.campaigns];

    if (filters?.status) {
      list = list.filter(c => c.status === filters.status);
    }
    if (filters?.placementId) {
      list = list.filter(c => c.placementId === filters.placementId);
    }
    if (filters?.email) {
      list = list.filter(c => c.contactEmail.toLowerCase() === filters.email!.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(c =>
        c.campaignNumber.toLowerCase().includes(q) ||
        c.businessName.toLowerCase().includes(q) ||
        c.adTitle.toLowerCase().includes(q) ||
        c.contactEmail.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public getCampaignById(id: string): LiveBannerCampaign | undefined {
    this.loadData();
    this.evaluateLifecycleTransitions();
    return this.campaigns.find(c => c.id === id);
  }

  public getCalendarSlots(): CampaignCalendarSlot[] {
    this.loadData();
    this.evaluateLifecycleTransitions();

    return this.campaigns
      .filter(c => ["PAID", "APPROVED", "SCHEDULED", "LIVE", "EXPIRED"].includes(c.status))
      .map(c => ({
        id: c.id,
        campaignNumber: c.campaignNumber,
        businessName: c.businessName,
        adTitle: c.adTitle,
        placementId: c.placementId,
        startAtUtc: c.startAtUtc,
        endAtUtc: c.endAtUtc,
        status: c.status
      }));
  }

  public getAdminStats(): {
    totalCampaigns: number;
    pendingApprovals: number;
    scheduledCount: number;
    liveCount: number;
    expiredCount: number;
    totalRevenueINR: number;
    totalImpressions: number;
    totalClicks: number;
    averageCtr: number;
  } {
    this.loadData();
    this.evaluateLifecycleTransitions();

    const totalCampaigns = this.campaigns.length;
    const pendingApprovals = this.campaigns.filter(c => c.status === "PENDING_APPROVAL").length;
    const scheduledCount = this.campaigns.filter(c => c.status === "SCHEDULED").length;
    const liveCount = this.campaigns.filter(c => c.status === "LIVE").length;
    const expiredCount = this.campaigns.filter(c => c.status === "EXPIRED").length;

    const paidCampaigns = this.campaigns.filter(c => c.paymentStatus === "PAID");
    const totalRevenueINR = paidCampaigns.reduce((sum, c) => sum + c.finalAmountINR, 0);
    const totalImpressions = this.campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = this.campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const averageCtr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;

    return {
      totalCampaigns,
      pendingApprovals,
      scheduledCount,
      liveCount,
      expiredCount,
      totalRevenueINR,
      totalImpressions,
      totalClicks,
      averageCtr
    };
  }
}

export const advertisingService = new AdvertisingService();
