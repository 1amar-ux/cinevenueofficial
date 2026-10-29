import { Router, Request, Response, NextFunction } from "express";
import { globalSyncService } from "../../services/globalSyncService";
import { realtimeHub } from "../../services/realtimeHub";
import { authenticate, isValidAdminPasscode } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";

export const syncPublicRouter = Router();
export const syncAdminRouter = Router();

// Middleware to verify admin permissions (Super Admin, Admin, or verified passcode)
const verifyAdminAccess = (req: Request, res: Response, next: NextFunction) => {
  const passcode = req.headers["x-admin-passcode"] as string | undefined;
  if (isValidAdminPasscode(passcode)) {
    (req as any).user = {
      userId: "superadmin_direct",
      email: process.env.SUPER_ADMIN_EMAIL || "superadmin@cinevenue.com",
      role: "SUPER_ADMIN",
      name: "Super Admin"
    };
    return next();
  }

  return authenticate(req, res, (err) => {
    if (err) return next(err);
    return authorize("SUPER_ADMIN", "ADMIN")(req, res, next);
  });
};

// ==========================================
// 1. PUBLIC SYNC ENDPOINTS (/api/v1/sync)
// ==========================================

// Full state (Public view by default, Admin view if authenticated)
syncPublicRouter.get("/state", (req: Request, res: Response) => {
  const passcode = req.headers["x-admin-passcode"] as string | undefined;
  const isAdmin = isValidAdminPasscode(passcode) || (req as any).user?.role === "SUPER_ADMIN" || (req as any).user?.role === "ADMIN";

  const state = isAdmin ? globalSyncService.getAdminState() : globalSyncService.getPublicState();
  return res.json({
    success: true,
    data: state
  });
});

// Incremental Delta Sync (poll fallback)
syncPublicRouter.get("/delta", (req: Request, res: Response) => {
  const { since, version } = req.query;
  const passcode = req.headers["x-admin-passcode"] as string | undefined;
  const isAdmin = isValidAdminPasscode(passcode) || (req as any).user?.role === "SUPER_ADMIN" || (req as any).user?.role === "ADMIN";

  const delta = globalSyncService.getDelta(
    since ? String(since) : undefined,
    version ? Number(version) : undefined,
    isAdmin
  );

  return res.json({
    success: true,
    data: delta
  });
});

// Server-Sent Events (SSE) Stream
syncPublicRouter.get("/events", (req: Request, res: Response) => {
  const passcode = req.headers["x-admin-passcode"] as string | undefined;
  const isAdmin = isValidAdminPasscode(passcode) || (req as any).user?.role === "SUPER_ADMIN" || (req as any).user?.role === "ADMIN";
  const role = isAdmin ? "ADMIN" : "CUSTOMER";
  const email = (req as any).user?.email || "guest@cinevenue.com";

  realtimeHub.registerSseClient(res, isAdmin, role, email);
});

// Telemetry Stats
syncPublicRouter.get("/stats", (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: realtimeHub.getStats()
  });
});

// ==========================================
// 2. ADMIN SYNC MUTATIONS (/api/v1/admin/sync)
// ==========================================
syncAdminRouter.use(verifyAdminAccess);

// Full admin state
syncAdminRouter.get("/state", (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: globalSyncService.getAdminState()
  });
});

// Update or Create Banner
syncAdminRouter.post("/banners", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientVersion, ...bannerData } = req.body;
    const actorEmail = (req as any).user?.email || "admin@cinevenue.com";

    const banner = await globalSyncService.updateBanner(bannerData, clientVersion, actorEmail);
    return res.json({
      success: true,
      message: "Banner saved and synchronized across all devices",
      data: { banner }
    });
  } catch (error: any) {
    if (error.message?.includes("Concurrency Conflict")) {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
});

// Toggle Banner Active
syncAdminRouter.post("/banners/:id/toggle", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const actorEmail = (req as any).user?.email || "admin@cinevenue.com";

    const banner = await globalSyncService.toggleBanner(id, actorEmail);
    return res.json({
      success: true,
      message: `Banner ${banner.active ? "activated" : "deactivated"} across all devices`,
      data: { banner }
    });
  } catch (error) {
    next(error);
  }
});

