import React from 'react';
import { QrCode, Scan, CheckCircle2, AlertCircle } from 'lucide-react';

export default function QRScanner() {
  const [scanState, setScanState] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [mockPassId, setMockPassId] = React.useState('');

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (mockPassId.includes('EVT')) {
      setScanState('success');
    } else {
      setScanState('error');
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="max-w-2xl mx-auto text-center space-y-8 py-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Event Check-in Scanner</h3>
          <p className="text-text-secondary">Scan attendee digital passes or enter Pass ID manually.</p>
        </div>

        <div className="w-64 h-64 bg-black border-2 border-dashed border-emerald-500/50 rounded-2xl mx-auto flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-emerald-400 transition-colors">
          <Scan className="w-16 h-16 text-emerald-400 mb-4" />
          <span className="text-emerald-400 font-semibold uppercase tracking-wider text-sm">Click to Scan</span>
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400/50 blur-[2px] animate-[scan_2s_ease-in-out_infinite]" />
        </div>

        <div className="flex items-center gap-4 max-w-sm mx-auto">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-xs text-text-muted uppercase font-bold">OR</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <form onSubmit={handleScan} className="max-w-sm mx-auto flex gap-2">
          <input 
            type="text" 
            value={mockPassId}
            onChange={(e) => setMockPassId(e.target.value)}
            placeholder="Enter Pass ID (e.g. CV-EVT-123)" 
            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-gold"
          />
          <button type="submit" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Verify
          </button>
        </form>

        {scanState === 'success' && (
          <div className="max-w-sm mx-auto bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
            <h4 className="text-emerald-400 font-bold text-lg">CHECK-IN SUCCESSFUL</h4>
            <p className="text-white font-semibold mt-2">Pass: VIP Access</p>
            <p className="text-text-secondary text-sm">Name: John Doe</p>
          </div>
        )}

        {scanState === 'error' && (
          <div className="max-w-sm mx-auto bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col items-center">
            <AlertCircle className="w-10 h-10 text-red-400 mb-2" />
            <h4 className="text-red-400 font-bold text-lg">INVALID PASS</h4>
            <p className="text-text-secondary text-sm mt-1">Pass not found or already checked in.</p>
          </div>
        )}
      </div>
    </div>
  );
}
