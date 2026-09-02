import {
  FilmCraft,
  ProfessionalProfile,
  FilmProject,
  FilmProjectRequirement,
  JobApplication,
  ProjectInvitation,
  ProjectNegotiation,
  NegotiationMessage,
  NegotiationOffer,
  HireRecord,
  DigitalAgreement,
  ProductionCompany,
  TalentReview,
  MarketplaceReport,
  ProjectCastMember,
  ProjectCrewMember,
  ProjectActivityLog
} from "../types/filmProductionMarketplace";

import {
  INITIAL_24_CRAFTS,
  INITIAL_PROFESSIONALS,
  INITIAL_FILM_PROJECTS,
  INITIAL_COMPANIES,
  INITIAL_APPLICATIONS,
  INITIAL_NEGOTIATIONS,
  INITIAL_HIRES,
  INITIAL_AGREEMENTS,
  INITIAL_REVIEWS
} from "../data/filmProductionData";
import { FilmProjectApplication } from "../types/productions";
import { INITIAL_FILM_APPLICATIONS } from "../data/productionsData";

const STORAGE_KEYS = {
  CRAFTS: "cv_film_crafts",
  PROFESSIONALS: "cv_film_professionals",
  PROJECTS: "cv_film_projects",
  APPLICATIONS: "cv_film_applications",
  FILM_PROJECT_APPLICATIONS: "cv_film_project_applications",
  CASTING_APPLICATIONS: "cv_film_casting_applications",
  INVITATIONS: "cv_film_invitations",
  NEGOTIATIONS: "cv_film_negotiations",
  HIRES: "cv_film_hires",
  AGREEMENTS: "cv_film_agreements",
  COMPANIES: "cv_film_companies",
  REVIEWS: "cv_film_reviews",
  REPORTS: "cv_film_reports",
  ACTIVITY_LOGS: "cv_film_activity_logs"
};

// Helper for Local Storage with defaults
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error loading storage key ${key}`, e);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving storage key ${key}`, e);
  }
}

// ----------------------------------------------------
// 1. CRAFTS MANAGEMENT (24 Crafts & Admin Customization)
// ----------------------------------------------------
export const getCrafts = (): FilmCraft[] => {
  const crafts = getStored<FilmCraft[]>(STORAGE_KEYS.CRAFTS, INITIAL_24_CRAFTS);
  return crafts.sort((a, b) => a.order - b.order);
};

export const saveCraft = (craft: Partial<FilmCraft>): FilmCraft => {
  const crafts = getCrafts();
  if (craft.id) {
    const index = crafts.findIndex(c => c.id === craft.id);
    if (index >= 0) {
      crafts[index] = { ...crafts[index], ...craft } as FilmCraft;
      setStored(STORAGE_KEYS.CRAFTS, crafts);
      return crafts[index];
    }
  }
  const newCraft: FilmCraft = {
    id: `craft-${Date.now()}`,
    name: craft.name || "New Craft",
    slug: (craft.name || "new-craft").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    category: craft.category || "Direction & Writing",
    icon: craft.icon || "Sparkles",
    description: craft.description || "",
    subcategories: craft.subcategories || [],
    skills: craft.skills || [],
    status: craft.status || "Active",
    order: crafts.length + 1,
    ...craft
  } as FilmCraft;
  crafts.push(newCraft);
  setStored(STORAGE_KEYS.CRAFTS, crafts);
  return newCraft;
};

export const deleteCraft = (craftId: string): void => {
  const crafts = getCrafts().filter(c => c.id !== craftId);
  setStored(STORAGE_KEYS.CRAFTS, crafts);
};

// ----------------------------------------------------
// 2. PROFESSIONALS & TALENT PROFILES
// ----------------------------------------------------
export const getProfessionals = (filters?: {
  search?: string;
  craftId?: string;
  location?: string;
  language?: string;
  experienceMin?: number;
  availability?: string;
  verification?: string;
  minRating?: number;
}): ProfessionalProfile[] => {
  let list = getStored<ProfessionalProfile[]>(STORAGE_KEYS.PROFESSIONALS, INITIAL_PROFESSIONALS);

  if (!filters) return list;

  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(p => 
      p.fullName.toLowerCase().includes(q) ||
      p.professionalHeadline.toLowerCase().includes(q) ||
      p.primaryCraftName.toLowerCase().includes(q) ||
      p.skills.some(s => s.toLowerCase().includes(q)) ||
      p.location.toLowerCase().includes(q)
    );
  }

  if (filters.craftId && filters.craftId !== "all") {
    list = list.filter(p => 
      p.primaryCraftId === filters.craftId || 
      p.secondaryCraftIds.includes(filters.craftId!)
    );
  }

  if (filters.location && filters.location !== "all") {
    list = list.filter(p => 
      p.location.toLowerCase().includes(filters.location!.toLowerCase()) ||
      p.preferredLocations.some(l => l.toLowerCase().includes(filters.location!.toLowerCase()))
    );
  }

  if (filters.language && filters.language !== "all") {
    list = list.filter(p => 
      p.languages.some(l => l.toLowerCase() === filters.language!.toLowerCase())
    );
  }

  if (filters.experienceMin) {
    list = list.filter(p => p.experienceYears >= filters.experienceMin!);
  }

  if (filters.availability && filters.availability !== "all") {
    list = list.filter(p => p.availability.status === filters.availability);
  }

  if (filters.verification && filters.verification !== "all") {
    list = list.filter(p => p.verificationLevel === filters.verification);
  }

  if (filters.minRating) {
    list = list.filter(p => p.rating >= filters.minRating!);
  }

  return list;
};

