import { Router } from "express";
import {
  getSalesHandler,
  getCommissionHandler,
  getSettlementsHandler,
  createSettlementHandler,
  getSettlementReportsHandler
} from "./settlement.controller";

const router = Router();

// GET /api/settlements/sales
router.get("/settlements/sales", getSalesHandler);

// GET /api/settlements/commission
router.get("/settlements/commission", getCommissionHandler);

// GET /api/settlements/reports
router.get("/settlements/reports", getSettlementReportsHandler);

// GET /api/settlements
router.get("/settlements", getSettlementsHandler);

// POST /api/settlements
router.post("/settlements", createSettlementHandler);

export default router;
