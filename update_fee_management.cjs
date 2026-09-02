const fs = require('fs');
const path = 'src/components/admin/finance/FeeManagement.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `import React, { useState, useEffect } from 'react';

export default function FeeManagement() {
  const [feeConfigs, setFeeConfigs] = useState<any[]>([]);
  const [feeSlabs, setFeeSlabs] = useState<any[]>([]);
  const [taxConfigs, setTaxConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlab, setEditingSlab] = useState<any>(null);

  const fetchConfigs = () => {
    Promise.all([
      fetch('/api/admin/fees').then(res => res.json()),
      fetch('/api/admin/tax-config').then(res => res.json())
    ]).then(([feeData, taxData]) => {
      if (feeData.success) {
        setFeeConfigs(feeData.feeConfigs);
        setFeeSlabs(feeData.feeSlabs);
      }
      if (taxData.success) {
        setTaxConfigs(taxData.taxConfigs);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSaveSlab = async () => {
    if (!editingSlab) return;
    try {
      const res = await fetch(\`/api/admin/fees/slabs/\${editingSlab.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fee: editingSlab.fee,
          minPrice: editingSlab.minPrice,
          maxPrice: editingSlab.maxPrice
        })
      });
      if (res.ok) {
        setEditingSlab(null);
        fetchConfigs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading configurations...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Active Fee Slabs</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-white/5 text-white uppercase font-semibold text-xs border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Min Price</th>
                <th className="px-4 py-3">Max Price</th>
                <th className="px-4 py-3">Convenience Fee</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {feeSlabs.map(slab => (
                <tr key={slab.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    {editingSlab?.id === slab.id ? (
                      <input type="number" value={editingSlab.minPrice} onChange={e => setEditingSlab({...editingSlab, minPrice: Number(e.target.value)})} className="bg-white/10 border border-white/20 rounded px-2 py-1 w-20 text-white" />
                    ) : (
                      \`₹\${slab.minPrice}\`
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingSlab?.id === slab.id ? (
                      <input type="number" value={editingSlab.maxPrice} onChange={e => setEditingSlab({...editingSlab, maxPrice: Number(e.target.value)})} className="bg-white/10 border border-white/20 rounded px-2 py-1 w-24 text-white" />
                    ) : (
                      slab.maxPrice > 900000 ? 'Any' : \`₹\${slab.maxPrice}\`
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">
                    {editingSlab?.id === slab.id ? (
                      <input type="number" value={editingSlab.fee} onChange={e => setEditingSlab({...editingSlab, fee: Number(e.target.value)})} className="bg-white/10 border border-white/20 rounded px-2 py-1 w-20 text-white" />
                    ) : (
                      \`₹\${slab.fee}\`
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingSlab?.id === slab.id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={handleSaveSlab} className="text-emerald-400 hover:text-white transition-colors text-xs font-semibold px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20">Save</button>
                        <button onClick={() => setEditingSlab(null)} className="text-text-secondary hover:text-white transition-colors text-xs font-semibold px-2 py-1 rounded bg-white/10 hover:bg-white/20">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setEditingSlab({...slab})} className="text-gold hover:text-white transition-colors text-xs font-semibold px-2 py-1 rounded bg-gold/10 hover:bg-gold/20">Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Tax Configuration (GST Engine)</h4>
        {taxConfigs.map(tc => (
          <div key={tc.id} className="mb-4 p-4 border border-white/10 rounded-lg bg-white/[0.02]">
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-semibold text-white">Version: {tc.version} - {tc.type}</h5>
              <span className={\`px-2 py-1 text-[10px] uppercase font-bold rounded \${tc.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-text-secondary'}\`}>
                {tc.status}
              </span>
            </div>
            <ul className="list-disc list-inside text-sm text-text-secondary">
              {tc.rules.map((rule: any, idx: number) => (
                <li key={idx}>Tickets from ₹{rule.minPrice || 0} to {rule.maxPrice > 900000 ? 'Any' : \`₹\${rule.maxPrice}\`} : <strong className="text-white">{rule.rate}% GST</strong></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}`;

fs.writeFileSync(path, replacement);
console.log('FeeManagement updated with edit functionality');
