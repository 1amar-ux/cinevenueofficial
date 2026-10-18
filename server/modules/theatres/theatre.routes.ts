import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { NotFoundError } from "../../shared/errors";
import { authenticate } from "../../middleware/auth";
import { authorize, authorizeTheatre, preventManagerFinancials } from "../../middleware/authorize";
import { theatreLayoutService } from "./theatreLayout.service";

const router = Router();

// 1. Get All Theatres
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city, status } = req.query;

    const theatres = await prisma.theatre.findMany({
      where: {
        ...(city ? { city: String(city) } : {}),
        ...(status ? { status: status as any } : {})
      },
      include: {
        screens: {
          select: { id: true, name: true, capacity: true }
        }
      }
    });

    return res.json({
      success: true,
      count: theatres.length,
      data: { theatres }
    });
  } catch (error) {
    next(error);
  }
});

// 2. Get Theatre by ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const theatre = await prisma.theatre.findUnique({
      where: { id },
      include: {
        screens: {
          include: { seats: true }
        },
        shows: {
          where: { startTime: { gte: new Date() } },
          include: { movie: true }
        }
      }
    });

    if (!theatre) {
      throw new NotFoundError("Theatre", id);
    }

    return res.json({
      success: true,
      data: { theatre }
    });
  } catch (error) {
    next(error);
  }
});

// 3. Admin: Create Theatre
router.post("/", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, address, city, state, phone, status, totalScreens } = req.body;

    const theatre = await prisma.theatre.create({
      data: {
        name,
        address: address || `${name}, ${city || "Hyderabad"}`,
        city: city || "Hyderabad",
        state: state || "Telangana",
        phone: phone || null,
        status: status || "ACTIVE"
      }
    });

    // Create default screens if requested
    const numScreens = Math.max(1, Number(totalScreens) || 3);
    for (let i = 1; i <= numScreens; i++) {
      try {
        await prisma.screen.create({
          data: {
            theatreId: theatre.id,
            name: `Screen ${i}`,
            capacity: 150
          }
        });
      } catch {}
    }

    return res.status(201).json({
      success: true,
      message: "Theatre created successfully",
      data: { theatre }
    });
  } catch (error) {
    next(error);
  }
});

// 4. Create Screen for Theatre
router.post("/:theatreId/screens", authenticate, authorize("SUPER_ADMIN", "ADMIN", "THEATRE_ADMIN"), authorizeTheatre("theatreId"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { theatreId } = req.params;
    const { name, capacity } = req.body;

    const screen = await prisma.screen.create({
      data: {
        theatreId,
        name,
        capacity: Number(capacity) || 100
      }
    });

    return res.status(201).json({
      success: true,
      message: "Screen created successfully",
      data: { screen }
    });
  } catch (error) {
    next(error);
  }
});

