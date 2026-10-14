"use client";

import Link from "next/link";
import { Check, ChevronRight, Compass } from "lucide-react";
import { Loading, PageHeader, ProgressBar } from "@/components/ui";
import { chapterProgress, chaptersForLevel } from "@/lib/content/chapters";
import { lessonsForLevel } from "@/lib/content/grammar";
import { LEVELS } from "@/lib/content/levels";
import { useAppState } from "@/lib/storage";

export default function LevelsPage() {
  const state = useAppState();
  if (!state) return <Loading />;

  return (
    <div>
      <PageHeader eyebrow="Dein Lernweg" title="Vier Stufen, ein Weg">
        Jede Stufe baut auf der vorherigen auf – angelehnt an den Europäischen Referenzrahmen (A1 bis B2). Du kannst jederzeit
        zwischen den Stufen wechseln.
      </PageHeader>

      <Link
        href="/einstufung"
        className="mb-6 flex items-center gap-4 rounded-2xl border border-sage-200 bg-sage-50 px-6 py-5 transition-colors hover:bg-sage-100"
      >
        <Compass className="h-7 w-7 shrink-0 text-sage-600" aria-hidden />
        <span className="flex-1">
          <span className="block font-semibold text-navy-800">Einstufungstest</span>
          <span className="block text-navy-600">
            {state.profile.placementDone
              ? "Wo stehst du inzwischen? Mach den Test jederzeit noch einmal."
              : "Finde in etwa 5 Minuten heraus, welche Stufe gerade zu dir passt."}
          </span>
        </span>
        <ChevronRight className="h-5 w-5 text-sage-600" aria-hidden />
      </Link>

      <div className="space-y-4">
        {LEVELS.map((level) => {
          const lessons = lessonsForLevel(level.id);
          const done = lessons.filter((l) => state.lessons[l.slug]).length;
          const current = state.profile.level === level.id;
          return (
            <Link
              key={level.id}
              href={`/stufen/${level.id}`}
              className={`group flex gap-5 rounded-2xl border p-6 shadow-soft transition-all hover:-translate-y-0.5 sm:p-7 ${
                current ? "border-sage-300 bg-white" : "border-cream-200 bg-white/70"
              }`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-serif text-xl ${
                  done === lessons.length ? "bg-sage-600 text-white" : current ? "bg-sage-100 text-sage-800" : "bg-cream-100 text-navy-600"
                }`}
              >
                {done === lessons.length ? <Check className="h-5 w-5" /> : level.id}
              </span>
              <span className="flex-1">
                <span className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-serif text-2xl text-navy-800">{level.title}</span>
                  <span className="text-sm font-semibold text-sage-600">{level.cefr}</span>
                  {current && <span className="rounded-full bg-sage-100 px-2.5 py-0.5 text-xs font-semibold text-sage-800">Deine Stufe</span>}
                  {state.exams[level.id]?.passed && (
                    <span className="rounded-full bg-sage-600 px-2.5 py-0.5 text-xs font-semibold text-white">Prüfung bestanden</span>
                  )}
                </span>
                <span className="mt-1 block text-navy-600">{level.short}</span>
                <span className="mt-4 flex items-center gap-3">
                  <ProgressBar value={done} max={lessons.length} className="max-w-[12rem]" />
                  <span className="text-sm text-navy-500">
                    {chaptersForLevel(level.id).filter((c) => chapterProgress(c, state).complete).length} von{" "}
                    {chaptersForLevel(level.id).length} Kapiteln · {done}/{lessons.length} Lektionen
                  </span>
                </span>
              </span>
              <ChevronRight className="mt-2 h-5 w-5 shrink-0 text-navy-500/40 group-hover:text-sage-600" aria-hidden />
            </Link>
          );
        })}
      </div>


    </div>
  );
}
