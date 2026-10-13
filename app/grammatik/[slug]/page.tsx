"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Lightbulb, PenLine } from "lucide-react";
import { ExerciseRunner } from "@/components/ExerciseRunner";
import { SaveWordButton } from "@/components/SaveWordButton";
import { SpeakButton } from "@/components/SpeakButton";
import { Button, LinkButton, PageHeader, Panel, RichText } from "@/components/ui";
import { getLesson, LESSONS, type Block } from "@/lib/content/grammar";
import { getLevel } from "@/lib/content/levels";
import { markActivity, saveLessonResult } from "@/lib/storage";

export default function LessonPage() {
  const params = useParams<{ slug: string }>();
  const lesson = getLesson(params.slug);
  const [practising, setPractising] = useState(false);
  const [finished, setFinished] = useState(false);

  // Beim Wechsel zur nächsten Lektion wieder bei der Erklärung beginnen
  useEffect(() => {
    setPractising(false);
    setFinished(false);
    window.scrollTo(0, 0);
  }, [params.slug]);

  if (!lesson) {
    return (
      <div>
        <PageHeader title="Diese Lektion gibt es nicht." />
        <LinkButton href="/grammatik" variant="secondary">
          Zur Übersicht
        </LinkButton>
      </div>
    );
  }

  const level = getLevel(lesson.level);
  const idx = LESSONS.findIndex((l) => l.slug === lesson.slug);
  const nextLesson = LESSONS[idx + 1];

  return (
    <div>
      <Link href="/grammatik" className="mb-6 inline-flex items-center gap-2 text-navy-500 hover:text-navy-700">
        <ArrowLeft className="h-4 w-4" /> Grammatik
      </Link>

      <PageHeader eyebrow={`${level.title} · ${level.cefr}`} title={lesson.title}>
        {lesson.subtitle}
      </PageHeader>

      <div className="space-y-5">
        {lesson.blocks.map((block, i) => {
          switch (block.kind) {
            case "text":
              return (
                <p key={i} className="max-w-3xl text-lg leading-relaxed text-navy-700">
                  <RichText text={block.text} />
                </p>
              );
            case "rule":
              return (
                <div key={i} className="rounded-2xl border-l-4 border-sage-400 bg-white/80 px-6 py-5 shadow-soft">
                  <h3 className="font-serif text-xl text-navy-800">{block.title}</h3>
                  <p className="mt-2 text-lg leading-relaxed text-navy-700">
                    <RichText text={block.text} />
                  </p>
                </div>
              );
            case "examples":
              return (
                <div key={i} className="overflow-hidden rounded-2xl border border-cream-200 bg-white/80">
                  <p className="border-b border-cream-200 bg-cream-100 px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-navy-500">
                    Beispiele
                  </p>
                  <ul className="divide-y divide-cream-200">
                    {block.items.map((ex) => (
                      <li key={ex.en} className="flex flex-col gap-1 px-6 py-3.5 sm:flex-row sm:items-center sm:gap-4">
                        <span className="flex-1 text-lg text-navy-800">{ex.en}</span>
                        <span className="flex-1 text-navy-500">{ex.de}</span>
                        <SpeakButton text={ex.en} label="Anhören" className="self-start sm:self-auto" />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            case "tip":
              return (
                <div key={i} className="flex gap-3 rounded-2xl bg-cream-100 px-6 py-5">
                  <Lightbulb className="mt-1 h-5 w-5 shrink-0 text-cream-400" aria-hidden />
                  <p className="text-lg leading-relaxed text-navy-700">
                    <RichText text={block.text} />
                  </p>
                </div>
              );
          }
        })}
      </div>

      {/* Beispielsätze als Lernkarten speichern */}
      {lesson.blocks.some((b) => b.kind === "examples") && (
        <div className="mt-6 flex flex-wrap gap-2">
          {lesson.blocks
            .filter((b): b is Extract<Block, { kind: "examples" }> => b.kind === "examples")
            .flatMap((b) => b.items)
            .slice(0, 4)
            .map((ex) => (
              <SaveWordButton key={ex.en} front={ex.en} back={ex.de} source="grammatik" label={`„${ex.en}“ speichern`} />
            ))}
        </div>
      )}

      <Panel className="mt-10">
        {!practising ? (
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-serif text-2xl text-navy-800">
                <PenLine className="h-5 w-5 text-sage-600" /> Jetzt üben
              </h2>
              <p className="mt-1 text-navy-600">{lesson.exercises.length} kurze Übungen zu diesem Thema.</p>
            </div>
            <Button onClick={() => setPractising(true)}>Übungen starten</Button>
          </div>
        ) : (
          <ExerciseRunner
            exercises={lesson.exercises}
            onFinish={(correct, total) => {
              saveLessonResult(lesson.slug, correct, total);
              markActivity();
              setFinished(true);
            }}
          />
        )}
      </Panel>

      {finished && nextLesson && (
        <div className="mt-6 flex justify-end">
          <LinkButton href={`/grammatik/${nextLesson.slug}`} variant="secondary">
            Nächste Lektion: {nextLesson.title} <ChevronRight className="h-4 w-4" />
          </LinkButton>
        </div>
      )}
    </div>
  );
}
