import React, { useState, useEffect } from 'react';

export default function SettlementEngine() {
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

  if (loading) return <div className="p-8 text-white">Loading settlements...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Settlement Ledger</h4>
        {settlements.length === 0 ? (
          <p className="text-text-secondary text-sm">No settlements found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-white/5 text-white uppercase font-semibold text-xs border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Booking Total</th>
                  <th className="px-4 py-3">Theatre Base</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {settlements.map((s, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{s.orderId}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-white/10 rounded text-xs text-white">{s.type}</span></td>
                    <td className="px-4 py-3 font-semibold text-white">₹{s.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-400">₹{s.theatreBase.toFixed(2)}</td>
                    <td className="px-4 py-3">{new Date(s.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
