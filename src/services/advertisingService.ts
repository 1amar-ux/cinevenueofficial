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
