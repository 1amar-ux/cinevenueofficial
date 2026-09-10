// ============================================================
// CineVenue Event Booking & Ticketing Service
// Unified client & backend-integrated service for event discovery,
// seat/capacity locking, checkout calculation, digital QR tickets,
// gate check-in scanning, and organizer administration.
// ============================================================

import type {
  EventItem,
  EventTicketType,
  EventSeatSection,
  EventSeat,
  EventBookingRecord,
  EventCoupon,
  TemporarySeatLock,
  EventFeeBreakdown,
  EventCheckInResult,
  OrganizerEventStats,
  EventCategoryType,
} from '../types/eventBooking';

const STORAGE_KEYS = {
  EVENTS: 'cv_ticketed_events',
  BOOKINGS: 'cv_event_bookings',
  LOCKS: 'cv_event_seat_locks',
  COUPONS: 'cv_event_coupons',
  SETTINGS: 'cv_event_booking_settings',
} as const;

// ─── Default Coupons ─────────────────────────────────────────
export const DEFAULT_COUPONS: EventCoupon[] = [
  {
    code: 'CINEEVENT20',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    maxDiscount: 500,
    minOrderAmount: 999,
    validUntil: '2026-12-31',
    usageCount: 142,
    maxUsage: 1000,
    isActive: true,
  },
  {
    code: 'FIRSTPASS100',
    discountType: 'FLAT',
    discountValue: 100,
    minOrderAmount: 499,
    validUntil: '2026-12-31',
    usageCount: 88,
    maxUsage: 500,
    isActive: true,
  },
  {
    code: 'VIPGALA300',
    discountType: 'FLAT',
    discountValue: 300,
    minOrderAmount: 1999,
    validUntil: '2026-12-31',
    usageCount: 45,
    maxUsage: 250,
    isActive: true,
  },
];

// Helper to generate seat sections for assigned seating events
const generateSeatSection = (
  sectionId: string,
  eventId: string,
  name: string,
  tier: any,
  rows: string[],
  seatsPerRow: number,
  price: number
): EventSeatSection => {
  const seats: EventSeat[] = [];
  rows.forEach((row) => {
    for (let num = 1; num <= seatsPerRow; num++) {
      // randomly occupy ~15% of seats for realistic feel
      const isPreOccupied = (row === 'A' && num % 4 === 0) || (row === 'B' && num % 5 === 0);
      seats.push({
        id: `${sectionId}-${row}-${num}`,
        sectionId,
        row,
        seatNumber: num,
        seatCode: `${name.substring(0, 3).toUpperCase()}-${row}${num}`,
        price,
        status: isPreOccupied ? 'sold' : 'available',
      });
    }
  });

  return {
    id: sectionId,
    eventId,
    name,
    tier,
    rows,
    seatsPerRow,
    price,
    seats,
  };
};

