mkdir -p src/modules/integrations
mkdir -p src/modules/reconciliation

cat << 'INNER_EOF' > src/modules/integrations/integration.db.ts
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
INNER_EOF

chmod +x backend_setup.sh
./backend_setup.sh
