import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { logger } from "../modules/logger";

export function validateQBOWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const signature = req.headers["intuit-signature"] as string | undefined;
  const token = process.env["INTUIT_WEBHOOK_VERIFIER_TOKEN"];

  if (!token) {
    next(new Error("INTUIT_WEBHOOK_VERIFIER_TOKEN not configured"));
    return;
  }

  if (!signature) {
    logger.warn("QBO webhook missing intuit-signature header");
    res.status(401).send("Missing signature");
    return;
  }

  const computed = crypto
    .createHmac("sha256", token)
    .update(req.body as Buffer)
    .digest("base64");

  let valid = false;
  try {
    valid = crypto.timingSafeEqual(
      Buffer.from(computed, "base64"),
      Buffer.from(signature, "base64")
    );
  } catch {
    valid = false;
  }

  if (!valid) {
    logger.warn({ signature }, "QBO webhook signature mismatch");
    res.status(401).send("Invalid signature");
    return;
  }

  next();
}
