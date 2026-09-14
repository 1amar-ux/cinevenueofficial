import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cinevenue.app",
  appName: "CineVenue",
  webDir: "dist",
  server: {
    androidScheme: "https",
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#0b0e14"
  }
};

export default config;
