import type { Metadata } from "next";
import { Navigation } from "../../components/Navigation";
import { Footer } from "../../components/Footer";
import { FinalCTA } from "../../components/sections/FinalCTA";
import { PricingPageContent } from "./PricingPageContent";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free for businesses. CPM-based for advertisers. No hidden fees, no lock-in.",
  openGraph: {
    title: "AdConfirm Pricing — Free for Businesses, CPM for Advertisers",
    description: "Simple, transparent pricing with no hidden fees.",
  },
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#050A14]">
      <Navigation />
      <PricingPageContent />
      <FinalCTA />
      <Footer />
    </main>
  );
}
