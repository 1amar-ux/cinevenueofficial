import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = true }: ProtectedRouteProps) {
  const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
  const adminToken = localStorage.getItem("adminToken") || localStorage.getItem("token");

  // Check if admin is required
  if (requireAdmin) {
    if (!adminToken) {
      return <Navigate to="/admin-login" replace />;
    }
    return <>{children}</>;
  }

  // Check if general user token is present
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