export const getProfessionalById = (id: string): ProfessionalProfile | undefined => {
  const list = getStored<ProfessionalProfile[]>(STORAGE_KEYS.PROFESSIONALS, INITIAL_PROFESSIONALS);
  return list.find(p => p.id === id || p.userId === id);
};

export const getProfessionalByEmail = (email: string): ProfessionalProfile | undefined => {
  if (!email) return undefined;
  const list = getStored<ProfessionalProfile[]>(STORAGE_KEYS.PROFESSIONALS, INITIAL_PROFESSIONALS);
  return list.find(p => p.userEmail.toLowerCase() === email.toLowerCase());
};

export const saveProfessionalProfile = (profile: Partial<ProfessionalProfile>): ProfessionalProfile => {
  const list = getStored<ProfessionalProfile[]>(STORAGE_KEYS.PROFESSIONALS, INITIAL_PROFESSIONALS);
  const existingIndex = list.findIndex(p => 
    (profile.id && p.id === profile.id) || 
    (profile.userEmail && p.userEmail.toLowerCase() === profile.userEmail.toLowerCase())
  );

  if (existingIndex >= 0) {
    list[existingIndex] = {
      ...list[existingIndex],
      ...profile,
      lastActive: "Just now"
    } as ProfessionalProfile;
    setStored(STORAGE_KEYS.PROFESSIONALS, list);
    return list[existingIndex];
  }

  const newProfile: ProfessionalProfile = {
    id: `prof-${Date.now()}`,
    userId: profile.userId || `user-${Date.now()}`,
    userEmail: profile.userEmail || "user@cinevenue.com",
    fullName: profile.fullName || "Film Professional",
    professionalHeadline: profile.professionalHeadline || "Film Industry Professional",
    avatarUrl: profile.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    coverImageUrl: profile.coverImageUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80",
    location: profile.location || "Hyderabad",
    country: "India",
    preferredLocations: profile.preferredLocations || ["Hyderabad", "Chennai", "Mumbai"],
    languages: profile.languages || ["Telugu", "English"],
    bio: profile.bio || "Dedicated cinema professional on CineVenue.",
    experienceYears: profile.experienceYears || 2,
    primaryCraftId: profile.primaryCraftId || "craft-1",
    primaryCraftName: profile.primaryCraftName || "Direction",
    secondaryCraftIds: profile.secondaryCraftIds || [],
    secondaryCraftNames: profile.secondaryCraftNames || [],
    specializations: profile.specializations || [],
    skills: profile.skills || [],
    projectTypes: profile.projectTypes || ["Feature Film", "OTT"],
    preferredIndustries: profile.preferredIndustries || ["Tollywood", "Pan-India"],
    remunerationRange: profile.remunerationRange || {
      min: 500000,
      max: 1500000,
      currency: "INR",
      unit: "per project"
    },
    availability: profile.availability || {
      status: "Available",
      availableFrom: new Date().toISOString().split("T")[0]
    },
    contactPreferences: profile.contactPreferences || {
      allowDirectInvites: true,
      allowNegotiations: true,
      preferredContactMode: "Platform Chat"
    },
    portfolio: profile.portfolio || [],
    filmography: profile.filmography || [],
    verificationLevel: profile.verificationLevel || "None",
    rating: profile.rating || 5.0,
    reviewsCount: profile.reviewsCount || 0,
    completedProjectsCount: profile.completedProjectsCount || 0,
    joinedDate: new Date().toISOString().split("T")[0],
    lastActive: "Just now",
    ...profile
  } as ProfessionalProfile;

  list.unshift(newProfile);
  setStored(STORAGE_KEYS.PROFESSIONALS, list);
  return newProfile;
};

// ----------------------------------------------------
// 3. FILM PROJECTS & REQUIREMENTS
// ----------------------------------------------------
export const getProjects = (filters?: {
  search?: string;
  stage?: string;
  type?: string;
  language?: string;
  industry?: string;
  ownerEmail?: string;
}): FilmProject[] => {
  let list = getStored<FilmProject[]>(STORAGE_KEYS.PROJECTS, INITIAL_FILM_PROJECTS);

  if (!filters) return list;

  if (filters.ownerEmail) {
    list = list.filter(p => p.ownerEmail.toLowerCase() === filters.ownerEmail!.toLowerCase());
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.genre.some(g => g.toLowerCase().includes(q)) ||
      p.companyName.toLowerCase().includes(q) ||
      p.directorName.toLowerCase().includes(q)
    );
  }

  if (filters.stage && filters.stage !== "all") {
    list = list.filter(p => p.productionStage === filters.stage);
  }

  if (filters.type && filters.type !== "all") {
    list = list.filter(p => p.type === filters.type);
  }

  if (filters.language && filters.language !== "all") {
    list = list.filter(p => p.language.toLowerCase().includes(filters.language!.toLowerCase()));
  }

  return list;
};

