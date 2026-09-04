/**
 * Vercel Serverless Function Entry Point
 *
 * Wraps the Express app as a Vercel-compatible serverless handler.
 * All /api/* requests are routed here by vercel.json.
 */
import { createApp } from "../server/app";

const app = createApp();

export default app;
