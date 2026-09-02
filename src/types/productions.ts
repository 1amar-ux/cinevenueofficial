export type ProductionCategory = 
  | "Feature Film" 
  | "Web Series" 
  | "Short Film" 
  | "Music Video" 
  | "Commercial Film" 
  | "Brand Film";

export type ProductionStatus = 
  | "Announced" 
  | "Pre-Production" 
  | "Casting" 
  | "Filming" 
  | "Post-Production" 
  | "Completed" 
  | "Coming Soon" 
  | "Released";

export interface CastMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  characterName: string;
  bio?: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: "Producer" | "Director" | "Writer" | "Cinematographer" | "Music Director" | "Editor" | "Art Director" | "Production Designer" | "VFX Supervisor" | "Sound Designer" | "Stunt Director" | "Executive Producer";
  photoUrl?: string;
}

export interface ProductionMedia {
  id: string;
  type: "Poster" | "First Look" | "Teaser" | "Trailer" | "BTS Video" | "Production Still";
  title: string;
  url: string;
  thumbnailUrl?: string;
}

export interface ProductionUpdate {
  id: string;
  date: string;
  title: string;
  content: string;
  image?: string;
}

export interface ProductionProject {
  id: string;
  title: string;
  tagline: string;
  category: ProductionCategory;
  genre: string[];
  language: string;
  status: ProductionStatus;
  releaseDate?: string;
  director: string;
  leadCast: string[];
  producer: string;
  bannerImage: string;
  posterImage: string;
  description: string;
  synopsis: string;
  trailerUrl?: string;
  ticketMovieTitle?: string; // Links to existing ticket booking movie if released
  isFeatured?: boolean;
  isUpcoming?: boolean;
  budgetRange?: string;
  cast: CastMember[];
  crew: CrewMember[];
  media: ProductionMedia[];
  updates: ProductionUpdate[];
  followersCount: number;
}

export interface CastingCall {
  id: string;
  projectId: string;
  projectTitle: string;
  roleTitle: string;
  category: "Lead Actor" | "Supporting Actor" | "Character Artist" | "Child Artist" | "Model" | "Dancer" | "Singer" | "Voice Artist" | "Technician" | "Cinematographer" | "Editor" | "Writer" | "Director";
  ageRange: string;
  gender: "Male" | "Female" | "Any";
  location: string;
  language: string;
  skillsRequired: string[];
  experienceRequirement: string;
  deadline: string;
  description: string;
  auditionDetails: string;
  status: "Open" | "Urgent" | "Closed";
  postedDate: string;
}

export type FilmApplicationStatus = 
  | "Submitted" 
  | "Under Review" 
  | "Shortlisted" 
  | "Discussion" 
  | "Additional Information Required" 
  | "Approved" 
  | "In Development" 
  | "Declined";

export type ApplicantRole = 
  | "Writer" 
  | "Director" 
  | "Producer" 
  | "Writer-Director" 
  | "Production Company" 
  | "Filmmaker" 
  | "Other";

export type ApplicationProjectType = 
  | "Feature Film" 
  | "Short Film" 
  | "Web Series" 
  | "Anthology" 
  | "Music Film" 
  | "Other";

export type ProjectStage = 
  | "Idea" 
  | "Story Developed" 
  | "Screenplay Completed" 
  | "Pre-Production" 
  | "Casting" 
  | "Ready for Production" 
  | "Already Produced";

export interface CastMemberSubmission {
  id: string;
  name: string;
  role: string;
  status: "Confirmed" | "In Discussion" | "Not Yet Cast";
}

export interface FilmProjectApplication {
  id: string; // e.g. CVP-2026-00128
  userEmail: string;
  submittedAt: string;
  lastUpdated?: string;
  status: FilmApplicationStatus;