// ─── Initial Seeded Events ────────────────────────────────────
export const INITIAL_TICKETED_EVENTS: EventItem[] = [
  {
    id: 'EVT-101',
    title: 'Sunburn Arena ft. Alan Walker Live in Concert',
    slug: 'sunburn-arena-alan-walker-hyderabad',
    description:
      'The international electronic music sensation Alan Walker brings his mind-blowing WalkerWorld stadium tour to Hyderabad! Featuring multi-tier pyrotechnics, massive 4K LED walls, immersive visual storytelling, and all his greatest chart-toppers including Faded, Spectre, Alone, and On My Way.',
    category: 'Concerts',
    bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=75',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=75',
    ],
    organizer: {
      id: 'ORG-01',
      name: 'Sunburn Live India',
      email: 'live@sunburn.in',
      phone: '+91 98200 11223',
      companyName: 'Percept Entertainment Ltd',
      logoUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&q=80',
      isVerified: true,
      rating: 4.9,
      eventsCount: 42,
    },
    date: '2026-10-18',
    startTime: '06:00 PM',
    endTime: '11:00 PM',
    duration: '5h 00m',
    venueName: 'Gachibowli Outdoor Stadium',
    venueAddress: 'Old Mumbai Highway, Gachibowli, Hyderabad, Telangana 500032',
    city: 'Hyderabad',
    latitude: 17.4435,
    longitude: 78.3489,
    language: 'English / Electronic',
    ageRestriction: '16+ Only',
    termsAndConditions: [
      'Entry gates open at 04:30 PM. Valid government photo ID mandatory.',
      'No outside food, beverages, sharp objects, or recording cameras allowed.',
      'Re-entry is strictly prohibited once checked in.',
      'Parking is available on first-come-first-serve basis near Gate 4.',
    ],
    cancellationPolicy: 'Cancellations allowed up to 48 hours before the event with a 15% cancellation fee.',
    seatingType: 'GeneralAdmission',
    totalCapacity: 12000,
    soldCount: 7840,
    status: 'Published',
    isFeatured: true,
    isSellingFast: true,
    rating: 4.8,
    reviewCount: 312,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-09-01T12:00:00Z',
    ticketTypes: [
      {
        id: 'TKT-101-1',
        eventId: 'EVT-101',
        name: 'General Admission (Phase 1)',
        tier: 'General',
        description: 'Standing access to the main open-air concert ground. Great view of LED stages.',
        price: 1499,
        availableQuantity: 3000,
        soldQuantity: 2400,
        maxPerUser: 6,
        minPerUser: 1,
        status: 'Active',
        isRefundable: true,
      },
      {
        id: 'TKT-101-2',
        eventId: 'EVT-101',
        name: 'VIP Front Stage Arena',
        tier: 'VIP',
        description: 'Dedicated elevated entrance, elevated stage front view, dedicated food & beverage counters.',
        price: 3499,
        availableQuantity: 1200,
        soldQuantity: 950,
        maxPerUser: 6,
        minPerUser: 1,
        status: 'Active',
        isRefundable: true,
      },
      {
        id: 'TKT-101-3',
        eventId: 'EVT-101',
        name: 'VVIP Table of 6 (Lounge)',
        tier: 'VVIP',
        description: 'Reserved lounge sofa table with prime stage angle, unlimited gourmet finger food, private concierge.',
        price: 24999,
        availableQuantity: 50,
        soldQuantity: 38,
        maxPerUser: 2,
        minPerUser: 1,
        status: 'Active',
        isRefundable: true,
      },
    ],
  },
  {
    id: 'EVT-102',
    title: 'Zakir Khan Live — "Tathastu & Beyond" Special',
    slug: 'zakir-khan-live-comedy-hyderabad',
    description:
      'India’s most beloved storyteller and comedy icon Zakir Khan is back on tour with an all-new 90-minute stand-up special filled with nostalgic anecdotes, relatable desi family dynamics, and heartfelt observations delivered in his trademark "Sakht Launda" style.',
    category: 'Stand-up Comedy',
    bannerUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=75',
    ],
    organizer: {
      id: 'ORG-02',
      name: 'OML Entertainment',
      email: 'shows@oml.in',
      phone: '+91 99301 44556',
      companyName: 'Only Much Louder Event Management',
      logoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
      isVerified: true,
      rating: 4.95,
      eventsCount: 65,
    },
    date: '2026-11-06',
    startTime: '07:30 PM',
    endTime: '09:30 PM',
    duration: '2h 00m',
    venueName: 'Shilpakala Vedika Auditorium',
    venueAddress: 'Hitech City Main Rd, Madhapur, Hyderabad, Telangana 500081',
    city: 'Hyderabad',
    latitude: 17.4474,
    longitude: 78.3762,
    language: 'Hindi',
    ageRestriction: '14+',
    termsAndConditions: [
      'Auditorium doors close strictly at 07:25 PM. Latecomers will not be admitted during performance.',
      'Mobile phones must be switched to silent mode. Flash photography is prohibited.',
      'Assigned seating event: please occupy only the exact seat printed on your digital pass.',
    ],
    cancellationPolicy: 'Non-refundable within 72 hours of showtime.',
    seatingType: 'AssignedSeating',
    totalCapacity: 2200,
    soldCount: 1650,
    status: 'Published',
    isFeatured: true,
    isSellingFast: true,
    rating: 4.9,
    reviewCount: 420,
    createdAt: '2026-08-10T12:00:00Z',
    updatedAt: '2026-09-02T14:00:00Z',
    ticketTypes: [
      {
        id: 'TKT-102-1',
        eventId: 'EVT-102',
        name: 'Balcony Standard',
        tier: 'General',
        description: 'Upper tier balcony with clear central stage acoustic sound.',
        price: 799,
        availableQuantity: 800,
        soldQuantity: 620,
        maxPerUser: 6,
        minPerUser: 1,
        status: 'Active',
        isRefundable: true,
      },
      {
        id: 'TKT-102-2',
        eventId: 'EVT-102',
        name: 'Main Hall Premium',
        tier: 'Premium',
        description: 'Middle auditorium stalls with direct acoustic line of sight.',
        price: 1499,
        availableQuantity: 900,
        soldQuantity: 740,
        maxPerUser: 6,
        minPerUser: 1,
        status: 'Active',
        isRefundable: true,
      },
      {
        id: 'TKT-102-3',
        eventId: 'EVT-102',
        name: 'Royal Front Rows VIP',
        tier: 'VIP',
        description: 'Front 4 rows closest to the stage, complimentary water and show booklet.',
        price: 2499,
        availableQuantity: 500,
        soldQuantity: 290,
        maxPerUser: 4,
        minPerUser: 1,
        status: 'Active',
        isRefundable: true,
      },
    ],
    seatSections: [
      generateSeatSection('SEC-VIP', 'EVT-102', 'Royal VIP Front', 'VIP', ['A', 'B', 'C', 'D'], 20, 2499),
      generateSeatSection('SEC-PREM', 'EVT-102', 'Premium Orchestra', 'Premium', ['E', 'F', 'G', 'H', 'J'], 24, 1499),
      generateSeatSection('SEC-BALC', 'EVT-102', 'Balcony Tier', 'General', ['K', 'L', 'M', 'N'], 24, 799),
    ],
  },
  {
    id: 'EVT-103',
    title: 'Kalki 2898 AD: Director & Star Cast Celebration Gala',
    slug: 'kalki-2898-ad-fan-gala-celebrity-screening',
    description:
      'An unprecedented cinematic gala gathering director Nag Ashwin, Prabhas, and the legendary music & VFX team for an exclusive behind-the-scenes showcase, unreleased 70mm IMAX sequence screenings, fan Q&A session, and collector merchandise giveaway.',
    category: 'Film Events',
    bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=75',
    ],
    organizer: {
      id: 'ORG-03',
      name: 'Vyjayanthi Cinema Experiences',
      email: 'events@vyjayanthimovies.com',
      phone: '+91 94400 88990',
      companyName: 'Vyjayanthi Films Pvt Ltd',
      logoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&q=80',
      isVerified: true,
      rating: 5.0,
      eventsCount: 18,
    },
    date: '2026-10-24',
    startTime: '06:30 PM',
    endTime: '10:00 PM',
    duration: '3h 30m',
    venueName: 'Prasads Large Screen Theatre',
    venueAddress: 'NTR Gardens, Necklace Road, Hyderabad, Telangana 500063',
    city: 'Hyderabad',
    latitude: 17.4123,
    longitude: 78.4682,
    language: 'Telugu / English',
    ageRestriction: 'All Ages',
    termsAndConditions: [
      'Autographed movie poster and souvenir badge included with every admission pass.',
      'Live Q&A question submission links will be SMS-sent to registered ticket holders prior to the event.',
      'Red carpet photo opportunity opens at 05:30 PM.',
    ],
    cancellationPolicy: 'Refundable up to 24 hours prior to screening.',
    seatingType: 'AssignedSeating',
    totalCapacity: 640,
    soldCount: 480,
    status: 'Published',
    isFeatured: true,
    isSellingFast: true,
    rating: 4.95,
    reviewCount: 190,
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-09-05T11:00:00Z',
    ticketTypes: [
      {
        id: 'TKT-103-1',
        eventId: 'EVT-103',
        name: 'Premium Recliner Gala Pass',
        tier: 'VVIP',
        description: 'Luxury recliner seating, autographed memorabilia box, and cocktail dinner buffet.',
        price: 2999,
        availableQuantity: 120,
        soldQuantity: 95,
        maxPerUser: 4,
        minPerUser: 1,
        status: 'Active',
        isRefundable: true,
      },
      {
        id: 'TKT-103-2',
        eventId: 'EVT-103',
        name: 'Executive Circle Pass',
        tier: 'VIP',
        description: 'Prime center view seating, collector pass lanyard, and popcorn combo.',
        price: 1499,
        availableQuantity: 280,
        soldQuantity: 220,
        maxPerUser: 6,
        minPerUser: 1,
        status: 'Active',
        isRefundable: true,
      },
      {
        id: 'TKT-103-3',
        eventId: 'EVT-103',
        name: 'Fan Club Pass',
        tier: 'General',
        description: 'Front stadium view seating with event welcome badge.',
        price: 699,
        availableQuantity: 240,
        soldQuantity: 165,
        maxPerUser: 6,
        minPerUser: 1,
        status: 'Active',
        isRefundable: true,
      },
    ],
    seatSections: [
      generateSeatSection('SEC-RECL', 'EVT-103', 'Platinum Recliner', 'VVIP', ['A', 'B'], 16, 2999),
      generateSeatSection('SEC-EXEC', 'EVT-103', 'Executive Circle', 'VIP', ['C', 'D', 'E', 'F'], 20, 1499),
      generateSeatSection('SEC-FAN', 'EVT-103', 'Fan Zone', 'General', ['G', 'H', 'J'], 20, 699),
    ],
  },
  {
    id: 'EVT-104',
    title: 'Symphony of Cinema: AR Rahman & Ilaiyaraaja Orchestral Night',
    slug: 'symphony-of-cinema-orchestral-night-vijayawada',
    description:
      'A majestic 65-piece grand philharmonic orchestra playing timeless Indian cinema classics by Oscar winner A.R. Rahman, Ilaiyaraaja, and M.M. Keeravani with synchronized 4K projections and live choir accompaniment.',
    category: 'Cultural Events',
    bannerUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=75',
    ],
    organizer: {
      id: 'ORG-04',
      name: 'South Indian Philharmonic Guild',
      email: 'contact@philharmonic.in',
      companyName: 'Apex Arts & Culture Society',
      isVerified: true,
      rating: 4.88,
      eventsCount: 29,
    },
    date: '2026-11-14',
    startTime: '06:30 PM',
    endTime: '10:00 PM',
    duration: '3h 30m',
    venueName: 'A Convention Centre',
    venueAddress: 'MG Road, Labbipet, Vijayawada, Andhra Pradesh 520010',
    city: 'Vijayawada',
    latitude: 16.5062,
    longitude: 80.648,
    language: 'Instrumental / Multilingual',
    ageRestriction: 'All Ages',
    termsAndConditions: [
      'Formal / Smart Casual dress code encouraged.',
      'Auditorium doors close 10 minutes prior to first overture.',
    ],
    cancellationPolicy: '100% refund up to 7 days before event.',
    seatingType: 'GeneralAdmission',
    totalCapacity: 3500,
    soldCount: 2100,
    status: 'Published',
    isFeatured: false,
    rating: 4.85,
    reviewCount: 145,
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-09-02T16:00:00Z',
    ticketTypes: [
      {
        id: 'TKT-104-1',
        eventId: 'EVT-104',
        name: 'Silver Gallery',
        tier: 'General',
        description: 'Comfortable auditorium seating with balanced orchestral acoustics.',
        price: 499,
        availableQuantity: 1500,
        soldQuantity: 950,
        maxPerUser: 8,
        minPerUser: 1,
        status: 'Active',
        isRefundable: true,
      },
      {
        id: 'TKT-104-2',
        eventId: 'EVT-104',
        name: 'Gold Grand Tier',
        tier: 'Premium',
        description: 'Center-stage acoustic zone with prime view of the 65-member orchestra.',
        price: 999,
        availableQuantity: 1200,
        soldQuantity: 780,
        maxPerUser: 6,
        minPerUser: 1,
        status: 'Active',
        isRefundable: true,
      },
      {
        id: 'TKT-104-3',
        eventId: 'EVT-104',
        name: 'Platinum Maestro Pass',
        tier: 'VIP',
        description: 'First 5 rows, exclusive program booklet signed by conductor, private lounge entry.',
        price: 1999,
        availableQuantity: 800,
        soldQuantity: 370,
        maxPerUser: 4,
        minPerUser: 1,
        status: 'Active',
        isRefundable: true,
      },
    ],
  },
  {
    id: 'EVT-105',
    title: 'Indian National Film Acting & Audition Masterclass',
    slug: 'film-acting-audition-masterclass-guntur',
    description:
      'Intensive hands-on masterclass led by celebrated casting directors and screen coaches. Covers character breakdown, on-camera dialogue delivery, cold readings, showreel creation, and direct audition evaluations.',
    category: 'Workshops',
    bannerUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=75',
    ],
    organizer: {
      id: 'ORG-05',
      name: 'Cinema Craft Academy',
      email: 'workshops@cinemacraft.org',
      companyName: 'National Film Guild Institute',
      isVerified: true,
      rating: 4.9,
      eventsCount: 15,
    },
    date: '2026-11-22',
    startTime: '10:00 AM',
    endTime: '05:00 PM',
    duration: '7h 00m (Full Day)',
    venueName: 'Guntur Club Convention Hall',
    venueAddress: 'Brodipet, Guntur, Andhra Pradesh 522002',
    city: 'Guntur',
    latitude: 16.3067,
    longitude: 80.4365,
    language: 'Telugu / English',
    ageRestriction: '16+',
    termsAndConditions: [
      'Includes lunch and refreshments.',
      'Participants will receive a recognized certificate of completion.',
      'Monologue scripts will be sent 5 days in advance for preparation.',
    ],
    cancellationPolicy: 'Refundable up to 5 days prior to workshop.',
    seatingType: 'GeneralAdmission',
    totalCapacity: 120,
    soldCount: 88,
    status: 'Published',
    isFeatured: false,
    rating: 4.92,
    reviewCount: 78,
    createdAt: '2026-08-25T11:00:00Z',
    updatedAt: '2026-09-04T12:00:00Z',
    ticketTypes: [
      {
        id: 'TKT-105-1',
        eventId: 'EVT-105',
        name: 'Workshop Attendee Pass',
        tier: 'General',
        description: 'Full day participation, workbook, lunch buffet, certificate.',
        price: 1999,
        availableQuantity: 90,
        soldQuantity: 68,
        maxPerUser: 2,
        minPerUser: 1,
        status: 'Active',
        isRefundable: true,
      },
      {
        id: 'TKT-105-2',
        eventId: 'EVT-105',
        name: 'VIP Direct Evaluation Pass',
        tier: 'VIP',
        description: 'Includes 1-on-1 taped monologue audition evaluation with head casting director.',
        price: 3499,
        availableQuantity: 30,
        soldQuantity: 20,
        maxPerUser: 1,
        minPerUser: 1,
        status: 'Active',
        isRefundable: true,
      },
    ],
  },
  {
    id: 'EVT-106',
    title: 'Hyderabad Pro Badminton League 2026 Grand Finals',
    slug: 'pro-badminton-league-grand-finals-hyderabad',
    description:
      'Witness India’s top Olympic shuttlers and international champions battle for the coveted championship trophy in high-octane singles and mixed doubles finals. Electrifying atmosphere with live stadium DJ and commentary.',
    category: 'Sports Events',
    bannerUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=75',
    ],
    organizer: {
      id: 'ORG-06',
      name: 'Telangana Sports Federation',
      email: 'pbl@sports.telangana.gov.in',
      companyName: 'Telangana Badminton Association',
      isVerified: true,
      rating: 4.8,
      eventsCount: 34,
    },
    date: '2026-12-05',
    startTime: '04:00 PM',
    endTime: '09:00 PM',
    duration: '5h 00m',
    venueName: 'Kotla Vijaya Bhaskara Reddy Indoor Stadium',
    venueAddress: 'Yousufguda, Hyderabad, Telangana 500045',
    city: 'Hyderabad',
    latitude: 17.4398,
    longitude: 78.4312,
    language: 'English / Hindi',
    ageRestriction: 'All Ages',
    termsAndConditions: [
      'Tickets admit one person per barcode.',
      'Sports merchandise stalls available inside the arena.',
    ],
    cancellationPolicy: 'Non-refundable event.',
    seatingType: 'GeneralAdmission',
    totalCapacity: 5000,
    soldCount: 3200,
    status: 'Published',
    isFeatured: false,
    rating: 4.75,
    reviewCount: 88,
    createdAt: '2026-08-28T09:00:00Z',
    updatedAt: '2026-09-05T15:00:00Z',
    ticketTypes: [
      {
        id: 'TKT-106-1',
        eventId: 'EVT-106',
        name: 'Court Upper Stands',
        tier: 'General',
        description: 'Upper tier arena view overlooking all courts.',
        price: 299,
        availableQuantity: 3000,
        soldQuantity: 2100,
        maxPerUser: 6,
        minPerUser: 1,
        status: 'Active',
        isRefundable: false,
      },
      {
        id: 'TKT-106-2',
        eventId: 'EVT-106',
        name: 'Courtside VIP Chair',
        tier: 'VIP',
        description: 'First row cushioned chairs directly adjacent to match courts.',
        price: 1299,
        availableQuantity: 800,
        soldQuantity: 520,
        maxPerUser: 4,
        minPerUser: 1,
        status: 'Active',
        isRefundable: false,
      },
    ],
  },
];

