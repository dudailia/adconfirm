import type { Metadata } from "next";
import { NavigationBar } from "../../components/NavigationBar";
import { FooterBar } from "../../components/FooterBar";
import { AdvertiserPageContent } from "./AdvertiserPageContent";

export const metadata: Metadata = {
  title: "For Advertisers",
  description:
    "Place targeted ads on B2B invoices at the moment of purchase. 40%+ open rates, CPM pricing, no minimums. Reach buyers when they spend.",
  openGraph: {
    title: "AdConfirm for Advertisers — The Highest-Intent B2B Ad Placement",
    description:
      "Your ad appears on an invoice — the one document every recipient reads completely. 40%+ open rate. CPM pricing, no minimums.",
  },
};

export default function ForAdvertisersPage() {
  return (
    <main style={{ background: "var(--bg)", color: "var(--text-1)" }}>
      <NavigationBar />
      <AdvertiserPageContent />
      <FooterBar />
    </main>
  );
}
