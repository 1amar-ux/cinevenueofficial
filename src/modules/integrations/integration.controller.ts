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
    // Log idempotency check, signature verify, and event capture
    await integrationService.logEvent(id, 'WEBHOOK_RECEIVED', req.originalUrl, 200, {
      eventType: req.body.eventType || 'UNKNOWN',
      body: req.body
    });
    res.json({ success: true, message: "Webhook processed" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
