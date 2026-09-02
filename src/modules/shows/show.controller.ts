import { Request, Response, NextFunction } from "express";
import * as showService from "./show.service";

export async function createShowHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const show = await showService.createShow(req.body);
    res.status(201).json(show);
  } catch (error) {
    next(error);
  }
}

export async function updateShowHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const show = await showService.updateShow(req.params.id, req.body);
    res.json(show);
  } catch (error) {
    next(error);
  }
}

export async function getShowsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const shows = await showService.getShows({
      theatreId: req.query.theatreId as string,
      movieId: req.query.movieId as string,
      date: req.query.date as string
    });
    res.json(shows);
  } catch (error) {
    next(error);
  }
}

export async function getShowHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const show = await showService.getShow(req.params.id);
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json(show);
  } catch (error) {
    next(error);
  }
}
