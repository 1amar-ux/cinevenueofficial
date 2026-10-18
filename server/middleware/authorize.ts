import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../shared/errors";

export type Role = "SUPER_ADMIN" | "ADMIN" | "THEATRE_ADMIN" | "THEATRE_MANAGER" | "EVENT_ORGANIZER" | "CUSTOMER";

export function authorize(...allowedRoles: (Role | Role[])[]) {
  const flatRoles = allowedRoles.flat();
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required before authorization"));
    }

    if (!flatRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required: [${flatRoles.join(", ")}]`
        )
      );
    }

    next();
  };
}

/**
 * Enforces theatre-level access control.
 * Verifies that the authenticated theatre administrator or manager is assigned
 * to the specific theatre requested via params, query, or body.
 * Super Admins and System Admins retain multi-tenant global access.
 */
export function authorizeTheatre(paramName: string = "theatreId") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required before authorization"));
    }

    // Super Admin and System Admin have global multi-tenant access
    if (req.user.role === "SUPER_ADMIN" || req.user.role === "ADMIN") {
      return next();
    }

    // Extract from params, path URL, query, and body
    const pathIdMatch = (req.originalUrl || req.path || "").match(/\/theatres\/([^\/?#]+)/i);
    const pathId = pathIdMatch && pathIdMatch[1] !== "operations" ? pathIdMatch[1] : undefined;

    const candidateTargets = [
      req.params[paramName],
      pathId,
      req.query[paramName],
      req.body?.[paramName]
    ].filter(Boolean);

    if (candidateTargets.length === 0) {
      return next();
    }

    const normalize = (val: string | number) => String(val).toLowerCase().trim().replace(/^th_/, "");
    const userTheatre = req.user.theatreId ? normalize(req.user.theatreId) : undefined;

    for (const rawTarget of candidateTargets) {
      const targetTheatre = normalize(rawTarget);
      if (!userTheatre || userTheatre !== targetTheatre) {
        return next(
          new ForbiddenError(
            `Access denied. You are only authorized to manage theatre '${req.user.theatreId || "None"}', not venue '${rawTarget}'.`
          )
        );
      }
    }

    next();
  };
}

export function preventManagerFinancials(req?: any, res?: any, next?: any): any {
  const handler = (r: Request, s: Response, n: NextFunction) => {
    if (r.user?.role === "THEATRE_MANAGER") {
      return n(
        new ForbiddenError(
          "Access denied. Operations Managers are restricted from viewing or altering owner-only bank accounts, settlement routing, or platform commission settings."
        )
      );
    }
    n();
  };

  if (req && res && typeof next === "function") {
    return handler(req, res, next);
  }

  return handler;
}
