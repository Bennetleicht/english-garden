"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Circle, KeyRound, Loader2, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { Button, ErrorNote, Panel } from "@/components/ui";
import { getChapter } from "@/lib/content/chapters";
import { getLesson } from "@/lib/content/grammar";

/**
 * Entwickler-Übersicht: Wer ist wann wie lange auf der Website, und wie weit ist jede Person?
 * Geschützt durch ADMIN_PASSWORD (Umgebungsvariable in Vercel).
 */

const KEY = "english-garden-admin";
const ONLINE_MS = 2 * 60_000;

interface AccountInfo {
  id: number;
  name: string;
  email: string | null;
  createdAt: string;
  lastSeen: string | null;
  level: number;
  lessons: number;
  cards: number;
  verbs: number;
  learningDays: number;
  streak: number;
  lastLearningDay: string | null;
  chaptersPassed: number;
  examsPassed: number;
}

interface SessionInfo {
  accountId: number;
  start: string;
  end: string;
  minutes: number;
  pages: string[];
}

interface AdminData {
  now: string;
  accounts: AccountInfo[];
  sessions: SessionInfo[];
}

function pageName(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return "Startseite";
  const [a, b, c, d] = parts;
  const simple: Record<string, string> = {
    stufen: "Lernweg",
    grammatik: "Grammatik",
    vokabeln: "Vokabelkasten",
    gespraech: "Gespräch",
    schreiben: "Schreiben",
    einstellungen: "Einstellungen",
    einstufung: "Einstufungstest",
    verben: "Unregelmäßige Verben",
  };
  if (a === "grammatik" && b) return `Lektion „${getLesson(b)?.title ?? b}“`;
  if (a === "stufen" && b && c === "pruefung") return `Abschlussprüfung Stufe ${b}`;
  if (a === "stufen" && b && c === "kapitel" && d) return `Kapiteltest „${getChapter(d)?.title ?? d}“`;
  if (a === "stufen" && b) return `Stufe ${b}`;
  if (a === "vokabeln" && b === "lernen") return "Vokabeln lernen";
  if (a === "vokabeln" && b === "woche") return "Wochenrückblick";
  if (a === "verben" && b === "ueben") return "Verben-Training";
  return simple[a] ?? path;
}

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const time = (iso: string) => new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

