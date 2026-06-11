import { Router } from "express";
import express from "express";
import { validateXeroWebhook } from "../middleware/validateXeroWebhook";
import { xeroWebhookHandler } from "../adapters/xero";
import { validateQBOWebhook } from "../middleware/validateQBOWebhook";
import { qboWebhookHandler } from "../adapters/quickbooks";

const router = Router();

// express.raw() delivers req.body as Buffer — required for HMAC verification
router.post(
  "/xero",
  express.raw({ type: "*/*" }),
  validateXeroWebhook,
  xeroWebhookHandler
);

router.post(
  "/quickbooks",
  express.raw({ type: "*/*" }),
  validateQBOWebhook,
  qboWebhookHandler
);

export default router;
