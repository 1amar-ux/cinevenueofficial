export interface FilmCraft {
  id: string;
  name: string;
  slug: string;
  category: "Direction & Writing" | "Production & Management" | "Cast & Performance" | "Cinematography & Visuals" | "Sound & Music" | "Post Production & Tech" | "Art & Styling" | "Action & Stunts" | "Publicity & Media";
  icon: string;
  description: string;
  subcategories: string[];
  skills: string[];
  status: "Active" | "Disabled";
  order: number;
}

export type AvailabilityStatus = "Available" | "Partially Available" | "Booked";

export interface AvailabilityCalendarEntry {
  startDate: string;
  endDate: string;
  status: AvailabilityStatus;
  notes?: string;
  city?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  type: "Image" | "Video" | "Showreel" | "Audio" | "Poster" | "Document" | "Link";
  mediaUrl: string;
  thumbnailUrl?: string;
  role: string;
  year: number;
  projectType: string;
  description?: string;
}

export interface FilmographyCredit {
  id: string;
  projectTitle: string;
  role: string;
  craft: string;
  year: number;
  language: string;
  projectType: string;
  directorOrCompany?: string;
  posterUrl?: string;
  notableAwards?: string;
}

export type VerificationBadge = "None" | "Profile Verified" | "Professional Verified" | "Company Verified";

export interface ProfessionalProfile {
  id: string;
  userId: string;
  userEmail: string;
  fullName: string;
  professionalHeadline: string;
  avatarUrl: string;
  coverImageUrl?: string;
  location: string;
  state?: string;
  country: string;
  preferredLocations: string[];
  languages: string[];
  bio: string;
  experienceYears: number;
  primaryCraftId: string;
  primaryCraftName: string;
  secondaryCraftIds: string[];
  secondaryCraftNames: string[];
  specializations: string[];
  skills: string[];
  projectTypes: string[];
  preferredIndustries: string[];
  remunerationRange: {
    min: number;
    max: number;
    currency: string;
    unit: "per project" | "per day" | "per month" | "per song" | "negotiable";
  };
  availability: {
    status: AvailabilityStatus;
    availableFrom?: string;
    availableTo?: string;
    notes?: string;
    scheduleEntries?: AvailabilityCalendarEntry[];
  };
  contactPreferences: {
    allowDirectInvites: boolean;
    allowNegotiations: boolean;
    preferredContactMode: "Platform Chat" | "Email" | "Manager";
    managerName?: string;
    managerContact?: string;
  };
  portfolio: PortfolioItem[];
  filmography: FilmographyCredit[];
  verificationLevel: VerificationBadge;
  verificationNotes?: string;
  rating: number;
  reviewsCount: number;
  completedProjectsCount: number;
  isFeatured?: boolean;
  isAvailableForUrgentCalls?: boolean;
  joinedDate: string;
  lastActive: string;
}

export type ProductionStage = 
  | "Development" 
  | "Pre-production" 
  | "Production" 
  | "Post-production" 
  | "Completed";

export type ProjectType = 
  | "Feature Film" 
  | "Short Film" 
  | "Web Series" 
  | "OTT" 
  | "Documentary" 
  | "Advertisement" 
  | "Music Video" 
  | "Television" 
  | "Other";

export interface FilmProjectRequirement {
  id: string;
  projectId: string;
  projectTitle: string;
  craftId: string;
  craftName: string;
  position: string;
  countRequired: number;
  countHired: number;
  description: string;
  skillsRequired: string[];
  minExperienceYears: number;
  preferredLocation: string;
  languages: string[];
  startDate?: string;
  endDate?: string;
  duration: string;
  budgetRange: string;
  applicationDeadline: string;
  auditionRequired: boolean;
  portfolioRequired: boolean;
  isCastingCall: boolean;
  characterDetails?: {
    name: string;
    gender: "Male" | "Female" | "Any";
    ageRange: string;
    characterDescription: string;
    roleType?: string;
    characterBio?: string;
    physicalLook?: string;
  };
  status: "Open" | "In Review" | "Filled" | "Closed";
  postedDate: string;
}

