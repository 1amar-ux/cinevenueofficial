/**
 * CineVenue Entertainment Event Management Types
 * Company: CINEVENUE ENTERTAINMENTS PVT LTD
 * Pure entertainment-only event domain models, proposals, quotations, and operations.
 */

export type EntertainmentCategoryKey = 
  | "movie_promotions"
  | "music_live"
  | "celebrity_fan"
  | "film_industry"
  | "special_entertainment";

export interface EntertainmentCategoryDefinition {
  key: EntertainmentCategoryKey;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  eventTypes: string[];
}

export const ENTERTAINMENT_CATEGORIES: EntertainmentCategoryDefinition[] = [
  {
    key: "movie_promotions",
    name: "Movie Promotional Events",
    tagline: "High-voltage publicity, launches & celebrations",
    description: "Star-studded launches, mega pre-release arena spectacles, and nation-wide promotional campaigns designed to create massive pre-release buzz.",
    iconName: "Clapperboard",
    eventTypes: [
      "Pre-Release Events",
      "Trailer Launch Events",
      "Teaser Launch Events",
      "Audio Launch Events",
      "First-Look Launch Events",
      "Poster and Motion Poster Launches",
      "Movie Success Meets",
      "Press Meets and Media Interactions",
      "Movie Promotional Tours",
      "Movie Premieres",
      "Special Movie Screenings",
      "50-Day, 100-Day and Silver Jubilee Celebrations"
    ]
  },
  {
    key: "music_live",
    name: "Music and Live Entertainment",
    tagline: "Concerts, musical nights & stage performances",
    description: "Concert-grade line array acoustics, stadium-scale lighting, and headline musical performances by legendary playback singers, bands, and performers.",
    iconName: "Music",
    eventTypes: [
      "Musical Nights",
      "Live Music Concerts",
      "Celebrity Singer Performances",
      "Orchestra Shows",
      "DJ Nights",
      "Tribute Concerts",
      "Dance Performances",
      "Comedy and Stand-Up Shows",
      "Multi-Artist Stage Shows"
    ]
  },
  {
    key: "celebrity_fan",
    name: "Celebrity and Fan Events",
    tagline: "Exclusive fan meets & star interactions",
    description: "Bespoke fan galas, director and cast Q&A sessions, star birthdays, and dedicated VIP hospitality experiences.",
    iconName: "Star",
    eventTypes: [
      "Celebrity Meet-and-Greets",
      "Fan Meets",
      "Hero and Heroine Promotional Appearances",
      "Director and Cast Interactions",
      "Celebrity Birthday Celebrations",
      "Fan Association Events",
      "Special Guest Appearances"
    ]
  },
  {
    key: "film_industry",
    name: "Film Industry Events",
    tagline: "Award ceremonies & cinema galas",
    description: "Prestigious red-carpet award nights, guild celebrations, anniversary retrospectives, and premier cinema networking summits.",
    iconName: "Award",
    eventTypes: [
      "Film Awards and Recognition Ceremonies",
      "Film Industry Celebrations",
      "Artist Appreciation Events",
      "Film Anniversary Celebrations",
      "Film Festivals and Screenings",
      "Entertainment Industry Networking Events"
    ]
  },
  {
    key: "special_entertainment",
    name: "Special Entertainment Events",
    tagline: "Festivals, reality promotions & creator meets",
    description: "Multi-genre entertainment carnivals, reality TV launch galas, top digital creator meets, and community festive celebrations.",
    iconName: "Sparkles",
    eventTypes: [
      "Entertainment Festivals",
      "Reality-Show Promotional Events",
      "Digital Creator and Influencer Meets",
      "Public Entertainment Shows",
      "Festival Concerts",
      "Other Entertainment Events"
    ]
  }
];

export const REQUIRED_SERVICES_LIST = [
  "Complete Event Planning and Management",
  "Venue Search and Booking",
  "Stage Setup",
  "LED Screens",
  "Sound Systems",
  "Lighting",
  "Truss and Production Equipment",
  "Photography",
  "Videography and Aftermovie",
  "Live Streaming",
  "Celebrity and Artist Coordination",
  "Ticketing and Online Registration",
  "QR Ticket Validation",
  "Publicity and Digital Marketing",
  "Poster and Promotional Content",
  "Press and Media Coordination",
  "Sponsorship Acquisition and Management",
  "Security and Crowd Management",
  "Guest Hospitality",
  "Transport and Accommodation",
  "Event Staff and Volunteers",
  "Other Requirements"
] as const;

export type RequiredServiceName = typeof REQUIRED_SERVICES_LIST[number];

