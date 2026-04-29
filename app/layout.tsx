import type { Metadata } from "next";
import { Jersey_25 } from 'next/font/google';
import { Ga_Maamli } from 'next/font/google';
import { Roboto } from 'next/font/google';
import { Inter } from 'next/font/google';
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

const roboto = Roboto({ weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], variable: '--font-roboto' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const gamaamli = Ga_Maamli({ weight: ['400'], subsets: ['latin'], variable: '--font-next-test' });

const jersey25 = Jersey_25({ weight: ['400'], subsets: ['latin'], variable: '--font-next-jersey' });

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${jersey25.variable} ${gamaamli.variable} min-h-full flex flex-col ${roboto.variable}  ${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
