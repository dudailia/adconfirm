"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { createClient } from "../../../../../../lib/supabase/client";
import { Input } from "../../../../../../components/ui/Input";
import { Button } from "../../../../../../components/ui/Button";
import { Card } from "../../../../../../components/ui/Card";
import { AdPreview } from "../../../../../../components/AdPreview";

const creativeSchema = z.object({
  headline: z.string().min(1, "Required").max(60, "Max 60 characters"),
  body_text: z.string().max(120, "Max 120 characters").optional(),
  cta_text: z.string().max(30, "Max 30 characters").optional(),
  cta_url: z.string().url("Must be a valid URL"),
});
type CreativeForm = z.infer<typeof creativeSchema>;

export default function CreativePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: campaignId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CreativeForm>({
    resolver: zodResolver(creativeSchema),
    defaultValues: { cta_text: "Learn more" },
  });

  const watchedValues = watch();

  const onSubmit = async (data: CreativeForm) => {
    setLoading(true);
    const { error } = await supabase.from("ad_creatives").insert({
      campaign_id: campaignId,
      headline: data.headline,
      body_text: data.body_text ?? null,
      cta_text: data.cta_text ?? "Learn more",
      cta_url: data.cta_url,
      qr_code_url: null,
      image_url: null,
    });
    if (!error) {
      await supabase
        .from("ad_campaigns")
        .update({ status: "active" })
        .eq("id", campaignId);
      toast.success("Creative saved and campaign activated!");
      router.push(`/advertiser/campaigns/${campaignId}`);
    } else {
      toast.error("Failed to save creative");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Add Creative</h1>
        <p className="text-sm text-muted-fg mt-1">Design the ad that will appear on invoices</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Card>
            <h2 className="text-sm font-medium text-white mb-4">Ad Content</h2>
            <div className="space-y-4">
              <Input
                label={`Headline (${(watchedValues.headline ?? "").length}/60)`}
                placeholder="Save 20% on your next software subscription"
                error={errors.headline?.message}
                {...register("headline")}
              />
              <Input
                label={`Body text (${(watchedValues.body_text ?? "").length}/120, optional)`}
                placeholder="Exclusive offer for invoice recipients"
                error={errors.body_text?.message}
                {...register("body_text")}
              />
              <Input
                label="CTA button text"
                placeholder="Claim Offer"
                error={errors.cta_text?.message}
                {...register("cta_text")}
              />
              <Input
                label="Destination URL"
                type="url"
                placeholder="https://yourwebsite.com/offer"
                error={errors.cta_url?.message}
                {...register("cta_url")}
              />
            </div>
          </Card>
          <div className="flex gap-3">
            <Button type="submit" loading={loading}>Save Creative &amp; Activate</Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>Back</Button>
          </div>
        </form>

        <div>
          <div className="text-xs text-muted-fg uppercase tracking-wider font-mono mb-3">Live Preview</div>
          <AdPreview
            headline={watchedValues.headline ?? ""}
            bodyText={watchedValues.body_text}
            ctaText={watchedValues.cta_text}
            ctaUrl={watchedValues.cta_url ?? ""}
            showQr={!!(watchedValues.cta_url)}
          />
          <p className="text-xs text-muted-fg mt-3">
            UTM params appended automatically: ?utm_source=adconfirm&utm_medium=invoice
          </p>
        </div>
      </div>
    </div>
  );
}
