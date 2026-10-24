import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";

const router = Router();

const PROPOSALS_DATA_FILE = path.join(process.cwd(), "server", "config", "proposals_store.json");

let proposalSeq = 100;

function readProposals(): any[] {
  try {
    if (fs.existsSync(PROPOSALS_DATA_FILE)) {
      const data = fs.readFileSync(PROPOSALS_DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Could not read proposals data file:", err);
  }
  return [];
}

function writeProposals(list: any[]) {
  try {
    const dir = path.dirname(PROPOSALS_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PROPOSALS_DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Could not write proposals data file:", err);
  }
}

// In-memory proposals initialized from file
let inMemoryProposals: any[] = readProposals();

function generateProposalReferenceId(isMovieProduction: boolean = false): string {
  proposalSeq += 1;
  const year = new Date().getFullYear();
  const padded = String(proposalSeq).padStart(6, "0");
  return isMovieProduction ? `CV-FILM-${year}-${padded}` : `CV-PROP-${year}-${padded}`;
}

function sanitizeProposalForCustomer(proposal: any) {
  if (!proposal) return null;
  const { assignedTo, ...rest } = proposal;
  const reviewNotes = (proposal.internalNotes || []).map((n: any) => ({
    id: n.id,
    author: n.author || "Directorate Reviewer",
    authorRole: n.authorRole || "CineVenue Directorate",
    note: n.note,
    createdAt: n.createdAt
  }));
  const reviewHistory = (proposal.auditLogs || []).map((l: any) => ({
    id: l.id,
    action: l.action,
    timestamp: l.timestamp,
    details: l.details
  }));
  return {
    ...rest,
    reviewNotes,
    reviewHistory,
    hasQuotation: Boolean(proposal.quotation),
    quoteStatus: proposal.quotation ? proposal.quotation.status : "Pending Quote"
  };
}

// 1. Submit Proposal (POST /proposals)
router.post("/proposals", (req: Request, res: Response) => {
  try {
    const body = req.body || {};

    const isMovieProduction = 
      body.category === "MOVIE_PRODUCTION" || 
      body.proposalType === "MOVIE_PRODUCTION" ||
      body.serviceType === "Film Production" ||
      Boolean(body.genre) || 
      Boolean(body.productionType);

    const category = isMovieProduction ? "MOVIE_PRODUCTION" : "EVENT";
    const fullName = (body.fullName || "").trim();
    const email = (body.email || body.userEmail || "").trim().toLowerCase();
    const phone = (body.phone || body.mobile || "").trim();
    const city = (body.city || "").trim();
    const state = (body.state || "").trim();
    const customerType = (body.customerType || (isMovieProduction ? "Film Production" : "Individual")).trim();
    const serviceType = (body.serviceType || (isMovieProduction ? "Film Production" : "Movie Promotion")).trim();
    const projectName = (body.projectName || body.projectTitle || "").trim();
    const location = (body.location || (state ? `${city}, ${state}` : city) || "").trim();
    const description = (body.description || body.storyConcept || "").trim();
    const roleDesignation = (body.roleDesignation || body.role || (isMovieProduction ? "Filmmaker" : "")).trim();
    const genre = (body.genre || "").trim();
    const productionType = (body.productionType || "").trim();
    const language = (body.language || body.primaryLanguage || "").trim();
    const projectStage = (body.projectStage || "").trim();

    // Validation
    if (!fullName) {
      return res.status(400).json({ success: false, message: "Full Name is required." });
    }
    if (!email || !email.includes("@") || !email.includes(".")) {
      return res.status(400).json({ success: false, message: "A valid Email Address is required." });
    }
    if (!phone || phone.replace(/[^0-9]/g, "").length < 8) {
      return res.status(400).json({ success: false, message: "A valid Mobile Number is required." });
    }
    if (!city) {
      return res.status(400).json({ success: false, message: "City is required." });
    }
    if (!projectName) {
      return res.status(400).json({ 
        success: false, 
        message: isMovieProduction ? "Project Title is required." : "Project / Event Name is required." 
      });
    }
    if (isMovieProduction) {
      if (!genre) {
        return res.status(400).json({ success: false, message: "Genre is required." });
      }
      if (!productionType) {
        return res.status(400).json({ success: false, message: "Production Type is required." });
      }
      if (!language) {
        return res.status(400).json({ success: false, message: "Primary Language is required." });
      }
      if (!roleDesignation) {
        return res.status(400).json({ success: false, message: "Role / Designation is required." });
      }
      if (!state) {
        return res.status(400).json({ success: false, message: "State is required." });
      }
    }
    if (!description || description.length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: isMovieProduction 
          ? "Project Description / Story Concept must be at least 10 characters." 
          : "Project Description must be at least 10 characters." 
      });
    }

    let estimatedBudget = 0;
    if (typeof body.estimatedBudget === "number") {
      estimatedBudget = body.estimatedBudget;
    } else if (typeof body.estimatedBudget === "string") {
      estimatedBudget = parseInt(body.estimatedBudget.replace(/[^0-9]/g, ""), 10) || 0;
    }

    let expectedAttendees = 0;
    if (typeof body.expectedAttendees === "number") {
      expectedAttendees = body.expectedAttendees;
    } else if (typeof body.expectedAttendees === "string") {
      expectedAttendees = parseInt(body.expectedAttendees.replace(/[^0-9]/g, ""), 10) || 0;
    }

    const servicesRequired = Array.isArray(body.servicesRequired)
      ? body.servicesRequired
      : typeof body.servicesRequired === "string" && body.servicesRequired.trim()
      ? body.servicesRequired.split(",").map((s: string) => s.trim())
      : [];

    const attachments = Array.isArray(body.attachments)
      ? body.attachments.map((att: any, idx: number) => ({
          id: att.id || `ATT-${Date.now()}-${idx}`,
          name: att.name || `Attachment-${idx + 1}`,
          size: Number(att.size) || 0,
          type: att.type || "application/octet-stream",
          url: att.url || att.dataUrl || "",
          uploadedAt: new Date().toISOString()
        }))
      : [];

    const proposalId = generateProposalReferenceId(isMovieProduction);
    const nowIso = new Date().toISOString();

    const newProposal = {
      proposalId,
      customerId: email,
      customerType,
      category,
      fullName,
      roleDesignation,
      companyName: (body.companyName || body.productionHouse || body.company || "").trim(),
      phone,
      whatsappNumber: (body.whatsappNumber || "").trim(),
      email,
      city,
      state,
      websiteUrl: (body.websiteUrl || body.portfolioUrl || "").trim(),
      contactMethod: body.contactMethod || body.preferredContactMethod || "Email",
      serviceType,
      projectName,
      genre,
      productionType,
      language,
      projectStage,
      expectedStartDate: body.expectedStartDate || body.startDate || "",
      expectedReleaseDate: body.expectedReleaseDate || body.releaseDate || "",
      location,
      preferredDate: body.preferredDate || body.expectedStartDate || "",
      expectedAttendees,
      estimatedBudget,
      servicesRequired,
      description,
      additionalRequirements: (body.additionalRequirements || "").trim(),
      attachments,
      status: "NEW", // Pending Review
      assignedTo: null,
      internalNotes: [],
      auditLogs: [
        {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          action: isMovieProduction ? "Movie Production Proposal Submitted" : "Event Proposal Submitted",
          performedBy: email,
          timestamp: nowIso,
          newStatus: "NEW"
        }
      ],
      createdAt: nowIso,
      updatedAt: nowIso
    };

    inMemoryProposals.unshift(newProposal);
    writeProposals(inMemoryProposals);

    return res.status(201).json({
      success: true,
      referenceId: proposalId,
      proposalId,
      title: isMovieProduction ? "Movie Production Proposal Received!" : "Proposal Received!",
      message: "Thank you for contacting CineVenue. Our production team will review your proposal and contact you shortly.",
      proposal: sanitizeProposalForCustomer(newProposal)
    });
  } catch (err: any) {
    console.error("Proposal Submission Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to submit proposal." });
  }
});

