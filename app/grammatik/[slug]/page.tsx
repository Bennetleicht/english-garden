"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, PenLine } from "lucide-react";
import { ExerciseRunner } from "@/components/ExerciseRunner";
import { LessonBlock } from "@/components/LessonBlock";
import { SaveWordButton } from "@/components/SaveWordButton";
import { Button, LinkButton, PageHeader, Panel } from "@/components/ui";
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
        {lesson.blocks.map((block, i) => (
          <LessonBlock key={i} block={block} />
        ))}
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

      {finished && (
        <div className="mt-6 flex justify-end">
          {nextLesson && nextLesson.level === lesson.level ? (
            <LinkButton href={`/grammatik/${nextLesson.slug}`} variant="secondary">
              Nächste Lektion: {nextLesson.title} <ChevronRight className="h-4 w-4" />
            </LinkButton>
          ) : (
            <LinkButton href={`/stufen/${lesson.level}/pruefung`} variant="secondary">
              Zur Abschlussprüfung von Stufe {lesson.level} <ChevronRight className="h-4 w-4" />
            </LinkButton>
          )}
        </div>
      )}
    </div>
  );
}
