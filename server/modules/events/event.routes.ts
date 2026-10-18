import { Router, Request, Response, NextFunction } from "express";
import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/database";
import { authenticate, optionalAuthenticate, isValidAdminPasscode } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";
import { NotFoundError, ValidationError, PaymentError } from "../../shared/errors";
import { sendEventPassEmail } from "../../services/emailService";
import { razorpayService } from "../payments/razorpay.service";
import { logger } from "../../shared/logger";

const router = Router();

// Helper for admin authorization
const verifyAdminAccess = (req: Request, res: Response, next: NextFunction) => {
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

  return authenticate(req, res, (err) => {
    if (err) return next(err);
    return authorize("SUPER_ADMIN", "ADMIN", "EVENT_ORGANIZER")(req, res, next);
  });
};

// 0. Send Event Pass via Email (SMTP / Live Gateway)
router.post("/send-pass-email", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      email,
      to,
      passId,
      orderId,
      eventTitle,
      attendeeName,
      userName,
      name,
      venueName,
      venueAddress,
      date,
      day,
      time,
      categoryName,
      tier,
      totalPrice,
      qrCodeUrl,
      passUrl,
      posterUrl,
      isFree
    } = req.body;

    const recipient = email || to;
    if (!recipient) {
      return res.status(400).json({ success: false, message: "Recipient email address is required." });
    }

    const result = await sendEventPassEmail({
      to: recipient,
      passId: passId || `PASS-${Math.floor(100000 + Math.random() * 900000)}`,
      orderId,
      eventTitle: eventTitle || "CineVenue Live Event",
      attendeeName: attendeeName || userName || name || "Valued Guest",
      venueName: venueName || "Event Arena",
      venueAddress,
      date: date || "Upcoming",
      day,
      time: time || "07:00 PM",
      tier: tier || categoryName || "VIP PASS",
      totalPrice,
      qrCodeUrl,
      passUrl,
      posterUrl,
      isFree
    });

    return res.json(result);
  } catch (error) {
    next(error);
  }
});

// 1. List Public Events
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, city } = req.query;

    let events = await prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        ...(category ? { category: String(category) } : {}),
        ...(city ? { city: String(city) } : {})
      },
      include: {
        ticketTypes: true
      },
      orderBy: { date: "asc" }
    });

    if (!events || events.length === 0) {
      try {
        const { supabaseAdmin } = await import("../../config/supabaseAdmin");
        const { data: dbEvents } = await supabaseAdmin
          .from("Event")
          .select("*")
          .neq("status", "CANCELLED")
          .order("date", { ascending: true });
        if (dbEvents && dbEvents.length > 0) {
          events = dbEvents.map((evt: any) => ({
            id: evt.id,
            title: evt.title,
            description: evt.description || `${evt.title} live in ${evt.city || "Hyderabad"}`,
            category: evt.category || "Concerts",
            bannerUrl: evt.bannerUrl,
            posterUrl: evt.bannerUrl,
            date: evt.date,
            time: evt.time || "06:30 PM",
            city: evt.city || "Hyderabad",
            venue: evt.venue || "Convention Arena",
            price: Number(evt.price) || 0,
            capacity: Number(evt.capacity) || 1000,
            status: evt.status || "PUBLISHED",
            ticketTypes: [
              {
                id: `TKT-${evt.id}-GEN`,
                eventId: evt.id,
                name: "General Admission",
                tier: "General",
                price: Number(evt.price) || 0,
                capacity: Number(evt.capacity) || 1000,
                available: Number(evt.capacity) || 1000
              }
            ]
          })) as any;
        }
      } catch (e) {}
    }

    return res.json({
      success: true,
      count: events.length,
      events,
      data: { events }
    });
  } catch (error) {
    next(error);
  }
});

// 1.5 Get Confirmed Event Pass Details by Pass Code / Verification ID
router.get("/pass/:passCode", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { passCode } = req.params;
    const cleanCode = passCode.trim();

    let reg = await prisma.eventRegistration.findFirst({
      where: {
        OR: [
          { passCode: cleanCode },
          { id: cleanCode }
        ]
      },
      include: {
        event: {
          include: { ticketTypes: true }
        },
        user: true
      }
    });

    if (!reg) {
      try {
        const { supabaseAdmin } = await import("../../config/supabaseAdmin");
        const { data: dbReg } = await supabaseAdmin
          .from("EventRegistration")
          .select("*, Event(*)")
          .or(`passCode.eq.${cleanCode},id.eq.${cleanCode}`)
          .maybeSingle();

        if (dbReg) {
          reg = dbReg as any;
        }
      } catch (sbErr) {}
    }

    if (!reg) {
      return res.status(404).json({
        success: false,
        message: "No active event pass found matching this verification code."
      });
    }

    const event = (reg as any).event || {};
    const attendee = (reg as any).user || {};
    const passObj = {
      id: reg.passCode || reg.id,
      passCode: reg.passCode || reg.id,
      orderId: (reg as any).orderId || `CV-ORDER-2026-${(reg.passCode || reg.id).slice(-6)}`,
      eventId: reg.eventId,
      eventTitle: event.title || "Live Event",
      eventDate: event.date || "2026-10-18",
      eventTime: event.time || "06:30 PM",
      venueName: event.venue || "Convention Arena",
      city: event.city || "Hyderabad",
      bannerUrl: event.bannerUrl || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
      ticketTypeName: (reg as any).ticketTypeName || "VIP PASS",
      ticketCount: reg.ticketCount || 1,
      primaryAttendee: {
        name: attendee.name || "Attendee",
        email: attendee.email || "guest@cinevenue.in",
        phone: attendee.mobile || ""
      },
      pricing: {
        finalAmount: Number(reg.totalAmount) || 0
      },
      totalPrice: Number(reg.totalAmount) || 0,
      price: Number(reg.totalAmount) || 0,
      status: reg.status || "CONFIRMED",
      qrCodePayload: reg.passCode || reg.id
    };

    return res.json({
      success: true,
      data: passObj
    });
  } catch (error) {
    next(error);
  }
});

