import type { Metadata } from "next";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { Hero } from "../components/sections/Hero";
import { HowItWorks } from "../components/sections/HowItWorks";
import { Stats } from "../components/sections/Stats";
import { ForBusinesses } from "../components/sections/ForBusinesses";
import { ForAdvertisers } from "../components/sections/ForAdvertisers";
import { PricingPreview } from "../components/sections/PricingPreview";
import { FinalCTA } from "../components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "AdConfirm — Invoice Advertising Network",
  description:
    "Turn your invoices into a revenue channel. AdConfirm places targeted ads on the invoices you already send. Earn per placement. Zero friction.",
  openGraph: {
    title: "AdConfirm — Invoice Advertising Network",
    description: "Your invoices. Now generating revenue.",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050A14]">
      <Navigation />
      <Hero />
      <HowItWorks />
      <Stats />
      <ForBusinesses />
      <ForAdvertisers />
      <PricingPreview />
      <FinalCTA />
      <Footer />
    </main>
  );
}
