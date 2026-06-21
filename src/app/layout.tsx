import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MemoryFlix — Stream Your Life",
  description: "A cinematic emotional streaming platform for your most precious memories. Netflix for your life.",
  keywords: ["memories", "photos", "videos", "nostalgia", "AI", "streaming"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#0a0a0a] text-[#f5f5f5] font-sans">
        {children}
      </body>
    </html>
  );
}
