import { Request, Response, NextFunction } from "express";
import * as theatreService from "./theatre.service";

export async function createTheatreHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const theatre = await theatreService.createTheatre(req.body);
    res.status(201).json(theatre);
  } catch (error) {
    next(error);
  }
}

export async function updateTheatreHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const theatre = await theatreService.updateTheatre(req.params.id, req.body);
    res.json(theatre);
  } catch (error) {
    next(error);
  }
}

export async function getTheatreHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const theatre = await theatreService.getTheatre(req.params.id);
    if (!theatre) {
      return res.status(404).json({ message: "Theatre not found" });
    }
    res.json(theatre);
  } catch (error) {
    next(error);
  }
}

export async function getTheatresHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const theatres = await theatreService.getTheatres({
      city: req.query.city as string,
      status: req.query.status as any
    });
    res.json(theatres);
  } catch (error) {
    next(error);
  }
}

export async function updateTheatreStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const theatre = await theatreService.updateTheatreStatus(
      req.params.id,
      req.body.status
    );
    res.json(theatre);
  } catch (error) {
    next(error);
  }
}
