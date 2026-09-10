import { Router, Request, Response, NextFunction } from "express";
import { authenticate, optionalAuthenticate } from "../../middleware/auth";
import { NotFoundError, ForbiddenError, ValidationError } from "../../shared/errors";
import { isDatabaseConnected } from "../../config/database";

const router = Router();

// In-Memory Seed Profiles with real handles, multi-roles, and verified credentials
let inMemoryProfessionals: any[] = [
  {
    id: "prof-1",
    userId: "user-prof-1",
    userEmail: "kiran.dop@cinevenue.com",
    fullName: "Kiran R. Varman",
    handle: "@kiran_varman",
    professionalHeadline: "Award-Winning Director of Photography | Specializing in Anamorphic & Period Epics",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80",
    location: "Hyderabad",
    state: "Telangana",
    country: "India",
    preferredLocations: ["Hyderabad", "Chennai", "Bengaluru", "Mumbai", "Europe"],
    languages: ["Telugu", "Tamil", "English", "Hindi"],
    bio: "Passionate cinematographer with 11+ years of experience across 14 feature films and 3 high-budget OTT series. Expert in ARRI Alexa 65 large format, anamorphic glass, and low-light moody cinematography.",
    experienceYears: 11,
    primaryCraftId: "craft-8",
    primaryCraftName: "Cinematography / DOP",
    secondaryCraftIds: ["craft-21", "craft-24"],
    secondaryCraftNames: ["DI / Color Grading", "Photography"],
    roles: ["DOP / Cinematographer", "DI / Colorist", "Photographer"],
    specializations: ["Period Drama", "Action Spectacles", "Steadicam Sequences", "Natural Ambient Lighting"],
    skills: ["ARRI Alexa LF", "Cooke Anamorphic Lenses", "Gimbal Specialist", "ACES Workflow", "Underwater Rigging", "Drone Direction"],
    projectTypes: ["Feature Film", "OTT", "Web Series", "Commercial Film"],
    preferredIndustries: ["Tollywood", "Kollywood", "Bollywood", "Pan-India"],
    training: ["FTII Pune - Diploma in Motion Picture Cinematography"],
    professionalLinks: {
      imdb: "https://www.imdb.com/name/nm1029384",
      youtube: "https://youtube.com/@kiranvarman_dop",
      vimeo: "https://vimeo.com/kiranvarmandop",
      website: "https://kiranvarman.cinevenue.com",
      linkedin: "https://linkedin.com/in/kiran-varman-dop"
    },
    privacySettings: {
      profileVisibility: "Public",
      portfolioVisibility: "Public",
      videosVisibility: "Public",
      filmographyVisibility: "Public",
      contactVisibility: "CineVenue Users",
      availabilityVisibility: "Public"
    },
    remunerationRange: {
      min: 1500000,
      max: 4500000,
      currency: "INR",
      unit: "per project"
    },
    availability: {
      status: "Available",
      availableFrom: "2026-09-15",
      availableTo: "2027-01-30",
      notes: "Open for pan-India feature film schedules starting mid-September."
    },
    contactPreferences: {
      allowDirectInvites: true,
      allowNegotiations: true,
      preferredContactMode: "Platform Chat"
    },
    portfolio: [
      {
        id: "port-1",
        title: "The Royal Kingdom - Official Showreel 2025",
        type: "Showreel",
        category: "Showreel",
        mediaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl: "https://images.unsplash.com/photo-1518134346374-184f9d21cb69?w=600&auto=format&fit=crop&q=80",
        role: "Director of Photography",
        year: 2025,
        duration: "3:45",
        projectName: "The Royal Kingdom",
        credits: "Vyjayanthi Studios / Dir. Vamsi",
        projectType: "Feature Film",
        description: "Showcase of golden-hour natural lighting and high-speed battlefield camera choreography.",
        visibility: "Public"
      },
      {
        id: "port-2",
        title: "Midnight Noir - Shadow & Neon Light Study",
        type: "Image",
        category: "Character Look",
        mediaUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1000&auto=format&fit=crop&q=80",
        role: "Cinematographer",
        year: 2024,
        projectName: "Midnight Noir",
        projectType: "Short Film",
        description: "Practical neon lighting rig test using Sony Venice 2 dual native ISO.",
        visibility: "Public"
      }
    ],
    filmography: [
      {
        id: "film-1",
        projectTitle: "Mahasenani: The Rise",
        role: "Director of Photography",
        craft: "Cinematography",
        year: 2025,
        language: "Telugu",
        projectType: "Feature Film",
        directorOrCompany: "Vyjayanthi Studios",
        notableAwards: "SIIMA Best Cinematography Nominee"
      }
    ],
    verificationLevel: "Professional Verified",
    status: "Active",
    rating: 4.95,
    reviewsCount: 18,
    completedProjectsCount: 14,
    joinedDate: "2024-03-15",
    lastActive: "Just now"
  },
  {
    id: "prof-2",
    userId: "user-prof-2",
    userEmail: "siddharth.actor@cinevenue.com",
    fullName: "Siddharth Roy",
    handle: "@siddharth_roy",
    professionalHeadline: "Actor • Theatre Artiste • Action Specialist",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80",
    location: "Guntur",
    state: "Andhra Pradesh",
    country: "India",
    preferredLocations: ["Hyderabad", "Visakhapatnam", "Vijayawada", "Chennai"],
    languages: ["Telugu", "Hindi", "English"],
    bio: "Versatile actor with intense dramatic range and extensive classical theatre foundation. Trained in martial arts, swordplay, and modern fight choreography.",
    experienceYears: 6,
    primaryCraftId: "craft-acting",
    primaryCraftName: "Acting / Performer",
    secondaryCraftIds: [],
    secondaryCraftNames: [],
    roles: ["Actor", "Model", "Dancer"],
    specializations: ["Action Thrillers", "Period Antagonist", "High Emotional Drama"],
    skills: ["Martial Arts / Wushu", "Horse Riding", "Telugu Dialect Mastery", "Method Acting", "Stage Combat"],
    projectTypes: ["Feature Film", "Digital Series", "Short Film"],
    preferredIndustries: ["Tollywood", "Pan-India"],
    training: ["National School of Drama (NSD) Acting Workshop", "Barry John Acting Studio"],
    professionalLinks: {
      imdb: "https://www.imdb.com/name/nm9876543",
      youtube: "https://youtube.com/@siddharthroy_actor",
      vimeo: "https://vimeo.com/siddharthroy"
    },
    privacySettings: {
      profileVisibility: "Public",
      portfolioVisibility: "Public",
      videosVisibility: "Public",
      filmographyVisibility: "Public",
      contactVisibility: "CineVenue Users",
      availabilityVisibility: "Public"
    },
    remunerationRange: {
      min: 800000,
      max: 2500000,
      currency: "INR",
      unit: "per project"
    },
    availability: {
      status: "Available",
      availableFrom: "2026-09-10",
      notes: "Available for upcoming theatrical shoots."
    },
    contactPreferences: {
      allowDirectInvites: true,
      allowNegotiations: true,
      preferredContactMode: "Platform Chat"
    },
    portfolio: [
      {
        id: "port-3",
        title: "Warrior General - Look Test & Combat Reel",
        type: "Showreel",
        category: "Showreel",
        mediaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
        role: "Lead Antagonist",
        year: 2025,
        duration: "2:30",
        projectName: "Veera Simha",
        credits: "Suresh Productions / Dir. Raj",
        projectType: "Feature Film",
        description: "Intense hand-to-hand combat sequence showcase.",
        visibility: "Public"
      },
      {
        id: "port-4",
        title: "Rustic Village Head - Costume & Makeup Study",
        type: "Image",
        category: "Costume Reference",
        mediaUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
        role: "Village Head",
        year: 2024,
        projectName: "Gramam",
        projectType: "Feature Film",
        description: "Guntur rayalaseema dialect character look.",
        visibility: "Public"
      }
    ],
    filmography: [
      {
        id: "film-2",
        projectTitle: "Veera Simha",
        role: "Antagonist (Bhadra)",
        craft: "Acting",
        year: 2024,
        language: "Telugu",
        projectType: "Feature Film",
        directorOrCompany: "Mythri Movie Makers"
      }
    ],
    verificationLevel: "Profile Verified",
    status: "Active",
    rating: 4.88,
    reviewsCount: 12,
    completedProjectsCount: 5,
    joinedDate: "2024-06-10",
    lastActive: "1 hour ago"
  },
  {
    id: "prof-3",
    userId: "user-prof-3",
    userEmail: "ananya.director@cinevenue.com",
    fullName: "Ananya Sharma",
    handle: "@ananya_director",
    professionalHeadline: "Director • Screenwriter • Independent Producer",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    location: "Visakhapatnam",
    state: "Andhra Pradesh",
    country: "India",
    preferredLocations: ["Visakhapatnam", "Hyderabad", "Mumbai"],
    languages: ["Telugu", "Hindi", "English"],
    bio: "Award-winning independent filmmaker focused on poignant character-driven cinema and psychological thrillers. Recipient of 2 international film festival awards.",
    experienceYears: 8,
    primaryCraftId: "craft-1",
    primaryCraftName: "Direction",
    secondaryCraftIds: ["craft-2"],
    secondaryCraftNames: ["Screenplay"],
    roles: ["Director", "Writer", "Producer"],
    specializations: ["Psychological Thrillers", "Neo-Noir", "Indie Cinema"],
    skills: ["Script Breakdown", "Actor Directing", "Non-linear Narrative", "Pre-visualization", "Pitch Deck Design"],
    projectTypes: ["Feature Film", "OTT Mini-Series", "Festival Shorts"],
    preferredIndustries: ["Tollywood", "Pan-India"],
    training: ["Whistling Woods International - Direction"],
    professionalLinks: {
      imdb: "https://www.imdb.com/name/nm7654321",
      vimeo: "https://vimeo.com/ananyasharma",
      website: "https://ananyasharma.film"
    },
    privacySettings: {
      profileVisibility: "Public",
      portfolioVisibility: "Public",
      videosVisibility: "Public",
      filmographyVisibility: "Public",
      contactVisibility: "Public",
      availabilityVisibility: "Public"
    },
    remunerationRange: {
      min: 2000000,
      max: 6000000,
      currency: "INR",
      unit: "per project"
    },
    availability: {
      status: "Available",
      availableFrom: "2026-10-01",
      notes: "Open for next directorial project under pre-production."
    },
    contactPreferences: {
      allowDirectInvites: true,
      allowNegotiations: true,
      preferredContactMode: "Platform Chat"
    },
    portfolio: [
      {
        id: "port-5",
        title: "Echoes of Silence - Official Festival Trailer",
        type: "Showreel",
        category: "Showreel",
        mediaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80",
        role: "Director & Writer",
        year: 2024,
        duration: "2:15",
        projectName: "Echoes of Silence",
        projectType: "Feature Film",
        description: "Official international festival selection trailer.",
        visibility: "Public"
      }
    ],
    filmography: [
      {
        id: "film-3",
        projectTitle: "Echoes of Silence",
        role: "Director & Writer",
        craft: "Direction",
        year: 2024,
        language: "Telugu",
        projectType: "Feature Film",
        notableAwards: "IFFI Best Debut Director Nominee"
      }
    ],
    verificationLevel: "Professional Verified",
    status: "Active",
    rating: 5.0,
    reviewsCount: 14,
    completedProjectsCount: 4,
    joinedDate: "2024-01-20",
    lastActive: "30 mins ago"
  }
];

