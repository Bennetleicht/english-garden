"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { MistakeList } from "@/components/MistakeList";
import { Button, PageHeader, Panel, ProgressBar } from "@/components/ui";
import { getLevel } from "@/lib/content/levels";
import { PLACEMENT, recommendLevel } from "@/lib/content/placement";
import { markActivity, setProfile } from "@/lib/storage";

export default function PlacementPage() {
  const router = useRouter();
  const [index, setIndex] = useState(-1); // -1 = Einleitung
  const [answers, setAnswers] = useState<number[]>([]);

  if (index === -1) {
    return (
      <div>
        <PageHeader eyebrow="Einstufung" title="Wo stehst du gerade?">
          16 kurze Fragen, von leicht bis anspruchsvoll. Es gibt keine Zeitbegrenzung und keine Note – wenn du eine Antwort nicht
          weißt, wähle einfach „Weiß ich nicht“. Das Ergebnis ist nur eine Empfehlung; du kannst jede Stufe jederzeit frei wählen.
        </PageHeader>
        <Button onClick={() => setIndex(0)}>
          Einstufung beginnen <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (index >= PLACEMENT.length) {
    const correctByLevel: Record<number, number> = {};
    PLACEMENT.forEach((q, i) => {
      if (answers[i] === q.answer) correctByLevel[q.level] = (correctByLevel[q.level] ?? 0) + 1;
    });
    const total = Object.values(correctByLevel).reduce((a, b) => a + b, 0);
    const recommended = getLevel(recommendLevel(correctByLevel));
    const mistakes = PLACEMENT.flatMap((q, i) =>
      answers[i] === q.answer
        ? []
        : [
            {
              prompt: q.sentence.replace("___", "_____"),
              given: answers[i] >= 0 ? q.options[answers[i]] : "Weiß ich nicht",
              solution: q.options[q.answer],
            },
          ],
    );

    return (
      <div className="animate-fadeIn">
        <PageHeader eyebrow="Ergebnis" title={`Unsere Empfehlung: ${recommended.title}`}>
          Du hast {total} von {PLACEMENT.length} Fragen richtig beantwortet. Stufe {recommended.id} ({recommended.cefr}) passt
          gut zu dir: {recommended.short.toLowerCase()}.
        </PageHeader>
        <Panel>
          <p className="text-lg text-navy-700">{recommended.description}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => {
                setProfile({ level: recommended.id, placementDone: true });
                markActivity();
                router.push(`/stufen/${recommended.id}`);
              }}
            >
              Mit dieser Stufe starten
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setProfile({ placementDone: true });
                router.push("/stufen");
              }}
            >
              Selbst eine Stufe wählen
            </Button>
          </div>
        </Panel>
        {mistakes.length > 0 && (
          <div className="mt-8">
            <MistakeList mistakes={mistakes} title="Diese Fragen waren noch schwierig" />
          </div>
        )}
      </div>
    );
  }

  const q = PLACEMENT[index];
  const choose = (option: number) => {
    setAnswers((a) => {
      const next = [...a];
      next[index] = option;
      return next;
    });
    setIndex((i) => i + 1);
  };

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <ProgressBar value={index} max={PLACEMENT.length} />
        <span className="shrink-0 text-sm text-navy-500">
          {index + 1} / {PLACEMENT.length}
        </span>
      </div>
      <Panel key={index} className="animate-fadeIn">
        <p className="text-sm font-semibold uppercase tracking-wider text-navy-500">Welche Lösung passt?</p>
        <p className="mt-3 text-2xl leading-relaxed text-navy-800">{q.sentence}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {q.options.map((option, i) => (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              className="rounded-xl border border-cream-300 bg-white px-5 py-3.5 text-left text-lg transition-colors hover:border-sage-300 hover:bg-sage-50"
            >
              {option}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => choose(-1)} className="mt-5 text-navy-500 underline-offset-4 hover:underline">
          Weiß ich nicht
        </button>
      </Panel>
    </div>
  );
}