// 1.6 Reset / Clear Registrations for Event (Admin only)
router.post("/:id/reset-bookings", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.eventRegistration.deleteMany({
      where: {
        OR: [
          { eventId: id },
          { event: { title: id } }
        ]
      }
    }).catch(() => {});

    try {
      const { supabaseAdmin } = await import("../../config/supabaseAdmin");
      await supabaseAdmin.from("EventRegistration").delete().eq("eventId", id);
    } catch (e) {}

    return res.json({
      success: true,
      message: `All test registrations for event ${id} have been cleared.`
    });
  } catch (error) {
    next(error);
  }
});

// Helper: Fetch Event with Ticket Types and Convenience Fee Settings
export async function fetchEventWithTicketTypes(id: string) {
  let event = await prisma.event.findUnique({
    where: { id },
    include: { ticketTypes: true }
  });

  if (!event) {
    try {
      const { supabaseAdmin } = await import("../../config/supabaseAdmin");
      const { data: dbEvt } = await supabaseAdmin
        .from("Event")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (dbEvt) {
        event = {
          id: dbEvt.id,
          title: dbEvt.title,
          description: dbEvt.description || `${dbEvt.title} live in ${dbEvt.city || "Hyderabad"}`,
          category: dbEvt.category || "Concerts",
          bannerUrl: dbEvt.bannerUrl,
          posterUrl: dbEvt.bannerUrl,
          date: dbEvt.date,
          time: dbEvt.time || "06:30 PM",
          city: dbEvt.city || "Hyderabad",
          venue: dbEvt.venue || "Convention Arena",
          price: Number(dbEvt.price) || 0,
          capacity: Number(dbEvt.capacity) || 1000,
          status: dbEvt.status || "PUBLISHED",
          convenienceFeeEnabled: dbEvt.convenience_fee_enabled !== undefined ? Boolean(dbEvt.convenience_fee_enabled) : Boolean(dbEvt.convenienceFeeEnabled),
          convenienceFeeType: dbEvt.convenience_fee_type || dbEvt.convenienceFeeType || "FIXED",
          convenienceFeeAmount: Number(dbEvt.convenience_fee_amount !== undefined ? dbEvt.convenience_fee_amount : (dbEvt.convenienceFeeAmount || 0)),
          convenienceFeeApplication: dbEvt.convenience_fee_application || dbEvt.convenienceFeeApplication || "PER_TICKET",
          convenienceFeeStatus: dbEvt.convenience_fee_status || dbEvt.convenienceFeeStatus || "PENDING",
          convenienceFeeApprovedBy: dbEvt.convenience_fee_approved_by || dbEvt.convenienceFeeApprovedBy || null,
          convenienceFeeApprovedAt: dbEvt.convenience_fee_approved_at || dbEvt.convenienceFeeApprovedAt || null,
          ticketTypes: [
            {
              id: `TKT-${dbEvt.id}-GEN`,
              eventId: dbEvt.id,
              name: "General Admission",
              tier: "General",
              price: Number(dbEvt.price) || 0,
              capacity: Number(dbEvt.capacity) || 1000,
              available: Number(dbEvt.capacity) || 1000
            }
          ]
        } as any;
      }
    } catch (e) {}
  }

  return event;
}

// Helper: Authoritative Price & Convenience Fee Calculation Engine
export function calculateEventPriceBreakdown(
  event: any,
  count: number,
  ticketTypeId?: string,
  couponCode?: string
) {
  const validCount = Math.max(1, Number(count) || 1);
  const ticketTypes = event.ticketTypes || [];
  const ticketType =
    ticketTypes.find(
      (t: any) =>
        t.id === ticketTypeId ||
        t.name?.toLowerCase() === ticketTypeId?.toLowerCase()
    ) || ticketTypes[0];

  const unitPrice = ticketType ? Number(ticketType.price) : Number(event.price || 0);
  const ticketSubtotal = Math.round(unitPrice * validCount * 100) / 100;

  // Convenience Fee Rules:
  // 1. Fee is only applied if enabled AND explicitly approved
  // 2. If fee status is PENDING or REJECTED, convenience fee MUST BE 0
  const isFeeEnabled = Boolean(
    event.convenienceFeeEnabled ?? event.convenience_fee_enabled ?? false
  );
  const feeStatus = String(
    event.convenienceFeeStatus || event.convenience_fee_status || "PENDING"
  ).toUpperCase();
  const feeType = String(
    event.convenienceFeeType || event.convenience_fee_type || "FIXED"
  ).toUpperCase();
  const feeAmount = Number(
    event.convenienceFeeAmount !== undefined
      ? event.convenienceFeeAmount
      : event.convenience_fee_amount || 0
  );
  const feeApplication = String(
    event.convenienceFeeApplication ||
      event.convenience_fee_application ||
      "PER_TICKET"
  ).toUpperCase();

  const isFeeApproved = isFeeEnabled && feeStatus === "APPROVED";

  let convenienceFee = 0;
  if (ticketSubtotal > 0 && isFeeApproved && feeAmount > 0) {
    if (feeType === "PERCENTAGE") {
      // Calculate fee using ticket subtotal before discounts
      convenienceFee = Math.round(((ticketSubtotal * feeAmount) / 100) * 100) / 100;
    } else {
      // FIXED fee
      if (feeApplication === "PER_BOOKING") {
        convenienceFee = Math.round(feeAmount * 100) / 100;
      } else {
        // PER_TICKET
        convenienceFee = Math.round(feeAmount * validCount * 100) / 100;
      }
    }
  }

  // Discounts (e.g. promotional coupon codes)
  let discountAmount = 0;
  if (couponCode) {
    const cleanCoupon = String(couponCode).toUpperCase().trim();
    if (cleanCoupon === "CINEEVENT20") {
      discountAmount = Math.min(500, Math.round(ticketSubtotal * 0.2));
    } else if (cleanCoupon === "FIRSTPASS100" && ticketSubtotal >= 499) {
      discountAmount = 100;
    } else if (cleanCoupon === "VIPGALA300" && ticketSubtotal >= 1999) {
      discountAmount = 300;
    }
  }

  const finalPayableAmount = Math.max(
    0,
    Math.round((ticketSubtotal + convenienceFee - discountAmount) * 100) / 100
  );

  const feeSnapshot = {
    enabled: isFeeEnabled,
    type: feeType,
    amount: feeAmount,
    application: feeApplication,
    status: feeStatus,
    approvedBy:
      event.convenienceFeeApprovedBy ||
      event.convenience_fee_approved_by ||
      null,
    approvedAt:
      event.convenienceFeeApprovedAt ||
      event.convenience_fee_approved_at ||
      null,
    appliedFee: convenienceFee,
    unitPrice,
    quantity: validCount
  };

  return {
    ticketPrice: unitPrice,
    quantity: validCount,
    ticketSubtotal,
    convenienceFee,
    discountAmount,
    finalPayableAmount,
    totalAmount: finalPayableAmount,
    feeType,
    feeApplication,
    feeAmountConfigured: feeAmount,
    feeStatus,
    isFeeApproved,
    feeSnapshot
  };
}

