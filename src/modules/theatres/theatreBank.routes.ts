import { Router } from "express";
import {
  getTheatreBankAccountsHandler,
  addTheatreBankAccountHandler,
  updateTheatreBankAccountHandler,
  verifyTheatreBankAccountHandler,
  rejectTheatreBankAccountHandler,
  setPrimaryTheatreBankAccountHandler,
  suspendTheatreBankAccountHandler,
  revealFullAccountNumberHandler,
  getTheatreSettlementsHandler,
  disburseTheatreSettlementHandler,
  getTheatreBankStatsHandler
} from "./theatreBank.controller";

const router = Router();

// Stats
router.get("/admin/theatre-bank-stats", getTheatreBankStatsHandler);
router.get("/admin/theatres/bank-stats", getTheatreBankStatsHandler);

// Bank account management per theatre
router.get("/admin/theatres/:theatreId/bank-accounts", getTheatreBankAccountsHandler);
router.post("/admin/theatres/:theatreId/bank-accounts", addTheatreBankAccountHandler);
router.put("/admin/theatres/:theatreId/bank-accounts/:bankAccountId", updateTheatreBankAccountHandler);

// Verification and status transitions
router.post("/admin/theatres/:theatreId/bank-accounts/:bankAccountId/verify", verifyTheatreBankAccountHandler);
router.post("/admin/theatres/:theatreId/bank-accounts/:bankAccountId/reject", rejectTheatreBankAccountHandler);
router.post("/admin/theatres/:theatreId/bank-accounts/:bankAccountId/set-primary", setPrimaryTheatreBankAccountHandler);
router.post("/admin/theatres/:theatreId/bank-accounts/:bankAccountId/suspend", suspendTheatreBankAccountHandler);

// Authorized Reveal of full account number
router.post("/admin/theatres/:theatreId/bank-accounts/:bankAccountId/reveal", revealFullAccountNumberHandler);

// Settlements for theatre
router.get("/admin/theatres/:theatreId/settlements", getTheatreSettlementsHandler);
router.post("/admin/theatres/:theatreId/settlements/disburse", disburseTheatreSettlementHandler);

// Theatre Portal Route (For Theatre Creator / Manager)
router.get("/theatre-portal/:theatreId/bank-details", getTheatreBankAccountsHandler);
router.post("/theatre-portal/:theatreId/bank-details", addTheatreBankAccountHandler);

export default router;
