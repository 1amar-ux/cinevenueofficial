
export interface UserLocation {
  city: string;
  district?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  source: "gps" | "manual" | "default";
  updatedAt?: string;
}

export * from './types/fees';
import { FeeLine, TaxLine } from './types/fees';

export interface Movie {
  title: string;
  genre: string;
  lang: string;
  rating: string;
  img: string;
  langKey: string;
  formats?: string[];
  actors?: string[];
  trailerUrl?: string;
  duration?: string;
  certificate?: 'U' | 'UA' | 'A';
  distributor?: string;
  isActive?: boolean;
}

export interface Theatre {
  id: number;
  name: string;
  location: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  geoPoint?: {
    type: "Point";
    coordinates: [number, number];
  };
  features: string[];
  price: string;
  img: string;
  bankRouting?: string;
  lastSettleDate?: string;
  customAllocPercent?: number;
  // Dynamic Seat & Pricing Configurations
  seatRows?: string[]; // e.g. ["A", "B", "C", "D", "E", "F"]
  seatsPerRow?: number; // e.g. 8
  premiumRows?: string[]; // e.g. ["A", "B"]
  premiumMultiplier?: number; // e.g. 1.5
  blockedSeats?: string[]; // e.g. ["A1", "A8"]
  seatPrices?: { [row: string]: number }; // row-specific pricing
  wheelchairSeats?: string[];
  vipSeats?: string[];
  reclinerSeats?: string[];
  emergencyExits?: string[];
  rowCategories?: { [row: string]: 'Gold' | 'Silver' | 'Premium' };
}

export interface Testimonial {
  text: string;
  name: string;
  city: string;
  stars: number;
}

export interface Booking {
  id: string;
  movieTitle: string;
  theatreName: string;
  seats: string[];
  totalPrice: number;
  date: string;
  timeSlot: string;
  status?: 'Pending' | 'Settled' | 'Cancelled' | 'Confirmed';
  userEmail?: string;
  city?: string;
  userName?: string;
  mobileNumber?: string;
  utrNumber?: string;
  paymentScreenshot?: string;
  paymentVerificationStatus?: 'Pending Review' | 'Approved' | 'Rejected';
  qrCodeData?: string;
  ticketAmount?: number;
  platformFee?: number;
  convenienceFee?: number;
  bookingFee?: number;
  otherFeeAmount?: number;
  taxAmount?: number;
  discountAmount?: number;
  gatewayFee?: number;
  totalAmount?: number;
  feeLines?: FeeLine[];
  taxLines?: TaxLine[];
  paymentMethod?: string;
}

export interface MovieSchedule {
  id: string;
  movieTitle: string;
  theatreName: string;
  timeSlot: string;
  pricePerSeat: number;
  date: string;
  isDeployed?: boolean;
  isActive?: boolean;
  interval?: number; // interval in minutes, e.g. 15, 20
  bookingWindow?: string; // booking window description, e.g. "Starts 48h before", "Closes 1h before"
}

export interface RentalRequest {
  id: string;
  user: string;
  eventName: string;
  guests: string;
  duration: string;
  eventType: string;
  requirements: string;
  price: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Declined';
  theatreName?: string;
  city?: string;
}

export interface ContactMessage {
  name: string;
  contact: string;
  message: string;
  date: string;
}

export interface TheatreAdmin {
  id: string;
  email: string;
  passwordHash: string; // clear text or hashed
  theatreId: number; // associated theatre
  permissions: {
    addMovies: boolean;
    createShows: boolean;
    configureSeats: boolean;
    viewReports: boolean;
    scanTickets: boolean;
  };
}

export interface EventCategory {
  name: string;
  price: number;
  availableSeats: number;
}

export interface EventReview {
  id: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  venueName: string;
  venueAddress: string;
  city: string;
  latitude?: number;
  longitude?: number;
  date: string;
  time: string;
  image: string;
  categories: EventCategory[];
  reviews: EventReview[];
  featured?: boolean;
  organizerId?: string;
  isPaid?: boolean;
  comingSoon?: boolean;
  isActive?: boolean;
}

