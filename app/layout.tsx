import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GeistPixelSquare } from "geist/font/pixel";
import "./globals.css";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { SearchProvider } from "./components/SearchContext";

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
      suppressHydrationWarning
    >
      <body className="h-screen flex flex-col overflow-hidden antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SearchProvider>
            <Topbar />
            <main className="flex-1 scrolll">{children}</main>
            <Footer />
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
