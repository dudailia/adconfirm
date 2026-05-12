import pino from "pino";

export const logger = pino({
  level: process.env["LOG_LEVEL"] ?? "info",
  base: { service: "adconfirm-backend" },
});

export function childLogger(requestId: string) {
  return logger.child({ requestId });
}
