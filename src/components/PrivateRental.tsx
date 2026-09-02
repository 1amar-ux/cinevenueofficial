import React from "react";
import { Film, Popcorn, CalendarCheck, ShieldAlert, ChevronRight, Award } from "lucide-react";

interface PrivateRentalProps {
  onOpenRental: () => void;
}

export default function PrivateRental({ onOpenRental }: PrivateRentalProps) {
  const features = [
    {
      icon: <Film className="w-5 h-5 text-gold" />,
      title: "Any Content",
      desc: "Play your own private video files, movies, presentations, or console games."
    },
    {
      icon: <Popcorn className="w-5 h-5 text-gold" />,
      title: "Premium F&B",
      desc: "Fresh gourmet popcorn, custom chef catering menu, and premium hot beverages included."
    },
    {
      icon: <CalendarCheck className="w-5 h-5 text-gold" />,
      title: "Event Setup",
      desc: "Custom flower decorations, birthday templates, stage setups, and ambient atmospheric lighting."
    },
    {
      icon: <Award className="w-5 h-5 text-gold" />,
      title: "Dedicated Support",
      desc: "A fully trained private AV technician stays in the booth for prompt assistance throughout."
    }
  ];

  return (
    <section id="rent" className="py-24 px-6 md:px-12 relative overflow-hidden bg-white/[0.01] border-y border-white/10">
      <div className="absolute inset-0 bg-radial-gradient from-gold/5 via-transparent to-transparent opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold block mb-3 font-semibold">
              Private Screenings
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-light leading-tight tracking-tight text-text-primary mb-6 italic">
              Rent the <span className="text-gold not-italic font-normal">Entire Theatre</span>
            </h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-8 max-w-lg">
              Transform any special occasion into an unforgettable cinematic memory. Perfect for birthday parties, executive corporate meetings, dynamic product launches, or a romantic date night.
            </p>

            {/* Custom 2x2 Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
              {features.map((item, i) => (
                <div key={i} className="flex gap-4.5 items-start">
                  <div className="p-3 bg-white/[0.02] border border-white/10 rounded-lg flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenRental}
              className="mt-10 bg-gold hover:bg-gold-light text-black px-10 py-4 rounded-sm text-xs font-bold tracking-[0.2em] uppercase cursor-pointer transition-colors duration-200 shadow-xl shadow-gold/10 flex items-center gap-1.5"
            >
              Configure Venue Enquiry
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Right Column: Pricing Ticket Box */}
          <div className="bg-white/[0.02] border border-white/10 p-8 md:p-12 rounded-2xl relative text-center max-w-md mx-auto w-full shadow-2xl backdrop-blur-sm">
            {/* Absolute Badging for floating overlay */}
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0A0A0B] border border-white/10 px-4 py-1.5 rounded-full text-[9px] font-semibold text-text-secondary tracking-[0.2em] uppercase shadow">
              Private Rental Enquiry
            </span>

            <div className="font-display text-4xl font-light text-gold tracking-tight mt-4 leading-none uppercase">
              Custom Quote
            </div>
            <div className="text-[10px] text-text-secondary font-semibold tracking-[0.15em] mt-3 uppercase">
              Tailored experience plans
            </div>

            <p className="mt-6 text-xs text-text-secondary leading-relaxed max-w-xs mx-auto">
              Each package features private projection screen time, standard room setup, sound check, high-quality audio equipment, and a dedicated concierge coordinator.
            </p>

            <button
              onClick={onOpenRental}
              className="mt-10 w-full text-center border border-white/20 hover:bg-white hover:text-black hover:border-transparent py-4 rounded-full text-xs font-bold tracking-[0.15em] uppercase cursor-pointer transition-all duration-200"
            >
              Verify Real-time Availability
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
