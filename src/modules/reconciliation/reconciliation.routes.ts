import { Router } from "express";
import { integrationDb } from "../integrations/integration.db";
import { randomUUID } from "crypto";

const router = Router();

router.get("/admin/reconciliation", (req, res) => {
  res.json({
    success: true,
    runs: integrationDb.reconciliations,
    discrepancies: integrationDb.reconciliationDiscrepancies
  });
});

router.post("/admin/reconciliation/run", (req, res) => {
  const { integrationId } = req.body;
  const run = {
    id: `recon_${randomUUID().slice(0, 8)}`,
    integrationId,
    startedAt: new Date(),
    completedAt: new Date(),
    recordsChecked: Math.floor(Math.random() * 2000) + 500,
    matched: 0,
    mismatched: Math.floor(Math.random() * 5),
    status: 'COMPLETED'
  };
  run.matched = run.recordsChecked - run.mismatched;
  integrationDb.reconciliations.push(run);
  
  if (run.mismatched > 0) {
    for (let i = 0; i < run.mismatched; i++) {
      integrationDb.reconciliationDiscrepancies.push({
        id: `disc_${randomUUID().slice(0, 8)}`,
        reconciliationRunId: run.id,
        integrationId,
        entityType: 'BOOKING',
        discrepancyType: 'PAYMENT_MISMATCH',
        status: 'OPEN'
      });
    }
  }

  res.json({ success: true, run });
});

export default router;