// In-Memory Project Invitations Store
let inMemoryInvitations: any[] = [];

// In-Memory Casting Considerations Store
let inMemoryConsiderations: any[] = [];

// In-Memory Profile Reports Store
let inMemoryReports: any[] = [];

// Helper: Sanitize profile fields based on requester identity and privacy settings
function sanitizeProfile(profile: any, requesterUserId?: string, requesterEmail?: string, isAdmin: boolean = false) {
  const isOwner = requesterEmail && profile.userEmail && requesterEmail.toLowerCase() === profile.userEmail.toLowerCase();
  
  if (isOwner || isAdmin) {
    return profile; // Owner and admin see full details
  }

  const visibility = profile.privacySettings?.profileVisibility || "Public";
  if (visibility === "Private") {
    return null; // Hidden from non-owner
  }

  const isCineVenueUser = Boolean(requesterUserId || requesterEmail);
  if (visibility === "CineVenue Users" && !isCineVenueUser) {
    return null; // Hidden from unauthenticated guests
  }

  // Create sanitized clone
  const sanitized = { ...profile };

  // Always hide sensitive private contact details from public view
  delete sanitized.userEmail;
  delete sanitized.mobile;
  delete sanitized.phone;

  // Filter portfolio according to portfolioVisibility
  const portVis = profile.privacySettings?.portfolioVisibility || "Public";
  if (portVis === "Private") {
    sanitized.portfolio = [];
  } else if (portVis === "CineVenue Users" && !isCineVenueUser) {
    sanitized.portfolio = [];
  } else if (Array.isArray(sanitized.portfolio)) {
    sanitized.portfolio = sanitized.portfolio.filter((p: any) => {
      if (p.visibility === "Private") return false;
      if (p.visibility === "CineVenue Users" && !isCineVenueUser) return false;
      return true;
    });
  }

  // Filter videos
  const vidVis = profile.privacySettings?.videosVisibility || "Public";
  if (vidVis === "Private" || (vidVis === "CineVenue Users" && !isCineVenueUser)) {
    if (Array.isArray(sanitized.portfolio)) {
      sanitized.portfolio = sanitized.portfolio.filter((p: any) => p.type !== "Showreel" && p.type !== "Video");
    }
  }

  // Filter filmography
  const filmVis = profile.privacySettings?.filmographyVisibility || "Public";
  if (filmVis === "Private" || (filmVis === "CineVenue Users" && !isCineVenueUser)) {
    sanitized.filmography = [];
  }

  // Filter availability
  const availVis = profile.privacySettings?.availabilityVisibility || "Public";
  if (availVis === "Private" || (availVis === "CineVenue Users" && !isCineVenueUser)) {
    sanitized.availability = {
      status: "Available",
      notes: "Contact on platform for schedule"
    };
  }

  return sanitized;
}

