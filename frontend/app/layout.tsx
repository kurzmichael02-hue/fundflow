import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// DM Sans is loaded globally in globals.css alongside Syne — pages use both
// directly by name in inline styles, so a Next.js font variable on top of
// that would just duplicate the fetch.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fundflow-omega.vercel.app"

export const metadata: Metadata = {
  title: "FundFlow — Investor CRM for Web3 Founders",
  description: "FundFlow helps Web3 startup founders manage their entire fundraising process — track investor relationships, manage deal pipelines, and close your round faster.",
  keywords: ["investor CRM", "Web3 fundraising", "startup investors", "deal flow", "crypto founders", "fundraising pipeline"],
  authors: [{ name: "FundFlow" }],
  creator: "FundFlow",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "FundFlow — Investor CRM for Web3 Founders",
    description: "Track investors, manage your pipeline, and close your round faster. Built for Web3 founders.",
    url: SITE_URL,
    siteName: "FundFlow",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FundFlow — Investor CRM for Web3 Founders",
    description: "Track investors, manage your pipeline, and close your round faster.",
    creator: "@fundflow",
  },
  robots: {
    index: true,
    follow: true,
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CookieBanner />
        {children}
      </body>
    </html>
  );
}
