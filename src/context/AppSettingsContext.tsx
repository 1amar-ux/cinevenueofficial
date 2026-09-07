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
  globalSubwebsiteEnabled: true,
  subwebsiteMaintenanceMessage: "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.",
  serviceControls: {
    website: { status: true, title: "CineVenue Under Maintenance", message: "Our platform is currently undergoing scheduled updates. We'll be back online shortly.", expectedTime: "30 July 2026, 06:00 PM" },
    movieBooking: { status: true, title: "Movie Booking Temporarily Unavailable", message: "We're upgrading our ticket booking experience.\n\nMovie booking will be available shortly.", expectedTime: "30 July 2026, 06:00 PM", visitors: 1240 },
    eventBooking: { status: true, title: "Event Booking Temporarily Unavailable", message: "Concerts, celebrity shows and live events are currently unavailable.\n\nPlease check back soon.", expectedTime: "31 July 2026, 10:00 AM", visitors: 327 },
    filmProduction: { status: true, title: "SUB-WEBSITE TEMPORARILY UNAVAILABLE", message: "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.", expectedTime: "30 July 2026, 12:00 PM" },
    eventManagement: { status: true, title: "SUB-WEBSITE TEMPORARILY UNAVAILABLE", message: "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.", expectedTime: "31 July 2026, 02:00 PM" },
    brandPromotion: { status: true, title: "SUB-WEBSITE TEMPORARILY UNAVAILABLE", message: "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.", expectedTime: "31 July 2026, 05:00 PM" },
    cinecoins: { status: true, title: "CineCoins Rewards Vault Under Maintenance", message: "CineCoins redemption, transfers, and wallet operations are undergoing scheduled updates.\n\nWe'll be back shortly.", expectedTime: "31 July 2026, 06:00 PM" }
  }
};

const BROADCAST_CHANNEL_NAME = "cinevenue_global_settings_bus";

