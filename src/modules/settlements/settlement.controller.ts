import { Request, Response, NextFunction } from "express";
import * as settlementService from "./settlement.service";

export async function getSalesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const theatreId = req.query.theatreId as string;
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;

    const result = await settlementService.getSales(theatreId, from, to);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getCommissionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const grossSales = req.query.grossSales ? String(req.query.grossSales) : "0";
    const commissionRate = req.query.commissionRate ? String(req.query.commissionRate) : "10";

    const commission = await settlementService.calculateCommission(grossSales, commissionRate);
    res.json({
      grossSales,
      commissionRate: `${commissionRate}%`,
      commissionAmount: commission.toFixed(2)
    });
  } catch (error) {
    next(error);
  }
}

export async function getSettlementsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const settlements = await settlementService.getSettlements(
      req.query.theatreId as string
    );
    res.json(settlements);
  } catch (error) {
    next(error);
  }
}

export async function createSettlementHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { theatreId, from, to, commissionRate } = req.body;
    const settlement = await settlementService.createSettlement(
      theatreId,
      new Date(from),
      new Date(to),
      commissionRate || 10
    );
    res.status(201).json(settlement);
  } catch (error) {
    next(error);
  }
}

export async function getSettlementReportsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const report = await settlementService.getSettlementReports({
      theatreId: req.query.theatreId as string,
      from: req.query.from as string,
      to: req.query.to as string
    });
    res.json(report);
  } catch (error) {
    next(error);
  }
}
