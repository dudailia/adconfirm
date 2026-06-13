import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { logger } from "../modules/logger";

export function validateSquareWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const signature = req.headers["x-square-hmacsha256-signature"] as string | undefined;
  const secret = process.env["SQUARE_WEBHOOK_SIGNATURE_KEY"];

  if (!secret) {
    next(new Error("SQUARE_WEBHOOK_SIGNATURE_KEY not configured"));
    return;
  }

  if (!signature) {
    logger.warn("Square webhook missing x-square-hmacsha256-signature header");
    res.status(401).send("Missing signature");
    return;
  }

  const notificationUrl =
    process.env["SQUARE_WEBHOOK_NOTIFICATION_URL"] ??
    "https://adconfirm-api.onrender.com/webhooks/square";

  const rawBody = (req.body as Buffer).toString("utf8");
  const computed = crypto
    .createHmac("sha256", secret)
    .update(notificationUrl + rawBody)
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
    logger.warn({ signature }, "Square webhook signature mismatch");
    res.status(401).send("Invalid signature");
    return;
  }

  next();
}
