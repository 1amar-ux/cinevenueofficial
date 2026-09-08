import { Router, Request, Response, NextFunction } from "express";
import { prisma, isDatabaseConnected } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { NotFoundError } from "../../shared/errors";

const router = Router();

// In-Memory store fallback for resilient mode when database is offline
const inMemoryProposals: any[] = [
  {
    id: "prop-001",
    projectId: "PROD-2026-001",
    senderId: "user-cinematographer-01",
    recipientId: "studio-exec-01",
    title: "Cinematography & Special Camera Package for Action Sequences",
    type: "EQUIPMENT_CREW",
    introduction: "Proposal for handling multi-cam aerial and high-speed anamorphic sequences.",
    projectDescription: "Pan-Indian Period Action Drama",
    deliverables: ["Arri Alexa 35 Package", "Cooke Anamorphic Lenses", "DIT Station", "Raw Dailies LUTs"],
    timeline: "8 Weeks Principal Photography",
    budget: 4500000,
    currency: "INR",
    paymentTerms: "30% Advance, 40% Halfway, 30% on Wrap",
    status: "UNDER_REVIEW",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const inMemoryApplications: any[] = [];

// 1. List Film Projects
router.get("/projects", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (isDatabaseConnected()) {
      const projects = await prisma.filmProject.findMany({
        include: {
          castingCalls: { where: { status: "OPEN" } }
        },
        orderBy: { createdAt: "desc" }
      });
      return res.json({ success: true, data: { projects } });
    }
    return res.json({ success: true, data: { projects: [] } });
  } catch (error) {
    return res.json({ success: true, data: { projects: [] } });
  }
});

// 3. Submit Casting / Job Application
router.post("/applications", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { castingCallId, projectId, coverLetter, portfolioUrl, ...extra } = req.body;
    const userId = req.user?.userId || "dev_user";

    if (isDatabaseConnected()) {
      try {
        const application = await prisma.jobApplication.create({
          data: {
            userId,
            castingCallId: castingCallId || null,
            projectId: projectId || null,
            coverLetter: coverLetter || "",
            portfolioUrl: portfolioUrl || null,
            status: "SUBMITTED"
          }
        });
        return res.status(201).json({ success: true, message: "Application submitted successfully", data: { application } });
      } catch (dbErr) {
        // Fallback to in-memory
      }
    }

    const application = {
      id: `app-${Date.now()}`,
      userId,
      castingCallId: castingCallId || null,
      projectId: projectId || null,
      coverLetter: coverLetter || "",
      portfolioUrl: portfolioUrl || null,
      status: "SUBMITTED",
      ...extra,
      createdAt: new Date().toISOString()
    };
    inMemoryApplications.unshift(application);
    return res.status(201).json({ success: true, message: "Application submitted successfully", data: { application } });
  } catch (error) {
    next(error);
  }
});

// 3b. Proposals CRUD
// Create Proposal
router.post("/proposals", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      projectId,
      title,
      type,
      proposalType,
      introduction,
      pitchSummary,
      projectDescription,
      details,
      scopeOfWork,
      deliverables,
      timeline,
      timelineWeeks,
      budget,
      proposedBudget,
      currency,
      paymentTerms,
      milestones,
      attachments,
      additionalNotes,
      expiryDate,
      ...extra
    } = req.body;

    const senderId = req.user?.userId || "dev_user";

    if (isDatabaseConnected()) {
      try {
        const proposal = await (prisma as any).proposal.create({
          data: {
            projectId: projectId || "general-prod",
            senderId,
            recipientId: null,
            title: title || "New Film Proposal",
            type: type || proposalType || "CREW_HIRE",
            introduction: introduction || pitchSummary || "",
            projectDescription: projectDescription || "",
            details: details || {},
            scopeOfWork: scopeOfWork || "",
            deliverables: deliverables || [],
            timeline: String(timeline || timelineWeeks || "4 weeks"),
            budget: budget || proposedBudget || 0,
            paymentTerms: paymentTerms || "Milestone Escrow",
            attachments: attachments || [],
            additionalNotes: additionalNotes || "",
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            status: "DRAFT"
          }
        });
        return res.status(201).json({ success: true, data: { proposal } });
      } catch (dbErr) {
        // Fallback to in-memory
      }
    }

    const proposal = {
      id: `prop-${Date.now()}`,
      projectId: projectId || "general-prod",
      senderId,
      recipientId: null,
      title: title || "New Film Proposal",
      type: type || proposalType || "CREW_HIRE",
      introduction: introduction || pitchSummary || "",
      deliverables: deliverables || [],
      timeline: String(timeline || timelineWeeks || "4 weeks"),
      budget: budget || proposedBudget || 0,
      currency: currency || "INR",
      paymentTerms: paymentTerms || "Milestone Escrow",
      milestones: milestones || [],
      status: "DRAFT",
      ...extra,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inMemoryProposals.unshift(proposal);
    return res.status(201).json({ success: true, data: { proposal } });
  } catch (error) {
    next(error);
  }
});

