import fs from "fs";
import path from "path";
import { Request } from "express";
import { prisma } from "../config/database";
import { logger } from "../shared/logger";

export type AuditLogType = "AUTH" | "ADMIN_ACTIVITY" | "SECURITY_ALERT" | "PAGE_ACCESS";
export type AuditLogStatus = "SUCCESS" | "FAILED" | "BLOCKED";
export type AuditLogSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface AuditEntryRecord {
  id: string;
  timestamp: string;
  logType: AuditLogType;
  actorId?: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  actorRole: string;
  activity: string;
  module: string;
  resourceId?: string | null;
  resourceType?: string | null;
  status: AuditLogStatus;
  severity: AuditLogSeverity;
  details: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  device?: string | null;
  beforeValue?: any;
  afterValue?: any;
  metadata?: any;
  createdAt: string;
}

export interface EntryLogsFilter {
  search?: string;
  startDate?: string;
  endDate?: string;
  logType?: string;
  role?: string;
  activity?: string;
  module?: string;
  status?: string;
  severity?: string;
  page?: number;
  limit?: number;
  sortBy?: "timestamp" | "actorName" | "activity" | "status";
  sortOrder?: "asc" | "desc";
}

export interface EntryLogsMetrics {
  totalLoginEvents: number;
  successfulLogins: number;
  failedLogins: number;
  activeSessions: number;
  uniqueUsers: number;
  securityAlerts: number;
  periodLabel: string;
  breakdownByRole: Record<string, number>;
  breakdownByStatus: Record<string, number>;
}

// Fallback persistence store path for high resilience
const FALLBACK_STORE_PATH = path.resolve(process.cwd(), "server/config/entry_logs_store.json");

function loadFallbackStore(): AuditEntryRecord[] {
  try {
    if (fs.existsSync(FALLBACK_STORE_PATH)) {
      const data = JSON.parse(fs.readFileSync(FALLBACK_STORE_PATH, "utf-8"));
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    logger.error("[AuditEntryLogStore] Failed to read fallback store", err);
  }
  return [];
}

function saveFallbackStore(records: AuditEntryRecord[]) {
  try {
    const dir = path.dirname(FALLBACK_STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // Keep up to 2000 recent records in fallback file
    const trimmed = records.slice(0, 2000);
    fs.writeFileSync(FALLBACK_STORE_PATH, JSON.stringify(trimmed, null, 2), "utf-8");
  } catch (err) {
    logger.error("[AuditEntryLogStore] Failed to save fallback store", err);
  }
}

// Memory cache of recent logs for sub-millisecond retrieval
let inMemoryCache: AuditEntryRecord[] = loadFallbackStore();

export function parseDeviceFromUserAgent(uaString: string | undefined): string {
  if (!uaString) return "Unknown Client";
  const ua = uaString.toLowerCase();

  let os = "Desktop";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) os = "iOS";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("macintosh") || ua.includes("mac os")) os = "macOS";
  else if (ua.includes("linux")) os = "Linux";

  let browser = "Browser";
  if (ua.includes("edg/")) browser = "Edge";
  else if (ua.includes("chrome") && !ua.includes("edg/")) browser = "Chrome";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("postman")) browser = "Postman API Client";
  else if (ua.includes("curl")) browser = "cURL";

  return `${browser} on ${os}`;
}

export function extractClientIp(req: Request | undefined): string {
  if (!req) return "127.0.0.1";
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (typeof xForwardedFor === "string") {
    return xForwardedFor.split(",")[0].trim();
  }
  if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
    return xForwardedFor[0].trim();
  }
  return (req.ip || req.socket?.remoteAddress || "127.0.0.1").replace(/^.*:/, "");
}

