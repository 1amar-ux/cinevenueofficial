/**
 * Centralized Pricing & Convenience Fee API Routes
 * Single authoritative endpoints for web, Android, checkout, and admin panel.
 */

import { Router, Request, Response, NextFunction } from "express";
import { centralizedPricingService } from "../../services/pricing.service";
import { authenticate, isValidAdminPasscode } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";
import { ValidationError, ForbiddenError } from "../../shared/errors";

const router = Router();

// Middleware: Verify Admin Access via JWT role or valid admin passcode
const verifyAdminAccess = (req: any, res: any, next: any) => {
  const passcode = req.headers["x-admin-passcode"] as string | undefined;
  if (isValidAdminPasscode(passcode)) {
    req.user = {
      userId: "superadmin_direct",
      email: process.env.SUPER_ADMIN_EMAIL || "superadmin@cinevenue.com",
      role: "SUPER_ADMIN",
      name: "Super Admin"
    };
    return next();
  }
  return authenticate(req, res, (err: any) => {
    if (err) return next(err);
    return authorize("SUPER_ADMIN", "ADMIN")(req, res, next);
  });
};

// ==========================================
// 1. PUBLIC / CHECKOUT ENDPOINTS
// ==========================================

/**
 * GET /api/v1/pricing/config
 * Fetches the active pricing configuration and slabs.
 * Consumed by CineVenue Website, Android App, and Checkout.
 */
router.get("/config", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await centralizedPricingService.getConfig();
    return res.json({
      success: true,
      config,
      data: config,
      version: config.version,
      updatedAt: config.updatedAt
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/pricing/calculate
 * Server-side authoritative pricing and convenience fee calculation.
 */
router.post("/calculate", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { itemType, tickets, ticketPrice, quantity, couponCode, cineCoinsToRedeem, musicianDonation, otherCharges, paymentMethod } = req.body;

    const breakdown = centralizedPricingService.calculatePricing({
      itemType: itemType === "EVENT" ? "EVENT" : "MOVIE",
      tickets,
      ticketPrice: ticketPrice !== undefined ? Number(ticketPrice) : undefined,
      quantity: quantity !== undefined ? Number(quantity) : undefined,
      couponCode,
      cineCoinsToRedeem: cineCoinsToRedeem !== undefined ? Number(cineCoinsToRedeem) : undefined,
      musicianDonation: Boolean(musicianDonation),
      otherCharges: otherCharges !== undefined ? Number(otherCharges) : undefined,
      paymentMethod
    });

    return res.json({
      success: true,
      data: breakdown,
      breakdown,
      feeSnapshot: breakdown.feeSnapshot
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/pricing/calculate
 * Query param support for quick pricing calculations
 */
router.get("/calculate", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemType = (req.query.itemType as string) === "EVENT" ? "EVENT" : "MOVIE";
    const ticketPrice = Number(req.query.ticketPrice || 150);
    const quantity = Number(req.query.quantity || 1);
    const couponCode = req.query.couponCode as string | undefined;

    const breakdown = centralizedPricingService.calculatePricing({
      itemType,
      ticketPrice,
      quantity,
      couponCode
    });

    return res.json({
      success: true,
      data: breakdown,
      breakdown
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/pricing/validate
 * Validates claimed client payment amount against authoritative calculation.
 * Prevents client-side / devtools price manipulation!
 */
router.post("/validate", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { claimedAmount, ...calculationParams } = req.body;
    if (claimedAmount === undefined || isNaN(Number(claimedAmount))) {
      throw new ValidationError("claimedAmount is required for validation");
    }

    const validation = centralizedPricingService.validateBookingPrice(
      Number(claimedAmount),
      calculationParams
    );

    return res.json({
      success: true,
      isValid: validation.isValid,
      claimedAmount: Number(claimedAmount),
      expectedAmount: validation.expectedAmount,
      difference: validation.difference,
      breakdown: validation.breakdown
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/pricing/booking-snapshot/:bookingId
 * Returns the immutable pricing snapshot of a previously created booking.
 */
router.get("/booking-snapshot/:bookingId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const snapshot = await centralizedPricingService.getBookingSnapshot(bookingId);

    if (!snapshot) {
      return res.status(404).json({
        success: false,
        error: { code: "SNAPSHOT_NOT_FOUND", message: `No pricing snapshot found for booking ${bookingId}` }
      });
    }

    return res.json({
      success: true,
      bookingId,
      snapshot
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. ADMIN ONLY MANAGEMENT ENDPOINTS
// ==========================================

/**
 * PUT /api/v1/pricing/config
 * Updates global convenience fee settings and/or slabs.
 */
router.put("/config", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorEmail = (req as any).user?.email || "Super Admin";
    const updated = await centralizedPricingService.updateConfig(req.body, actorEmail, {
      sourceIp: req.ip,
      userAgent: req.headers["user-agent"]
    });

    return res.json({
      success: true,
      message: "Centralized pricing configuration updated and published successfully across web, Android, and payment systems.",
      config: updated,
      version: updated.version,
      updatedAt: updated.updatedAt
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/pricing/slabs
 * Adds a new convenience fee price slab.
 */
router.post("/slabs", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorEmail = (req as any).user?.email || "Super Admin";
    const updated = await centralizedPricingService.addSlab(req.body, actorEmail);

    return res.status(201).json({
      success: true,
      message: "New convenience fee price slab created successfully.",
      config: updated
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/pricing/slabs/:id
 * Updates an existing convenience fee price slab.
 */
router.put("/slabs/:id", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const actorEmail = (req as any).user?.email || "Super Admin";
    const updated = await centralizedPricingService.updateSlab(id, req.body, actorEmail);

    return res.json({
      success: true,
      message: `Convenience fee slab ${id} updated successfully.`,
      config: updated
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/pricing/slabs/:id
 * Deletes a convenience fee price slab.
 */
router.delete("/slabs/:id", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const actorEmail = (req as any).user?.email || "Super Admin";
    const updated = await centralizedPricingService.deleteSlab(id, actorEmail);

    return res.json({
      success: true,
      message: `Convenience fee slab ${id} deleted successfully.`,
      config: updated
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/pricing/audit-logs
 * Retrieves audit logs of all pricing configuration changes.
 */
router.get("/audit-logs", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await centralizedPricingService.getAuditLogs();
    return res.json({
      success: true,
      logs
    });
  } catch (error) {
    next(error);
  }
});

export default router;
