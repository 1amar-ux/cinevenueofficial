import React from "react";
import { Phone, MapPin, Share2, Shield, Lock, FileCheck } from "lucide-react";
import CineVenueLogo from "./CineVenueLogo";
import { InfoModalType } from "./InfoModal";

interface FooterProps {
  onOpenInfo: (type: "about" | "privacy" | "terms" | "refund" | "cookie" | "user-agreement" | "contact") => void;
  onOpenRental: () => void;
  onOpenAdmin: () => void;
  onShare: () => void;
}

export default function Footer({ onOpenInfo, onOpenRental, onOpenAdmin, onShare }: FooterProps) {
  return (
    <footer className="bg-[#0A0A0B] border-t border-white/10 py-16 px-6 md:px-12 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
        
        {/* Left column */}
        <div className="flex flex-col gap-4 text-left">
          <CineVenueLogo size="lg" />

          <div className="flex items-center gap-2.5 text-xs text-text-secondary">
            <Phone className="w-4 h-4 text-gold flex-shrink-0" />
            <span>Concierge Direct: +91 84658 70811</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-text-secondary">
            <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
            <span>Guntur, Andhra Pradesh, India — 522001</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-text-muted mt-2 font-mono">
            <Lock className="w-3.5 h-3.5 text-gold/70" />
            <span>DPDP Act (India) Compliant • SSL Encrypted</span>
          </div>

          <span className="text-[10px] tracking-wide text-white/50 mt-2 block font-sans">
            © 2026 CineVenue Private Capital. All rights reserved.
          </span>
          <span className="text-[9px] uppercase tracking-[0.25em] text-gold/80 mt-0.5 block font-mono">
            Designed by ATS
          </span>
        </div>

        {/* Right column: navigational links & triggers */}
        <div className="flex flex-col items-start md:items-end gap-5">
          {/* Main Legal & Compliance Group */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.15em] font-medium text-white/80">
            <button
              onClick={() => onOpenInfo("privacy")}
              className="hover:text-gold transition-colors cursor-pointer"
            >
              Privacy Statement
            </button>
            <button
              onClick={() => onOpenInfo("terms")}
              className="hover:text-gold transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => onOpenInfo("refund")}
              className="hover:text-gold transition-colors cursor-pointer"
            >
              Refund Policy
            </button>
            <button
              onClick={() => onOpenInfo("cookie")}
              className="hover:text-gold transition-colors cursor-pointer"
            >
              Cookie Policy
            </button>
            <button
              onClick={() => onOpenInfo("user-agreement")}
              className="hover:text-gold transition-colors cursor-pointer"
            >
              User Agreement
            </button>
          </div>

          {/* Secondary Navigational links */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.15em] font-medium opacity-70">
            <button
              onClick={() => onOpenInfo("about")}
              className="hover:text-gold transition-colors cursor-pointer"
            >
              About CineVenue
            </button>
            <button
              onClick={() => onOpenInfo("contact")}
              className="hover:text-gold transition-colors cursor-pointer"
            >
              Concierge Contact
            </button>
            <button
              onClick={() => window.location.href = "/cinecoins"}
              className="hover:text-gold transition-colors cursor-pointer text-amber-400 font-bold"
            >
              🪙 CineCoins Loyalty
            </button>
            <button
              onClick={() => window.location.href = "/account"}
              className="hover:text-gold transition-colors cursor-pointer"
            >
              My Account
            </button>
            <button
              onClick={() => window.location.href = "/submit-proposal"}
              className="hover:text-gold transition-colors cursor-pointer text-text-primary font-semibold"
            >
              Submit Proposal
            </button>
            <button
              onClick={onOpenRental}
              className="hover:text-gold transition-colors cursor-pointer text-gold"
            >
              Host Your Screen
            </button>
            <button
              onClick={onOpenAdmin}
              className="hover:text-gold transition-colors cursor-pointer text-text-secondary flex items-center justify-center p-1.5 bg-white/[0.02] border border-white/10 rounded-full hover:border-gold/30 hover:bg-gold/10"
              title="Administrator Portal"
            >
              <Shield className="w-3.5 h-3.5 text-gold" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Share Button */}
      <button
        onClick={onShare}
        className="home-share-button fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gold hover:bg-gold-light text-dark-bg flex items-center justify-center cursor-pointer shadow-xl shadow-gold/30 hover:scale-110 active:scale-95 transition-all duration-200"
        title="Share CineVenue"
      >
        <Share2 className="w-5 h-5 stroke-[2.5]" />
      </button>
    </footer>
  );
}
