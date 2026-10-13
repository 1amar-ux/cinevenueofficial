import { Router, Request, Response, NextFunction } from "express";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/database";
import { authenticate, optionalAuthenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";
import { NotFoundError, ValidationError, PaymentError } from "../../shared/errors";
import { sendEventPassEmail } from "../../services/emailService";
import { razorpayService } from "../payments/razorpay.service";
import { logger } from "../../shared/logger";

const router = Router();

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

// 2. Get Event Details
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
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

// 3. Create Event Payment Order (Razorpay)
router.post("/:id/create-order", optionalAuthenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { ticketCount = 1, ticketTypeId, customerName, customerEmail, customerPhone } = req.body;

    const event = await prisma.event.findUnique({
      where: { id },
      include: { ticketTypes: true }
    });

    if (!event) throw new NotFoundError("Event", id);

    const count = Math.max(1, Number(ticketCount) || 1);
    const ticketType = event.ticketTypes.find(t => t.id === ticketTypeId) || event.ticketTypes[0];
    const unitPrice = ticketType ? Number(ticketType.price) : Number(event.price);
    const totalAmount = unitPrice * count;

    if (totalAmount <= 0) {
      return res.json({
        success: true,
        isFree: true,
        amount: 0,
        amountInINR: 0,
        message: "Free event registration. No payment required."
      });
    }

    const amountInPaise = Math.round(totalAmount * 100);
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
        ticketCount: count,
        ticketTypeId: ticketType?.id || ""
      }
    });

    // CRITICAL: NEVER return passCode or ticket details in create-order response
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
      isTestMode: rzpOrder.isTestMode
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
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const event = await prisma.event.findUnique({
      where: { id },
      include: { ticketTypes: true }
    });

    if (!event) throw new NotFoundError("Event", id);

    const count = Math.max(1, Number(ticketCount) || 1);
    const ticketType = event.ticketTypes.find(t => t.id === ticketTypeId) || event.ticketTypes[0];
    const unitPrice = ticketType ? Number(ticketType.price) : Number(event.price);
    const totalAmount = unitPrice * count;

    // A. STRICT SECURITY AUDIT: If totalAmount > 0, verified Razorpay payment signature is MANDATORY
    if (totalAmount > 0) {
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

    // B. Resolve or link user record (Authenticated user or guest attendee)
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

    // C. Issue confirmed passCode ONLY after verification succeeds
    const passCode = `CV-EVT-${Math.floor(100000 + Math.random() * 900000)}`;

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        userId: targetUserId,
        ticketCount: count,
        totalAmount,
        status: "CONFIRMED",
        passCode
      }
    });

    // D. Dispatch digital ticket pass to attendee email
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
      totalPrice: totalAmount,
      isFree: totalAmount === 0
    }).catch((eErr: any) => {
      logger.warn(`[Event Pass Email] Non-fatal notification note: ${eErr.message}`);
    });

    return res.status(201).json({
      success: true,
      message: "Event pass booked and verified successfully",
      data: {
        registration,
        passCode,
        orderId: razorpay_order_id || `CV-FREE-${passCode.slice(-6)}`,
        qrCodePayload: passCode,
        verified: true
      }
    });
  } catch (error) {
    next(error);
  }
});

// 5. Fallback Registration Route (Guards against bypass attempts)
router.post("/:id/register", optionalAuthenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { ticketCount = 1, ticketTypeId, razorpay_signature, razorpay_payment_id, razorpay_order_id } = req.body;

    const event = await prisma.event.findUnique({
      where: { id },
      include: { ticketTypes: true }
    });

    if (!event) throw new NotFoundError("Event", id);

    const ticketType = event.ticketTypes.find(t => t.id === ticketTypeId) || event.ticketTypes[0];
    const unitPrice = ticketType ? Number(ticketType.price) : Number(event.price);
    const totalAmount = unitPrice * Number(ticketCount);

    // If paid event, reject direct registration without payment signature
    if (totalAmount > 0) {
      if (!razorpay_signature || !razorpay_payment_id || !razorpay_order_id) {
        return res.status(400).json({
          success: false,
          error: {
            code: "PAYMENT_REQUIRED",
            message: "Cannot register for a paid event without a verified Razorpay payment signature."
          }
        });
      }

      // Verify signature
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

    // Resolve user
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
        ticketCount: Number(ticketCount),
        totalAmount,
        status: "CONFIRMED",
        passCode
      }
    });

    return res.status(201).json({
      success: true,
      message: "Event pass booked successfully",
      data: { registration, passCode, qrCodePayload: passCode }
    });
  } catch (error) {
    next(error);
  }
});

// 4. Create Event (Organizer / Admin)
router.post("/", authenticate, authorize("SUPER_ADMIN", "ADMIN", "EVENT_ORGANIZER"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, category, bannerUrl, date, time, city, venue, price, capacity, eventType, ticketTypes } = req.body;

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
        organizerId: req.user!.userId,
        status: "PUBLISHED"
      }
    });

    // If ticket types provided, create them
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

// 5. Admin/Organizer: Update Event
router.put("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN", "EVENT_ORGANIZER"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.update({
      where: { id },
      data: req.body
    });

    return res.json({
      success: true,
      message: "Event updated successfully",
      data: { event }
    });
  } catch (error) {
    next(error);
  }
});

// 6. Admin/Organizer: Delete Event
router.delete("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN", "EVENT_ORGANIZER"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.event.delete({ where: { id } }).catch(async () => {
      await prisma.event.update({ where: { id }, data: { status: "CANCELLED" } });
    });

    return res.json({
      success: true,
      message: "Event removed successfully"
    });
  } catch (error) {
    next(error);
  }
});

export default router;