function relative(iso: string | null, now: number): string {
  if (!iso) return "noch nie";
  const diff = now - new Date(iso).getTime();
  if (diff < ONLINE_MS) return "gerade online";
  const min = Math.round(diff / 60_000);
  if (min < 60) return `vor ${min} Min.`;
  const h = Math.round(min / 60);
  if (h < 24) return `vor ${h} Std.`;
  const days = Math.round(h / 24);
  return days === 1 ? "gestern" : `vor ${days} Tagen`;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<number | "alle">("alle");

  useEffect(() => {
    try {
      setSaved(window.sessionStorage.getItem(KEY));
    } catch {
      setSaved(null);
    }
  }, []);

  const load = useCallback(async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin", { headers: { "x-admin-password": pw } });
      const body = (await res.json()) as AdminData & { error?: string };
      if (!res.ok) throw new Error(body.error || "Fehler beim Laden.");
      setData(body);
      try {
        window.sessionStorage.setItem(KEY, pw);
      } catch {
        /* ignorieren */
      }
      setSaved(pw);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Laden.");
      if (!data) setSaved(null);
    } finally {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (!saved || data) return;
    void load(saved);
  }, [saved, data, load]);

  // Alle 60 Sekunden aktualisieren
  useEffect(() => {
    if (!saved || !data) return;
    const t = setInterval(() => void load(saved), 60_000);
    return () => clearInterval(t);
  }, [saved, data, load]);

  const now = data ? new Date(data.now).getTime() : Date.now();
  const names = useMemo(() => new Map(data?.accounts.map((a) => [a.id, a.name]) ?? []), [data]);
  const sessions = (data?.sessions ?? []).filter((s) => filter === "alle" || s.accountId === filter);
  const online = (data?.accounts ?? []).filter((a) => a.lastSeen && now - new Date(a.lastSeen).getTime() < ONLINE_MS);

  const resetPassword = async (account: AccountInfo) => {
    const pw = window.prompt(`Neues Passwort für ${account.name} (mind. 6 Zeichen):`);
    if (!pw || !saved) return;
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": saved },
      body: JSON.stringify({ action: "reset-password", accountId: account.id, password: pw }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    window.alert(res.ok ? `Das Passwort von ${account.name} wurde geändert.` : body.error || "Das hat nicht geklappt.");
  };

  /* ---------- Anmeldung ---------- */
  if (!saved || !data) {
    return (
      <div className="mx-auto max-w-sm pt-16">
        <ShieldCheck className="mx-auto h-10 w-10 text-sage-600" />
        <h1 className="mt-4 text-center font-serif text-3xl text-navy-800">Verwaltung</h1>
        <form
          className="mt-8 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void load(password);
          }}
        >
          <input className="field" type="password" placeholder="Admin-Passwort" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          {error && <ErrorNote message={error} />}
          <Button type="submit" className="w-full" disabled={loading || !password}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Öffnen
          </Button>
        </form>
      </div>
    );
  }

  /* ---------- Übersicht ---------- */
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-navy-800">Verwaltung</h1>
          <p className="text-navy-500">Stand: {dateTime(data.now)} · aktualisiert sich jede Minute</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void load(saved)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Aktualisieren
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              try {
                window.sessionStorage.removeItem(KEY);
              } catch {
                /* ignorieren */
              }
              setSaved(null);
              setData(null);
            }}
          >
            <LogOut className="h-4 w-4" /> Schließen
          </Button>
        </div>
      </div>
      {error && <ErrorNote message={error} />}

      <Panel>
        <h2 className="font-serif text-xl text-navy-800">Gerade online</h2>
        {online.length === 0 ? (
          <p className="mt-2 text-navy-600">Im Moment ist niemand auf der Website.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {online.map((a) => (
              <span key={a.id} className="flex items-center gap-2 rounded-full bg-sage-100 px-3 py-1.5 font-semibold text-sage-800">
                <Circle className="h-2.5 w-2.5 fill-sage-500 text-sage-500" /> {a.name}
              </span>
            ))}
          </div>
        )}
      </Panel>

      <section>
        <h2 className="mb-3 font-serif text-xl text-navy-800">Konten ({data.accounts.length})</h2>
        <div className="overflow-x-auto rounded-2xl border border-cream-200 bg-white">
          <table className="w-full min-w-[900px] text-left text-[15px]">
            <thead className="border-b border-cream-200 bg-sage-50 text-sage-800">
              <tr>
                {["Name", "E-Mail", "Zuletzt da", "Registriert", "Stufe", "Lektionen", "Kapitel", "Prüfungen", "Vokabeln", "Verben", "Lerntage", "Serie", ""].map((h) => (
                  <th key={h} className="px-3 py-2.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {data.accounts.map((a) => (
                <tr key={a.id}>
                  <td className="px-3 py-2.5 font-semibold text-navy-800">{a.name}</td>
                  <td className="px-3 py-2.5 text-navy-600">{a.email ?? "–"}</td>
                  <td className="px-3 py-2.5 text-navy-700">{relative(a.lastSeen, now)}</td>
                  <td className="px-3 py-2.5 text-navy-600">{new Date(a.createdAt).toLocaleDateString("de-DE")}</td>
                  <td className="px-3 py-2.5">{a.level}</td>
                  <td className="px-3 py-2.5">{a.lessons}</td>
                  <td className="px-3 py-2.5">{a.chaptersPassed}</td>
                  <td className="px-3 py-2.5">{a.examsPassed}</td>
                  <td className="px-3 py-2.5">{a.cards}</td>
                  <td className="px-3 py-2.5">{a.verbs}</td>
                  <td className="px-3 py-2.5">{a.learningDays}</td>
                  <td className="px-3 py-2.5">{a.streak}</td>
                  <td className="px-3 py-2.5">
                    <button type="button" onClick={() => void resetPassword(a)} className="flex items-center gap-1 text-sage-700 hover:underline" title="Passwort zurücksetzen">
                      <KeyRound className="h-4 w-4" /> Passwort
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl text-navy-800">Besuche der letzten 30 Tage</h2>
          <select className="field !w-auto !py-2 !text-base" value={filter} onChange={(e) => setFilter(e.target.value === "alle" ? "alle" : Number(e.target.value))}>
            <option value="alle">Alle Personen</option>
            {data.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        {sessions.length === 0 ? (
          <Panel>
            <p className="text-navy-600">Noch keine Besuche aufgezeichnet.</p>
          </Panel>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-cream-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-[15px]">
              <thead className="border-b border-cream-200 bg-sage-50 text-sage-800">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Wer</th>
                  <th className="px-3 py-2.5 font-semibold">Wann</th>
                  <th className="px-3 py-2.5 font-semibold">Dauer</th>
                  <th className="px-3 py-2.5 font-semibold">Besuchte Seiten</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {sessions.map((s, i) => (
                  <tr key={i} className="align-top">
                    <td className="px-3 py-2.5 font-semibold text-navy-800">{names.get(s.accountId) ?? s.accountId}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-navy-700">
                      {dateTime(s.start)} – {time(s.end)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-navy-700">{s.minutes} Min.</td>
                    <td className="px-3 py-2.5 text-navy-600">{s.pages.map(pageName).join(" → ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
