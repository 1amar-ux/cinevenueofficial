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
    const { title, description, category, bannerUrl, date, time, city, venue, price, capacity } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        category,
        bannerUrl: bannerUrl || null,
        date: new Date(date),
        time,
        city,
        venue,
        price: Number(price) || 0,
        capacity: Number(capacity) || 500,
        organizerId: req.user!.userId,
        status: "PUBLISHED"
      }
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: { event }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
