import type { Metadata } from "next";
import { headers } from "next/headers";
import { Archivo, Instrument_Sans, Inter } from "next/font/google";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { config } from "@/config";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// FitBreak public site (ADR 0009): condensed Archivo headings, Instrument Sans body.
// Exposed as CSS variables only; `.fb-ed` in globals.css applies them.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument" });

export const metadata: Metadata = {
  metadataBase: new URL(config.site.url),
  title: {
    default: config.site.name,
    template: `%s | ${config.site.name}`,
  },
  description: config.site.description,
  applicationName: config.site.name,
  openGraph: {
    type: "website",
    siteName: config.site.name,
    title: config.site.name,
    description: config.site.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: config.site.name,
    description: config.site.description,
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Read a request header so this layout — and therefore every route — renders
  // dynamically per request. That lets Next.js apply the per-request CSP nonce
  // (set in src/middleware.ts) to its own framework scripts, which the enforced
  // strict CSP requires. Nonces are per-request, so pages cannot be static.
  // next-themes injects an inline script; it must carry the nonce too.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${inter.variable} ${archivo.variable} ${instrumentSans.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          nonce={nonce}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
