import type { Metadata } from "next";
import { NavigationBar } from "../../components/NavigationBar";
import { FooterBar } from "../../components/FooterBar";
import { BusinessPageContent } from "./BusinessPageContent";

export const metadata: Metadata = {
  title: "For Businesses",
  description:
    "Turn your Xero invoice stack into a media channel. Earn £0.08+ per invoice placement with zero workflow changes. Free to join.",
  openGraph: {
    title: "AdConfirm for Businesses — Turn Invoices Into Revenue",
    description:
      "Your invoices are already doing the hard work. Start getting paid for it. Free to join, 70% revenue share.",
  },
};

export default function ForBusinessesPage() {
  return (
    <main style={{ background: "var(--bg)", color: "var(--text-1)" }}>
      <NavigationBar />
      <BusinessPageContent />
      <FooterBar />
    </main>
  );
}
