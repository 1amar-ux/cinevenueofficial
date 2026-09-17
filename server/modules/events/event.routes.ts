import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate, optionalAuthenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";
import { NotFoundError } from "../../shared/errors";

const router = Router();

// 1. List Public Events
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, city } = req.query;

    const events = await prisma.event.findMany({
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

    return res.json({
      success: true,
      count: events.length,
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
    const event = await prisma.event.findUnique({
      where: { id },
      include: { ticketTypes: true }
    });

    if (!event) throw new NotFoundError("Event", id);

    return res.json({
      success: true,
      data: { event }
    });
  } catch (error) {
    next(error);
  }
});

// 3. Register / Book Event Pass
router.post("/:id/register", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { ticketCount = 1, ticketTypeId } = req.body;

    const event = await prisma.event.findUnique({
      where: { id },
      include: { ticketTypes: true }
    });

    if (!event) throw new NotFoundError("Event", id);

    const ticketType = event.ticketTypes.find(t => t.id === ticketTypeId) || event.ticketTypes[0];
    const unitPrice = ticketType ? Number(ticketType.price) : Number(event.price);
    const totalAmount = unitPrice * Number(ticketCount);

    const passCode = `PASS-${Math.floor(100000 + Math.random() * 900000)}`;

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        userId: req.user!.userId,
        ticketCount: Number(ticketCount),
        totalAmount,
        status: "CONFIRMED",
        passCode
      }
    });

    return res.status(201).json({
      success: true,
      message: "Event pass booked successfully",
      data: { registration }
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
