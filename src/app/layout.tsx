import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { PWARegister } from "@/components/PWARegister";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getVersionDisplay, RELEASE_STAGE } from "@/lib/app-version";
import { NostrAuthProvider } from "@/lib/nostr/auth-context";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brasil Caramelo Nostr",
  description: `Rede social brasileira descentralizada (${getVersionDisplay()}, ${RELEASE_STAGE}) — Feed Nostr, Matilhas, Reels e identidade criptográfica.`,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Caramelo Nostr",
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
      <body className="min-h-full antialiased transition-colors duration-300">
        <ThemeProvider>
          <NostrAuthProvider>
            {children}
            <PWARegister />
          </NostrAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
