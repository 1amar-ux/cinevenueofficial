import React, { useState } from "react";
import { 
  ProjectNegotiation, 
  NegotiationOffer 
} from "../../types/filmProductionMarketplace";
import { 
  X, Send, DollarSign, CheckCircle2, MessageSquare, 
  ShieldCheck, FileText, Check, AlertCircle, Sparkles, User
} from "lucide-react";
import { 
  sendNegotiationMessage, 
  sendNegotiationOffer, 
  updateOfferStatus 
} from "../../services/filmProductionService";

interface ProjectNegotiationChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  negotiation: ProjectNegotiation | null;
  currentUserEmail?: string | null;
  onNegotiationUpdated: () => void;
  onFormalAgreementGenerated?: () => void;
}

export default function ProjectNegotiationChatModal({
  isOpen,
  onClose,
  negotiation,
  currentUserEmail,
  onNegotiationUpdated,
  onFormalAgreementGenerated
}: ProjectNegotiationChatModalProps) {
  if (!isOpen || !negotiation) return null;

  const [activeTab, setActiveTab] = useState<"chat" | "offers">("chat");
  const [inputText, setInputText] = useState("");
  
  // New offer form state
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerAmount, setOfferAmount] = useState(negotiation.currentOffer?.amount || 1000000);
  const [offerScope, setOfferScope] = useState("Principal service execution matching studio specs & shoot schedule.");
  const [offerStartDate, setOfferStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [offerTerms, setOfferTerms] = useState("Standard CineVenue Production Terms Apply.");

  const isFilmmaker = !currentUserEmail || currentUserEmail.toLowerCase() === negotiation.filmmakerEmail.toLowerCase();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendNegotiationMessage(negotiation.id, {
      senderId: isFilmmaker ? negotiation.filmmakerId : negotiation.professionalId,
      senderName: isFilmmaker ? negotiation.filmmakerName : negotiation.professionalName,
      senderRole: isFilmmaker ? "filmmaker" : "professional",
      text: inputText.trim()
    });

    setInputText("");
    onNegotiationUpdated();
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();

    sendNegotiationOffer(negotiation.id, {
      amount: Number(offerAmount),
      workScope: offerScope.trim(),
      startDate: offerStartDate,
      terms: offerTerms.trim(),
      createdBy: isFilmmaker ? "filmmaker" : "professional",
      paymentMilestones: [
        "Milestone 1 (30%): Advance on signing",
        "Milestone 2 (40%): During principal shoot",
        "Milestone 3 (30%): Final deliverables sign-off"
      ]
    });

    setShowOfferForm(false);
    onNegotiationUpdated();
  };

  const handleRespondOffer = (offerId: string, status: NegotiationOffer["status"]) => {
    updateOfferStatus(negotiation.id, offerId, status);
    onNegotiationUpdated();
    if (status === "Accepted" && onFormalAgreementGenerated) {
      onFormalAgreementGenerated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0D0E15] border border-white/15 rounded-3xl overflow-hidden shadow-2xl animate-fade-in my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#111218] shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={negotiation.professionalAvatar}
              alt={negotiation.professionalName}
              className="w-10 h-10 rounded-2xl object-cover border border-white/10"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">{negotiation.professionalName}</h2>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                  {negotiation.position}
                </span>
              </div>
              <p className="text-xs text-white/50">
                Film: <strong className="text-white">{negotiation.projectTitle}</strong> • Status: {negotiation.status}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 border-b border-white/10 flex items-center justify-between bg-[#090A0F] text-xs font-bold shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("chat")}
              className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === "chat" ? "border-amber-400 text-amber-400 font-black" : "border-transparent text-white/60"
              }`}
            >
              Negotiation Chat ({negotiation.messages.length})
            </button>
            <button
              onClick={() => setActiveTab("offers")}
              className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === "offers" ? "border-amber-400 text-amber-400 font-black" : "border-transparent text-white/60"
              }`}
            >
              Formal Offers ({negotiation.offers.length})
            </button>
          </div>

          <button
            onClick={() => setShowOfferForm(!showOfferForm)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{showOfferForm ? "Close Offer Form" : "+ Create Formal Offer"}</span>
          </button>
        </div>

        {/* Offer Form Drawer */}
        {showOfferForm && (
          <form onSubmit={handleSendOffer} className="p-5 bg-amber-950/20 border-b border-amber-500/30 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-amber-400 uppercase text-[11px]">Draft Formal Offer & Payment Terms</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-white/60 font-bold mb-1">Total Agreed Remuneration (₹ INR)</label>
                <input
                  type="number"
                  step={50000}
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(Number(e.target.value))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-white/60 font-bold mb-1">Commencement Date</label>
                <input
                  type="date"
                  value={offerStartDate}
                  onChange={(e) => setOfferStartDate(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/60 font-bold mb-1">Deliverables & Scope of Work</label>
              <input
                type="text"
                value={offerScope}
                onChange={(e) => setOfferScope(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowOfferForm(false)}
                className="px-3 py-1.5 rounded-lg bg-white/10 text-white font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-500 text-black font-extrabold cursor-pointer"
              >
                Submit Formal Offer
              </button>
            </div>
          </form>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: CHAT */}
          {activeTab === "chat" && (
            <div className="space-y-3">
              {negotiation.messages.map(msg => {
                const isSystem = msg.senderId === "system";
                const isMe = (isFilmmaker && msg.senderRole === "filmmaker") || (!isFilmmaker && msg.senderRole === "professional");

                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center my-2">
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/50">
                        🔒 {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="text-[10px] text-white/40 mb-1 px-1">{msg.senderName}</div>
                    <div
                      className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed ${
                        isMe
                          ? "bg-amber-500 text-black font-medium rounded-br-none"
                          : "bg-white/10 text-white rounded-bl-none border border-white/10"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-white/30 mt-0.5 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: OFFERS */}
          {activeTab === "offers" && (
            <div className="space-y-4">
              {negotiation.offers.length === 0 ? (
                <div className="text-center py-12 text-xs text-white/40">
                  No formal offers submitted yet. Click "+ Create Formal Offer" to send legal terms.
                </div>
              ) : (
                negotiation.offers.map(offer => (
                  <div
                    key={offer.id}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-white/40 uppercase font-bold">Offer #{offer.id}</span>
                        <div className="text-lg font-black text-amber-400">
                          ₹{offer.amount.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                        offer.status === "Accepted" ? "bg-emerald-500/20 text-emerald-400" :
                        offer.status === "Rejected" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {offer.status}
                      </span>
                    </div>

                    <div className="text-xs text-white/80 space-y-1 bg-black/40 p-3 rounded-xl">
                      <div><strong>Scope:</strong> {offer.workScope}</div>
                      <div><strong>Starts:</strong> {offer.startDate}</div>
                      <div><strong>Milestones:</strong> {offer.paymentMilestones.join(" • ")}</div>
                    </div>

                    {offer.status === "Sent" && (
                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          onClick={() => handleRespondOffer(offer.id, "Rejected")}
                          className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 text-xs font-bold cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleRespondOffer(offer.id, "Accepted")}
                          className="px-4 py-1.5 rounded-xl bg-emerald-500 text-black text-xs font-black uppercase cursor-pointer"
                        >
                          Accept Offer & Proceed
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Bottom Message Input Bar */}
        {activeTab === "chat" && (
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-[#090A0F] flex items-center gap-3 shrink-0">
            <input
              type="text"
              placeholder="Type your message or discuss terms..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black transition-all cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
