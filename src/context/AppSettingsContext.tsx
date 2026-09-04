import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import apiClient from "../services/apiClient";

export interface GlobalAppSettings {
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceCountdownEnabled: boolean;
  maintenanceEndTime: string | null;
  serviceControls?: Record<string, any>;
  updatedAt?: string;
  updatedBy?: string;
}

interface AppSettingsContextType {
  settings: GlobalAppSettings;
  isMaintenanceActive: boolean;
  isLoading: boolean;
  isRealtimeConnected: boolean;
  lastUpdated: Date | null;
  refreshSettings: () => Promise<void>;
  updateGlobalSettings: (newSettings: Partial<GlobalAppSettings>) => Promise<boolean>;
}

const DEFAULT_SETTINGS: GlobalAppSettings = {
  maintenanceMode: false,
  maintenanceTitle: "Movie Booking Temporarily Unavailable",
  maintenanceMessage: "We're upgrading our ticket booking experience. Movie booking will be available shortly.",
  maintenanceCountdownEnabled: false,
  maintenanceEndTime: "30 July 2026 06:00 PM",
  serviceControls: {
    website: { status: true, title: "CineVenue Under Maintenance", message: "Our platform is currently undergoing scheduled updates. We'll be back online shortly.", expectedTime: "30 July 2026, 06:00 PM" },
    movieBooking: { status: true, title: "Movie Booking Temporarily Unavailable", message: "We're upgrading our ticket booking experience.\n\nMovie booking will be available shortly.", expectedTime: "30 July 2026, 06:00 PM", visitors: 1240 },
    eventBooking: { status: true, title: "Event Booking Temporarily Unavailable", message: "Concerts, celebrity shows and live events are currently unavailable.\n\nPlease check back soon.", expectedTime: "31 July 2026, 10:00 AM", visitors: 327 },
    filmProduction: { status: true, title: "Film Production Division Under Maintenance", message: "We're updating our production portfolio and services.\n\nFor urgent enquiries contact info.cinevenue@gmail.com", expectedTime: "30 July 2026, 12:00 PM" },
    eventManagement: { status: true, title: "Event Management Under Maintenance", message: "Movie Promotions, Audio Launches, Celebrity Shows, and Corporate Events are temporarily unavailable.\n\nPlease visit again soon.", expectedTime: "31 July 2026, 02:00 PM" },
    brandPromotion: { status: true, title: "Brand Promotion Under Maintenance", message: "Brand Promotion and Media Campaign services are under maintenance.\n\nWe'll be back shortly.", expectedTime: "31 July 2026, 05:00 PM" }
  }
};