export interface NotifyMeRequest {
  id: string;
  eventId: string;
  eventTitle: string;
  userEmail: string;
  userName: string;
  mobileNumber?: string;
  status: 'Pending' | 'Notified';
  requestedAt: string;
  notifiedAt?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  venueName: string;
  city?: string;
  date: string;
  time: string;
  eventDate?: string;
  eventTime?: string;
  userName: string;
  userEmail: string;
  mobileNumber?: string;
  categoryName: string;
  ticketPrice: number;
  quantity: number;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  paymentMethod?: string;
  bookingDate: string;
  organizerApproved?: boolean;
  superadminApproved?: boolean;
  utrNumber?: string;
  paymentScreenshot?: string;
  paymentVerificationStatus?: 'Pending Review' | 'Approved' | 'Rejected';
  qrCodeData?: string;
}

export interface UpiGatewaySettings {
  upiId: string;
  accountHolderName: string;
  qrImageUrl: string;
  instructions: string;
  supportMobile?: string;
}

export interface Advertisement {
  id: string;
  title: string;
  type: 'hero_slider' | 'homepage_banner' | 'sponsored_card';
  imageUrl: string;
  targetUrl?: string;
  impressions: number;
  clicks: number;
  status: 'Active' | 'Paused' | 'Expired';
  startDate: string;
  endDate: string;
}

export interface EventOrganizer {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  contact: string;
  bankRouting: string;
  commissionPercent: number;
  avatar: string;
}

export interface ServiceProposal {
  id: string;
  subWebsiteKey: 'movieBooking' | 'eventBooking' | 'filmProduction' | 'eventManagement' | 'brandPromotion';
  subWebsiteName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  projectTitleOrMovie: string;
  budgetOrRequirement: string;
  message: string;
  submittedAt: string;
  status: 'Pending' | 'In Review' | 'Approved' | 'Declined';
  adminNotes?: string;
}

export interface RealtimeMetricOverride {
  totalRevenue?: number;
  pendingVerifications?: number;
  ticketBookings?: number;
  privateRentals?: number;
  activeUsers?: number;
}

export interface SpotlightMovie {
  title: string;
  genre: string;
  duration: string;
  rating: string;
  image: string;
  description: string;
  showtimes: string[];
}

export interface FooterPagesData {
  about: {
    title: string;
    subtitle: string;
    description: string;
    whatWeOffer: { title: string; desc: string }[];
    vision: string;
    mission: string;
  };
  privacy: {
    title: string;
    lastUpdated: string;
    intro: string;
    infoCollect: string[];
    howWeUse: string[];
    paymentSecurity: string;
    infoSharing: string[];
    dataProtection: string;
    cookies: string;
    email: string;
  };
  terms: {
    title: string;
    welcome: string;
    accountResp: string;
    bookings: string;
    payments: string;
    userConduct: string[];
    intellectualProperty: string;
    limitationOfLiability: string;
    changes: string;
  };
  contact: {
    title: string;
    subtitle: string;
    description: string;
    phone: string;
    email: string;
    office: string;
    businessEmail: string;
    supportHours: string;
    responseTimes: string[];
  };
}

