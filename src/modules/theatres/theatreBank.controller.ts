import { Request, Response, NextFunction } from "express";
import * as theatreBankService from "./theatreBank.service";

/**
 * GET /api/admin/theatres/:theatreId/bank-accounts
 */
export async function getTheatreBankAccountsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { theatreId } = req.params;
    const accounts = await theatreBankService.getTheatreBankAccounts(theatreId);
    res.json({
      success: true,
      bankAccounts: accounts
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/admin/theatres/:theatreId/bank-accounts
 */
export async function addTheatreBankAccountHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { theatreId } = req.params;
    const adminUser = {
      id: (req.headers["x-admin-id"] as string) || req.body.adminId || "ADMIN-01",
      email: (req.headers["x-admin-email"] as string) || req.body.adminEmail || "superadmin@cinevenue.com"
    };

    const account = await theatreBankService.addTheatreBankAccount(theatreId, req.body, adminUser);
    res.status(201).json({
      success: true,
      message: "Theatre bank account added and submitted for CineVenue verification.",
      bankAccount: account
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * PUT /api/admin/theatres/:theatreId/bank-accounts/:bankAccountId
 */
export async function updateTheatreBankAccountHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { theatreId, bankAccountId } = req.params;
    const adminUser = {
      id: (req.headers["x-admin-id"] as string) || req.body.adminId || "ADMIN-01",
      email: (req.headers["x-admin-email"] as string) || req.body.adminEmail || "superadmin@cinevenue.com"
    };

    const account = await theatreBankService.updateTheatreBankAccount(theatreId, bankAccountId, req.body, adminUser);
    res.json({
      success: true,
      message: "Theatre bank account updated successfully.",
      bankAccount: account
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/admin/theatres/:theatreId/bank-accounts/:bankAccountId/verify
 */
export async function verifyTheatreBankAccountHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { theatreId, bankAccountId } = req.params;
    const { notes } = req.body;
    const adminUser = {
      id: (req.headers["x-admin-id"] as string) || req.body.adminId || "ADMIN-01",
      email: (req.headers["x-admin-email"] as string) || req.body.adminEmail || "superadmin@cinevenue.com"
    };

    const account = await theatreBankService.verifyTheatreBankAccount(theatreId, bankAccountId, notes, adminUser);
    res.json({
      success: true,
      message: `Bank account for theatre ${theatreId} has been verified successfully.`,
      bankAccount: account
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/admin/theatres/:theatreId/bank-accounts/:bankAccountId/reject
 */
export async function rejectTheatreBankAccountHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { theatreId, bankAccountId } = req.params;
    const { reason } = req.body;
    const adminUser = {
      id: (req.headers["x-admin-id"] as string) || req.body.adminId || "ADMIN-01",
      email: (req.headers["x-admin-email"] as string) || req.body.adminEmail || "superadmin@cinevenue.com"
    };

    const account = await theatreBankService.rejectTheatreBankAccount(theatreId, bankAccountId, reason, adminUser);
    res.json({
      success: true,
      message: "Bank account has been marked as Rejected.",
      bankAccount: account
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/admin/theatres/:theatreId/bank-accounts/:bankAccountId/set-primary
 */
export async function setPrimaryTheatreBankAccountHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { theatreId, bankAccountId } = req.params;
    const adminUser = {
      id: (req.headers["x-admin-id"] as string) || req.body.adminId || "ADMIN-01",
      email: (req.headers["x-admin-email"] as string) || req.body.adminEmail || "superadmin@cinevenue.com"
    };

    const account = await theatreBankService.setPrimaryTheatreBankAccount(theatreId, bankAccountId, adminUser);
    res.json({
      success: true,
      message: "Primary settlement account updated successfully.",
      bankAccount: account
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/admin/theatres/:theatreId/bank-accounts/:bankAccountId/suspend
 */
export async function suspendTheatreBankAccountHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { theatreId, bankAccountId } = req.params;
    const { reason } = req.body;
    const adminUser = {
      id: (req.headers["x-admin-id"] as string) || req.body.adminId || "ADMIN-01",
      email: (req.headers["x-admin-email"] as string) || req.body.adminEmail || "superadmin@cinevenue.com"
    };

    const account = await theatreBankService.suspendTheatreBankAccount(theatreId, bankAccountId, reason, adminUser);
    res.json({
      success: true,
      message: "Bank account has been suspended.",
      bankAccount: account
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/admin/theatres/:theatreId/bank-accounts/:bankAccountId/reveal
 */
export async function revealFullAccountNumberHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { theatreId, bankAccountId } = req.params;
    const adminUser = {
      id: (req.headers["x-admin-id"] as string) || req.body.adminId || "ADMIN-01",
      email: (req.headers["x-admin-email"] as string) || req.body.adminEmail || "superadmin@cinevenue.com"
    };

    const result = await theatreBankService.revealFullAccountNumber(theatreId, bankAccountId, adminUser);
    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    res.status(403).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/admin/theatres/:theatreId/settlements
 */
export async function getTheatreSettlementsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { theatreId } = req.params;
    const settlements = await theatreBankService.getTheatreSettlementHistory(theatreId);
    res.json({
      success: true,
      settlements
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/admin/theatres/:theatreId/settlements/disburse
 */
export async function disburseTheatreSettlementHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { theatreId } = req.params;
    const { theatreName, amount, grossSales, commission, taxes, idempotencyKey } = req.body;
    const adminUser = {
      id: (req.headers["x-admin-id"] as string) || req.body.adminId || "ADMIN-01",
      email: (req.headers["x-admin-email"] as string) || req.body.adminEmail || "superadmin@cinevenue.com"
    };

    const settlement = await theatreBankService.processTheatreSettlement(
      theatreId,
      theatreName,
      Number(amount) || 0,
      Number(grossSales) || 0,
      Number(commission) || 0,
      Number(taxes) || 0,
      idempotencyKey,
      adminUser
    );

    res.json({
      success: true,
      message: `Settlement of ₹${settlement.netAmount.toLocaleString("en-IN")} successfully disbursed.`,
      settlement
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/admin/theatre-bank-stats
 */
export async function getTheatreBankStatsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await theatreBankService.getTheatreBankStats();
    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
