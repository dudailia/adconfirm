import { Router } from "express";
import express from "express";
import { validateXeroWebhook } from "../middleware/validateXeroWebhook";
import { xeroWebhookHandler } from "../adapters/xero";

const router = Router();

// express.raw() delivers req.body as Buffer — required for HMAC verification
router.post(
  "/xero",
  express.raw({ type: "*/*" }),
  validateXeroWebhook,
  xeroWebhookHandler
);

export default router;
