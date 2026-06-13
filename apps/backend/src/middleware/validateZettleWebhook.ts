import type { Request, Response, NextFunction } from "express";
import { logger } from "../modules/logger";
import { validateZettleSignature } from "../adapters/zettle";

export function validateZettleWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const signature = req.headers["x-izettle-signature"] as string | undefined;

  if (!signature) {
    logger.warn("Zettle webhook missing x-izettle-signature header");
    res.status(401).send("Missing signature");
    return;
  }

  if (!validateZettleSignature(req.body as Buffer, signature)) {
    logger.warn({ signature }, "Zettle webhook signature mismatch");
    res.status(401).send("Invalid signature");
    return;
  }

  next();
}
