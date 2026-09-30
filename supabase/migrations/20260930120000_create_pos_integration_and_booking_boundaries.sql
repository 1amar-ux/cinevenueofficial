-- ====================================================================
-- CineVenue POS Integration, Booking Boundaries & Idempotency Migration
-- Date: 2026-09-30
-- Description: Additive, non-destructive migration creating POS tables,
--              canonical transaction ledgers, idempotent cancellation/refund
--              tracking, telemetry logs, and reconciliation tables.
-- ====================================================================

-- 1. POS PROVIDERS
CREATE TABLE IF NOT EXISTS "POSProvider" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UQ_POSProvider_code" UNIQUE ("code")
);

-- Seed Default POS Providers if not exist
INSERT INTO "POSProvider" ("id", "name", "code", "description", "isActive")
VALUES 
  ('prov_vista', 'Vista Cinema Connect & Cloud', 'VISTA', 'Vista Cinema Connect Ticketing & Management', true),
  ('prov_veezi', 'Veezi Cloud POS', 'VEEZI', 'Veezi Internet Ticketing & Cinema POS API', true),
  ('prov_mock', 'Mock Cinema POS Sandbox', 'MOCK_POS', 'Simulated Cinema POS for Development and Testing', true),
  ('prov_generic', 'Generic REST Cinema POS', 'GENERIC_REST', 'Universal REST API Cinema POS Gateway', true)
ON CONFLICT ("code") DO NOTHING;

-- 2. POS INTEGRATION INSTANCES
CREATE TABLE IF NOT EXISTS "POSIntegration" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "theatreId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "environment" TEXT NOT NULL DEFAULT 'SANDBOX', -- SANDBOX, PRODUCTION
  "status" TEXT NOT NULL DEFAULT 'NOT_CONFIGURED', -- NOT_CONFIGURED, CONFIGURED, CONNECTION_TESTED, TESTING, READY_FOR_GO_LIVE, LIVE, ERROR, DISCONNECTED, DISABLED
  "baseUrl" TEXT NOT NULL,
  "siteId" TEXT,
  "cinemaId" TEXT,
  "encryptedCredentials" JSONB,
  "lastSuccessfulHealthCheckAt" TIMESTAMP(3),
  "lastSuccessfulSyncAt" TIMESTAMP(3),
  "lastErrorAt" TIMESTAMP(3),
  "lastErrorCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UQ_POSIntegration_theatre_provider_env" UNIQUE ("theatreId", "providerId", "environment"),
  CONSTRAINT "FK_POSIntegration_theatre" FOREIGN KEY ("theatreId") REFERENCES "Theatre"("id") ON DELETE RESTRICT,
  CONSTRAINT "FK_POSIntegration_provider" FOREIGN KEY ("providerId") REFERENCES "POSProvider"("id") ON DELETE RESTRICT
);

-- 3. POS CREDENTIALS (Secure Storage)
CREATE TABLE IF NOT EXISTS "POSCredential" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "integrationId" TEXT NOT NULL,
  "credentialType" TEXT NOT NULL, -- API_KEY, API_SECRET, CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN, BEARER_TOKEN
  "encryptedValue" TEXT NOT NULL,
  "keyVersion" TEXT NOT NULL DEFAULT 'v1',
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UQ_POSCredential_integration_type" UNIQUE ("integrationId", "credentialType"),
  CONSTRAINT "FK_POSCredential_integration" FOREIGN KEY ("integrationId") REFERENCES "POSIntegration"("id") ON DELETE CASCADE
);

-- 4. THEATRE POS MAPPINGS
CREATE TABLE IF NOT EXISTS "TheatrePOSMapping" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "integrationId" TEXT NOT NULL,
  "theatreId" TEXT NOT NULL,
  "externalTheatreId" TEXT NOT NULL,
  "externalSiteId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UQ_TheatrePOSMapping_int_extTheatre" UNIQUE ("integrationId", "externalTheatreId"),
  CONSTRAINT "UQ_TheatrePOSMapping_theatre_int" UNIQUE ("theatreId", "integrationId"),
  CONSTRAINT "FK_TheatrePOSMapping_integration" FOREIGN KEY ("integrationId") REFERENCES "POSIntegration"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_TheatrePOSMapping_theatre" FOREIGN KEY ("theatreId") REFERENCES "Theatre"("id") ON DELETE CASCADE
);

