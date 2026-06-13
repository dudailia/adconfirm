import { Router } from "express";
import express from "express";
import { validateXeroWebhook } from "../middleware/validateXeroWebhook";
import { xeroWebhookHandler } from "../adapters/xero";
import { validateQBOWebhook } from "../middleware/validateQBOWebhook";
import { qboWebhookHandler } from "../adapters/quickbooks";
import { validateFreeAgentWebhook } from "../middleware/validateFreeAgentWebhook";
import { faWebhookHandler } from "../adapters/freeagent";
import { validateSquareWebhook } from "../middleware/validateSquareWebhook";
import { squareWebhookHandler } from "../adapters/square";
import { validateShopifyWebhook } from "../middleware/validateShopifyWebhook";
import { shopifyWebhookHandler } from "../adapters/shopify";
import { validateSageWebhook } from "../middleware/validateSageWebhook";
import { sageWebhookHandler } from "../adapters/sage";

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

router.post(
  "/freeagent",
  express.raw({ type: "*/*" }),
  validateFreeAgentWebhook,
  faWebhookHandler
);

router.post("/square", express.raw({ type: "*/*" }), validateSquareWebhook, squareWebhookHandler);
router.post("/shopify", express.raw({ type: "*/*" }), validateShopifyWebhook, shopifyWebhookHandler);
router.post("/sage", express.raw({ type: "*/*" }), validateSageWebhook, sageWebhookHandler);

export default router;
