export interface FinancialAuditLogEntry {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  transactionId?: string;
  theatreId?: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  ipAddress?: string;
  timestamp: string;
}

// Global authoritative in-memory audit logs array
export const globalFinancialAuditLogs: FinancialAuditLogEntry[] = [
  {
    id: "FIN-AUDIT-INIT-001",
    adminId: "ADMIN-01",
    adminEmail: "superadmin@cinevenue.com",
    action: "SYSTEM_INITIALIZED",
    theatreId: "SYSTEM",
    oldValue: null,
    newValue: { status: "ACTIVE" },
    reason: "CineVenue Financial & Banking Ledger initialized",
    timestamp: new Date("2026-08-01T00:00:00Z").toISOString()
  }
];

export function logFinancialAudit(entry: Omit<FinancialAuditLogEntry, "id" | "timestamp">) {
  const record: FinancialAuditLogEntry = {
    id: `AUDIT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    ...entry
  };
  globalFinancialAuditLogs.unshift(record);
  return record;
}