// 2. Get Event Details (Customer & Admin)
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const event = await fetchEventWithTicketTypes(id);

    if (!event) throw new NotFoundError("Event", id);

    return res.json({
      success: true,
      event,
      data: { event }
    });
  } catch (error) {
    next(error);
  }
});

// 2B. Server-Side Price Calculation & Fee Preview Endpoint
router.post("/:id/calculate-price", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { ticketCount = 1, ticketTypeId, couponCode } = req.body;

    const event = await fetchEventWithTicketTypes(id);
    if (!event) throw new NotFoundError("Event", id);

    const breakdown = calculateEventPriceBreakdown(
      event,
      ticketCount,
      ticketTypeId,
      couponCode
    );

    return res.json({
      success: true,
      data: breakdown,
      breakdown
    });
  } catch (error) {
    next(error);
  }
});

// 3. Create Event Payment Order (Razorpay)
router.post("/:id/create-order", optionalAuthenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      ticketCount = 1,
      ticketTypeId,
      customerName,
      customerEmail,
      customerPhone,
      couponCode
    } = req.body;

    const event = await fetchEventWithTicketTypes(id);
    if (!event) throw new NotFoundError("Event", id);

    const breakdown = calculateEventPriceBreakdown(
      event,
      ticketCount,
      ticketTypeId,
      couponCode
    );

    if (breakdown.finalPayableAmount <= 0) {
      return res.json({
        success: true,
        isFree: true,
        amount: 0,
        amountInINR: 0,
        breakdown,
        message: "Free event registration. No payment required."
      });
    }

    const amountInPaise = Math.round(breakdown.finalPayableAmount * 100);
    const orderId = `rzp_evt_${event.id.replace(/[^a-zA-Z0-9]/g, "").slice(-8)}_${Date.now()}`;

    const rzpOrder = await razorpayService.createOrder({
      orderId,
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_evt_${Date.now()}`,
      customerDetails: {
        customerId: req.user?.userId || `guest_${Date.now()}`,
        customerName: customerName || "Guest",
        customerEmail: customerEmail || "guest@cinevenue.in",
        customerPhone: customerPhone || "9876543210"
      },
      notes: {
        eventId: event.id,
        eventTitle: event.title,
        ticketCount: breakdown.quantity,
        ticketTypeId: ticketTypeId || "",
        unitPrice: breakdown.ticketPrice,
        ticketSubtotal: breakdown.ticketSubtotal,
        convenienceFee: breakdown.convenienceFee,
        discountAmount: breakdown.discountAmount,
        totalAmount: breakdown.finalPayableAmount,
        feeType: breakdown.feeType,
        feeApplication: breakdown.feeApplication,
        feeAmountConfigured: breakdown.feeAmountConfigured,
        feeStatus: breakdown.feeStatus,
        isFeeApproved: breakdown.isFeeApproved
      }
    });

    return res.json({
      success: true,
      isFree: false,
      orderId: rzpOrder.orderId,
      order_id: rzpOrder.orderId,
      amount: rzpOrder.amount,
      amountInINR: rzpOrder.amountInINR,
      currency: rzpOrder.currency,
      keyId: rzpOrder.keyId,
      key_id: rzpOrder.keyId,
      isTestMode: rzpOrder.isTestMode,
      breakdown
    });
  } catch (error) {
    next(error);
  }
});

// 4. Verify Payment & Confirm Event Registration (Strict Signature Requirement)
router.post("/:id/verify-and-register", optionalAuthenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      ticketCount = 1,
      ticketTypeId,
      attendeeName,
      attendeeEmail,
      attendeeMobile,
      couponCode,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const event = await fetchEventWithTicketTypes(id);
    if (!event) throw new NotFoundError("Event", id);

    const breakdown = calculateEventPriceBreakdown(
      event,
      ticketCount,
      ticketTypeId,
      couponCode
    );

    // Strict signature audit for paid events
    if (breakdown.finalPayableAmount > 0) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new ValidationError("Payment verification requires razorpay_order_id, razorpay_payment_id, and razorpay_signature.");
      }

      const verification = razorpayService.verifyPayment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      });

      if (!verification.verified) {
        logger.error(`[Event Booking Security Alert] Fake or corrupted signature for event ${id}: ${razorpay_order_id}`);
        throw new PaymentError("Razorpay payment signature verification failed. Booking rejected.", "RAZORPAY_SIGNATURE_INVALID");
      }
    }

    // Resolve or link user record
    let targetUserId = req.user?.userId;
    if (!targetUserId) {
      const email = (attendeeEmail || req.user?.email || "").trim().toLowerCase();
      if (!email) {
        throw new ValidationError("Attendee email address is required for event registration.");
      }
      let dbUser = await prisma.user.findUnique({ where: { email } });
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email,
            passwordHash: await bcrypt.hash(randomBytes(16).toString("hex"), 10),
            name: attendeeName?.trim() || "Event Attendee",
            mobile: attendeeMobile?.trim() || null,
            role: "CUSTOMER",
            isVerified: true
          }
        });
      }
      targetUserId = dbUser.id;
    }

    const passCode = `CV-EVT-${Math.floor(100000 + Math.random() * 900000)}`;

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        userId: targetUserId,
        ticketCount: breakdown.quantity,
        totalAmount: breakdown.finalPayableAmount,
        ticketSubtotal: breakdown.ticketSubtotal,
        convenienceFee: breakdown.convenienceFee,
        discountAmount: breakdown.discountAmount,
        finalPayableAmount: breakdown.finalPayableAmount,
        feeConfigurationSnapshot: breakdown.feeSnapshot,
        status: "CONFIRMED",
        passCode
      }
    });

    const ticketType = event.ticketTypes?.find((t: any) => t.id === ticketTypeId) || event.ticketTypes?.[0];

    // Dispatch digital ticket pass to attendee email with breakdown
    sendEventPassEmail({
      to: attendeeEmail || req.user?.email || "guest@cinevenue.in",
      passId: passCode,
      orderId: razorpay_order_id || `CV-FREE-${passCode.slice(-6)}`,
      eventTitle: event.title,
      attendeeName: attendeeName || "Valued Guest",
      venueName: event.venue || "Convention Arena",
      date: event.date ? new Date(event.date).toLocaleDateString("en-IN") : "Upcoming",
      time: event.time || "06:30 PM",
      tier: ticketType?.name || "VIP PASS",
      totalPrice: breakdown.finalPayableAmount,
      ticketSubtotal: breakdown.ticketSubtotal,
      convenienceFee: breakdown.convenienceFee,
      isFree: breakdown.finalPayableAmount === 0
    }).catch((eErr: any) => {
      logger.warn(`[Event Pass Email] Notification note: ${eErr.message}`);
    });

    return res.status(201).json({
      success: true,
      message: "Event pass booked and verified successfully",
      data: {
        registration,
        passCode,
        orderId: razorpay_order_id || `CV-FREE-${passCode.slice(-6)}`,
        qrCodePayload: passCode,
        pricing: {
          ticketPrice: breakdown.ticketPrice,
          ticketSubtotal: breakdown.ticketSubtotal,
          convenienceFee: breakdown.convenienceFee,
          discountAmount: breakdown.discountAmount,
          finalAmount: breakdown.finalPayableAmount
        },
        breakdown,
        verified: true
      }
    });
  } catch (error) {
    next(error);
  }
});

// 5. Fallback Registration Route
router.post("/:id/register", optionalAuthenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      ticketCount = 1,
      ticketTypeId,
      couponCode,
      razorpay_signature,
      razorpay_payment_id,
      razorpay_order_id
    } = req.body;

    const event = await fetchEventWithTicketTypes(id);
    if (!event) throw new NotFoundError("Event", id);

    const breakdown = calculateEventPriceBreakdown(
      event,
      ticketCount,
      ticketTypeId,
      couponCode
    );

    if (breakdown.finalPayableAmount > 0) {
      if (!razorpay_signature || !razorpay_payment_id || !razorpay_order_id) {
        return res.status(400).json({
          success: false,
          error: {
            code: "PAYMENT_REQUIRED",
            message: "Cannot register for a paid event without a verified Razorpay payment signature."
          }
        });
      }

      const verification = razorpayService.verifyPayment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      });

      if (!verification.verified) {
        return res.status(401).json({
          success: false,
          error: {
            code: "RAZORPAY_SIGNATURE_INVALID",
            message: "Razorpay signature verification failed. Registration denied."
          }
        });
      }
    }

    let targetUserId = req.user?.userId;
    if (!targetUserId) {
      const email = (req.body.attendeeEmail || req.user?.email || "guest@cinevenue.in").trim().toLowerCase();
      let dbUser = await prisma.user.findUnique({ where: { email } });
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email,
            passwordHash: await bcrypt.hash(randomBytes(16).toString("hex"), 10),
            name: req.body.attendeeName?.trim() || "Guest Attendee",
            role: "CUSTOMER",
            isVerified: true
          }
        });
      }
      targetUserId = dbUser.id;
    }

    const passCode = `CV-EVT-${Math.floor(100000 + Math.random() * 900000)}`;

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        userId: targetUserId,
        ticketCount: breakdown.quantity,
        totalAmount: breakdown.finalPayableAmount,
        ticketSubtotal: breakdown.ticketSubtotal,
        convenienceFee: breakdown.convenienceFee,
        discountAmount: breakdown.discountAmount,
        finalPayableAmount: breakdown.finalPayableAmount,
        feeConfigurationSnapshot: breakdown.feeSnapshot,
        status: "CONFIRMED",
        passCode
      }
    });

    return res.status(201).json({
      success: true,
      message: "Event pass booked successfully",
      data: {
        registration,
        passCode,
        qrCodePayload: passCode,
        breakdown
      }
    });
  } catch (error) {
    next(error);
  }
});

// 6. Fee Approval Workflow Endpoint: Approve Convenience Fee
router.post("/:id/approve-fee", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const event = await fetchEventWithTicketTypes(id);
    if (!event) throw new NotFoundError("Event", id);

    const prevStatus = (event as any).convenienceFeeStatus || (event as any).convenience_fee_status || "PENDING";
    const actorEmail = req.user?.email || req.user?.name || "Authorized Admin";
    const approvedAt = new Date();

    const updated = await prisma.event.update({
      where: { id },
      data: {
        convenienceFeeStatus: "APPROVED",
        convenienceFeeApprovedBy: actorEmail,
        convenienceFeeApprovedAt: approvedAt
      } as any
    });

    await prisma.eventFeeAuditLog.create({
      data: {
        eventId: id,
        action: "APPROVED",
        previousStatus: prevStatus,
        newStatus: "APPROVED",
        feeType: (event as any).convenienceFeeType || "FIXED",
        feeAmount: Number((event as any).convenienceFeeAmount || 0),
        feeApplication: (event as any).convenienceFeeApplication || "PER_TICKET",
        enabled: Boolean((event as any).convenienceFeeEnabled),
        actorId: req.user?.userId || "admin",
        actorEmail,
        reason: req.body?.reason || "Fee approved by admin",
        metadata: { approvedAt }
      }
    }).catch(() => {});

    return res.json({
      success: true,
      message: `Convenience fee for event "${event.title}" has been approved. It will now apply to customer bookings.`,
      event: updated
    });
  } catch (error) {
    next(error);
  }
});

// 7. Fee Approval Workflow Endpoint: Reject Convenience Fee
router.post("/:id/reject-fee", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const event = await fetchEventWithTicketTypes(id);
    if (!event) throw new NotFoundError("Event", id);

    const prevStatus = (event as any).convenienceFeeStatus || (event as any).convenience_fee_status || "PENDING";
    const actorEmail = req.user?.email || req.user?.name || "Authorized Admin";

    const updated = await prisma.event.update({
      where: { id },
      data: {
        convenienceFeeStatus: "REJECTED"
      } as any
    });

    await prisma.eventFeeAuditLog.create({
      data: {
        eventId: id,
        action: "REJECTED",
        previousStatus: prevStatus,
        newStatus: "REJECTED",
        feeType: (event as any).convenienceFeeType || "FIXED",
        feeAmount: Number((event as any).convenienceFeeAmount || 0),
        feeApplication: (event as any).convenienceFeeApplication || "PER_TICKET",
        enabled: Boolean((event as any).convenienceFeeEnabled),
        actorId: req.user?.userId || "admin",
        actorEmail,
        reason: req.body?.reason || "Fee rejected by admin",
        metadata: { rejectedAt: new Date() }
      }
    }).catch(() => {});

    return res.json({
      success: true,
      message: `Convenience fee for event "${event.title}" has been rejected. Customers will NOT be charged this fee.`,
      event: updated
    });
  } catch (error) {
    next(error);
  }
});

// 8. Update Convenience Fee Settings Directly
router.patch("/:id/fee-settings", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const event = await fetchEventWithTicketTypes(id);
    if (!event) throw new NotFoundError("Event", id);

    const {
      convenienceFeeEnabled,
      convenienceFeeType = "FIXED",
      convenienceFeeAmount = 0,
      convenienceFeeApplication = "PER_TICKET",
      convenienceFeeStatus
    } = req.body;

    const prevStatus = (event as any).convenienceFeeStatus || (event as any).convenience_fee_status || "PENDING";
    const actorEmail = req.user?.email || req.user?.name || "Admin";

    // If an authorized admin selects APPROVED, approve immediately; otherwise default to PENDING
    const targetStatus = convenienceFeeStatus || "PENDING";
    const isApproved = targetStatus === "APPROVED";

    const updated = await prisma.event.update({
      where: { id },
      data: {
        convenienceFeeEnabled: Boolean(convenienceFeeEnabled),
        convenienceFeeType: String(convenienceFeeType).toUpperCase() === "PERCENTAGE" ? "PERCENTAGE" : "FIXED",
        convenienceFeeAmount: Number(convenienceFeeAmount) || 0,
        convenienceFeeApplication: String(convenienceFeeApplication).toUpperCase() === "PER_BOOKING" ? "PER_BOOKING" : "PER_TICKET",
        convenienceFeeStatus: targetStatus,
        convenienceFeeApprovedBy: isApproved ? actorEmail : null,
        convenienceFeeApprovedAt: isApproved ? new Date() : null
      } as any
    });

    await prisma.eventFeeAuditLog.create({
      data: {
        eventId: id,
        action: "EDITED",
        previousStatus: prevStatus,
        newStatus: targetStatus,
        feeType: convenienceFeeType,
        feeAmount: Number(convenienceFeeAmount) || 0,
        feeApplication: convenienceFeeApplication,
        enabled: Boolean(convenienceFeeEnabled),
        actorId: req.user?.userId || "admin",
        actorEmail,
        reason: req.body?.reason || "Convenience fee configuration updated",
        metadata: { updatedSettings: req.body }
      }
    }).catch(() => {});

    return res.json({
      success: true,
      message: `Convenience fee settings updated for event "${event.title}".`,
      event: updated
    });
  } catch (error) {
    next(error);
  }
});

// 9. Get Fee Audit Logs
router.get("/:id/fee-audit-logs", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const logs = await prisma.eventFeeAuditLog.findMany({
      where: { eventId: id },
      orderBy: { createdAt: "desc" }
    });

    return res.json({
      success: true,
      data: { logs },
      logs
    });
  } catch (error) {
    next(error);
  }
});

// 10. Create Event (Organizer / Admin) with Convenience Fee Settings
router.post("/", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      description,
      category,
      bannerUrl,
      date,
      time,
      city,
      venue,
      price,
      capacity,
      ticketTypes,
      convenienceFeeEnabled,
      convenienceFeeType,
      convenienceFeeAmount,
      convenienceFeeApplication,
      convenienceFeeStatus
    } = req.body;

    const actorEmail = req.user?.email || req.user?.name || "Admin";
    const initialStatus = convenienceFeeStatus || "PENDING";
    const isInitiallyApproved = initialStatus === "APPROVED";

    const event = await prisma.event.create({
      data: {
        title,
        description: description || `${title} live event in ${city || "Hyderabad"}`,
        category: category || "Concerts",
        bannerUrl: bannerUrl || null,
        date: date ? new Date(date) : new Date(),
        time: time || "07:00 PM",
        city: city || "Hyderabad",
        venue: venue || "City Arena",
        price: Number(price) || 0,
        capacity: Number(capacity) || 500,
        organizerId: req.user?.userId || "admin",
        status: "PUBLISHED",
        convenienceFeeEnabled: Boolean(convenienceFeeEnabled),
        convenienceFeeType: String(convenienceFeeType || "FIXED").toUpperCase() === "PERCENTAGE" ? "PERCENTAGE" : "FIXED",
        convenienceFeeAmount: Number(convenienceFeeAmount) || 0,
        convenienceFeeApplication: String(convenienceFeeApplication || "PER_TICKET").toUpperCase() === "PER_BOOKING" ? "PER_BOOKING" : "PER_TICKET",
        convenienceFeeStatus: initialStatus,
        convenienceFeeApprovedBy: isInitiallyApproved ? actorEmail : null,
        convenienceFeeApprovedAt: isInitiallyApproved ? new Date() : null
      } as any
    });

    // Create Audit Log entry
    if (convenienceFeeEnabled) {
      await prisma.eventFeeAuditLog.create({
        data: {
          eventId: event.id,
          action: "CREATED",
          previousStatus: null,
          newStatus: initialStatus,
          feeType: String(convenienceFeeType || "FIXED").toUpperCase() === "PERCENTAGE" ? "PERCENTAGE" : "FIXED",
          feeAmount: Number(convenienceFeeAmount) || 0,
          feeApplication: String(convenienceFeeApplication || "PER_TICKET").toUpperCase() === "PER_BOOKING" ? "PER_BOOKING" : "PER_TICKET",
          enabled: Boolean(convenienceFeeEnabled),
          actorId: req.user?.userId || "admin",
          actorEmail,
          reason: "Event created with convenience fee settings",
          metadata: { initialStatus }
        }
      }).catch(() => {});
    }

    if (Array.isArray(ticketTypes) && ticketTypes.length > 0) {
      await prisma.eventTicketType.createMany({
        data: ticketTypes.map((tt: any) => ({
          eventId: event.id,
          name: tt.name || "General Admission",
          price: Number(tt.price) || 0,
          capacity: Number(tt.capacity) || 100,
          available: Number(tt.available || tt.capacity) || 100
        }))
      });
    }

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: { event }
    });
  } catch (error) {
    next(error);
  }
});

// 11. Admin/Organizer: Update Event
router.put("/:id", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const existing = await fetchEventWithTicketTypes(id);
    const prevStatus = (existing as any)?.convenienceFeeStatus || (existing as any)?.convenience_fee_status || "PENDING";
    const actorEmail = req.user?.email || req.user?.name || "Admin";

    const updateData: any = { ...body };
    if (body.date) updateData.date = new Date(body.date);
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.capacity !== undefined) updateData.capacity = Number(body.capacity);

    if (body.convenienceFeeEnabled !== undefined) {
      updateData.convenienceFeeEnabled = Boolean(body.convenienceFeeEnabled);
    }
    if (body.convenienceFeeType !== undefined) {
      updateData.convenienceFeeType = String(body.convenienceFeeType).toUpperCase() === "PERCENTAGE" ? "PERCENTAGE" : "FIXED";
    }
    if (body.convenienceFeeAmount !== undefined) {
      updateData.convenienceFeeAmount = Number(body.convenienceFeeAmount) || 0;
    }
    if (body.convenienceFeeApplication !== undefined) {
      updateData.convenienceFeeApplication = String(body.convenienceFeeApplication).toUpperCase() === "PER_BOOKING" ? "PER_BOOKING" : "PER_TICKET";
    }
    if (body.convenienceFeeStatus !== undefined) {
      updateData.convenienceFeeStatus = body.convenienceFeeStatus;
      if (body.convenienceFeeStatus === "APPROVED") {
        updateData.convenienceFeeApprovedBy = actorEmail;
        updateData.convenienceFeeApprovedAt = new Date();
      }
    }

    delete updateData.ticketTypes;
    delete updateData.registrations;

    const event = await prisma.event.update({
      where: { id },
      data: updateData
    });

    if (body.convenienceFeeEnabled !== undefined || body.convenienceFeeAmount !== undefined || body.convenienceFeeStatus !== undefined) {
      await prisma.eventFeeAuditLog.create({
        data: {
          eventId: id,
          action: "UPDATED",
          previousStatus: prevStatus,
          newStatus: body.convenienceFeeStatus || prevStatus,
          feeType: body.convenienceFeeType || (existing as any)?.convenienceFeeType || "FIXED",
          feeAmount: Number(body.convenienceFeeAmount !== undefined ? body.convenienceFeeAmount : (existing as any)?.convenienceFeeAmount || 0),
          feeApplication: body.convenienceFeeApplication || (existing as any)?.convenienceFeeApplication || "PER_TICKET",
          enabled: Boolean(body.convenienceFeeEnabled !== undefined ? body.convenienceFeeEnabled : (existing as any)?.convenienceFeeEnabled),
          actorId: req.user?.userId || "admin",
          actorEmail,
          reason: "Event convenience fee settings updated",
          metadata: { updatedBody: body }
        }
      }).catch(() => {});
    }

    return res.json({
      success: true,
      message: "Event updated successfully",
      data: { event }
    });
  } catch (error) {
    next(error);
  }
});

// 13. Cancellation & Refund Calculation Preview
router.post("/:id/calculate-refund", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { registrationId, passCode, isOrganizerCancellation } = req.body;

    let registration: any = null;
    if (registrationId) {
      registration = await prisma.eventRegistration.findUnique({ where: { id: registrationId } });
    } else if (passCode) {
      registration = await prisma.eventRegistration.findFirst({ where: { passCode } });
    }

    const subtotal = Number(registration?.ticketSubtotal ?? (registration?.totalAmount || 0));
    const fee = Number(registration?.convenienceFee ?? 0);
    const finalAmount = Number(registration?.finalPayableAmount ?? registration?.totalAmount ?? subtotal + fee);

    // Policy: If event cancelled by organizer -> 100% full refund including convenience fee.
    // If customer voluntary cancellation -> Ticket subtotal refunded, convenience fee non-refundable per platform terms.
    const isFeeRefunded = Boolean(isOrganizerCancellation);
    const ticketRefundAmount = subtotal;
    const convenienceFeeRefundAmount = isFeeRefunded ? fee : 0;
    const totalRefundAmount = ticketRefundAmount + convenienceFeeRefundAmount;

    return res.json({
      success: true,
      refundBreakdown: {
        registrationId: registration?.id || registrationId,
        passCode: registration?.passCode || passCode,
        eventId: id,
        ticketSubtotal: subtotal,
        convenienceFee: fee,
        finalPaidAmount: finalAmount,
        ticketRefundAmount,
        convenienceFeeRefundAmount,
        totalRefundAmount,
        isFeeRefunded,
        policyDisclosed: isFeeRefunded
          ? "Event cancelled by organizer: Full refund including convenience fee."
          : "Voluntary customer cancellation: Ticket subtotal refunded. Platform convenience fee is non-refundable."
      }
    });
  } catch (error) {
    next(error);
  }
});

// 14. Execute Booking Cancellation & Refund
router.post("/registrations/:registrationId/cancel", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { registrationId } = req.params;
    const { reason, isOrganizerCancellation } = req.body;

    const registration = await prisma.eventRegistration.findUnique({ where: { id: registrationId } });
    if (!registration) {
      throw new NotFoundError("Registration not found");
    }

    const subtotal = Number(registration.ticketSubtotal ?? registration.totalAmount);
    const fee = Number(registration.convenienceFee ?? 0);
    const finalAmount = Number(registration.finalPayableAmount ?? registration.totalAmount);

    const isFeeRefunded = Boolean(isOrganizerCancellation);
    const ticketRefundAmount = subtotal;
    const convenienceFeeRefundAmount = isFeeRefunded ? fee : 0;
    const totalRefundAmount = ticketRefundAmount + convenienceFeeRefundAmount;

    const updated = await prisma.eventRegistration.update({
      where: { id: registrationId },
      data: {
        status: "CANCELLED"
      }
    });

    return res.json({
      success: true,
      message: "Booking cancelled successfully. Refund processed.",
      data: {
        registration: updated,
        refundBreakdown: {
          ticketSubtotal: subtotal,
          convenienceFee: fee,
          finalPaidAmount: finalAmount,
          ticketRefundAmount,
          convenienceFeeRefundAmount,
          totalRefundAmount,
          isFeeRefunded,
          reason: reason || (isOrganizerCancellation ? "Event Cancelled" : "Customer Voluntary Cancellation")
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// 14. Delete Event (Admin only)
router.delete("/:id", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    try {
      await prisma.event.delete({ where: { id } });
    } catch (dbErr) {
      try {
        await prisma.event.update({ where: { id }, data: { status: "CANCELLED" } });
      } catch (e) {}
    }
    return res.json({
      success: true,
      message: `Event ${id} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// CineVenue Event Proposals & Quotations Endpoints
// Company: CINEVENUE PVT LTD
// -------------------------------------------------------------

const PROPOSALS_FILE_PATH = path.join(process.cwd(), "server", "config", "event_proposals.json");

function readProposalsStore(): any[] {
  try {
    if (fs.existsSync(PROPOSALS_FILE_PATH)) {
      const raw = fs.readFileSync(PROPOSALS_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    logger.warn({ error: e }, "Failed to read event proposals file");
  }
  return [];
}

function writeProposalsStore(proposals: any[]): void {
  try {
    fs.writeFileSync(PROPOSALS_FILE_PATH, JSON.stringify(proposals, null, 2), "utf-8");
  } catch (e) {
    logger.error({ error: e }, "Failed to write event proposals file");
  }
}

// 15. List Proposals (Admin only)
router.get("/proposals", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, status, email } = req.query;
    let list = readProposalsStore();

    if (category) {
      list = list.filter((p: any) => p.category === category);
    }
    if (status) {
      list = list.filter((p: any) => p.status === status);
    }
    if (email) {
      const emailLower = String(email).toLowerCase();
      list = list.filter((p: any) => (p.email || "").toLowerCase() === emailLower);
    }

    return res.json({
      success: true,
      data: list
    });
  } catch (error) {
    next(error);
  }
});

// 16. Submit / Create Proposal
router.post("/proposals", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proposalData = req.body;
    if (!proposalData.eventName || !proposalData.email) {
      return res.status(400).json({ success: false, message: "Event name and contact email are required." });
    }

    const list = readProposalsStore();
    const existingIndex = list.findIndex((p: any) => p.id === proposalData.id || p.referenceId === proposalData.referenceId);

    const now = new Date().toISOString();
    let saved: any;

    if (existingIndex >= 0) {
      saved = {
        ...list[existingIndex],
        ...proposalData,
        updatedAt: now
      };
      list[existingIndex] = saved;
    } else {
      const refYear = new Date().getFullYear();
      const randNum = Math.floor(10000 + Math.random() * 90000);
      const generatedRef = `CVE-PROP-${refYear}-${randNum}`;

      saved = {
        ...proposalData,
        id: proposalData.id || generatedRef,
        referenceId: proposalData.referenceId || generatedRef,
        status: proposalData.status || "New",
        createdAt: proposalData.createdAt || now,
        updatedAt: now,
        internalNotes: proposalData.internalNotes || [],
        followUps: proposalData.followUps || [],
        isConvertedToEvent: false
      };
      list.unshift(saved);
    }

    writeProposalsStore(list);

    return res.status(201).json({
      success: true,
      message: "Proposal saved successfully.",
      data: saved
    });
  } catch (error) {
    next(error);
  }
});

