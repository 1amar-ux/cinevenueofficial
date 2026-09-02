import React, { useState } from 'react';

export default function FeeCalculator() {
  const [ticketPrice, setTicketPrice] = useState(150);
  const [quantity, setQuantity] = useState(2);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const tickets = Array(quantity).fill({ seatId: 'test', price: ticketPrice });
      const res = await fetch('/api/booking/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showId: 'test', tickets })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Fee Calculator (Simulation)</h4>
        
        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-xs text-text-secondary mb-1">Ticket Price (₹)</label>
            <input 
              type="number" 
              value={ticketPrice} 
              onChange={e => setTicketPrice(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-text-secondary mb-1">Quantity</label>
            <input 
              type="number" 
              value={quantity} 
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
            />
          </div>
          <button 
            onClick={calculate}
            disabled={loading}
            className="bg-gold text-black font-bold px-6 py-2 rounded hover:bg-gold/90 transition-colors"
          >
            Calculate
          </button>
        </div>

        {result && (
          <div className="bg-black/40 border border-white/10 rounded-lg p-6 font-mono text-sm">
            <div className="flex justify-between mb-2 text-text-secondary">
              <span>Ticket Subtotal ({quantity} x ₹{ticketPrice}):</span>
              <span className="text-white">₹{result.ticketSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-text-secondary">
              <span>Ticket GST:</span>
              <span className="text-white">₹{result.ticketTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-text-secondary">
              <span>Convenience Fee:</span>
              <span className="text-white">₹{result.convenienceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-text-secondary">
              <span>Convenience Fee GST:</span>
              <span className="text-white">₹{result.convenienceFeeTax.toFixed(2)}</span>
            </div>
            <div className="h-px bg-white/20 my-4"></div>
            <div className="flex justify-between font-bold text-base text-white">
              <span>Customer Total:</span>
              <span className="text-gold">₹{result.total.toFixed(2)}</span>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-text-secondary flex gap-4">
              <span>Fee Config: <strong className="text-white">{result.feeConfigVersion}</strong></span>
              <span>Tax Config: <strong className="text-white">{result.taxConfigVersion}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
