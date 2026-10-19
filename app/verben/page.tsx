"use client";

import { useMemo, useState } from "react";
import { Check, Lightbulb, Play, Search } from "lucide-react";
import { SpeakButton } from "@/components/SpeakButton";
import { Button, LinkButton, Loading, PageHeader, Panel, ProgressBar } from "@/components/ui";
import { PATTERN_INFO, VERBS, type VerbPattern } from "@/lib/content/verbs";
import { addCards, useAppState } from "@/lib/storage";
import { verbStrength, verbsInSet, VERB_SET_LABEL, type VerbSet } from "@/lib/verb-trainer";

const STRENGTH_STYLE = {
  neu: "bg-cream-100 text-navy-600",
  "übe ich": "bg-clay-50 text-clay-600",
  gut: "bg-sage-50 text-sage-700",
  sicher: "bg-sage-100 text-sage-800",
};

export default function VerbsPage() {
  const state = useAppState();
  const [pattern, setPattern] = useState<VerbPattern | "alle">("alle");
  const [query, setQuery] = useState("");
  const [added, setAdded] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VERBS.filter((v) => pattern === "alle" || v.pattern === pattern).filter(
      (v) => !q || [v.inf, ...v.past, ...v.pp, v.de].some((x) => x.toLowerCase().includes(q)),
    );
  }, [pattern, query]);

  if (!state) return <Loading />;

  const stats = state.verbs;
  const secure = VERBS.filter((v) => verbStrength(stats[v.inf]) === "sicher").length;
  const practised = VERBS.filter((v) => stats[v.inf]).length;
  const hardCount = verbsInSet("hard", stats).length;

  return (
    <div>
      <PageHeader eyebrow="Unregelmäßige Verben" title="go – went – gone">
        Rund 100 Verben bilden ihre Vergangenheit nicht mit -ed. Du brauchst sie für das Simple Past (I <strong>went</strong>) und
        das Present Perfect (I have <strong>gone</strong>). Die gute Nachricht: Sie folgen wenigen Mustern – und mit kurzem,
        regelmäßigem Training sitzen sie bald.
      </PageHeader>

      <Panel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-navy-800">Training</h2>
            <p className="mt-1 text-navy-600">
              10 Verben pro Runde: Du siehst die Grundform und schreibst Past Simple und Past Participle. Verben, die noch nicht
              sitzen, kommen öfter wieder.
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <ProgressBar value={secure} max={VERBS.length} />
          <span className="shrink-0 text-sm text-navy-500">
            {secure} von {VERBS.length} sicher · {practised} geübt
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {(["basic", "all", "hard"] as VerbSet[]).map((set) =>
            set === "hard" && hardCount === 0 ? null : (
              <LinkButton key={set} href={`/verben/ueben?set=${set}`} variant={set === "basic" ? "primary" : "secondary"}>
                <Play className="h-4 w-4" /> {VERB_SET_LABEL[set]}
                <span className="opacity-70">({set === "hard" ? hardCount : verbsInSet(set, stats).length})</span>
              </LinkButton>
            ),
          )}
        </div>
      </Panel>

      <h2 className="mb-3 mt-10 font-serif text-2xl text-navy-800">Die vier Muster</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {(Object.keys(PATTERN_INFO) as VerbPattern[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPattern(pattern === p ? "alle" : p)}
            className={`rounded-2xl border p-5 text-left shadow-soft transition-colors ${
              pattern === p ? "border-sage-400 bg-sage-50" : "border-cream-200 bg-white/80 hover:border-sage-200"
            }`}
          >
            <p className="font-serif text-xl text-navy-800">{PATTERN_INFO[p].example}</p>
            <p className="mt-0.5 font-semibold text-sage-700">
              {PATTERN_INFO[p].title} · {VERBS.filter((v) => v.pattern === p).length} Verben
            </p>
            <p className="mt-2 text-navy-600">{PATTERN_INFO[p].text}</p>
          </button>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-serif text-2xl text-navy-800">
          {pattern === "alle" ? "Alle Verben" : PATTERN_INFO[pattern].title}{" "}
          <span className="text-lg text-navy-500">({list.length})</span>
        </h2>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
          <input className="field !py-2.5 !pl-9 !text-base" placeholder="Verb suchen …" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-cream-200 bg-white/80">
        <table className="w-full min-w-[620px] text-left">
          <thead>
            <tr className="border-b border-cream-200 bg-sage-50 text-[15px] text-sage-800">
              <th className="px-4 py-3 font-semibold">Grundform</th>
              <th className="px-4 py-3 font-semibold">Past Simple</th>
              <th className="px-4 py-3 font-semibold">Past Participle</th>
              <th className="px-4 py-3 font-semibold">Deutsch</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {list.map((verb) => {
              const st = verbStrength(stats[verb.inf]);
              return (
                <tr key={verb.inf} className="align-top">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-navy-800">{verb.inf}</span>
                    {verb.note && (
                      <span className="mt-1 flex gap-1.5 text-sm text-navy-500">
                        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cream-400" /> {verb.note}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-navy-800">{verb.past.join(" / ")}</td>
                  <td className="px-4 py-3 text-navy-800">{verb.pp.join(" / ")}</td>
                  <td className="px-4 py-3 text-navy-600">{verb.de}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <span className={`mr-1 rounded-full px-2.5 py-1 text-xs font-semibold ${STRENGTH_STYLE[st]}`}>{st}</span>
                    <SpeakButton text={`${verb.inf}, ${verb.past[0]}, ${verb.pp[0]}`} label="" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Panel className="mt-8">
        <h2 className="font-serif text-xl text-navy-800">Auch im Vokabelkasten wiederholen?</h2>
        <p className="mt-1 text-navy-600">
          Legt die {VERBS.filter((v) => v.basic).length} wichtigsten Verben als Karteikarten (z. B. „go – went – gone“) in deinen Vokabelkasten.
        </p>
        {added ? (
          <p className="mt-4 flex items-center gap-2 text-sage-700">
            <Check className="h-5 w-5" /> Im Vokabelkasten
          </p>
        ) : (
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => {
              addCards(
                VERBS.filter((v) => v.basic).map((v) => ({ front: `${v.inf} – ${v.past.join("/")} – ${v.pp.join("/")}`, back: v.de })),
                "grammatik",
              );
              setAdded(true);
            }}
          >
            In den Vokabelkasten legen
          </Button>
        )}
      </Panel>
    </div>
  );
}