const AppSettingsContext = createContext<AppSettingsContextType>({
  settings: DEFAULT_SETTINGS,
  isMaintenanceActive: false,
  isLoading: true,
  isRealtimeConnected: false,
  lastUpdated: null,
  refreshSettings: async () => {},
  updateGlobalSettings: async () => false
});

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GlobalAppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const applySettingsRecord = useCallback((data: any) => {
    if (!data) return;
    setSettings((prev) => ({
      maintenanceMode: data.maintenance_mode ?? data.maintenanceMode ?? prev.maintenanceMode,
      maintenanceTitle: data.maintenance_title ?? data.maintenanceTitle ?? prev.maintenanceTitle,
      maintenanceMessage: data.maintenance_message ?? data.maintenanceMessage ?? prev.maintenanceMessage,
      maintenanceCountdownEnabled: data.maintenance_countdown_enabled ?? data.maintenanceCountdownEnabled ?? prev.maintenanceCountdownEnabled,
      maintenanceEndTime: data.maintenance_end_time ?? data.maintenanceEndTime ?? prev.maintenanceEndTime,
      serviceControls: data.service_controls ?? data.serviceControls ?? prev.serviceControls,
      updatedAt: data.updated_at ?? data.updatedAt,
      updatedBy: data.updated_by ?? data.updatedBy
    }));
    setLastUpdated(new Date());
  }, []);

  // Authoritative Fetch: Attempts Supabase directly, with fallback to Canonical Server API
  const refreshSettings = useCallback(async () => {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("app_settings")
          .select("*")
          .eq("id", "global_default")
          .single();

        if (!error && data) {
          applySettingsRecord(data);
          setIsLoading(false);
          return;
        }
      }

      // Authoritative Fallback: Fetch via Backend API
      const res = await apiClient.get("/settings/app");
      if (res.data?.success && res.data?.data) {
        applySettingsRecord(res.data.data);
      }
    } catch (err: any) {
      console.warn("[AppSettings] Resilient fetch notice:", err.message);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [applySettingsRecord]);

  // Update Global Settings (Admin Operation)
  const updateGlobalSettings = useCallback(async (newSettings: Partial<GlobalAppSettings>): Promise<boolean> => {
    try {
      // 1. Send authoritative update to backend admin route (which persists to Supabase DB & writes audit logs)
      const payload: any = {};
      if (newSettings.maintenanceMode !== undefined) payload.maintenanceMode = newSettings.maintenanceMode;
      if (newSettings.maintenanceTitle !== undefined) payload.maintenanceTitle = newSettings.maintenanceTitle;
      if (newSettings.maintenanceMessage !== undefined) payload.maintenanceMessage = newSettings.maintenanceMessage;
      if (newSettings.maintenanceCountdownEnabled !== undefined) payload.maintenanceCountdownEnabled = newSettings.maintenanceCountdownEnabled;
      if (newSettings.maintenanceEndTime !== undefined) payload.maintenanceEndTime = newSettings.maintenanceEndTime;
      if (newSettings.serviceControls !== undefined) payload.serviceControls = newSettings.serviceControls;

      const res = await apiClient.post("/admin/settings/global", payload);

      if (res.data?.success && res.data?.data?.settings) {
        applySettingsRecord(res.data.data.settings);
        return true;
      }

      // If Supabase direct authenticated client is available
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("app_settings")
          .update({
            ...(newSettings.maintenanceMode !== undefined && { maintenance_mode: newSettings.maintenanceMode }),
            ...(newSettings.maintenanceTitle !== undefined && { maintenance_title: newSettings.maintenanceTitle }),
            ...(newSettings.maintenanceMessage !== undefined && { maintenance_message: newSettings.maintenanceMessage }),
            ...(newSettings.maintenanceCountdownEnabled !== undefined && { maintenance_countdown_enabled: newSettings.maintenanceCountdownEnabled }),
            ...(newSettings.maintenanceEndTime !== undefined && { maintenance_end_time: newSettings.maintenanceEndTime }),
            ...(newSettings.serviceControls !== undefined && { service_controls: newSettings.serviceControls }),
            updated_at: new Date().toISOString()
          })
          .eq("id", "global_default");

        if (!error) {
          applySettingsRecord(newSettings);
          return true;
        }
      }

      return false;
    } catch (err: any) {
      console.error("[AppSettings] Failed to update global settings:", err);
      return false;
    }
  }, [applySettingsRecord]);

  // Initial Authoritative Load + Supabase Realtime Subscription + Reconnect Handling
  useEffect(() => {
    isMountedRef.current = true;
    refreshSettings();

    // 1. Supabase Realtime Subscription
    let channel: any = null;
    try {
      channel = supabase
        .channel("global-app-settings")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "app_settings"
          },
          (payload: any) => {
            console.log("[AppSettings Realtime] Received global configuration update:", payload);
            if (payload.new) {
              applySettingsRecord(payload.new);
            } else {
              refreshSettings();
            }
          }
        )
        .subscribe((status) => {
          if (isMountedRef.current) {
            setIsRealtimeConnected(status === "SUBSCRIBED");
          }
        });
    } catch (rtErr) {
      console.warn("[AppSettings] Realtime subscription init notice:", rtErr);
    }

    // 2. Step 19: Realtime Reconnect & Resilient Listeners
    const handleVisibilityOrNetworkChange = () => {
      if (document.visibilityState === "visible" || navigator.onLine) {
        refreshSettings();
      }
    };

    window.addEventListener("online", handleVisibilityOrNetworkChange);
    document.addEventListener("visibilitychange", handleVisibilityOrNetworkChange);

    // 3. Heartbeat polling interval (every 10 seconds) to ensure synchronization across devices even with firewall/WebSocket limitations
    const heartbeatInterval = setInterval(() => {
      refreshSettings();
    }, 10000);

    return () => {
      isMountedRef.current = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
      window.removeEventListener("online", handleVisibilityOrNetworkChange);
      document.removeEventListener("visibilitychange", handleVisibilityOrNetworkChange);
      clearInterval(heartbeatInterval);
    };
  }, [refreshSettings, applySettingsRecord]);

  const isMaintenanceActive = settings.maintenanceMode === true;

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        isMaintenanceActive,
        isLoading,
        isRealtimeConnected,
        lastUpdated,
        refreshSettings,
        updateGlobalSettings
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => useContext(AppSettingsContext);
export default AppSettingsContext;
