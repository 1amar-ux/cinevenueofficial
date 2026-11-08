import { Request, Response } from "express";
import { generateConciergeResponse } from "./concierge.service";

export async function handleConciergeRequest(req: Request, res: Response): Promise<any> {
  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const { prompt, city = "Hyderabad" } = body || {};

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "Prompt is required and must be a non-empty string."
      });
    }

    const result = await generateConciergeResponse(prompt.trim(), String(city || "Hyderabad"));

    return res.status(200).json(result);
  } catch (err: any) {
    console.error("[ConciergeController] Unexpected error:", err);
    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: err?.message || "Failed to process VIP Concierge request"
    });
  }
}

