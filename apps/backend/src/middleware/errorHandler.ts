import type { Request, Response, NextFunction } from "express";
import { logger } from "../modules/logger";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error({ err, method: req.method, url: req.url }, "unhandled error");
  res.status(500).json({ error: "Internal server error" });
}
