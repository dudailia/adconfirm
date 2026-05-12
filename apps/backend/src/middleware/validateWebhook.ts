import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      rawBody?: string;
    }
  }
}

export function verifyXeroHmac(
  rawBody: string,
  signature: string,
  key: string
): boolean {
  const computed = crypto
    .createHmac("sha256", key)
    .update(rawBody, "utf8")
    .digest("base64");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "base64"),
      Buffer.from(signature, "base64")
    );
  } catch {
    return false;
  }
}

export function xeroHmacMiddleware(
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
    res.status(401).json({ error: "Missing x-xero-signature header" });
    return;
  }
  if (!req.rawBody) {
    res.status(400).json({ error: "Raw body not available" });
    return;
  }
  if (!verifyXeroHmac(req.rawBody, signature, key)) {
    res.status(401).json({ error: "Invalid webhook signature" });
    return;
  }
  next();
}
