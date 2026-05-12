import type { Metadata } from "next";
import { NavigationBar } from "../../components/NavigationBar";
import { FooterBar } from "../../components/FooterBar";
import { PricingPageContent } from "./PricingPageContent";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "AdConfirm is free for businesses — we earn when you earn. Advertisers pay CPM with no minimums. Simple, transparent, aligned.",
  openGraph: {
    title: "AdConfirm Pricing — Free for Businesses, CPM for Advertisers",
    description:
      "Free to join. 70% revenue share for businesses. £0.10 CPM for advertisers. No hidden fees, no lock-in.",
  },
};

export default function PricingPage() {
  return (
    <main style={{ background: "var(--bg)", color: "var(--text-1)" }}>
      <NavigationBar />
      <PricingPageContent />
      <FooterBar />
    </main>
  );
}
