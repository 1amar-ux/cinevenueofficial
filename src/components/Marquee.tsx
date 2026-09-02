import React from "react";

export default function Marquee() {
  const items = [
    "Dolby Atmos",
    "4K Laser Projection",
    "Private Theatre Rentals",
    "Premium F&B Service",
    "Corporate Events",
    "Birthday Screenings",
    "IMAX Experience",
    "Online Seat Selection"
  ];

  // Repeat items to make it truly infinite scroll
  const scrollItems = [...items, ...items, ...items, ...items];

  return (
    <div className="w-full overflow-hidden border-y border-white/10 bg-white/[0.02] py-4.5 z-10 relative">
      <div className="flex whitespace-nowrap min-w-full">
        <div 
          className="flex gap-0 animate-[marquee_35s_linear_infinite] hover:[animation-play-state:paused]"
          style={{ width: "fit-content" }}
        >
          {scrollItems.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-4 px-10 border-r border-white/5 text-text-secondary text-sm font-display italic select-none"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
