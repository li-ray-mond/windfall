/**
 * Root layout: the HTML shell shared by every page.
 *
 * Sets the browser tab title and description, loads the fonts, and pulls
 * in the global stylesheet.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Windfall",
  description:
    "Airfare deal alerts for your dream destinations, on the dates you're free to travel.",
};

/**
 * Wraps every page in the shared `<html>` and `<body>` elements.
 *
 * @param props - Layout props from Next.js; `children` is the page being rendered.
 * @returns The full HTML document for that page.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
