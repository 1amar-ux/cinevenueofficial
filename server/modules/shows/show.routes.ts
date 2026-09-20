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
    const { theatreId, screenId, movieId, startTime, endTime, language, format, movieTitle, theatreName, timeSlot, date } = req.body;

    let finalTheatreId = theatreId;
    let finalScreenId = screenId;
    let finalMovieId = movieId;

    if (!finalTheatreId && theatreName) {
      const th = await prisma.theatre.findFirst({
        where: { name: theatreName }
      });
      if (th) finalTheatreId = th.id;
    }

    if (!finalMovieId && movieTitle) {
      const mv = await prisma.movie.findFirst({
        where: { title: movieTitle }
      });
      if (mv) finalMovieId = mv.id;
    }

    if (!finalTheatreId) {
      const firstTheatre = await prisma.theatre.findFirst();
      if (firstTheatre) finalTheatreId = firstTheatre.id;
    }

    if (!finalScreenId && finalTheatreId) {
      const scr = await prisma.screen.findFirst({
        where: { theatreId: finalTheatreId }
      });
      if (scr) {
        finalScreenId = scr.id;
      } else {
        const newScr = await prisma.screen.create({
          data: {
            theatreId: finalTheatreId,
            name: "Screen 1",
            capacity: 150
          }
        });
        finalScreenId = newScr.id;
      }
    }

    // Parse start and end times
    let startDt = new Date();
    const rawTime = String(startTime || timeSlot || "7:30 PM").trim();
    if (rawTime.includes(":") && (rawTime.toUpperCase().includes("AM") || rawTime.toUpperCase().includes("PM"))) {
      const parts = rawTime.split(/\s+/);
      const timeParts = parts[0].split(":");
      let hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1] || "0", 10);
      const ampm = (parts[1] || "").toUpperCase();
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      startDt.setHours(hours, minutes, 0, 0);
    } else if (!isNaN(Date.parse(rawTime))) {
      startDt = new Date(rawTime);
    }

    const endDt = endTime ? new Date(endTime) : new Date(startDt.getTime() + 2.5 * 60 * 60 * 1000);

    const show = await prisma.show.create({
      data: {
        theatreId: finalTheatreId,
        screenId: finalScreenId,
        movieId: finalMovieId || null,
        startTime: startDt,
        endTime: endDt,
        language: language || "English",
        format: format || "2D",
        status: "ACTIVE"
      }
    });

    return res.status(201).json({
      success: true,
      message: "Show created successfully",
      data: { show }
    });
  } catch (error) {
    next(error);
  }
});

// 4. Admin: Update Show / Toggle Status
router.put("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN", "THEATRE_ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    let targetId = id;
    let existing = await prisma.show.findUnique({ where: { id } });
    if (!existing) {
      existing = await prisma.show.findFirst({
        where: {
          OR: [{ id }, { id: `shw_${id}` }]
        }
      });
      if (existing) targetId = existing.id;
    }

    const updateData: any = {};
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.language) updateData.language = req.body.language;
    if (req.body.format) updateData.format = req.body.format;

    // Resolve date and timeSlot to ISO startTime
    if (req.body.timeSlot || req.body.startTime || req.body.date) {
      const datePart = req.body.date && req.body.date !== "Today" ? req.body.date : new Date().toISOString().split("T")[0];
      const slotStr = String(req.body.timeSlot || req.body.startTime || "07:30 PM").toUpperCase();
      let hours = 19;
      let minutes = 30;
      const match = slotStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const ampm = match[3]?.toUpperCase();
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
      }
      const isoHours = String(hours).padStart(2, "0");
      const isoMinutes = String(minutes).padStart(2, "0");
      updateData.startTime = `${datePart}T${isoHours}:${isoMinutes}:00`;
      let endHours = hours + 2;
      let endMinutes = minutes + 30;
      if (endMinutes >= 60) {
        endHours += Math.floor(endMinutes / 60);
        endMinutes %= 60;
      }
      if (endHours >= 24) endHours %= 24;
      updateData.endTime = `${datePart}T${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}:00`;
    }

    if (req.body.movieId) {
      updateData.movieId = req.body.movieId;
    } else if (req.body.movieTitle) {
      const mov = await prisma.movie.findFirst({ where: { title: req.body.movieTitle } });
      if (mov) updateData.movieId = mov.id;
    }

    if (req.body.theatreId) {
      updateData.theatreId = req.body.theatreId;
    } else if (req.body.theatreName) {
      const th = await prisma.theatre.findFirst({ where: { name: req.body.theatreName } });
      if (th) updateData.theatreId = th.id;
    }

    if (req.body.price || req.body.pricePerSeat) {
      const newPrice = Number(req.body.price || req.body.pricePerSeat);
      if (!isNaN(newPrice) && newPrice > 0) {
        await prisma.showSeat.updateMany({
          where: { showId: targetId },
          data: { price: newPrice }
        }).catch(() => {});
      }
    }

    const show = await prisma.show.update({
      where: { id: targetId },
      data: updateData
    });

    return res.json({
      success: true,
      message: "Show updated successfully",
      data: { show }
    });
  } catch (error) {
    next(error);
  }
});

// 5. Admin: Delete / Cancel Show
router.delete("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN", "THEATRE_ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    let targetId = id;
    let existing = await prisma.show.findUnique({ where: { id } });
    if (!existing) {
      existing = await prisma.show.findFirst({
        where: {
          OR: [{ id }, { id: `shw_${id}` }]
        }
      });
      if (existing) targetId = existing.id;
    }

    await prisma.show.update({
      where: { id: targetId },
      data: { status: "CANCELLED" }
    }).catch(async () => {
      await prisma.show.delete({ where: { id: targetId } });
    });

    return res.json({
      success: true,
      message: "Show cancelled successfully"
    });
  } catch (error) {
    next(error);
  }
});

export default router;
