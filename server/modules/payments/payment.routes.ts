import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { env } from "../../config/env";
import { prisma } from "../../config/database";
import { bookingService } from "../bookings/booking.service";
import { NotFoundError, PaymentError, ValidationError } from "../../shared/errors";
import { logger } from "../../shared/logger";
import { authenticate, optionalAuthenticate } from "../../middleware/auth";
import { checkMovieBookingMaintenance } from "../../middleware/maintenance";
import { cashfreeService } from "./cashfree.service";

const router = Router();

// =========================================================================
// ACTIVE GATEWAY CONFIGURATION
// =========================================================================

router.get("/gateways", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      defaultGateway: "CASHFREE",
      gateways: {
        cashfree: {
          enabled: true,
          isConfigured: cashfreeService.isConfigured(),
          environment: env.CASHFREE_ENV || "TEST",
          appId: env.CASHFREE_APP_ID || null
        }
      }
    }
  });
});

// Legacy /create-order routed directly to Cashfree
router.post("/create-order", optionalAuthenticate, checkMovieBookingMaintenance, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId, customerName, customerPhone, customerEmail, amount, showId, tickets } = req.body;

    let amountInINR = 0;
    let resolvedBookingId = bookingId || null;

    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
      });

      if (booking) {
        if (booking.status === "CONFIRMED") {
          throw new ValidationError("This booking has already been paid and confirmed.");
        }
        amountInINR = Number(booking.totalAmount);
      }
    }

    if (!amountInINR) {
      if (amount && Number(amount) > 0) {
        amountInINR = Number(amount) > 1000 ? Number(amount) / 100 : Number(amount);
      } else if (Array.isArray(tickets) && tickets.length > 0) {
        amountInINR = tickets.reduce((s: number, t: any) => s + (Number(t.price) || 0), 0);
      } else {
        amountInINR = 250;
      }
    }

    const orderId = `CF_${resolvedBookingId || "BKG"}_${Date.now()}`.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 45);

    const cashfreeOrder = await cashfreeService.createOrder({
      orderId,
      orderAmount: amountInINR,
      orderCurrency: "INR",
      customerDetails: {
        customerId: req.user?.userId || `cust_${Date.now()}`,
        customerName: customerName || req.user?.email?.split("@")[0] || "CineVenue Guest",
        customerEmail: customerEmail || req.user?.email || "guest@cinevenue.in",
        customerPhone: customerPhone || "9876543210"
      },
      orderMeta: {
        returnUrl: `${env.FRONTEND_URL}/booking?cf_order_id={order_id}&booking_id=${resolvedBookingId || ""}`
      },
      notes: {
        bookingId: resolvedBookingId || "",
        showId: showId || "",
        source: "MOVIE_BOOKING"
      }
    });

    return res.json({
      success: true,
      order_id: cashfreeOrder.orderId,
      orderId: cashfreeOrder.orderId,
      data: {
        orderId: cashfreeOrder.orderId,
        paymentSessionId: cashfreeOrder.paymentSessionId,
        cfOrderId: cashfreeOrder.cfOrderId,
        amount: cashfreeOrder.orderAmount,
        currency: cashfreeOrder.orderCurrency,
        bookingId: resolvedBookingId,
        environment: cashfreeOrder.environment,
        isSandbox: cashfreeOrder.isSandbox
      }
    });
  } catch (error) {
    next(error);
  }
});

// Legacy /verify-payment routed directly to Cashfree
router.post("/verify-payment", optionalAuthenticate, checkMovieBookingMaintenance, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId, orderId, cf_order_id } = req.body;
    const targetOrderId = orderId || cf_order_id;

    if (!targetOrderId) {
      throw new ValidationError("Missing orderId parameter for Cashfree payment verification");
    }

    const verification = await cashfreeService.verifyOrderPayment(targetOrderId);
    if (!verification.isPaid) {
      throw new PaymentError(`Cashfree payment not confirmed. Status: ${verification.orderStatus}`);
    }

    let confirmedBooking = null;
    if (bookingId) {
      try {
        confirmedBooking = await bookingService.confirmBooking(bookingId, {
          orderId: targetOrderId,
          paymentId: verification.paymentDetails?.cfOrderId || `CF-${targetOrderId}`
        });
      } catch (e) {}
    }

    return res.json({
      success: true,
      message: "Cashfree payment verified successfully. E-Ticket confirmed!",
      data: {
        booking: confirmedBooking,
        orderId: targetOrderId,
        paymentDetails: verification.paymentDetails
      }
    });
  } catch (error) {
    next(error);
  }
});

