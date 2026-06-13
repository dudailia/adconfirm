import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { db } from "../modules/db";
import { logger } from "../modules/logger";
import { registerFAWebhook, deleteFAWebhook, resolveFAAccessToken } from "../adapters/freeagent";
import { registerSquareWebhook, deleteSquareWebhook, resolveSquareToken } from "../adapters/square";
import { registerShopifyWebhook, deleteShopifyWebhook } from "../adapters/shopify";

const router = Router();

function dashboardUrl(): string {
  return (process.env["DASHBOARD_URL"] ?? "http://localhost:3001").replace(/\/$/, "");
}

// ─── GET /auth/xero/connect ──────────────────────────────────────────────────

router.get(
  "/xero/connect",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const businessId = req.query["business_id"] as string | undefined;
      if (!businessId) {
        res.status(400).json({ error: "business_id is required", code: "MISSING_BUSINESS_ID" });
        return;
      }
      const state = Buffer.from(JSON.stringify({ businessId })).toString("base64url");
      const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env["XERO_CLIENT_ID"]!,
        redirect_uri: process.env["XERO_REDIRECT_URI"]!,
        scope: [
          "openid", "profile", "email",
          "accounting.invoices", "accounting.invoices.read",
          "accounting.contacts", "accounting.contacts.read",
          "accounting.settings", "accounting.settings.read",
          "offline_access",
        ].join(" "),
        state,
      });
      logger.info({ businessId }, "redirecting to Xero consent URL");
      res.redirect(`https://login.xero.com/identity/connect/authorize?${params}`);
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /auth/xero/callback ─────────────────────────────────────────────────

router.get(
  "/xero/callback",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Xero sends ?error=access_denied when the user cancels
      if (req.query["error"]) {
        logger.warn({ xeroError: req.query["error"] }, "Xero OAuth denied by user");
        return res.redirect(`${dashboardUrl()}/dashboard?xero_error=access_denied`);
      }

      const code = req.query["code"] as string | undefined;
      const stateParam = req.query["state"] as string | undefined;
      if (!stateParam || !code) {
        logger.warn({ query: req.query }, "Xero callback missing code or state");
        return res.redirect(`${dashboardUrl()}/dashboard?xero_error=missing_params`);
      }

      let businessId: string;
      try {
        businessId = (
          JSON.parse(Buffer.from(stateParam, "base64url").toString("utf8")) as { businessId: string }
        ).businessId;
      } catch {
        logger.warn({ stateParam }, "Xero callback invalid state param");
        return res.redirect(`${dashboardUrl()}/dashboard?xero_error=invalid_state`);
      }

      // Exchange code for tokens
      const tokenResponse = await fetch("https://identity.xero.com/connect/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${process.env["XERO_CLIENT_ID"]!}:${process.env["XERO_CLIENT_SECRET"]!}`).toString("base64"),
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: process.env["XERO_REDIRECT_URI"]!,
        }).toString(),
      });

      const tokenSet = (await tokenResponse.json()) as Record<string, unknown>;
      if (!tokenSet["access_token"]) {
        logger.error({ tokenSet, businessId }, "Xero token exchange failed");
        return res.redirect(`${dashboardUrl()}/dashboard?xero_error=token_failed`);
      }

      // Get connected organisations
      const connectionsResponse = await fetch("https://api.xero.com/connections", {
        headers: { Authorization: `Bearer ${String(tokenSet["access_token"])}` },
      });
      const tenants = (await connectionsResponse.json()) as Array<{ tenantId: string; tenantName?: string }>;
      const tenant = tenants[0];
      if (!tenant) {
        logger.warn({ businessId }, "Xero token exchanged but no org connected");
        return res.redirect(`${dashboardUrl()}/dashboard?xero_error=no_org`);
      }

      // Persist tokens
      const { error: dbError } = await db
        .from("businesses")
        .update({
          xero_tenant_id: tenant.tenantId,
          xero_access_token: String(tokenSet["access_token"]),
          xero_refresh_token:
            typeof tokenSet["refresh_token"] === "string" ? tokenSet["refresh_token"] : null,
          xero_token_expiry:
            typeof tokenSet["expires_in"] === "number"
              ? new Date(Date.now() + tokenSet["expires_in"] * 1000).toISOString()
              : null,
        })
        .eq("id", businessId);

      if (dbError) {
        logger.error({ dbError, businessId }, "Supabase update failed after Xero connect");
      } else {
        logger.info({ businessId, tenantId: tenant.tenantId }, "Xero OAuth2 connected");
      }

      res.redirect(`${dashboardUrl()}/dashboard?connected=true`);
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /auth/xero/disconnect ──────────────────────────────────────────────