// 2. Customer: Get My Proposals (GET /proposals/my)
router.get("/proposals/my", (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    let list = inMemoryProposals;
    if (email && typeof email === "string" && email.trim()) {
      const emailLower = email.toLowerCase().trim();
      list = inMemoryProposals.filter(p => p.customerId?.toLowerCase() === emailLower || p.email?.toLowerCase() === emailLower);
    }

    const myProposals = list.map(sanitizeProposalForCustomer);

    return res.json({
      success: true,
      count: myProposals.length,
      proposals: myProposals
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Customer: Get Proposal Details (GET /proposals/:id)
router.get("/proposals/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { customerId } = req.query;

    const proposal = inMemoryProposals.find(p => p.proposalId === id || p.id === id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found." });
    }

    if (customerId && proposal.customerId?.toLowerCase() !== customerId && proposal.email?.toLowerCase() !== customerId) {
      return res.status(403).json({ success: false, message: "Access denied. You can only view your own proposals." });
    }

    return res.json({
      success: true,
      proposal: sanitizeProposalForCustomer(proposal)
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Admin: Get All Proposals (GET /admin/proposals)
router.get("/admin/proposals", (req: Request, res: Response) => {
  try {
    const { status, service, category, city, search, sortBy = "createdAt", sortOrder = "desc", page = "1", limit = "100" } = req.query;

    let filtered = [...inMemoryProposals];

    if (category && category !== "ALL") {
      filtered = filtered.filter(p => (p.category || (p.serviceType === "Film Production" ? "MOVIE_PRODUCTION" : "EVENT")) === category);
    }
    if (status && status !== "ALL") {
      filtered = filtered.filter(p => p.status === status);
    }
    if (service && service !== "ALL") {
      filtered = filtered.filter(p => p.serviceType === service);
    }
    if (city && city !== "ALL") {
      filtered = filtered.filter(p => p.city?.toLowerCase() === (city as string).toLowerCase());
    }
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(p =>
        p.proposalId.toLowerCase().includes(q) ||
        p.fullName.toLowerCase().includes(q) ||
        p.projectName.toLowerCase().includes(q) ||
        (p.companyName && p.companyName.toLowerCase().includes(q)) ||
        p.email.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.genre && p.genre.toLowerCase().includes(q)) ||
        (p.roleDesignation && p.roleDesignation.toLowerCase().includes(q)) ||
        (p.language && p.language.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => {
      let valA = a[sortBy as string];
      let valB = b[sortBy as string];
      if (sortBy === "estimatedBudget") {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }
      if (sortOrder === "asc") {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 100;
    const total = filtered.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    const counts: { [key: string]: number } = {
      ALL: inMemoryProposals.length,
      MOVIE_PRODUCTION: inMemoryProposals.filter(p => (p.category || (p.serviceType === "Film Production" ? "MOVIE_PRODUCTION" : "EVENT")) === "MOVIE_PRODUCTION").length,
      EVENT: inMemoryProposals.filter(p => (p.category || (p.serviceType === "Film Production" ? "MOVIE_PRODUCTION" : "EVENT")) === "EVENT").length,
      NEW: inMemoryProposals.filter(p => p.status === "NEW").length,
      "UNDER REVIEW": inMemoryProposals.filter(p => p.status === "UNDER REVIEW").length,
      CONTACTED: inMemoryProposals.filter(p => p.status === "CONTACTED").length,
      "QUOTE PREPARED": inMemoryProposals.filter(p => p.status === "QUOTE PREPARED").length,
      "QUOTE SENT": inMemoryProposals.filter(p => p.status === "QUOTE SENT").length,
      APPROVED: inMemoryProposals.filter(p => p.status === "APPROVED").length,
      REJECTED: inMemoryProposals.filter(p => p.status === "REJECTED").length,
      "IN PROGRESS": inMemoryProposals.filter(p => p.status === "IN PROGRESS").length,
      COMPLETED: inMemoryProposals.filter(p => p.status === "COMPLETED").length,
    };

    return res.json({
      success: true,
      proposals: paginated,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      counts
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Admin: Single Proposal Details (GET /admin/proposals/:id)
router.get("/admin/proposals/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const proposal = inMemoryProposals.find(p => p.proposalId === id || p.id === id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found." });
    }
    return res.json({ success: true, proposal });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Admin: Change Status (PATCH /admin/proposals/:id/status)
router.patch("/admin/proposals/:id/status", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let { status, adminName = "Super Admin", details = "" } = req.body;

    if (status === "Pending Review" || status === "PENDING REVIEW") status = "NEW";
    if (status === "Under Review") status = "UNDER REVIEW";
    if (status === "Contacted") status = "CONTACTED";
    if (status === "Approved") status = "APPROVED";
    if (status === "Rejected") status = "REJECTED";
    if (status === "Completed") status = "COMPLETED";

    const validStatuses = [
      "NEW",
      "UNDER REVIEW",
      "CONTACTED",
      "QUOTE PREPARED",
      "QUOTE SENT",
      "APPROVED",
      "REJECTED",
      "IN PROGRESS",
      "COMPLETED"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed values: ${validStatuses.join(", ")}` });
    }

    const proposal = inMemoryProposals.find(p => p.proposalId === id || p.id === id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found." });
    }

    const prevStatus = proposal.status;
    proposal.status = status;
    proposal.updatedAt = new Date().toISOString();

    if (!proposal.auditLogs) proposal.auditLogs = [];
    proposal.auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-4)}`,
      action: `Status changed to ${status}`,
      performedBy: adminName,
      timestamp: new Date().toISOString(),
      previousStatus: prevStatus,
      newStatus: status,
      details: details || `Status changed from ${prevStatus} to ${status}`
    });

    writeProposals(inMemoryProposals);

    return res.json({
      success: true,
      message: `Proposal status updated to ${status}.`,
      proposal
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Admin: Assign Team Member (PATCH /admin/proposals/:id/assign)
router.patch("/admin/proposals/:id/assign", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assignedTo, adminName = "Super Admin" } = req.body;

    const proposal = inMemoryProposals.find(p => p.proposalId === id || p.id === id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found." });
    }

    proposal.assignedTo = assignedTo || null;
    proposal.updatedAt = new Date().toISOString();

    if (!proposal.auditLogs) proposal.auditLogs = [];
    proposal.auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-4)}`,
      action: "Assigned Team Member",
      performedBy: adminName,
      timestamp: new Date().toISOString(),
      details: assignedTo ? `Assigned to ${assignedTo}` : "Unassigned team member"
    });

    writeProposals(inMemoryProposals);

    return res.json({
      success: true,
      message: assignedTo ? `Assigned proposal to ${assignedTo}.` : "Unassigned proposal.",
      proposal
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Admin: Add Internal Note (POST /admin/proposals/:id/notes)
router.post("/admin/proposals/:id/notes", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const noteText = (req.body.note || req.body.text || "").trim();
    const { author = "Super Admin", authorRole = "Administrator" } = req.body;

    if (!noteText) {
      return res.status(400).json({ success: false, message: "Note content cannot be empty." });
    }

    const proposal = inMemoryProposals.find(p => p.proposalId === id || p.id === id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found." });
    }

    if (!proposal.internalNotes) proposal.internalNotes = [];

    const newNote = {
      id: `NOTE-${Date.now().toString().slice(-4)}`,
      author,
      authorRole,
      note: noteText,
      createdAt: new Date().toISOString()
    };

    proposal.internalNotes.unshift(newNote);
    proposal.updatedAt = new Date().toISOString();

    writeProposals(inMemoryProposals);

    return res.status(201).json({
      success: true,
      message: "Internal note added successfully.",
      note: newNote,
      proposal
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Export both the router and helper to synchronize if needed
export default router;
export { inMemoryProposals };
