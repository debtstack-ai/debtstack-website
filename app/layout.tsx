// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
