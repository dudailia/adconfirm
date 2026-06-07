import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { getFailedWebhookEvents } from "../modules/db";

const router = Router();

router.get(
  "/failed-webhooks",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const events = await getFailedWebhookEvents();
      res.json({ count: events.length, events });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
