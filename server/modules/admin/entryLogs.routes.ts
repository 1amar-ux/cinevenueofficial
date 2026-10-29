import { Router, Request, Response, NextFunction } from "express";
import { auditEntryLogService } from "../../services/auditEntryLogService";
import { authenticate, isValidAdminPasscode } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";
import { logger } from "../../shared/logger";

export const entryLogsRouter = Router();

// Middleware ensuring only Super Admin or authorized Admin staff can access logs
const verifyEntryLogsAccess = (req: Request, res: Response, next: NextFunction) => {
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
    // Allow SUPER_ADMIN and ADMIN
    const role = req.user?.role;
    if (role === "SUPER_ADMIN" || role === "ADMIN") {
      return next();
    }
    // Block Theatre Owners, Managers, Organizers, Customers
    auditEntryLogService.recordAuthEvent({
      activity: "UNAUTHORIZED_ACCESS",
      status: "BLOCKED",
      severity: "CRITICAL",
      actorId: req.user?.userId,
      actorName: req.user?.name,
      actorEmail: req.user?.email,
      actorRole: role || "UNKNOWN",
      details: `Unauthorized attempt to access Entry Logs module by role: ${role}`,
      req
    });
    return res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Access to Entry Logs & Audit Trail is restricted to CineVenue Administrators."
      }
    });
  });
};

/**
 * GET /api/v1/admin/entry-logs/metrics
 * Returns authoritative calculated KPI metrics from real log entries
 */
entryLogsRouter.get("/entry-logs/metrics", verifyEntryLogsAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const range = req.query.range as string | undefined;
    const metrics = await auditEntryLogService.getMetrics(range);
    return res.json({
      success: true,
      data: metrics
    });
  } catch (error: any) {
    logger.error("[EntryLogs:Metrics] Error calculating metrics", error);
    next(error);
  }
});

/**
 * GET /api/v1/admin/entry-logs
 * Fetch paginated entry and activity logs with multi-factor filters
 */
entryLogsRouter.get("/entry-logs", verifyEntryLogsAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      startDate,
      endDate,
      logType,
      role,
      activity,
      module,
      status,
      severity,
      page,
      limit,
      sortBy,
      sortOrder
    } = req.query;

    const result = await auditEntryLogService.getLogs({
      search: search ? String(search) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      logType: logType ? String(logType) : undefined,
      role: role ? String(role) : undefined,
      activity: activity ? String(activity) : undefined,
      module: module ? String(module) : undefined,
      status: status ? String(status) : undefined,
      severity: severity ? String(severity) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 25,
      sortBy: (sortBy as any) || "timestamp",
      sortOrder: (sortOrder as any) || "desc"
    });

    return res.json({
      success: true,
      data: result.logs,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  } catch (error: any) {
    logger.error("[EntryLogs:List] Error fetching logs", error);
    next(error);
  }
});

/**
 * GET /api/v1/admin/entry-logs/:id
 * Retrieve a single audit event record with before/after diff metadata
 */
entryLogsRouter.get("/entry-logs/:id", verifyEntryLogsAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const log = await auditEntryLogService.getLogById(id);
    if (!log) {
      return res.status(404).json({
        success: false,
        error: { code: "LOG_NOT_FOUND", message: "Audit log entry not found." }
      });
    }
    return res.json({
      success: true,
      data: log
    });
  } catch (error: any) {
    logger.error(`[EntryLogs:Detail] Error fetching log ${req.params.id}`, error);
    next(error);
  }
});

/**
 * POST /api/v1/admin/entry-logs/export
 * Securely generate and download CSV export for authorized administrators
 * Also self-audits the export event into the log trail!
 */
entryLogsRouter.post("/entry-logs/export", verifyEntryLogsAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = req.body || {};
    const csvContent = await auditEntryLogService.exportToCsv(filter);

    // Audit the export action
    await auditEntryLogService.recordAdminActivity({
      actorId: req.user?.userId,
      actorName: req.user?.name || "Administrator",
      actorEmail: req.user?.email || "superadmin@cinevenue.com",
      actorRole: req.user?.role || "SUPER_ADMIN",
      activity: "EXPORT_AUDIT_LOGS_CSV",
      module: "SECURITY",
      resourceType: "AuditLogsExport",
      details: `Administrator exported Entry Logs & Audit Trail CSV (filters: ${JSON.stringify(filter)})`,
      severity: "INFO",
      req
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="cinevenue_entry_logs_${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  } catch (error: any) {
    logger.error("[EntryLogs:Export] Error generating CSV export", error);
    next(error);
  }
});

/**
 * POST /api/v1/admin/entry-logs/record-access
 * Records client entry / page navigation for authenticated users
 */
entryLogsRouter.post("/entry-logs/record-access", async (req: Request, res: Response) => {
  try {
    const { path, module, actorId, actorName, actorEmail, actorRole } = req.body || {};
    if (!path) {
      return res.status(400).json({ success: false, message: "Path is required" });
    }

    const record = await auditEntryLogService.recordPageAccess({
      actorId: actorId || null,
      actorName: actorName || "Authenticated Client",
      actorEmail: actorEmail || null,
      actorRole: actorRole || "CUSTOMER",
      path: String(path),
      module: String(module || "NAV"),
      req
    });

    return res.json({ success: true, data: { id: record.id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default entryLogsRouter;
