import "dotenv/config";
import { createApp } from "./app";
import { logger } from "./modules/logger";

const PORT = process.env["PORT"] ?? "4000";

const REQUIRED_ENV = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_KEY",
  "XERO_CLIENT_ID",
  "XERO_CLIENT_SECRET",
  "XERO_WEBHOOK_KEY",
  "RESEND_API_KEY",
];

const OPTIONAL_ENV = [
  "XERO_REDIRECT_URI",
  "RESEND_FROM_EMAIL",
  "DASHBOARD_URL",
  "LOG_LEVEL",
];

function auditEnv(): void {
  for (const key of REQUIRED_ENV) {
    const present = Boolean(process.env[key]);
    if (!present) {
      logger.warn({ key }, "required env var is MISSING");
    } else {
      logger.info({ key, status: "SET" }, "env check");
    }
  }
  for (const key of OPTIONAL_ENV) {
    logger.info({ key, status: process.env[key] ? "SET" : "not set" }, "env check");
  }
}

const app = createApp();

app.listen(Number(PORT), () => {
  logger.info({ port: PORT }, "adconfirm backend listening");
  auditEnv();
});
