import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export default function GlobalBackButton() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on the root / landing page
  const pathname = location.pathname.trim();
  if (pathname === "/" || pathname === "") {
    return null;
  }

  const handleBack = () => {
    // If user navigated within the current app session, go back in history
    if (window.history.state && typeof window.history.state.idx === "number" && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      // Fallback to Home
      navigate("/");
    }
  };

  return (
    <aside
      aria-label="Global Navigation Controls"
      className="fixed bottom-6 left-5 md:bottom-8 md:left-8 z-[9999] pointer-events-auto print:hidden animate-fade-in"
    >
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#0A0D14]/90 border border-gold/30 hover:border-gold shadow-2xl shadow-black/90 backdrop-blur-xl transition-all duration-200">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go Back to previous page"
          title="Back to previous page"
          className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-gold/10 hover:bg-gold/20 text-amber-100 hover:text-gold text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer active:scale-95 border border-gold/20 hover:border-gold/50"
        >
          <ArrowLeft className="w-4 h-4 text-gold group-hover:-translate-x-1 transition-transform duration-150" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="Go to Home"
          title="Return to Home"
          className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-gold transition-colors duration-150 cursor-pointer active:scale-95"
        >
          <Home className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