-- 5. SCREEN POS MAPPINGS
CREATE TABLE IF NOT EXISTS "ScreenPOSMapping" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "integrationId" TEXT NOT NULL,
  "theatreId" TEXT NOT NULL,
  "screenId" TEXT NOT NULL,
  "externalScreenId" TEXT NOT NULL,
  "externalScreenName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UQ_ScreenPOSMapping_int_extScreen" UNIQUE ("integrationId", "externalScreenId"),
  CONSTRAINT "UQ_ScreenPOSMapping_int_screen" UNIQUE ("integrationId", "screenId"),
  CONSTRAINT "FK_ScreenPOSMapping_integration" FOREIGN KEY ("integrationId") REFERENCES "POSIntegration"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_ScreenPOSMapping_screen" FOREIGN KEY ("screenId") REFERENCES "Screen"("id") ON DELETE CASCADE
);

-- 6. SEAT POS MAPPINGS
CREATE TABLE IF NOT EXISTS "SeatPOSMapping" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "integrationId" TEXT NOT NULL,
  "theatreId" TEXT NOT NULL,
  "screenId" TEXT NOT NULL,
  "seatId" TEXT NOT NULL,
  "externalSeatId" TEXT NOT NULL,
  "externalRow" TEXT,
  "externalNumber" TEXT,
  "externalCategory" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UQ_SeatPOSMapping_int_extSeat" UNIQUE ("integrationId", "externalSeatId"),
  CONSTRAINT "UQ_SeatPOSMapping_int_seat" UNIQUE ("integrationId", "seatId"),
  CONSTRAINT "FK_SeatPOSMapping_integration" FOREIGN KEY ("integrationId") REFERENCES "POSIntegration"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_SeatPOSMapping_seat" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE CASCADE
);

-- 7. MOVIE POS MAPPINGS
CREATE TABLE IF NOT EXISTS "MoviePOSMapping" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "integrationId" TEXT NOT NULL,
  "movieId" TEXT NOT NULL,
  "externalMovieId" TEXT NOT NULL,
  "externalTitle" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UQ_MoviePOSMapping_int_extMovie" UNIQUE ("integrationId", "externalMovieId"),
  CONSTRAINT "UQ_MoviePOSMapping_int_movie" UNIQUE ("integrationId", "movieId"),
  CONSTRAINT "FK_MoviePOSMapping_integration" FOREIGN KEY ("integrationId") REFERENCES "POSIntegration"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_MoviePOSMapping_movie" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE
);

-- 8. SHOW POS MAPPINGS
CREATE TABLE IF NOT EXISTS "ShowPOSMapping" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "integrationId" TEXT NOT NULL,
  "showId" TEXT NOT NULL,
  "externalShowId" TEXT NOT NULL,
  "externalSessionId" TEXT,
  "externalScreenId" TEXT,
  "showDate" TIMESTAMP(3),
  "startTime" TIMESTAMP(3),
  "endTime" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UQ_ShowPOSMapping_int_extShow" UNIQUE ("integrationId", "externalShowId"),
  CONSTRAINT "UQ_ShowPOSMapping_int_show" UNIQUE ("integrationId", "showId"),
  CONSTRAINT "FK_ShowPOSMapping_integration" FOREIGN KEY ("integrationId") REFERENCES "POSIntegration"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_ShowPOSMapping_show" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE
);

-- 9. POS PRICE MAPPINGS
CREATE TABLE IF NOT EXISTS "POSPriceMapping" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "integrationId" TEXT NOT NULL,
  "showId" TEXT NOT NULL,
  "externalPriceId" TEXT,
  "ticketType" TEXT NOT NULL DEFAULT 'ADULT',
  "seatCategory" TEXT NOT NULL,
  "basePrice" DECIMAL(10, 2) NOT NULL CHECK ("basePrice" >= 0),
  "taxAmount" DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK ("taxAmount" >= 0),
  "totalPrice" DECIMAL(10, 2) NOT NULL CHECK ("totalPrice" >= 0),
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "effectiveFrom" TIMESTAMP(3),
  "effectiveTo" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FK_POSPriceMapping_integration" FOREIGN KEY ("integrationId") REFERENCES "POSIntegration"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_POSPriceMapping_show" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE
);