export const getProjectById = (projectId: string): FilmProject | undefined => {
  const list = getStored<FilmProject[]>(STORAGE_KEYS.PROJECTS, INITIAL_FILM_PROJECTS);
  return list.find(p => p.id === projectId);
};

export const saveProject = (project: Partial<FilmProject>): FilmProject => {
  const list = getStored<FilmProject[]>(STORAGE_KEYS.PROJECTS, INITIAL_FILM_PROJECTS);
  
  if (project.id) {
    const index = list.findIndex(p => p.id === project.id);
    if (index >= 0) {
      list[index] = { 
        ...list[index], 
        ...project, 
        updatedAt: new Date().toISOString().split("T")[0] 
      } as FilmProject;
      setStored(STORAGE_KEYS.PROJECTS, list);
      logActivity(list[index].id, project.ownerName || "Filmmaker", "Updated Project Details", `Project ${list[index].title} was updated.`);
      return list[index];
    }
  }

  const newProject: FilmProject = {
    id: `proj-${Date.now()}`,
    ownerId: project.ownerId || `user-${Date.now()}`,
    ownerEmail: project.ownerEmail || "filmmaker@cinevenue.com",
    ownerName: project.ownerName || "Independent Filmmaker",
    companyName: project.companyName || "CineVenue Production Unit",
    producerName: project.producerName || project.ownerName || "Producer",
    directorName: project.directorName || "Director",
    title: project.title || "Untitled Film Project",
    tagline: project.tagline || "",
    type: project.type || "Feature Film",
    language: project.language || "Telugu",
    industry: project.industry || "Tollywood",
    location: project.location || "Hyderabad",
    genre: project.genre || ["Drama"],
    productionStage: project.productionStage || "Development",
    expectedStartDate: project.expectedStartDate || new Date().toISOString().split("T")[0],
    expectedCompletionDate: project.expectedCompletionDate || "",
    budgetRange: project.budgetRange || "₹5 Cr – ₹10 Cr",
    isConfidential: project.isConfidential || false,
    posterUrl: project.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80",
    bannerUrl: project.bannerUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80",
    description: project.description || "",
    synopsis: project.synopsis || "",
    status: "Active",
    requirements: project.requirements || [],
    castMembers: project.castMembers || [],
    crewMembers: project.crewMembers || [],
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
    ...project
  } as FilmProject;

  list.unshift(newProject);
  setStored(STORAGE_KEYS.PROJECTS, list);
  logActivity(newProject.id, newProject.ownerName, "Created Project", `Film project "${newProject.title}" was published.`);
  return newProject;
};

export const deleteProject = (projectId: string): void => {
  const list = getStored<FilmProject[]>(STORAGE_KEYS.PROJECTS, INITIAL_FILM_PROJECTS).filter(p => p.id !== projectId);
  setStored(STORAGE_KEYS.PROJECTS, list);
};

// ----------------------------------------------------
// 4. PROJECT REQUIREMENTS, CASTING & CREW JOBS
// ----------------------------------------------------
export const getRequirements = (filters?: {
  isCastingCall?: boolean;
  craftId?: string;
  location?: string;
  projectId?: string;
  status?: string;
  search?: string;
}): FilmProjectRequirement[] => {
  const projects = getProjects();
  let allReqs: FilmProjectRequirement[] = [];
  projects.forEach(p => {
    if (p.requirements && Array.isArray(p.requirements)) {
      allReqs.push(...p.requirements);
    }
  });

  if (!filters) return allReqs;

  if (filters.projectId) {
    allReqs = allReqs.filter(r => r.projectId === filters.projectId);
  }

  if (filters.isCastingCall !== undefined) {
    allReqs = allReqs.filter(r => r.isCastingCall === filters.isCastingCall);
  }

  if (filters.craftId && filters.craftId !== "all") {
    allReqs = allReqs.filter(r => r.craftId === filters.craftId);
  }

  if (filters.status && filters.status !== "all") {
    allReqs = allReqs.filter(r => r.status === filters.status);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    allReqs = allReqs.filter(r => 
      r.position.toLowerCase().includes(q) ||
      r.projectTitle.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.skillsRequired.some(s => s.toLowerCase().includes(q))
    );
  }

  return allReqs;
};

