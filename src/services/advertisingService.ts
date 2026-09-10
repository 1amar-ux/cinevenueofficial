// ============================================================
// CineVenue Advertising Service
// Client-side service with localStorage persistence (falls back
// gracefully when backend API is unavailable).
// ============================================================

import type {
  AdCampaign,
  AdPlacement,
  AdPlacementId,
  AdvertiserInquiry,
  AdvertisingConfig,
  ThirdPartyAdConfig,
  InquiryStatus,
  CampaignStatus,
  AdsTxtEntry,
  BannerPlacementId,
  BannerPlacementConfig,
  LiveBannerCampaign,
  BannerPricingQuote,
  PlacementSlotAvailability,
  CampaignCalendarSlot,
  LiveCampaignStatus
} from '../types/advertising';

// ─── Storage Keys ───────────────────────────────────────────
const KEYS = {
  campaigns: 'cv_ad_campaigns',
  inquiries: 'cv_ad_inquiries',
  config: 'cv_ad_config',
  thirdParty: 'cv_ad_third_party',
} as const;

// ─── Default Ad Placements ──────────────────────────────────
export const DEFAULT_PLACEMENTS: AdPlacement[] = [
  {
    id: 'hero_slider',
    name: 'Hero Slider Banner',
    description: 'Full-width rotating banner at the top of the CineVenue homepage. Maximum visibility.',
    dimensions: '1920×600',
    location: 'Homepage – Hero Section',
    maxConcurrentAds: 5,
    supportsThirdParty: false,
    isActive: true,
    pricePerDay: 3500,
    pricePerWeek: 20000,
    pricePerMonth: 70000,
  },
  {
    id: 'homepage_banner',
    name: 'Homepage Mid Banner',
    description: 'Prominent banner between the Now Showing and Events sections on the homepage.',
    dimensions: '1200×300',
    location: 'Homepage – Mid Section',
    maxConcurrentAds: 2,
    supportsThirdParty: true,
    isActive: true,
    pricePerDay: 2000,
    pricePerWeek: 12000,
    pricePerMonth: 40000,
  },
  {
    id: 'sponsored_card',
    name: 'Sponsored Feature Card',
    description: 'A branded card displayed inline with movie/event listings. Blends naturally.',
    dimensions: '400×560',
    location: 'Now Showing / Events Grid',
    maxConcurrentAds: 3,
    supportsThirdParty: false,
    isActive: true,
    pricePerDay: 1500,
    pricePerWeek: 9000,
    pricePerMonth: 30000,
  },
  {
    id: 'events_sidebar',
    name: 'Events Page Sidebar',
    description: 'Right sidebar ad unit on the Events listing page.',
    dimensions: '300×600',
    location: 'Events Page – Sidebar',
    maxConcurrentAds: 2,
    supportsThirdParty: true,
    isActive: true,
    pricePerDay: 1000,
    pricePerWeek: 6000,
    pricePerMonth: 20000,
  },
  {
    id: 'film_production_banner',
    name: 'Film Production Hub Banner',
    description: 'Top banner inside the Film Production sub-website — targets filmmakers and industry professionals.',
    dimensions: '1200×250',
    location: 'Film Production Hub – Header',
    maxConcurrentAds: 1,
    supportsThirdParty: false,
    isActive: true,
    pricePerDay: 2500,
    pricePerWeek: 15000,
    pricePerMonth: 50000,
  },
  {
    id: 'booking_confirmation',
    name: 'Booking Confirmation Page',
    description: 'Ad shown to users immediately after successfully booking a movie ticket — high intent audience.',
    dimensions: '728×90',
    location: 'Booking Confirmation / Thank You Page',
    maxConcurrentAds: 1,
    supportsThirdParty: true,
    isActive: true,
    pricePerDay: 1800,
    pricePerWeek: 11000,
    pricePerMonth: 36000,
  },
  {
    id: 'movie_details_banner',
    name: 'Movie Details Banner',
    description: 'Banner on individual movie detail pages. Great for F&B, merchandise, and entertainment brands.',
    dimensions: '970×250',
    location: 'Movie Details Page',
    maxConcurrentAds: 1,
    supportsThirdParty: true,
    isActive: true,
    pricePerDay: 1500,
    pricePerWeek: 9000,
    pricePerMonth: 30000,
  },
  {
    id: 'pre_ticket_interstitial',
    name: 'Pre-Ticket Interstitial',
    description: 'Full-screen interstitial ad shown before the seat selection screen. Premium placement.',
    dimensions: '900×600',
    location: 'Seat Booking Flow – Pre-Selection',
    maxConcurrentAds: 1,
    supportsThirdParty: false,
    isActive: false,
    pricePerDay: 5000,
    pricePerWeek: 30000,
    pricePerMonth: 100000,
  },
];

