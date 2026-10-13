"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { BookOpen, CalendarDays, ChevronRight, Compass, Layers, Leaf, MessageCircle, PenLine } from "lucide-react";
import { Button, Loading, Panel, ProgressBar } from "@/components/ui";
import { lessonsForLevel } from "@/lib/content/grammar";
import { getLevel } from "@/lib/content/levels";
import { WRITING_TASKS } from "@/lib/content/topics";
import { computeStreak, formatDayGerman, greeting, isInCurrentWeek, parseDay, today } from "@/lib/dates";
import { dueCount } from "@/lib/srs";
import { setProfile, useAppState } from "@/lib/storage";

export default function HomePage() {
  const state = useAppState();
  const [nameInput, setNameInput] = useState("");

  if (!state) return <Loading />;

  const { profile } = state;

  if (!profile.name) {
    return (
      <div className="animate-fadeIn py-6">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-sage-600">Willkommen</p>
        <h1 className="font-serif text-4xl leading-tight text-navy-800 sm:text-5xl">Dein ruhiger Ort zum Englischlernen.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-600">
          Hier lernst du in deinem eigenen Tempo – mit klaren Grammatik-Erklärungen auf Deutsch, einem Vokabelkasten, der sich
          merkt, was dir schwerfällt, und einem geduldigen Gesprächspartner, mit dem du jederzeit Englisch sprechen kannst.
        </p>
        <Panel className="mt-10 max-w-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (nameInput.trim()) setProfile({ name: nameInput.trim() });
            }}
          >
            <label htmlFor="name" className="block font-serif text-xl text-navy-800">
              Wie dürfen wir dich nennen?
            </label>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input id="name" className="field" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Dein Vorname" autoFocus />
              <Button type="submit" disabled={!nameInput.trim()}>
                Los geht&apos;s
              </Button>
            </div>
          </form>
        </Panel>
      </div>
    );
  }

  const level = getLevel(profile.level);
  const levelLessons = lessonsForLevel(profile.level);
  const doneLessons = levelLessons.filter((l) => state.lessons[l.slug]);
  const nextLesson = levelLessons.find((l) => !state.lessons[l.slug]) ?? levelLessons[0];
  const due = dueCount(state.cards);
  const { count: streak, learnedToday } = computeStreak(state.activityDays);

  const weekday = parseDay(today()).getDay(); // 0 = So, 5 = Fr, 6 = Sa
  const weekCards = state.cards.filter((c) => isInCurrentWeek(c.createdAt) || c.history.some((h) => isInCurrentWeek(h.day)));
  const showWeekly = (weekday === 0 || weekday >= 5) && weekCards.length > 0;

  const tasks = WRITING_TASKS[profile.level] ?? WRITING_TASKS[1];
  const dayIndex = Math.floor(parseDay(today()).getTime() / 86_400_000);
  const taskOfDay = tasks[dayIndex % tasks.length];

  return (
    <div className="animate-fadeIn">
      <header className="mb-10">
        <p className="text-navy-500">{formatDayGerman(today())}</p>
        <h1 className="mt-1 font-serif text-4xl text-navy-800 sm:text-5xl">
          {greeting()}, {profile.name}.
        </h1>
        <p className="mt-3 flex items-center gap-2 text-lg text-navy-600">
          <Leaf className="h-5 w-5 text-sage-500" aria-hidden />
          {streak > 0
            ? `Tag ${streak} in Folge${learnedToday ? " – du hast heute schon gelernt." : "."}`
            : "Schön, dass du da bist. Fang ganz entspannt an."}
        </p>
      </header>

      {!profile.placementDone && (
        <Link
          href="/einstufung"
          className="mb-8 flex items-center gap-4 rounded-2xl border border-sage-200 bg-sage-50 px-6 py-5 transition-colors hover:bg-sage-100"
        >
          <Compass className="h-7 w-7 shrink-0 text-sage-600" aria-hidden />
          <div className="flex-1">
            <p className="font-semibold text-navy-800">Finde deinen Startpunkt</p>
            <p className="text-navy-600">16 kurze Fragen, etwa 5 Minuten – danach empfehlen wir dir die passende Stufe.</p>
          </div>
          <ChevronRight className="h-5 w-5 text-sage-600" aria-hidden />
        </Link>
      )}

      {showWeekly && (
        <Link
          href="/vokabeln/woche"
          className="mb-8 flex items-center gap-4 rounded-2xl border border-cream-300 bg-cream-100 px-6 py-5 transition-colors hover:bg-cream-200"
        >
          <CalendarDays className="h-7 w-7 shrink-0 text-cream-400" aria-hidden />
          <div className="flex-1">
            <p className="font-semibold text-navy-800">Dein Wochenrückblick ist bereit</p>
            <p className="text-navy-600">Schau dir an, was du diese Woche gelernt hast – {weekCards.length} Wörter und Sätze.</p>
          </div>
          <ChevronRight className="h-5 w-5 text-navy-500" aria-hidden />
        </Link>
      )}

      <h2 className="mb-4 font-serif text-2xl text-navy-800">Heute für dich</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <TodayCard
          href="/vokabeln/lernen"
          icon={<Layers className="h-6 w-6" />}
          title="Vokabeln wiederholen"
          text={
            due > 0
              ? `${due} ${due === 1 ? "Karte wartet" : "Karten warten"} auf dich.`
              : state.cards.length === 0
                ? "Dein Vokabelkasten ist noch leer – leg ein paar Wörter hinein."
                : "Alles wiederholt. Wunderbar."
          }
          highlight={due > 0}
        />
        <TodayCard
          href={`/grammatik/${nextLesson.slug}`}
          icon={<BookOpen className="h-6 w-6" />}
          title={state.lessons[nextLesson.slug] ? "Grammatik auffrischen" : "Nächste Lektion"}
          text={`${nextLesson.title} – ${nextLesson.subtitle}`}
        />
        <TodayCard
          href="/gespraech"
          icon={<MessageCircle className="h-6 w-6" />}
          title="Ein kleines Gespräch"
          text="Plaudere ein paar Minuten auf Englisch – sprechend oder schreibend."
        />
        <TodayCard
          href={`/schreiben?aufgabe=${encodeURIComponent(taskOfDay)}`}
          icon={<PenLine className="h-6 w-6" />}
          title="Schreibaufgabe des Tages"
          text={taskOfDay}
        />
      </div>

      <Panel className="mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sage-600">
              Deine Stufe · {level.cefr}
            </p>
            <h2 className="mt-1 font-serif text-2xl text-navy-800">{level.title}</h2>
            <p className="mt-1 text-navy-600">
              {doneLessons.length} von {levelLessons.length} Lektionen bearbeitet
            </p>
          </div>
          <Link href={`/stufen/${level.id}`} className="inline-flex items-center gap-1 font-semibold text-sage-700 hover:text-sage-800">
            Zur Stufe <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <ProgressBar className="mt-5" value={doneLessons.length} max={levelLessons.length} />
      </Panel>
    </div>
  );
}

function TodayCard({
  href,
  icon,
  title,
  text,
  highlight = false,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  text: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex gap-4 rounded-2xl border p-6 shadow-soft transition-all hover:-translate-y-0.5 ${
        highlight ? "border-sage-200 bg-white" : "border-cream-200 bg-white/80"
      }`}
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${highlight ? "bg-sage-600 text-white" : "bg-sage-50 text-sage-700"}`}>
        {icon}
      </span>
      <span className="flex-1">
        <span className="block font-semibold text-navy-800">{title}</span>
        <span className="mt-1 block text-navy-600">{text}</span>
      </span>
      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-navy-500/40 transition-colors group-hover:text-sage-600" aria-hidden />
    </Link>
  );
}
