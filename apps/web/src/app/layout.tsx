import type { Metadata } from "next";
import { Playfair_Display, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { LenisProvider } from "../components/providers/LenisProvider";
import { CustomCursor } from "../components/ui/CustomCursor";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const ibmPlex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AdConfirm — Invoice Advertising Network",
    template: "%s | AdConfirm",
  },
  description:
    "AdConfirm injects targeted ads into invoices at the millisecond of document generation. Turn your invoice stack into a media channel.",
  keywords: ["invoice advertising", "Xero integration", "B2B ads", "invoice monetization"],
  openGraph: {
    title: "AdConfirm — Invoice Advertising Network",
    description: "Your invoices. Now generating revenue.",
    type: "website",
    locale: "en_GB",
    siteName: "AdConfirm",
  },
  twitter: {
    card: "summary_large_image",
    title: "AdConfirm",
    description: "Your invoices. Now generating revenue.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${hanken.variable} ${ibmPlex.variable}`}
      style={{ background: "#04070F" }}
    >
      <body>
        <LenisProvider>
          <CustomCursor />
          {children}
          <Analytics />
        </LenisProvider>
      </body>
    </html>
  );
}