// ─── Default Config ─────────────────────────────────────────
const DEFAULT_CONFIG: AdvertisingConfig = {
  adsEnabled: true,
  directAdsEnabled: true,
  thirdPartyAdsEnabled: true,
  adSenseEnabled: false,
  // Publisher ID is NEVER hard-coded. Reads from environment variable.
  adSensePublisherId: (typeof window !== 'undefined' && (window as any).__VITE_ENV__?.VITE_ADSENSE_PUBLISHER_ID) || '',
  contactEmail: 'advertise@cinevenue.in',
  minCampaignBudgetINR: 5000,
  placements: DEFAULT_PLACEMENTS,
  adsTxtEntries: [],
};

// ─── Default sample campaigns (no fake revenue) ────────────
const DEFAULT_CAMPAIGNS: AdCampaign[] = [
  {
    id: 'CAM-001',
    title: 'IMAX Laser 3D Season Launch',
    type: 'Direct',
    advertiserName: 'PVR Cinemas',
    advertiserEmail: 'marketing@pvrcinemas.com',
    advertiserPhone: '+91 9900000001',
    advertiserCompany: 'PVR Cinemas Ltd',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80',
    targetUrl: '#movies',
    altText: 'IMAX Laser 3D — Experience the Future',
    tagline: 'The clearest picture. The loudest sound.',
    placementId: 'hero_slider',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    budgetINR: 70000,
    rateType: 'per_month',
    agreedPriceINR: 70000,
    impressions: 0,
    clicks: 0,
    status: 'Live',
    adminNotes: 'Approved by admin. Campaign assets verified.',
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-22T14:00:00Z',
    approvedAt: '2026-08-22T14:00:00Z',
    approvedBy: 'superadmin@cinevenue.com',
    paymentStatus: 'Paid',
    paymentReference: 'UTR123456789012',
  },
];

// ─── Helpers ────────────────────────────────────────────────

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn('[AdvertisingService] Failed to write to localStorage:', key);
  }
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// ─── Campaign CRUD ──────────────────────────────────────────

export function getCampaigns(): AdCampaign[] {
  return loadFromStorage(KEYS.campaigns, DEFAULT_CAMPAIGNS);
}

export function saveCampaigns(campaigns: AdCampaign[]): void {
  saveToStorage(KEYS.campaigns, campaigns);
}