// 4A. List Screens for Authorized Theatre
router.get("/:theatreId/screens", authenticate, authorize("SUPER_ADMIN", "ADMIN", "THEATRE_ADMIN", "THEATRE_MANAGER"), authorizeTheatre("theatreId"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { theatreId } = req.params;
    const result = await theatreLayoutService.getTheatreScreens(theatreId);
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 4B. Get Screen Original Seat Layout
router.get("/:theatreId/screens/:screenId/layout", authenticate, authorize("SUPER_ADMIN", "ADMIN", "THEATRE_ADMIN", "THEATRE_MANAGER"), authorizeTheatre("theatreId"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { theatreId, screenId } = req.params;
    const layout = await theatreLayoutService.getScreenSeatLayout(theatreId, screenId);
    return res.json({
      success: true,
      data: { layout }
    });
  } catch (error) {
    next(error);
  }
});

// 4C. Synchronize / Import Seat Layout from POS
router.post("/:theatreId/screens/:screenId/sync-layout", authenticate, authorize("SUPER_ADMIN", "ADMIN", "THEATRE_ADMIN"), authorizeTheatre("theatreId"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { theatreId, screenId } = req.params;
    const result = await theatreLayoutService.syncScreenLayoutFromPos(theatreId, screenId);
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 4D. List Shows for Theatre on Selected Date
router.get("/:theatreId/shows", authenticate, authorize("SUPER_ADMIN", "ADMIN", "THEATRE_ADMIN", "THEATRE_MANAGER"), authorizeTheatre("theatreId"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { theatreId } = req.params;
    const { date, screenId } = req.query;
    const shows = await theatreLayoutService.getTheatreShows(
      theatreId,
      date ? String(date) : undefined,
      screenId ? String(screenId) : undefined
    );
    return res.json({
      success: true,
      count: shows.length,
      data: { shows }
    });
  } catch (error) {
    next(error);
  }
});

// 4E. Get Authoritative Show-wise Seat Status & Realtime Occupancy Heatmap
router.get("/:theatreId/shows/:showId/seat-status", authenticate, authorize("SUPER_ADMIN", "ADMIN", "THEATRE_ADMIN", "THEATRE_MANAGER"), authorizeTheatre("theatreId"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { theatreId, showId } = req.params;
    const result = await theatreLayoutService.getShowSeatStatus(theatreId, showId);
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 4F. Refresh Live Seat Availability
router.post("/:theatreId/shows/:showId/refresh-availability", authenticate, authorize("SUPER_ADMIN", "ADMIN", "THEATRE_ADMIN", "THEATRE_MANAGER"), authorizeTheatre("theatreId"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { theatreId, showId } = req.params;
    const result = await theatreLayoutService.getShowSeatStatus(theatreId, showId);
    return res.json({
      success: true,
      message: "Seat availability refreshed against authoritative inventory.",
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 5. Get Bank Accounts for Theatre (Authorized Owner only - Managers strictly forbidden)
router.get("/:theatreId/bank-accounts", authenticate, authorize("SUPER_ADMIN", "ADMIN", "THEATRE_ADMIN"), authorizeTheatre("theatreId"), preventManagerFinancials(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { theatreId } = req.params;
    const accounts = await prisma.theatreBankAccount.findMany({
      where: { theatreId, isActive: true },
      select: {
        id: true,
        theatreId: true,
        accountHolderName: true,
        bankName: true,
        maskedAccountNumber: true,
        ifscCode: true,
        accountType: true,
        branchName: true,
        branchAddress: true,
        beneficiaryName: true,
        pan: true,
        gstin: true,
        upiId: true,
        verificationStatus: true,
        isPrimary: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.json({
      success: true,
      data: { accounts }
    });
  } catch (error) {
    next(error);
  }
});

// 6. Admin: Update Theatre
router.put("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    let targetId = id;
    let existing = await prisma.theatre.findUnique({ where: { id } });
    if (!existing) {
      existing = await prisma.theatre.findFirst({
        where: {
          OR: [
            { id: `th_${id}` },
            { name: req.body?.name || id }
          ]
        }
      });
      if (existing) targetId = existing.id;
    }

    const theatre = await prisma.theatre.update({
      where: { id: targetId },
      data: req.body
    });

    return res.json({
      success: true,
      message: "Theatre updated successfully",
      data: { theatre }
    });
  } catch (error) {
    next(error);
  }
});

// 7. Admin: Delete Theatre
router.delete("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    let targetId = id;
    let existing = await prisma.theatre.findUnique({ where: { id } });
    if (!existing) {
      existing = await prisma.theatre.findFirst({
        where: {
          OR: [
            { id: `th_${id}` },
            { name: id }
          ]
        }
      });
      if (existing) targetId = existing.id;
    }

    await prisma.theatre.delete({ where: { id: targetId } }).catch(async () => {
      await prisma.theatre.update({ where: { id: targetId }, data: { status: "INACTIVE" } });
    });

    return res.json({
      success: true,
      message: "Theatre removed successfully"
    });
  } catch (error) {
    next(error);
  }
});

export default router;