// Delete Banner
syncAdminRouter.delete("/banners/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const actorEmail = (req as any).user?.email || "admin@cinevenue.com";

    await globalSyncService.deleteBanner(id, actorEmail);
    return res.json({
      success: true,
      message: "Banner deleted and removed from all devices"
    });
  } catch (error) {
    next(error);
  }
});

// Update or Create Coupon
syncAdminRouter.post("/coupons", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientVersion, ...couponData } = req.body;
    const actorEmail = (req as any).user?.email || "admin@cinevenue.com";

    const coupon = await globalSyncService.updateCoupon(couponData, clientVersion, actorEmail);
    return res.json({
      success: true,
      message: "Coupon saved and synchronized",
      data: { coupon }
    });
  } catch (error: any) {
    if (error.message?.includes("Concurrency Conflict")) {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
});

// Toggle Coupon
syncAdminRouter.post("/coupons/:code/toggle", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const actorEmail = (req as any).user?.email || "admin@cinevenue.com";

    const coupon = await globalSyncService.toggleCoupon(code, actorEmail);
    return res.json({
      success: true,
      message: `Coupon ${coupon.active ? "enabled" : "disabled"}`,
      data: { coupon }
    });
  } catch (error) {
    next(error);
  }
});

// Delete Coupon
syncAdminRouter.delete("/coupons/:code", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const actorEmail = (req as any).user?.email || "admin@cinevenue.com";

    await globalSyncService.deleteCoupon(code, actorEmail);
    return res.json({
      success: true,
      message: "Coupon deleted successfully"
    });
  } catch (error) {
    next(error);
  }
});

// Moderate Review
syncAdminRouter.post("/reviews/:id/status", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const actorEmail = (req as any).user?.email || "admin@cinevenue.com";

    const review = await globalSyncService.moderateReview(id, status, actorEmail);
    return res.json({
      success: true,
      message: `Review status changed to ${status}`,
      data: { review }
    });
  } catch (error) {
    next(error);
  }
});

// Delete Review
syncAdminRouter.delete("/reviews/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const actorEmail = (req as any).user?.email || "admin@cinevenue.com";

    await globalSyncService.deleteReview(id, actorEmail);
    return res.json({
      success: true,
      message: "Review removed"
    });
  } catch (error) {
    next(error);
  }
});

// Update Support Ticket
syncAdminRouter.post("/support-tickets/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const actorEmail = (req as any).user?.email || "admin@cinevenue.com";

    const ticket = await globalSyncService.updateSupportTicket(id, req.body, actorEmail);
    return res.json({
      success: true,
      message: "Ticket updated and synchronized",
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
});

// Update Cities
syncAdminRouter.post("/cities", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cities } = req.body;
    const actorEmail = (req as any).user?.email || "admin@cinevenue.com";

    const updatedCities = await globalSyncService.updateCities(cities, actorEmail);
    return res.json({
      success: true,
      message: "Regional cities list updated across all sessions",
      data: { cities: updatedCities }
    });
  } catch (error) {
    next(error);
  }
});

// Update Spotlight Movie
syncAdminRouter.post("/spotlight", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorEmail = (req as any).user?.email || "admin@cinevenue.com";
    const spotlight = await globalSyncService.updateSpotlight(req.body, actorEmail);

    return res.json({
      success: true,
      message: "Editor's Spotlight movie updated across all sessions",
      data: { spotlight }
    });
  } catch (error) {
    next(error);
  }
});

// Update Feature Toggles
syncAdminRouter.post("/feature-toggles", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorEmail = (req as any).user?.email || "admin@cinevenue.com";
    const toggles = await globalSyncService.updateFeatureToggles(req.body, actorEmail);

    return res.json({
      success: true,
      message: "Feature toggles updated and synchronized across all sessions",
      data: { featureToggles: toggles }
    });
  } catch (error) {
    next(error);
  }
});

// Dispatch Notification Broadcast
syncAdminRouter.post("/broadcast", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorEmail = (req as any).user?.email || "admin@cinevenue.com";
    const broadcast = await globalSyncService.dispatchBroadcast(req.body, actorEmail);

    return res.json({
      success: true,
      message: "Campaign broadcasted to all active device sessions",
      data: { broadcast }
    });
  } catch (error) {
    next(error);
  }
});