router.post(
  "/xero/disconnect",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const businessId = req.body?.business_id as string | undefined;
      if (!businessId) {
        res.status(400).json({ error: "business_id is required", code: "MISSING_BUSINESS_ID" });
        return;
      }

      const { error } = await db
        .from("businesses")
        .update({
          xero_tenant_id: null,
          xero_access_token: null,
          xero_refresh_token: null,
          xero_token_expiry: null,
        })
        .eq("id", businessId);

      if (error) {
        logger.error({ error, businessId }, "Xero disconnect DB update failed");
        res.status(500).json({ error: error.message, code: "DB_ERROR" });
        return;
      }

      logger.info({ businessId }, "Xero disconnected");
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /auth/qbo/connect ───────────────────────────────────────────────────

router.get(
  "/qbo/connect",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const businessId = req.query["business_id"] as string | undefined;
      if (!businessId) {
        res.status(400).json({ error: "business_id is required", code: "MISSING_BUSINESS_ID" });
        return;
      }
      const state = Buffer.from(JSON.stringify({ businessId })).toString("base64url");
      const params = new URLSearchParams({
        client_id: process.env["QBO_CLIENT_ID"]!,
        scope: "com.intuit.quickbooks.accounting",
        redirect_uri: process.env["QBO_REDIRECT_URI"]!,
        response_type: "code",
        access_type: "offline",
        state,
      });
      logger.info({ businessId }, "redirecting to QuickBooks consent URL");
      res.redirect(`https://appcenter.intuit.com/connect/oauth2?${params}`);
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /auth/qbo/callback ──────────────────────────────────────────────────

router.get(
  "/qbo/callback",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query["error"]) {
        logger.warn({ qboError: req.query["error"] }, "QBO OAuth denied by user");
        return res.redirect(`${dashboardUrl()}/dashboard?qbo_error=access_denied`);
      }

      const code = req.query["code"] as string | undefined;
      const stateParam = req.query["state"] as string | undefined;
      const realmId = req.query["realmId"] as string | undefined;

      if (!code || !stateParam || !realmId) {
        logger.warn({ query: req.query }, "QBO callback missing required params");
        return res.redirect(`${dashboardUrl()}/dashboard?qbo_error=missing_params`);
      }

      let businessId: string;
      try {
        businessId = (
          JSON.parse(Buffer.from(stateParam, "base64url").toString("utf8")) as { businessId: string }
        ).businessId;
      } catch {
        return res.redirect(`${dashboardUrl()}/dashboard?qbo_error=invalid_state`);
      }

      // Exchange code for tokens
      const tokenResponse = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${process.env["QBO_CLIENT_ID"]!}:${process.env["QBO_CLIENT_SECRET"]!}`).toString("base64"),
          Accept: "application/json",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: process.env["QBO_REDIRECT_URI"]!,
        }).toString(),
      });

      const tokenSet = (await tokenResponse.json()) as Record<string, unknown>;
      if (!tokenSet["access_token"]) {
        logger.error({ tokenSet, businessId }, "QBO token exchange failed");
        return res.redirect(`${dashboardUrl()}/dashboard?qbo_error=token_failed`);
      }

      const { error: dbError } = await db
        .from("businesses")
        .update({
          qbo_realm_id: realmId,
          qbo_tenant_id: realmId,
          qbo_access_token: String(tokenSet["access_token"]),
          qbo_refresh_token:
            typeof tokenSet["refresh_token"] === "string" ? tokenSet["refresh_token"] : null,
          qbo_token_expiry:
            typeof tokenSet["x_refresh_token_expires_in"] === "number"
              ? new Date(Date.now() + (tokenSet["x_refresh_token_expires_in"] as number) * 1000).toISOString()
              : typeof tokenSet["expires_in"] === "number"
                ? new Date(Date.now() + (tokenSet["expires_in"] as number) * 1000).toISOString()
                : null,
        })
        .eq("id", businessId);

      if (dbError) {
        logger.error({ dbError, businessId }, "Supabase update failed after QBO connect");
      } else {
        logger.info({ businessId, realmId }, "QuickBooks Online connected");
      }

      res.redirect(`${dashboardUrl()}/dashboard?qbo_connected=true`);
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /auth/qbo/disconnect ───────────────────────────────────────────────

router.post(
  "/qbo/disconnect",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const businessId = req.body?.business_id as string | undefined;
      if (!businessId) {
        res.status(400).json({ error: "business_id is required", code: "MISSING_BUSINESS_ID" });
        return;
      }

      const { error } = await db
        .from("businesses")
        .update({
          qbo_tenant_id: null,
          qbo_access_token: null,
          qbo_refresh_token: null,
          qbo_token_expiry: null,
          qbo_realm_id: null,
        })
        .eq("id", businessId);

      if (error) {
        logger.error({ error, businessId }, "QBO disconnect DB update failed");
        res.status(500).json({ error: error.message, code: "DB_ERROR" });
        return;
      }

      logger.info({ businessId }, "QuickBooks Online disconnected");
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /auth/freeagent/connect ─────────────────────────────────────────────

router.get(
  "/freeagent/connect",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const businessId = req.query["business_id"] as string | undefined;
      if (!businessId) {
        res.status(400).json({ error: "business_id is required", code: "MISSING_BUSINESS_ID" });
        return;
      }
      const state = Buffer.from(JSON.stringify({ businessId })).toString("base64url");
      const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env["FREEAGENT_CLIENT_ID"]!,
        redirect_uri: process.env["FREEAGENT_REDIRECT_URI"]!,
        state,
      });
      logger.info({ businessId }, "redirecting to FreeAgent consent URL");
      res.redirect(`https://api.freeagent.com/v2/approve_app?${params}`);
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /auth/freeagent/callback ─────────────────────────────────────────────

router.get(
  "/freeagent/callback",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query["error"]) {
        logger.warn({ faError: req.query["error"] }, "FreeAgent OAuth denied by user");
        return res.redirect(`${dashboardUrl()}/dashboard?fa_error=access_denied`);
      }

      const code = req.query["code"] as string | undefined;
      const stateParam = req.query["state"] as string | undefined;
      if (!code || !stateParam) {
        logger.warn({ query: req.query }, "FreeAgent callback missing code or state");
        return res.redirect(`${dashboardUrl()}/dashboard?fa_error=missing_params`);
      }

      let businessId: string;
      try {
        businessId = (
          JSON.parse(Buffer.from(stateParam, "base64url").toString("utf8")) as { businessId: string }
        ).businessId;
      } catch {
        logger.warn({ stateParam }, "FreeAgent callback invalid state param");
        return res.redirect(`${dashboardUrl()}/dashboard?fa_error=invalid_state`);
      }

      // Exchange code for tokens
      const tokenResponse = await fetch("https://api.freeagent.com/v2/token_endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env["FREEAGENT_CLIENT_ID"]!}:${process.env["FREEAGENT_CLIENT_SECRET"]!}`
            ).toString("base64"),
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: process.env["FREEAGENT_REDIRECT_URI"]!,
        }).toString(),
      });

      const tokenSet = (await tokenResponse.json()) as Record<string, unknown>;
      if (!tokenSet["access_token"]) {
        logger.error({ tokenSet, businessId }, "FreeAgent token exchange failed");
        return res.redirect(`${dashboardUrl()}/dashboard?fa_error=token_failed`);
      }

      const accessToken = String(tokenSet["access_token"]);

      // Persist tokens first so we can use resolveFAAccessToken in registerFAWebhook
      const { error: dbError } = await db
        .from("businesses")
        .update({
          fa_access_token: accessToken,
          fa_refresh_token:
            typeof tokenSet["refresh_token"] === "string" ? tokenSet["refresh_token"] : null,
          fa_token_expiry:
            typeof tokenSet["expires_in"] === "number"
              ? new Date(Date.now() + (tokenSet["expires_in"] as number) * 1000).toISOString()
              : null,
        })
        .eq("id", businessId);

      if (dbError) {
        logger.error({ dbError, businessId }, "Supabase update failed after FreeAgent connect");
        return res.redirect(`${dashboardUrl()}/dashboard?fa_error=db_failed`);
      }

      // Register webhook at FreeAgent (best-effort — don't fail connect if this errors)
      const webhookUrl = await registerFAWebhook(accessToken, businessId).catch((err) => {
        logger.warn({ err, businessId }, "FreeAgent webhook registration failed — skipping");
        return null;
      });

      if (webhookUrl) {
        await db
          .from("businesses")
          .update({ fa_webhook_url: webhookUrl })
          .eq("id", businessId)
          .then(({ error }) => {
            if (error) logger.warn({ error, businessId }, "failed to persist fa_webhook_url");
          });
      }

      logger.info({ businessId, webhookUrl }, "FreeAgent connected");
      res.redirect(`${dashboardUrl()}/dashboard?fa_connected=true`);
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /auth/freeagent/disconnect ─────────────────────────────────────────