-- 10. POS BOOKING RECORD
CREATE TABLE IF NOT EXISTS "POSBooking" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "bookingId" TEXT NOT NULL,
  "integrationId" TEXT NOT NULL,
  "theatreId" TEXT NOT NULL,
  "showId" TEXT NOT NULL,
  "externalBookingId" TEXT,
  "externalTransactionId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSING, CONFIRMED, FAILED, CANCELLED, UNKNOWN
  "requestId" TEXT,
  "idempotencyKey" TEXT,
  "amount" DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK ("amount" >= 0),
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "confirmedAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UQ_POSBooking_booking_integration" UNIQUE ("bookingId", "integrationId"),
  CONSTRAINT "FK_POSBooking_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT,
  CONSTRAINT "FK_POSBooking_integration" FOREIGN KEY ("integrationId") REFERENCES "POSIntegration"("id") ON DELETE RESTRICT
);

-- 11. BOOKING TRANSACTION (Canonical Idempotency Ledger)
CREATE TABLE IF NOT EXISTS "BookingTransaction" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "bookingId" TEXT NOT NULL,
  "transactionType" TEXT NOT NULL DEFAULT 'BOOKING', -- BOOKING, HOLD, CANCELLATION, REFUND
  "idempotencyKey" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "UQ_BookingTransaction_idempotencyKey" UNIQUE ("idempotencyKey"),
  CONSTRAINT "FK_BookingTransaction_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT
);

-- 12. BOOKING SEATS (Explicit Seat-Level Allocation)
CREATE TABLE IF NOT EXISTS "BookingSeat" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "bookingId" TEXT NOT NULL,
  "showId" TEXT NOT NULL,
  "screenId" TEXT NOT NULL,
  "seatId" TEXT NOT NULL,
  "externalSeatId" TEXT,
  "seatCategory" TEXT NOT NULL,
  "price" DECIMAL(10, 2) NOT NULL CHECK ("price" >= 0),
  "status" TEXT NOT NULL DEFAULT 'HELD', -- HELD, CONFIRMED, CANCELLED, EXPIRED
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UQ_BookingSeat_booking_seat" UNIQUE ("bookingId", "seatId"),
  CONSTRAINT "FK_BookingSeat_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT,
  CONSTRAINT "FK_BookingSeat_seat" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE RESTRICT
);

-- 13. SEAT HOLD (Active Concurrency Lock)
CREATE TABLE IF NOT EXISTS "SeatHold" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "showId" TEXT NOT NULL,
  "screenId" TEXT NOT NULL,
  "seatId" TEXT NOT NULL,
  "externalSeatId" TEXT,
  "bookingId" TEXT NOT NULL,
  "externalHoldId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, RELEASED, EXPIRED, CONVERTED, FAILED
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "releasedAt" TIMESTAMP(3),
  CONSTRAINT "UQ_SeatHold_booking_seat" UNIQUE ("bookingId", "seatId"),
  CONSTRAINT "FK_SeatHold_show" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE RESTRICT,
  CONSTRAINT "FK_SeatHold_seat" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE RESTRICT
);

-- Partial Unique Index: Only ONE active hold per show + seat
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_SeatHold_active_show_seat"
  ON "SeatHold" ("showId", "seatId")
  WHERE ("status" = 'ACTIVE');

-- 14. BOOKING CANCELLATION (Idempotent Ledger)
CREATE TABLE IF NOT EXISTS "BookingCancellation" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "bookingId" TEXT NOT NULL,
  "cancellationId" TEXT NOT NULL, -- e.g. CVCAN-20260930-000001
  "posBookingId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'REQUESTED', -- REQUESTED, PROCESSING, CANCELLED, FAILED, UNKNOWN
  "reason" TEXT,
  "requestedBy" TEXT,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "externalCancellationId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UQ_BookingCancellation_cancellationId" UNIQUE ("cancellationId"),
  CONSTRAINT "UQ_BookingCancellation_idempotencyKey" UNIQUE ("idempotencyKey"),
  CONSTRAINT "FK_BookingCancellation_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT
);

