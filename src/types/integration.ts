export type IntegrationType = 'CINEVENUE_MANAGED' | 'EXTERNAL_API' | 'POS_INTEGRATION' | 'MANUAL';
export type Environment = 'SANDBOX' | 'PRODUCTION';
export type IntegrationStatus = 'APPLICATION' | 'ONBOARDING' | 'CONFIGURATION' | 'INTEGRATION' | 'TESTING' | 'READY_FOR_APPROVAL' | 'LIVE' | 'FAILED' | 'SUSPENDED' | 'MAINTENANCE' | 'DISCONNECTED';

export interface TheatreIntegration {
  id: string;
  theatreId: number;
  theatreName: string;
  integrationType: IntegrationType;
  provider?: string;
  environment: Environment;
  status: IntegrationStatus;
  credentials?: {
    baseApiUrl?: string;
    venueId?: string;
    terminalId?: string;
    apiKey?: string;
    // API secret is not exposed typically, but included for complete typing
    apiSecret?: string;
    webhookUrl?: string;
  };
  lastConnectionTest?: string;
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationTestRun {
  id: string;
  integrationId: string;
  theatreId: number;
  environment: Environment;
  testType: string;
  startedAt: string;
  completedAt?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: {
    name: string;
    status: 'PASSED' | 'FAILED' | 'SKIPPED';
    error?: string;
    durationMs?: number;
  }[];
  executedBy: string;
}

export interface IntegrationLog {
  id: string;
  integrationId: string;
  theatreId: number;
  environment: Environment;
  action: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestId: string;
  result: 'SUCCESS' | 'FAILED' | 'ERROR';
  error?: string;
  createdAt: string;
  user: string;
}

export interface WebhookEvent {
  id: string;
  integrationId: string;
  provider: string;
  eventType: string;
  eventId: string;
  signatureValid: boolean;
  processed: boolean;
  processingStatus: string;
  receivedAt: string;
  processedAt?: string;
  error?: string;
}
