// ============================================================
// CineVenue Event Booking & Ticketing Module — Type Definitions
// ============================================================

export type EventType = 'PAID' | 'FREE' | 'HYBRID';

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
  isFree?: boolean;
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
  _id?: string;
  title: string;
  slug: string;
  description: string;
  category: EventCategoryType;
  categories?: any[];
  bannerUrl: string;
  galleryUrls?: string[];
  posterUrl?: string;
  image?: string;
  price?: number | string;
  organizer: EventOrganizerProfile;
  date: string; // YYYY-MM-DD
  time?: string;
  startTime: string; // e.g., "07:00 PM"
  endTime?: string;
  duration?: string; // e.g., "2h 30m"
  venueName: string;
  venueAddress: string;
  venue?: any;
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
  eventType?: EventType;
  isWaitlistEnabled?: boolean;
  waitlistCount?: number;
  featured?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  isSellingFast?: boolean;
  rating?: number;
  reviewCount?: number;
  reviews?: any[];
  passSettings?: {
    enabled: boolean;
    passTypes?: string[];
    autoGenerateOnBooking?: boolean;
  };
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

export type EventBookingMode = 'FREE' | 'PAID';

export type EventBookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCEL_REQUESTED'
  | 'CANCELLED'
  | 'CANCELLATION_REJECTED'
  | 'EXPIRED'
  | 'Attended'
  | 'Confirmed'
  | 'Cancelled';

export type EventOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_PROCESSING'
  | 'PAID'
  | 'EXPIRED'
  | 'CANCELLED';

export type EventPaymentLifecycleStatus =
  | 'CREATED'
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'NOT_APPLICABLE'
  | 'Paid'
  | 'NOT_REQUIRED';

export type EventPassStatus = 'ACTIVE' | 'USED' | 'CANCELLED';

export type PdfGenerationStatus = 'NOT_GENERATED' | 'GENERATING' | 'GENERATED' | 'FAILED';

export type EmailDeliveryStatus = 'NOT_SENT' | 'QUEUED' | 'SENT' | 'FAILED';

export interface EventPass {
  id: string; // CVPASS-XXXXXX
  eventBookingId: string;
  passNumber: number;
  ticketTypeId?: string;
  ticketTypeName: string;
  attendeeName: string;
  attendeeEmail?: string;
  attendeeMobile?: string;
  seatCode?: string;
  passStatus: EventPassStatus;
  verificationCode: string;
  qrPayload: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventOrder {
  id: string; // CV-ORD-XXXXXX
  orderReference: string;
  eventId: string;
  userId?: string;
  currency: string;
  ticketSubtotal: number;
  convenienceFee: number;
  taxAmount: number;
  discountAmount: number;
  totalPayable: number;
  orderStatus: EventOrderStatus;
  idempotencyKey?: string;
  expiresAt: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventBookingRecord {
  id: string; // EVT-BK-XXXXXX
  passCode: string; // 8-char security code for QR verification
  eventId: string;
  orderId?: string | null;
  bookingMode?: EventBookingMode;
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
  passes?: EventPass[];
  pricing: EventFeeBreakdown;
  paymentMethod: string;
  paymentRequired?: boolean;
  paymentStatus: EventPaymentLifecycleStatus | string;
  bookingStatus: EventBookingStatus | string;
  pdfStatus?: PdfGenerationStatus;
  emailStatus?: EmailDeliveryStatus;
  idempotencyKey?: string;
  qrCodePayload: string; // Encrypted JSON payload for scanner validation
  bookedAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  cancellationReason?: string;
  refundAmount?: number;
  totalPrice?: number;
  ticketPrice?: number;
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