export const DEFAULT_FOOTER_PAGES_DATA: FooterPagesData = {
  about: {
    title: "About CineVenue",
    subtitle: "One Platform. Infinite Entertainment.",
    description: "CineVenue is India's next-generation entertainment platform that connects audiences, filmmakers, theatre owners, event organizers, artists, brands, and businesses through one powerful ecosystem.\n\nOur mission is to simplify entertainment by bringing movie ticket bookings, live events, film production, celebrity shows, corporate events, and brand promotions into a single platform.\n\nWhether you're watching the latest blockbuster, organizing a grand event, promoting a new film, or launching your brand, CineVenue provides the technology, network, and professional support to make it happen.",
    whatWeOffer: [
      {
        title: "🎬 Movie Ticket Booking",
        desc: "Book tickets for movies across partnered theatres with secure payments and instant confirmation."
      },
      {
        title: "🎤 Live Events",
        desc: "Discover concerts, comedy shows, music festivals, cultural programs, and exclusive experiences."
      },
      {
        title: "🎥 Film Production",
        desc: "End-to-end production support including planning, crew hiring, equipment, locations, post-production, and distribution assistance."
      },
      {
        title: "🎉 Event Management",
        desc: "Professional management for Movie Pre-Release Events, Audio Launches, Celebrity Shows, Corporate Events, Brand Launches, Musical Nights, Award Functions, and College Festivals."
      },
      {
        title: "📢 Brand & Media Promotions",
        desc: "Connect brands with audiences through promotional campaigns, influencer marketing, digital advertising, theatre promotions, and celebrity collaborations."
      }
    ],
    vision: "To become India's most trusted entertainment ecosystem where every movie, event, and entertainment experience begins with CineVenue.",
    mission: "Deliver seamless entertainment experiences while empowering creators, theatre owners, event organizers, and businesses with innovative technology and professional services."
  },
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "August 2026",
    intro: "At CineVenue, your privacy is important to us.",
    infoCollect: [
      "Name",
      "Email Address",
      "Mobile Number",
      "Location",
      "Payment Information (processed securely through payment partners)",
      "Booking History",
      "Device Information",
      "Browser Information",
      "IP Address"
    ],
    howWeUse: [
      "Process bookings",
      "Send booking confirmations",
      "Improve platform performance",
      "Provide customer support",
      "Notify you about events and offers",
      "Prevent fraud and unauthorized activity"
    ],
    paymentSecurity: "CineVenue never stores your complete debit or credit card details. Payments are securely processed by trusted payment gateway partners.",
    infoSharing: [
      "Theatre Partners",
      "Event Organizers",
      "Payment Providers",
      "Government Authorities (where legally required)"
    ],
    dataProtection: "We use modern encryption, secure servers, and access controls to safeguard your information.",
    cookies: "We use cookies to improve your browsing experience and personalize recommendations.",
    email: "info.cinevenue@gmail.com"
  },
  terms: {
    title: "Terms of Use",
    welcome: "Welcome to CineVenue. By using our platform, you agree to these Terms of Use.",
    accountResp: "Users are responsible for maintaining the confidentiality of their account credentials.",
    bookings: "All bookings are subject to availability. Once confirmed, bookings may be cancelled only according to the applicable cancellation policy.",
    payments: "Users must provide accurate payment information. Refund timelines depend on the payment provider and event or theatre policies.",
    userConduct: [
      "Use fake identities",
      "Attempt unauthorized access",
      "Upload harmful content",
      "Abuse other users",
      "Violate any applicable laws"
    ],
    intellectualProperty: "All logos, trademarks, graphics, software, and content on CineVenue are the property of CineVenue or their respective owners. Unauthorized reproduction is prohibited.",
    limitationOfLiability: "CineVenue acts as a technology platform connecting users with theatres and event organizers. We are not responsible for cancellations, delays, venue changes, or circumstances beyond our reasonable control.",
    changes: "CineVenue reserves the right to update these Terms at any time. Continued use of the platform indicates acceptance of the revised Terms."
  },
  contact: {
    title: "Concierge Contact",
    subtitle: "We're Here to Help",
    description: "Our Concierge Team is dedicated to providing premium support for all your entertainment needs. Whether you're booking tickets, organizing events, planning film promotions, or seeking production assistance, we're just a message away.",
    phone: "+91 84658 70811",
    email: "info.cinevenue@gmail.com",
    office: "Guntur, Andhra Pradesh – 522001, India",
    businessEmail: "business@cinevenue.com",
    supportHours: "Monday – Saturday 9:00 AM – 7:00 PM (IST)\nSunday: Emergency support for booking-related issues only.",
    responseTimes: [
      "Email: Within 24 hours",
      "WhatsApp: Within 2 hours during business hours",
      "Phone Support: Immediate during working hours"
    ]
  }
};