router.post(
  "/freeagent/disconnect",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const businessId = req.body?.business_id as string | undefined;
      if (!businessId) {
        res.status(400).json({ error: "business_id is required", code: "MISSING_BUSINESS_ID" });
        return;
      }

      // Fetch current tokens to clean up webhook before nulling them
      const { data: business } = await db
        .from("businesses")
        .select("fa_access_token, fa_refresh_token, fa_token_expiry, fa_webhook_url")
        .eq("id", businessId)
        .single();

      if (business?.fa_webhook_url) {
        const accessToken = await resolveFAAccessToken(business as any).catch(() => null);
        if (accessToken) {
          await deleteFAWebhook(accessToken, business.fa_webhook_url).catch(() => {});
        }
      }

      const { error } = await db
        .from("businesses")
        .update({
          fa_access_token: null,
          fa_refresh_token: null,
          fa_token_expiry: null,
          fa_webhook_url: null,
        })
        .eq("id", businessId);

      if (error) {
        logger.error({ error, businessId }, "FreeAgent disconnect DB update failed");
        res.status(500).json({ error: error.message, code: "DB_ERROR" });
        return;
      }

      logger.info({ businessId }, "FreeAgent disconnected");
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /auth/square/connect ─────────────────────────────────────────────────

router.get(
  "/square/connect",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const businessId = req.query["business_id"] as string | undefined;
      if (!businessId) {
        res.status(400).json({ error: "business_id is required", code: "MISSING_BUSINESS_ID" });
        return;
      }
      const state = Buffer.from(JSON.stringify({ businessId })).toString("base64url");
      const params = new URLSearchParams({
        client_id: process.env["SQUARE_APP_ID"]!,
        scope: "MERCHANT_PROFILE_READ PAYMENTS_READ ORDERS_READ CUSTOMERS_READ",
        redirect_uri: process.env["SQUARE_REDIRECT_URI"]!,
        response_type: "code",
        state,
        session: "false",
      });
      logger.info({ businessId }, "redirecting to Square consent URL");
      res.redirect(`https://connect.squareup.com/oauth2/authorize?${params}`);
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /auth/square/callback ────────────────────────────────────────────────

router.get(
  "/square/callback",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query["error"]) {
        logger.warn({ squareError: req.query["error"] }, "Square OAuth denied by user");
        return res.redirect(`${dashboardUrl()}/dashboard?square_error=access_denied`);
      }

      const code = req.query["code"] as string | undefined;
      const stateParam = req.query["state"] as string | undefined;
      if (!code || !stateParam) {
        logger.warn({ query: req.query }, "Square callback missing code or state");
        return res.redirect(`${dashboardUrl()}/dashboard?square_error=missing_params`);
      }

      let businessId: string;
      try {
        businessId = (
          JSON.parse(Buffer.from(stateParam, "base64url").toString("utf8")) as { businessId: string }
        ).businessId;
      } catch {
        logger.warn({ stateParam }, "Square callback invalid state param");
        return res.redirect(`${dashboardUrl()}/dashboard?square_error=invalid_state`);
      }

      const tokenResponse = await fetch("https://connect.squareup.com/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            Buffer.from(`${process.env["SQUARE_APP_ID"]!}:${process.env["SQUARE_APP_SECRET"]!}`).toString("base64"),
        },
        body: JSON.stringify({
          client_id: process.env["SQUARE_APP_ID"]!,
          client_secret: process.env["SQUARE_APP_SECRET"]!,
          code,
          grant_type: "authorization_code",
          redirect_uri: process.env["SQUARE_REDIRECT_URI"]!,
        }),
      });

      const tokenSet = (await tokenResponse.json()) as Record<string, unknown>;
      if (!tokenSet["access_token"]) {
        logger.error({ tokenSet, businessId }, "Square token exchange failed");
        return res.redirect(`${dashboardUrl()}/dashboard?square_error=token_failed`);
      }

      const accessToken = String(tokenSet["access_token"]);
      const merchantId = typeof tokenSet["merchant_id"] === "string" ? tokenSet["merchant_id"] : null;

      const { error: dbError } = await db
        .from("businesses")
        .update({
          square_merchant_id: merchantId,
          square_access_token: accessToken,
          square_refresh_token:
            typeof tokenSet["refresh_token"] === "string" ? tokenSet["refresh_token"] : null,
          square_token_expiry:
            typeof tokenSet["expires_at"] === "string"
              ? tokenSet["expires_at"]
              : typeof tokenSet["expires_in"] === "number"
                ? new Date(Date.now() + (tokenSet["expires_in"] as number) * 1000).toISOString()
                : null,
        })
        .eq("id", businessId);

      if (dbError) {
        logger.error({ dbError, businessId }, "Supabase update failed after Square connect");
        return res.redirect(`${dashboardUrl()}/dashboard?square_error=db_failed`);
      }

      const subscriptionId = await registerSquareWebhook(accessToken, businessId).catch((err) => {
        logger.warn({ err, businessId }, "Square webhook registration failed — skipping");
        return null;
      });

      if (subscriptionId) {
        await db
          .from("businesses")
          .update({ square_webhook_id: subscriptionId })
          .eq("id", businessId)
          .then(({ error }) => {
            if (error) logger.warn({ error, businessId }, "failed to persist square_webhook_id");
          });
      }

      logger.info({ businessId, merchantId, subscriptionId }, "Square connected");
      res.redirect(`${dashboardUrl()}/dashboard?square_connected=true`);
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /auth/square/disconnect ─────────────────────────────────────────────

