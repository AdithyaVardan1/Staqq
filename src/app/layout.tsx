import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Staqq | Invest in the Future",
  description: "Next-gen IPO and Stock analysis platform for Gen Z.",
};

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ComparisonTray } from "@/components/stocks/ComparisonTray";
import { StreamProvider } from "@/context/StreamContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable}`}>
        <StreamProvider>
          <Navbar />
          {children}
          <Footer />
          <ComparisonTray />
        </StreamProvider>
      </body>
    </html>
  );
}
