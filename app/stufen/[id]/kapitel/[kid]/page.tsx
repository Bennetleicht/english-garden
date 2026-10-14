"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Award, ChevronRight, RotateCcw } from "lucide-react";
import { ExerciseRunner } from "@/components/ExerciseRunner";
import { MistakeList } from "@/components/MistakeList";
import { Button, LinkButton, Loading, PageHeader, Panel } from "@/components/ui";
import { shuffle } from "@/lib/answers";
import { CHAPTER_PASS_PERCENT, chaptersForLevel, getChapter } from "@/lib/content/chapters";
import { getLesson } from "@/lib/content/grammar";
import type { Mistake } from "@/components/MistakeList";
import type { Exercise } from "@/lib/content/types";
import { markActivity, saveChapterTest, useAppState } from "@/lib/storage";

const TEST_SIZE = 10;

/** Kapiteltest: 10 zufällige Aufgaben aus allen Lektionen des Kapitels. */
export default function ChapterTestPage() {
  const params = useParams<{ id: string; kid: string }>();
  const state = useAppState();
  const chapter = getChapter(params.kid);
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [result, setResult] = useState<{ percent: number; mistakes: Mistake[] } | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!chapter) return;
    // Aus jeder Lektion etwa gleich viele Aufgaben, bevorzugt die schwierigeren (zweite Hälfte)
    const perLesson = Math.ceil(TEST_SIZE / chapter.lessons.length);
    const picked = chapter.lessons.flatMap((slug) => {
      const ex = getLesson(slug)?.exercises ?? [];
      const harder = ex.slice(Math.floor(ex.length / 3));
      return shuffle(harder).slice(0, perLesson);
    });
    setExercises(shuffle(picked).slice(0, TEST_SIZE));
    setResult(null);
  }, [chapter, round]);

  if (!chapter) return <PageHeader title="Dieses Kapitel gibt es nicht." />;
  if (!state || !exercises) return <Loading />;

  const levelChapters = chaptersForLevel(chapter.level);
  const index = levelChapters.findIndex((c) => c.id === chapter.id);
  const nextChapter = levelChapters[index + 1];
  const passed = result !== null && result.percent >= CHAPTER_PASS_PERCENT;

  return (
    <div>
      <Link href={`/stufen/${chapter.level}`} className="mb-6 inline-flex items-center gap-2 text-navy-500 hover:text-navy-700">
        <ArrowLeft className="h-4 w-4" /> Zurück zur Stufe
      </Link>

      <PageHeader eyebrow={`Kapiteltest · Kapitel ${index + 1}`} title={chapter.title}>
        {TEST_SIZE} gemischte Aufgaben aus diesem Kapitel. Bestanden ab {CHAPTER_PASS_PERCENT} % – du kannst den Test jederzeit wiederholen.
      </PageHeader>

      {result === null ? (
        <Panel>
          <ExerciseRunner
            key={round}
            exercises={exercises}
            showSummary={false}
            onFinish={(correct, total, mistakes) => {
              const percent = Math.round((correct / total) * 100);
              saveChapterTest(chapter.id, percent, percent >= CHAPTER_PASS_PERCENT);
              markActivity();
              setResult({ percent, mistakes });
            }}
          />
        </Panel>
      ) : (
        <Panel className="animate-fadeIn text-center">
          <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${passed ? "bg-sage-600 text-white" : "bg-cream-200 text-navy-600"}`}>
            <Award className="h-8 w-8" />
          </span>
          <p className="mt-4 font-serif text-4xl text-navy-800">{result.percent} %</p>
          <p className="mx-auto mt-3 max-w-lg text-lg text-navy-700">
            {passed
              ? `Kapitel ${index + 1} ist geschafft – ein schöner Meilenstein. Alles, was du hier gelernt hast, wird dir in jedem Gespräch begegnen.`
              : `Fast! Zum Bestehen brauchst du ${CHAPTER_PASS_PERCENT} %. Schau dir die Lektionen in Ruhe noch einmal an und versuche es dann erneut – mit neuen Aufgaben.`}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {passed && nextChapter && (
              <LinkButton href={`/grammatik/${nextChapter.lessons[0]}`}>
                Weiter mit Kapitel {index + 2} <ChevronRight className="h-4 w-4" />
              </LinkButton>
            )}
            {passed && !nextChapter && (
              <LinkButton href={`/stufen/${chapter.level}/pruefung`}>
                Zur Abschlussprüfung <ChevronRight className="h-4 w-4" />
              </LinkButton>
            )}
            <Button variant="secondary" onClick={() => setRound((r) => r + 1)}>
              <RotateCcw className="h-4 w-4" /> Neuer Test
            </Button>
          </div>
        </Panel>
      )}
      {result !== null && result.mistakes.length > 0 && (
        <div className="mt-6">
          <MistakeList mistakes={result.mistakes} />
        </div>
      )}
    </div>
  );
}
