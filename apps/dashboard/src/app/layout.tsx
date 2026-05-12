import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AdConfirm Dashboard", template: "%s | AdConfirm" },
  description: "AdConfirm business and advertiser portal",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-white antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#0D1629", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" },
            success: { iconTheme: { primary: "#10B981", secondary: "#fff" } },
            error: { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
