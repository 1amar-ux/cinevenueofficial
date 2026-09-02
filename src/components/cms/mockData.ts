import { PillarInfo, PillarKey, CMSPage, CMSSection, MediaItem, PosterItem, HeroSlide, CMSForm, CMSUser, ActivityLog } from "./types";

export const PILLARS_LIST: PillarInfo[] = [
  {
    key: "movieBooking",
    name: "Movie Booking CMS",
    tagline: "Theatres Catalog, Showtimes, Seat Maps & Instant Tickets",
    icon: "🎬",
    primaryColor: "#D4AF37",
    visitors: "14,280 / day",
    proposalsCount: 18
  },
  {
    key: "eventBooking",
    name: "Event Booking CMS",
    tagline: "Live Concerts, Fan Galas, Comedy Shows & VIP Passes",
    icon: "🎟️",
    primaryColor: "#E11D48",
    visitors: "8,920 / day",
    proposalsCount: 12
  },
  {
    key: "filmProduction",
    name: "Film Production CMS",
    tagline: "Casting Hub, Scripts, Camera Rentals & Production Line",
    icon: "🎥",
    primaryColor: "#3B82F6",
    visitors: "5,640 / day",
    proposalsCount: 24
  },
  {
    key: "eventManagement",
    name: "Event Management CMS",
    tagline: "Grand Audio Launches, Stadium Setups & Celeb Shows",
    icon: "🎤",
    primaryColor: "#10B981",
    visitors: "7,150 / day",
    proposalsCount: 31
  },
  {
    key: "brandPromotion",
    name: "Brand Publicity CMS",
    tagline: "Theater Slide Ads, On-Screen Trailers & PR Campaigns",
    icon: "📢",
    primaryColor: "#F59E0B",
    visitors: "6,400 / day",
    proposalsCount: 15
  },
  {
    key: "cineCoinsLoyalty",
    name: "CineCoins Loyalty CMS",
    tagline: "Rewards Store, Member Tiers, Gamified Quests & Coins Wallet",
    icon: "🪙",
    primaryColor: "#F59E0B",
    visitors: "11,850 / day",
    proposalsCount: 28
  }
];

