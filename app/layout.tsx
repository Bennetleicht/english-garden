import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { AccountGate } from "@/components/AccountGate";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const sans = Source_Sans_3({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "English Garden",
  description: "Dein ruhiger Ort zum Englischlernen.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#fcfaf6",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <AccountGate>
          <AppShell>{children}</AppShell>
        </AccountGate>
      </body>
    </html>
  );
}
