import React, { useState, useEffect } from "react";
import { X, Calendar, User, ShieldCheck, HelpCircle, Send, MapPin, Film } from "lucide-react";
import { Theatre } from "../types";

interface RentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  onOpenAuth: () => void;
  theatres: Theatre[];
  onSubmitRental: (request: {
    eventName: string;
    guests: string;
    duration: string;
    eventType: string;
    requirements: string;
    price: string;
    theatreName?: string;
    city?: string;
  }) => void;
}

export default function RentalModal({
  isOpen,
  onClose,
  userEmail,
  onOpenAuth,
  theatres,
  onSubmitRental,
}: RentalModalProps) {
  const [eventName, setEventName] = useState("Annual Corporate Awards Night");
  const [guests, setGuests] = useState("180");
  const [duration, setDuration] = useState("3");
  const [eventType, setEventType] = useState("Corporate");
  const [requirements, setRequirements] = useState(
    "Full stage setup, 4K projection, cocktail reception area"
  );
  const [rentalSuccess, setRentalSuccess] = useState(false);

  // Location & Theatre selection state
  const [selectedCity, setSelectedCity] = useState("Hyderabad");
  const [selectedTheatreId, setSelectedTheatreId] = useState<number>(1);

  // Available unique cities based on theatres data
  const cities = Array.from(
    new Set(theatres.map((t) => t.location.split(" · ")[0]))
  ).filter(Boolean);

  // Filtered theatres based on selected city
  const filteredTheatres = theatres.filter(
    (t) => t.location.split(" · ")[0] === selectedCity
  );

  // Keep selected theatre ID in sync with city changes
  useEffect(() => {
    if (filteredTheatres.length > 0) {
      const exists = filteredTheatres.some((t) => t.id === selectedTheatreId);
      if (!exists) {
        setSelectedTheatreId(filteredTheatres[0].id);
      }
    }
  }, [selectedCity, filteredTheatres, selectedTheatreId]);

  useEffect(() => {
    if (isOpen) {
      setRentalSuccess(false);
      if (theatres.length > 0) {
        const firstCity = theatres[0].location.split(" · ")[0];
        setSelectedCity(firstCity);
        setSelectedTheatreId(theatres[0].id);
      }
    }
  }, [isOpen, theatres]);

  if (!isOpen) return null;

  // Find currently selected theatre
  const selectedTheatre = theatres.find((t) => t.id === selectedTheatreId) || theatres[0];

  // Parse hourly rate from the theatre price, e.g. "₹4,999" -> 4999
  const hourlyRate = selectedTheatre 
    ? parseInt(selectedTheatre.price.replace(/[^\d]/g, "")) || 4999 
    : 4999;

  const numDuration = parseFloat(duration) || 1;
  const totalPrice = hourlyRate * numDuration;
  const deposit = Math.round(totalPrice * 0.25);
  const balance = totalPrice - deposit;

  const eventTypes = [
    { label: "Corporate", icon: "🏆" },
    { label: "Screening", icon: "🎬" },
    { label: "Social", icon: "🎊" },
    { label: "Academic", icon: "🎓" },
    { label: "Wedding", icon: "💍" },
    { label: "Arts", icon: "🎭" },
  ];

  const handleConfirm = () => {
    if (!userEmail) {
      alert("Sign In Required: Please log in to complete your premium private venue booking enquiry.");
      onOpenAuth();
      return;
    }

    const priceText = `₹${totalPrice.toLocaleString("en-IN")}`;
    onSubmitRental({
      eventName,
      guests,
      duration,
      eventType,
      requirements,
      price: priceText,
      theatreName: selectedTheatre?.name,
      city: selectedCity,
    });
    setRentalSuccess(true);
  };

  const userInitials = userEmail ? userEmail.substring(0, 2).toUpperCase() : "RK";
  const userName = userEmail ? userEmail.split("@")[0] : "Premium Member";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div 
        className="bg-[#0A0A0B] border border-white/10 w-full max-w-2xl rounded-xl relative shadow-2xl overflow-hidden text-left my-8 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-text-secondary hover:text-gold hover:border-gold cursor-pointer transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {rentalSuccess ? (
          /* Successful inquiry state screen */
          <div className="p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-gold-glow border border-gold/30 flex items-center justify-center text-gold mb-6 shadow-lg shadow-gold/5">
              <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="font-display text-3xl font-light text-text-primary mb-3 italic">
              Request Submitted!
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-8">
              Fantastic! Your custom venue reservation for <span className="text-gold font-bold">"{eventName}"</span> has been successfully logged with our theater managers. We have pre-booked your time slot on our grid and will contact you within 2 hours to coordinate.
            </p>

            <div className="w-full bg-white/[0.02] border border-white/10 p-5 rounded-md text-left mb-8 space-y-2.5 text-xs">
              <div className="flex justify-between"><span className="text-text-secondary font-semibold">EVENT TYPE</span><span className="text-text-primary font-semibold">{eventType}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary font-semibold">TOTAL VALUE</span><span className="text-gold font-bold">₹{totalPrice.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary font-semibold">REFUNDABLE DEPOSIT</span><span className="text-text-primary font-semibold">₹{deposit.toLocaleString("en-IN")} (25%)</span></div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-gold hover:bg-gold-light text-black py-4 rounded-sm text-xs font-bold tracking-[0.2em] uppercase cursor-pointer transition-colors duration-200"
            >
              Back to Showrooms
            </button>
          </div>
        ) : (
          /* Main Configuration Form Screen */
          <div>
            <div className="p-8 border-b border-white/10">
              <h2 className="font-display text-2xl md:text-3xl font-light tracking-wide text-text-primary italic">
                Configure Venue Rental
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Tell the venue manager about your event — required for rentals above ₹41,500
              </p>
            </div>

            {/* Profile info block */}
            <div className="p-8 bg-white/[0.01] space-y-8">
              <div className="flex items-center justify-between bg-white/[0.02] border border-white/10 p-4.5 rounded-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold text-black font-display text-lg font-normal flex items-center justify-center shadow-lg shadow-gold/5">
                    {userInitials}
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-text-primary capitalize">
                      {userName}
                    </h4>
                    <span className="text-xs text-gold font-medium flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> ID Verified · Premium Club Member
                    </span>
                  </div>
                </div>
              </div>

              {/* Form entries */}
              <div className="space-y-6">
                {/* Location and Theatre selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2.5 text-left">
                    <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gold" /> Select Venue Location
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full bg-[#0A0A0B] border border-white/10 hover:border-white/20 focus:border-gold rounded-md px-4 py-3.5 text-sm text-text-primary focus:outline-none transition-colors cursor-pointer"
                    >
                      {cities.map((city) => (
                        <option key={city} value={city} className="bg-[#0A0A0B] text-text-primary">
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2.5 text-left">
                    <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-gold" /> Select Theatre Venue
                    </label>
                    <select
                      value={selectedTheatreId}
                      onChange={(e) => setSelectedTheatreId(Number(e.target.value))}
                      className="w-full bg-[#0A0A0B] border border-white/10 hover:border-white/20 focus:border-gold rounded-md px-4 py-3.5 text-sm text-text-primary focus:outline-none transition-colors cursor-pointer font-sans"
                    >
                      {filteredTheatres.map((t) => (
                        <option key={t.id} value={t.id} className="bg-[#0A0A0B] text-text-primary font-sans">
                          {t.name} ({t.price}/hr)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 text-left">
                  <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Enquiry Event Name
                  </label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold rounded-md px-4.5 py-3.5 text-sm text-text-primary focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2.5 text-left">
                    <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                      Expected Guests Count
                    </label>
                    <input
                      type="text"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold rounded-md px-4.5 py-3.5 text-sm text-text-primary focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2.5 text-left">
                    <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                      Event Duration (Hrs)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold rounded-md px-4.5 py-3.5 text-sm text-text-primary focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Event Type Grid Chips */}
                <div className="flex flex-col gap-2.5 text-left">
                  <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Select Event Type Classification
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {eventTypes.map((type) => (
                      <button
                        key={type.label}
                        type="button"
                        onClick={() => setEventType(type.label)}
                        className={`py-3 px-4 rounded-md text-xs font-semibold cursor-pointer border text-center transition-all ${
                          eventType === type.label
                            ? "bg-gold-glow border-gold text-gold"
                            : "bg-white/[0.02] border-white/10 text-text-secondary hover:border-white hover:text-text-primary"
                        }`}
                      >
                        {type.icon} {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 text-left">
                  <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Special Concierge Requirements
                  </label>
                  <textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    rows={2.5}
                    className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold rounded-md px-4.5 py-3.5 text-sm text-text-primary focus:outline-none transition-colors resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bottom splits calculation */}
            <div className="p-8 bg-[#0A0A0B] border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6 rounded-b-xl">
              <div className="text-left">
                <div className="font-display text-lg font-light text-gold leading-none uppercase tracking-wider">
                  Price on Request
                </div>
                <div className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider mt-2.5">
                  Your dedicated coordinator will craft a custom quote for your event. No payment needed today.
                </div>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full sm:w-auto bg-gold hover:bg-gold-light text-black px-10 py-4 rounded-sm text-xs font-bold tracking-[0.2em] uppercase cursor-pointer transition-colors duration-200 shadow-xl shadow-gold/10 flex items-center justify-center gap-2 self-stretch sm:self-auto"
              >
                <Send className="w-4 h-4 text-black stroke-[2.5]" />
                Submit Venue Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
