
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

  // Global API Network Bridge for Native Mobile (Capacitor Android/iOS) and Web
  const isNative = (typeof win.Capacitor !== "undefined" && win.Capacitor?.isNativePlatform?.()) ||
    window.location.origin.startsWith("capacitor://") ||
    window.location.origin.startsWith("ionic://") ||
    (window.location.hostname === "localhost" && window.location.port === "");

  const productionApiBase = ((import.meta as any).env?.VITE_API_URL || "https://cinevenue.com").replace(/\/+$/, "");

  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    let targetUrl: RequestInfo | URL = input;

    if (isNative) {
      if (typeof input === "string" && input.startsWith("/api")) {
        targetUrl = `${productionApiBase}${input}`;
      } else if (input instanceof URL && input.pathname.startsWith("/api") && input.origin === window.location.origin) {
        targetUrl = new URL(`${productionApiBase}${input.pathname}${input.search}`);
      }
    }

    // Inject Bearer token and admin passcode headers if available
    let modifiedInit = init;
    const token =
      localStorage.getItem("cine_access_token") ||
      localStorage.getItem("cine_auth_token") ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token");
    const adminPasscode = localStorage.getItem("cine_admin_passcode");

    if (token || adminPasscode) {
      const headers = new Headers(init?.headers || {});
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      if (adminPasscode && !headers.has("x-admin-passcode")) {
        headers.set("x-admin-passcode", adminPasscode);
      }
      modifiedInit = { ...init, headers };
    }

    return originalFetch.call(this, targetUrl, modifiedInit);
  };
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

