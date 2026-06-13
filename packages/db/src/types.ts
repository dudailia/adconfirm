export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          name: string;
          email: string;
          created_at: string;
          xero_tenant_id: string | null;
          xero_access_token: string | null;
          xero_refresh_token: string | null;
          xero_token_expiry: string | null;
          eposnow_api_key: string | null;
          eposnow_enabled: boolean;
          qbo_tenant_id: string | null;
          qbo_access_token: string | null;
          qbo_refresh_token: string | null;
          qbo_token_expiry: string | null;
          qbo_realm_id: string | null;
          fa_access_token: string | null;
          fa_refresh_token: string | null;
          fa_token_expiry: string | null;
          fa_webhook_url: string | null;
          square_merchant_id: string | null;
          square_access_token: string | null;
          square_refresh_token: string | null;
          square_token_expiry: string | null;
          square_webhook_id: string | null;
          shopify_shop: string | null;
          shopify_access_token: string | null;
          shopify_webhook_id: string | null;
          sage_access_token: string | null;
          sage_refresh_token: string | null;
          sage_token_expiry: string | null;
          sage_business_id: string | null;
          sage_webhook_id: string | null;
          stripe_customer_id: string | null;
          plan: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          created_at?: string;
          xero_tenant_id?: string | null;
          xero_access_token?: string | null;
          xero_refresh_token?: string | null;
          xero_token_expiry?: string | null;
          eposnow_api_key?: string | null;
          eposnow_enabled?: boolean;
          qbo_tenant_id?: string | null;
          qbo_access_token?: string | null;
          qbo_refresh_token?: string | null;
          qbo_token_expiry?: string | null;
          qbo_realm_id?: string | null;
          fa_access_token?: string | null;
          fa_refresh_token?: string | null;
          fa_token_expiry?: string | null;
          fa_webhook_url?: string | null;
          square_merchant_id?: string | null;
          square_access_token?: string | null;
          square_refresh_token?: string | null;
          square_token_expiry?: string | null;
          square_webhook_id?: string | null;
          shopify_shop?: string | null;
          shopify_access_token?: string | null;
          shopify_webhook_id?: string | null;
          sage_access_token?: string | null;
          sage_refresh_token?: string | null;
          sage_token_expiry?: string | null;
          sage_business_id?: string | null;
          sage_webhook_id?: string | null;
          stripe_customer_id?: string | null;
          plan?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          created_at?: string;
          xero_tenant_id?: string | null;
          xero_access_token?: string | null;
          xero_refresh_token?: string | null;
          xero_token_expiry?: string | null;
          eposnow_api_key?: string | null;
          eposnow_enabled?: boolean;
          qbo_tenant_id?: string | null;
          qbo_access_token?: string | null;
          qbo_refresh_token?: string | null;
          qbo_token_expiry?: string | null;
          qbo_realm_id?: string | null;
          fa_access_token?: string | null;
          fa_refresh_token?: string | null;
          fa_token_expiry?: string | null;
          fa_webhook_url?: string | null;
          square_merchant_id?: string | null;
          square_access_token?: string | null;
          square_refresh_token?: string | null;
          square_token_expiry?: string | null;
          square_webhook_id?: string | null;
          shopify_shop?: string | null;
          shopify_access_token?: string | null;
          shopify_webhook_id?: string | null;
          sage_access_token?: string | null;
          sage_refresh_token?: string | null;
          sage_token_expiry?: string | null;
          sage_business_id?: string | null;
          sage_webhook_id?: string | null;
          stripe_customer_id?: string | null;
          plan?: string;
        };
        Relationships: [];
      };

      advertisers: {
        Row: {
          id: string;
          name: string;
          email: string;
          website_url: string;
          logo_url: string;
          stripe_customer_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          website_url: string;
          logo_url: string;
          stripe_customer_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          website_url?: string;
          logo_url?: string;
          stripe_customer_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      advertiser_billing_interest: {
        Row: {
          id: string;
          advertiser_id: string;
          contact_email: string;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          advertiser_id: string;
          contact_email: string;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          advertiser_id?: string;
          contact_email?: string;
          submitted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "advertiser_billing_interest_advertiser_id_fkey";
            columns: ["advertiser_id"];
            isOneToOne: false;
            referencedRelation: "advertisers";
            referencedColumns: ["id"];
          },
        ];
      };

      ad_spend_daily: {
        Row: {
          id: string;
          campaign_id: string;
          date: string;
          impressions: number;
          spend_cents: number;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          date?: string;
          impressions?: number;
          spend_cents?: number;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          date?: string;
          impressions?: number;
          spend_cents?: number;
        };
        Relationships: [
          {
            foreignKeyName: "ad_spend_daily_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "ad_campaigns";
            referencedColumns: ["id"];
          },
        ];
      };

      ad_campaigns: {
        Row: {
          id: string;
          advertiser_id: string;
          title: string;
          status: "draft" | "active" | "paused" | "ended";
          budget_cents: number;
          spent_cents: number;
          start_date: string;
          end_date: string | null;
          target_industries: string[];
          target_regions: string[];
          created_at: string;
          daily_budget_cents: number;
        };
        Insert: {
          id?: string;
          advertiser_id: string;
          title: string;
          status: "draft" | "active" | "paused" | "ended";
          budget_cents: number;
          spent_cents?: number;
          start_date: string;
          end_date?: string | null;
          target_industries?: string[];
          target_regions?: string[];
          created_at?: string;
          daily_budget_cents?: number;
        };
        Update: {
          id?: string;
          advertiser_id?: string;
          title?: string;
          status?: "draft" | "active" | "paused" | "ended";
          budget_cents?: number;
          spent_cents?: number;
          start_date?: string;
          end_date?: string | null;
          target_industries?: string[];
          target_regions?: string[];
          created_at?: string;
          daily_budget_cents?: number;
        };
        Relationships: [
          {
            foreignKeyName: "ad_campaigns_advertiser_id_fkey";
            columns: ["advertiser_id"];
            isOneToOne: false;
            referencedRelation: "advertisers";
            referencedColumns: ["id"];
          },
        ];
      };

      ad_creatives: {
        Row: {
          id: string;
          campaign_id: string;
          headline: string;
          body_text: string | null;
          cta_text: string | null;
          cta_url: string;
          qr_code_url: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          headline: string;
          body_text?: string | null;
          cta_text?: string | null;
          cta_url: string;
          qr_code_url?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          headline?: string;
          body_text?: string | null;
          cta_text?: string | null;
          cta_url?: string;
          qr_code_url?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ad_creatives_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "ad_campaigns";
            referencedColumns: ["id"];
          },
        ];
      };

      business_ad_settings: {
        Row: {
          id: string;
          business_id: string;
          enabled: boolean;
          placement: string;
          max_ads_per_receipt: number;
          allowed_categories: string[];
        };
        Insert: {
          id?: string;
          business_id: string;
          enabled?: boolean;
          placement?: string;
          max_ads_per_receipt?: number;
          allowed_categories?: string[];
        };
        Update: {
          id?: string;
          business_id?: string;
          enabled?: boolean;
          placement?: string;
          max_ads_per_receipt?: number;
          allowed_categories?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "business_ad_settings_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: true;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };

      webhook_events: {
        Row: {
          id: string;
          source: string;
          payload: Json;
          status: string;
          error: string | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          source: string;
          payload: Json;
          status?: string;
          error?: string | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          source?: string;
          payload?: Json;
          status?: string;
          error?: string | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      receipts: {
        Row: {
          id: string;
          business_id: string;
          external_id: string;
          channel: "xero" | "eposnow" | "shopify" | "manual" | "quickbooks" | "freeagent" | "square" | "sage";
          document_type: "invoice" | "receipt" | "purchase_order";
          customer_email: string | null;
          total_cents: number;
          currency: string;
          issued_at: string;
          created_at: string;
          email_failed: boolean;
        };
        Insert: {
          id?: string;
          business_id: string;
          external_id: string;
          channel: "xero" | "eposnow" | "shopify" | "manual" | "quickbooks" | "freeagent" | "square" | "sage";
          document_type: "invoice" | "receipt" | "purchase_order";
          customer_email?: string | null;
          total_cents: number;
          currency: string;
          issued_at: string;
          created_at?: string;
          email_failed?: boolean;
        };
        Update: {
          id?: string;
          business_id?: string;
          external_id?: string;
          channel?: "xero" | "eposnow" | "shopify" | "manual" | "quickbooks" | "freeagent" | "square";
          document_type?: "invoice" | "receipt" | "purchase_order";
          customer_email?: string | null;
          total_cents?: number;
          currency?: string;
          issued_at?: string;
          created_at?: string;
          email_failed?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "receipts_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };

      receipt_ad_placements: {
        Row: {
          id: string;
          receipt_id: string;
          ad_creative_id: string;
          injected_at: string;
          injection_unix_ms: number;
          position_index: number;
          delivered: boolean;
          delivery_channel: string | null;
        };
        Insert: {
          id?: string;
          receipt_id: string;
          ad_creative_id: string;
          injected_at: string;
          injection_unix_ms: number;
          position_index?: number;
          delivered?: boolean;
          delivery_channel?: string | null;
        };
        Update: {
          id?: string;
          receipt_id?: string;
          ad_creative_id?: string;
          injected_at?: string;
          injection_unix_ms?: number;
          position_index?: number;
          delivered?: boolean;
          delivery_channel?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "receipt_ad_placements_receipt_id_fkey";
            columns: ["receipt_id"];
            isOneToOne: false;
            referencedRelation: "receipts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "receipt_ad_placements_ad_creative_id_fkey";
            columns: ["ad_creative_id"];
            isOneToOne: false;
            referencedRelation: "ad_creatives";
            referencedColumns: ["id"];
          },
        ];
      };

      ad_events: {
        Row: {
          id: string;
          placement_id: string;
          event_type: "impression" | "click" | "scan";
          occurred_at: string;
          ip_hash: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          placement_id: string;
          event_type: "impression" | "click" | "scan";
          occurred_at?: string;
          ip_hash?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          placement_id?: string;
          event_type?: "impression" | "click" | "scan";
          occurred_at?: string;
          ip_hash?: string | null;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ad_events_placement_id_fkey";
            columns: ["placement_id"];
            isOneToOne: false;
            referencedRelation: "receipt_ad_placements";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
