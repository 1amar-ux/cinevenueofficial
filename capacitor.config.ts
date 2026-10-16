import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cinevenue.app",
  appName: "CineVenue",
  webDir: "dist",
  server: {
    androidScheme: "https",
    iosScheme: "capacitor",
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#0b0e14"
  },
  ios: {
    contentInset: "always",
    backgroundColor: "#0b0e14",
    preferredContentMode: "mobile",
    allowsLinkPreview: false,
    scrollEnabled: true
  }
};

export default config;
