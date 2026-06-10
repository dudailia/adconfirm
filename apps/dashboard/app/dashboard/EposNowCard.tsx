"use client";

import { useState } from "react";
import { saveEposNowKeyAction, setEposNowEnabledAction } from "./eposNowActions";

interface Props {
  apiKey: string | null;
  enabled: boolean;
}

function maskKey(k: string): string {
  if (k.length <= 8) return "••••••••";
  return k.slice(0, 6) + "••••••••" + k.slice(-4);
}

export function EposNowCard({ apiKey, enabled: initialEnabled }: Props) {
  const [editing, setEditing] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isConnected = Boolean(apiKey);

  async function handleSaveKey(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await saveEposNowKeyAction(keyInput);
    setSaving(false);
    if (!res.ok) { setError(res.message ?? "Save failed."); return; }
    setSuccess(true);
    setEditing(false);
    setKeyInput("");
    setTimeout(() => setSuccess(false), 3000);
  }

  async function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    const res = await setEposNowEnabledAction(next);
    if (!res.ok) { setEnabled(!next); setError(res.message ?? "Toggle failed."); }
  }

  const dot = isConnected ? "#00E5A0" : "#FF3B5C";

  return (
    <div style={{ background: "#0D1629", padding: "24px", borderRadius: "12px", border: "1px solid #1A2540" }}>
      <p style={{ color: "#8A9BC4", fontSize: "14px", marginBottom: "8px" }}>Epos Now</p>

      {/* Status */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: dot, display: "inline-block" }} />
        <span style={{ fontSize: "16px", fontWeight: 600, color: dot }}>
          {isConnected ? "Connected" : "Not connected"}
        </span>
      </div>

      {isConnected && !editing && (
        <p style={{ color: "#8A9BC4", fontSize: "11px", fontFamily: "monospace", marginBottom: "10px" }}>
          {maskKey(apiKey!)}
        </p>
      )}

      {success && (
        <p style={{ color: "#00E5A0", fontSize: "12px", marginBottom: "8px" }}>✓ Saved</p>
      )}
      {error && (
        <p style={{ color: "#FF3B5C", fontSize: "12px", marginBottom: "8px" }}>{error}</p>
      )}

      {/* Key form */}
      {editing ? (
        <form onSubmit={handleSaveKey} style={{ marginBottom: "12px" }}>
          <input
            type="text"
            placeholder="Paste Epos Now API key"
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            required
            style={{
              width: "100%", padding: "8px 10px", background: "#04070F",
              border: "1px solid #1A2540", borderRadius: "6px", color: "white",
              fontSize: "12px", fontFamily: "monospace", boxSizing: "border-box", marginBottom: "8px",
            }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="submit" disabled={saving} style={{
              padding: "6px 14px", background: "#0052FF", color: "white",
              border: "none", borderRadius: "5px", fontSize: "12px", cursor: "pointer",
            }}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => { setEditing(false); setKeyInput(""); }} style={{
              padding: "6px 14px", background: "#1A2540", color: "#8A9BC4",
              border: "none", borderRadius: "5px", fontSize: "12px", cursor: "pointer",
            }}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setEditing(true)} style={{
          padding: "6px 14px", background: isConnected ? "#1A2540" : "#0052FF",
          color: isConnected ? "#8A9BC4" : "white",
          border: "none", borderRadius: "5px", fontSize: "12px", cursor: "pointer", marginBottom: "12px",
        }}>
          {isConnected ? "Update key" : "Connect"}
        </button>
      )}

      {/* Enable toggle — only shown when connected */}
      {isConnected && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={handleToggle}
            style={{
              width: "36px", height: "20px", borderRadius: "10px", border: "none", cursor: "pointer",
              background: enabled ? "#00E5A0" : "#1A2540", position: "relative", transition: "background 0.2s",
            }}
          >
            <span style={{
              position: "absolute", top: "3px", left: enabled ? "18px" : "3px",
              width: "14px", height: "14px", borderRadius: "50%", background: "white", transition: "left 0.2s",
            }} />
          </button>
          <span style={{ color: "#8A9BC4", fontSize: "12px" }}>
            {enabled ? "Polling enabled" : "Polling disabled"}
          </span>
        </div>
      )}
    </div>
  );
}