router.post(
  "/square/disconnect",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const businessId = req.body?.business_id as string | undefined;
      if (!businessId) {
        res.status(400).json({ error: "business_id is required", code: "MISSING_BUSINESS_ID" });
        return;
      }

      const { data: business } = await db
        .from("businesses")
        .select("square_access_token, square_refresh_token, square_token_expiry, square_webhook_id, square_merchant_id")
        .eq("id", businessId)
        .single();

      if (business?.square_webhook_id && business.square_access_token) {
        const accessToken = await resolveSquareToken(business as any).catch(() => null);
        if (accessToken) {
          await deleteSquareWebhook(accessToken, business.square_webhook_id).catch(() => {});
        }
      }

      if (business?.square_access_token) {
        await fetch("https://connect.squareup.com/oauth2/revoke", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Basic " +
              Buffer.from(`${process.env["SQUARE_APP_ID"]!}:${process.env["SQUARE_APP_SECRET"]!}`).toString("base64"),
          },
          body: JSON.stringify({
            client_id: process.env["SQUARE_APP_ID"]!,
            access_token: business.square_access_token,
            revoke_only_access_token: false,
          }),
        }).catch((err) => logger.warn({ err, businessId }, "Square token revoke request failed"));
      }

      const { error } = await db
        .from("businesses")
        .update({
          square_merchant_id: null,
          square_access_token: null,
          square_refresh_token: null,
          square_token_expiry: null,
          square_webhook_id: null,
        })
        .eq("id", businessId);

      if (error) {
        logger.error({ error, businessId }, "Square disconnect DB update failed");
        res.status(500).json({ error: error.message, code: "DB_ERROR" });
        return;
      }

      logger.info({ businessId }, "Square disconnected");
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /auth/shopify/connect ────────────────────────────────────────────────
// Shopify OAuth begins with the merchant's myshopify.com domain

