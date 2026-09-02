import React, { useState } from 'react';
import { Calendar, MapPin, Ticket, ExternalLink, MoreVertical, Edit, Trash } from 'lucide-react';

export default function EventsList() {
  const events = [
    {
      id: "evt_1",
      title: "Pushpa 2 Pre-Release Event",
      status: "PUBLISHED",
      date: "2026-10-15",
      capacity: 5000,
      registered: 2840,
      revenue: 14200000,
    }
  ];

  return (
    <div className="space-y-6">
      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="event-stats-block">
        <div className="bg-[#0F0F11] border border-white/5 p-4 rounded-xl text-left space-y-1">
          <span className="text-[9px] text-text-secondary uppercase font-semibold">Events Published</span>
          <p className="text-2xl font-semibold text-text-primary font-display">{events.length}</p>
        </div>
        <div className="bg-[#0F0F11] border border-white/5 p-4 rounded-xl text-left space-y-1">
          <span className="text-[9px] text-text-secondary uppercase font-semibold">Total Registrations</span>
          <p className="text-2xl font-semibold text-gold font-display">2,840</p>
        </div>
        <div className="bg-[#0F0F11] border border-white/5 p-4 rounded-xl text-left space-y-1">
          <span className="text-[9px] text-text-secondary uppercase font-semibold">Gross Event Revenue</span>
          <p className="text-2xl font-semibold text-emerald-400 font-mono">
            ₹1,42,00,000
          </p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">All Events</h3>
          <div className="flex gap-2">
            <input type="text" placeholder="Search events..." className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-white/5 text-white uppercase font-semibold text-xs border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Event Name</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Registrations</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-white">{evt.title}</p>
                    <p className="text-xs">{evt.id}</p>
                  </td>
                  <td className="px-4 py-4">{evt.date}</td>
                  <td className="px-4 py-4">
                    <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-[10px] font-bold tracking-wider">
                      {evt.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-white font-medium">{evt.registered}</span> / {evt.capacity}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-emerald-400">
                    ₹{evt.revenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-gold hover:text-white px-2"><Edit className="w-4 h-4" /></button>
                    <button className="text-red-400 hover:text-red-300 px-2"><Trash className="w-4 h-4" /></button>
                    <button className="text-text-secondary hover:text-white px-2"><ExternalLink className="w-4 h-4" /></button>
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
