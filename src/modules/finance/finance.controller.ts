import { Request, Response } from "express";
import { financeService } from "./finance.service";
import { financeDb } from "./finance.db";

export async function calculatePrice(req: Request, res: Response) {
  try {
    const { showId, tickets } = req.body;
    if (!showId || !tickets || !Array.isArray(tickets)) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }
    const pricing = await financeService.calculatePrice(showId, tickets);
    res.json({ success: true, data: pricing });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createOrder(req: Request, res: Response) {
  try {
    // Ideally we would create the booking here as well, 
    // or take an existing pending bookingId.
    const order = await financeService.createPaymentOrder(req.body);
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function handleRazorpayWebhook(req: Request, res: Response) {
  try {
    await financeService.processWebhook("RAZORPAY", req.body);
    res.json({ success: true, message: "Webhook processed" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAdminFees(req: Request, res: Response) {
  try {
    res.json({ success: true, feeConfigs: financeDb.feeConfigs, feeSlabs: financeDb.feeSlabs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAdminTaxes(req: Request, res: Response) {
  try {
    res.json({ success: true, taxConfigs: financeDb.taxConfigs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAdminCommissions(req: Request, res: Response) {
  try {
    res.json({ success: true, commissionConfigs: financeDb.commissionConfigs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAdminSettlements(req: Request, res: Response) {
  try {
    res.json({ success: true, settlements: financeDb.settlementLedgers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateFeeSlab(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { fee, minPrice, maxPrice } = req.body;
    
    const slabIndex = financeDb.feeSlabs.findIndex(s => s.id === id);
    if (slabIndex === -1) return res.status(404).json({ success: false, message: "Slab not found" });

    financeDb.feeSlabs[slabIndex] = {
      ...financeDb.feeSlabs[slabIndex],
      fee: fee !== undefined ? Number(fee) : financeDb.feeSlabs[slabIndex].fee,
      minPrice: minPrice !== undefined ? Number(minPrice) : financeDb.feeSlabs[slabIndex].minPrice,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : financeDb.feeSlabs[slabIndex].maxPrice,
    };

    res.json({ success: true, slab: financeDb.feeSlabs[slabIndex] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function processRefund(req: Request, res: Response) {
  try {
    const { id } = req.params; // bookingId
    // In a real scenario, fetch booking and order from db
    const order = financeDb.paymentOrders.find(o => o.bookingId === id) || financeDb.paymentOrders[0];
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const refund = {
      id: "ref_" + Date.now(),
      orderId: order.id,
      amount: order.amount, // Full refund
      status: "COMPLETED",
      createdAt: new Date()
    };
    financeDb.refunds.push(refund);

    res.json({ success: true, refund });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
