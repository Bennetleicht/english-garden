"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Check, ChevronRight, Layers, MessageCircle, PenLine, Target } from "lucide-react";
import { Button, Loading, PageHeader, Panel } from "@/components/ui";
import { lessonsForLevel } from "@/lib/content/grammar";
import { getLevel } from "@/lib/content/levels";
import { CHAT_TOPICS, WRITING_TASKS } from "@/lib/content/topics";
import { DECKS } from "@/lib/content/vocab";
import { addCards, setProfile, updateState, useAppState } from "@/lib/storage";

export default function LevelPage() {
  const params = useParams<{ id: string }>();
  const state = useAppState();
  const id = Math.min(4, Math.max(1, Number(params.id) || 1));
  const level = getLevel(id);
  const lessons = lessonsForLevel(id);
  const deck = DECKS[id];

  if (!state) return <Loading />;

  const isCurrent = state.profile.level === id;
  const deckAdded = state.addedDecks.includes(id);
  // Themen leicht nach Stufe variieren
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

      <Panel className="mb-6">
        <h2 className="flex items-center gap-2 font-serif text-xl text-navy-800">
          <Target className="h-5 w-5 text-sage-600" /> Das kannst du nach dieser Stufe
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {level.goals.map((g) => (
            <li key={g} className="flex gap-2 text-navy-700">
              <Check className="mt-1 h-4 w-4 shrink-0 text-sage-500" /> {g}
            </li>
          ))}
        </ul>
      </Panel>

      <section className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 font-serif text-xl text-navy-800">
          <BookOpen className="h-5 w-5 text-sage-600" /> Grammatik
        </h2>
        <div className="space-y-3">
          {lessons.map((lesson, i) => {
            const result = state.lessons[lesson.slug];
            return (
              <Link
                key={lesson.slug}
                href={`/grammatik/${lesson.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-cream-200 bg-white/80 px-5 py-4 transition-colors hover:border-sage-200"
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
                  <span className="block text-navy-600">{lesson.subtitle}</span>
                </span>
                {result && (
                  <span className="hidden text-sm text-navy-500 sm:block">
                    {result.correct}/{result.total} richtig
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-navy-500/40 group-hover:text-sage-600" />
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel>
          <h2 className="flex items-center gap-2 font-serif text-xl text-navy-800">
            <Layers className="h-5 w-5 text-sage-600" /> Wortschatz: {deck.title}
          </h2>
          <p className="mt-2 text-navy-600">{deck.items.length} wichtige Wörter und Wendungen für diese Stufe.</p>
          <p className="mt-3 text-navy-500">
            {deck.items
              .slice(0, 5)
              .map((i) => i.front)
              .join(" · ")}{" "}
            …
          </p>
          {deckAdded ? (
            <p className="mt-5 flex items-center gap-2 font-semibold text-sage-700">
              <Check className="h-5 w-5" /> Im Vokabelkasten
            </p>
          ) : (
            <Button
              className="mt-5"
              onClick={() => {
                addCards(deck.items, "start");
                updateState((s) => ({ ...s, addedDecks: [...s.addedDecks, id] }));
              }}
            >
              In den Vokabelkasten legen
            </Button>
          )}
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
