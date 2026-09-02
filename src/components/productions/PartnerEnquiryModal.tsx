import React, { useState } from "react";
import { X, Send, Handshake, CheckCircle2, Building, Briefcase } from "lucide-react";
import { PartnerEnquiry } from "../../types/productions";

interface PartnerEnquiryModalProps {
  isOpen: boolean;
  initialCategory?: PartnerEnquiry["category"];
  onClose: () => void;
  onSubmitEnquiry: (enquiry: PartnerEnquiry) => void;
}

export default function PartnerEnquiryModal({
  isOpen,
  initialCategory = "Producer",
  onClose,
  onSubmitEnquiry
}: PartnerEnquiryModalProps) {
  if (!isOpen) return null;

  const [category, setCategory] = useState<PartnerEnquiry["category"]>(initialCategory);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [message, setMessage] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      alert("Please fill in your name, email, and phone number.");
      return;
    }

    const newId = "PARTNER-" + Math.floor(1000 + Math.random() * 9000);
    const enquiry: PartnerEnquiry = {
      id: newId,
      category,
      fullName,
      email,
      phone,
      companyName,
      city,
      message,
      submittedAt: new Date().toLocaleDateString(),
      status: "New"
    };

    onSubmitEnquiry(enquiry);
    setSubmittedId(newId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0F0F12] border border-gold/30 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedId ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h2 className="text-2xl font-serif font-bold text-white">Partnership Proposal Received!</h2>
            <p className="text-sm text-white/70 max-w-md mx-auto">
              Thank you <strong className="text-gold">{fullName}</strong>. Your proposal for <strong className="text-white">{category} Partnership</strong> has been forwarded to CineVenue Executive Management.
            </p>
            <div className="bg-black/60 border border-white/10 p-4 rounded-xl inline-block text-xs font-mono">
              Partner Ref ID: <span className="text-amber-400 font-bold">{submittedId}</span>
            </div>
            <p className="text-xs text-white/50">Our partnerships desk will connect with you shortly.</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gold text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:bg-amber-400"
            >
              Close Window
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="space-y-2 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/40 text-[10px] font-bold uppercase">
                  Partner With Us
                </span>
                <span className="text-xs text-white/60 font-mono">Industry Collaboration</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
                Collaborate with CineVenue Productions
              </h2>
              <p className="text-xs text-white/60">
                Join our network of producers, directors, writers, distributors, theatre owners, and brands building the future of entertainment.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/70 font-bold mb-1">Partnership Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                >
                  <option value="Producer">Producer (Co-Production / Investment)</option>
                  <option value="Director">Director (Project Submissions)</option>
                  <option value="Writer">Writer (Screenplay / Story Licensing)</option>
                  <option value="Actor">Actor (Casting Roster)</option>
                  <option value="Technician">Technician (Crew / Post-Production)</option>
                  <option value="Distributor">Distributor (Theatrical & OTT Distribution)</option>
                  <option value="Theatre Partner">Theatre Partner (Screening / Release)</option>
                  <option value="Brand">Brand (Sponsorships & Marketing)</option>
                  <option value="Event Organizer">Event Organizer (Joint Events)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Company / Production House Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Vikramaditya Motion Pictures"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">City / Location</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Proposal & Scope of Partnership</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Outline your proposal details, timeline, budget, or expected collaboration terms..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-gold via-amber-400 to-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 shadow-lg shadow-gold/10 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Handshake className="w-4 h-4" />
                <span>Submit Partnership Proposal</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
