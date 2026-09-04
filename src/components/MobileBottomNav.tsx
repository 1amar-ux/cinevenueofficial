import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Film, Ticket, Coins, User } from "lucide-react";

const navigationItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Movies", path: "/movies", icon: Film },
  { label: "Events", path: "/events", icon: Ticket },
  { label: "CineCoins", path: "/cinecoins", icon: Coins },
  { label: "Account", path: "/account", icon: User },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) return null;

  return (
    <nav className="mobile-bottom-nav" aria-label="Primary mobile navigation">
      {navigationItems.map(({ label, path, icon: Icon }) => {
        const isActive = path === "/"
          ? location.pathname === "/"
          : location.pathname.startsWith(path);

        return (
          <Link
            key={path}
            to={path}
            className={`mobile-bottom-nav__item${isActive ? " is-active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