export const addRequirementToProject = (projectId: string, req: Partial<FilmProjectRequirement>): FilmProjectRequirement => {
  const project = getProjectById(projectId);
  if (!project) throw new Error("Project not found");

  const newReq: FilmProjectRequirement = {
    id: `req-${Date.now()}`,
    projectId,
    projectTitle: project.title,
    craftId: req.craftId || "craft-1",
    craftName: req.craftName || "Direction",
    position: req.position || "Crew Position",
    countRequired: req.countRequired || 1,
    countHired: 0,
    description: req.description || "",
    skillsRequired: req.skillsRequired || [],
    minExperienceYears: req.minExperienceYears || 2,
    preferredLocation: req.preferredLocation || project.location,
    languages: req.languages || [project.language],
    startDate: req.startDate || project.expectedStartDate,
    endDate: req.endDate || project.expectedCompletionDate,
    duration: req.duration || "Full Schedule",
    budgetRange: req.budgetRange || "Negotiable",
    applicationDeadline: req.applicationDeadline || "",
    auditionRequired: req.auditionRequired || false,
    portfolioRequired: req.portfolioRequired || true,
    isCastingCall: req.isCastingCall || false,
    characterDetails: req.characterDetails,
    status: "Open",
    postedDate: new Date().toISOString().split("T")[0],
    ...req
  };

  const updatedReqs = [...(project.requirements || []), newReq];
  saveProject({ ...project, requirements: updatedReqs });
  logActivity(projectId, project.ownerName, "Added Requirement", `Added requirement for "${newReq.position}" (${newReq.craftName}).`);
  return newReq;
};

// ----------------------------------------------------
// 5. APPLICATIONS & APPLICANT TRACKING (ATS)
// ----------------------------------------------------
export const getApplications = (filters?: {
  projectId?: string;
  requirementId?: string;
  applicantEmail?: string;
  status?: string;
}): JobApplication[] => {
  let list = getStored<JobApplication[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);

  if (!filters) return list;

  if (filters.projectId) {
    list = list.filter(a => a.projectId === filters.projectId);
  }

  if (filters.requirementId) {
    list = list.filter(a => a.requirementId === filters.requirementId);
  }

  if (filters.applicantEmail) {
    list = list.filter(a => a.applicantEmail.toLowerCase() === filters.applicantEmail!.toLowerCase());
  }

  if (filters.status && filters.status !== "all") {
    list = list.filter(a => a.status === filters.status);
  }

  return list;
};

export const submitApplication = (app: Partial<JobApplication>): JobApplication => {
  const list = getStored<JobApplication[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);

  const newApp: JobApplication = {
    id: `app-${Date.now()}`,
    projectId: app.projectId || "",
    projectTitle: app.projectTitle || "Film Project",
    projectPosterUrl: app.projectPosterUrl,
    requirementId: app.requirementId || "",
    requirementPosition: app.requirementPosition || "Specialist",
    craftId: app.craftId || "craft-1",
    craftName: app.craftName || "Direction",
    applicantId: app.applicantId || `user-${Date.now()}`,
    applicantName: app.applicantName || "Applicant",
    applicantEmail: app.applicantEmail || "talent@cinevenue.com",
    applicantAvatar: app.applicantAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    applicantHeadline: app.applicantHeadline || "Film Professional",
    applicantLocation: app.applicantLocation || "Hyderabad",
    applicantExperienceYears: app.applicantExperienceYears || 2,
    applicantRating: app.applicantRating || 5.0,
    applicantVerification: app.applicantVerification || "Profile Verified",
    coverMessage: app.coverMessage || "",
    relevantExperience: app.relevantExperience || "",
    selectedPortfolioIds: app.selectedPortfolioIds || [],
    expectedPay: app.expectedPay || "Negotiable",
    availabilityNotes: app.availabilityNotes || "Immediately Available",
    status: "Applied",
    appliedAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
    ...app
  };

  list.unshift(newApp);
  setStored(STORAGE_KEYS.APPLICATIONS, list);
  logActivity(newApp.projectId, newApp.applicantName, "New Application", `${newApp.applicantName} applied for ${newApp.requirementPosition}.`);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cinevenue-film-applications-updated", { detail: list }));
  }
  return newApp;
};

export const updateApplicationStatus = (appId: string, status: JobApplication["status"], notes?: string): JobApplication | undefined => {
  const list = getStored<JobApplication[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  const index = list.findIndex(a => a.id === appId);
  if (index < 0) return undefined;

  list[index].status = status;
  list[index].updatedAt = new Date().toISOString().split("T")[0];
  if (notes) list[index].adminNotes = notes;

  setStored(STORAGE_KEYS.APPLICATIONS, list);
  logActivity(list[index].projectId, "Filmmaker", "Application Status Updated", `Application #${appId} set to "${status}".`);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cinevenue-film-applications-updated", { detail: list }));
  }
  return list[index];
};

export const getFilmProjectApplications = (): FilmProjectApplication[] => {
  return getStored<FilmProjectApplication[]>(STORAGE_KEYS.FILM_PROJECT_APPLICATIONS, INITIAL_FILM_APPLICATIONS);
};

export const saveFilmProjectApplication = (app: FilmProjectApplication): FilmProjectApplication => {
  const list = getStored<FilmProjectApplication[]>(STORAGE_KEYS.FILM_PROJECT_APPLICATIONS, INITIAL_FILM_APPLICATIONS);
  const idx = list.findIndex(a => a.id === app.id);
  if (idx >= 0) {
    list[idx] = { ...app, lastUpdated: new Date().toISOString() };
  } else {
    list.unshift({ ...app, submittedAt: app.submittedAt || new Date().toISOString() });
  }
  setStored(STORAGE_KEYS.FILM_PROJECT_APPLICATIONS, list);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cinevenue-film-project-applications-updated", { detail: list }));
  }
  return app;
};

