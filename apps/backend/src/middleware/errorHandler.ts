import type { Request, Response, NextFunction } from "express";
import { logger } from "../modules/logger";

export function errorHandler(
  err: Error & { code?: string; statusCode?: number },
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error({ err, method: req.method, url: req.url }, "unhandled error");
  const status = err.statusCode ?? 500;
  res.status(status).json({
    error: err.message || "Internal server error",
    code: err.code ?? "INTERNAL_ERROR",
  });
}