// ==================== CINECOINS LOYALTY & MY ACCOUNT TYPES ====================

export interface CineCoinValueHistoryRecord {
  id: string;
  date: string;
  time: string;
  previousValue: string;
  newValue: string;
  coinsPerUnit: number;
  currencyValue: number;
  changedBy: string;
  reason: string;
  ipAddress: string;
  timestamp: string;
}

export type CineCoinRewardActivityKey =
  | "registration"
  | "profile_completion"
  | "first_movie_booking"
  | "spend_per_100"
  | "event_booking"
  | "refer_friend"
  | "friend_first_booking"
  | "daily_login"
  | "movie_review"
  | "event_review"
  | "birthday_bonus"
  | "festival_bonus"
  | "spin_wheel";

export interface CineCoinSpinSegment {
  id: string;
  label: string;
  coins: number;
  weight: number;
  color: string;
}

export interface CineCoinRewardItemConfig {
  id: string;
  activityKey: CineCoinRewardActivityKey;
  activityName: string;
  rewardCoins: number;
  displayValue: string;
  status: "Active" | "Disabled";
  description: string;
  minSpend?: number;
  maxRewardPerTx?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
  festivalName?: string;
  campaignStartDate?: string;
  campaignEndDate?: string;
  spinSegments?: CineCoinSpinSegment[];
  updatedBy: string;
  updatedAt: string;
}

export interface CineCoinRewardHistoryRecord {
  id: string;
  activityKey: CineCoinRewardActivityKey | string;
  rewardActivity: string;
  previousValue: string;
  newValue: string;
  previousStatus?: "Active" | "Disabled";
  newStatus?: "Active" | "Disabled";
  changedBy: string;
  reason: string;
  date: string;
  time: string;
  ipAddress: string;
  timestamp: string;
}

export interface CineCoinsSettings {
  isEnabled: boolean;
  coinName: string;
  coinLogo: string;
  coinSymbol: string;
  coinsPerUnit: number; // default: 1000
  currencyValue: number; // default: 10
  coinValueRupees: number; // 10 / 1000 = 0.01 (1 CC = ₹0.01)
  currency: string; // default: "INR"
  minRedemptionCoins: number; // 100
  maxRedemptionPercent: number; // 25%
  allowPartialRedemption: boolean;
  coinExpiryMonths: number; // 12
  conversionHistory?: CineCoinValueHistoryRecord[];
  rewardRules?: CineCoinRewardItemConfig[];
  rewardHistory?: CineCoinRewardHistoryRecord[];
  featureToggles: {
    wallet: boolean;
    rewards: boolean;
    referral: boolean;
    challenges: boolean;
    dailyRewards: boolean;
    spinWheel: boolean;
    scratchCard: boolean;
    rewardsStore: boolean;
    notifications: boolean;
    transactions: boolean;
    leaderboard: boolean;
  };
  earnRules: {
    movieBookingPercent: number;
    eventBookingPercent: number;
    referralBonusCoins: number;
    dailyLoginCoins: number;
    profileCompleteCoins: number;
    reviewCoins: number;
    birthdayCoins: number;
    festivalCoins: number;
  };
}

export interface CineCoinsReward {
  id: string;
  title: string;
  category: 'Movie' | 'Event' | 'Food' | 'Gift Card' | 'Coupon' | 'Premium' | 'VIP';
  description: string;
  coinPrice: number;
  stock: number;
  expiryDate: string;
  image: string;
  isActive: boolean;
  terms?: string;
  couponCode?: string;
}

