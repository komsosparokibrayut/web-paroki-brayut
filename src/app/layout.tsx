import type { Metadata } from "next";
import { Rubik, Libre_Baskerville } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { headers } from "next/headers";
import { GlobalLoader } from "@/components/ui/global-loader";
import MainToaster from "@/components/providers/MainToaster";

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
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://parokibrayut.or.id"),
  title: "Paroki Brayut",
  description: "Website Resmi Paroki Brayut - Santo Yohanes Paulus II",
  icons: {
    icon: "/favicons/logo.png",
    shortcut: "/favicons/logo.png",
    apple: "/favicons/logo.png",
  },
  openGraph: {
    images: ["/images/logo/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/logo/logo.png"],
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${rubik.variable} ${libre.variable} font-rubik bg-brand-warm text-brand-dark antialiased`} suppressHydrationWarning>
        <ClerkProvider nonce={nonce}>
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id="4fd6cd8f-898d-4ad9-b98a-4795fda4cea3"
            strategy="afterInteractive"
            nonce={nonce}
          />
          <GlobalLoader />
          <SmoothScroll>{children}</SmoothScroll>
          <SpeedInsights />
          <MainToaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
