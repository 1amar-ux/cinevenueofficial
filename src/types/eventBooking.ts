// ============================================================
// CineVenue Event Booking & Ticketing Module — Type Definitions
// ============================================================

export type EventCategoryType =
  | 'Concerts'
  | 'Film Events'
  | 'College Events'
  | 'Workshops'
  | 'Stand-up Comedy'
  | 'Cultural Events'
  | 'Sports Events'
  | 'Business/Networking'
  | 'Other';

export type EventStatus = 'Draft' | 'Published' | 'Cancelled' | 'Rescheduled' | 'Completed';

export type SeatingType = 'GeneralAdmission' | 'AssignedSeating';

export type TicketTier =
  | 'General'
  | 'Premium'
  | 'VIP'
  | 'VVIP'
  | 'Early Bird'
  | 'Student'
  | 'Group/Family'
  | 'Custom';

export interface EventTicketType {
  id: string;
  eventId: string;
  name: string;
  tier: TicketTier;
  description: string;
  price: number;
  availableQuantity: number;
  soldQuantity: number;
  maxPerUser: number;
  minPerUser: number;
  saleStartDate?: string;
  saleEndDate?: string;
  status: 'Active' | 'SoldOut' | 'Hidden';
  isRefundable: boolean;
  terms?: string;
}

export interface EventSeat {
  id: string;
  sectionId: string;
  row: string;
  seatNumber: number;
  seatCode: string; // e.g., "VIP-A-12"
  price: number;
  status: 'available' | 'reserved' | 'locked' | 'sold';
  lockedBy?: string; // sessionId or userEmail
  lockedExpiresAt?: number; // timestamp in ms
}

export interface EventSeatSection {
  id: string;
  eventId: string;
  name: string; // e.g., "VIP Front Row", "Balcony Left"
  tier: TicketTier;
  rows: string[]; // e.g., ["A", "B", "C"]
  seatsPerRow: number;
  price: number;
  seats: EventSeat[];
}

export interface EventOrganizerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  logoUrl?: string;
  isVerified: boolean;
  rating?: number;
  eventsCount?: number;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: EventCategoryType;
  bannerUrl: string;
  galleryUrls?: string[];
  organizer: EventOrganizerProfile;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g., "07:00 PM"
  endTime?: string;
  duration?: string; // e.g., "2h 30m"
  venueName: string;
  venueAddress: string;
  city: string;
  latitude?: number;
  longitude?: number;
  language?: string;
  ageRestriction?: string; // e.g., "16+", "All Ages"
  termsAndConditions?: string[];
  cancellationPolicy?: string;
  seatingType: SeatingType;
  ticketTypes: EventTicketType[];
  seatSections?: EventSeatSection[];
  totalCapacity: number;
  soldCount: number;
  status: EventStatus;
  isFeatured?: boolean;
  isSellingFast?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PrimaryAttendee {
  name: string;
  email: string;
  phone: string;
}

export interface AdditionalAttendee {
  name: string;
  email?: string;
  seatCode?: string;
  ticketTypeName?: string;
}

export interface EventFeeBreakdown {
  ticketSubtotal: number;
  platformBookingFee: number;
  taxAmount: number; // e.g., 18% GST on booking fee
  discountAmount: number;
  cineCoinsRedeemed: number;
  cineCoinsDiscount: number;
  finalAmount: number;
}

export interface EventBookingRecord {
  id: string; // EVT-BK-XXXXXX
  passCode: string; // 8-char security code for QR verification
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  city: string;
  bannerUrl: string;
  seatingType: SeatingType;
  ticketTypeId?: string;
  ticketTypeName: string;
  ticketCount: number;
  seatCodes?: string[];
  primaryAttendee: PrimaryAttendee;
  additionalAttendees?: AdditionalAttendee[];
  pricing: EventFeeBreakdown;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  bookingStatus: 'Confirmed' | 'Cancelled' | 'Attended';
  qrCodePayload: string; // Encrypted JSON payload for scanner validation
  bookedAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  cancellationReason?: string;
  refundAmount?: number;
}

export interface EventCoupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number; // e.g., 10 (for 10%) or 200 (for ₹200)
  minOrderAmount?: number;
  maxDiscount?: number;
  validUntil: string;
  usageCount: number;
  maxUsage: number;
  isActive: boolean;
}

export interface TemporarySeatLock {
  lockId: string;
  eventId: string;
  seatCodes?: string[];
  ticketTypeId?: string;
  quantity: number;
  lockedAt: number;
  expiresAt: number; // lockedAt + 10 mins (600,000 ms)
  sessionId: string;
  userEmail: string;
}

export interface EventCheckInResult {
  success: boolean;
  booking?: EventBookingRecord;
  message: string;
  alreadyCheckedIn?: boolean;
  checkedInAt?: string;
}

export interface OrganizerEventStats {
  eventId: string;
  totalTickets: number;
  ticketsSold: number;
  ticketsRemaining: number;
  grossRevenueINR: number;
  platformFeeINR: number;
  netPayoutINR: number;
  checkedInCount: number;
  checkInRatePercent: number;
}