const AppSettingsContext = createContext<AppSettingsContextType>({
  settings: DEFAULT_SETTINGS,
  isMaintenanceActive: false,
  isSubwebsiteEnabled: true,
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const isFetchingRef = useRef<boolean>(false);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  const applySettingsRecord = useCallback((data: any, shouldBroadcast: boolean = false) => {
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
        : (prev.globalSubwebsiteEnabled !== undefined ? prev.globalSubwebsiteEnabled : true);

      const subwebsiteMaintenanceMessage = data.subwebsite_maintenance_message ?? data.subwebsiteMaintenanceMessage ?? prev.subwebsiteMaintenanceMessage ?? DEFAULT_SETTINGS.subwebsiteMaintenanceMessage;

      const newMaintenanceMode = typeof (data.maintenance_mode ?? data.maintenanceMode) === "boolean"
        ? (data.maintenance_mode ?? data.maintenanceMode)
        : prev.maintenanceMode;

      // Smart Equality check: if nothing changed, preserve object identity to avoid re-rendering entire app
      const isControlsSame = JSON.stringify(prev.serviceControls) === JSON.stringify(mergedControls);
      const isSubSame = prev.globalSubwebsiteEnabled === globalSubwebsiteEnabled;
      const isMaintSame = prev.maintenanceMode === newMaintenanceMode;
      const isMsgSame = prev.subwebsiteMaintenanceMessage === subwebsiteMaintenanceMessage;

      if (isControlsSame && isSubSame && isMaintSame && isMsgSame && prev.updatedAt) {
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

      if (shouldBroadcast && typeof window !== "undefined" && broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage({
            type: "SETTINGS_SYNC",
            payload: updated
          });
        } catch (e) {}
      }

      return updated;
    });

    if (hasChanged) {
      setLastUpdated(new Date());
    }
  }, []);

  // Ultra-Fast Authoritative Fetch with Strict Cache-Busting
  const refreshSettings = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const cacheBuster = Date.now();
      const httpPromise = apiClient.get(`/settings/app?_cb=${cacheBuster}`, {
        timeout: 3000,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      }).catch(() => null);

      const sbPromise = isSupabaseConfigured
        ? Promise.resolve(
            supabase
              .from("app_settings")
              .select("*")
              .eq("id", "global_default")
              .single()
          ).catch(() => null)
        : Promise.resolve(null);

      const [httpRes, sbRes]: [any, any] = await Promise.all([httpPromise, sbPromise]);

      if (sbRes && !sbRes.error && sbRes.data) {
        applySettingsRecord(sbRes.data, false);
      } else if (httpRes?.data?.success && httpRes.data?.data) {
        applySettingsRecord(httpRes.data.data, false);
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
    // 1. Instant Optimistic Local & Inter-Tab Broadcast
    applySettingsRecord({
      globalSubwebsiteEnabled: enabled,
      ...(message && { subwebsiteMaintenanceMessage: message }),
      updatedAt: nowIso
    }, true);

    try {
      const adminPasscode = typeof window !== "undefined" ? (localStorage.getItem("cine_admin_passcode") || "8888") : "8888";
      const backendPromise = apiClient.post("/admin/settings/subwebsite", {
        enabled,
        message,
        updatedAt: nowIso
      }, {
        headers: {
          "x-admin-passcode": adminPasscode,
          "Cache-Control": "no-cache, no-store, must-revalidate"
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
    // 1. Instant Optimistic Update to UI, LocalStorage, and Inter-Tab Broadcast
    applySettingsRecord({
      ...newSettings,
      updatedAt: nowIso
    }, true);

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
          "x-admin-passcode": adminPasscode,
          "Cache-Control": "no-cache, no-store, must-revalidate"
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
        applySettingsRecord(res.data.data.settings, true);
      }

      return true;
    } catch (err: any) {
      console.warn("[AppSettings] Backend update notice (local optimistic state active):", err?.message || err);
      return true;
    }
  }, [applySettingsRecord]);

  // Initial Authoritative Load + Supabase Realtime Subscription + Inter-Tab Broadcast + Heartbeat
  useEffect(() => {
    isMountedRef.current = true;
    refreshSettings();

    // 1. Inter-Tab & Inter-Window Broadcast Channel for 0ms same-browser sync
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.onmessage = (event) => {
          if (event?.data?.type === "SETTINGS_SYNC" && event.data.payload) {
            console.log("[AppSettings Bus] Synchronized state across tabs:", event.data.payload);
            applySettingsRecord(event.data.payload, false);
          }
        };
        broadcastChannelRef.current = bc;
      }
    } catch (bcErr) {
      console.warn("[AppSettings] BroadcastChannel init notice:", bcErr);
    }

    // 2. Storage event listener (for older browser contexts or cross-tab fallback)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cine_app_settings" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          applySettingsRecord(parsed, false);
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // 3. Supabase Realtime Subscription (PostgreSQL database push to all worldwide devices)
    let channel: any = null;
    try {
      channel = supabase
        .channel("global-app-settings-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "app_settings"
          },
          (payload: any) => {
            console.log("[AppSettings Realtime] Received database update event:", payload);
            if (payload.new) {
              applySettingsRecord(payload.new, true);
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

    // 4. Focus & Network reconnection sync
    const handleVisibilityOrNetworkChange = () => {
      if (document.visibilityState === "visible" || navigator.onLine) {
        refreshSettings();
      }
    };

    window.addEventListener("online", handleVisibilityOrNetworkChange);
    document.addEventListener("visibilitychange", handleVisibilityOrNetworkChange);

    // 5. Fast Heartbeat polling interval (every 2.5 seconds) for instant cross-device synchronization
    const heartbeatInterval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "hidden") {
        refreshSettings();
      }
    }, 2500);

    return () => {
      isMountedRef.current = false;
      if (broadcastChannelRef.current) {
        try { broadcastChannelRef.current.close(); } catch {}
      }
      window.removeEventListener("storage", handleStorageChange);
      if (channel) {
        supabase.removeChannel(channel);
      }
      window.removeEventListener("online", handleVisibilityOrNetworkChange);
      document.removeEventListener("visibilitychange", handleVisibilityOrNetworkChange);
      clearInterval(heartbeatInterval);
    };
  }, [refreshSettings, applySettingsRecord]);

  const isMaintenanceActive = settings.maintenanceMode === true;
  const isSubwebsiteEnabled = settings.globalSubwebsiteEnabled !== false;

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
