export type PillarKey = 
  | "movieBooking"
  | "eventBooking"
  | "filmProduction"
  | "eventManagement"
  | "brandPromotion"
  | "cineCoinsLoyalty";

export interface PillarInfo {
  key: PillarKey;
  name: string;
  tagline: string;
  icon: string;
  primaryColor: string;
  visitors: string;
  proposalsCount: number;
}

export type CMSMenuTab =
  | "dashboard"
  | "homepage_builder"
  | "pages"
  | "navigation"
  | "hero_slider"
  | "banners"
  | "media_library"
  | "poster_manager"
  | "pillar_specific"
  | "form_builder"
  | "seo"
  | "user_management"
  | "settings"
  | "activity_logs"
  | "backup_restore";

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft" | "scheduled";
  updatedAt: string;
  author: string;
  views: number;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CMSSection {
  id: string;
  type: string;
  title: string;
  enabled: boolean;
  order: number;
  content: any;
}

export interface MediaItem {
  id: string;
  name: string;
  folder: "Movies" | "Events" | "Posters" | "Celebrities" | "Banners" | "Gallery" | "Documents" | "Videos" | "Logos" | "Icons";
  type: "image" | "video" | "document";
  ext: string;
  size: string;
  url: string;
  uploadedAt: string;
}

export interface PosterItem {
  id: string;
  title: string;
  category: "Movie Posters" | "Event Posters" | "Celebrity Posters" | "Promotion Posters" | "Festival Posters" | "Sponsor Posters";
  imageUrl: string;
  status: "Active" | "Scheduled" | "Expired";
  startDate: string;
  expiryDate: string;
  impressions: number;
  clicks: number;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  desktopImage: string;
  mobileImage: string;
  buttonText: string;
  buttonLink: string;
  backgroundVideo?: string;
  order: number;
  status: "active" | "draft";
}

export interface CMSForm {
  id: string;
  name: string;
  fields: {
    id: string;
    label: string;
    type: "text" | "email" | "phone" | "dropdown" | "textarea" | "file";
    required: boolean;
    options?: string[];
  }[];
  submissionsCount: number;
}

export interface CMSUser {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Admin" | "Editor" | "Marketing" | "Finance" | "Customer Support";
  status: "Active" | "Inactive";
  lastActive: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  ip: string;
}
