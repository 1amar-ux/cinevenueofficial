import React from "react";
import MovieProductionHub from "../productions/MovieProductionHub";

interface FilmProductionHubProps {
  userEmail?: string | null;
  initialTab?: string;
  onOpenAuth?: () => void;
  onNavigateHome?: () => void;
}

/**
 * FilmProductionHub
 * Dedicated Movie Production Proposal Hub — displays exclusively the CineVenue
 * Movie Production Proposal Form, removing legacy dashboard, 24 crafts, and proposals.
 */
export default function FilmProductionHub({
  userEmail,
  onOpenAuth,
  onNavigateHome = () => (window.location.href = "/")
}: FilmProductionHubProps) {
  return (
    <MovieProductionHub
      userEmail={userEmail}
      onOpenAuth={onOpenAuth}
      onNavigateHome={onNavigateHome}
    />
  );
}
