import { Router, Request, Response, NextFunction } from "express";
import { advertisingService } from "./advertising.service";
import { BannerPlacementId, LiveCampaignStatus } from "./advertising.types";
import { authenticate, optionalAuthenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";
import { ValidationError, NotFoundError } from "../../shared/errors";

// ==========================================
// 1. PUBLIC & ADVERTISER ROUTER (/api/v1/advertising)
// ==========================================
export const advertisingPublicRouter = Router();

// Placements List
advertisingPublicRouter.get("/placements", (req: Request, res: Response) => {
  const placements = advertisingService.getPlacements();
  return res.json({ success: true, data: { placements } });
});

// Slot Availability Checker
advertisingPublicRouter.get("/availability", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { placementId, startAtUtc, durationHours } = req.query;
    if (!placementId || !startAtUtc) {
      throw new ValidationError("placementId and startAtUtc are required parameters");
    }

    const duration = durationHours ? Number(durationHours) : 24;
    const availability = advertisingService.checkAvailability(
      placementId as BannerPlacementId,
      String(startAtUtc),
      duration
    );

    return res.json({ success: true, data: { availability } });
  } catch (error) {
    next(error);
  }
});

// Price Quote Calculator
advertisingPublicRouter.post("/quote", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { placementId, durationHours = 24, discountCode } = req.body;
    if (!placementId) {
      throw new ValidationError("placementId is required");
    }

    const quote = advertisingService.calculateQuote(
      placementId as BannerPlacementId,
      Number(durationHours),
      discountCode
    );

    return res.json({ success: true, data: { quote } });
  } catch (error) {
    next(error);
  }
});

// Submit Campaign
advertisingPublicRouter.post("/campaigns", optionalAuthenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const campaign = advertisingService.createCampaign({
      ...req.body,
      userId
    });

    return res.status(201).json({
      success: true,
      message: "Campaign created successfully. Proceed to payment verification.",
      data: { campaign }
    });
  } catch (error) {
    next(error);
  }
});

// Get My Campaigns
advertisingPublicRouter.get("/my-campaigns", optionalAuthenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = (req.query.email as string) || req.user?.email;
    if (!email) {
      return res.json({ success: true, data: { campaigns: [] } });
    }

    const campaigns = advertisingService.getAllCampaigns({ email });
    return res.json({ success: true, count: campaigns.length, data: { campaigns } });
  } catch (error) {
    next(error);
  }
});

// Get Campaign By ID
advertisingPublicRouter.get("/campaigns/:id", (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = advertisingService.getCampaignById(req.params.id);
    if (!campaign) throw new NotFoundError("LiveBannerCampaign", req.params.id);

    return res.json({ success: true, data: { campaign } });
  } catch (error) {
    next(error);
  }
});

// Create Payment Order (Cashfree)
advertisingPublicRouter.post("/campaigns/:id/payment", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderData = await advertisingService.createCashfreePaymentOrder(req.params.id);
    return res.json({ success: true, data: orderData });
  } catch (error) {
    next(error);
  }
});

// Create Cashfree Payment Order
advertisingPublicRouter.post("/campaigns/:id/cashfree-payment", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderData = await advertisingService.createCashfreePaymentOrder(req.params.id);
    return res.json({ success: true, data: orderData });
  } catch (error) {
    next(error);
  }
});

// Verify Cashfree Payment
advertisingPublicRouter.post("/payment/verify", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { campaignId, orderId } = req.body;
    if (!campaignId || !orderId) {
      throw new ValidationError("Missing required parameters: campaignId and orderId are required.");
    }

    const campaign = await advertisingService.verifyCashfreePayment(campaignId, orderId);

    return res.json({
      success: true,
      message: "Payment verified successfully via Cashfree. Campaign queued for admin approval.",
      data: { campaign }
    });
  } catch (error) {
    next(error);
  }
});

// Verify Cashfree Payment
advertisingPublicRouter.post("/payment/cashfree/verify", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { campaignId, orderId } = req.body;
    if (!campaignId || !orderId) {
      throw new ValidationError("Missing campaignId or orderId for Cashfree verification");
    }

    const campaign = await advertisingService.verifyCashfreePayment(campaignId, orderId);

    return res.json({
      success: true,
      message: "Cashfree payment verified successfully. Campaign queued for admin approval.",
      data: { campaign }
    });
  } catch (error) {
    next(error);
  }
});

// Frontend Live Banner Display Route
advertisingPublicRouter.get("/live/:placementId", (req: Request, res: Response) => {
  const result = advertisingService.getLiveBannerForPlacement(req.params.placementId as BannerPlacementId);
  return res.json({ success: true, data: result });
});