export const updateFilmProjectApplication = (updatedApp: FilmProjectApplication): FilmProjectApplication => {
  const list = getStored<FilmProjectApplication[]>(STORAGE_KEYS.FILM_PROJECT_APPLICATIONS, INITIAL_FILM_APPLICATIONS);
  const updated = list.map(a => a.id === updatedApp.id ? { ...updatedApp, lastUpdated: new Date().toISOString() } : a);
  setStored(STORAGE_KEYS.FILM_PROJECT_APPLICATIONS, updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cinevenue-film-project-applications-updated", { detail: updated }));
  }
  return updatedApp;
};

// ----------------------------------------------------
// 6. INVITATIONS & DIRECT TALENT OFFERS
// ----------------------------------------------------
export const getInvitations = (userEmail?: string): ProjectInvitation[] => {
  const list = getStored<ProjectInvitation[]>(STORAGE_KEYS.INVITATIONS, []);
  if (!userEmail) return list;
  return list.filter(i => 
    i.recipientEmail.toLowerCase() === userEmail.toLowerCase() ||
    i.senderEmail.toLowerCase() === userEmail.toLowerCase()
  );
};

export const sendProjectInvitation = (invite: Partial<ProjectInvitation>): ProjectInvitation => {
  const list = getStored<ProjectInvitation[]>(STORAGE_KEYS.INVITATIONS, []);

  const newInvite: ProjectInvitation = {
    id: `inv-${Date.now()}`,
    projectId: invite.projectId || "",
    projectTitle: invite.projectTitle || "Film Project",
    projectPosterUrl: invite.projectPosterUrl,
    companyName: invite.companyName || "Production Studio",
    requirementId: invite.requirementId || "",
    position: invite.position || "Craft Lead",
    senderId: invite.senderId || "",
    senderEmail: invite.senderEmail || "",
    senderName: invite.senderName || "Filmmaker",
    recipientId: invite.recipientId || "",
    recipientEmail: invite.recipientEmail || "",
    recipientName: invite.recipientName || "Professional",
    proposedTerms: invite.proposedTerms || "",
    proposedRemuneration: invite.proposedRemuneration || "",
    workDates: invite.workDates || "",
    location: invite.location || "",
    message: invite.message || "",
    status: "Pending",
    sentAt: new Date().toISOString().split("T")[0],
    ...invite
  };

  list.unshift(newInvite);
  setStored(STORAGE_KEYS.INVITATIONS, list);
  logActivity(newInvite.projectId, newInvite.senderName, "Sent Invitation", `Sent direct invitation to ${newInvite.recipientName} for ${newInvite.position}.`);
  return newInvite;
};

export const respondToInvitation = (inviteId: string, status: "Accepted" | "Declined" | "Discussing"): ProjectInvitation | undefined => {
  const list = getStored<ProjectInvitation[]>(STORAGE_KEYS.INVITATIONS, []);
  const index = list.findIndex(i => i.id === inviteId);
  if (index < 0) return undefined;

  list[index].status = status;
  list[index].respondedAt = new Date().toISOString().split("T")[0];
  setStored(STORAGE_KEYS.INVITATIONS, list);
  return list[index];
};

// ----------------------------------------------------
// 7. NEGOTIATIONS, CHAT & FORMAL OFFERS
// ----------------------------------------------------
export const getNegotiations = (userEmail?: string): ProjectNegotiation[] => {
  const list = getStored<ProjectNegotiation[]>(STORAGE_KEYS.NEGOTIATIONS, INITIAL_NEGOTIATIONS);
  if (!userEmail) return list;
  return list.filter(n => 
    n.filmmakerEmail.toLowerCase() === userEmail.toLowerCase() ||
    n.professionalEmail.toLowerCase() === userEmail.toLowerCase()
  );
};

export const getNegotiationById = (id: string): ProjectNegotiation | undefined => {
  const list = getStored<ProjectNegotiation[]>(STORAGE_KEYS.NEGOTIATIONS, INITIAL_NEGOTIATIONS);
  return list.find(n => n.id === id);
};

export const getOrCreateNegotiation = (
  projectId: string, 
  professionalId: string, 
  filmmakerEmail: string
): ProjectNegotiation => {
  const list = getStored<ProjectNegotiation[]>(STORAGE_KEYS.NEGOTIATIONS, INITIAL_NEGOTIATIONS);
  const existing = list.find(n => n.projectId === projectId && n.professionalId === professionalId);
  if (existing) return existing;

  const project = getProjectById(projectId);
  const professional = getProfessionalById(professionalId);

  const newNeg: ProjectNegotiation = {
    id: `neg-${Date.now()}`,
    projectId,
    projectTitle: project?.title || "Film Project",
    projectPosterUrl: project?.posterUrl,
    requirementId: project?.requirements?.[0]?.id || "",
    position: professional?.primaryCraftName || "Craft Specialist",
    filmmakerId: project?.ownerId || "user-filmmaker",
    filmmakerEmail: project?.ownerEmail || filmmakerEmail,
    filmmakerName: project?.companyName || project?.ownerName || "Production Studio",
    professionalId,
    professionalEmail: professional?.userEmail || "talent@cinevenue.com",
    professionalName: professional?.fullName || "Film Professional",
    professionalAvatar: professional?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    professionalCraft: professional?.primaryCraftName || "Craft",
    messages: [
      {
        id: `msg-${Date.now()}`,
        senderId: "system",
        senderName: "CineVenue Platform",
        senderRole: "filmmaker",
        text: `Negotiation room opened for "${project?.title}". Private communication is encrypted and secure.`,
        timestamp: new Date().toISOString()
      }
    ],
    offers: [],
    status: "Active",
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0]
  };

  list.unshift(newNeg);
  setStored(STORAGE_KEYS.NEGOTIATIONS, list);
  return newNeg;
};

