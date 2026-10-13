"use client";

import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { reviewCard } from "@/lib/srs";
import { markActivity, saveCard, useAppState, type Card } from "@/lib/storage";
import { SpeakButton } from "./SpeakButton";
import { Button, ProgressBar } from "./ui";

/**
 * Karteikarten-Sitzung. Englisch vorne → aufdecken → „Gewusst“ / „Nicht gewusst“.
 * Nicht gewusste Karten kommen am Ende der Sitzung noch einmal.
 *
 * mode="srs":    Bewertung fließt in die Wiederholungsplanung ein (normales Lernen).
 * mode="review": Wochenrückblick – nur nicht gewusste Karten werden neu eingeplant.
 */
export function Reviewer({
  initialCards,
  mode = "srs",
  onDone,
}: {
  initialCards: Card[];
  mode?: "srs" | "review";
  onDone?: (stats: { known: number; total: number }) => void;
}) {
  const state = useAppState();
  const [queue, setQueue] = useState<string[]>(() => initialCards.map((c) => c.id));
  const [retried, setRetried] = useState<Set<string>>(new Set());
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ known: 0, total: 0 });
  const [firstTotal] = useState(initialCards.length);

  const currentId = queue[0];
  const card = state?.cards.find((c) => c.id === currentId);

  if (!currentId || !card) {
    return (
      <div className="animate-fadeIn py-6 text-center">
        <p className="font-serif text-2xl text-navy-800">Geschafft für heute.</p>
        <p className="mt-2 text-lg text-navy-600">
          {stats.total > 0
            ? `${stats.known} von ${stats.total} Karten wusstest du auf Anhieb.`
            : "Gerade sind keine Karten fällig."}
        </p>
      </div>
    );
  }

  const answer = (knewIt: boolean) => {
    const firstAttempt = !retried.has(card.id);
    if (firstAttempt) {
      if (mode === "srs" || !knewIt) saveCard(reviewCard(card, knewIt));
      setStats((s) => ({ known: s.known + (knewIt ? 1 : 0), total: s.total + 1 }));
    }
    markActivity();

    const rest = queue.slice(1);
    let nextQueue = rest;
    if (!knewIt && firstAttempt) {
      // Karte noch einmal ans Ende – einmalig, damit die Sitzung nicht endlos wird.
      setRetried((r) => new Set(r).add(card.id));
      nextQueue = [...rest, card.id];
    }
    setFlipped(false);
    setQueue(nextQueue);
    if (nextQueue.length === 0) {
      onDone?.({ known: stats.known + (firstAttempt && knewIt ? 1 : 0), total: stats.total + (firstAttempt ? 1 : 0) });
    }
  };

  const done = firstTotal - queue.filter((id) => !retried.has(id)).length;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <ProgressBar value={Math.max(0, done)} max={firstTotal} />
        <span className="shrink-0 text-sm text-navy-500">noch {queue.length}</span>
      </div>

      <div className="flip mx-auto max-w-xl">
        {/* key: neue Karte = neues Element, damit die Rückseite der nächsten Karte nicht kurz aufblitzt */}
        <div key={`${card.id}-${retried.has(card.id)}`} className={`flip-inner relative h-72 sm:h-80 ${flipped ? "flipped" : ""}`}>
          {/* Vorderseite */}
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className="flip-face absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-cream-200 bg-white p-8 text-center shadow-soft"
            aria-label="Karte umdrehen"
          >
            {retried.has(card.id) && <span className="absolute left-5 top-4 text-sm text-clay-600">Noch einmal</span>}
            <span className="font-serif text-3xl leading-snug text-navy-800 sm:text-4xl">{card.front}</span>
            <span className="mt-6 text-sm text-navy-500">Antippen zum Aufdecken</span>
          </button>

          {/* Rückseite */}
          <div className="flip-face flip-back absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-sage-200 bg-sage-50 p-8 text-center shadow-soft">
            <span className="font-serif text-2xl text-navy-800">{card.front}</span>
            <span className="mt-3 text-xl text-sage-800">{card.back}</span>
            {card.example && <span className="mt-4 italic text-navy-600">„{card.example}“</span>}
            <SpeakButton text={card.example ? `${card.front}. ${card.example}` : card.front} className="mt-4" />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-xl justify-center gap-3">
        {!flipped ? (
          <Button className="w-full sm:w-auto" onClick={() => setFlipped(true)}>
            <RotateCcw className="h-4 w-4" /> Aufdecken
          </Button>
        ) : (
          <>
            <Button variant="secondary" className="flex-1" onClick={() => answer(false)}>
              <X className="h-5 w-5 text-clay-600" /> Nicht gewusst
            </Button>
            <Button className="flex-1" onClick={() => answer(true)}>
              <Check className="h-5 w-5" /> Gewusst
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
