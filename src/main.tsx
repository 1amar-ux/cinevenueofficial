
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppSettingsProvider>
          <BookingProvider>
            <App />
          </BookingProvider>
        </AppSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

