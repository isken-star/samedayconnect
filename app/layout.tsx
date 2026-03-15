import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppShell } from "@/src/components/layout/AppShell";
import { getCurrentCourierContext } from "@/src/lib/courier/current";
import { getCanonicalAppUrl } from "@/src/lib/domain";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Same Day Connect",
  description: "Book direct. Save money. Same-day delivery with trusted local couriers.",
  metadataBase: new URL(getCanonicalAppUrl()),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentCourier = await getCurrentCourierContext();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppShell siteLabel={currentCourier.courier?.businessName ?? null}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