export interface CineCoinsChallenge {
  id: string;
  title: string;
  description: string;
  category: 'Daily' | 'Weekly' | 'Monthly' | 'Festival' | 'Special';
  targetCount: number;
  rewardCoins: number;
  durationDays: number;
  isActive: boolean;
  progress?: number;
}

export interface CineCoinsTransaction {
  id: string;
  walletId?: string;
  userEmail: string;
  type: 'Purchase' | 'Credit' | 'Debit' | 'Redemption' | 'Refund' | 'Cashback' | 'Bonus' | 'Transfer' | 'Transfer Received' | 'Transfer Sent' | 'Expiry' | 'Reversal' | 'Adjustment' | 'Earned' | 'Redeemed' | 'Manual Credit' | 'Manual Debit';
  coins: number;
  amountRupees?: number;
  previousBalance?: number;
  newBalance?: number;
  referenceId?: string;
  reason?: string;
  source: string;
  status: 'Pending' | 'Processing' | 'Successful' | 'Completed' | 'Failed' | 'Cancelled' | 'Refunded' | 'Reversed' | 'Expired' | 'Under Review' | 'Rejected';
  date: string;
  time?: string;
  adminId?: string;
}

export interface CineCoinsUserWallet {
  walletId?: string;
  userEmail: string;
  balanceCoins: number;
  availableBalance?: number;
  lockedBalance?: number;
  totalCredited?: number;
  totalDebited?: number;
  totalPurchased?: number;
  totalRedeemed?: number;
  totalRefunded?: number;
  status?: 'Active' | 'Frozen' | 'Suspended' | 'Closed';
  membershipTier?: string;
  isFrozen: boolean;
  lifetimeEarned: number;
  expiringCoins: number;
  expiringDate: string;
  referralCode: string;
  successfulReferrals: number;
  claimedRewards: string[]; // reward ids
  dailyStreak: number;
  lastLoginDate: string;
  lastSpinDate?: string;
  createdDate?: string;
  lastTransactionDate?: string;
  transactionPin?: string;
  dob?: string;
  isProfileComplete?: boolean;
  isMobileVerified?: boolean;
  isEmailVerified?: boolean;
  unlockedAchievements?: string[];
  notifications?: { id: string; title: string; message: string; date: string; read: boolean; type?: string }[];
}

export interface CineCoinsAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  userId: string;
  walletId: string;
  transactionId?: string;
  previousValue?: string;
  newValue?: string;
  reason: string;
  ipAddress: string;
  device: string;
  timestamp: string;
}

export interface CineCoinsApprovalRequest {
  id: string;
  requesterAdmin: string;
  type: 'Large Credit' | 'Large Debit' | 'Large Refund' | 'Transfer Reversal' | 'Wallet Status Override';
  amountCoins: number;
  userEmail: string;
  reason: string;
  status: 'REQUESTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface CineCoinsFraudAlert {
  id: string;
  walletId: string;
  userEmail: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  triggerReason: string;
  flaggedTxId?: string;
  status: 'Open' | 'Under Review' | 'Resolved' | 'Frozen';
  detectedAt: string;
}

export interface CineCoinsOffer {
  id: string;
  offerName: string;
  description: string;
  type: 'Cashback' | 'Bonus' | 'Welcome' | 'Referral' | 'Limited-Time' | 'Festival';
  rewardValue: number;
  isPercentage: boolean;
  minTxAmount: number;
  maxReward: number;
  startDate: string;
  endDate: string;
  userUsageLimit: number;
  totalUsageLimit: number;
  currentUsageCount: number;
  status: 'Draft' | 'Scheduled' | 'Active' | 'Paused' | 'Expired' | 'Disabled';
}

