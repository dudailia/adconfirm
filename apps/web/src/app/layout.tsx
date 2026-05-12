import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AdConfirm — Invoice Advertising Network",
    template: "%s | AdConfirm",
  },
  description:
    "Turn your invoices into a revenue channel. AdConfirm places targeted ads on the invoices you already send. Earn per placement. Zero friction.",
  keywords: ["invoice advertising", "Xero integration", "B2B ads", "invoice revenue"],
  openGraph: {
    title: "AdConfirm — Invoice Advertising Network",
    description: "Your invoices. Now generating revenue.",
    type: "website",
    locale: "en_GB",
    siteName: "AdConfirm",
  },
  twitter: {
    card: "summary_large_image",
    title: "AdConfirm — Invoice Advertising Network",
    description: "Your invoices. Now generating revenue.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-white antialiased">
        {children}
      </body>
    </html>
  );
}
