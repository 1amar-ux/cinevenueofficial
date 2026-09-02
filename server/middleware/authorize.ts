import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../shared/errors";

export type Role = "SUPER_ADMIN" | "ADMIN" | "THEATRE_ADMIN" | "EVENT_ORGANIZER" | "CUSTOMER";

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required before authorization"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required: [${allowedRoles.join(", ")}]`
        )
      );
    }

    next();
  };
}
