import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { PWARegister } from "@/components/PWARegister";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brasil Caramelo",
  description:
    "Rede social brasileira com vários modos — Feed, Insta, Reels e reputação canina.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Caramelo",
  },
};

export const viewport: Viewport = {
  themeColor: "#1b6ca8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className="min-h-full antialiased">
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
