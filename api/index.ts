/**
 * Vercel Serverless Function Entry Point
 *
 * Wraps the Express app as a Vercel-compatible serverless handler.
 * All /api/* requests are routed here by vercel.json.
 */
import { createApp } from "../server/app";

let app: any = null;

function getApp() {
  if (!app) {
    app = createApp();
  }
  return app;
}

export default async function handler(req: any, res: any) {
  try {
    const expressApp = getApp();
    return expressApp(req, res);
  } catch (error: any) {
    console.error("[VERCEL_HANDLER_ERROR]", error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: {
          code: "FUNCTION_INVOCATION_ERROR",
          message: error?.message || "Internal serverless error"
        }
      });
    }
  }
}
