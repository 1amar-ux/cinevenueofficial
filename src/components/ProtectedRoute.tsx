import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

function parseJwtPayload(token: string | null): any {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ children, requireAdmin = true }: ProtectedRouteProps) {
  const token =
    localStorage.getItem("cine_access_token") ||
    localStorage.getItem("cine_auth_token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token");

  // Check if admin / staff privileges are required
  if (requireAdmin) {
    if (!token) {
      return <Navigate to="/admin-login" replace />;
    }

    const payload = parseJwtPayload(token);
    const storedEmployee = localStorage.getItem("cine_current_employee");
    const isEmployeeActive = !!storedEmployee;

    // Check if token possesses administrative or operational staff role
    const adminRoles = [
      "SUPER_ADMIN",
      "ADMIN",
      "THEATRE_ADMIN",
      "THEATRE_MANAGER",
      "EVENT_ORGANIZER",
      "EVENT_MANAGER",
      "FINANCE",
      "MARKETING",
      "STAFF"
    ];

    const hasAdminRole = payload?.role && adminRoles.includes(payload.role);

    // If token is explicitly a customer, deny access to administrative portal
    if (payload?.role === "CUSTOMER" && !isEmployeeActive) {
      return <Navigate to="/admin-login?error=unauthorized" replace />;
    }

    // Permit if valid admin role or valid employee session exists
    if (hasAdminRole || isEmployeeActive) {
      return <>{children}</>;
    }

    return <Navigate to="/admin-login" replace />;
  }

  // Check if general user token is present
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
