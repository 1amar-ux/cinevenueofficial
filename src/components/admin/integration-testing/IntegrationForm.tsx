import React, { useState } from 'react';
import { TheatreIntegration, IntegrationType, Environment } from '../../../types/integration';
import { ArrowLeft, Save, Shield } from 'lucide-react';

interface IntegrationFormProps {
  onBack: () => void;
  onSave: (data: Partial<TheatreIntegration>) => void;
}

export default function IntegrationForm({ onBack, onSave }: IntegrationFormProps) {
  const [formData, setFormData] = useState({
    theatreName: '',
    integrationType: 'CINEVENUE_MANAGED' as IntegrationType,
    provider: '',
    environment: 'SANDBOX' as Environment,
    baseApiUrl: '',
    venueId: '',
    terminalId: '',
    apiKey: '',
    apiSecret: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      theatreName: formData.theatreName,
      integrationType: formData.integrationType,
      provider: formData.provider,
      environment: formData.environment,
      status: 'ONBOARDING',
      credentials: {
        baseApiUrl: formData.baseApiUrl,
        venueId: formData.venueId,
        terminalId: formData.terminalId,
        apiKey: formData.apiKey,
        apiSecret: formData.apiSecret,
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <button type="button" onClick={onBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h2 className="text-xl font-display text-white">New Integration</h2>
          <p className="text-sm text-text-muted">Configure a new theatre API integration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white/5 border border-white/10 rounded-xl p-6">
        
        {/* Core Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">Core Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Theatre Name</label>
              <input required type="text" value={formData.theatreName} onChange={e => setFormData({...formData, theatreName: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white" placeholder="e.g. Cine Prime" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Integration Type</label>
              <select value={formData.integrationType} onChange={e => setFormData({...formData, integrationType: e.target.value as IntegrationType})} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white">
                <option value="CINEVENUE_MANAGED">CineVenue Managed</option>
                <option value="EXTERNAL_API">External API</option>
                <option value="POS_INTEGRATION">POS Integration</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>
          </div>
        </div>

        {/* Technical Config */}
        {(formData.integrationType === 'EXTERNAL_API' || formData.integrationType === 'POS_INTEGRATION') && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">Technical Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Provider Name</label>
                <input required type="text" value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white" placeholder="e.g. Vista, TicketNew" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Environment</label>
                <select value={formData.environment} onChange={e => setFormData({...formData, environment: e.target.value as Environment})} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white">
                  <option value="SANDBOX">Sandbox (Testing)</option>
                  <option value="PRODUCTION">Production (Live)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-text-secondary mb-1">Base API URL</label>
                <input required type="url" value={formData.baseApiUrl} onChange={e => setFormData({...formData, baseApiUrl: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white" placeholder="https://api.provider.com/v1" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Venue ID (Optional)</label>
                <input type="text" value={formData.venueId} onChange={e => setFormData({...formData, venueId: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Terminal ID (Optional)</label>
                <input type="text" value={formData.terminalId} onChange={e => setFormData({...formData, terminalId: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">API Key</label>
                <input required type="text" value={formData.apiKey} onChange={e => setFormData({...formData, apiKey: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1 flex items-center gap-1">API Secret <Shield className="w-3 h-3 text-gold" /></label>
                <input required type="password" value={formData.apiSecret} onChange={e => setFormData({...formData, apiSecret: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white" />
              </div>
            </div>
            
            <p className="text-xs text-text-muted mt-2">
              Note: Webhook URL will be automatically generated upon creation. Secrets are never exposed to the client once saved.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-gold hover:bg-gold-light text-black font-semibold rounded transition-colors">
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
