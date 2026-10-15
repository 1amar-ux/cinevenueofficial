import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long").regex(/[a-z]/, "Password must include a lowercase letter").regex(/[A-Z]/, "Password must include an uppercase letter").regex(/[0-9]/, "Password must include a number").regex(/[^A-Za-z0-9]/, "Password must include a symbol"),
  confirmPassword: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters long"),
  mobile: z.string().trim().transform((val) => val.replace(/\s+/g, "")).pipe(z.string().regex(/^\+?[1-9]\d{7,14}$/, "Please provide a valid mobile number")).optional().or(z.literal("")).or(z.null()),
  dateOfBirth: z.coerce.date().optional(),
  profileImageUrl: z.string().url().optional()
}).refine((data) => !data.confirmPassword || data.confirmPassword === data.password, {
  message: "Passwords do not match.",
  path: ["confirmPassword"]
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Email or mobile number is required"),
  password: z.string().min(1, "Password is required")
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required").optional()
});

export const forgotPasswordSchema = z.object({
  email: z.string().optional(),
  identifier: z.string().optional()
}).refine(data => !!(data.email || data.identifier), {
  message: "Please provide your email address or mobile number"
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token or code is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters long"),
  identifier: z.string().optional()
});

export const googleAuthSchema = z.object({
  idToken: z.string().optional(),
  accessToken: z.string().optional(),
  code: z.string().optional(),
  state: z.string().optional(),
  supabaseUserId: z.string().optional(),
  email: z.string().email("Please provide a valid email address").optional(),
  name: z.string().optional(),
  profileImageUrl: z.string().optional().nullable(),
  mobile: z.string().optional().nullable()
}).passthrough().refine(data => Boolean(data.idToken || data.accessToken || data.code || data.email), {
  message: "A valid cryptographic provider token (idToken), authorization code, or authenticated session identity is required",
  path: ["idToken"]
});

