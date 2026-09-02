import { Movie, Theatre, Testimonial, Event, CineCoinsUserWallet, CineCoinsSettings, CineCoinRewardItemConfig, Proposal } from './types';

export const INITIAL_MOVIES: Movie[] = [
  {
    title: "Kalki 2898 AD",
    genre: "Sci-Fi",
    lang: "Telugu",
    rating: "8.2",
    img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=70",
    langKey: "telugu"
  },
  {
    title: "Stree 2",
    genre: "Horror",
    lang: "Hindi",
    rating: "8.5",
    img: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&q=70",
    langKey: "hindi"
  },
  {
    title: "Deadpool & Wolverine",
    genre: "Action",
    lang: "English",
    rating: "7.9",
    img: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&q=70",
    langKey: "english"
  },
  {
    title: "Devara",
    genre: "Action",
    lang: "Telugu",
    rating: "7.4",
    img: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&q=70",
    langKey: "telugu"
  },
  {
    title: "Singham Again",
    genre: "Action",
    lang: "Hindi",
    rating: "6.8",
    img: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&q=70",
    langKey: "hindi"
  },
  {
    title: "Alien: Romulus",
    genre: "Horror",
    lang: "English",
    rating: "7.3",
    img: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&q=70",
    langKey: "english"
  },
  {
    title: "Pushpa 2",
    genre: "Drama",
    lang: "Telugu",
    rating: "8.6",
    img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=601&q=70",
    langKey: "telugu"
  },
  {
    title: "Bhool Bhulaiyaa 3",
    genre: "Comedy",
    lang: "Hindi",
    rating: "7.1",
    img: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=601&q=70",
    langKey: "hindi"
  }
];

