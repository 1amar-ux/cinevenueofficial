import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { NotFoundError } from "../../shared/errors";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";

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
    const { name, address, city, state, phone, status } = req.body;

    const theatre = await prisma.theatre.create({
      data: {
        name,
        address,
        city,
        state,
        phone: phone || null,
        status: status || "ACTIVE"
      }
    });

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
router.post("/:theatreId/screens", authenticate, authorize("SUPER_ADMIN", "ADMIN", "THEATRE_ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
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

// 5. Get Bank Accounts for Theatre (Authorized)
router.get("/:theatreId/bank-accounts", authenticate, authorize("SUPER_ADMIN", "ADMIN", "THEATRE_ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { theatreId } = req.params;
    const accounts = await prisma.theatreBankAccount.findMany({
      where: { theatreId, isActive: true }
    });

    return res.json({
      success: true,
      data: { accounts }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
