import {
  auditEntryLogService,
  AuditEntryRecord,
  parseDeviceFromUserAgent,
  sanitizeLogValue
} from "../../server/services/auditEntryLogService";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runEntryLogsTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const runTest = async (name: string, fn: () => Promise<void> | void) => {
    try {
      await fn();
      results.push({ name, passed: true });
    } catch (err: any) {
      results.push({ name, passed: false, error: err.message || String(err) });
    }
  };

  // --- 1. User Agent and Device Parsing ---
  await runTest("Device Parser: Chrome on Windows desktop", () => {
    const dev = parseDeviceFromUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36");
    if (!dev.includes("Chrome") || !dev.includes("Windows")) {
      throw new Error(`Expected Chrome on Windows, got: ${dev}`);
    }
  });

  await runTest("Device Parser: Safari on iOS mobile", () => {
    const dev = parseDeviceFromUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1");
    if (!dev.includes("Safari") || !dev.includes("iOS")) {
      throw new Error(`Expected Safari on iOS, got: ${dev}`);
    }
  });

  // --- 2. Secret Redaction ---
  await runTest("Sanitization: Strips passwords, auth tokens and secrets", () => {
    const raw = {
      email: "user@test.com",
      password: "SecretPassword123!",
      passwordHash: "$2a$10$xyz...",
      accessToken: "eyJhbGciOi...",
      apiKey: "secret_12345",
      nested: {
        confirmPassword: "SecretPassword123!",
        safeField: "Active"
      }
    };
    const sanitized = sanitizeLogValue(raw);
    if (sanitized.password !== "[REDACTED]" || sanitized.accessToken !== "[REDACTED]") {
      throw new Error(`Sensitive fields not redacted: ${JSON.stringify(sanitized)}`);
    }
    if (sanitized.nested.confirmPassword !== "[REDACTED]") {
      throw new Error("Nested sensitive fields not redacted");
    }
    if (sanitized.nested.safeField !== "Active") {
      throw new Error("Safe fields modified");
    }
  });

  // --- 3. Recording Auth Events ---
  await runTest("AuditEntryLog: Record successful authentication event", async () => {
    const record = await auditEntryLogService.recordAuthEvent({
      activity: "LOGIN_SUCCESS",
      status: "SUCCESS",
      actorId: "usr_test_101",
      actorName: "Rahul Sharma",
      actorEmail: "rahul.sharma@cinevenue.test",
      actorRole: "CUSTOMER",
      details: "Customer logged in successfully via email/password",
      ipAddress: "103.22.41.8",
      userAgent: "Mozilla/5.0 (Windows NT 10.0) Chrome/128.0.0.0"
    });

    if (!record.id || !record.id.startsWith("evt_")) {
      throw new Error(`Invalid record id: ${record.id}`);
    }
    if (record.logType !== "AUTH" || record.status !== "SUCCESS") {
      throw new Error(`Invalid log state: ${record.logType} / ${record.status}`);
    }
    if (record.actorRole !== "CUSTOMER") {
      throw new Error(`Actor role mismatch: ${record.actorRole}`);
    }
  });

  await runTest("AuditEntryLog: Record failed authentication event with warning severity", async () => {
    const record = await auditEntryLogService.recordAuthEvent({
      activity: "LOGIN_FAILED",
      status: "FAILED",
      severity: "WARNING",
      actorEmail: "attacker@suspicious.test",
      actorRole: "ANONYMOUS",
      details: "Authentication failed: invalid credentials provided",
      ipAddress: "192.168.1.100"
    });

    if (record.status !== "FAILED" || record.severity !== "WARNING") {
      throw new Error(`Expected FAILED / WARNING, got ${record.status} / ${record.severity}`);
    }
  });

  await runTest("AuditEntryLog: Record security alert for unauthorized access", async () => {
    const record = await auditEntryLogService.recordAuthEvent({
      activity: "UNAUTHORIZED_ACCESS",
      status: "BLOCKED",
      severity: "CRITICAL",
      actorId: "usr_unauth",
      actorEmail: "customer_blocked@cinevenue.test",
      actorRole: "CUSTOMER",
      details: "Customer attempted direct access to Admin Entry Logs endpoint"
    });

    if (record.logType !== "SECURITY_ALERT" || record.severity !== "CRITICAL") {
      throw new Error(`Expected SECURITY_ALERT / CRITICAL, got ${record.logType} / ${record.severity}`);
    }
  });

  // --- 4. Recording Administrative Activity with Before-and-After Values ---
  await runTest("AuditEntryLog: Record administrative activity with before-and-after diff", async () => {
    const beforeState = { eventId: "ev_99", status: "PENDING", capacity: 500 };
    const afterState = { eventId: "ev_99", status: "APPROVED", capacity: 500 };

    const record = await auditEntryLogService.recordAdminActivity({
      actorId: "emp_super_admin",
      actorName: "Amarnath Gattem",
      actorEmail: "superadmin@cinevenue.com",
      actorRole: "SUPER_ADMIN",
      activity: "APPROVE_EVENT",
      module: "EVENTS",
      resourceId: "ev_99",
      resourceType: "Event",
      status: "SUCCESS",
      details: "Administrator approved live concert event 'A.R. Rahman Live in Concert'",
      beforeValue: beforeState,
      afterValue: afterState
    });

    if (record.logType !== "ADMIN_ACTIVITY") {
      throw new Error(`Expected ADMIN_ACTIVITY, got ${record.logType}`);
    }
    if (!record.beforeValue || record.beforeValue.status !== "PENDING") {
      throw new Error("Before value status mismatch");
    }
    if (!record.afterValue || record.afterValue.status !== "APPROVED") {
      throw new Error("After value status mismatch");
    }
  });

  // --- 5. Querying & Filtering ---
  await runTest("AuditEntryLog: Search and filter logs by module and status", async () => {
    const res = await auditEntryLogService.getLogs({
      module: "EVENTS",
      limit: 10
    });

    if (!Array.isArray(res.logs) || res.logs.length === 0) {
      throw new Error("Expected to find recorded event activity logs");
    }
    if (res.logs.some(l => l.module !== "EVENTS")) {
      throw new Error("Log with non-matching module returned");
    }
  });

  await runTest("AuditEntryLog: Search logs by keyword", async () => {
    const res = await auditEntryLogService.getLogs({
      search: "Rahman"
    });

    if (res.logs.length === 0 || !res.logs[0].details.includes("Rahman")) {
      throw new Error("Search by keyword failed to find target log");
    }
  });

  // --- 6. Authoritative Metrics ---
  await runTest("AuditEntryLog: Compute authoritative metrics from recorded entries", async () => {
    const metrics = await auditEntryLogService.getMetrics("all");

    if (typeof metrics.totalLoginEvents !== "number" || metrics.totalLoginEvents < 1) {
      throw new Error(`Invalid total login events: ${metrics.totalLoginEvents}`);
    }
    if (typeof metrics.successfulLogins !== "number" || metrics.successfulLogins < 1) {
      throw new Error(`Invalid successful logins count: ${metrics.successfulLogins}`);
    }
    if (typeof metrics.uniqueUsers !== "number" || metrics.uniqueUsers < 1) {
      throw new Error(`Invalid unique users count: ${metrics.uniqueUsers}`);
    }
    if (typeof metrics.securityAlerts !== "number" || metrics.securityAlerts < 1) {
      throw new Error(`Expected at least 1 security alert, got ${metrics.securityAlerts}`);
    }
  });

  // --- 7. CSV Export ---
  await runTest("AuditEntryLog: Generate formatted RFC4180 CSV export", async () => {
    const csv = await auditEntryLogService.exportToCsv({});

    if (typeof csv !== "string" || !csv.startsWith('"Event ID","Date & Time (UTC)"')) {
      throw new Error(`Invalid CSV header: ${csv.substring(0, 100)}`);
    }
    if (!csv.includes("LOGIN_SUCCESS") || !csv.includes("rahul.sharma@cinevenue.test")) {
      throw new Error("CSV does not contain recorded authentication event details");
    }
  });

  return results;
}
