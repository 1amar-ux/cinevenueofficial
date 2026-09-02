import { Router } from "express";
import * as financeController from "./finance.controller";

const router = Router();

router.post("/booking/calculate-price", financeController.calculatePrice);
router.post("/payments/create-order", financeController.createOrder);
router.post("/payments/webhook/razorpay", financeController.handleRazorpayWebhook);

router.get("/admin/fees", financeController.getAdminFees);
router.put("/admin/fees/slabs/:id", financeController.updateFeeSlab);

router.get("/admin/tax-config", financeController.getAdminTaxes);
router.get("/admin/commission", financeController.getAdminCommissions);
router.get("/admin/settlements", financeController.getAdminSettlements);

router.post("/bookings/:id/refund", financeController.processRefund);

export default router;
