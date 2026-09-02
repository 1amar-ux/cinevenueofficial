import { Request, Response, NextFunction } from "express";
import * as screenService from "./screen.service";

export async function createScreenHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const screen = await screenService.createScreen(
      req.params.theatreId,
      req.body
    );
    res.status(201).json(screen);
  } catch (error) {
    next(error);
  }
}

export async function updateScreenHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const screen = await screenService.updateScreen(
      req.params.id,
      req.body
    );
    res.json(screen);
  } catch (error) {
    next(error);
  }
}

export async function getScreensHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const screens = await screenService.getScreens(
      req.params.theatreId
    );
    res.json(screens);
  } catch (error) {
    next(error);
  }
}

export async function getScreenHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const screen = await screenService.getScreen(req.params.id);
    if (!screen) return res.status(404).json({ message: "Screen not found" });
    res.json(screen);
  } catch (error) {
    next(error);
  }
}
