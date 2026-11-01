import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cinevenue.app",
  appName: "CineVenue",
  webDir: "dist",
  server: {
    androidScheme: "https",
    iosScheme: "capacitor",
    cleartext: true,
    allowNavigation: [
      "cinevenue.com",
      "*.cinevenue.com",
      "*.vercel.app",
      "*.supabase.co",
      "checkout.razorpay.com",
      "api.razorpay.com",
      "*.cashfree.com"
    ]
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#0A0A0B"
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
