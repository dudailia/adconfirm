import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifyXeroHmac } from "../middleware/validateWebhook";

const KEY = "test-webhook-signing-key";
const PAYLOAD = JSON.stringify({ events: [] });

function sign(payload: string, key: string): string {
  return crypto.createHmac("sha256", key).update(payload, "utf8").digest("base64");
}

describe("verifyXeroHmac", () => {
  it("returns true for a valid signature", () => {
    expect(verifyXeroHmac(PAYLOAD, sign(PAYLOAD, KEY), KEY)).toBe(true);
  });

  it("returns false for a tampered payload", () => {
    expect(verifyXeroHmac("tampered_payload", sign(PAYLOAD, KEY), KEY)).toBe(false);
  });

  it("returns false for a wrong signing key", () => {
    expect(verifyXeroHmac(PAYLOAD, sign(PAYLOAD, "wrong-key"), KEY)).toBe(false);
  });
});
