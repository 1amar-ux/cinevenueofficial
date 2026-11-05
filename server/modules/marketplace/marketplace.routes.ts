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

// 4. Create Film Project
router.post("/projects", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, genre, synopsis, budget, director, producer, status } = req.body;
    const project = await prisma.filmProject.create({
      data: {
        title: title || "Untitled Project",
        genre: genre || "Drama",
        synopsis: synopsis || "",
        budget: budget ? Number(budget) : null,
        director: director || null,
        producer: producer || null,
        status: status || "PRE_PRODUCTION"
      }
    });
    return res.status(201).json({ success: true, message: "Film project created successfully", data: { project } });
  } catch (error) {
    next(error);
  }
});

// 5. Update Film Project
router.put("/projects/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const project = await prisma.filmProject.update({
      where: { id },
      data: req.body
    });
    return res.json({ success: true, message: "Film project updated successfully", data: { project } });
  } catch (error) {
    next(error);
  }
});

// 6. Delete / Archive Film Project
router.delete("/projects/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.filmProject.delete({ where: { id } }).catch(async () => {
      await prisma.filmProject.update({ where: { id }, data: { status: "ARCHIVED" } });
    });
    return res.json({ success: true, message: "Film project removed successfully" });
  } catch (error) {
    next(error);
  }
});

// 7. List Casting Calls & Crew Jobs
router.get("/casting-calls", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, projectId, status } = req.query;
    const castingCalls = await prisma.castingCall.findMany({
      where: {
        ...(category ? { category: String(category) } : {}),
        ...(projectId ? { projectId: String(projectId) } : {}),
        status: status ? String(status) : "OPEN"
      },
      include: {
        project: { select: { id: true, title: true, director: true, producer: true, genre: true } },
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    return res.json({ success: true, data: { castingCalls } });
  } catch (error) {
    next(error);
  }
});

// 8. Create Casting Call / Crew Job
router.post("/casting-calls", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, roleName, category, description, ageRange, gender, deadline } = req.body;
    let targetProjectId = projectId;
    if (!targetProjectId) {
      const firstProject = await prisma.filmProject.findFirst();
      if (firstProject) {
        targetProjectId = firstProject.id;
      } else {
        const newProj = await prisma.filmProject.create({
          data: { title: "CineVenue Productions", genre: "Feature Film", synopsis: "Production listing" }
        });
        targetProjectId = newProj.id;
      }
    }
    const castingCall = await prisma.castingCall.create({
      data: {
        projectId: targetProjectId,
        roleName: roleName || "Actor",
        category: category || "ACTOR",
        description: description || "",
        ageRange: ageRange || null,
        gender: gender || null,
        deadline: deadline ? new Date(deadline) : null,
        status: "OPEN"
      }
    });
    return res.status(201).json({ success: true, message: "Casting call created successfully", data: { castingCall } });
  } catch (error) {
    next(error);
  }
});

// 9. Update Casting Call
router.put("/casting-calls/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const castingCall = await prisma.castingCall.update({
      where: { id },
      data: req.body
    });
    return res.json({ success: true, message: "Casting call updated successfully", data: { castingCall } });
  } catch (error) {
    next(error);
  }
});

// 10. Delete / Close Casting Call
router.delete("/casting-calls/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.castingCall.delete({ where: { id } }).catch(async () => {
      await prisma.castingCall.update({ where: { id }, data: { status: "CLOSED" } });
    });
    return res.json({ success: true, message: "Casting call removed successfully" });
  } catch (error) {
    next(error);
  }
});

// 11. Get Current User's Submitted Auditions / Applications
router.get("/applications/my", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const applications = await prisma.jobApplication.findMany({
      where: { userId },
      include: {
        castingCall: { include: { project: true } },
        project: true
      },
      orderBy: { createdAt: "desc" }
    });
    return res.json({ success: true, data: { applications } });
  } catch (error) {
    next(error);
  }
});

// 12. Admin / Production Team List Applications
router.get("/admin/applications", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, castingCallId, projectId } = req.query;
    const applications = await prisma.jobApplication.findMany({
      where: {
        ...(status ? { status: String(status) } : {}),
        ...(castingCallId ? { castingCallId: String(castingCallId) } : {}),
        ...(projectId ? { projectId: String(projectId) } : {})
      },
      include: {
        user: { select: { id: true, name: true, email: true, mobile: true } },
        castingCall: { include: { project: true } },
        project: true
      },
      orderBy: { createdAt: "desc" },
      take: 200
    });
    return res.json({ success: true, data: { applications } });
  } catch (error) {
    next(error);
  }
});

// 13. Update Application Status (Submitted -> Under Review -> Shortlisted -> Selected -> Rejected)
router.patch("/applications/:id/status", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const application = await prisma.jobApplication.update({
      where: { id },
      data: { status }
    });
    return res.json({ success: true, message: `Application status updated to ${status}`, data: { application } });
  } catch (error) {
    next(error);
  }
});

export default router;
