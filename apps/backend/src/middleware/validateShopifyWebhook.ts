import type { Request, Response, NextFunction } from "express";
import { logger } from "../modules/logger";
import { validateShopifyWebhookSignature } from "../adapters/shopify";

export function validateShopifyWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!process.env["SHOPIFY_API_SECRET"]) {
    next(new Error("SHOPIFY_API_SECRET not configured"));
    return;
  }

  if (!validateShopifyWebhookSignature(req)) {
    logger.warn("Shopify webhook signature mismatch");
    res.status(401).send("Invalid signature");
    return;
  }

  next();
}
