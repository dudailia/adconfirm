import { Router } from "express";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { db } from "../modules/db";
import { logger } from "../modules/logger";

const router = Router();

function stripe(): Stripe {
  return new Stripe(process.env["STRIPE_SECRET_KEY"]!, { apiVersion: "2025-05-28.basil" });
}

function dashboardUrl(): string {
  return (process.env["DASHBOARD_URL"] ?? "http://localhost:3001").replace(/\/$/, "");
}

// ─── POST /stripe/create-checkout-session ─────────────────────────────────────

router.post(
  "/create-checkout-session",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { advertiser_id, campaign_id, daily_budget_cents } = req.body as {
        advertiser_id?: string;
        campaign_id?: string;
        daily_budget_cents?: number;
      };

      if (!advertiser_id || !campaign_id || !daily_budget_cents) {
        res.status(400).json({
          error: "advertiser_id, campaign_id, and daily_budget_cents are required",
          code: "MISSING_PARAMS",
        });
        return;
      }

      const { data: advertiser, error: advError } = await db
        .from("advertisers")
        .select("id, name, email, stripe_customer_id")
        .eq("id", advertiser_id)
        .single();

      if (advError || !advertiser) {
        res.status(404).json({ error: "advertiser not found", code: "NOT_FOUND" });
        return;
      }

      const client = stripe();

      let customerId = advertiser.stripe_customer_id;
      if (!customerId) {
        const customer = await client.customers.create({
          email: advertiser.email,
          name: advertiser.name,
          metadata: { advertiser_id },
        });
        customerId = customer.id;

        await db
          .from("advertisers")
          .update({ stripe_customer_id: customerId })
          .eq("id", advertiser_id)
          .then(({ error }) => {
            if (error) logger.warn({ error, advertiser_id }, "failed to persist stripe_customer_id");
          });
      }

      const session = await client.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: { name: "AdConfirm Campaign Budget" },
              unit_amount: daily_budget_cents,
            },
            quantity: 30,
          },
        ],
        metadata: { advertiser_id, campaign_id },
        success_url: `${dashboardUrl()}/advertiser/dashboard?payment=success`,
        cancel_url: `${dashboardUrl()}/advertiser/dashboard?payment=cancelled`,
      });

      logger.info({ advertiser_id, campaign_id, sessionId: session.id }, "Stripe checkout session created");
      res.json({ url: session.url });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /stripe/webhook ──────────────────────────────────────────────────────

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string | undefined;
    const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];

    if (!sig || !webhookSecret) {
      logger.warn("Stripe webhook missing signature or secret");
      res.status(400).send("Missing signature");
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe().webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
    } catch (err) {
      logger.warn({ err }, "Stripe webhook signature verification failed");
      res.status(400).send("Invalid signature");
      return;
    }

    res.status(200).send();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const campaignId = session.metadata?.["campaign_id"];
      const advertiserId = session.metadata?.["advertiser_id"];

      if (!campaignId) {
        logger.warn({ sessionId: session.id }, "Stripe webhook: no campaign_id in metadata");
        return;
      }

      const { error } = await db
        .from("ad_campaigns")
        .update({ stripe_payment_status: "paid" })
        .eq("id", campaignId);

      if (error) {
        logger.error({ error, campaignId }, "failed to update stripe_payment_status to paid");
      } else {
        logger.info({ campaignId, advertiserId, sessionId: session.id }, "campaign marked as paid");
      }
    }
  }
);

export default router;