-- 15. BOOKING REFUND (Deterministic Stable Reference Ledger)
CREATE TABLE IF NOT EXISTS "BookingRefund" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "bookingId" TEXT NOT NULL,
  "cancellationId" TEXT,
  "refundId" TEXT NOT NULL, -- e.g. CVREF-<bookingId>
  "paymentId" TEXT,
  "amount" DECIMAL(12, 2) NOT NULL CHECK ("amount" >= 0),
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" TEXT NOT NULL DEFAULT 'PENDING', -- NOT_REQUIRED, PENDING, PROCESSING, SUCCESS, FAILED, UNKNOWN
  "gatewayRefundId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UQ_BookingRefund_refundId" UNIQUE ("refundId"),
  CONSTRAINT "UQ_BookingRefund_idempotencyKey" UNIQUE ("idempotencyKey"),
  CONSTRAINT "FK_BookingRefund_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT
);

-- 16. WEBHOOK EVENTS (Idempotent Delivery)
CREATE TABLE IF NOT EXISTS "WebhookEvent" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "provider" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "externalEventId" TEXT NOT NULL,
  "signatureVerified" BOOLEAN NOT NULL DEFAULT true,
  "payloadHash" TEXT,
  "processingStatus" TEXT NOT NULL DEFAULT 'RECEIVED', -- RECEIVED, PROCESSING, PROCESSED, FAILED, IGNORED
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  "errorCode" TEXT,
  CONSTRAINT "UQ_WebhookEvent_provider_externalId" UNIQUE ("provider", "externalEventId")
);

-- 17. POS SYNC LOGS
CREATE TABLE IF NOT EXISTS "POSSyncLog" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "integrationId" TEXT NOT NULL,
  "syncType" TEXT NOT NULL, -- THEATRE, SCREENS, SEATS, MOVIES, SHOWTIMES, PRICES, AVAILABILITY, FULL
  "status" TEXT NOT NULL DEFAULT 'RUNNING', -- RUNNING, SUCCESS, PARTIAL, FAILED
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
  "recordsCreated" INTEGER NOT NULL DEFAULT 0,
  "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
  "recordsFailed" INTEGER NOT NULL DEFAULT 0,
  "errorCode" TEXT,
  "errorMessage" TEXT,
  CONSTRAINT "FK_POSSyncLog_integration" FOREIGN KEY ("integrationId") REFERENCES "POSIntegration"("id") ON DELETE CASCADE
);

-- 18. POS API REQUEST LOGS
CREATE TABLE IF NOT EXISTS "POSRequestLog" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "integrationId" TEXT NOT NULL,
  "operation" TEXT NOT NULL,
  "requestId" TEXT,
  "httpStatus" INTEGER NOT NULL DEFAULT 200,
  "success" BOOLEAN NOT NULL DEFAULT true,
  "durationMs" INTEGER NOT NULL DEFAULT 0,
  "errorCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FK_POSRequestLog_integration" FOREIGN KEY ("integrationId") REFERENCES "POSIntegration"("id") ON DELETE CASCADE
);

-- 19. INCIDENTS (Telemetry & Alert Deduplication)
CREATE TABLE IF NOT EXISTS "Incident" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "incidentId" TEXT NOT NULL,
  "integrationId" TEXT NOT NULL,
  "theatreId" TEXT NOT NULL,
  "type" TEXT NOT NULL, -- POS_OFFLINE, HIGH_POS_ERROR_RATE, BOOKING_FAILURE, PAYMENT_POS_MISMATCH, REFUND_STUCK, CANCELLATION_STUCK, SYNC_FAILURE, WEBHOOK_FAILURE
  "severity" TEXT NOT NULL DEFAULT 'WARNING', -- INFO, WARNING, CRITICAL
  "status" TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, ACKNOWLEDGED, RESOLVED
  "description" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "acknowledgedAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UQ_Incident_incidentId" UNIQUE ("incidentId"),
  CONSTRAINT "FK_Incident_integration" FOREIGN KEY ("integrationId") REFERENCES "POSIntegration"("id") ON DELETE CASCADE
);

