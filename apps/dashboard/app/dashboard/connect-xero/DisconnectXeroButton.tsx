"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { disconnectXeroAction } from "./actions";

export function DisconnectXeroButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onDisconnect() {
    setMessage(null);
    setPending(true);
    const res = await disconnectXeroAction();
    setPending(false);
    if (!res.ok) {
      setMessage(res.message ?? "Could not disconnect.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={onDisconnect}
        disabled={pending}
        className="w-full rounded-xl border border-danger/40 bg-danger/10 px-6 py-3 text-sm font-semibold text-danger transition hover:bg-danger/20 disabled:opacity-50"
      >
        {pending ? "Disconnecting…" : "Disconnect"}
      </button>
      {message ? <p className="mt-2 text-sm text-danger">{message}</p> : null}
    </div>
  );
}
