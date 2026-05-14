import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { logger } from "../modules/logger";

export function verifyXeroSignature(body: Buffer, signature: string, key: string): boolean {
  const computed = crypto.createHmac("sha256", key).update(body).digest("base64");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "base64"),
      Buffer.from(signature, "base64")
    );
  } catch {
    return false;
  }
}

export function validateXeroWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const signature = req.headers["x-xero-signature"] as string | undefined;
  const key = process.env["XERO_WEBHOOK_KEY"];

  if (!key) {
    next(new Error("XERO_WEBHOOK_KEY not configured"));
    return;
  }

  if (!signature) {
    logger.warn({ ip: req.ip }, "xero webhook missing signature");
    res.status(401).json({ error: "Missing signature", code: "MISSING_SIGNATURE" });
    return;
  }

  const body = req.body as Buffer;

  if (!Buffer.isBuffer(body)) {
    res.status(400).json({ error: "Invalid body", code: "INVALID_BODY" });
    return;
  }

  if (!verifyXeroSignature(body, signature, key)) {
    logger.warn({ ip: req.ip }, "xero webhook invalid signature");
    res.status(401).json({ error: "Invalid signature", code: "INVALID_SIGNATURE" });
    return;
  }

  // Intent to Receive uses an empty body; HMAC is still computed over zero bytes.
  if (body.length === 0) {
    req.body = { events: [] };
    next();
    return;
  }

  // Parse JSON after HMAC verification so downstream handlers get an object
  try {
    req.body = JSON.parse(body.toString("utf8"));
  } catch {
    res.status(400).json({ error: "Invalid JSON body", code: "INVALID_JSON" });
    return;
  }

  next();
}