export const INITIAL_THEATRES: Theatre[] = [
  {
    id: 1,
    name: "PVR Nexus",
    location: "Hyderabad · Kukatpally",
    city: "Hyderabad",
    latitude: 17.4834,
    longitude: 78.3871,
    features: ["4K Laser", "Dolby Atmos", "Recliner"],
    price: "₹4,999",
    img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=60"
  },
  {
    id: 2,
    name: "IMAX Prasads",
    location: "Hyderabad · Tank Bund",
    city: "Hyderabad",
    latitude: 17.4126,
    longitude: 78.4655,
    features: ["IMAX", "Dolby Vision", "Premium F&B"],
    price: "₹7,499",
    img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&q=60"
  },
  {
    id: 3,
    name: "Cinepolis GVK",
    location: "Hyderabad · Banjara Hills",
    city: "Hyderabad",
    latitude: 17.4193,
    longitude: 78.4485,
    features: ["VIP Lounge", "Gourmet Menu", "Recliner"],
    price: "₹5,999",
    img: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=600&q=60"
  },
  {
    id: 4,
    name: "PVP Square INOX",
    location: "Vijayawada · MG Road",
    city: "Vijayawada",
    latitude: 16.5020,
    longitude: 80.6385,
    features: ["4K Laser", "Recliner"],
    price: "₹2,999",
    img: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&q=60"
  },
  {
    id: 5,
    name: "Capital Cinemas",
    location: "Vijayawada · Trendset Mall",
    city: "Vijayawada",
    latitude: 16.4950,
    longitude: 80.6550,
    features: ["Dolby Atmos", "Giant Screen"],
    price: "₹3,499",
    img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&q=60"
  },
  {
    id: 6,
    name: "Cinepolis Sudarshan",
    location: "Guntur · Lakshmipuram",
    city: "Guntur",
    latitude: 16.3025,
    longitude: 80.4300,
    features: ["Recliner", "Dolby Atmos"],
    price: "₹2,499",
    img: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=600&q=60"
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [];

export const CITIES = [
  "All Cities",
  "Vijayawada",
  "Guntur",
  "Hyderabad",
  "Visakhapatnam",
  "Chennai",
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Pune",
  "Kolkata"
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: "EV-001",
    title: "Kalki 2898 AD Fan Gala & Celebrity Q&A",
    description: "Join the legendary director and main cast for an exclusive red carpet event. Get access to custom designer merchandise, a rare screening of exclusive behind-the-scenes footage, and an interactive open mic forum with the creative minds behind India's sci-fi epic. Each VIP ticket includes an authentic autographed collectible and premium lounge catering.",
    venueName: "IMAX Prasads",
    venueAddress: "Tank Bund Rd, near NTR Gardens, Hyderabad, Telangana 500063",
    city: "Hyderabad",
    date: "2026-07-15",
    time: "06:30 PM",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    categories: [
      { name: "VIP Backstage Pass (Food Incl.)", price: 2499, availableSeats: 35 },
      { name: "Premium Fan Zone", price: 1199, availableSeats: 120 },
      { name: "General Admission", price: 499, availableSeats: 300 }
    ],
    reviews: [
      {
        id: "REV-101",
        userName: "Vamsi Krishna",
        userEmail: "vamsi.k@gmail.com",
        rating: 5,
        comment: "Outstanding event lineup! Cannot wait for the live discussion. Prasads is the perfect venue for this celebration.",
        date: "2026-07-02, 10:15 AM"
      },
      {
        id: "REV-102",
        userName: "Rupa Sen",
        userEmail: "rupa.sen@outlook.com",
        rating: 4,
        comment: "Glad to see premium cinematic events happening in Hyderabad. Pricing is reasonable for the value offered.",
        date: "2026-07-02, 02:40 PM"
      }
    ],
    featured: true,
    isPaid: true
  },
  {
    id: "EV-002",
    title: "Symphony of Lights: Legendary Indian Soundtracks Live",
    description: "Experience the heart-pounding soundtracks of Singham, Bahubali, Dil Se, and and more played by a live 60-piece symphony orchestra. Enhanced by high-definition Dolby Vision projections and curated laser displays synchronized with every crescendo. This is a sensory celebration of Indian music history.",
    venueName: "Cinepolis GVK",
    venueAddress: "GVK One Mall, Road No 1, Banjara Hills, Hyderabad, Telangana 500034",
    city: "Hyderabad",
    date: "2026-07-25",
    time: "07:00 PM",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
    categories: [
      { name: "Royal Sofa & Cocktails", price: 1999, availableSeats: 45 },
      { name: "Balcony Premium", price: 999, availableSeats: 150 },
      { name: "Classic Seating", price: 450, availableSeats: 250 }
    ],
    reviews: [
      {
        id: "REV-201",
        userName: "Neha S.",
        userEmail: "neha.s@gmail.com",
        rating: 5,
        comment: "Attended the previous orchestra session and it gave me goosebumps. Instant booking for this one!",
        date: "2026-07-02, 11:20 AM"
      }
    ],
    featured: true,
    isPaid: true
  },
  {
    id: "EV-003",
    title: "Retro Horror Film Night: Midnight Screenings",
    description: "Prepare yourself for an all-night marathon of vintage cult-classic Indian and global horror films. Complete with live spooky ambient soundtracks, immersive atmospheric fog, scary cosplay hosts, and themed midnight snacks. Warning: Strictly for adults!",
    venueName: "Sathyam Cinemas",
    venueAddress: "Royapettah, Chennai, Tamil Nadu 600014",
    city: "Chennai",
    date: "2026-07-18",
    time: "11:30 PM",
    image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&q=80",
    categories: [
      { name: "VIP Screamer Box Pass", price: 0, availableSeats: 20 },
      { name: "Standard Ghouls Row Pass", price: 0, availableSeats: 180 }
    ],
    reviews: [],
    isPaid: false
  },
  {
    id: "EV-004",
    title: "Sunburn Arena 2026: Coming Soon Concert",
    description: "Pre-register now to receive exclusive early-bird access codes, lineup alerts, and pre-notification updates before general public sales go live. Experience the biggest EDM carnival of the year featuring Grammy-winning global headliners and premium acoustic visual effects.",
    venueName: "Gachibowli Outdoor Stadium",
    venueAddress: "Gachibowli, Hyderabad, Telangana 500032",
    city: "Hyderabad",
    date: "2026-08-30",
    time: "04:00 PM",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80",
    categories: [
      { name: "Early Bird General VIP", price: 3499, availableSeats: 500 },
      { name: "Early Bird Fan Pit", price: 5999, availableSeats: 200 }
    ],
    reviews: [],
    isPaid: true,
    comingSoon: true
  }
];

export const DEFAULT_SPOTLIGHT = {
  title: "The Last Horizon",
  genre: "Sci-Fi • Space Odyssey",
  duration: "2h 18m",
  rating: "8.7",
  image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=900&q=70",
  description: "A stunning visual masterpiece exploring deep space that redefines the boundaries of human survival and exploration. When humanity's final interstellar colonization ship suddenly loses connection with Earth, one astronomer must decide between individual salvation and the ultimate truth.",
  showtimes: ["10:30 AM", "1:45 PM", "4:00 PM", "7:30 PM", "10:15 PM"]
};

export const DEFAULT_CINECOINS_REWARD_RULES: CineCoinRewardItemConfig[] = [
  {
    id: "RR-01",
    activityKey: "registration",
    activityName: "Register for CineVenue",
    rewardCoins: 1000,
    displayValue: "1,000 CC",
    status: "Active",
    description: "Credited once after verified customer account registration (Mobile/Email verification required).",
    updatedBy: "Super Admin",
    updatedAt: "2026-08-20 10:00"
  },
  {
    id: "RR-02",
    activityKey: "profile_completion",
    activityName: "Complete Profile",
    rewardCoins: 500,
    displayValue: "500 CC",
    status: "Active",
    description: "Claimed once after filling required profile fields (Name, Mobile, DOB, Email verification).",
    updatedBy: "Super Admin",
    updatedAt: "2026-08-20 10:00"
  },
  {
    id: "RR-03",
    activityKey: "first_movie_booking",
    activityName: "First Movie Booking",
    rewardCoins: 2000,
    displayValue: "2,000 CC",
    status: "Active",
    description: "Issued once upon successful completion of user's first eligible movie ticket booking.",
    updatedBy: "Super Admin",
    updatedAt: "2026-08-20 10:00"
  },
  {
    id: "RR-04",
    activityKey: "spend_per_100",
    activityName: "Every ₹100 Spent",
    rewardCoins: 100,
    displayValue: "100 CC / ₹100",
    status: "Active",
    description: "Earn 100 CineCoins for every ₹100 spent on tickets, food combos, and event passes.",
    minSpend: 100,
    maxRewardPerTx: 5000,
    dailyLimit: 10000,
    monthlyLimit: 50000,
    updatedBy: "Super Admin",
    updatedAt: "2026-08-20 10:00"
  },
  {
    id: "RR-05",
    activityKey: "event_booking",
    activityName: "Event Booking",
    rewardCoins: 1000,
    displayValue: "1,000 CC",
    status: "Active",
    description: "Issued for every eligible live event, concert, or festival pass booking above ₹500.",
    minSpend: 500,
    maxRewardPerTx: 2500,
    updatedBy: "Super Admin",
    updatedAt: "2026-08-20 10:00"
  },
  {
    id: "RR-06",
    activityKey: "refer_friend",
    activityName: "Refer a Friend",
    rewardCoins: 2000,
    displayValue: "2,000 CC",
    status: "Active",
    description: "Earned by referrer when an invited friend signs up and verifies their mobile/email.",
    updatedBy: "Super Admin",
    updatedAt: "2026-08-20 10:00"
  },
  {
    id: "RR-07",
    activityKey: "friend_first_booking",
    activityName: "Friend's First Booking",
    rewardCoins: 3000,
    displayValue: "3,000 CC",
    status: "Active",
    description: "Bonus reward credited to referrer after their referred friend completes their first paid booking.",
    updatedBy: "Super Admin",
    updatedAt: "2026-08-20 10:00"
  },
  {
    id: "RR-08",
    activityKey: "daily_login",
    activityName: "Daily Login",
    rewardCoins: 100,
    displayValue: "100 CC",
    status: "Active",
    description: "Claimable once per calendar day upon accessing the CineVenue app or web portal.",
    dailyLimit: 1,
    updatedBy: "Super Admin",
    updatedAt: "2026-08-20 10:00"
  },
  {
    id: "RR-09",
    activityKey: "movie_review",
    activityName: "Movie Review",
    rewardCoins: 250,
    displayValue: "250 CC",
    status: "Active",
    description: "Rewarded for publishing an authentic review (>20 chars) for any verified movie ticket.",
    dailyLimit: 2,
    updatedBy: "Super Admin",
    updatedAt: "2026-08-20 10:00"
  },
  {
    id: "RR-10",
    activityKey: "event_review",
    activityName: "Event Review",
    rewardCoins: 250,
    displayValue: "250 CC",
    status: "Active",
    description: "Rewarded for publishing a verified review for any attended event or concert.",
    dailyLimit: 2,
    updatedBy: "Super Admin",
    updatedAt: "2026-08-20 10:00"
  },
  {
    id: "RR-11",
    activityKey: "birthday_bonus",
    activityName: "Birthday Bonus",
    rewardCoins: 5000,
    displayValue: "5,000 CC",
    status: "Active",
    description: "Special celebratory birthday gift credited once per year on verified date of birth.",
    updatedBy: "Super Admin",
    updatedAt: "2026-08-20 10:00"
  },
  {
    id: "RR-12",
    activityKey: "festival_bonus",
    activityName: "Festival Bonus",
    rewardCoins: 2500,
    displayValue: "2,500 CC",
    status: "Active",
    festivalName: "Diwali & Festive Celebration Bonus",
    campaignStartDate: "2026-10-25",
    campaignEndDate: "2026-11-05",
    description: "Seasonal promotional bonus credited during Diwali, Sankranti, Ugadi, and New Year campaigns.",
    updatedBy: "Super Admin",
    updatedAt: "2026-08-20 10:00"
  },
  {
    id: "RR-13",
    activityKey: "spin_wheel",
    activityName: "Spin Wheel",
    rewardCoins: 0,
    displayValue: "Variable (100–5,000 CC)",
    status: "Active",
    description: "Daily lucky spin wheel featuring variable prizes determined by weighted probability matrix.",
    dailyLimit: 1,
    spinSegments: [
      { id: "seg-1", label: "100 CC", coins: 100, weight: 35, color: "#F59E0B" },
      { id: "seg-2", label: "200 CC", coins: 200, weight: 25, color: "#10B981" },
      { id: "seg-3", label: "500 CC", coins: 500, weight: 15, color: "#6366F1" },
      { id: "seg-4", label: "1,000 CC", coins: 1000, weight: 10, color: "#EC4899" },
      { id: "seg-5", label: "2,000 CC", coins: 2000, weight: 5, color: "#8B5CF6" },
      { id: "seg-6", label: "5,000 CC", coins: 5000, weight: 2, color: "#EAB308" },
      { id: "seg-7", label: "Try Again", coins: 0, weight: 8, color: "#6B7280" }
    ],
    updatedBy: "Super Admin",
    updatedAt: "2026-08-20 10:00"
  }
];

export const DEFAULT_CINECOINS_SETTINGS: CineCoinsSettings = {
  isEnabled: true,
  coinName: "CineCoin",
  coinLogo: "🪙",
  coinSymbol: "CC",
  coinsPerUnit: 1000, // 1,000 CineCoins = ₹10
  currencyValue: 10, // ₹10
  coinValueRupees: 0.01, // 1 CC = ₹0.01
  currency: "INR",
  minRedemptionCoins: 100,
  maxRedemptionPercent: 25,
  allowPartialRedemption: true,
  coinExpiryMonths: 12,
  conversionHistory: [
    {
      id: "VAL-HIST-01",
      date: "2026-08-01",
      time: "09:00:00",
      previousValue: "1,000 CC = ₹10",
      newValue: "1,000 CC = ₹10",
      coinsPerUnit: 1000,
      currencyValue: 10,
      changedBy: "Super Admin",
      reason: "Initial baseline conversion establishment (1,000 CC = ₹10 => 1 CC = ₹0.01)",
      ipAddress: "103.42.12.8",
      timestamp: "2026-08-01 09:00:00"
    }
  ],
  rewardRules: DEFAULT_CINECOINS_REWARD_RULES,
  rewardHistory: [
    {
      id: "REW-HIST-01",
      activityKey: "daily_login",
      rewardActivity: "Daily Login",
      previousValue: "50 CC",
      newValue: "100 CC",
      previousStatus: "Active",
      newStatus: "Active",
      changedBy: "Super Admin",
      reason: "Platform Engagement Boost Campaign",
      date: "2026-08-01",
      time: "10:30:00",
      ipAddress: "103.42.12.8",
      timestamp: "2026-08-01 10:30:00"
    },
    {
      id: "REW-HIST-02",
      activityKey: "movie_review",
      rewardActivity: "Movie Review",
      previousValue: "100 CC",
      newValue: "250 CC",
      previousStatus: "Active",
      newStatus: "Active",
      changedBy: "Super Admin",
      reason: "Critic Incentive Program Launch",
      date: "2026-08-02",
      time: "14:15:00",
      ipAddress: "103.42.12.8",
      timestamp: "2026-08-02 14:15:00"
    }
  ],
  featureToggles: {
    wallet: true,
    rewards: true,
    referral: true,
    challenges: true,
    dailyRewards: true,
    spinWheel: true,
    scratchCard: true,
    rewardsStore: true,
    notifications: true,
    transactions: true,
    leaderboard: true,
  },
  earnRules: {
    movieBookingPercent: 10,
    eventBookingPercent: 10,
    referralBonusCoins: 2000,
    dailyLoginCoins: 100,
    profileCompleteCoins: 500,
    reviewCoins: 250,
    birthdayCoins: 5000,
    festivalCoins: 2500,
  }
};

export const DEFAULT_CINECOINS_REWARDS = [
  {
    id: "REW-001",
    title: "₹100 Off Movie Ticket Voucher",
    category: "Movie" as const,
    description: "Redeem 1,000 CineCoins to get an instant ₹100 flat discount on any IMAX or 4DX show.",
    coinPrice: 1000,
    stock: 50,
    expiryDate: "2026-12-31",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=70",
    isActive: true,
    terms: "Valid on all shows. Cannot be combined with other offers.",
    couponCode: "CINE100OFF"
  },
  {
    id: "REW-002",
    title: "Free Large Popcorn & Soda Combo",
    category: "Food" as const,
    description: "Enjoy a complimentary fresh gourmet caramel popcorn and chilled soft drink at concession stands.",
    coinPrice: 1500,
    stock: 100,
    expiryDate: "2026-12-31",
    image: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=600&q=70",
    isActive: true,
    terms: "Show QR code at concession counter.",
    couponCode: "POPCORNFREE"
  },
  {
    id: "REW-003",
    title: "VIP Gold Event Pass Upgrade",
    category: "Event" as const,
    description: "Upgrade your standard event pass to VIP lounge seating with complimentary beverage service.",
    coinPrice: 2500,
    stock: 15,
    expiryDate: "2026-11-30",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=70",
    isActive: true,
    terms: "Subject to VIP lounge seat availability.",
    couponCode: "VIPEVENTGOLD"
  },
  {
    id: "REW-004",
    title: "Celebrity Meet & Greet Pass",
    category: "VIP" as const,
    description: "Exclusive access pass to meet film directors & lead actors during pre-release events.",
    coinPrice: 5000,
    stock: 5,
    expiryDate: "2026-10-15",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=70",
    isActive: true,
    terms: "Valid for selected premiere shows only.",
    couponCode: "MEETVIP5000"
  },
  {
    id: "REW-005",
    title: "CineVenue Collector T-Shirt",
    category: "Gift Card" as const,
    description: "Official limited edition embroidered CineVenue premium cotton merchandise shirt.",
    coinPrice: 3000,
    stock: 30,
    expiryDate: "2026-12-31",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=70",
    isActive: true,
    terms: "Free doorstep delivery across India.",
    couponCode: "MERCHSHIRT"
  }
];

export const DEFAULT_CINECOINS_CHALLENGES = [
  {
    id: "CHAL-101",
    title: "Weekend Movie Enthusiast",
    description: "Book and watch 2 movies on Saturday or Sunday this month.",
    category: "Monthly" as const,
    targetCount: 2,
    rewardCoins: 300,
    durationDays: 30,
    isActive: true,
    progress: 1
  },
  {
    id: "CHAL-102",
    title: "Live Concert Aficionado",
    description: "Register and attend 1 live music concert or standup comedy event.",
    category: "Weekly" as const,
    targetCount: 1,
    rewardCoins: 250,
    durationDays: 7,
    isActive: true,
    progress: 0
  },
  {
    id: "CHAL-103",
    title: "Social Ambassador",
    description: "Refer 3 friends to join CineVenue using your referral link.",
    category: "Special" as const,
    targetCount: 3,
    rewardCoins: 600,
    durationDays: 14,
    isActive: true,
    progress: 1
  },
  {
    id: "CHAL-104",
    title: "Film Critic Specialist",
    description: "Write 3 detailed movie or event reviews on the platform.",
    category: "Daily" as const,
    targetCount: 3,
    rewardCoins: 150,
    durationDays: 5,
    isActive: true,
    progress: 2
  }
];

export const DEFAULT_CINECOINS_TRANSACTIONS: any[] = [];

export const DEFAULT_CINECOINS_USER_WALLET: CineCoinsUserWallet = {
  userEmail: "member@cinevenue.com",
  balanceCoins: 0,
  availableBalance: 0,
  lockedBalance: 0,
  totalCredited: 0,
  totalDebited: 0,
  totalPurchased: 0,
  totalRedeemed: 0,
  status: "Active",
  membershipTier: "Bronze Member",
  isFrozen: false,
  lifetimeEarned: 0,
  expiringCoins: 0,
  expiringDate: "",
  referralCode: "CINE-MEMBER-2026",
  successfulReferrals: 0,
  claimedRewards: [],
  dailyStreak: 0,
  lastLoginDate: new Date().toISOString().split("T")[0],
  transactionPin: "",
  dob: "",
  isProfileComplete: false,
  isMobileVerified: false,
  isEmailVerified: false,
  unlockedAchievements: [],
  notifications: []
};

// ==================== DEFAULT PROPOSALS DATA ====================

export const DEFAULT_PROPOSALS: Proposal[] = [];


