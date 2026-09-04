import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "crypto";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { ConflictError, UnauthorizedError, NotFoundError, ValidationError } from "../../shared/errors";
import { logger } from "../../shared/logger";

const SALT_ROUNDS = 12;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private generateEmailVerificationToken() {
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    return { rawToken, tokenHash };
  }

  private generateTokens(user: { id: string; email: string; role: any; name: string }): TokenPair {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any
    });

    const refreshToken = jwt.sign(
      { userId: user.id, type: "refresh" },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any }
    );

    return { accessToken, refreshToken };
  }

  public async register(data: { email: string; password: string; name: string; mobile?: string }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (existing) {
      throw new ConflictError("An account with this email address already exists.");
    }

    if (data.mobile) {
      const existingMobile = await prisma.user.findFirst({ where: { mobile: data.mobile } });
      if (existingMobile) throw new ConflictError("An account with this mobile number already exists.");
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        mobile: data.mobile || null,
        role: "CUSTOMER",
        wallet: {
          create: {
            balance: 100, // 100 welcome CineCoins
            lifetimeEarned: 100,
            totalRedeemed: 0
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        mobile: true,
        role: true,
        createdAt: true
      }
    });

    const tokens = this.generateTokens(user);

    const { rawToken, tokenHash } = this.generateEmailVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.emailVerificationToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt
      }
    });

    // Store refresh token
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: refreshExpiresAt
      }
    });

    logger.info(`User registered successfully: ${user.email}`);

    return {
      user,
      tokens,
      verificationToken: rawToken
    };
  }

  public async login(data: { email: string; password: string }) {
    const identifier = (data as any).identifier?.trim() || data.email?.trim();
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier.toLowerCase() }, { mobile: identifier }] }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isVerified) {
      throw new UnauthorizedError("Please verify your email address before logging in.");
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokens = this.generateTokens(user);

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    logger.info(`User logged in successfully: ${user.email} (Role: ${user.role})`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified
      },
      tokens
    };
  }

  public async verifyEmail(token: string) {
    if (!token) {
      throw new ValidationError("Verification token is required");
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const verificationRecord = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash }
    });

    if (!verificationRecord || verificationRecord.usedAt || new Date() > verificationRecord.expiresAt) {
      throw new ValidationError("Email verification token is invalid or has expired");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationRecord.userId },
        data: { isVerified: true }
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationRecord.id },
        data: { usedAt: new Date() }
      })
    ]);

    return { success: true, message: "Email verified successfully." };
  }

  public async resendVerification(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return { success: true, message: "If an account with that email exists, a verification link has been dispatched." };
    }

    if (user.isVerified) {
      return { success: true, message: "This account has already been verified." };
    }

    const { rawToken, tokenHash } = this.generateEmailVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.emailVerificationToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt
      }
    });

    return {
      success: true,
      message: "Verification instructions have been sent again.",
      ...(process.env.NODE_ENV === "development" ? { verificationToken: rawToken } : {})
    };
  }

  public async getGoogleAuthRedirectUrl() {
    const clientId = env.GOOGLE_CLIENT_ID;
    const redirectUri = env.GOOGLE_CALLBACK_URL;

    if (!clientId || !redirectUri) {
      throw new ValidationError("Google OAuth is not configured");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent"
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  public async googleLogin(data: { idToken?: string; code?: string; state?: string; email?: string; name?: string; image?: string }) {
    if (!data?.email && !data?.idToken && !data?.code) {
      throw new ValidationError("Google authentication payload is missing required fields");
    }

    const email = (data.email || "").trim().toLowerCase();
    const name = data.name || "Google User";
    const profileImageUrl = data.image || null;

    let user = email ? await prisma.user.findUnique({ where: { email } }) : null;

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email || `${Date.now()}@google.local`,
          passwordHash: await bcrypt.hash(randomBytes(16).toString("hex"), SALT_ROUNDS),
          name,
          profileImageUrl,
          role: "CUSTOMER",
          isVerified: true,
          wallet: {
            create: {
              balance: 100,
              lifetimeEarned: 100,
              totalRedeemed: 0
            }
          }
        },
        select: {
          id: true,
          email: true,
          name: true,
          mobile: true,
          role: true,
          isVerified: true,
          profileImageUrl: true
        }
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.name || name,
          profileImageUrl: profileImageUrl || user.profileImageUrl,
          isVerified: true
        },
        select: {
          id: true,
          email: true,
          name: true,
          mobile: true,
          role: true,
          isVerified: true,
          profileImageUrl: true
        }
      });
    }

    const provider = "google";
    const providerAccountId = String(data.idToken || data.code || email || user.id);
    await prisma.authProvider.upsert({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId
        }
      },
      update: { userId: user.id },
      create: {
        userId: user.id,
        provider,
        providerAccountId
      }
    });

    const tokens = this.generateTokens(user);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified,
        profileImageUrl: user.profileImageUrl
      },
      tokens
    };
  }

  public async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
      
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token }
      });

      if (!storedToken || storedToken.revokedAt || new Date() > storedToken.expiresAt) {
        throw new UnauthorizedError("Refresh token is invalid or has expired");
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedError("User account is inactive or not found");
      }

      // Rotate refresh token
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() }
      });

      const newTokens = this.generateTokens(user);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await prisma.refreshToken.create({
        data: {
          token: newTokens.refreshToken,
          userId: user.id,
          expiresAt
        }
      });

      return newTokens;
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
  }

  public async logout(token: string) {
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { token },
        data: { revokedAt: new Date() }
      });
    }
    return { success: true, message: "Logged out successfully" };
  }

  public async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        mobile: true,
        role: true,
        createdAt: true,
        wallet: {
          select: {
            balance: true,
            lifetimeEarned: true,
            totalRedeemed: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundError("User", userId);
    }

    return user;
  }

  public async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Return success to avoid email enumeration
      return { success: true, message: "If an account with that email exists, reset instructions have been dispatched." };
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minute expiry

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt
      }
    });

    logger.info(`Password reset token generated for ${user.email}`);

    return {
      success: true,
      message: "Password reset verification initiated.",
      // For development resilience/testing:
      ...(process.env.NODE_ENV === "development" ? { resetToken: rawToken } : {})
    };
  }

  public async resetPassword(token: string, newPass: string) {
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash }
    });

    if (!resetRecord || resetRecord.usedAt || new Date() > resetRecord.expiresAt) {
      throw new ValidationError("Password reset token is invalid or has expired");
    }

    const passwordHash = await bcrypt.hash(newPass, SALT_ROUNDS);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() }
      })
    ]);

    logger.info(`Password reset successfully executed for user: ${resetRecord.userId}`);

    return { success: true, message: "Password updated successfully. Please log in with your new password." };
  }
}

export const authService = new AuthService();