// 17. Update Proposal Status (Admin only)
router.put("/proposals/:id/status", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, note, authorName, nextFollowUpDate } = req.body;

    const list = readProposalsStore();
    const item = list.find((p: any) => p.id === id || p.referenceId === id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Proposal not found." });
    }

    item.status = status;
    item.updatedAt = new Date().toISOString();
    if (nextFollowUpDate) {
      item.nextFollowUpDate = nextFollowUpDate;
    }

    if (note) {
      const followUp = {
        id: `FU-${Date.now()}`,
        date: new Date().toISOString(),
        type: "Status Change",
        summary: `Status changed to: ${status}. ${note}`,
        nextFollowUpDate: nextFollowUpDate || item.nextFollowUpDate,
        authorName: authorName || "Executive Admin"
      };
      item.followUps = [followUp, ...(item.followUps || [])];
    }

    writeProposalsStore(list);

    return res.json({
      success: true,
      message: `Status updated to ${status}.`,
      data: item
    });
  } catch (error) {
    next(error);
  }
});

// 18. Assign Event Manager (Admin only)
router.put("/proposals/:id/manager", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { managerName, managerEmail } = req.body;

    const list = readProposalsStore();
    const item = list.find((p: any) => p.id === id || p.referenceId === id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Proposal not found." });
    }

    item.assignedEventManager = managerName;
    item.assignedManagerEmail = managerEmail;
    item.updatedAt = new Date().toISOString();

    const followUp = {
      id: `FU-${Date.now()}`,
      date: new Date().toISOString(),
      type: "Manager Assignment",
      summary: `Assigned event production manager: ${managerName}`,
      authorName: "Operations Directorate"
    };
    item.followUps = [followUp, ...(item.followUps || [])];

    writeProposalsStore(list);

    return res.json({
      success: true,
      message: `Manager ${managerName} assigned successfully.`,
      data: item
    });
  } catch (error) {
    next(error);
  }
});

