"use client";

import { ArrowRight, Lightbulb } from "lucide-react";
import type { Correction } from "@/lib/api";
import type { CardSource } from "@/lib/storage";
import { SaveWordButton } from "./SaveWordButton";

/** Freundliche Korrekturen im Format „Vorher → Besser“ – jeweils speicherbar. */
export function CorrectionList({ corrections, source }: { corrections: Correction[]; source: CardSource }) {
  if (corrections.length === 0) return null;
  return (
    <div className="space-y-3">
      {corrections.map((c, i) => (
        <div key={i} className="rounded-xl border border-cream-200 bg-cream-50 px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[17px]">
            <span className="text-navy-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-navy-500/80">Vorher </span>
              <span className="line-through decoration-clay-400/70">{c.before}</span>
            </span>
            <ArrowRight className="h-4 w-4 text-sage-500" aria-hidden />
            <span className="font-semibold text-sage-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-sage-600">Besser </span>
              {c.after}
            </span>
          </div>
          {c.explanation && (
            <p className="mt-1.5 flex gap-2 text-[15px] text-navy-600">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-cream-400" aria-hidden />
              {c.explanation}
            </p>
          )}
          <div className="mt-2">
            <SaveWordButton
              front={c.after}
              back={`${c.explanation}${c.explanation ? " " : ""}(statt: ${c.before})`}
              source={source}
              label="Als Lernkarte speichern"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
