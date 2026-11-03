import { Router, Request, Response } from "express";
import { feedbackService } from "../../services/feedback.service";
import { logger } from "../../shared/logger";

const router = Router();

/**
 * POST /api/feedback
 * Submit customer post-booking feedback
 */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { rating, comment, bookingId, bookingType, userEmail, userName, title, userId } = req.body;

    if (rating === undefined || rating === null) {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_RATING", message: "Star rating between 1 and 5 is required." }
      });
      return;
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_RATING", message: "Rating must be an integer between 1 and 5." }
      });
      return;
    }

    if (!bookingId || typeof bookingId !== "string" || !bookingId.trim()) {
      res.status(400).json({
        success: false,
        error: { code: "MISSING_BOOKING_ID", message: "Booking ID is required." }
      });
      return;
    }

    const created = await feedbackService.createFeedback({
      userId: userId || (req as any).user?.id || null,
      bookingId: bookingId.trim(),
      bookingType: bookingType || "MOVIE",
      rating: numRating,
      comment: comment || "",
      userEmail: userEmail || (req as any).user?.email || null,
      userName: userName || (req as any).user?.name || null,
      title: title || null,
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully! Thank you for helping us improve CineVenue.",
      data: created
    });
  } catch (error: any) {
    logger.error("Error creating feedback", { error: error.message });
    res.status(400).json({
      success: false,
      error: { code: "FEEDBACK_CREATION_FAILED", message: error.message || "Failed to submit feedback." }
    });
  }
});

/**
 * GET /api/feedback
 * Get list of feedbacks with filtering and pagination
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { rating, bookingType, search, page, limit } = req.query;

    const result = await feedbackService.getFeedbacks({
      rating: rating as string | undefined,
      bookingType: bookingType as string | undefined,
      search: search as string | undefined,
      page: page as string | undefined,
      limit: limit as string | undefined,
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    logger.error("Error fetching feedbacks", { error: error.message });
    res.status(500).json({
      success: false,
      error: { code: "FEEDBACK_FETCH_FAILED", message: error.message || "Failed to retrieve feedbacks." }
    });
  }
});

/**
 * GET /api/feedback/stats
 * Feedback statistical analytics (counts, averages, ratings distribution)
 */
router.get("/stats", async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await feedbackService.getFeedbackStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    logger.error("Error fetching feedback stats", { error: error.message });
    res.status(500).json({
      success: false,
      error: { code: "FEEDBACK_STATS_FAILED", message: error.message || "Failed to retrieve stats." }
    });
  }
});

/**
 * DELETE /api/feedback/:id
 * Delete a feedback item
 */
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await feedbackService.deleteFeedback(id);
    res.json({
      success: true,
      message: "Feedback deleted successfully"
    });
  } catch (error: any) {
    logger.error("Error deleting feedback", { error: error.message });
    res.status(500).json({
      success: false,
      error: { code: "FEEDBACK_DELETE_FAILED", message: error.message || "Failed to delete feedback." }
    });
  }
});

export default router;