export const sendNegotiationMessage = (negotiationId: string, message: {
  senderId: string;
  senderName: string;
  senderRole: "filmmaker" | "professional";
  text: string;
}): ProjectNegotiation | undefined => {
  const list = getStored<ProjectNegotiation[]>(STORAGE_KEYS.NEGOTIATIONS, INITIAL_NEGOTIATIONS);
  const index = list.findIndex(n => n.id === negotiationId);
  if (index < 0) return undefined;

  const newMsg: NegotiationMessage = {
    id: `msg-${Date.now()}`,
    senderId: message.senderId,
    senderName: message.senderName,
    senderRole: message.senderRole,
    text: message.text,
    timestamp: new Date().toISOString()
  };

  list[index].messages.push(newMsg);
  list[index].updatedAt = new Date().toISOString();
  setStored(STORAGE_KEYS.NEGOTIATIONS, list);
  return list[index];
};

export const sendNegotiationOffer = (negotiationId: string, offer: Partial<NegotiationOffer>): ProjectNegotiation | undefined => {
  const list = getStored<ProjectNegotiation[]>(STORAGE_KEYS.NEGOTIATIONS, INITIAL_NEGOTIATIONS);
  const index = list.findIndex(n => n.id === negotiationId);
  if (index < 0) return undefined;

  const newOffer: NegotiationOffer = {
    id: `off-${Date.now()}`,
    amount: offer.amount || 1000000,
    currency: "INR",
    paymentMilestones: offer.paymentMilestones || ["Milestone 1: 50%", "Milestone 2: 50%"],
    workScope: offer.workScope || "Deliverables as agreed in project brief.",
    startDate: offer.startDate || new Date().toISOString().split("T")[0],
    endDate: offer.endDate || "",
    terms: offer.terms || "Standard CineVenue Production Terms Apply.",
    status: "Sent",
    createdBy: offer.createdBy || "filmmaker",
    createdAt: new Date().toISOString()
  };

  list[index].offers.push(newOffer);
  list[index].currentOffer = newOffer;
  list[index].updatedAt = new Date().toISOString();

  // Add system chat notification
  list[index].messages.push({
    id: `msg-${Date.now()}`,
    senderId: "system",
    senderName: "CineVenue Platform",
    senderRole: offer.createdBy || "filmmaker",
    text: `Formal production offer of ₹${(newOffer.amount).toLocaleString("en-IN")} was sent.`,
    timestamp: new Date().toISOString()
  });

  setStored(STORAGE_KEYS.NEGOTIATIONS, list);
  return list[index];
};

export const updateOfferStatus = (negotiationId: string, offerId: string, status: NegotiationOffer["status"]): ProjectNegotiation | undefined => {
  const list = getStored<ProjectNegotiation[]>(STORAGE_KEYS.NEGOTIATIONS, INITIAL_NEGOTIATIONS);
  const index = list.findIndex(n => n.id === negotiationId);
  if (index < 0) return undefined;

  const offerIndex = list[index].offers.findIndex(o => o.id === offerId);
  if (offerIndex >= 0) {
    list[index].offers[offerIndex].status = status;
  }
  if (list[index].currentOffer && list[index].currentOffer!.id === offerId) {
    list[index].currentOffer!.status = status;
  }
  if (status === "Accepted") {
    list[index].status = "Agreed";
  }

  list[index].messages.push({
    id: `msg-${Date.now()}`,
    senderId: "system",
    senderName: "CineVenue Platform",
    senderRole: "professional",
    text: `Offer was ${status.toUpperCase()}.`,
    timestamp: new Date().toISOString()
  });

  setStored(STORAGE_KEYS.NEGOTIATIONS, list);
  return list[index];
};

