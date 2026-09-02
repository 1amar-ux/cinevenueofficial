import React, { useState } from "react";
import { Sparkles, Plus, Trash2, Check, Tag, Info } from "lucide-react";

export interface PromoCoupon {
  code: string;
  type: "Percent" | "Fixed";
  value: number;
  minBookingValue: number;
  active: boolean;
  claimsCount: number;
}

interface CouponsProps {
  theatreId: number;
}

export default function Coupons({ theatreId }: CouponsProps) {
  const [coupons, setCoupons] = useState<PromoCoupon[]>(() => {
    const cached = localStorage.getItem(`cine_coupons_${theatreId}`);
    if (cached) return JSON.parse(cached);
    return [
      { code: "CINEVENUE10", type: "Percent", value: 10, minBookingValue: 300, active: true, claimsCount: 42 },
      { code: "POPCORNFREE", type: "Fixed", value: 150, minBookingValue: 500, active: true, claimsCount: 18 },
      { code: "MIDWEEK50", type: "Percent", value: 20, minBookingValue: 400, active: false, claimsCount: 125 }
    ];
  });

  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"Percent" | "Fixed">("Percent");
  const [newValue, setNewValue] = useState("");
  const [newMin, setNewMin] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleToggleActive = (code: string) => {
    const updated = coupons.map((c) =>
      c.code === code ? { ...c, active: !c.active } : c
    );
    setCoupons(updated);
    localStorage.setItem(`cine_coupons_${theatreId}`, JSON.stringify(updated));
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newValue) return;

    const added: PromoCoupon = {
      code: newCode.trim().toUpperCase(),
      type: newType,
      value: Number(newValue),
      minBookingValue: Number(newMin) || 0,
      active: true,
      claimsCount: 0
    };

    const updated = [...coupons, added];
    setCoupons(updated);
    localStorage.setItem(`cine_coupons_${theatreId}`, JSON.stringify(updated));

    setNewCode("");
    setNewValue("");
    setNewMin("");
    setIsAdding(false);
  };

  const handleDeleteCoupon = (code: string) => {
    if (confirm("Permanently archive this campaign promo code?")) {
      const updated = coupons.filter((c) => c.code !== code);
      setCoupons(updated);
      localStorage.setItem(`cine_coupons_${theatreId}`, JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6 text-left select-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-text-primary tracking-wide">
            Promo Codes & Campaigns
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Configure booking percentage discounts, cash-back vouchers, and track user campaign claims
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border-0 shadow-lg shadow-gold/10"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Campaign Code</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleCreateCoupon} className="bg-[#121215] border border-white/5 rounded-2xl p-6 space-y-4 max-w-xl text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-white/5 pb-2">
            Provision Campaign Promo Coupon
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Voucher Code</label>
              <input
                type="text"
                required
                className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2 rounded-xl text-text-primary focus:border-gold focus:outline-none uppercase font-mono font-bold"
                placeholder="e.g. MONSOON25"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Voucher Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3 py-2 rounded-xl text-text-primary focus:outline-none cursor-pointer"
              >
                <option value="Percent" className="bg-[#0A0A0B]">Percentage Discount (%)</option>
                <option value="Fixed" className="bg-[#0A0A0B]">Fixed Cash-Back (₹)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Voucher Value</label>
              <input
                type="number"
                required
                className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2 rounded-xl text-text-primary focus:border-gold focus:outline-none font-mono"
                placeholder={newType === "Percent" ? "15" : "150"}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Min Ticket Gross (₹)</label>
              <input
                type="number"
                className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2 rounded-xl text-text-primary focus:border-gold focus:outline-none font-mono"
                placeholder="e.g. 300"
                value={newMin}
                onChange={(e) => setNewMin(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-text-secondary rounded-xl font-bold uppercase tracking-wider transition-colors cursor-pointer border-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer border-0"
            >
              Launch Promo Campaign
            </button>
          </div>
        </form>
      )}

      {/* Coupons Table List */}
      <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-white/5 pb-3 flex items-center gap-2">
          <Tag className="w-4 h-4 text-gold" />
          <span>Active Promo Offers & Discount Campaigns</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-text-secondary border-b border-white/5">
                <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Promo Code</th>
                <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Type</th>
                <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Voucher Value</th>
                <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Min. Purchase Trigger</th>
                <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Total User Claims</th>
                <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Status</th>
                <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px] text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {coupons.map((c) => (
                <tr key={c.code} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-4 font-mono font-bold text-gold uppercase">{c.code}</td>
                  <td className="py-4 text-text-secondary">{c.type}</td>
                  <td className="py-4 font-mono font-bold text-text-primary">
                    {c.type === "Percent" ? `${c.value}% OFF` : `₹${c.value} OFF`}
                  </td>
                  <td className="py-4 font-mono text-text-secondary">₹{c.minBookingValue}</td>
                  <td className="py-4 font-mono text-text-secondary">{c.claimsCount} claims</td>
                  <td className="py-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(c.code)}
                      className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                        c.active
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}
                    >
                      {c.active ? "● Live Campaign" : "● Paused"}
                    </button>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(c.code)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-black border border-red-500/10 text-red-400 cursor-pointer transition-colors"
                      title="Archive voucher"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
