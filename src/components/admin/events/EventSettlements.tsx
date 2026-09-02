import React from 'react';

export default function EventSettlements() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white">Event Settlements</h3>
        <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-semibold">Generate Report</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-secondary">
          <thead className="bg-white/5 text-white uppercase font-semibold text-xs border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3 text-right">Gross Sales</th>
              <th className="px-4 py-3 text-right">CineVenue Fees</th>
              <th className="px-4 py-3 text-right">Taxes</th>
              <th className="px-4 py-3 text-right">Organizer Payable</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            <tr className="hover:bg-white/5 transition-colors">
              <td className="px-4 py-4 text-white font-semibold">Pushpa 2 Pre-Release</td>
              <td className="px-4 py-4 text-right font-mono">₹1,42,00,000</td>
              <td className="px-4 py-4 text-right font-mono text-red-400">-₹7,10,000</td>
              <td className="px-4 py-4 text-right font-mono text-amber-400">-₹1,27,800</td>
              <td className="px-4 py-4 text-right font-mono text-emerald-400 font-bold">₹1,33,62,200</td>
              <td className="px-4 py-4 text-right">
                <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-[10px] font-bold tracking-wider">PENDING</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
