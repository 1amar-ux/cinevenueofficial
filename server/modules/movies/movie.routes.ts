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
    const {
      title,
      description,
      posterUrl,
      poster,
      backdropUrl,
      banner,
      trailerUrl,
      duration,
      durationMins,
      rating,
      genres,
      genre,
      languages,
      language,
      formats,
      status,
      releaseDate
    } = req.body;

    const parsedGenres = Array.isArray(genres)
      ? genres
      : (typeof genre === "string" ? genre.split(",").map((s: string) => s.trim()) : ["Action", "Drama"]);

    const parsedLanguages = Array.isArray(languages)
      ? languages
      : (typeof language === "string" ? [language.trim()] : ["Telugu", "Hindi"]);

    const movie = await prisma.movie.create({
      data: {
        title,
        description: description || `${title} - Now playing exclusively at CineVenue premium theatres.`,
        posterUrl: posterUrl || poster || null,
        backdropUrl: backdropUrl || banner || null,
        trailerUrl: trailerUrl || null,
        duration: Number(duration || durationMins) || 120,
        rating: rating ? Number(rating) : 8.5,
        genres: parsedGenres,
        languages: parsedLanguages,
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
    let targetId = id;
    let existing = await prisma.movie.findUnique({ where: { id } });
    if (!existing) {
      existing = await prisma.movie.findFirst({
        where: {
          OR: [
            { id },
            { id: `mov_${id}` },
            { title: id },
            { title: req.body?.title }
          ]
        }
      });
      if (existing) targetId = existing.id;
    }

    const updateData: any = { ...req.body };
    if (updateData.rating !== undefined) {
      const num = Number(updateData.rating);
      updateData.rating = !isNaN(num) ? num : null;
    }
    if (updateData.durationMins !== undefined && updateData.duration === undefined) {
      updateData.duration = Number(updateData.durationMins) || 120;
    }
    if (updateData.genre && !updateData.genres) {
      updateData.genres = typeof updateData.genre === "string"
        ? updateData.genre.split(",").map((s: string) => s.trim())
        : updateData.genre;
    }
    if (updateData.language && !updateData.languages) {
      updateData.languages = typeof updateData.language === "string"
        ? [updateData.language.trim()]
        : updateData.language;
    }
    if (updateData.poster && !updateData.posterUrl) updateData.posterUrl = updateData.poster;
    if (updateData.banner && !updateData.backdropUrl) updateData.backdropUrl = updateData.banner;

    const movie = await prisma.movie.update({
      where: { id: targetId },
      data: updateData
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

// 5. Admin: Delete / Unpublish Movie
router.delete("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    let targetId = id;
    let existing = await prisma.movie.findUnique({ where: { id } });
    if (!existing) {
      existing = await prisma.movie.findFirst({
        where: {
          OR: [
            { id },
            { title: id }
          ]
        }
      });
      if (existing) targetId = existing.id;
    }

    // Attempt delete or mark inactive
    await prisma.movie.update({
      where: { id: targetId },
      data: { isActive: false }
    }).catch(async () => {
      await prisma.movie.delete({ where: { id: targetId } });
    });

    return res.json({
      success: true,
      message: "Movie removed successfully"
    });
  } catch (error) {
    next(error);
  }
});

export default router;