  // Step 1 - Project Details
  projectTitle: string;
  projectType: ApplicationProjectType;
  language: string;
  genre: string[];
  logline: string;
  shortSynopsis: string;
  fullSynopsis: string;
  projectStage: ProjectStage;

  // Step 2 - Applicant Details
  fullName: string;
  professionalRole: ApplicantRole;
  phone: string;
  email: string;
  city: string;
  state: string;
  country: string;
  isSubmittingForOthers: boolean;
  representedEntityDetails?: string;

  // Step 3 - Creative Team
  directorName: string;
  directorPreviousWork?: string;
  directorPortfolioUrl?: string;
  writerName: string;
  writerPreviousWork?: string;
  producerName?: string;
  producerCompany?: string;
  leadCast: CastMemberSubmission[];
  keyCrew?: {
    cinematographer?: string;
    musicDirector?: string;
    editor?: string;
    productionDesigner?: string;
    otherCrew?: string;
  };

  // Step 4 - Project Information
  estimatedBudgetRange: string;
  expectedShootingDuration: string;
  primaryShootingLocation: string;
  targetAudience: string;
  targetReleasePeriod: string;
  estimatedRuntime: string;
  numberOfSongs?: string;
  numberOfActionSequences?: string;
  alreadyProduced: boolean;
  producedDetails?: {
    currentStatus?: string;
    previousReleaseDetails?: string;
    existingDistributionStatus?: string;
    availableMasterFormat?: string;
  };

  // Step 5 - What Do You Need From CineVenue
  requestedCollaboration: string[];
  expectationsFromCineVenue: string;

  // Step 6 - Project Materials
  materials: {
    synopsisFileName?: string;
    scriptFileName?: string;
    pitchDeckFileName?: string;
    characterDetailsFileName?: string;
    directorsNoteFileName?: string;
    posterFileName?: string;
    teaserFileName?: string;
    trailerUrl?: string;
    previousWorkUrl?: string;
    showreelUrl?: string;
    referenceImagesFileName?: string;
    additionalDocFileName?: string;
  };

  // Step 7 - Declarations
  rightToSubmitConfirmed: boolean;
  termsAgreed: boolean;
  nonGuaranteeUnderstood: boolean;

  // Admin & Response Fields
  adminNotes?: string;
  assignedReviewer?: string;
  followUpDate?: string;
  isArchived?: boolean;
  additionalInfoRequestedPrompt?: string;
  applicantResponseInfo?: string;
}

export interface StorySubmission {
  id: string;
  userEmail: string;
  userName: string;
  phone: string;
  projectTitle: string;
  logline: string;
  genre: string;
  language: string;
  synopsis: string;
  directorName: string;
  writerName: string;
  producerName?: string;
  projectType: ProductionCategory;
  estimatedBudget: string;
  scriptFileName?: string;
  pitchDeckFileName?: string;
  submittedAt: string;
  status: "Submitted" | "Under Review" | "Shortlisted" | "Meeting" | "Development" | "Approved" | "Declined";
  adminNotes?: string;
}

export interface BrandCampaignRequest {
  id: string;
  brandName: string;
  contactPerson: string;
  email: string;
  phone: string;
  campaignType: "Movie Placement" | "Event Sponsorship" | "Digital Campaign" | "Celebrity Endorsement" | "Content Production";
  targetAudience: string;
  location: string;
  budgetRange: string;
  duration: string;
  requirements: string;
  briefFileName?: string;
  submittedAt: string;
  status: "Received" | "Under Review" | "Proposal" | "Negotiation" | "Approved" | "In Production" | "Live" | "Completed";
}

export interface EventMessage {
  id: string;
  sender: "client" | "producer" | "admin" | "system";
  senderName: string;
  senderEmail?: string;
  text: string;
  timestamp: string;
  isRead?: boolean;
}

