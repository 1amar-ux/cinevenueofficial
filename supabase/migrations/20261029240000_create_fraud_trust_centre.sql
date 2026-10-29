-- =========================================================================
-- CineVenue Migration: 20261029240000_create_fraud_trust_centre.sql
-- Description: Production Fraud & Trust Centre tables, indexes, and constraints
-- Safe and Backward Compatible.
-- =========================================================================

-- 1. Create FraudAlert table
CREATE TABLE IF NOT EXISTS public."FraudAlert" (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL, -- 'LISTING', 'BOOKING', 'PAYMENT', 'TICKET', 'ORGANIZER'
    severity TEXT NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    "detectionRule" TEXT NOT NULL,
    "relatedEntityType" TEXT NOT NULL, -- 'EVENT', 'MOVIE', 'BOOKING', 'PAYMENT', 'TICKET', 'ORGANIZER', 'USER'
    "relatedEntityId" TEXT NOT NULL,
    "relatedEntityTitle" TEXT,
    "riskScore" INTEGER NOT NULL DEFAULT 50,
    "evidenceSummary" TEXT NOT NULL,
    "evidenceData" JSONB DEFAULT '{}'::jsonb,
    "investigationStatus" TEXT NOT NULL DEFAULT 'NEW', -- 'NEW', 'UNDER_REVIEW', 'ESCALATED', 'RESOLVED', 'FALSE_POSITIVE'
    "assignedTo" TEXT,
    "internalNotes" JSONB DEFAULT '[]'::jsonb,
    "resolutionReason" TEXT,
    "actionHistory" JSONB DEFAULT '[]'::jsonb,
    "isRestricted" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for FraudAlert
CREATE INDEX IF NOT EXISTS idx_fraud_alert_category ON public."FraudAlert"(category);
CREATE INDEX IF NOT EXISTS idx_fraud_alert_severity ON public."FraudAlert"(severity);
CREATE INDEX IF NOT EXISTS idx_fraud_alert_status ON public."FraudAlert"("investigationStatus");
CREATE INDEX IF NOT EXISTS idx_fraud_alert_entity ON public."FraudAlert"("relatedEntityType", "relatedEntityId");
CREATE INDEX IF NOT EXISTS idx_fraud_alert_risk_score ON public."FraudAlert"("riskScore");
CREATE INDEX IF NOT EXISTS idx_fraud_alert_created_at ON public."FraudAlert"("createdAt" DESC);

-- 2. Create UserReport table
CREATE TABLE IF NOT EXISTS public."UserReport" (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL, -- 'FAKE_EVENT', 'MISLEADING_LISTING', 'SUSPICIOUS_ORGANIZER', 'TICKET_PROBLEM', 'PAYMENT_ISSUE', 'REFUND_CONCERN'
    "reporterEmail" TEXT NOT NULL,
    "reporterName" TEXT,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetTitle" TEXT NOT NULL,
    reason TEXT NOT NULL,
    "evidenceText" TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'INVESTIGATING', 'DISMISSED', 'ACTIONED'
    "linkedAlertId" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for UserReport
CREATE INDEX IF NOT EXISTS idx_user_report_category ON public."UserReport"(category);
CREATE INDEX IF NOT EXISTS idx_user_report_target ON public."UserReport"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS idx_user_report_status ON public."UserReport"(status);
CREATE INDEX IF NOT EXISTS idx_user_report_created_at ON public."UserReport"("createdAt" DESC);

-- 3. Create FraudRuleConfig table
CREATE TABLE IF NOT EXISTS public."FraudRuleConfig" (
    id TEXT PRIMARY KEY DEFAULT 'default_fraud_config',
    "maxBookingAttemptsPerWindow" INTEGER NOT NULL DEFAULT 5,
    "bookingAttemptWindowMinutes" INTEGER NOT NULL DEFAULT 10,
    "failedBookingThreshold" INTEGER NOT NULL DEFAULT 3,
    "seatHoldReleaseThreshold" INTEGER NOT NULL DEFAULT 4,
    "listingSimilarityThreshold" INTEGER NOT NULL DEFAULT 80,
    "priceChangePercentThreshold" INTEGER NOT NULL DEFAULT 50,
    "duplicateScanWindowMinutes" INTEGER NOT NULL DEFAULT 15,
    "riskScoreWeights" JSONB DEFAULT '{"listing":25,"booking":25,"payment":30,"ticket":20}'::jsonb,
    "autoEscalateThreshold" INTEGER NOT NULL DEFAULT 75,
    "alertRetentionDays" INTEGER NOT NULL DEFAULT 90,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Comments
COMMENT ON TABLE public."FraudAlert" IS 'CineVenue production fraud & trust investigative alerts';
COMMENT ON TABLE public."UserReport" IS 'CineVenue customer and community reports regarding suspicious listings and tickets';
COMMENT ON TABLE public."FraudRuleConfig" IS 'Configurable rules and detection thresholds for CineVenue Fraud & Trust Centre';
