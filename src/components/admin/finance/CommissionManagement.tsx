import React, { useState, useEffect } from 'react';

export default function CommissionManagement() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/commission')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCommissions(data.commissionConfigs);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-white">Loading configurations...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Theatre Commission Structure</h4>
        {commissions.map(cc => (
          <div key={cc.id} className="mb-4">
            <h5 className="font-semibold text-white mb-2">Base Commission: <span className="text-emerald-400">{cc.defaultRate}%</span></h5>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-secondary">
                <thead className="bg-white/5 text-white uppercase font-semibold text-xs border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3">Min Tickets / Month</th>
                    <th className="px-4 py-3">Max Tickets / Month</th>
                    <th className="px-4 py-3">Commission Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {cc.volumeRules.map((rule: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">{rule.minTickets.toLocaleString()}</td>
                      <td className="px-4 py-3">{rule.maxTickets > 900000 ? 'Unlimited' : rule.maxTickets.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-white">{rule.rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