// ----------------------------------------------------
// 8. HIRING & DIGITAL AGREEMENTS
// ----------------------------------------------------
export const hireProfessional = (data: {
  projectId: string;
  requirementId: string;
  professionalId: string;
  agreedRemuneration: string;
  startDate: string;
  endDate: string;
}): { hire: HireRecord; agreement: DigitalAgreement } => {
  const project = getProjectById(data.projectId);
  const professional = getProfessionalById(data.professionalId);
  if (!project || !professional) throw new Error("Project or Professional not found");

  const hires = getStored<HireRecord[]>(STORAGE_KEYS.HIRES, INITIAL_HIRES);
  const agreements = getStored<DigitalAgreement[]>(STORAGE_KEYS.AGREEMENTS, INITIAL_AGREEMENTS);

  const hireId = `hire-${Date.now()}`;
  const agreementId = `agr-${Date.now()}`;

  const newHire: HireRecord = {
    id: hireId,
    projectId: data.projectId,
    projectTitle: project.title,
    companyName: project.companyName,
    requirementId: data.requirementId,
    position: professional.primaryCraftName,
    craftName: professional.primaryCraftName,
    professionalId: professional.id,
    professionalName: professional.fullName,
    professionalEmail: professional.userEmail,
    professionalAvatar: professional.avatarUrl,
    agreedRemuneration: data.agreedRemuneration,
    startDate: data.startDate,
    endDate: data.endDate,
    status: "Hired",
    agreementId,
    hiredAt: new Date().toISOString().split("T")[0]
  };

  const newAgreement: DigitalAgreement = {
    id: agreementId,
    projectId: data.projectId,
    projectTitle: project.title,
    productionCompany: project.companyName,
    filmmakerName: project.ownerName,
    filmmakerEmail: project.ownerEmail,
    professionalId: professional.id,
    professionalName: professional.fullName,
    professionalEmail: professional.userEmail,
    position: professional.primaryCraftName,
    craftName: professional.primaryCraftName,
    scopeOfWork: `Principal service execution for film project "${project.title}". Compliance with studio call-sheets and creative deliverables.`,
    remuneration: data.agreedRemuneration,
    paymentMilestones: [
      "Milestone 1 (30%): Contract execution & Pre-Production Prep",
      "Milestone 2 (40%): Shoot Schedule / Principal Work Execution",
      "Milestone 3 (30%): Final Deliverables Sign-off"
    ],
    startDate: data.startDate,
    endDate: data.endDate,
    deliverables: [
      "High-fidelity professional work output matching studio specs",
      "Attendance in all production schedules and technical reviews"
    ],
    creditsTitle: `${professional.primaryCraftName} — ${professional.fullName}`,
    confidentialityTerms: "Standard Non-Disclosure Agreement (NDA) regarding film plot, audio stems, footage, and unreleased materials.",
    cancellationTerms: "Mutual 14-day notice with pro-rata payout for completed milestones.",
    ipTerms: "Intellectual property and master rights assigned to the Production Company.",
    status: "Draft",
    createdAt: new Date().toISOString().split("T")[0]
  };

  hires.unshift(newHire);
  agreements.unshift(newAgreement);

  setStored(STORAGE_KEYS.HIRES, hires);
  setStored(STORAGE_KEYS.AGREEMENTS, agreements);

  // Also add to project Cast or Crew
  if (professional.primaryCraftName.toLowerCase().includes("acting") || professional.primaryCraftName.toLowerCase().includes("artist")) {
    const cast = project.castMembers || [];
    cast.push({
      id: `cast-${Date.now()}`,
      projectId: project.id,
      professionalId: professional.id,
      actorName: professional.fullName,
      characterName: "Confirmed Cast",
      roleType: "Lead",
      status: "Confirmed",
      contractStatus: "Signed",
      paymentStatus: "Paid",
      photoUrl: professional.avatarUrl
    });
    saveProject({ ...project, castMembers: cast });
  } else {
    const crew = project.crewMembers || [];
    crew.push({
      id: `crew-${Date.now()}`,
      projectId: project.id,
      professionalId: professional.id,
      name: professional.fullName,
      department: professional.primaryCraftName,
      craftName: professional.primaryCraftName,
      position: professional.primaryCraftName,
      status: "Confirmed",
      contractStatus: "Signed",
      paymentStatus: "Paid",
      photoUrl: professional.avatarUrl
    });
    saveProject({ ...project, crewMembers: crew });
  }

  logActivity(data.projectId, project.ownerName, "Professional Hired", `Formally hired ${professional.fullName} as ${professional.primaryCraftName}.`);
  return { hire: newHire, agreement: newAgreement };
};

export const getAgreements = (userEmail?: string): DigitalAgreement[] => {
  const list = getStored<DigitalAgreement[]>(STORAGE_KEYS.AGREEMENTS, INITIAL_AGREEMENTS);
  if (!userEmail) return list;
  return list.filter(a => 
    a.filmmakerEmail.toLowerCase() === userEmail.toLowerCase() ||
    a.professionalEmail.toLowerCase() === userEmail.toLowerCase()
  );
};

export const signAgreement = (agreementId: string, signatureName: string): DigitalAgreement | undefined => {
  const list = getStored<DigitalAgreement[]>(STORAGE_KEYS.AGREEMENTS, INITIAL_AGREEMENTS);
  const index = list.findIndex(a => a.id === agreementId);
  if (index < 0) return undefined;

  list[index].status = "Accepted";
  list[index].signatureName = signatureName;
  list[index].acceptedAt = new Date().toISOString();
  list[index].ipAddress = "103.115.192.44 (Secured CineVenue Verified)";

  setStored(STORAGE_KEYS.AGREEMENTS, list);
  logActivity(list[index].projectId, signatureName, "Agreement Executed", `Digital agreement #${agreementId} was officially signed & ratified.`);
  return list[index];
};

// ----------------------------------------------------
// 9. PRODUCTION COMPANIES
// ----------------------------------------------------
export const getCompanies = (search?: string): ProductionCompany[] => {
  let list = getStored<ProductionCompany[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.about.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.services.some(s => s.toLowerCase().includes(q))
    );
  }
  return list;
};

