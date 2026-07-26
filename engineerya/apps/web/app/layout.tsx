import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EngineerYa — Digital Engineering Library",
  description: "Discover, read, and own engineering learning resources.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
