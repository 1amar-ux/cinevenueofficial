import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

/**
 * Strict rate limiter for Authentication Endpoints (Login, Register, Refresh, Forgot Password)
 * Prevents credential stuffing and brute-force attacks.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "test" ? 1000 : 25, // 25 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "TooManyRequests",
    message: "Too many authentication attempts from this IP. Please try again after 15 minutes."
  },
  skip: (req: Request) => {
    // Never throttle internal health checks or non-mutating preflights
    return req.method === "OPTIONS";
  }
});

/**
 * Rate limiter for Payment Order Creation & Checkout Initialization
 * Prevents checkout spam and inventory exhaustion attempts.
 */
export const paymentInitRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "test" ? 1000 : 30, // 30 orders per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "TooManyRequests",
    message: "Too many payment initialization requests. Please wait a moment before trying again."
  },
  skip: (req: Request) => {
    // CRITICAL: Webhooks from payment gateways and POS systems must NEVER be rate-limited!
    const p = req.path.toLowerCase();
    if (
      p.includes("webhook") ||
      p.includes("/webhooks/") ||
      req.headers["x-razorpay-signature"] ||
      req.headers["x-webhook-signature"]
    ) {
      return true;
    }
    return req.method === "OPTIONS";
  }
});

