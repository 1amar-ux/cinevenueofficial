// ============================================================
// CineVenue Advertising & Monetization System — Type Definitions
// ============================================================

// ─── Ad Placement / Slot Definitions ───────────────────────

export type AdPlacementId =
  | 'hero_slider'
  | 'homepage_banner'
  | 'sponsored_card'
  | 'events_sidebar'
  | 'film_production_banner'
  | 'booking_confirmation'
  | 'movie_details_banner'
  | 'pre_ticket_interstitial';

export interface AdPlacement {
  id: AdPlacementId;
  name: string;
  description: string;
  dimensions: string;         // e.g. "1200x400"
  location: string;           // human-readable page location
  maxConcurrentAds: number;
  supportsThirdParty: boolean; // can host Google AdSense / DFP tags
  isActive: boolean;
  pricePerDay: number;        // INR base price for direct campaigns
  pricePerWeek: number;
  pricePerMonth: number;
}

// ─── Direct Ad Campaign (sold by CineVenue) ────────────────

export type CampaignStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Live'
  | 'Paused'
  | 'Completed'
  | 'Rejected';

export type CampaignType = 'Direct' | 'ThirdParty';

export interface AdCampaign {
  id: string;
  title: string;
  type: CampaignType;

  // Advertiser info
  advertiserName: string;
  advertiserEmail: string;
  advertiserPhone?: string;
  advertiserCompany?: string;

  // Creative assets
  imageUrl: string;
  targetUrl: string;
  altText?: string;
  tagline?: string;           // short copy shown on card
  logoUrl?: string;

  // Placement
  placementId: AdPlacementId;

  // Schedule
  startDate: string;          // ISO date string
  endDate: string;

  // Pricing
  budgetINR: number;          // total campaign budget in INR
  rateType: 'per_day' | 'per_week' | 'per_month' | 'flat_campaign';
  agreedPriceINR: number;     // final negotiated price

  // Analytics
  impressions: number;
  clicks: number;
  
  // Lifecycle
  status: CampaignStatus;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;

  // Payment
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid' | 'Refunded';
  paymentReference?: string;
  invoiceUrl?: string;
}

// ─── Third-Party Ad Network Config ─────────────────────────

export interface ThirdPartyAdConfig {
  id: string;
  networkName: 'Google AdSense' | 'Google Ad Manager' | 'Custom';
  publisherId: string;             // e.g. pub-XXXXXXXXXXXXXXXX (loaded from env)
  adSlotId: string;                // e.g. ca-pub-xxx/yyy
  placementId: AdPlacementId;
  isActive: boolean;
  testMode: boolean;               // use test ads; never artificial clicks
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Advertiser Inquiry / Request Form ─────────────────────

export type InquiryStatus = 'Pending' | 'In Review' | 'Contacted' | 'Converted' | 'Closed';

export interface AdvertiserInquiry {
  id: string;
  // Contact info
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyName: string;
  companyWebsite?: string;

  // Campaign intent
  preferredPlacements: AdPlacementId[];
  targetAudience: string;
  campaignObjective: string;    // e.g. "Brand awareness", "Drive ticket sales"
  budgetRangeINR: string;       // e.g. "₹10,000 – ₹50,000"
  preferredStartDate?: string;
  preferredDuration?: string;   // e.g. "1 month"
  additionalMessage?: string;

  // Metadata
  status: InquiryStatus;
  adminNotes?: string;
  submittedAt: string;
  lastUpdatedAt: string;
  convertedToCampaignId?: string;
}

// ─── Revenue Dashboard Summary ─────────────────────────────

export interface AdvertisingRevenueSummary {
  totalRevenuePaidINR: number;
  totalRevenuePendingINR: number;
  liveCampaignsCount: number;
  pendingApprovalCount: number;
  totalImpressionsAllTime: number;
  totalClicksAllTime: number;
  averageCTR: number;           // percentage
  topPerformingCampaignId?: string;
  monthlyRevenueINR: { month: string; revenue: number }[];
}

// ─── ads.txt Entry ─────────────────────────────────────────

export interface AdsTxtEntry {
  domain: string;
  publisherId: string;
  relationship: 'DIRECT' | 'RESELLER';
  certificationAuthorityId?: string;
}

// ─── Admin Config ──────────────────────────────────────────

export interface AdvertisingConfig {
  adsEnabled: boolean;
  directAdsEnabled: boolean;
  thirdPartyAdsEnabled: boolean;
  adSenseEnabled: boolean;
  adSensePublisherId: string;    // populated from VITE_ADSENSE_PUBLISHER_ID env var
  contactEmail: string;          // advertise@cinevenue.in
  minCampaignBudgetINR: number;
  placements: AdPlacement[];
  adsTxtEntries: AdsTxtEntry[];
}

// ─── 24-Hour Live Banner Advertising Types ─────────────────

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
  desktopDimensions: string;
  mobileDimensions: string;
  aspectRatio: string;
  maxConcurrentCampaigns: number;
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
}

export interface LiveBannerCampaign {
  id: string;
  campaignNumber: string;
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
  creative: BannerCreative;
  durationHours: number;
  startAtUtc: string;
  endAtUtc: string;
  basePriceINR: number;
  gstRatePercent: number;
  gstAmountINR: number;
  discountINR: number;
  finalAmountINR: number;
  currency: string;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  paymentGateway: 'CASHFREE' | 'UPI' | 'SANDBOX';
  paymentOrderId?: string;
  paymentTransactionId?: string;
  paidAtUtc?: string;
  status: LiveCampaignStatus;
  adminNotes?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAtUtc?: string;
  pausedAtUtc?: string;
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

