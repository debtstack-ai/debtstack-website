// app/layout.tsx

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { PostHogProviders } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "DebtStack - Credit Data for AI Agents",
  description: "Structured corporate debt data from SEC filings. Pre-computed, QA-verified API for LangChain, Claude, and AI agents.",
  keywords: ["credit data", "API", "AI agents", "LangChain", "corporate debt", "SEC filings"],
  authors: [{ name: "DebtStack" }],
  openGraph: {
    title: "DebtStack - Credit Data for AI Agents",
    description: "Credit infrastructure for AI agents",
    url: "https://debtstack.ai",
    siteName: "DebtStack",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DebtStack - Credit Data for AI Agents",
    description: "Credit infrastructure for AI agents",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-PTLSQC2QT8"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-PTLSQC2QT8');
            `}
          </Script>
        </head>
        <body className={`${inter.className} ${jetbrainsMono.variable}`}>
          <PostHogProviders>
            {children}
          </PostHogProviders>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
