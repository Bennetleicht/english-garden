"use client";

import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { Loading, PageHeader } from "@/components/ui";
import { lessonsForLevel } from "@/lib/content/grammar";
import { LEVELS } from "@/lib/content/levels";
import { useAppState } from "@/lib/storage";

export default function GrammarPage() {
  const state = useAppState();
  if (!state) return <Loading />;

  return (
    <div>
      <PageHeader eyebrow="Grammatik" title="Klar erklärt, in Ruhe geübt">
        Jede Lektion erklärt ein Thema auf Deutsch – mit Beispielen und Tipps. Danach folgen ein paar kurze Übungen.
      </PageHeader>

      <div className="space-y-10">
        {LEVELS.map((level) => (
          <section key={level.id}>
            <h2 className="mb-3 flex items-baseline gap-3 font-serif text-2xl text-navy-800">
              {level.title}
              <span className="font-sans text-sm font-semibold text-sage-600">{level.cefr}</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {lessonsForLevel(level.id).map((lesson) => {
                const result = state.lessons[lesson.slug];
                return (
                  <Link
                    key={lesson.slug}
                    href={`/grammatik/${lesson.slug}`}
                    className="group flex items-center gap-4 rounded-xl border border-cream-200 bg-white/80 px-5 py-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-sage-200"
                  >
                    <span className="flex-1">
                      <span className="block font-semibold text-navy-800">{lesson.title}</span>
                      <span className="block text-[15px] text-navy-600">{lesson.subtitle}</span>
                    </span>
                    {result ? (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-sage-700" title={`${result.correct}/${result.total} richtig`}>
                        <Check className="h-4 w-4" />
                      </span>
                    ) : (
                      <ChevronRight className="h-5 w-5 text-navy-500/40 group-hover:text-sage-600" />
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