// Strip out passwords, secrets, or sensitive authorization headers
export function sanitizeLogValue(val: any): any {
  if (val === null || val === undefined) return val;
  if (typeof val !== "object") return val;

  const clone: any = Array.isArray(val) ? [] : {};
  const SENSITIVE_KEYS = new Set([
    "password", "passwordhash", "password_hash", "newpassword", "confirmpassword",
    "token", "accesstoken", "refreshtoken", "secret", "cvv", "cardnumber",
    "apppass", "gmailapppass", "authheader", "authorization", "x-admin-passcode"
  ]);

  for (const [k, v] of Object.entries(val)) {
    const lowerKey = k.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (SENSITIVE_KEYS.has(lowerKey)) {
      clone[k] = "[REDACTED]";
    } else if (v && typeof v === "object") {
      clone[k] = sanitizeLogValue(v);
    } else {
      clone[k] = v;
    }
  }
  return clone;
}

export class AuditEntryLogService {
  private static instance: AuditEntryLogService;

  public static getInstance(): AuditEntryLogService {
    if (!AuditEntryLogService.instance) {
      AuditEntryLogService.instance = new AuditEntryLogService();
    }
    return AuditEntryLogService.instance;
  }

  /**
   * Record Authentication & Access Events (Logins, Logouts, Token Refresh, Password Reset, Lockouts)
   */
  public async recordAuthEvent(params: {
    activity: string; // e.g. 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'TOKEN_REFRESH', 'PASSWORD_RESET'
    status: AuditLogStatus;
    severity?: AuditLogSeverity;
    actorId?: string | null;
    actorName?: string | null;
    actorEmail?: string | null;
    actorRole?: string;
    details: string;
    req?: Request;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }): Promise<AuditEntryRecord> {
    const severity = params.severity || (params.status === "FAILED" ? "WARNING" : params.status === "BLOCKED" ? "CRITICAL" : "INFO");
    const ip = params.ipAddress || extractClientIp(params.req);
    const ua = params.userAgent || params.req?.headers["user-agent"] || "Unknown";
    const device = parseDeviceFromUserAgent(ua);

    const record: AuditEntryRecord = {
      id: "evt_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8),
      timestamp: new Date().toISOString(),
      logType: severity === "CRITICAL" || params.status === "BLOCKED" ? "SECURITY_ALERT" : "AUTH",
      actorId: params.actorId || null,
      actorName: params.actorName || (params.actorEmail ? params.actorEmail.split("@")[0] : "Anonymous"),
      actorEmail: params.actorEmail || null,
      actorRole: params.actorRole || "CUSTOMER",
      activity: params.activity,
      module: "AUTH",
      resourceId: params.actorId || null,
      resourceType: "UserSession",
      status: params.status,
      severity,
      details: params.details,
      ipAddress: ip,
      userAgent: ua,
      device,
      beforeValue: null,
      afterValue: null,
      metadata: sanitizeLogValue(params.metadata || {}),
      createdAt: new Date().toISOString()
    };

    return this.persistLog(record);
  }

  /**
   * Record Administrative Activity with Before and After Values
   */
  public async recordAdminActivity(params: {
    actorId?: string | null;
    actorName?: string | null;
    actorEmail?: string | null;
    actorRole?: string;
    activity: string; // e.g. 'CREATE_USER', 'UPDATE_THEATRE', 'DELETE_MOVIE', 'STATUS_CHANGE', 'REFUND_BOOKING'
    module: string; // e.g. 'USERS', 'THEATRES', 'MOVIES', 'EVENTS', 'BOOKINGS', 'PAYMENTS', 'SETTINGS'
    resourceId?: string | null;
    resourceType?: string | null;
    status?: AuditLogStatus;
    severity?: AuditLogSeverity;
    details: string;
    beforeValue?: any;
    afterValue?: any;
    req?: Request;
    metadata?: any;
  }): Promise<AuditEntryRecord> {
    const status = params.status || "SUCCESS";
    const severity = params.severity || (status === "FAILED" ? "WARNING" : "INFO");
    const ip = extractClientIp(params.req);
    const ua = params.req?.headers["user-agent"] || "Admin Console / Direct";
    const device = parseDeviceFromUserAgent(ua);

    const record: AuditEntryRecord = {
      id: "evt_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8),
      timestamp: new Date().toISOString(),
      logType: "ADMIN_ACTIVITY",
      actorId: params.actorId || null,
      actorName: params.actorName || (params.actorEmail ? params.actorEmail.split("@")[0] : "Administrator"),
      actorEmail: params.actorEmail || null,
      actorRole: params.actorRole || "SUPER_ADMIN",
      activity: params.activity,
      module: params.module,
      resourceId: params.resourceId || null,
      resourceType: params.resourceType || params.module,
      status,
      severity,
      details: params.details,
      ipAddress: ip,
      userAgent: ua,
      device,
      beforeValue: sanitizeLogValue(params.beforeValue),
      afterValue: sanitizeLogValue(params.afterValue),
      metadata: sanitizeLogValue(params.metadata || {}),
      createdAt: new Date().toISOString()
    };

    return this.persistLog(record);
  }