export const INITIAL_PAGES: Record<PillarKey, CMSPage[]> = {
  movieBooking: [
    { id: "p1", title: "Home Page", slug: "/", status: "published", updatedAt: "2026-08-04 14:20", author: "Super Admin", views: 42100, content: "<h1>Welcome to CineVenue Movie Booking</h1><p>Browse IMAX & 4DX cinemas nationwide.</p>" },
    { id: "p2", title: "Now Showing Movies", slug: "/movies/now-showing", status: "published", updatedAt: "2026-08-03 11:15", author: "Movie Editor", views: 28400, content: "<h2>Now Showing Movies</h2><p>Select your favorite cinema and pick recliners.</p>" },
    { id: "p3", title: "Upcoming Blockbusters", slug: "/movies/upcoming", status: "published", updatedAt: "2026-08-02 09:30", author: "Movie Editor", views: 19800, content: "<h2>Upcoming Releases 2026</h2><p>Pre-book tickets for first day first show.</p>" },
    { id: "p4", title: "Multiplex Theatres Directory", slug: "/theatres", status: "published", updatedAt: "2026-08-01 16:45", author: "Admin", views: 12500, content: "<h2>Our Partner Screen Locations</h2><p>Hyderabad, Bengaluru, Chennai, Mumbai.</p>" },
    { id: "p5", title: "Terms & Refund Policy", slug: "/legal/terms", status: "published", updatedAt: "2026-07-28 10:00", author: "Legal Desk", views: 3400, content: "<h2>Ticket Cancellation & Refund Rules</h2><p>100% instant refund up to 4 hours before showtime.</p>" }
  ],
  eventBooking: [
    { id: "p1", title: "Events Central Portal", slug: "/", status: "published", updatedAt: "2026-08-04 18:00", author: "Event Lead", views: 31000, content: "<h1>CineVenue Live Events</h1><p>Book passes for concerts and fan events.</p>" },
    { id: "p2", title: "Live Concerts & Music Fests", slug: "/events/concerts", status: "published", updatedAt: "2026-08-03 12:00", author: "Event Lead", views: 18200, content: "<h2>Live Concerts</h2><p>Featuring A.R. Rahman, Anirudh & Sunburn Tour.</p>" },
    { id: "p3", title: "Standup Comedy & Plays", slug: "/events/comedy", status: "published", updatedAt: "2026-08-02 15:10", author: "Editor", views: 9400, content: "<h2>Comedy Nights</h2><p>Live performances by top comedians.</p>" }
  ],
  filmProduction: [
    { id: "p1", title: "Film Production Division", slug: "/", status: "published", updatedAt: "2026-08-04 10:00", author: "Production Admin", views: 15400, content: "<h1>CineVenue Film Production House</h1><p>Line production, VFX, camera rentals & casting.</p>" },
    { id: "p2", title: "Casting Call Portal", slug: "/casting", status: "published", updatedAt: "2026-08-03 14:00", author: "Casting Director", views: 24100, content: "<h2>Audition Registrations</h2><p>Apply for upcoming lead and supporting roles.</p>" },
    { id: "p3", title: "Camera & Lens Rental Suite", slug: "/rentals", status: "published", updatedAt: "2026-08-01 08:30", author: "Technical Lead", views: 6700, content: "<h2>ARRI Alexa Mini LF & RED V-Raptor Packages</h2><p>Book high-end cine gear.</p>" }
  ],
  eventManagement: [
    { id: "p1", title: "Event Management Division", slug: "/", status: "published", updatedAt: "2026-08-04 16:20", author: "Event Manager", views: 22100, content: "<h1>Turnkey Event Line Production</h1><p>Pre-release audio launches & stadium galas.</p>" },
    { id: "p2", title: "Stage Setups & LED Arenas", slug: "/services/stage-setup", status: "published", updatedAt: "2026-08-02 19:40", author: "Stage Tech", views: 8900, content: "<h2>360 Curved LED Walls & Trussing</h2><p>State of the art stage architecture.</p>" }
  ],
  brandPromotion: [
    { id: "p1", title: "Brand Publicity & Ads Hub", slug: "/", status: "published", updatedAt: "2026-08-04 11:50", author: "Marketing Head", views: 18900, content: "<h1>Cinema Advertising & Brand Tie-ups</h1><p>On-screen 4K slide ads, foyer branding & digital PR.</p>" },
    { id: "p2", title: "Multiplex Ad Slots Catalog", slug: "/ad-slots", status: "published", updatedAt: "2026-08-01 17:00", author: "Media Planner", views: 11200, content: "<h2>Screen Time Rate Cards</h2><p>Book interval slide ads across 250+ multiplex screens.</p>" }
  ],
  cineCoinsLoyalty: [
    { id: "p1", title: "CineCoins Central Portal", slug: "/cinecoins", status: "published", updatedAt: "2026-08-07 10:00", author: "Loyalty Admin", views: 28900, content: "<h1>CineCoins Loyalty Program</h1><p>Earn 10% CineCoins cashback on every movie & event booking.</p>" },
    { id: "p2", title: "Rewards Store Catalog", slug: "/cinecoins/rewards-store", status: "published", updatedAt: "2026-08-06 14:00", author: "Loyalty Manager", views: 19400, content: "<h2>Exclusive CineCoins Rewards</h2><p>Redeem free movie tickets, food vouchers & VIP passes.</p>" },
    { id: "p3", title: "CineCoins Earning & Rules", slug: "/cinecoins/rules", status: "published", updatedAt: "2026-08-05 11:30", author: "Marketing Lead", views: 15200, content: "<h2>How to Earn & Redeem CineCoins</h2><p>Earn coins on movie tickets, event registrations, and daily logins.</p>" }
  ]
};

