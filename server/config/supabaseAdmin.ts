import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";
import { logger } from "../shared/logger";

const supabaseUrl = env.SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://mpeedjoyvimegnmymweb.supabase.co";
const supabaseSecretKey = env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SECRET_KEY;

export const isSupabaseAdminConfigured = Boolean(
  supabaseUrl &&
  supabaseSecretKey &&
  supabaseSecretKey.startsWith("sb_secret_")
);

export const supabaseAdmin: SupabaseClient | null = isSupabaseAdminConfigured
  ? createClient(supabaseUrl, supabaseSecretKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

/**
 * Synchronizes global application and maintenance settings directly to the Supabase cloud database.
 * Because this uses the Supabase service role / secret key, it bypasses RLS and triggers
 * Postgres Realtime events to propagate state changes instantly across ALL devices worldwide.
 */
export async function syncAppSettingsToSupabase(settings: {
  maintenanceMode?: boolean;
  maintenanceTitle?: string;
  maintenanceMessage?: string;
  maintenanceCountdownEnabled?: boolean;
  maintenanceEndTime?: Date | string | null;
  globalSubwebsiteEnabled?: boolean;
  subwebsiteMaintenanceMessage?: string;
  serviceControls?: any;
  updatedBy?: string;
  updatedAt?: Date | string;
}): Promise<boolean> {
  if (!supabaseAdmin) {
    logger.warn("[SupabaseAdmin] Service role client is not configured; skipping cloud sync.");
    return false;
  }

  try {
    const payload: any = {
      id: "global_default",
      updated_at: settings.updatedAt ? new Date(settings.updatedAt).toISOString() : new Date().toISOString(),
      updated_by: settings.updatedBy || "admin_panel"
    };

    if (typeof settings.maintenanceMode === "boolean") {
      payload.maintenance_mode = settings.maintenanceMode;
    }
    if (settings.maintenanceTitle !== undefined) {
      payload.maintenance_title = settings.maintenanceTitle;
    }
    if (settings.maintenanceMessage !== undefined) {
      payload.maintenance_message = settings.maintenanceMessage;
    }
    if (typeof settings.maintenanceCountdownEnabled === "boolean") {
      payload.maintenance_countdown_enabled = settings.maintenanceCountdownEnabled;
    }
    if (settings.maintenanceEndTime !== undefined) {
      payload.maintenance_end_time = settings.maintenanceEndTime
        ? new Date(settings.maintenanceEndTime).toISOString()
        : null;
    }
    if (typeof settings.globalSubwebsiteEnabled === "boolean") {
      payload.global_subwebsite_enabled = settings.globalSubwebsiteEnabled;
    }
    if (settings.subwebsiteMaintenanceMessage !== undefined) {
      payload.subwebsite_maintenance_message = settings.subwebsiteMaintenanceMessage;
    }
    if (settings.serviceControls !== undefined) {
      payload.service_controls = settings.serviceControls;
    }

    const { error, data } = await supabaseAdmin
      .from("app_settings")
      .upsert(payload)
      .select();

    if (error) {
      logger.warn(`[SupabaseAdmin] Cloud app_settings sync warning: ${error.message}`);
      return false;
    }

    logger.info(`[SupabaseAdmin] Successfully synchronized global app_settings to cloud database for all devices.`);
    return true;
  } catch (err: any) {
    logger.warn(`[SupabaseAdmin] Cloud app_settings sync error: ${err?.message || err}`);
    return false;
  }
}