// ----------------------------------------------------
// 1. GET /filters: Configurable Search & Directory Filters
// ----------------------------------------------------
router.get("/filters", (req: Request, res: Response) => {
  const roles = [
    "Actor", "Actress", "Director", "Assistant Director", "Writer", 
    "Producer", "DOP / Cinematographer", "Editor", "Music Director", 
    "Lyricist", "Singer", "Choreographer", "Art Director", 
    "Production Designer", "Costume Designer", "Makeup Artist", 
    "Hair & Styling", "Sound Engineer", "Sound Designer", "VFX Artist", 
    "DI / Colorist", "Stunt / Action", "Poster / Graphic Designer", 
    "Photographer", "Production Manager", "Production Assistant", "Other Professional"
  ];

  const languages = ["Telugu", "Hindi", "Tamil", "Kannada", "Malayalam", "English", "Bengali", "Marathi", "Gujarati", "Punjabi"];
  
  const states = [
    "Andhra Pradesh", "Telangana", "Tamil Nadu", "Karnataka", "Kerala", 
    "Maharashtra", "West Bengal", "Delhi", "Punjab", "Gujarat", "Other"
  ];

  const cities = [
    "Hyderabad", "Visakhapatnam", "Vijayawada", "Guntur", "Tirupati",
    "Chennai", "Bengaluru", "Kochi", "Mumbai", "Pune", "Kolkata", "New Delhi"
  ];

  const availabilities = ["Available", "Partially Available", "Booked"];

  const projectTypes = ["Feature Film", "Short Film", "Web Series", "OTT", "Documentary", "Advertisement", "Music Video"];

  return res.json({
    success: true,
    data: {
      roles,
      languages,
      states,
      cities,
      availabilities,
      projectTypes
    }
  });
});

