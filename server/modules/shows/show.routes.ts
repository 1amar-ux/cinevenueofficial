import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { NotFoundError } from "../../shared/errors";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";

const router = Router();

// 1. Get Shows (filter by movieId, theatreId, date)
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { movieId, theatreId, date } = req.query;

    let dateFilter = {};
    if (date) {
      const startOfDay = new Date(String(date));
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(String(date));
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter = { startTime: { gte: startOfDay, lte: endOfDay } };
    }

    const shows = await prisma.show.findMany({
      where: {
        ...(movieId ? { movieId: String(movieId) } : {}),
        ...(theatreId ? { theatreId: String(theatreId) } : {}),
        ...dateFilter,
        status: "ACTIVE"
      },
      include: {
        movie: { select: { id: true, title: true, posterUrl: true, duration: true } },
        theatre: { select: { id: true, name: true, city: true, address: true } },
        screen: { select: { id: true, name: true, capacity: true } }
      },
      orderBy: { startTime: "asc" }
    });

    return res.json({
      success: true,
      count: shows.length,
      data: { shows }
    });
  } catch (error) {
    next(error);
  }
});

// 2. Get Realtime Seat Inventory for Show
router.get("/:id/seats", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const show = await prisma.show.findUnique({
      where: { id },
      include: {
        movie: true,
        theatre: true,
        screen: true,
        showSeats: {
          include: { seat: true }
        }
      }
    });

    if (!show) {
      throw new NotFoundError("Show", id);
    }

    const now = new Date();
    // Format seats and auto-release expired locks
    const seats = show.showSeats.map((ss) => {
      let isAvailable = ss.status === "AVAILABLE";
      if (ss.status === "LOCKED" && ss.lockedUntil && ss.lockedUntil < now) {
        isAvailable = true; // Lock expired
      }

      return {
        showSeatId: ss.id,
        seatId: ss.seatId,
        row: ss.seat.row,
        number: ss.seat.number,
        category: ss.seat.category,
        price: Number(ss.price),
        status: isAvailable ? "AVAILABLE" : ss.status,
        lockedUntil: ss.lockedUntil
      };
    });

    return res.json({
      success: true,
      data: {
        show: {
          id: show.id,
          movieTitle: show.movie?.title,
          theatreName: show.theatre.name,
          screenName: show.screen.name,
          startTime: show.startTime,
          language: show.language,
          format: show.format
        },
        seats
      }
    });
  } catch (error) {
    next(error);
  }
});

// 3. Admin: Create Show
router.post("/", authenticate, authorize("SUPER_ADMIN", "ADMIN", "THEATRE_ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { theatreId, screenId, movieId, startTime, endTime, language, format } = req.body;

    // Get screen seats to generate show seats
    const seats = await prisma.seat.findMany({
      where: { screenId }
    });

    const show = await prisma.show.create({
      data: {
        theatreId,
        screenId,
        movieId: movieId || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        language: language || "English",
        format: format || "2D",
        status: "ACTIVE",
        showSeats: {
          create: seats.map((st) => ({
            seatId: st.id,
            price: st.price,
            status: "AVAILABLE"
          }))
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: "Show and seat inventory created successfully",
      data: { show }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
