import type { Metadata } from "next";
import { Navigation } from "../../components/Navigation";
import { Footer } from "../../components/Footer";
import { FinalCTA } from "../../components/sections/FinalCTA";
import { AdvertiserPageContent } from "./AdvertiserPageContent";

export const metadata: Metadata = {
  title: "For Advertisers",
  description:
    "Reach B2B customers at the highest-intent moment: the invoice. CPM pricing, no minimums, verified business audience.",
  openGraph: {
    title: "AdConfirm for Advertisers — Reach Buyers at Purchase Moment",
    description: "Invoice advertising. 40%+ open rates. Purchase intent verified.",
  },
};

export default function ForAdvertisersPage() {
  return (
    <main className="min-h-screen bg-[#050A14]">
      <Navigation />
      <AdvertiserPageContent />
      <FinalCTA />
      <Footer />
    </main>
  );
}
