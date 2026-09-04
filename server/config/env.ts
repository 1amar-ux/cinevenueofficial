import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.union([z.string(), z.number()]).default(3000).transform((val) => typeof val === "number" ? val : parseInt(String(val), 10) || 3000),
  API_PREFIX: z.string().default("/api/v1"),
  
  // Database & Cache
  DATABASE_URL: z.string().optional().default("postgresql://postgres:postgres@localhost:5432/cinevenue"),
  DIRECT_URL: z.string().optional(),
  REDIS_URL: z.string().optional().default("redis://localhost:6379"),
  
  // Authentication & Security
  JWT_ACCESS_SECRET: z.string().default("cinevenue_dev_access_jwt_secret_key_991823"),
  JWT_REFRESH_SECRET: z.string().default("cinevenue_dev_refresh_jwt_secret_key_882714"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("1h"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional().default("http://localhost:3000/api/v1/auth/google"),
  
  // Payment Gateway
  RAZORPAY_KEY_ID: z.string().optional().default("rzp_test_TB7njDD8MonAMK"),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  
  // AI Service
  GEMINI_API_KEY: z.string().optional(),
  
  // CORS & Network
  CORS_ORIGIN: z.string().default("*"),
  FRONTEND_URL: z.string().optional().default("http://localhost:3000")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.warn("⚠️ Environment configuration validation warning:", parsedEnv.error.format());
}

export const env = parsedEnv.success ? parsedEnv.data : envSchema.parse({});
