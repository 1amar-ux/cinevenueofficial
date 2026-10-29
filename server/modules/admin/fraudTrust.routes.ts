import { Router, Request, Response, NextFunction } from "express";
import { fraudTrustService, InvestigationStatus, ReportStatus } from "../../services/fraudTrustService";
import { authenticate, isValidAdminPasscode } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";
import { logger } from "../../shared/logger";

export const fraudTrustRouter = Router();

// Middleware ensuring only Super Admin or authorized Admin staff can access Fraud & Trust Centre
const verifyFraudTrustAccess = (req: Request, res: Response, next: NextFunction) => {
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
    const role = req.user?.role;
    if (role === "SUPER_ADMIN" || role === "ADMIN") {
      return next();
    }
    return res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Access to Fraud & Trust Centre is restricted to CineVenue Administrators."
      }
    });
  });
};

/**
 * GET /api/v1/admin/fraud-trust/metrics
 */
fraudTrustRouter.get("/metrics", verifyFraudTrustAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const range = req.query.range as string | undefined;
    const metrics = await fraudTrustService.getMetrics(range);
    return res.json({
      success: true,
      data: metrics
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/fraud-trust/alerts
 */
fraudTrustRouter.get("/alerts", verifyFraudTrustAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await fraudTrustService.getAlerts({
      category: req.query.category as string,
      severity: req.query.severity as string,
      status: req.query.status as string,
      search: req.query.search as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      entityType: req.query.entityType as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any
    });

    return res.json({
      success: true,
      data: result.alerts,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/fraud-trust/alerts/:id
 */
fraudTrustRouter.get("/alerts/:id", verifyFraudTrustAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alert = await fraudTrustService.getAlertById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: `Fraud alert ${req.params.id} not found.` }
      });
    }
    return res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/admin/fraud-trust/alerts/:id/status
 */
fraudTrustRouter.patch("/alerts/:id/status", verifyFraudTrustAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, reason } = req.body;
    const validStatuses: InvestigationStatus[] = ["NEW", "UNDER_REVIEW", "ESCALATED", "RESOLVED", "FALSE_POSITIVE"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_STATUS", message: `Status must be one of: ${validStatuses.join(", ")}` }
      });
    }

    const actor = {
      id: req.user?.userId,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role
    };

    const updated = await fraudTrustService.updateAlertStatus(req.params.id, status, actor, reason);
    return res.json({ success: true, message: `Alert status updated to ${status}.`, data: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/admin/fraud-trust/alerts/:id/assign
 */
fraudTrustRouter.post("/alerts/:id/assign", verifyFraudTrustAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investigatorEmail } = req.body;
    if (!investigatorEmail || typeof investigatorEmail !== "string") {
      return res.status(400).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "investigatorEmail is required." }
      });
    }

    const actor = {
      id: req.user?.userId,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role
    };

    const updated = await fraudTrustService.assignInvestigator(req.params.id, investigatorEmail.trim(), actor);
    return res.json({ success: true, message: `Investigator assigned successfully.`, data: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/admin/fraud-trust/alerts/:id/notes
 */
fraudTrustRouter.post("/alerts/:id/notes", verifyFraudTrustAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { note } = req.body;
    if (!note || typeof note !== "string" || !note.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "Note text is required." }
      });
    }

    const actor = {
      id: req.user?.userId,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role
    };

    const updated = await fraudTrustService.addInternalNote(req.params.id, note.trim(), actor);
    return res.json({ success: true, message: `Internal note recorded.`, data: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/admin/fraud-trust/alerts/:id/restrict
 */
fraudTrustRouter.post("/alerts/:id/restrict", verifyFraudTrustAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { restrict, reason } = req.body;
    if (typeof restrict !== "boolean" || !reason) {
      return res.status(400).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "restrict (boolean) and reason (string) are required." }
      });
    }

    const actor = {
      id: req.user?.userId,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role
    };

    const updated = await fraudTrustService.restrictEntity(req.params.id, restrict, reason, actor);
    return res.json({
      success: true,
      message: restrict ? "Entity has been restricted." : "Entity restriction lifted.",
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/fraud-trust/reports
 */
fraudTrustRouter.get("/reports", verifyFraudTrustAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await fraudTrustService.getReports({
      category: req.query.category as string,
      status: req.query.status as string,
      targetType: req.query.targetType as string,
      search: req.query.search as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10
    });

    return res.json({
      success: true,
      data: result.reports,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/admin/fraud-trust/reports (Community report submission)
 */
fraudTrustRouter.post("/reports", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, reporterEmail, reporterName, targetType, targetId, targetTitle, reason, evidenceText } = req.body;
    if (!category || !reporterEmail || !targetType || !targetId || !targetTitle || !reason) {
      return res.status(400).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "Missing required report fields (category, reporterEmail, targetType, targetId, targetTitle, reason)." }
      });
    }

    const report = await fraudTrustService.submitUserReport({
      category,
      reporterEmail,
      reporterName,
      targetType,
      targetId,
      targetTitle,
      reason,
      evidenceText
    });

    return res.status(201).json({
      success: true,
      message: "Your report has been securely registered with CineVenue Trust & Safety.",
      data: report
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/admin/fraud-trust/reports/:id
 */
fraudTrustRouter.patch("/reports/:id", verifyFraudTrustAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const valid: ReportStatus[] = ["PENDING", "INVESTIGATING", "DISMISSED", "ACTIONED"];
    if (!valid.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_STATUS", message: `Status must be one of: ${valid.join(", ")}` }
      });
    }

    const actor = {
      id: req.user?.userId,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role
    };

    const updated = await fraudTrustService.updateReportStatus(req.params.id, status, actor);
    return res.json({ success: true, message: `Report updated to ${status}.`, data: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/fraud-trust/config
 */
fraudTrustRouter.get("/config", verifyFraudTrustAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await fraudTrustService.getConfig();
    return res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/admin/fraud-trust/config
 */
fraudTrustRouter.put("/config", verifyFraudTrustAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actor = {
      id: req.user?.userId,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role
    };

    const updated = await fraudTrustService.updateConfig(req.body, actor);
    return res.json({
      success: true,
      message: "Fraud rule configuration safely updated.",
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/fraud-trust/export
 */
fraudTrustRouter.get("/export", verifyFraudTrustAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const csvContent = await fraudTrustService.exportAlertsCsv(req.query);
    const filename = `cinevenue-fraud-alerts-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send(csvContent);
  } catch (err) {
    next(err);
  }
});
