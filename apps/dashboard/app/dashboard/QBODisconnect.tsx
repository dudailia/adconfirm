"use client";

import { useState } from "react";

export function QBODisconnect({ businessId }: { businessId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDisconnect() {
    setLoading(true);
    await fetch(
      `${process.env["NEXT_PUBLIC_API_URL"] ?? "https://adconfirm-api.onrender.com"}/auth/qbo/disconnect`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: businessId }),
      }
    );
    // Full reload to reflect cleared state from server
    window.location.reload();
  }

  return (
    <button
      onClick={handleDisconnect}
      disabled={loading}
      style={{
        display: "inline-block", padding: "8px 14px",
        background: "#1A0D0D", color: "#FF9090",
        borderRadius: "6px", border: "1px solid #3D1515",
        fontSize: "13px", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? "Disconnecting…" : "Disconnect"}
    </button>
  );
}