// ─── Local Storage Helper Functions ───────────────────────────
function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to load from storage key ${key}:`, err);
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save to storage key ${key}:`, err);
  }
}

// ─── Event Item Service API ───────────────────────────────────

export function getEvents(): EventItem[] {
  const events = loadStorage<EventItem[]>(STORAGE_KEYS.EVENTS, []);
  if (events.length === 0) {
    saveStorage(STORAGE_KEYS.EVENTS, INITIAL_TICKETED_EVENTS);
    return INITIAL_TICKETED_EVENTS;
  }
  return events;
}

export function getEventById(id: string): EventItem | undefined {
  const events = getEvents();
  return events.find((e) => e.id === id);
}

export function saveEvent(event: EventItem): EventItem {
  const events = getEvents();
  const existingIdx = events.findIndex((e) => e.id === event.id);
  let updatedEvents: EventItem[];

  if (existingIdx >= 0) {
    updatedEvents = [...events];
    updatedEvents[existingIdx] = {
      ...event,
      updatedAt: new Date().toISOString(),
    };
  } else {
    updatedEvents = [
      {
        ...event,
        id: event.id || `EVT-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...events,
    ];
  }

  saveStorage(STORAGE_KEYS.EVENTS, updatedEvents);
  return event;
}

export function deleteEvent(id: string): boolean {
  const events = getEvents();
  const filtered = events.filter((e) => e.id !== id);
  if (filtered.length === events.length) return false;
  saveStorage(STORAGE_KEYS.EVENTS, filtered);
  return true;
}

// ─── Temporary Inventory Locking ──────────────────────────────
// Hold seats or general tickets for 10 minutes (600,000 ms)

export function getActiveLocks(): TemporarySeatLock[] {
  const now = Date.now();
  const locks = loadStorage<TemporarySeatLock[]>(STORAGE_KEYS.LOCKS, []);
  // Clean up expired locks automatically
  const active = locks.filter((l) => l.expiresAt > now);
  if (active.length !== locks.length) {
    saveStorage(STORAGE_KEYS.LOCKS, active);
  }
  return active;
}

export function createTemporaryLock(params: {
  eventId: string;
  ticketTypeId?: string;
  seatCodes?: string[];
  quantity: number;
  sessionId: string;
  userEmail: string;
}): { success: boolean; lock?: TemporarySeatLock; error?: string } {
  const activeLocks = getActiveLocks();
  const event = getEventById(params.eventId);
  if (!event) return { success: false, error: 'Event not found.' };

  // For assigned seating: verify none of the seats are currently locked or sold
  if (params.seatCodes && params.seatCodes.length > 0) {
    const existingConflict = activeLocks.find(
      (l) =>
        l.eventId === params.eventId &&
        l.seatCodes?.some((code) => params.seatCodes!.includes(code)) &&
        l.sessionId !== params.sessionId
    );

    if (existingConflict) {
      return {
        success: false,
        error: 'One or more selected seats are temporarily held by another guest. Please pick different seats.',
      };
    }
  }

  const newLock: TemporarySeatLock = {
    lockId: `LOCK-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    eventId: params.eventId,
    ticketTypeId: params.ticketTypeId,
    seatCodes: params.seatCodes,
    quantity: params.quantity,
    lockedAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes lock
    sessionId: params.sessionId,
    userEmail: params.userEmail,
  };

  // Remove existing locks by this session for this event to prevent stale duplicate holds
  const filtered = activeLocks.filter(
    (l) => !(l.sessionId === params.sessionId && l.eventId === params.eventId)
  );
  saveStorage(STORAGE_KEYS.LOCKS, [...filtered, newLock]);

  return { success: true, lock: newLock };
}

export function releaseTemporaryLock(sessionId: string, eventId: string): void {
  const active = getActiveLocks();
  const filtered = active.filter(
    (l) => !(l.sessionId === sessionId && l.eventId === eventId)
  );
  saveStorage(STORAGE_KEYS.LOCKS, filtered);
}

// ─── Fee Calculation & Pricing Engine ─────────────────────────

export function calculateEventFees(params: {
  ticketPrice: number;
  quantity: number;
  couponCode?: string;
  cineCoinsToRedeem?: number; // 1 CineCoin = ₹1
  platformFeePercent?: number; // Default 5%
}): EventFeeBreakdown {
  const subtotal = params.ticketPrice * params.quantity;
  const platformFeeRate = (params.platformFeePercent ?? 5) / 100;
  const platformBookingFee = Math.round(subtotal * platformFeeRate);
  const taxAmount = Math.round(platformBookingFee * 0.18); // 18% GST on booking fee

  // Coupon calculation
  let discountAmount = 0;
  if (params.couponCode) {
    const coupon = getCouponByCode(params.couponCode);
    if (coupon && coupon.isActive) {
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else {
        discountAmount = coupon.discountValue;
      }
    }
  }

  // CineCoins calculation: max 20% of subtotal can be paid with CineCoins
  const maxCoinsAllowed = Math.floor(subtotal * 0.2);
  const coinsRedeemed = Math.min(params.cineCoinsToRedeem || 0, maxCoinsAllowed);
  const cineCoinsDiscount = coinsRedeemed; // 1 Coin = ₹1

  const rawFinal = subtotal + platformBookingFee + taxAmount - discountAmount - cineCoinsDiscount;
  const finalAmount = Math.max(rawFinal, 0);

  return {
    ticketSubtotal: subtotal,
    platformBookingFee,
    taxAmount,
    discountAmount,
    cineCoinsRedeemed: coinsRedeemed,
    cineCoinsDiscount,
    finalAmount,
  };
}

// ─── Coupons Service ──────────────────────────────────────────

export function getCoupons(): EventCoupon[] {
  const coupons = loadStorage<EventCoupon[]>(STORAGE_KEYS.COUPONS, []);
  if (coupons.length === 0) {
    saveStorage(STORAGE_KEYS.COUPONS, DEFAULT_COUPONS);
    return DEFAULT_COUPONS;
  }
  return coupons;
}

export function getCouponByCode(code: string): EventCoupon | undefined {
  const coupons = getCoupons();
  return coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
}

export function validateCoupon(
  code: string,
  orderSubtotal: number
): { valid: boolean; coupon?: EventCoupon; message: string } {
  const coupon = getCouponByCode(code);
  if (!coupon) return { valid: false, message: 'Invalid coupon code.' };
  if (!coupon.isActive) return { valid: false, message: 'This coupon has expired or is inactive.' };
  if (coupon.usageCount >= coupon.maxUsage) return { valid: false, message: 'Coupon usage limit reached.' };
  if (coupon.minOrderAmount && orderSubtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon.`,
    };
  }

  return { valid: true, coupon, message: 'Coupon applied successfully!' };
}

// ─── Bookings Service ─────────────────────────────────────────

export function getBookings(userEmail?: string): EventBookingRecord[] {
  const allBookings = loadStorage<EventBookingRecord[]>(STORAGE_KEYS.BOOKINGS, []);
  if (!userEmail) return allBookings;
  return allBookings.filter(
    (b) => b.primaryAttendee.email.toLowerCase() === userEmail.toLowerCase()
  );
}

export function getBookingById(bookingId: string): EventBookingRecord | undefined {
  const bookings = loadStorage<EventBookingRecord[]>(STORAGE_KEYS.BOOKINGS, []);
  return bookings.find((b) => b.id === bookingId);
}

export function getBookingByPassCode(passCode: string): EventBookingRecord | undefined {
  const bookings = loadStorage<EventBookingRecord[]>(STORAGE_KEYS.BOOKINGS, []);
  return bookings.find((b) => b.passCode.toUpperCase() === passCode.trim().toUpperCase());
}

export function createEventBooking(params: {
  eventId: string;
  ticketTypeId?: string;
  ticketCount: number;
  seatCodes?: string[];
  primaryAttendee: { name: string; email: string; phone: string };
  additionalAttendees?: { name: string; email?: string; seatCode?: string }[];
  pricing: EventFeeBreakdown;
  paymentMethod: string;
  sessionId: string;
}): EventBookingRecord {
  const event = getEventById(params.eventId);
  if (!event) throw new Error('Event not found');

  const bookingId = `EVT-BK-${Math.floor(100000 + Math.random() * 900000)}`;
  const passCode = `PASS-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  const ticketType = event.ticketTypes.find((t) => t.id === params.ticketTypeId);
  const ticketTypeName = ticketType ? ticketType.name : (params.seatCodes ? 'Assigned Seating' : 'General Admission');

  // Payload encoded in the QR code for authentic validation
  const qrPayload = JSON.stringify({
    bId: bookingId,
    code: passCode,
    evtId: event.id,
    seats: params.seatCodes || [],
    qty: params.ticketCount,
    attendee: params.primaryAttendee.name,
    v: event.venueName,
    date: event.date,
  });

  const record: EventBookingRecord = {
    id: bookingId,
    passCode,
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.date,
    eventTime: event.startTime,
    venueName: event.venueName,
    venueAddress: event.venueAddress,
    city: event.city,
    bannerUrl: event.bannerUrl,
    seatingType: event.seatingType,
    ticketTypeId: params.ticketTypeId,
    ticketTypeName,
    ticketCount: params.ticketCount,
    seatCodes: params.seatCodes,
    primaryAttendee: params.primaryAttendee,
    additionalAttendees: params.additionalAttendees,
    pricing: params.pricing,
    paymentMethod: params.paymentMethod,
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    qrCodePayload: qrPayload,
    bookedAt: new Date().toISOString(),
    checkedIn: false,
  };

  // 1. Save booking
  const existing = loadStorage<EventBookingRecord[]>(STORAGE_KEYS.BOOKINGS, []);
  saveStorage(STORAGE_KEYS.BOOKINGS, [record, ...existing]);

  // 2. Release temporary locks
  releaseTemporaryLock(params.sessionId, params.eventId);

  // 3. Update Event inventory & sold counts
  const events = getEvents();
  const updatedEvents = events.map((e) => {
    if (e.id !== event.id) return e;

    const updatedTickets = e.ticketTypes.map((t) => {
      if (t.id === params.ticketTypeId) {
        return {
          ...t,
          soldQuantity: t.soldQuantity + params.ticketCount,
          availableQuantity: Math.max(t.availableQuantity - params.ticketCount, 0),
        };
      }
      return t;
    });

    // If assigned seating, mark seats as sold
    let updatedSections = e.seatSections;
    if (params.seatCodes && e.seatSections) {
      updatedSections = e.seatSections.map((sec) => ({
        ...sec,
        seats: sec.seats.map((seat) => {
          if (params.seatCodes!.includes(seat.seatCode)) {
            return { ...seat, status: 'sold' as const };
          }
          return seat;
        }),
      }));
    }

    return {
      ...e,
      soldCount: e.soldCount + params.ticketCount,
      ticketTypes: updatedTickets,
      seatSections: updatedSections,
    };
  });
  saveStorage(STORAGE_KEYS.EVENTS, updatedEvents);

  return record;
}

// ─── Gate Check-in Validation Engine ──────────────────────────

export function validateAndCheckInTicket(
  identifier: string, // bookingId, passCode, or QR payload
  staffName = 'Gate Staff'
): EventCheckInResult {
  const bookings = loadStorage<EventBookingRecord[]>(STORAGE_KEYS.BOOKINGS, []);
  let targetBooking: EventBookingRecord | undefined;

  // Attempt 1: Direct passCode match
  targetBooking = bookings.find(
    (b) => b.passCode.toUpperCase() === identifier.trim().toUpperCase()
  );

  // Attempt 2: Booking ID match
  if (!targetBooking) {
    targetBooking = bookings.find(
      (b) => b.id.toUpperCase() === identifier.trim().toUpperCase()
    );
  }

  // Attempt 3: Decoded QR JSON
  if (!targetBooking) {
    try {
      const parsed = JSON.parse(identifier);
      if (parsed.code) {
        targetBooking = bookings.find((b) => b.passCode === parsed.code);
      } else if (parsed.bId) {
        targetBooking = bookings.find((b) => b.id === parsed.bId);
      }
    } catch {
      // Not JSON, ignore
    }
  }

  if (!targetBooking) {
    return {
      success: false,
      message: 'Invalid Ticket. No booking found matching this pass or QR code.',
    };
  }

  if (targetBooking.bookingStatus === 'Cancelled') {
    return {
      success: false,
      booking: targetBooking,
      message: 'Access Denied! This ticket has been cancelled or refunded.',
    };
  }

  if (targetBooking.checkedIn) {
    return {
      success: false,
      booking: targetBooking,
      alreadyCheckedIn: true,
      checkedInAt: targetBooking.checkedInAt,
      message: `Duplicate Entry Attempt! Ticket was already checked in at ${targetBooking.checkedInAt} by ${targetBooking.checkedInBy || 'Gate Staff'}.`,
    };
  }

  // Mark as checked in
  const checkInTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const updatedBookings = bookings.map((b) => {
    if (b.id === targetBooking!.id) {
      return {
        ...b,
        checkedIn: true,
        checkedInAt: checkInTimestamp,
        checkedInBy: staffName,
        bookingStatus: 'Attended' as const,
      };
    }
    return b;
  });

  saveStorage(STORAGE_KEYS.BOOKINGS, updatedBookings);

  return {
    success: true,
    booking: {
      ...targetBooking,
      checkedIn: true,
      checkedInAt: checkInTimestamp,
      checkedInBy: staffName,
    },
    message: `Valid Ticket! Entry Granted for ${targetBooking.primaryAttendee.name} (${targetBooking.ticketCount} pass${targetBooking.ticketCount > 1 ? 'es' : ''}).`,
  };
}

// ─── Organizer Event Analytics ────────────────────────────────

export function getOrganizerEventStats(eventId: string): OrganizerEventStats {
  const event = getEventById(eventId);
  const allBookings = loadStorage<EventBookingRecord[]>(STORAGE_KEYS.BOOKINGS, []);
  const eventBookings = allBookings.filter(
    (b) => b.eventId === eventId && b.bookingStatus !== 'Cancelled'
  );

  const totalTickets = event ? event.totalCapacity : 0;
  const ticketsSold = eventBookings.reduce((sum, b) => sum + b.ticketCount, 0);
  const ticketsRemaining = Math.max(totalTickets - ticketsSold, 0);

  const grossRevenue = eventBookings.reduce(
    (sum, b) => sum + b.pricing.ticketSubtotal,
    0
  );
  const platformFee = Math.round(grossRevenue * 0.05); // 5% CineVenue commission
  const netPayout = grossRevenue - platformFee;

  const checkedInCount = eventBookings
    .filter((b) => b.checkedIn)
    .reduce((sum, b) => sum + b.ticketCount, 0);

  const checkInRatePercent =
    ticketsSold > 0 ? Math.round((checkedInCount / ticketsSold) * 100) : 0;

  return {
    eventId,
    totalTickets,
    ticketsSold,
    ticketsRemaining,
    grossRevenueINR: grossRevenue,
    platformFeeINR: platformFee,
    netPayoutINR: netPayout,
    checkedInCount,
    checkInRatePercent,
  };
}
