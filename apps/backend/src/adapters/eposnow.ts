import type { Request, Response } from "express";

// TODO: Implement EposNow webhook integration when API access is provisioned.
// EposNow sends transaction events via webhook; handler should extract
// receipt total, customer email, and line items then call processReceiptEvent().
export function eposnowWebhookHandler(_req: Request, res: Response): void {
  res.status(501).json({ error: "EposNow integration not yet implemented" });
}
