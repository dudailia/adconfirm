import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { xero } from "../adapters/xero";
import { db } from "../modules/db";
import { logger } from "../modules/logger";

const router = Router();

// GET /auth/xero/connect?business_id=xxx
// Redirects the business to Xero for OAuth2 authorization
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
      const consentUrl = await xero.buildConsentUrl();

      const url = new URL(consentUrl);
      url.searchParams.set("state", state);

      logger.info({ businessId }, "redirecting to Xero consent URL");
      res.redirect(url.toString());
    } catch (err) {
      next(err);
    }
  }
);

// GET /auth/xero/callback?code=xxx&state=xxx
// Xero redirects here after user authorizes
router.get(
  "/xero/callback",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const state = req.query["state"] as string | undefined;
      if (!state) {
        res.status(400).json({ error: "missing state param", code: "MISSING_STATE" });
        return;
      }

      let businessId: string;
      try {
        businessId = (
          JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as { businessId: string }
        ).businessId;
      } catch {
        res.status(400).json({ error: "invalid state param", code: "INVALID_STATE" });
        return;
      }

      const callbackUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
      const tokenSet = await xero.apiCallback(callbackUrl, { checks: { state: state } });

      await xero.updateTenants();
      const tenant = xero.tenants[0];
      if (!tenant) {
        res.status(400).json({ error: "no Xero organisation connected", code: "NO_TENANT" });
        return;
      }

      await db
        .from("businesses")
        .update({
          xero_tenant_id: tenant.tenantId,
          xero_access_token: (tokenSet as any).access_token,
          xero_refresh_token: (tokenSet as any).refresh_token ?? null,
          xero_token_expiry: (tokenSet as any).expires_in
            ? new Date(Date.now() + (tokenSet as any).expires_in * 1000).toISOString()
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
