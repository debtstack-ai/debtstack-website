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
    <ClerkProvider
      appearance={{
        layout: {
          logoImageUrl: undefined,
          showOptionalFields: false,
          socialButtonsVariant: "iconButton",
          helpPageUrl: "https://debtstack.ai",
          privacyPageUrl: "https://debtstack.ai/privacy",
          termsPageUrl: "https://debtstack.ai/terms",
        },
        variables: {
          colorPrimary: "#111827",
          colorBackground: "#ffffff",
          colorText: "#111827",
          colorTextSecondary: "#6b7280",
          colorInputBackground: "#f9fafb",
          colorInputText: "#111827",
          borderRadius: "0.5rem",
          fontFamily: "Inter, sans-serif",
        },
        elements: {
          // Hide Clerk branding
          footer: { display: "none" },
          logoBox: { display: "none" },
          headerTitle: {
            fontFamily: "Inter, sans-serif",
            fontWeight: "700",
          },
          headerSubtitle: {
            fontFamily: "Inter, sans-serif",
          },
          card: {
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            border: "1px solid #e5e7eb",
          },
          formButtonPrimary: {
            backgroundColor: "#111827",
            fontSize: "14px",
            fontWeight: "600",
            "&:hover": {
              backgroundColor: "#1f2937",
            },
          },
          socialButtonsBlockButton: {
            border: "1px solid #e5e7eb",
            "&:hover": {
              backgroundColor: "#f9fafb",
            },
          },
          // UserButton styling
          userButtonAvatarBox: {
            width: "32px",
            height: "32px",
          },
          userButtonPopoverCard: {
            border: "1px solid #e5e7eb",
          },
          userButtonPopoverFooter: { display: "none" },
        },
      }}
    >
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
