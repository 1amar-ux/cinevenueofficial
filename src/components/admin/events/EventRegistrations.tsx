import React from 'react';
import { Search, Filter, Download } from 'lucide-react';

export default function EventRegistrations() {
  const registrations = [
    { id: "REG-001", name: "John Doe", email: "john@example.com", event: "Pushpa 2 Pre-Release", pass: "VIP Pass", status: "CONFIRMED", passId: "CV-EVT-849201", amount: 5000 },
    { id: "REG-002", name: "Sarah Smith", email: "sarah@example.com", event: "Pushpa 2 Pre-Release", pass: "General Pass", status: "PENDING", passId: "-", amount: 500 },
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white">Event Registrations</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" />
            <input type="text" placeholder="Search attendee..." className="bg-black/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white" />
          </div>
          <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-secondary">
          <thead className="bg-white/5 text-white uppercase font-semibold text-xs border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Attendee</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Pass Type</th>
              <th className="px-4 py-3">Pass ID</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {registrations.map((reg) => (
              <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{reg.name}</p>
                  <p className="text-xs">{reg.email}</p>
                </td>
                <td className="px-4 py-3">{reg.event}</td>
                <td className="px-4 py-3">{reg.pass}</td>
                <td className="px-4 py-3 font-mono text-xs">{reg.passId}</td>
                <td className="px-4 py-3 text-right font-mono">₹{reg.amount}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${reg.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {reg.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
