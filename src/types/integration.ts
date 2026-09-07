export type IntegrationType = 'CINEVENUE_MANAGED' | 'EXTERNAL_API' | 'POS_INTEGRATION' | 'MANUAL';
export type Environment = 'SANDBOX' | 'PRODUCTION';
export type IntegrationStatus = 'APPLICATION' | 'ONBOARDING' | 'CONFIGURATION' | 'INTEGRATION' | 'TESTING' | 'READY_FOR_APPROVAL' | 'LIVE' | 'FAILED' | 'SUSPENDED' | 'MAINTENANCE' | 'DISCONNECTED';

export type CapabilityStatus = 'SUPPORTED' | 'NOT_SUPPORTED' | 'UNKNOWN' | 'NOT_TESTED';

export interface PosCapabilities {
  showSync: CapabilityStatus;
  screenSync: CapabilityStatus;
  seatLayout: CapabilityStatus;
  liveSeatAvailability: CapabilityStatus;
  seatHold: CapabilityStatus;
  releaseSeatHold: CapabilityStatus;
  bookingConfirmation: CapabilityStatus;
  bookingStatus: CapabilityStatus;
  cancellation: CapabilityStatus;
  refund: CapabilityStatus;
  webhooks: CapabilityStatus;
}

export interface PosMappingItem {
  id: string;
  mappingType: 'VENUE' | 'SCREEN' | 'MOVIE' | 'SHOW' | 'SEAT';
  posId: string;
  posName?: string;
  cinevenueId: string;
  cinevenueName?: string;
  status: 'MAPPED' | 'UNMAPPED' | 'CONFLICT';
}

export interface TheatreIntegration {
  id: string;
  theatreId: string | number;
  theatreName: string;
  integrationType: IntegrationType;
  provider?: string;
  environment: Environment;
  status: IntegrationStatus;
  baseApiUrl?: string;
  venueId?: string;
  terminalId?: string;
  merchantId?: string;
  liveBookingEnabled?: boolean;
  seatHoldDurationMinutes?: number;
  syncFrequency?: string;
  capabilities?: PosCapabilities;
  lastConnectionTest?: string;
  lastSync?: string;
  lastSuccessfulBooking?: string;
  lastError?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  credentials?: {
    baseApiUrl?: string;
    venueId?: string;
    terminalId?: string;
    apiKey?: string;
    apiSecret?: string;
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
    merchantId?: string;
    webhookUrl?: string;
  };
  mappings?: PosMappingItem[];
  logs?: IntegrationLog[];
  reconciliations?: PosReconciliationRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationTestRun {
  id: string;
  integrationId: string;
  theatreId: string | number;
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
    status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'PENDING';
    error?: string;
    durationMs?: number;
  }[];
  executedBy: string;
}

export interface IntegrationLog {
  id: string;
  integrationId: string;
  event: string;
  requestType: string;
  endpoint: string;
  statusCode: number;
  durationMs: number;
  status: 'SUCCESS' | 'FAILED' | 'ERROR';
  bookingId?: string;
  posBookingId?: string;
  error?: string;
  createdAt: string;
}

export interface WebhookEvent {
  id: string;
  integrationId: string;
  provider: string;
  eventType: string;
  eventId: string;
  signatureValid: boolean;
  processed: boolean;
  status: string;
  receivedAt: string;
  processedAt?: string;
  error?: string;
}

export interface PosReconciliationRecord {
  id: string;
  integrationId: string;
  totalCinevenueBookings: number;
  totalPosBookings: number;
  matchedCount: number;
  mismatchCount: number;
  discrepancies: {
    cinevenueBookingId: string;
    posBookingId?: string;
    issue: string;
    amount: number;
    status: string;
  }[];
  status: string;
  createdAt: string;
}
