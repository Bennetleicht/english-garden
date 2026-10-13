"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Award, Check, ChevronRight, RotateCcw, X } from "lucide-react";
import { matchesAny, normalizeAnswer, shuffle, shuffleWords } from "@/lib/answers";
import { getLesson } from "@/lib/content/grammar";
import type { Exam, ExamExercise } from "@/lib/content/types";
import type { VocabItem } from "@/lib/content/vocab";
import { markActivity, saveExamResult } from "@/lib/storage";
import { Button, LinkButton, Panel, ProgressBar } from "./ui";

export const PASS_PERCENT = 70;

interface VocabQuestion {
  front: string;
  options: string[];
  answer: number;
}

/** Ein bewertetes Element für die Auswertung. */
interface Scored {
  category: string; // Lektions-slug, "lesen" oder "wortschatz"
  prompt: string;
  given: string;
  solution: string;
  explanation: string;
  correct: boolean;
}

const PARTS = ["Zusammenhängender Text", "Grammatik", "Leseverstehen", "Wortschatz"];

export function ExamRunner({ exam, deck }: { exam: Exam; deck: VocabItem[] }) {
  const [part, setPart] = useState(0);
  const [cloze, setCloze] = useState<Record<number, string>>({}); // Index der Lücke → Antwort (Text oder Options-Index)
  const [grammar, setGrammar] = useState<Record<number, string>>({});
  const [reading, setReading] = useState<Record<number, number>>({});
  const [vocab, setVocab] = useState<Record<number, number>>({});
  const [vocabQuestions, setVocabQuestions] = useState<VocabQuestion[]>([]);
  const [results, setResults] = useState<Scored[] | null>(null);

  // Wortschatzfragen aus dem Startwortschatz der Stufe – zufällig, deshalb erst im Browser erzeugen
  useEffect(() => {
    const picked = shuffle(deck).slice(0, 8);
    setVocabQuestions(
      picked.map((item) => {
        const wrong = shuffle(deck.filter((d) => d.front !== item.front)).slice(0, 3).map((d) => d.back);
        const options = shuffle([item.back, ...wrong]);
        return { front: item.front, options, answer: options.indexOf(item.back) };
      }),
    );
  }, [deck]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [part, results]);

  const finish = () => {
    const scored: Scored[] = [];

    exam.cloze.gaps.forEach((gap, i) => {
      const given = cloze[i] ?? "";
      const correct = gap.options ? given !== "" && Number(given) === gap.answer : matchesAny(given, gap.answers ?? []);
      scored.push({
        category: gap.lesson,
        prompt: `Text, Lücke ${i + 1}${gap.hint ? ` ${gap.hint}` : ""}`,
        given: gap.options ? (given !== "" ? gap.options[Number(given)] : "") : given,
        solution: gap.options ? gap.options[gap.answer ?? 0] : (gap.answers ?? [])[0] ?? "",
        explanation: gap.explanation,
        correct,
      });
    });

    exam.grammar.forEach((ex, i) => {
      const given = grammar[i] ?? "";
      scored.push({ category: ex.lesson, ...scoreExercise(ex, given) });
    });

    exam.reading.questions.forEach((q, i) => {
      const given = reading[i];
      scored.push({
        category: "lesen",
        prompt: q.question,
        given: given !== undefined ? q.options[given] : "",
        solution: q.options[q.answer],
        explanation: q.explanation,
        correct: given === q.answer,
      });
    });

    vocabQuestions.forEach((q, i) => {
      const given = vocab[i];
      scored.push({
        category: "wortschatz",
        prompt: q.front,
        given: given !== undefined ? q.options[given] : "",
        solution: q.options[q.answer],
        explanation: "",
        correct: given === q.answer,
      });
    });

    const percent = Math.round((scored.filter((s) => s.correct).length / scored.length) * 100);
    saveExamResult(exam.level, percent, percent >= PASS_PERCENT);
    markActivity();
    setResults(scored);
  };

  const restart = () => {
    setCloze({});
    setGrammar({});
    setReading({});
    setVocab({});
    setResults(null);
    setPart(0);
  };

  if (results) return <ExamResults level={exam.level} results={results} onRestart={restart} />;

  return (
    <div>
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {PARTS.map((p, i) => (
            <span key={p} className={i === part ? "font-semibold text-sage-700" : i < part ? "text-navy-600" : "text-navy-500/60"}>
              Teil {i + 1}: {p}
            </span>
          ))}
        </div>
        <ProgressBar value={part} max={PARTS.length} />
      </div>

      <div key={part} className="animate-fadeIn">
        {part === 0 && <ClozePart exam={exam} values={cloze} onChange={(i, v) => setCloze((c) => ({ ...c, [i]: v }))} />}
        {part === 1 && <GrammarPart items={exam.grammar} values={grammar} onChange={(i, v) => setGrammar((g) => ({ ...g, [i]: v }))} />}
        {part === 2 && <ReadingPart exam={exam} values={reading} onChange={(i, v) => setReading((r) => ({ ...r, [i]: v }))} />}
        {part === 3 && <VocabPart questions={vocabQuestions} values={vocab} onChange={(i, v) => setVocab((x) => ({ ...x, [i]: v }))} />}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        {part > 0 ? (
          <Button variant="ghost" onClick={() => setPart((p) => p - 1)}>
            <ArrowLeft className="h-4 w-4" /> Zurück
          </Button>
        ) : (
          <span />
        )}
        {part < PARTS.length - 1 ? (
          <Button onClick={() => setPart((p) => p + 1)}>
            Weiter zu Teil {part + 2} <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={finish}>
            Prüfung abgeben <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function scoreExercise(ex: ExamExercise, given: string): Omit<Scored, "category"> {
  if (ex.type === "gap") {
    return {
      prompt: ex.sentence.replace("___", "_____"),
      given,
      solution: ex.answers[0],
      explanation: ex.explanation,
      correct: matchesAny(given, ex.answers),
    };
  }
  if (ex.type === "choice") {
    return {
      prompt: ex.sentence.replace("___", "_____"),
      given: given !== "" ? ex.options[Number(given)] : "",
      solution: ex.options[ex.answer],
      explanation: ex.explanation,
      correct: given !== "" && Number(given) === ex.answer,
    };
  }
  return {
    prompt: `Satzbau: „${ex.translation}“`,
    given,
    solution: ex.words.join(" "),
    explanation: ex.explanation,
    correct: given !== "" && normalizeAnswer(given) === normalizeAnswer(ex.words.join(" ")),
  };
}

/* ------------------------------------------------------------------ Teile */

function PartHeader({ title, intro }: { title: string; intro: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-serif text-2xl text-navy-800">{title}</h2>
      <p className="mt-1 text-lg text-navy-600">{intro}</p>
    </div>
  );
}

const inlineInput =
  "mx-1 inline-block w-36 rounded-lg border-b-2 border-sage-300 bg-sage-50/60 px-2 py-0.5 text-center text-navy-800 focus:border-sage-500 focus:outline-none";

function ClozePart({ exam, values, onChange }: { exam: Exam; values: Record<number, string>; onChange: (i: number, v: string) => void }) {
  const { cloze } = exam;
  return (
    <div>
      <PartHeader title="Teil 1: Zusammenhängender Text" intro={cloze.intro} />
      <Panel>
        <h3 className="mb-4 font-serif text-2xl text-navy-800">{cloze.title}</h3>
        <div className="space-y-5 text-lg leading-[2.4] text-navy-800">
          {cloze.text.split(/\n\n+/).map((paragraph, p) => (
            <p key={p}>
              {paragraph.split(/\{(\d+)\}/).map((piece, k) => {
                if (k % 2 === 0) return <Fragment key={k}>{piece}</Fragment>;
                const i = Number(piece) - 1;
                const gap = cloze.gaps[i];
                if (!gap) return null;
                return (
                  <span key={k} className="whitespace-nowrap">
                    <sup className="mr-0.5 text-xs text-navy-500">{i + 1}</sup>
                    {gap.options ? (
                      <select
                        value={values[i] ?? ""}
                        onChange={(e) => onChange(i, e.target.value)}
                        className="mx-1 rounded-lg border border-sage-300 bg-sage-50/60 px-2 py-1 text-base text-navy-800 focus:outline-none focus:ring-2 focus:ring-sage-200"
                        aria-label={`Lücke ${i + 1}`}
                      >
                        <option value="">…</option>
                        {gap.options.map((o, oi) => (
                          <option key={oi} value={oi}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={values[i] ?? ""}
                        onChange={(e) => onChange(i, e.target.value)}
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                        className={inlineInput}
                        aria-label={`Lücke ${i + 1}`}
                      />
                    )}
                    {gap.hint && <span className="text-base text-navy-500">{gap.hint}</span>}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function GrammarPart({ items, values, onChange }: { items: ExamExercise[]; values: Record<number, string>; onChange: (i: number, v: string) => void }) {
  return (
    <div>
      <PartHeader title="Teil 2: Grammatik" intro="Ergänze die Sätze, wähle die passende Lösung oder bilde den Satz. Du erfährst erst am Ende, was richtig war." />
      <ol className="space-y-4">
        {items.map((ex, i) => (
          <li key={i} className="rounded-2xl border border-cream-200 bg-white/80 p-5 shadow-soft">
            <p className="mb-2 text-sm font-semibold text-navy-500">{i + 1}.</p>
            {ex.type === "gap" && <GapItem sentence={ex.sentence} hint={ex.hint} value={values[i] ?? ""} onChange={(v) => onChange(i, v)} />}
            {ex.type === "choice" && <ChoiceItem sentence={ex.sentence} options={ex.options} value={values[i] ?? ""} onChange={(v) => onChange(i, v)} />}
            {ex.type === "order" && <OrderItem words={ex.words} translation={ex.translation} value={values[i] ?? ""} onChange={(v) => onChange(i, v)} />}
          </li>
        ))}
      </ol>
    </div>
  );
}

function GapItem({ sentence, hint, value, onChange }: { sentence: string; hint?: string; value: string; onChange: (v: string) => void }) {
  const [before, after] = sentence.split("___");
  return (
    <div>
      <p className="text-lg leading-loose text-navy-800">
        {before}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className={inlineInput}
          aria-label="Deine Antwort"
        />
        {after}
      </p>
      {hint && <p className="text-navy-500">Tipp: {hint}</p>}
    </div>
  );
}

function ChoiceItem({ sentence, options, value, onChange }: { sentence: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-lg text-navy-800">{sentence.replace("___", "_____")}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o, oi) => (
          <button
            key={oi}
            type="button"
            onClick={() => onChange(String(oi))}
            className={`rounded-xl border px-4 py-2 text-left text-lg transition-colors ${
              value === String(oi) ? "border-sage-500 bg-sage-100 text-sage-800" : "border-cream-300 bg-white hover:border-sage-300"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function OrderItem({
  words,
  translation,
  value,
  onChange,
}: {
  words: string[];
  translation: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [pool, setPool] = useState<{ word: string; id: number }[]>([]);
  const [chosen, setChosen] = useState<{ word: string; id: number }[]>([]);

  // Bereits gegebene Antwort wiederherstellen (z. B. nach „Zurück“), Rest gemischt anzeigen
  useEffect(() => {
    const remaining = words.map((word, id) => ({ word, id }));
    const restored: { word: string; id: number }[] = [];
    for (const w of value ? value.split(" ") : []) {
      const idx = remaining.findIndex((x) => x.word === w);
      if (idx >= 0) restored.push(remaining.splice(idx, 1)[0]);
    }
    setChosen(restored);
    setPool(shuffleWords(remaining));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words]);

  const update = (next: { word: string; id: number }[]) => {
    setChosen(next);
    onChange(next.map((c) => c.word).join(" "));
  };

  return (
    <div>
      <p className="text-lg text-navy-600">Bilde den Satz: „{translation}“</p>
      <div className="mt-3 flex min-h-[52px] flex-wrap gap-2 rounded-xl border-2 border-dashed border-cream-300 bg-cream-50 p-2.5">
        {chosen.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              update(chosen.filter((x) => x.id !== item.id));
              setPool((p) => [...p, item]);
            }}
            className="rounded-lg bg-sage-600 px-3 py-1.5 text-white"
          >
            {item.word}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {pool.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setPool((p) => p.filter((x) => x.id !== item.id));
              update([...chosen, item]);
            }}
            className="rounded-lg border border-cream-300 bg-white px-3 py-1.5 text-navy-800 hover:border-sage-300"
          >
            {item.word}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReadingPart({ exam, values, onChange }: { exam: Exam; values: Record<number, number>; onChange: (i: number, v: number) => void }) {
  const { reading } = exam;
  return (
    <div>
      <PartHeader title="Teil 3: Leseverstehen" intro={reading.intro} />
      <Panel>
        <h3 className="mb-4 font-serif text-2xl text-navy-800">{reading.title}</h3>
        <div className="space-y-4 text-lg leading-relaxed text-navy-800">
          {reading.text.split(/\n\n+/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </Panel>
      <ol className="mt-6 space-y-4">
        {reading.questions.map((q, i) => (
          <li key={i} className="rounded-2xl border border-cream-200 bg-white/80 p-5 shadow-soft">
            <p className="text-lg font-semibold text-navy-800">
              {i + 1}. {q.question}
            </p>
            <div className="mt-3 grid gap-2">
              {q.options.map((o, oi) => (
                <button
                  key={oi}
                  type="button"
                  onClick={() => onChange(i, oi)}
                  className={`rounded-xl border px-4 py-2.5 text-left text-lg transition-colors ${
                    values[i] === oi ? "border-sage-500 bg-sage-100 text-sage-800" : "border-cream-300 bg-white hover:border-sage-300"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function VocabPart({ questions, values, onChange }: { questions: VocabQuestion[]; values: Record<number, number>; onChange: (i: number, v: number) => void }) {
  return (
    <div>
      <PartHeader title="Teil 4: Wortschatz" intro="Was bedeuten diese Wörter und Wendungen? Wähle die passende Übersetzung." />
      <ol className="grid gap-4 sm:grid-cols-2">
        {questions.map((q, i) => (
          <li key={i} className="rounded-2xl border border-cream-200 bg-white/80 p-5 shadow-soft">
            <p className="font-serif text-xl text-navy-800">{q.front}</p>
            <div className="mt-3 grid gap-2">
              {q.options.map((o, oi) => (
                <button
                  key={oi}
                  type="button"
                  onClick={() => onChange(i, oi)}
                  className={`rounded-xl border px-4 py-2 text-left transition-colors ${
                    values[i] === oi ? "border-sage-500 bg-sage-100 text-sage-800" : "border-cream-300 bg-white hover:border-sage-300"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ Auswertung */

function categoryLabel(category: string): string {
  if (category === "lesen") return "Leseverstehen";
  if (category === "wortschatz") return "Wortschatz";
  return getLesson(category)?.title ?? category;
}

function ExamResults({ level, results, onRestart }: { level: number; results: Scored[]; onRestart: () => void }) {
  const correct = results.filter((r) => r.correct).length;
  const percent = Math.round((correct / results.length) * 100);
  const passed = percent >= PASS_PERCENT;

  const categories = Array.from(new Set(results.map((r) => r.category))).map((category) => {
    const items = results.filter((r) => r.category === category);
    const ok = items.filter((r) => r.correct).length;
    return { category, ok, total: items.length, percent: Math.round((ok / items.length) * 100) };
  });
  const toRepeat = categories.filter((c) => c.percent < PASS_PERCENT && getLesson(c.category));
  const mistakes = results.filter((r) => !r.correct);

  return (
    <div className="animate-fadeIn space-y-6">
      <Panel className="text-center">
        <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${passed ? "bg-sage-600 text-white" : "bg-cream-200 text-navy-600"}`}>
          <Award className="h-8 w-8" />
        </span>
        <p className="mt-4 font-serif text-4xl text-navy-800">{percent} %</p>
        <p className="mt-1 text-lg text-navy-600">
          {correct} von {results.length} Aufgaben richtig
        </p>
        <p className="mx-auto mt-4 max-w-xl text-lg text-navy-700">
          {passed
            ? level < 4
              ? `Herzlichen Glückwunsch – du hast Stufe ${level} bestanden! Du bist bereit für die nächste Stufe.`
              : "Herzlichen Glückwunsch – du hast die letzte Stufe bestanden! Dein Englisch steht auf einem wirklich soliden Fundament."
            : `Zum Bestehen brauchst du ${PASS_PERCENT} %. Das ist kein Grund zur Sorge: Wiederhole in Ruhe die Themen unten – dann klappt es beim nächsten Versuch.`}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {passed && level < 4 && (
            <LinkButton href={`/stufen/${level + 1}`}>
              Weiter zu Stufe {level + 1} <ChevronRight className="h-4 w-4" />
            </LinkButton>
          )}
          <Button variant="secondary" onClick={onRestart}>
            <RotateCcw className="h-4 w-4" /> Prüfung wiederholen
          </Button>
        </div>
      </Panel>

      <Panel>
        <h2 className="font-serif text-xl text-navy-800">Ergebnis nach Themen</h2>
        <ul className="mt-4 space-y-3">
          {categories.map((c) => (
            <li key={c.category}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-navy-800">{categoryLabel(c.category)}</span>
                <span className={`text-sm font-semibold ${c.percent >= PASS_PERCENT ? "text-sage-700" : "text-clay-600"}`}>
                  {c.ok}/{c.total}
                </span>
              </div>
              <ProgressBar value={c.ok} max={c.total} className="mt-1.5" />
            </li>
          ))}
        </ul>
      </Panel>

      {toRepeat.length > 0 && (
        <Panel>
          <h2 className="font-serif text-xl text-navy-800">Diese Lektionen solltest du wiederholen</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {toRepeat.map((c) => (
              <Link key={c.category} href={`/grammatik/${c.category}`} className="chip">
                {categoryLabel(c.category)}
              </Link>
            ))}
          </div>
        </Panel>
      )}

      {mistakes.length > 0 && (
        <Panel>
          <h2 className="font-serif text-xl text-navy-800">Deine Fehler mit Lösung</h2>
          <ul className="mt-4 divide-y divide-cream-200">
            {mistakes.map((m, i) => (
              <li key={i} className="py-3.5">
                <p className="text-navy-800">{m.prompt}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1 text-clay-600">
                    <X className="h-4 w-4" /> {m.given || "keine Antwort"}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-sage-700">
                    <Check className="h-4 w-4" /> {m.solution}
                  </span>
                </p>
                {m.explanation && <p className="mt-1 text-navy-600">{m.explanation}</p>}
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
