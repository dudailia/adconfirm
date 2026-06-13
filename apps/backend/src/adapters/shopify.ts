import crypto from "crypto";
import type { Request, Response } from "express";
import { logger } from "../modules/logger";
import { db, insertWebhookEvent, resolveWebhookEvent } from "../modules/db";
import { processInvoice } from "../modules/processor";

const SHOPIFY_API_VERSION = "2024-01";

// ─── Webhook registration ─────────────────────────────────────────────────────

export async function registerShopifyWebhook(
  shop: string,
  accessToken: string
): Promise<string | null> {
  const webhookUrl =
    process.env["SHOPIFY_WEBHOOK_URL"] ??
    "https://adconfirm-api.onrender.com/webhooks/shopify";

  const res = await fetch(
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/webhooks.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        webhook: {
          topic: "orders/paid",
          address: webhookUrl,
          format: "json",
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.error({ status: res.status, text, shop }, "Shopify webhook registration failed");
    return null;
  }

  const body = (await res.json()) as { webhook?: { id?: number } };
  return body.webhook?.id != null ? String(body.webhook.id) : null;
}

export async function deleteShopifyWebhook(
  shop: string,
  accessToken: string,
  webhookId: string
): Promise<void> {
  const res = await fetch(
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/webhooks/${webhookId}.json`,
    {
      method: "DELETE",
      headers: { "X-Shopify-Access-Token": accessToken },
    }
  );
  if (!res.ok) {
    logger.warn({ status: res.status, shop, webhookId }, "Shopify webhook deletion failed (non-fatal)");
  }
}

// ─── Webhook signature validation ─────────────────────────────────────────────

export function validateShopifyWebhookSignature(req: Request): boolean {
  const hmacHeader = req.headers["x-shopify-hmac-sha256"] as string | undefined;
  const secret = process.env["SHOPIFY_API_SECRET"];

  if (!secret || !hmacHeader) return false;

  const rawBody = (req.body as Buffer).toString("utf8");
  const computed = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "base64"),
      Buffer.from(hmacHeader, "base64")
    );
  } catch {
    return false;
  }
}

// ─── Webhook handler ──────────────────────────────────────────────────────────

export async function shopifyWebhookHandler(req: Request, res: Response): Promise<void> {
  let payloadObj: unknown = null;
  try {
    payloadObj = JSON.parse((req.body as Buffer).toString("utf8"));
  } catch {
    payloadObj = { raw: (req.body as Buffer).toString("utf8") };
  }

  const webhookEvent = await insertWebhookEvent("shopify", payloadObj).catch((err) => {
    logger.warn({ err }, "webhook_events insert failed for Shopify — continuing");
    return null;
  });

  res.status(200).send();

  const shop = req.headers["x-shopify-shop-domain"] as string | undefined;
  if (!shop) {
    if (webhookEvent) {
      await resolveWebhookEvent(webhookEvent.id, "failed", "missing x-shopify-shop-domain").catch(() => {});
    }
    return;
  }

  const { data: business, error: bizError } = await db
    .from("businesses")
    .select("*")
    .eq("shopify_shop", shop)
    .single();

  if (bizError || !business) {
    logger.warn({ shop }, "no business found for Shopify shop domain");
    if (webhookEvent) {
      await resolveWebhookEvent(webhookEvent.id, "failed", "unknown shop").catch(() => {});
    }
    return;
  }

  const order = payloadObj as Record<string, unknown>;

  let errorMsg: string | undefined;
  try {
    const lineItems = Array.isArray(order["line_items"])
      ? (order["line_items"] as Record<string, unknown>[]).map((li) => ({
          description: String(li["title"] ?? ""),
          quantity: Number(li["quantity"] ?? 1),
          unitAmount: Number(li["price"] ?? 0),
          lineAmount: Number(li["quantity"] ?? 1) * Number(li["price"] ?? 0),
        }))
      : [];

    const customer = (order["customer"] as Record<string, unknown> | undefined) ?? {};
    const billingAddress = (order["billing_address"] as Record<string, unknown> | undefined) ?? {};
    const firstName = String(customer["first_name"] ?? billingAddress["first_name"] ?? "");
    const lastName = String(customer["last_name"] ?? billingAddress["last_name"] ?? "");

    await processInvoice(
      business,
      {
        invoiceId: String(order["id"] ?? "unknown"),
        tenantId: shop,
        invoiceNumber: String(order["order_number"] ?? order["name"] ?? order["id"] ?? "unknown"),
        total: parseFloat(String(order["total_price"] ?? "0")),
        currency: String(order["currency"] ?? "USD"),
        date: typeof order["created_at"] === "string"
          ? (order["created_at"] as string).split("T")[0] ?? new Date().toISOString().split("T")[0]!
          : new Date().toISOString().split("T")[0]!,
        customerEmail: typeof order["email"] === "string" ? order["email"] : null,
        contactName: [firstName, lastName].filter(Boolean).join(" "),
        lineItems,
      },
      "shopify"
    );
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
    logger.error({ err, shop }, "Shopify processInvoice failed");
  }

  if (webhookEvent) {
    await resolveWebhookEvent(webhookEvent.id, errorMsg ? "failed" : "processed", errorMsg).catch(() => {});
  }
}
