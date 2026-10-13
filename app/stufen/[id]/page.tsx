"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Award, Check, ChevronRight, ClipboardCheck, Layers, MessageCircle, PenLine, Target } from "lucide-react";
import { Button, LinkButton, Loading, PageHeader, Panel, ProgressBar } from "@/components/ui";
import { chapterProgress, chaptersForLevel } from "@/lib/content/chapters";
import { getLesson } from "@/lib/content/grammar";
import { getLevel } from "@/lib/content/levels";
import { CHAT_TOPICS, WRITING_TASKS } from "@/lib/content/topics";
import type { Chapter } from "@/lib/content/types";
import { addChapterVocab, setProfile, useAppState, type AppState } from "@/lib/storage";

export default function LevelPage() {
  const params = useParams<{ id: string }>();
  const state = useAppState();
  const id = Math.min(4, Math.max(1, Number(params.id) || 1));
  const level = getLevel(id);
  const chapters = chaptersForLevel(id);

  if (!state) return <Loading />;

  const isCurrent = state.profile.level === id;
  const progress = chapters.map((c) => chapterProgress(c, state));
  const completeCount = progress.filter((p) => p.complete).length;
  const topics = CHAT_TOPICS.slice((id - 1) * 2, (id - 1) * 2 + 4);

  return (
    <div>
      <Link href="/stufen" className="mb-6 inline-flex items-center gap-2 text-navy-500 hover:text-navy-700">
        <ArrowLeft className="h-4 w-4" /> Alle Stufen
      </Link>

      <PageHeader eyebrow={`Stufe ${level.id} · ${level.cefr}`} title={level.title}>
        {level.description}
      </PageHeader>

      {!isCurrent && (
        <Button variant="secondary" className="mb-8" onClick={() => setProfile({ level: id })}>
          Diese Stufe als meine Stufe festlegen
        </Button>
      )}

      {/* Weg durch die Stufe: Kapitel als Etappen */}
      <Panel className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-xl text-navy-800">Dein Weg durch diese Stufe</h2>
          <span className="text-navy-600">
            {completeCount} von {chapters.length} Kapiteln
          </span>
        </div>
        <ol className="mt-5 grid gap-3 sm:grid-cols-4">
          {chapters.map((c, i) => (
            <li key={c.id} className={`rounded-xl px-4 py-3 ${progress[i].complete ? "bg-sage-600 text-white" : "bg-cream-100 text-navy-700"}`}>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Kapitel {i + 1}</p>
              <p className="mt-0.5 font-semibold leading-snug">{c.title}</p>
            </li>
          ))}
          <li className={`rounded-xl px-4 py-3 ${state.exams[id]?.passed ? "bg-sage-600 text-white" : "border-2 border-dashed border-cream-300 text-navy-600"}`}>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Ziel</p>
            <p className="mt-0.5 font-semibold leading-snug">Abschlussprüfung</p>
          </li>
        </ol>
      </Panel>

      <div className="space-y-8">
        {chapters.map((chapter, i) => (
          <ChapterSection key={chapter.id} chapter={chapter} index={i} levelId={id} state={state} />
        ))}
      </div>

      <Panel className="mt-8 border-sage-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                state.exams[id]?.passed ? "bg-sage-600 text-white" : "bg-sage-50 text-sage-700"
              }`}
            >
              <Award className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-serif text-xl text-navy-800">Abschlussprüfung</h2>
              <p className="text-navy-600">
                {state.exams[id]
                  ? `Bestes Ergebnis: ${state.exams[id].percent} %${state.exams[id].passed ? " – bestanden" : ""}`
                  : "Text mit Lücken, Grammatik, Leseverstehen und Wortschatz – alles, was du auf dieser Stufe gelernt hast."}
              </p>
            </div>
          </div>
          <LinkButton href={`/stufen/${id}/pruefung`} variant={state.exams[id]?.passed ? "secondary" : "primary"} className="shrink-0">
            {state.exams[id] ? "Erneut ablegen" : "Zur Prüfung"} <ChevronRight className="h-4 w-4" />
          </LinkButton>
        </div>
      </Panel>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Panel>
          <h2 className="flex items-center gap-2 font-serif text-xl text-navy-800">
            <Target className="h-5 w-5 text-sage-600" /> Das kannst du nach dieser Stufe
          </h2>
          <ul className="mt-4 space-y-2">
            {level.goals.map((g) => (
              <li key={g} className="flex gap-2 text-navy-700">
                <Check className="mt-1 h-4 w-4 shrink-0 text-sage-500" /> {g}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h2 className="flex items-center gap-2 font-serif text-xl text-navy-800">
            <MessageCircle className="h-5 w-5 text-sage-600" /> Gesprächsideen
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {topics.map((t) => (
              <Link key={t.label} href={`/gespraech?thema=${encodeURIComponent(t.label)}`} className="chip">
                {t.label}
              </Link>
            ))}
          </div>
          <h3 className="mt-6 flex items-center gap-2 font-semibold text-navy-800">
            <PenLine className="h-4 w-4 text-sage-600" /> Schreibaufgaben
          </h3>
          <ul className="mt-2 space-y-1.5">
            {WRITING_TASKS[id].slice(0, 3).map((task) => (
              <li key={task}>
                <Link href={`/schreiben?aufgabe=${encodeURIComponent(task)}`} className="text-navy-600 underline-offset-4 hover:text-sage-700 hover:underline">
                  {task}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function ChapterSection({ chapter, index, levelId, state }: { chapter: Chapter; index: number; levelId: number; state: AppState }) {
  const p = chapterProgress(chapter, state);

  return (
    <section className={`rounded-2xl border p-5 sm:p-7 ${p.complete ? "border-sage-300 bg-sage-50/60" : "border-cream-200 bg-white/60"}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sage-600">Kapitel {index + 1}</p>
          <h2 className="font-serif text-2xl text-navy-800">{chapter.title}</h2>
          <p className="mt-1 max-w-2xl text-navy-600">{chapter.description}</p>
        </div>
        {p.complete && (
          <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-sage-600 px-3 py-1 text-sm font-semibold text-white">
            <Check className="h-4 w-4" /> Abgeschlossen
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <ProgressBar value={p.lessonsDone + (p.testPassed ? 1 : 0)} max={p.lessonsTotal + 1} />
        <span className="shrink-0 text-sm text-navy-500">
          {p.lessonsDone}/{p.lessonsTotal} Lektionen
        </span>
      </div>

      <div className="mt-5 space-y-2.5">
        {chapter.lessons.map((slug, i) => {
          const lesson = getLesson(slug);
          if (!lesson) return null;
          const result = state.lessons[slug];
          return (
            <Link
              key={slug}
              href={`/grammatik/${slug}`}
              className="group flex items-center gap-4 rounded-xl border border-cream-200 bg-white px-5 py-3.5 transition-colors hover:border-sage-200"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  result ? "bg-sage-600 text-white" : "bg-cream-100 text-navy-600"
                }`}
              >
                {result ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-navy-800">{lesson.title}</span>
                <span className="block text-[15px] text-navy-600">{lesson.subtitle}</span>
              </span>
              {result && (
                <span className="hidden text-sm text-navy-500 sm:block">
                  {result.correct}/{result.total}
                </span>
              )}
              <ChevronRight className="h-5 w-5 text-navy-500/40 group-hover:text-sage-600" />
            </Link>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-cream-200 bg-white px-5 py-4">
          <p className="flex items-center gap-2 font-semibold text-navy-800">
            <Layers className="h-4 w-4 text-sage-600" /> Wortschatz: {chapter.vocabTitle}
          </p>
          <p className="mt-1 text-[15px] text-navy-500">
            {chapter.vocab.length} Wörter · {chapter.vocab.slice(0, 3).map((v) => v.front).join(", ")} …
          </p>
          {p.vocabAdded ? (
            <p className="mt-3 flex items-center gap-1.5 text-sage-700">
              <Check className="h-4 w-4" /> Im Vokabelkasten
            </p>
          ) : (
            <Button variant="secondary" className="mt-3 !py-2" onClick={() => addChapterVocab(chapter.id, chapter.vocab)}>
              In den Vokabelkasten legen
            </Button>
          )}
        </div>
        <div className="rounded-xl border border-cream-200 bg-white px-5 py-4">
          <p className="flex items-center gap-2 font-semibold text-navy-800">
            <ClipboardCheck className="h-4 w-4 text-sage-600" /> Kapiteltest
          </p>
          <p className="mt-1 text-[15px] text-navy-500">
            {p.testPercent !== null
              ? `Bestes Ergebnis: ${p.testPercent} %${p.testPassed ? " – bestanden" : ""}`
              : "10 gemischte Aufgaben zu allen Lektionen dieses Kapitels."}
          </p>
          <LinkButton
            href={`/stufen/${levelId}/kapitel/${chapter.id}`}
            variant={p.testPassed ? "secondary" : p.lessonsDone === p.lessonsTotal ? "primary" : "secondary"}
            className="mt-3 !py-2"
          >
            {p.testPercent !== null ? "Wiederholen" : "Test starten"}
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