export interface EventManagementRequest {
  id: string; // e.g. CVE-2026-00001
  requestId?: string; // For compatibility across Main & Sub portals
  userEmail: string;
  eventName: string;
  eventType: "Film Event" | "Entertainment Event" | "Corporate Event" | "College & Youth Event" | "Private & Custom Event" | "Concert" | "Movie Premiere" | "Award Show" | "Festival" | "College Fest" | "Corporate Event" | "Celebrity Night" | "Brand Activation" | "Other" | string;
  description: string;
  preferredDate: string;
  dateFlexibility: "Exact" | "Flexible";
  preferredTime?: string;
  city: string;
  venuePreference?: string;
  venue?: string;
  location?: string;
  expectedAudience: number | string;
  servicesRequired: string[];
  requiredServices?: string[];
  otherServicesText?: string;
  specialRequirements?: string;
  budgetRange: "Under ₹1 Lakh" | "₹1–5 Lakhs" | "₹5–10 Lakhs" | "₹10–25 Lakhs" | "₹25 Lakhs+" | "I want to discuss the budget" | string;
  budget?: number;
  quoteAmount?: number;
  fullName: string;
  phone: string;
  email: string;
  company?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientCompany?: string;
  customerId?: string;
  submittedAt: string;
  createdAt?: string;
  status: "Submitted" | "Under Review" | "Discussion" | "Proposal" | "Confirmed" | "Planning" | "Event Day" | "Completed" | "Cancelled" | "Postponed" | "Declined" | "SUBMITTED" | "UNDER_REVIEW" | "QUOTE_SENT" | "QUOTE_APPROVED" | "ADVANCE_PAYMENT" | "PLANNING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | string;
  adminNotes?: string;
  assignedTeamMember?: string;
  assignedEventManager?: string | null;
  assignedVendors?: string[];
  additionalInfoPrompt?: string;
  userResponseInfo?: string;
  documents?: { title: string; url: string; date: string }[];
  updates?: { date: string; title: string; note: string; author: string }[];
  messages?: EventMessage[];
}

export interface PublicEvent {
  id: string; // e.g. CVE-EV-101
  title: string;
  category: "Film Event" | "Concert" | "Stage Show" | "Music Festival" | "Cultural Festival" | "Corporate Event" | "Award Function" | "College Fest" | "Private & Custom";
  date: string;
  time: string;
  venue: string;
  city: string;
  posterUrl: string;
  coverUrl: string;
  description: string;
  artists: string[];
  startingTicketPrice?: number;
  status: "Upcoming" | "Live" | "Completed" | "Cancelled" | "Postponed";
  isPublished: boolean;
  ticketMovieTitle?: string; // Connects to CineVenue ticketing system
  highlights?: string[];
  gallery?: string[];
  promoVideoUrl?: string;
  sponsors?: string[];
  organizer: string;
  seatsTotal?: number;
  seatsBooked?: number;
}

export interface ArtistRequest {
  id: string;
  userEmail: string;
  eventName: string;
  artistCategory: "Actors" | "Singers" | "DJs" | "Bands" | "Dancers" | "Anchors" | "Comedians" | "Influencers" | "Speakers" | "Other";
  preferredArtist: string;
  eventDate: string;
  location: string;
  budgetRange: string;
  requirements: string;
  fullName: string;
  phone: string;
  email: string;
  submittedAt: string;
  status: "Submitted" | "Under Review" | "Discussion" | "Confirmed" | "Declined";
}

export interface SponsorshipRequest {
  id: string;
  userEmail: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  location: string;
  expectedAudience: string;
  sponsorshipRequirement: string;
  targetBrandCategories: string;
  budgetRequirement: string;
  description: string;
  fullName: string;
  phone: string;
  email: string;
  submittedAt: string;
  status: "Received" | "Reviewing" | "In Discussion" | "Approved" | "Declined";
}

