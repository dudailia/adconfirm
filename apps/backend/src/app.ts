import cors from "cors";
import express from "express";
import type { Request } from "express";
import { xeroHmacMiddleware } from "./middleware/validateWebhook";
import { errorHandler } from "./middleware/errorHandler";
import { xeroWebhookHandler } from "./adapters/xero";
import { eposnowWebhookHandler } from "./adapters/eposnow";

export function createApp() {
  const app = express();

  // Capture raw body string before JSON parsing — required for Xero HMAC verification
  app.use(
    express.json({
      verify: (req: Request, _res, buf) => {
        (req as Request & { rawBody: string }).rawBody = buf.toString("utf8");
      },
    })
  );
  app.use(cors());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/webhooks/xero", xeroHmacMiddleware, xeroWebhookHandler);
  app.post("/webhooks/eposnow", eposnowWebhookHandler);

  app.use(errorHandler);

  return app;
}