// Get Proposals (sent/received)
router.get("/proposals", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (isDatabaseConnected()) {
      try {
        const proposals = await (prisma as any).proposal.findMany({
          where: userId ? { OR: [{ senderId: userId }, { recipientId: userId }] } : undefined,
          orderBy: { createdAt: "desc" }
        });
        return res.json({ success: true, data: { proposals } });
      } catch (dbErr) {
        // Fallback
      }
    }

    const filtered = userId 
      ? inMemoryProposals.filter(p => p.senderId === userId || p.recipientId === userId || p.senderId === "user-cinematographer-01")
      : inMemoryProposals;
    return res.json({ success: true, data: { proposals: filtered.length ? filtered : inMemoryProposals } });
  } catch (error) {
    next(error);
  }
});

// Get single proposal
router.get("/proposals/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (isDatabaseConnected()) {
      try {
        const proposal = await (prisma as any).proposal.findUnique({ where: { id } });
        if (proposal) return res.json({ success: true, data: { proposal } });
      } catch (dbErr) {
        // Fallback
      }
    }

    const found = inMemoryProposals.find(p => p.id === id);
    if (!found) throw new NotFoundError("Proposal not found");
    return res.json({ success: true, data: { proposal: found } });
  } catch (error) {
    next(error);
  }
});

// Update proposal status (accept, reject, request-changes, withdraw)
router.patch("/proposals/:id/status", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (isDatabaseConnected()) {
      try {
        const updated = await (prisma as any).proposal.update({
          where: { id },
          data: { status, notes }
        });
        return res.json({ success: true, data: { proposal: updated } });
      } catch (dbErr) {
        // Fallback
      }
    }

    const index = inMemoryProposals.findIndex(p => p.id === id);
    if (index !== -1) {
      inMemoryProposals[index] = {
        ...inMemoryProposals[index],
        status,
        notes,
        updatedAt: new Date().toISOString()
      };
      return res.json({ success: true, data: { proposal: inMemoryProposals[index] } });
    }

    return res.json({
      success: true,
      data: {
        proposal: { id, status, notes, updatedAt: new Date().toISOString() }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Assign recipient (when creating/sending proposal)
router.patch("/proposals/:id/assign", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { recipientId } = req.body;

    if (isDatabaseConnected()) {
      try {
        const updated = await (prisma as any).proposal.update({
          where: { id },
          data: { recipientId }
        });
        return res.json({ success: true, data: { proposal: updated } });
      } catch (dbErr) {
        // Fallback
      }
    }

    const index = inMemoryProposals.findIndex(p => p.id === id);
    if (index !== -1) {
      inMemoryProposals[index] = {
        ...inMemoryProposals[index],
        recipientId,
        updatedAt: new Date().toISOString()
      };
      return res.json({ success: true, data: { proposal: inMemoryProposals[index] } });
    }

    return res.json({ success: true, data: { proposal: { id, recipientId } } });
  } catch (error) {
    next(error);
  }
});

export default router;
