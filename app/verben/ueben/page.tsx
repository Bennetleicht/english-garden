"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type Ref } from "react";
import { ArrowLeft, Check, ChevronRight, Lightbulb, RotateCcw, X } from "lucide-react";
import { MistakeList, type Mistake } from "@/components/MistakeList";
import { SpeakButton } from "@/components/SpeakButton";
import { Button, LinkButton, Loading, PageHeader, Panel, ProgressBar } from "@/components/ui";
import { matchesAny } from "@/lib/answers";
import type { IrregularVerb } from "@/lib/content/verbs";
import { getState, markActivity, recordVerb, useAppState } from "@/lib/storage";
import { buildVerbRound, VERB_SET_LABEL, type VerbSet } from "@/lib/verb-trainer";

interface Answer {
  past: string;
  pp: string;
  pastOk: boolean;
  ppOk: boolean;
}

export default function VerbTrainerPage() {
  const state = useAppState();
  const [set, setSet] = useState<VerbSet>("basic");
  const [round, setRound] = useState<IrregularVerb[] | null>(null);
  const [index, setIndex] = useState(0);
  const [past, setPast] = useState("");
  const [pp, setPp] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const pastRef = useRef<HTMLInputElement>(null);

  const start = (chosen: VerbSet) => {
    setRound(buildVerbRound(chosen, getState().verbs));
    setIndex(0);
    setPast("");
    setPp("");
    setAnswer(null);
    setMistakes([]);
    setCorrect(0);
    setDone(false);
  };

  useEffect(() => {
    if (!state || round) return;
    const fromUrl = new URLSearchParams(window.location.search).get("set") as VerbSet | null;
    const chosen = fromUrl && fromUrl in VERB_SET_LABEL ? fromUrl : "basic";
    setSet(chosen);
    start(chosen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (!answer) pastRef.current?.focus();
  }, [index, answer]);

  if (!state || !round) return <Loading />;

  const verb = round[index];

  const check = () => {
    if (!verb || answer) return;
    const result: Answer = { past, pp, pastOk: matchesAny(past, verb.past), ppOk: matchesAny(pp, verb.pp) };
    const ok = result.pastOk && result.ppOk;
    setAnswer(result);
    recordVerb(verb.inf, ok);
    markActivity();
    if (ok) setCorrect((c) => c + 1);
    else
      setMistakes((m) => [
        ...m,
        {
          prompt: `${verb.inf} (${verb.de})`,
          given: `${past || "–"} – ${pp || "–"}`,
          solution: `${verb.past.join("/")} – ${verb.pp.join("/")}`,
          explanation: verb.note,
        },
      ]);
  };

  const next = () => {
    if (index + 1 >= round.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPast("");
    setPp("");
    setAnswer(null);
  };

  return (
    <div>
      <Link href="/verben" className="mb-6 inline-flex items-center gap-2 text-navy-500 hover:text-navy-700">
        <ArrowLeft className="h-4 w-4" /> Unregelmäßige Verben
      </Link>
      <PageHeader eyebrow={`Verben-Training · ${VERB_SET_LABEL[set]}`} title={done ? "Runde geschafft" : "Wie heißen die Formen?"} />

      {done ? (
        <div className="space-y-6">
          <Panel className="text-center">
            <p className="font-serif text-4xl text-navy-800">
              {correct} von {round.length}
            </p>
            <p className="mt-2 text-lg text-navy-600">
              {correct === round.length
                ? "Perfekt – alle Formen richtig."
                : correct >= round.length * 0.7
                  ? "Sehr gut! Die falschen Verben kommen in der nächsten Runde wieder."
                  : "Unregelmäßige Verben brauchen Wiederholung – genau dafür ist das Training da. Bleib dran!"}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => start(set)}>
                <RotateCcw className="h-4 w-4" /> Nächste Runde
              </Button>
              <LinkButton href="/verben" variant="secondary">
                Zur Übersicht
              </LinkButton>
            </div>
          </Panel>
          <MistakeList mistakes={mistakes} />
        </div>
      ) : verb ? (
        <Panel>
          <div className="mb-6 flex items-center gap-4">
            <ProgressBar value={index} max={round.length} />
            <span className="shrink-0 text-sm text-navy-500">
              {index + 1} / {round.length}
            </span>
          </div>

          <div className="text-center">
            <p className="font-serif text-4xl text-navy-800">{verb.inf}</p>
            <p className="mt-1 text-lg text-navy-600">{verb.de}</p>
          </div>

          <form
            className="mx-auto mt-6 grid max-w-xl gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (answer) next();
              else check();
            }}
          >
            <FormField
              label="Past Simple"
              value={past}
              onChange={setPast}
              inputRef={pastRef}
              state={answer ? (answer.pastOk ? "ok" : "wrong") : null}
              solution={verb.past.join(" / ")}
            />
            <FormField label="Past Participle" value={pp} onChange={setPp} state={answer ? (answer.ppOk ? "ok" : "wrong") : null} solution={verb.pp.join(" / ")} />

            {answer && (
              <div
                className={`flex flex-col gap-2 rounded-xl px-5 py-4 sm:col-span-2 ${
                  answer.pastOk && answer.ppOk ? "bg-sage-50 text-sage-800" : "bg-clay-50 text-clay-600"
                }`}
              >
                <p className="flex items-center gap-2 font-semibold">
                  {answer.pastOk && answer.ppOk ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                  {answer.pastOk && answer.ppOk ? "Richtig!" : "Nicht ganz – merk dir:"}
                </p>
                <p className="text-lg text-navy-800">
                  {verb.inf} – {verb.past.join("/")} – {verb.pp.join("/")}
                </p>
                {verb.note && (
                  <p className="flex gap-2 text-navy-600">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-cream-400" /> {verb.note}
                  </p>
                )}
                <SpeakButton text={`${verb.inf}, ${verb.past[0]}, ${verb.pp[0]}`} label="Anhören" className="self-start" />
              </div>
            )}

            <div className="sm:col-span-2">
              {answer ? (
                <Button type="submit" className="w-full sm:w-auto">
                  Weiter <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="w-full sm:w-auto" disabled={!past.trim() && !pp.trim()}>
                  Prüfen
                </Button>
              )}
            </div>
          </form>
        </Panel>
      ) : (
        <Panel>
          <p className="text-lg text-navy-600">In dieser Auswahl gibt es gerade keine Verben zum Üben.</p>
        </Panel>
      )}
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  state,
  solution,
  inputRef,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  state: "ok" | "wrong" | null;
  solution: string;
  inputRef?: Ref<HTMLInputElement>;
}) {
  const border = state === "ok" ? "!border-sage-500 !bg-sage-50" : state === "wrong" ? "!border-clay-400 !bg-clay-50" : "";
  return (
    <label className="block">
      <span className="mb-1.5 block font-semibold text-navy-700">{label}</span>
      <input
        ref={inputRef}
        className={`field ${border}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={state !== null}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {state === "wrong" && <span className="mt-1 block text-sage-700">Richtig: {solution}</span>}
    </label>
  );
}
