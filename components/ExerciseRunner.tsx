"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, ChevronRight, RotateCcw, X } from "lucide-react";
import type { Exercise } from "@/lib/content/grammar";
import { Button, ProgressBar } from "./ui";

function normalize(s: string) {
  return s
    .toLowerCase()
    // Apostrophe ignorieren: "dont" zählt wie "don't" (typischer Tipp-Unterschied auf Tablets)
    .replace(/['’`´]/g, "")
    .replace(/[.!?,]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Nicht zufällig schon richtig sortiert anzeigen
  if (arr.length > 1 && arr.every((w, i) => w === items[i])) return [...arr.slice(1), arr[0]];
  return arr;
}

/** Führt nacheinander durch alle Übungen einer Lektion. */
export function ExerciseRunner({ exercises, onFinish }: { exercises: Exercise[]; onFinish: (correct: number, total: number) => void }) {
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState<null | boolean>(null);
  const [done, setDone] = useState(false);

  const exercise = exercises[index];

  const handleResult = (ok: boolean) => {
    setResult(ok);
    if (ok) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    if (index + 1 >= exercises.length) {
      setDone(true);
      onFinish(correctCount, exercises.length);
      return;
    }
    setIndex((i) => i + 1);
    setResult(null);
  };

  const restart = () => {
    setIndex(0);
    setCorrectCount(0);
    setResult(null);
    setDone(false);
  };

  if (done) {
    const all = correctCount === exercises.length;
    return (
      <div className="animate-fadeIn text-center">
        <p className="font-serif text-2xl text-navy-800">
          {correctCount} von {exercises.length} richtig
        </p>
        <p className="mt-2 text-navy-600">
          {all
            ? "Wunderbar – das sitzt."
            : correctCount >= exercises.length / 2
              ? "Gut gemacht. Ein zweiter Durchgang festigt das Gelernte."
              : "Das Thema ist knifflig. Lies die Erklärung in Ruhe noch einmal – dann klappt es beim nächsten Mal besser."}
        </p>
        <Button variant="secondary" className="mt-6" onClick={restart}>
          <RotateCcw className="h-4 w-4" /> Noch einmal üben
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <ProgressBar value={index} max={exercises.length} />
        <span className="shrink-0 text-sm text-navy-500">
          {index + 1} / {exercises.length}
        </span>
      </div>

      <div key={index} className="animate-fadeIn">
        {exercise.type === "gap" && <GapExercise exercise={exercise} locked={result !== null} onResult={handleResult} />}
        {exercise.type === "choice" && <ChoiceExercise exercise={exercise} locked={result !== null} onResult={handleResult} />}
        {exercise.type === "order" && <OrderExercise exercise={exercise} locked={result !== null} onResult={handleResult} />}
      </div>

      {result !== null && (
        <div
          className={`mt-6 flex animate-fadeIn flex-col gap-4 rounded-xl px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
            result ? "bg-sage-50 text-sage-800" : "bg-clay-50 text-clay-600"
          }`}
        >
          <div className="flex gap-3">
            {result ? <Check className="mt-0.5 h-5 w-5 shrink-0" /> : <X className="mt-0.5 h-5 w-5 shrink-0" />}
            <div>
              <p className="font-semibold">{result ? "Richtig!" : "Nicht ganz."}</p>
              {!result && <p className="text-navy-700">Richtig wäre: {solutionText(exercise)}</p>}
              <p className="text-navy-600">{exercise.explanation}</p>
            </div>
          </div>
          <Button onClick={next} className="shrink-0">
            Weiter <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function solutionText(e: Exercise): string {
  if (e.type === "gap") return e.answers[0];
  if (e.type === "choice") return e.options[e.answer];
  return e.words.join(" ");
}

function SentenceWithGap({ sentence, children }: { sentence: string; children: ReactNode }) {
  const [before, after] = sentence.split("___");
  return (
    <p className="text-xl leading-loose text-navy-800 sm:text-2xl">
      {before}
      {children}
      {after}
    </p>
  );
}

function GapExercise({
  exercise,
  locked,
  onResult,
}: {
  exercise: Extract<Exercise, { type: "gap" }>;
  locked: boolean;
  onResult: (ok: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const check = () => {
    if (!value.trim() || locked) return;
    onResult(exercise.answers.some((a) => normalize(a) === normalize(value)));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        check();
      }}
    >
      <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy-500">Lückentext</p>
      <SentenceWithGap sentence={exercise.sentence}>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={locked}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="mx-1 inline-block w-48 rounded-lg border-b-2 border-sage-300 bg-sage-50/60 px-2 py-0.5 text-center focus:border-sage-500 focus:outline-none"
          aria-label="Deine Antwort"
        />
      </SentenceWithGap>
      {exercise.hint && <p className="mt-2 text-navy-500">Tipp: {exercise.hint}</p>}
      {!locked && (
        <Button type="submit" className="mt-6" disabled={!value.trim()}>
          Prüfen
        </Button>
      )}
    </form>
  );
}

function ChoiceExercise({
  exercise,
  locked,
  onResult,
}: {
  exercise: Extract<Exercise, { type: "choice" }>;
  locked: boolean;
  onResult: (ok: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const hasGap = exercise.sentence.includes("___");

  return (
    <div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy-500">Wähle die passende Lösung</p>
      {hasGap ? (
        <SentenceWithGap sentence={exercise.sentence}>
          <span className="mx-1 inline-block min-w-16 border-b-2 border-sage-300 px-2 text-center text-sage-700">
            {picked !== null ? exercise.options[picked] : " "}
          </span>
        </SentenceWithGap>
      ) : (
        <p className="text-xl leading-loose text-navy-800 sm:text-2xl">{exercise.sentence}</p>
      )}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {exercise.options.map((option, i) => {
          const isAnswer = i === exercise.answer;
          const isPicked = i === picked;
          let style = "border-cream-300 bg-white hover:border-sage-300 hover:bg-sage-50";
          if (locked && isAnswer) style = "border-sage-400 bg-sage-50 text-sage-800";
          else if (locked && isPicked) style = "border-clay-400 bg-clay-50 text-clay-600";
          else if (locked) style = "border-cream-200 bg-white opacity-60";
          return (
            <button
              key={i}
              type="button"
              disabled={locked}
              onClick={() => {
                setPicked(i);
                onResult(isAnswer);
              }}
              className={`rounded-xl border px-5 py-3.5 text-left text-lg transition-colors ${style}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OrderExercise({
  exercise,
  locked,
  onResult,
}: {
  exercise: Extract<Exercise, { type: "order" }>;
  locked: boolean;
  onResult: (ok: boolean) => void;
}) {
  // Wörter mit Index, damit doppelte Wörter (z. B. "you … you") eindeutig bleiben
  const [pool, setPool] = useState<{ word: string; id: number }[]>([]);
  const [chosen, setChosen] = useState<{ word: string; id: number }[]>([]);

  useEffect(() => {
    setPool(shuffle(exercise.words.map((word, id) => ({ word, id }))));
    setChosen([]);
  }, [exercise]);

  const pick = (item: { word: string; id: number }) => {
    if (locked) return;
    setPool((p) => p.filter((x) => x.id !== item.id));
    setChosen((c) => [...c, item]);
  };
  const unpick = (item: { word: string; id: number }) => {
    if (locked) return;
    setChosen((c) => c.filter((x) => x.id !== item.id));
    setPool((p) => [...p, item]);
  };
  const check = () => onResult(normalize(chosen.map((c) => c.word).join(" ")) === normalize(exercise.words.join(" ")));

  return (
    <div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy-500">Satzbau</p>
      <p className="text-lg text-navy-600">„{exercise.translation}“</p>

      <div className="mt-5 flex min-h-[64px] flex-wrap gap-2 rounded-xl border-2 border-dashed border-cream-300 bg-cream-50 p-3">
        {chosen.length === 0 && <span className="self-center px-2 text-navy-500/60">Tippe die Wörter in der richtigen Reihenfolge an …</span>}
        {chosen.map((item) => (
          <button key={item.id} type="button" onClick={() => unpick(item)} className="rounded-lg bg-sage-600 px-3.5 py-2 text-lg text-white">
            {item.word}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {pool.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => pick(item)}
            className="rounded-lg border border-cream-300 bg-white px-3.5 py-2 text-lg text-navy-800 hover:border-sage-300 hover:bg-sage-50"
          >
            {item.word}
          </button>
        ))}
      </div>

      {!locked && (
        <Button className="mt-6" onClick={check} disabled={pool.length > 0}>
          Prüfen
        </Button>
      )}
    </div>
  );
}
