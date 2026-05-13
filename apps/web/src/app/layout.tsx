import type { Metadata } from "next";
import { Playfair_Display, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { LenisProvider } from "../components/providers/LenisProvider";
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
  metadataBase: new URL("https://adconfirm.io"),
  title: {
    default: "AdConfirm — Earn Revenue From Your Invoices",
    template: "%s | AdConfirm",
  },
  description:
    "AdConfirm places targeted ads on your Xero invoices at the moment of generation. Earn per placement. Zero workflow changes. Free to join.",
  keywords: [
    "invoice advertising",
    "Xero integration",
    "B2B ad network",
    "invoice monetization",
    "earn from invoices",
    "AdConfirm",
  ],
  openGraph: {
    title: "AdConfirm — Earn Revenue From Your Invoices",
    description:
      "AdConfirm places targeted ads on your Xero invoices at the moment of generation. Earn per placement. Zero workflow changes.",
    type: "website",
    url: "https://adconfirm.io",
    siteName: "AdConfirm",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "AdConfirm — Earn Revenue From Your Invoices",
    description: "Your invoices. Now generating revenue.",
    site: "@adconfirm",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${hanken.variable} ${ibmPlex.variable}`}
      style={{ background: "#04070F" }}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <LenisProvider>
          {children}
          <Analytics />
        </LenisProvider>
      </body>
    </html>
  );
}
