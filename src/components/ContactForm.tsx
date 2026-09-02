import React, { useState } from "react";
import { Phone, Mail, MapPin, Send, HelpCircle, CheckCircle } from "lucide-react";

interface ContactFormProps {
  onSendMessage: (name: string, contact: string, message: string) => void;
}

export default function ContactForm({ onSendMessage }: ContactFormProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact || !message) {
      alert("Please fill out all the fields so our concierge team can assist you.");
      return;
    }

    onSendMessage(name, contact, message);
    setSuccess(true);
    setName("");
    setContact("");
    setMessage("");

    // Automatically fade success message after 5 seconds
    setTimeout(() => {
      setSuccess(false);
    }, 5000);
  };

  return (
    <section id="contact" className="py-24 px-6 md:px-12 bg-dark-bg border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Header Block */}
        <div className="max-w-2xl text-left mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold block mb-3 font-semibold">
            Get In Touch
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-light tracking-tight text-text-primary mb-4 italic">
            Contact Us
          </h2>
          <p className="text-text-secondary text-sm md:text-base leading-relaxed">
            Have questions about screen configurations, custom events, corporate bookings, or special billing? Our VIP concierge desk is open 7 days a week.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Card 1: Call Us */}
          <div className="bg-white/[0.02] border border-white/10 p-8 rounded-xl flex gap-5 hover:border-gold transition-all duration-300 backdrop-blur-sm shadow-xl">
            <div className="w-12 h-12 rounded-lg bg-white/[0.02] border border-white/10 flex items-center justify-center text-gold flex-shrink-0">
              <Phone className="w-5 h-5 text-gold" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.15em] block mb-2">CALL US DIRECTLY</span>
              <h4 className="font-display text-xl md:text-2xl font-bold text-text-primary mb-2">
                +91 84658 70811
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                Concierge Desk · Mon – Sun · 8:00 AM – 10:00 PM
              </p>
              <div className="inline-flex items-center gap-1.5 bg-gold-glow border border-gold/30 text-gold text-[10px] font-semibold tracking-wide uppercase px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                Lines Open Now
              </div>
            </div>
          </div>

          {/* Card 2: Email Us */}
          <div className="bg-white/[0.02] border border-white/10 p-8 rounded-xl flex gap-5 hover:border-gold transition-all duration-300 backdrop-blur-sm shadow-xl">
            <div className="w-12 h-12 rounded-lg bg-white/[0.02] border border-white/10 flex items-center justify-center text-gold flex-shrink-0">
              <Mail className="w-5 h-5 text-gold" />
            </div>
            <div className="overflow-hidden w-full">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.15em] block mb-2">EMAIL ENQUIRIES</span>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=info.cinevenue@gmail.com"
                target="_blank"
                rel="noreferrer"
                className="font-display text-xl md:text-2xl font-bold text-text-primary hover:text-gold block mb-2 transition-colors truncate"
              >
                info.cinevenue@gmail.com
              </a>
              <p className="text-xs text-text-secondary leading-relaxed">
                Response within 2 hours.
              </p>
              <p className="text-[11px] text-text-secondary font-semibold mt-3 italic">
                info.cinevenue@gmail.com — Venue Support
              </p>
            </div>
          </div>

          {/* Card 3: Head Office */}
          <div className="bg-white/[0.02] border border-white/10 p-8 rounded-xl flex gap-5 hover:border-gold transition-all duration-300 backdrop-blur-sm shadow-xl">
            <div className="w-12 h-12 rounded-lg bg-white/[0.02] border border-white/10 flex items-center justify-center text-gold flex-shrink-0">
              <MapPin className="w-5 h-5 text-gold" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.15em] block mb-2">HEAD OFFICE</span>
              <h4 className="font-display text-xl md:text-2xl font-bold text-text-primary mb-2">
                Guntur, Andhra Pradesh
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                Guntur, Andhra Pradesh, India — 522001
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Guntur,+Andhra+Pradesh"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-gold font-semibold hover:underline"
              >
                View on Google Map →
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form Section Block */}
        <div className="bg-white/[0.02] border border-white/10 p-8 md:p-14 rounded-xl relative backdrop-blur-sm shadow-xl">
          <h3 className="font-display text-3xl md:text-4xl font-light text-text-primary mb-2 italic">
            Send a <span className="text-gold not-italic font-normal">Concierge</span> Message
          </h3>
          <p className="text-sm md:text-base text-text-secondary font-light mb-10">
            Prefer to write? Drop us a prompt query below, and our VIP response coordinators will reach you back instantly.
          </p>

          {success && (
            <div className="bg-gold-glow border border-gold/30 p-4 rounded-lg flex items-center gap-3 text-gold text-sm font-semibold mb-8 animate-fade-in">
              <CheckCircle className="w-5 h-5" />
              Your message was received successfully! The CineVenue concierge team will review it and reply within 2 hours.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2.5 text-left">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-5 py-4 text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-2.5 text-left">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Phone / Email Contact
                </label>
                <input
                  type="text"
                  placeholder="+91 84658 70811"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-5 py-4 text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5 text-left">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Detailed Inquiry Message
              </label>
              <textarea
                placeholder="Tell us about your custom screening, birthday package, or corporate venue inquiry..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-5 py-4 text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none transition-all resize-y"
                required
              />
            </div>

            <div className="text-left mt-6">
              <button
                type="submit"
                className="bg-gold hover:bg-gold-light text-black px-10 py-4 rounded-sm text-xs font-bold tracking-[0.2em] uppercase cursor-pointer transition-colors duration-200 shadow-xl shadow-gold/10 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-black stroke-[2.5]" />
                Deliver Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
