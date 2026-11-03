import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Ensures that whenever navigating to a new route in the SPA,
 * the page window scrolls directly to the top (0, 0), and disables
 * automatic browser scroll restoration so pages don't open in the middle.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }

      if (hash) {
        // If there's an anchor hash (e.g. #contact), scroll to it after rendering
        const targetElement = document.getElementById(hash.replace("#", ""));
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }

      // Default: scroll to top of window instantly
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Double-check on next frame in case async content layout recalculates
      requestAnimationFrame(() => {
        if (!window.location.hash) {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      });
    }
  }, [pathname, search, hash]);

  return null;
}