export interface CineCoinsLimitsConfig {
  purchaseMin: number;
  purchaseMax: number;
  purchaseDaily: number;
  purchaseMonthly: number;
  redemptionMin: number;
  redemptionMax: number;
  redemptionDaily: number;
  redemptionMonthly: number;
  maxOrderRedemptionPercent: number;
  transferMin: number;
  transferMax: number;
  transferDaily: number;
  transferMonthly: number;
  walletMaxBalance: number;
  manualAdminCreditLimit: number;
  manualAdminDebitLimit: number;
}

export interface CastingApplication {
  id: string;
  userEmail: string;
  userName: string;
  phone: string;
  roleApplied: string;
  experienceYears: number;
  portfolioUrl: string;
  photoUrl: string;
  submittedDate: string;
  status: 'Under Review' | 'Shortlisted' | 'Selected' | 'Rejected';
  notes?: string;
}

// ==================== PROPOSAL MANAGEMENT SYSTEM TYPES ====================

export type ProposalCustomerType =
  | 'Individual'
  | 'Brand / Company'
  | 'Film Production'
  | 'Event Organizer'
  | 'Theatre / Multiplex'
  | 'Advertising / Marketing Agency'
  | 'Other';

export type ProposalServiceType =
  | 'Movie Promotion'
  | 'Audio Launch'
  | 'Pre-Release Event'
  | 'Celebrity Event'
  | 'Live Concert'
  | 'Corporate Event'
  | 'Private Event'
  | 'Brand Promotion'
  | 'Digital / Social Media Promotion'
  | 'Film Production'
  | 'Movie / Event Ticketing'
  | 'Theatre / Venue Requirement'
  | 'Partnership / Collaboration'
  | 'Other';

export type ProposalStatus =
  | 'NEW'
  | 'UNDER REVIEW'
  | 'CONTACTED'
  | 'QUOTE PREPARED'
  | 'QUOTE SENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN PROGRESS'
  | 'COMPLETED';

export type ProposalContactMethod = 'Email' | 'Phone' | 'WhatsApp' | 'Any';

export interface ProposalAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string; // Base64 data URL or external URL
  uploadedAt: string;
}

