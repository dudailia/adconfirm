import type { Metadata } from "next";
import { NavigationBar } from "../../components/NavigationBar";
import { FooterBar } from "../../components/FooterBar";
import { HowItWorksContent } from "./HowItWorksContent";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how AdConfirm injects targeted ads into your Xero invoices at the millisecond of generation. Three steps, zero friction.",
  openGraph: {
    title: "How AdConfirm Works — Invoice Advertising Explained",
    description:
      "From Xero invoice creation to ad injection in under 2ms. See the full mechanism.",
  },
};

export default function HowItWorksPage() {
  return (
    <main style={{ background: "var(--bg)", color: "var(--text-1)" }}>
      <NavigationBar />
      <HowItWorksContent />
      <FooterBar />
    </main>
  );
}
