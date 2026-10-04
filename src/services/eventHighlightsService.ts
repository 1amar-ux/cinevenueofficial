// ============================================================
// CineVenue Event Highlights & Live Categories Management Service
// Manages dynamic feeds for "Trending Live Experiences" and
// "Browse Live Categories" displayed on the user-facing events portal.
// Syncs across localStorage, window events, and global_settings.
// ============================================================

export interface TrendingExperienceItem {
  id: string;
  title: string;
  location: string;
  dynamicStat: string; // e.g. "🔥 85 passes booked in last 5 min"
  active: boolean;
}

export interface BrowseLiveCategoryItem {
  id: string;
  name: string;
  count: string; // e.g. "4 Shows"
  filterTag?: string;
  active: boolean;
}

export const STORAGE_KEYS = {
  TRENDING_EXPERIENCES: 'cine_trending_live_experiences',
  BROWSE_CATEGORIES: 'cine_browse_live_categories',
} as const;

export const DEFAULT_TRENDING_EXPERIENCES: TrendingExperienceItem[] = [
  {
    id: 'trend-1',
    title: 'Sufi Symphony Night',
    location: 'Vijayawada Convention Centre',
    dynamicStat: '🔥 85 passes booked in last 5 min',
    active: true,
  },
  {
    id: 'trend-2',
    title: 'Hyderabad Standup Fest',
    location: 'Shilpakala Hall',
    dynamicStat: '⚡ 110 tickets secured in last 10 min',
    active: true,
  },
  {
    id: 'trend-3',
    title: 'Alan Walker Sunburn Arena',
    location: 'Gachibowli Stadium',
    dynamicStat: '🔥 320 VIP passes sold in last 1 hr',
    active: true,
  },
];

export const DEFAULT_BROWSE_CATEGORIES: BrowseLiveCategoryItem[] = [
  { id: 'cat-1', name: 'EDM & DJ Arenas', count: '4 Shows', filterTag: 'Concerts', active: true },
  { id: 'cat-2', name: 'Standup Comedy', count: '6 Shows', filterTag: 'Comedy', active: true },
  { id: 'cat-3', name: 'Symphony Tours', count: '3 Shows', filterTag: 'Music', active: true },
  { id: 'cat-4', name: 'VIP Celeb Galas', count: '2 Shows', filterTag: 'Celebrity', active: true },
  { id: 'cat-5', name: 'Fan-Premieres', count: '5 Shows', filterTag: 'Premieres', active: true },
  { id: 'cat-6', name: 'Sufi Evenings', count: '3 Shows', filterTag: 'Sufi', active: true },
];

/**
 * Loads trending experiences with graceful fallback to default seeds
 */
export function getTrendingExperiences(): TrendingExperienceItem[] {
  if (typeof window === 'undefined') return DEFAULT_TRENDING_EXPERIENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRENDING_EXPERIENCES);
    if (!raw) return DEFAULT_TRENDING_EXPERIENCES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TRENDING_EXPERIENCES;
  } catch {
    return DEFAULT_TRENDING_EXPERIENCES;
  }
}

/**
 * Persists updated trending experiences and broadcasts live sync event
 */
export function saveTrendingExperiences(items: TrendingExperienceItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TRENDING_EXPERIENCES, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('cinevenue:trending_experiences_updated', { detail: items }));
    
    // Also sync to serverless global settings
    fetch('/api/v1/admin/platform-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trendingExperiences: items }),
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to save trending experiences:', e);
  }
}

/**
 * Loads browse live categories with graceful fallback to default seeds
 */
export function getBrowseLiveCategories(): BrowseLiveCategoryItem[] {
  if (typeof window === 'undefined') return DEFAULT_BROWSE_CATEGORIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BROWSE_CATEGORIES);
    if (!raw) return DEFAULT_BROWSE_CATEGORIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BROWSE_CATEGORIES;
  } catch {
    return DEFAULT_BROWSE_CATEGORIES;
  }
}

/**
 * Persists updated browse live categories and broadcasts live sync event
 */
export function saveBrowseLiveCategories(items: BrowseLiveCategoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.BROWSE_CATEGORIES, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('cinevenue:browse_categories_updated', { detail: items }));
    
    // Also sync to serverless global settings
    fetch('/api/v1/admin/platform-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ browseLiveCategories: items }),
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to save browse categories:', e);
  }
}
