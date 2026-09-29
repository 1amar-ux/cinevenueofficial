import { Request, Response } from "express";
import { integrationService } from "./integration.service";

export async function getIntegrations(req: Request, res: Response) {
  try {
    const list = await integrationService.getIntegrations();
    res.json({ success: true, integrations: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getIntegration(req: Request, res: Response) {
  try {
    const data = await integrationService.getIntegration(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, integration: data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createIntegration(req: Request, res: Response) {
  try {
    const data = await integrationService.createIntegration(req.body);
    res.json({ success: true, integration: data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateIntegration(req: Request, res: Response) {
  try {
    const data = await integrationService.updateIntegration(req.params.id, req.body);
    res.json({ success: true, integration: data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function testConnection(req: Request, res: Response) {
  try {
    const id = req.params.id || req.body.integrationId;
    const data = await integrationService.testConnection(id);
    res.json({ success: true, result: data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function syncTheatre(req: Request, res: Response) {
  try {
    const id = req.params.id || req.body.integrationId;
    const data = await integrationService.syncTheatre(id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function syncScreens(req: Request, res: Response) {
  try {
    const id = req.params.id || req.body.integrationId;
    const data = await integrationService.syncScreens(id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function syncSeats(req: Request, res: Response) {
  try {
    const id = req.params.id || req.body.integrationId;
    const data = await integrationService.syncSeats(id, req.body.screenId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function syncMovies(req: Request, res: Response) {
  try {
    const id = req.params.id || req.body.integrationId;
    const data = await integrationService.syncMovies(id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function syncShowtimes(req: Request, res: Response) {
  try {
    const id = req.params.id || req.body.integrationId;
    const data = await integrationService.syncShowtimes(id, req.body.date);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getShowSeatAvailability(req: Request, res: Response) {
  try {
    const { showId } = req.params;
    const theatreId = (req.query.theatreId as string) || "mock_theatre_01";
    const seats = await integrationService.getSeatAvailability(theatreId, showId);
    res.json({ success: true, seats });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Online booking is temporarily unavailable for this show. Please try again shortly."
    });
  }
}

export async function holdSeats(req: Request, res: Response) {
  try {
    const { theatreId, showId, seatIds, userId } = req.body;
    const result = await integrationService.holdSeats(theatreId, showId, seatIds, userId || "guest_user");
    res.json({ success: true, hold: result });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Sorry, one or more selected seats are no longer available. Please select different seats."
    });
  }
}

export async function createBooking(req: Request, res: Response) {
  try {
    const result = await integrationService.createBooking(req.body);
    res.json({ success: true, booking: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function cancelBooking(req: Request, res: Response) {
  try {
    const { bookingId } = req.params;
    const { theatreId, reason } = req.body;
    const result = await integrationService.cancelBooking(theatreId || "mock_theatre_01", bookingId, reason);
    res.json({ success: true, cancellation: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function runTest(req: Request, res: Response) {
  try {
    const data = await integrationService.runFullTest(req.params.id);
    res.json({ success: true, testRun: data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getLogs(req: Request, res: Response) {
  try {
    const data = await integrationService.getLogs(req.params.id);
    res.json({ success: true, logs: data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function handleWebhook(req: Request, res: Response) {
  try {
    const id = req.params.id;
    await integrationService.logEvent(id, 'WEBHOOK_RECEIVED', req.originalUrl, 200, {
      eventType: req.body.eventType || 'UNKNOWN'
    });
    res.json({ success: true, message: "Webhook received and processed" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
