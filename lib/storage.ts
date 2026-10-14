"use client";

import { useSyncExternalStore } from "react";
import { today } from "./dates";
import { defaultState, migrate, normalizeFront, type AppState, type Card, type CardSource } from "./state";

/**
 * Lernstand im Browser (localStorage). Ist ein Konto angemeldet, gleicht `lib/sync.ts`
 * jede Änderung automatisch mit der Konto-Datenbank ab – so ist der Stand auf allen Geräten gleich.
 * Ohne Konto funktioniert alles wie bisher rein lokal.
 */

export type { AppState, Card, CardSource, ExamResult, LessonResult, WritingEntry } from "./state";
export { defaultState } from "./state";

const KEY = "english-garden-v1";

let state: AppState | null = null;
const listeners = new Set<() => void>();
const changeListeners = new Set<(s: AppState) => void>();

function load(): AppState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch {
    /* defekte Daten → neu anfangen */
  }
  return defaultState();
}

function persist(s: AppState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* Speicher voll oder privat – App läuft trotzdem weiter */
  }
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

export function getState(): AppState {
  return getSnapshot();
}

/** Wird bei jeder Änderung durch die Nutzerin aufgerufen (für den Konto-Abgleich). */
export function onLocalChange(cb: (s: AppState) => void): () => void {
  changeListeners.add(cb);
  return () => changeListeners.delete(cb);
}

export function updateState(fn: (s: AppState) => AppState) {
  const prev = getSnapshot();
  const next = fn(prev);
  if (next === prev) return;
  state = { ...next, updatedAt: Date.now() };
  persist(state);
  listeners.forEach((l) => l());
  changeListeners.forEach((l) => l(state!));
}

/** Übernimmt einen Stand vom Server, ohne ihn gleich wieder zurückzuschicken. */
export function applyRemoteState(next: AppState) {
  state = migrate(next);
  persist(state);
  listeners.forEach((l) => l());
}

export function replaceState(next: unknown) {
  updateState(() => migrate(next));
}

/** „Neu anfangen“: Lernfortschritt löschen, Name und Einstellungen behalten. */
export function resetProgress() {
  updateState((s) => ({ ...defaultState(), profile: { ...s.profile, placementDone: false, level: 1 }, profileUpdatedAt: Date.now(), resetAt: Date.now() }));
}

/** Löscht den lokalen Stand (z. B. beim Abmelden). */
export function clearLocalState() {
  state = defaultState();
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignorieren */
  }
  listeners.forEach((l) => l());
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

export function hasCard(s: AppState, front: string): boolean {
  const n = normalizeFront(front);
  return s.cards.some((c) => normalizeFront(c.front) === n);
}

export function addCards(items: { front: string; back: string; example?: string }[], source: CardSource): number {
  let added = 0;
  updateState((s) => {
    const t = today();
    const fresh: Card[] = [];
    const seen = new Set(s.cards.map((c) => normalizeFront(c.front)));
    for (const item of items) {
      const n = normalizeFront(item.front);
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
    return fresh.length ? { ...s, cards: [...s.cards, ...fresh] } : s;
  });
  return added;
}

export function saveCard(card: Card) {
  updateState((s) => ({ ...s, cards: s.cards.map((c) => (c.id === card.id ? card : c)) }));
}

export function deleteCard(id: string) {
  updateState((s) => ({ ...s, cards: s.cards.filter((c) => c.id !== id), deletedCards: [...s.deletedCards, id] }));
}

export function setProfile(patch: Partial<AppState["profile"]>) {
  updateState((s) => ({ ...s, profile: { ...s.profile, ...patch }, profileUpdatedAt: Date.now() }));
}

export function saveLessonResult(slug: string, correct: number, total: number) {
  updateState((s) => {
    const prev = s.lessons[slug];
    const best = prev && prev.correct > correct ? prev : { correct, total, day: today() };
    return { ...s, lessons: { ...s.lessons, [slug]: { ...best, day: today() } } };
  });
}

export function saveExamResult(level: number, percent: number, passed: boolean) {
  updateState((s) => {
    const prev = s.exams[level];
    if (prev && prev.percent >= percent) return s;
    return { ...s, exams: { ...s.exams, [level]: { percent, passed: passed || Boolean(prev?.passed), day: today() } } };
  });
}

export function saveChapterTest(chapterId: string, percent: number, passed: boolean) {
  updateState((s) => {
    const prev = s.chapterTests[chapterId];
    if (prev && prev.percent >= percent) return s;
    return {
      ...s,
      chapterTests: { ...s.chapterTests, [chapterId]: { percent, passed: passed || Boolean(prev?.passed), day: today() } },
    };
  });
}

/** Legt den Wortschatz eines Kapitels in den Vokabelkasten. */
export function addChapterVocab(chapterId: string, items: { front: string; back: string; example?: string }[]) {
  addCards(items, "start");
  updateState((s) => (s.addedVocab.includes(chapterId) ? s : { ...s, addedVocab: [...s.addedVocab, chapterId] }));
}
