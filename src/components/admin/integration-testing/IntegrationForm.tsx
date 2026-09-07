import React, { useState } from 'react';
import { TheatreIntegration, IntegrationType, Environment } from '../../../types/integration';
import { ArrowLeft, Save, Shield, ChevronDown, ChevronUp, AlertCircle, Info, Lock } from 'lucide-react';

interface IntegrationFormProps {
  onBack: () => void;
  onSave: (data: Partial<TheatreIntegration>) => void;
}

export default function IntegrationForm({ onBack, onSave }: IntegrationFormProps) {
  const [formData, setFormData] = useState({
    theatreName: '',
    integrationType: 'POS_INTEGRATION' as IntegrationType,
    provider: 'Vista',
    environment: 'SANDBOX' as Environment,
    baseApiUrl: 'https://api-sandbox.vista.co/v1',
    venueId: '',
    terminalId: '',
    apiKey: '',
    apiSecret: '',
    clientId: '',
    clientSecret: '',
    accessToken: '',
    merchantId: '',
    seatHoldDurationMinutes: 10,
    syncFrequency: 'REALTIME'
  });

  const [showAdvancedAuth, setShowAdvancedAuth] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const validateUrl = (url: string) => {
    if (!url) {
      setUrlError('Base API URL is required.');
      return false;
    }
    if (/\s/.test(url)) {
      setUrlError('URL cannot contain spaces.');
      return false;
    }
    if (!url.startsWith('https://')) {
      setUrlError('Base API URL must be a valid HTTPS URL (e.g. https://api.provider.com/v1).');
      return false;
    }
    setUrlError(null);
    return true;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setFormData({ ...formData, baseApiUrl: val });
    validateUrl(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.integrationType === 'EXTERNAL_API' || formData.integrationType === 'POS_INTEGRATION') {
      if (!validateUrl(formData.baseApiUrl)) {
        return;
      }
      if (!formData.apiKey.trim() || !formData.apiSecret.trim()) {
        alert('API Key and API Secret are required.');
        return;
      }
    }

    onSave({
      theatreName: formData.theatreName,
      integrationType: formData.integrationType,
      provider: formData.provider,
      environment: formData.environment,
      status: 'TESTING',
      credentials: {
        baseApiUrl: formData.baseApiUrl,
        venueId: formData.venueId || undefined,
        terminalId: formData.terminalId || undefined,
        apiKey: formData.apiKey,
        apiSecret: formData.apiSecret,
        clientId: formData.clientId || undefined,
        clientSecret: formData.clientSecret || undefined,
        accessToken: formData.accessToken || undefined,
        merchantId: formData.merchantId || undefined
      },
      seatHoldDurationMinutes: formData.seatHoldDurationMinutes,
      syncFrequency: formData.syncFrequency
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h2 className="text-xl font-display text-white">Configure Theatre Integration</h2>
          <p className="text-xs text-text-muted">Set up POS or API integration for automated inventory & booking synchronization</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-black/60 border border-white/10 rounded-xl p-6 shadow-2xl backdrop-blur-md">
        
        {/* 1. Core Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gold border-b border-white/10 pb-2">
            1. Core Theatre Setup
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Theatre Name *</label>
              <input
                required
                type="text"
                value={formData.theatreName}
                onChange={e => setFormData({ ...formData, theatreName: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded p-2.5 text-sm text-white focus:outline-none focus:border-gold"
                placeholder="e.g. CinePrime Multiplex Vijayawada"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Integration Type *</label>
              <select
                value={formData.integrationType}
                onChange={e => setFormData({ ...formData, integrationType: e.target.value as IntegrationType })}
                className="w-full bg-black/50 border border-white/10 rounded p-2.5 text-sm text-white focus:outline-none focus:border-gold"
              >
                <option value="POS_INTEGRATION">POS Integration (Automated Real-Time Box Office)</option>
                <option value="EXTERNAL_API">External API (Custom Aggregator / Distributor)</option>
                <option value="CINEVENUE_MANAGED">CineVenue Managed (Native CineVenue Engine)</option>
                <option value="MANUAL">Manual (Local Box Office Operator)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Technical POS Configuration */}
        {(formData.integrationType === 'EXTERNAL_API' || formData.integrationType === 'POS_INTEGRATION') && (
          <div className="space-y-6 animate-fade-in border-t border-white/10 pt-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gold pb-1">
                2. POS Provider & Technical Configuration
              </h3>
              <p className="text-xs text-text-muted">
                Configure connection parameters for the theatre's Point of Sale system.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Provider Name *</label>
                <input
                  required
                  type="text"
                  value={formData.provider}
                  onChange={e => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded p-2.5 text-sm text-white focus:outline-none focus:border-gold"
                  placeholder="e.g. Vista, TicketNew, Other POS Provider"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Environment *</label>
                <select
                  value={formData.environment}
                  onChange={e => setFormData({ ...formData, environment: e.target.value as Environment })}
                  className="w-full bg-black/50 border border-white/10 rounded p-2.5 text-sm text-white focus:outline-none focus:border-gold"
                >
                  <option value="SANDBOX">Sandbox (Testing Simulator & Staging)</option>
                  <option value="PRODUCTION">Production (Live Box Office)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-text-secondary mb-1">Base API URL * (Must be HTTPS)</label>
                <input
                  required
                  type="text"
                  value={formData.baseApiUrl}
                  onChange={handleUrlChange}
                  className={`w-full bg-black/50 border ${urlError ? 'border-red-500' : 'border-white/10'} rounded p-2.5 text-sm text-white font-mono focus:outline-none focus:border-gold`}
                  placeholder="https://api.provider.com/v1"
                />
                {urlError && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {urlError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1">Venue ID (Optional)</label>
                <input
                  type="text"
                  value={formData.venueId}
                  onChange={e => setFormData({ ...formData, venueId: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded p-2.5 text-sm text-white font-mono"
                  placeholder="e.g. VENUE_8741"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Terminal ID (Optional)</label>
                <input
                  type="text"
                  value={formData.terminalId}
                  onChange={e => setFormData({ ...formData, terminalId: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded p-2.5 text-sm text-white font-mono"
                  placeholder="e.g. TERM_01"
                />
              </div>
            </div>

            {/* 3. Authentication */}
            <div className="space-y-4 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gold flex items-center gap-2">
                  <Lock className="w-4 h-4" /> 3. Authentication Credentials
                </h3>
                <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> AES-256 Encrypted At Rest
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">API Key *</label>
                  <input
                    required
                    type="password"
                    value={formData.apiKey}
                    onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded p-2.5 text-sm text-white font-mono focus:outline-none focus:border-gold"
                    placeholder="Enter API Key"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">API Secret *</label>
                  <input
                    required
                    type="password"
                    value={formData.apiSecret}
                    onChange={e => setFormData({ ...formData, apiSecret: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded p-2.5 text-sm text-white font-mono focus:outline-none focus:border-gold"
                    placeholder="Enter API Secret"
                  />
                </div>
              </div>

              {/* Advanced Collapsible */}
              <div className="border border-white/10 rounded-lg p-3 bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() => setShowAdvancedAuth(!showAdvancedAuth)}
                  className="w-full flex items-center justify-between text-xs text-text-secondary hover:text-white font-medium transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-gold" />
                    Advanced Authentication Settings (OAuth2 / Merchant Tokens)
                  </span>
                  {showAdvancedAuth ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvancedAuth && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/5 animate-fade-in">
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1">Client ID</label>
                      <input
                        type="text"
                        value={formData.clientId}
                        onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded p-2 text-xs text-white font-mono"
                        placeholder="Optional OAuth Client ID"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1">Client Secret</label>
                      <input
                        type="password"
                        value={formData.clientSecret}
                        onChange={e => setFormData({ ...formData, clientSecret: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded p-2 text-xs text-white font-mono"
                        placeholder="Optional OAuth Client Secret"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1">Access Token / Bearer Token</label>
                      <input
                        type="password"
                        value={formData.accessToken}
                        onChange={e => setFormData({ ...formData, accessToken: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded p-2 text-xs text-white font-mono"
                        placeholder="Optional Static Access Token"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1">Merchant ID</label>
                      <input
                        type="text"
                        value={formData.merchantId}
                        onChange={e => setFormData({ ...formData, merchantId: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded p-2 text-xs text-white font-mono"
                        placeholder="Optional Merchant Account ID"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Booking & Sync Preferences */}
            <div className="space-y-4 border-t border-white/10 pt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
                4. Operational & Seat Hold Policies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Seat Hold Duration (Minutes) *</label>
                  <select
                    value={formData.seatHoldDurationMinutes}
                    onChange={e => setFormData({ ...formData, seatHoldDurationMinutes: Number(e.target.value) })}
                    className="w-full bg-black/50 border border-white/10 rounded p-2.5 text-sm text-white"
                  >
                    <option value={5}>5 Minutes</option>
                    <option value={8}>8 Minutes</option>
                    <option value={10}>10 Minutes (Recommended)</option>
                    <option value={12}>12 Minutes</option>
                    <option value={15}>15 Minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Sync Frequency *</label>
                  <select
                    value={formData.syncFrequency}
                    onChange={e => setFormData({ ...formData, syncFrequency: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded p-2.5 text-sm text-white"
                  >
                    <option value="REALTIME">Real-time / Webhook-Driven</option>
                    <option value="1MIN">Every 1 Minute</option>
                    <option value="5MIN">Every 5 Minutes</option>
                    <option value="15MIN">Every 15 Minutes</option>
                    <option value="MANUAL">Manual Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white rounded text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gold hover:bg-gold-light text-black font-bold rounded transition-colors shadow-lg shadow-gold/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
