import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://staqq.in';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Staqq | Indian Stock Market Intelligence, IPOs & Screeners",
    template: "%s | Staqq"
  },
  description: "Every edge, one dashboard. Real-time IPO GMP tracking, FII/DII institutional flows, NSE insider trades, and smart stock screeners specifically built for Indian retail investors.",
  authors: [{ name: "Staqq", url: BASE_URL }],
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
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Staqq',
    title: "Staqq | Indian Stock Market Intelligence",
    description: "Real-time IPO GMP, FII/DII signals, and powerful stock screeners for Indian retail investors.",
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Staqq - Indian Stock Market Intelligence Dashboard',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Staqq | Indian Stock Market Intelligence",
    description: "Real-time IPO GMP, FII/DII signals, and powerful stock screeners for Indian retail investors.",
    images: ['/api/og'],
    creator: '@staqq',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

// Root JSON-LD: Organization + WebSite with SearchAction
// These are site-wide signals -- defined once here, not per-page.
const rootJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    "name": "Staqq",
    "url": BASE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${BASE_URL}/logo.jpeg`,
      "width": 512,
      "height": 512,
    },
    "description": "Indian stock market intelligence platform. Live IPO GMP tracking, FII/DII institutional flows, NSE insider trades, and smart stock screeners for retail investors.",
    "foundingDate": "2024",
    "areaServed": "IN",
    "sameAs": [
      "https://twitter.com/staqq",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    "url": BASE_URL,
    "name": "Staqq",
    "publisher": { "@id": `${BASE_URL}/#organization` },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${BASE_URL}/stocks/screener?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
];

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootJsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable}`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
