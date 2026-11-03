import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Ensures that whenever navigating to a new route in the SPA or refreshing,
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

      if (hash && hash !== "#" && hash !== "#home") {
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

      // Handle async layout shifts on mobile and desktop
      const t1 = setTimeout(() => {
        if (!window.location.hash || window.location.hash === "#home") {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }, 60);

      const t2 = setTimeout(() => {
        if (!window.location.hash || window.location.hash === "#home") {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }, 250);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [pathname, search, hash]);

  return null;
}
