import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://staqq.in'),
  title: {
    default: "Staqq | Indian Stock Market Intelligence, IPOs & Screeners",
    template: "%s | Staqq"
  },
  description: "Every edge, one dashboard. Real-time IPO GMP tracking, FII/DII institutional flows, NSE insider trades, and smart stock screeners specifically built for Indian retail investors.",
  keywords: [
    "IPO GMP today", "IPO allotment probability", "FII DII data", "NSE insider trades",
    "Indian stock market signals", "BSE IPO subscription", "IPO grey market premium",
    "stock screener India", "crypto prices INR", "Nifty 50 analysis"
  ],
  authors: [{ name: "Staqq" }],
  creator: "Staqq",
  publisher: "Staqq",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://staqqin.vercel.app',
    siteName: 'Staqq',
    title: "Staqq | Indian Stock Market Intelligence",
    description: "Real-time IPO GMP, FII/DII signals, and powerful stock screeners for Indian investors.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Staqq - Indian Stock Market Intelligence Dashboard',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Staqq | Indian Stock Market Intelligence",
    description: "Real-time IPO GMP, FII/DII signals, and powerful stock screeners for Indian investors.",
    images: ['/og-image.png'],
    creator: '@staqq',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable}`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
