// ============================================================
// CineVenue 24-Hour Live Banner Advertising System — Types
// ============================================================

export type LiveCampaignStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'PAYMENT_PROCESSING'
  | 'PAID'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'LIVE'
  | 'EXPIRED'
  | 'PAUSED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'REFUNDED';

export type BannerPlacementId =
  | 'homepage_top'
  | 'homepage_middle'
  | 'homepage_bottom'
  | 'movies_top'
  | 'movie_details'
  | 'events_top'
  | 'event_details'
  | 'film_production_top'
  | 'film_production_middle'
  | 'content_top'
  | 'content_sidebar';

export interface BannerPlacementConfig {
  id: BannerPlacementId;
  name: string;
  page: string;
  locationDescription: string;
  desktopDimensions: string; // e.g. "1200x300"
  mobileDimensions: string;  // e.g. "600x300"
  aspectRatio: string;       // e.g. "4:1"
  maxConcurrentCampaigns: number; // usually 1 for exclusive 24h slot
  basePrice24hINR: number;
  isActive: boolean;
  supportsGoogleAdSenseFallback: boolean;
}

export interface BannerCreative {
  desktopImageUrl: string;
  mobileImageUrl?: string;
  altText: string;
  width?: number;
  height?: number;
  mimeType?: string;
}

export interface LiveBannerCampaign {
  id: string;
  campaignNumber: string; // e.g. "CV-AD-2026-001"
  userId?: string;

  // Advertiser Information
  businessName: string;
  campaignName: string;
  adTitle: string;
  shortDescription?: string;
  destinationUrl: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;

  // Placement & Creative
  placementId: BannerPlacementId;
  creative: BannerCreative;

  // Time & Scheduling (Stored in strict UTC ISO strings)
  durationHours: number; // Default 24
  startAtUtc: string;    // e.g. "2026-09-10T12:00:00.000Z"
  endAtUtc: string;      // e.g. "2026-09-11T12:00:00.000Z"

  // Financials & Pricing (Calculated Server-Side)
  basePriceINR: number;
  gstRatePercent: number; // e.g. 18
  gstAmountINR: number;
  discountINR: number;
  finalAmountINR: number;
  currency: string; // "INR"

  // Payment Tracking
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  paymentGateway: 'CASHFREE' | 'UPI' | 'SANDBOX';
  paymentOrderId?: string;
  paymentTransactionId?: string;
  paidAtUtc?: string;

  // Lifecycle & Moderation
  status: LiveCampaignStatus;
  adminNotes?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAtUtc?: string;
  pausedAtUtc?: string;

  // Privacy-conscious Metrics
  impressions: number;
  clicks: number;
  ctr: number;

  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface BannerPricingQuote {
  placementId: BannerPlacementId;
  durationHours: number;
  basePriceINR: number;
  gstRatePercent: number;
  gstAmountINR: number;
  discountINR: number;
  finalAmountINR: number;
  currency: string;
}

export interface PlacementSlotAvailability {
  placementId: BannerPlacementId;
  isAvailable: boolean;
  startAtUtc: string;
  endAtUtc: string;
  conflictingCampaignCount: number;
  maxAllowed: number;
  reason?: string;
}

export interface CampaignCalendarSlot {
  id: string;
  campaignNumber: string;
  businessName: string;
  adTitle: string;
  placementId: BannerPlacementId;
  startAtUtc: string;
  endAtUtc: string;
  status: LiveCampaignStatus;
}
