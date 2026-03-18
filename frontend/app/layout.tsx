import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
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

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FundFlow — Investor CRM for Web3 Founders",
  description: "FundFlow helps Web3 startup founders manage their entire fundraising process — track investor relationships, manage deal pipelines, and close your round faster.",
  keywords: ["investor CRM", "Web3 fundraising", "startup investors", "deal flow", "crypto founders", "fundraising pipeline"],
  authors: [{ name: "FundFlow" }],
  creator: "FundFlow",
  metadataBase: new URL("https://fundflow.io"),
  openGraph: {
    title: "FundFlow — Investor CRM for Web3 Founders",
    description: "Track investors, manage your pipeline, and close your round faster. Built for Web3 founders.",
    url: "https://fundflow.io",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} antialiased`}
      >
        <CookieBanner />
{children}
      </body>
    </html>
  );
}