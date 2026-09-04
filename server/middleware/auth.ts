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

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.headers.cookie?.split(";").map(v => v.trim()).find(v => v.startsWith("cine_access_token="))?.split("=")[1];
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    const token = bearerToken || cookieToken;
    if (!token) {
      throw new UnauthorizedError("Authentication token is missing. Format: Bearer <token>");
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthenticatedUserPayload;
    req.user = decoded;
    next();
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
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthenticatedUserPayload;
        req.user = decoded;
      }
    }
    next();
  } catch {
    // Optional auth silently continues
    next();
  }
}