export type ProposalStatus = 
  | "New"
  | "Under Review"
  | "Need More Details"
  | "Meeting or Discussion Scheduled"
  | "Venue Inspection"
  | "Quotation Preparation"
  | "Quotation Sent"
  | "Negotiation"
  | "Approved"
  | "Rejected"
  | "Cancelled"
  | "Converted to Event";

export interface ProposalFollowUp {
  id: string;
  date: string;
  type: "Call" | "Email" | "Meeting" | "Venue Visit" | "WhatsApp" | "Internal Review";
  summary: string;
  nextFollowUpDate?: string;
  authorName: string;
}

export interface ProposalInternalNote {
  id: string;
  date: string;
  note: string;
  authorName: string;
  isPrivate: boolean; // Always true for admin internal view
}

export interface QuotationItem {
  id: string;
  serviceName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface EventQuotation {
  id: string;
  quotationNumber: string; // CINE-QUO-YYYY-XXXX
  proposalId: string;
  revision: number;
  createdAt: string;
  validUntil: string;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
  items: QuotationItem[];
  subtotal: number;
  discountAmount: number;
  taxRatePercent: number; // typically 18.0% GST
  taxAmount: number;
  grandTotal: number;
  advancePercentage: number;
  advanceAmount: number;
  paymentMilestones: { milestone: string; percentage: number; amount: number; dueOn: string }[];
  inclusions: string[];
  exclusions: string[];
  termsAndConditions: string[];
  preparedBy: string;
  clientApprovedAt?: string;
  clientNotes?: string;
}

export interface EventProposalRecord {
  id: string; // Unique CVE-PROP-YYYY-XXXXX
  referenceId: string;
  createdAt: string;
  updatedAt: string;
  status: ProposalStatus;

  // Section A: Event Information
  category: EntertainmentCategoryKey;
  eventType: string;
  eventName: string;
  eventDescription: string;
  preferredDate: string;
  alternativeDate?: string;
  preferredCity: string;
  preferredVenue: string;
  expectedAudience: number;
  expectedDurationHours: number;
  isPaidEvent: boolean;
  ticketPriceRange?: string;

  // Section B: Organizer Information
  organizerType: "Production House" | "Event Organizer" | "Artist Management" | "Entertainment Organization" | "Individual Producer";
  companyName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  officeAddress?: string;
  websiteUrl?: string;
  socialMediaUrl?: string;

  // Section C: Film & Artist Details
  isFilmRelated: boolean;
  movieTitle?: string;
  productionHouseName?: string;
  directorName?: string;
  producerName?: string;
  leadActors?: string;
  musicDirector?: string;
  singersGuests?: string;
  celebrityAttendanceStatus?: "Confirmed" | "Invited & Awaiting" | "In Discussion" | "Open to Suggestion";

  // Music / Live specifics
  artistNames?: string;
  performanceType?: string;
  performersCount?: number;
  performanceDurationMins?: number;
  technicalRiderNotes?: string;

  // Section D: Services
  servicesRequired: string[];

  // Section E: Budget & Requirements
  estimatedBudget: number;
  isQuotRequestedWithoutBudget: boolean;
  budgetFlexibility: "Exact Budget" | "Flexible Budget" | "Awaiting Quotation";
  servicesBudget?: number;
  sponsorshipRequirements?: string;
  expectedDeliverables?: string;
  specialRequirements?: string;
  additionalNotes?: string;
  attachments?: { name: string; url: string; sizeBytes?: number; uploadedAt: string }[];

  // Administrative Follow-up & Execution
  assignedEventManager?: string;
  assignedManagerEmail?: string;
  rejectionOrCancellationReason?: string;
  lastFollowUpDate?: string;
  nextFollowUpDate?: string;
  internalNotes: ProposalInternalNote[];
  followUps: ProposalFollowUp[];
  quotation?: EventQuotation;

  // Conversion link
  isConvertedToEvent: boolean;
  convertedEventId?: string;
  convertedAt?: string;
}

export interface EventOperationTask {
  id: string;
  eventId: string;
  title: string;
  category: "Stage & Truss" | "Sound & Light" | "LED & Visuals" | "Artist Hospitality" | "Security & Crowd" | "Ticketing & QR" | "Media & PR";
  assignedTo: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Completed" | "Blocked";
  priority: "High" | "Medium" | "Urgent";
}

export interface EventExpenseRecord {
  id: string;
  eventId: string;
  vendorName: string;
  category: string;
  amount: number;
  isPaid: boolean;
  paymentRef?: string;
  date: string;
}
