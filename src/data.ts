import { Movie, Theatre, Testimonial, Event, CineCoinsUserWallet, CineCoinsSettings, CineCoinRewardItemConfig, Proposal } from './types';

export const INITIAL_MOVIES: Movie[] = [
  {
    id: "mov_baththa",
    title: "Baththa",
    genre: "Action, Comedy, Crime-Drama",
    lang: "Tamil",
    additionalLanguages: ["Telugu", "Hindi", "Kannada", "Malayalam"],
    certification: "UA",
    rating: "9.3",
    votes: "8.4K+ Votes",
    duration: "2h 24m",
    releaseYear: 2026,
    releaseDate: "2026-10-09",
    formats: ["2D", "4K Dolby Atmos", "IMAX 2D"],
    langKey: "tamil",
    img: "/baththa-poster.jpg",
    poster: "/baththa-poster.jpg",
    banner: "/baththa-poster.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=fLnMzPk_p_M",
    videoUrl: "https://www.youtube.com/watch?v=fLnMzPk_p_M",
    description: "Set in 1986 Madras, feared gangster Baththa gets accidentally locked inside an elementary school restroom by a timid 8-year-old student. The unusual predicament strands the dreaded criminal inside for days, igniting a heartwarming, hilarious, and redemptive journey that transforms both of their lives.",
    price: 150,
    status: "Now Showing",
    isActive: true,
    director: "Balaji Tharaneetharan",
    actors: [
      "Vijay Sethupathi",
      "Master Sai Prithviraj",
      "Lijomol Jose",
      "Santhy Balachandran",
      "Ajay Ghosh",
      "Arjun Chidambaram"
    ],
    cast: [
      "Vijay Sethupathi",
      "Master Sai Prithviraj",
      "Lijomol Jose",
      "Santhy Balachandran",
      "Ajay Ghosh",
      "Arjun Chidambaram"
    ],
    castMembers: [
      {
        name: "Vijay Sethupathi",
        role: "Lead Actor",
        character: "Baththa (Feared Gangster)",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80"
      },
      {
        name: "Master Sai Prithviraj",
        role: "Lead Child Actor",
        character: "Young Schoolboy",
        image: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=300&q=80"
      },
      {
        name: "Lijomol Jose",
        role: "Lead Actress",
        character: "School Teacher",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80"
      },
      {
        name: "Santhy Balachandran",
        role: "Supporting Actress",
        character: "Mother",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80"
      },
      {
        name: "Ajay Ghosh",
        role: "Supporting Actor",
        character: "Gang Lieutenant",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80"
      },
      {
        name: "Arjun Chidambaram",
        role: "Supporting Actor",
        character: "Sub-Inspector",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80"
      }
    ],
    crewMembers: [
      {
        name: "Balaji Tharaneetharan",
        role: "Director & Screenplay",
        image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&q=80"
      },
      {
        name: "Sai Abhyankkar",
        role: "Music Director & Composer",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80"
      },
      {
        name: "Atlee",
        role: "Presenter & Producer (A for Apple Studios)",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80"
      },
      {
        name: "Murad Khetani",
        role: "Producer (Cine1 Studios)",
        image: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&q=80"
      }
    ],
    videos: [
      {
        id: "vid-baththa-official-trailer",
        movieId: "mov_baththa",
        type: "TRAILER",
        title: "Baththa — Official Theatrical Trailer",
        youtubeVideoId: "fLnMzPk_p_M",
        youtubeUrl: "https://www.youtube.com/watch?v=fLnMzPk_p_M",
        thumbnailUrl: "https://img.youtube.com/vi/fLnMzPk_p_M/hqdefault.jpg",
        language: "Tamil / Telugu / Hindi",
        displayOrder: 1,
        isActive: true,
        createdAt: "2026-10-01T00:00:00.000Z",
        updatedAt: "2026-10-01T00:00:00.000Z"
      }
    ],
    offers: [
      {
        id: "off-premiere-1",
        title: "CineVenue Gold Privilege (20% Off F&B Concessions)",
        subtitle: "Complimentary snack voucher with any Prime or Recliner ticket",
        bankName: "CineVenue Rewards",
        discountBadge: "GOLD PERK"
      }
    ]
  }
];

export const INITIAL_THEATRES: Theatre[] = [
  {
    id: 1,
    name: "CineVenue Prime Multiplex",
    location: "Brodiplast Ring Road, City Center",
    city: "All Cities",
    latitude: 17.4126,
    longitude: 78.4655,
    features: ["4K Laser", "Dolby Atmos", "Luxury Recliners", "Prime Section", "Classic Section"],
    reclinerSeats: [
      "J1", "J2", "J3", "J4", "J5", "J6", "J7", "J8", "J9", "J10", "J11", "J12", "J13", "J14",
      "K1", "K2", "K3", "K4", "K5", "K6", "K7", "K8", "K9", "K10", "K11", "K12", "K13", "K14"
    ],
    price: "₹150",
    ticketPrice: 150,
    img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=60",
    seatRows: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"],
    seatsPerRow: 14,
    premiumRows: ["E", "F", "G", "H"],
    rowCategories: {
      A: "Classic",
      B: "Classic",
      C: "Classic",
      D: "Classic",
      E: "Prime",
      F: "Prime",
      G: "Prime",
      H: "Prime",
      J: "Recliner",
      K: "Recliner"
    },
    seatPrices: {
      A: 150, B: 150, C: 150, D: 150,
      E: 220, F: 220, G: 220, H: 220,
      J: 350, K: 350
    },
    screens: [
      {
        id: "SCR-1",
        name: "Screen 1 (4K Dolby Atmos Laser)",
        screenType: "4K Laser Dolby Atmos",
        totalSeats: 140,
        isActive: true
      }
    ]
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

export const INITIAL_EVENTS: Event[] = [];

export const DEFAULT_SPOTLIGHT = {
  title: "Baththa",
  genre: "Action / Comedy / Crime-Drama • Tamil & Telugu",
  duration: "2h 24m",
  rating: "9.3",
  image: "/baththa-poster.jpg",
  description: "Set in 1986 Madras, feared gangster Baththa gets accidentally locked inside an elementary school restroom by a timid 8-year-old student. The unusual predicament strands the dreaded criminal inside for days, igniting a heartwarming, hilarious, and redemptive journey that transforms both of their lives.",
  showtimes: ["11:30 AM", "2:45 PM", "6:30 PM", "9:45 PM"]
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


