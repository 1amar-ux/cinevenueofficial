import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";

const router = Router();

// Protect ALL admin routes with authentication & RBAC
router.use(authenticate, authorize("SUPER_ADMIN", "ADMIN"));

// 1. Master Financial Dashboard Metrics
router.get("/dashboard/metrics", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalBookings = await prisma.booking.count({ where: { status: "CONFIRMED" } });
    const totalUsers = await prisma.user.count();
    const totalTheatres = await prisma.theatre.count();
    const totalMovies = await prisma.movie.count();

    const bookings = await prisma.booking.findMany({
      where: { status: "CONFIRMED" },
      select: {
        totalAmount: true,
        ticketAmount: true,
        platformFee: true,
        convenienceFee: true,
        taxAmount: true
      }
    });

    let grossRevenue = 0;
    let platformRevenue = 0;
    for (const b of bookings) {
      grossRevenue += Number(b.totalAmount);
      platformRevenue += Number(b.platformFee) + Number(b.convenienceFee);
    }

    return res.json({
      success: true,
      data: {
        totalBookings,
        totalUsers,
        totalTheatres,
        totalMovies,
        grossRevenue,
        platformRevenue,
        theatrePayouts: grossRevenue - platformRevenue
      }
    });
  } catch (error) {
    next(error);
  }
});

// 2. Manage Users & Roles
router.get("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        mobile: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
});

// 3. Update User Role (Super Admin only)
router.patch("/users/:id/role", authorize("SUPER_ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true }
    });

    return res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// 4. Financial Audit Logs
router.get("/audit-logs", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.financialAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return res.json({
      success: true,
      data: { logs }
    });
  } catch (error) {
    next(error);
  }
});

// 5. System Platform Settings (Global ON/OFF, Maintenance Mode)
router.get("/settings", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.platformSetting.findMany();
    return res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/settings", authorize("SUPER_ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key, value, description } = req.body;
    const setting = await prisma.platformSetting.upsert({
      where: { key },
      update: { value: String(value), description },
      create: { key, value: String(value), description }
    });

    return res.json({
      success: true,
      message: `Setting '${key}' updated`,
      data: { setting }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
