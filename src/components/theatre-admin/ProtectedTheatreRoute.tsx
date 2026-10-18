import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ShieldAlert, Sparkles } from "lucide-react";
import CineVenueLogo from "../CineVenueLogo";

interface ProtectedTheatreRouteProps {
  children: (props: { authorizedTheatreId: string | number; userRole: string }) => React.ReactElement;
  requiredPortal: "OWNER" | "MANAGER";
}

export default function ProtectedTheatreRoute({
  children,
  requiredPortal
}: ProtectedTheatreRouteProps) {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center space-y-4">
        <CineVenueLogo size="lg" subText="Authorizing Partner Session..." />
        <div className="flex items-center gap-2 text-gold text-xs font-mono font-bold tracking-widest uppercase">
          <Sparkles className="w-4 h-4 animate-spin text-gold" />
          <span>Verifying Cryptographic Credentials...</span>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated users must not access dashboard pages
  if (!isAuthenticated || !user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/theatre-admin/login?returnUrl=${returnUrl}`} replace />;
  }

  const role = (user.role || "CUSTOMER").toUpperCase();

  // 2. Reject Customers and Unprivileged accounts
  const isAllowedStaff =
    role === "THEATRE_ADMIN" ||
    role === "THEATRE_MANAGER" ||
    role === "SUPER_ADMIN" ||
    role === "ADMIN";

  if (!isAllowedStaff) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-[#121215] border border-red-500/20 p-8 rounded-2xl space-y-4 shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Access Prohibited</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Your account ({user.email}) is registered as a customer and does not possess administrator or operational permissions for CineVenue partner portals.
          </p>
          <button
            onClick={() => { window.location.href = "/"; }}
            className="w-full py-2.5 bg-gold hover:bg-gold-light text-black font-bold uppercase text-xs tracking-wider rounded-xl transition-colors cursor-pointer border-0"
          >
            Return to Customer Booking
          </button>
        </div>
      </div>
    );
  }

  // 3. Keep manager access strictly separate from theatre-owner access
  if (requiredPortal === "OWNER" && role === "THEATRE_MANAGER") {
    // Operations managers cannot access owner-only banking, settlements, and admin controls
    const userVenueId = user.theatreId || 1;
    return <Navigate to={`/theatre-manager?theatreId=${userVenueId}&notice=owner_restricted`} replace />;
  }

  // 4. Enforce theatre-level access control (Tenant Isolation)
  // Determine authoritative theatre ID
  const urlParams = new URLSearchParams(location.search);
  const requestedTheatreId = urlParams.get("theatreId");

  let authorizedTheatreId: string | number = user.theatreId || 1;

  // Super Admin can access any requested theatre
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    authorizedTheatreId = requestedTheatreId || user.theatreId || 1;
  } else {
    // For THEATRE_ADMIN and THEATRE_MANAGER: Lock to assigned theatre ID
    if (user.theatreId) {
      authorizedTheatreId = user.theatreId;
    } else if (requestedTheatreId) {
      authorizedTheatreId = requestedTheatreId;
    }
  }

  return children({ authorizedTheatreId, userRole: role });
}
