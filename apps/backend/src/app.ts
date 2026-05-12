import cors from "cors";
import express from "express";
import pinoHttp from "pino-http";
import { logger } from "./modules/logger";
import healthRouter from "./routes/health";
import webhooksRouter from "./routes/webhooks";
import authRouter from "./routes/auth";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(pinoHttp({ logger }));
  app.use(cors());

  // Parse JSON for all non-webhook routes
  // Webhook routes use express.raw() at the route level for HMAC verification
  app.use((req, _res, next) => {
    if (req.path.startsWith("/webhooks")) {
      next();
    } else {
      express.json()(req, _res, next);
    }
  });

  app.use("/health", healthRouter);
  app.use("/webhooks", webhooksRouter);
  app.use("/auth", authRouter);

  app.use(errorHandler);

  return app;
}
