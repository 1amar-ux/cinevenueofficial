import { randomUUID } from "crypto";

export const integrationDb = {
  integrations: [] as any[],
  logs: [] as any[],
  testRuns: [] as any[],
  webhooks: [] as any[],
  mappings: [] as any[],
  reconciliations: [] as any[],
  reconciliationDiscrepancies: [] as any[]
};
