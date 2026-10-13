"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronRight, Plus, Search, Trash2 } from "lucide-react";
import { SpeakButton } from "@/components/SpeakButton";
import { Button, LinkButton, Loading, PageHeader, Panel } from "@/components/ui";
import { formatDayGerman } from "@/lib/dates";
import { dueCount, strength } from "@/lib/srs";
import { addCards, deleteCard, markActivity, useAppState, type CardSource } from "@/lib/storage";

const SOURCE_LABEL: Record<CardSource, string> = {
  start: "Startwortschatz",
  gespraech: "Aus dem Gespräch",
  schreiben: "Aus dem Schreiben",
  manuell: "Selbst hinzugefügt",
  grammatik: "Aus der Grammatik",
};

const STRENGTH_STYLE = {
  neu: "bg-cream-100 text-navy-600",
  lernend: "bg-clay-50 text-clay-600",
  gefestigt: "bg-sage-50 text-sage-700",
  sicher: "bg-sage-100 text-sage-800",
};

export default function VocabularyPage() {
  const state = useAppState();
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [example, setExample] = useState("");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  const cards = useMemo(() => {
    if (!state) return [];
    const q = query.trim().toLowerCase();
    return [...state.cards]
      .filter((c) => !q || c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [state, query]);

  if (!state) return <Loading />;
  const due = dueCount(state.cards);

  return (
    <div>
      <PageHeader eyebrow="Vokabelkasten" title="Wörter, die bleiben">
        Karten, die dir schwerfallen, kommen öfter wieder – Karten, die sitzen, immer seltener. So lernst du nachhaltig, ohne zu
        pauken.
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <Panel className="flex flex-col justify-between">
          <div>
            <p className="font-serif text-4xl text-navy-800">{due}</p>
            <p className="text-navy-600">{due === 1 ? "Karte ist heute dran" : "Karten sind heute dran"}</p>
          </div>
          {due > 0 ? (
            <LinkButton href="/vokabeln/lernen" className="mt-5 self-start">
              Jetzt lernen <ChevronRight className="h-4 w-4" />
            </LinkButton>
          ) : (
            <p className="mt-5 text-sage-700">Für heute ist alles erledigt.</p>
          )}
        </Panel>
        <Link href="/vokabeln/woche" className="group rounded-2xl border border-cream-200 bg-cream-100 p-6 shadow-soft transition-colors hover:bg-cream-200 sm:p-7">
          <CalendarDays className="h-7 w-7 text-cream-400" />
          <p className="mt-3 font-serif text-xl text-navy-800">Wochenrückblick</p>
          <p className="text-navy-600">Alles, was du diese Woche gelernt hast – mit einer kleinen Wiederholung.</p>
        </Link>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-serif text-2xl text-navy-800">
          Alle Karten <span className="text-lg text-navy-500">({state.cards.length})</span>
        </h2>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
            <input className="field !py-2.5 !pl-9 !text-base" placeholder="Suchen …" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Button variant="secondary" className="!py-2.5" onClick={() => setShowForm((s) => !s)}>
            <Plus className="h-4 w-4" /> Neu
          </Button>
        </div>
      </div>

      {showForm && (
        <Panel className="mt-4 animate-fadeIn">
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!front.trim() || !back.trim()) return;
              addCards([{ front, back, example }], "manuell");
              markActivity();
              setFront("");
              setBack("");
              setExample("");
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="field" placeholder="Englisch, z. B. to look forward to" value={front} onChange={(e) => setFront(e.target.value)} />
              <input className="field" placeholder="Deutsch, z. B. sich freuen auf" value={back} onChange={(e) => setBack(e.target.value)} />
            </div>
            <input className="field" placeholder="Beispielsatz (optional)" value={example} onChange={(e) => setExample(e.target.value)} />
            <Button type="submit" className="justify-self-start" disabled={!front.trim() || !back.trim()}>
              Karte speichern
            </Button>
          </form>
        </Panel>
      )}

      {state.cards.length === 0 ? (
        <Panel className="mt-4">
          <p className="text-lg text-navy-600">
            Dein Vokabelkasten ist noch leer. Lege auf einer{" "}
            <Link href="/stufen" className="font-semibold text-sage-700 underline-offset-4 hover:underline">
              Lernstufe
            </Link>{" "}
            den Startwortschatz hinein, oder speichere Wörter direkt aus einem Gespräch.
          </p>
        </Panel>
      ) : (
        <ul className="mt-4 divide-y divide-cream-200 overflow-hidden rounded-2xl border border-cream-200 bg-white/80">
          {cards.map((card) => {
            const s = strength(card);
            return (
              <li key={card.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex-1">
                  <p className="text-lg text-navy-800">{card.front}</p>
                  <p className="text-navy-600">{card.back}</p>
                  <p className="mt-1 text-xs text-navy-500">
                    {SOURCE_LABEL[card.source]} · {formatDayGerman(card.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STRENGTH_STYLE[s]}`}>{s}</span>
                  <SpeakButton text={card.front} label="" />
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`„${card.front}“ aus dem Vokabelkasten entfernen?`)) deleteCard(card.id);
                    }}
                    className="rounded-lg p-2 text-navy-500/60 hover:bg-clay-50 hover:text-clay-600"
                    aria-label="Karte entfernen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