export const getCompanyById = (id: string): ProductionCompany | undefined => {
  const list = getStored<ProductionCompany[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
  return list.find(c => c.id === id);
};

export const saveCompany = (company: Partial<ProductionCompany>): ProductionCompany => {
  const list = getStored<ProductionCompany[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
  if (company.id) {
    const index = list.findIndex(c => c.id === company.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...company } as ProductionCompany;
      setStored(STORAGE_KEYS.COMPANIES, list);
      return list[index];
    }
  }

  const newCompany: ProductionCompany = {
    id: `comp-${Date.now()}`,
    ownerId: company.ownerId || `user-${Date.now()}`,
    ownerEmail: company.ownerEmail || "company@cinevenue.com",
    name: company.name || "Cinema Production Studio",
    logoUrl: company.logoUrl || "https://images.unsplash.com/photo-1518134346374-184f9d21cb69?w=300&auto=format&fit=crop&q=80",
    tagline: company.tagline || "",
    about: company.about || "",
    location: company.location || "Hyderabad, India",
    languages: company.languages || ["Telugu", "Hindi", "English"],
    services: company.services || ["Feature Film Production", "Line Production"],
    notableCredits: company.notableCredits || [],
    creditsCount: company.creditsCount || 0,
    teamSize: company.teamSize || "10-25 Employees",
    verificationStatus: "Verified",
    activeProjectsCount: 1,
    ...company
  } as ProductionCompany;

  list.unshift(newCompany);
  setStored(STORAGE_KEYS.COMPANIES, list);
  return newCompany;
};

// ----------------------------------------------------
// 10. REVIEWS & RATINGS
// ----------------------------------------------------
export const getReviews = (targetUserId?: string): TalentReview[] => {
  const list = getStored<TalentReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  if (!targetUserId) return list;
  return list.filter(r => r.targetUserId === targetUserId && r.status === "Published");
};

export const submitReview = (review: Partial<TalentReview>): TalentReview => {
  const list = getStored<TalentReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);

  const newReview: TalentReview = {
    id: `rev-${Date.now()}`,
    projectId: review.projectId || "",
    projectTitle: review.projectTitle || "Film Project",
    reviewerId: review.reviewerId || "user-reviewer",
    reviewerName: review.reviewerName || "Filmmaker",
    reviewerRole: review.reviewerRole || "Filmmaker",
    targetUserId: review.targetUserId || "",
    targetName: review.targetName || "Professional",
    rating: review.rating || 5,
    ratingsBreakdown: review.ratingsBreakdown || {
      professionalism: 5,
      communication: 5,
      reliability: 5
    },
    reviewText: review.reviewText || "",
    createdAt: new Date().toISOString().split("T")[0],
    status: "Published"
  };

  list.unshift(newReview);
  setStored(STORAGE_KEYS.REVIEWS, list);
  return newReview;
};

// ----------------------------------------------------
// 11. ACTIVITY LOGGING & AUDIT TRAIL
// ----------------------------------------------------
export const getActivityLogs = (projectId?: string): ProjectActivityLog[] => {
  const list = getStored<ProjectActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, []);
  if (!projectId) return list;
  return list.filter(l => l.projectId === projectId);
};

export const logActivity = (projectId: string, user: string, action: string, details: string): void => {
  const list = getStored<ProjectActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, []);
  const newLog: ProjectActivityLog = {
    id: `log-${Date.now()}`,
    projectId,
    user,
    action,
    details,
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  };
  list.unshift(newLog);
  if (list.length > 200) list.pop();
  setStored(STORAGE_KEYS.ACTIVITY_LOGS, list);
};

// ----------------------------------------------------
// 12. REPORTS & MODERATION
// ----------------------------------------------------
export const submitReport = (report: Partial<MarketplaceReport>): MarketplaceReport => {
  const list = getStored<MarketplaceReport[]>(STORAGE_KEYS.REPORTS, []);
  const newReport: MarketplaceReport = {
    id: `rep-${Date.now()}`,
    reporterEmail: report.reporterEmail || "user@cinevenue.com",
    targetId: report.targetId || "",
    targetType: report.targetType || "User",
    targetTitle: report.targetTitle || "Marketplace Item",
    reason: report.reason || "Misleading Information",
    details: report.details || "",
    status: "Pending",
    createdAt: new Date().toISOString().split("T")[0]
  };
  list.unshift(newReport);
  setStored(STORAGE_KEYS.REPORTS, list);
  return newReport;
};

export const getReports = (): MarketplaceReport[] => {
  return getStored<MarketplaceReport[]>(STORAGE_KEYS.REPORTS, []);
};

export const updateReportStatus = (reportId: string, status: MarketplaceReport["status"], adminNotes?: string): void => {
  const list = getStored<MarketplaceReport[]>(STORAGE_KEYS.REPORTS, []);
  const index = list.findIndex(r => r.id === reportId);
  if (index >= 0) {
    list[index].status = status;
    if (adminNotes) list[index].adminNotes = adminNotes;
    setStored(STORAGE_KEYS.REPORTS, list);
  }
};
