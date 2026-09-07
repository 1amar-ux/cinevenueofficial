import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../api/client';

export interface MobileAppSettings {
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceCountdownEnabled: boolean;
  maintenanceEndTime: string | null;
  globalSubwebsiteEnabled: boolean;
  subwebsiteMaintenanceMessage: string;
  serviceControls?: Record<string, any>;
  updatedAt?: string;
}

interface AppSettingsContextType {
  settings: MobileAppSettings;
  isMaintenanceActive: boolean;
  isSubwebsiteEnabled: boolean;
  isLoading: boolean;
  lastUpdated: Date | null;
  refreshSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: MobileAppSettings = {
  maintenanceMode: false,
  maintenanceTitle: 'CineVenue Under Maintenance',
  maintenanceMessage: "Our platform is currently undergoing scheduled updates. We'll be back online shortly.",
  maintenanceCountdownEnabled: false,
  maintenanceEndTime: null,
  globalSubwebsiteEnabled: true,
  subwebsiteMaintenanceMessage: 'CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.',
  serviceControls: {
    website: { status: true, title: 'CineVenue Under Maintenance', message: 'Our platform is currently undergoing scheduled updates.', expectedTime: '30 July 2026, 06:00 PM' },
    movieBooking: { status: true, title: 'Movie Booking Temporarily Unavailable', message: 'We are upgrading our ticket booking experience.', expectedTime: '30 July 2026, 06:00 PM' },
    eventBooking: { status: true, title: 'Event Booking Temporarily Unavailable', message: 'Concerts and live events are currently unavailable.', expectedTime: '31 July 2026, 10:00 AM' },
    filmProduction: { status: true, title: 'SUB-WEBSITE TEMPORARILY UNAVAILABLE', message: 'CineVenue sub-websites are temporarily unavailable.', expectedTime: '30 July 2026, 12:00 PM' },
    eventManagement: { status: true, title: 'SUB-WEBSITE TEMPORARILY UNAVAILABLE', message: 'CineVenue sub-websites are temporarily unavailable.', expectedTime: '31 July 2026, 02:00 PM' },
    brandPromotion: { status: true, title: 'SUB-WEBSITE TEMPORARILY UNAVAILABLE', message: 'CineVenue sub-websites are temporarily unavailable.', expectedTime: '31 July 2026, 05:00 PM' },
    cinecoins: { status: true, title: 'CineCoins Rewards Vault Under Maintenance', message: 'CineCoins operations are undergoing scheduled updates.', expectedTime: '31 July 2026, 06:00 PM' },
  },
};

const STORAGE_KEY = 'cinevenue_mobile_settings';

const AppSettingsContext = createContext<AppSettingsContextType>({
  settings: DEFAULT_SETTINGS,
  isMaintenanceActive: false,
  isSubwebsiteEnabled: true,
  isLoading: true,
  lastUpdated: null,
  refreshSettings: async () => {},
});

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<MobileAppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  // Load cached settings on app launch
  useEffect(() => {
    (async () => {
      try {
        const cached = await SecureStore.getItemAsync(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setSettings((prev) => ({
            ...prev,
            ...parsed,
            serviceControls: {
              ...(DEFAULT_SETTINGS.serviceControls || {}),
              ...(parsed.serviceControls || {}),
            },
          }));
        }
      } catch (e) {
        // SecureStore fallback
      }
    })();
  }, []);

  const applySettingsRecord = useCallback(async (data: any) => {
    if (!data) return;

    setSettings((prev) => {
      const incomingControls = data.service_controls ?? data.serviceControls;
      const mergedControls = incomingControls
        ? {
            ...(prev.serviceControls || DEFAULT_SETTINGS.serviceControls || {}),
            ...incomingControls,
          }
        : prev.serviceControls;

      const rawGlobalSubwebsite = data.global_subwebsite_enabled ?? data.globalSubwebsiteEnabled;
      const globalSubwebsiteEnabled = typeof rawGlobalSubwebsite === 'boolean'
        ? rawGlobalSubwebsite
        : (prev.globalSubwebsiteEnabled !== undefined ? prev.globalSubwebsiteEnabled : true);

      const subwebsiteMaintenanceMessage = data.subwebsite_maintenance_message ?? data.subwebsiteMaintenanceMessage ?? prev.subwebsiteMaintenanceMessage ?? DEFAULT_SETTINGS.subwebsiteMaintenanceMessage;

      const newMaintenanceMode = typeof (data.maintenance_mode ?? data.maintenanceMode) === 'boolean'
        ? (data.maintenance_mode ?? data.maintenanceMode)
        : prev.maintenanceMode;

      const updated: MobileAppSettings = {
        maintenanceMode: newMaintenanceMode,
        maintenanceTitle: data.maintenance_title ?? data.maintenanceTitle ?? prev.maintenanceTitle,
        maintenanceMessage: data.maintenance_message ?? data.maintenanceMessage ?? prev.maintenanceMessage,
        maintenanceCountdownEnabled: data.maintenance_countdown_enabled ?? data.maintenanceCountdownEnabled ?? prev.maintenanceCountdownEnabled,
        maintenanceEndTime: data.maintenance_end_time ?? data.maintenanceEndTime ?? prev.maintenanceEndTime,
        globalSubwebsiteEnabled,
        subwebsiteMaintenanceMessage,
        serviceControls: mergedControls,
        updatedAt: data.updated_at ?? data.updatedAt ?? new Date().toISOString(),
      };

      SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    setLastUpdated(new Date());
  }, []);

  const refreshSettings = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const cacheBuster = Date.now();
      const res = await apiClient.get(`/settings/app?_cb=${cacheBuster}`, {
        timeout: 4000,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      }).catch(() => null);

      if (res?.data?.success && res.data?.data) {
        applySettingsRecord(res.data.data);
      }
    } catch (err) {
      // Offline fallback
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [applySettingsRecord]);

  // Initial fetch on mount + periodic heartbeat
  useEffect(() => {
    refreshSettings();

    const interval = setInterval(() => {
      refreshSettings();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshSettings]);

  const isMaintenanceActive = Boolean(
    settings.maintenanceMode === true ||
    settings.serviceControls?.website?.status === false ||
    settings.serviceControls?.globalWebsite?.status === false
  );

  const isSubwebsiteEnabled = Boolean(
    settings.globalSubwebsiteEnabled !== false && !isMaintenanceActive
  );

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        isMaintenanceActive,
        isSubwebsiteEnabled,
        isLoading,
        lastUpdated,
        refreshSettings,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => useContext(AppSettingsContext);
export default AppSettingsContext;
