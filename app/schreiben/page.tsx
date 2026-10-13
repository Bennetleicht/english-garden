"use client";

import { useEffect, useState } from "react";
import { Heart, Lightbulb, Loader2, PenLine, RotateCcw } from "lucide-react";
import { CorrectionList } from "@/components/CorrectionList";
import { MicButton } from "@/components/MicButton";
import { SaveWordButton } from "@/components/SaveWordButton";
import { SpeakButton } from "@/components/SpeakButton";
import { Button, ErrorNote, Loading, PageHeader, Panel } from "@/components/ui";
import { postJSON, type WritingFeedback } from "@/lib/api";
import { WRITING_TASKS } from "@/lib/content/topics";
import { today } from "@/lib/dates";
import { markActivity, newId, updateState, useAppState } from "@/lib/storage";

const FREE_TASK = "Freies Schreiben – schreib über alles, was dich gerade beschäftigt.";

export default function WritingPage() {
  const state = useAppState();
  const [task, setTask] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);

  useEffect(() => {
    const aufgabe = new URLSearchParams(window.location.search).get("aufgabe");
    if (aufgabe) setTask(aufgabe);
  }, []);

  if (!state) return <Loading />;
  const { profile } = state;
  const tasks = WRITING_TASKS[profile.level] ?? WRITING_TASKS[1];

  async function submit() {
    if (!task || text.trim().length < 3) return;
    setLoading(true);
    setError("");
    try {
      const result = await postJSON<WritingFeedback>("/api/feedback", { task, text, level: profile.level, name: profile.name });
      setFeedback(result);
      markActivity();
      updateState((s) => ({
        ...s,
        writing: [{ id: newId(), day: today(), task, text, summary: result.praise }, ...s.writing].slice(0, 30),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Da ist etwas schiefgelaufen.");
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setTask(null);
    setText("");
    setFeedback(null);
    setError("");
    window.history.replaceState(null, "", "/schreiben");
  }

  /* ---------- Aufgabe wählen ---------- */
  if (!task) {
    return (
      <div>
        <PageHeader eyebrow="Schreiben" title="Ein paar Sätze auf Englisch">
          Schreiben gibt dir Zeit zum Nachdenken – ideal, um Neues auszuprobieren. Du bekommst ausführliches, ehrliches und
          freundliches Feedback.
        </PageHeader>
        <div className="space-y-3">
          {[...tasks, FREE_TASK].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTask(t)}
              className="flex w-full items-center gap-4 rounded-xl border border-cream-200 bg-white/80 px-5 py-4 text-left text-lg text-navy-700 shadow-soft transition-all hover:-translate-y-0.5 hover:border-sage-200"
            >
              <PenLine className="h-5 w-5 shrink-0 text-sage-600" />
              {t}
            </button>
          ))}
        </div>

        {state.writing.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-3 font-serif text-xl text-navy-800">Deine letzten Texte</h2>
            <ul className="space-y-3">
              {state.writing.slice(0, 5).map((w) => (
                <li key={w.id} className="rounded-xl border border-cream-200 bg-white/60 px-5 py-4">
                  <p className="text-sm text-navy-500">{w.task}</p>
                  <p className="mt-1 line-clamp-2 text-navy-700">{w.text}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  /* ---------- Feedback ---------- */
  if (feedback) {
    return (
      <div className="animate-fadeIn">
        <PageHeader eyebrow="Feedback" title="Schön geschrieben.">
          {task}
        </PageHeader>

        <div className="space-y-6">
          {feedback.praise && (
            <Panel className="flex gap-4">
              <Heart className="mt-1 h-5 w-5 shrink-0 text-clay-400" />
              <p className="text-lg leading-relaxed text-navy-700">{feedback.praise}</p>
            </Panel>
          )}

          {feedback.corrections.length > 0 ? (
            <section>
              <h2 className="mb-3 font-serif text-xl text-navy-800">Das kannst du noch verbessern</h2>
              <CorrectionList corrections={feedback.corrections} source="schreiben" />
            </section>
          ) : (
            <Panel>
              <p className="text-lg text-sage-800">Keine Fehler gefunden – ausgezeichnet!</p>
            </Panel>
          )}

          <Panel>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl text-navy-800">Dein Text, überarbeitet</h2>
              <SpeakButton text={feedback.corrected_text} />
            </div>
            <p className="mt-3 whitespace-pre-wrap text-lg leading-relaxed text-navy-800">{feedback.corrected_text}</p>
            <details className="mt-4 text-navy-500">
              <summary className="cursor-pointer">Dein Original anzeigen</summary>
              <p className="mt-2 whitespace-pre-wrap">{text}</p>
            </details>
          </Panel>

          {feedback.tips.length > 0 && (
            <div className="rounded-2xl bg-cream-100 px-6 py-5">
              <h2 className="flex items-center gap-2 font-serif text-xl text-navy-800">
                <Lightbulb className="h-5 w-5 text-cream-400" /> Tipps für noch natürlicheres Englisch
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-lg text-navy-700">
                {feedback.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback.new_words.length > 0 && (
            <section>
              <h2 className="mb-3 font-serif text-xl text-navy-800">Nützliche Wörter für dich</h2>
              <div className="flex flex-wrap gap-2">
                {feedback.new_words.map((w) => (
                  <SaveWordButton key={w.en} front={w.en} back={w.de} source="schreiben" />
                ))}
              </div>
            </section>
          )}

          {feedback.encouragement && <p className="text-center font-serif text-xl italic text-sage-700">{feedback.encouragement}</p>}

          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="secondary" onClick={() => setFeedback(null)}>
              Text weiter bearbeiten
            </Button>
            <Button onClick={restart}>
              <RotateCcw className="h-4 w-4" /> Neue Aufgabe
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Schreiben ---------- */
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <div>
      <PageHeader eyebrow="Schreibaufgabe" title={task} />
      <Panel>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={9}
          autoFocus
          placeholder="Schreib hier auf Englisch …"
          className="field resize-y leading-relaxed"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <MicButton onText={(t) => setText((prev) => (prev.trim() ? `${prev.trim()} ${t}` : t))} disabled={loading} />
          <span className="text-navy-500">{words} Wörter</span>
          <div className="ml-auto flex gap-3">
            <Button variant="ghost" onClick={restart} disabled={loading}>
              Andere Aufgabe
            </Button>
            <Button onClick={() => void submit()} disabled={loading || text.trim().length < 3}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Wird gelesen …" : "Feedback erhalten"}
            </Button>
          </div>
        </div>
        {error && (
          <div className="mt-4">
            <ErrorNote message={error} />
          </div>
        )}
      </Panel>
    </div>
  );
}
