ALTER TABLE "User"
  ADD COLUMN "profileImageUrl" TEXT,
  ADD COLUMN "dateOfBirth" TIMESTAMP(3),
  ADD COLUMN "lastLoginAt" TIMESTAMP(3);

CREATE TABLE "AuthProvider" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthProvider_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AuthProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "EmailVerificationToken" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");
CREATE UNIQUE INDEX "AuthProvider_provider_providerAccountId_key" ON "AuthProvider"("provider", "providerAccountId");
CREATE UNIQUE INDEX "AuthProvider_userId_provider_key" ON "AuthProvider"("userId", "provider");
CREATE INDEX "AuthProvider_userId_idx" ON "AuthProvider"("userId");
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");
