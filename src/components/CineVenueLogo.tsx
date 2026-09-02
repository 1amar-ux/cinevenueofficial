import React from "react";

interface CineVenueLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
  subText?: string;
}

export default function CineVenueLogo({
  size = "md",
  className = "",
  onClick,
  subText
}: CineVenueLogoProps) {
  const sizeClasses = {
    sm: "text-lg md:text-xl",
    md: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-4xl",
    xl: "text-4xl md:text-5xl"
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 select-none ${onClick ? "cursor-pointer group" : ""} ${className}`}
    >
      <span
        className={`font-serif ${sizeClasses[size]} tracking-tight font-bold inline-flex items-center transition-all duration-300 drop-shadow-lg`}
        style={{ fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif" }}
      >
        <span className="text-white group-hover:text-amber-50 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          Cine
        </span>
        <span className="text-[#E2B13C] font-bold group-hover:text-[#F3D77A] transition-colors ml-0.5 drop-shadow-[0_2px_6px_rgba(226,177,60,0.35)]">
          Venue
        </span>
      </span>

      {subText && (
        <span className="text-xs text-gold font-mono uppercase tracking-wider font-bold ml-1">
          {subText}
        </span>
      )}
    </div>
  );
}

