import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import apiClient from "../services/apiClient";

export interface GlobalAppSettings {
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceCountdownEnabled: boolean;
  maintenanceEndTime: string | null;
  globalSubwebsiteEnabled: boolean;
  subwebsiteMaintenanceMessage: string;
  serviceControls?: Record<string, any>;
  updatedAt?: string;
  updatedBy?: string;
}

interface AppSettingsContextType {
  settings: GlobalAppSettings;
  isMaintenanceActive: boolean;
  isSubwebsiteEnabled: boolean;
  isLoading: boolean;
  isRealtimeConnected: boolean;
  lastUpdated: Date | null;
  refreshSettings: () => Promise<void>;
  updateGlobalSettings: (newSettings: Partial<GlobalAppSettings>) => Promise<boolean>;
  setGlobalSubwebsiteEnabled: (enabled: boolean, message?: string) => Promise<boolean>;
}

const DEFAULT_SETTINGS: GlobalAppSettings = {
  maintenanceMode: false,
  maintenanceTitle: "Movie Booking Temporarily Unavailable",
  maintenanceMessage: "We're upgrading our ticket booking experience. Movie booking will be available shortly.",
  maintenanceCountdownEnabled: false,
  maintenanceEndTime: "30 July 2026 06:00 PM",
  globalSubwebsiteEnabled: false,
  subwebsiteMaintenanceMessage: "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.",
  serviceControls: {
    website: { status: true, title: "CineVenue Under Maintenance", message: "Our platform is currently undergoing scheduled updates. We'll be back online shortly.", expectedTime: "30 July 2026, 06:00 PM" },
    movieBooking: { status: true, title: "Movie Booking Temporarily Unavailable", message: "We're upgrading our ticket booking experience.\n\nMovie booking will be available shortly.", expectedTime: "30 July 2026, 06:00 PM", visitors: 1240 },
    eventBooking: { status: false, title: "Event Booking Temporarily Unavailable", message: "Concerts, celebrity shows and live events are currently unavailable.\n\nPlease check back soon.", expectedTime: "31 July 2026, 10:00 AM", visitors: 327 },
    filmProduction: { status: false, title: "SUB-WEBSITE TEMPORARILY UNAVAILABLE", message: "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.", expectedTime: "30 July 2026, 12:00 PM" },
    eventManagement: { status: false, title: "SUB-WEBSITE TEMPORARILY UNAVAILABLE", message: "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.", expectedTime: "31 July 2026, 02:00 PM" },
    brandPromotion: { status: false, title: "SUB-WEBSITE TEMPORARILY UNAVAILABLE", message: "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.", expectedTime: "31 July 2026, 05:00 PM" },
    cinecoins: { status: true, title: "CineCoins Rewards Vault Under Maintenance", message: "CineCoins redemption, transfers, and wallet operations are undergoing scheduled updates.\n\nWe'll be back shortly.", expectedTime: "31 July 2026, 06:00 PM" }
  }
};