export interface FilmProject {
  id: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  companyId?: string;
  companyName: string;
  producerName: string;
  directorName: string;
  title: string;
  tagline: string;
  type: ProjectType;
  language: string;
  industry: string;
  location: string;
  genre: string[];
  productionStage: ProductionStage;
  expectedStartDate: string;
  expectedCompletionDate: string;
  budgetRange: string;
  isConfidential: boolean;
  posterUrl: string;
  bannerUrl: string;
  description: string;
  synopsis: string;
  status: "Active" | "Draft" | "In Production" | "Completed" | "Archived";
  isFeatured?: boolean;
  requirements: FilmProjectRequirement[];
  castMembers: ProjectCastMember[];
  crewMembers: ProjectCrewMember[];
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 
  | "Applied" 
  | "Under Review" 
  | "Shortlisted" 
  | "Interview" 
  | "Audition" 
  | "Negotiating" 
  | "Selected" 
  | "Hired" 
  | "Rejected" 
  | "Withdrawn";

export interface JobApplication {
  id: string;
  projectId: string;
  projectTitle: string;
  projectPosterUrl?: string;
  requirementId: string;
  requirementPosition: string;
  craftId: string;
  craftName: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantAvatar: string;
  applicantHeadline: string;
  applicantLocation: string;
  applicantExperienceYears: number;
  applicantRating: number;
  applicantVerification: VerificationBadge;
  coverMessage: string;
  relevantExperience: string;
  selectedPortfolioIds: string[];
  selectedPortfolioItems?: PortfolioItem[];
  expectedPay: string;
  availabilityNotes: string;
  status: ApplicationStatus;
  adminNotes?: string;
  appliedAt: string;
  updatedAt: string;
}

export interface ProjectInvitation {
  id: string;
  projectId: string;
  projectTitle: string;
  projectPosterUrl?: string;
  companyName: string;
  requirementId: string;
  position: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  recipientId: string;
  recipientEmail: string;
  recipientName: string;
  proposedTerms: string;
  proposedRemuneration: string;
  workDates: string;
  location: string;
  message: string;
  status: "Pending" | "Accepted" | "Declined" | "Discussing";
  sentAt: string;
  respondedAt?: string;
}

export interface NegotiationMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "filmmaker" | "professional";
  text: string;
  timestamp: string;
  fileAttachment?: {
    name: string;
    url: string;
    type: string;
  };
}

export type OfferStatus = 
  | "Draft" 
  | "Sent" 
  | "Viewed" 
  | "Countered" 
  | "Accepted" 
  | "Rejected" 
  | "Expired" 
  | "Cancelled";

export interface NegotiationOffer {
  id: string;
  amount: number;
  currency: string;
  paymentMilestones: string[];
  workScope: string;
  startDate: string;
  endDate: string;
  terms: string;
  status: OfferStatus;
  createdBy: "filmmaker" | "professional";
  createdAt: string;
  expiresAt?: string;
}

export interface ProjectNegotiation {
  id: string;
  projectId: string;
  projectTitle: string;
  projectPosterUrl?: string;
  requirementId: string;
  position: string;
  filmmakerId: string;
  filmmakerEmail: string;
  filmmakerName: string;
  professionalId: string;
  professionalEmail: string;
  professionalName: string;
  professionalAvatar: string;
  professionalCraft: string;
  messages: NegotiationMessage[];
  offers: NegotiationOffer[];
  currentOffer?: NegotiationOffer;
  status: "Active" | "Agreed" | "Closed";
  createdAt: string;
  updatedAt: string;
}

export interface HireRecord {
  id: string;
  projectId: string;
  projectTitle: string;
  companyName: string;
  requirementId: string;
  position: string;
  craftName: string;
  professionalId: string;
  professionalName: string;
  professionalEmail: string;
  professionalAvatar?: string;
  agreedRemuneration: string;
  startDate: string;
  endDate: string;
  status: "Hired" | "In Progress" | "Completed" | "Cancelled";
  agreementId?: string;
  hiredAt: string;
}

