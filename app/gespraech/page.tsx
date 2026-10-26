"use client";

import { useEffect, useRef, useState } from "react";
import { Languages, Loader2, RotateCcw, Send, Sparkles } from "lucide-react";
import { CorrectionList } from "@/components/CorrectionList";
import { MicButton } from "@/components/MicButton";
import { SaveWordButton } from "@/components/SaveWordButton";
import { SpeakButton } from "@/components/SpeakButton";
import { Button, ErrorNote, Loading, PageHeader, Panel } from "@/components/ui";
import { getStatus, postJSON, type ChatReply, type Correction } from "@/lib/api";
import { CHAT_TOPICS } from "@/lib/content/topics";
import { primeAudio, speak } from "@/lib/speech";
import { markActivity, setProfile, useAppState } from "@/lib/storage";

interface Message {
  role: "user" | "assistant";
  content: string;
  reply?: ChatReply; // nur bei KI-Nachrichten
  corrections?: Correction[]; // nur bei Nutzer-Nachrichten
}

export default function ConversationPage() {
  const state = useAppState();
  const [topic, setTopic] = useState<{ label: string; prompt: string | null } | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [translations, setTranslations] = useState<Set<number>>(new Set());
  const [aiReady, setAiReady] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const startedFromUrl = useRef(false);

  useEffect(() => {
    void getStatus().then((s) => setAiReady(s.ai));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  // Thema aus dem Link übernehmen (z. B. von der Stufenseite)
  useEffect(() => {
    if (!state || startedFromUrl.current) return;
    const thema = new URLSearchParams(window.location.search).get("thema");
    if (thema) {
      startedFromUrl.current = true;
      const known = CHAT_TOPICS.find((t) => t.label === thema);
      void start({ label: thema, prompt: known?.prompt ?? thema });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!state) return <Loading />;
  const { profile } = state;

  async function ask(history: Message[], chosen: { label: string; prompt: string | null }) {
    setLoading(true);
    setError("");
    try {
      const reply = await postJSON<ChatReply>("/api/chat", {
        messages: history.map((m) => ({ role: m.role, content: m.content })),
        topic: chosen.prompt,
        level: profile.level,
        name: profile.name,
      });

      setMessages((prev) => {
        const next = [...prev];
        // Korrekturen gehören zur letzten Nachricht der Nutzerin
        const lastUser = next.map((m) => m.role).lastIndexOf("user");
        if (lastUser >= 0 && reply.corrections.length > 0) {
          next[lastUser] = { ...next[lastUser], corrections: reply.corrections };
        }
        return [...next, { role: "assistant", content: reply.reply, reply }];
      });

      if (!chosen.prompt && reply.topic) setTopic({ label: reply.topic, prompt: reply.topic });
      if (profile.autoSpeak) speak(reply.reply, { voice: profile.voiceURI, rate: profile.speechRate });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Da ist etwas schiefgelaufen.");
    } finally {
      setLoading(false);
    }
  }

  async function start(chosen: { label: string; prompt: string | null }) {
    setTopic(chosen);
    setMessages([]);
    setTranslations(new Set());
    await ask([], chosen);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading || !topic) return;
    // Beim Absenden Ton freischalten, damit die Antwort auch auf dem iPhone vorgelesen werden darf
    if (profile.autoSpeak) primeAudio();
    const history: Message[] = [...messages, { role: "user", content: text }];
    setMessages(history);
    setInput("");
    markActivity();
    await ask(history, topic);
  }

  function reset() {
    setTopic(null);
    setMessages([]);
    setError("");
    setInput("");
  }

  /* ---------- Themenwahl ---------- */
  if (!topic) {
    return (
      <div>
        <PageHeader eyebrow="Sprachtrainer" title="Lass uns auf Englisch plaudern">
          Wähle ein Thema – oder lass dich überraschen. Du kannst sprechen oder schreiben. Fehler sind ausdrücklich erlaubt: Dein
          Gesprächspartner zeigt dir freundlich, wie es noch besser klingt, und plaudert dann einfach weiter.
        </PageHeader>

        {aiReady === false && (
          <div className="mb-6">
            <ErrorNote message="Der Sprachtrainer ist noch nicht eingerichtet: Es fehlt ein kostenloser KI-Schlüssel (siehe README, Schritt 2)." />
          </div>
        )}

        <Panel>
          <h2 className="font-serif text-xl text-navy-800">Worüber möchtest du sprechen?</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {CHAT_TOPICS.map((t) => (
              <button key={t.label} type="button" className="chip" onClick={() => void start({ label: t.label, prompt: t.prompt })}>
                {t.label}
              </button>
            ))}
          </div>

          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (customTopic.trim()) void start({ label: customTopic.trim(), prompt: customTopic.trim() });
            }}
          >
            <input className="field" placeholder="Eigenes Thema, z. B. „Mein letzter Ausflug an die Ostsee“" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} />
            <Button type="submit" variant="secondary" disabled={!customTopic.trim()}>
              Starten
            </Button>
          </form>

          <div className="mt-6 border-t border-cream-200 pt-6">
            <Button onClick={() => void start({ label: "Überraschung", prompt: null })}>
              <Sparkles className="h-4 w-4" /> Überrasch mich
            </Button>
          </div>
        </Panel>

        <label className="mt-6 flex cursor-pointer items-center gap-3 text-navy-600">
          <input
            type="checkbox"
            className="h-5 w-5 accent-sage-600"
            checked={profile.autoSpeak}
            onChange={(e) => setProfile({ autoSpeak: e.target.checked })}
          />
          Antworten automatisch vorlesen
        </label>
      </div>
    );
  }

  /* ---------- Gespräch ---------- */
  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sage-600">Gespräch</p>
          <h1 className="font-serif text-2xl text-navy-800 sm:text-3xl">{topic.label}</h1>
        </div>
        <Button variant="ghost" onClick={reset}>
          <RotateCcw className="h-4 w-4" /> Neues Thema
        </Button>
      </div>

      <div className="flex-1 space-y-5">
        {messages.map((m, i) =>
          m.role === "assistant" ? (
            <div key={i} className="max-w-[90%] animate-fadeIn sm:max-w-[80%]">
              <div className="rounded-2xl rounded-tl-md border border-cream-200 bg-white px-5 py-4 shadow-soft">
                <p className="text-lg leading-relaxed text-navy-800">{m.content}</p>
                {translations.has(i) && m.reply?.reply_de && <p className="mt-2 border-t border-cream-200 pt-2 text-navy-500">{m.reply.reply_de}</p>}
                <div className="mt-2 flex flex-wrap gap-1">
                  <SpeakButton text={m.content} />
                  {m.reply?.reply_de && (
                    <button
                      type="button"
                      onClick={() =>
                        setTranslations((t) => {
                          const n = new Set(t);
                          if (n.has(i)) n.delete(i);
                          else n.add(i);
                          return n;
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-navy-500 hover:bg-cream-100"
                    >
                      <Languages className="h-4 w-4" /> {translations.has(i) ? "Übersetzung ausblenden" : "Auf Deutsch"}
                    </button>
                  )}
                </div>
              </div>
              {m.reply && m.reply.new_words.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 pl-1">
                  {m.reply.new_words.map((w) => (
                    <SaveWordButton key={w.en} front={w.en} back={w.de} source="gespraech" />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div key={i} className="ml-auto max-w-[90%] animate-fadeIn sm:max-w-[80%]">
              <div className="rounded-2xl rounded-tr-md bg-sage-600 px-5 py-4 text-lg leading-relaxed text-white">{m.content}</div>
              {m.corrections && m.corrections.length > 0 && (
                <div className="mt-2">
                  <CorrectionList corrections={m.corrections} source="gespraech" />
                </div>
              )}
            </div>
          ),
        )}

        {loading && (
          <div className="flex items-center gap-2 text-navy-500">
            <Loader2 className="h-4 w-4 animate-spin" /> {messages.length === 0 ? "Dein Gesprächspartner überlegt sich einen Einstieg … (das kann einen Moment dauern)" : "schreibt … (manchmal dauert es etwas länger)"}
          </div>
        )}
        {error && (
          <div className="space-y-3">
            <ErrorNote message={error} />
            {messages.length === 0 && (
              <Button variant="secondary" onClick={() => void start(topic)}>
                Noch einmal versuchen
              </Button>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="sticky bottom-20 mt-8 flex items-end gap-3 rounded-2xl border border-cream-200 bg-cream-50/95 p-3 shadow-soft backdrop-blur lg:bottom-6"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <MicButton onInterim={setInput} onText={setInput} disabled={loading} />
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          rows={2}
          placeholder="Schreib auf Englisch – oder tippe aufs Mikrofon …"
          className="min-h-[56px] flex-1 resize-none rounded-xl border border-cream-300 bg-white px-4 py-3 text-lg focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-200"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          aria-label="Senden"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sage-600 text-white transition-colors hover:bg-sage-700 disabled:bg-sage-200"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
