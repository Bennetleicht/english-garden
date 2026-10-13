"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Reviewer } from "@/components/Reviewer";
import { Button, Loading, PageHeader, Panel } from "@/components/ui";
import { addDays, formatDayGerman, isInCurrentWeek, startOfWeek } from "@/lib/dates";
import { useAppState, type Card } from "@/lib/storage";

/** Wochenrückblick: Zusammenfassung + Wiederholung aller Karten dieser Woche. */
export default function WeeklyReviewPage() {
  const state = useAppState();
  const [reviewCards, setReviewCards] = useState<Card[] | null>(null);

  if (!state) return <Loading />;

  const weekStart = startOfWeek();
  const newThisWeek = state.cards.filter((c) => isInCurrentWeek(c.createdAt));
  const reviewsThisWeek = state.cards.flatMap((c) => c.history.filter((h) => isInCurrentWeek(h.day)).map((h) => ({ card: c, ok: h.ok })));
  const known = reviewsThisWeek.filter((r) => r.ok).length;
  const pct = reviewsThisWeek.length > 0 ? Math.round((known / reviewsThisWeek.length) * 100) : 0;
  const learnedDays = state.activityDays.filter(isInCurrentWeek).length;

  const weekCards = state.cards.filter((c) => isInCurrentWeek(c.createdAt) || c.history.some((h) => isInCurrentWeek(h.day)));
  const tricky = weekCards
    .map((c) => ({ card: c, misses: c.history.filter((h) => isInCurrentWeek(h.day) && !h.ok).length }))
    .filter((x) => x.misses > 0)
    .sort((a, b) => b.misses - a.misses)
    .slice(0, 6);

  return (
    <div>
      <Link href="/vokabeln" className="mb-6 inline-flex items-center gap-2 text-navy-500 hover:text-navy-700">
        <ArrowLeft className="h-4 w-4" /> Vokabelkasten
      </Link>
      <PageHeader eyebrow="Wochenrückblick" title="Deine Woche">
        {formatDayGerman(weekStart)} bis {formatDayGerman(addDays(weekStart, 6))}
      </PageHeader>

      {reviewCards ? (
        <Panel>
          <Reviewer initialCards={reviewCards} mode="review" />
          <div className="mt-8 text-center">
            <Button variant="ghost" onClick={() => setReviewCards(null)}>
              Zurück zur Übersicht
            </Button>
          </div>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat value={learnedDays} label={learnedDays === 1 ? "Lerntag" : "Lerntage"} />
            <Stat value={newThisWeek.length} label="neue Wörter & Sätze" />
            <Stat value={reviewsThisWeek.length > 0 ? `${pct} %` : "–"} label="auf Anhieb gewusst" />
          </div>

          {weekCards.length === 0 ? (
            <Panel className="mt-6">
              <p className="text-lg text-navy-600">Diese Woche gibt es noch nichts zurückzublicken. Jede kleine Lerneinheit zählt.</p>
            </Panel>
          ) : (
            <>
              <Panel className="mt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 font-serif text-2xl text-navy-800">
                      <CalendarDays className="h-5 w-5 text-sage-600" /> Wochen-Wiederholung
                    </h2>
                    <p className="mt-1 text-navy-600">Geh alle {weekCards.length} Karten dieser Woche noch einmal in Ruhe durch.</p>
                  </div>
                  <Button onClick={() => setReviewCards([...weekCards].sort(() => Math.random() - 0.5))}>Wiederholung starten</Button>
                </div>
              </Panel>

              {tricky.length > 0 && (
                <Panel className="mt-6">
                  <h2 className="font-serif text-xl text-navy-800">Diese Wörter brauchen noch etwas Zeit</h2>
                  <ul className="mt-4 space-y-2">
                    {tricky.map(({ card }) => (
                      <li key={card.id} className="flex flex-wrap gap-x-3">
                        <span className="font-semibold text-navy-800">{card.front}</span>
                        <span className="text-navy-600">{card.back}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}

              {newThisWeek.length > 0 && (
                <Panel className="mt-6">
                  <h2 className="font-serif text-xl text-navy-800">Neu in dieser Woche</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {newThisWeek.map((c) => (
                      <span key={c.id} className="rounded-full bg-cream-100 px-3 py-1.5 text-navy-700" title={c.back}>
                        {c.front}
                      </span>
                    ))}
                  </div>
                </Panel>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-2xl border border-cream-200 bg-white/80 p-6 shadow-soft">
      <p className="font-serif text-4xl text-navy-800">{value}</p>
      <p className="text-navy-600">{label}</p>
    </div>
  );
}
