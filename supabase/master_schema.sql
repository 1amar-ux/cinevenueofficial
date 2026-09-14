-- =============================================

-- CineVenue Complete Master Database Schema

-- Safe, Idempotent, and Ready for Supabase

-- =============================================



-- 1. Enable Required Extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "pgcrypto";



-- 2. Initial CineVenue Core Schema

-- 
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'THEATRE_ADMIN', 'EVENT_ORGANIZER', 'CUSTOMER');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    CREATE TYPE "TheatreStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    CREATE TYPE "ScreenStatus" AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    CREATE TYPE "SeatCategory" AS ENUM ('REGULAR', 'PREMIUM', 'RECLINER', 'WHEELCHAIR', 'COUPLE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    CREATE TYPE "SeatStatus" AS ENUM ('AVAILABLE', 'BLOCKED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    CREATE TYPE "ShowStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    CREATE TYPE "ShowSeatStatus" AS ENUM ('AVAILABLE', 'LOCKED', 'BOOKED', 'BLOCKED', 'SOLD', 'USED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    CREATE TYPE "BankVerificationStatus" AS ENUM ('NOT_ADDED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
CREATE TABLE IF NOT EXISTS "User" (    "id" TEXT NOT NULL,    "email" TEXT NOT NULL,    "passwordHash" TEXT NOT NULL,    "name" TEXT NOT NULL,    "mobile" TEXT,    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',    "isActive" BOOLEAN NOT NULL DEFAULT true,    "isVerified" BOOLEAN NOT NULL DEFAULT false,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "User_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "RefreshToken" (    "id" TEXT NOT NULL,    "token" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "expiresAt" TIMESTAMP(3) NOT NULL,    "revokedAt" TIMESTAMP(3),    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (    "id" TEXT NOT NULL,    "tokenHash" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "expiresAt" TIMESTAMP(3) NOT NULL,    "usedAt" TIMESTAMP(3),    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "Movie" (    "id" TEXT NOT NULL,    "title" TEXT NOT NULL,    "description" TEXT,    "posterUrl" TEXT,    "backdropUrl" TEXT,    "trailerUrl" TEXT,    "duration" INTEGER NOT NULL,    "rating" DECIMAL(3,1),    "votes" INTEGER NOT NULL DEFAULT 0,    "genres" TEXT[],    "languages" TEXT[],    "formats" TEXT[],    "status" TEXT NOT NULL DEFAULT 'NOW_SHOWING',    "releaseDate" TIMESTAMP(3),    "isActive" BOOLEAN NOT NULL DEFAULT true,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "Theatre" (    "id" TEXT NOT NULL,    "name" TEXT NOT NULL,    "address" TEXT NOT NULL,    "city" TEXT NOT NULL,    "state" TEXT NOT NULL,    "phone" TEXT,    "status" "TheatreStatus" NOT NULL DEFAULT 'ACTIVE',    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "Theatre_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "TheatreBankAccount" (    "id" TEXT NOT NULL,    "theatreId" TEXT NOT NULL,    "accountHolderName" TEXT NOT NULL,    "bankName" TEXT NOT NULL,    "encryptedAccountNumber" TEXT NOT NULL,    "maskedAccountNumber" TEXT NOT NULL,    "ifscCode" TEXT NOT NULL,    "accountType" TEXT NOT NULL DEFAULT 'Current',    "branchName" TEXT NOT NULL,    "branchAddress" TEXT,    "beneficiaryName" TEXT NOT NULL,    "pan" TEXT,    "gstin" TEXT,    "upiId" TEXT,    "verificationStatus" "BankVerificationStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',    "isPrimary" BOOLEAN NOT NULL DEFAULT false,    "verifiedBy" TEXT,    "verifiedAt" TIMESTAMP(3),    "verificationNotes" TEXT,    "isActive" BOOLEAN NOT NULL DEFAULT true,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "TheatreBankAccount_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "Screen" (    "id" TEXT NOT NULL,    "theatreId" TEXT NOT NULL,    "name" TEXT NOT NULL,    "capacity" INTEGER NOT NULL,    "status" "ScreenStatus" NOT NULL DEFAULT 'ACTIVE',    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "Screen_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "Seat" (    "id" TEXT NOT NULL,    "screenId" TEXT NOT NULL,    "row" TEXT NOT NULL,    "number" TEXT NOT NULL,    "category" "SeatCategory" NOT NULL DEFAULT 'REGULAR',    "price" DECIMAL(10,2) NOT NULL,    "status" "SeatStatus" NOT NULL DEFAULT 'AVAILABLE',    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "Show" (    "id" TEXT NOT NULL,    "theatreId" TEXT NOT NULL,    "screenId" TEXT NOT NULL,    "movieId" TEXT,    "eventId" TEXT,    "startTime" TIMESTAMP(3) NOT NULL,    "endTime" TIMESTAMP(3) NOT NULL,    "language" TEXT,    "format" TEXT,    "status" "ShowStatus" NOT NULL DEFAULT 'ACTIVE',    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "Show_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "ShowSeat" (    "id" TEXT NOT NULL,    "showId" TEXT NOT NULL,    "seatId" TEXT NOT NULL,    "price" DECIMAL(10,2) NOT NULL,    "status" "ShowSeatStatus" NOT NULL DEFAULT 'AVAILABLE',    "lockedUntil" TIMESTAMP(3),    "lockedBy" TEXT,    CONSTRAINT "ShowSeat_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "Booking" (    "id" TEXT NOT NULL,    "bookingNumber" TEXT NOT NULL,    "theatreId" TEXT NOT NULL,    "showId" TEXT NOT NULL,    "userId" TEXT,    "ticketAmount" DECIMAL(12,2) NOT NULL,    "platformFee" DECIMAL(12,2) NOT NULL,    "convenienceFee" DECIMAL(12,2) NOT NULL,    "taxAmount" DECIMAL(12,2) NOT NULL,    "discountAmount" DECIMAL(12,2) NOT NULL,    "gatewayFee" DECIMAL(12,2) NOT NULL,    "totalAmount" DECIMAL(12,2) NOT NULL,    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "BookingItem" (    "id" TEXT NOT NULL,    "bookingId" TEXT NOT NULL,    "showSeatId" TEXT NOT NULL,    "price" DECIMAL(10,2) NOT NULL,    CONSTRAINT "BookingItem_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "Payment" (    "id" TEXT NOT NULL,    "bookingId" TEXT NOT NULL,    "provider" TEXT NOT NULL DEFAULT 'RAZORPAY',    "providerId" TEXT,    "orderId" TEXT,    "signature" TEXT,    "amount" DECIMAL(12,2) NOT NULL,    "currency" TEXT NOT NULL DEFAULT 'INR',    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "Ticket" (    "id" TEXT NOT NULL,    "bookingId" TEXT NOT NULL,    "ticketCode" TEXT NOT NULL,    "qrToken" TEXT NOT NULL,    "isUsed" BOOLEAN NOT NULL DEFAULT false,    "usedAt" TIMESTAMP(3),    "scannedBy" TEXT,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "Settlement" (    "id" TEXT NOT NULL,    "theatreId" TEXT NOT NULL,    "periodStart" TIMESTAMP(3) NOT NULL,    "periodEnd" TIMESTAMP(3) NOT NULL,    "grossSales" DECIMAL(12,2) NOT NULL,    "commission" DECIMAL(12,2) NOT NULL,    "refunds" DECIMAL(12,2) NOT NULL,    "netAmount" DECIMAL(12,2) NOT NULL,    "status" TEXT NOT NULL DEFAULT 'PENDING',    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "FinancialAuditLog" (    "id" TEXT NOT NULL,    "eventType" TEXT NOT NULL,    "amount" DECIMAL(12,2),    "referenceId" TEXT,    "description" TEXT NOT NULL,    "actorEmail" TEXT NOT NULL,    "metadata" JSONB,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT "FinancialAuditLog_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "CineCoinWallet" (    "id" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "balance" INTEGER NOT NULL DEFAULT 0,    "lifetimeEarned" INTEGER NOT NULL DEFAULT 0,    "totalRedeemed" INTEGER NOT NULL DEFAULT 0,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "CineCoinWallet_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "CineCoinTransaction" (    "id" TEXT NOT NULL,    "walletId" TEXT NOT NULL,    "amount" INTEGER NOT NULL,    "type" TEXT NOT NULL,    "activityKey" TEXT,    "referenceId" TEXT,    "description" TEXT NOT NULL,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT "CineCoinTransaction_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "Event" (    "id" TEXT NOT NULL,    "title" TEXT NOT NULL,    "description" TEXT NOT NULL,    "category" TEXT NOT NULL,    "bannerUrl" TEXT,    "date" TIMESTAMP(3) NOT NULL,    "time" TEXT NOT NULL,    "city" TEXT NOT NULL,    "venue" TEXT NOT NULL,    "price" DECIMAL(10,2) NOT NULL,    "capacity" INTEGER NOT NULL,    "organizerId" TEXT NOT NULL,    "status" "EventStatus" NOT NULL DEFAULT 'PUBLISHED',    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "Event_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "EventTicketType" (    "id" TEXT NOT NULL,    "eventId" TEXT NOT NULL,    "name" TEXT NOT NULL,    "price" DECIMAL(10,2) NOT NULL,    "capacity" INTEGER NOT NULL,    "available" INTEGER NOT NULL,    CONSTRAINT "EventTicketType_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "EventRegistration" (    "id" TEXT NOT NULL,    "eventId" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "ticketCount" INTEGER NOT NULL,    "totalAmount" DECIMAL(10,2) NOT NULL,    "status" "RegistrationStatus" NOT NULL DEFAULT 'CONFIRMED',    "passCode" TEXT NOT NULL,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "FilmProject" (    "id" TEXT NOT NULL,    "title" TEXT NOT NULL,    "genre" TEXT NOT NULL,    "synopsis" TEXT NOT NULL,    "budget" DECIMAL(14,2),    "director" TEXT,    "producer" TEXT,    "status" TEXT NOT NULL DEFAULT 'PRE_PRODUCTION',    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "FilmProject_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "CastingCall" (    "id" TEXT NOT NULL,    "projectId" TEXT NOT NULL,    "roleName" TEXT NOT NULL,    "category" TEXT NOT NULL,    "description" TEXT NOT NULL,    "ageRange" TEXT,    "gender" TEXT,    "deadline" TIMESTAMP(3),    "status" TEXT NOT NULL DEFAULT 'OPEN',    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT "CastingCall_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "JobApplication" (    "id" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "castingCallId" TEXT,    "projectId" TEXT,    "coverLetter" TEXT,    "portfolioUrl" TEXT,    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id"));

-- 
CREATE TABLE IF NOT EXISTS "PlatformSetting" (    "id" TEXT NOT NULL,    "key" TEXT NOT NULL,    "value" TEXT NOT NULL,    "description" TEXT,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id"));

-- 
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- 
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- 
CREATE INDEX IF NOT EXISTS "User_mobile_idx" ON "User"("mobile");

-- 
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

-- 
CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_token_key" ON "RefreshToken"("token");

-- 
CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- 
CREATE INDEX IF NOT EXISTS "RefreshToken_token_idx" ON "RefreshToken"("token");

-- 
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- 
CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- 
CREATE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_idx" ON "PasswordResetToken"("tokenHash");

-- 
CREATE INDEX IF NOT EXISTS "Movie_title_idx" ON "Movie"("title");

-- 
CREATE INDEX IF NOT EXISTS "Movie_status_idx" ON "Movie"("status");

-- 
CREATE INDEX IF NOT EXISTS "Theatre_city_idx" ON "Theatre"("city");

-- 
CREATE INDEX IF NOT EXISTS "Theatre_status_idx" ON "Theatre"("status");

-- 
CREATE INDEX IF NOT EXISTS "TheatreBankAccount_theatreId_idx" ON "TheatreBankAccount"("theatreId");

-- 
CREATE INDEX IF NOT EXISTS "TheatreBankAccount_verificationStatus_idx" ON "TheatreBankAccount"("verificationStatus");

-- 
CREATE INDEX IF NOT EXISTS "Screen_theatreId_idx" ON "Screen"("theatreId");

-- 
CREATE INDEX IF NOT EXISTS "Seat_screenId_idx" ON "Seat"("screenId");

-- 
CREATE UNIQUE INDEX IF NOT EXISTS "Seat_screenId_row_number_key" ON "Seat"("screenId", "row", "number");

-- 
CREATE INDEX IF NOT EXISTS "Show_theatreId_idx" ON "Show"("theatreId");

-- 
CREATE INDEX IF NOT EXISTS "Show_screenId_idx" ON "Show"("screenId");

-- 
CREATE INDEX IF NOT EXISTS "Show_movieId_idx" ON "Show"("movieId");

-- 
CREATE INDEX IF NOT EXISTS "Show_startTime_idx" ON "Show"("startTime");

-- 
CREATE INDEX IF NOT EXISTS "ShowSeat_showId_status_idx" ON "ShowSeat"("showId", "status");

-- 
CREATE UNIQUE INDEX IF NOT EXISTS "ShowSeat_showId_seatId_key" ON "ShowSeat"("showId", "seatId");

-- 
CREATE UNIQUE INDEX IF NOT EXISTS "Booking_bookingNumber_key" ON "Booking"("bookingNumber");

-- 
CREATE INDEX IF NOT EXISTS "Booking_theatreId_idx" ON "Booking"("theatreId");

-- 
CREATE INDEX IF NOT EXISTS "Booking_showId_idx" ON "Booking"("showId");

-- 
CREATE INDEX IF NOT EXISTS "Booking_userId_idx" ON "Booking"("userId");

-- 
CREATE INDEX IF NOT EXISTS "Booking_bookingNumber_idx" ON "Booking"("bookingNumber");

-- 
CREATE INDEX IF NOT EXISTS "Booking_status_idx" ON "Booking"("status");

-- 
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_bookingId_key" ON "Payment"("bookingId");

-- 
CREATE INDEX IF NOT EXISTS "Payment_providerId_idx" ON "Payment"("providerId");

-- 
CREATE INDEX IF NOT EXISTS "Payment_orderId_idx" ON "Payment"("orderId");

-- 
CREATE UNIQUE INDEX IF NOT EXISTS "Ticket_bookingId_key" ON "Ticket"("bookingId");

-- 
CREATE UNIQUE INDEX IF NOT EXISTS "Ticket_ticketCode_key" ON "Ticket"("ticketCode");

-- 
CREATE UNIQUE INDEX IF NOT EXISTS "Ticket_qrToken_key" ON "Ticket"("qrToken");

-- 
CREATE INDEX IF NOT EXISTS "Ticket_ticketCode_idx" ON "Ticket"("ticketCode");

-- 
CREATE INDEX IF NOT EXISTS "Ticket_qrToken_idx" ON "Ticket"("qrToken");

-- 
CREATE INDEX IF NOT EXISTS "Settlement_theatreId_idx" ON "Settlement"("theatreId");

-- 
CREATE INDEX IF NOT EXISTS "Settlement_status_idx" ON "Settlement"("status");

-- 
CREATE INDEX IF NOT EXISTS "FinancialAuditLog_eventType_idx" ON "FinancialAuditLog"("eventType");

-- 
CREATE INDEX IF NOT EXISTS "FinancialAuditLog_referenceId_idx" ON "FinancialAuditLog"("referenceId");

-- 
CREATE UNIQUE INDEX IF NOT EXISTS "CineCoinWallet_userId_key" ON "CineCoinWallet"("userId");

-- 
CREATE INDEX IF NOT EXISTS "CineCoinWallet_userId_idx" ON "CineCoinWallet"("userId");

-- 
CREATE INDEX IF NOT EXISTS "CineCoinTransaction_walletId_idx" ON "CineCoinTransaction"("walletId");

-- 
CREATE INDEX IF NOT EXISTS "Event_city_idx" ON "Event"("city");

-- 
CREATE INDEX IF NOT EXISTS "Event_status_idx" ON "Event"("status");

-- 
CREATE INDEX IF NOT EXISTS "EventTicketType_eventId_idx" ON "EventTicketType"("eventId");

-- 
CREATE UNIQUE INDEX IF NOT EXISTS "EventRegistration_passCode_key" ON "EventRegistration"("passCode");

-- 
CREATE INDEX IF NOT EXISTS "EventRegistration_eventId_idx" ON "EventRegistration"("eventId");

-- 
CREATE INDEX IF NOT EXISTS "EventRegistration_userId_idx" ON "EventRegistration"("userId");

-- 
CREATE INDEX IF NOT EXISTS "CastingCall_projectId_idx" ON "CastingCall"("projectId");

-- 
CREATE INDEX IF NOT EXISTS "JobApplication_userId_idx" ON "JobApplication"("userId");

-- 
CREATE UNIQUE INDEX IF NOT EXISTS "PlatformSetting_key_key" ON "PlatformSetting"("key");

-- 
DO $$ BEGIN
    ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "TheatreBankAccount" ADD CONSTRAINT "TheatreBankAccount_theatreId_fkey" FOREIGN KEY ("theatreId") REFERENCES "Theatre"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "Screen" ADD CONSTRAINT "Screen_theatreId_fkey" FOREIGN KEY ("theatreId") REFERENCES "Theatre"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "Seat" ADD CONSTRAINT "Seat_screenId_fkey" FOREIGN KEY ("screenId") REFERENCES "Screen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "Show" ADD CONSTRAINT "Show_theatreId_fkey" FOREIGN KEY ("theatreId") REFERENCES "Theatre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "Show" ADD CONSTRAINT "Show_screenId_fkey" FOREIGN KEY ("screenId") REFERENCES "Screen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "Show" ADD CONSTRAINT "Show_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "ShowSeat" ADD CONSTRAINT "ShowSeat_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "ShowSeat" ADD CONSTRAINT "ShowSeat_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "Booking" ADD CONSTRAINT "Booking_theatreId_fkey" FOREIGN KEY ("theatreId") REFERENCES "Theatre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "Booking" ADD CONSTRAINT "Booking_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "BookingItem" ADD CONSTRAINT "BookingItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "BookingItem" ADD CONSTRAINT "BookingItem_showSeatId_fkey" FOREIGN KEY ("showSeatId") REFERENCES "ShowSeat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_theatreId_fkey" FOREIGN KEY ("theatreId") REFERENCES "Theatre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "CineCoinWallet" ADD CONSTRAINT "CineCoinWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "CineCoinTransaction" ADD CONSTRAINT "CineCoinTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "CineCoinWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "EventTicketType" ADD CONSTRAINT "EventTicketType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "CastingCall" ADD CONSTRAINT "CastingCall_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "FilmProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_castingCallId_fkey" FOREIGN KEY ("castingCallId") REFERENCES "CastingCall"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 
DO $$ BEGIN
    ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "FilmProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;



-- 3. Auth Identity and Verification

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "profileImageUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "AuthProvider" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthProvider_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AuthProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "EmailVerificationToken" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_mobile_key" ON "User"("mobile");
CREATE UNIQUE INDEX IF NOT EXISTS "AuthProvider_provider_providerAccountId_key" ON "AuthProvider"("provider", "providerAccountId");
CREATE UNIQUE INDEX IF NOT EXISTS "AuthProvider_userId_provider_key" ON "AuthProvider"("userId", "provider");
CREATE INDEX IF NOT EXISTS "AuthProvider_userId_idx" ON "AuthProvider"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");




-- 4. Centralized App Settings

-- =====================================================
-- Migration: 20260904120000_create_app_settings.sql
-- CineVenue Centralized Global Application Settings
-- =====================================================

-- 1. Create app_settings singleton table
CREATE TABLE IF NOT EXISTS "app_settings" (
    "id" TEXT PRIMARY KEY DEFAULT 'global_default',
    "maintenance_mode" BOOLEAN NOT NULL DEFAULT FALSE,
    "maintenance_title" TEXT DEFAULT 'Movie Booking Temporarily Unavailable',
    "maintenance_message" TEXT DEFAULT 'We are upgrading our ticket booking experience. Movie booking will be available shortly.',
    "maintenance_countdown_enabled" BOOLEAN NOT NULL DEFAULT FALSE,
    "maintenance_end_time" TIMESTAMPTZ NULL,
    "service_controls" JSONB NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_by" TEXT NULL
);

-- 2. Insert the authoritative singleton row if it does not already exist
INSERT INTO "app_settings" (
    "id",
    "maintenance_mode",
    "maintenance_title",
    "maintenance_message",
    "maintenance_countdown_enabled",
    "maintenance_end_time",
    "service_controls",
    "updated_at",
    "updated_by"
) VALUES (
    'global_default',
    FALSE,
    'Movie Booking Temporarily Unavailable',
    'We are upgrading our ticket booking experience. Movie booking will be available shortly.',
    FALSE,
    NOW() + INTERVAL '2 hours',
    '{"website": {"status": true}, "movieBooking": {"status": true}, "eventBooking": {"status": true}, "filmProduction": {"status": true}, "eventManagement": {"status": true}, "brandPromotion": {"status": true}}'::jsonb,
    NOW(),
    'system_init'
) ON CONFLICT ("id") DO NOTHING;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE "app_settings" ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: All users (anonymous and authenticated) have read access
DROP POLICY IF EXISTS "Public read app_settings" ON "app_settings";
CREATE POLICY "Public read app_settings"
    ON "app_settings"
    FOR SELECT
    TO public
    USING (true);

-- 5. RLS Policy: Only authorized Super Admins and Admins can mutate global settings
DROP POLICY IF EXISTS "Admins manage app_settings" ON "app_settings";
CREATE POLICY "Admins manage app_settings"
    ON "app_settings"
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE "User"."id" = auth.uid()::text
            AND "User"."role" IN ('SUPER_ADMIN', 'ADMIN')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE "User"."id" = auth.uid()::text
            AND "User"."role" IN ('SUPER_ADMIN', 'ADMIN')
        )
    );

-- 6. Enable Realtime Replication for app_settings
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE "app_settings";
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;




-- 5. Subwebsite Settings

-- =====================================================
-- Migration: 20260904130000_add_global_subwebsite_settings.sql
-- CineVenue Centralized Global Sub-Website Control System
-- =====================================================

-- 1. Alter app_settings table to add global_subwebsite_enabled and subwebsite_maintenance_message
ALTER TABLE "app_settings" 
ADD COLUMN IF NOT EXISTS "global_subwebsite_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS "subwebsite_maintenance_message" TEXT DEFAULT 'CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.';

-- Ensure the singleton record has the values
UPDATE "app_settings"
SET "global_subwebsite_enabled" = COALESCE("global_subwebsite_enabled", TRUE),
    "subwebsite_maintenance_message" = COALESCE("subwebsite_maintenance_message", 'CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.')
WHERE "id" = 'global_default';

-- 2. Create website_settings compatibility table if referenced directly
CREATE TABLE IF NOT EXISTS "website_settings" (
    "id" TEXT PRIMARY KEY DEFAULT 'global_default',
    "global_subwebsite_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "subwebsite_maintenance_message" TEXT DEFAULT 'CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.',
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_by" TEXT NULL
);

INSERT INTO "website_settings" (
    "id",
    "global_subwebsite_enabled",
    "subwebsite_maintenance_message",
    "updated_at",
    "updated_by"
) VALUES (
    'global_default',
    TRUE,
    'CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.',
    NOW(),
    'system_init'
) ON CONFLICT ("id") DO NOTHING;

-- Enable RLS for website_settings
ALTER TABLE "website_settings" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read website_settings" ON "website_settings";
CREATE POLICY "Public read website_settings"
    ON "website_settings"
    FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Admins manage website_settings" ON "website_settings";
CREATE POLICY "Admins manage website_settings"
    ON "website_settings"
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE "User"."id" = auth.uid()::text
            AND "User"."role" IN ('SUPER_ADMIN', 'ADMIN')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE "User"."id" = auth.uid()::text
            AND "User"."role" IN ('SUPER_ADMIN', 'ADMIN')
        )
    );

-- Add to Realtime replication
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE "website_settings";
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
