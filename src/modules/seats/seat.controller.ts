import { Request, Response, NextFunction } from "express";
import * as seatService from "./seat.service";

export async function createSeatsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const seatsPayload = req.body.seats || req.body;
    const result = await seatService.createSeats(
      req.params.screenId,
      Array.isArray(seatsPayload) ? seatsPayload : [seatsPayload]
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateSeatHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await seatService.updateSeat(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function blockSeatHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await seatService.blockSeat(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getSeatLayoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await seatService.getSeatLayout(req.params.screenId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