export const DEFAULT_HOMEPAGE_SECTIONS: Record<PillarKey, CMSSection[]> = {
  movieBooking: [
    { id: "sec_hero", type: "Hero Banner", title: "Main Billboard Slider", enabled: true, order: 1, content: { slidesCount: 5, autoPlay: true } },
    { id: "sec_now_showing", type: "Featured Movies", title: "Now Showing in Theatres", enabled: true, order: 2, content: { filter: "now_showing", limit: 8 } },
    { id: "sec_trailers", type: "Videos", title: "Trending 4K Teasers & Trailers", enabled: true, order: 3, content: { limit: 4 } },
    { id: "sec_upcoming", type: "Featured Movies", title: "Upcoming Blockbusters", enabled: true, order: 4, content: { filter: "upcoming", limit: 6 } },
    { id: "sec_offers", type: "Banners", title: "Credit Card & UPI Discount Banners", enabled: true, order: 5, content: { layout: "grid" } },
    { id: "sec_faq", type: "FAQ", title: "Frequently Asked Questions", enabled: true, order: 6, content: { itemsCount: 6 } },
    { id: "sec_footer", type: "Footer", title: "Site Footer & Social Links", enabled: true, order: 7, content: { copyright: "© 2026 CineVenue Entertainment" } }
  ],
  eventBooking: [
    { id: "sec_hero", type: "Hero Banner", title: "Live Events Hero Carousel", enabled: true, order: 1, content: { slidesCount: 4 } },
    { id: "sec_featured_events", type: "Featured Events", title: "Hot Concerts & Pro Nights", enabled: true, order: 2, content: { limit: 6 } },
    { id: "sec_categories", type: "Featured Cards", title: "Browse by Genre (Music, Comedy, Sports)", enabled: true, order: 3, content: {} },
    { id: "sec_sponsors", type: "Sponsors", title: "Official Title Sponsors", enabled: true, order: 4, content: {} },
    { id: "sec_footer", type: "Footer", title: "Event Portal Footer", enabled: true, order: 5, content: {} }
  ],
  filmProduction: [
    { id: "sec_hero", type: "Hero Banner", title: "Film Production Showreel Hero", enabled: true, order: 1, content: {} },
    { id: "sec_services", type: "Services", title: "Turnkey Line Production Services", enabled: true, order: 2, content: {} },
    { id: "sec_casting", type: "Featured Cards", title: "Open Auditions & Casting Calls", enabled: true, order: 3, content: {} },
    { id: "sec_rentals", type: "Featured Cards", title: "Cine Camera & Lighting Inventory", enabled: true, order: 4, content: {} },
    { id: "sec_footer", type: "Footer", title: "Production House Footer", enabled: true, order: 5, content: {} }
  ],
  eventManagement: [
    { id: "sec_hero", type: "Hero Banner", title: "Grand Pre-Release Stage Hero", enabled: true, order: 1, content: {} },
    { id: "sec_portfolio", type: "Services", title: "Event Management Portfolio", enabled: true, order: 2, content: {} },
    { id: "sec_gallery", type: "Gallery", title: "Past Stadium Stage Lighting Showcase", enabled: true, order: 3, content: {} },
    { id: "sec_contact", type: "Contact Section", title: "B2B Event Booking Inquiry", enabled: true, order: 4, content: {} },
    { id: "sec_footer", type: "Footer", title: "Management Division Footer", enabled: true, order: 5, content: {} }
  ],
  brandPromotion: [
    { id: "sec_hero", type: "Hero Banner", title: "Theatre Ad Space Spotlight", enabled: true, order: 1, content: {} },
    { id: "sec_services", type: "Services", title: "On-Screen & Foyer Branding Solutions", enabled: true, order: 2, content: {} },
    { id: "sec_testimonials", type: "Testimonials", title: "Brand Partner Case Studies", enabled: true, order: 3, content: {} },
    { id: "sec_contact", type: "Contact Section", title: "Request Rate Card & Proposal", enabled: true, order: 4, content: {} },
    { id: "sec_footer", type: "Footer", title: "Brand Publicity Footer", enabled: true, order: 5, content: {} }
  ],
  cineCoinsLoyalty: [
    { id: "sec_hero", type: "Hero Banner", title: "CineCoins Cashback Billboard", enabled: true, order: 1, content: {} },
    { id: "sec_rewards", type: "Featured Cards", title: "Trending Store Rewards", enabled: true, order: 2, content: {} },
    { id: "sec_challenges", type: "Featured Cards", title: "Gamified Daily Challenges & Quests", enabled: true, order: 3, content: {} },
    { id: "sec_rules", type: "Services", title: "CineCoins Earning & Rules", enabled: true, order: 4, content: {} },
    { id: "sec_footer", type: "Footer", title: "CineCoins Portal Footer", enabled: true, order: 5, content: {} }
  ]
};