// ----------------------------------------------------
// 2. GET /professionals & /professionals/search: Directory Query
// ----------------------------------------------------
const handleListProfessionals = (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      q,
      role,
      roles,
      language,
      languages,
      state,
      city,
      location,
      experienceMin,
      availability,
      projectType,
      verifiedOnly,
      page = "1",
      limit = "12"
    } = req.query;

    const searchTerm = String(search || q || "").trim().toLowerCase();
    const roleFilters: string[] = [];
    if (typeof role === "string" && role !== "all") roleFilters.push(role);
    if (typeof roles === "string") roleFilters.push(...roles.split(",").map(r => r.trim()).filter(Boolean));
    if (Array.isArray(roles)) roleFilters.push(...(roles as string[]));

    const langFilters: string[] = [];
    if (typeof language === "string" && language !== "all") langFilters.push(language);
    if (typeof languages === "string") langFilters.push(...languages.split(",").map(l => l.trim()).filter(Boolean));

    const stateFilter = String(state || "").trim().toLowerCase();
    const cityFilter = String(city || location || "").trim().toLowerCase();
    const expMin = experienceMin ? Number(experienceMin) : undefined;
    const availFilter = String(availability || "").trim();
    const projFilter = String(projectType || "").trim().toLowerCase();
    const reqVerified = verifiedOnly === "true" || verifiedOnly === "1";

    const requesterUserId = req.user?.userId;
    const requesterEmail = req.user?.email;
    const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "SUPER_ADMIN";

    let results = inMemoryProfessionals.filter(p => {
      // Must be active (unless admin)
      if (!isAdmin && p.status === "Suspended") return false;

      // Privacy check: if marked private, only owner or admin can see
      const vis = p.privacySettings?.profileVisibility || "Public";
      if (vis === "Private") {
        const isOwner = requesterEmail && p.userEmail && requesterEmail.toLowerCase() === p.userEmail.toLowerCase();
        if (!isOwner && !isAdmin) return false;
      }
      if (vis === "CineVenue Users" && !requesterUserId && !requesterEmail) {
        return false;
      }

      // Verified Filter
      if (reqVerified && (!p.verificationLevel || p.verificationLevel === "None")) {
        return false;
      }

      // Search Query
      if (searchTerm) {
        const matchName = p.fullName?.toLowerCase().includes(searchTerm);
        const matchHandle = p.handle?.toLowerCase().includes(searchTerm);
        const matchHeadline = p.professionalHeadline?.toLowerCase().includes(searchTerm);
        const matchPrimaryCraft = p.primaryCraftName?.toLowerCase().includes(searchTerm);
        const matchRoles = p.roles?.some((r: string) => r.toLowerCase().includes(searchTerm));
        const matchSkills = p.skills?.some((s: string) => s.toLowerCase().includes(searchTerm));
        const matchLoc = p.location?.toLowerCase().includes(searchTerm) || p.state?.toLowerCase().includes(searchTerm);
        const matchLang = p.languages?.some((l: string) => l.toLowerCase().includes(searchTerm));
        const matchBio = p.bio?.toLowerCase().includes(searchTerm);
        const matchFilmography = p.filmography?.some((f: any) => f.projectTitle?.toLowerCase().includes(searchTerm) || f.role?.toLowerCase().includes(searchTerm));

        if (!matchName && !matchHandle && !matchHeadline && !matchPrimaryCraft && !matchRoles && !matchSkills && !matchLoc && !matchLang && !matchBio && !matchFilmography) {
          return false;
        }
      }

      // Role Filter
      if (roleFilters.length > 0) {
        const hasRole = roleFilters.some(rf => {
          const rfLower = rf.toLowerCase();
          return (
            p.roles?.some((r: string) => r.toLowerCase() === rfLower || r.toLowerCase().includes(rfLower)) ||
            p.primaryCraftName?.toLowerCase().includes(rfLower) ||
            p.secondaryCraftNames?.some((sc: string) => sc.toLowerCase().includes(rfLower))
          );
        });
        if (!hasRole) return false;
      }

      // Language Filter
      if (langFilters.length > 0) {
        const hasLang = langFilters.some(lf => 
          p.languages?.some((l: string) => l.toLowerCase() === lf.toLowerCase())
        );
        if (!hasLang) return false;
      }

      // State Filter
      if (stateFilter && stateFilter !== "all") {
        if (!p.state || !p.state.toLowerCase().includes(stateFilter)) return false;
      }

      // City Filter
      if (cityFilter && cityFilter !== "all") {
        const matchCity = p.location?.toLowerCase().includes(cityFilter) ||
          p.preferredLocations?.some((loc: string) => loc.toLowerCase().includes(cityFilter));
        if (!matchCity) return false;
      }

      // Experience Filter
      if (expMin !== undefined && !isNaN(expMin)) {
        if ((p.experienceYears || 0) < expMin) return false;
      }

      // Availability Filter
      if (availFilter && availFilter !== "all") {
        if (p.availability?.status !== availFilter) return false;
      }

      // Project Type Filter
      if (projFilter && projFilter !== "all") {
        if (!p.projectTypes?.some((pt: string) => pt.toLowerCase().includes(projFilter))) return false;
      }

      return true;
    });

    // Sanitize results for public viewing
    const sanitizedList = results
      .map(p => sanitizeProfile(p, requesterUserId, requesterEmail, isAdmin))
      .filter(Boolean);

    // Pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(50, Number(limit)));
    const total = sanitizedList.length;
    const totalPages = Math.ceil(total / limitNum);
    const paginated = sanitizedList.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.json({
      success: true,
      data: {
        professionals: paginated,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

router.get("/professionals", optionalAuthenticate, handleListProfessionals);
router.get("/professionals/search", optionalAuthenticate, handleListProfessionals);

// ----------------------------------------------------
// 3. GET /professionals/:username: Public Profile Page Data
// ----------------------------------------------------
router.get("/professionals/:username", optionalAuthenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawParam = req.params.username.trim();
    const queryHandle = rawParam.startsWith("@") ? rawParam.toLowerCase() : `@${rawParam.toLowerCase()}`;
    const rawLower = rawParam.toLowerCase();

    const requesterUserId = req.user?.userId;
    const requesterEmail = req.user?.email;
    const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "SUPER_ADMIN";

    const profile = inMemoryProfessionals.find(p => 
      (p.handle && p.handle.toLowerCase() === queryHandle) ||
      (p.handle && p.handle.toLowerCase() === rawLower) ||
      p.id === rawParam ||
      p.userId === rawParam ||
      p.fullName.toLowerCase().replace(/\s+/g, "_") === rawLower.replace(/^@/, "")
    );

    if (!profile) {
      throw new NotFoundError("Professional profile", rawParam);
    }

    if (!isAdmin && profile.status === "Suspended") {
      throw new NotFoundError("This profile is currently suspended or under moderation.");
    }

    const sanitized = sanitizeProfile(profile, requesterUserId, requesterEmail, isAdmin);
    if (!sanitized) {
      throw new ForbiddenError("This professional's profile is set to private by the owner.");
    }

    return res.json({
      success: true,
      data: {
        profile: sanitized
      }
    });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------
// 4. POST /professionals/invite: Invite Professional to Project
// ----------------------------------------------------
router.post("/professionals/invite", authenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, projectTitle, projectRole, message, recipientProfileId, recipientEmail, recipientName } = req.body;
    const senderEmail = req.user?.email || "filmmaker@cinevenue.com";
    const senderName = req.user?.name || senderEmail.split("@")[0];

    if (!projectId || !projectRole || !recipientProfileId) {
      throw new ValidationError("Project ID, project role, and recipient profile ID are required.");
    }

    const invitation = {
      id: `inv-${Date.now()}`,
      projectId,
      projectTitle: projectTitle || "Film Production Project",
      senderEmail,
      senderName,
      recipientProfileId,
      recipientEmail: recipientEmail || "talent@cinevenue.com",
      recipientName: recipientName || "Professional",
      projectRole,
      message: message || `We would like to invite you to join our project as ${projectRole}.`,
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    inMemoryInvitations.unshift(invitation);

    return res.status(201).json({
      success: true,
      message: "Project invitation sent successfully. The professional has been notified.",
      data: { invitation }
    });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------
// 5. POST /professionals/consider: Consider for Casting Call
// ----------------------------------------------------
router.post("/professionals/consider", authenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { castingCallId, projectTitle, characterName, recipientProfileId, recipientEmail, recipientName, notes } = req.body;
    const senderEmail = req.user?.email || "director@cinevenue.com";

    if (!castingCallId || !recipientProfileId) {
      throw new ValidationError("Casting call ID and recipient profile ID are required.");
    }

    const consideration = {
      id: `cons-${Date.now()}`,
      castingCallId,
      projectTitle: projectTitle || "Casting Project",
      characterName: characterName || "Audition Role",
      senderEmail,
      recipientProfileId,
      recipientEmail: recipientEmail || "talent@cinevenue.com",
      recipientName: recipientName || "Candidate",
      notes: notes || "Candidate marked for casting call audition.",
      status: "Considered",
      createdAt: new Date().toISOString()
    };

    inMemoryConsiderations.unshift(consideration);

    return res.status(201).json({
      success: true,
      message: "Professional successfully marked for casting consideration.",
      data: { consideration }
    });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------
// 6. POST /professionals/report: Report Profile
// ----------------------------------------------------
router.post("/professionals/report", optionalAuthenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { targetProfileId, targetUsername, targetFullName, reason, details } = req.body;
    const reporterEmail = req.user?.email || req.body.reporterEmail || "anonymous@cinevenue.com";

    if (!targetProfileId || !reason) {
      throw new ValidationError("Target profile and reason are required to file a report.");
    }

    const report = {
      id: `rep-${Date.now()}`,
      targetProfileId,
      targetUsername: targetUsername || "unknown",
      targetFullName: targetFullName || "Unknown Profile",
      reporterEmail,
      reason,
      details: details || "",
      status: "Pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    inMemoryReports.unshift(report);

    return res.status(201).json({
      success: true,
      message: "Report submitted to CineVenue Trust & Safety team. Our administrators will review the profile.",
      data: { report }
    });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------
// 7. ADMIN ROUTES: Professional Profiles Moderation
// ----------------------------------------------------
router.get("/admin/professionals", authenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "SUPER_ADMIN";
    if (!isAdmin) {
      throw new ForbiddenError("CineVenue administrator privileges required.");
    }

    return res.json({
      success: true,
      data: {
        professionals: inMemoryProfessionals,
        total: inMemoryProfessionals.length
      }
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/professionals/:id/verify", authenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "SUPER_ADMIN";
    if (!isAdmin) {
      throw new ForbiddenError("CineVenue administrator privileges required.");
    }

    const { id } = req.params;
    const { verificationLevel } = req.body; // "Profile Verified" | "Professional Verified" | "Company Verified" | "None"

    const profile = inMemoryProfessionals.find(p => p.id === id);
    if (!profile) {
      throw new NotFoundError("Professional profile", id);
    }

    profile.verificationLevel = verificationLevel || "Profile Verified";
    profile.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      message: `Profile verification updated to "${profile.verificationLevel}".`,
      data: { profile }
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/professionals/:id/status", authenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "SUPER_ADMIN";
    if (!isAdmin) {
      throw new ForbiddenError("CineVenue administrator privileges required.");
    }

    const { id } = req.params;
    const { status } = req.body; // "Active" | "Suspended"

    const profile = inMemoryProfessionals.find(p => p.id === id);
    if (!profile) {
      throw new NotFoundError("Professional profile", id);
    }

    profile.status = status || "Active";
    profile.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      message: `Profile status updated to "${profile.status}".`,
      data: { profile }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/reports", authenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "SUPER_ADMIN";
    if (!isAdmin) {
      throw new ForbiddenError("CineVenue administrator privileges required.");
    }

    return res.json({
      success: true,
      data: {
        reports: inMemoryReports,
        total: inMemoryReports.length
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
