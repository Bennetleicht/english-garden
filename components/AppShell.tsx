"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Layers, MessageCircle, PenLine, Repeat, Settings, Sprout } from "lucide-react";
import type { ReactNode } from "react";
import { StreakBadge } from "./StreakBadge";

const NAV = [
  { href: "/", label: "Heute", icon: Home },
  { href: "/stufen", label: "Lernweg", icon: Sprout },
  { href: "/grammatik", label: "Grammatik", icon: BookOpen },
  { href: "/vokabeln", label: "Vokabeln", icon: Layers },
  // Auf dem Handy nicht in der unteren Leiste (Platz) – dort über Vokabeln/Grammatik erreichbar
  { href: "/verben", label: "Verben", icon: Repeat, desktopOnly: true },
  { href: "/gespraech", label: "Gespräch", icon: MessageCircle },
  { href: "/schreiben", label: "Schreiben", icon: PenLine },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Entwickler-Übersicht ohne App-Rahmen
  if (pathname.startsWith("/admin")) return <main className="min-h-screen px-5 py-10 sm:px-10">{children}</main>;

  return (
    <div className="min-h-screen lg:flex">
      {/* Seitenleiste (Desktop) */}
      <aside className="hidden w-64 shrink-0 border-r border-cream-200 bg-cream-50/80 lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-3 px-7 pb-8 pt-9">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 text-sage-700">
            <Sprout className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-serif text-xl text-navy-800">English Garden</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 px-4">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[17px] transition-colors ${
                isActive(pathname, href) ? "bg-sage-100 font-semibold text-sage-800" : "text-navy-600 hover:bg-cream-100"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <div className="space-y-3 px-4 pb-8">
          <StreakBadge />
          <Link
            href="/einstellungen"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] transition-colors ${
              isActive(pathname, "/einstellungen") ? "bg-sage-100 text-sage-800" : "text-navy-500 hover:bg-cream-100"
            }`}
          >
            <Settings className="h-4 w-4" aria-hidden />
            Einstellungen
          </Link>
        </div>
      </aside>

      {/* Kopfzeile (Mobil) */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-cream-200 bg-cream-50/95 px-5 py-3 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg text-navy-800">
          <Sprout className="h-5 w-5 text-sage-600" aria-hidden />
          English Garden
        </Link>
        <div className="flex items-center gap-2">
          <StreakBadge compact />
          <Link href="/einstellungen" aria-label="Einstellungen" className="rounded-lg p-2 text-navy-500 hover:bg-cream-100">
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="flex-1 px-5 pb-32 pt-8 sm:px-8 lg:px-14 lg:pb-16 lg:pt-12">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>

      {/* Navigation unten (Mobil) */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-cream-200 bg-cream-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {NAV.filter((n) => !n.desktopOnly).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${
              isActive(pathname, href) ? "font-semibold text-sage-700" : "text-navy-500"
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
