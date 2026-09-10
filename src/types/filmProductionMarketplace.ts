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

export type PortfolioMediaCategory = 
  | "Profile Photo"
  | "Professional Photo"
  | "Character Look"
  | "Costume Reference"
  | "Behind The Scenes"
  | "Previous Project Photo"
  | "Showreel"
  | "Acting Clip"
  | "Audition Clip"
  | "Dance/Performance"
  | "Previous Work"
  | "Introduction Video"
  | "Other";

export type ProfileVisibilityOption = "Public" | "CineVenue Users" | "Private";

export interface PortfolioItem {
  id: string;
  title: string;
  type: "Image" | "Video" | "Showreel" | "Audio" | "Poster" | "Document" | "Link";
  category?: PortfolioMediaCategory;
  mediaUrl: string;
  thumbnailUrl?: string;
  role: string;
  year: number;
  projectType: string;
  projectName?: string;
  description?: string;
  duration?: string; // e.g. "02:15"
  credits?: string;
  visibility?: ProfileVisibilityOption;
  additionalInfo?: string;
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

export interface ProfilePrivacySettings {
  profileVisibility: ProfileVisibilityOption;
  portfolioVisibility: ProfileVisibilityOption;
  videosVisibility: ProfileVisibilityOption;
  filmographyVisibility: ProfileVisibilityOption;
  contactVisibility: ProfileVisibilityOption;
  availabilityVisibility: ProfileVisibilityOption;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  userEmail: string;
  fullName: string;
  handle?: string; // e.g. "@siddharth_roy"
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
  roles?: string[]; // e.g. ["Actor", "Model", "Dancer"]
  training?: string[]; // Formal acting/cinema training
  specializations: string[];
  skills: string[];
  projectTypes: string[];
  preferredIndustries: string[];
  showreelUrl?: string;
  showreel?: string;
  professionalLinks?: {
    imdb?: string;
    showreel?: string;
    youtube?: string;
    vimeo?: string;
    website?: string;
    linkedin?: string;
    instagram?: string;
  };
  privacySettings?: ProfilePrivacySettings;
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
  status?: "Active" | "Suspended";
  joinedDate: string;
  lastActive?: string;
}

export type ProductionStage = 
  | "Idea"
  | "Development" 
  | "Pre-Production" 
  | "Production" 
  | "Post-Production" 
  | "Completed"
  | "Released"
  | "Pre-production" 
  | "Post-production";

export type ProjectStatus = 
  | "Idea" 
  | "Development" 
  | "Pre-Production" 
  | "Production" 
  | "Post-Production" 
  | "Completed" 
  | "Released"
  | "Active" 
  | "Draft" 
  | "In Production" 
  | "Archived";

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
  status: ProjectStatus;
  projectDocuments?: string[];
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

// ----------------------------------------------------
// 13. INDIAN CASTING CALLS & AUDITIONS SYSTEM
// ----------------------------------------------------
export type IndianFilmIndustry =
  | "Tollywood (Telugu)"
  | "Bollywood (Hindi)"
  | "Kollywood (Tamil)"
  | "Mollywood (Malayalam)"
  | "Sandalwood (Kannada)"
  | "Punjabi Cinema"
  | "Bengali Cinema"
  | "Marathi Cinema"
  | "Bhojpuri Cinema"
  | "Gujarati Cinema"
  | "Pan-India"
  | "Independent / OTT";

export const REQUIRED_ACTOR_ROLES = [
  "Lead Actor",
  "Lead Actress",
  "Supporting Actor",
  "Supporting Actress",
  "Character Artist",
  "Child Artist",
  "Senior Artist",
  "Voice Artist",
  "Dancer",
  "Model",
  "Other Performer"
] as const;

export type RequiredActorRole = typeof REQUIRED_ACTOR_ROLES[number];

export const REQUIRED_CREW_ROLES = [
  "Director",
  "Assistant Director",
  "Writer",
  "DOP/Cinematographer",
  "Editor",
  "Music Director",
  "Lyricist",
  "Singer",
  "Choreographer",
  "Art Director",
  "Production Designer",
  "Costume Designer",
  "Makeup Artist",
  "Hair & Styling",
  "Sound Engineer",
  "Sound Designer",
  "VFX Artist",
  "DI/Colorist",
  "Stunt/Action",
  "Poster/Graphic Designer",
  "Photographer",
  "Production Manager",
  "Production Assistant",
  "Other Crew"
] as const;

export type RequiredCrewRole = typeof REQUIRED_CREW_ROLES[number];

export type CastingRoleCategory =
  | RequiredActorRole
  | RequiredCrewRole
  | "Other Required Professional"
  | "Lead Protagonist (Male)"
  | "Lead Protagonist (Female)"
  | "Antagonist / Negative Role"
  | "Parallel Lead"
  | "Supporting Character"
  | "Character Artist"
  | "Child Artist / Minor"
  | "Comedian"
  | "Cameo / Special Appearance"
  | "Voice / Dubbing Talent"
  | "Action / Stunt Double"
  | "Background / Junior Artist";

export type AuditionStatus =
  | "Submitted"
  | "Screened"
  | "Shortlisted"
  | "Callback Scheduled"
  | "Selected"
  | "Rejected";

export interface AuditionSubmission {
  id: string;
  castingCallId: string;
  projectId: string;
  projectTitle: string;
  characterName: string;
  roleType: string;
  applicantId: string;
  applicantProfileId?: string;
  applicantHandle?: string;
  applicantName: string;
  applicantEmail: string;
  applicantAvatar?: string;
  applicantPhone?: string;
  age: number;
  gender: "Male" | "Female" | "Non-Binary" | "Other";
  height?: string;
  spokenLanguages: string[];
  city: string;
  state?: string;
  videoAuditionUrl?: string; // YouTube/Vimeo/Cloudinary link
  monologueScriptUrl?: string;
  headshots: string[];
  portfolioLinks?: string[];
  introVideoUrl?: string;
  experienceSummary: string;
  agencyOrManager?: string;
  hasMinorGuardianConsent?: boolean;
  guardianName?: string;
  guardianContact?: string;
  status: AuditionStatus;
  callbackDate?: string;
  callbackTime?: string;
  callbackLocationOrLink?: string;
  directorNotes?: string;
  rating?: number; // 1-5 stars
  appliedAt: string;
  updatedAt: string;
}

export interface IndianCastingCall {
  id: string;
  projectId: string;
  projectTitle: string;
  projectBannerUrl?: string;
  companyName: string;
  directorName: string;
  industry: IndianFilmIndustry;
  languages: string[];
  roleTitle: string;
  roleCategory: CastingRoleCategory;
  characterName: string;
  ageMin: number;
  ageMax: number;
  gender: "Male" | "Female" | "Any";
  physicalAttributes?: {
    height?: string;
    bodyType?: string;
    lookAndStyle?: string;
    distinctFeatures?: string;
  };
  characterBio: string;
  dialogueScriptSnippet?: string;
  auditionInstructions: string;
  shootLocation: string;
  shootingSchedule: string;
  remuneration: string;
  openingsCount: number;
  hiredCount: number;
  requiresSelfTape: boolean;
  requiresMonologue: boolean;
  requiresMinorConsent: boolean;
  deadline: string;
  status: "Draft" | "Open" | "Published" | "Reviewing" | "Callbacks" | "Paused" | "Closed" | "Archived";
  featured: boolean;
  postedDate: string;
  submissionsCount?: number;
  ownerEmail?: string;
}

// ----------------------------------------------------
// 14. PROPOSALS MANAGEMENT SYSTEM
// ----------------------------------------------------
export type ProposalType =
  | "Acting Proposal"
  | "Crew Proposal"
  | "Production Proposal"
  | "Direction Proposal"
  | "Cinematography Proposal"
  | "Editing Proposal"
  | "Music Proposal"
  | "VFX Proposal"
  | "Service Proposal"
  | "Collaboration Proposal"
  | "Other"
  | "Film Co-Production"
  | "Investor & Financing Pitch"
  | "HOD Crew Services"
  | "VFX & CGI Services"
  | "Music & Sound Design"
  | "Camera & Equipment Rental"
  | "Post-Production Suite"
  | "Theatrical / OTT Distribution"
  | "Brand Placement / In-Film";

export type ProposalStatus =
  | "Draft"
  | "Drafts"
  | "Sent"
  | "Received"
  | "Under Review"
  | "Changes Requested"
  | "Accepted"
  | "Rejected"
  | "Expired"
  | "Withdrawn";

export interface ProposalRevision {
  revisionNumber: number;
  revisedBy: string;
  revisedAt: string;
  changeSummary: string;
  proposedBudget?: string;
  notes?: string;
}

export interface ProposalMilestone {
  title: string;
  percentage: number;
  amount: number;
  deliverable: string;
  estimatedDate?: string;
}

export interface Proposal {
  id: string;
  projectId?: string;
  projectTitle: string;
  type: ProposalType;
  title: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderRole: "Producer" | "Director" | "HOD / Crew" | "Studio" | "Investor" | "Vendor";
  senderAvatar?: string;
  senderCompany?: string;
  recipientId?: string;
  recipientName: string;
  recipientEmail: string;
  recipientRole?: string;
  recipientCompany?: string;
  introduction: string;
  projectDescription: string;
  scopeOfWork: string[];
  deliverables: string[];
  timelineWeeks: number;
  proposedStartDate: string;
  proposedCompletionDate: string;
  budgetTotal: number;
  currency: "INR" | "USD";
  paymentMilestones: ProposalMilestone[];
  termsAndConditions: string;
  pitchDeckUrl?: string;
  budgetBreakdownUrl?: string;
  attachments?: { name: string; url: string; size?: string }[];
  status: ProposalStatus;
  revisions: ProposalRevision[];
  currentRevisionNumber: number;
  reviewNotes?: string;
  acceptedAt?: string;
  acceptedBySignature?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
  expiryDate?: string;
}

export interface ProfileReport {
  id: string;
  targetProfileId: string;
  targetUsername: string;
  targetFullName: string;
  reportedProfileId?: string;
  reportedUsername?: string;
  reportedName?: string;
  reporterEmail: string;
  reason: string;
  details: string;
  status: "Pending" | "Reviewed" | "Dismissed" | "Action Taken";
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CastingConsideration {
  id: string;
  castingCallId: string;
  projectTitle: string;
  characterName: string;
  characterRole?: string;
  candidateUsername?: string;
  candidateName?: string;
  candidateEmail?: string;
  recruiterEmail?: string;
  recruiterName?: string;
  senderEmail?: string;
  recipientProfileId?: string;
  recipientEmail?: string;
  recipientName?: string;
  notes?: string;
  stage?: string;
  status?: "Considered" | "Audition Requested" | "Archived" | "Shortlisted";
  createdAt: string;
}

export interface DiscoverProfessionalsFilterState {
  search?: string;
  searchQuery?: string;
  role?: string;
  roles?: string[];
  language?: string;
  languages?: string[];
  location?: string;
  state?: string;
  city?: string;
  experienceYears?: number;
  experienceMin?: number;
  availability?: string;
  projectType?: string;
  verifiedOnly?: boolean;
}