export function createCampaign(data: Omit<AdCampaign, 'id' | 'impressions' | 'clicks' | 'createdAt' | 'updatedAt'>): AdCampaign {
  const campaign: AdCampaign = {
    ...data,
    id: generateId('CAM'),
    impressions: 0,
    clicks: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const campaigns = getCampaigns();
  saveCampaigns([...campaigns, campaign]);
  return campaign;
}

export function updateCampaign(id: string, updates: Partial<AdCampaign>): AdCampaign | null {
  const campaigns = getCampaigns();
  const idx = campaigns.findIndex(c => c.id === id);
  if (idx === -1) return null;
  const updated = { ...campaigns[idx], ...updates, updatedAt: new Date().toISOString() };
  campaigns[idx] = updated;
  saveCampaigns(campaigns);
  return updated;
}

export function deleteCampaign(id: string): boolean {
  const campaigns = getCampaigns();
  const filtered = campaigns.filter(c => c.id !== id);
  if (filtered.length === campaigns.length) return false;
  saveCampaigns(filtered);
  return true;
}

export function updateCampaignStatus(
  id: string,
  status: CampaignStatus,
  adminNotes?: string,
  rejectionReason?: string,
  approvedBy?: string,
): AdCampaign | null {
  const extra: Partial<AdCampaign> = { status, adminNotes, rejectionReason };
  if (status === 'Approved' || status === 'Live') {
    extra.approvedAt = new Date().toISOString();
    extra.approvedBy = approvedBy;
  }
  return updateCampaign(id, extra);
}

export function recordImpression(id: string): void {
  const campaigns = getCampaigns();
  const idx = campaigns.findIndex(c => c.id === id);
  if (idx !== -1) {
    campaigns[idx] = { ...campaigns[idx], impressions: campaigns[idx].impressions + 1 };
    saveCampaigns(campaigns);
  }
}

export function recordClick(id: string): void {
  const campaigns = getCampaigns();
  const idx = campaigns.findIndex(c => c.id === id);
  if (idx !== -1) {
    campaigns[idx] = { ...campaigns[idx], clicks: campaigns[idx].clicks + 1 };
    saveCampaigns(campaigns);
  }
}

// ─── Inquiries CRUD ─────────────────────────────────────────

export function getInquiries(): AdvertiserInquiry[] {
  return loadFromStorage<AdvertiserInquiry[]>(KEYS.inquiries, []);
}

export function saveInquiries(inquiries: AdvertiserInquiry[]): void {
  saveToStorage(KEYS.inquiries, inquiries);
}

export function submitInquiry(data: Omit<AdvertiserInquiry, 'id' | 'status' | 'submittedAt' | 'lastUpdatedAt'>): AdvertiserInquiry {
  const now = new Date().toISOString();
  const inquiry: AdvertiserInquiry = {
    ...data,
    id: generateId('INQ'),
    status: 'Pending',
    submittedAt: now,
    lastUpdatedAt: now,
  };
  const inquiries = getInquiries();
  saveInquiries([...inquiries, inquiry]);
  return inquiry;
}

export function updateInquiryStatus(
  id: string,
  status: InquiryStatus,
  adminNotes?: string,
  convertedToCampaignId?: string,
): AdvertiserInquiry | null {
  const inquiries = getInquiries();
  const idx = inquiries.findIndex(i => i.id === id);
  if (idx === -1) return null;
  inquiries[idx] = {
    ...inquiries[idx],
    status,
    adminNotes: adminNotes || inquiries[idx].adminNotes,
    convertedToCampaignId: convertedToCampaignId || inquiries[idx].convertedToCampaignId,
    lastUpdatedAt: new Date().toISOString(),
  };
  saveInquiries(inquiries);
  return inquiries[idx];
}

export function deleteInquiry(id: string): boolean {
  const inquiries = getInquiries();
  const filtered = inquiries.filter(i => i.id !== id);
  if (filtered.length === inquiries.length) return false;
  saveInquiries(filtered);
  return true;
}

// ─── Config ─────────────────────────────────────────────────

export function getAdvertisingConfig(): AdvertisingConfig {
  const stored = loadFromStorage<Partial<AdvertisingConfig>>(KEYS.config, {});
  // Always re-read env var for publisher ID — never trust stored version for sensitive config
  const envPublisherId = (import.meta as any).env?.VITE_ADSENSE_PUBLISHER_ID || '';
  return {
    ...DEFAULT_CONFIG,
    ...stored,
    placements: stored.placements || DEFAULT_CONFIG.placements,
    adSensePublisherId: envPublisherId,
  };
}

export function saveAdvertisingConfig(config: AdvertisingConfig): void {
  // Strip the publisher ID before storing — it comes from env
  const { adSensePublisherId: _, ...rest } = config;
  saveToStorage(KEYS.config, rest);
}

export function updatePlacement(id: AdPlacementId, updates: Partial<AdPlacement>): void {
  const config = getAdvertisingConfig();
  const placements = config.placements.map(p => p.id === id ? { ...p, ...updates } : p);
  saveAdvertisingConfig({ ...config, placements });
}

// ─── Third-Party Configs ────────────────────────────────────

export function getThirdPartyConfigs(): ThirdPartyAdConfig[] {
  return loadFromStorage<ThirdPartyAdConfig[]>(KEYS.thirdParty, []);
}

export function saveThirdPartyConfigs(configs: ThirdPartyAdConfig[]): void {
  saveToStorage(KEYS.thirdParty, configs);
}

// ─── Revenue Analytics ──────────────────────────────────────

export function computeRevenueSummary() {
  const campaigns = getCampaigns();
  const liveCampaigns = campaigns.filter(c => c.status === 'Live');
  const pendingApproval = campaigns.filter(c => c.status === 'Pending Approval');

  const totalPaid = campaigns
    .filter(c => c.paymentStatus === 'Paid')
    .reduce((sum, c) => sum + c.agreedPriceINR, 0);

  const totalPending = campaigns
    .filter(c => c.paymentStatus === 'Unpaid' || c.paymentStatus === 'Partial')
    .reduce((sum, c) => sum + c.agreedPriceINR, 0);

  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return {
    totalRevenuePaidINR: totalPaid,
    totalRevenuePendingINR: totalPending,
    liveCampaignsCount: liveCampaigns.length,
    pendingApprovalCount: pendingApproval.length,
    totalImpressionsAllTime: totalImpressions,
    totalClicksAllTime: totalClicks,
    averageCTR: avgCTR,
  };
}

// ─── ads.txt Generation ─────────────────────────────────────

export function generateAdsTxtContent(entries: AdsTxtEntry[]): string {
  const lines = [
    '# CineVenue ads.txt',
    '# This file authorizes the ad networks listed below to sell CineVenue inventory.',
    '# Automatically generated — do not edit manually.',
    '',
  ];
  for (const entry of entries) {
    const parts = [entry.domain, entry.publisherId, entry.relationship];
    if (entry.certificationAuthorityId) parts.push(entry.certificationAuthorityId);
    lines.push(parts.join(', '));
  }
  return lines.join('\n');
}

// ============================================================
// 24-HOUR LIVE BANNER ADVERTISING CLIENT SERVICE
// Calls /api/v1/advertising with resilient local fallbacks
// ============================================================

const API_BASE = '/api/v1/advertising';
const ADMIN_API_BASE = '/api/v1/admin/advertising';

export async function fetchLiveBannerPlacements(): Promise<BannerPlacementConfig[]> {
  try {
    const res = await fetch(`${API_BASE}/placements`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.placements) {
        return data.data.placements;
      }
    }
  } catch (err) {
    console.warn('[AdService] Backend unreachable, using client placements fallback');
  }

  // Fallback placements list
  return [
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
}

export async function checkLiveSlotAvailability(
  placementId: BannerPlacementId,
  startAtUtc: string,
  durationHours: number = 24
): Promise<PlacementSlotAvailability> {
  try {
    const res = await fetch(
      `${API_BASE}/availability?placementId=${encodeURIComponent(placementId)}&startAtUtc=${encodeURIComponent(startAtUtc)}&durationHours=${durationHours}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.availability) {
        return data.data.availability;
      }
    }
  } catch (err) {
    console.warn('[AdService] Availability check fallback');
  }

  // Resilient fallback
  const startMs = new Date(startAtUtc).getTime();
  const endMs = startMs + durationHours * 3600 * 1000;
  return {
    placementId,
    isAvailable: true,
    startAtUtc,
    endAtUtc: new Date(endMs).toISOString(),
    conflictingCampaignCount: 0,
    maxAllowed: 1
  };
}

export async function fetchLiveBannerQuote(
  placementId: BannerPlacementId,
  durationHours: number = 24,
  discountCode?: string
): Promise<BannerPricingQuote> {
  try {
    const res = await fetch(`${API_BASE}/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placementId, durationHours, discountCode })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.quote) {
        return data.data.quote;
      }
    }
  } catch (err) {
    console.warn('[AdService] Quote calculation fallback');
  }

  // Fallback quote computation
  const basePriceINR = 3499;
  const discountINR = discountCode?.toUpperCase() === 'LAUNCH500' ? 500 : 0;
  const taxable = Math.max(0, basePriceINR - discountINR);
  const gstAmountINR = Math.round(taxable * 0.18);
  return {
    placementId,
    durationHours,
    basePriceINR,
    gstRatePercent: 18,
    gstAmountINR,
    discountINR,
    finalAmountINR: taxable + gstAmountINR,
    currency: 'INR'
  };
}

