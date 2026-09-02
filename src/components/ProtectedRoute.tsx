import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = true }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");

  // Check if admin is required and if they have an admin token
  if (requireAdmin && !adminToken) {
    return <Navigate to="/admin-login" replace />;
  }

  // Check if general user token is present
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
