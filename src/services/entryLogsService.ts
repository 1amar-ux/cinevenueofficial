export type AuditLogType = "AUTH" | "ADMIN_ACTIVITY" | "SECURITY_ALERT" | "PAGE_ACCESS";
export type AuditLogStatus = "SUCCESS" | "FAILED" | "BLOCKED";
export type AuditLogSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface AuditEntryLog {
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

export interface EntryLogsFilterQuery {
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

export interface PaginatedLogsResponse {
  logs: AuditEntryLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class EntryLogsService {
  private getAuthHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    // Bearer token from localStorage
    const employeeToken = localStorage.getItem("cine_employee_token");
    const adminToken = localStorage.getItem("adminToken");
    const token = employeeToken || adminToken;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Passcode fallback for direct admin access
    const adminPasscode = localStorage.getItem("cine_admin_passcode") || "8888";
    headers["x-admin-passcode"] = adminPasscode;

    return headers;
  }

  /**
   * Fetch paginated entry and activity logs with server-side filtering
   */
  public async getLogs(query: EntryLogsFilterQuery = {}): Promise<PaginatedLogsResponse> {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.startDate) params.set("startDate", query.startDate);
    if (query.endDate) params.set("endDate", query.endDate);
    if (query.logType && query.logType !== "ALL") params.set("logType", query.logType);
    if (query.role && query.role !== "ALL") params.set("role", query.role);
    if (query.module && query.module !== "ALL") params.set("module", query.module);
    if (query.activity && query.activity !== "ALL") params.set("activity", query.activity);
    if (query.status && query.status !== "ALL") params.set("status", query.status);
    if (query.severity && query.severity !== "ALL") params.set("severity", query.severity);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.sortBy) params.set("sortBy", query.sortBy);
    if (query.sortOrder) params.set("sortOrder", query.sortOrder);

    const res = await fetch(`/api/v1/admin/entry-logs?${params.toString()}`, {
      headers: this.getAuthHeaders()
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error?.message || `Failed to fetch entry logs (${res.status})`);
    }

    const data = await res.json();
    return {
      logs: data.data || [],
      pagination: data.pagination || { total: 0, page: 1, limit: 25, totalPages: 1 }
    };
  }

  /**
   * Fetch authoritative dashboard metrics calculated from recorded events
   */
  public async getMetrics(range: string = "all"): Promise<EntryLogsMetrics> {
    const res = await fetch(`/api/v1/admin/entry-logs/metrics?range=${encodeURIComponent(range)}`, {
      headers: this.getAuthHeaders()
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error?.message || `Failed to fetch entry metrics (${res.status})`);
    }

    const data = await res.json();
    return data.data;
  }

  /**
   * Fetch single log by ID with complete detail and before-and-after diff
   */
  public async getLogById(id: string): Promise<AuditEntryLog> {
    const res = await fetch(`/api/v1/admin/entry-logs/${encodeURIComponent(id)}`, {
      headers: this.getAuthHeaders()
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error?.message || `Failed to fetch log details`);
    }

    const data = await res.json();
    return data.data;
  }

  /**
   * Export logs to CSV
   */
  public async exportLogsCsv(query: EntryLogsFilterQuery = {}): Promise<Blob> {
    const res = await fetch(`/api/v1/admin/entry-logs/export`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(query)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error?.message || `Failed to export CSV (${res.status})`);
    }

    return await res.blob();
  }

  /**
   * Client-side record of page navigation
   */
  public async recordAccess(path: string, module: string, user?: { id?: string; name?: string; email?: string; role?: string }): Promise<void> {
    try {
      await fetch(`/api/v1/admin/entry-logs/record-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          module,
          actorId: user?.id,
          actorName: user?.name,
          actorEmail: user?.email,
          actorRole: user?.role || "CUSTOMER"
        })
      });
    } catch {
      // Non-blocking telemetry
    }
  }
}

export const entryLogsService = new EntryLogsService();