router.get(
  "/shopify/connect",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const businessId = req.query["business_id"] as string | undefined;
      const shop = req.query["shop"] as string | undefined;
      if (!businessId || !shop) {
        res.status(400).json({ error: "business_id and shop are required", code: "MISSING_PARAMS" });
        return;
      }
      const cleanShop = shop.replace(/https?:\/\//, "").replace(/\/$/, "");
      const state = Buffer.from(JSON.stringify({ businessId, shop: cleanShop })).toString("base64url");
      const params = new URLSearchParams({
        client_id: process.env["SHOPIFY_API_KEY"]!,
        scope: "read_orders,read_customers",
        redirect_uri: process.env["SHOPIFY_REDIRECT_URI"]!,
        state,
      });
      logger.info({ businessId, shop: cleanShop }, "redirecting to Shopify consent URL");
      res.redirect(`https://${cleanShop}/admin/oauth/authorize?${params}`);
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /auth/shopify/callback ───────────────────────────────────────────────

router.get(
  "/shopify/callback",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query["error"]) {
        logger.warn({ shopifyError: req.query["error"] }, "Shopify OAuth denied by user");
        return res.redirect(`${dashboardUrl()}/dashboard?shopify_error=access_denied`);
      }

      const code = req.query["code"] as string | undefined;
      const stateParam = req.query["state"] as string | undefined;
      if (!code || !stateParam) {
        logger.warn({ query: req.query }, "Shopify callback missing code or state");
        return res.redirect(`${dashboardUrl()}/dashboard?shopify_error=missing_params`);
      }

      let businessId: string;
      let shop: string;
      try {
        const parsed = JSON.parse(Buffer.from(stateParam, "base64url").toString("utf8")) as {
          businessId: string;
          shop: string;
        };
        businessId = parsed.businessId;
        shop = parsed.shop;
      } catch {
        logger.warn({ stateParam }, "Shopify callback invalid state param");
        return res.redirect(`${dashboardUrl()}/dashboard?shopify_error=invalid_state`);
      }

      const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: process.env["SHOPIFY_API_KEY"]!,
          client_secret: process.env["SHOPIFY_API_SECRET"]!,
          code,
        }),
      });

      const tokenSet = (await tokenResponse.json()) as Record<string, unknown>;
      if (!tokenSet["access_token"]) {
        logger.error({ tokenSet, businessId, shop }, "Shopify token exchange failed");
        return res.redirect(`${dashboardUrl()}/dashboard?shopify_error=token_failed`);
      }

      const accessToken = String(tokenSet["access_token"]);

      const { error: dbError } = await db
        .from("businesses")
        .update({
          shopify_shop: shop,
          shopify_access_token: accessToken,
        })
        .eq("id", businessId);

      if (dbError) {
        logger.error({ dbError, businessId, shop }, "Supabase update failed after Shopify connect");
        return res.redirect(`${dashboardUrl()}/dashboard?shopify_error=db_failed`);
      }

      const webhookId = await registerShopifyWebhook(shop, accessToken).catch((err) => {
        logger.warn({ err, businessId, shop }, "Shopify webhook registration failed — skipping");
        return null;
      });

      if (webhookId) {
        await db
          .from("businesses")
          .update({ shopify_webhook_id: webhookId })
          .eq("id", businessId)
          .then(({ error }) => {
            if (error) logger.warn({ error, businessId }, "failed to persist shopify_webhook_id");
          });
      }

      logger.info({ businessId, shop, webhookId }, "Shopify connected");
      res.redirect(`${dashboardUrl()}/dashboard?shopify_connected=true`);
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /auth/shopify/disconnect ────────────────────────────────────────────

router.post(
  "/shopify/disconnect",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const businessId = req.body?.business_id as string | undefined;
      if (!businessId) {
        res.status(400).json({ error: "business_id is required", code: "MISSING_BUSINESS_ID" });
        return;
      }

      const { data: business } = await db
        .from("businesses")
        .select("shopify_shop, shopify_access_token, shopify_webhook_id")
        .eq("id", businessId)
        .single();

      if (business?.shopify_shop && business.shopify_access_token && business.shopify_webhook_id) {
        await deleteShopifyWebhook(
          business.shopify_shop,
          business.shopify_access_token,
          business.shopify_webhook_id
        ).catch(() => {});
      }

      const { error } = await db
        .from("businesses")
        .update({
          shopify_shop: null,
          shopify_access_token: null,
          shopify_webhook_id: null,
        })
        .eq("id", businessId);

      if (error) {
        logger.error({ error, businessId }, "Shopify disconnect DB update failed");
        res.status(500).json({ error: error.message, code: "DB_ERROR" });
        return;
      }

      logger.info({ businessId }, "Shopify disconnected");
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
