import React from "react";

interface CineVenueLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
  subText?: string;
  showEmblem?: boolean;
}

export default function CineVenueLogo({
  size = "md",
  className = "",
  onClick,
  subText,
  showEmblem = true
}: CineVenueLogoProps) {
  const sizeClasses = {
    sm: "text-base sm:text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
    xl: "text-3xl sm:text-4xl"
  };

  const emblemSizes = {
    sm: "w-7 h-7",
    md: "w-8 h-8 sm:w-9 sm:h-9",
    lg: "w-10 h-10 sm:w-11 sm:h-11",
    xl: "w-12 h-12 sm:w-14 sm:h-14"
  };

  const subtitleSizes = {
    sm: "text-[7px]",
    md: "text-[7.5px] sm:text-[8px]",
    lg: "text-[9px] sm:text-[10px]",
    xl: "text-[11px] sm:text-[12px]"
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 sm:gap-2.5 select-none ${onClick ? "cursor-pointer group" : ""} ${className}`}
    >
      {/* 3D Star & Projector Brand Emblem */}
      {showEmblem && (
        <div className="relative shrink-0 flex items-center justify-center">
          <img
            src="/logo.jpg"
            alt="CineVenue Emblem"
            className={`${emblemSizes[size]} rounded-lg object-cover border border-gray-300 dark:border-gold/40 shadow-xs group-hover:scale-105 transition-transform duration-200`}
          />
        </div>
      )}

      {/* Typography: CineVenue + — Entertainments — directly below name */}
      <div className="flex flex-col items-start leading-none">
        <span
          className={`font-serif ${sizeClasses[size]} tracking-tight font-bold inline-flex items-center transition-all duration-300 drop-shadow-xs dark:drop-shadow-lg`}
          style={{ fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif" }}
        >
          <span className="text-gray-950 dark:text-white group-hover:text-black dark:group-hover:text-amber-50 transition-colors drop-shadow-none dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            Cine
          </span>
          <span className="text-gray-800 dark:text-[#E2B13C] font-bold group-hover:text-black dark:group-hover:text-[#F3D77A] transition-colors ml-0.5 drop-shadow-none dark:drop-shadow-[0_2px_6px_rgba(226,177,60,0.35)]">
            Venue
          </span>
        </span>

        {/* Tagline / Subtitle placed directly below CineVenue name */}
        <div className="flex items-center justify-between w-full gap-1 mt-0.5">
          <span className="h-[1px] flex-1 bg-gray-300 dark:bg-gold/40" />
          <span className={`${subtitleSizes[size]} tracking-[0.24em] uppercase font-semibold text-gray-600 dark:text-gold/90 font-serif whitespace-nowrap px-0.5`}>
            {subText || "Entertainments"}
          </span>
          <span className="h-[1px] flex-1 bg-gray-300 dark:bg-gold/40" />
        </div>
      </div>
    </div>
  );
}
