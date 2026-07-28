import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "EngineerYa — Digital Engineering Library",
  description: "Discover, read, and own engineering learning resources.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} font-sans bg-[#0B0F19] text-[#E2E8F0] antialiased min-h-screen selection:bg-indigo-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}

