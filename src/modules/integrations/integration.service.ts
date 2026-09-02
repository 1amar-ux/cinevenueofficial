import { randomUUID } from "crypto";
import { integrationDb } from "./integration.db";
import { integrationManager } from "./IntegrationManager";

export class IntegrationService {
  async getIntegrations() {
    return integrationDb.integrations;
  }

  async getIntegration(id: string) {
    return integrationDb.integrations.find(i => i.id === id);
  }

  async createIntegration(data: any) {
    const integration = {
      id: `int_${randomUUID().slice(0, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'PENDING',
      healthStatus: 'HEALTHY',
      ...data
    };
    integrationDb.integrations.push(integration);
    return integration;
  }

  async updateIntegration(id: string, data: any) {
    const idx = integrationDb.integrations.findIndex(i => i.id === id);
    if (idx === -1) throw new Error("Integration not found");
    integrationDb.integrations[idx] = {
      ...integrationDb.integrations[idx],
      ...data,
      updatedAt: new Date()
    };
    return integrationDb.integrations[idx];
  }

  async runFullTest(id: string) {
    const integration = await this.getIntegration(id);
    if (!integration) throw new Error("Integration not found");
    
    // Simulate a full 18-step run
    const testRun = {
      id: `test_${randomUUID().slice(0, 8)}`,
      integrationId: id,
      startedAt: new Date(),
      completedAt: new Date(),
      totalTests: 18,
      passed: 18,
      failed: 0,
      status: 'PASSED'
    };
    integrationDb.testRuns.push(testRun);

    this.logEvent(id, 'FULL_TEST_RUN', 'SYSTEM', 200, { success: true });

    return testRun;
  }

  async logEvent(integrationId: string, action: string, endpoint: string, status: number, result: any) {
    integrationDb.logs.push({
      id: `log_${randomUUID().slice(0, 8)}`,
      integrationId,
      timestamp: new Date(),
      action,
      endpoint,
      status,
      result,
      requestId: randomUUID()
    });
  }

  async getLogs(integrationId: string) {
    return integrationDb.logs.filter(l => l.integrationId === integrationId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const integrationService = new IntegrationService();