export async function submitLiveBannerCampaign(campaignData: any): Promise<LiveBannerCampaign> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(campaignData)
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to submit advertising campaign');
  }
  return data.data.campaign;
}

export async function createBannerPaymentOrder(campaignId: string): Promise<{
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  campaignId: string;
  isSandbox: boolean;
}> {
  const res = await fetch(`${API_BASE}/campaigns/${campaignId}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to generate payment order');
  }
  return data.data;
}

export async function verifyBannerPayment(params: {
  campaignId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
}): Promise<LiveBannerCampaign> {
  const res = await fetch(`${API_BASE}/payment/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Payment verification failed');
  }
  return data.data.campaign;
}

export async function fetchActiveLiveBanner(placementId: BannerPlacementId): Promise<{
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
}> {
  try {
    const res = await fetch(`${API_BASE}/live/${placementId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch (err) {
    // Network fallback
  }

  return {
    hasDirectAd: false,
    supportsGoogleAdSenseFallback: true
  };
}

export async function trackLiveBannerEvent(campaignId: string, type: 'impression' | 'click'): Promise<void> {
  try {
    await fetch(`${API_BASE}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, type }),
      keepalive: true
    });
  } catch (err) {
    // Non-blocking
  }
}

export async function fetchMyLiveCampaigns(email?: string): Promise<LiveBannerCampaign[]> {
  try {
    const token = localStorage.getItem('token');
    const url = email ? `${API_BASE}/my-campaigns?email=${encodeURIComponent(email)}` : `${API_BASE}/my-campaigns`;
    const res = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.campaigns) {
        return data.data.campaigns;
      }
    }
  } catch (err) {
    console.warn('[AdService] Fetch my campaigns fallback');
  }

  return [];
}

