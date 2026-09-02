
window.addEventListener('error', (event) => {
  document.body.innerHTML += '<div style="color: red; padding: 20px; z-index: 9999; position: fixed; top: 0; left: 0; background: white; white-space: pre-wrap; font-size: 14px;">' + event.message + '<br/>' + (event.error?.stack || '') + '</div>';
});
window.addEventListener('unhandledrejection', (event) => {
  document.body.innerHTML += '<div style="color: red; padding: 20px; z-index: 9999; position: fixed; top: 0; left: 0; background: white; white-space: pre-wrap; font-size: 14px;">' + (event.reason?.stack || event.reason) + '</div>';
});
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <App />
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