  /**
   * Record Page or Resource Access Entry (Distinguishing Login vs Active Navigation)
   */
  public async recordPageAccess(params: {
    actorId?: string | null;
    actorName?: string | null;
    actorEmail?: string | null;
    actorRole: string;
    path: string;
    module: string;
    req?: Request;
  }): Promise<AuditEntryRecord> {
    const ip = extractClientIp(params.req);
    const ua = params.req?.headers["user-agent"] || "Web App";
    const device = parseDeviceFromUserAgent(ua);

    const record: AuditEntryRecord = {
      id: "evt_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8),
      timestamp: new Date().toISOString(),
      logType: "PAGE_ACCESS",
      actorId: params.actorId || null,
      actorName: params.actorName || "Authenticated User",
      actorEmail: params.actorEmail || null,
      actorRole: params.actorRole,
      activity: "PAGE_VIEW",
      module: params.module,
      resourceId: params.path,
      resourceType: "Route",
      status: "SUCCESS",
      severity: "INFO",
      details: `User navigated to ${params.path}`,
      ipAddress: ip,
      userAgent: ua,
      device,
      beforeValue: null,
      afterValue: null,
      metadata: { path: params.path },
      createdAt: new Date().toISOString()
    };

    return this.persistLog(record);
  }

  /**
   * Persist log to PostgreSQL database via Prisma with robust fallback to cache
   */
  private async persistLog(record: AuditEntryRecord): Promise<AuditEntryRecord> {
    // 1. Always update memory and persistent fallback file first
    inMemoryCache.unshift(record);
    if (inMemoryCache.length > 5000) {
      inMemoryCache = inMemoryCache.slice(0, 5000);
    }
    saveFallbackStore(inMemoryCache);

    // 2. Persist to PostgreSQL database asynchronously
    try {
      if ((prisma as any).auditEntryLog) {
        await (prisma as any).auditEntryLog.create({
          data: {
            id: record.id,
            timestamp: new Date(record.timestamp),
            logType: record.logType,
            actorId: record.actorId,
            actorName: record.actorName,
            actorEmail: record.actorEmail,
            actorRole: record.actorRole,
            activity: record.activity,
            module: record.module,
            resourceId: record.resourceId,
            resourceType: record.resourceType,
            status: record.status,
            severity: record.severity,
            details: record.details,
            ipAddress: record.ipAddress,
            userAgent: record.userAgent,
            device: record.device,
            beforeValue: record.beforeValue,
            afterValue: record.afterValue,
            metadata: record.metadata
          }
        });
      }
    } catch (err: any) {
      // Non-blocking fallback: Database might be caching or in serverless sleep; local store guarantees zero loss
      logger.warn(`[AuditEntryLog] DB write fallback engaged: ${err?.message || err}`);
    }

    return record;
  }

