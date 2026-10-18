import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UnauthorizedError } from "../shared/errors";

export interface AuthenticatedUserPayload {
  userId: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "THEATRE_ADMIN" | "EVENT_ORGANIZER" | "CUSTOMER";
  name?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserPayload;
    }
  }
}

export function isValidAdminPasscode(passcode: string | undefined): boolean {
  if (!passcode) return false;
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    return (
      passcode === "8888" ||
      passcode === "admin8888" ||
      passcode === (process.env.ADMIN_PASSCODE || "8888") ||
      (!!process.env.SUPER_ADMIN_PASSWORD && passcode === process.env.SUPER_ADMIN_PASSWORD)
    );
  }
  // Production mode: never accept hardcoded defaults; require explicit non-default secret
  const configured = process.env.ADMIN_PASSCODE;
  const superPassword = process.env.SUPER_ADMIN_PASSWORD;
  if (!configured && !superPassword) return false;
  return (
    (!!configured && configured !== "8888" && configured !== "admin8888" && passcode === configured) ||
    (!!superPassword && passcode === superPassword)
  );
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.headers.cookie?.split(";").map(v => v.trim()).find(v => v.startsWith("cine_access_token="))?.split("=")[1];
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    const token = bearerToken || cookieToken;

    if (token) {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthenticatedUserPayload;
      req.user = decoded;
      return next();
    }

    const passcode = req.headers["x-admin-passcode"] as string | undefined;
    if (isValidAdminPasscode(passcode)) {
      req.user = {
        userId: "superadmin_direct",
        email: process.env.SUPER_ADMIN_EMAIL || "superadmin@cinevenue.com",
        role: "SUPER_ADMIN",
        name: "Super Admin"
      };
      return next();
    }

    throw new UnauthorizedError("Authentication token is missing. Format: Bearer <token>");
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Authentication token has expired. Please refresh your session."));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("Invalid authentication token"));
    }
    next(error);
  }
}

export function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.headers.cookie?.split(";").map(v => v.trim()).find(v => v.startsWith("cine_access_token="))?.split("=")[1];
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    const token = bearerToken || cookieToken;
    if (token) {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthenticatedUserPayload;
      req.user = decoded;
    }
    next();
  } catch {
    // Optional auth silently continues
    next();
  }
}
