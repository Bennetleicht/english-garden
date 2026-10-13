"use client";

import { BookmarkCheck, Plus } from "lucide-react";
import { addCards, hasCard, useAppState, type CardSource } from "@/lib/storage";

/** Speichert ein Wort oder einen korrigierten Satz mit einem Klick im Vokabelkasten. */
export function SaveWordButton({
  front,
  back,
  example,
  source,
  label,
}: {
  front: string;
  back: string;
  example?: string;
  source: CardSource;
  label?: string;
}) {
  const state = useAppState();
  const saved = state ? hasCard(state, front) : false;

  if (saved) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1.5 text-sm text-sage-700">
        <BookmarkCheck className="h-4 w-4" aria-hidden />
        {label ?? front} – gespeichert
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addCards([{ front, back, example }], source)}
      className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3 py-1.5 text-sm text-navy-700 transition-colors hover:border-sage-300 hover:bg-sage-50"
      title="In den Vokabelkasten legen"
    >
      <Plus className="h-4 w-4 text-sage-600" aria-hidden />
      {label ?? front}
      {!label && <span className="text-navy-500">· {back}</span>}
    </button>
  );
}
