import type { Metadata } from "next";
import { Cormorant_Garamond, Geist_Mono, Literata } from "next/font/google";

import { LocomotiveRoot } from "view/components/LocomotiveRoot";
import { Providers } from "view/components/Providers";
import { SiteLoader } from "view/components/SiteLoader";
import "view/styles/globals.css";

const baseSans = Literata({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const heroDecor = Cormorant_Garamond({
  variable: "--font-hero",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Anntiart",
    template: "%s | Anntiart",
  },
  description: "Одностраничный лендинг",
  icons: {
    icon: "/icon-rounded.png",
    shortcut: "/icon-rounded.png",
    apple: "/icon-rounded.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${baseSans.variable} ${heroDecor.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <LocomotiveRoot>{children}</LocomotiveRoot>
        </Providers>
      </body>
    </html>
  );
}
