import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { NotFoundError } from "../../shared/errors";

const router = Router();

// 1. List Film Projects
router.get("/projects", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.filmProject.findMany({
      include: {
        castingCalls: { where: { status: "OPEN" } }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({
      success: true,
      data: { projects }
    });
  } catch (error) {
    next(error);
  }
});

// 2. List Casting Calls
router.get("/casting-calls", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.query;
    const calls = await prisma.castingCall.findMany({
      where: {
        status: "OPEN",
        ...(category ? { category: String(category) } : {})
      },
      include: {
        project: { select: { id: true, title: true, genre: true } }
      }
    });

    return res.json({
      success: true,
      data: { castingCalls: calls }
    });
  } catch (error) {
    next(error);
  }
});

// 3. Submit Casting / Job Application
router.post("/applications", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { castingCallId, projectId, coverLetter, portfolioUrl } = req.body;

    const application = await prisma.jobApplication.create({
      data: {
        userId: req.user!.userId,
        castingCallId: castingCallId || null,
        projectId: projectId || null,
        coverLetter: coverLetter || "",
        portfolioUrl: portfolioUrl || null,
        status: "SUBMITTED"
      }
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: { application }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
