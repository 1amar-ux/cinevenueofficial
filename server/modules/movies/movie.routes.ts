import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { NotFoundError } from "../../shared/errors";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";

const router = Router();

// 1. Get All Movies (with status filter: NOW_SHOWING, COMING_SOON, SPOTLIGHT)
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, genre, language } = req.query;

    const movies = await prisma.movie.findMany({
      where: {
        isActive: true,
        ...(status ? { status: String(status) } : {})
      },
      orderBy: { releaseDate: "desc" }
    });

    let filtered = movies;
    if (genre) {
      filtered = filtered.filter(m => m.genres.some(g => g.toLowerCase() === String(genre).toLowerCase()));
    }
    if (language) {
      filtered = filtered.filter(m => m.languages.some(l => l.toLowerCase() === String(language).toLowerCase()));
    }

    return res.json({
      success: true,
      count: filtered.length,
      data: { movies: filtered }
    });
  } catch (error) {
    next(error);
  }
});

// 2. Get Movie by ID / Title
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        shows: {
          where: { startTime: { gte: new Date() } },
          include: {
            theatre: true,
            screen: true
          }
        }
      }
    });

    if (!movie) {
      throw new NotFoundError("Movie", id);
    }

    return res.json({
      success: true,
      data: { movie }
    });
  } catch (error) {
    next(error);
  }
});

// 3. Admin: Create Movie
router.post("/", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, posterUrl, backdropUrl, trailerUrl, duration, rating, genres, languages, formats, status, releaseDate } = req.body;

    const movie = await prisma.movie.create({
      data: {
        title,
        description,
        posterUrl,
        backdropUrl,
        trailerUrl,
        duration: Number(duration) || 120,
        rating: rating ? Number(rating) : null,
        genres: Array.isArray(genres) ? genres : ["Action", "Drama"],
        languages: Array.isArray(languages) ? languages : ["Telugu", "Hindi"],
        formats: Array.isArray(formats) ? formats : ["2D", "IMAX"],
        status: status || "NOW_SHOWING",
        releaseDate: releaseDate ? new Date(releaseDate) : null
      }
    });

    return res.status(201).json({
      success: true,
      message: "Movie created successfully",
      data: { movie }
    });
  } catch (error) {
    next(error);
  }
});

// 4. Admin: Update Movie
router.put("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.update({
      where: { id },
      data: req.body
    });

    return res.json({
      success: true,
      message: "Movie updated successfully",
      data: { movie }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