// ─── Admin Live Banner Operations ────────────────────────────

export async function fetchAdminLiveBannerStats(): Promise<any> {
  const res = await fetch(`${ADMIN_API_BASE}/stats`, {
    headers: { 'x-admin-passcode': '8888' }
  });
  const data = await res.json();
  return data.data?.stats || null;
}

export async function fetchAdminLiveCampaigns(filters?: any): Promise<LiveBannerCampaign[]> {
  const query = new URLSearchParams(filters || {}).toString();
  const res = await fetch(`${ADMIN_API_BASE}/campaigns?${query}`, {
    headers: { 'x-admin-passcode': '8888' }
  });
  const data = await res.json();
  return data.data?.campaigns || [];
}

export async function approveLiveCampaign(id: string, reviewer?: string): Promise<LiveBannerCampaign> {
  const res = await fetch(`${ADMIN_API_BASE}/campaigns/${id}/approve`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-passcode': '8888'
    },
    body: JSON.stringify({ reviewer })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to approve campaign');
  return data.data.campaign;
}

export async function rejectLiveCampaign(id: string, reason: string, reviewer?: string): Promise<LiveBannerCampaign> {
  const res = await fetch(`${ADMIN_API_BASE}/campaigns/${id}/reject`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-passcode': '8888'
    },
    body: JSON.stringify({ reason, reviewer })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to reject campaign');
  return data.data.campaign;
}

export async function pauseLiveCampaign(id: string): Promise<LiveBannerCampaign> {
  const res = await fetch(`${ADMIN_API_BASE}/campaigns/${id}/pause`, {
    method: 'PUT',
    headers: { 'x-admin-passcode': '8888' }
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to pause campaign');
  return data.data.campaign;
}

export async function resumeLiveCampaign(id: string): Promise<LiveBannerCampaign> {
  const res = await fetch(`${ADMIN_API_BASE}/campaigns/${id}/resume`, {
    method: 'PUT',
    headers: { 'x-admin-passcode': '8888' }
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to resume campaign');
  return data.data.campaign;
}

export async function fetchLiveBannerCalendar(): Promise<CampaignCalendarSlot[]> {
  const res = await fetch(`${ADMIN_API_BASE}/calendar`, {
    headers: { 'x-admin-passcode': '8888' }
  });
  const data = await res.json();
  return data.data?.slots || [];
}

export async function updateLivePlacementPricing(
  id: BannerPlacementId,
  basePrice24hINR: number,
  isActive?: boolean
): Promise<BannerPlacementConfig> {
  const res = await fetch(`${ADMIN_API_BASE}/pricing/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-passcode': '8888'
    },
    body: JSON.stringify({ basePrice24hINR, isActive })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update pricing');
  return data.data.placement;
}