export interface ProposalLineItem {
  id: string;
  item: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ProposalQuotation {
  id: string;
  proposalId: string;
  lineItems: ProposalLineItem[];
  subtotal: number;
  taxRatePercent: number; // e.g. 18% GST
  taxAmount: number;
  discountAmount: number;
  finalQuotationAmount: number;
  validUntil: string;
  termsAndConditions: string;
  notes?: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired';
  preparedBy: string;
  createdAt: string;
  sentAt?: string;
}

export interface ProposalInternalNote {
  id: string;
  author: string;
  authorRole: string;
  note: string;
  createdAt: string;
}

export interface ProposalAuditLog {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details?: string;
  previousStatus?: ProposalStatus;
  newStatus?: ProposalStatus;
}

export interface Proposal {
  proposalId: string; // e.g. CV-PROP-2026-000001
  customerId: string; // userEmail or user ID
  customerType: ProposalCustomerType;
  fullName: string;
  companyName?: string;
  phone: string;
  email: string;
  city: string;
  contactMethod: ProposalContactMethod;
  serviceType: ProposalServiceType;
  projectName: string;
  location: string;
  preferredDate?: string;
  expectedAttendees?: number;
  estimatedBudget?: number;
  servicesRequired: string[];
  description: string;
  attachments?: ProposalAttachment[];
  status: ProposalStatus;
  assignedTo?: string;
  internalNotes?: ProposalInternalNote[];
  quotation?: ProposalQuotation;
  auditLogs?: ProposalAuditLog[];
  createdAt: string;
  updatedAt: string;
}

export interface ShowSeat {
  id: string; // e.g. "show123_A5"
  seatNumber: string; // e.g. "A5"
  row: string; // "A"
  col: number; // 5
  category: 'Regular' | 'Premium' | 'Recliner' | 'Couple' | 'Wheelchair' | 'VIP';
  price: number;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED' | 'BLOCKED' | 'USED';
  lockedUntil?: string; // ISO string
  lockedBy?: string; // sessionId or userId
}

export interface PriceBreakdown {
  ticketAmount: number;
  platformFee: number; // default ₹18 per booking transaction
  platformFeeGst: number; // 18% on platform fee (₹3.24)
  taxes: number; // theatre entertainment tax / GST
  convenienceFee?: number;
  discount: number;
  finalAmount: number;
}

export interface TicketValidationResult {
  status: 'ALLOW_ENTRY' | 'ALREADY_USED' | 'INVALID' | 'CANCELLED' | 'REFUNDED' | 'WRONG_SHOW' | 'WRONG_DATE';
  message: string;
  ticket?: {
    bookingId: string;
    movieTitle: string;
    theatreName: string;
    screenName: string;
    date: string;
    timeSlot: string;
    seats: string[];
    totalAmount: number;
    userName?: string;
    userEmail?: string;
  };
  scannedAt: string;
  scannedBy?: string;
  firstUsedAt?: string;
}

export interface SettlementRecord {
  id: string;
  bookingId: string;
  theatreId: number;
  theatreName: string;
  movieTitle: string;
  showDate: string;
  showTime: string;
  seats: string[];
  grossTicketValue: number;
  platformFee: number;
  applicableTaxes: number;
  gatewayCharges: number;
  theatreShare: number;
  cineVenueShare: number;
  refundAmount: number;
  settlementAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SETTLED' | 'FAILED' | 'ON_HOLD';
  settlementDate?: string;
  utr?: string;
}

export interface PricingConfig {
  platformFeePerBooking: number; // Default: 18
  platformFeeGstRate: number; // Default: 0.18 (18%)
  theatreCommissionPercent: number; // Default: 8.0 (%)
  eventCommissionPercent: number; // Default: 10.0 (%)
}

export interface ExternalCinemaIntegration {
  id: string;
  chainName: 'PVR INOX' | 'Cinepolis' | 'Miraj Cinemas' | 'Asian Cinemas' | 'Custom Partner';
  apiUrl: string;
  authType: 'API_KEY' | 'OAUTH2' | 'BEARER';
  status: 'ACTIVE' | 'SYNCING' | 'OFFLINE' | 'STANDBY';
  supportedFeatures: {
    movies: boolean;
    theatres: boolean;
    showtimes: boolean;
    seatLayouts: boolean;
    seatLocking: boolean;
    realTimeBooking: boolean;
    cancellation: boolean;
    webhooks: boolean;
  };
  lastSyncTime?: string;
}

export type BankVerificationStatus =
  | 'Not Added'
  | 'Pending Verification'
  | 'Verified'
  | 'Rejected'
  | 'Suspended';

export interface TheatreBankAccount {
  id: string;
  theatreId: number | string;
  theatreName?: string;
  accountHolderName: string;
  bankName: string;
  encryptedAccountNumber?: string;
  maskedAccountNumber: string;
  ifscCode: string;
  accountType: 'Current' | 'Savings';
  branchName: string;
  branchAddress?: string;
  beneficiaryName: string;
  pan?: string;
  gstin?: string;
  upiId?: string;
  verificationStatus: BankVerificationStatus;
  isPrimary: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  isActive: boolean;
}

export interface TheatreSettlementRecord {
  id: string;
  theatreId: number | string;
  theatreName: string;
  bankAccountId?: string;
  maskedAccountNumber?: string;
  ifscCode?: string;
  beneficiaryName?: string;
  bankName?: string;
  periodStart: string;
  periodEnd: string;
  grossSales: number;
  commission: number;
  taxes: number;
  netAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SETTLED' | 'FAILED' | 'ON_HOLD';
  utr?: string;
  settlementDate: string;
  initiatedBy?: string;
  idempotencyKey?: string;
}

export interface TheatreBankStats {
  totalAccounts: number;
  verified: number;
  pending: number;
  rejected: number;
  missingDetails: number;
  suspended: number;
}