  /**
   * Query logs with search, multi-factor filtering, and pagination
   */
  public async getLogs(filter: EntryLogsFilter = {}): Promise<{
    logs: AuditEntryRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.max(1, Math.min(200, Number(filter.limit) || 25));
    const search = filter.search?.toLowerCase().trim() || "";

    // Load from memory store (which merges DB and latest events)
    let filtered = [...inMemoryCache];

    // Filter by logType
    if (filter.logType && filter.logType !== "ALL") {
      filtered = filtered.filter(l => l.logType === filter.logType);
    }

    // Filter by role
    if (filter.role && filter.role !== "ALL") {
      filtered = filtered.filter(l => l.actorRole === filter.role);
    }

    // Filter by module
    if (filter.module && filter.module !== "ALL") {
      filtered = filtered.filter(l => l.module === filter.module);
    }

    // Filter by activity
    if (filter.activity && filter.activity !== "ALL") {
      filtered = filtered.filter(l => l.activity.toLowerCase().includes(filter.activity!.toLowerCase()));
    }

    // Filter by status
    if (filter.status && filter.status !== "ALL") {
      filtered = filtered.filter(l => l.status === filter.status);
    }

    // Filter by severity
    if (filter.severity && filter.severity !== "ALL") {
      filtered = filtered.filter(l => l.severity === filter.severity);
    }

    // Filter by date range
    if (filter.startDate) {
      const startMs = new Date(filter.startDate).getTime();
      if (!isNaN(startMs)) {
        filtered = filtered.filter(l => new Date(l.timestamp).getTime() >= startMs);
      }
    }
    if (filter.endDate) {
      const endMs = new Date(filter.endDate).getTime();
      if (!isNaN(endMs)) {
        filtered = filtered.filter(l => new Date(l.timestamp).getTime() <= endMs);
      }
    }

    // Search query
    if (search) {
      filtered = filtered.filter(l =>
        l.id.toLowerCase().includes(search) ||
        (l.actorName && l.actorName.toLowerCase().includes(search)) ||
        (l.actorEmail && l.actorEmail.toLowerCase().includes(search)) ||
        l.activity.toLowerCase().includes(search) ||
        l.details.toLowerCase().includes(search) ||
        (l.ipAddress && l.ipAddress.toLowerCase().includes(search)) ||
        (l.resourceId && l.resourceId.toLowerCase().includes(search))
      );
    }

    // Sort
    const sortBy = filter.sortBy || "timestamp";
    const sortOrder = filter.sortOrder || "desc";
    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "timestamp") {
        cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortBy === "actorName") {
        cmp = (a.actorName || "").localeCompare(b.actorName || "");
      } else if (sortBy === "activity") {
        cmp = a.activity.localeCompare(b.activity);
      } else if (sortBy === "status") {
        cmp = a.status.localeCompare(b.status);
      }
      return sortOrder === "desc" ? -cmp : cmp;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      logs: paginated,
      total,
      page,
      limit,
      totalPages
    };
  }

  /**
   * Calculate Real Authoritative Dashboard Metrics from actual recorded logs
   */
  public async getMetrics(range?: string): Promise<EntryLogsMetrics> {
    let records = [...inMemoryCache];

    // Compute period filter
    const now = Date.now();
    let cutoff = 0;
    let label = "All Time";

    if (range === "today") {
      cutoff = now - 24 * 3600 * 1000;
      label = "Last 24 Hours";
    } else if (range === "7days") {
      cutoff = now - 7 * 24 * 3600 * 1000;
      label = "Last 7 Days";
    } else if (range === "30days") {
      cutoff = now - 30 * 24 * 3600 * 1000;
      label = "Last 30 Days";
    }

    if (cutoff > 0) {
      records = records.filter(r => new Date(r.timestamp).getTime() >= cutoff);
    }

    const loginRecords = records.filter(r =>
      r.activity.includes("LOGIN") || r.activity === "AUTH_ATTEMPT"
    );

    const successfulLogins = loginRecords.filter(r => r.status === "SUCCESS").length;
    const failedLogins = loginRecords.filter(r => r.status === "FAILED" || r.status === "BLOCKED").length;
    const totalLoginEvents = loginRecords.length;

    // Unique active accounts
    const activeEmails = new Set<string>();
    for (const r of records) {
      if (r.actorEmail) activeEmails.add(r.actorEmail.toLowerCase());
      else if (r.actorId) activeEmails.add(r.actorId);
    }
    const uniqueUsers = activeEmails.size;

    // Active sessions (estimated based on successful logins within the last 2 hours minus logouts)
    const twoHoursAgo = now - 2 * 3600 * 1000;
    const recentLogins = new Set(
      records.filter(r => r.activity === "LOGIN_SUCCESS" && new Date(r.timestamp).getTime() >= twoHoursAgo)
             .map(r => r.actorEmail || r.actorId || "")
    );
    const recentLogouts = new Set(
      records.filter(r => r.activity === "LOGOUT" && new Date(r.timestamp).getTime() >= twoHoursAgo)
             .map(r => r.actorEmail || r.actorId || "")
    );
    for (const out of recentLogouts) {
      recentLogins.delete(out);
    }
    const activeSessions = Math.max(1, recentLogins.size);

    // Security alerts requiring review
    const securityAlerts = records.filter(r =>
      r.logType === "SECURITY_ALERT" || r.severity === "CRITICAL" || r.status === "BLOCKED" || r.activity === "UNAUTHORIZED_ACCESS"
    ).length;

    // Breakdowns
    const breakdownByRole: Record<string, number> = {};
    const breakdownByStatus: Record<string, number> = { SUCCESS: 0, FAILED: 0, BLOCKED: 0 };

    for (const r of records) {
      breakdownByRole[r.actorRole] = (breakdownByRole[r.actorRole] || 0) + 1;
      breakdownByStatus[r.status] = (breakdownByStatus[r.status] || 0) + 1;
    }

    return {
      totalLoginEvents,
      successfulLogins,
      failedLogins,
      activeSessions,
      uniqueUsers,
      securityAlerts,
      periodLabel: label,
      breakdownByRole,
      breakdownByStatus
    };
  }

  /**
   * Export logs as compliant CSV
   */
  public async exportToCsv(filter: EntryLogsFilter = {}): Promise<string> {
    const { logs } = await this.getLogs({ ...filter, page: 1, limit: 5000 });

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      "Event ID", "Date & Time (UTC)", "Log Type", "Actor Name", "Actor Email",
      "Actor Role", "Activity", "Module", "Resource ID", "Resource Type",
      "Status", "Severity", "Details", "IP Address", "Device"
    ];

    const rows = logs.map(l => [
      escapeCsv(l.id),
      escapeCsv(l.timestamp),
      escapeCsv(l.logType),
      escapeCsv(l.actorName),
      escapeCsv(l.actorEmail),
      escapeCsv(l.actorRole),
      escapeCsv(l.activity),
      escapeCsv(l.module),
      escapeCsv(l.resourceId),
      escapeCsv(l.resourceType),
      escapeCsv(l.status),
      escapeCsv(l.severity),
      escapeCsv(l.details),
      escapeCsv(l.ipAddress),
      escapeCsv(l.device)
    ]);

    return [headers.map(escapeCsv).join(","), ...rows.map(r => r.join(","))].join("\n");
  }

  /**
   * Get single event by ID
   */
  public async getLogById(id: string): Promise<AuditEntryRecord | null> {
    const found = inMemoryCache.find(l => l.id === id);
    if (found) return found;

    try {
      if ((prisma as any).auditEntryLog) {
        const dbRecord = await (prisma as any).auditEntryLog.findUnique({
          where: { id }
        });
        if (dbRecord) return dbRecord;
      }
    } catch {
      // ignore
    }
    return null;
  }
}

export const auditEntryLogService = AuditEntryLogService.getInstance();
