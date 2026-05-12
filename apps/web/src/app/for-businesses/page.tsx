import type { Metadata } from "next";
import { Navigation } from "../../components/Navigation";
import { Footer } from "../../components/Footer";
import { FinalCTA } from "../../components/sections/FinalCTA";
import { BusinessPageContent } from "./BusinessPageContent";

export const metadata: Metadata = {
  title: "For Businesses",
  description:
    "Turn your invoice stack into a media channel. Earn revenue from every invoice you send, with zero changes to your workflow.",
  openGraph: {
    title: "AdConfirm for Businesses — Turn Invoices Into Revenue",
    description: "Zero-friction invoice advertising. Connect Xero in 60 seconds.",
  },
};

export default function ForBusinessesPage() {
  return (
    <main className="min-h-screen bg-[#050A14]">
      <Navigation />
      <BusinessPageContent />
      <FinalCTA />
      <Footer />
    </main>
  );
}
