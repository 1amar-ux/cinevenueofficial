import { Router } from "express";
import { getIntegrations, getIntegration, createIntegration, updateIntegration, runTest, getLogs, handleWebhook } from "./integration.controller";

const router = Router();

router.get("/admin/integrations", getIntegrations);
router.post("/admin/integrations", createIntegration);
router.get("/admin/integrations/:id", getIntegration);
router.put("/admin/integrations/:id", updateIntegration);
router.post("/admin/integrations/:id/test", runTest);
router.get("/admin/integrations/:id/logs", getLogs);
router.post("/webhooks/integrations/:id", handleWebhook);

export default router;
