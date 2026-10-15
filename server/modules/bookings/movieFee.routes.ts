import { Router, Request, Response, NextFunction } from "express";
import { movieFeeService } from "./movieFee.service";
import { bookingService } from "./booking.service";
import { authenticate } from "../../middleware/auth";
import { checkMovieBookingMaintenance } from "../../middleware/maintenance";
import { ForbiddenError, ValidationError } from "../../shared/errors";

const router = Router();

// Middleware: verify admin access
const verifyAdminAccess = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" }
    });
  }
  const role = (user.role || "").toUpperCase();
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "Only authorized administrators can modify movie fee configurations" }
    });
  }
  next();
};

// ==========================================
// 1. PUBLIC / CUSTOMER CHECKOUT ENDPOINTS
// ==========================================

// GET /api/v1/movie-fees: Fetch active configurations and global settings
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const configs = await movieFeeService.getAllConfigs();
    const globalSettings = movieFeeService.getGlobalSettings();

    return res.json({
      success: true,
      globalSettings,
      configs: configs.filter((c) => c.enabled)
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/movie-fees/calculate: Calculate authoritative movie ticket convenience fee
router.post("/calculate", checkMovieBookingMaintenance, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tickets, showId, seatIds, couponCode, musicianDonation } = req.body;

    if (showId && Array.isArray(seatIds) && seatIds.length > 0) {
      const breakdown = await bookingService.calculateBookingPrice(showId, seatIds, couponCode, musicianDonation);
      return res.json({
        success: true,
        data: breakdown,
        breakdown
      });
    }

    if (Array.isArray(tickets) && tickets.length > 0) {
      const formattedTickets = tickets.map((t: any) => ({
        price: Number(typeof t === "number" ? t : t.price || 0),
        category: (typeof t === "object" ? t.category : undefined) || "STANDARD"
      }));

      const breakdown = await movieFeeService.calculateMovieBookingFees(formattedTickets, {
        couponCode,
        musicianDonation
      });

      return res.json({
        success: true,
        data: breakdown,
        breakdown
      });
    }

    return res.status(400).json({
      success: false,
      error: { code: "INVALID_INPUT", message: "Please provide showId & seatIds or tickets array" }
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. SUPER ADMIN MANAGEMENT ENDPOINTS
// ==========================================

// GET /api/v1/movie-fees/admin/all: Fetch all configurations, global settings, & audit logs
router.get("/admin/all", authenticate, verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const configs = await movieFeeService.getAllConfigs();
    const globalSettings = movieFeeService.getGlobalSettings();
    const auditLogs = await movieFeeService.getAuditLogs();

    return res.json({
      success: true,
      globalSettings,
      configs,
      auditLogs
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/movie-fees/admin: Create a new ticket price & base charge configuration
router.post("/admin", authenticate, verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ticketPrice, baseCharge, category, gstRate, feeApplication, enabled, description } = req.body;
    const actorEmail = req.user?.email || "Super Admin";

    const created = await movieFeeService.createConfig(
      {
        ticketPrice: Number(ticketPrice),
        baseCharge: Number(baseCharge),
        category,
        gstRate: gstRate !== undefined ? Number(gstRate) : undefined,
        feeApplication,
        enabled: enabled !== undefined ? Boolean(enabled) : true,
        description
      },
      actorEmail
    );

    return res.status(201).json({
      success: true,
      message: `Convenience fee tier for ₹${created.ticketPrice} created successfully.`,
      config: created
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/movie-fees/admin/:id: Update an existing configuration
router.put("/admin/:id", authenticate, verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const actorEmail = req.user?.email || "Super Admin";

    const updated = await movieFeeService.updateConfig(id, req.body, actorEmail);

    return res.json({
      success: true,
      message: `Convenience fee tier ${id} updated successfully.`,
      config: updated
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/movie-fees/admin/:id: Delete a configuration
router.delete("/admin/:id", authenticate, verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const actorEmail = req.user?.email || "Super Admin";

    await movieFeeService.deleteConfig(id, actorEmail);

    return res.json({
      success: true,
      message: `Fee configuration ${id} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/movie-fees/admin/settings: Update global enable/disable switch and GST rate
router.patch("/admin/settings", authenticate, verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorEmail = req.user?.email || "Super Admin";
    const updated = await movieFeeService.updateGlobalSettings(req.body, actorEmail);

    return res.json({
      success: true,
      message: "Global movie convenience fee settings updated successfully.",
      settings: updated
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/movie-fees/admin/audit-logs: Fetch audit logs
router.get("/admin/audit-logs", authenticate, verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await movieFeeService.getAuditLogs();
    return res.json({
      success: true,
      logs
    });
  } catch (error) {
    next(error);
  }
});

export default router;
