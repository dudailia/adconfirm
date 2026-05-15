import { getBusinessesWithEposNow } from "../../../../packages/db/dist/index";
import { logger } from "../modules/logger";
import { db } from "../modules/db";
import { processInvoice, type InvoiceData } from "../modules/processor";
import type { Database } from "../../../../packages/db/dist/index";

type BusinessRow = Database["public"]["Tables"]["businesses"]["Row"];

const EPOS_BASE = "https://api.eposnowhq.com";

function pollingIntervalMs(): number {
  const raw = process.env["EPOSNOW_POLLING_INTERVAL_MS"];
  if (!raw) return 60_000;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 5_000) {
    logger.warn({ raw }, "EPOSNOW_POLLING_INTERVAL_MS invalid; using 60000");
    return 60_000;
  }
  return n;
}

async function eposFetchJson(
  path: string,
  apiKey: string
): Promise<any> {
  const url = `${EPOS_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });
  const body = (await res.json()) as any;
  if (!res.ok) {
    logger.warn(
      { status: res.status, path, message: body?.Message ?? body?.message },
      "Epos Now API request failed"
    );
    throw new Error(`Epos Now API ${res.status} for ${path}`);
  }
  return body;
}

function extractTransactionList(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.Data)) return payload.Data;
  if (payload && Array.isArray(payload.Transactions)) return payload.Transactions;
  if (payload && Array.isArray(payload.Items)) return payload.Items;
  return [];
}

function unwrapTransactionDetail(detail: any, summary: any): any {
  if (!detail || typeof detail !== "object") return summary;
  if (detail.Id != null || detail.id != null) return detail;
  const nested = detail.Data ?? detail.Transactions ?? detail.Transaction;
  if (Array.isArray(nested) && nested[0]) return nested[0];
  if (nested && typeof nested === "object") return nested;
  return summary;
}

function transactionId(tx: any): number | null {
  const id = tx?.Id ?? tx?.id;
  if (typeof id === "number" && Number.isFinite(id)) return id;
  if (typeof id === "string") {
    const n = parseInt(id, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function transactionDateCreated(tx: any): Date | null {
  const raw = tx?.DateCreated ?? tx?.dateCreated;
  if (raw == null) return null;
  const d = new Date(raw as string | number | Date);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isWithinLastMinutes(created: Date, minutes: number): boolean {
  const threshold = Date.now() - minutes * 60 * 1000;
  return created.getTime() >= threshold;
}

function buildContactName(tx: any): string {
  const c = tx?.Customer ?? tx?.customer;
  const first = String(c?.Firstname ?? c?.FirstName ?? "").trim();
  const last = String(c?.Lastname ?? c?.LastName ?? "").trim();
  const combined = [first, last].filter(Boolean).join(" ").trim();
  return combined || "Customer";
}

function buildInvoiceDataFromTransaction(
  tx: any,
  business: BusinessRow
): InvoiceData {
  const id = transactionId(tx);
  const idStr = id != null ? String(id) : "unknown";
  const created = transactionDateCreated(tx) ?? new Date();
  const dateStr = created.toISOString().split("T")[0]!;

  const itemsRaw: any[] = Array.isArray(tx?.TransactionItems)
    ? tx.TransactionItems
    : Array.isArray(tx?.transactionItems)
      ? tx.transactionItems
      : [];

  const lineItems = itemsRaw.map((item: any) => {
    const qty = Number(item?.Quantity ?? item?.quantity ?? 0);
    const unit = Number(item?.UnitPrice ?? item?.unitPrice ?? 0);
    const desc = String(item?.ProductName ?? item?.productName ?? "Item");
    return {
      description: desc,
      quantity: Number.isFinite(qty) ? qty : 0,
      unitAmount: Number.isFinite(unit) ? unit : 0,
      lineAmount: Number.isFinite(qty) && Number.isFinite(unit) ? unit * qty : 0,
    };
  });

  const c = tx?.Customer ?? tx?.customer;
  const emailRaw = c?.Email ?? c?.email;
  const customerEmail =
    typeof emailRaw === "string" && emailRaw.trim() !== "" ? emailRaw.trim() : null;

  const totalRaw = tx?.TotalAmount ?? tx?.totalAmount ?? tx?.Total ?? tx?.total;
  const total = typeof totalRaw === "number" ? totalRaw : Number(totalRaw) || 0;

  return {
    invoiceId: idStr,
    tenantId: business.id,
    invoiceNumber: idStr,
    customerEmail,
    contactName: buildContactName(tx),
    total,
    currency: "GBP",
    date: dateStr,
    lineItems,
  };
}

export async function pollEposNowBusiness(business: BusinessRow): Promise<void> {
  const apiKey = business.eposnow_api_key;
  if (!apiKey) return;

  const listPath =
    "/api/v4/Transaction?OrderBy=DateCreated&OrderByDescending=true&Count=10";
  let listPayload: any;
  try {
    listPayload = await eposFetchJson(listPath, apiKey);
  } catch (err) {
    logger.error({ err, businessId: business.id }, "pollEposNowBusiness: list fetch failed");
    return;
  }

  const candidates = extractTransactionList(listPayload);

  for (const summary of candidates) {
    const created = transactionDateCreated(summary);
    if (!created || !isWithinLastMinutes(created, 2)) {
      continue;
    }

    const id = transactionId(summary);
    if (id == null) continue;

    let detail: any;
    try {
      detail = await eposFetchJson(`/api/v4/Transaction/${id}`, apiKey);
    } catch (err) {
      logger.error(
        { err, businessId: business.id, transactionId: id },
        "pollEposNowBusiness: detail fetch failed"
      );
      continue;
    }

    const rawDetail = unwrapTransactionDetail(detail, summary);
    const invoiceData = buildInvoiceDataFromTransaction(rawDetail, business);

    try {
      await processInvoice(business, invoiceData, "eposnow");
      logger.info(
        { businessId: business.id, transactionId: id },
        "Epos Now transaction processed via processInvoice"
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("duplicate") || msg.includes("idx_receipts_business_external")) {
        logger.info(
          { businessId: business.id, transactionId: id },
          "Epos Now transaction already processed — skipping duplicate"
        );
        continue;
      }
      logger.error(
        { err, businessId: business.id, transactionId: id },
        "pollEposNowBusiness: processInvoice failed"
      );
    }
  }
}

async function eposNowPollingTick(): Promise<void> {
  const businesses = await getBusinessesWithEposNow(db);
  for (const row of businesses) {
    try {
      await pollEposNowBusiness(row);
    } catch (err) {
      logger.error({ err, businessId: row.id }, "pollEposNowBusiness threw");
    }
  }
}

export function startEposNowPolling(): void {
  const ms = pollingIntervalMs();

  void eposNowPollingTick().catch((err) => {
    logger.error({ err }, "Epos Now initial polling tick failed");
  });

  setInterval(() => {
    void eposNowPollingTick().catch((err) => {
      logger.error({ err }, "Epos Now polling tick failed");
    });
  }, ms);
}