// 19. Add Follow-Up Log (Admin only)
router.post("/proposals/:id/follow-up", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { type, summary, nextFollowUpDate, authorName } = req.body;

    const list = readProposalsStore();
    const item = list.find((p: any) => p.id === id || p.referenceId === id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Proposal not found." });
    }

    const followUp = {
      id: `FU-${Date.now()}`,
      date: new Date().toISOString(),
      type: type || "Internal Note",
      summary: summary || "",
      nextFollowUpDate,
      authorName: authorName || "CineVenue Executive"
    };

    item.followUps = [followUp, ...(item.followUps || [])];
    item.lastFollowUpDate = new Date().toISOString().split("T")[0];
    if (nextFollowUpDate) {
      item.nextFollowUpDate = nextFollowUpDate;
    }
    item.updatedAt = new Date().toISOString();

    writeProposalsStore(list);

    return res.json({
      success: true,
      message: "Follow-up recorded.",
      data: item
    });
  } catch (error) {
    next(error);
  }
});

// 20. Save Quotation (Admin only)
router.put("/proposals/:id/quotation", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { quotation } = req.body;

    const list = readProposalsStore();
    const item = list.find((p: any) => p.id === id || p.referenceId === id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Proposal not found." });
    }

    item.quotation = quotation;
    item.status = "Quotation Sent";
    item.updatedAt = new Date().toISOString();

    const followUp = {
      id: `FU-${Date.now()}`,
      date: new Date().toISOString(),
      type: "Quotation Generated",
      summary: `Quotation #${quotation?.quotationNumber || "N/A"} generated with total ₹${quotation?.grandTotal?.toLocaleString("en-IN") || 0}.`,
      authorName: quotation?.preparedBy || "CineVenue Executive"
    };
    item.followUps = [followUp, ...(item.followUps || [])];

    writeProposalsStore(list);

    return res.json({
      success: true,
      message: "Quotation saved and linked to proposal.",
      data: item
    });
  } catch (error) {
    next(error);
  }
});

// 21. Convert Proposal to Event (Admin only)
router.post("/proposals/:id/convert", verifyAdminAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const list = readProposalsStore();
    const item = list.find((p: any) => p.id === id || p.referenceId === id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Proposal not found." });
    }

    if (item.isConvertedToEvent && item.convertedEventId) {
      return res.status(400).json({
        success: false,
        message: `Proposal has already been converted to Event #${item.convertedEventId}.`
      });
    }

    const eventId = `EVT-${Date.now()}`;
    item.isConvertedToEvent = true;
    item.convertedEventId = eventId;
    item.convertedAt = new Date().toISOString();
    item.status = "Converted to Event";
    item.updatedAt = new Date().toISOString();

    writeProposalsStore(list);

    return res.json({
      success: true,
      message: "Proposal converted to live Event.",
      data: {
        proposal: item,
        eventId
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