export interface DigitalAgreement {
  id: string;
  projectId: string;
  projectTitle: string;
  productionCompany: string;
  filmmakerName: string;
  filmmakerEmail: string;
  professionalId: string;
  professionalName: string;
  professionalEmail: string;
  position: string;
  craftName: string;
  scopeOfWork: string;
  remuneration: string;
  paymentMilestones: string[];
  startDate: string;
  endDate: string;
  deliverables: string[];
  creditsTitle: string;
  confidentialityTerms: string;
  cancellationTerms: string;
  ipTerms: string;
  status: "Draft" | "Sent" | "Viewed" | "Accepted" | "Rejected";
  createdAt: string;
  viewedAt?: string;
  acceptedAt?: string;
  signatureName?: string;
  ipAddress?: string;
}

export interface ProjectCastMember {
  id: string;
  projectId: string;
  professionalId?: string;
  actorName: string;
  characterName: string;
  roleType: "Lead" | "Supporting" | "Antagonist" | "Cameo" | "Character Artist";
  status: "Confirmed" | "Shortlisted" | "Negotiating" | "Auditioning";
  contractStatus: "Signed" | "Sent" | "Pending" | "Not Required";
  paymentStatus: "Paid" | "Milestone 1" | "Partial" | "Pending" | "Unpaid";
  photoUrl?: string;
}

export interface ProjectCrewMember {
  id: string;
  projectId: string;
  professionalId?: string;
  name: string;
  department: string;
  craftName: string;
  position: string;
  status: "Confirmed" | "Shortlisted" | "Negotiating";
  contractStatus: "Signed" | "Sent" | "Pending" | "Not Required";
  paymentStatus: "Paid" | "Milestone 1" | "Partial" | "Pending" | "Unpaid";
  photoUrl?: string;
}

export interface ProductionCompany {
  id: string;
  ownerId: string;
  ownerEmail: string;
  name: string;
  logoUrl: string;
  coverImageUrl?: string;
  tagline: string;
  about: string;
  location: string;
  languages: string[];
  services: string[];
  notableCredits: string[];
  creditsCount: number;
  teamSize: string;
  websiteUrl?: string;
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
  verificationStatus: "Verified" | "Pending" | "Unverified";
  activeProjectsCount: number;
  isFeatured?: boolean;
}

export interface TalentReview {
  id: string;
  projectId: string;
  projectTitle: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: "Filmmaker" | "Production Company" | "Professional";
  targetUserId: string;
  targetName: string;
  rating: number;
  ratingsBreakdown: {
    professionalism: number;
    communication: number;
    reliability: number;
    technicalSkill?: number;
  };
  reviewText: string;
  createdAt: string;
  status: "Published" | "Pending Moderation" | "Hidden";
}

export interface ProjectActivityLog {
  id: string;
  projectId: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface MarketplaceReport {
  id: string;
  reporterEmail: string;
  targetId: string;
  targetType: "User" | "Project" | "Job" | "Review" | "Content";
  targetTitle: string;
  reason: "Spam" | "Fraud / Impersonation" | "Harassment" | "Breach of Terms" | "Misleading Information" | "Other";
  details: string;
  status: "Pending" | "Reviewed" | "Action Taken" | "Dismissed";
  createdAt: string;
  adminNotes?: string;
}

export interface MarketplaceNotification {
  id: string;
  recipientEmail: string;
  type: 
    | "matching_project" 
    | "application_received" 
    | "application_shortlisted" 
    | "invitation_received" 
    | "invitation_accepted" 
    | "new_message" 
    | "new_offer" 
    | "counter_offer" 
    | "offer_accepted" 
    | "hiring_completed" 
    | "agreement_created" 
    | "agreement_accepted" 
    | "schedule_update" 
    | "verification_updated";
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}
