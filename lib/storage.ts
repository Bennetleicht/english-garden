"use client";

import { useSyncExternalStore } from "react";
import { today } from "./dates";

/**
 * Der gesamte Lernstand liegt im localStorage des Browsers.
 * Kein Server, keine Datenbank, keine Kosten. Über "Einstellungen" lässt sich
 * eine Sicherungsdatei exportieren und auf einem anderen Gerät importieren.
 */

export type CardSource = "start" | "gespraech" | "schreiben" | "manuell" | "grammatik";

export interface Card {
  id: string;
  front: string; // Englisch
  back: string; // Deutsch / Erklärung
  example?: string;
  source: CardSource;
  createdAt: string; // YYYY-MM-DD
  due: string; // YYYY-MM-DD
  interval: number; // Tage
  ease: number;
  reps: number;
  lapses: number;
  history: { day: string; ok: boolean }[];
}

export interface LessonResult {
  correct: number;
  total: number;
  day: string;
}

export interface WritingEntry {
  id: string;
  day: string;
  task: string;
  text: string;
  summary: string;
}

export interface AppState {
  version: 1;
  profile: {
    name: string;
    level: number; // 1–4
    placementDone: boolean;
    voiceURI: string;
    speechRate: number;
    autoSpeak: boolean;
  };
  activityDays: string[];
  cards: Card[];
  lessons: Record<string, LessonResult>;
  addedDecks: number[];
  writing: WritingEntry[];
}

const KEY = "english-garden-v1";

export function defaultState(): AppState {
  return {
    version: 1,
    profile: { name: "", level: 1, placementDone: false, voiceURI: "", speechRate: 0.92, autoSpeak: false },
    activityDays: [],
    cards: [],
    lessons: {},
    addedDecks: [],
    writing: [],
  };
}

function migrate(raw: unknown): AppState {
  const base = defaultState();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<AppState>;
  return {
    ...base,
    ...r,
    profile: { ...base.profile, ...(r.profile ?? {}) },
    activityDays: Array.isArray(r.activityDays) ? r.activityDays : [],
    cards: Array.isArray(r.cards) ? r.cards : [],
    lessons: r.lessons ?? {},
    addedDecks: Array.isArray(r.addedDecks) ? r.addedDecks : [],
    writing: Array.isArray(r.writing) ? r.writing : [],
    version: 1,
  };
}

let state: AppState | null = null;
const listeners = new Set<() => void>();

function load(): AppState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch {
    /* defekte Daten → neu anfangen */
  }
  return defaultState();
}

function getSnapshot(): AppState {
  if (state === null) state = load();
  return state;
}

function getServerSnapshot(): AppState | null {
  return null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = load();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Liefert den Lernstand – oder `null`, solange die Seite auf dem Server bzw. vor dem Laden gerendert wird. */
export function useAppState(): AppState | null {
  return useSyncExternalStore<AppState | null>(subscribe, getSnapshot, getServerSnapshot);
}

export function updateState(fn: (s: AppState) => AppState) {
  state = fn(getSnapshot());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* Speicher voll oder privat – App läuft trotzdem weiter */
  }
  listeners.forEach((l) => l());
}

export function replaceState(next: unknown) {
  updateState(() => migrate(next));
}

export function exportState(): string {
  return JSON.stringify(getSnapshot(), null, 2);
}

/* ---------- Aktionen ---------- */

export function markActivity() {
  const t = today();
  updateState((s) => (s.activityDays.includes(t) ? s : { ...s, activityDays: [...s.activityDays, t] }));
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function normalize(text: string) {
  return text.trim().toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, " ");
}

export function hasCard(s: AppState, front: string): boolean {
  const n = normalize(front);
  return s.cards.some((c) => normalize(c.front) === n);
}

export function addCards(items: { front: string; back: string; example?: string }[], source: CardSource): number {
  let added = 0;
  updateState((s) => {
    const t = today();
    const fresh: Card[] = [];
    const seen = new Set(s.cards.map((c) => normalize(c.front)));
    for (const item of items) {
      const n = normalize(item.front);
      if (!n || seen.has(n)) continue;
      seen.add(n);
      fresh.push({
        id: newId(),
        front: item.front.trim(),
        back: item.back.trim(),
        example: item.example?.trim() || undefined,
        source,
        createdAt: t,
        due: t,
        interval: 0,
        ease: 2.5,
        reps: 0,
        lapses: 0,
        history: [],
      });
    }
    added = fresh.length;
    return { ...s, cards: [...s.cards, ...fresh] };
  });
  return added;
}

export function saveCard(card: Card) {
  updateState((s) => ({ ...s, cards: s.cards.map((c) => (c.id === card.id ? card : c)) }));
}

export function deleteCard(id: string) {
  updateState((s) => ({ ...s, cards: s.cards.filter((c) => c.id !== id) }));
}

export function setProfile(patch: Partial<AppState["profile"]>) {
  updateState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
}

export function saveLessonResult(slug: string, correct: number, total: number) {
  updateState((s) => {
    const prev = s.lessons[slug];
    const best = prev && prev.correct > correct ? prev : { correct, total, day: today() };
    return { ...s, lessons: { ...s.lessons, [slug]: { ...best, day: today() } } };
  });
}