-- 20. AUDIT LOG (Immutable Security & Operation Ledger)
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "actorUserId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "bookingId" TEXT,
  "previousStatus" TEXT,
  "newStatus" TEXT,
  "reason" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 21. BOOKING RECONCILIATION
CREATE TABLE IF NOT EXISTS "BookingReconciliation" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "bookingId" TEXT NOT NULL,
  "paymentId" TEXT,
  "posBookingId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'MATCHED', -- MATCHED, MISMATCH, REQUIRES_REVIEW, RESOLVED
  "problemType" TEXT, -- PAYMENT_SUCCESS_POS_FAILED, PAYMENT_SUCCESS_POS_UNKNOWN, POS_CONFIRMED_CINEVENUE_PENDING, CINEVENUE_CANCELLED_POS_CONFIRMED, REFUND_SUCCESS_CINEVENUE_PENDING, OTHER
  "details" TEXT,
  "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FK_BookingReconciliation_booking" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================

CREATE INDEX IF NOT EXISTS "IDX_Booking_user_createdAt" ON "Booking" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "IDX_Booking_theatre_createdAt" ON "Booking" ("theatreId", "createdAt");
CREATE INDEX IF NOT EXISTS "IDX_Booking_show_status" ON "Booking" ("showId", "status");

CREATE INDEX IF NOT EXISTS "IDX_POSBooking_int_createdAt" ON "POSBooking" ("integrationId", "createdAt");
CREATE INDEX IF NOT EXISTS "IDX_POSBooking_int_extBooking" ON "POSBooking" ("integrationId", "externalBookingId");
CREATE INDEX IF NOT EXISTS "IDX_POSBooking_bookingId" ON "POSBooking" ("bookingId");

CREATE INDEX IF NOT EXISTS "IDX_SeatHold_show_seat_status" ON "SeatHold" ("showId", "seatId", "status");
CREATE INDEX IF NOT EXISTS "IDX_SeatHold_expiresAt_status" ON "SeatHold" ("expiresAt", "status");

CREATE INDEX IF NOT EXISTS "IDX_BookingCancellation_bookingId" ON "BookingCancellation" ("bookingId");
CREATE INDEX IF NOT EXISTS "IDX_BookingCancellation_status_created" ON "BookingCancellation" ("status", "createdAt");

CREATE INDEX IF NOT EXISTS "IDX_BookingRefund_bookingId" ON "BookingRefund" ("bookingId");
CREATE INDEX IF NOT EXISTS "IDX_BookingRefund_paymentId" ON "BookingRefund" ("paymentId");
CREATE INDEX IF NOT EXISTS "IDX_BookingRefund_status_created" ON "BookingRefund" ("status", "createdAt");

CREATE INDEX IF NOT EXISTS "IDX_WebhookEvent_provider_extId" ON "WebhookEvent" ("provider", "externalEventId");
CREATE INDEX IF NOT EXISTS "IDX_WebhookEvent_proc_received" ON "WebhookEvent" ("processingStatus", "receivedAt");

CREATE INDEX IF NOT EXISTS "IDX_POSRequestLog_int_created" ON "POSRequestLog" ("integrationId", "createdAt");
CREATE INDEX IF NOT EXISTS "IDX_POSRequestLog_op_created" ON "POSRequestLog" ("operation", "createdAt");

CREATE INDEX IF NOT EXISTS "IDX_POSSyncLog_int_started" ON "POSSyncLog" ("integrationId", "startedAt");

CREATE INDEX IF NOT EXISTS "IDX_Incident_int_status" ON "Incident" ("integrationId", "status");
CREATE INDEX IF NOT EXISTS "IDX_Incident_type_status" ON "Incident" ("type", "status");

CREATE INDEX IF NOT EXISTS "IDX_BookingReconciliation_status_created" ON "BookingReconciliation" ("status", "createdAt");
CREATE INDEX IF NOT EXISTS "IDX_BookingReconciliation_problem_created" ON "BookingReconciliation" ("problemType", "createdAt");
