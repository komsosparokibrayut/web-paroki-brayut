import type { Metadata } from "next";
import { Rubik, Libre_Baskerville } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { SpeedInsights } from "@vercel/speed-insights/next";

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
});

const libre = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL!),
  title: "Paroki Brayut",
  description: "Website Resmi Paroki Brayut - Santo Yohanes Paulus II",
  icons: {
    icon: "/favicons/logo.png",
    shortcut: "/favicons/logo.png",
    apple: "/favicons/logo.png",
  },
  openGraph: {
    images: ["/images/logo/Logo4x.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/logo/Logo4x.png"],
  },
};

import { GlobalLoader } from "@/components/ui/global-loader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${rubik.variable} ${libre.variable} font-rubik bg-brand-warm text-brand-dark antialiased`} suppressHydrationWarning>
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="c438390e-addf-46b3-8f5e-47f26dcaf8c3"
          strategy="afterInteractive"
        />
        <GlobalLoader />
        <SmoothScroll>{children}</SmoothScroll>
        <SpeedInsights />
      </body>
    </html>
  );
}