export interface EventPortfolioItem {
  id: string;
  title: string;
  category: "Concerts" | "Film Events" | "Corporate Events" | "College Events" | "Brand Events" | "Festivals" | "Celebrity Events" | "Other Events";
  client?: string;
  location: string;
  year: string;
  description: string;
  servicesProvided: string[];
  artists: string[];
  sponsors: string[];
  coverImage: string;
  gallery: string[];
  videos?: string[];
  highlights?: string[];
  isPublished: boolean;
}

export interface VenueRecord {
  id: string;
  name: string;
  city: string;
  address: string;
  capacity: number;
  contactPerson: string;
  contactPhone: string;
  venueType: "Indoor Auditorium" | "Outdoor Arena" | "Convention Center" | "Hotel Ballroom" | "College Grounds" | "Studio Stage";
  imageUrl: string;
  facilities: string[];
  hasParking: boolean;
  hasVIPGreenRoom: boolean;
}

export interface ArtistRecord {
  id: string;
  name: string;
  category: "Actors" | "Singers" | "DJs" | "Bands" | "Dancers" | "Anchors" | "Comedians" | "Influencers" | "Speakers" | "Other";
  photoUrl: string;
  languages: string[];
  startingFee: string;
  availability: "Available" | "Busy" | "Selective";
  bio: string;
  socialFollowers: string;
}

export interface PromotionCampaign {
  id: string; // e.g. MPRO-2026-001
  name: string;
  promotedType: "Film" | "Short Film" | "Event" | "Brand" | "Casting Call" | "Artist" | "Ticket Sales" | "CineVenue";
  relatedId?: string; // linked project or event ID
  relatedTitle?: string;
  objective: "Awareness" | "Engagement" | "Ticket Sales" | "Event Registrations" | "Casting Applications" | "Brand Awareness" | "Leads" | "Website Traffic";
  startDate: string;
  endDate: string;
  targetAudience: string;
  targetLocations: string;
  languages: string[];
  budget: string;
  status: "Draft" | "Planning" | "Client Review" | "Approved" | "Scheduled" | "Active" | "Paused" | "Completed" | "Archived";
  manager: string;
  description: string;
  deliverables: { title: string; required: number; completed: number; status: "Pending" | "In Progress" | "Completed" }[];
  reachImpressions?: number;
  totalViews?: number;
  clicks?: number;
  ticketConversions?: number;
  trackingLink?: string;
}

export interface BehindTheScenesItem {
  id: string;
  projectId?: string;
  projectTitle: string;
  title: string;
  category: "Shooting" | "Rehearsals" | "Production" | "Makeup" | "Locations" | "Interviews" | "Set Design" | "VFX" | "Music" | "Events";
  type: "image" | "video";
  mediaUrl: string;
  caption: string;
  date: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: "Movie Announcement" | "Casting Announcement" | "Production Update" | "Event Announcement" | "Brand Partnership" | "First Look" | "Trailer Drop" | "Release Date" | "Awards";
  image: string;
  date: string;
  author: string;
  summary: string;
  content: string;
  relatedProjectId?: string;
  tags: string[];
}

export interface PartnerEnquiry {
  id: string;
  category: "Producer" | "Director" | "Writer" | "Actor" | "Technician" | "Distributor" | "Theatre Partner" | "Brand" | "Event Organizer";
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  experienceYears?: string;
  portfolioUrl?: string;
  city: string;
  message: string;
  submittedAt: string;
  status: "New" | "Contacted" | "In Discussion" | "Partnered" | "Closed";
}

export interface TalentProfileData {
  id: string;
  userEmail: string;
  fullName: string;
  stageName?: string;
  category: string;
  gender: string;
  age: number;
  height?: string;
  languages: string[];
  skills: string[];
  experienceYears: number;
  location: string;
  bio: string;
  profilePhoto: string;
  portfolioImages: string[];
  showreelUrl?: string;
  previousWork: string[];
  resumeFileName?: string;
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    imdb?: string;
  };
  availability: "Available" | "Busy" | "Selective";
  isPublic: boolean;
}
