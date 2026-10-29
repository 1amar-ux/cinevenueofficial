-- 20261029230000_create_audit_entry_logs.sql
-- CineVenue Production-Grade Centralized Audit Trail & Entry Logs Schema

CREATE TABLE IF NOT EXISTS "AuditEntryLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "logType" TEXT NOT NULL DEFAULT 'AUTH', -- 'AUTH', 'ADMIN_ACTIVITY', 'SECURITY_ALERT', 'PAGE_ACCESS'
    "actorId" TEXT,
    "actorName" TEXT,
    "actorEmail" TEXT,
    "actorRole" TEXT NOT NULL DEFAULT 'CUSTOMER', -- 'SUPER_ADMIN', 'ADMIN', 'THEATRE_ADMIN', 'THEATRE_MANAGER', 'EVENT_ORGANIZER', 'CUSTOMER', 'ANONYMOUS'
    "activity" TEXT NOT NULL, -- e.g. 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'UPDATE', 'CREATE', 'DELETE', etc.
    "module" TEXT NOT NULL DEFAULT 'AUTH', -- 'AUTH', 'USERS', 'THEATRES', 'MOVIES', 'EVENTS', 'BOOKINGS', 'PAYMENTS', 'SETTINGS', 'EMPLOYEES', 'SECURITY'
    "resourceId" TEXT,
    "resourceType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'FAILED', 'BLOCKED'
    "severity" TEXT NOT NULL DEFAULT 'INFO', -- 'INFO', 'WARNING', 'CRITICAL'
    "details" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "device" TEXT,
    "beforeValue" JSONB,
    "afterValue" JSONB,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    CONSTRAINT "AuditEntryLog_pkey" PRIMARY KEY ("id")
);

-- Optimize queries for administrative auditing, security analysis, and date-range filters
CREATE INDEX IF NOT EXISTS "AuditEntryLog_timestamp_idx" ON "AuditEntryLog" ("timestamp" DESC);
CREATE INDEX IF NOT EXISTS "AuditEntryLog_logType_idx" ON "AuditEntryLog" ("logType");
CREATE INDEX IF NOT EXISTS "AuditEntryLog_actorId_idx" ON "AuditEntryLog" ("actorId");
CREATE INDEX IF NOT EXISTS "AuditEntryLog_actorEmail_idx" ON "AuditEntryLog" ("actorEmail");
CREATE INDEX IF NOT EXISTS "AuditEntryLog_actorRole_idx" ON "AuditEntryLog" ("actorRole");
CREATE INDEX IF NOT EXISTS "AuditEntryLog_activity_idx" ON "AuditEntryLog" ("activity");
CREATE INDEX IF NOT EXISTS "AuditEntryLog_module_idx" ON "AuditEntryLog" ("module");
CREATE INDEX IF NOT EXISTS "AuditEntryLog_status_idx" ON "AuditEntryLog" ("status");
CREATE INDEX IF NOT EXISTS "AuditEntryLog_severity_idx" ON "AuditEntryLog" ("severity");
CREATE INDEX IF NOT EXISTS "AuditEntryLog_resourceId_idx" ON "AuditEntryLog" ("resourceId");

-- Enable Row Level Security
ALTER TABLE "AuditEntryLog" ENABLE ROW LEVEL SECURITY;

-- Append-only constraint: disallow UPDATE and DELETE from non-service roles
CREATE POLICY "Allow authenticated read audit logs"
    ON "AuditEntryLog"
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert audit logs"
    ON "AuditEntryLog"
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