// Track Impression / Click
advertisingPublicRouter.post("/track", (req: Request, res: Response) => {
  const { campaignId, type } = req.body;
  if (campaignId && (type === "impression" || type === "click")) {
    advertisingService.trackEvent(campaignId, type);
  }
  return res.json({ success: true });
});

// ==========================================
// 2. ADMIN ROUTER (/api/v1/admin/advertising)
// ==========================================
export const adminAdvertisingRouter = Router();

// Require admin passcode or superadmin auth for admin endpoints
adminAdvertisingRouter.use((req: Request, res: Response, next: NextFunction) => {
  const passcode = req.headers["x-admin-passcode"] || req.query.passcode;
  if (passcode === "8888" || passcode === "admin8888") {
    return next();
  }
  return authenticate(req, res, () => {
    authorize("SUPER_ADMIN", "ADMIN")(req, res, next);
  });
});

// Admin Stats
adminAdvertisingRouter.get("/stats", (req: Request, res: Response) => {
  const stats = advertisingService.getAdminStats();
  return res.json({ success: true, data: { stats } });
});

// Admin Campaign List
adminAdvertisingRouter.get("/campaigns", (req: Request, res: Response) => {
  const { status, placementId, search } = req.query;
  const campaigns = advertisingService.getAllCampaigns({
    status: status as LiveCampaignStatus,
    placementId: placementId as BannerPlacementId,
    search: search as string
  });
  return res.json({ success: true, count: campaigns.length, data: { campaigns } });
});

// Approve Campaign
adminAdvertisingRouter.put("/campaigns/:id/approve", (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviewer = req.user?.name || "Superadmin";
    const campaign = advertisingService.approveCampaign(req.params.id, reviewer);
    return res.json({
      success: true,
      message: `Campaign ${campaign.campaignNumber} approved successfully (${campaign.status}).`,
      data: { campaign }
    });
  } catch (error) {
    next(error);
  }
});

// Reject Campaign
adminAdvertisingRouter.put("/campaigns/:id/reject", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) {
      throw new ValidationError("Rejection reason is required");
    }
    const reviewer = req.user?.name || "Superadmin";
    const campaign = advertisingService.rejectCampaign(req.params.id, reason.trim(), reviewer);
    return res.json({
      success: true,
      message: `Campaign ${campaign.campaignNumber} rejected.`,
      data: { campaign }
    });
  } catch (error) {
    next(error);
  }
});

// Pause Campaign
adminAdvertisingRouter.put("/campaigns/:id/pause", (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = advertisingService.pauseCampaign(req.params.id);
    return res.json({
      success: true,
      message: `Campaign ${campaign.campaignNumber} paused.`,
      data: { campaign }
    });
  } catch (error) {
    next(error);
  }
});

// Resume Campaign
adminAdvertisingRouter.put("/campaigns/:id/resume", (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = advertisingService.resumeCampaign(req.params.id);
    return res.json({
      success: true,
      message: `Campaign ${campaign.campaignNumber} resumed (${campaign.status}).`,
      data: { campaign }
    });
  } catch (error) {
    next(error);
  }
});

// Calendar Timeline
adminAdvertisingRouter.get("/calendar", (req: Request, res: Response) => {
  const slots = advertisingService.getCalendarSlots();
  return res.json({ success: true, count: slots.length, data: { slots } });
});

// Pricing & Placement Settings
adminAdvertisingRouter.get("/pricing", (req: Request, res: Response) => {
  const placements = advertisingService.getPlacements();
  return res.json({ success: true, data: { placements } });
});

adminAdvertisingRouter.put("/pricing/:id", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { basePrice24hINR, isActive } = req.body;
    const placement = advertisingService.updatePlacementPricing(
      req.params.id as BannerPlacementId,
      basePrice24hINR,
      isActive
    );
    return res.json({ success: true, data: { placement } });
  } catch (error) {
    next(error);
  }
});

// Reports Export
adminAdvertisingRouter.get("/reports", (req: Request, res: Response) => {
  const campaigns = advertisingService.getAllCampaigns();
  const reportRows = campaigns.map(c => ({
    campaignNumber: c.campaignNumber,
    businessName: c.businessName,
    adTitle: c.adTitle,
    placementId: c.placementId,
    startAtUtc: c.startAtUtc,
    endAtUtc: c.endAtUtc,
    durationHours: c.durationHours,
    basePriceINR: c.basePriceINR,
    gstAmountINR: c.gstAmountINR,
    finalAmountINR: c.finalAmountINR,
    paymentStatus: c.paymentStatus,
    status: c.status,
    impressions: c.impressions,
    clicks: c.clicks,
    ctr: `${c.ctr}%`,
    destinationUrl: c.destinationUrl,
    contactEmail: c.contactEmail
  }));

  return res.json({
    success: true,
    generatedAt: new Date().toISOString(),
    count: reportRows.length,
    data: { report: reportRows }
  });
});

export default advertisingPublicRouter;
