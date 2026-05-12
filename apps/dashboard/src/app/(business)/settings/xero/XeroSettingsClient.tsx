"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "../../../../lib/supabase/client";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";

interface Business {
  id: string;
  name: string;
  xero_tenant_id: string | null;
  xero_token_expiry: string | null;
}

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";

export function XeroSettingsClient({ business }: { business: Business }) {
  const [disconnecting, setDisconnecting] = useState(false);
  const isConnected = !!business.xero_tenant_id;
  const supabase = createClient();

  const handleDisconnect = async () => {
    setDisconnecting(true);
    const { error } = await supabase
      .from("businesses")
      .update({
        xero_tenant_id: null,
        xero_access_token: null,
        xero_refresh_token: null,
        xero_token_expiry: null,
      })
      .eq("id", business.id);
    setDisconnecting(false);
    if (error) {
      toast.error("Failed to disconnect Xero");
    } else {
      toast.success("Xero disconnected");
      window.location.reload();
    }
  };

  return (
    <div className="max-w-lg">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-medium text-white">Xero Account</div>
            <div className="text-xs text-muted-fg mt-0.5">
              {isConnected ? `Tenant ID: ${business.xero_tenant_id}` : "Not connected"}
            </div>
          </div>
          <Badge variant={isConnected ? "connected" : "disconnected"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        {isConnected && business.xero_token_expiry && (
          <div className="text-xs text-muted-fg mb-4">
            Token expires: {new Date(business.xero_token_expiry).toLocaleString("en-GB")}
          </div>
        )}

        <div className="flex gap-3">
          {!isConnected ? (
            <a
              href={`${API_URL}/auth/xero/connect?business_id=${business.id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dim text-white text-sm font-medium rounded-lg transition-colors"
            >
              Connect Xero
            </a>
          ) : (
            <Button variant="danger" loading={disconnecting} onClick={handleDisconnect}>
              Disconnect Xero
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
