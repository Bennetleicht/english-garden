import { Check, X } from "lucide-react";

export interface Mistake {
  prompt: string; // Aufgabe (Satz mit Lücke bzw. Satzbau-Übersetzung)
  given: string; // eigene Antwort
  solution: string; // richtige Lösung
  explanation?: string;
}

/** Übersicht „Deine Fehler mit Lösung“ am Ende eines Tests. */
export function MistakeList({ mistakes, title = "Deine Fehler mit Lösung" }: { mistakes: Mistake[]; title?: string }) {
  if (mistakes.length === 0) return null;
  return (
    <div className="text-left">
      <h3 className="font-serif text-xl text-navy-800">{title}</h3>
      <p className="mt-1 text-navy-600">Schau sie dir in Ruhe an – aus Fehlern lernt man am meisten.</p>
      <ul className="mt-4 divide-y divide-cream-200 rounded-xl border border-cream-200 bg-white">
        {mistakes.map((m, i) => (
          <li key={i} className="px-5 py-4">
            <p className="text-lg text-navy-800">{m.prompt}</p>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5 text-clay-600">
                <X className="h-4 w-4 shrink-0" aria-hidden />
                <span className="line-through decoration-clay-400/60">{m.given || "keine Antwort"}</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-sage-700">
                <Check className="h-4 w-4 shrink-0" aria-hidden /> {m.solution}
              </span>
            </p>
            {m.explanation && <p className="mt-1 text-navy-600">{m.explanation}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
