import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GeistPixelSquare } from 'geist/font/pixel';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const geistPixel = GeistPixelSquare;

export const metadata: Metadata = {
  title: "GitHub Contributions",
  description: "View open source contributions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${geistPixel.variable} h-full antialiased`}
    >
      <body className={`min-h-full flex flex-col antialiased font-sans`}>{children}</body>
    </html>
  );
}