export const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: "hs_1",
    title: "Kalki 2898 AD: Chapter 2",
    subtitle: "Experience in IMAX 3D with Dolby Atmos Audio",
    desktopImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80",
    mobileImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
    buttonText: "Book Tickets Now",
    buttonLink: "/booking",
    order: 1,
    status: "active"
  },
  {
    id: "hs_2",
    title: "A.R. Rahman Live in Concert",
    subtitle: "Stadium Mega Night - Hyderabad Gachibowli",
    desktopImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80",
    mobileImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    buttonText: "Reserve VIP Pass",
    buttonLink: "/events",
    order: 2,
    status: "active"
  },
  {
    id: "hs_3",
    title: "CineVenue Line Production Hub",
    subtitle: "Complete pan-India shooting permissions, equipment & casting",
    desktopImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80",
    mobileImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
    buttonText: "Submit Project Brief",
    buttonLink: "/production",
    order: 3,
    status: "active"
  }
];

export const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  { id: "m1", name: "kalki_2898_official_poster.jpg", folder: "Posters", type: "image", ext: "jpg", size: "3.4 MB", url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80", uploadedAt: "2026-08-04" },
  { id: "m2", name: "stadium_stage_lighting_render.png", folder: "Events", type: "image", ext: "png", size: "5.1 MB", url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80", uploadedAt: "2026-08-03" },
  { id: "m3", name: "camera_rental_rate_card_2026.pdf", folder: "Documents", type: "document", ext: "pdf", size: "1.2 MB", url: "#", uploadedAt: "2026-08-02" },
  { id: "m4", name: "trailer_4k_hdr_master.mp4", folder: "Videos", type: "video", ext: "mp4", size: "148 MB", url: "#", uploadedAt: "2026-08-01" },
  { id: "m5", name: "ar_rahman_vip_banner.jpg", folder: "Banners", type: "image", ext: "jpg", size: "2.8 MB", url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80", uploadedAt: "2026-07-30" },
  { id: "m6", name: "cinevenue_hd_vector_logo.svg", folder: "Logos", type: "image", ext: "svg", size: "120 KB", url: "#", uploadedAt: "2026-07-25" }
];

export const INITIAL_POSTERS: PosterItem[] = [
  { id: "post_1", title: "Devara Part 1 - IMAX Poster", category: "Movie Posters", imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80", status: "Active", startDate: "2026-08-01", expiryDate: "2026-09-30", impressions: 45200, clicks: 8120 },
  { id: "post_2", title: "Sunburn Arena VIP Gala Poster", category: "Event Posters", imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80", status: "Active", startDate: "2026-08-02", expiryDate: "2026-08-25", impressions: 32100, clicks: 5400 },
  { id: "post_3", title: "Prabhas Star Fan Meet Poster", category: "Celebrity Posters", imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80", status: "Scheduled", startDate: "2026-08-15", expiryDate: "2026-08-30", impressions: 1200, clicks: 180 },
  { id: "post_4", title: "Theatre Slide Ad Brand Poster", category: "Promotion Posters", imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80", status: "Active", startDate: "2026-07-20", expiryDate: "2026-08-20", impressions: 68900, clicks: 12400 }
];

export const INITIAL_FORMS: CMSForm[] = [
  {
    id: "f1",
    name: "General Contact & Support Form",
    fields: [
      { id: "f1_1", label: "Full Name", type: "text", required: true },
      { id: "f1_2", label: "Email Address", type: "email", required: true },
      { id: "f1_3", label: "Phone Number", type: "phone", required: true },
      { id: "f1_4", label: "Inquiry Message", type: "textarea", required: true }
    ],
    submissionsCount: 142
  },
  {
    id: "f2",
    name: "B2B Production & Event Proposal Form",
    fields: [
      { id: "f2_1", label: "Company / Production Banner", type: "text", required: true },
      { id: "f2_2", label: "Service Pillar Required", type: "dropdown", required: true, options: ["Movie Booking", "Event Booking", "Film Production", "Event Management", "Brand Publicity"] },
      { id: "f2_3", label: "Estimated Budget (INR)", type: "text", required: false },
      { id: "f2_4", label: "Upload Script / Event Deck", type: "file", required: false }
    ],
    submissionsCount: 89
  }
];

export const INITIAL_USERS: CMSUser[] = [
  { id: "u1", name: "Amarnath Gattem", email: "amarnathgattem@gmail.com", role: "Super Admin", status: "Active", lastActive: "Just now" }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];
