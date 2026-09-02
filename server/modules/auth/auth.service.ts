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

    logger.info(`User registered successfully: ${user.email}`);

    return {
      user,
      tokens
    };
  }

  public async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokens = this.generateTokens(user);

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
        role: user.role
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