// 4. Create Cashfree Order for Movie Booking
router.post("/cashfree/create-order", optionalAuthenticate, checkMovieBookingMaintenance, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId, customerName, customerPhone, customerEmail, amount, showId, tickets } = req.body;

    let amountInINR = 0;
    let resolvedCustomerName = customerName || req.user?.name || "Cinema Guest";
    let resolvedCustomerEmail = customerEmail || req.user?.email || "guest@cinevenue.in";
    let resolvedCustomerPhone = customerPhone || "9876543210";
    let resolvedBookingId = bookingId || null;

    if (bookingId) {
      try {
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { user: true }
        });

        if (booking) {
          if (booking.status === "CONFIRMED") {
            throw new ValidationError("This booking has already been paid and confirmed.");
          }
          amountInINR = Number(booking.totalAmount);
          if (booking.user?.name) resolvedCustomerName = booking.user.name;
          if (booking.user?.email) resolvedCustomerEmail = booking.user.email;
          if (booking.user?.mobile) resolvedCustomerPhone = booking.user.mobile;
        }
      } catch (e: any) {
        if (e instanceof ValidationError) throw e;
      }
    }

    if (!amountInINR) {
      if (amount && Number(amount) > 0) {
        amountInINR = Number(amount);
      } else if (Array.isArray(tickets) && tickets.length > 0) {
        amountInINR = tickets.reduce((s: number, t: any) => s + (Number(t.price) || 0), 0);
      } else {
        amountInINR = 250;
      }
    }

    const orderId = `CF_${resolvedBookingId ? resolvedBookingId.replace(/[^a-zA-Z0-9_-]/g, '_') : 'ORD'}_${Date.now()}`.substring(0, 45);

    const cashfreeOrder = await cashfreeService.createOrder({
      orderId,
      orderAmount: amountInINR,
      orderCurrency: "INR",
      customerDetails: {
        customerId: req.user?.userId || `guest_${Date.now()}`,
        customerName: resolvedCustomerName,
        customerEmail: resolvedCustomerEmail,
        customerPhone: resolvedCustomerPhone
      },
      orderMeta: {
        returnUrl: `${env.FRONTEND_URL}/booking?cf_order_id={order_id}&booking_id=${resolvedBookingId || ""}`
      },
      notes: {
        bookingId: resolvedBookingId || "",
        showId: showId || "",
        userId: req.user?.userId || ""
      }
    });

    return res.json({
      success: true,
      data: {
        bookingId: resolvedBookingId,
        orderId: cashfreeOrder.orderId,
        paymentSessionId: cashfreeOrder.paymentSessionId,
        cfOrderId: cashfreeOrder.cfOrderId,
        orderAmount: cashfreeOrder.orderAmount,
        orderCurrency: cashfreeOrder.orderCurrency,
        environment: cashfreeOrder.environment,
        isSandbox: cashfreeOrder.isSandbox
      }
    });
  } catch (error) {
    next(error);
  }
});

// 5. Verify Cashfree Payment & Confirm Booking
router.post("/cashfree/verify", optionalAuthenticate, checkMovieBookingMaintenance, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId, orderId } = req.body;
    if (!orderId) {
      throw new ValidationError("orderId is required for Cashfree payment verification");
    }

    const verification = await cashfreeService.verifyOrderPayment(orderId);
    if (!verification.isPaid) {
      throw new PaymentError(`Cashfree order status is ${verification.orderStatus}. Payment has not been authorized.`);
    }

    let confirmedBooking = null;
    if (bookingId) {
      try {
        confirmedBooking = await bookingService.confirmBooking(bookingId, {
          orderId: orderId,
          paymentId: verification.paymentDetails?.cfOrderId || orderId
        });
      } catch (e) {
        // If bookingId was not in database (e.g. client-managed state), skip error
      }
    }

    return res.json({
      success: true,
      message: "Cashfree payment successfully verified. E-Ticket confirmed!",
      data: {
        booking: confirmedBooking,
        orderId,
        paymentDetails: verification.paymentDetails
      }
    });
  } catch (error) {
    next(error);
  }
});

// 6. Cashfree Webhook Handler
router.post(["/cashfree/webhook", "/webhook/cashfree"], async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-webhook-signature"] as string;
    const timestamp = req.headers["x-webhook-timestamp"] as string;
    const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);

    if (signature && timestamp) {
      const isValid = cashfreeService.verifyWebhookSignature(rawBody, signature, timestamp);
      if (!isValid) {
        logger.warn("Cashfree webhook signature mismatch! Dropping payload.");
        return res.status(400).json({ error: "Invalid webhook signature" });
      }
    }

    const event = req.body?.type;
    const orderData = req.body?.data?.order;
    logger.info(`Cashfree Webhook received: ${event}`, { orderId: orderData?.order_id });

    return res.status(200).json({ received: true });
  } catch (error: any) {
    logger.error(`Cashfree webhook processing error: ${error.message}`);
    return res.status(500).json({ error: "Webhook internal failure" });
  }
});

export default router;