const AppSettingsContext = createContext<AppSettingsContextType>({
  settings: DEFAULT_SETTINGS,
  isMaintenanceActive: false,
  isSubwebsiteEnabled: false,
  isLoading: true,
  isRealtimeConnected: false,
  lastUpdated: null,
  refreshSettings: async () => {},
  updateGlobalSettings: async () => false,
  setGlobalSubwebsiteEnabled: async () => false
});

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GlobalAppSettings>(() => {
    try {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("cine_app_settings");
        if (cached) {
          const parsed = JSON.parse(cached);
          return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            serviceControls: {
              ...(DEFAULT_SETTINGS.serviceControls || {}),
              ...(parsed.serviceControls || {})
            }
          };
        }
      }
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const isFetchingRef = useRef<boolean>(false);

  const applySettingsRecord = useCallback((data: any) => {
    if (!data) return;
    let hasChanged = false;

    setSettings((prev) => {
      const incomingControls = data.service_controls ?? data.serviceControls;
      const mergedControls = incomingControls
        ? {
            ...(prev.serviceControls || DEFAULT_SETTINGS.serviceControls || {}),
            ...incomingControls
          }
        : prev.serviceControls;

      const rawGlobalSubwebsite = data.global_subwebsite_enabled ?? data.globalSubwebsiteEnabled;
      const globalSubwebsiteEnabled = typeof rawGlobalSubwebsite === "boolean"
        ? rawGlobalSubwebsite
        : (prev.globalSubwebsiteEnabled ?? false);

      const subwebsiteMaintenanceMessage = data.subwebsite_maintenance_message ?? data.subwebsiteMaintenanceMessage ?? prev.subwebsiteMaintenanceMessage ?? DEFAULT_SETTINGS.subwebsiteMaintenanceMessage;

      const newMaintenanceMode = data.maintenance_mode ?? data.maintenanceMode ?? prev.maintenanceMode;

      // Timestamp Freshness Guard: If incoming data is older than current state, discard it
      const incomingUpdatedAt = data.updated_at ?? data.updatedAt;
      if (incomingUpdatedAt && prev.updatedAt) {
        const incomingTime = new Date(incomingUpdatedAt).getTime();
        const prevTime = new Date(prev.updatedAt).getTime();
        if (!isNaN(incomingTime) && !isNaN(prevTime) && incomingTime < prevTime - 500) {
          return prev;
        }
      }

      // Smart Equality check: if nothing changed, preserve object identity to avoid re-rendering entire app
      const isControlsSame = JSON.stringify(prev.serviceControls) === JSON.stringify(mergedControls);
      const isSubSame = prev.globalSubwebsiteEnabled === globalSubwebsiteEnabled;
      const isMaintSame = prev.maintenanceMode === newMaintenanceMode;
      const isMsgSame = prev.subwebsiteMaintenanceMessage === subwebsiteMaintenanceMessage;

      if (isControlsSame && isSubSame && isMaintSame && isMsgSame) {
        return prev;
      }

      hasChanged = true;

      const updated: GlobalAppSettings = {
        maintenanceMode: newMaintenanceMode,
        maintenanceTitle: data.maintenance_title ?? data.maintenanceTitle ?? prev.maintenanceTitle,
        maintenanceMessage: data.maintenance_message ?? data.maintenanceMessage ?? prev.maintenanceMessage,
        maintenanceCountdownEnabled: data.maintenance_countdown_enabled ?? data.maintenanceCountdownEnabled ?? prev.maintenanceCountdownEnabled,
        maintenanceEndTime: data.maintenance_end_time ?? data.maintenanceEndTime ?? prev.maintenanceEndTime,
        globalSubwebsiteEnabled,
        subwebsiteMaintenanceMessage,
        serviceControls: mergedControls,
        updatedAt: data.updated_at ?? data.updatedAt ?? new Date().toISOString(),
        updatedBy: data.updated_by ?? data.updatedBy ?? prev.updatedBy
      };

      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("cine_app_settings", JSON.stringify(updated));
        }
      } catch (e) {}

      return updated;
    });

    if (hasChanged) {
      setLastUpdated(new Date());
    }
  }, []);

  // Ultra-Fast Authoritative Fetch: Prioritizes fast Backend API (sub-300ms) with Supabase fallback
  const refreshSettings = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      // 1. Ultra-fast same-origin Backend API (responds in ~200-300ms, zero cold-start delay)
      const res = await apiClient.get("/settings/app", { timeout: 3000 }).catch(() => null);
      if (res?.data?.success && res.data?.data) {
        applySettingsRecord(res.data.data);
        return;
      }

      // 2. Fallback to Supabase with strict 1200ms timeout to avoid hanging
      if (isSupabaseConfigured) {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("SB_TIMEOUT")), 1200));
        const dbPromise = supabase
          .from("app_settings")
          .select("*")
          .eq("id", "global_default")
          .single();

        const result: any = await Promise.race([dbPromise, timeoutPromise]).catch(() => null);
        if (!result?.error && result?.data) {
          applySettingsRecord(result.data);
        }
      }
    } catch (err: any) {
      console.warn("[AppSettings] Resilient fetch notice:", err?.message || err);
    } finally {
      isFetchingRef.current = false;
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [applySettingsRecord]);

  // Dedicated Global Sub-Website ON/OFF Switch (Admin Operation)
  const setGlobalSubwebsiteEnabled = useCallback(async (enabled: boolean, message?: string): Promise<boolean> => {
    const nowIso = new Date().toISOString();
    // 1. Instant Optimistic Local Update
    applySettingsRecord({
      globalSubwebsiteEnabled: enabled,
      ...(message && { subwebsiteMaintenanceMessage: message }),
      updatedAt: nowIso
    });

    try {
      const adminPasscode = typeof window !== "undefined" ? (localStorage.getItem("cine_admin_passcode") || "8888") : "8888";
      const backendPromise = apiClient.post("/admin/settings/subwebsite", {
        enabled,
        message,
        updatedAt: nowIso
      }, {
        headers: {
          "x-admin-passcode": adminPasscode
        }
      }).catch((err) => {
        console.warn("[AppSettings] Backend update notice for sub-website switch:", err?.message || err);
        return null;
      });

      // Dual-layer persistence: also update Supabase directly if configured
      const sbPromise = isSupabaseConfigured
        ? Promise.resolve(
            supabase
              .from("app_settings")
              .upsert({
                id: "global_default",
                global_subwebsite_enabled: enabled,
                ...(message && { subwebsite_maintenance_message: message }),
                updated_at: nowIso
              })
          ).catch((sbErr: any) => {
            console.warn("[AppSettings] Supabase direct sync notice:", sbErr);
            return null;
          })
        : Promise.resolve(null);

      await Promise.all([backendPromise, sbPromise]);
      refreshSettings();
      return true;
    } catch (err: any) {
      console.warn("[AppSettings] Subwebsite toggle notice:", err?.message || err);
      return true;
    }
  }, [applySettingsRecord, refreshSettings]);

  // Update Global Settings (Admin Operation)
  const updateGlobalSettings = useCallback(async (newSettings: Partial<GlobalAppSettings>): Promise<boolean> => {
    const nowIso = new Date().toISOString();
    // 1. Instant Optimistic Update to UI and LocalStorage
    applySettingsRecord({
      ...newSettings,
      updatedAt: nowIso
    });

    try {
      // 2. Send authoritative update to backend admin route (persists to DB & writes audit logs)
      const payload: any = {
        updatedAt: nowIso
      };
      if (newSettings.maintenanceMode !== undefined) payload.maintenanceMode = newSettings.maintenanceMode;
      if (newSettings.maintenanceTitle !== undefined) payload.maintenanceTitle = newSettings.maintenanceTitle;
      if (newSettings.maintenanceMessage !== undefined) payload.maintenanceMessage = newSettings.maintenanceMessage;
      if (newSettings.maintenanceCountdownEnabled !== undefined) payload.maintenanceCountdownEnabled = newSettings.maintenanceCountdownEnabled;
      if (newSettings.maintenanceEndTime !== undefined) payload.maintenanceEndTime = newSettings.maintenanceEndTime;
      if (newSettings.globalSubwebsiteEnabled !== undefined) payload.globalSubwebsiteEnabled = newSettings.globalSubwebsiteEnabled;
      if (newSettings.subwebsiteMaintenanceMessage !== undefined) payload.subwebsiteMaintenanceMessage = newSettings.subwebsiteMaintenanceMessage;
      if (newSettings.serviceControls !== undefined) payload.serviceControls = newSettings.serviceControls;

      const adminPasscode = typeof window !== "undefined" ? (localStorage.getItem("cine_admin_passcode") || "8888") : "8888";
      
      const backendPromise = apiClient.post("/admin/settings/global", payload, {
        headers: {
          "x-admin-passcode": adminPasscode
        }
      }).catch((err) => {
        console.warn("[AppSettings] Backend update notice:", err?.message || err);
        return null;
      });

      // 3. Dual-layer persistence: also update Supabase directly in parallel
      const sbPromise = isSupabaseConfigured
        ? Promise.resolve(
            supabase
              .from("app_settings")
              .upsert({
                id: "global_default",
                ...(newSettings.maintenanceMode !== undefined && { maintenance_mode: newSettings.maintenanceMode }),
                ...(newSettings.maintenanceTitle !== undefined && { maintenance_title: newSettings.maintenanceTitle }),
                ...(newSettings.maintenanceMessage !== undefined && { maintenance_message: newSettings.maintenanceMessage }),
                ...(newSettings.maintenanceCountdownEnabled !== undefined && { maintenance_countdown_enabled: newSettings.maintenanceCountdownEnabled }),
                ...(newSettings.maintenanceEndTime !== undefined && { maintenance_end_time: newSettings.maintenanceEndTime }),
                ...(newSettings.globalSubwebsiteEnabled !== undefined && { global_subwebsite_enabled: newSettings.globalSubwebsiteEnabled }),
                ...(newSettings.subwebsiteMaintenanceMessage !== undefined && { subwebsite_maintenance_message: newSettings.subwebsiteMaintenanceMessage }),
                ...(newSettings.serviceControls !== undefined && { service_controls: newSettings.serviceControls }),
                updated_at: nowIso
              })
          ).catch((sbErr: any) => {
            console.warn("[AppSettings] Supabase direct update notice:", sbErr);
            return null;
          })
        : Promise.resolve(null);

      const [res] = await Promise.all([backendPromise, sbPromise]);

      if (res?.data?.success && res.data?.data?.settings) {
        applySettingsRecord(res.data.data.settings);
      }

      return true;
    } catch (err: any) {
      console.warn("[AppSettings] Backend update notice (local optimistic state active):", err?.message || err);
      return true;
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

    // 2. Realtime Reconnect & Resilient Listeners
    const handleVisibilityOrNetworkChange = () => {
      if (document.visibilityState === "visible" || navigator.onLine) {
        refreshSettings();
      }
    };

    window.addEventListener("online", handleVisibilityOrNetworkChange);
    document.addEventListener("visibilitychange", handleVisibilityOrNetworkChange);

    // 3. Fast Heartbeat polling interval (every 3 seconds) for instant cross-device synchronization
    const heartbeatInterval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "hidden") {
        refreshSettings();
      }
    }, 3000);

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
  const isSubwebsiteEnabled = settings.globalSubwebsiteEnabled === true;

  const contextValue = useMemo(() => ({
    settings,
    isMaintenanceActive,
    isSubwebsiteEnabled,
    isLoading,
    isRealtimeConnected,
    lastUpdated,
    refreshSettings,
    updateGlobalSettings,
    setGlobalSubwebsiteEnabled
  }), [
    settings,
    isMaintenanceActive,
    isSubwebsiteEnabled,
    isLoading,
    isRealtimeConnected,
    lastUpdated,
    refreshSettings,
    updateGlobalSettings,
    setGlobalSubwebsiteEnabled
  ]);

  return (
    <AppSettingsContext.Provider value={contextValue}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => useContext(AppSettingsContext);
export default AppSettingsContext;
