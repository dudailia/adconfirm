import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { db } from "../modules/db";
import { logger } from "../modules/logger";

const router = Router();

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
        scope: "openid profile email accounting.invoices accounting.invoices.read accounting.contacts accounting.contacts.read accounting.settings accounting.settings.read offline_access",
        state: state,
      });
      const authUrl = `https://login.xero.com/identity/connect/authorize?${params.toString()}`;
      logger.info({ businessId }, "redirecting to Xero consent URL");
      res.redirect(authUrl);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/xero/callback",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.query["code"] as string | undefined;
      const stateParam = req.query["state"] as string | undefined;
      if (!stateParam || !code) {
        res.status(400).json({ error: "missing code or state", code: "MISSING_PARAMS" });
        return;
      }
      let businessId: string;
      try {
        businessId = (
          JSON.parse(Buffer.from(stateParam, "base64url").toString("utf8")) as { businessId: string }
        ).businessId;
      } catch {
        res.status(400).json({ error: "invalid state param", code: "INVALID_STATE" });
        return;
      }
      const tokenResponse = await fetch("https://identity.xero.com/connect/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Basic " + Buffer.from(
            process.env["XERO_CLIENT_ID"]! + ":" + process.env["XERO_CLIENT_SECRET"]!
          ).toString("base64"),
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: process.env["XERO_REDIRECT_URI"]!,
        }).toString(),
      });
      const tokenSet = await tokenResponse.json() as any;
      if (!tokenSet.access_token) {
        logger.error({ tokenSet }, "token exchange failed");
        res.status(500).json({ error: "token exchange failed", code: "TOKEN_FAILED" });
        return;
      }
      const connectionsResponse = await fetch("https://api.xero.com/connections", {
        headers: { "Authorization": `Bearer ${tokenSet.access_token}` },
      });
      const tenants = await connectionsResponse.json() as any[];
      const tenant = tenants[0];
      if (!tenant) {
        res.status(400).json({ error: "no Xero organisation connected", code: "NO_TENANT" });
        return;
      }
      await db
        .from("businesses")
        .update({
          xero_tenant_id: tenant.tenantId,
          xero_access_token: tokenSet.access_token,
          xero_refresh_token: tokenSet.refresh_token ?? null,
          xero_token_expiry: tokenSet.expires_in
            ? new Date(Date.now() + tokenSet.expires_in * 1000).toISOString()
            : null,
        })
        .eq("id", businessId);
      logger.info({ businessId, tenantId: tenant.tenantId }, "Xero OAuth2 connected");
      const dashboardUrl = process.env["DASHBOARD_URL"] ?? "http://localhost:3001";
      res.redirect(`${dashboardUrl}/settings?xero=connected`);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
