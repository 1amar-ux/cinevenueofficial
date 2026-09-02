import { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors";
import { logger } from "../shared/logger";

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const requestId = req.id || "unknown";

  if (err instanceof AppError) {
    logger.warn(`Operational Error: ${err.message}`, {
      code: err.code,
      statusCode: err.statusCode,
      details: err.details,
      path: req.originalUrl,
      method: req.method
    }, requestId);

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {})
      }
    });
  }

  // Unhandled / Internal Server Errors
  logger.error(`Unhandled Exception: ${err.message}`, {
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method
  }, requestId);

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: process.env.NODE_ENV === "production" 
        ? "An internal server error occurred. Please try again later."
        : err.message
    }
  });
}
