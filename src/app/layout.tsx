import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Staqq | IPO Intelligence & Market Signals",
  description: "India's smartest IPO tracker with GMP accuracy scoring, alternative data signals, and real-time market intelligence.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://staqq.in'),
  openGraph: {
    title: "Staqq | IPO Intelligence & Market Signals",
    description: "India's smartest IPO tracker with GMP accuracy scoring, alternative data signals, and real-time market intelligence.",
    type: 'website',
    siteName: 'Staqq',
    images: ['/api/og'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Staqq | IPO Intelligence & Market Signals",
    description: "India's smartest IPO tracker with GMP accuracy scoring, alternative data signals, and real-time market intelligence.",
    images: ['/api/og'],
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
