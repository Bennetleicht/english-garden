"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ArrowLeft, Award, BookOpenText, Clock, Languages, ListChecks, PenLine } from "lucide-react";
import { ExamRunner, PASS_PERCENT } from "@/components/ExamRunner";
import { Button, Loading, PageHeader, Panel } from "@/components/ui";
import { examSize, getExam } from "@/lib/content/exams";
import { lessonsForLevel } from "@/lib/content/grammar";
import { getLevel } from "@/lib/content/levels";
import { DECKS } from "@/lib/content/vocab";
import { formatDayGerman } from "@/lib/dates";
import { useAppState } from "@/lib/storage";

export default function ExamPage() {
  const params = useParams<{ id: string }>();
  const state = useAppState();
  const [started, setStarted] = useState(false);
  const id = Math.min(4, Math.max(1, Number(params.id) || 1));
  const level = getLevel(id);
  const exam = getExam(id);

  if (!state) return <Loading />;
  if (!exam) return <PageHeader title="Für diese Stufe gibt es noch keine Prüfung." />;

  const lessons = lessonsForLevel(id);
  const done = lessons.filter((l) => state.lessons[l.slug]).length;
  const best = state.exams[id];

  return (
    <div>
      <Link href={`/stufen/${id}`} className="mb-6 inline-flex items-center gap-2 text-navy-500 hover:text-navy-700">
        <ArrowLeft className="h-4 w-4" /> Stufe {id}: {level.title}
      </Link>

      {started ? (
        <>
          <PageHeader eyebrow={`Abschlussprüfung · Stufe ${id}`} title={level.title} />
          <ExamRunner exam={exam} deck={DECKS[id].items} />
        </>
      ) : (
        <>
          <PageHeader eyebrow={`Abschlussprüfung · Stufe ${id} · ${level.cefr}`} title="Zeig, was du kannst">
            Diese Prüfung fasst die ganze Stufe zusammen. Sie ist keine Prüfung mit Druck – sondern eine Standortbestimmung: Am
            Ende siehst du genau, was schon sicher sitzt und was du noch einmal anschauen solltest.
          </PageHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <PartCard icon={<PenLine className="h-5 w-5" />} title="Teil 1: Zusammenhängender Text" text={`Eine kurze Geschichte mit ${exam.cloze.gaps.length} Lücken.`} />
            <PartCard icon={<ListChecks className="h-5 w-5" />} title="Teil 2: Grammatik" text={`${exam.grammar.length} gemischte Aufgaben zu allen Themen der Stufe.`} />
            <PartCard icon={<BookOpenText className="h-5 w-5" />} title="Teil 3: Leseverstehen" text={`Ein englischer Text mit ${exam.reading.questions.length} Fragen.`} />
            <PartCard icon={<Languages className="h-5 w-5" />} title="Teil 4: Wortschatz" text="8 Wörter und Wendungen aus dem Wortschatz dieser Stufe." />
          </div>

          <Panel className="mt-6">
            <ul className="space-y-2 text-lg text-navy-700">
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-sage-600" /> Etwa 25–35 Minuten, ohne Zeitbegrenzung · {examSize(exam)} Aufgaben
              </li>
              <li className="flex items-center gap-3">
                <Award className="h-5 w-5 text-sage-600" /> Bestanden ab {PASS_PERCENT} % – du kannst die Prüfung beliebig oft wiederholen
              </li>
            </ul>
            {done < lessons.length && (
              <p className="mt-4 rounded-xl bg-cream-100 px-4 py-3 text-navy-700">
                Du hast {done} von {lessons.length} Lektionen dieser Stufe bearbeitet. Am besten gelingt die Prüfung, wenn du vorher alle
                Lektionen durchgegangen bist – du kannst sie aber jederzeit schon ausprobieren.
              </p>
            )}
            {best && (
              <p className="mt-4 text-navy-600">
                Dein bestes Ergebnis: <strong className="text-navy-800">{best.percent} %</strong>
                {best.passed ? " – bestanden" : ""} ({formatDayGerman(best.day)})
              </p>
            )}
            <Button className="mt-6" onClick={() => setStarted(true)}>
              Prüfung beginnen
            </Button>
          </Panel>
        </>
      )}
    </div>
  );
}

function PartCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-cream-200 bg-white/80 p-5 shadow-soft">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-50 text-sage-700">{icon}</span>
      <div>
        <p className="font-semibold text-navy-800">{title}</p>
        <p className="text-navy-600">{text}</p>
      </div>
    </div>
  );
}
