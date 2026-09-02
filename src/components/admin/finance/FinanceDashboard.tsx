import React, { useState, useEffect } from 'react';

export default function FinanceDashboard() {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settlements')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettlements(data.settlements || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const totalBookingValue = settlements.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const ticketRevenue = settlements.reduce((acc, curr) => acc + (curr.theatreBase || 0), 0);
  
  if (loading) return <div className="p-8 text-white">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">Gross Booking Value</p>
          <h3 className="text-2xl font-bold text-white">₹{totalBookingValue.toFixed(2)}</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">Ticket Revenue</p>
          <h3 className="text-2xl font-bold text-white">₹{ticketRevenue.toFixed(2)}</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">Pending Settlements</p>
          <h3 className="text-2xl font-bold text-white">0</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">CineVenue Net Revenue</p>
          <h3 className="text-2xl font-bold text-emerald-400">₹{(totalBookingValue - ticketRevenue).toFixed(2)}</h3>
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Detailed Revenue Ledger</h4>
        <p className="text-text-secondary text-sm">No recent detailed entries found. Create a booking to populate this ledger.</p>
      </div>
    </div>
  );
}
