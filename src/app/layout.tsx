import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono, Playfair_Display } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import "./globals.css";

/* ── Public theme fonts ── */
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

/* ── Neon OS fonts ── */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio & OS",
  description: "Personal Portfolio and OS Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${GeistSans.variable} ${GeistMono.variable} ${jetbrainsMono.variable} ${playfair.variable} antialiased`}
      >
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
