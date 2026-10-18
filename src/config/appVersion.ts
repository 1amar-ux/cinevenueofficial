export interface AppMetadata {
  appName: string;
  companyName: string;
  version: string;
  buildNumber: string;
  packageId: string;
  supportEmail: string;
  supportPhone: string;
  headquarters: string;
  websiteUrl: string;
}

export const APP_CONFIG: AppMetadata = {
  appName: "CineVenue",
  companyName: "CINEVENUE PVT LTD",
  version: "1.0.6",
  buildNumber: "7",
  packageId: "com.cinevenue.app",
  supportEmail: "support@cinevenue.com",
  supportPhone: "+91 84658 70811",
  headquarters: "Guntur, Andhra Pradesh, India — 522001",
  websiteUrl: "https://cinevenue.com",
};

export function getAppRuntimePlatform(): "Android" | "iOS" | "Web Browser" {
  if (typeof window !== "undefined") {
    const isCapacitor = (window as any).Capacitor?.isNativePlatform?.() ||
      window.location.origin.startsWith("capacitor://") ||
      window.location.origin.startsWith("ionic://") ||
      (window.location.hostname === "localhost" && window.location.port === "");

    if (isCapacitor) {
      const userAgent = navigator.userAgent || "";
      if (/android/i.test(userAgent)) return "Android";
      if (/iPad|iPhone|iPod/.test(userAgent)) return "iOS";
      return "Android";
    }
  }
  return "Web Browser";
}
