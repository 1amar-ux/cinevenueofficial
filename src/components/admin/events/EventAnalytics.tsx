import React from 'react';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';

export default function EventAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111113] p-5 rounded-2xl border border-white/5 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-secondary text-sm font-semibold uppercase">Total Views</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white">45,231</span>
        </div>
        <div className="bg-[#111113] p-5 rounded-2xl border border-white/5 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-secondary text-sm font-semibold uppercase">Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white">6.2%</span>
        </div>
        <div className="bg-[#111113] p-5 rounded-2xl border border-white/5 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-secondary text-sm font-semibold uppercase">Total Check-ins</span>
            <Users className="w-4 h-4 text-gold" />
          </div>
          <span className="text-2xl font-bold text-white">0</span>
        </div>
        <div className="bg-[#111113] p-5 rounded-2xl border border-white/5 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-secondary text-sm font-semibold uppercase">Passes Issued</span>
            <BarChart3 className="w-4 h-4 text-gold" />
          </div>
          <span className="text-2xl font-bold text-white">2,840</span>
        </div>
      </div>
      
      <div className="bg-[#111113] p-6 rounded-2xl border border-white/5 min-h-[300px] flex items-center justify-center">
        <div className="text-center text-text-secondary">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Detailed charting visualization would render here</p>
        </div>
      </div>
    </div>
  );
}
