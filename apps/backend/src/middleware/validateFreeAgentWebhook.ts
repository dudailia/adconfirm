import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { logger } from "../modules/logger";

export function validateFreeAgentWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const signature = req.headers["x-freeagent-signature"] as string | undefined;
  const secret = process.env["FREEAGENT_CLIENT_SECRET"];

  if (!secret) {
    next(new Error("FREEAGENT_CLIENT_SECRET not configured"));
    return;
  }

  if (!signature) {
    logger.warn("FreeAgent webhook missing x-freeagent-signature header");
    res.status(401).send("Missing signature");
    return;
  }

  const computed = crypto
    .createHmac("sha256", secret)
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
    logger.warn({ signature }, "FreeAgent webhook signature mismatch");
    res.status(401).send("Invalid signature");
    return;
  }

  next();
}
