import type { Request, Response, NextFunction } from "express";
import { logger } from "../modules/logger";
import { validateSageSignature } from "../adapters/sage";

export function validateSageWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const signature = req.headers["x-sage-signature"] as string | undefined;

  if (!signature) {
    logger.warn("Sage webhook missing x-sage-signature header");
    res.status(401).send("Missing signature");
    return;
  }

  if (!validateSageSignature(req.body as Buffer, signature)) {
    logger.warn({ signature }, "Sage webhook signature mismatch");
    res.status(401).send("Invalid signature");
    return;
  }

  next();
}
