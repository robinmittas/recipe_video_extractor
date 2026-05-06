import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Recipes",
  description: "Turn cooking videos into recipes",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Recipes",
  },
};

export const viewport: Viewport = {
  themeColor: "#4c1d95",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        {/* Animated blobs — fixed behind all content */}
        <div className="bg-blob bg-blob-1" aria-hidden="true" />
        <div className="bg-blob bg-blob-2" aria-hidden="true" />
        <div className="bg-blob bg-blob-3" aria-hidden="true" />

        {children}
      </body>
    </html>
  );
}
