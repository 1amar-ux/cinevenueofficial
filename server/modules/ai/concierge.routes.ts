import { Router } from "express";
import { handleConciergeRequest } from "./concierge.controller";

const router = Router();

// Supports both POST /api/v1/gemini/concierge and POST /api/v1/concierge
router.post(["/", "/concierge"], handleConciergeRequest);

export default router;

