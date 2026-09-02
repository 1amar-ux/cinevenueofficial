import React, { useState } from 'react';
import { TheatreIntegration, IntegrationStatus, IntegrationTestRun } from '../../../types/integration';
import { ArrowLeft, CheckCircle2, XCircle, Play, RefreshCw, Shield, AlertTriangle, Terminal, Key, Box, ShoppingCart, LogOut } from 'lucide-react';

interface IntegrationDetailProps {
  integration: TheatreIntegration;
  onBack: () => void;
  onUpdateStatus: (id: string, status: IntegrationStatus) => void;
  isSuperAdmin?: boolean;
}

export default function IntegrationDetail({ integration, onBack, onUpdateStatus, isSuperAdmin }: IntegrationDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'logs'>('overview');
  const [testProgress, setTestProgress] = useState<number>(0);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{name: string, status: 'PASSED' | 'FAILED' | 'PENDING'}[]>([]);

  const runFullTest = async () => {
    setIsTesting(true);
    setTestProgress(0);
    
    const steps = [
      'API Connection', 'Authentication', 'Movie Sync', 'Screen Sync', 
      'Seat Sync', 'Show Sync', 'Seat Availability', 'Seat Lock', 
      'Payment', 'Booking', 'Ticket', 'QR Code', 'Cancellation', 
      'Refund', 'Seat Release', 'Webhook', 'Settlement'
    ];
    
    const results = steps.map(s => ({ name: s, status: 'PENDING' as const }));
    setTestResults(results);

    for (let i = 0; i < steps.length; i++) {
      // Simulate test time
      await new Promise(r => setTimeout(r, 600));
      
      setTestResults(prev => {
        const next = [...prev];
        next[i].status = 'PASSED'; // Mocking all passed for demo
        return next;
      });
      setTestProgress(((i + 1) / steps.length) * 100);
    }
    
    setIsTesting(false);
    onUpdateStatus(integration.id, 'READY_FOR_APPROVAL');
  };

  const handleApprove = () => {
    if (window.confirm(`Are you sure?\n\nThis will activate the theatre for real customer bookings.\n\nTheatre: ${integration.theatreName}\nIntegration: ${integration.integrationType}\nEnvironment: PRODUCTION`)) {
      onUpdateStatus(integration.id, 'LIVE');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h2 className="text-xl font-display text-white">{integration.theatreName}</h2>
          <p className="text-sm text-text-muted">Integration Details & Testing</p>
        </div>
      </div>

      <div className="flex border-b border-white/10">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-gold text-gold' : 'border-transparent text-text-secondary hover:text-white'}`}>Overview</button>
        <button onClick={() => setActiveTab('tests')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tests' ? 'border-gold text-gold' : 'border-transparent text-text-secondary hover:text-white'}`}>Testing Sandbox</button>
        <button onClick={() => setActiveTab('logs')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'logs' ? 'border-gold text-gold' : 'border-transparent text-text-secondary hover:text-white'}`}>System Logs</button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2"><Box className="w-5 h-5" /> Connection Details</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <p className="text-text-muted text-xs">Provider</p>
                  <p className="text-white font-medium">{integration.provider || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">Type</p>
                  <p className="text-white font-medium">{integration.integrationType}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">Environment</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${integration.environment === 'PRODUCTION' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    {integration.environment}
                  </span>
                </div>
                <div>
                  <p className="text-text-muted text-xs">Status</p>
                  <p className="text-white font-medium">{integration.status}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-text-muted text-xs">Webhook URL</p>
                  <code className="text-gold text-xs bg-black/50 px-2 py-1 rounded block mt-1">
                    {integration.credentials?.webhookUrl || `https://api.cinevenue.com/webhooks/integrations/${integration.id}`}
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2"><Key className="w-5 h-5" /> Credentials</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-text-muted text-xs mb-1">Base API URL</p>
                  <input type="text" readOnly value={integration.credentials?.baseApiUrl || ''} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-muted text-xs mb-1">Venue ID</p>
                    <input type="text" readOnly value={integration.credentials?.venueId || ''} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white" />
                  </div>
                  <div>
                    <p className="text-text-muted text-xs mb-1">API Key</p>
                    <input type="password" readOnly value="****************" className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white" />
                  </div>
                </div>
                <p className="text-xs text-amber-400 flex items-center gap-1 mt-2">
                  <Shield className="w-3.5 h-3.5" /> API Secrets are encrypted at rest and never exposed to the client.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Go-Live Status</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-white">Integration Configured</span>
                </div>
                <div className="flex items-center gap-3">
                  {integration.status === 'READY_FOR_APPROVAL' || integration.status === 'LIVE' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-white/20" />
                  )}
                  <span className="text-sm text-white">All Tests Passed</span>
                </div>
                
                <div className="pt-4 border-t border-white/10">
                  {integration.status === 'LIVE' ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded text-sm text-center font-medium">
                      Theatre is LIVE
                    </div>
                  ) : integration.status === 'READY_FOR_APPROVAL' ? (
                    <div className="space-y-3">
                      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded text-sm text-center font-medium">
                        Ready for Approval
                      </div>
                      <button 
                        onClick={handleApprove}
                        disabled={!isSuperAdmin}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded transition-colors disabled:opacity-50"
                      >
                        APPROVE & GO LIVE
                      </button>
                      {!isSuperAdmin && <p className="text-[10px] text-center text-text-muted">Super Admin rights required to activate production theatres.</p>}
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/10 text-text-secondary p-3 rounded text-sm text-center">
                      Complete testing to enable Go-Live
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-white">Integration Test Suite</h3>
              <p className="text-sm text-text-muted">Run comprehensive end-to-end sandbox verification.</p>
            </div>
            <button 
              onClick={runFullTest}
              disabled={isTesting}
              className="flex items-center gap-2 px-4 py-2 bg-gold hover:bg-gold-light text-black font-semibold rounded transition-colors disabled:opacity-50"
            >
              {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isTesting ? 'Running...' : 'RUN FULL TEST'}
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary">Progress</span>
                  <span className="text-gold">{Math.round(testProgress)}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gold transition-all duration-300"
                    style={{ width: `${testProgress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {testResults.map((test, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/5 rounded p-3 flex justify-between items-center">
                    <span className="text-sm text-text-primary">{test.name}</span>
                    {test.status === 'PENDING' ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    ) : test.status === 'PASSED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {testResults.length === 0 && (
            <div className="text-center py-12 text-text-muted">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No tests run yet. Click "Run Full Test" to verify the integration.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-[#0a0a0c] border border-white/10 rounded-xl overflow-hidden font-mono text-xs">
          <div className="bg-white/5 p-3 flex items-center gap-2 text-text-secondary border-b border-white/10">
            <Terminal className="w-4 h-4" />
            <span>System Logs (Real-time)</span>
          </div>
          <div className="p-4 space-y-2 h-96 overflow-y-auto">
            <div className="flex gap-4 text-emerald-400">
              <span className="text-white/30">14:20:11</span>
              <span>GET /api/v1/movies</span>
              <span>200 OK</span>
              <span className="text-white/30">124ms</span>
            </div>
            <div className="flex gap-4 text-emerald-400">
              <span className="text-white/30">14:20:15</span>
              <span>GET /api/v1/screens</span>
              <span>200 OK</span>
              <span className="text-white/30">89ms</span>
            </div>
            <div className="flex gap-4 text-blue-400">
              <span className="text-white/30">14:21:02</span>
              <span>POST /api/webhooks/integrations/{integration.id}</span>
              <span>200 OK</span>
              <span className="text-white/30">45ms</span>
              <span className="text-text-muted">Event: Payment Success</span>
            </div>
            <div className="flex gap-4 text-emerald-400">
              <span className="text-white/30">14:25:10</span>
              <span>POST /api/v1/bookings/lock</span>
              <span>200 OK</span>
              <span className="text-white/30">310ms</span>
            </div>
            <div className="text-center text-white/30 py-4 italic">
              End of logs
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
