
if (typeof window !== "undefined") {
  const win = window as any;
  if (!win.__INITIAL_OAUTH_HASH__ && window.location.hash) {
    win.__INITIAL_OAUTH_HASH__ = window.location.hash;
  }
  if (!win.__INITIAL_OAUTH_SEARCH__ && window.location.search) {
    win.__INITIAL_OAUTH_SEARCH__ = window.location.search;
  }
  if (!win.__INITIAL_OAUTH_HREF__ && window.location.href) {
    win.__INITIAL_OAUTH_HREF__ = window.location.href;
  }

  // Ensure native Capacitor environment routes relative API calls to the production HTTPS backend
  const isNative = (typeof win.Capacitor !== "undefined" && win.Capacitor?.isNativePlatform?.()) ||
    window.location.origin.startsWith("capacitor://") ||
    window.location.origin.startsWith("ionic://") ||
    (window.location.hostname === "localhost" && window.location.port === "");

  if (isNative) {
    const originalFetch = window.fetch;
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
      if (typeof input === "string" && input.startsWith("/api")) {
        input = `https://cinevenue.com${input}`;
      } else if (input instanceof URL && input.pathname.startsWith("/api") && input.origin === window.location.origin) {
        input = new URL(`https://cinevenue.com${input.pathname}${input.search}`);
      }
      return originalFetch.call(this, input, init);
    };
  }
}

window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.message, event.error);
});
window.addEventListener('unhandledrejection', (event) => {
  console.warn('[Global UnhandledRejection]', event.reason);
});
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import { AppSettingsProvider } from "./context/AppSettingsContext";
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppSettingsProvider>
            <BookingProvider>
              <App />
            </BookingProvider>
          </AppSettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);

